import "server-only";
import { after } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { formatDayTime } from "@/lib/format-date";
import { siteOrigin } from "@/lib/site-url";
import { EMAIL_TEST_COOKIE, emailTestModeFrom } from "@/lib/email/test-mode";
import { sendEmail } from "@/lib/email/send";
import { applicationReceivedEmail } from "@/emails/application-received";
import { STATUS_EMAIL_STATUSES, statusChangedEmail } from "@/emails/status-changed";
import { interviewEmail } from "@/emails/interview";

// Candidate emails (Feature 23). Each one is sent just after the response, so the action that
// caused it (apply, move, schedule) never waits for or fails because of an email.
// Emails hold only the job, company, status and interview details: never scores, AI results or notes.

// Runs `send` after the response with Next.js after(), which Vercel keeps alive (waitUntil) until it ends.
// The test mode is read now, while the request (and its cookie) is still here.
// Never throws, so callers don't need to guard it.
async function queueEmail(send) {
  try {
    const testMode = emailTestModeFrom((await cookies()).get(EMAIL_TEST_COOKIE)?.value);
    const origin = siteOrigin();
    after(async () => {
      try {
        await send({ testMode, origin });
      } catch {
        console.error("Could not prepare an email");
      }
    });
  } catch {
    console.error("Could not queue an email");
  }
}

// The application with its job, company and the candidate's account email and preference.
async function loadApplication(applicationId) {
  const admin = createAdminClient();
  const application = await runSupabase(() =>
    admin
      .from("applications")
      .select("id, candidate_id, candidate_name, status, jobs(title, companies(name))")
      .eq("id", applicationId)
      .maybeSingle()
  );
  if (!application) return null;
  const candidate = await runSupabase(() =>
    admin.from("profiles").select("email, email_status_updates").eq("id", application.candidate_id).maybeSingle()
  );
  return candidate ? { application, candidate } : null;
}

function names(application) {
  return {
    candidateName: application.candidate_name,
    jobTitle: application.jobs?.title,
    companyName: application.jobs?.companies?.name,
  };
}

// "Your application to ABC Tech was received". Always sent.
export async function notifyApplicationReceived(applicationId) {
  await queueEmail(async ({ testMode, origin }) => {
    const loaded = await loadApplication(applicationId);
    if (!loaded) return;
    await sendEmail({
      to: loaded.candidate.email,
      message: applicationReceivedEmail({ ...names(loaded.application), origin }),
      log: { userId: loaded.application.candidate_id, type: "application_received", applicationId },
      testMode,
    });
  });
}

// "Update on your application to ABC Tech". Only for HR moves, and only when the candidate keeps
// status updates on. A withdrawn application gets no more status emails.
export async function notifyStatusChanged(applicationId, status) {
  if (!STATUS_EMAIL_STATUSES.includes(status)) return;
  await queueEmail(async ({ testMode, origin }) => {
    const loaded = await loadApplication(applicationId);
    if (!loaded || !loaded.candidate.email_status_updates || loaded.application.status === "withdrawn") return;
    await sendEmail({
      to: loaded.candidate.email,
      message: statusChangedEmail({ ...names(loaded.application), status, applicationId, origin }),
      log: { userId: loaded.application.candidate_id, type: "status_changed", applicationId },
      testMode,
    });
  });
}

// Interview scheduled, rescheduled or cancelled. Always sent.
export async function notifyInterview(interviewId, kind) {
  await queueEmail(async ({ testMode, origin }) => {
    const interview = await runSupabase(() =>
      createAdminClient()
        .from("interviews")
        .select("id, application_id, scheduled_at, duration_minutes, meeting_link, location")
        .eq("id", interviewId)
        .maybeSingle()
    );
    if (!interview) return;
    const loaded = await loadApplication(interview.application_id);
    if (!loaded) return;
    await sendEmail({
      to: loaded.candidate.email,
      message: interviewEmail({
        ...names(loaded.application),
        kind,
        when: formatDayTime(interview.scheduled_at),
        durationMinutes: interview.duration_minutes,
        meetingLink: interview.meeting_link,
        location: interview.location,
        applicationId: interview.application_id,
        origin,
      }),
      log: { userId: loaded.application.candidate_id, type: `interview_${kind}`, applicationId: interview.application_id, interviewId },
      testMode,
    });
  });
}

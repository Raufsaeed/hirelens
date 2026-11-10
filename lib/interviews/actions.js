"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { GENERIC_ERROR } from "@/lib/auth/validation";
import { moveApplication } from "@/lib/applications/status-actions";
import { FINAL_ERROR, FINAL_STATUSES } from "@/lib/applications/validation";
import { formatDayTime } from "@/lib/format-date";
import { validateFeedback } from "@/lib/interviews/feedback";
import { toScheduledAt, validateInterview } from "@/lib/interviews/validation";
import { isUuid } from "@/lib/uuid";
import { notifyInterview } from "@/lib/email/notify";

// HR schedules, reschedules and cancels interviews (Feature 16) and records feedback (Feature 17). Everything runs with HR's session,
// so Row Level Security allows only interviews for their own company's applications.

const MINUTE_MS = 60 * 1000;
const LONGEST_MINUTES = 240; // the longest interview the database allows

async function loadHr() {
  const profile = await getCurrentProfile();
  return profile?.role === "hr" && profile.company_id ? profile : null;
}

function rowFrom(values) {
  const clean = (value) => String(value ?? "").trim() || null;
  return {
    scheduled_at: toScheduledAt(String(values.date).trim(), String(values.time).trim()),
    duration_minutes: Number(values.duration),
    meeting_link: clean(values.meetingLink),
    location: clean(values.location),
    interviewer_name: clean(values.interviewerName),
  };
}

// Another scheduled interview with the same interviewer that overlaps this one, or null.
async function findClash(supabase, row, skipId) {
  if (!row.interviewer_name) return null;
  const start = Date.parse(row.scheduled_at);
  const end = start + row.duration_minutes * MINUTE_MS;
  const nearby = await runSupabase(() =>
    supabase
      .from("interviews")
      .select("id, scheduled_at, duration_minutes, interviewer_name, applications(candidate_name)")
      .eq("status", "scheduled")
      .gt("scheduled_at", new Date(start - LONGEST_MINUTES * MINUTE_MS).toISOString())
      .lt("scheduled_at", new Date(end).toISOString())
  );
  const name = row.interviewer_name.toLowerCase();
  const clash = (nearby || []).find((other) => {
    if (other.id === skipId || other.interviewer_name?.trim().toLowerCase() !== name) return false;
    const otherStart = Date.parse(other.scheduled_at);
    return otherStart < end && start < otherStart + other.duration_minutes * MINUTE_MS;
  });
  if (!clash) return null;
  return { name: clash.applications?.candidate_name || "another candidate", when: formatDayTime(clash.scheduled_at) };
}

// Schedule (no interviewId) or reschedule (interviewId). A new interview also moves the candidate
// to Interview. Returns { interview } or { errors } / { clash } / { error }.
// ignoreClash: HR chose "Schedule anyway".
export async function saveInterview({ applicationId, interviewId = null, ignoreClash = false, ...values }) {
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(applicationId) || (interviewId && !isUuid(interviewId))) return { error: GENERIC_ERROR };

    const errors = validateInterview(values);
    if (errors) return { errors };

    const supabase = await createClient();
    const application = await runSupabase(() =>
      supabase.from("applications").select("id, status, candidate_name").eq("id", applicationId).maybeSingle()
    );
    if (!application) return { error: GENERIC_ERROR };
    if (application.status === "withdrawn") return { error: "This candidate has withdrawn" };
    // A new interview would move a Hired or Rejected candidate, and those decisions are final.
    if (!interviewId && FINAL_STATUSES.includes(application.status)) return { error: FINAL_ERROR };

    const row = rowFrom(values);
    if (!ignoreClash) {
      const clash = await findClash(supabase, row, interviewId);
      if (clash) return { clash };
    }

    if (interviewId) {
      const updated = await runSupabase(() =>
        supabase
          .from("interviews")
          .update(row)
          .eq("id", interviewId)
          .eq("application_id", applicationId)
          .eq("status", "scheduled")
          .select("id, scheduled_at")
      );
      if (!updated?.length) return { error: GENERIC_ERROR };
      await notifyInterview(interviewId, "rescheduled"); // email to the candidate (Feature 23)
      return { interview: updated[0] };
    }

    const interview = await runSupabase(() =>
      supabase
        .from("interviews")
        .insert({ application_id: applicationId, ...row })
        .select("id, scheduled_at")
        .single()
    );

    // Saving the interview moves the candidate to Interview. If the move fails, the interview goes too.
    if (application.status !== "interview") {
      const moved = await moveApplication(applicationId, "interview");
      if (moved.error) {
        await runSupabase(() => createAdminClient().from("interviews").delete().eq("id", interview.id));
        return { error: moved.error };
      }
    }
    await notifyInterview(interview.id, "scheduled"); // email to the candidate (Feature 23)
    return { interview };
  } catch {
    // Keep what HR typed; never show a raw error.
    return { error: GENERIC_ERROR };
  }
}

// HR cancels a scheduled interview (after confirming). The candidate then sees "Interview cancelled".
export async function cancelInterview(interviewId) {
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(interviewId)) return { error: GENERIC_ERROR };
    const supabase = await createClient();
    const cancelled = await runSupabase(() =>
      supabase
        .from("interviews")
        .update({ status: "cancelled" })
        .eq("id", interviewId)
        .eq("status", "scheduled")
        .select("id")
    );
    if (!cancelled?.length) return { error: GENERIC_ERROR };
    await notifyInterview(interviewId, "cancelled"); // email to the candidate (Feature 23)
    return { cancelled: true };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

// HR records feedback after the interview (Feature 17): one record per interview, and the interview
// is marked done. The recommendation is advice only; it never moves the candidate.
export async function saveFeedback({ interviewId, rating, strengths, concerns, recommendation }) {
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(interviewId)) return { error: GENERIC_ERROR };
    const invalid = validateFeedback({ rating, strengths, concerns, recommendation });
    if (invalid) return { error: invalid };

    const supabase = await createClient();
    const interview = await runSupabase(() =>
      supabase.from("interviews").select("id, status, scheduled_at").eq("id", interviewId).maybeSingle()
    );
    if (!interview) return { error: GENERIC_ERROR };
    if (interview.status !== "scheduled") return { error: "Feedback can only be added to a scheduled interview" };
    if (Date.parse(interview.scheduled_at) > Date.now()) return { error: "Add feedback after the interview has started" };

    const clean = (value) => String(value ?? "").trim() || null;
    const feedback = await runSupabase(() =>
      supabase
        .from("interview_feedback")
        .insert({
          interview_id: interviewId,
          rating: Number(rating),
          strengths: clean(strengths),
          concerns: clean(concerns),
          recommendation,
          created_by: profile.id,
        })
        .select("id")
        .single()
    );

    // Mark the interview done. If that fails, remove the feedback so HR can save again.
    try {
      await runSupabase(() => supabase.from("interviews").update({ status: "done" }).eq("id", interviewId));
    } catch {
      await runSupabase(() => createAdminClient().from("interview_feedback").delete().eq("id", feedback.id));
      return { error: GENERIC_ERROR };
    }
    return { saved: true };
  } catch {
    // A second save of the same interview hits the unique rule and lands here too.
    return { error: GENERIC_ERROR };
  }
}

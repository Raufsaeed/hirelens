"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { daysUntil, isValidDateString, pakistanToday } from "@/lib/jobs/dates";
import { NEW_DATE_ERROR, PAST_DATE_ERROR, needsNewApplyBy } from "@/lib/jobs/validation";

// Close and Reopen on My Jobs (Feature 04). Updates run with HR's session, so Row Level
// Security only allows jobs of their own company.

const SAVE_ERROR = "Couldn't save, try again";

// The job if it belongs to the logged-in HR user's company, else null.
async function loadOwnJob(supabase, jobId) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "hr") return null;
  return runSupabase(() =>
    supabase
      .from("jobs")
      .select("id, status, apply_by, closed_reason")
      .eq("id", jobId)
      .eq("company_id", profile.company_id)
      .maybeSingle()
  );
}

export async function closeJob(jobId) {
  try {
    const supabase = await createClient();
    const job = await loadOwnJob(supabase, jobId);
    if (!job || job.status !== "open") return { error: SAVE_ERROR };
    await runSupabase(() =>
      supabase
        .from("jobs")
        .update({ status: "closed", closed_reason: "manual", closed_at: new Date().toISOString() })
        .eq("id", jobId)
    );
    return { message: "Job closed" };
  } catch {
    return { error: SAVE_ERROR };
  }
}

// newApplyBy is optional; it is required when the old deadline closed the job or has passed.
export async function reopenJob(jobId, newApplyBy) {
  const today = pakistanToday();
  if (newApplyBy && (!isValidDateString(newApplyBy) || daysUntil(newApplyBy, today) < 0)) {
    return { error: PAST_DATE_ERROR };
  }

  try {
    const supabase = await createClient();
    const job = await loadOwnJob(supabase, jobId);
    if (!job || job.status !== "closed") return { error: SAVE_ERROR };

    const extending = needsNewApplyBy(job, today);
    if (extending && !newApplyBy) return { error: NEW_DATE_ERROR };

    const changes = { status: "open", closed_reason: null, closed_at: null };
    if (newApplyBy) changes.apply_by = newApplyBy;
    await runSupabase(() => supabase.from("jobs").update(changes).eq("id", jobId));
    return { message: extending ? "Deadline extended. The job is open again" : "Job reopened" };
  } catch {
    return { error: SAVE_ERROR };
  }
}

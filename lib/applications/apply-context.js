import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { daysUntil, formatShortDate, pakistanToday } from "@/lib/jobs/dates";
import { closeExpiredJobs } from "@/lib/jobs/deadline";
import { ALREADY_APPLIED_ERROR, JOB_CLOSED_ERROR, deadlinePassedError } from "@/lib/applications/validation";

// Can this candidate apply to this job right now? Used by the apply page and again on submit.
// Returns { job, blocked } where blocked is a message (or null), and `applied` when they applied before.

const JOB_COLUMNS = "id, title, slug, location, status, apply_by, closed_reason, companies(name)";

export function whyJobIsClosed(job, today) {
  if (job.apply_by && daysUntil(job.apply_by, today) < 0) {
    return deadlinePassedError(formatShortDate(job.apply_by, today));
  }
  if (job.status !== "open") return JOB_CLOSED_ERROR;
  return null;
}

export async function getApplyContext({ slug, jobId, candidateId }) {
  await closeExpiredJobs();
  const supabase = await createClient();
  let query = supabase.from("jobs").select(JOB_COLUMNS);
  query = jobId ? query.eq("id", jobId) : query.eq("slug", String(slug).slice(0, 200));
  const job = await runSupabase(() => query.maybeSingle());
  if (!job) return { job: null };

  const existing = await runSupabase(() =>
    supabase
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("candidate_id", candidateId)
      .maybeSingle()
  );
  if (existing) return { job, applied: existing.id, blocked: ALREADY_APPLIED_ERROR };

  return { job, blocked: whyJobIsClosed(job, pakistanToday()) };
}

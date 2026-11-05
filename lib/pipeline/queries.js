import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { isUuid } from "@/lib/uuid";

// The pipeline board for one job (Feature 15). Names come from applications, never profiles.
// Row Level Security limits it to the HR user's company; the company filter is added too.

export const PIPELINE_COLUMNS = ["applied", "shortlisted", "interview", "offer", "hired", "rejected"];
const DAY_MS = 24 * 60 * 60 * 1000;

// A withdrawn card stays (greyed out) in the column it was in before the candidate withdrew.
function columnFor(application) {
  if (application.status !== "withdrawn") return application.status;
  const withdrawal = [...(application.status_history || [])]
    .sort((a, b) => Date.parse(b.changed_at) - Date.parse(a.changed_at))
    .find((row) => row.to_status === "withdrawn");
  return PIPELINE_COLUMNS.includes(withdrawal?.from_status) ? withdrawal.from_status : "applied";
}

export async function getPipeline(companyId, jobId) {
  if (!isUuid(jobId)) return null;
  const supabase = await createClient();
  const job = await runSupabase(() =>
    supabase.from("jobs").select("id").eq("id", jobId).eq("company_id", companyId).maybeSingle()
  );
  if (!job) return null;

  const rows = await runSupabase(() =>
    supabase
      .from("applications")
      .select("id, candidate_name, status, screening_status, applied_at, screenings(score), status_history(from_status, to_status, changed_at), interviews(scheduled_at, status)")
      .eq("job_id", jobId)
      .order("applied_at", { ascending: true })
  );
  const now = Date.now();
  return (rows || []).map((row) => {
    const screening = Array.isArray(row.screenings) ? row.screenings[0] : row.screenings;
    // The soonest scheduled interview still to come (Feature 16).
    const nextInterview = (row.interviews || [])
      .filter((item) => item.status === "scheduled" && Date.parse(item.scheduled_at) >= now)
      .map((item) => item.scheduled_at)
      .sort()[0] || null;
    return {
      id: row.id,
      name: row.candidate_name,
      status: row.status,
      column: columnFor(row),
      score: row.screening_status === "done" ? screening?.score ?? null : null,
      nextInterview,
      daysSinceApplying: Math.max(0, Math.floor((now - Date.parse(row.applied_at)) / DAY_MS)),
    };
  });
}

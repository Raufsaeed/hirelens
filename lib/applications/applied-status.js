import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";

// Which of these jobs the logged-in candidate already applied to (Features 07 and 08), for the
// applied strip on the jobs list and the banner on the job page. Runs with the candidate's own session:
// Row Level Security returns only their rows, and the candidate filter is added too. Never a score.
// Returns a Map of job id -> { id, status, appliedAt, withdrawnAt }.
export async function listMyApplicationsForJobs(candidateId, jobIds) {
  if (!jobIds.length) return new Map();
  const supabase = await createClient();
  const rows = await runSupabase(() =>
    supabase
      .from("applications")
      .select("id, job_id, status, applied_at, status_history(to_status, changed_at)")
      .eq("candidate_id", candidateId)
      .in("job_id", jobIds)
  );
  return new Map(
    (rows || []).map((row) => [
      row.job_id,
      {
        id: row.id,
        status: row.status,
        appliedAt: row.applied_at,
        withdrawnAt: (row.status_history || []).find((change) => change.to_status === "withdrawn")?.changed_at ?? null,
      },
    ])
  );
}

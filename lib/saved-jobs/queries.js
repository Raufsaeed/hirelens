import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";
import { closeExpiredJobs } from "@/lib/jobs/deadline";

// Saved jobs (Feature 21). Row Level Security returns only the logged-in candidate's own rows;
// the candidate filter is added too.

// The ids of the jobs this candidate saved (for the Save / Saved buttons).
export async function listSavedJobIds(candidateId) {
  const supabase = await createClient();
  const rows = await runSupabase(() => supabase.from("saved_jobs").select("job_id").eq("candidate_id", candidateId));
  return new Set((rows || []).map((row) => row.job_id));
}

// The Saved Jobs page: newest first, each with its state (apply, applied or closed).
export async function listSavedJobs(candidateId) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const rows = await runSupabase(() =>
    supabase
      .from("saved_jobs")
      .select("id, saved_at, jobs(id, title, slug, location, job_type, status, apply_by, companies(name, slug, logo_url))")
      .eq("candidate_id", candidateId)
      .order("saved_at", { ascending: false })
  );
  const jobIds = (rows || []).map((row) => row.jobs?.id).filter(Boolean);
  const applied = jobIds.length
    ? await runSupabase(() =>
        supabase.from("applications").select("job_id").eq("candidate_id", candidateId).in("job_id", jobIds)
      )
    : [];
  const appliedIds = new Set((applied || []).map((row) => row.job_id));
  const today = pakistanToday();

  return (rows || [])
    .filter((row) => row.jobs)
    .map(({ jobs: job, ...row }) => {
      const deadline = deadlineInfo(job.apply_by, today);
      const closed = job.status !== "open" || deadline?.kind === "closed";
      return { ...row, job: { ...job, deadline }, state: appliedIds.has(job.id) ? "applied" : closed ? "closed" : "apply" };
    });
}

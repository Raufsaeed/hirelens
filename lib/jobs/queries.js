import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";
import { closeExpiredJobs } from "@/lib/jobs/deadline";
import { needsNewApplyBy } from "@/lib/jobs/validation";
import { isUuid } from "@/lib/uuid";

// Reads jobs for the logged-in HR user. Row Level Security already limits them to their company;
// the company filter is added too so the intent is clear.
// Every read first closes jobs whose Apply by day has ended (Feature 04).

// applications(viewed_at): one small row per applicant, for the applicant and "new" counts.
const JOB_COLUMNS =
  "id, title, slug, location, job_type, status, apply_by, closed_reason, created_at, applications(viewed_at)";

// Adds what the job cards and tables show: the deadline label, whether reopening needs a new date,
// and applicant counts. "New" applicants are ones HR hasn't opened yet (viewed_at empty, Feature 14).
function withDisplayInfo({ applications, ...job }, today) {
  const rows = applications || [];
  return {
    ...job,
    deadline: deadlineInfo(job.apply_by, today),
    needsNewDate: job.status === "closed" && needsNewApplyBy(job, today),
    applicants: rows.length,
    newApplicants: rows.filter((row) => !row.viewed_at).length,
  };
}

export async function listCompanyJobs(companyId) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const jobs = await runSupabase(() =>
    supabase.from("jobs").select(JOB_COLUMNS).eq("company_id", companyId).order("created_at", { ascending: false })
  );
  const today = pakistanToday();
  return (jobs || []).map((job) => withDisplayInfo(job, today));
}

export async function getCompanyJob(companyId, jobId) {
  if (!isUuid(jobId)) return null;
  await closeExpiredJobs();
  const supabase = await createClient();
  const job = await runSupabase(() =>
    supabase.from("jobs").select(JOB_COLUMNS).eq("company_id", companyId).eq("id", jobId).maybeSingle()
  );
  return job ? withDisplayInfo(job, pakistanToday()) : null;
}

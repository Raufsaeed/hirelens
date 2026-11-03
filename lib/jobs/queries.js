import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";

// Reads jobs for the logged-in HR user. Row Level Security already limits them to their company;
// the company filter is added too so the intent is clear.

const JOB_COLUMNS = "id, title, slug, location, job_type, status, apply_by, closed_reason, created_at";

// Adds what the job cards and tables show: the deadline label and applicant counts.
// Applicant counts stay 0 until applications exist (Feature 08).
function withDisplayInfo(job, today) {
  return { ...job, deadline: deadlineInfo(job.apply_by, today), applicants: 0, newApplicants: 0 };
}

export async function listCompanyJobs(companyId) {
  const supabase = await createClient();
  const jobs = await runSupabase(() =>
    supabase.from("jobs").select(JOB_COLUMNS).eq("company_id", companyId).order("created_at", { ascending: false })
  );
  const today = pakistanToday();
  return (jobs || []).map((job) => withDisplayInfo(job, today));
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getCompanyJob(companyId, jobId) {
  if (!UUID_PATTERN.test(jobId)) return null;
  const supabase = await createClient();
  const job = await runSupabase(() =>
    supabase.from("jobs").select(JOB_COLUMNS).eq("company_id", companyId).eq("id", jobId).maybeSingle()
  );
  return job ? withDisplayInfo(job, pakistanToday()) : null;
}

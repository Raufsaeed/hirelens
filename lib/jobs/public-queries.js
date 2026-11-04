import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";
import { closeExpiredJobs } from "@/lib/jobs/deadline";
import { JOB_TYPES } from "@/lib/jobs/constants";

// Public job pages (Feature 07). Row Level Security only returns Open and Closed jobs to
// visitors; drafts never come back. Every read first closes past-deadline jobs (Feature 04).

const PUBLIC_COLUMNS =
  "id, title, slug, location, job_type, required_years, required_degree, requirements, description, " +
  "status, apply_by, closed_reason, companies(name, slug, logo_url)";

// Removes characters that have a meaning in Supabase filters, so search text is only text.
function cleanSearch(text) {
  return String(text || "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
}

function withDeadline(job, today) {
  return { ...job, deadline: deadlineInfo(job.apply_by, today) };
}

// Open jobs, newest first. q matches the job title or the company name.
export async function listOpenJobs({ q, type, location } = {}) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const search = cleanSearch(q);
  const place = cleanSearch(location);

  let query = supabase.from("jobs").select(PUBLIC_COLUMNS).eq("status", "open");
  if (JOB_TYPES.some((jobType) => jobType.value === type)) query = query.eq("job_type", type);
  if (place) query = query.ilike("location", `%${place}%`);

  if (search) {
    const companies = await runSupabase(() =>
      supabase.from("companies").select("id").ilike("name", `%${search}%`).limit(100)
    );
    const companyIds = (companies || []).map((company) => company.id);
    const byCompany = companyIds.length ? `,company_id.in.(${companyIds.join(",")})` : "";
    query = query.or(`title.ilike.%${search}%${byCompany}`);
  }

  const jobs = await runSupabase(() => query.order("created_at", { ascending: false }).limit(100));
  const today = pakistanToday();
  return (jobs || []).map((job) => withDeadline(job, today));
}

// One Open or Closed job by its public link, or null (drafts and unknown links).
export async function getPublicJob(slug) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const job = await runSupabase(() =>
    supabase
      .from("jobs")
      .select(PUBLIC_COLUMNS)
      .eq("slug", String(slug).slice(0, 200))
      .in("status", ["open", "closed"])
      .maybeSingle()
  );
  return job ? withDeadline(job, pakistanToday()) : null;
}

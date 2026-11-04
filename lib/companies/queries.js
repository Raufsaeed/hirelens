import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";
import { closeExpiredJobs } from "@/lib/jobs/deadline";

// Companies are public info (name, slug, logo, about, website, location). Never HR names or candidates.
const COMPANY_COLUMNS = "id, name, slug, logo_url, about, website, location";

export async function getCompany(companyId) {
  const supabase = await createClient();
  return runSupabase(() => supabase.from("companies").select(COMPANY_COLUMNS).eq("id", companyId).maybeSingle());
}

// The public company page (Feature 06): the company and its Open jobs only.
export async function getPublicCompany(slug) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const company = await runSupabase(() =>
    supabase.from("companies").select(COMPANY_COLUMNS).eq("slug", String(slug).slice(0, 200)).maybeSingle()
  );
  if (!company) return null;
  const jobs = await runSupabase(() =>
    supabase
      .from("jobs")
      .select("id, title, slug, location, job_type, required_years, required_degree, requirements, apply_by")
      .eq("company_id", company.id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
  );
  const today = pakistanToday();
  const companyInfo = { name: company.name, logo_url: company.logo_url };
  return {
    company,
    jobs: (jobs || []).map((job) => ({ ...job, companies: companyInfo, deadline: deadlineInfo(job.apply_by, today) })),
  };
}

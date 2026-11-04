import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { closeExpiredJobs } from "@/lib/jobs/deadline";
import { isUuid } from "@/lib/uuid";

// HR reads of candidates (Features 11, 12, 13). Names and emails come only from applications,
// never from profiles. Row Level Security limits every read to the HR user's own company.

const ROW_COLUMNS =
  "id, job_id, candidate_name, candidate_email, status, screening_status, applied_at, viewed_at, " +
  "screenings(score, match_percent, relevant_years, degree_found, degree_match, requirements_result)";

const DONE = "done";

// Ranking: highest score first, then match percentage, then the earliest application.
// Pending, failed and not-yet-screened applications always sit at the bottom (in applied order).
export function rankCandidates(rows) {
  const screened = rows.filter((row) => row.screening_status === DONE && row.screening?.score !== null);
  const others = rows.filter((row) => !screened.includes(row));
  screened.sort(
    (a, b) =>
      b.screening.score - a.screening.score ||
      Number(b.screening.match_percent) - Number(a.screening.match_percent) ||
      Date.parse(a.applied_at) - Date.parse(b.applied_at)
  );
  others.sort((a, b) => Date.parse(a.applied_at) - Date.parse(b.applied_at));
  return [...screened, ...others];
}

// One screening per application; Supabase may return it as an object or a one-item list.
function withScreening(row) {
  const screening = Array.isArray(row.screenings) ? row.screenings[0] : row.screenings;
  const { screenings, ...rest } = row;
  return { ...rest, screening: screening || null };
}

// The company's jobs for the job picker, newest first.
export async function listCandidateJobs(companyId) {
  await closeExpiredJobs();
  const supabase = await createClient();
  const jobs = await runSupabase(() =>
    supabase
      .from("jobs")
      .select("id, title, slug, status, requirements, applications(count)")
      .eq("company_id", companyId)
      .neq("status", "draft")
      .order("created_at", { ascending: false })
  );
  return (jobs || []).map((job) => ({ ...job, applicantCount: job.applications?.[0]?.count ?? 0 }));
}

// Every application to one job, ranked.
export async function listJobCandidates(companyId, jobId) {
  if (!isUuid(jobId)) return null;
  const supabase = await createClient();
  const job = await runSupabase(() =>
    supabase.from("jobs").select("id").eq("id", jobId).eq("company_id", companyId).maybeSingle()
  );
  if (!job) return null;
  const rows = await runSupabase(() =>
    supabase.from("applications").select(ROW_COLUMNS).eq("job_id", jobId)
  );
  return rankCandidates((rows || []).map(withScreening));
}

const DETAIL_COLUMNS =
  "id, job_id, candidate_name, candidate_email, phone, cover_note, status, screening_status, applied_at, cv_file_path, " +
  "jobs!inner(id, title, slug, company_id, required_years, required_degree, requirements), " +
  "screenings(*), notes(id, author_name, body, is_manual_review, created_at)";

// One candidate's application with the full screening, or null when it isn't this company's.
export async function getCandidate(companyId, applicationId) {
  if (!isUuid(applicationId)) return null;
  const supabase = await createClient();
  const row = await runSupabase(() =>
    supabase
      .from("applications")
      .select(DETAIL_COLUMNS)
      .eq("id", applicationId)
      .eq("jobs.company_id", companyId)
      .maybeSingle()
  );
  if (!row) return null;
  const candidate = withScreening(row);
  candidate.notes = [...(candidate.notes || [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return candidate;
}

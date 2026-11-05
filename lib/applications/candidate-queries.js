import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { isUuid } from "@/lib/uuid";

// The logged-in candidate's own applications (Features 09 and 10). Row Level Security returns only
// their rows; the candidate filter is added too. The applications table holds no score.

// Interviews: only the columns the candidate may see (time, duration, link, place, status).
const INTERVIEW_COLUMNS = "interviews(scheduled_at, duration_minutes, meeting_link, location, status, created_at)";
const LIST_COLUMNS = `id, status, applied_at, jobs(title, slug, companies(name, logo_url)), ${INTERVIEW_COLUMNS}`;
const DETAIL_COLUMNS =
  "id, status, applied_at, cv_file_path, jobs(title, slug, location, companies(name, logo_url)), " +
  `status_history(from_status, to_status, changed_at), ${INTERVIEW_COLUMNS}`;

// The interview to show: the one HR scheduled or changed last (a new round replaces a cancelled one).
function latestInterview(application) {
  const interviews = [...(application.interviews || [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return interviews.find((item) => item.status === "scheduled") || interviews[0] || null;
}

export async function listMyApplications(candidateId) {
  const supabase = await createClient();
  const applications = await runSupabase(() =>
    supabase
      .from("applications")
      .select(LIST_COLUMNS)
      .eq("candidate_id", candidateId)
      .order("applied_at", { ascending: false })
  );
  return (applications || []).map((application) => ({ ...application, interview: latestInterview(application) }));
}

// One application with its timeline, or null when it isn't this candidate's (or doesn't exist).
export async function getMyApplication(candidateId, applicationId) {
  if (!isUuid(applicationId)) return null;
  const supabase = await createClient();
  const application = await runSupabase(() =>
    supabase
      .from("applications")
      .select(DETAIL_COLUMNS)
      .eq("id", applicationId)
      .eq("candidate_id", candidateId)
      .maybeSingle()
  );
  if (!application) return null;
  application.status_history = [...(application.status_history || [])].sort(
    (a, b) => Date.parse(a.changed_at) - Date.parse(b.changed_at)
  );
  application.interview = latestInterview(application);
  return application;
}

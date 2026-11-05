import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";

// The Interviews page (Feature 16). Row Level Security limits it to the HR user's company;
// the company filter is added too. Names come from applications, never profiles.

const COLUMNS =
  "id, application_id, scheduled_at, duration_minutes, meeting_link, location, interviewer_name, status, " +
  "applications!inner(candidate_name, jobs!inner(title, company_id))";

// Returns { upcoming: soonest first, past: latest first }.
export async function listInterviews(companyId) {
  const supabase = await createClient();
  const rows = await runSupabase(() =>
    supabase
      .from("interviews")
      .select(COLUMNS)
      .eq("applications.jobs.company_id", companyId)
      .order("scheduled_at", { ascending: true })
  );
  const now = Date.now();
  const interviews = (rows || []).map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    meetingLink: row.meeting_link,
    location: row.location,
    interviewerName: row.interviewer_name,
    status: row.status,
    candidateName: row.applications.candidate_name,
    jobTitle: row.applications.jobs.title,
  }));
  return {
    upcoming: interviews.filter((item) => Date.parse(item.scheduledAt) >= now),
    past: interviews.filter((item) => Date.parse(item.scheduledAt) < now).reverse(),
  };
}

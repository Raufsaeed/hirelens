"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";

// Delete on My Jobs. HR can delete their company's job if it is a draft or has no applications at all
// (withdrawn ones count). Jobs with applications are never deleted, only closed.
// The delete runs with HR's session, so Row Level Security checks the same rules in the database.
// Saved copies of the job (saved_jobs) are removed with it by the database.

const DELETE_ERROR = "Couldn't delete, try again";
const HAS_APPLICANTS_ERROR = "Jobs with applicants can't be deleted. Close the job instead.";
const FOREIGN_KEY_VIOLATION = "23503"; // an application arrived just before the delete

export async function deleteJob(jobId) {
  if (!isUuid(jobId)) return { error: DELETE_ERROR };

  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr" || !profile.company_id) return { error: DELETE_ERROR };

    // Re-check the company, the status and the applications count right before deleting.
    const supabase = await createClient();
    const job = await runSupabase(() =>
      supabase
        .from("jobs")
        .select("id, status, applications(count)")
        .eq("id", jobId)
        .eq("company_id", profile.company_id)
        .maybeSingle()
    );
    if (!job) return { error: DELETE_ERROR };
    const applicants = job.applications?.[0]?.count ?? 0;
    if (job.status !== "draft" && applicants > 0) return { error: HAS_APPLICANTS_ERROR };

    let deleted;
    try {
      deleted = await runSupabase(() =>
        supabase.from("jobs").delete().eq("id", jobId).eq("company_id", profile.company_id).select("id")
      );
    } catch (error) {
      if (error?.code === FOREIGN_KEY_VIOLATION) return { error: HAS_APPLICANTS_ERROR };
      throw error;
    }
    // Nothing deleted: Row Level Security found an application in the meantime.
    if (!deleted?.length) return { error: HAS_APPLICANTS_ERROR };
    return { message: job.status === "draft" ? "Draft deleted" : "Job deleted" };
  } catch {
    return { error: DELETE_ERROR };
  }
}

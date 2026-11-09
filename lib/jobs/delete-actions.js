"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";

// Delete draft on My Jobs. Only drafts can be deleted; open and closed jobs never.
// The delete runs with HR's session, so Row Level Security also checks the company and the draft status.

const DELETE_ERROR = "Couldn't delete, try again";
const NOT_DRAFT_ERROR = "Only draft jobs can be deleted";

export async function deleteDraftJob(jobId) {
  if (!isUuid(jobId)) return { error: DELETE_ERROR };

  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr" || !profile.company_id) return { error: DELETE_ERROR };

    const supabase = await createClient();
    const job = await runSupabase(() =>
      supabase.from("jobs").select("id, status").eq("id", jobId).eq("company_id", profile.company_id).maybeSingle()
    );
    if (!job) return { error: DELETE_ERROR };
    if (job.status !== "draft") return { error: NOT_DRAFT_ERROR };

    // The status check repeats here, so a draft published a moment ago is never deleted.
    const deleted = await runSupabase(() =>
      supabase
        .from("jobs")
        .delete()
        .eq("id", jobId)
        .eq("company_id", profile.company_id)
        .eq("status", "draft")
        .select("id")
    );
    if (!deleted?.length) return { error: NOT_DRAFT_ERROR };
    return { message: "Draft deleted" };
  } catch {
    return { error: DELETE_ERROR };
  }
}

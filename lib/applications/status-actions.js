"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";

// HR moves an application to another pipeline status (Features 14 and 15). AI never does this.
// The move runs with HR's session (Row Level Security: own company, never on a withdrawn application);
// the server writes the history row with HR as changed_by.

const HR_STATUSES = ["applied", "shortlisted", "interview", "offer", "hired", "rejected"];
const MOVE_ERROR = "Couldn't move this candidate, try again";
const WITHDRAWN_ERROR = "This candidate has withdrawn";

export async function moveApplication(applicationId, toStatus) {
  if (!isUuid(applicationId) || !HR_STATUSES.includes(toStatus)) return { error: MOVE_ERROR };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return { error: MOVE_ERROR };

    const supabase = await createClient();
    const application = await runSupabase(() =>
      supabase.from("applications").select("id, status, candidate_name").eq("id", applicationId).maybeSingle()
    );
    if (!application) return { error: MOVE_ERROR };
    if (application.status === "withdrawn") return { error: WITHDRAWN_ERROR };
    if (application.status === toStatus) return { status: toStatus };

    const moved = await runSupabase(() =>
      supabase
        .from("applications")
        .update({ status: toStatus })
        .eq("id", applicationId)
        .eq("status", application.status)
        .select("id")
    );
    if (!moved?.length) return { error: MOVE_ERROR };

    // Every change goes in the history. If that fails, put the old status back.
    const admin = createAdminClient();
    try {
      await runSupabase(() =>
        admin.from("status_history").insert({
          application_id: applicationId,
          from_status: application.status,
          to_status: toStatus,
          changed_by: profile.id,
        })
      );
    } catch {
      try {
        await runSupabase(() => admin.from("applications").update({ status: application.status }).eq("id", applicationId));
      } catch {
        console.error("Could not undo a status move without a history row:", applicationId);
      }
      return { error: MOVE_ERROR };
    }

    return { status: toStatus, from: application.status, name: application.candidate_name };
  } catch {
    return { error: MOVE_ERROR };
  }
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { GENERIC_ERROR } from "@/lib/auth/validation";
import { isUuid } from "@/lib/uuid";
import { WITHDRAW_ERROR, WITHDRAW_STAGES } from "@/lib/applications/validation";

// Withdraw and "Delete my data" on Application Detail (Feature 10).

// The logged-in candidate's own application (Row Level Security only returns their rows), or null.
async function loadOwnApplication(applicationId) {
  if (!isUuid(applicationId)) return null;
  const profile = await getCurrentProfile();
  if (profile?.role !== "candidate") return null;
  const supabase = await createClient();
  const application = await runSupabase(() =>
    supabase
      .from("applications")
      .select("id, status, cv_file_path, candidate_id")
      .eq("id", applicationId)
      .eq("candidate_id", profile.id)
      .maybeSingle()
  );
  return application ? { application, supabase } : null;
}

// Applied or Shortlisted -> Withdrawn, with a history row where the candidate is changed_by.
export async function withdrawApplication(applicationId) {
  try {
    const own = await loadOwnApplication(applicationId);
    if (!own) return { error: GENERIC_ERROR };
    const { application } = own;
    if (!WITHDRAW_STAGES.includes(application.status)) return { error: WITHDRAW_ERROR };

    // Status changes are server only. The filters make sure it is still theirs and still withdrawable.
    const admin = createAdminClient();
    const updated = await runSupabase(() =>
      admin
        .from("applications")
        .update({ status: "withdrawn" })
        .eq("id", application.id)
        .eq("candidate_id", application.candidate_id)
        .in("status", WITHDRAW_STAGES)
        .select("id")
    );
    if (!updated?.length) return { error: WITHDRAW_ERROR };

    // Every status change needs its history row; if it can't be saved, undo the change.
    try {
      await runSupabase(() =>
        admin.from("status_history").insert({
          application_id: application.id,
          from_status: application.status,
          to_status: "withdrawn",
          changed_by: application.candidate_id,
        })
      );
    } catch {
      await admin.from("applications").update({ status: application.status }).eq("id", application.id);
      return { error: GENERIC_ERROR };
    }
    return { message: "Application withdrawn" };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

// Removes the application, everything linked to it (by cascade) and the CV file.
export async function deleteApplicationData(applicationId) {
  try {
    const own = await loadOwnApplication(applicationId);
    if (!own) return { error: GENERIC_ERROR };
    const { application, supabase } = own;

    // Row Level Security only lets the owner delete; .select() shows whether a row really went.
    const deleted = await runSupabase(() =>
      supabase.from("applications").delete().eq("id", application.id).select("id")
    );
    if (!deleted?.length) return { error: GENERIC_ERROR };
    // The CV file: if this fails the row is already gone, so log it for a manual clean-up.
    try {
      await runSupabase(() => createAdminClient().storage.from("cvs").remove([application.cv_file_path]));
    } catch {
      console.error("Could not delete a CV file after Delete my data:", application.id);
    }
  } catch {
    return { error: GENERIC_ERROR };
  }
  redirect("/my-applications?deleted=1");
}

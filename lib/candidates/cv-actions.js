"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";
import { CV_PREVIEW_SECONDS } from "@/lib/candidates/queries";

// "Reload" on an expired CV preview (Feature 14): a new short-lived signed link to the private CV.
// Only HR of the job's company (Row Level Security decides whether the application can be read).

export async function getCvPreviewUrl(applicationId) {
  if (!isUuid(applicationId)) return { error: "Couldn't load the CV, try again" };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return { error: "Couldn't load the CV, try again" };
    const supabase = await createClient();
    const application = await runSupabase(() =>
      supabase.from("applications").select("cv_file_path").eq("id", applicationId).maybeSingle()
    );
    if (!application) return { error: "Couldn't load the CV, try again" };
    const signed = await runSupabase(() =>
      createAdminClient().storage.from("cvs").createSignedUrl(application.cv_file_path, CV_PREVIEW_SECONDS)
    );
    return { url: signed.signedUrl, validSeconds: CV_PREVIEW_SECONDS };
  } catch {
    return { error: "Couldn't load the CV, try again" };
  }
}

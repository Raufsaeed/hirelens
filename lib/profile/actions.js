"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { removeDefaultCv } from "@/lib/profile/default-cv";
import { SAVE_ERROR, validateProfile } from "@/lib/profile/validation";

// My Profile (Feature 20). Each action works only on the logged-in candidate's own row.

export async function saveProfile(_previousState, formData) {
  const values = {
    fullName: String(formData.get("fullName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    headline: String(formData.get("headline") || "").trim(),
  };
  const errors = validateProfile(values);
  if (errors) return { errors };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return { formError: SAVE_ERROR };
    // The candidate's own session: Row Level Security and column grants allow only these fields.
    const supabase = await createClient();
    await runSupabase(() =>
      supabase
        .from("profiles")
        .update({
          full_name: values.fullName,
          phone: values.phone || null,
          city: values.city || null,
          headline: values.headline || null,
        })
        .eq("id", profile.id)
    );
    return { message: "Profile saved" };
  } catch {
    return { formError: SAVE_ERROR };
  }
}

export async function deleteDefaultCv() {
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return { error: "Couldn't delete, try again" };
    await removeDefaultCv(profile.id);
    return { message: "Default CV deleted" };
  } catch {
    return { error: "Couldn't delete, try again" };
  }
}

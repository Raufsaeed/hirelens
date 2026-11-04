"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { validateCompany } from "@/lib/companies/validation";

// Company Settings (Feature 06): saved with HR's session, so Row Level Security allows only their own
// company and only these columns. The slug never changes.

const SAVE_ERROR = "Couldn't save, try again";

export async function updateCompany(_previousState, formData) {
  const values = {
    name: String(formData.get("name") || "").trim(),
    about: String(formData.get("about") || "").trim(),
    website: String(formData.get("website") || "").trim(),
    location: String(formData.get("location") || "").trim(),
  };
  const errors = validateCompany(values);
  if (errors) return { errors };

  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return { formError: SAVE_ERROR };
    const supabase = await createClient();
    const updated = await runSupabase(() =>
      supabase
        .from("companies")
        .update({
          name: values.name,
          about: values.about || null,
          website: values.website || null,
          location: values.location || null,
        })
        .eq("id", profile.company_id)
        .select("id")
    );
    if (!updated?.length) return { formError: SAVE_ERROR };
    return { message: "Company updated" };
  } catch {
    return { formError: SAVE_ERROR };
  }
}

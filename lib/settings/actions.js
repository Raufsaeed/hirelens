"use server";

import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { PASSWORD_ERROR } from "@/lib/auth/password";
import { EMAIL_ERROR, GENERIC_ERROR, REQUIRED_ERROR, normalizeEmail, validateEmailOnly, validateNewPassword } from "@/lib/auth/validation";
import { siteOrigin } from "@/lib/site-url";

// Account Settings (Feature 22). Every action works only on the logged-in user's own account.

// ---------- Name ----------

export async function updateName(_previousState, formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) return { errors: { fullName: REQUIRED_ERROR } };
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { formError: GENERIC_ERROR };
    const supabase = await createClient();
    await runSupabase(() => supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id));
    return { message: "Name updated" };
  } catch {
    return { formError: GENERIC_ERROR };
  }
}

// ---------- Email (changes only after the link in the email is clicked) ----------

export async function requestEmailChange(_previousState, formData) {
  const email = normalizeEmail(formData.get("newEmail"));
  const errors = validateEmailOnly(email);
  if (errors) return { errors: { newEmail: errors.email } };
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { formError: GENERIC_ERROR };
    if (email === profile.email) return { errors: { newEmail: "That's already your email" } };

    // A new email must not belong to another account.
    const taken = await runSupabase(() =>
      createAdminClient().from("profiles").select("id").eq("email", email).maybeSingle()
    );
    if (taken) return { errors: { newEmail: "Email already in use" } };

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${await siteOrigin()}/auth/callback?flow=email` }
    );
    if (error?.code === "email_exists") return { errors: { newEmail: "Email already in use" } };
    if (error?.code === "email_address_invalid") return { errors: { newEmail: EMAIL_ERROR } };
    if (error) return { formError: "Couldn't send the confirmation link, try again" };
    return { message: "Check your new email to confirm the change" };
  } catch {
    return { formError: GENERIC_ERROR };
  }
}

// ---------- Password ----------

// Checks the current password with a separate client, so the user's own session isn't touched.
async function isCurrentPassword(email, password) {
  const checker = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    await runSupabase(() => checker.auth.signInWithPassword({ email, password }));
    await checker.auth.signOut({ scope: "local" });
    return true;
  } catch (error) {
    if (error?.code === "invalid_credentials" || error?.status === 400) return false;
    throw error;
  }
}

export async function changePassword(_previousState, formData) {
  const currentPassword = String(formData.get("currentPassword") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const errors = validateNewPassword({ password, confirmPassword }) || {};
  if (!currentPassword) errors.currentPassword = REQUIRED_ERROR;
  if (Object.keys(errors).length) return { errors };

  try {
    const profile = await getCurrentProfile();
    if (!profile) return { formError: GENERIC_ERROR };
    if (!(await isCurrentPassword(profile.email, currentPassword))) {
      return { errors: { currentPassword: "Current password is incorrect" } };
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error?.code === "same_password") {
      return { errors: { password: "Your new password must be different from your old one" } };
    }
    if (error?.code === "weak_password") return { errors: { password: PASSWORD_ERROR } };
    if (error) return { formError: GENERIC_ERROR };
    return { message: "Password updated" };
  } catch {
    return { formError: GENERIC_ERROR };
  }
}

// ---------- Delete account (candidates only) ----------

const DELETE_ERROR = "Couldn't delete your account, try again";

// Every file in the candidate's own folder of the private cvs bucket (application CVs and the default CV).
async function removeCandidateFiles(admin, candidateId) {
  const paths = [];
  for (const area of ["applications", "default"]) {
    // With retries; if listing fails, stop before deleting the account so no CV is left behind.
    const entries = await runSupabase(() => admin.storage.from("cvs").list(`${candidateId}/${area}`));
    for (const entry of entries || []) {
      if (entry.id) {
        paths.push(`${candidateId}/${area}/${entry.name}`); // a file
        continue;
      }
      const prefix = `${candidateId}/${area}/${entry.name}`; // a job folder
      const files = await runSupabase(() => admin.storage.from("cvs").list(prefix));
      (files || []).forEach((file) => paths.push(`${prefix}/${file.name}`));
    }
  }
  if (paths.length) await runSupabase(() => admin.storage.from("cvs").remove(paths));
}

export async function deleteAccount(confirmText) {
  if (confirmText !== "DELETE") return { error: DELETE_ERROR };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return { error: DELETE_ERROR };
    const admin = createAdminClient();
    await removeCandidateFiles(admin, profile.id);
    // Deleting the Auth user removes the profile, and by cascade the applications, screenings,
    // status history, notes and everything else linked to them.
    await runSupabase(() => admin.auth.admin.deleteUser(profile.id));
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    return { error: DELETE_ERROR };
  }
  redirect("/account-deleted");
}

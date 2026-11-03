"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getErrorStatus } from "@/lib/retry";
import { PASSWORD_ERROR } from "@/lib/auth/password";
import { redirectPathFor, homeForRole } from "@/lib/auth/routes";
import { createAccountRecords, deleteAuthUser } from "@/lib/auth/create-account";
import { RESET_COOKIE } from "@/lib/auth/reset-cookie";
import {
  EMAIL_ERROR,
  GENERIC_ERROR,
  normalizeEmail,
  validateEmailOnly,
  validateLogIn,
  validateNewPassword,
  validateSignUp,
} from "@/lib/auth/validation";

// Server actions for Feature 01. Each returns { values, errors, formError } for the form,
// so the user's typing is kept (never the password) and only friendly messages are shown.

const TOO_MANY_ATTEMPTS = "Too many attempts, please wait a minute and try again";

function text(formData, name) {
  return String(formData.get(name) || "").trim();
}

// ---------- Sign up ----------

function signUpError(error) {
  if (error?.code === "user_already_exists" || error?.code === "email_exists") {
    return { formError: "emailInUse" };
  }
  if (error?.code === "weak_password") return { errors: { password: PASSWORD_ERROR } };
  if (error?.code === "email_address_invalid") return { errors: { email: EMAIL_ERROR } };
  if (getErrorStatus(error) === 429) return { formError: TOO_MANY_ATTEMPTS };
  return { formError: GENERIC_ERROR };
}

export async function signUp(_previousState, formData) {
  const role = formData.get("role") === "hr" ? "hr" : "candidate";
  const values = {
    role,
    fullName: text(formData, "fullName"),
    email: normalizeEmail(formData.get("email")),
    companyName: role === "hr" ? text(formData, "companyName") : "",
  };
  const password = String(formData.get("password") || "");

  const errors = validateSignUp({ ...values, password }, role);
  if (errors) return { values, errors };

  // 1. Supabase Auth creates the user and logs them in (email confirmation is off).
  const supabase = await createClient();
  let userId;
  try {
    const data = await runSupabase(() =>
      supabase.auth.signUp({
        email: values.email,
        password,
        options: { data: { full_name: values.fullName } },
      })
    );
    userId = data?.user?.id;
    if (!userId || !data.session) {
      if (userId) await deleteAuthUser(userId);
      return { values, formError: GENERIC_ERROR };
    }
  } catch (error) {
    return { values, ...signUpError(error) };
  }

  // 2. Save the profile (and the company for HR). If that fails, undo the Auth user.
  try {
    await createAccountRecords({ userId, ...values });
  } catch {
    await supabase.auth.signOut();
    await deleteAuthUser(userId);
    return { values, formError: GENERIC_ERROR };
  }

  redirect(redirectPathFor(role, formData.get("next")));
}

// ---------- Log in ----------

export async function logIn(_previousState, formData) {
  const values = { email: normalizeEmail(formData.get("email")) };
  const password = String(formData.get("password") || "");

  const errors = validateLogIn({ ...values, password });
  if (errors) return { values, errors };

  const supabase = await createClient();
  let userId;
  try {
    const data = await runSupabase(() =>
      supabase.auth.signInWithPassword({ email: values.email, password })
    );
    userId = data.user.id;
  } catch (error) {
    // Never say whether the email or the password was wrong.
    if (error?.code === "invalid_credentials" || getErrorStatus(error) === 400) {
      return { values, formError: "invalidCredentials" };
    }
    if (getErrorStatus(error) === 429) return { values, formError: TOO_MANY_ATTEMPTS };
    return { values, formError: GENERIC_ERROR };
  }

  let profile = null;
  try {
    profile = await runSupabase(() =>
      supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
    );
  } catch {
    // handled below
  }
  if (!profile) {
    await supabase.auth.signOut();
    return { values, formError: GENERIC_ERROR };
  }

  redirect(redirectPathFor(profile.role, formData.get("next")));
}

// ---------- Log out ----------

export async function signOut() {
  const supabase = await createClient();
  try {
    await runSupabase(() => supabase.auth.signOut());
  } catch {
    return { error: "Couldn't sign out, try again" };
  }
  redirect("/login");
}

// ---------- Forgot password ----------

async function siteOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function requestPasswordReset(_previousState, formData) {
  const values = { email: normalizeEmail(formData.get("email")) };
  const errors = validateEmailOnly(values.email);
  if (errors) return { values, errors };

  const supabase = await createClient();
  try {
    await runSupabase(async () => {
      const result = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${await siteOrigin()}/auth/callback`,
      });
      // Errors from Supabase Auth (like email limits) happen only for real accounts.
      // Showing them would reveal which emails are registered, so the message stays neutral.
      // Only a network or server failure (no status, or 5xx) is reported to the user.
      const status = getErrorStatus(result.error);
      if (result.error && status !== null && status < 500) {
        console.warn("Password reset email not sent:", result.error.code || status);
        return { data: null, error: null };
      }
      return result;
    });
  } catch {
    return { values, formError: GENERIC_ERROR };
  }
  return { values, sent: true };
}

// ---------- Set new password ----------

export async function resetPassword(_previousState, formData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const errors = validateNewPassword({ password, confirmPassword });
  if (errors) return { errors };

  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId || cookieStore.get(RESET_COOKIE)?.value !== userId) {
    return { expired: true };
  }

  try {
    await runSupabase(() => supabase.auth.updateUser({ password }));
  } catch (error) {
    if (error?.code === "same_password") {
      return { errors: { password: "Your new password must be different from your old one" } };
    }
    if (error?.code === "weak_password") return { errors: { password: PASSWORD_ERROR } };
    const status = getErrorStatus(error);
    if (status === 401 || status === 403) return { expired: true };
    return { formError: GENERIC_ERROR };
  }

  cookieStore.delete(RESET_COOKIE);

  let role = "candidate";
  try {
    const profile = await runSupabase(() =>
      supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
    );
    role = profile?.role || role;
  } catch {
    // The password is saved; fall back to the candidate home if the profile can't load.
  }
  return { success: true, redirectTo: homeForRole(role) };
}

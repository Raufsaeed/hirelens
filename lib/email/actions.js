"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { siteOrigin } from "@/lib/site-url";
import { EMAIL_TEST_COOKIE, emailTestModeFrom } from "@/lib/email/test-mode";
import { sendDailySummary } from "@/lib/email/summary";

// Email actions (Feature 23): HR's "Send today's summary" button and the Settings switches.

const SUMMARY_ERROR = "Couldn't send the summary, try again";
const SUMMARY_RESULTS = {
  sent: { message: "Summary sent" },
  none: { info: "No new applicants since the last summary" },
  off: { info: "Daily applicant summary is turned off in Settings" },
  failed: { error: SUMMARY_ERROR },
};

export async function sendTodaysSummary() {
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr" || !profile.company_id) return { error: SUMMARY_ERROR };
    const testMode = emailTestModeFrom((await cookies()).get(EMAIL_TEST_COOKIE)?.value);
    const result = await sendDailySummary(profile, { testMode, origin: await siteOrigin() });
    return SUMMARY_RESULTS[result];
  } catch {
    return { error: SUMMARY_ERROR };
  }
}

// Candidates switch status updates; HR switches the daily summary. The other emails can't be turned off.
export async function saveEmailPreference(enabled) {
  const PREFERENCE_ERROR = "Couldn't save your preference, try again";
  if (typeof enabled !== "boolean") return { error: PREFERENCE_ERROR };
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: PREFERENCE_ERROR };
    const column = profile.role === "hr" ? "email_daily_summary" : "email_status_updates";
    const supabase = await createClient();
    await runSupabase(() => supabase.from("profiles").update({ [column]: enabled }).eq("id", profile.id));
    return { message: "Preference saved" };
  } catch {
    return { error: PREFERENCE_ERROR };
  }
}

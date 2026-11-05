import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";

// The logged-in user's email switches (Feature 23). Row Level Security: only their own row.
export async function getEmailPreferences(userId) {
  const supabase = await createClient();
  const row = await runSupabase(() =>
    supabase.from("profiles").select("email_status_updates, email_daily_summary").eq("id", userId).maybeSingle()
  );
  return { statusUpdates: row?.email_status_updates ?? true, dailySummary: row?.email_daily_summary ?? true };
}

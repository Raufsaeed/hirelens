import "server-only";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { pakistanToday } from "@/lib/jobs/dates";

// There is no scheduler (the app runs on localhost), so this runs whenever jobs are read:
// every Open job whose Apply by day has ended (Pakistan time) is closed with reason "deadline".
// It uses the server key because logged-out visitors can't update jobs.
export async function closeExpiredJobs() {
  // Depends on today's date, so it must run at request time, never while prerendering.
  await connection();
  const admin = createAdminClient();
  try {
    await runSupabase(() =>
      admin
        .from("jobs")
        .update({ status: "closed", closed_reason: "deadline", closed_at: new Date().toISOString() })
        .eq("status", "open")
        .lt("apply_by", pakistanToday())
    );
  } catch {
    // Pages still load; Apply submit checks the deadline again before saving.
    console.error("Could not close past-deadline jobs");
  }
}

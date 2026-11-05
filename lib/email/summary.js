import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { sendEmail } from "@/lib/email/send";
import { dailySummaryEmail } from "@/emails/daily-summary";

// The HR daily summary (Feature 23), sent when HR clicks "Send today's summary" (no scheduler on localhost).
// "New applicants" are applications to the company's jobs after the last summary that was sent.
// Returns "off", "none", "sent" or "failed".
export async function sendDailySummary(profile, { testMode, origin }) {
  const admin = createAdminClient();
  const me = await runSupabase(() =>
    admin.from("profiles").select("email, email_daily_summary").eq("id", profile.id).maybeSingle()
  );
  if (!me?.email_daily_summary) return "off";

  const lastRows = await runSupabase(() =>
    admin
      .from("notifications")
      .select("sent_at")
      .eq("user_id", profile.id)
      .eq("type", "daily_summary")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(1)
  );
  const last = lastRows?.[0];
  const jobs = await runSupabase(() =>
    admin.from("jobs").select("id, title").eq("company_id", profile.company_id).neq("status", "draft").order("title")
  );

  // Counted per job in the database, so the totals are exact however many people applied.
  const counts = [];
  for (const job of jobs || []) {
    let query = admin.from("applications").select("id", { count: "exact", head: true }).eq("job_id", job.id);
    if (last) query = query.gt("applied_at", last.sent_at);
    const { count, error } = await query;
    if (error) throw error;
    if (count) counts.push({ title: job.title, count });
  }
  if (!counts.length) return "none";

  const sent = await sendEmail({
    to: me.email,
    message: dailySummaryEmail({ hrName: profile.full_name, companyName: profile.companies?.name, jobs: counts, origin }),
    log: { userId: profile.id, type: "daily_summary" },
    testMode,
  });
  return sent ? "sent" : "failed";
}

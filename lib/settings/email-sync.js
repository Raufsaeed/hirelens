import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";

// Keeps profiles.email in step with the Supabase Auth email (Feature 22). The Auth email only changes
// after the confirmation link is clicked; then the profile follows.
// Returns { email, pendingEmail, justUpdated }.
export async function syncEmail(profile) {
  const admin = createAdminClient();
  const { user } = await runSupabase(() => admin.auth.admin.getUserById(profile.id));
  const authEmail = String(user?.email || profile.email).toLowerCase();

  if (authEmail !== profile.email) {
    await runSupabase(() => admin.from("profiles").update({ email: authEmail }).eq("id", profile.id));
    return { email: authEmail, pendingEmail: null, justUpdated: true };
  }
  return { email: authEmail, pendingEmail: user?.new_email || null, justUpdated: false };
}

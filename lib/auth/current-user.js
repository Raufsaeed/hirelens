import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";

// Reads the logged-in user's profile (and company for HR) once per request.
// Returns null when nobody is logged in. Row Level Security only lets a user read their own profile.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();

  // getClaims checks the session token is real before trusting it.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const profile = await runSupabase(() =>
    supabase
      .from("profiles")
      .select("id, full_name, email, role, company_id, companies(name, slug)")
      .eq("id", userId)
      .maybeSingle()
  );
  return profile || null;
});

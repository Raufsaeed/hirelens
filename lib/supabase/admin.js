import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Supabase client with the secret (service role) key.
// It skips Row Level Security, so only use it in server code for trusted jobs,
// and never send its results to the browser without checking access first.
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("The admin Supabase client can only be used on the server.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

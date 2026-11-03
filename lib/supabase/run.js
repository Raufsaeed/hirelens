import { callWithRetry } from "@/lib/retry";

// Runs one Supabase call with the shared retry and call limit.
// Supabase returns { data, error } instead of throwing, so this throws on `error`
// (with the HTTP status attached) and returns `data` when the call worked.
export async function runSupabase(call) {
  return callWithRetry("supabase", async () => {
    const result = await call();
    if (result?.error) {
      const error = result.error;
      if (error.status == null && result.status) error.status = result.status;
      throw error;
    }
    return result?.data;
  });
}

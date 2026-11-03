import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { RESET_COOKIE, RESET_COOKIE_MAX_AGE } from "@/lib/auth/reset-cookie";

// GET /auth/callback: the password reset email link lands here.
// It checks the link with Supabase, logs the user in and opens Set new password.
// Supports both link styles: ?code=... (default email) and ?token_hash=...&type=recovery.
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const supabase = await createClient();
  let userId = null;
  try {
    if (code) {
      const data = await runSupabase(() => supabase.auth.exchangeCodeForSession(code));
      userId = data?.user?.id ?? null;
    } else if (tokenHash && type === "recovery") {
      const data = await runSupabase(() =>
        supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
      );
      userId = data?.user?.id ?? null;
    }
  } catch {
    // Expired, used or broken link: handled below.
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/reset-password?expired=1", url.origin));
  }

  const cookieStore = await cookies();
  cookieStore.set(RESET_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RESET_COOKIE_MAX_AGE,
  });
  return NextResponse.redirect(new URL("/reset-password", url.origin));
}

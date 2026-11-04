import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isApplyPath, isProtectedPath } from "@/lib/auth/routes";

// Runs before every page request:
// 1. Keeps the Supabase session cookie fresh.
// 2. Sends logged-out users who open a protected page to Log in (and back afterwards).
// Role checks (HR vs candidate) happen in the HR and candidate layouts.
export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(cacheHeaders || {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  // Checks the session token and refreshes it when needed.
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  if (!loggedIn && (isProtectedPath(pathname) || isApplyPath(pathname))) {
    const url = request.nextUrl.clone();
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    if (isApplyPath(pathname)) {
      // Clicking Apply while logged out opens candidate sign up, then comes back to the form.
      url.pathname = "/signup";
      url.searchParams.set("role", "candidate");
    } else {
      url.pathname = "/login";
      url.searchParams.set("reason", "login");
    }
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  // Every page, but not static files, images or the API routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

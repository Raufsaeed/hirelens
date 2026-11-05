import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { AuthCardSkeleton } from "@/components/auth/AuthCard";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { redirectPathFor, safeNextPath } from "@/lib/auth/routes";

export const metadata = { title: "Log in · HireLens" };

// /login?next=/hr/dashboard&reason=login (reason is set when a protected page or Save sent the user here)
export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LogIn searchParams={searchParams} />
    </Suspense>
  );
}

async function LogIn({ searchParams }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  const profile = await getCurrentProfile();
  if (profile) redirect(redirectPathFor(profile.role, next));

  // Why the user was sent here: a protected page, or Save on a job while logged out (Feature 21).
  const notice = { login: "Please log in to continue", save: "Log in to save jobs" }[params.reason] || null;
  return <LoginForm next={next} notice={notice} />;
}

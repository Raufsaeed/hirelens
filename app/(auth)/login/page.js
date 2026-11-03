import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { AuthCardSkeleton } from "@/components/auth/AuthCard";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { redirectPathFor, safeNextPath } from "@/lib/auth/routes";

export const metadata = { title: "Log in · HireLens" };

// /login?next=/hr/dashboard&reason=login (reason is set when a protected page sent the user here)
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

  return <LoginForm next={next} askedToLogIn={params.reason === "login"} />;
}

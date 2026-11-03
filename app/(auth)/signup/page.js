import { Suspense } from "react";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";
import { AuthCardSkeleton } from "@/components/auth/AuthCard";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { redirectPathFor, safeNextPath } from "@/lib/auth/routes";

export const metadata = { title: "Sign up · HireLens" };

// /signup?role=hr|candidate&next=/jobs/.../apply
export default function SignUpPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <SignUp searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUp({ searchParams }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  // Already logged in: go straight to where the user belongs.
  const profile = await getCurrentProfile();
  if (profile) redirect(redirectPathFor(profile.role, next));

  const role = params.role === "hr" || params.role === "candidate" ? params.role : null;
  return <SignUpForm initialRole={role} next={next} />;
}

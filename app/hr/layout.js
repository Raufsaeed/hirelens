import { Suspense } from "react";
import { redirect } from "next/navigation";
import HrShell from "@/components/nav/HrShell";
import AccessDenied from "@/components/nav/AccessDenied";
import ShellSkeleton from "@/components/nav/ShellSkeleton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { CANDIDATE_HOME } from "@/lib/auth/routes";

// Every page under /hr: only HR users get in. HR pages render only after this check passes.
// These pages wait for the login check on purpose (they show nothing before it), so Next.js
// should not flag them for instant navigation.
export const instant = false;

export default function HrLayout({ children }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <HrGate>{children}</HrGate>
    </Suspense>
  );
}

async function HrGate({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?reason=login");
  if (profile.role !== "hr") {
    return <AccessDenied homeHref={CANDIDATE_HOME} homeLabel="My Applications" />;
  }
  return (
    <HrShell fullName={profile.full_name} companyName={profile.companies?.name}>
      {children}
    </HrShell>
  );
}

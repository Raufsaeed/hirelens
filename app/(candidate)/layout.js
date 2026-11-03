import { Suspense } from "react";
import { redirect } from "next/navigation";
import CandidateShell from "@/components/nav/CandidateShell";
import AccessDenied from "@/components/nav/AccessDenied";
import ShellSkeleton from "@/components/nav/ShellSkeleton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { HR_HOME } from "@/lib/auth/routes";

// Logged-in candidate pages (My Applications, and later Saved Jobs, Profile, Settings).
export default function CandidateLayout({ children }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <CandidateGate>{children}</CandidateGate>
    </Suspense>
  );
}

async function CandidateGate({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?reason=login");
  if (profile.role !== "candidate") {
    return <AccessDenied homeHref={HR_HOME} homeLabel="HR Dashboard" />;
  }
  return <CandidateShell fullName={profile.full_name}>{children}</CandidateShell>;
}

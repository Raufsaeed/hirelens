import { Suspense } from "react";
import CandidateShell from "@/components/nav/CandidateShell";
import ShellSkeleton from "@/components/nav/ShellSkeleton";
import VisitorShell from "@/components/nav/VisitorShell";
import { getCurrentProfile } from "@/lib/auth/current-user";

// Public pages (jobs list, job detail): anyone can open them.
// Logged-in candidates see their usual top bar; everyone else sees Log in / Sign up.
export default function PublicLayout({ children }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <PublicShell>{children}</PublicShell>
    </Suspense>
  );
}

async function PublicShell({ children }) {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // Public pages still work when the session can't be read.
  }
  if (profile?.role === "candidate") {
    return (
      <CandidateShell fullName={profile.full_name} wide>
        {children}
      </CandidateShell>
    );
  }
  return <VisitorShell isHr={profile?.role === "hr"}>{children}</VisitorShell>;
}

import { Suspense } from "react";
import PageHeader from "@/components/nav/PageHeader";
import DefaultCvBox from "@/components/profile/DefaultCvBox";
import ProfileForm from "@/components/profile/ProfileForm";
import Alert from "@/components/ui/Alert";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getCandidateProfile } from "@/lib/profile/default-cv";
import { cvFileName } from "@/lib/profile/validation";

export const metadata = { title: "My Profile · HireLens" };

// My Profile (Feature 20). Only the candidate sees it (the candidate layout turns HR away).
// HR never browses profiles; they only see what was sent with an application.
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Profile" subtitle="Only you can see this. Companies see only what you send when you apply." />
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
    </div>
  );
}

async function Profile() {
  let profile;
  try {
    const current = await getCurrentProfile();
    profile = await getCandidateProfile(current.id);
  } catch {
    profile = null;
  }
  if (!profile) return <Alert tone="error" title="Couldn't load your profile" action={<RetryButton />} />;

  const incomplete = !profile.phone || !profile.city || !profile.headline || !profile.default_cv_path;
  return (
    <>
      {incomplete && <Alert tone="info" title="Complete your profile to apply faster" />}
      <div className="flex flex-col gap-8 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <ProfileForm profile={profile} />
        <hr className="h-px border-0 bg-border" />
        <DefaultCvBox initialFileName={cvFileName(profile.default_cv_path)} />
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return <div className="h-120 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" aria-label="Loading your profile" />;
}

import { Suspense } from "react";
import SettingsSections from "@/components/settings/SettingsSections";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { syncEmail } from "@/lib/settings/email-sync";

// Settings for both roles (Feature 22): /hr/settings for HR, /settings for candidates.
// ?email=expired: the change-email link was too old or already used.
export default function SettingsPage({ searchParams }) {
  return (
    <div className="flex max-w-form flex-col gap-8">
      <PageHeader title="Settings" />
      <Suspense fallback={<div className="h-120 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
        <Settings searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Settings({ searchParams }) {
  const params = await searchParams;
  let profile;
  let email;
  try {
    profile = await getCurrentProfile();
    email = await syncEmail(profile);
  } catch {
    return <Alert tone="error" title="Couldn't load your settings" action={<RetryButton />} />;
  }
  return (
    <>
      {params?.email === "expired" && (
        <Alert tone="error" title="This link has expired, please request a new one">
          Your email hasn&apos;t changed.
        </Alert>
      )}
      <SettingsSections
      profile={{ full_name: profile.full_name, role: profile.role }}
      email={email}
      />
    </>
  );
}

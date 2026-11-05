import { Suspense } from "react";
import PageHeader from "@/components/nav/PageHeader";
import SavedJobsList from "@/components/saved-jobs/SavedJobsList";
import Alert from "@/components/ui/Alert";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listSavedJobs } from "@/lib/saved-jobs/queries";

export const metadata = { title: "Saved Jobs · HireLens" };

// Saved Jobs (Feature 21): only the candidate's own saved jobs, newest first.
export default function SavedJobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Saved Jobs" subtitle="Jobs you saved to apply to later. Only you can see this list." />
      <Suspense fallback={<SavedJobsSkeleton />}>
        <SavedJobs />
      </Suspense>
    </div>
  );
}

async function SavedJobs() {
  let items;
  try {
    const profile = await getCurrentProfile();
    items = await listSavedJobs(profile.id);
  } catch {
    return <Alert tone="error" title="Couldn't load your saved jobs" action={<RetryButton />} />;
  }
  return <SavedJobsList initialItems={items} />;
}

function SavedJobsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your saved jobs">
      {[1, 2, 3].map((key) => (
        <div key={key} className="h-40 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  );
}

import { Suspense } from "react";
import { FileText, Search } from "lucide-react";
import MyApplicationCard from "@/components/applications/MyApplicationCard";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listMyApplications } from "@/lib/applications/candidate-queries";

export const metadata = { title: "My Applications · HireLens" };

// My Applications (Feature 09): every application with job, company, applied date and status only.
// ?deleted=1 confirms "Delete my data" (Feature 10).
export default function MyApplicationsPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">My Applications</h1>
      <Suspense fallback={null}>
        <DeletedNotice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<ApplicationsSkeleton />}>
        <ApplicationsList />
      </Suspense>
    </div>
  );
}

async function ApplicationsList() {
  let applications;
  try {
    const profile = await getCurrentProfile();
    applications = await listMyApplications(profile.id);
  } catch {
    return <Alert tone="error" title="Couldn't load your applications" action={<RetryButton />} />;
  }

  if (applications.length === 0) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState
          icon={FileText}
          title="You haven't applied to any jobs yet"
          action={
            <Button href="/jobs" icon={Search}>
              Browse jobs
            </Button>
          }
        >
          Find a job you like and apply with your CV in a minute.
        </EmptyState>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((application) => (
        <MyApplicationCard key={application.id} application={application} />
      ))}
    </div>
  );
}

async function DeletedNotice({ searchParams }) {
  const params = await searchParams;
  if (params.deleted !== "1") return null;
  return <Alert tone="success" title="Your data has been deleted">The application and your CV for that job are gone.</Alert>;
}

function ApplicationsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your applications">
      {[0, 1, 2].map((key) => (
        <div key={key} className="h-24 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  );
}

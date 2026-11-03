import { Briefcase, Plus } from "lucide-react";
import DashboardJobCard from "@/components/jobs/DashboardJobCard";
import JobsTable from "@/components/jobs/JobsTable";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listCompanyJobs } from "@/lib/jobs/queries";

// Loads the company's jobs and shows them as dashboard cards or the My Jobs table,
// with the empty and error states from the user flows.
export default async function JobsList({ view }) {
  let jobs;
  try {
    const profile = await getCurrentProfile();
    jobs = await listCompanyJobs(profile.company_id);
  } catch {
    return <Alert tone="error" title="Couldn't load your jobs" action={<RetryButton />} />;
  }

  if (jobs.length === 0) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState
          icon={Briefcase}
          title="You have no jobs yet"
          action={
            <Button href="/hr/jobs/new" icon={Plus}>
              Post your first job
            </Button>
          }
        >
          Post your first job and share the link with candidates.
        </EmptyState>
      </section>
    );
  }

  if (view === "table") return <JobsTable jobs={jobs} />;
  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job) => (
        <DashboardJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

// Shown while jobs load.
export function JobsListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your jobs">
      {[0, 1].map((key) => (
        <div key={key} className="h-32 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  );
}

import { Suspense } from "react";
import { ChartColumn, Plus } from "lucide-react";
import JobsList, { JobsListSkeleton } from "@/components/jobs/JobsList";
import PageHeader from "@/components/nav/PageHeader";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

export const metadata = { title: "Dashboard · HireLens" };

// HR Dashboard: one card per job with status, applicants and deadline.
export default function HrDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <Button href="/hr/reports" variant="secondary" icon={ChartColumn}>
              View reports
            </Button>
            <Button href="/hr/jobs/new" icon={Plus}>
              Post a job
            </Button>
          </>
        }
      />
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-heading">Your jobs</h2>
          <TextLink href="/hr/jobs">View all</TextLink>
        </div>
        <Suspense fallback={<JobsListSkeleton />}>
          <JobsList view="cards" />
        </Suspense>
      </section>
    </div>
  );
}

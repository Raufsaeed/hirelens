import { Suspense } from "react";
import { Plus } from "lucide-react";
import JobsList, { JobsListSkeleton } from "@/components/jobs/JobsList";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

export const metadata = { title: "My Jobs · HireLens" };

// My Jobs: all the company's jobs in a table. ?saved=draft shows "Draft saved".
export default function MyJobsPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="My Jobs"
        actions={
          <Button href="/hr/jobs/new" icon={Plus}>
            Post a job
          </Button>
        }
      />
      <Suspense fallback={null}>
        <SavedNotice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList view="table" />
      </Suspense>
    </div>
  );
}

async function SavedNotice({ searchParams }) {
  const params = await searchParams;
  if (params.saved !== "draft") return null;
  return <Alert tone="success" title="Draft saved">Only your company&apos;s HR can see it until you publish.</Alert>;
}

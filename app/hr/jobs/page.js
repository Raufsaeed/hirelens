import { Suspense } from "react";
import { Plus } from "lucide-react";
import JobsList, { JobsListSkeleton } from "@/components/jobs/JobsList";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

export const metadata = { title: "My Jobs · HireLens" };

// My Jobs: all the company's jobs in a table. ?saved=draft|updated|extended shows what was just saved.
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

// After Save as draft (Feature 02) or Edit Job (Feature 03).
const NOTICES = {
  draft: { title: "Draft saved", body: "Only your company's HR can see it until you publish." },
  updated: { title: "Job updated", body: "The public job page shows the changes." },
  extended: { title: "Deadline extended. The job is open again", body: "The public link accepts applications again." },
};

async function SavedNotice({ searchParams }) {
  const params = await searchParams;
  const notice = NOTICES[params.saved];
  if (!notice) return null;
  return (
    <Alert tone="success" title={notice.title}>
      {notice.body}
    </Alert>
  );
}

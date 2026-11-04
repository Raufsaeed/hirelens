import { Suspense } from "react";
import { Lock, Briefcase } from "lucide-react";
import JobPicker from "@/components/candidates/JobPicker";
import PageHeader from "@/components/nav/PageHeader";
import PipelineBoard from "@/components/pipeline/PipelineBoard";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listCandidateJobs } from "@/lib/candidates/queries";
import { getPipeline } from "@/lib/pipeline/queries";

export const metadata = { title: "Pipeline · HireLens" };

// Pipeline board (Feature 15), one job at a time: ?job=<id>.
export default function PipelinePage({ searchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pipeline" subtitle="Drag a card, or use its Move to menu. You make every move." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
        <Pipeline searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Pipeline({ searchParams }) {
  const params = await searchParams;
  let jobs;
  let job;
  let notMine = false;
  let cards;
  try {
    const profile = await getCurrentProfile();
    jobs = await listCandidateJobs(profile.company_id);
    job = params.job ? jobs.find((item) => item.id === params.job) : jobs[0];
    notMine = Boolean(params.job && !job);
    cards = job ? await getPipeline(profile.company_id, job.id) : [];
  } catch {
    return <Alert tone="error" title="Couldn't load the board" action={<RetryButton />} />;
  }

  if (notMine) return <NoAccess />;
  if (!job) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={Briefcase} title="You have no jobs yet" action={<Button href="/hr/jobs/new">Post your first job</Button>}>
          Candidates appear on the board once people apply.
        </EmptyState>
      </section>
    );
  }

  return (
    <>
      <JobPicker jobs={jobs} selectedId={job.id} basePath="/hr/pipeline" />
      <PipelineBoard key={job.id} initialCards={cards || []} />
    </>
  );
}

// A job id that isn't one of this company's jobs.
function NoAccess() {
  return (
    <section className="rounded-card border border-border bg-surface shadow-card">
      <EmptyState icon={Lock} title="You don't have access to this page">
        This job doesn&apos;t belong to your company.
      </EmptyState>
    </section>
  );
}

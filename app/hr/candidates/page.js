import { Suspense } from "react";
import { Briefcase, Pencil, Users } from "lucide-react";
import AiNote from "@/components/candidates/AiNote";
import CandidatesTable from "@/components/candidates/CandidatesTable";
import JobPicker from "@/components/candidates/JobPicker";
import CopyLinkButton from "@/components/jobs/CopyLinkButton";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listCandidateJobs, listJobCandidates } from "@/lib/candidates/queries";

export const metadata = { title: "Candidates · HireLens" };

// Ranked candidates for one of the company's jobs (Feature 12). ?job=<id> picks the job; ?q= pre-fills search.
export default function CandidatesPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Candidates" />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
        <Candidates searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Candidates({ searchParams }) {
  const params = await searchParams;
  let jobs;
  let rows;
  let job;
  try {
    const profile = await getCurrentProfile();
    jobs = await listCandidateJobs(profile.company_id);
    job = jobs.find((item) => item.id === params.job) || jobs[0];
    rows = job ? await listJobCandidates(profile.company_id, job.id) : [];
  } catch {
    return <Alert tone="error" title="Couldn't load candidates" action={<RetryButton />} />;
  }

  if (!job) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={Briefcase} title="You have no jobs yet" action={<Button href="/hr/jobs/new">Post your first job</Button>}>
          Candidates appear here once you publish a job and people apply.
        </EmptyState>
      </section>
    );
  }

  return (
    <>
      <JobPicker jobs={jobs} selectedId={job.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="section-heading">{job.title}</h2>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {job.status === "open" && <CopyLinkButton slug={job.slug} variant="secondary" />}
          <Button href={`/hr/jobs/${job.id}/edit`} variant="ghost" size="sm" icon={Pencil}>
            Edit job
          </Button>
        </div>
      </div>
      <AiNote />

      {rows.length === 0 ? (
        <section className="rounded-card border border-border bg-surface shadow-card">
          <EmptyState
            icon={Users}
            title="No one has applied yet. Share your job link"
            action={job.status === "open" && <CopyLinkButton slug={job.slug} variant="primary" size="md" />}
          />
        </section>
      ) : (
        <CandidatesTable
          key={job.id}
          rows={rows}
          requirements={job.requirements || []}
          initialSearch={String(params.q || "")}
        />
      )}
    </>
  );
}

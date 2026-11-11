import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import CopyLinkButton from "@/components/jobs/CopyLinkButton";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import Button from "@/components/ui/Button";
import { INPUT_CLASSES } from "@/components/ui/TextField";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getCompanyJob } from "@/lib/jobs/queries";
import { siteOrigin } from "@/lib/site-url";

export const metadata = { title: "Job published · HireLens" };

// Shown right after Publish: the public link with "Copy link".
export default function JobPublishedPage({ params }) {
  return (
    <Suspense fallback={<div className="h-64 max-w-form animate-pulse rounded-card bg-surface-sunken" />}>
      <JobPublished params={params} />
    </Suspense>
  );
}

async function JobPublished({ params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const job = await getCompanyJob(profile.company_id, id);
  if (!job || job.status !== "open" || !job.slug) notFound();

  const url = `${siteOrigin()}/jobs/${job.slug}`;

  return (
    <section className="flex max-w-form animate-fade-up flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-success-bg text-success">
          <CircleCheck className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="page-title">{job.title} is live</h1>
          <p className="text-ink-muted">Share this link on LinkedIn, WhatsApp or your website.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="jobLink" className="label text-ink">
          Job link
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="jobLink" readOnly value={url} className={`${INPUT_CLASSES} flex-1`} />
          <CopyLinkButton slug={job.slug} variant="primary" size="md" />
        </div>
      </div>

      <DeadlineLabel deadline={job.deadline} />

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button href="/hr/dashboard" variant="secondary">
          Go to dashboard
        </Button>
        <Button href="/hr/jobs" variant="ghost">
          View My Jobs
        </Button>
      </div>
    </section>
  );
}

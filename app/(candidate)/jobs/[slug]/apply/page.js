import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import ApplyForm from "@/components/applications/ApplyForm";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getApplyContext } from "@/lib/applications/apply-context";
import { deadlineInfo, pakistanToday } from "@/lib/jobs/dates";
import { getCandidateProfile } from "@/lib/profile/default-cv";
import { cvFileName } from "@/lib/profile/validation";

export const metadata = { title: "Apply · HireLens" };

// Apply form for one job (Feature 08). Only logged-in candidates get here (candidate layout + proxy).
export default function ApplyPage({ params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
      <Apply params={params} />
    </Suspense>
  );
}

async function Apply({ params }) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const { job, blocked, applied } = await getApplyContext({ slug, candidateId: profile.id });
  if (!job) notFound();
  // The form is filled in from My Profile (Feature 20).
  // If it can't be read, the form still works, just without the prefill.
  const details = blocked ? null : await getCandidateProfile(profile.id).catch(() => null);

  const companyName = job.companies?.name;

  return (
    <div className="flex max-w-form flex-col gap-6">
      <TextLink href={`/jobs/${job.slug}`} className="small inline-flex items-center gap-1 self-start">
        <ArrowLeft className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        {job.title}
      </TextLink>
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Apply to {companyName}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-muted">{[job.title, job.location].filter(Boolean).join(" · ")}</span>
          {!blocked && <DeadlineLabel deadline={deadlineInfo(job.apply_by, pakistanToday())} />}
        </div>
      </div>

      {blocked ? (
        <Alert
          tone={applied ? "info" : "error"}
          title={blocked}
          action={
            applied ? (
              <Button href="/my-applications" variant="secondary" size="sm" icon={FileText}>
                My Applications
              </Button>
            ) : (
              <Button href="/jobs" variant="secondary" size="sm">
                Browse jobs
              </Button>
            )
          }
        />
      ) : (
        <ApplyForm
          job={{ id: job.id, slug: job.slug, companies: { name: companyName } }}
          defaults={{ fullName: profile.full_name, email: profile.email, phone: details?.phone || "" }}
          defaultCvName={cvFileName(details?.default_cv_path)}
        />
      )}
    </div>
  );
}

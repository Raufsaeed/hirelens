import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CircleCheck, FileText, Search } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";
import Button from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getApplyContext } from "@/lib/applications/apply-context";

export const metadata = { title: "Application sent · HireLens" };

// Confirmation after applying (Feature 08). No score and no AI wording.
export default function ApplicationSentPage({ params, searchParams }) {
  return (
    <Suspense fallback={null}>
      <ApplicationSent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ApplicationSent({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const { job, applied } = await getApplyContext({ slug, candidateId: profile.id });
  // Only shown when this candidate really applied to this job.
  if (!job || !applied) redirect(`/jobs/${slug}/apply`);

  const companyName = job.companies?.name;
  const fileName = String(query.file || "").slice(0, 100);

  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <FadeUp className="flex w-full max-w-130 flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-card sm:px-8">
        <span className="grid size-24 place-items-center rounded-pill bg-success-bg text-success">
          <CircleCheck className="size-14" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="page-title">Your application has been sent to {companyName}</h1>
        <p className="text-ink-muted">
          {job.title} · We&apos;ll show every update on My Applications. You don&apos;t need to wait here.
        </p>
        {fileName && (
          <p className="flex w-full items-center gap-2 rounded-[12px] bg-surface-page p-4 text-left">
            <CircleCheck className="size-icon-md shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
            <span>
              <strong>CV received</strong> · {fileName}
            </span>
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/my-applications" icon={FileText}>
            Go to My Applications
          </Button>
          <Button href="/jobs" variant="secondary" icon={Search}>
            Browse more jobs
          </Button>
        </div>
      </FadeUp>
    </div>
  );
}

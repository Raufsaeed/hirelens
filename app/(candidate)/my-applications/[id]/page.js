import { Suspense } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import ApplicationActions from "@/components/applications/ApplicationActions";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import InterviewDetails from "@/components/applications/InterviewDetails";
import StatusTimeline from "@/components/applications/StatusTimeline";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import TextLink from "@/components/ui/TextLink";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getMyApplication } from "@/lib/applications/candidate-queries";
import { formatDay } from "@/lib/format-date";

export const metadata = { title: "Application · HireLens" };

// Application Detail (Feature 09): the status timeline, and the interview (Feature 16). Never a score, match, AI summary or HR note.
export default function ApplicationDetailPage({ params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
      <ApplicationDetail params={params} />
    </Suspense>
  );
}

async function ApplicationDetail({ params }) {
  const { id } = await params;
  let application;
  try {
    const profile = await getCurrentProfile();
    application = await getMyApplication(profile.id, id);
  } catch {
    return <Alert tone="error" title="Couldn't load this application" action={<RetryButton />} />;
  }

  // Someone else's application (or a wrong link): show nothing about it.
  if (!application) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState
          icon={Lock}
          title="You don't have access to this page"
          action={<Button href="/my-applications">My Applications</Button>}
        >
          You can only open your own applications.
        </EmptyState>
      </section>
    );
  }

  const job = application.jobs;
  const companyName = job?.companies?.name;

  return (
    <div className="flex flex-col gap-6">
      <TextLink href="/my-applications" className="small inline-flex items-center gap-1 self-start">
        <ArrowLeft className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        My Applications
      </TextLink>

      <header className="flex items-start gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <CompanyLogo company={job?.companies} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="page-title [overflow-wrap:anywhere]">{job?.title}</h1>
          <span className="text-ink-muted [overflow-wrap:anywhere]">
            {companyName} · Applied on {formatDay(application.applied_at)}
          </span>
          <ApplicationStatusBadge status={application.status} forCandidate />
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <h2 className="section-heading">Progress</h2>
        <StatusTimeline status={application.status} history={application.status_history} companyName={companyName} />
      </section>

      {application.interview && <InterviewDetails interview={application.interview} />}

      <ApplicationActions applicationId={application.id} status={application.status} companyName={companyName} />
    </div>
  );
}

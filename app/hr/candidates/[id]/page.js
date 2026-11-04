import { Suspense } from "react";
import { ArrowLeft, FileText, Lock } from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import AiNote from "@/components/candidates/AiNote";
import CvPreview from "@/components/candidates/CvPreview";
import DecisionButtons from "@/components/candidates/DecisionButtons";
import NotesPanel from "@/components/candidates/NotesPanel";
import ScreeningPanel from "@/components/candidates/ScreeningPanel";
import Avatar from "@/components/nav/Avatar";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import TextLink from "@/components/ui/TextLink";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { CV_PREVIEW_SECONDS, getCandidate, prepareCandidateView } from "@/lib/candidates/queries";
import { formatDay } from "@/lib/format-date";

export const metadata = { title: "Candidate · HireLens" };

// Candidate Detail (Features 11 and 14): screening, CV preview, notes, Shortlist and Reject. HR only.
export default function CandidateDetailPage({ params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
      <CandidateDetail params={params} />
    </Suspense>
  );
}

async function CandidateDetail({ params }) {
  const { id } = await params;
  let candidate;
  let cvUrl = null;
  try {
    const profile = await getCurrentProfile();
    candidate = await getCandidate(profile.company_id, id);
    // Only after HR's access is confirmed: a fresh CV link, and "viewed" for the new count.
    if (candidate) ({ cvUrl } = await prepareCandidateView(candidate));
  } catch {
    return <Alert tone="error" title="Couldn't load this candidate" action={<RetryButton />} />;
  }

  if (!candidate) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={Lock} title="You don't have access to this page" action={<Button href="/hr/candidates">Candidates</Button>}>
          This candidate didn&apos;t apply to one of your jobs.
        </EmptyState>
      </section>
    );
  }

  const cvHref = `/hr/candidates/${candidate.id}/cv`;

  return (
    <div className="flex flex-col gap-6">
      <TextLink href={`/hr/candidates?job=${candidate.job_id}`} className="small inline-flex items-center gap-1 self-start">
        <ArrowLeft className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        All candidates for {candidate.jobs.title}
      </TextLink>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={candidate.candidate_name} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="page-title [overflow-wrap:anywhere]">{candidate.candidate_name}</h1>
            <span className="text-ink-muted [overflow-wrap:anywhere]">
              {candidate.jobs.title} · Applied on {formatDay(candidate.applied_at)}
            </span>
            <span className="small text-ink-muted [overflow-wrap:anywhere]">
              {candidate.candidate_email} · {candidate.phone}
            </span>
            <ApplicationStatusBadge status={candidate.status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DecisionButtons applicationId={candidate.id} status={candidate.status} candidateName={candidate.candidate_name} />
          {candidate.screening_status !== "failed" && (
            <Button href={cvHref} variant="ghost" size="sm" icon={FileText} target="_blank" rel="noreferrer">
              Open original CV
            </Button>
          )}
        </div>
      </header>

      <AiNote title="AI suggestions are advice only — you make the decision." />
      <ScreeningPanel candidate={candidate} cvHref={cvHref} />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
          <h2 className="card-title">CV</h2>
          <CvPreview applicationId={candidate.id} url={cvUrl} validSeconds={CV_PREVIEW_SECONDS} />
        </section>
        <NotesPanel applicationId={candidate.id} notes={candidate.notes} />
      </div>

      {candidate.cover_note && (
        <section className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
          <h2 className="card-title">Cover note</h2>
          <p className="whitespace-pre-line [overflow-wrap:anywhere]">{candidate.cover_note}</p>
        </section>
      )}
    </div>
  );
}

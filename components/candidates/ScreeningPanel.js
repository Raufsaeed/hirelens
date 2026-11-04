import { CircleCheck, CircleX, FileText, FileX, Hourglass, Quote } from "lucide-react";
import MatchBar from "@/components/candidates/MatchBar";
import ManualReviewNote from "@/components/candidates/ManualReviewNote";
import RetryScreeningButton from "@/components/candidates/RetryScreeningButton";
import ScoreRing from "@/components/candidates/ScoreRing";
import { RUBRIC_PARTS } from "@/lib/screening/validate";

// The screening result on Candidate Detail (Feature 11). HR only; never shown to candidates.

const RUBRIC_LABELS = {
  skills_match: "Skills match",
  experience: "Experience",
  education: "Education",
  structure_formatting: "Structure and formatting",
  contact_summary_links: "Contact info, summary and links",
  grammar_clarity: "Grammar and clarity",
};
const EXPERIENCE_COUNT = { job: "Counts in full", internship: "Counts half", project: "Not counted" };

const CARD = "flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6";

function StatusCard({ icon: Icon, tone, title, children }) {
  return (
    <section className={CARD} aria-live="polite">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-control ${tone}`}>
          <Icon className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="card-title">{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function periodLabel(item) {
  const end = item.end === "present" ? "present" : item.end || "?";
  return `${item.start || "?"} to ${end}`;
}

export default function ScreeningPanel({ candidate, cvHref }) {
  const { screening, screening_status: status, jobs: job } = candidate;

  if (status === "queued" || status === "processing") {
    return (
      <StatusCard icon={FileText} tone="bg-primary-tint text-on-primary-tint animate-pulse" title="AI is checking this CV…">
        <p className="text-ink-muted">Screening runs in the background and usually takes under a minute.</p>
      </StatusCard>
    );
  }

  if (status === "pending") {
    return (
      <StatusCard icon={Hourglass} tone="bg-warning-bg text-warning" title="Screening pending">
        <p className="text-ink-muted">AI couldn&apos;t screen this CV yet. You can try again.</p>
        <RetryScreeningButton applicationId={candidate.id} />
      </StatusCard>
    );
  }

  if (status === "failed") {
    return (
      <StatusCard icon={FileX} tone="bg-warning-bg text-warning" title="CV could not be read">
        <p className="text-ink-muted">
          It may be a scanned PDF. Open the original CV, read it yourself and note what you found. The candidate
          stays in the list without a score.
        </p>
        <a
          href={cvHref}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-primary no-underline hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          Open original CV
        </a>
        <ManualReviewNote applicationId={candidate.id} />
      </StatusCard>
    );
  }

  // "done" always has a screening row; this guards against a missing one (never the error page).
  if (!screening || screening.score === null) {
    return (
      <StatusCard icon={Hourglass} tone="bg-warning-bg text-warning" title="Screening pending">
        <p className="text-ink-muted">The result isn&apos;t available. You can try again.</p>
        <RetryScreeningButton applicationId={candidate.id} />
      </StatusCard>
    );
  }

  const requirements = screening.requirements_result || [];
  const found = requirements.filter((item) => item.found);
  const missing = requirements.filter((item) => !item.found);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <section className={CARD}>
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={screening.score} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="label text-ink-muted">Requirements match</span>
              <MatchBar percent={screening.match_percent} found={found.length} total={requirements.length} size="md" />
            </div>
            <dl className="small grid grid-cols-2 gap-x-3 gap-y-1">
              {screening.must_have_match !== null && (
                <>
                  <dt className="text-ink-muted">Must-have</dt>
                  <dd className="font-bold tabular-nums">{Math.round(screening.must_have_match)}%</dd>
                </>
              )}
              {screening.nice_to_have_match !== null && (
                <>
                  <dt className="text-ink-muted">Nice-to-have</dt>
                  <dd className="font-bold tabular-nums">{Math.round(screening.nice_to_have_match)}%</dd>
                </>
              )}
              <dt className="text-ink-muted">Relevant years</dt>
              <dd className="font-bold tabular-nums">
                {Number(screening.relevant_years).toFixed(1)} {screening.meets_required_years ? "✓" : "✗"}
                <span className="sr-only">{screening.meets_required_years ? "meets" : "below"} the {job.required_years} required</span>
              </dd>
              <dt className="text-ink-muted">Degree</dt>
              <dd className="font-bold">
                {screening.degree_found || "Not found"} {screening.degree_match ? "✓" : "✗"}
              </dd>
            </dl>
          </div>
        </div>

        {screening.summary?.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="label text-ink-muted">AI summary</h3>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {screening.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="label text-ink-muted">Score breakdown</h3>
          {RUBRIC_PARTS.map(({ part, max }) => {
            const item = screening.rubric_breakdown?.find((entry) => entry.part === part);
            if (!item) return null;
            return (
              <div key={part} className="flex flex-col gap-1">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{RUBRIC_LABELS[part]}</span>
                  <span className="numeric tabular-nums">
                    {item.marks} / {max}
                  </span>
                </div>
                <span className="block h-1.5 overflow-hidden rounded-pill bg-surface-sunken">
                  <span className="block h-full rounded-pill bg-primary" style={{ width: `${(item.marks / max) * 100}%` }} />
                </span>
                <span className="small text-ink-muted">{item.reason}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section className={CARD}>
          <h2 className="card-title">Requirements</h2>
          <ul className="flex flex-col gap-3" aria-label="Requirements found">
            {found.map((item) => (
              <li key={item.name} className="flex flex-col gap-1">
                <span className="label inline-flex w-fit items-center gap-1.5 rounded-pill bg-success-bg px-3 py-1 text-success-text">
                  <CircleCheck className="size-3.5 text-success" strokeWidth={1.75} aria-hidden="true" />
                  {item.name}
                  <span className="sr-only">found</span>
                </span>
                <span className="small flex items-start gap-1.5 text-ink-muted italic">
                  <Quote className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {item.evidence}
                </span>
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Requirements missing">
              {missing.map((item) => (
                <li
                  key={item.name}
                  className="label inline-flex items-center gap-1.5 rounded-pill border border-dashed border-warning bg-warning-bg px-3 py-1 text-warning-text"
                >
                  <CircleX className="size-3.5 text-warning" strokeWidth={1.75} aria-hidden="true" />
                  {item.name}
                  <span className="sr-only">missing</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {screening.experience_items?.length > 0 && (
          <section className={CARD}>
            <h2 className="card-title">Experience</h2>
            <ul className="flex flex-col gap-3">
              {screening.experience_items.map((item) => (
                <li key={`${item.title}-${item.start}`} className="flex flex-col">
                  <span className="font-bold">{item.title}</span>
                  <span className="small text-ink-muted">
                    {periodLabel(item)} · {item.relevant ? EXPERIENCE_COUNT[item.type] : "Not relevant to this job"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

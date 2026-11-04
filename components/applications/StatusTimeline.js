import { APPLICATION_STATUSES } from "@/components/applications/ApplicationStatusBadge";
import { formatDayTime } from "@/lib/format-date";

// What a candidate sees on their application: the steps so far, never a score or AI result
// (design/components/StatusTimeline). Applied → Shortlisted → Interview → Offer → Hired;
// Rejected ("Not selected") and Withdrawn end the timeline.

const STEPS = ["applied", "shortlisted", "interview", "offer", "hired"];

// The latest date the application reached each status.
function datesByStatus(history) {
  const dates = {};
  history.forEach((entry) => {
    dates[entry.to_status] = entry.changed_at;
  });
  return dates;
}

function finalMessage(status, companyName) {
  if (status === "rejected") return `${companyName} has moved forward with other candidates. Thank you for applying.`;
  if (status === "withdrawn") return "You withdrew this application.";
  if (status === "hired") return `Congratulations! ${companyName} will contact you.`;
  return null;
}

const DOT_STYLES = {
  done: "border-primary bg-primary text-on-primary",
  current: "border-primary bg-surface text-primary shadow-[0_0_0_4px_var(--primary-tint)]",
  upcoming: "border-border-control bg-surface text-ink-muted",
  hired: "border-success bg-success text-on-primary",
  rejected: "border-danger-bg bg-danger-bg text-danger",
  withdrawn: "border-dashed border-border-control bg-muted-bg text-muted-text",
};

export default function StatusTimeline({ status, history, companyName }) {
  const dates = datesByStatus(history);
  const ended = status === "rejected" || status === "withdrawn";

  // Normal path: every step, marked done, current or upcoming. Ended: the steps it reached, then the end.
  const items = ended
    ? [...STEPS.filter((step) => dates[step]), status]
    : STEPS;
  const currentIndex = ended ? items.length - 1 : STEPS.indexOf(status);

  return (
    <ol aria-label="Application timeline" className="flex flex-col">
      {items.map((step, index) => {
        const info = APPLICATION_STATUSES[step];
        const Icon = info.icon;
        const isCurrent = index === currentIndex;
        const state = index < currentIndex ? "done" : isCurrent ? "current" : "upcoming";
        const dotStyle = isCurrent && (step === "hired" || ended) ? DOT_STYLES[step] : DOT_STYLES[state];
        const message = isCurrent ? finalMessage(step, companyName) : null;
        const isLast = index === items.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute top-9 bottom-0 left-4 w-0.5 -translate-x-1/2 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative grid size-8 shrink-0 place-items-center rounded-pill border-2 ${dotStyle} ${
                isCurrent ? "animate-fade-up" : ""
              }`}
            >
              <Icon className="size-icon-sm" strokeWidth={1.75} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-1">
              <span className={`font-bold ${state === "upcoming" ? "text-ink-muted" : "text-ink"}`}>
                {info.candidateLabel || info.label}
              </span>
              {state !== "upcoming" && dates[step] && (
                <span className="small text-ink-muted">{formatDayTime(dates[step])}</span>
              )}
              {message && <span className="small text-ink-muted">{message}</span>}
              {isCurrent && <span className="sr-only">Current step</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

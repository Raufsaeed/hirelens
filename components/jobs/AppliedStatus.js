import { CircleCheck, TriangleAlert } from "lucide-react";
import { APPLICATION_STATUSES } from "@/components/applications/ApplicationStatusBadge";
import Button from "@/components/ui/Button";
import { formatDay } from "@/lib/format-date";

// Shows a logged-in candidate that they already applied to a job (Features 07 and 08).
// Success colours for an application, warning colours once it was withdrawn. Never a score.
// application: { id, status, appliedAt, withdrawnAt } from lib/applications/applied-status.js.

const TONES = {
  applied: { border: "border-success", box: "border-success bg-success-bg text-success-text", icon: CircleCheck, iconColor: "text-success" },
  withdrawn: { border: "border-warning", box: "border-warning bg-warning-bg text-warning-text", icon: TriangleAlert, iconColor: "text-warning" },
};

function toneOf(application) {
  return application.status === "withdrawn" ? TONES.withdrawn : TONES.applied;
}

// The card border colour for the jobs list.
export function appliedBorder(application) {
  return application ? toneOf(application).border : "border-border";
}

// The strip across the top of a job card on the jobs list. The card's padding is p-4 / sm:p-6.
export function AppliedStrip({ application }) {
  const withdrawn = application.status === "withdrawn";
  const tone = toneOf(application);
  const Icon = tone.icon;
  return (
    <div className={`-mx-4 -mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-t-card border-b px-4 py-2.5 sm:-mx-6 sm:-mt-6 sm:px-6 ${tone.box}`}>
      <span className="label inline-flex items-center gap-1.5 font-bold">
        <Icon className={`size-icon-sm shrink-0 ${tone.iconColor}`} strokeWidth={1.75} aria-hidden="true" />
        {withdrawn ? "You withdrew your application" : "You applied to this job"}
      </span>
      <span className="small ml-auto">
        <span className="sr-only">{withdrawn ? "Withdrawn on " : "Applied on "}</span>
        {formatDay(withdrawn ? application.withdrawnAt || application.appliedAt : application.appliedAt)}
      </span>
    </div>
  );
}

// The large banner at the top of the job card on the job page.
export function AppliedBanner({ application }) {
  const withdrawn = application.status === "withdrawn";
  const tone = toneOf(application);
  const Icon = tone.icon;
  const status = APPLICATION_STATUSES[application.status] || APPLICATION_STATUSES.applied;
  return (
    <div className={`flex flex-col gap-4 rounded-control border p-4 sm:flex-row sm:items-center sm:p-5 ${tone.box}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-pill bg-surface ${tone.iconColor}`}>
          <Icon className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-bold">{withdrawn ? "You withdrew your application" : "You already applied to this job"}</p>
          <p className="small">
            {withdrawn
              ? `Withdrawn on ${formatDay(application.withdrawnAt || application.appliedAt)}. You can't apply to this job again.`
              : `Applied on ${formatDay(application.appliedAt)} · Status: ${status.candidateLabel || status.label}`}
          </p>
        </div>
      </div>
      <Button href={`/my-applications/${application.id}`} variant="secondary" className="w-full shrink-0 sm:w-auto">
        {withdrawn ? "View application" : "View my application"}
      </Button>
    </div>
  );
}

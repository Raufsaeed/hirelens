import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import CopyLinkButton from "@/components/jobs/CopyLinkButton";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import Badge from "@/components/ui/Badge";
import { jobTypeLabel } from "@/lib/jobs/constants";

// One job on the HR Dashboard: title, status, applicants (and new ones), deadline, Copy link.
export default function DashboardJobCard({ job }) {
  const meta = [
    job.location && { icon: MapPin, text: job.location },
    job.job_type && { icon: Briefcase, text: jobTypeLabel(job.job_type) },
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="card-title">{job.title}</h3>
          {meta.length > 0 && (
            <div className="small flex flex-wrap gap-x-4 gap-y-1.5 text-ink-muted">
              {meta.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Icon className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
        <JobStatusBadge status={job.status} closedReason={job.closed_reason} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {job.status === "draft" ? (
          <span className="small text-ink-muted">Not published yet</span>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span>
              <strong className="tabular-nums">{job.applicants}</strong>{" "}
              <span className="text-ink-muted">{job.applicants === 1 ? "applicant" : "applicants"}</span>
            </span>
            {job.newApplicants > 0 && <Badge tone="primary">{job.newApplicants} new</Badge>}
            <DeadlineLabel deadline={job.deadline} />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {job.status === "open" && job.slug && <CopyLinkButton slug={job.slug} />}
          {job.status === "draft" ? (
            <Button href={`/hr/jobs/${job.id}/edit`} variant="secondary" size="sm">
              Finish and publish
            </Button>
          ) : (
            <Button href={`/hr/candidates?job=${job.id}`} variant="secondary" size="sm" icon={ArrowRight}>
              Review candidates
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

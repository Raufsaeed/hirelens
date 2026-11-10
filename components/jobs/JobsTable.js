import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { Pencil } from "lucide-react";
import CopyLinkButton from "@/components/jobs/CopyLinkButton";
import Button from "@/components/ui/Button";
import JobStatusActions from "@/components/jobs/JobStatusActions";
import DeleteJobButton from "@/components/jobs/DeleteJobButton";
import Badge from "@/components/ui/Badge";
import { jobTypeLabel } from "@/lib/jobs/constants";

// My Jobs: every job of the company with status, applicants, Apply by and actions.
// On phones the table scrolls inside its own box, never the page (design/components/DataTable).
const TH = "label sticky top-0 border-b border-border bg-surface px-5 py-3 text-left whitespace-nowrap text-ink-muted";
const TD = "border-b border-border px-5 py-3 align-middle whitespace-nowrap";

export default function JobsTable({ jobs }) {
  return (
    <div
      role="region"
      aria-label="My jobs"
      tabIndex={0}
      className="overflow-x-auto rounded-card border border-border bg-surface shadow-card focus-visible:shadow-focus focus-visible:outline-none"
    >
      <table className="w-full border-collapse">
        <caption className="sr-only">My jobs</caption>
        <thead>
          <tr>
            <th scope="col" className={TH}>Job</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={TH}>Applicants</th>
            <th scope="col" className={TH}>New</th>
            <th scope="col" className={TH}>Apply by</th>
            <th scope="col" className={TH}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="transition-colors duration-(--duration-fast) ease-out last:[&>td]:border-b-0 hover:bg-surface-sunken">
              <td className={TD}>
                <strong className="block">{job.title}</strong>
                <span className="small text-ink-muted">
                  {[job.location, jobTypeLabel(job.job_type)].filter(Boolean).join(" · ") || "Details not added yet"}
                </span>
              </td>
              <td className={TD}>
                <JobStatusBadge status={job.status} closedReason={job.closed_reason} />
              </td>
              <td className={`${TD} font-bold tabular-nums`}>{job.applicants}</td>
              <td className={TD}>
                {job.newApplicants > 0 ? (
                  <Badge tone="primary">{job.newApplicants} new</Badge>
                ) : (
                  <span className="text-ink-muted tabular-nums">0</span>
                )}
              </td>
              <td className={TD}>
                {job.deadline ? <DeadlineLabel deadline={job.deadline} /> : <span className="text-ink-muted">–</span>}
              </td>
              <td className={TD}>
                <div className="flex items-center justify-end gap-1">
                  {job.status === "open" && job.slug && <CopyLinkButton slug={job.slug} iconOnly />}
                  <Button
                    href={`/hr/jobs/${job.id}/edit`}
                    variant="ghost"
                    size="icon"
                    icon={Pencil}
                    aria-label="Edit job"
                  />
                  <JobStatusActions
                    job={{ id: job.id, title: job.title, status: job.status }}
                    needsNewDate={job.needsNewDate}
                  />
                  <DeleteJobButton jobId={job.id} isDraft={job.status === "draft"} hasApplicants={job.applicants > 0} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

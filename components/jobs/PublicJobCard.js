import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppliedStrip, appliedBorder } from "@/components/jobs/AppliedStatus";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import JobMeta from "@/components/jobs/JobMeta";

// One open job on the public jobs list. Titles and company names wrap, never truncate.
// action: an optional button (Save, Feature 21), kept above the card's full-size link.
// application: the logged-in candidate's application to this job, if any (applied strip on top).
export default function PublicJobCard({ job, action, application = null }) {
  return (
    <article className={`relative flex flex-col gap-4 rounded-card border ${appliedBorder(application)} bg-surface p-4 shadow-card transition-[transform,box-shadow] duration-(--duration-fast) ease-out hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0 sm:p-6`}>
      {application && <AppliedStrip application={application} />}
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.companies} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="card-title [overflow-wrap:anywhere]">
            <Link
              href={`/jobs/${job.slug}`}
              className="rounded-sm text-ink no-underline after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-primary focus-visible:shadow-focus focus-visible:outline-none"
            >
              {job.title}
            </Link>
          </h3>
          <span className="text-ink-muted [overflow-wrap:anywhere]">{job.companies?.name}</span>
        </div>
      </div>
      <JobMeta job={job} />
      {job.requirements?.length > 0 && (
        <ul aria-label="Requirements" className="flex flex-wrap gap-2">
          {job.requirements.slice(0, 5).map((requirement) => (
            <li
              key={requirement.name}
              className="label inline-flex min-h-7 max-w-full items-center rounded-pill bg-surface-sunken px-3 py-0.5 text-neutral-text [overflow-wrap:anywhere]"
            >
              {requirement.name}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DeadlineLabel deadline={job.deadline} />
        {action && <div className="relative z-10 ml-auto">{action}</div>}
        <span aria-hidden="true" className={`${action ? "" : "ml-auto "}inline-flex items-center gap-1 font-bold text-primary`}>
          View job
          <ArrowRight className="size-icon-sm" strokeWidth={1.75} />
        </span>
      </div>
    </article>
  );
}

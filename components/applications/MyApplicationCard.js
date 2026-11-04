import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import { formatDay } from "@/lib/format-date";

// One application on My Applications: job, company, applied date and status. Never a score.
export default function MyApplicationCard({ application }) {
  const job = application.jobs;
  return (
    <article className="relative flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card transition-[transform,box-shadow] duration-(--duration-fast) ease-out hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
      <CompanyLogo company={job?.companies} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="card-title [overflow-wrap:anywhere]">
          <Link
            href={`/my-applications/${application.id}`}
            className="rounded-sm text-ink no-underline after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-primary focus-visible:shadow-focus focus-visible:outline-none"
          >
            {job?.title}
          </Link>
        </h2>
        <span className="small text-ink-muted [overflow-wrap:anywhere]">
          {job?.companies?.name} · Applied on {formatDay(application.applied_at)}
        </span>
        <ApplicationStatusBadge status={application.status} forCandidate />
      </div>
      <ChevronRight className="size-icon-md shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
    </article>
  );
}

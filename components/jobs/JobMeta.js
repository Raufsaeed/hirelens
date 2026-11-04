import { Award, Briefcase, GraduationCap, MapPin } from "lucide-react";
import { jobTypeLabel } from "@/lib/jobs/constants";

// Location, job type, experience and degree with their icons (design/components/JobCard).
export function yearsLabel(years) {
  if (years === null || years === undefined) return null;
  if (years === 0) return "No experience needed";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export default function JobMeta({ job }) {
  const items = [
    job.location && { icon: MapPin, text: job.location },
    job.job_type && { icon: Briefcase, text: jobTypeLabel(job.job_type) },
    yearsLabel(job.required_years) && { icon: Award, text: yearsLabel(job.required_years) },
    job.required_degree && { icon: GraduationCap, text: job.required_degree },
  ].filter(Boolean);

  return (
    <div className="small flex flex-wrap gap-x-4 gap-y-1.5 text-ink-muted">
      {items.map(({ icon: Icon, text }) => (
        <span key={text} className="inline-flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
          <Icon className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {text}
        </span>
      ))}
    </div>
  );
}

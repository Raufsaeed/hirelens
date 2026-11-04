import { CalendarClock, CalendarX, Clock, Link2, MapPin } from "lucide-react";
import { formatDayTime } from "@/lib/format-date";

// The candidate's interview on Application Detail (Feature 16): date, time, duration and the
// meeting link or address, or "Interview cancelled". Never feedback, scores or HR notes.
export default function InterviewDetails({ interview }) {
  const cancelled = interview.status === "cancelled";
  return (
    <section
      aria-label="Interview details"
      className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 className="section-heading">Interview</h2>
      {cancelled ? (
        <p className="flex items-start gap-2 font-medium text-muted-text">
          <CalendarX className="mt-0.5 size-icon-md shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>
            Interview cancelled
            <span className="small block font-normal text-ink-muted">
              It was planned for {formatDayTime(interview.scheduled_at)}. The company will contact you if it is moved.
            </span>
          </span>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-2 font-bold">
            <CalendarClock className="size-icon-md shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            {formatDayTime(interview.scheduled_at)}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-icon-md shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
            {interview.duration_minutes} minutes
          </li>
          {interview.meeting_link && (
            <li className="flex min-w-0 items-start gap-2">
              <Link2 className="mt-0.5 size-icon-md shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
              <a
                href={interview.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-touch min-w-0 items-center font-medium text-primary [overflow-wrap:anywhere] hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                {interview.meeting_link}
              </a>
            </li>
          )}
          {interview.location && (
            <li className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 size-icon-md shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
              <span className="[overflow-wrap:anywhere]">{interview.location}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

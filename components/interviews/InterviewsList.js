"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarX, Link2, MapPin, MessageSquareText, User } from "lucide-react";
import FeedbackDialog from "@/components/interviews/FeedbackDialog";
import InterviewStatusBadge from "@/components/interviews/InterviewStatusBadge";
import ScheduleInterviewDialog from "@/components/interviews/ScheduleInterviewDialog";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import TextLink from "@/components/ui/TextLink";
import Toast from "@/components/ui/Toast";
import { cancelInterview } from "@/lib/interviews/actions";
import { formatDayTime } from "@/lib/format-date";

// Upcoming and past interviews on the Interviews page (Feature 16), with Reschedule and Cancel on
// upcoming ones and "Add feedback" on past ones that are still scheduled (Feature 17).

function InterviewRow({ interview, onReschedule, onCancel, onFeedback }) {
  const scheduled = interview.status === "scheduled";
  return (
    <li className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <TextLink href={`/hr/candidates/${interview.applicationId}`} className="font-bold [overflow-wrap:anywhere]">
          {interview.candidateName}
        </TextLink>
        <span className="small text-ink-muted [overflow-wrap:anywhere]">{interview.jobTitle}</span>
        <span className="small flex flex-wrap items-center gap-x-4 gap-y-1 text-ink">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CalendarClock className="size-icon-sm shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            {formatDayTime(interview.scheduledAt)} · {interview.durationMinutes} minutes
          </span>
          {interview.interviewerName && (
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <User className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {interview.interviewerName}
            </span>
          )}
          {interview.meetingLink && (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted">
              <Link2 className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="[overflow-wrap:anywhere]">Online</span>
            </span>
          )}
          {interview.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted">
              <MapPin className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="[overflow-wrap:anywhere]">{interview.location}</span>
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <InterviewStatusBadge status={interview.status} />
        {scheduled && onFeedback && (
          <Button size="sm" variant="secondary" icon={MessageSquareText} onClick={() => onFeedback(interview)}>
            Add feedback
          </Button>
        )}
        {scheduled && onReschedule && (
          <>
            <Button size="sm" variant="secondary" icon={CalendarClock} onClick={() => onReschedule(interview)}>
              Reschedule
            </Button>
            <Button size="sm" variant="danger-ghost" icon={CalendarX} onClick={() => onCancel(interview)}>
              Cancel interview
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

function Section({ title, interviews, empty, ...actions }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="section-heading">{title}</h2>
      {interviews.length === 0 ? (
        <p className="small rounded-card border border-dashed border-border-control p-4 text-center text-ink-muted">{empty}</p>
      ) : (
        <ul className="rounded-card border border-border bg-surface shadow-card">
          {interviews.map((interview) => (
            <InterviewRow key={interview.id} interview={interview} {...actions} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function InterviewsList({ upcoming, past }) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [giving, setGiving] = useState(null); // the interview getting feedback
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  async function confirmCancel() {
    setBusy(true);
    const result = await cancelInterview(cancelling.id).catch(() => ({ error: true }));
    setBusy(false);
    setCancelling(null);
    if (result.error) {
      setToast({ tone: "error", message: "Something went wrong, please try again" });
      return;
    }
    setToast({ tone: "success", message: "Interview cancelled" });
    router.refresh();
  }

  return (
    <>
      <Section
        title="Upcoming interviews"
        interviews={upcoming}
        empty="No upcoming interviews."
        onReschedule={setRescheduling}
        onCancel={setCancelling}
      />
      <Section title="Past interviews" interviews={past} empty="No past interviews yet." onFeedback={setGiving} />

      {giving && (
        <FeedbackDialog
          interviewId={giving.id}
          candidateName={giving.candidateName}
          onClose={() => setGiving(null)}
          onSaved={() => {
            setGiving(null);
            setToast({ tone: "success", message: "Feedback saved" });
            router.refresh();
          }}
        />
      )}

      {rescheduling && (
        <ScheduleInterviewDialog
          applicationId={rescheduling.applicationId}
          candidateName={rescheduling.candidateName}
          interview={rescheduling}
          onClose={() => setRescheduling(null)}
          onSaved={() => {
            setRescheduling(null);
            setToast({ tone: "success", message: "Interview updated" });
            router.refresh();
          }}
        />
      )}

      <Dialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        icon={CalendarX}
        tone="danger"
        title={cancelling ? `Cancel the interview with ${cancelling.candidateName}?` : ""}
        actions={
          <>
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Keep it
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmCancel}>
              Cancel interview
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">They will see &quot;Interview cancelled&quot; on My Applications.</p>
      </Dialog>

      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

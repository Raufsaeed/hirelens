"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, MessageSquareText, Star } from "lucide-react";
import FeedbackDialog from "@/components/interviews/FeedbackDialog";
import InterviewStatusBadge from "@/components/interviews/InterviewStatusBadge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { formatDayTime } from "@/lib/format-date";
import { recommendationLabel } from "@/lib/interviews/feedback";

// The Interviews section on Candidate Detail (HR only, Features 16 and 17): each interview with its
// feedback, or "Add feedback" once a scheduled interview has started.
export default function CandidateInterviews({ candidateName, interviews }) {
  const router = useRouter();
  const [giving, setGiving] = useState(null);
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  return (
    <section aria-label="Interviews" className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <h2 className="card-title">Interviews</h2>
      <ul className="flex flex-col gap-4">
        {interviews.map((interview) => {
          const feedback = interview.feedback;
          return (
            <li key={interview.id} className="flex flex-col gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <CalendarClock className="size-icon-sm shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  {formatDayTime(interview.scheduled_at)}
                </span>
                <InterviewStatusBadge status={interview.status} />
                {interview.interviewer_name && <span className="small text-ink-muted">with {interview.interviewer_name}</span>}
              </div>
              {feedback && (
                <dl className="grid gap-2 rounded-control bg-surface-page p-3 text-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4">
                  <dt className="font-bold">Rating</dt>
                  <dd className="inline-flex items-center gap-1.5">
                    <Star className="size-icon-sm text-primary" strokeWidth={1.75} aria-hidden="true" />
                    {feedback.rating} out of 5
                  </dd>
                  {feedback.strengths && (
                    <>
                      <dt className="font-bold">Strengths</dt>
                      <dd className="whitespace-pre-line [overflow-wrap:anywhere]">{feedback.strengths}</dd>
                    </>
                  )}
                  {feedback.concerns && (
                    <>
                      <dt className="font-bold">Concerns</dt>
                      <dd className="whitespace-pre-line [overflow-wrap:anywhere]">{feedback.concerns}</dd>
                    </>
                  )}
                  <dt className="font-bold">Advice</dt>
                  <dd>
                    Recommends: {recommendationLabel(feedback.recommendation)}
                    <span className="small block text-ink-muted">Advice only. You move the candidate on the Pipeline.</span>
                  </dd>
                </dl>
              )}
              {interview.canGiveFeedback && (
                <Button size="sm" variant="secondary" icon={MessageSquareText} className="self-start" onClick={() => setGiving(interview)}>
                  Add feedback
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {giving && (
        <FeedbackDialog
          interviewId={giving.id}
          candidateName={candidateName}
          onClose={() => setGiving(null)}
          onSaved={() => {
            setGiving(null);
            setToast({ tone: "success", message: "Feedback saved" });
            router.refresh();
          }}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </section>
  );
}

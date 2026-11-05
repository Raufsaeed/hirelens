"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CalendarClock, CircleSlash, GripVertical, PartyPopper, Undo2 } from "lucide-react";
import { APPLICATION_STATUSES } from "@/components/applications/ApplicationStatusBadge";
import ScoreRing from "@/components/candidates/ScoreRing";
import ScheduleInterviewDialog from "@/components/interviews/ScheduleInterviewDialog";
import Avatar from "@/components/nav/Avatar";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Toast from "@/components/ui/Toast";
import { INPUT_CLASSES } from "@/components/ui/TextField";
import { moveApplication } from "@/lib/applications/status-actions";
import { formatDayTime } from "@/lib/format-date";

// Pipeline board for one job (Feature 15). Cards move by drag and drop or with the "Move to" select
// (keyboard and phone). Hired and Rejected confirm first. A failed save puts the card back.
// Withdrawn candidates are greyed out and can't be moved. AI never moves a card.
// Moving to Interview opens the schedule form (Feature 16); the move is saved with the interview.

const COLUMNS = ["applied", "shortlisted", "interview", "offer", "hired", "rejected"];
const NEEDS_CONFIRM = ["hired", "rejected"];
const MOVE_ERROR = "Couldn't move this candidate, try again";

function label(status) {
  return APPLICATION_STATUSES[status].label;
}

function daysLabel(days) {
  if (days === 0) return "Applied today";
  return `Applied ${days} ${days === 1 ? "day" : "days"} ago`;
}

function PipelineCard({ card, onMove, onDragStart }) {
  const withdrawn = card.status === "withdrawn";
  return (
    <article
      draggable={!withdrawn}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        onDragStart(card.id);
      }}
      data-withdrawn={withdrawn}
      className={`flex flex-col gap-3 rounded-control border bg-surface p-3 shadow-card transition-[transform,box-shadow] duration-(--duration-fast) ease-out ${
        withdrawn
          ? "cursor-not-allowed border-dashed border-border-control opacity-60"
          : "cursor-grab border-border hover:shadow-card-hover active:cursor-grabbing"
      }`}
    >
      <div className="flex items-start gap-2">
        {!withdrawn && <GripVertical className="mt-2 size-icon-sm shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />}
        <Avatar name={card.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            href={`/hr/candidates/${card.id}`}
            className="font-bold text-ink no-underline [overflow-wrap:anywhere] hover:text-primary focus-visible:shadow-focus focus-visible:outline-none"
          >
            {card.name}
          </Link>
          <span className="small text-ink-muted">{daysLabel(card.daysSinceApplying)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {card.score !== null ? <ScoreRing score={card.score} /> : <span className="small text-ink-muted">No score yet</span>}
      </div>
      {card.column === "interview" && card.nextInterview && (
        <span className="small inline-flex items-center gap-1.5 font-medium text-ink">
          <CalendarClock className="size-icon-sm shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">Interview </span>
          {formatDayTime(card.nextInterview)}
        </span>
      )}
      {withdrawn && (
        <span className="small inline-flex items-center gap-1.5 font-medium text-muted-text">
          <Undo2 className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
          This candidate has withdrawn
        </span>
      )}
      <label className="sr-only" htmlFor={`move-${card.id}`}>
        Move {card.name} to
      </label>
      <select
        id={`move-${card.id}`}
        value={withdrawn ? "withdrawn" : card.status}
        disabled={withdrawn}
        onChange={(event) => onMove(card, event.target.value)}
        className={`${INPUT_CLASSES} cursor-pointer text-[13px]`}
      >
        {withdrawn && <option value="withdrawn">Withdrawn</option>}
        {COLUMNS.map((status) => (
          <option key={status} value={status}>
            {label(status)}
          </option>
        ))}
      </select>
    </article>
  );
}

export default function PipelineBoard({ initialCards, interviewerName }) {
  const [cards, setCards] = useState(initialCards);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [confirm, setConfirm] = useState(null); // { card, toStatus }
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(null); // the card moving to Interview
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  // Moves the card straight away, then saves; if saving fails, the card goes back.
  async function save(card, toStatus) {
    const before = cards;
    setCards((current) =>
      current.map((item) => (item.id === card.id ? { ...item, status: toStatus, column: toStatus } : item))
    );
    let result;
    try {
      result = await moveApplication(card.id, toStatus);
    } catch {
      result = { error: MOVE_ERROR };
    }
    if (result.error) {
      setCards(before);
      setToast({ tone: "error", message: result.error });
    } else {
      setToast({ tone: "success", message: `${card.name} moved to ${label(toStatus)}` });
    }
  }

  function requestMove(card, toStatus) {
    if (card.status === "withdrawn" || card.status === toStatus) return;
    if (toStatus === "interview") setScheduling(card);
    else if (NEEDS_CONFIRM.includes(toStatus)) setConfirm({ card, toStatus });
    else save(card, toStatus);
  }

  async function confirmMove() {
    setSaving(true);
    await save(confirm.card, confirm.toStatus);
    setSaving(false);
    setConfirm(null);
  }

  // The interview is saved and the candidate moved on the server: show the card in Interview.
  function scheduled(result) {
    const card = scheduling;
    setScheduling(null);
    setCards((current) =>
      current.map((item) =>
        item.id === card.id
          ? { ...item, status: "interview", column: "interview", nextInterview: result.interview.scheduled_at }
          : item
      )
    );
    setToast({ tone: "success", message: `Interview scheduled · ${card.name} moved to Interview` });
  }

  const rejecting = confirm?.toStatus === "rejected";

  return (
    <>
      <div
        role="region"
        aria-label="Pipeline board"
        tabIndex={0}
        className="overflow-x-auto pb-2 focus-visible:shadow-focus focus-visible:outline-none"
      >
        <div className="grid min-w-[1080px] grid-cols-6 gap-3">
          {COLUMNS.map((status) => {
            const inColumn = cards.filter((card) => card.column === status);
            return (
              <section
                key={status}
                aria-label={`${label(status)} column`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDropTarget(null);
                  const card = cards.find((item) => item.id === (event.dataTransfer.getData("text/plain") || draggingId));
                  if (card) requestMove(card, status);
                }}
                className={`flex min-h-80 flex-col gap-3 rounded-card p-3 transition-colors duration-(--duration-fast) ease-out ${
                  dropTarget === status ? "bg-primary-tint" : "bg-surface-column"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="label text-ink">{label(status)}</h2>
                  <span className="label rounded-pill bg-surface px-2 py-0.5 text-ink-muted tabular-nums">{inColumn.length}</span>
                </div>
                {inColumn.length === 0 ? (
                  <p className="small rounded-[12px] border-[1.5px] border-dashed border-border-control p-4 text-center text-ink-muted">
                    No candidates yet
                  </p>
                ) : (
                  inColumn.map((card) => (
                    <PipelineCard key={card.id} card={card} onMove={requestMove} onDragStart={setDraggingId} />
                  ))
                )}
              </section>
            );
          })}
        </div>
      </div>

      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        icon={rejecting ? CircleSlash : PartyPopper}
        tone={rejecting ? "danger" : "primary"}
        title={confirm ? (rejecting ? `Reject ${confirm.card.name}?` : `Move ${confirm.card.name} to Hired?`) : ""}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant={rejecting ? "danger" : "primary"} loading={saving} onClick={confirmMove}>
              {rejecting ? "Reject candidate" : "Move to Hired"}
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">
          {rejecting
            ? "They will see \"Not selected\" on My Applications."
            : "They will see Hired on My Applications."}
        </p>
      </Dialog>

      {scheduling && (
        <ScheduleInterviewDialog
          applicationId={scheduling.id}
          candidateName={scheduling.name}
          defaultInterviewer={interviewerName}
          onClose={() => setScheduling(null)}
          onSaved={scheduled}
        />
      )}

      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

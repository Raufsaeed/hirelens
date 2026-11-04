"use client";

import { useCallback, useState } from "react";
import { Code2, FolderGit2, Lightbulb, MessageSquareText, Plus, RefreshCw, Sparkles, Target, Trash2, XCircle } from "lucide-react";
import AiNote from "@/components/candidates/AiNote";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { formatDayTime } from "@/lib/format-date";
import { addQuestion, deleteQuestion, generateQuestions } from "@/lib/interviews/question-actions";
import { MAX_HINT_LENGTH, MAX_QUESTION_LENGTH, QUESTION_TYPES, QUESTIONS_FAILED, validateOwnQuestion } from "@/lib/interviews/questions";

// Interview Questions panel on Candidate Detail (Feature 18), HR only. AI suggests eight questions
// for the candidate's scheduled interview; HR deletes, adds and regenerates. Every change is saved.

const TYPE_ICONS = { technical: Code2, behavioural: MessageSquareText, project: FolderGit2 };
const SAVE_ERROR = "Something went wrong, please try again";

function QuestionCard({ item, onDelete, deleting }) {
  const fromMissing = /\(missing\)\s*$/i.test(item.focus || "");
  return (
    <li className="flex flex-col gap-2 rounded-control border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[17px] leading-6 font-bold [overflow-wrap:anywhere]">{item.question}</p>
        <Button
          size="icon"
          variant="danger-ghost"
          icon={Trash2}
          loading={deleting}
          onClick={() => onDelete(item)}
          aria-label="Delete"
          title="Delete question"
        />
      </div>
      {item.good_answer_hint && (
        <p className="small flex items-start gap-2 rounded-control bg-surface-page p-2.5 text-ink">
          <Lightbulb className="mt-0.5 size-icon-sm shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span>
            <strong>What a good answer includes:</strong> {item.good_answer_hint}
          </span>
        </p>
      )}
      <div className="small flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-muted">
        {item.focus && (
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {item.focus}
          </span>
        )}
        {fromMissing && (
          <span className="inline-flex items-center gap-1.5 text-warning-text">
            <XCircle className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
            From a missing requirement
          </span>
        )}
        {item.source === "hr" && <span>Added by you</span>}
      </div>
    </li>
  );
}

function AddQuestionForm({ interviewId, onAdded }) {
  const [values, setValues] = useState({ question: "", type: "", hint: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(name) {
    return (event) => {
      setValues((current) => ({ ...current, [name]: event.target.value }));
      setError(null);
    };
  }

  async function add(event) {
    event.preventDefault();
    const invalid = validateOwnQuestion(values);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    const result = await addQuestion(interviewId, values).catch(() => ({ error: SAVE_ERROR }));
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setValues({ question: "", type: "", hint: "" });
    onAdded(result.question);
  }

  return (
    <form noValidate onSubmit={add} className="flex flex-col gap-3 rounded-control border border-dashed border-border-control p-3 sm:p-4">
      <h3 className="label text-ink">Add your own question</h3>
      <TextField id="own-question" label="Your question" maxLength={MAX_QUESTION_LENGTH} value={values.question} onChange={set("question")} />
      <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
        <SelectField id="own-question-type" label="Question type" options={QUESTION_TYPES} placeholder="Choose a type" value={values.type} onChange={set("type")} />
        <TextField
          id="own-question-hint"
          label={
            <>
              Good answer hint <span className="font-medium text-ink-muted">(optional)</span>
            </>
          }
          maxLength={MAX_HINT_LENGTH}
          value={values.hint}
          onChange={set("hint")}
        />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" variant="secondary" icon={Plus} loading={saving} className="self-start">
        Add question
      </Button>
    </form>
  );
}

// interview: { id, scheduled_at } of the scheduled interview, or null. screeningDone: the CV screening finished.
export default function InterviewQuestionsPanel({ interview, screeningDone, initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [writing, setWriting] = useState(false);
  const [failed, setFailed] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  const blocked = !interview ? "Schedule an interview first" : !screeningDone ? "Questions need a finished CV screening" : null;
  const hasAi = questions.some((item) => item.source === "ai");

  async function generate() {
    setConfirming(false);
    setWriting(true);
    setFailed(null);
    const result = await generateQuestions(interview.id).catch(() => ({ error: QUESTIONS_FAILED }));
    setWriting(false);
    if (result.error) setFailed(result.error);
    else setQuestions(result.questions);
  }

  async function remove(item) {
    setDeletingId(item.id);
    const result = await deleteQuestion(item.id).catch(() => ({ error: SAVE_ERROR }));
    setDeletingId(null);
    if (result.error) {
      setToast({ tone: "error", message: result.error });
      return;
    }
    setQuestions((current) => current.filter((other) => other.id !== item.id));
    setToast({ tone: "success", message: "Question deleted" });
  }

  return (
    <section aria-label="Interview questions" className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="card-title">Interview questions</h2>
          {interview && <p className="small text-ink-muted">For the interview on {formatDayTime(interview.scheduled_at)}</p>}
        </div>
        <Button
          variant="secondary"
          icon={hasAi ? RefreshCw : Sparkles}
          loading={writing}
          disabled={Boolean(blocked)}
          aria-describedby={blocked ? "questions-blocked" : undefined}
          onClick={() => (hasAi ? setConfirming(true) : generate())}
        >
          {hasAi ? "Regenerate" : "Generate questions"}
        </Button>
      </div>
      {blocked && (
        <p id="questions-blocked" className="small text-ink-muted">
          {blocked}
        </p>
      )}

      <div aria-live="polite" className="flex flex-col gap-3">
        {writing && (
          <p className="small flex items-center gap-2 text-on-primary-tint">
            <span aria-hidden="true" className="size-4 animate-spin rounded-pill border-2 border-current border-r-transparent motion-reduce:animate-none" />
            Writing questions…
          </p>
        )}
        {failed && !writing && (
          <Alert
            tone="error"
            title={failed}
            action={
              failed === QUESTIONS_FAILED && (
                <Button size="sm" variant="secondary" icon={RefreshCw} onClick={generate}>
                  Retry
                </Button>
              )
            }
          >
            {failed === QUESTIONS_FAILED ? "Your saved questions are kept. You can still add your own." : null}
          </Alert>
        )}
      </div>

      {hasAi && <AiNote>AI suggests these questions from the job and the CV. You decide what to ask.</AiNote>}

      {QUESTION_TYPES.map((type) => {
        const group = questions.filter((item) => item.type === type.value).sort((a, b) => a.position - b.position);
        if (group.length === 0) return null;
        const Icon = TYPE_ICONS[type.value];
        return (
          <div key={type.value} className="flex flex-col gap-2">
            <h3 className="label inline-flex items-center gap-1.5 text-ink">
              <Icon className="size-icon-sm text-primary" strokeWidth={1.75} aria-hidden="true" />
              {type.label} ({group.length})
            </h3>
            <ul aria-label={`${type.label} questions`} className="flex flex-col gap-2">
              {group.map((item) => (
                <QuestionCard key={item.id} item={item} onDelete={remove} deleting={deletingId === item.id} />
              ))}
            </ul>
          </div>
        );
      })}

      {interview && (
        <AddQuestionForm
          interviewId={interview.id}
          onAdded={(question) => {
            setQuestions((current) => [...current, question]);
            setToast({ tone: "success", message: "Question added" });
          }}
        />
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        icon={RefreshCw}
        title="Replace the AI questions?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button icon={RefreshCw} onClick={generate}>
              Replace questions
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">AI writes eight new questions. Questions you added yourself are kept.</p>
      </Dialog>

      <Toast toast={toast} onDismiss={dismiss} />
    </section>
  );
}

"use client";

import { useState } from "react";
import { Check, Lightbulb, RefreshCw, Sparkles, X } from "lucide-react";
import AiNote from "@/components/candidates/AiNote";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import TextAreaField from "@/components/ui/TextAreaField";
import { TOO_LITTLE_INPUT } from "@/lib/jobs/jd-check";
import { writeJobDescription } from "@/lib/jobs/jd-writer";

// "Write with AI" on the Create Job form (Feature 05). The draft goes into the description box for
// HR to edit. Suggested requirements are added only when HR accepts them. Nothing is saved here.
// form: the job form values plus requirements. onDraft(text) fills the description box.
// onAccept(requirement) adds a suggestion to the requirements.
export default function AiDescriptionWriter({ form, onDraft, onAccept }) {
  const [keyPoints, setKeyPoints] = useState("");
  const [lastDraft, setLastDraft] = useState(null); // the text AI wrote last, to spot HR's edits
  const [suggestions, setSuggestions] = useState([]);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const canWrite = form.title.trim() !== "" && (keyPoints.trim() !== "" || form.requirements.length > 0);
  const description = form.description.trim();
  const edited = description !== "" && description !== lastDraft?.trim();

  async function write() {
    setConfirming(false);
    setWriting(true);
    setError(null);
    const result = await writeJobDescription({ ...form, keyPoints }).catch(() => ({ error: true }));
    setWriting(false);
    if (result.error || !result.description) {
      setError(true);
      return;
    }
    setLastDraft(result.description);
    setSuggestions(result.suggestions);
    onDraft(result.description);
  }

  // Asks before replacing text HR typed or changed.
  function handleClick() {
    if (edited) setConfirming(true);
    else write();
  }

  function accept(suggestion) {
    onAccept(suggestion);
    setSuggestions((current) => current.filter((item) => item !== suggestion));
  }

  return (
    <section className="flex flex-col gap-3 rounded-control border border-border bg-surface-page p-4">
      <TextAreaField
        id="keyPoints"
        label={
          <>
            Key points <span className="font-medium text-ink-muted">(for Write with AI, not saved)</span>
          </>
        }
        rows={2}
        maxLength={1000}
        value={keyPoints}
        onChange={(event) => setKeyPoints(event.target.value)}
        placeholder="Small friendly team, hybrid in Lahore"
        hint="AI uses these, the title and your requirements. It never adds requirements you didn't give."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          icon={lastDraft ? RefreshCw : Sparkles}
          onClick={handleClick}
          disabled={!canWrite || writing}
          aria-describedby={canWrite ? undefined : "write-with-ai-hint"}
        >
          {lastDraft ? "Regenerate" : "Write with AI"}
        </Button>
        {!canWrite && (
          <p id="write-with-ai-hint" className="small text-ink-muted">
            {TOO_LITTLE_INPUT}
          </p>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {writing && (
          <p className="small flex items-center gap-2 text-on-primary-tint">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-pill border-2 border-current border-r-transparent motion-reduce:animate-none"
            />
            Writing description…
          </p>
        )}
        {error && !writing && (
          <Alert tone="error">Couldn&apos;t write a description right now. You can write it yourself or try again</Alert>
        )}
        {lastDraft && !writing && (
          <AiNote title="Review and edit before publishing.">
            AI wrote this draft from your details. The final text is yours, and nothing is published until you click
            Publish.
          </AiNote>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label text-ink">Suggested requirements</p>
          <ul aria-label="Suggested requirements" className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.name}
                className="flex flex-wrap items-center gap-2 rounded-control border border-dashed border-border-control bg-surface px-3 py-2"
              >
                <Badge tone="amber" icon={Lightbulb}>
                  Suggestion
                </Badge>
                <span className="min-w-0 flex-1 font-bold [overflow-wrap:anywhere]">
                  {suggestion.name}
                  <span className="small font-medium text-ink-muted">
                    {" "}
                    · {suggestion.type === "must" ? "must have" : "nice to have"}
                  </span>
                </span>
                <Button size="sm" variant="secondary" icon={Check} onClick={() => accept(suggestion)} aria-label={`Accept ${suggestion.name}`}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={X}
                  onClick={() => setSuggestions((current) => current.filter((item) => item !== suggestion))}
                  aria-label={`Remove suggestion ${suggestion.name}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        icon={RefreshCw}
        title="Replace your edited text with a new draft?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button icon={RefreshCw} onClick={write}>
              Replace
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">Your changes to the description will be lost.</p>
      </Dialog>
    </section>
  );
}

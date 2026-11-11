"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextAreaField from "@/components/ui/TextAreaField";
import { addNote } from "@/lib/candidates/notes-actions";
import { validateNote } from "@/lib/candidates/note-validation";
import { formatDayTime } from "@/lib/format-date";

// HR-only notes on a candidate, newest first, each with the author's name and time (Feature 14).
export default function NotesPanel({ applicationId, notes }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    // The same checks run in the browser first, so a blocked note never reaches the server.
    const invalid = validateNote(body);
    if (invalid) {
      setResult({ error: invalid });
      return;
    }
    startTransition(async () => {
      const outcome = await addNote(applicationId, body);
      setResult(outcome);
      if (outcome.message) {
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <StickyNote className="size-icon-md text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
        <h2 className="card-title">Notes</h2>
        <span className="small ml-auto text-ink-muted">Only HR can see these</span>
      </div>

      {notes.length === 0 ? (
        <p className="text-ink-muted">No notes yet</p>
      ) : (
        <ul aria-label="Notes" className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-control bg-surface-sunken p-3">
              <p className="whitespace-pre-line [overflow-wrap:anywhere]">{note.body}</p>
              <p className="small text-ink-muted">
                {note.author_name} · {formatDayTime(note.created_at)}
                {note.is_manual_review ? " · Manual CV review" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <TextAreaField
        id="newNote"
        label="New note"
        rows={3}
        placeholder="What stood out, what to ask in the interview…"
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setResult(null);
        }}
        error={result?.error}
      />
      <Button variant="secondary" className="self-start" loading={isPending} onClick={save}>
        Add note
      </Button>
      {result?.message && <Alert tone="success">{result.message}</Alert>}
    </section>
  );
}

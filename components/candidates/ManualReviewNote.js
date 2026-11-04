"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextAreaField from "@/components/ui/TextAreaField";
import { addNote } from "@/lib/candidates/notes-actions";

// For a CV that could not be read: HR reads it by hand and saves a note (is_manual_review).
export default function ManualReviewNote({ applicationId }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const outcome = await addNote(applicationId, body, { manualReview: true });
      setResult(outcome);
      if (outcome.message) {
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <TextAreaField
        id="manualReview"
        label="Manual review note"
        rows={3}
        placeholder="What you found when reading the CV yourself."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        error={result?.error}
      />
      <Button variant="secondary" className="self-start" loading={isPending} onClick={save}>
        Save note
      </Button>
      {result?.message && <Alert tone="success">{result.message}</Alert>}
    </div>
  );
}

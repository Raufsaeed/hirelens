"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { useJobsToast } from "@/components/jobs/JobsToast";
import { deleteDraftJob } from "@/lib/jobs/delete-actions";

// Trash icon on a draft row of My Jobs. Asks first, then deletes the draft and refreshes the list.
export default function DeleteDraftButton({ jobId }) {
  const router = useRouter();
  const showToast = useJobsToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteDraftJob(jobId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      showToast({ tone: "success", message: result.message });
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label="Delete draft" onClick={openDialog} />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        icon={Trash2}
        tone="danger"
        title="Delete this draft?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} loading={isPending} onClick={remove}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">This can&apos;t be undone.</p>
        {error && <p role="alert" className="small font-medium text-danger-text">{error}</p>}
      </Dialog>
    </>
  );
}

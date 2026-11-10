"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { useJobsToast } from "@/components/jobs/JobsToast";
import { deleteJob } from "@/lib/jobs/delete-actions";

const HAS_APPLICANTS_TOOLTIP = "This job has applicants. Close it instead.";

// Trash icon on every row of My Jobs. Drafts and jobs with no applicants can be deleted after
// confirming; a job with applicants shows the icon disabled with a tooltip.
export default function DeleteJobButton({ jobId, isDraft, hasApplicants }) {
  const router = useRouter();
  const showToast = useJobsToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const label = isDraft ? "Delete draft" : "Delete job";

  if (!isDraft && hasApplicants) {
    // A disabled button shows no tooltip itself, so the wrapper carries it.
    return (
      <span title={HAS_APPLICANTS_TOOLTIP} className="inline-flex">
        <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label={label} disabled />
      </span>
    );
  }

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteJob(jobId);
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
      <Button variant="danger-ghost" size="icon" icon={Trash2} aria-label={label} onClick={openDialog} />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        icon={Trash2}
        tone="danger"
        title={isDraft ? "Delete this draft?" : "Delete this job?"}
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

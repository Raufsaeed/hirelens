"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Lock, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { closeJob, reopenJob } from "@/lib/jobs/status-actions";
import { pakistanToday } from "@/lib/jobs/dates";

// Close (after confirming) and Reopen for one job on My Jobs (Feature 04).
// needsNewDate: a deadline-closed job must get a new future Apply by date to reopen.
export default function JobStatusActions({ job, needsNewDate }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState(null); // "close" | "reopen" | null
  const [newDate, setNewDate] = useState("");
  const [dialogError, setDialogError] = useState(null);
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function openDialog(kind) {
    setDialogError(null);
    setNewDate("");
    setDialog(kind);
  }

  function run(action) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        if (dialog) setDialogError(result.error);
        else setToast({ tone: "error", message: result.error });
        return;
      }
      setDialog(null);
      setToast({ tone: "success", message: result.message });
      router.refresh();
    });
  }

  return (
    <>
      {job.status === "open" && (
        <Button variant="ghost" size="sm" icon={Lock} onClick={() => openDialog("close")}>
          Close job
        </Button>
      )}
      {job.status === "closed" && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={isPending && !dialog}
          onClick={() => (needsNewDate ? openDialog("reopen") : run(() => reopenJob(job.id)))}
        >
          Reopen
        </Button>
      )}

      <Dialog
        open={dialog === "close"}
        onClose={() => setDialog(null)}
        icon={Lock}
        title={`Close ${job.title}?`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button loading={isPending} onClick={() => run(() => closeJob(job.id))}>
              Close job
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">The public link will stop accepting applications. You can reopen it later.</p>
        {dialogError && <p role="alert" className="small font-medium text-danger-text">{dialogError}</p>}
      </Dialog>

      <Dialog
        open={dialog === "reopen"}
        onClose={() => setDialog(null)}
        icon={RefreshCw}
        title={`Reopen ${job.title}?`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button loading={isPending} onClick={() => run(() => reopenJob(job.id, newDate))}>
              Reopen job
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">The old Apply by date has passed. Choose a new one to accept applications again.</p>
        <TextField
          id={`newApplyBy-${job.id}`}
          type="date"
          label="New Apply by date"
          icon={Clock}
          min={pakistanToday()}
          value={newDate}
          onChange={(event) => {
            setNewDate(event.target.value);
            setDialogError(null);
          }}
          error={dialogError}
        />
      </Dialog>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}

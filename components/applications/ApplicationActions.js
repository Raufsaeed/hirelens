"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Undo2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Toast from "@/components/ui/Toast";
import { deleteApplicationData, withdrawApplication } from "@/lib/applications/candidate-actions";
import { WITHDRAW_ERROR, WITHDRAW_STAGES } from "@/lib/applications/validation";

// Withdraw (only while Applied or Shortlisted) and "Delete my data" on Application Detail (Feature 10).
// Both ask for confirmation first.
export default function ApplicationActions({ applicationId, status, companyName }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState(null); // "withdraw" | "delete" | null
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const canWithdraw = WITHDRAW_STAGES.includes(status);
  const showWithdrawNote = status === "interview" || status === "offer";

  function open(kind) {
    setError(null);
    setDialog(kind);
  }

  function withdraw() {
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDialog(null);
      setToast({ tone: "success", message: result.message });
      router.refresh();
    });
  }

  function deleteData() {
    startTransition(async () => {
      // On success the server sends the candidate to My Applications.
      const result = await deleteApplicationData(applicationId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <h2 className="card-title">Manage this application</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        {canWithdraw && (
          <Button variant="secondary" icon={Undo2} onClick={() => open("withdraw")}>
            Withdraw
          </Button>
        )}
        <Button variant="danger-ghost" icon={Trash2} onClick={() => open("delete")}>
          Delete my data
        </Button>
      </div>
      {showWithdrawNote && <p className="small text-ink-muted">{WITHDRAW_ERROR}</p>}

      <Dialog
        open={dialog === "withdraw"}
        onClose={() => setDialog(null)}
        icon={Undo2}
        title="Withdraw your application?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button loading={isPending} onClick={withdraw}>
              Withdraw application
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">{companyName} will stop considering you for this job. This can&apos;t be undone.</p>
        {error && <p role="alert" className="small font-medium text-danger-text">{error}</p>}
      </Dialog>

      <Dialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        icon={Trash2}
        tone="danger"
        title="Delete your data for this application?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={isPending} onClick={deleteData}>
              Delete my data
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">
          This removes the application, its history and your CV. {companyName} won&apos;t see you for this job any
          more. This can&apos;t be undone.
        </p>
        {error && <p role="alert" className="small font-medium text-danger-text">{error}</p>}
      </Dialog>

      <Toast toast={toast} onDismiss={dismissToast} />
    </section>
  );
}

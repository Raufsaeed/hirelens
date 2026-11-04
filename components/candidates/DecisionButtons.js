"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleSlash, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Toast from "@/components/ui/Toast";
import { moveApplication } from "@/lib/applications/status-actions";

// Shortlist and Reject on Candidate Detail (Feature 14). HR makes every decision; Reject confirms first.
export default function DecisionButtons({ applicationId, status, candidateName }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  if (["withdrawn", "hired", "rejected"].includes(status)) return null;

  function move(toStatus, message) {
    startTransition(async () => {
      const result = await moveApplication(applicationId, toStatus);
      setConfirming(false);
      setToast(result.error ? { tone: "error", message: result.error } : { tone: "success", message });
      if (!result.error) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="danger-ghost" icon={CircleSlash} onClick={() => setConfirming(true)}>
        Reject
      </Button>
      {status === "applied" && (
        <Button icon={Star} loading={isPending && !confirming} onClick={() => move("shortlisted", "Candidate shortlisted")}>
          Shortlist
        </Button>
      )}
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        icon={CircleSlash}
        tone="danger"
        title={`Reject ${candidateName}?`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={isPending} onClick={() => move("rejected", "Candidate rejected")}>
              Reject candidate
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">They will see &quot;Not selected&quot; on My Applications. You can move them back later.</p>
      </Dialog>
      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  );
}

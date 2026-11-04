"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Users } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { rescreenApplication } from "@/lib/screening/actions";

// After the requirements change on a job people applied to (Feature 03): "Re-screen candidates" or "Not now".
// Re-screening runs one candidate at a time (screenings also wait for Gemini's free-tier limit) and shows progress.
export default function RescreenDialog({ applicationIds, message, jobId }) {
  const router = useRouter();
  const total = applicationIds.length;
  const [open, setOpen] = useState(true);
  const [progress, setProgress] = useState(null); // number done so far while running
  const [result, setResult] = useState(null); // { pending } when finished

  const people = total === 1 ? "1 candidate was" : `${total} candidates were`;
  const savedParam = message === "Job updated" ? "updated" : "extended";

  async function rescreenAll() {
    setOpen(false);
    let pending = 0;
    for (let index = 0; index < total; index++) {
      setProgress(index);
      const outcome = await rescreenApplication(applicationIds[index]);
      if (outcome.status !== "done" && outcome.status !== "failed") pending += 1;
    }
    setProgress(null);
    setResult({ pending });
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        icon={RefreshCw}
        title="Requirements changed"
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push(`/hr/jobs?saved=${savedParam}`)}>
              Not now
            </Button>
            <Button icon={RefreshCw} onClick={rescreenAll}>
              Re-screen candidates
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">
          {people} screened against the old requirements. Re-screen them now?
        </p>
        <p className="small text-ink-muted">The job is saved. &quot;Not now&quot; keeps the old scores.</p>
      </Dialog>

      {progress !== null && (
        <Alert tone="info" title={`Re-screening ${progress + 1} of ${total}…`}>
          You can stay on this page until it finishes.
        </Alert>
      )}
      {result && (
        <Alert
          tone={result.pending ? "warning" : "success"}
          title={
            result.pending
              ? `${result.pending} ${result.pending === 1 ? "candidate" : "candidates"} could not be screened and are Pending`
              : "All candidates re-screened"
          }
          action={
            <Button href={`/hr/candidates?job=${jobId}`} variant="secondary" size="sm" icon={Users}>
              View candidates
            </Button>
          }
        >
          {message}. {result.pending ? "The other results are saved. You can retry the Pending ones on the list." : ""}
        </Alert>
      )}
    </>
  );
}

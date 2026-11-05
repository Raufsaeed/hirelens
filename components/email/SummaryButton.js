"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { sendTodaysSummary } from "@/lib/email/actions";

// "Send today's summary" on the HR Dashboard (Feature 23). There is no scheduler on localhost,
// so HR sends the daily summary of new applicants with this button.
export default function SummaryButton() {
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();

  function send() {
    setResult(null);
    startTransition(async () => setResult(await sendTodaysSummary()));
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" icon={Send} loading={isPending} onClick={send} className="self-start">
        Send today&apos;s summary
      </Button>
      {result?.message && <Alert tone="success">{result.message}</Alert>}
      {result?.info && <Alert tone="info">{result.info}</Alert>}
      {result?.error && <Alert tone="error">{result.error}</Alert>}
    </div>
  );
}

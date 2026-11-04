"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { retryScreening } from "@/lib/screening/actions";

// "Retry screening" on Candidate Detail. Repeat clicks are ignored while it runs.
export default function RetryScreeningButton({ applicationId }) {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  function retry() {
    if (isPending) return;
    setMessage(null);
    startTransition(async () => {
      const result = await retryScreening(applicationId);
      if (result.error) setMessage(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="secondary" size="sm" icon={RefreshCw} loading={isPending} onClick={retry}>
        Retry screening
      </Button>
      {message && (
        <p role="status" className="small text-warning-text">
          {message}
        </p>
      )}
    </div>
  );
}

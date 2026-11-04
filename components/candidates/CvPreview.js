"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

// The CV shown from a short-lived signed link to the private file (Feature 14).
// When the link expires the preview is replaced with "CV preview has expired"; Reload asks the
// server for a new link.
export default function CvPreview({ url, validSeconds }) {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const [isPending, startTransition] = useTransition();

  // The timer starts again whenever the server sends a new link.
  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), validSeconds * 1000);
    return () => {
      clearTimeout(timer);
      setExpired(false);
    };
  }, [url, validSeconds]);

  if (!url) return <Alert tone="error" title="The CV could not be found" />;

  if (expired) {
    return (
      <Alert
        tone="warning"
        title="CV preview has expired"
        action={
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={isPending} onClick={() => startTransition(() => router.refresh())}>
            Reload
          </Button>
        }
      >
        For privacy, CV links only work for a few minutes.
      </Alert>
    );
  }

  return (
    <iframe
      key={url}
      src={url}
      title="CV preview"
      className="h-150 w-full rounded-control border border-border bg-surface-sunken"
    />
  );
}

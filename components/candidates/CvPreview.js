"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { getCvPreviewUrl } from "@/lib/candidates/cv-actions";

// The CV shown from a short-lived signed link to the private file (Feature 14).
// When the link expires the preview is replaced with "CV preview has expired"; Reload gets a new link.
export default function CvPreview({ applicationId, url: firstUrl, validSeconds }) {
  const [link, setLink] = useState({ url: firstUrl, seconds: validSeconds });
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // The timer starts again for every new link.
  useEffect(() => {
    if (!link.url) return;
    const timer = setTimeout(() => setExpired(true), link.seconds * 1000);
    return () => clearTimeout(timer);
  }, [link]);

  function reload() {
    startTransition(async () => {
      const result = await getCvPreviewUrl(applicationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setExpired(false);
      setLink({ url: result.url, seconds: result.validSeconds });
    });
  }

  if (!link.url) return <Alert tone="error" title="The CV could not be found" />;

  if (expired) {
    return (
      <Alert
        tone="warning"
        title="CV preview has expired"
        action={
          <Button variant="secondary" size="sm" icon={RefreshCw} loading={isPending} onClick={reload}>
            Reload
          </Button>
        }
      >
        {error || "For privacy, CV links only work for a few minutes."}
      </Alert>
    );
  }

  return (
    <iframe
      key={link.url}
      src={link.url}
      title="CV preview"
      className="h-150 w-full rounded-control border border-border bg-surface-sunken"
    />
  );
}

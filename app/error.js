"use client";

import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// Shown when a page fails to load, instead of a blank page or a raw error.
export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-form flex-col justify-center gap-4 bg-surface-page px-4 py-10">
      <Alert
        tone="error"
        title="Something went wrong, please refresh"
        action={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => reset()}>
            Retry
          </Button>
        }
      >
        Your work is safe. Try again in a moment.
      </Alert>
    </div>
  );
}

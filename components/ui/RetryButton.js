"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

// "Retry" on a load error: asks the server to render the page again.
export default function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={RefreshCw}
      loading={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      Retry
    </Button>
  );
}

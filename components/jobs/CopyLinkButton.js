"use client";

import { useCallback, useState } from "react";
import { Copy, Link as LinkIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

// "Copy link" for a published job. Shows "Link copied", or a way out if the browser blocks copying.
// iconOnly: the small icon button used in the My Jobs table.
export default function CopyLinkButton({ slug, iconOnly = false, variant = "ghost", size = "sm" }) {
  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);

  async function copy() {
    const url = `${window.location.origin}/jobs/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({ tone: "success", message: "Link copied" });
    } catch {
      setToast({ tone: "error", message: "Couldn't copy, select the link and copy it by hand" });
    }
  }

  return (
    <>
      {iconOnly ? (
        <Button variant="ghost" size="icon" icon={LinkIcon} aria-label="Copy job link" onClick={copy}>
          <span className="sr-only">Copy job link</span>
        </Button>
      ) : (
        <Button variant={variant} size={size} icon={Copy} onClick={copy}>
          Copy link
        </Button>
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

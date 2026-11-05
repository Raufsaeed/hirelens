"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { saveJob, unsaveJob } from "@/lib/saved-jobs/actions";

// Save / Saved on a job (Feature 21). Only candidates save; a logged-out visitor is sent to
// Log in and comes back to the job with ?save=1, which saves it (autoSave). HR sees no button.
export default function SaveJobButton({ jobId, slug, initialSaved, loggedIn, autoSave = false, size = "md" }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [toast, setToast] = useState(null);
  const [isPending, startTransition] = useTransition();
  const autoSaved = useRef(false);
  const dismiss = useCallback(() => setToast(null), []);

  const toggle = useCallback(
    (next) => {
      const before = saved;
      setSaved(next); // show the change straight away, and put it back if it fails
      startTransition(async () => {
        const result = next ? await saveJob(jobId) : await unsaveJob(jobId);
        if (result.error) setSaved(before);
        setToast(result.error ? { tone: "error", message: result.error } : { tone: "success", message: result.message });
      });
    },
    [jobId, saved]
  );

  // Back from Log in with ?save=1: save the job once, then tidy the address.
  useEffect(() => {
    if (!autoSave || autoSaved.current) return;
    autoSaved.current = true;
    startTransition(async () => {
      if (!initialSaved) {
        const result = await saveJob(jobId);
        if (result.saved) setSaved(true);
        setToast(result.error ? { tone: "error", message: result.error } : { tone: "success", message: result.message });
      }
      router.replace(`/jobs/${slug}`, { scroll: false });
    });
  }, [autoSave, initialSaved, jobId, slug, router]);

  if (!loggedIn) {
    const next = `/jobs/${slug}?save=1`;
    return (
      <Button href={`/login?reason=save&next=${encodeURIComponent(next)}`} variant="secondary" size={size} icon={Bookmark}>
        Save
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        icon={saved ? BookmarkCheck : Bookmark}
        aria-pressed={saved}
        disabled={isPending}
        onClick={() => toggle(!saved)}
      >
        {saved ? "Saved" : "Save"}
      </Button>
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

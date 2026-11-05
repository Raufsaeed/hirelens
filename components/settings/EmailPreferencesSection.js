"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { saveEmailPreference } from "@/lib/email/actions";

// Email preferences in Settings (Feature 23): "Status updates" for candidates or
// "Daily applicant summary" for HR. Application and interview emails are always sent.
export default function EmailPreferencesSection({ role, initialOn }) {
  const [on, setOn] = useState(initialOn);
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();
  const isHr = role === "hr";
  const label = isHr ? "Daily applicant summary" : "Status updates";
  const hint = isHr
    ? "One email with the new applicants per job, when you click “Send today’s summary”."
    : "An email when a company moves your application, for example to Shortlisted.";

  function change(next) {
    setOn(next);
    setResult(null);
    startTransition(async () => {
      const outcome = await saveEmailPreference(next);
      if (outcome.error) setOn(!next); // put the switch back
      setResult(outcome);
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-center gap-2">
        <Mail className="size-icon-md text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
        <h2 className="card-title">Email preferences</h2>
      </div>
      <label className="flex min-h-touch cursor-pointer items-center justify-between gap-4">
        <span className="flex flex-col">
          <span className="font-bold">{label}</span>
          <span className="small text-ink-muted">{hint}</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={on}
          disabled={isPending}
          onChange={(event) => change(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6.5 w-11 shrink-0 rounded-pill bg-ink-disabled transition-colors duration-(--duration-base) ease-out peer-checked:bg-primary peer-focus-visible:shadow-focus peer-disabled:opacity-50 after:absolute after:top-0.75 after:left-0.75 after:size-5 after:rounded-pill after:bg-surface after:shadow-[0_1px_3px_var(--thumb-shadow)] after:transition-transform after:duration-(--duration-base) after:content-[''] peer-checked:after:translate-x-4.5"
        />
      </label>
      <p className="small text-ink-muted">
        {isHr ? "This is the only optional email for HR." : "Application and interview emails are always sent."}
      </p>
      {result?.error && <Alert tone="error">{result.error}</Alert>}
      {result?.message && <Alert tone="success">{result.message}</Alert>}
    </section>
  );
}

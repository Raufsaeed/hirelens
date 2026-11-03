"use client";

import { useEffect } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

// Short confirmation at the bottom centre ("Link copied"). Success hides after 4s; errors stay until dismissed.
const AUTO_HIDE_MS = 4000;

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const timer = setTimeout(onDismiss, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isError = toast?.tone === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  // The live region is always on the page, so screen readers announce each new message.
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-(--z-toast) w-[min(420px,calc(100%-32px))] -translate-x-1/2"
    >
      {toast && (
      <div
        role={isError ? "alert" : "status"}
        className="flex animate-fade-up items-center gap-3 rounded-[14px] bg-ink py-3 pr-3 pl-4 text-sm leading-5 font-medium text-on-primary shadow-float"
      >
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-pill ${
            isError ? "bg-danger-bg text-danger-text" : "bg-success-bg text-success-text"
          }`}
        >
          <Icon className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-touch place-items-center rounded-control opacity-80 hover:bg-glass hover:opacity-100 focus-visible:outline-2 focus-visible:outline-on-primary"
        >
          <X className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      )}
    </div>
  );
}

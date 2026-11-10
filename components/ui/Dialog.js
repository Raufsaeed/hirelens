"use client";

import { useEffect, useRef } from "react";

// Confirm dialog (design/components/Dialog). Uses the native <dialog>, which traps focus,
// closes on Esc and puts focus back on the button that opened it.
// icon: a lucide icon shown in a 44px circle; tone "danger" for destructive actions.
// whitespace-normal: a dialog opened from a no-wrap table cell must still wrap its text.
export default function Dialog({ open, onClose, title, icon: Icon, tone = "primary", children, actions }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="dialog-title"
      role={tone === "danger" ? "alertdialog" : "dialog"}
      className="m-auto w-[calc(100%-32px)] max-w-115 rounded-dialog border-0 bg-surface p-6 text-left whitespace-normal text-ink shadow-float backdrop:bg-overlay open:animate-[dialog-in_var(--duration-slow)_var(--ease-out)]"
    >
      {open && (
        <div className="flex flex-col gap-4">
          {Icon && (
            <span
              className={`grid size-11 place-items-center rounded-pill ${
                tone === "danger" ? "bg-danger-bg text-danger" : "bg-primary-tint text-on-primary-tint"
              }`}
            >
              <Icon className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
            </span>
          )}
          <h2 id="dialog-title" className="card-title">
            {title}
          </h2>
          {children}
          {actions && <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{actions}</div>}
        </div>
      )}
    </dialog>
  );
}

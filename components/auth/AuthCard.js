import FadeUp from "@/components/motion/FadeUp";
import { DURATION } from "@/lib/motion";

// The white-lilac card that holds each auth form. It fades up on load.
export const AUTH_CARD_CLASSES =
  "flex w-full max-w-[calc(var(--width-auth)+2*var(--space-10))] flex-col gap-5 rounded-dialog border border-border bg-surface p-6 shadow-card sm:p-10";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <FadeUp distance={18} duration={DURATION.score} className={AUTH_CARD_CLASSES}>
      <div className="flex flex-col gap-2">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </FadeUp>
  );
}

// Shown while an auth page reads the URL or the session.
export function AuthCardSkeleton() {
  return (
    <div className={AUTH_CARD_CLASSES} aria-busy="true" aria-label="Loading">
      <div className="h-9 w-2/3 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="h-5 w-1/2 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="h-control w-full animate-pulse rounded-control bg-surface-sunken" />
      <div className="h-control w-full animate-pulse rounded-control bg-surface-sunken" />
      <div className="h-13 w-full animate-pulse rounded-control bg-surface-sunken" />
    </div>
  );
}

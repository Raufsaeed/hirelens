"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, CircleCheck, RefreshCw } from "lucide-react";

// Development page: shows whether Gemini, Supabase and the buckets are set up.
// Only shows "ok" or a short error from /api/dev-check, never a key.

async function fetchChecks() {
  try {
    const response = await fetch("/api/dev-check", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.checks)) {
      return { error: data.error || "Checks could not run, try again" };
    }
    return { checks: data.checks };
  } catch {
    return { error: "Could not reach the server. Is npm run dev running?" };
  }
}

function StatusBadge({ check }) {
  if (check.ok) {
    return (
      <span className="label inline-flex items-center gap-1 rounded-pill bg-success-bg px-3 py-1 text-success-text">
        <CircleCheck className="size-icon-sm text-success" strokeWidth={1.75} aria-hidden="true" />
        ok
      </span>
    );
  }
  return (
    <span className="label inline-flex items-center gap-1 rounded-pill bg-danger-bg px-3 py-1 text-danger-text">
      <CircleAlert className="size-icon-sm shrink-0 text-danger" strokeWidth={1.75} aria-hidden="true" />
      {check.error}
    </span>
  );
}

export default function DevCheckPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const runChecks = useCallback(() => {
    fetchChecks().then((next) => {
      setResult(next);
      setLoading(false);
    });
  }, []);

  // Run the checks once when the page opens.
  useEffect(runChecks, [runChecks]);

  function handleRunAgain() {
    setLoading(true);
    runChecks();
  }

  return (
    <main className="mx-auto flex max-w-form flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Setup check</h1>
        <p className="body text-ink-muted">
          Tests the connections in .env.local. Keys are never shown here.
        </p>
      </div>

      <section
        aria-live="polite"
        aria-busy={loading}
        className="rounded-card border border-border bg-surface p-6 shadow-card"
      >
        {loading && <p className="body text-ink-muted">Checking connections…</p>}

        {!loading && result?.error && (
          <p role="alert" className="body rounded-control bg-danger-bg p-4 text-danger-text">
            {result.error}
          </p>
        )}

        {!loading && result?.checks && (
          <ul className="flex flex-col divide-y divide-border">
            {result.checks.map((check) => (
              <li
                key={check.name}
                data-testid="dev-check-row"
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="body-medium">{check.name}</span>
                <StatusBadge check={check} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={handleRunAgain}
        disabled={loading}
        className="body-medium inline-flex h-control items-center gap-2 self-start rounded-control bg-primary px-5 text-on-primary transition-colors hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none disabled:bg-surface-sunken disabled:text-ink-disabled"
      >
        <RefreshCw className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
        Run checks again
      </button>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import Avatar from "@/components/nav/Avatar";
import { INPUT_CLASSES } from "@/components/ui/TextField";
import { searchCandidates } from "@/lib/candidates/search";

// Candidate Search in the HR top bar (Feature 13): results across the company's jobs as you type.
// One row per candidate with every job they applied to, its score and status. Esc closes the results.

const MIN_LENGTH = 2;
const TYPING_PAUSE_MS = 300;

export default function CandidateSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ status: "idle" }); // idle | short | searching | done | error
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const latest = useRef(0);

  const text = query.trim();

  // Search after a short pause in typing; only the newest answer is shown.
  useEffect(() => {
    if (text.length === 0) return;
    if (text.length < MIN_LENGTH) return;
    const searchId = ++latest.current;
    const timer = setTimeout(async () => {
      const result = await searchCandidates(text);
      if (searchId !== latest.current) return;
      setState(result.error ? { status: "error", message: result.error } : { status: "done", results: result.results });
    }, TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    function closeOutside(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  function change(value) {
    setQuery(value);
    setOpen(true);
    const length = value.trim().length;
    setState(length === 0 ? { status: "idle" } : length < MIN_LENGTH ? { status: "short" } : { status: "searching" });
  }

  function clear() {
    latest.current += 1;
    setQuery("");
    setState({ status: "idle" });
  }

  return (
    <div ref={boxRef} role="search" className="relative w-full max-w-105" onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <label htmlFor="topSearch" className="sr-only">
        Search candidates
      </label>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.25 size-icon-md text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
        <input
          id="topSearch"
          type="search"
          autoComplete="off"
          placeholder="Search by name or email"
          value={query}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setOpen(true)}
          className={`${INPUT_CLASSES} pl-10.5`}
        />
      </div>

      {open && state.status !== "idle" && (
        <div
          aria-live="polite"
          className="absolute inset-x-0 top-full z-(--z-dropdown) mt-2 max-h-[70dvh] animate-fade-up overflow-y-auto rounded-card border border-border bg-surface p-2 shadow-float"
        >
          {state.status === "short" && <p className="small p-3 text-ink-muted">Type at least 2 characters</p>}
          {state.status === "searching" && <p className="small p-3 text-ink-muted">Searching…</p>}
          {state.status === "error" && <p role="alert" className="small p-3 text-danger-text">{state.message}</p>}
          {state.status === "done" && state.results.length === 0 && (
            <div className="flex flex-col items-start gap-2 p-3">
              <p className="font-bold">No candidates found for &apos;{text}&apos;</p>
              <button
                type="button"
                onClick={clear}
                className="small inline-flex min-h-touch items-center gap-1 rounded-control font-bold text-primary hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                <X className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
                Clear search
              </button>
            </div>
          )}
          {state.status === "done" && state.results.length > 0 && (
            <ul aria-label="Search results" className="flex flex-col">
              {state.results.map((candidate) => (
                <li key={candidate.email} className="flex gap-3 rounded-control p-3 hover:bg-surface-sunken">
                  <Avatar name={candidate.name} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="min-w-0">
                      <strong className="block truncate">{candidate.name}</strong>
                      <span className="small block truncate text-ink-muted">{candidate.email}</span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {candidate.applications.map((application) => (
                        <li key={application.id}>
                          <Link
                            href={`/hr/candidates/${application.id}`}
                            onClick={() => setOpen(false)}
                            className="small flex min-h-touch flex-wrap items-center gap-2 rounded-control px-2 text-ink no-underline hover:bg-primary-tint focus-visible:shadow-focus focus-visible:outline-none"
                          >
                            <span className="font-bold">{application.jobTitle}</span>
                            <span className="numeric tabular-nums text-ink-muted">
                              {application.score ?? "–"}
                            </span>
                            <ApplicationStatusBadge status={application.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

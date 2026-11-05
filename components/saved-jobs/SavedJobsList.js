"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, CircleCheck, Lock, Search, Send, Trash2 } from "lucide-react";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import JobMeta from "@/components/jobs/JobMeta";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";
import { unsaveJob } from "@/lib/saved-jobs/actions";

// Saved Jobs (Feature 21): each job with Apply, Applied or "Applications closed", and Remove.
export default function SavedJobsList({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [toast, setToast] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [, startTransition] = useTransition();
  const dismiss = useCallback(() => setToast(null), []);

  function remove(item) {
    setRemovingId(item.id);
    startTransition(async () => {
      const result = await unsaveJob(item.job.id);
      if (!result.error) setItems((current) => current.filter((row) => row.id !== item.id));
      setToast(result.error ? { tone: "error", message: result.error } : { tone: "success", message: result.message });
      setRemovingId(null);
    });
  }

  if (!items.length) {
    return (
      <>
        <section className="rounded-card border border-border bg-surface shadow-card">
          <EmptyState icon={Bookmark} title="You haven't saved any jobs yet" action={<Button href="/jobs" icon={Search}>Browse jobs</Button>}>
            Save a job to come back and apply when your CV is ready.
          </EmptyState>
        </section>
        <Toast toast={toast} onDismiss={dismiss} />
      </>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
            <div className="flex items-start gap-3">
              <CompanyLogo company={item.job.companies} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="card-title [overflow-wrap:anywhere]">
                  <Link href={`/jobs/${item.job.slug}`} className="text-ink no-underline hover:text-primary">
                    {item.job.title}
                  </Link>
                </h2>
                <span className="text-ink-muted [overflow-wrap:anywhere]">{item.job.companies?.name}</span>
              </div>
            </div>
            <JobMeta job={item.job} />
            <div className="flex flex-wrap items-center gap-3">
              {item.state !== "closed" && <DeadlineLabel deadline={item.job.deadline} />}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <JobState item={item} />
                <Button variant="ghost" size="sm" icon={Trash2} loading={removingId === item.id} onClick={() => remove(item)}>
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

function JobState({ item }) {
  if (item.state === "apply") {
    return (
      <Button href={`/jobs/${item.job.slug}/apply`} size="sm" icon={Send}>
        Apply
      </Button>
    );
  }
  const applied = item.state === "applied";
  const Icon = applied ? CircleCheck : Lock;
  return (
    <span
      className={`small inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-bold ${
        applied ? "bg-success-bg text-success-text" : "border border-dashed border-border-control bg-muted-bg font-medium text-muted-text"
      }`}
    >
      <Icon className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {applied ? "Applied" : "Applications closed"}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import { DATE_ORDER_ERROR } from "@/lib/reports/range";

// Job and date filters for Reports. Every change reloads the page with the new filters in the URL,
// so the charts update and the choice stays after a Retry.
export default function ReportFilters({ jobs, jobId, from, to, error }) {
  const router = useRouter();
  const [dates, setDates] = useState({ from, to });
  const [dateError, setDateError] = useState(error);

  function go(next) {
    const params = new URLSearchParams({ job: next.jobId, from: next.from, to: next.to });
    router.push(`/hr/reports?${params}`);
  }

  function changeDate(field, value) {
    const next = { ...dates, [field]: value };
    setDates(next);
    if (!next.from || !next.to) return;
    // Don't run the query when the start is after the end.
    if (next.from > next.to) return setDateError(DATE_ORDER_ERROR);
    setDateError(null);
    go({ jobId, ...next });
  }

  return (
    <section aria-label="Report filters" className="grid gap-4 rounded-card border border-border bg-surface p-5 shadow-card sm:grid-cols-3">
      <SelectField
        id="reportJob"
        label="Job"
        value={jobId}
        options={[{ value: "all", label: "All jobs" }, ...jobs.map((job) => ({ value: job.id, label: job.title }))]}
        onChange={(event) => go({ jobId: event.target.value, ...dates })}
      />
      <TextField
        id="reportFrom"
        label="From"
        type="date"
        value={dates.from}
        max={dates.to}
        error={dateError}
        onChange={(event) => changeDate("from", event.target.value)}
      />
      <TextField
        id="reportTo"
        label="To"
        type="date"
        value={dates.to}
        min={dates.from}
        onChange={(event) => changeDate("to", event.target.value)}
      />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CircleCheck, CircleX, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import ApplicationStatusBadge, { APPLICATION_STATUSES } from "@/components/applications/ApplicationStatusBadge";
import MatchBar from "@/components/candidates/MatchBar";
import ScoreRing from "@/components/candidates/ScoreRing";
import ScreeningBadge from "@/components/candidates/ScreeningBadge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import { retryScreening } from "@/lib/screening/actions";

// Ranked candidates for one job (Feature 12) with filters, the anonymised view, search (Feature 13)
// and "Retry screening" (Feature 11). Rows arrive already ranked from the server.

const YEAR_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "0.5", label: "At least 6 months" },
  { value: "1", label: "At least 1 year" },
  { value: "2", label: "At least 2 years" },
  { value: "3", label: "At least 3 years" },
  { value: "5", label: "At least 5 years" },
];
const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  ...Object.entries(APPLICATION_STATUSES).map(([value, info]) => ({ value, label: info.label })),
];
const NO_FILTERS = { minScore: 0, minYears: "", skill: "", status: "" };
const MIN_SEARCH = 2;

const TH = "label sticky top-0 border-b border-border bg-surface px-5 py-3 text-left whitespace-nowrap text-ink-muted";
const TD = "border-b border-border px-5 py-3 align-middle whitespace-nowrap";

function matchesFilters(row, filters) {
  const screening = row.screening;
  const scored = row.screening_status === "done" && screening?.score !== null && screening?.score !== undefined;
  if (filters.minScore > 0 && (!scored || screening.score < filters.minScore)) return false;
  if (filters.minYears && (!scored || Number(screening.relevant_years) < Number(filters.minYears))) return false;
  if (filters.skill) {
    const requirement = scored && screening.requirements_result?.find((item) => item.name === filters.skill);
    if (!requirement?.found) return false;
  }
  if (filters.status && row.status !== filters.status) return false;
  return true;
}

function matchesSearch(row, search) {
  if (search.length < MIN_SEARCH) return true;
  const text = search.toLowerCase();
  return row.candidate_name.toLowerCase().includes(text) || row.candidate_email.toLowerCase().includes(text);
}

function DegreeCell({ screening }) {
  if (!screening?.degree_found) return <span className="text-ink-muted">–</span>;
  const Icon = screening.degree_match ? CircleCheck : CircleX;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${
        screening.degree_match ? "text-success-text" : "text-warning-text"
      }`}
    >
      <Icon
        className={`size-icon-sm ${screening.degree_match ? "text-success" : "text-warning"}`}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {screening.degree_found}
      <span className="sr-only">{screening.degree_match ? "matches" : "doesn't match"} the required degree</span>
    </span>
  );
}

export default function CandidatesTable({ rows, requirements, initialSearch = "" }) {
  const router = useRouter();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState(initialSearch);
  const [anonymised, setAnonymised] = useState(false);
  const [retrying, setRetrying] = useState({}); // applicationId -> true while screening
  const [rowMessages, setRowMessages] = useState({}); // applicationId -> message

  const searchText = search.trim();
  const visible = useMemo(
    () => rows.filter((row) => matchesFilters(row, filters) && matchesSearch(row, searchText)),
    [rows, filters, searchText]
  );
  const filtersOn = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);
  const rankOf = new Map(rows.map((row, index) => [row.id, index + 1]));

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function retry(applicationId) {
    if (retrying[applicationId]) return; // repeat clicks are ignored while it runs
    setRetrying((current) => ({ ...current, [applicationId]: true }));
    setRowMessages((current) => ({ ...current, [applicationId]: null }));
    const result = await retryScreening(applicationId);
    setRetrying((current) => ({ ...current, [applicationId]: false }));
    if (result.error) setRowMessages((current) => ({ ...current, [applicationId]: result.error }));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="minScore" className="label flex items-center justify-between text-ink">
            Minimum score <span className="numeric tabular-nums">{filters.minScore}</span>
          </label>
          <input
            id="minScore"
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minScore}
            onChange={(event) => setFilter("minScore", Number(event.target.value))}
            className="h-control w-full cursor-pointer accent-primary"
          />
        </div>
        <SelectField
          id="minYears"
          label="Experience"
          options={YEAR_OPTIONS}
          value={filters.minYears}
          onChange={(event) => setFilter("minYears", event.target.value)}
        />
        <SelectField
          id="skill"
          label="Skill"
          options={[{ value: "", label: "Any skill" }, ...requirements.map((item) => ({ value: item.name, label: item.name }))]}
          value={filters.skill}
          onChange={(event) => setFilter("skill", event.target.value)}
        />
        <SelectField
          id="status"
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(event) => setFilter("status", event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-90">
          <TextField
            id="candidateSearch"
            type="search"
            label="Search candidates"
            icon={Search}
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            hint={searchText.length > 0 && searchText.length < MIN_SEARCH ? "Type at least 2 characters" : undefined}
          />
        </div>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 font-bold">
          <input
            type="checkbox"
            role="switch"
            checked={anonymised}
            onChange={(event) => setAnonymised(event.target.checked)}
            className="size-5 cursor-pointer accent-primary"
          />
          Hide names
        </label>
      </div>

      <p className="small text-ink-muted" aria-live="polite">
        {visible.length} of {rows.length} {rows.length === 1 ? "candidate" : "candidates"} match
      </p>

      {visible.length === 0 ? (
        <section className="rounded-card border border-border bg-surface shadow-card">
          {searchText.length >= MIN_SEARCH ? (
            <EmptyState
              icon={Search}
              title={`No candidates found for '${searchText}'`}
              action={
                <Button variant="secondary" icon={X} onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              title="No candidates match these filters"
              action={
                <Button variant="secondary" icon={X} onClick={() => setFilters(NO_FILTERS)}>
                  Clear filters
                </Button>
              }
            >
              Try a lower minimum score or another skill.
            </EmptyState>
          )}
        </section>
      ) : (
        <div
          role="region"
          aria-label="Ranked candidates"
          tabIndex={0}
          className="overflow-x-auto rounded-card border border-border bg-surface shadow-card focus-visible:shadow-focus focus-visible:outline-none"
        >
          <table className="w-full border-collapse">
            <caption className="sr-only">Ranked candidates</caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>#</th>
                <th scope="col" className={TH}>Candidate</th>
                <th scope="col" className={TH}>Score</th>
                <th scope="col" className={TH}>Match</th>
                <th scope="col" className={TH}>
                  <span className="inline-flex items-center gap-1">
                    <Award className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    Years
                  </span>
                </th>
                <th scope="col" className={TH}>Degree</th>
                <th scope="col" className={TH}>Screening</th>
                <th scope="col" className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const rank = rankOf.get(row.id);
                const done = row.screening_status === "done" && row.screening?.score != null;
                const isRetrying = retrying[row.id];
                const canRetry = ["pending", "queued"].includes(row.screening_status);
                const found = row.screening?.requirements_result?.filter((item) => item.found).length;
                return (
                  <tr
                    key={row.id}
                    className="transition-colors duration-(--duration-fast) ease-out last:[&>td]:border-b-0 hover:bg-surface-sunken"
                  >
                    <td className={`${TD} font-extrabold text-ink-muted tabular-nums`}>{done ? rank : "–"}</td>
                    <td className={TD}>
                      <Link
                        href={`/hr/candidates/${row.id}`}
                        className="font-bold text-ink no-underline hover:text-primary focus-visible:shadow-focus focus-visible:outline-none"
                      >
                        {anonymised ? `Candidate #${rank}` : row.candidate_name}
                      </Link>
                    </td>
                    <td className={TD}>{done ? <ScoreRing score={row.screening.score} /> : "–"}</td>
                    <td className={TD}>
                      {done ? (
                        <MatchBar
                          percent={row.screening.match_percent}
                          found={found}
                          total={row.screening.requirements_result?.length}
                        />
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className={`${TD} tabular-nums`}>{done ? Number(row.screening.relevant_years).toFixed(1) : "–"}</td>
                    <td className={TD}>{done ? <DegreeCell screening={row.screening} /> : "–"}</td>
                    <td className={TD}>
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ScreeningBadge status={isRetrying ? "processing" : row.screening_status} />
                          {canRetry && !isRetrying && (
                            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => retry(row.id)}>
                              Retry screening
                            </Button>
                          )}
                        </div>
                        {rowMessages[row.id] && (
                          <span role="status" className="small whitespace-normal text-warning-text">
                            {rowMessages[row.id]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={TD}>
                      <ApplicationStatusBadge status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filtersOn && visible.length > 0 && (
        <Button variant="ghost" size="sm" icon={X} className="self-start" onClick={() => setFilters(NO_FILTERS)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

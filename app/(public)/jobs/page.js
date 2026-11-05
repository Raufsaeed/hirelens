import { Suspense } from "react";
import { Briefcase, MapPin, Search, X } from "lucide-react";
import PublicJobCard from "@/components/jobs/PublicJobCard";
import { JobsListSkeleton } from "@/components/jobs/JobsList";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import { JOB_TYPES } from "@/lib/jobs/constants";
import SaveJobButton from "@/components/saved-jobs/SaveJobButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listOpenJobs } from "@/lib/jobs/public-queries";
import { listSavedJobIds } from "@/lib/saved-jobs/queries";

export const metadata = { title: "Jobs · HireLens" };

const TYPE_OPTIONS = [{ value: "", label: "Any type" }, ...JOB_TYPES];

// Public Jobs List (Feature 07): every Open job, with search and job type and location filters.
// The filters are a plain GET form, so the URL can be shared.
export default function JobsPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Find a job" subtitle="Every job here is open. Apply with your PDF CV in a minute." />
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function JobsResults({ searchParams }) {
  const params = await searchParams;
  const filters = {
    q: String(params.q || ""),
    type: String(params.type || ""),
    location: String(params.location || ""),
  };
  const hasFilters = Boolean(filters.q || filters.type || filters.location);

  let jobs = null;
  try {
    jobs = await listOpenJobs(filters);
  } catch {
    // shown below
  }
  const viewer = await saveViewer();

  return (
    <>
      <form
        action="/jobs"
        role="search"
        className="grid gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:grid-cols-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
      >
        <TextField
          id="q"
          name="q"
          type="search"
          label="Search jobs"
          icon={Search}
          placeholder="Job title or company"
          defaultValue={filters.q}
        />
        <SelectField id="type" name="type" label="Job type" options={TYPE_OPTIONS} defaultValue={filters.type} />
        <TextField
          id="location"
          name="location"
          label="Location"
          icon={MapPin}
          placeholder="Lahore"
          defaultValue={filters.location}
        />
        <Button type="submit" icon={Search}>
          Search
        </Button>
      </form>

      {jobs === null && <Alert tone="error" title="Couldn't load jobs" action={<RetryButton />} />}

      {jobs?.length === 0 && (
        <section className="rounded-card border border-border bg-surface shadow-card">
          {hasFilters ? (
            <EmptyState
              icon={Search}
              title="No jobs match your search"
              action={
                <Button href="/jobs" variant="secondary" icon={X}>
                  Clear filters
                </Button>
              }
            >
              Try another title, company or location.
            </EmptyState>
          ) : (
            <EmptyState icon={Briefcase} title="No open jobs right now">
              New jobs appear here as soon as companies publish them.
            </EmptyState>
          )}
        </section>
      )}

      {jobs?.length > 0 && (
        <>
          <p className="small text-ink-muted" aria-live="polite">
            {jobs.length} open {jobs.length === 1 ? "job" : "jobs"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <PublicJobCard
                key={job.id}
                job={job}
                action={
                  viewer && (
                    <SaveJobButton jobId={job.id} slug={job.slug} size="sm" loggedIn={viewer.loggedIn} initialSaved={viewer.savedIds.has(job.id)} />
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

// Who sees Save buttons (Feature 21): candidates (with their saved jobs) and logged-out visitors. Not HR.
async function saveViewer() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // The jobs list still works when the session can't be read.
  }
  if (!profile) return { loggedIn: false, savedIds: new Set() };
  if (profile.role !== "candidate") return null;
  try {
    return { loggedIn: true, savedIds: await listSavedJobIds(profile.id) };
  } catch {
    return { loggedIn: true, savedIds: new Set() };
  }
}

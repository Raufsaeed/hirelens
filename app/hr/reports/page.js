import { Suspense } from "react";
import { connection } from "next/server";
import { ChartColumn, Clock, Hourglass, Lock, Sparkles, Users } from "lucide-react";
import PageHeader from "@/components/nav/PageHeader";
import ChartCard from "@/components/reports/ChartCard";
import KpiCard from "@/components/reports/KpiCard";
import ReportFilters from "@/components/reports/ReportFilters";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listCandidateJobs } from "@/lib/candidates/queries";
import { buildReport } from "@/lib/reports/calculate";
import { listReportApplications } from "@/lib/reports/queries";
import { readRange } from "@/lib/reports/range";

export const metadata = { title: "Reports · HireLens" };

// Reports (Feature 19): ?job=<id or all>&from=YYYY-MM-DD&to=YYYY-MM-DD. Every number is worked out
// in code from this company's real applications, never by AI.
export default function ReportsPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" subtitle="Applicants, scores and hiring progress, worked out from your real data." />
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsForFilters searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// A new filter choice shows the skeleton again while its numbers load.
async function ReportsForFilters({ searchParams }) {
  const params = await searchParams;
  return (
    <Suspense key={JSON.stringify(params)} fallback={<ReportsSkeleton />}>
      <Reports params={params} />
    </Suspense>
  );
}

async function Reports({ params }) {
  await connection(); // the default range uses today's date, so render at request time
  const range = readRange(params);
  let jobs;
  let applications = [];
  let job = null;
  let notMine = false;
  try {
    const profile = await getCurrentProfile();
    jobs = await listCandidateJobs(profile.company_id);
    if (params.job && params.job !== "all") {
      job = jobs.find((item) => item.id === params.job);
      notMine = !job;
    }
    if (!range.error && !notMine) {
      const chosen = job ? [job] : jobs;
      applications = await listReportApplications(chosen.map((item) => item.id), range);
    }
  } catch {
    return <Alert tone="error" title="Couldn't load reports" action={<RetryButton />} />;
  }

  if (notMine) return <NoAccess />;
  if (!jobs.length) {
    return (
      <Card>
        <EmptyState icon={ChartColumn} title="Not enough data yet" action={<Button href="/hr/jobs/new">Post your first job</Button>}>
          Reports appear once candidates apply.
        </EmptyState>
      </Card>
    );
  }

  const filters = (
    <ReportFilters
      key={`${job?.id}-${range.from}-${range.to}`}
      jobs={jobs}
      jobId={job?.id || "all"}
      from={range.from}
      to={range.to}
      error={range.error}
    />
  );
  if (range.error) return filters;

  const report = buildReport(job ? [job] : jobs, applications);
  const scope = job ? job.title : "All jobs";
  const timeToHire = (
    <KpiCard
      label="Average time to hire"
      icon={Clock}
      value={report.timeToHireDays}
      decimals={1}
      unit={report.timeToHireDays === 1 ? " day" : " days"}
      foot={report.timeToHireDays === null ? "No hires yet" : "From applying to Hired"}
    />
  );

  if (!report.totalApplicants) {
    return (
      <>
        {filters}
        <Card>
          <EmptyState icon={ChartColumn} title={job ? "No applicants for this job yet" : "Not enough data yet"}>
            {job ? "Try another job or a wider date range." : "Reports appear once candidates apply."}
          </EmptyState>
        </Card>
        {job && <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">{timeToHire}</div>}
      </>
    );
  }

  const { needsAttention, percent } = report.screeningHealth;
  return (
    <>
      {filters}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <KpiCard label="Applicants" icon={Users} value={report.totalApplicants} foot={scope} />
        <KpiCard
          label="Average score"
          icon={Sparkles}
          value={report.averageScore}
          foot={report.averageScore === null ? "No finished screenings yet" : "Finished screenings only"}
        />
        {timeToHire}
        <KpiCard
          label="Screening health"
          icon={Hourglass}
          value={percent}
          unit="%"
          foot={`${needsAttention} of ${report.totalApplicants} pending or failed`}
        />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <ChartCard title="Applicants per job" scope={scope} rows={report.applicantsPerJob} labelHeader="Job" valueHeader="Applicants" />
        <ChartCard
          title="Average score per job"
          scope="Finished screenings only"
          rows={report.averageScorePerJob}
          labelHeader="Job"
          valueHeader="Average score"
          emptyText="No finished screenings yet."
        />
        <ChartCard title="Pipeline funnel" scope={scope} rows={report.funnel} labelHeader="Stage" valueHeader="Candidates" variant="funnel" />
        <ChartCard
          title="Top missing requirements"
          scope="Applicants missing it"
          rows={report.topMissing}
          labelHeader="Requirement"
          valueHeader="Applicants missing it"
          emptyText="No missing requirements in finished screenings."
        />
      </div>
    </>
  );
}

function Card({ children }) {
  return <section className="rounded-card border border-border bg-surface shadow-card">{children}</section>;
}

// A job id that isn't one of this company's jobs.
function NoAccess() {
  return (
    <Card>
      <EmptyState icon={Lock} title="You don't have access to this page">
        This job doesn&apos;t belong to your company.
      </EmptyState>
    </Card>
  );
}

function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading reports">
      <div className="h-24 animate-pulse rounded-card bg-surface-sunken" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="h-36 animate-pulse rounded-card bg-surface-sunken" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="h-64 animate-pulse rounded-card bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, GraduationCap, Lock, Plus, Send, Sparkles, Star } from "lucide-react";
import { AppliedBanner } from "@/components/jobs/AppliedStatus";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import DeadlineLabel from "@/components/jobs/DeadlineLabel";
import JobMeta, { yearsLabel } from "@/components/jobs/JobMeta";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import SaveJobButton from "@/components/saved-jobs/SaveJobButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getPublicJob } from "@/lib/jobs/public-queries";
import { listSavedJobIds } from "@/lib/saved-jobs/queries";
import { listMyApplicationsForJobs } from "@/lib/applications/applied-status";

export const metadata = { title: "Job · HireLens" };

// Public Job Detail (Feature 07). Open jobs show Apply now; closed jobs show why they are closed.
// A candidate who already applied sees a banner with their status instead of Apply now (Feature 08).
// Drafts and unknown links show "This job could not be found" (not-found.js). Never shows applicant counts.
export default function JobDetailPage({ params, searchParams }) {
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function ClosedNotice({ job }) {
  // Closed because the Apply by day ended: "Applications closed on 20 Oct".
  if (job.deadline?.kind === "closed") return <DeadlineLabel deadline={job.deadline} />;
  return (
    <span className="small inline-flex w-fit items-center gap-1.5 rounded-pill border border-dashed border-border-control bg-muted-bg px-2.5 py-0.5 font-medium text-muted-text">
      <Lock className="size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
      This job is no longer accepting applications
    </span>
  );
}

async function JobDetail({ params, searchParams }) {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job) notFound();
  const { save } = await searchParams;
  const viewer = await saveViewer(job.id);

  const isOpen = job.status === "open";
  const years = yearsLabel(job.required_years);
  const application = viewer?.application || null;

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <TextLink href="/jobs" className="small inline-flex items-center gap-1 self-start">
        <ArrowLeft className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
        All jobs
      </TextLink>

      <header className="flex flex-col gap-5 rounded-card border border-border bg-surface p-4 shadow-card sm:p-7">
        {application && <AppliedBanner application={application} />}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <CompanyLogo company={job.companies} size="lg" />
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="page-title [overflow-wrap:anywhere]">{job.title}</h1>
              <TextLink href={`/companies/${job.companies?.slug}`} className="self-start [overflow-wrap:anywhere]">
                {job.companies?.name}
              </TextLink>
              <JobMeta job={job} />
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            {isOpen ? (
              <>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {viewer && (
                    <SaveJobButton
                      jobId={job.id}
                      slug={job.slug}
                      size="lg"
                      loggedIn={viewer.loggedIn}
                      initialSaved={viewer.saved}
                      autoSave={viewer.loggedIn && save === "1"}
                    />
                  )}
                  {!application && (
                    <Button href={`/jobs/${job.slug}/apply`} size="lg" icon={Send} className="w-full sm:w-auto">
                      Apply now
                    </Button>
                  )}
                </div>
                <DeadlineLabel deadline={job.deadline} />
              </>
            ) : (
              <ClosedNotice job={job} />
            )}
          </div>
        </div>
      </header>

      <article className="flex flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <section className="flex flex-col gap-4">
          <h2 className="section-heading">Requirements</h2>
          <ul aria-label="Skills and tools" className="flex flex-wrap gap-2">
            {(job.requirements || []).map((requirement) => {
              const isMust = requirement.type === "must";
              const Icon = isMust ? Star : Plus;
              return (
                <li
                  key={requirement.name}
                  className={`label inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-pill border px-3 py-0.5 [overflow-wrap:anywhere] ${
                    isMust
                      ? "border-primary bg-primary-tint text-on-primary-tint"
                      : "border-dashed border-border-control bg-surface text-ink-muted"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {requirement.name} · {isMust ? "must have" : "nice to have"}
                </li>
              );
            })}
          </ul>
          <ul className="flex flex-col gap-3">
            {years && (
              <li className="flex items-start gap-3">
                <Award className="mt-0.5 size-icon-md shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
                <span>
                  {job.required_years === 0
                    ? "No work experience needed"
                    : `At least ${years} of work experience (internships count as half)`}
                </span>
              </li>
            )}
            {job.required_degree && (
              <li className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 size-icon-md shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
                <span>{job.required_degree} or a related degree</span>
              </li>
            )}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="section-heading">About the role</h2>
          <p className="whitespace-pre-line [overflow-wrap:anywhere]">{job.description}</p>
        </section>

        <p className="small flex items-start gap-2 rounded-control border border-primary-faint bg-primary-tint p-3 text-on-primary-tint">
          <Sparkles className="mt-0.5 size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>
            <strong>AI only advises, HR decides.</strong> AI helps {job.companies?.name} read CVs against these
            requirements; people make every decision.
          </span>
        </p>
      </article>
    </div>
  );
}

// Who sees the Save button (Feature 21): candidates (with their saved state) and logged-out visitors.
// HR never sees it. Returns null for HR. Candidates also get their application to this job, if any.
async function saveViewer(jobId) {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // The job page still works when the session can't be read.
  }
  if (!profile) return { loggedIn: false, saved: false, application: null };
  if (profile.role !== "candidate") return null;
  const [savedIds, applications] = await Promise.all([
    listSavedJobIds(profile.id).catch(() => new Set()),
    // Without it the page shows Apply now, and the apply form still says "You have already applied".
    listMyApplicationsForJobs(profile.id, [jobId]).catch(() => new Map()),
  ]);
  return { loggedIn: true, saved: savedIds.has(jobId), application: applications.get(jobId) || null };
}

function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading the job">
      <div className="h-40 animate-pulse rounded-card bg-surface-sunken" />
      <div className="h-72 animate-pulse rounded-card bg-surface-sunken" />
    </div>
  );
}

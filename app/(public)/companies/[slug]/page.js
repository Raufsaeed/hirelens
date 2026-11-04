import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Building2, Globe, MapPin } from "lucide-react";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import PublicJobCard from "@/components/jobs/PublicJobCard";
import EmptyState from "@/components/ui/EmptyState";
import { getPublicCompany } from "@/lib/companies/queries";

export const metadata = { title: "Company · HireLens" };

// Public company page (Feature 06): anyone, even logged out. Only Open jobs, and never HR names,
// applicant counts or candidates. Empty parts (About us, website, location) are hidden.
export default function CompanyPage({ params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
      <Company params={params} />
    </Suspense>
  );
}

async function Company({ params }) {
  const { slug } = await params;
  const result = await getPublicCompany(slug);
  if (!result) notFound();
  const { company, jobs } = result;

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-7">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyLogo company={company} size="lg" alt={`${company.name} logo`} />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="page-title [overflow-wrap:anywhere]">{company.name}</h1>
            <div className="small flex flex-wrap gap-x-4 gap-y-1.5 text-ink-muted">
              {company.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
                  {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-bold text-primary no-underline hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
                >
                  <Globe className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
                  {company.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                </a>
              )}
            </div>
          </div>
        </div>
        {company.about && <p className="whitespace-pre-line [overflow-wrap:anywhere]">{company.about}</p>}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="section-heading">Open jobs</h2>
        {jobs.length === 0 ? (
          <div className="rounded-card border border-border bg-surface shadow-card">
            <EmptyState icon={Building2} title={`${company.name} has no open jobs right now`}>
              Check back soon for new jobs.
            </EmptyState>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <PublicJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import PageHeader from "@/components/nav/PageHeader";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getJobForEdit } from "@/lib/jobs/queries";

// On Vercel: CV screening (Gemini, its retries and its call limit) can take longer than the default time limit. Used by Re-screen candidates.
export const maxDuration = 300;

export const metadata = { title: "Edit job · HireLens" };

// Edit Job (Feature 03): the job form filled in with the current details, including Apply by.
export default function EditJobPage({ params }) {
  return (
    <Suspense fallback={<div className="h-150 max-w-form animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
      <EditJob params={params} />
    </Suspense>
  );
}

async function EditJob({ params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const job = await getJobForEdit(profile.company_id, id);
  if (!job) notFound();

  return (
    <div className="flex max-w-form flex-col gap-8">
      <PageHeader
        title="Edit job"
        subtitle="Changes show on the public job page straight away."
        actions={<JobStatusBadge status={job.status} closedReason={job.closed_reason} />}
      />
      <JobForm job={job} />
    </div>
  );
}

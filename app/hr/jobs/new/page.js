import JobForm from "@/components/jobs/JobForm";
import PageHeader from "@/components/nav/PageHeader";

// On Vercel: the AI job description writer waits for Gemini (and its retries).
export const maxDuration = 60;

export const metadata = { title: "Post a job · HireLens" };

export default function NewJobPage() {
  return (
    <div className="flex max-w-form flex-col gap-8">
      <PageHeader title="Post a job" subtitle="Save it as a draft any time. Publish when every field is filled." />
      <JobForm />
    </div>
  );
}

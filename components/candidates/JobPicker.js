"use client";

import { useRouter } from "next/navigation";
import SelectField from "@/components/ui/SelectField";

// Chooses which job's candidates to show (the list is one per job).
export default function JobPicker({ jobs, selectedId }) {
  const router = useRouter();
  return (
    <div className="w-full max-w-120">
      <SelectField
        id="jobPicker"
        label="Job"
        value={selectedId}
        options={jobs.map((job) => ({
          value: job.id,
          label: `${job.title} · ${job.applicantCount} ${job.applicantCount === 1 ? "applicant" : "applicants"}`,
        }))}
        onChange={(event) => router.push(`/hr/candidates?job=${event.target.value}`)}
      />
    </div>
  );
}

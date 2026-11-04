// Fixed lists for jobs (same values as the check rules in supabase/sql/02-post-a-job.sql).

export const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

export const REQUIREMENT_TYPES = [
  { value: "must", label: "Must have" },
  { value: "nice", label: "Nice to have" },
];

export const MAX_REQUIRED_YEARS = 30;
export const MAX_REQUIREMENT_LENGTH = 60;

export function jobTypeLabel(value) {
  return JOB_TYPES.find((type) => type.value === value)?.label || "";
}

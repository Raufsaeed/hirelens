import { REQUIRED_ERROR } from "@/lib/auth/validation";
import { JOB_TYPES, MAX_REQUIRED_YEARS, MAX_REQUIREMENT_LENGTH } from "@/lib/jobs/constants";
import { daysUntil, isValidDateString } from "@/lib/jobs/dates";
import { BLOCKED_TEXT_ERROR, blockedFields, isBlockedText } from "@/lib/validation/injection";

// Job form checks, shared by the form (as HR types) and the server action (on save).

export const YEARS_ERROR = "Enter a number of years, for example 1";
export const PAST_DATE_ERROR = "Apply by date can't be in the past";
export const NO_REQUIREMENTS_ERROR = "Add at least one requirement";

export const NEW_DATE_ERROR = "Set a new Apply by date to reopen this job";

// A closed job needs a new Apply by date to reopen when its deadline closed it or has passed.
export function needsNewApplyBy(job, today) {
  return job.closed_reason === "deadline" || Boolean(job.apply_by && daysUntil(job.apply_by, today) < 0);
}

export function duplicateTitleError(title) {
  return `You already have an open job called ${title}`;
}

// "1" -> 1. Returns null for anything that isn't a whole number from 0 to 30.
export function parseYears(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const years = Number(text);
  return years <= MAX_REQUIRED_YEARS ? years : null;
}

// Keeps only well-formed requirements: [{ name: "React", type: "must" }, ...]
export function cleanRequirements(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const name = String(item?.name || "").trim().slice(0, MAX_REQUIREMENT_LENGTH);
    const type = item?.type === "nice" ? "nice" : "must";
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push({ name, type });
  }
  return result;
}

// intent "draft": only the title is needed. intent "publish": every field and one requirement.
// Fields that are filled are always checked (years, job type, Apply by).
// keepApplyBy: an Apply by date already saved on the job, which may stay even if it has passed.
export function validateJob(values, intent, today, { keepApplyBy = null } = {}) {
  const errors = {};
  const filled = (field) => String(values[field] ?? "").trim() !== "";

  if (!filled("title")) errors.title = REQUIRED_ERROR;

  if (filled("requiredYears") && parseYears(values.requiredYears) === null) {
    errors.requiredYears = YEARS_ERROR;
  }
  if (filled("jobType") && !JOB_TYPES.some((type) => type.value === values.jobType)) {
    errors.jobType = REQUIRED_ERROR;
  }
  if (filled("applyBy") && values.applyBy !== keepApplyBy) {
    if (!isValidDateString(values.applyBy) || daysUntil(values.applyBy, today) < 0) {
      errors.applyBy = PAST_DATE_ERROR;
    }
  }

  if (intent === "publish") {
    for (const field of ["location", "jobType", "requiredYears", "requiredDegree", "description"]) {
      if (!filled(field)) errors[field] = REQUIRED_ERROR;
    }
    if (!values.requirements?.length) errors.requirements = NO_REQUIREMENTS_ERROR;
  }

  // Prompt-injection check on every free-text field (each requirement is its own line).
  Object.assign(errors, blockedFields(values, ["title", "location", "requiredDegree", "description"]));
  const requirementLines = (values.requirements || []).map((item) => item.name).join("\n");
  if (isBlockedText(requirementLines)) errors.requirements = BLOCKED_TEXT_ERROR;

  return Object.keys(errors).length ? errors : null;
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { slugify, slugWithNumber } from "@/lib/companies/slug";
import { pakistanToday } from "@/lib/jobs/dates";
import { cleanRequirements, duplicateTitleError, parseYears, validateJob } from "@/lib/jobs/validation";

// Server action for the Create Job form: "Save as draft" or "Publish".
// Inserts with the logged-in HR user's session, so Row Level Security checks the company.

const SAVE_ERROR = "Couldn't save, try again";
const UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 20;

function text(formData, name) {
  return String(formData.get(name) || "").trim();
}

function readRequirements(formData) {
  try {
    return cleanRequirements(JSON.parse(String(formData.get("requirements") || "[]")));
  } catch {
    return [];
  }
}

// Which unique rule a duplicate broke: the public link or the "same title" rule.
function brokenRule(error) {
  if (error?.code !== UNIQUE_VIOLATION) return null;
  const message = `${error.message} ${error.details || ""}`;
  if (message.includes("jobs_company_active_title_idx")) return "title";
  if (message.includes("jobs_slug_key")) return "slug";
  return null;
}

export async function createJob(_previousState, formData) {
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";
  const values = {
    title: text(formData, "title"),
    location: text(formData, "location"),
    jobType: text(formData, "jobType"),
    requiredYears: text(formData, "requiredYears"),
    requiredDegree: text(formData, "requiredDegree"),
    description: text(formData, "description"),
    applyBy: text(formData, "applyBy"),
    requirements: readRequirements(formData),
  };

  const errors = validateJob(values, intent, pakistanToday());
  if (errors) return { errors };

  // A network failure here must keep the form (and what HR typed), not open the error page.
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    return { formError: SAVE_ERROR };
  }
  if (profile?.role !== "hr" || !profile.company_id) return { formError: SAVE_ERROR };

  const row = {
    company_id: profile.company_id,
    title: values.title,
    location: values.location || null,
    job_type: values.jobType || null,
    required_years: parseYears(values.requiredYears),
    required_degree: values.requiredDegree || null,
    requirements: values.requirements,
    description: values.description || null,
    apply_by: values.applyBy || null,
    status: intent === "publish" ? "open" : "draft",
  };

  // A published job gets a readable link: "abc-tech-junior-web-developer", or "-2" if taken.
  const slugBase = slugify(`${profile.companies?.name || ""} ${values.title}`);
  const supabase = await createClient();
  let jobId = null;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS && !jobId; attempt++) {
    const slug = intent === "publish" ? slugWithNumber(slugBase, attempt) : null;
    try {
      const job = await runSupabase(() =>
        supabase.from("jobs").insert({ ...row, slug }).select("id").single()
      );
      jobId = job.id;
    } catch (error) {
      const rule = brokenRule(error);
      if (rule === "title") return { errors: { title: duplicateTitleError(values.title) } };
      if (rule !== "slug") return { formError: SAVE_ERROR };
    }
  }
  if (!jobId) return { formError: SAVE_ERROR };

  redirect(intent === "publish" ? `/hr/jobs/${jobId}/published` : "/hr/jobs?saved=draft");
}

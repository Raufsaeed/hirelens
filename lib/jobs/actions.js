"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { slugify, slugWithNumber } from "@/lib/companies/slug";
import { daysUntil, pakistanToday } from "@/lib/jobs/dates";
import { cleanRequirements, duplicateTitleError, parseYears, validateJob } from "@/lib/jobs/validation";
import { isUuid } from "@/lib/uuid";

// Server actions for the job form: Create Job (Feature 02) and Edit Job (Feature 03).
// They write with the logged-in HR user's session, so Row Level Security checks the company.

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

function readValues(formData) {
  return {
    title: text(formData, "title"),
    location: text(formData, "location"),
    jobType: text(formData, "jobType"),
    requiredYears: text(formData, "requiredYears"),
    requiredDegree: text(formData, "requiredDegree"),
    // Browsers send textarea line breaks as \r\n; keep plain \n.
    description: text(formData, "description").replace(/\r\n/g, "\n"),
    applyBy: text(formData, "applyBy"),
    requirements: readRequirements(formData),
  };
}

// The job's columns from the form values.
function jobFields(values) {
  return {
    title: values.title,
    location: values.location || null,
    job_type: values.jobType || null,
    required_years: parseYears(values.requiredYears),
    required_degree: values.requiredDegree || null,
    requirements: values.requirements,
    description: values.description || null,
    apply_by: values.applyBy || null,
  };
}

// Which unique rule a duplicate broke: the public link or the "same title" rule.
function brokenRule(error) {
  if (error?.code !== UNIQUE_VIOLATION) return null;
  const message = `${error.message} ${error.details || ""}`;
  if (message.includes("jobs_company_active_title_idx")) return "title";
  if (message.includes("jobs_slug_key")) return "slug";
  return null;
}

// The logged-in HR user, or null. A network failure must keep the form, not open the error page.
async function loadHr() {
  try {
    const profile = await getCurrentProfile();
    return profile?.role === "hr" && profile.company_id ? profile : null;
  } catch {
    return null;
  }
}

// Runs a write that may need a public link: tries "abc-tech-junior-web-developer", then "-2", "-3"...
// write(slug) does the insert or update. Returns { id } or { errors } / { formError }.
async function writeWithSlug(profile, title, needsSlug, write) {
  const slugBase = slugify(`${profile.companies?.name || ""} ${title}`);
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      return { id: await write(needsSlug ? slugWithNumber(slugBase, attempt) : undefined) };
    } catch (error) {
      const rule = brokenRule(error);
      if (rule === "title") return { errors: { title: duplicateTitleError(title) } };
      if (rule !== "slug" || !needsSlug) return { formError: SAVE_ERROR };
    }
  }
  return { formError: SAVE_ERROR };
}

// ---------- Create Job (Feature 02): "Save as draft" or "Publish" ----------

export async function createJob(_previousState, formData) {
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";
  const values = readValues(formData);
  const errors = validateJob(values, intent, pakistanToday());
  if (errors) return { errors };

  const profile = await loadHr();
  if (!profile) return { formError: SAVE_ERROR };

  const supabase = await createClient();
  const row = { ...jobFields(values), company_id: profile.company_id, status: intent === "publish" ? "open" : "draft" };
  const result = await writeWithSlug(profile, values.title, intent === "publish", async (slug) => {
    const job = await runSupabase(() =>
      supabase.from("jobs").insert({ ...row, slug: slug ?? null }).select("id").single()
    );
    return job.id;
  });
  if (!result.id) return result;

  redirect(intent === "publish" ? `/hr/jobs/${result.id}/published` : "/hr/jobs?saved=draft");
}

// ---------- Edit Job (Feature 03) ----------

function sameRequirements(a, b) {
  const key = (list) => JSON.stringify((list || []).map((item) => [item.name.toLowerCase(), item.type]));
  return key(a) === key(b);
}

// intent "draft" (a draft stays a draft), "publish" (a draft goes live) or "save" (an open or closed job).
// When requirements changed and people have applied, returns { saved, rescreen: { applicationIds } }
// so the form can offer "Re-screen candidates" or "Not now".
export async function updateJob(_previousState, formData) {
  const jobId = String(formData.get("jobId") || "");
  const requestedIntent = String(formData.get("intent") || "save");
  if (!isUuid(jobId)) return { formError: SAVE_ERROR };

  const profile = await loadHr();
  if (!profile) return { formError: SAVE_ERROR };

  const supabase = await createClient();
  let current;
  try {
    current = await runSupabase(() =>
      supabase
        .from("jobs")
        .select("id, status, slug, apply_by, closed_reason, requirements, applications(id)")
        .eq("id", jobId)
        .eq("company_id", profile.company_id)
        .maybeSingle()
    );
  } catch {
    return { formError: SAVE_ERROR };
  }
  if (!current) return { formError: SAVE_ERROR };

  // Drafts can stay drafts; open and closed jobs always follow the publishing rules.
  const intent = current.status === "draft" ? (requestedIntent === "publish" ? "publish" : "draft") : "publish";
  const values = readValues(formData);
  const today = pakistanToday();
  // A past Apply by date that was already saved can stay (a closed job keeps its old date).
  const errors = validateJob(values, intent, today, { keepApplyBy: current.apply_by });
  if (errors) return { errors };

  const changes = jobFields(values);
  let message = "Job updated";
  if (current.status === "draft" && intent === "publish") changes.status = "open";
  // A job closed by its deadline reopens when HR sets a new future Apply by date (Feature 04).
  const newFutureDate = values.applyBy && values.applyBy !== current.apply_by && daysUntil(values.applyBy, today) >= 0;
  if (current.status === "closed" && current.closed_reason === "deadline" && newFutureDate) {
    Object.assign(changes, { status: "open", closed_reason: null, closed_at: null });
    message = "Deadline extended. The job is open again";
  }

  const result = await writeWithSlug(profile, values.title, !current.slug && changes.status === "open", async (slug) => {
    const update = slug ? { ...changes, slug } : changes;
    await runSupabase(() => supabase.from("jobs").update(update).eq("id", jobId));
    return jobId;
  });
  if (!result.id) return result;

  const applicationIds = (current.applications || []).map((application) => application.id);
  if (applicationIds.length > 0 && !sameRequirements(current.requirements, values.requirements)) {
    return { saved: true, message, rescreen: { applicationIds } };
  }
  redirect(`/hr/jobs?saved=${message === "Job updated" ? "updated" : "extended"}`);
}

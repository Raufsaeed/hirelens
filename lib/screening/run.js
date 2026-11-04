import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { GEMINI_MODEL } from "@/lib/gemini";
import { generateJson } from "@/lib/ai/generate-json";
import { loadPrompt, readPromptFile } from "@/lib/ai/prompts";
import { extractPdfText } from "@/lib/screening/extract-text";
import { redactCvText } from "@/lib/screening/redact";
import { checkExperience, checkRequirements, checkRubric, checkSummary } from "@/lib/screening/validate";
import { degreeMatch, matchPercentages, relevantYears, totalScore } from "@/lib/screening/calculate";

// Screens one application's CV against its job (Feature 11). Runs only on the server with the secret key.
// AI only reads and judges; every number is calculated in lib/screening/calculate.js.
// Returns { status: "done" | "pending" | "failed" | "busy" }.

const MIN_TEXT_LENGTH = 200;
const AI_ATTEMPTS = 2; // the first request plus one automatic retry

// The four task prompts, sent together in one request (cv-screening-request.txt) to save Gemini quota.
const TASK_FILES = {
  RUBRIC_TASK: "cv-screening.txt",
  REQUIREMENTS_TASK: "job-requirements.txt",
  EXPERIENCE_TASK: "experience.txt",
  SUMMARY_TASK: "candidate-summary.txt",
};

const EMPTY_RESULT = {
  score: null,
  rubric_breakdown: null,
  match_percent: null,
  must_have_match: null,
  nice_to_have_match: null,
  requirements_result: null,
  experience_items: null,
  relevant_years: null,
  meets_required_years: null,
  degree_match: null,
  degree_found: null,
  summary: null,
};

// The job as plain text for the prompts. No company data.
function describeJob(job) {
  const requirements = (job.requirements || [])
    .map((item) => `${item.name} (${item.type === "must" ? "must have" : "nice to have"})`)
    .join(", ");
  return [
    `Title: ${job.title}`,
    `Required years of experience: ${job.required_years ?? "not set"}`,
    `Required degree: ${job.required_degree || "not set"}`,
    `Requirements: ${requirements || "none"}`,
  ].join("\n");
}

// One Gemini request for all four tasks. Each part of the JSON is checked; if the call or any part
// fails, it tries once more.
async function askAi(values, check, testMode) {
  const tasks = Object.fromEntries(
    await Promise.all(Object.entries(TASK_FILES).map(async ([key, file]) => [key, await readPromptFile(file)]))
  );
  const prompt = await loadPrompt("cv-screening-request.txt", { ...tasks, ...values });
  let lastError;
  for (let attempt = 0; attempt < AI_ATTEMPTS; attempt++) {
    try {
      return check(await generateJson({ prompt, temperature: 0, testMode }));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function saveResult(admin, applicationId, screeningStatus, fields) {
  await runSupabase(() =>
    admin
      .from("screenings")
      .upsert({ application_id: applicationId, ...fields }, { onConflict: "application_id" })
  );
  await runSupabase(() =>
    admin.from("applications").update({ screening_status: screeningStatus }).eq("id", applicationId)
  );
}

export async function screenApplication(applicationId, { testMode = null } = {}) {
  const admin = createAdminClient();

  // Claim the application, so only one screening runs at a time.
  const claimed = await runSupabase(() =>
    admin
      .from("applications")
      .update({ screening_status: "processing" })
      .eq("id", applicationId)
      .neq("screening_status", "processing")
      .select("id")
  );
  if (!claimed?.length) return { status: "busy" };

  try {
    const application = await runSupabase(() =>
      admin
        .from("applications")
        .select("id, cv_file_path, candidate_name, jobs(title, required_years, required_degree, requirements)")
        .eq("id", applicationId)
        .single()
    );
    const job = application.jobs;

    // 1. Read the PDF text. Damaged files and scanned CVs (almost no text) are "CV could not be read".
    let text = "";
    try {
      const file = await runSupabase(() => admin.storage.from("cvs").download(application.cv_file_path));
      text = await extractPdfText(new Uint8Array(await file.arrayBuffer()));
    } catch (error) {
      // Logged for the developer only (no CV content); HR just sees "CV could not be read".
      console.error("Could not read a CV PDF:", String(error?.message || error).slice(0, 200));
      await saveResult(admin, applicationId, "failed", {
        ...EMPTY_RESULT,
        cv_text_clean: null,
        error_message: "CV could not be read: the PDF could not be opened",
        screened_at: new Date().toISOString(),
      });
      return { status: "failed" };
    }
    if (text.replace(/\s+/g, " ").trim().length < MIN_TEXT_LENGTH) {
      await saveResult(admin, applicationId, "failed", {
        ...EMPTY_RESULT,
        cv_text_clean: null,
        error_message: "CV could not be read: almost no text (scanned PDF?)",
        screened_at: new Date().toISOString(),
      });
      return { status: "failed" };
    }

    // 2. Remove personal details before anything goes to AI. Only this clean text is sent.
    const cvText = redactCvText(text, { name: application.candidate_name });
    const jobText = describeJob(job);
    const requirementsText = JSON.stringify(job.requirements || []);

    // 3. One request with the four tasks; every part is checked against its fixed format.
    let rubric, requirementsResult, experience, summary;
    try {
      ({ rubric, requirementsResult, experience, summary } = await askAi(
        { JOB: jobText, REQUIREMENTS: requirementsText, CV_TEXT: cvText },
        (json) => ({
          rubric: checkRubric(json),
          requirementsResult: checkRequirements(json, job.requirements || [], cvText),
          experience: checkExperience(json),
          summary: checkSummary(json),
        }),
        testMode
      ));
    } catch (error) {
      // AI failed twice or kept returning bad JSON: "Pending", so HR can retry. Never shown raw.
      await saveResult(admin, applicationId, "pending", {
        ...EMPTY_RESULT,
        cv_text_clean: cvText,
        error_message: `AI screening failed: ${String(error?.message || "unknown error").slice(0, 200)}`,
        screened_at: null,
      });
      return { status: "pending" };
    }

    // 4. Code calculates the numbers.
    const years = relevantYears(experience.experience);
    const degree = degreeMatch(job.required_degree, experience.education);
    const match = matchPercentages(requirementsResult);
    await saveResult(admin, applicationId, "done", {
      score: totalScore(rubric),
      rubric_breakdown: rubric,
      match_percent: match.matchPercent,
      must_have_match: match.mustHaveMatch,
      nice_to_have_match: match.niceToHaveMatch,
      requirements_result: requirementsResult,
      experience_items: experience.experience,
      relevant_years: years,
      meets_required_years: years >= (job.required_years ?? 0),
      degree_match: degree.degreeMatch,
      degree_found: degree.degreeFound,
      summary,
      cv_text_clean: cvText,
      model_name: GEMINI_MODEL,
      screened_at: new Date().toISOString(),
      error_message: null,
    });
    return { status: "done" };
  } catch {
    // Anything unexpected (for example the database): leave it "pending" so HR can retry.
    await admin.from("applications").update({ screening_status: "pending" }).eq("id", applicationId);
    return { status: "pending" };
  }
}

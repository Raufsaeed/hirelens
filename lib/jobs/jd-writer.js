"use server";

import { cookies } from "next/headers";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { generateJson } from "@/lib/ai/generate-json";
import { loadPrompt } from "@/lib/ai/prompts";
import { AI_TEST_COOKIE, aiTestModeFrom } from "@/lib/ai/test-mode";
import { checkDraft, DRAFT_FAILED, TOO_LITTLE_INPUT } from "@/lib/jobs/jd-check";
import { jobTypeLabel } from "@/lib/jobs/constants";
import { cleanRequirements, parseYears } from "@/lib/jobs/validation";

// "Write with AI" on the Create Job form (Feature 05). Returns a draft for HR to edit; nothing is saved.

const AI_ATTEMPTS = 2; // the first request plus one automatic retry
const TEMPERATURE = 0.7;
const MAX_FIELD_LENGTH = 200;
const MAX_KEY_POINTS_LENGTH = 1000;

function clean(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value ?? "").trim().slice(0, maxLength);
}

// input: { title, keyPoints, location, jobType, requiredYears, requiredDegree, requirements }
// Returns { description, suggestions } or { error }.
export async function writeJobDescription(input) {
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr" || !profile.company_id) return { error: DRAFT_FAILED };

    const title = clean(input?.title);
    const keyPoints = clean(input?.keyPoints, MAX_KEY_POINTS_LENGTH);
    const requirements = cleanRequirements(input?.requirements);
    if (!title || (!keyPoints && requirements.length === 0)) {
      return { error: TOO_LITTLE_INPUT };
    }

    const years = parseYears(input?.requiredYears);
    const prompt = await loadPrompt("jd-writer.txt", {
      TITLE: title,
      LOCATION: clean(input?.location) || "not given",
      JOB_TYPE: jobTypeLabel(input?.jobType) || "not given",
      REQUIRED_YEARS: years === null ? "not given" : years,
      REQUIRED_DEGREE: clean(input?.requiredDegree) || "not given",
      REQUIREMENTS:
        requirements
          .map((item) => `${item.name} (${item.type === "must" ? "must have" : "nice to have"})`)
          .join(", ") || "none",
      KEY_POINTS: keyPoints || "none",
    });
    const testMode = aiTestModeFrom((await cookies()).get(AI_TEST_COOKIE)?.value);

    // Bad JSON or a draft that breaks the rules gets one more try.
    for (let attempt = 0; attempt < AI_ATTEMPTS; attempt++) {
      try {
        return checkDraft(await generateJson({ prompt, temperature: TEMPERATURE, testMode }), requirements);
      } catch {
        // try again, then give up below
      }
    }
    return { error: DRAFT_FAILED };
  } catch {
    // Never show a raw error.
    return { error: DRAFT_FAILED };
  }
}

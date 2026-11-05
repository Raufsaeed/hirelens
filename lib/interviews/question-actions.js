"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { GENERIC_ERROR } from "@/lib/auth/validation";
import { generateJson } from "@/lib/ai/generate-json";
import { loadPrompt } from "@/lib/ai/prompts";
import { AI_TEST_COOKIE, aiTestModeFrom } from "@/lib/ai/test-mode";
import { checkQuestions, QUESTIONS_FAILED, validateOwnQuestion } from "@/lib/interviews/questions";
import { redactCvText } from "@/lib/screening/redact";
import { isUuid } from "@/lib/uuid";

// Interview questions for HR (Feature 18). Reads and writes run with HR's session, so Row Level
// Security allows only their own company's interviews. Candidates never see questions.

const AI_ATTEMPTS = 2; // the first request plus one automatic retry
const TEMPERATURE = 0.4;
const NEEDS_SCREENING = "Questions need a finished CV screening";
const QUESTION_COLUMNS = "id, type, question, good_answer_hint, focus, source, position";

async function loadHr() {
  const profile = await getCurrentProfile();
  return profile?.role === "hr" && profile.company_id ? profile : null;
}

async function listQuestions(supabase, interviewId) {
  const rows = await runSupabase(() =>
    supabase.from("interview_questions").select(QUESTION_COLUMNS).eq("interview_id", interviewId).order("position")
  );
  return rows || [];
}

function nextPosition(questions) {
  return questions.reduce((highest, item) => Math.max(highest, item.position), -1) + 1;
}

// The prompt values. Personal details are removed again here, even though the saved CV text is
// already cleaned (Feature 11), so the name, email and phone can never reach Gemini.
function promptValues(application, screening) {
  const job = application.jobs;
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const missing = (screening.requirements_result || []).filter((item) => item && item.found === false).map((item) => item.name);
  let cvText = redactCvText(screening.cv_text_clean, { name: application.candidate_name });
  for (const detail of [application.candidate_email, application.phone].filter(Boolean)) {
    cvText = cvText.split(detail).join("[removed]");
  }
  return {
    missing,
    values: {
      TITLE: job.title,
      REQUIRED_YEARS: job.required_years ?? "not set",
      REQUIRED_DEGREE: job.required_degree || "not set",
      REQUIREMENTS:
        requirements.map((item) => `${item.name} (${item.type === "must" ? "must have" : "nice to have"})`).join(", ") || "none",
      MISSING: missing.length ? missing.join(", ") : "none",
      CV_TEXT: cvText,
    },
  };
}

// "Generate questions" and "Regenerate": eight new AI questions replace the old AI ones; HR's own stay.
// Returns { questions } or { error }. Saved questions are kept if anything fails.
export async function generateQuestions(interviewId) {
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(interviewId)) return { error: QUESTIONS_FAILED };
    const supabase = await createClient();
    const interview = await runSupabase(() =>
      supabase
        .from("interviews")
        .select(
          "id, status, applications(candidate_name, candidate_email, phone, screening_status, " +
            "jobs(title, required_years, required_degree, requirements), screenings(cv_text_clean, requirements_result))"
        )
        .eq("id", interviewId)
        .maybeSingle()
    );
    if (!interview?.applications) return { error: QUESTIONS_FAILED };
    if (interview.status !== "scheduled") return { error: "Schedule an interview first" };
    const application = interview.applications;
    const screening = Array.isArray(application.screenings) ? application.screenings[0] : application.screenings;
    if (application.screening_status !== "done" || !screening?.cv_text_clean) return { error: NEEDS_SCREENING };

    const { missing, values } = promptValues(application, screening);
    const prompt = await loadPrompt("interview-questions.txt", values);
    const testMode = aiTestModeFrom((await cookies()).get(AI_TEST_COOKIE)?.value);

    // Bad JSON, a wrong count or a personal question gets one more try.
    let fresh = null;
    for (let attempt = 0; attempt < AI_ATTEMPTS && !fresh; attempt++) {
      try {
        fresh = checkQuestions(await generateJson({ prompt, temperature: TEMPERATURE, testMode }), missing);
      } catch {
        // try again, then give up below
      }
    }
    if (!fresh) return { error: QUESTIONS_FAILED };

    // Save the new set first, then remove the old AI questions, so a failure never leaves an empty list.
    const existing = await listQuestions(supabase, interviewId);
    const start = nextPosition(existing);
    await runSupabase(() =>
      supabase.from("interview_questions").insert(
        fresh.map((item, index) => ({ ...item, interview_id: interviewId, source: "ai", position: start + index }))
      )
    );
    const oldAiIds = existing.filter((item) => item.source === "ai").map((item) => item.id);
    if (oldAiIds.length) {
      await runSupabase(() => supabase.from("interview_questions").delete().in("id", oldAiIds));
    }
    return { questions: await listQuestions(supabase, interviewId) };
  } catch {
    // Never show a raw error.
    return { error: QUESTIONS_FAILED };
  }
}

// HR adds their own question (a type is required). Returns { question } or { error }.
export async function addQuestion(interviewId, { question, type, hint }) {
  const invalid = validateOwnQuestion({ question, type, hint });
  if (invalid) return { error: invalid };
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(interviewId)) return { error: GENERIC_ERROR };
    const supabase = await createClient();
    const existing = await listQuestions(supabase, interviewId);
    const row = await runSupabase(() =>
      supabase
        .from("interview_questions")
        .insert({
          interview_id: interviewId,
          type,
          question: String(question).trim(),
          good_answer_hint: String(hint ?? "").trim() || null,
          source: "hr",
          position: nextPosition(existing),
        })
        .select(QUESTION_COLUMNS)
        .single()
    );
    return { question: row };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

export async function deleteQuestion(questionId) {
  try {
    const profile = await loadHr();
    if (!profile || !isUuid(questionId)) return { error: GENERIC_ERROR };
    const supabase = await createClient();
    const deleted = await runSupabase(() =>
      supabase.from("interview_questions").delete().eq("id", questionId).select("id")
    );
    return deleted?.length ? { deleted: true } : { error: GENERIC_ERROR };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

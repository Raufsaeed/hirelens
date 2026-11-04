"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { GENERIC_ERROR } from "@/lib/auth/validation";
import { AI_TEST_COOKIE, aiTestModeFrom } from "@/lib/ai/test-mode";
import { screenApplication } from "@/lib/screening/run";
import { isUuid } from "@/lib/uuid";

// HR actions for screening (Features 11 and 03). Only HR of the job's company can start them:
// the application is read with HR's session, so Row Level Security checks the company.

const IN_PROGRESS = "Screening is already in progress";
const STILL_UNAVAILABLE = "AI is still unavailable, try again in a few minutes";

async function loadHrApplication(applicationId) {
  if (!isUuid(applicationId)) return null;
  const profile = await getCurrentProfile();
  if (profile?.role !== "hr") return null;
  const supabase = await createClient();
  const application = await runSupabase(() =>
    supabase.from("applications").select("id, screening_status").eq("id", applicationId).maybeSingle()
  );
  return application ? { application, profile, supabase } : null;
}

async function runFor(application) {
  if (application.screening_status === "processing") return { error: IN_PROGRESS };
  const testMode = aiTestModeFrom((await cookies()).get(AI_TEST_COOKIE)?.value);
  const { status } = await screenApplication(application.id, { testMode });
  if (status === "busy") return { error: IN_PROGRESS };
  if (status === "pending") return { status, error: STILL_UNAVAILABLE };
  return { status };
}

// "Retry screening" on a Pending row (or one stuck in Queued).
export async function retryScreening(applicationId) {
  try {
    const own = await loadHrApplication(applicationId);
    if (!own) return { error: GENERIC_ERROR };
    if (!["pending", "queued", "processing"].includes(own.application.screening_status)) {
      return { status: own.application.screening_status };
    }
    return await runFor(own.application);
  } catch {
    return { error: GENERIC_ERROR };
  }
}

// "Re-screen candidates" after the job's requirements change (Feature 03): any finished screening.
export async function rescreenApplication(applicationId) {
  try {
    const own = await loadHrApplication(applicationId);
    if (!own) return { error: GENERIC_ERROR };
    return await runFor(own.application);
  } catch {
    return { error: GENERIC_ERROR };
  }
}

// Manual review of a CV that could not be read: an HR note marked is_manual_review.
export async function saveManualReviewNote(applicationId, body) {
  const text = String(body || "").trim();
  if (!text) return { error: "Write a short note first" };
  if (text.length > 2000) return { error: "Notes can be up to 2,000 characters" };
  try {
    const own = await loadHrApplication(applicationId);
    if (!own) return { error: GENERIC_ERROR };
    await runSupabase(() =>
      own.supabase.from("notes").insert({
        application_id: own.application.id,
        author_id: own.profile.id,
        author_name: own.profile.full_name,
        body: text,
        is_manual_review: true,
      })
    );
    return { message: "Note saved" };
  } catch {
    return { error: "Couldn't save, try again" };
  }
}

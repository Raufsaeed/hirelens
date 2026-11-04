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

// screenApplication refuses ("busy") while another screening of this application is running,
// unless it has been stuck in "processing" for a while.
async function runFor(application) {
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

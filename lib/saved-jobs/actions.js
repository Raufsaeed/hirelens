"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";

// Save and unsave a job (Feature 21), with the candidate's own session.
// Row Level Security allows only candidates, only their own rows, and saving only Open jobs.

const SAVE_ERROR = "Couldn't save this job, try again";
const UNIQUE_VIOLATION = "23505";

export async function saveJob(jobId) {
  if (!isUuid(jobId)) return { error: SAVE_ERROR };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return { error: SAVE_ERROR };
    const supabase = await createClient();
    try {
      await runSupabase(() => supabase.from("saved_jobs").insert({ candidate_id: profile.id, job_id: jobId }));
    } catch (error) {
      // Saved already (a double click): keep the one row.
      if (error?.code !== UNIQUE_VIOLATION) throw error;
    }
    return { saved: true, message: "Job saved" };
  } catch {
    return { error: SAVE_ERROR };
  }
}

export async function unsaveJob(jobId) {
  if (!isUuid(jobId)) return { error: SAVE_ERROR };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return { error: SAVE_ERROR };
    const supabase = await createClient();
    await runSupabase(() => supabase.from("saved_jobs").delete().eq("candidate_id", profile.id).eq("job_id", jobId));
    return { saved: false, message: "Removed from saved jobs" };
  } catch {
    return { error: SAVE_ERROR };
  }
}

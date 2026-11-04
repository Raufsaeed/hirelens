"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";

// Candidate Search (Feature 13): name or email, part of a word, not case-sensitive, from 2 characters.
// Only applications to the HR user's own company's jobs (Row Level Security, plus the company filter).
// Returns { results: [{ name, email, applications: [{ id, jobTitle, score, status, screeningStatus }] }] }.

const MIN_SEARCH_LENGTH = 2;
const SEARCH_ERROR = "Couldn't search right now, try again";

// Characters that mean something in Supabase filters are removed, so the search is only text.
function cleanSearch(text) {
  return String(text || "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
}

export async function searchCandidates(query) {
  const search = cleanSearch(query);
  if (search.length < MIN_SEARCH_LENGTH) return { results: [] };

  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return { error: SEARCH_ERROR };
    const supabase = await createClient();
    const rows = await runSupabase(() =>
      supabase
        .from("applications")
        .select("id, candidate_name, candidate_email, status, screening_status, applied_at, jobs!inner(title, company_id), screenings(score)")
        .eq("jobs.company_id", profile.company_id)
        .or(`candidate_name.ilike.%${search}%,candidate_email.ilike.%${search}%`)
        .order("applied_at", { ascending: false })
        .limit(50)
    );

    // One result per candidate (by email), with every job they applied to.
    const byEmail = new Map();
    for (const row of rows || []) {
      const key = row.candidate_email.toLowerCase();
      if (!byEmail.has(key)) byEmail.set(key, { name: row.candidate_name, email: row.candidate_email, applications: [] });
      const screening = Array.isArray(row.screenings) ? row.screenings[0] : row.screenings;
      byEmail.get(key).applications.push({
        id: row.id,
        jobTitle: row.jobs.title,
        score: row.screening_status === "done" ? screening?.score ?? null : null,
        status: row.status,
        screeningStatus: row.screening_status,
      });
    }
    return { results: [...byEmail.values()] };
  } catch {
    return { error: SEARCH_ERROR };
  }
}

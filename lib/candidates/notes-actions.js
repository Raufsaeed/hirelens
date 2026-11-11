"use server";

import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";
import { validateNote } from "@/lib/candidates/note-validation";

// HR notes on a candidate (Feature 14), including the manual review of an unreadable CV (Feature 11).
// Saved with HR's session: Row Level Security checks the company and that the author is this user.
// Notes can't be edited or deleted in this version.

export async function addNote(applicationId, body, { manualReview = false } = {}) {
  const text = String(body || "").trim();
  const invalid = validateNote(text);
  if (invalid) return { error: invalid };
  if (!isUuid(applicationId)) return { error: "Couldn't save note, try again" };
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return { error: "Couldn't save note, try again" };
    const supabase = await createClient();
    await runSupabase(() =>
      supabase.from("notes").insert({
        application_id: applicationId,
        author_id: profile.id,
        author_name: profile.full_name,
        body: text,
        is_manual_review: manualReview,
      })
    );
    return { message: "Note saved" };
  } catch {
    return { error: "Couldn't save note, try again" };
  }
}

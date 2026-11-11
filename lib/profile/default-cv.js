import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { safePdfName } from "@/lib/applications/validation";
import { checkCvContent } from "@/lib/validation/cv-content";

// The candidate's profile details and default CV (Feature 20).
// The default CV lives in the private cvs bucket at {candidate_id}/default/{file}.pdf.
// Files are saved and removed by the server only; the path is always built from the session's id.

export async function getCandidateProfile(candidateId) {
  const supabase = await createClient();
  return runSupabase(() =>
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, city, headline, default_cv_path")
      .eq("id", candidateId)
      .maybeSingle()
  );
}

// Saves a checked PDF as the default CV. A new file replaces the old one.
export async function saveDefaultCv(candidateId, fileName, bytes) {
  const admin = createAdminClient();
  const path = `${candidateId}/default/${safePdfName(fileName)}`;
  const current = await getCandidateProfile(candidateId);
  await runSupabase(() => admin.storage.from("cvs").upload(path, bytes, { contentType: "application/pdf", upsert: true }));
  await runSupabase(() => admin.from("profiles").update({ default_cv_path: path }).eq("id", candidateId));
  // The old default file goes only after the new one is saved, so a failed upload keeps the old CV.
  if (current?.default_cv_path && current.default_cv_path !== path) {
    try {
      await runSupabase(() => admin.storage.from("cvs").remove([current.default_cv_path]));
    } catch {
      // The new CV is saved; an old file left behind is removed with the account later.
      console.error("Could not remove an old default CV");
    }
  }
  return path;
}

export async function removeDefaultCv(candidateId) {
  const admin = createAdminClient();
  const current = await getCandidateProfile(candidateId);
  if (!current?.default_cv_path) return;
  // The file goes first, so a failure leaves the profile as it was and "try again" is true.
  await runSupabase(() => admin.storage.from("cvs").remove([current.default_cv_path]));
  await runSupabase(() => admin.from("profiles").update({ default_cv_path: null }).eq("id", candidateId));
}

// Copies the default CV into one application's folder, so later changes never touch a sent CV.
// The file is checked again (hidden text, prompt injection): the stored file may have been swapped,
// or uploaded before these checks existed.
// Returns { path }, { gone: true } when there is no default CV any more, or { error } when it is refused.
export async function copyDefaultCvTo(candidateId, jobId) {
  const current = await getCandidateProfile(candidateId);
  const source = current?.default_cv_path;
  if (!source?.startsWith(`${candidateId}/default/`)) return { gone: true };
  const admin = createAdminClient();
  let file;
  try {
    file = await runSupabase(() => admin.storage.from("cvs").download(source));
  } catch (error) {
    // The file was deleted while the candidate was applying.
    const missing = [400, 404].includes(Number(error?.status ?? error?.statusCode)) || /not.?found/i.test(error?.message || "");
    if (missing) return { gone: true };
    throw error;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentError = await checkCvContent(bytes);
  if (contentError) return { error: contentError };
  const target = `${candidateId}/applications/${jobId}/${source.split("/").pop()}`;
  await runSupabase(() => admin.storage.from("cvs").upload(target, bytes, { contentType: "application/pdf", upsert: true }));
  return { path: target };
}

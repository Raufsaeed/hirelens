import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getApplyContext } from "@/lib/applications/apply-context";
import {
  ALREADY_APPLIED_ERROR,
  CV_TOO_BIG_ERROR,
  MAX_CV_BYTES,
  PDF_ONLY_ERROR,
  checkCvFile,
  hasPdfHeader,
  safePdfName,
  validateApplication,
} from "@/lib/applications/validation";
import { GENERIC_ERROR, normalizeEmail } from "@/lib/auth/validation";
import { isUuid } from "@/lib/uuid";
import { copyDefaultCvTo } from "@/lib/profile/default-cv";
import { DEFAULT_CV_GONE_ERROR } from "@/lib/profile/validation";
import { checkCvContent } from "@/lib/validation/cv-content";

// Saves one application (Feature 08). Every check runs again here, because the browser can't be trusted:
// job still open and before its deadline, not applied before, real PDF under 5 MB, required fields,
// and no hidden text or prompt injection in the CV.
// Returns { applicationId } or { error, errors }.

const UPLOAD_ERROR = "Your CV didn't upload, please try again";
const UNIQUE_VIOLATION = "23505";

export async function submitApplication(profile, formData) {
  const jobId = String(formData.get("jobId") || "");
  const values = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: normalizeEmail(formData.get("email")),
    phone: String(formData.get("phone") || "").trim(),
    coverNote: String(formData.get("coverNote") || "").trim(),
  };
  const cv = formData.get("cv");
  // "default": use the default CV from My Profile (Feature 20) instead of an uploaded file.
  const useDefaultCv = formData.get("cvChoice") === "default";

  const errors = validateApplication(values);
  if (errors) return { errors };
  if (!isUuid(jobId)) return { error: GENERIC_ERROR };

  let bytes = null;
  if (!useDefaultCv) {
    const fileError = checkCvFile(cv instanceof File ? cv : null);
    if (fileError) return { errors: { cv: fileError } };
    bytes = new Uint8Array(await cv.arrayBuffer());
    if (bytes.length > MAX_CV_BYTES) return { errors: { cv: CV_TOO_BIG_ERROR } };
    if (!hasPdfHeader(bytes)) return { errors: { cv: PDF_ONLY_ERROR } };
    const contentError = await checkCvContent(bytes);
    if (contentError) return { errors: { cv: contentError } };
  }

  // The job is still Open, its deadline hasn't passed and this candidate hasn't applied.
  const context = await getApplyContext({ jobId, candidateId: profile.id });
  if (!context.job) return { error: GENERIC_ERROR };
  if (context.blocked) return { error: context.blocked, applied: Boolean(context.applied) };

  // 1. Save the CV in the private bucket, in the candidate's own folder. A default CV is copied,
  // so replacing or deleting it later never changes the CV sent with this application.
  const admin = createAdminClient();
  let cvPath;
  try {
    if (useDefaultCv) {
      const copy = await copyDefaultCvTo(profile.id, jobId);
      if (copy.gone) return { error: DEFAULT_CV_GONE_ERROR, defaultCvGone: true };
      if (copy.error) return { error: copy.error };
      cvPath = copy.path;
    } else {
      cvPath = `${profile.id}/applications/${jobId}/${safePdfName(cv.name)}`;
      await runSupabase(() =>
        admin.storage.from("cvs").upload(cvPath, bytes, { contentType: "application/pdf", upsert: true })
      );
    }
  } catch {
    return { error: UPLOAD_ERROR };
  }

  // 2. Create the application. Inserts are server only (supabase/sql/08-apply-with-cv-server-only.sql),
  // so every check above can't be skipped; candidate_id always comes from the session.
  let application;
  try {
    application = await runSupabase(() =>
      admin
        .from("applications")
        .insert({
          job_id: jobId,
          candidate_id: profile.id,
          candidate_name: values.fullName,
          candidate_email: values.email,
          cv_file_path: cvPath,
          phone: values.phone,
          cover_note: values.coverNote || null,
        })
        .select("id")
        .single()
    );
  } catch (error) {
    // Already applied: the file at this path belongs to the saved application, so keep it.
    if (error?.code === UNIQUE_VIOLATION) return { error: ALREADY_APPLIED_ERROR, applied: true };
    await admin.storage.from("cvs").remove([cvPath]);
    return { error: GENERIC_ERROR };
  }

  // 3. The first history row: from empty to Applied. If it fails, undo the application.
  try {
    await runSupabase(() =>
      admin.from("status_history").insert({ application_id: application.id, from_status: null, to_status: "applied" })
    );
  } catch {
    await admin.from("applications").delete().eq("id", application.id);
    await admin.storage.from("cvs").remove([cvPath]);
    return { error: GENERIC_ERROR };
  }

  // The route starts AI screening (Feature 11) in the background for this "queued" application.
  return { applicationId: application.id };
}

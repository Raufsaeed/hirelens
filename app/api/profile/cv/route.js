import { getCurrentProfile } from "@/lib/auth/current-user";
import { CV_TOO_BIG_ERROR, MAX_CV_BYTES, PDF_ONLY_ERROR, checkCvFile, hasPdfHeader } from "@/lib/applications/validation";
import { saveDefaultCv } from "@/lib/profile/default-cv";
import { SAVE_ERROR, cvFileName } from "@/lib/profile/validation";
import { checkCvContent } from "@/lib/validation/cv-content";

// POST /api/profile/cv: the candidate uploads or replaces their default CV (Feature 20).
// A route (not a server action) so the browser can show upload progress. Same rules as any CV:
// a real PDF under 5 MB with no hidden text or prompt injection, saved in the private cvs bucket.
export async function POST(request) {
  const fail = (message, status = 400) => Response.json({ error: message }, { status });
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") return fail("Please log in as a candidate", 401);
    if (Number(request.headers.get("content-length") || 0) > MAX_CV_BYTES + 64 * 1024) return fail(CV_TOO_BIG_ERROR, 413);

    const file = (await request.formData()).get("cv");
    const fileError = checkCvFile(file instanceof File ? file : null);
    if (fileError) return fail(fileError);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > MAX_CV_BYTES) return fail(CV_TOO_BIG_ERROR);
    if (!hasPdfHeader(bytes)) return fail(PDF_ONLY_ERROR);
    const contentError = await checkCvContent(bytes);
    if (contentError) return fail(contentError);

    const path = await saveDefaultCv(profile.id, file.name, bytes);
    return Response.json({ fileName: cvFileName(path), message: "CV uploaded" });
  } catch {
    return fail(SAVE_ERROR, 500);
  }
}

import { after } from "next/server";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { GENERIC_ERROR } from "@/lib/auth/validation";
import { submitApplication } from "@/lib/applications/submit";
import { CV_TOO_BIG_ERROR, MAX_CV_BYTES } from "@/lib/applications/validation";
import { AI_TEST_COOKIE, aiTestModeFrom } from "@/lib/ai/test-mode";
import { screenApplication } from "@/lib/screening/run";
import { notifyApplicationReceived } from "@/lib/email/notify";

// POST /api/applications: the apply form sends the details and the PDF CV here.
// A route (not a server action) so the browser can show upload progress for files up to 5 MB.
export async function POST(request) {
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "candidate") {
      return Response.json({ error: "Please log in as a candidate to apply" }, { status: 401 });
    }

    // Refuse very large requests before reading them (5 MB CV plus a little for the text fields).
    const size = Number(request.headers.get("content-length") || 0);
    if (size > MAX_CV_BYTES + 64 * 1024) {
      return Response.json({ errors: { cv: CV_TOO_BIG_ERROR } }, { status: 413 });
    }

    const result = await submitApplication(profile, await request.formData());
    if (!result.applicationId) return Response.json(result, { status: 400 });

    // AI screening (Feature 11) runs in the background after the response; the candidate doesn't wait.
    const testMode = aiTestModeFrom(request.cookies.get(AI_TEST_COOKIE)?.value);
    after(() => screenApplication(result.applicationId, { testMode }));
    // "Your application to ... was received" (Feature 23), also sent after the response.
    await notifyApplicationReceived(result.applicationId);
    return Response.json(result, { status: 201 });
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

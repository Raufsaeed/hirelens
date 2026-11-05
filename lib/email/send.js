import "server-only";
import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { callWithRetry } from "@/lib/retry";
import { runSupabase } from "@/lib/supabase/run";

// Sends one email with Resend and logs it in the notifications table (Feature 23).
// Never throws: a failed email must never block or undo the action that caused it.

// Resend's test sender. A free Resend account can only send to its own account email.
const FROM = "HireLens <onboarding@resend.dev>";
const CAPTURE_FILE = path.join(tmpdir(), "hirelens-emails.jsonl");

let resendClient;
function resend() {
  resendClient ||= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

async function deliver(to, message, testMode) {
  if (testMode === "capture") {
    await appendFile(CAPTURE_FILE, `${JSON.stringify({ to, ...message })}\n`);
    return;
  }
  if (testMode === "fail") throw new Error("Resend unavailable (test mode)");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  await callWithRetry("resend", async () => {
    const { data, error } = await resend().emails.send({ from: FROM, to, ...message });
    if (error) {
      const failure = new Error(error.message || "Resend error");
      failure.status = error.statusCode ?? null;
      throw failure;
    }
    if (!data?.id) throw new Error("Resend returned no email id");
  });
}

// log: { userId, type, applicationId?, interviewId? }. Returns true when the email went out.
export async function sendEmail({ to, message, log, testMode }) {
  let errorMessage = null;
  try {
    await deliver(to, message, testMode);
  } catch (error) {
    errorMessage = String(error?.message || "Email failed").slice(0, 500);
  }
  try {
    await runSupabase(() =>
      createAdminClient()
        .from("notifications")
        .insert({
          user_id: log.userId,
          type: log.type,
          application_id: log.applicationId || null,
          interview_id: log.interviewId || null,
          status: errorMessage ? "failed" : "sent",
          error_message: errorMessage,
        })
    );
  } catch {
    console.error("Could not log an email:", log.type);
  }
  return !errorMessage;
}

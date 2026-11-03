import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import { callWithRetry, getErrorStatus, CallLimitError } from "@/lib/retry";

// Development checks for /dev-check. Each check returns { name, ok, error }.
// Errors are short, friendly messages that name a variable at most, never a key value.

function missingVariable(names) {
  const missing = names.filter((name) => !process.env[name]);
  return missing.length ? `${missing.join(", ")} missing in .env.local` : null;
}

// Turns an SDK error into a short message without raw error text.
function friendlyError(error, keyName, serviceName) {
  if (error instanceof CallLimitError) return "Too many checks, wait a minute";
  const status = getErrorStatus(error);
  if (status === 400 || status === 401 || status === 403) {
    return `Key rejected, check ${keyName} in .env.local`;
  }
  if (status === 429) return `${serviceName} rate limit reached, try later`;
  if (status === null) return `Could not reach ${serviceName}`;
  return `${serviceName} error (${status}), try again`;
}

async function checkGemini() {
  const missing = missingVariable(["GEMINI_API_KEY"]);
  if (missing) return missing;
  try {
    // Reading the model's details proves the key works, without sending a prompt.
    const model = await callWithRetry("gemini", () =>
      getGeminiClient().models.get({ model: GEMINI_MODEL })
    );
    return model?.name ? null : "Unexpected response from Gemini";
  } catch (error) {
    if (getErrorStatus(error) === 404) return `Model ${GEMINI_MODEL} not found`;
    return friendlyError(error, "GEMINI_API_KEY", "Gemini");
  }
}

async function checkSupabase() {
  const missing = missingVariable([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  if (missing) return missing;
  try {
    // Public auth settings endpoint: works only with a valid URL and publishable key.
    await callWithRetry("supabase", async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
        { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY } }
      );
      if (!response.ok) {
        const error = new Error("Supabase request failed");
        error.status = response.status;
        throw error;
      }
    });
    return null;
  } catch (error) {
    if (error instanceof TypeError) {
      return "Could not reach Supabase, check NEXT_PUBLIC_SUPABASE_URL";
    }
    return friendlyError(error, "NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase");
  }
}

// Checks a bucket exists and has the right privacy (cvs private, logos public).
async function checkBucket(bucketName, shouldBePublic) {
  const missing = missingVariable([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  if (missing) return missing;
  try {
    const bucket = await callWithRetry("supabase", async () => {
      const { data, error } = await createAdminClient().storage.getBucket(bucketName);
      if (error) throw error;
      return data;
    });
    if (bucket.public !== shouldBePublic) {
      return `Bucket ${bucketName} must be ${shouldBePublic ? "public" : "private"}`;
    }
    return null;
  } catch (error) {
    if (getErrorStatus(error) === 404 || /not found/i.test(error?.message || "")) {
      return `Bucket ${bucketName} not found`;
    }
    return friendlyError(error, "SUPABASE_SERVICE_ROLE_KEY", "Supabase");
  }
}

export async function runDevChecks() {
  const checks = [
    ["Gemini", checkGemini()],
    ["Supabase", checkSupabase()],
    ["cvs bucket (private)", checkBucket("cvs", false)],
    ["logos bucket (public)", checkBucket("logos", true)],
  ];
  const errors = await Promise.all(checks.map(([, check]) => check));
  return checks.map(([name], index) => ({
    name,
    ok: !errors[index],
    error: errors[index] || null,
  }));
}

// Shared helper for every outside API call (Gemini, Supabase, Resend).
// - Retries on 429, server errors and network failures: waits 1s, 2s, then 4s.
// - Keeps a per-service call limit so a bug or loop can't make many calls.

const RETRY_DELAYS_MS = [1000, 2000, 4000];
const ONE_MINUTE_MS = 60 * 1000;

// Most calls allowed per minute for each service (Supabase runs on every page load).
const CALLS_PER_MINUTE = { gemini: 30, resend: 30, supabase: 600 };
const DEFAULT_CALLS_PER_MINUTE = 30;

// service name -> timestamps of recent calls (kept in server memory)
const recentCalls = new Map();

export class CallLimitError extends Error {
  constructor(service) {
    super(`Too many ${service} calls. Please wait a minute and try again.`);
    this.name = "CallLimitError";
  }
}

function checkCallLimit(service) {
  const now = Date.now();
  const calls = (recentCalls.get(service) || []).filter(
    (time) => now - time < ONE_MINUTE_MS
  );
  if (calls.length >= (CALLS_PER_MINUTE[service] ?? DEFAULT_CALLS_PER_MINUTE)) {
    throw new CallLimitError(service);
  }
  calls.push(now);
  recentCalls.set(service, calls);
}

// Reads the HTTP status from errors thrown by the different SDKs.
export function getErrorStatus(error) {
  const status = Number(error?.status ?? error?.statusCode);
  return Number.isFinite(status) ? status : null;
}

// 429 (rate limit), 5xx (server problem) or no status (network failure) are worth retrying.
// Errors like a wrong key (401/403) or bad input (400) will fail again, so stop at once.
function isRetryable(error) {
  if (error instanceof CallLimitError) return false;
  const status = getErrorStatus(error);
  return status === null || status === 429 || status >= 500;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Runs `call` with retries. `call` must throw when the response is bad.
export async function callWithRetry(service, call) {
  for (let attempt = 0; ; attempt++) {
    checkCallLimit(service);
    try {
      return await call();
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length || !isRetryable(error)) {
        throw error;
      }
      await wait(RETRY_DELAYS_MS[attempt]);
    }
  }
}

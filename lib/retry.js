// Shared helper for every outside API call (Gemini, Supabase, Resend).
// - Retries on 429, server errors and network failures: waits 1s, 2s, then 4s.
// - Keeps a per-service call limit so a bug or loop can't make many calls.

const RETRY_DELAYS_MS = [1000, 2000, 4000];
const ONE_MINUTE_MS = 60 * 1000;

// Most calls allowed per minute for each service (Supabase runs on every page load).
// Gemini is kept at 10 a minute to stay inside the free tier of the flash-lite model.
const CALLS_PER_MINUTE = { gemini: 10, resend: 30, supabase: 600 };
const DEFAULT_CALLS_PER_MINUTE = 30;

// Gemini calls wait for a free slot (screenings queue up) instead of failing; everything else fails fast.
// Waiting still caps the rate, and gives up after this long.
const WAITING_SERVICES = new Set(["gemini"]);
const MAX_WAIT_MS = 2 * ONE_MINUTE_MS;

// service name -> timestamps of recent calls (kept in server memory)
const recentCalls = new Map();

export class CallLimitError extends Error {
  constructor(service) {
    super(`Too many ${service} calls. Please wait a minute and try again.`);
    this.name = "CallLimitError";
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Takes a call slot. Returns how long to wait before a slot frees up (0 when one was taken).
function takeSlot(service) {
  const now = Date.now();
  const calls = (recentCalls.get(service) || []).filter((time) => now - time < ONE_MINUTE_MS);
  recentCalls.set(service, calls);
  if (calls.length < (CALLS_PER_MINUTE[service] ?? DEFAULT_CALLS_PER_MINUTE)) {
    calls.push(now);
    return 0;
  }
  return ONE_MINUTE_MS - (now - calls[0]) + 50;
}

async function checkCallLimit(service) {
  const start = Date.now();
  for (;;) {
    const waitMs = takeSlot(service);
    if (waitMs === 0) return;
    if (!WAITING_SERVICES.has(service) || Date.now() - start + waitMs > MAX_WAIT_MS) {
      throw new CallLimitError(service);
    }
    await wait(waitMs);
  }
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

// Runs `call` with retries. `call` must throw when the response is bad.
export async function callWithRetry(service, call) {
  for (let attempt = 0; ; attempt++) {
    await checkCallLimit(service);
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

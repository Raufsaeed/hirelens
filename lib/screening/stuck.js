// A screening is stuck when it has been Queued or "AI is checking" for over 5 minutes, for example because
// the server stopped or Vercel's time limit cut it off. HR can then retry it.
// The time comes from the application's updated_at: the same rule screenApplication uses to take a
// stuck screening over again, so the Retry button and the server always agree.

export const STUCK_AFTER_MS = 5 * 60 * 1000;

export function isScreeningStuck({ screening_status: status, updated_at: updatedAt }, now = Date.now()) {
  if (!["queued", "processing"].includes(status) || !updatedAt) return false;
  return now - Date.parse(updatedAt) > STUCK_AFTER_MS;
}

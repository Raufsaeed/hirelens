// Development-only switch for end-to-end tests, set with the "hl_ai_test" cookie. Ignored in production.
// - "fixture:<name>": answer with the saved response tests/e2e/fixtures/gemini-<name>.json (no API call),
//   so tests don't use the Gemini free quota.
// - "unavailable" / "invalid-json": fake a Gemini failure.
export const AI_TEST_COOKIE = "hl_ai_test";
const FAILURE_MODES = ["unavailable", "invalid-json"];

// Returns { kind: "fixture", name } or { kind: "unavailable" | "invalid-json" }, or null (use real Gemini).
export function aiTestModeFrom(cookieValue) {
  if (process.env.NODE_ENV === "production" || !cookieValue) return null;
  if (FAILURE_MODES.includes(cookieValue)) return { kind: cookieValue };
  const fixture = /^fixture:([a-z0-9-]{1,40})$/.exec(cookieValue);
  return fixture ? { kind: "fixture", name: fixture[1] } : null;
}

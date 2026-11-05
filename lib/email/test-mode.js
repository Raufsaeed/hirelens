// Development-only switch for end-to-end tests, set with the "hl_email_test" cookie. Ignored in production.
// - "capture": save each email to a temp file instead of sending it (tests never call Resend).
// - "fail": fake Resend being down, so the email is logged as failed.
export const EMAIL_TEST_COOKIE = "hl_email_test";
const MODES = ["capture", "fail"];

export function emailTestModeFrom(cookieValue) {
  if (process.env.NODE_ENV === "production") return null;
  return MODES.includes(cookieValue) ? cookieValue : null;
}

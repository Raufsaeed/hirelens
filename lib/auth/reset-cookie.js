// Short-lived marker set only after a valid reset link was opened.
// The Set new password page and action require it, so an ordinary session can't skip the email link.
export const RESET_COOKIE = "hl_password_reset";
export const RESET_COOKIE_MAX_AGE = 15 * 60; // seconds

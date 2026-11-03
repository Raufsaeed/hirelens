import { isStrongPassword, PASSWORD_ERROR } from "@/lib/auth/password";

// Input checks shared by the forms (as the user types) and the server actions (on submit).

export const REQUIRED_ERROR = "This field is required";
export const EMAIL_ERROR = "Please enter a valid email";
export const GENERIC_ERROR = "Something went wrong, please try again";

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

// Returns { field: message } for every problem, or null when all is fine.
export function validateSignUp({ fullName, email, password, companyName }, role) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = REQUIRED_ERROR;
  if (!email?.trim()) errors.email = REQUIRED_ERROR;
  else if (!isValidEmail(email)) errors.email = EMAIL_ERROR;
  if (!password) errors.password = REQUIRED_ERROR;
  else if (!isStrongPassword(password)) errors.password = PASSWORD_ERROR;
  if (role === "hr" && !companyName?.trim()) errors.companyName = REQUIRED_ERROR;
  return Object.keys(errors).length ? errors : null;
}

export function validateLogIn({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = REQUIRED_ERROR;
  else if (!isValidEmail(email)) errors.email = EMAIL_ERROR;
  if (!password) errors.password = REQUIRED_ERROR;
  return Object.keys(errors).length ? errors : null;
}

export function validateEmailOnly(email) {
  if (!email?.trim()) return { email: REQUIRED_ERROR };
  if (!isValidEmail(email)) return { email: EMAIL_ERROR };
  return null;
}

export function validateNewPassword({ password, confirmPassword }) {
  const errors = {};
  if (!password) errors.password = REQUIRED_ERROR;
  else if (!isStrongPassword(password)) errors.password = PASSWORD_ERROR;
  if (!confirmPassword) errors.confirmPassword = REQUIRED_ERROR;
  else if (password && confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
  return Object.keys(errors).length ? errors : null;
}

import { REQUIRED_ERROR } from "@/lib/auth/validation";
import { MAX_PHONE_LENGTH } from "@/lib/applications/validation";
import { blockedFields } from "@/lib/validation/injection";

// My Profile checks (Feature 20), shared by the browser and the server.

export const MAX_HEADLINE = 100;
const MAX_CITY = 100;
const HEADLINE_ERROR = "Headline can be up to 100 characters";
export const SAVE_ERROR = "Couldn't save, try again";
export const DEFAULT_CV_GONE_ERROR = "Your default CV is no longer available. Please upload a CV";

// Only the full name is required; applying still works with an incomplete profile.
export function validateProfile({ fullName, phone, city, headline }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = REQUIRED_ERROR;
  if ((phone || "").trim().length > MAX_PHONE_LENGTH) errors.phone = "Enter a shorter phone number";
  if ((city || "").trim().length > MAX_CITY) errors.city = "City can be up to 100 characters";
  if ((headline || "").trim().length > MAX_HEADLINE) errors.headline = HEADLINE_ERROR;
  Object.assign(errors, blockedFields({ headline }, ["headline"]));
  return Object.keys(errors).length ? errors : null;
}

// "abc-id/default/ali-cv.pdf" -> "ali-cv.pdf"
export function cvFileName(path) {
  return path ? path.split("/").pop() : null;
}

import { BLOCKED_TEXT_ERROR, isBlockedText } from "@/lib/validation/injection";

// Interview feedback checks (Feature 17), shared by the form and the server action.

export const MISSING_ERROR = "Please add a rating and a recommendation";
export const MAX_FEEDBACK_LENGTH = 2000;

export const RECOMMENDATIONS = [
  { value: "offer", label: "Offer" },
  { value: "reject", label: "Reject" },
  { value: "another_round", label: "Another round" },
];

export function recommendationLabel(value) {
  return RECOMMENDATIONS.find((item) => item.value === value)?.label || "";
}

// values: { rating, strengths, concerns, recommendation }. Returns an error message or null.
export function validateFeedback(values) {
  const rating = Number(values.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return MISSING_ERROR;
  if (!RECOMMENDATIONS.some((item) => item.value === values.recommendation)) return MISSING_ERROR;
  for (const field of ["strengths", "concerns"]) {
    if (String(values[field] ?? "").trim().length > MAX_FEEDBACK_LENGTH) {
      return `Keep ${field} under ${MAX_FEEDBACK_LENGTH} characters`;
    }
    if (isBlockedText(values[field])) return BLOCKED_TEXT_ERROR;
  }
  return null;
}

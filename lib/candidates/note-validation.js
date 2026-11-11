import { BLOCKED_TEXT_ERROR, isBlockedText } from "@/lib/validation/injection";

// HR note checks (Feature 14, and the manual review note of Feature 11), shared by the browser and the server.

export const MAX_NOTE = 2000;

// Returns an error message, or null when the note can be saved.
export function validateNote(body) {
  const text = String(body || "").trim();
  if (!text) return "Note can't be empty";
  if (text.length > MAX_NOTE) return "Notes can be up to 2,000 characters";
  if (isBlockedText(text)) return BLOCKED_TEXT_ERROR;
  return null;
}

import { EMAIL_ERROR, REQUIRED_ERROR, isValidEmail } from "@/lib/auth/validation";

// Apply form and CV checks, shared by the browser (before upload) and the server (on submit).

export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const MAX_COVER_NOTE = 500;
export const MAX_PHONE_LENGTH = 30;

export const PDF_ONLY_ERROR = "Only PDF files are accepted";
export const CV_TOO_BIG_ERROR = "File must be under 5 MB";
export const COVER_NOTE_ERROR = "Cover note can be up to 500 characters";
export const ALREADY_APPLIED_ERROR = "You have already applied to this job";
// A candidate can withdraw only while the application is Applied or Shortlisted (Feature 10).
export const WITHDRAW_STAGES = ["applied", "shortlisted"];
export const WITHDRAW_ERROR = "You can't withdraw at this stage";

export const JOB_CLOSED_ERROR = "This job is no longer accepting applications";

export function deadlinePassedError(shortDate) {
  return `Applications for this job closed on ${shortDate}`;
}

// Checks the file's name, type and size. Returns a message, or null when the file is fine.
export function checkCvFile(file) {
  if (!file) return REQUIRED_ERROR;
  const looksLikePdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!looksLikePdf) return PDF_ONLY_ERROR;
  if (file.size > MAX_CV_BYTES) return CV_TOO_BIG_ERROR;
  return null;
}

// Real PDFs start with "%PDF-". The server checks this, because a file name can lie.
export function hasPdfHeader(bytes) {
  return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

export function validateApplication({ fullName, email, phone, coverNote }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = REQUIRED_ERROR;
  if (!email?.trim()) errors.email = REQUIRED_ERROR;
  else if (!isValidEmail(email)) errors.email = EMAIL_ERROR;
  if (!phone?.trim()) errors.phone = REQUIRED_ERROR;
  else if (phone.trim().length > MAX_PHONE_LENGTH) errors.phone = "Enter a shorter phone number";
  if ((coverNote || "").length > MAX_COVER_NOTE) errors.coverNote = COVER_NOTE_ERROR;
  return Object.keys(errors).length ? errors : null;
}

// "My CV (final).pdf" -> "My-CV-final.pdf": safe in a storage path, always ending in .pdf.
export function safePdfName(name) {
  const base = String(name || "cv")
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "cv"}.pdf`;
}

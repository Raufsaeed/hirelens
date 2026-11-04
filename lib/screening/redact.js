// Removes personal details from CV text before anything is sent to AI:
// the candidate's name, emails, phone numbers, links to photos and address lines.

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// 9 or more digits, allowing spaces, dashes, dots, brackets and a leading +, for example +92 300 1234567.
const PHONE = /\+?\(?\d[\d\s().-]{7,}\d/g;
const YEAR_MONTH = /\b(?:19|20)\d{2}[-/.](?:0[1-9]|1[0-2])\b/;
const PHOTO_LINK = /\S+\.(?:jpe?g|png|gif|webp|heic)(?:\?\S*)?/gi;
// Lines that are clearly a home address.
const ADDRESS_LINE =
  /^.*\b(?:address|house\s*(?:no\.?|#)?\s*\d|flat\s*(?:no\.?|#)?\s*\d|street\s*\d|st\.\s*\d|road|block\s+[a-z0-9]|sector\s+[a-z0-9]|p\.?o\.?\s*box|postal code|zip)\b.*$/gim;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactCvText(text, { name } = {}) {
  let clean = String(text || "");

  clean = clean.replace(EMAIL, "[email removed]");
  clean = clean.replace(PHOTO_LINK, "[photo link removed]");
  clean = clean.replace(ADDRESS_LINE, "[address removed]");
  clean = clean.replace(PHONE, (match) => {
    // Date ranges such as "2025-03 - 2025-08" are experience dates, not phone numbers.
    if (YEAR_MONTH.test(match)) return match;
    return match.replace(/\D/g, "").length >= 9 ? "[phone removed]" : match;
  });

  // The full name, then each part of it (3+ letters), anywhere in the text.
  const parts = String(name || "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
  for (const piece of [String(name || "").trim(), ...parts].filter(Boolean)) {
    clean = clean.replace(new RegExp(`\\b${escapeRegExp(piece)}\\b`, "gi"), "[name removed]");
  }

  return clean.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

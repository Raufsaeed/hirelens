// Checks each AI response against its fixed format. Throws InvalidAiResponse when anything is off,
// so screening retries once and then marks the application "pending".

export class InvalidAiResponse extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidAiResponse";
  }
}

export const RUBRIC_PARTS = [
  { part: "skills_match", max: 35 },
  { part: "experience", max: 40 },
  { part: "education", max: 10 },
  { part: "structure_formatting", max: 5 },
  { part: "contact_summary_links", max: 5 },
  { part: "grammar_clarity", max: 5 },
];

const EXPERIENCE_TYPES = ["job", "internship", "project"];
const DATE = /^(\d{4}-(0[1-9]|1[0-2])|present|)$/;

function fail(message) {
  throw new InvalidAiResponse(message);
}

function isText(value) {
  return typeof value === "string";
}

// {"rubric": [{part, marks, reason}]}: all six parts, whole marks between 0 and each maximum.
export function checkRubric(json) {
  if (!Array.isArray(json?.rubric)) fail("rubric missing");
  return RUBRIC_PARTS.map(({ part, max }) => {
    const item = json.rubric.find((entry) => entry?.part === part);
    if (!item) fail(`rubric part ${part} missing`);
    if (!Number.isInteger(item.marks) || item.marks < 0 || item.marks > max) fail(`marks for ${part} out of range`);
    if (!isText(item.reason)) fail(`reason for ${part} missing`);
    return { part, marks: item.marks, max, reason: item.reason.trim().slice(0, 300) };
  });
}

// Lower case, letters and numbers only: for checking that an evidence quote is in the CV.
function normalize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// The quote is in the CV, word for word or very nearly (AI must not invent evidence).
function quoteIsInCv(evidence, cvText) {
  const quote = normalize(evidence);
  const cv = normalize(cvText);
  if (!quote) return false;
  if (cv.includes(quote)) return true;
  const words = quote.split(" ");
  const cvWords = new Set(cv.split(" "));
  return words.filter((word) => cvWords.has(word)).length / words.length >= 0.8;
}

// {"requirements": [{name, type, found, evidence}]}: every job requirement, each found one with evidence.
// A "found" with no matching quote in the CV is turned into "missing".
export function checkRequirements(json, jobRequirements, cvText) {
  if (!Array.isArray(json?.requirements)) fail("requirements missing");
  return jobRequirements.map(({ name, type }) => {
    const item = json.requirements.find((entry) => String(entry?.name).toLowerCase() === name.toLowerCase());
    if (!item) fail(`requirement ${name} missing`);
    if (typeof item.found !== "boolean" || !isText(item.evidence)) fail(`requirement ${name} has the wrong shape`);
    const evidence = item.evidence.trim().slice(0, 300);
    const found = item.found && quoteIsInCv(evidence, cvText);
    return { name, type, found, evidence: found ? evidence : "" };
  });
}

// {"experience": [...], "education": [...]}
export function checkExperience(json) {
  if (!Array.isArray(json?.experience) || !Array.isArray(json?.education)) fail("experience or education missing");
  const experience = json.experience.map((item) => {
    if (!isText(item?.title) || !EXPERIENCE_TYPES.includes(item.type)) fail("experience item has the wrong shape");
    if (!isText(item.start) || !isText(item.end) || !DATE.test(item.start) || !DATE.test(item.end)) {
      fail("experience dates have the wrong format");
    }
    if (typeof item.relevant !== "boolean") fail("experience relevant missing");
    return { title: item.title.slice(0, 200), type: item.type, start: item.start, end: item.end, relevant: item.relevant };
  });
  const education = json.education.map((item) => {
    if (!isText(item?.degree) || !isText(item.end)) fail("education item has the wrong shape");
    return { degree: item.degree.slice(0, 200), end: item.end };
  });
  return { experience, education };
}

// {"summary": ["", "", ""]}: exactly three lines.
export function checkSummary(json) {
  const lines = json?.summary;
  if (!Array.isArray(lines) || lines.length !== 3 || !lines.every((line) => isText(line) && line.trim())) {
    fail("summary must be three lines");
  }
  return lines.map((line) => line.trim().slice(0, 300));
}

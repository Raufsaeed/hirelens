import { MAX_REQUIREMENT_LENGTH } from "@/lib/jobs/constants";

// Checks the AI job description (Feature 05) and turns it into the text for the description box.
// Throws when the answer is not usable, so the caller can retry once.

export const DRAFT_FAILED = "Couldn't write a description right now. You can write it yourself or try again";
export const TOO_LITTLE_INPUT = "Add a title and at least one requirement first";

const MIN_WORDS = 120; // "about 150 to 250 words", with some room either way
const MAX_WORDS = 300;
const MAX_SUGGESTIONS = 3;
const MAX_LINES = 10;

// Words that signal a biased preference. A draft with any of them is refused.
const BIASED_WORDS = /\b(young|youthful|native speakers?|mother tongue|males?|females?|married|unmarried|years old|he\/she|his\/her)\b/i;

export class DraftError extends Error {
  constructor(message) {
    super(message);
    this.name = "DraftError";
  }
}

function sentence(value) {
  if (typeof value !== "string" || !value.trim()) throw new DraftError("Empty text in the draft");
  return value.trim();
}

function lines(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) {
    throw new DraftError("A section has no lines or too many");
  }
  return value.map(sentence);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// True when the text mentions the name as a whole word ("Git" matches "Git," but not "GitHub").
function mentions(text, name) {
  return new RegExp(`(^|[^\\w])${escapeRegExp(name)}($|[^\\w])`, "i").test(text);
}

// The three sections joined into the text HR edits.
export function draftText({ about, responsibilities, lookingFor }) {
  return [
    `About the role\n${about}`,
    `Responsibilities\n${responsibilities.map((line) => `- ${line}`).join("\n")}`,
    `What we're looking for\n${lookingFor.map((line) => `- ${line}`).join("\n")}`,
  ].join("\n\n");
}

// json: the AI answer. requirements: HR's requirements [{ name, type }].
// Returns { description, suggestions: [{ name, type }] }.
export function checkDraft(json, requirements) {
  const parts = json?.description;
  if (!parts || typeof parts !== "object") throw new DraftError("Missing description");
  const about = sentence(parts.about_the_role);
  const responsibilities = lines(parts.responsibilities);
  const lookingFor = lines(parts.what_we_are_looking_for);

  const body = [about, ...responsibilities, ...lookingFor].join(" ");
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS || words > MAX_WORDS) throw new DraftError(`Draft has ${words} words`);
  if (BIASED_WORDS.test(body)) throw new DraftError("Draft uses biased language");

  const rawSuggestions = json.suggested_requirements ?? [];
  if (!Array.isArray(rawSuggestions)) throw new DraftError("Suggestions are not a list");

  const known = new Set(requirements.map((item) => item.name.toLowerCase()));
  const suggestions = [];
  for (const item of rawSuggestions) {
    const name = String(item?.name || "").trim().slice(0, MAX_REQUIREMENT_LENGTH);
    if (!name || item?.label !== "suggestion") throw new DraftError("A suggestion is not labelled");
    // An idea HR didn't give must stay out of the description.
    if (mentions(body, name)) throw new DraftError("The draft mentions a suggestion");
    if (known.has(name.toLowerCase())) continue;
    known.add(name.toLowerCase());
    suggestions.push({ name, type: item.type === "must" ? "must" : "nice" });
  }

  return {
    description: draftText({ about, responsibilities, lookingFor }),
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
  };
}

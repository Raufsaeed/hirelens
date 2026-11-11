import { BLOCKED_TEXT_ERROR, isBlockedText } from "@/lib/validation/injection";

// Interview questions (Feature 18): the AI answer check and the "add question" check.
// Shared by the server actions and the questions panel.

export const QUESTIONS_FAILED = "Couldn't generate questions";
export const EMPTY_QUESTION = "Question can't be empty";
export const NO_TYPE = "Please choose a question type";
export const MAX_QUESTION_LENGTH = 500;
export const MAX_HINT_LENGTH = 500;
const MAX_FOCUS_LENGTH = 100;

export const QUESTION_TYPES = [
  { value: "technical", label: "Technical" },
  { value: "behavioural", label: "Behavioural" },
  { value: "project", label: "Project" },
];

// How many of each type AI must return.
const EXPECTED_COUNTS = { technical: 3, behavioural: 3, project: 2 };

// Personal topics a question must never touch. A set with any of them is refused and asked for again.
const PERSONAL_TOPICS =
  /\b(age|how old|years old|born|birthday|religio\w*|pray\w*|church|mosque|caste|married|marriage|marital|spouse|husband|wife|divorc\w*|family plans?|children|kids|pregnan\w*|health|illness|disabilit\w*|medical|gender|nationality|ethnic\w*|where are you from|politic\w*)\b/i;

export class QuestionsError extends Error {
  constructor(message) {
    super(message);
    this.name = "QuestionsError";
  }
}

function text(value, maxLength) {
  if (typeof value !== "string" || !value.trim()) throw new QuestionsError("Empty text in a question");
  return value.trim().slice(0, maxLength);
}

// json: the AI answer. missing: names of requirements the CV is missing.
// Returns the 8 questions as rows, or throws so the caller can retry once.
export function checkQuestions(json, missing) {
  const list = json?.questions;
  if (!Array.isArray(list) || list.length !== 8) throw new QuestionsError("Not 8 questions");

  const questions = list.map((item) => {
    if (!(item?.type in EXPECTED_COUNTS)) throw new QuestionsError("Unknown question type");
    const question = text(item.question, MAX_QUESTION_LENGTH);
    const hint = text(item.good_answer_hint, MAX_HINT_LENGTH);
    if (PERSONAL_TOPICS.test(question) || PERSONAL_TOPICS.test(hint)) throw new QuestionsError("A personal question");
    const focus = typeof item.focus === "string" && item.focus.trim() ? item.focus.trim().slice(0, MAX_FOCUS_LENGTH) : null;
    return { type: item.type, question, good_answer_hint: hint, focus };
  });

  for (const [type, count] of Object.entries(EXPECTED_COUNTS)) {
    if (questions.filter((item) => item.type === type).length !== count) throw new QuestionsError(`Wrong number of ${type}`);
  }

  // At least one question checks a missing requirement.
  if (missing.length) {
    const names = missing.map((name) => name.toLowerCase());
    const coversMissing = questions.some((item) => {
      const where = `${item.focus || ""} ${item.question}`.toLowerCase();
      return names.some((name) => where.includes(name));
    });
    if (!coversMissing) throw new QuestionsError("No question about a missing requirement");
  }

  return questions;
}

// HR's own question: text and a type are required; the hint is optional. Returns an error or null.
export function validateOwnQuestion({ question, type, hint }) {
  const trimmed = String(question ?? "").trim();
  if (!trimmed) return EMPTY_QUESTION;
  if (trimmed.length > MAX_QUESTION_LENGTH) return `Keep the question under ${MAX_QUESTION_LENGTH} characters`;
  if (!QUESTION_TYPES.some((item) => item.value === type)) return NO_TYPE;
  if (String(hint ?? "").trim().length > MAX_HINT_LENGTH) return `Keep the hint under ${MAX_HINT_LENGTH} characters`;
  if (isBlockedText(trimmed) || isBlockedText(hint)) return BLOCKED_TEXT_ERROR;
  return null;
}

// Prompt-injection check, without AI. Shared by the browser (before saving) and the server (on save and CV upload).
// Each sentence gets a suspicion score from a few groups of words. Each group counts once per sentence,
// and a sentence that reaches 5 points blocks the whole text. One mention of "AI" (2 points) never blocks.
// Users only ever see the fixed messages below: never the points, the words found or the rule.

export const BLOCKED_TEXT_ERROR = "This text contains content that isn't allowed. Please remove it and try again.";
export const BLOCKED_CV_ERROR = "This CV contains content that isn't allowed. Please upload a different CV.";
export const HIDDEN_CV_TEXT_ERROR = "This CV contains hidden text. Please upload a clean CV.";

const BLOCK_SCORE = 5;

const GROUPS = [
  // Words that address an AI. "model" and "system" count only when spoken to ("the model", "system note"),
  // because "data models" and "Database Systems" are normal in CVs and job posts.
  {
    points: 2,
    patterns: [
      /\b(ai|assistants?|prompts?|chatgpt|gpt|llms?|gemini|chatbot|bot)\b/,
      /\b(the|dear|hey|hi|you|language|screening) (models?|system)\b/,
      /\bsystem (note|message|prompt|instructions?)\b/,
    ],
  },
  // Commands to change how the AI behaves.
  { points: 2, patterns: [/\b(ignore|override|disregard|forget|pretend)/] },
  // Asking for a score: "score 100", "rate 10/10", "highest score", "full marks", "rate this candidate highest".
  {
    points: 3,
    patterns: [
      // Only a command for a perfect score, so CV lines like "Scored 100% in the exam" or
      // "rated 10/10 by my manager" don't count.
      /\b(score|rate|grade|mark)\b (this|the|my|me|him|her|them|it)? ?(candidate|applicant|cv|resume|profile|person)? ?((as|at) )?(a )?(100 ?(%|\/ ?100|out of 100)?|10 ?(\/ ?10|out of 10))(?![\d/]|\.\d)/,
      // Not after an achievement: "Achieved full marks", "has the highest rating".
      /(?<!\b(achieved|got|get|earned|received|scored|obtained|secured|won|with|has|have|had) (the )?)\b(highest|maximum|max|perfect|full) ?(score|rating|marks?|points)\b/,
      /\b(rate|rank|score|grade|give)\b (this|the|my|me|him|her|them) ?(candidate|applicant|cv|resume|profile|person)? ?(as )?(the )?(highest|best|top|perfect|maximum)\b/,
    ],
  },
  // Commands to delete data.
  { points: 2, patterns: [/\bdelete\b/, /\bremove ?all\b/, /\bdrop\b/] },
  // Fake instruction blocks: "[system ...]", "### instructions", "<prompt>", "previous instructions".
  {
    points: 3,
    patterns: [
      /\[ ?(system|instructions?|prompt|admin|assistant)\b/,
      /#{2,} ?(system|instructions?|prompt)\b/,
      /<\/? ?(prompt|system|instructions?)\b[^>]*>/,
      /\b(previous|prior|above|earlier) (instructions|prompts?)\b/,
    ],
  },
];

// Zero-width spaces, joiners, soft hyphens and direction marks: invisible, so they can hide words.
const INVISIBLE = /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180f\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff\uffa0]/g;

// Lower case, no invisible characters, full-width or styled letters turned into plain ones,
// and dotted letters joined ("a.i." -> "ai") so they don't end a sentence.
function basicClean(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .toLowerCase()
    .replace(/\b(?:[a-z]\.)+[a-z]\b\.?/g, (letters) => letters.replace(/\./g, ""));
}

// One sentence ready to match: single spaces and no separators inside words.
// "i g n o r e" -> "ignore", "ig-nore" -> "ignore".
function normalizeSentence(sentence) {
  return sentence
    .replace(/\s+/g, " ")
    .replace(/\b(?:[a-z0-9][ .\-_*'`|~+]+){2,}[a-z0-9]\b/g, (letters) => letters.replace(/[^a-z0-9]/g, ""))
    .replace(/([a-z])[.\-_*'`|~]+(?=[a-z])/g, "$1")
    .trim();
}

// Sentences end at . ! ? followed by a space. A line break is a soft end: PDF text and long fields wrap
// one sentence over two lines, so each line is checked alone and joined with the next line.
function sentencesOf(text) {
  const lines = basicClean(text).split(/\r?\n|\r/);
  const chunks = lines.flatMap((line, index) => (index + 1 < lines.length ? [line, `${line} ${lines[index + 1]}`] : [line]));
  return chunks
    .flatMap((chunk) => chunk.split(/[.!?]+(?=\s|$)/))
    .map(normalizeSentence)
    .filter(Boolean);
}

function sentenceScore(sentence) {
  let score = 0;
  for (const group of GROUPS) {
    if (group.patterns.some((pattern) => pattern.test(sentence))) score += group.points;
  }
  return score;
}

// The highest sentence score in the text.
function suspicionScore(text) {
  return sentencesOf(text).reduce((highest, sentence) => Math.max(highest, sentenceScore(sentence)), 0);
}

export function isBlockedText(text) {
  return suspicionScore(text) >= BLOCK_SCORE;
}

// Checks some fields of a form. Returns { field: BLOCKED_TEXT_ERROR } for each blocked field, or null.
export function blockedFields(values, fields) {
  const errors = {};
  for (const field of fields) {
    if (isBlockedText(values[field])) errors[field] = BLOCKED_TEXT_ERROR;
  }
  return Object.keys(errors).length ? errors : null;
}

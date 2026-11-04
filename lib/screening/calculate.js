// Everything numeric is calculated here, never by AI (AGENTS.md scoring rules).

// Total out of 100: the six rubric marks added up (each already checked against its maximum).
export function totalScore(rubric) {
  return rubric.reduce((sum, item) => sum + item.marks, 0);
}

function percent(part, whole) {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

// Requirements found ÷ total requirements, plus must-have and nice-to-have separately.
export function matchPercentages(requirementsResult) {
  const share = (items) => percent(items.filter((item) => item.found).length, items.length);
  const must = requirementsResult.filter((item) => item.type === "must");
  const nice = requirementsResult.filter((item) => item.type === "nice");
  return {
    matchPercent: share(requirementsResult),
    mustHaveMatch: must.length ? share(must) : null,
    niceToHaveMatch: nice.length ? share(nice) : null,
  };
}

// "2025-03" -> month number (year * 12 + month). "present" -> this month.
function monthIndex(value, today) {
  if (value === "present") return today.getUTCFullYear() * 12 + today.getUTCMonth();
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
}

// Relevant years: jobs count in full, internships half, projects not at all. "Present" means today.
// Overlapping months are counted once, at the higher weight.
export function relevantYears(experience, today = new Date()) {
  const WEIGHT = { job: 1, internship: 0.5, project: 0 };
  const months = new Map();
  for (const item of experience) {
    const weight = WEIGHT[item.type] ?? 0;
    if (!item.relevant || weight === 0) continue;
    const start = monthIndex(item.start, today);
    const end = monthIndex(item.end, today);
    if (start === null || end === null || end < start) continue;
    for (let month = start; month <= end; month++) {
      months.set(month, Math.max(months.get(month) || 0, weight));
    }
  }
  const total = [...months.values()].reduce((sum, weight) => sum + weight, 0);
  return Math.round((total / 12) * 10) / 10;
}

// Words that mean the same in degree names: "BSCS" = "BS Computer Science", "Bachelor of Science" = "BS".
const DEGREE_ALIASES = [
  [/\bbachelor(?:'s)?\s+of\s+science\b|\bb\.?\s?sc?\b/g, "bs"],
  [/\bbachelor(?:'s)?\s+of\s+engineering\b|\bb\.?\s?e\b/g, "be"],
  [/\bmaster(?:'s)?\s+of\s+science\b|\bm\.?\s?sc?\b/g, "ms"],
  [/\bbscs\b/g, "bs computer science"],
  [/\bbsse\b/g, "bs software engineering"],
  [/\bbsit\b/g, "bs information technology"],
  [/\bcs\b/g, "computer science"],
  [/\bit\b/g, "information technology"],
  [/\bse\b/g, "software engineering"],
];
const FILLER = new Set(["in", "of", "and", "the", "degree", "or", "related", "a"]);

function degreeWords(text) {
  let value = ` ${String(text || "").toLowerCase().replace(/[^a-z0-9' ]+/g, " ")} `;
  for (const [pattern, replacement] of DEGREE_ALIASES) value = value.replace(pattern, replacement);
  return value.split(/\s+/).filter((word) => word && !FILLER.has(word));
}

// Same or equivalent degree: every word of the required degree appears in a degree from the CV.
// Returns the matching degree (or the first degree found) for degree_found.
export function degreeMatch(requiredDegree, education) {
  const degrees = education.map((item) => item.degree).filter(Boolean);
  const required = degreeWords(requiredDegree);
  const matching = required.length
    ? degrees.find((degree) => {
        const words = new Set(degreeWords(degree));
        return required.every((word) => words.has(word));
      })
    : null;
  return { degreeMatch: Boolean(matching), degreeFound: matching || degrees[0] || null };
}

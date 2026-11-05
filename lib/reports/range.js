import { isValidDateString, pakistanToday } from "@/lib/jobs/dates";

// The Reports date range (Feature 19). Days are Pakistan days, like the rest of the app.
// Default: the 1st of this month to today.

export const DATE_ORDER_ERROR = "Start date must be before end date";

export function defaultRange(now = new Date()) {
  const today = pakistanToday(now);
  return { from: `${today.slice(0, 8)}01`, to: today };
}

// Reads ?from= and ?to= from the URL. A missing or broken date falls back to the default.
export function readRange(params) {
  const fallback = defaultRange();
  const from = isValidDateString(params.from) ? params.from : fallback.from;
  const to = isValidDateString(params.to) ? params.to : fallback.to;
  return { from, to, error: from > to ? DATE_ORDER_ERROR : null };
}

// The range as timestamps: from midnight on `from` up to (not including) midnight after `to`.
export function rangeBounds({ from, to }) {
  const end = new Date(`${to}T00:00:00+05:00`);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: new Date(`${from}T00:00:00+05:00`).toISOString(), end: end.toISOString() };
}

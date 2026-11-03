// Deadline dates. "Apply by" ends at 11:59 pm Pakistan time, so every day is counted in Asia/Karachi.

const TIME_ZONE = "Asia/Karachi";
const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_DAYS = 7;

// Today in Pakistan as "YYYY-MM-DD".
export function pakistanToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Whole days from `today` to `date` (both "YYYY-MM-DD"): tomorrow is 1, today is 0.
export function daysUntil(date, today) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
}

// "2026-10-20" -> "20 Oct", with the year only when it is not this year.
export function formatShortDate(date, today) {
  const [year, month, day] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
  return year === Number(today.slice(0, 4)) ? label : `${label} ${year}`;
}

// What the deadline label shows (design/components/DeadlineLabel).
export function deadlineInfo(applyBy, today) {
  if (!applyBy) return null;
  const days = daysUntil(applyBy, today);
  const shortDate = formatShortDate(applyBy, today);
  if (days < 0) return { kind: "closed", text: `Applications closed on ${shortDate}` };
  if (days === 0) return { kind: "soon", text: "Last day to apply" };
  if (days <= SOON_DAYS) {
    return { kind: "soon", text: `Apply by ${shortDate} · ${days} ${days === 1 ? "day" : "days"} left` };
  }
  return { kind: "plain", text: `Apply by ${shortDate}` };
}

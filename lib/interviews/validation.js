import { REQUIRED_ERROR } from "@/lib/auth/validation";

// Schedule form checks (Feature 16), shared by the form and the server action.
// Dates and times are Pakistan time (Asia/Karachi, UTC+5, no daylight saving).

export const PAST_ERROR = "Please choose a date in the future";
export const NO_PLACE_ERROR = "Add a meeting link or an office address";
export const LINK_ERROR = "Please enter a valid link";
export const CLASH_ERROR = "You already have an interview at this time";

export const DURATIONS = [15, 30, 45, 60, 90].map((minutes) => ({ value: String(minutes), label: `${minutes} minutes` }));
export const DEFAULT_DURATION = "30";
export const MAX_LINK_LENGTH = 500;
export const MAX_ADDRESS_LENGTH = 300;
export const MAX_NAME_LENGTH = 100;
const TIME_ZONE = "Asia/Karachi";

// "2026-11-07" + "11:00" -> an ISO time, or null when either is not a real date or time.
export function toScheduledAt(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !/^\d{2}:\d{2}$/.test(time || "")) return null;
  const when = new Date(`${date}T${time}:00+05:00`);
  return Number.isNaN(when.getTime()) ? null : when.toISOString();
}

// A saved ISO time -> { date: "2026-11-07", time: "11:00" } in Pakistan time (for Reschedule).
export function toDateAndTime(iso) {
  const when = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(when);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  }).format(when);
  return { date, time };
}

// True for a full http(s) link like https://meet.google.com/abc-defg-hij.
export function isValidLink(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// values: { date, time, duration, meetingLink, location, interviewerName }. Returns errors or null.
export function validateInterview(values, now = Date.now()) {
  const errors = {};
  const text = (field) => String(values[field] ?? "").trim();

  if (!text("date")) errors.date = REQUIRED_ERROR;
  if (!text("time")) errors.time = REQUIRED_ERROR;
  if (!errors.date && !errors.time) {
    const when = toScheduledAt(text("date"), text("time"));
    if (!when) errors.date = REQUIRED_ERROR;
    else if (Date.parse(when) <= now) errors.date = PAST_ERROR;
  }

  if (!DURATIONS.some((option) => option.value === String(values.duration))) errors.duration = REQUIRED_ERROR;

  const link = text("meetingLink");
  if (!link && !text("location")) errors.meetingLink = NO_PLACE_ERROR;
  else if (link && (link.length > MAX_LINK_LENGTH || !isValidLink(link))) errors.meetingLink = LINK_ERROR;

  if (text("location").length > MAX_ADDRESS_LENGTH) errors.location = `Keep it under ${MAX_ADDRESS_LENGTH} characters`;
  if (text("interviewerName").length > MAX_NAME_LENGTH) errors.interviewerName = `Keep it under ${MAX_NAME_LENGTH} characters`;

  return Object.keys(errors).length ? errors : null;
}

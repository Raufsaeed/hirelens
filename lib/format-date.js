// Dates and times as people in Pakistan read them: "17 Oct" and "17 Oct, 9:42 pm".
const TIME_ZONE = "Asia/Karachi";

export function formatDay(iso) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatDayTime(iso) {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  })
    .format(date)
    .toLowerCase();
  return `${formatDay(iso)}, ${time}`;
}

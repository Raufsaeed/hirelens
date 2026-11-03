// Initials in a circle, for example "Sara Khan" -> "SK".
export function initials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid size-9 shrink-0 place-items-center rounded-pill bg-primary text-[13px] font-bold text-on-primary"
    >
      {initials(name)}
    </span>
  );
}

// Requirements found ÷ total requirements (design/components/MatchBar). HR only.
export default function MatchBar({ percent, found, total, size = "sm" }) {
  const value = Math.round(Number(percent) || 0);
  return (
    <div className="flex min-w-33 items-center gap-2">
      <span
        role="meter"
        aria-label="Requirements match"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={`block flex-1 overflow-hidden rounded-pill bg-surface-sunken ${size === "sm" ? "h-1.5" : "h-2"}`}
      >
        <span
          className="block h-full rounded-pill bg-[linear-gradient(90deg,var(--primary-soft),var(--primary))] transition-[width] duration-(--duration-score) ease-out"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="numeric tabular-nums">{value}%</span>
      {total !== undefined && size !== "sm" && (
        <span className="small text-ink-muted">
          {found} of {total} found
        </span>
      )}
    </div>
  );
}

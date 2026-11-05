import CountUp from "@/components/reports/CountUp";

// One number HR cares about (design/components/KpiCard).
// value null shows "–" and the foot line says why (for example "No hires yet").
export default function KpiCard({ label, icon: Icon, value, decimals = 0, unit, foot }) {
  const headingId = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-card border border-border bg-surface px-6 py-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="label text-ink-muted">
          {label}
        </h2>
        <span className="grid size-10 place-items-center rounded-control bg-primary-tint text-on-primary-tint">
          <Icon className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
      <p className="numeric-xl tabular-nums">
        {value === null ? (
          "–"
        ) : (
          <>
            <CountUp value={value} decimals={decimals} />
            {unit && <span className="card-title text-ink-muted">{unit}</span>}
          </>
        )}
      </p>
      <p className="small text-ink-muted">{foot}</p>
    </section>
  );
}

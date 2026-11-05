"use client";

import { useId } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DURATION } from "@/lib/motion";

// One Reports chart (design/components/Charts) with a "Show as table" version of the same numbers.
// variant "bar": horizontal bars in brand purple. variant "funnel": centred bars that narrow by value,
// one shade per stage. rows: [{ label, value }].

const ROW_HEIGHT = 40;
const LABEL_WIDTH = 132;
const FUNNEL_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// Long job titles are cut on the chart; the table shows them in full.
const shortLabel = (label) => (label.length > 18 ? `${label.slice(0, 17)}…` : label);

export default function ChartCard({ title, scope, rows, labelHeader, valueHeader, emptyText, variant = "bar" }) {
  const headingId = useId();
  const reduceMotion = useReducedMotion();
  const max = Math.max(1, ...rows.map((row) => row.value));
  // The funnel centres each bar with an invisible spacer on its left.
  const data = rows.map((row) => ({ ...row, spacer: (max - row.value) / 2 }));

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="card-title">
          {title}
        </h2>
        <span className="small text-ink-muted">{scope}</span>
      </div>

      {rows.length === 0 ? (
        <p className="small text-ink-muted">{emptyText}</p>
      ) : (
        <>
          <div role="img" aria-label={`${title}: ${rows.map((row) => `${row.label} ${row.value}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + 8}>
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }} barCategoryGap={8} accessibilityLayer={false}>
                <XAxis type="number" hide domain={[0, max]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={LABEL_WIDTH}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={shortLabel}
                  tick={{ fill: "var(--ink)", fontSize: 13 }}
                />
                {variant === "funnel" && <Bar dataKey="spacer" stackId="row" fill="transparent" isAnimationActive={false} />}
                <Bar
                  dataKey="value"
                  stackId="row"
                  fill="var(--primary)"
                  radius={variant === "funnel" ? 8 : 6}
                  background={variant === "bar" ? { fill: "var(--surface-sunken)", radius: 6 } : undefined}
                  isAnimationActive={!reduceMotion}
                  animationDuration={DURATION.chart * 1000}
                  animationEasing="ease-out"
                >
                  {variant === "funnel" && rows.map((row, index) => <Cell key={row.label} fill={FUNNEL_FILLS[index % FUNNEL_FILLS.length]} />)}
                  <LabelList dataKey="value" position="right" fill="var(--ink)" fontSize={13} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <details className="group">
            <summary className="label inline-flex min-h-touch cursor-pointer list-none items-center gap-1.5 text-primary [&::-webkit-details-marker]:hidden">
              <ChevronRight className="size-icon-sm transition-transform duration-(--duration-base) group-open:rotate-90" strokeWidth={1.75} aria-hidden="true" />
              Show as table
            </summary>
            <table className="small w-full animate-fade-up border-collapse">
              <thead>
                <tr className="border-b border-border text-ink-muted">
                  <th scope="col" className="px-2.5 py-2 text-left font-bold">{labelHeader}</th>
                  <th scope="col" className="px-2.5 py-2 text-right font-bold">{valueHeader}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="px-2.5 py-2">{row.label}</td>
                    <td className="px-2.5 py-2 text-right tabular-nums">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}

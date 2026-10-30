# Charts

Reports charts built with Recharts in code; this card shows how they must look.

**Bar chart** — horizontal bars, 22px tall, `radius` 6px, fill `primary` on a `surface-sunken` track, category label left, value right in `numeric` (tabular). No gridlines, no legend for one series, no 3D, no gradients.

**Funnel** — Applied → Shortlisted → Interview → Offer → Hired, centred bars that narrow by value. Stages use `chart-1` … `chart-5`, a purple ramp that steps in lightness so the stages are told apart without hue; values sit outside the bars so they always meet contrast.

**Table alternative** — every chart has a "Show as table" disclosure (`chevron-right` rotates, content fades up) with the same numbers; the chart itself is `role="img"` with an `aria-label` that reads the values.

**Motion** — bars and funnel grow from zero in 500ms `ease-out` on first view.

**Empty** — "Not enough data yet. Reports appear once candidates apply" with `bar-chart-3`; a job with no applicants: "No applicants for this job yet"; time to hire before a hire: "No hires yet". Never draw empty axes.

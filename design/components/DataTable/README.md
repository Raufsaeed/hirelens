# Data table

Dense, scannable lists for HR: My Jobs, ranked candidates, reports tables.

**Structure** — wrapper `hl-table-wrap` (card border, `radius-card`, `shadow-card`, `overflow-x: auto`, focusable with `role="region"` + `aria-label` so keyboard users can scroll it) > `table.hl-table` with a visually hidden `<caption>`, `<th scope="col">`. Headers 13/700 `ink-muted`, sticky; sortable headers are buttons with `arrow-up-down`. Cells 12px × 20px padding, `border` dividers, no zebra stripes.

**States** — row hover `surface-sunken`; selected `primary-tint`; loading = 5 skeleton rows; empty = one full-width cell with an empty state; error = alert "Couldn't load your jobs" with Retry.

**Actions** — icon buttons (`--sm --icon`) each with an `aria-label`; at most three visible, the rest in `more-horizontal`.

**Phone** — the table keeps its columns and scrolls inside its box; the page never scrolls sideways. For candidate-facing lists use cards instead of tables.

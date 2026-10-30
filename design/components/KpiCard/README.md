# KPI stat card

One number HR cares about, with a label, icon and one line of context. Used on the HR dashboard and Reports.

**Anatomy** — label (13/700 `ink-muted`) with a 40px `primary-tint` icon tile (24px icon) · value in `numeric-xl` (40/44, 800, tabular figures) · foot line in `small` (a positive change in `success-text`, bold).

**Motion** — the number counts up from 0 in 600ms when the card first appears (`data-count`). Reduced motion: final number at once.

**Empty** — show "–" and a sentence ("No hires yet") rather than 0 when the number cannot be calculated. Numbers must match the candidates list and pipeline exactly.

**Icons** — Open jobs `briefcase`, Applicants `users`, Average score `sparkles`, Time to hire `clock`, Interviews `calendar-clock`, Hired `party-popper`.

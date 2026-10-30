# Requirement tag

A pill for one job requirement. On a screening result it says whether the CV meets it, always with an icon and a word so colour is never the only signal.

**Kinds**
- `--found` — `success-bg` / `success-text`, `check-circle-2` in `success`.
- `--missing` — `warning-bg` / `warning-text`, dashed `warning` border, `x-circle`. Missing is orange, not red: it is information for HR, not an error.
- `--must` — `primary-tint` with a `primary` border; `--nice` — dashed `border-control` on `surface`. Used on the job form and job detail.
- `--plain` — neutral facts (location, work mode).
- Evidence — a found tag with the CV line underneath (`hl-evidence__quote`, 13px italic `ink-muted`, `quote` icon). Every found requirement on the candidate detail page shows its evidence.

**Motion** — on results arrival tags pop in one by one (`data-pop`, 90ms apart, 380ms each).

**Consumer provides** the label, kind and optional evidence string (straight from the AI JSON, never invented).

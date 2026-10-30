# Candidate row

One candidate in the ranked list for a job (HR only). Rows are sorted by score, highest first; pending and unreadable screenings sit at the bottom.

**Columns** — rank (`numeric`, `ink-muted`) · avatar initials + name (link to candidate detail) · small score ring · small match bar with % · experience years (tabular) · degree match (`check-circle-2` + degree in `success-text`, or `x-circle` + degree in `warning-text`) · screening badge · pipeline badge · overflow menu (`more-horizontal`, `aria-label` names the candidate).

**Pending** — score, match, years and degree show "–"; screening shows the split badge "Pending · Retry screening". Clicking shows "Screening…" on that row only and ignores repeat clicks; on success the row moves to its place in the ranking. On repeat failure the row says "AI is still unavailable, try again in a few minutes".

**States** — hover `surface-sunken`; selected `primary-tint`; rows enter with a 60ms stagger on load and after filtering.

**Phone** — the table scrolls sideways inside its own box (`hl-table-wrap`, focusable region); the page never scrolls sideways.

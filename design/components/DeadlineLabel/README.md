# Deadline label

Shows the optional "Apply by" date on job cards, job detail, Saved Jobs and My Jobs.

- **Open, more than 7 days** — `clock` + "Apply by 20 Oct" in `ink-muted`, 13px.
- **7 days or fewer** — `warning-bg` pill, `warning-text`, `clock` in `warning`: "Apply by 20 Oct · 3 days left"; on the final day "Last day to apply".
- **Passed** — `muted-bg` pill with dashed border and `lock`: "Applications closed on 20 Oct". Replace Apply with this label; never a disabled Apply button with no reason.

**Format** — day and short month ("20 Oct"), no year unless it differs from this year. "1 day left", "3 days left". Calculate in the company's timezone (Asia/Karachi).

**Consumer provides** the deadline date (or none) and today's date.

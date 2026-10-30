# AI note and AI states

**"AI only advises, HR decides"** — a `primary-tint` note with `sparkles`, shown at the top of every AI result (candidate detail, ranked list header, interview questions, AI job description). Copy: "AI only advises, HR decides. Scores and reasons help you review faster. You make every shortlist, reject and hire decision." A quieter privacy variant on `surface-page` with `shield-check` explains that personal details are removed before AI reads a CV.

**AI is checking this CV** — the processing state wherever a result will appear: a CV tile (`file-text`) with a white shimmer band and a scan line moving top to bottom (1.6s loop), a `sparkles` badge that pulses, the text "AI is checking this CV…", a short reassurance and an indeterminate progress bar. `aria-live="polite"` announces when results arrive. Results then animate: ring draws, number counts, match bar fills, tags pop in one by one.

**Pending** — AI failed: `warning` file tile with `file-x`, "Screening pending", "Retry screening". Never shows a raw error.

**Write with AI / Generate questions** — typing dots and "Writing description…" first, then the text types in with a `primary` caret; always followed by "Review and edit before publishing". Disabled until there is enough input: "Add a title and at least one requirement first".

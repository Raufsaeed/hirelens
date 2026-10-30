# Job card

A public job in lists (jobs list, Saved Jobs, company page). The whole card is clickable to the job detail; the Save button is a separate control.

**Anatomy** — company monogram (`hl-logo`, initials on `primary-deep` until the company uploads a logo) · title (`card-title`, wraps, never truncates) · company · meta row (`map-pin` location, `briefcase` type, `award` experience, `graduation-cap` degree; 16px icons, `ink-muted`) · requirement tags (`--plain`) · footer with the deadline label and "View job".

**Save** — secondary small button with `bookmark` "Save"; when saved becomes `primary-tint` with a filled `bookmark-check` that pops (380ms) and the text "Saved"; `aria-pressed`. Logged-out users are sent to log in and returned with the job saved. Toast "Job saved".

**States** — hover lift 2px + `shadow-card-hover`; focus ring; closed jobs show "Applications closed on 20 Oct" and no Apply; long titles and company names wrap onto new lines (tested at 360px).

**Job detail header** — large monogram, `page-title`, company as a link to `/companies/abc-tech`, meta row, and on the right Save (icon) + primary "Apply now" with the deadline label under it. On phones the actions stack full width below the title.

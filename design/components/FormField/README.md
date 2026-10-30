# Form field

A labelled control with optional hint and inline error. Always a real `<label for>`; never a placeholder as the label.

**Anatomy** — `hl-field` > `hl-label` (13/700, `ink`; "(optional)" in `ink-muted`) > `hl-control` (optional leading Lucide icon, 20px, `ink-muted`) > `hl-input` > `hl-hint` or `hl-error-msg`.

**Input** — 44px tall, `radius-control`, 1px `border-control` on `surface`, text 15px `ink`, placeholder `ink-placeholder`. Hover: border `ink-muted`. Focus: border `primary` + 3px `primary-faint` halo. Error: border `danger`, `aria-invalid="true"`, message below in `danger-text` with `alert-circle`, linked by `aria-describedby`. Disabled: `surface-sunken` fill, `ink-disabled` text.

**Types** — text, email, number, date ("Apply by" with `clock`), select (chevron at right, native options), textarea (min 120px, character counter bottom-right turning `danger-text` when over), checkbox (20px box, check draws in), toggle switch (44×26 track, `primary` when on; whole row is the hit area), search (`surface-page` fill, `/` shortcut chip).

**Icons** — briefcase (job title), mail, lock (password), phone, map-pin, award (experience), graduation-cap (degree), clock (Apply by), building-2 (company), search.

**Copy** — Errors say what happened and what to do: "Please enter a valid email", "This field is required", "Apply by date can't be in the past". Validate on blur and on submit, never on the first keystroke.

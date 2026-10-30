# Score ring

The AI screening score out of 100, drawn as a ring with the number in the middle and a band label below. HR-only: a score never appears on any candidate screen, email or public page.

**Sizes** — large 144px (candidate detail, `numeric-xl` number with "/ 100"), medium 96px (`--md`, cards and the landing sample), small 44px (`--sm`, ranked tables).

**Bands** (label + icon + colour, never colour alone)
- 85–100 **Excellent** — `success-bg` / `success-text`, `badge-check`
- 70–84 **Good** — `primary-tint` / `on-primary-tint`, `thumbs-up`
- 50–69 **Average** — `warning-bg` / `warning-text`, `minus-circle`
- 0–49 **Poor** — `danger-bg` / `danger-text`, `alert-circle`

**Ring** — track `surface-sunken`; arc a subtle gradient `primary-soft` → `primary` (one of the few allowed gradients); rounded caps; starts at 12 o'clock.

**Motion** — on results arrival the arc draws from 0 to the score while the number counts up, both 600ms `ease-out`. Reduced motion: shows the final state.

**Accessibility** — the ring is `role="img"` with `aria-label="Score 74 out of 100, Good"`.

**Consumer provides** the score (calculated in code, never by the AI) and the size.

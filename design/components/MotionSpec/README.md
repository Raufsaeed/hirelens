# Motion

Motion guides attention, shows progress and confirms actions. It never decorates a work page.

**Tokens** — easing `ease-out` = `cubic-bezier(0.16, 1, 0.3, 1)` for every transition; `ease-loop` (ease-in-out) only for background loops and the hero card bob. Durations: `duration-fast` 150ms (hover, press, focus ring, toggles), `duration-base` 220ms (page fade-up 8px, tabs, dropdowns, badge cross-fade, toasts), `duration-slow` 300ms (dialogs, accordions, mobile menu, kanban settle), `duration-chart` 500ms (bars, funnels, progress), `duration-score` 600ms (score ring, count-ups, match bar), `duration-stagger` 60ms between list items, `duration-loop` 20s for gradient backgrounds.

**Catalogue**
- Landing: gradient mesh loop behind the hero; headline, lead and buttons fade-up with a 90ms stagger; the sample result card bobs (6s); sections reveal on scroll; stats count up when visible.
- Auth: same mesh on the art side; form card fades up; password ticks turn green one by one.
- Buttons and cards: hover lift 2px + `shadow-card-hover`; press `scale(0.98)`; focus ring `shadow-focus`; links grow an underline from the left.
- Pages: content fades and rises 8px; rows and cards stagger; tab indicator slides; accordions open smoothly.
- AI: scanning shimmer over the CV icon with a pulsing sparkle; ring draws 0→score while the number counts; match bar fills; found/missing tags pop in one by one; "Write with AI" / "Generate questions" show typing dots before text appears.
- Data: KPI numbers count up; bars and funnels grow from zero; progress fills.
- Pipeline: dragged card tilts 2.5° and lifts to `shadow-float`; lands with a fade-up; column count bumps.
- Feedback: toasts slide up from the bottom and auto-hide after 4s; dialogs fade the backdrop and scale 0.96→1; apply confirmation draws a check; Hired fires one small confetti burst.
- Loading: skeleton shimmer; spinner inside buttons; dropzone border marches while dragging.
- Status: badges cross-fade colour; the newest completed timeline step pops in.

**Rules** — Work pages: plain backgrounds, small and quick motion only. Never animate layout-shifting properties on tables. Honour `prefers-reduced-motion` (bundle.css does this globally).

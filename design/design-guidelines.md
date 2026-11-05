# Developer handoff

Everything a developer needs to build HireLens screens: every design token, the icon list and the rules. Save this section as `design/design-guidelines.md` in the project. It replaces the interim design rules in AGENTS.md (the primary colour is now purple `#5B3FD9`, not blue).

**Theme in one line:** deep purple navigation (`--nav-bg` #24164F: HR sidebar, candidate top bar), lavender pages (`--surface-page` #EEEAFB), light lilac cards (`--surface` #FCFBFF) with soft lilac borders (`--border` #DCD5F5), brand purple `--primary` #5B3FD9 for buttons and accents; teal found, orange missing, red errors. Nothing is pure white except text on dark fills.

## Rules for developers

- Use tokens only. Never hard-code a colour, size, radius, shadow or duration: use the CSS variables below or the Tailwind names that point at them.
- Use Lucide icons only (`lucide-react`), `strokeWidth={1.75}`, sizes 16 / 20 / 24 / 44. Every icon has a text label next to it, or its button has an `aria-label`.
- HR pages use the sidebar shell (248px `--nav-bg` sidebar + 64px content top bar); below 900px the sidebar becomes a 56px deep purple top bar with a menu button. Candidate pages use the 56px deep purple top bar.
- Touch targets are at least 44×44px. Buttons and inputs are 44px tall (small table buttons are 36px with padding that keeps the hit area at 44px).
- Candidate pages are mobile first: build at 360px, then widen. No horizontal page scrolling at 360px; wide tables scroll inside their own box.
- Follow the motion rules: one easing (`--ease-out`), the listed durations, motion only to guide, show progress or confirm. Support `prefers-reduced-motion`: no loops, reveals, confetti or movement, only simple fades.
- WCAG AA contrast: 4.5:1 for text, 3:1 for icons, control borders and focus rings. Use each colour only on the grounds its note names.
- Status is never colour alone: every badge and tag has an icon and a word.
- Real `<button>` and `<label>` elements; visible focus ring on everything interactive: `--shadow-focus` on light grounds, `--shadow-focus-nav` (white) on `--nav-bg`.
- Never show a score, match percentage, AI summary or HR note on any candidate screen, email or public page.
- Every list and AI action has empty, loading, error and success states with the copy from `docs/user-flow.md`. Never show raw errors or blank pages.
- Manrope only, weights 400, 500, 700 and 800. Numbers in scores, KPIs and tables use `tabular-nums`.

## Colours

| Token | Value | Use |
|---|---|---|
| `--primary` | `#5B3FD9` | Buttons, links, accents, the focus ring and the active item in the HR sidebar and candidate top bar. White text on it 6.6:1; as text 6.5:1 on surface and 5.6:1 on surface-page. |
| `--primary-hover` | `#4527B8` | Hover and pressed fill of primary buttons; link hover. |
| `--primary-deep` | `#2A1580` | Deepest brand shade: landing gradients, the first funnel bar, footer band. White text 13.8:1. |
| `--primary-soft` | `#B7A8F7` | Gradient mid-stop, score-ring track accent, lighter chart bars (label outside the bar). Never text. |
| `--primary-faint` | `#D6CCFB` | Gradient light stop, drag-over outlines, decorative blobs. Never text. |
| `--primary-tint` | `#EFEBFD` | Highlights, selected rows, Shortlisted badge, AI note (with a primary-faint border, since it is close to surface-page), tags. Text on it: on-primary-tint. |
| `--on-primary-tint` | `#3B1F9E` | Text and icons on primary-tint (9.6:1). |
| `--on-primary` | `#FFFFFF` | Text and icons on primary, primary-hover, primary-deep, nav-bg and danger fills. |
| `--ink` | `#1C1830` | Headings and main text on surface (16.7:1) and surface-page (14.6:1). |
| `--ink-muted` | `#5E5A72` | Secondary text, hints, meta lines, table headers on surface (6.4:1), surface-page (5.6:1), surface-sunken (5.9:1) and primary-tint (5.7:1). |
| `--ink-placeholder` | `#6F6B84` | Placeholder text inside fields, which are filled with surface (5:1). Never on surface-page. |
| `--ink-disabled` | `#8C88A0` | Disabled labels and icons only (exempt from contrast rules). |
| `--border` | `#DCD5F5` | Soft lilac 1px borders for cards, tables and dividers. Decorative only: never the only edge of a control. |
| `--border-control` | `#7F7A96` | Resting border of inputs, selects, checkboxes and secondary buttons: 4:1 on surface and 3.5:1 on surface-page so control edges stay visible. |
| `--surface-page` | `#EEEAFB` | Lavender page background on every work page, HR and candidate. |
| `--surface` | `#FCFBFF` | Very light lilac for cards, tables, dialogs, inputs and menus. Never pure white. |
| `--surface-sunken` | `#F3F0FC` | Row hover, disabled fills, skeleton base and the hint box inside cards. |
| `--surface-skeleton-shine` | `#FCFBFF` | Highlight band of the skeleton shimmer. |
| `--surface-column` | `#E4DEF8` | Pipeline board columns on surface-page (ink 13.2:1, ink-muted 5:1). |
| `--nav-bg` | `#24164F` | Deep purple HR sidebar, candidate top bar and mobile menu panels. |
| `--nav-hover` | `#33236A` | Hover fill of sidebar and top-bar items. |
| `--nav-line` | `#3A2B70` | Dividers inside the sidebar. Decorative only. |
| `--nav-text` | `#E9E4FB` | Active-adjacent and primary text on nav-bg (13:1): brand name, user name, section text. |
| `--nav-text-muted` | `#B3A8DD` | Resting navigation labels and icons on nav-bg (7.3:1). |
| `--overlay` | `rgba(28, 24, 48, 0.45)` | Modal and mobile-menu backdrop. |
| `--success` | `#0F7A6B` | Success icons, found-requirement icons, Excellent score marks, positive chart deltas (5.2:1 on surface). |
| `--success-bg` | `#DDF3EC` | Found tags, Hired / Done badges, success toasts and alerts. |
| `--success-text` | `#0B5E52` | Text on success-bg (6.6:1). |
| `--warning` | `#C2410C` | Warning and missing-requirement icons, close-deadline clock (5.2:1 on surface). |
| `--warning-bg` | `#FDF0E6` | Missing tags, warning alerts, "3 days left" label. |
| `--warning-text` | `#8A3A08` | Text on warning-bg (7:1). |
| `--danger` | `#C62828` | Danger button fill (white text 5.6:1), error icons, field error borders and messages on surface. |
| `--danger-hover` | `#A01F1F` | Danger button hover. |
| `--danger-bg` | `#FDECEC` | Rejected / Failed badges, error alerts and toasts. |
| `--danger-text` | `#A01F1F` | Text on danger-bg (6.8:1) and inline field errors on surface (7.8:1). |
| `--neutral-bg` | `#EEEDF3` | Applied, Queued, Pending and Draft badges. |
| `--neutral-text` | `#47435A` | Text on neutral-bg (8.1:1). |
| `--muted-bg` | `#F4F3F8` | Withdrawn and Closed badges (light grey, paired with a dashed border). |
| `--muted-text` | `#5E5A72` | Text on muted-bg (6:1). |
| `--info` | `#2E6FD8` | Info icons and Interview marks on surface (4.8:1). |
| `--info-bg` | `#E3EEFC` | Interview badge, info alerts and toasts. |
| `--info-text` | `#174A9C` | Text on info-bg (7.2:1). |
| `--amber` | `#A87A0A` | Offer icon on surface (3.9:1, icons only). |
| `--amber-bg` | `#FCF1D9` | Offer badge. |
| `--amber-text` | `#7A4A05` | Text on amber-bg (6.7:1). |
| `--glass` | `rgba(255, 255, 255, 0.12)` | Translucent fills on the purple gradient (landing pill, ghost hover on dark). |
| `--glass-line` | `rgba(255, 255, 255, 0.22)` | Hairline borders on the purple gradient. |
| `--glass-strong` | `rgba(255, 255, 255, 0.55)` | Outline button border on the purple gradient (3:1+ on primary-deep). |
| `--glass-shine` | `rgba(255, 255, 255, 0.85)` | Highlight band of the AI scanning shimmer. |
| `--glass-dot` | `rgba(255, 255, 255, 0.10)` | Dot grid texture over the animated gradient. |
| `--glass-clear` | `rgba(255, 255, 255, 0)` | Transparent end of the scanning shimmer. |
| `--thumb-shadow` | `rgba(28, 24, 48, 0.25)` | Shadow under the toggle thumb. |
| `--chart-1` | `#2A1580` | Funnel / bar series step 1 (Applied). Series differ in lightness, not hue. |
| `--chart-2` | `#4527B8` | Series step 2 (Shortlisted). |
| `--chart-3` | `#5B3FD9` | Series step 3 (Interview). |
| `--chart-4` | `#8D76EA` | Series step 4 (Offer); value label sits outside the bar. |
| `--chart-5` | `#B7A8F7` | Series step 5 (Hired); value label sits outside the bar. |
| `--logo-lens-dark-from` | `#C9B8FF` | "Lens" gradient start in the wordmark on dark backgrounds (nav, sidebar, purple art). |
| `--logo-lens-dark-to` | `#8E6CFF` | "Lens" gradient end on dark backgrounds. |
| `--logo-lens-light-from` | `#9B7BFF` | "Lens" gradient start in the wordmark on light pages. |
| `--logo-lens-light-to` | `#5B3FD9` | "Lens" gradient end on light pages. |

**Status mapping** — Pipeline: Applied `neutral` · Shortlisted `primary-tint` · Interview `info` · Offer `amber` · Hired `success` · Rejected `danger` · Withdrawn `muted` (dashed border). Screening: Queued/Pending `neutral` · Processing `primary-tint` + spinner · Done `success` · Failed `danger`. Job: Draft `neutral` · Open `primary-tint` · Closed `muted`. Requirements: found `success` · missing `warning` (dashed border). Score bands: 85–100 Excellent `success` · 70–84 Good `primary-tint` · 50–69 Average `warning` · 0–49 Poor `danger`.

## Typography

Font: **Manrope** from Google Fonts, `font-family: Manrope, "Segoe UI", system-ui, -apple-system, sans-serif`. In Next.js load it with `next/font/google` (`Manrope({ subsets: ["latin"], weight: ["400","500","700","800"] })`).

| Style | Size / line height | Weight | Letter spacing | Use |
|---|---|---|---|---|
| `display` | 56px / 60px | 800 | -0.02em | Landing hero headline only (line 2 rotates, see Motion recipes). Drops to display-sm under 640px. |
| `display-sm` | 36px / 40px | 800 | -0.02em | Landing hero on phones; login/sign up panel headline. |
| `page-title` | 30px / 38px | 800 | -0.01em | One per page: the page's h1. 24px/32px under 640px. |
| `section-heading` | 22px / 30px | 700 | 0 | Sections inside a page (h2). |
| `card-title` | 17px / 24px | 700 | 0 | Card, dialog and table-group titles (h3). |
| `body-lg` | 17px / 28px | 400 | 0 | Landing and auth page lead paragraphs. |
| `body` | 15px / 24px | 400 | 0 | Default text everywhere. Candidate pages use 16px on phones (body-lg below 640px is not needed). |
| `body-medium` | 15px / 24px | 500 | 0 | Emphasis inside body copy, table names, button labels. |
| `small` | 13px / 20px | 400 | 0 | Meta lines, hints, evidence quotes, timestamps. |
| `label` | 13px / 18px | 700 | 0 | Form labels, badge and tag text, table headers. |
| `caption` | 12px / 16px | 700 | 0.06em | Overlines and eyebrow labels, uppercase. Use sparingly. |
| `numeric-xl` | 40px / 44px | 800 | -0.02em | KPI values and the large score number. Always font-variant-numeric: tabular-nums. |
| `numeric-lg` | 28px / 32px | 800 | 0 | Score inside the medium ring, chart totals. Tabular figures. |
| `numeric` | 15px / 20px | 700 | 0 | Scores, percentages and counts in tables and badges. Tabular figures. |

## Spacing

| Token | Value | Use |
|---|---|---|
| `--space-1` | `4px` | Icon-to-text gap in tags and badges. |
| `--space-2` | `8px` | Gap between icon and label in buttons; tight stacks. |
| `--space-3` | `12px` | Gap between form label and field; tag rows. |
| `--space-4` | `16px` | Phone side gutter; padding inside compact cards; field-to-field gap. |
| `--space-5` | `20px` | Table cell horizontal padding. |
| `--space-6` | `24px` | Card padding; gap between cards; desktop side gutter. |
| `--space-8` | `32px` | Gap between page sections on work pages. |
| `--space-10` | `40px` | Page top padding below the navigation. |
| `--space-12` | `48px` | Empty-state padding; auth card padding on desktop. |
| `--space-16` | `64px` | Landing section gap on phones. |
| `--space-24` | `96px` | Landing section gap on desktop. |

## Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6px` | Checkboxes, kbd chips, skeleton lines. |
| `--radius-control` | `10px` | Buttons, inputs, selects, dropdown items, alerts. |
| `--radius-card` | `16px` | Cards, tables, dropzone, kanban columns. |
| `--radius-dialog` | `20px` | Dialogs, auth card, floating hero card. |
| `--radius-pill` | `999px` | Tags, badges, toggles, avatars, progress bars. |

## Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(28, 24, 48, 0.04), 0 2px 8px rgba(28, 24, 48, 0.04)` | Resting cards and tables, together with a 1px border. |
| `--shadow-card-hover` | `0 2px 4px rgba(28, 24, 48, 0.05), 0 12px 24px -6px rgba(28, 24, 48, 0.12)` | Clickable cards on hover (with a 2px lift). |
| `--shadow-float` | `0 4px 12px rgba(28, 24, 48, 0.08), 0 24px 48px -12px rgba(28, 24, 48, 0.22)` | Menus, dropdowns, dialogs, toasts, dragged pipeline cards. |
| `--shadow-focus` | `0 0 0 2px #FCFBFF, 0 0 0 4px #5B3FD9` | Keyboard focus ring on light grounds (primary: 6.5:1 on surface, 5.6:1 on surface-page). |
| `--shadow-focus-nav` | `0 0 0 2px #FFFFFF` | Focus ring on nav-bg (white, 16:1), because primary is only 2.4:1 there. |

## Animation durations

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | `150ms` | Hover, press, focus ring, checkbox and toggle. |
| `--duration-base` | `220ms` | Most transitions: page fade-up, tabs, dropdowns, badge cross-fade, toasts. |
| `--duration-slow` | `300ms` | Modals, accordions, mobile menu, kanban card settle. |
| `--duration-score` | `600ms` | Score ring draw, number count-up, match bar fill. |
| `--duration-chart` | `500ms` | Bar and funnel growth, progress fills. |
| `--duration-stagger` | `60ms` | Delay between list rows, tags and landing elements. |
| `--duration-loop` | `20s` | Landing and auth animated gradient background loop (15–25s). |
| `--duration-rotate` | `2500ms` | How long each phrase of the rotating hero headline stays. |
| `--duration-float` | `6000ms` | One float loop of the large hero card. |
| `--duration-float-fast` | `4500ms` | One float loop of the small hero evidence card. |

## Easing

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | The only easing curve. Every transition and animation uses it (loops use ease-in-out). |
| `--ease-loop` | `ease-in-out` | Only for slow background loops and the floating hero cards. |

## Sizes

| Token | Value | Use |
|---|---|---|
| `--icon-sm` | `16px` | Inline icons in text, tags, badges, meta lines. |
| `--icon-md` | `20px` | Icons in buttons, fields and navigation. |
| `--icon-lg` | `24px` | Feature highlights, stat-card icons. |
| `--icon-xl` | `44px` | Empty-state icons inside an 88px tinted circle. |
| `--touch-target` | `44px` | Minimum height and width of anything tappable. |
| `--control-height` | `44px` | Buttons, inputs and selects. |
| `--control-height-sm` | `36px` | Small buttons in dense HR tables; hit area still padded to 44px. |
| `--nav-height` | `56px` | Slim deep purple top bar (candidate pages, HR on tablets and phones). |
| `--topbar-height` | `64px` | HR content top bar with search, on surface-page. |
| `--sidebar-width` | `248px` | HR sidebar navigation width. |
| `--stroke-icon` | `1.75` | Lucide stroke width, rounded caps and joins. |

## Layout

| Token | Value | Use |
|---|---|---|
| `--width-hr` | `1160px` | Max content width of HR pages. |
| `--width-candidate` | `820px` | Max width of candidate pages (job detail, My Applications). |
| `--width-form` | `720px` | Max width of forms (create job, apply, settings). |
| `--width-auth` | `440px` | Auth card width. |
| `--bp-sm` | `640px` | Below: single column, 16px gutters, phone type sizes. |
| `--bp-md` | `900px` | Below: the HR sidebar becomes a slim top bar with a menu button. |
| `--bp-lg` | `1024px` | Below: the landing hero visual moves under the text and gets smaller. |

## Layers (z-index)

| Token | Value | Use |
|---|---|---|
| `--z-nav` | `40` | Sidebar and sticky top bars. |
| `--z-dropdown` | `50` | Menus, search results. |
| `--z-modal` | `60` | Dialog and backdrop. |
| `--z-toast` | `70` | Toasts sit above everything. |

## CSS variables (copy into `app/globals.css`)

```css
:root {
  /* colour */
  --primary: #5B3FD9;
  --primary-hover: #4527B8;
  --primary-deep: #2A1580;
  --primary-soft: #B7A8F7;
  --primary-faint: #D6CCFB;
  --primary-tint: #EFEBFD;
  --on-primary-tint: #3B1F9E;
  --on-primary: #FFFFFF;
  --ink: #1C1830;
  --ink-muted: #5E5A72;
  --ink-placeholder: #6F6B84;
  --ink-disabled: #8C88A0;
  --border: #DCD5F5;
  --border-control: #7F7A96;
  --surface-page: #EEEAFB;
  --surface: #FCFBFF;
  --surface-sunken: #F3F0FC;
  --surface-skeleton-shine: #FCFBFF;
  --surface-column: #E4DEF8;
  --nav-bg: #24164F;
  --nav-hover: #33236A;
  --nav-line: #3A2B70;
  --nav-text: #E9E4FB;
  --nav-text-muted: #B3A8DD;
  --overlay: rgba(28, 24, 48, 0.45);
  --success: #0F7A6B;
  --success-bg: #DDF3EC;
  --success-text: #0B5E52;
  --warning: #C2410C;
  --warning-bg: #FDF0E6;
  --warning-text: #8A3A08;
  --danger: #C62828;
  --danger-hover: #A01F1F;
  --danger-bg: #FDECEC;
  --danger-text: #A01F1F;
  --neutral-bg: #EEEDF3;
  --neutral-text: #47435A;
  --muted-bg: #F4F3F8;
  --muted-text: #5E5A72;
  --info: #2E6FD8;
  --info-bg: #E3EEFC;
  --info-text: #174A9C;
  --amber: #A87A0A;
  --amber-bg: #FCF1D9;
  --amber-text: #7A4A05;
  --glass: rgba(255, 255, 255, 0.12);
  --glass-line: rgba(255, 255, 255, 0.22);
  --glass-strong: rgba(255, 255, 255, 0.55);
  --glass-shine: rgba(255, 255, 255, 0.85);
  --glass-dot: rgba(255, 255, 255, 0.10);
  --glass-clear: rgba(255, 255, 255, 0);
  --thumb-shadow: rgba(28, 24, 48, 0.25);
  --chart-1: #2A1580;
  --chart-2: #4527B8;
  --chart-3: #5B3FD9;
  --chart-4: #8D76EA;
  --chart-5: #B7A8F7;
  --logo-lens-dark-from: #C9B8FF;
  --logo-lens-dark-to: #8E6CFF;
  --logo-lens-light-from: #9B7BFF;
  --logo-lens-light-to: #5B3FD9;
  /* type */
  --font-sans: Manrope, "Segoe UI", system-ui, -apple-system, sans-serif;
  /* spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  /* radius */
  --radius-sm: 6px;
  --radius-control: 10px;
  --radius-card: 16px;
  --radius-dialog: 20px;
  --radius-pill: 999px;
  /* shadow */
  --shadow-card: 0 1px 2px rgba(28, 24, 48, 0.04), 0 2px 8px rgba(28, 24, 48, 0.04);
  --shadow-card-hover: 0 2px 4px rgba(28, 24, 48, 0.05), 0 12px 24px -6px rgba(28, 24, 48, 0.12);
  --shadow-float: 0 4px 12px rgba(28, 24, 48, 0.08), 0 24px 48px -12px rgba(28, 24, 48, 0.22);
  --shadow-focus: 0 0 0 2px #FCFBFF, 0 0 0 4px #5B3FD9;
  --shadow-focus-nav: 0 0 0 2px #FFFFFF;
  /* duration */
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 300ms;
  --duration-score: 600ms;
  --duration-chart: 500ms;
  --duration-stagger: 60ms;
  --duration-loop: 20s;
  --duration-rotate: 2500ms;
  --duration-float: 6000ms;
  --duration-float-fast: 4500ms;
  /* easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-loop: ease-in-out;
  /* size */
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 44px;
  --touch-target: 44px;
  --control-height: 44px;
  --control-height-sm: 36px;
  --nav-height: 56px;
  --topbar-height: 64px;
  --sidebar-width: 248px;
  --stroke-icon: 1.75;
  /* layout */
  --width-hr: 1160px;
  --width-candidate: 820px;
  --width-form: 720px;
  --width-auth: 440px;
  --bp-sm: 640px;
  --bp-md: 900px;
  --bp-lg: 1024px;
  /* zIndex */
  --z-nav: 40;
  --z-dropdown: 50;
  --z-modal: 60;
  --z-toast: 70;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}
```

## Tailwind theme (copy into `tailwind.config.js`)

```js
// Every value points at a CSS variable, so the tokens stay the single source.
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-deep': 'var(--primary-deep)',
        'primary-soft': 'var(--primary-soft)',
        'primary-faint': 'var(--primary-faint)',
        'primary-tint': 'var(--primary-tint)',
        'on-primary-tint': 'var(--on-primary-tint)',
        'on-primary': 'var(--on-primary)',
        'ink': 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-placeholder': 'var(--ink-placeholder)',
        'ink-disabled': 'var(--ink-disabled)',
        'border': 'var(--border)',
        'border-control': 'var(--border-control)',
        'surface-page': 'var(--surface-page)',
        'surface': 'var(--surface)',
        'surface-sunken': 'var(--surface-sunken)',
        'surface-skeleton-shine': 'var(--surface-skeleton-shine)',
        'surface-column': 'var(--surface-column)',
        'nav-bg': 'var(--nav-bg)',
        'nav-hover': 'var(--nav-hover)',
        'nav-line': 'var(--nav-line)',
        'nav-text': 'var(--nav-text)',
        'nav-text-muted': 'var(--nav-text-muted)',
        'overlay': 'var(--overlay)',
        'success': 'var(--success)',
        'success-bg': 'var(--success-bg)',
        'success-text': 'var(--success-text)',
        'warning': 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        'warning-text': 'var(--warning-text)',
        'danger': 'var(--danger)',
        'danger-hover': 'var(--danger-hover)',
        'danger-bg': 'var(--danger-bg)',
        'danger-text': 'var(--danger-text)',
        'neutral-bg': 'var(--neutral-bg)',
        'neutral-text': 'var(--neutral-text)',
        'muted-bg': 'var(--muted-bg)',
        'muted-text': 'var(--muted-text)',
        'info': 'var(--info)',
        'info-bg': 'var(--info-bg)',
        'info-text': 'var(--info-text)',
        'amber': 'var(--amber)',
        'amber-bg': 'var(--amber-bg)',
        'amber-text': 'var(--amber-text)',
        'glass': 'var(--glass)',
        'glass-line': 'var(--glass-line)',
        'glass-strong': 'var(--glass-strong)',
        'glass-shine': 'var(--glass-shine)',
        'glass-dot': 'var(--glass-dot)',
        'glass-clear': 'var(--glass-clear)',
        'thumb-shadow': 'var(--thumb-shadow)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'logo-lens-dark-from': 'var(--logo-lens-dark-from)',
        'logo-lens-dark-to': 'var(--logo-lens-dark-to)',
        'logo-lens-light-from': 'var(--logo-lens-light-from)',
        'logo-lens-light-to': 'var(--logo-lens-light-to)',
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      fontSize: {
        'display': ['56px', { lineHeight: '60px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'display-sm': ['36px', { lineHeight: '40px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'page-title': ['30px', { lineHeight: '38px', fontWeight: '800', letterSpacing: '-0.01em' }],
        'section-heading': ['22px', { lineHeight: '30px', fontWeight: '700' }],
        'card-title': ['17px', { lineHeight: '24px', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['15px', { lineHeight: '24px', fontWeight: '500' }],
        'small': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label': ['13px', { lineHeight: '18px', fontWeight: '700' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.06em' }],
        'numeric-xl': ['40px', { lineHeight: '44px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'numeric-lg': ['28px', { lineHeight: '32px', fontWeight: '800' }],
        'numeric': ['15px', { lineHeight: '20px', fontWeight: '700' }],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '24': 'var(--space-24)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'control': 'var(--radius-control)',
        'card': 'var(--radius-card)',
        'dialog': 'var(--radius-dialog)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'float': 'var(--shadow-float)',
        'focus': 'var(--shadow-focus)',
        'focus-nav': 'var(--shadow-focus-nav)',
      },
      transitionTimingFunction: { out: 'var(--ease-out)' },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'base': 'var(--duration-base)',
        'slow': 'var(--duration-slow)',
        'score': 'var(--duration-score)',
        'chart': 'var(--duration-chart)',
      },
      maxWidth: { hr: 'var(--width-hr)', candidate: 'var(--width-candidate)', form: 'var(--width-form)', auth: 'var(--width-auth)' },
    },
  },
};
```

Example: `<button className="h-[44px] px-[18px] rounded-control bg-primary text-on-primary font-bold transition duration-fast ease-out hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] focus-visible:shadow-focus">`. The spacing names are the scale steps, so `p-6` is 24px and `gap-4` is 16px.

## Logo

The HireLens logo is an **owl mark** (a geometric owl in brand purples, one eye a teal tick, an amber beak) next to the wordmark **HireLens** in Manrope 800 (letter-spacing −0.02em).

- **Files:** `public/logo-mark.svg` (the mark used in the app) and `app/icon.svg` (the same SVG, used as the browser tab icon). Never redraw, recolour or stretch the mark.
- **Wordmark colours:** "Hire" uses the normal text colour of its background (`--ink` on light pages, `--nav-text` on the nav, `--on-primary` on the purple art). "Lens" uses a left-to-right gradient:
  - On dark backgrounds: `--logo-lens-dark-from` `#C9B8FF` → `--logo-lens-dark-to` `#8E6CFF`.
  - On light pages: `--logo-lens-light-from` `#9B7BFF` → `--logo-lens-light-to` `#5B3FD9`.
- **Inline version** (mark 32px, wordmark 18px beside it, 10px gap): HR sidebar, candidate top bar, visitor top bar, landing nav, and the plain light pages (not found, access denied, account deleted). Code: `<Brand tone="nav" />`, `tone="gradient"` or `tone="light"`.
- **Stacked version** (mark 64px above the 24px wordmark, then the tagline "AI-POWERED HIRING" in `caption`, uppercase, 0.2em letter spacing, muted colour): the purple panel of the auth pages only. Code: `<Brand tone="gradient" layout="stacked" />`.
- **Watermark:** the landing hero shows the mark large behind the floating cards at 8% opacity, as decoration only.
- **Minimum size:** the mark is never shown smaller than 24px (16px is allowed only for the browser tab icon). Keep clear space around the logo of at least half the mark's width.
- **Accessibility:** the logo link's name is "HireLens" (the stacked version sets it with `aria-label`, so the tagline is not read as part of it); the mark image itself has empty `alt` because the wordmark text sits beside it.

## Icons (Lucide)

| Meaning | Lucide name | lucide-react |
|---|---|---|
| Dashboard | `layout-dashboard` | `LayoutDashboard` |
| Jobs, job type | `briefcase` | `Briefcase` |
| Candidates | `users` | `Users` |
| Pipeline | `kanban` | `Kanban` |
| Interviews | `calendar-clock` | `CalendarClock` |
| Reports | `bar-chart-3 (now chart-column)` | `ChartColumn` |
| Settings | `settings` | `Settings` |
| Company | `building-2` | `Building2` |
| Search | `search` | `Search` |
| Upload | `upload-cloud (now cloud-upload)` | `CloudUpload` |
| CV file | `file-text` | `FileText` |
| CV unreadable | `file-x` | `FileX` |
| AI | `sparkles` | `Sparkles` |
| Found | `check-circle-2 (now circle-check)` | `CircleCheck` |
| Missing | `x-circle (now circle-x)` | `CircleX` |
| Warning | `alert-triangle (now triangle-alert)` | `TriangleAlert` |
| Error | `alert-circle (now circle-alert)` | `CircleAlert` |
| Info | `info` | `Info` |
| Deadline, time | `clock` | `Clock` |
| Date | `calendar` | `Calendar` |
| Location | `map-pin` | `MapPin` |
| Experience | `award` | `Award` |
| Degree | `graduation-cap` | `GraduationCap` |
| Save job / saved | `bookmark / bookmark-check` | `Bookmark / BookmarkCheck` |
| Job link / copy | `link / copy` | `Link / Copy` |
| Email | `mail` | `Mail` |
| Phone | `phone` | `Phone` |
| Meeting | `video` | `Video` |
| Notes | `sticky-note` | `StickyNote` |
| Lock, HR-only, closed | `lock` | `Lock` |
| Privacy | `shield-check` | `ShieldCheck` |
| Log out | `log-out` | `LogOut` |
| Menu / close | `menu / x` | `Menu / X` |
| Retry | `refresh-cw` | `RefreshCw` |
| Delete | `trash-2` | `Trash2` |
| Edit, draft | `pencil` | `Pencil` |
| Add | `plus` | `Plus` |
| Filter | `sliders-horizontal` | `SlidersHorizontal` |
| Sort | `arrow-up-down` | `ArrowUpDown` |
| External link | `external-link` | `ExternalLink` |
| Applied | `send` | `Send` |
| Shortlisted | `star` | `Star` |
| Offer | `handshake` | `Handshake` |
| Hired | `party-popper` | `PartyPopper` |
| Excellent, verified | `badge-check` | `BadgeCheck` |
| Good | `thumbs-up` | `ThumbsUp` |
| Average | `minus-circle (now circle-minus)` | `CircleMinus` |
| Rejected | `circle-slash` | `CircleSlash` |
| Withdrawn | `undo-2` | `Undo2` |
| Pending, queued | `hourglass` | `Hourglass` |
| Open job | `circle-dot` | `CircleDot` |
| Website | `globe` | `Globe` |
| Show / hide password | `eye / eye-off` | `Eye / EyeOff` |
| Evidence quote | `quote` | `Quote` |
| Drag handle | `grip-vertical` | `GripVertical` |
| More actions | `more-horizontal (now ellipsis)` | `Ellipsis` |
| Next / back | `arrow-right / arrow-left` | `ArrowRight / ArrowLeft` |
| Expand | `chevron-down / chevron-right` | `ChevronDown / ChevronRight` |
| Questions | `message-square-text` | `MessageSquareText` |
| Technical question | `code-2` | `Code2` |
| Good-answer hint | `lightbulb` | `Lightbulb` |
| Focus skill | `target` | `Target` |
| Profile | `user` | `User` |

Sizes: 16px inline (`size={16}`), 20px buttons and navigation, 24px feature highlights and stat cards, 44px inside an 88px `primary-tint` circle for empty states. Always `strokeWidth={1.75}`.

## Motion recipes

- **Hover lift** — `transform: translateY(-2px); box-shadow: var(--shadow-card-hover); transition: transform var(--duration-fast) var(--ease-out)`
- **Press** — `transform: scale(0.98)`
- **Page enter** — fade from `opacity:0; translateY(8px)` over `--duration-base`; list rows stagger `--duration-stagger` (60ms)
- **Score ring** — SVG circle `stroke-dashoffset` from full to `c × (1 − score/100)` over `--duration-score`, number counts up in sync
- **Tags pop** — scale 0.6 → 1.06 → 1, 380ms, 90ms apart
- **Charts** — bars grow from width 0 over `--duration-chart`; Recharts `animationDuration={500}` `animationEasing="ease-out"`
- **Dialog** — backdrop fade; dialog `scale(0.96) → 1` over `--duration-slow`
- **Toast** — slide up 24px + fade in 300ms, auto-hide after 4s, slide down 220ms
- **Pipeline drag** — card `rotate(2.5deg) scale(1.03)` + `--shadow-float`; target column `primary-tint`; count bump 360ms
- **Rotating headline** — landing hero line 2 cycles "Hire fairly." → "Hire smarter." → "Hire with evidence." every `--duration-rotate` (2.5s); the new phrase slides up from 100% while the old one slides out to −100%, over `--duration-slow` `ease-out`. Every phrase sits invisibly in the same grid cell, so the box keeps the height of the longest phrase and nothing below moves. Screen readers get one static sentence ("Hire faster. Hire fairly.").
- **Floating hero cards** — the hero cards bob 8–10px on `ease-in-out` (`--ease-loop`) loops at different speeds (`--duration-float` 6s and `--duration-float-fast` 4.5s), each with a slight fixed tilt (−3° and 2°).
- **Background loop** — blurred brand-purple blobs drifting on 18–24s `ease-in-out` loops (landing and auth only)
- **Reduced motion** — remove loops, reveals, confetti and movement; keep 200ms opacity fades. The hero headline shows only "Hire fairly." and the hero cards stay still.

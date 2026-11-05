HireLens helps small and medium companies in Pakistan hire faster and more fairly: HR posts a job, candidates apply with a PDF CV, AI scores every CV with reasons and evidence, and HR makes every decision. The interface must feel **trustworthy, fair, smart and modern — professional but warm, premium but never flashy**. Light theme only, and never stark white: lavender pages, light lilac cards and a deep purple navigation.

Two audiences shape every screen:
- **HR officers and recruiters** work long sessions on a laptop. Their pages are calm, plain and easy to scan: a deep purple sidebar (`nav-bg`), lavender `surface-page` background, light lilac `surface` cards, dense tables, small quick motion.
- **Candidates**, many of them fresh graduates on phones. Their pages are mobile first, friendly and simple: one column at 360px on the same lavender background under a slim deep purple top bar, 44px targets, plain words, and never a score.

## Voice and copy

- Short, clear, friendly sentences. Address the reader as "you". Sentence case everywhere ("Post a job", not "Post A Job").
- Name actions with verbs: "Shortlist", "Retry screening", "Copy job link". Never "OK" or "Submit" alone when a clearer verb exists.
- Errors say what happened and what to do: "Only PDF files are accepted", "File must be under 5 MB", "Couldn't save, try again", "Apply by date can't be in the past". Never show raw errors, codes or blank pages.
- AI results always show reasons and evidence ("Built a job board SPA in React with hooks (2025)"). Remind HR that **AI only advises, HR decides**.
- Candidate-facing copy is kind and final: "Not selected — ABC Tech has moved forward with other candidates. Thank you for applying."
- No emoji in the interface. Dates as "20 Oct"; times as "11:00 am"; durations as "3 days left".
- Example data used across this system: company **ABC Tech**, job **Junior Web Developer**, HR user **Sara**, candidates **Ayesha (88)**, **Ali (74)**, **Usman (61)**, plus **Hira** (pending screening).

## Colour

- **Brand**: `primary` #5B3FD9 for buttons, links, accents, the active navigation item and the focus ring; `primary-hover` on hover. `primary-tint` for highlights, selected rows, the Shortlisted badge and the AI note (which also gets a `primary-faint` border, since the tint sits close to the lavender page), always with `on-primary-tint` text.
- **Grounds**: `surface-page` warm cream #F3EEE6 behind every work page (HR and candidate); `surface` light cream #FBF8F2 for cards, tables, dialogs, inputs and menus — never pure white; `surface-sunken` for row hover and inner boxes; `surface-column` for pipeline columns. `border` warm sand #E3DACB for card, table and divider lines.
- **Navigation**: `nav-bg` deep purple #24164F for the HR sidebar, the candidate top bar and mobile menus. Resting labels `nav-text-muted` (7.3:1), strong text `nav-text` (13:1), hover `nav-hover`, the active item a `primary` pill with `on-primary` text. Focus on dark bars is a white ring (`shadow-focus-nav`) because `primary` is only 2.4:1 on `nav-bg`.
- **Text**: `ink` for headings and body (14.6:1 on lavender), `ink-muted` for secondary text (5.6:1 on lavender, 6.4:1 on cards), `ink-placeholder` only inside fields, `border-control` #7F7A96 for the edge of inputs and secondary buttons (3.5:1 on lavender, 4:1 on cards).
- **Meaning**: teal `success` for found requirements, Done and Hired; orange `warning` for missing requirements, close deadlines and warnings; red `danger` for errors and Rejected; grey `neutral` for Applied, Queued, Pending and Draft; blue `info` for Interview; `amber` for Offer; `muted` light grey with a dashed border for Withdrawn and Closed.
- Every status carries an **icon and a word**; colour never carries meaning alone. Colours that must be told apart in charts (`chart-1`…`chart-5`) step in lightness, not hue.
- **Gradients** only on the landing hero, the login and sign-up art panel, the CTA band (all `primary-deep` with drifting `primary`, `primary-hover`, `primary-soft`, `primary-faint` shapes) and as a subtle accent on the score ring and match bar. Work pages use flat backgrounds.
- All text pairs meet WCAG AA (4.5:1); each colour token's note names the grounds it was checked on.

## Typography

**Manrope** for everything (Google Fonts, weights 400, 500, 700, 800 only).
- `display` 56/60 800 — landing hero only (`display-sm` 36/40 on phones and the auth panel).
- `page-title` 30/38 800 — one per page (24/32 on phones).
- `section-heading` 22/30 700 · `card-title` 17/24 700.
- `body` 15/24 400 is the default; `body-lg` 17/28 for landing and auth leads; `body-medium` for emphasis.
- `small` 13/20 for meta and evidence quotes · `label` 13/18 700 for form labels, badges and table headers · `caption` 12/16 700 uppercase, sparingly.
- `numeric-xl` 40/44 800, `numeric-lg` 28/32 800 and `numeric` 15/20 700 for scores, percentages and KPIs, always with `font-variant-numeric: tabular-nums`.

## Space, shape and layout

- 4/8 spacing scale: `space-1` 4 … `space-24` 96. Cards pad `space-6` (24px; 16px on phones); page sections are `space-8` apart; phone gutters `space-4`.
- Radius: `radius-control` 10px buttons and inputs, `radius-card` 16px cards and tables, `radius-dialog` 20px dialogs and the auth card, `radius-pill` tags and badges.
- Depth: 1px `border` plus `shadow-card` at rest; `shadow-card-hover` with a 2px lift for clickable cards; `shadow-float` for menus, dialogs, toasts and dragged cards. Never heavy shadows on flat content.
- HR layout: `sidebar-width` 248px deep purple sidebar on the left, a 64px content top bar (search, notifications, Post a job) on `surface-page`, content beside it. Below 900px the sidebar becomes a 56px deep purple top bar with a menu button. Candidate layout: a 56px deep purple top bar over the lavender page.
- Widths: HR content `width-hr` 1160px; candidate pages `width-candidate` 820px; forms `width-form` 720px; auth card `width-auth` 440px.
- Everything stacks cleanly at 360px with no horizontal page scroll; wide tables and the pipeline board scroll inside their own box. Touch targets at least 44px (`touch-target`).

## Iconography

- **Lucide** outline icons only, stroke `stroke-icon` 1.75, rounded caps, `currentColor`. In code use `lucide-react`.
- Sizes: `icon-sm` 16px inline, `icon-md` 20px in buttons and navigation, `icon-lg` 24px for features and stat cards, `icon-xl` 44px inside an 88px `primary-tint` circle for empty states.
- Icons sit next to a text label or the control has an `aria-label`. The **Icon library** card maps each meaning to one icon (found `check-circle-2`, missing `x-circle`, AI `sparkles`, deadline `clock`, …) — use that mapping, never synonyms.
- The HireLens logo is the owl mark (`public/logo-mark.svg`) beside "HireLens" in Manrope 800 with "Lens" in the logo gradient; see the Logo section of `design-guidelines.md`. The component previews still draw the old placeholder mark. Company logos fall back to an initials monogram on `primary-deep`.

## Motion

One easing, `ease-out` = cubic-bezier(0.16, 1, 0.3, 1). Durations: `duration-fast` 150ms hovers and presses, `duration-base` 220ms most transitions, `duration-slow` 300ms dialogs and menus, `duration-chart` 500ms charts, `duration-score` 600ms score ring and count-ups, `duration-loop` 20s background loops. Motion guides attention, shows progress and confirms actions — see the **Motion** card for the full catalogue (landing reveals, AI scanning shimmer, score draw-in, pipeline drag, toasts, confetti on Hired). Work pages keep motion small and quick. When the user prefers reduced motion: no loops, reveals, confetti or movement — simple fades only.

## States and interaction

- Buttons: hover lift 2px, press `scale(0.98)`, focus `shadow-focus` (2px `surface` gap + 2px `primary`; white `shadow-focus-nav` on dark bars), disabled `surface-sunken`/`ink-disabled`, loading spinner inside the button with the width kept.
- Every list has empty, loading (skeleton), error (alert with Retry) and success states, using the copy from the user flows.
- Every AI action has a loading state: "AI is checking this CV…", "Writing description…", "Writing questions…", and a Retry when AI fails.

## Privacy rules the design enforces

- Candidates never see a score, match percentage, AI summary or HR note — on any screen size or in any email.
- Public company and job pages never show HR names, applicant counts or candidate data.
- HR-only blocks carry the "Only HR can see this" chip (`lock`).
- Destructive actions confirm in a dialog; deleting an account needs the user to type DELETE.

## Using this system

`tokens.json` holds every value; `components/bundle.css` implements the components with `hl-` classes on top of the tokens; each component card has a live preview and guidelines. The **Developer handoff** section has every token in copyable form plus the rules for developers, ready to save as `design/design-guidelines.md`.

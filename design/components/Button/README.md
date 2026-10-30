# Button

Buttons trigger actions; links navigate. Use a real `<button>` with a visible text label.

**Variants** (`hl-btn` + modifier)
- `--primary` — the one main action per view (Publish job, Submit application, Shortlist). `primary` fill, `on-primary` text; hover `primary-hover`.
- `--secondary` — supporting actions (Save draft, Copy link). `surface` fill, `border-control` edge.
- `--ghost` — low-emphasis or inline actions (Cancel, Write with AI). Text in `primary`, `primary-tint` on hover.
- `--danger` — destructive and final (Delete account, Close job inside a confirm dialog). `danger` fill. `--danger-ghost` for Reject in tables.
- `--sm` — 36px for dense HR tables; an invisible `::after` keeps the hit area at 44px. `--icon` — square; must carry `aria-label`. `--block` — full width on phones and auth forms.

**States** — default, hover (lift 2px + `shadow-card-hover`, 150ms), active (`scale(0.98)`), focus-visible (`shadow-focus`), disabled (`surface-sunken` / `ink-disabled`, no hover), loading (`is-loading` + `aria-busy="true"`: label hidden, spinner centred, width kept, clicks ignored).

**Do** put the icon before the label at 20px (16px in `--sm`). Keep labels to verbs: "Post a job", "Retry screening". **Don't** place two primary buttons side by side, or use danger for Reject on the pipeline board (it is a normal step, confirm it instead).

**Consumer provides** the label, optional leading Lucide icon, `onClick`, and `aria-label` for icon-only buttons.

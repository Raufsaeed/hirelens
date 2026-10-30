# Icon library

One outline set everywhere: **Lucide**, stroke `stroke-icon` (1.75), rounded caps and joins, `currentColor`.

**Sizes** — `icon-sm` 16px inline with text, tags, badges and meta lines; `icon-md` 20px in buttons, fields and navigation; `icon-lg` 24px for feature highlights and stat cards; `icon-xl` 44px inside an 88px `primary-tint` circle for empty states.

**Rules**
- An icon always sits next to a text label, or the control has an `aria-label` ("Close", "Copy link"). Decorative icons get `aria-hidden="true"`.
- Icon colour follows its text (`currentColor`). Status icons use the mid-tone token of their tone (`success`, `warning`, `danger`, `info`) on light fills.
- Use the mapping on this card; never swap in a different icon for the same meaning (Missing is always `x-circle`, never `x`).
- In code: `lucide-react` (`<Sparkles size={20} strokeWidth={1.75} />`). Lucide renamed a few icons; the current names are `circle-check` (check-circle-2), `circle-x` (x-circle), `triangle-alert` (alert-triangle), `cloud-upload` (upload-cloud), `chart-column` (bar-chart-3), `circle-alert` (alert-circle). Both names render the same glyph.

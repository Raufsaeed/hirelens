# Skeleton

Placeholder shapes that match the layout about to load, with a soft left-to-right shimmer (`surface-sunken` → `surface-skeleton-shine`, 1.4s loop).

**Shapes** — rows (avatar circle, name line, ring circle, badge pill), cards (title, meta line, tag pills), forms (label lines + 44px fields), charts (bars). Use the real spacing so content does not jump when it arrives.

**Rules** — show after 150ms (skip for fast loads); the container gets `aria-busy="true"` and a label like "Loading candidates". Buttons use their own spinner, not a skeleton. Reduced motion: static grey shapes.

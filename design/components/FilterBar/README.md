# Filter bar and top search

**Filter bar** (candidates list) — a card with: Minimum score slider (0–100, step 5, live value in `numeric`), Experience select (`award`), Skill select (`sliders-horizontal`), and a ghost "Clear filters" (`x`). The list updates straight away; a live line says "2 of 23 candidates match". Four columns on desktop, two on tablets, one on phones. Nothing left → empty state "No candidates match these filters" with "Clear filters".

**Top search** (HR content top bar) — `surface` field with `search` icon and a `/` shortcut chip. Needs 2+ characters ("Type at least 2 characters"); shows "Searching…" then a dropdown of matches across ABC Tech jobs only: avatar, name, job · score, pipeline badge. The dropdown fades and drops in (220ms). Arrow keys move the active row (`primary-tint`), Enter opens, Esc closes. Empty: "No candidates found for 'xyz'". Error: "Couldn't search right now, try again".

# Pipeline card

A candidate on the pipeline board. HR drags it between columns, or uses the "Move to" dropdown (keyboard and phone friendly — dragging is never the only way).

**Anatomy** — `grip-vertical` drag handle · avatar · name and job · small score ring · optional meta (interview date with `calendar-clock`) · "Move to" select (36px, labelled for screen readers).

**Drag** — on pick-up the card tilts 2.5°, scales 1.03 and lifts to `shadow-float`; the target column tints `primary-tint`; on drop the card fades up into the new column and the column count bumps. If the save fails the card returns to its column and a toast says "Couldn't move this candidate, try again".

**Moves that need a step** — to Interview opens the schedule form; to Rejected asks for confirmation. Hired fires one small confetti burst. AI never moves a card.

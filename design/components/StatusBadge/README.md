# Status badge

A pill that names a status with an icon and a word. Colour supports the word; it never carries the meaning alone.

**Pipeline** — Applied `neutral` (`send`) · Shortlisted `primary` (`star`) · Interview `info` (`calendar-clock`) · Offer `amber` (`handshake`) · Hired `success` (`party-popper`) · Rejected `danger` (`circle-slash`) · Withdrawn `muted` with dashed border (`undo-2`).

**Screening** (HR only) — Queued and Pending `neutral` (`hourglass`) · Processing `primary` with a 12px spinner · Done `success` (`check-circle-2`) · Failed `danger` (`alert-circle`). "Pending · Retry screening" is a split badge: the status plus a `primary` text button; while retrying the row shows "Screening…" and ignores repeat clicks. A scanned PDF shows `warning` "CV could not be read" (`file-x`) — no retry, point HR to "Open original CV".

**Job** — Draft `neutral` (`pencil`) · Open `primary` (`circle-dot`) · Closed `muted` (`lock`); "Closed · Deadline passed" when the Apply by date closed it.

**Tokens** — each tone is a `*-bg` fill with its `*-text` (all 6:1 or better). 26px tall, 13px/700, `radius-pill`.

**Motion** — on change the badge cross-fades to its new colour (`duration-base`).

**Candidate view** — candidates see pipeline badges only. Shortlisted reads as "Shortlisted"; never show screening status or score.

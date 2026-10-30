# Settings sections

One page, stacked sections inside a card (`width-form` area for the fields). Each section: a 240px left column with the title (17/700) and one helpful sentence, and a right column (max 440px) with its own fields and its own Save button. Sections are divided by `border`. Below 760px the columns stack.

**Order** — Name · Email (send confirmation link; old email keeps working) · Password (current + new with live ticks) · Email preferences (toggles) · link to Company settings (HR) · Delete account (candidates; `danger` title, opens the type-DELETE dialog).

**Feedback** — each Save shows a button spinner then a toast: "Name updated", "Check your new email to confirm the change", "Password updated", "Preference saved". Errors inline: "Current password is incorrect", "Email already in use".

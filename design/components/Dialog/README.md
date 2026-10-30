# Dialog

Interrupts only to confirm something important: Close job, Reject a candidate, Re-screen candidates, Delete account.

**Anatomy** — `overlay` backdrop; `surface` dialog, max 460px, `radius-dialog`, `shadow-float`, 24px padding; 44px icon circle (`primary-tint` for neutral confirms, `danger-bg` for destructive); title (`card-title`) that asks the question; one or two sentences on the consequence; actions right-aligned: secondary Cancel, then the action named with a verb ("Close job", never "OK"). Phones: actions stack full width, main action on top.

**Type DELETE** — destructive, irreversible actions (candidate deletes their account) add a field "Type DELETE to confirm"; the danger button stays disabled until the text matches exactly.

**Motion** — backdrop fades in, dialog scales 0.96 → 1 (300ms `ease-out`). Reduced motion: fade only.

**Accessibility** — `role="dialog"` (or `alertdialog` for destructive), `aria-modal`, labelled by the title; focus moves to the first field or Cancel, is trapped inside, Esc closes, focus returns to the trigger.

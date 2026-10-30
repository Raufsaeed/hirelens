# Toast

Short confirmation after an action: "Link copied", "Job saved", "Moved Ali to Shortlisted", "Couldn't save, try again".

**Look** — dark `ink` pill-card (14px radius, `shadow-float`), white text 14/500, a 28px tinted icon circle: success `check-circle-2` on `success-bg`, error `alert-circle` on `danger-bg`, info `info` on `info-bg`. A dismiss button (`x`, `aria-label="Dismiss"`).

**Behaviour** — bottom centre, max 420px wide, stacks upward; slides up and fades in (300ms), auto-hides after 4s (errors stay until dismissed when they need action), slides down out (220ms). Success/info use `role="status"`, errors `role="alert"`; the container is `aria-live="polite"`.

**Copy** — one sentence, past tense for success, "Couldn't … , try again" for errors. Never a raw error.

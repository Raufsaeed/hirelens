# Password field

Password input with a show/hide toggle and three live requirement ticks. Used on Sign up, Set new password and Settings → Password.

**Rules** (from the project rules) — at least 8 characters; one capital letter A–Z; one special character such as @ # $ !. Ticks update on every keystroke: an unmet rule is an empty circle with `ink-muted` text; a met rule fills `success`, the check draws in (300ms) and the text turns `success-text`. Each item carries hidden "met / not met" text for screen readers and the list is `aria-live="polite"`.

**On submit with unmet rules** show exactly: "Password must be at least 8 characters and include one capital letter and one special character (like @)". Confirm field: "Passwords don't match".

**Do** keep the eye button (`eye` / `eye-off`, `aria-label` "Show password" / "Hide password") inside the field on the right. **Don't** show a strength meter or colour the ticks red while the user is still typing.

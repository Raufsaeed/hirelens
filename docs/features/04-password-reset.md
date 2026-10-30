# Feature 04 · Password Reset

## Description

Users who forget their password get a reset link by email, set a new password, and are logged in.

## User Stories

- As **any user**, I want to reset a forgotten password, so that I can get back into my account without help.

## Functional Requirements

1. **Forgot password:** The user enters their email and receives a reset email with a link to set a new password.
2. **Reset password:** The user enters a new password twice. The password rule from Feature 01 applies, with the three requirements ticked as the user types.
3. **After reset:** The user is logged in and redirected by role (Feature 03).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Forgot Password | Email field and "Send reset link" button. | Blank email field | Button spinner | "Please enter a valid email" | "If an account exists for this email, we've sent a reset link" |
| Reset Password | New password and confirm password fields. | Two blank fields | Save button spinner | "This link has expired, request a new one", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated", logged in and redirected by role |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| Forgot Password | Email | Neutral message; reset email sent only if the account exists |
| Reset Password | New password, confirm password | Password saved, logged in, sent to the right page by role |

## Data Used

- **Supabase Auth user** (Feature 01): sends the reset email and saves the new password.

## Business Rules and Permissions

- Reset messages are neutral, so nobody can find out which emails are registered.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Expired reset link | "This link has expired, request a new one" | Does not change the password; links to Forgot Password. |
| Weak password | Password rule message (Feature 01) | Does not save; the unmet requirements stay unticked. |

## Acceptance Criteria

- [ ] Forgot and reset password work end to end, and the reset message is neutral.

## User Flows

- Flow 4 · User resets a forgotten password

## Test Cases

- Given no account exists for test@example.com, when someone requests a password reset for it, then they see "If an account exists for this email, we've sent a reset link" and no email is sent.
- Given Sara (HR) and Ali (candidate) each reset their password, when they are logged in, then Sara lands on the HR Dashboard and Ali lands on My Applications.
- Given Ali's reset link is older than its time limit, when he opens it, then he sees "This link has expired, request a new one".

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up) and Feature 03 (Login and Logout).
- **Depended on by:** None.

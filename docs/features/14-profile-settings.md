# Feature 14 · Profile Settings

## Description

This feature gives every user a Settings page to change their name, email and password. Candidates can also delete their account and all their data here, and HR gets a link to Company Settings. Email preferences from Feature 15 are shown here once that feature is built.

## User Stories

- As **any user**, I want to change my name, so that it is shown correctly everywhere.
- As **any user**, I want to change my email safely, so that I keep getting messages and can still log in.
- As **any user**, I want to change my password, so that I can keep my account secure.
- As a **candidate**, I want to delete my account and all my data, so that I stay in control of my information.
- As an **HR user**, I want a quick link to Company Settings, so that I can update company details from one place.

## Functional Requirements

1. **Settings page:** Reached from the user menu on every page. It has sections for Name, Email, Password, Email preferences, and either Delete account (candidates) or Company Settings link (HR).
2. **Change name:** The user edits their full name and clicks Save.
3. **Change email:**
   - The user enters a new email.
   - A confirmation link is sent to the new email.
   - The email only changes after the link is clicked. Until then the old email keeps working, and the page shows "Check your new email to confirm the change".
4. **Change password:**
   - The user enters the current password, the new password and the new password again.
   - The new password must have at least 8 characters, one capital letter and one special character.
   - The three requirements are shown under the field and ticked as the user types.
5. **Email preferences:** The on/off switches from Feature 15 are shown here. Until Feature 15 is built, this section is hidden.
6. **Delete account (candidates only):**
   - The candidate types DELETE to confirm.
   - Their account, profile, applications, CVs (including the default CV), saved jobs, screening results, status history, notes, interviews, interview feedback, interview questions and email log are removed. This cannot be undone.
   - They are logged out and see "Your account has been deleted".
7. **Company Settings link (HR only):** A link to Company Settings (Features 01 and 13).
8. **Messages:** Every change shows a clear success or error message.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Settings – Name | Full name field and Save. | Current name filled in | Save spinner | "This field is required" | "Name updated" |
| Settings – Email | Current email, new email field and "Send confirmation link". | Current email shown; new email blank | Button spinner | "Please enter a valid email", "Email already in use" | "Check your new email to confirm the change"; after confirming, "Email updated" |
| Settings – Password | Current password, new password, confirm new password, with the three requirements ticked as the user types. | Three blank fields, requirements unticked | Save spinner | "Current password is incorrect", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated" |
| Settings – Email preferences | On/off switches from Feature 15. | Hidden until Feature 15 is built | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |
| Settings – Delete account (candidate) | Warning, a field to type DELETE, and a Delete account button. | Button disabled until DELETE is typed | Button spinner | "Couldn't delete your account, try again" | Logged out; "Your account has been deleted" |
| Settings – Company link (HR) | A link to Company Settings. | N/A | N/A | N/A | Opens Company Settings |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Change name | Full name | Name updated everywhere; "Name updated" |
| Change email | New email | Confirmation link sent to the new email; email changes after the link is clicked |
| Change password | Current password, new password twice | Password updated; "Password updated" |
| Email preferences | Turns a switch on or off | Preference saved |
| Delete account | Types DELETE and clicks Delete account | All candidate data removed; logged out |

## Data Used

- **Supabase Auth user** (Feature 01): email and password changes, and the confirmation link for a new email.
- **`profiles`** (Feature 01): `full_name` and `email` are kept in step with Auth. Email preference fields come from Feature 15.
- **On candidate account delete:** rows in `profiles`, `applications`, `screenings`, `saved_jobs`, `status_history`, `notes`, `interviews`, `interview_feedback`, `interview_questions` and `notifications` for that candidate, and all their files in the `cvs` bucket, including the default CV.
- **How they link:** Everything is found through the user's `profiles.id`.

## Business Rules and Permissions

- A user can only change their own settings.
- The current password is required to set a new password.
- The new password must have at least 8 characters, one capital letter and one special character.
- A new email must not belong to another account, and only changes after it is confirmed.
- Role cannot be changed here.
- Only candidates can delete their account here. HR accounts are not deleted from Settings.
- Account delete removes all the candidate's data and cannot be undone.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Empty name | "This field is required" | Does not save. |
| Invalid new email | "Please enter a valid email" | Does not send a link. |
| New email already in use | "Email already in use" | Does not send a link. |
| Email confirmation link expired | "This link has expired, please request a new one" | Keeps the old email. |
| Wrong current password | "Current password is incorrect" | Does not change the password. |
| Weak new password | "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Does not save; unmet requirements stay unticked. |
| New passwords don't match | "Passwords don't match" | Does not save. |
| DELETE not typed | N/A | The Delete account button stays disabled. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the user typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Every user can change their name from Settings.
- [ ] Changing email sends a confirmation link, and the email only changes after it is clicked.
- [ ] Changing password needs the current password and follows the password rule, with requirements ticked as the user types.
- [ ] Candidates can delete their account and all their data after typing DELETE.
- [ ] HR sees a link to Company Settings.
- [ ] Email preferences appear once Feature 15 is built.
- [ ] Every change shows a clear success or error message.

## Test Cases

- Given Sara is on Settings, when she changes her name to "Sara Khan" and clicks Save, then she sees "Name updated" and her new name appears in the menu.
- Given Ali is on Settings, when he enters a new email and clicks "Send confirmation link", then he sees "Check your new email to confirm the change" and can still log in with his old email until he clicks the link.
- Given Ali is changing his password, when he enters the wrong current password, then he sees "Current password is incorrect" and his password does not change.
- Given Ali enters the new password "abctech2026", when he clicks Save, then only the 8-character requirement is ticked and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali has applied to ABC Tech, when he types DELETE and deletes his account, then he is logged out, his CV and application are removed, and Sara no longer sees him in her candidates list.
- Given Sara is HR, when she opens Settings, then she sees a link to Company Settings and no Delete account section.

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles).
- **Depended on by:** Feature 15 (Email Notifications).

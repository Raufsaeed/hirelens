# Feature 27 · Account Settings

## Description

Every user has a Settings page to change their name, email and password. HR also gets a link to Company Settings. Email preferences from Features 29 and 30 are shown here once those features are built.

## User Stories

- As **any user**, I want to change my name, so that it is shown correctly everywhere.
- As **any user**, I want to change my email safely, so that I keep getting messages and can still log in.
- As **any user**, I want to change my password, so that I can keep my account secure.
- As an **HR user**, I want a quick link to Company Settings, so that I can update company details from one place.

## Functional Requirements

1. **Settings page:** Reached from the user menu on every page. It has sections for Name, Email, Password, Email preferences, and either Delete account (candidates, Feature 28) or a Company Settings link (HR, Feature 09).
2. **Change name:** The user edits their full name and clicks Save.
3. **Change email:**
   - The user enters a new email.
   - A confirmation link is sent to the new email.
   - The email only changes after the link is clicked. Until then the old email keeps working, and the page shows "Check your new email to confirm the change".
4. **Change password:** The user enters the current password, the new password and the new password again. The password rule from Feature 01 applies, with the three requirements ticked as the user types.
5. **Email preferences:** The on/off switches from Features 29 and 30 are shown here. Until those features are built, this section is hidden.
6. **Messages:** Every change shows a clear success or error message.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Settings – Name | Full name field and Save. | Current name filled in | Save spinner | "This field is required" | "Name updated" |
| Settings – Email | Current email, new email field and "Send confirmation link". | Current email shown; new email blank | Button spinner | "Please enter a valid email", "Email already in use" | "Check your new email to confirm the change"; after confirming, "Email updated" |
| Settings – Password | Current password, new password, confirm new password, with the three requirements ticked as the user types. | Three blank fields, requirements unticked | Save spinner | "Current password is incorrect", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated" |
| Settings – Email preferences | On/off switches from Features 29 and 30. | Hidden until Features 29 and 30 are built | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |
| Settings – Company link (HR) | A link to Company Settings. | N/A | N/A | N/A | Opens Company Settings |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Change name | Full name | Name updated everywhere; "Name updated" |
| Change email | New email | Confirmation link sent to the new email; email changes after the link is clicked |
| Change password | Current password, new password twice | Password updated; "Password updated" |

## Data Used

- **Supabase Auth user** (Feature 01): email and password changes, and the confirmation link for a new email.
- **`profiles`** (Feature 01): `full_name` and `email` are kept in step with Auth.

## Business Rules and Permissions

- A user can only change their own settings.
- The current password is required to set a new password.
- A new email must not belong to another account, and only changes after it is confirmed.
- Role cannot be changed here.
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
| Network or server failure | "Something went wrong, please try again" | Keeps what the user typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Every user can change their name from Settings.
- [ ] Changing email sends a confirmation link, and the email only changes after it is clicked.
- [ ] Changing password needs the current password and follows the password rule, with requirements ticked as the user types.
- [ ] HR sees a link to Company Settings.
- [ ] Email preferences appear once Features 29 and 30 are built.
- [ ] Every change shows a clear success or error message.

## User Flows

- Flow 27 · User updates name, email and password

## Test Cases

- Given Sara is on Settings, when she changes her name to "Sara Khan" and clicks Save, then she sees "Name updated" and her new name appears in the menu.
- Given Ali is on Settings, when he enters a new email and clicks "Send confirmation link", then he sees "Check your new email to confirm the change" and can still log in with his old email until he clicks the link.
- Given Ali is changing his password, when he enters the wrong current password, then he sees "Current password is incorrect" and his password does not change.
- Given Ali enters the new password "abctech2026", when he clicks Save, then only the 8-character requirement is ticked and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up) and Feature 03 (Login and Logout).
- **Depended on by:** Feature 28 (Delete Account), Feature 29 (Candidate Email Updates) and Feature 30 (HR Daily Summary).

## Done When

- [ ] Changing the name to "Sara Khan" shows "Name updated" and the new name appears in the menu.
- [ ] A new email only changes after the confirmation link is clicked; the old email works until then.
- [ ] A new password that follows the password rule saves and shows "Password updated".
- [ ] A wrong current password shows "Current password is incorrect" and the password does not change.
- [ ] HR sees a link to Company Settings.

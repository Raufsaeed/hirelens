# Feature 01 · Accounts & Roles

## Description

This feature lets HR and candidates create accounts, log in and log out. It gives each user the correct role and creates the company record when HR signs up. It also protects pages, so each role can only reach its own pages.

## User Stories

- As an **HR user**, I want to sign up with my company name, so that I can post jobs for my company.
- As a **candidate**, I want to sign up quickly while applying, so that I don't lose the job I was about to apply for.
- As **any user**, I want to log in and log out, so that only I can use my account.
- As **any user**, I want to reset a forgotten password, so that I can get back into my account without help.
- As an **HR user**, I want my company's data to stay private, so that other companies and candidates cannot see our jobs or applicants.

## Functional Requirements

1. **HR sign up:** HR enters name, email, password and company name. The system creates the user with role `hr` and a new company record, and links the user to it.
2. **Candidate sign up:** The candidate enters name, email and password. The system creates the user with role `candidate`. This also works from inside the apply flow, and the candidate is returned to the job afterwards.
3. **Login:** Users log in with email and password.
4. **Logout:** Users can log out from the menu on any page. The session ends and they return to the login page.
5. **Forgot password:** The user enters their email and receives a reset email with a link to set a new password.
6. **Redirect after login by role:**
   - HR → HR Dashboard.
   - Candidate → My Applications, or back to the job they were applying for.
7. **Page protection:**
   - Logged-out users who open a protected page are sent to login.
   - Candidates cannot open HR pages.
   - HR cannot open another company's data.
8. **Company profile:** HR can view and edit a basic company profile (name, optional logo). The logo is a PNG or JPG under 2 MB, stored in the public storage bucket `logos` at `{company_id}/logo.{png or jpg}`. Uploading a new logo replaces the old one.
9. **Password rules:** At least 8 characters, at least one capital letter (A–Z), and at least one special character such as @, #, $ or !. The Sign Up and Reset Password forms show these three requirements under the password field and tick each one as the user types.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Landing | Short intro to HireLens with "I'm hiring" and "I'm looking for a job" buttons. | N/A | Page loading | "Something went wrong, please refresh" | Buttons lead to Sign Up with the right role chosen |
| Sign Up | Choice between "I'm hiring" and "I'm looking for a job", then the matching form (company name only for HR). | Blank form | Button spinner, button disabled | Field errors, "Email already in use", "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Account created, user logged in and redirected by role |
| Login | Email and password fields, "Forgot password" link, link to Sign Up. | Blank form | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and redirected by role |
| Forgot Password | Email field and "Send reset link" button. | Blank email field | Button spinner | "Please enter a valid email" | "If an account exists for this email, we've sent a reset link" |
| Reset Password | New password and confirm password fields. | Two blank fields | Save button spinner | "This link has expired, request a new one", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated", logged in and redirected by role |
| Company Settings | Company name and logo, with a Save button (HR only). | Name filled in, no logo yet | Save button spinner; logo upload progress | "Company name is required", "Logo must be a PNG or JPG under 2 MB", "Couldn't save, try again" | "Company updated" |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| HR Sign Up | Full name, email, password, company name | New `hr` account and company, logged in, sent to HR Dashboard |
| Candidate Sign Up | Full name, email, password | New `candidate` account, logged in, sent to My Applications or back to the job |
| Login | Email, password | Logged-in session, sent to the right page by role |
| Logout | Clicks "Sign out" | Session ended, back on the login page |
| Forgot Password | Email | Neutral message; reset email sent only if the account exists |
| Reset Password | New password, confirm password | Password saved, logged in, sent to the right page by role |
| Company Settings | Company name, optional logo | Updated company profile and "Company updated" message |

## Data Used

- **Supabase Auth user:** Handles email, password, sessions and reset emails.
- **`profiles` table:** `id`, `full_name`, `email`, `role` (`hr` or `candidate`), `company_id`, `created_at`.
- **`companies` table:** `id`, `name`, `logo_url`, `created_at`.
- **Storage bucket `logos`:** A public bucket holding company logos at `{company_id}/logo.{png or jpg}`. `companies.logo_url` points to the file. CVs are never stored here.
- **How they link:** `profiles.id` is the same as the Auth user's id, and `profiles.company_id` points to `companies.id` (filled for HR, empty for candidates).

## Business Rules and Permissions

- One email can only have one account.
- Role is set at sign up and cannot be changed by the user.
- An HR user belongs to exactly one company.
- Row Level Security:
  - A user can only read and update their own profile.
  - Anyone, even logged out, can read company info (name, slug, logo, about, website, location), because job pages and company pages are public.
  - Only HR of that company can update it.
- Only HR of that company can upload or replace its logo in the `logos` bucket. Anyone can view logos. Logos must be PNG or JPG, under 2 MB. CVs are never stored in `logos`.
- Reset messages are neutral, so nobody can find out which emails are registered.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Email already in use | "Email already in use. Log in instead?" | Does not create an account; shows a link to Login. |
| Wrong email or password | "Email or password is incorrect" | Keeps the email filled in, shows the "Forgot password" link, does not say which part was wrong. |
| Weak password | "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Does not submit the form; the unmet requirements under the field stay unticked. |
| Empty required fields | "This field is required" under each empty field | Highlights the fields and does not submit. |
| Expired reset link | "This link has expired, request a new one" | Does not change the password; links to Forgot Password. |
| Logo is not a PNG or JPG, or is over 2 MB | "Logo must be a PNG or JPG under 2 MB" | Does not upload the file; the old logo stays. |
| Logged-out user opens a protected page | "Please log in to continue" | Redirects to Login and returns to that page after login. |
| Candidate opens an HR page | "You don't have access to this page" | Blocks the page and shows no HR data; offers a link to My Applications. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the user typed and lets them retry; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can sign up with name, email, password and company name, and a company record is created.
- [ ] A candidate can sign up, including from inside the apply flow, and is returned to the job.
- [ ] Both roles can log in and log out.
- [ ] After login, HR lands on the HR Dashboard and candidates land on My Applications (or the job they were applying for).
- [ ] Logged-out users are sent to Login from any protected page.
- [ ] Candidates cannot open HR pages, and HR cannot see another company's data.
- [ ] Forgot and reset password work end to end, and the reset message is neutral.
- [ ] Passwords without at least 8 characters, one capital letter and one special character are rejected, and the three requirements are ticked live under the field.
- [ ] HR can edit the company name and logo.
- [ ] Every error case shows a clear, friendly message and never a raw error or blank page.

## Test Cases

- Given Sara has no account, when she signs up with her name, a new email, a valid password and "ABC Tech", then her account and company are created and she lands on the empty HR Dashboard.
- Given an account already exists for sara@abctech.com, when Sara tries to sign up with that email, then she sees "Email already in use" and a link to log in.
- Given Sara has an account, when she logs in with the wrong password, then she sees "Email or password is incorrect" with a "Forgot password" link and stays on the Login page.
- Given no account exists for test@example.com, when someone requests a password reset for it, then they see "If an account exists for this email, we've sent a reset link" and no email is sent.
- Given Sara (HR) and Ali (candidate) each reset their password, when they are logged in, then Sara lands on the HR Dashboard and Ali lands on My Applications.
- Given Ali is on the Sign Up form, when he enters the password "abctech2026" (long enough but with no capital letter or special character), then only the 8-character requirement is ticked, the account is not created, and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali is logged in as a candidate, when he opens the URL of an HR page, then he sees "You don't have access to this page" and no HR data is shown.
- Given Sara is in Company Settings, when she uploads a 3 MB logo for ABC Tech, then she sees "Logo must be a PNG or JPG under 2 MB" and the old logo stays.

## Dependencies

- None. This is the first feature.
- Every other feature depends on it.
- See Feature 11 · Candidate Profile, Feature 13 · Company Page, Feature 14 · Profile Settings and Feature 15 · Email Notifications.

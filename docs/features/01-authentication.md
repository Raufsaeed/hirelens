# Feature 01 · Authentication

## Description

HR and candidates create accounts, log in, log out and reset a forgotten password. HR sign up also creates the company record. Each role is sent to its own pages, and pages are protected so each role can only reach its own pages and data. This feature also holds the password rule used by every password form.

## User Stories

- As an **HR user**, I want to sign up with my company name, so that I can post jobs for my company.
- As a **candidate**, I want to sign up quickly while applying, so that I don't lose the job I was about to apply for.
- As **any user**, I want to log in and log out, so that only I can use my account.
- As **any user**, I want to reset a forgotten password, so that I can get back into my account without help.
- As an **HR user**, I want my company's data to stay private, so that other companies and candidates cannot see our jobs or applicants.

## Functional Requirements

1. **Landing page:** A short intro to HireLens with "I'm hiring" and "I'm looking for a job" buttons. Each leads to Sign Up with the right role chosen.
2. **HR sign up:** HR enters full name, email, password and company name. The system creates the user with role `hr` and a new company record, and links the user to it.
3. **Company slug:** The company's public page address is made from the company name at sign up (rules in Feature 06).
4. **Candidate sign up:** The candidate enters full name, email and password. The system creates the user with role `candidate`. This also works from inside the apply flow (Feature 08), and the candidate is returned to the same job's apply form afterwards.
5. **Password rule:** At least 8 characters, at least one capital letter (A–Z), and at least one special character such as @, #, $ or !. Every form that sets a password (Sign Up and Reset Password here, and Feature 22) shows these three requirements under the password field and ticks each one as the user types.
6. **Login:** Users log in with email and password. The page has a "Forgot password" link and a link to Sign Up.
7. **Logout:** Users can log out from the menu on any page. The session ends and they return to the login page.
8. **Forgot password:** The user enters their email and receives a reset email with a link to set a new password.
9. **Reset password:** The user enters a new password twice. The password rule applies.
10. **Redirect by role (after sign up, login or reset):**
    - HR → HR Dashboard.
    - Candidate → My Applications, or back to the job they were applying for.
11. **Page protection:**
    - Logged-out users who open a protected page are sent to login and returned to that page after login.
    - Candidates cannot open HR pages.
    - HR cannot open another company's data.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Landing | Short intro to HireLens with "I'm hiring" and "I'm looking for a job" buttons. | N/A | Page loading | "Something went wrong, please refresh" | Buttons lead to Sign Up with the right role chosen |
| Sign Up | Choice between "I'm hiring" and "I'm looking for a job", then the matching form (company name only for HR). | Blank form | Button spinner, button disabled | Field errors, "Email already in use", "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Account created, user logged in and redirected by role |
| Login | Email and password fields, "Forgot password" link, link to Sign Up. | Blank form | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and redirected by role |
| Forgot Password | Email field and "Send reset link" button. | Blank email field | Button spinner | "Please enter a valid email" | "If an account exists for this email, we've sent a reset link" |
| Reset Password | New password and confirm password fields. | Two blank fields | Save button spinner | "This link has expired, request a new one", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated", logged in and redirected by role |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| HR Sign Up | Full name, email, password, company name | New `hr` account and company, logged in, sent to HR Dashboard |
| Candidate Sign Up | Full name, email, password | New `candidate` account, logged in, sent to My Applications or back to the job |
| Login | Email, password | Logged-in session, sent to the right page by role |
| Logout | Clicks "Sign out" | Session ended, back on the login page |
| Forgot Password | Email | Neutral message; reset email sent only if the account exists |
| Reset Password | New password, confirm password | Password saved, logged in, sent to the right page by role |

## Data Used

- **Supabase Auth user:** Handles email, password, sessions and reset emails (also used by Feature 22).
- **`profiles` table:** `id`, `full_name`, `email`, `role` (`hr` or `candidate`), `company_id`, `created_at`.
- **`companies` table:** `id`, `name`, `slug`, `logo_url`, `created_at` (more fields in Feature 06).
- **How they link:** `profiles.id` is the same as the Auth user's id, and `profiles.company_id` points to `companies.id` (filled for HR, empty for candidates). `profiles.role` and `profiles.company_id` decide where the user is sent and what they can open.

## Business Rules and Permissions

- One email can only have one account.
- Role is set at sign up and cannot be changed by the user.
- An HR user belongs to exactly one company. A candidate has no company.
- This version has one HR user per company. Inviting team members is a future feature.
- A user can only read and update their own profile.
- Candidates cannot open HR pages.
- HR can only see their own company's data.
- Reset messages are neutral, so nobody can find out which emails are registered.
- Row Level Security enforces these rules in the database, not only in the pages.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Email already in use | "Email already in use. Log in instead?" | Does not create an account; shows a link to Login. |
| Wrong email or password | "Email or password is incorrect" | Keeps the email filled in, shows the "Forgot password" link, does not say which part was wrong. |
| Weak password | "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Does not submit the form; the unmet requirements under the field stay unticked. |
| Empty required fields | "This field is required" under each empty field | Highlights the fields and does not submit. |
| Expired reset link | "This link has expired, request a new one" | Does not change the password; links to Forgot Password. |
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
- [ ] Every error case shows a clear, friendly message and never a raw error or blank page.

## User Flows

- Flow 1 · User signs up, logs in and resets a password

## Test Cases

- Given Sara has no account, when she signs up with her name, a new email, a valid password and "ABC Tech", then her account and company are created and she lands on the empty HR Dashboard.
- Given an account already exists for sara@abctech.com, when Sara tries to sign up with that email, then she sees "Email already in use" and a link to log in.
- Given Sara is on the HR sign up form, when she leaves the company name empty and clicks Sign up, then the field shows "This field is required" and no account is created.
- Given Ali is on the Sign Up form, when he enters the password "abctech2026" (long enough but with no capital letter or special character), then only the 8-character requirement is ticked, the account is not created, and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali is logged out and clicks Apply on Junior Web Developer, when he signs up with a new email and a valid password, then he is logged in and back on the apply form for Junior Web Developer.
- Given an account already exists for Ali's email, when he tries to sign up with it, then he sees "Email already in use. Log in instead?" and no second account is created.
- Given Sara has an account, when she logs in with the wrong password, then she sees "Email or password is incorrect" with a "Forgot password" link and stays on the Login page.
- Given Ali is logged in as a candidate, when he opens the URL of an HR page, then he sees "You don't have access to this page" and no HR data is shown.
- Given a user is not logged in, when they open the URL of an HR candidates page, then they are sent to the log in page and no candidate data is shown.
- Given no account exists for test@example.com, when someone requests a password reset for it, then they see "If an account exists for this email, we've sent a reset link" and no email is sent.
- Given Sara (HR) and Ali (candidate) each reset their password, when they are logged in, then Sara lands on the HR Dashboard and Ali lands on My Applications.
- Given Ali's reset link is older than its time limit, when he opens it, then he sees "This link has expired, request a new one".

## Dependencies

- **Depends on:** None. This is the first feature.
- **Depended on by:** Every other feature.

## Done When

- [x] Sara signs up with her name, email, password and "ABC Tech", and lands on the empty HR Dashboard.
- [x] The ABC Tech company record is created and linked to Sara's account.
- [x] The three password requirements tick as she types, and a weak password shows "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- [x] Signing up with an existing email shows "Email already in use" with a link to log in.
- [x] Leaving the company name empty shows "This field is required" and no account is created.
- [x] Ali signs up with his name, email and password and is logged in.
- [x] Signing up after clicking Apply returns Ali to the same job's apply form.
- [x] The password "abctech2026" is rejected, with only the 8-character requirement ticked.
- [x] An existing email shows "Email already in use. Log in instead?" and no second account is created.
- [x] Sara logs in and lands on the HR Dashboard; Ali logs in and lands on My Applications.
- [x] Sign out from the menu ends the session and returns to the login page.
- [x] A wrong password shows "Email or password is incorrect" with a "Forgot password" link.
- [x] A logged-out user who opens an HR page is sent to Login and sees no data.
- [x] Privacy: Ali (candidate) opening an HR page sees "You don't have access to this page" and no HR data.
- [x] Requesting a reset shows "If an account exists for this email, we've sent a reset link".
- [x] Privacy: an email with no account gets the same message, and no email is sent.
- [x] A valid reset link lets the user save a new password that follows the password rule.
- [x] An expired link shows "This link has expired, request a new one".
- [x] After the reset, Sara lands on the HR Dashboard and Ali lands on My Applications.

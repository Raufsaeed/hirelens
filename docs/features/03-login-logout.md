# Feature 03 · Login and Logout

## Description

Users log in and log out. Each role is sent to its own pages, and pages are protected so each role can only reach its own pages and data.

## User Stories

- As **any user**, I want to log in and log out, so that only I can use my account.
- As an **HR user**, I want my company's data to stay private, so that other companies and candidates cannot see our jobs or applicants.

## Functional Requirements

1. **Login:** Users log in with email and password. The page has a "Forgot password" link (Feature 04) and a link to Sign Up.
2. **Logout:** Users can log out from the menu on any page. The session ends and they return to the login page.
3. **Redirect after login by role:**
   - HR → HR Dashboard.
   - Candidate → My Applications, or back to the job they were applying for.
4. **Page protection:**
   - Logged-out users who open a protected page are sent to login and returned to that page after login.
   - Candidates cannot open HR pages.
   - HR cannot open another company's data.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Login | Email and password fields, "Forgot password" link, link to Sign Up. | Blank form | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and redirected by role |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| Login | Email, password | Logged-in session, sent to the right page by role |
| Logout | Clicks "Sign out" | Session ended, back on the login page |

## Data Used

- **Supabase Auth user** (Feature 01): sessions.
- **`profiles.role` and `profiles.company_id`** (Feature 01): decide where the user is sent and what they can open.

## Business Rules and Permissions

- Candidates cannot open HR pages.
- HR can only see their own company's data.
- Row Level Security enforces these rules in the database, not only in the pages.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Wrong email or password | "Email or password is incorrect" | Keeps the email filled in, shows the "Forgot password" link, does not say which part was wrong. |
| Logged-out user opens a protected page | "Please log in to continue" | Redirects to Login and returns to that page after login. |
| Candidate opens an HR page | "You don't have access to this page" | Blocks the page and shows no HR data; offers a link to My Applications. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the user typed and lets them retry; never shows a raw error. |

## Acceptance Criteria

- [ ] Both roles can log in and log out.
- [ ] After login, HR lands on the HR Dashboard and candidates land on My Applications (or the job they were applying for).
- [ ] Logged-out users are sent to Login from any protected page.
- [ ] Candidates cannot open HR pages, and HR cannot see another company's data.

## User Flows

- Flow 3 · User logs in and logs out

## Test Cases

- Given Sara has an account, when she logs in with the wrong password, then she sees "Email or password is incorrect" with a "Forgot password" link and stays on the Login page.
- Given Ali is logged in as a candidate, when he opens the URL of an HR page, then he sees "You don't have access to this page" and no HR data is shown.
- Given a user is not logged in, when they open the URL of an HR candidates page, then they are sent to the log in page and no candidate data is shown.

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up) and Feature 02 (Candidate Sign Up).
- **Depended on by:** Every feature with logged-in pages.

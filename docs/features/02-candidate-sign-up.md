# Feature 02 · Candidate Sign Up

## Description

Candidates create an account, including from inside the apply flow, and are returned to the job they were applying for.

## User Stories

- As a **candidate**, I want to sign up quickly while applying, so that I don't lose the job I was about to apply for.

## Functional Requirements

1. **Candidate sign up:** The candidate enters full name, email and password. The system creates the user with role `candidate`.
2. **From the apply flow:** Sign up also works from inside the apply flow (Feature 12). The candidate is returned to the same job's apply form afterwards.
3. **Password rule:** As in Feature 01.
4. **After sign up:** The candidate is logged in and sent to My Applications, or back to the job.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Sign Up (candidate) | The Sign Up screen from Feature 01 with "I'm looking for a job" chosen; no company name field. | Blank form | Button spinner, button disabled | Field errors, "Email already in use", "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Account created, logged in and sent to My Applications or back to the job |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| Candidate Sign Up | Full name, email, password | New `candidate` account, logged in, sent to My Applications or back to the job |

## Data Used

- **Supabase Auth user** and **`profiles` table** (Feature 01). Candidate rows have `role = 'candidate'` and an empty `company_id`.

## Business Rules and Permissions

- Same account rules as Feature 01 (one email, one account; role cannot be changed).
- A candidate has no company.

## Error Cases

Same as Feature 01: email already in use, weak password, empty required fields, and network or server failure.

## Acceptance Criteria

- [ ] A candidate can sign up, including from inside the apply flow, and is returned to the job.

## User Flows

- Flow 2 · Candidate signs up

## Test Cases

- Given Ali is on the Sign Up form, when he enters the password "abctech2026" (long enough but with no capital letter or special character), then only the 8-character requirement is ticked, the account is not created, and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali is logged out and clicks Apply on Junior Web Developer, when he signs up with a new email and a valid password, then he is logged in and back on the apply form for Junior Web Developer.
- Given an account already exists for Ali's email, when he tries to sign up with it, then he sees "Email already in use. Log in instead?" and no second account is created.

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up).
- **Depended on by:** Feature 03 (Login and Logout), Feature 12 (Apply with CV), Feature 25 (Candidate Profile) and Feature 26 (Saved Jobs).

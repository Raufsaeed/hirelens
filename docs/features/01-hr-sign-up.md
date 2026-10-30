# Feature 01 · HR Sign Up

## Description

HR creates an account with their company name. This creates the HR user and the company record, and logs them in. This feature also holds the password rule used by every password form.

## User Stories

- As an **HR user**, I want to sign up with my company name, so that I can post jobs for my company.

## Functional Requirements

1. **Landing page:** A short intro to HireLens with "I'm hiring" and "I'm looking for a job" buttons. Each leads to Sign Up with the right role chosen.
2. **HR sign up:** HR enters full name, email, password and company name. The system creates the user with role `hr` and a new company record, and links the user to it.
3. **Company slug:** The company's public page address is made from the company name at sign up (rules in Feature 10).
4. **Password rule:** At least 8 characters, at least one capital letter (A–Z), and at least one special character such as @, #, $ or !. Every form that sets a password (Features 01, 02, 04 and 27) shows these three requirements under the field and ticks each one as the user types.
5. **After sign up:** HR is logged in and sent to the HR Dashboard.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Landing | Short intro to HireLens with "I'm hiring" and "I'm looking for a job" buttons. | N/A | Page loading | "Something went wrong, please refresh" | Buttons lead to Sign Up with the right role chosen |
| Sign Up | Choice between "I'm hiring" and "I'm looking for a job", then the matching form (company name only for HR). | Blank form | Button spinner, button disabled | Field errors, "Email already in use", "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Account created, user logged in and redirected by role |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| HR Sign Up | Full name, email, password, company name | New `hr` account and company, logged in, sent to HR Dashboard |

## Data Used

- **Supabase Auth user:** Handles email, password, sessions and reset emails (also used by Features 02, 03, 04 and 27).
- **`profiles` table:** `id`, `full_name`, `email`, `role` (`hr` or `candidate`), `company_id`, `created_at`.
- **`companies` table:** `id`, `name`, `slug`, `logo_url`, `created_at` (more fields in Feature 09).
- **How they link:** `profiles.id` is the same as the Auth user's id, and `profiles.company_id` points to `companies.id` (filled for HR, empty for candidates).

## Business Rules and Permissions

- One email can only have one account.
- Role is set at sign up and cannot be changed by the user.
- An HR user belongs to exactly one company.
- This version has one HR user per company. Inviting team members is a future feature.
- A user can only read and update their own profile.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Email already in use | "Email already in use. Log in instead?" | Does not create an account; shows a link to Login. |
| Weak password | "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Does not submit the form; the unmet requirements under the field stay unticked. |
| Empty required fields | "This field is required" under each empty field | Highlights the fields and does not submit. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the user typed and lets them retry; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can sign up with name, email, password and company name, and a company record is created.
- [ ] Passwords without at least 8 characters, one capital letter and one special character are rejected, and the three requirements are ticked live under the field.
- [ ] Every error case shows a clear, friendly message and never a raw error or blank page.

## User Flows

- Flow 1 · HR signs up and creates a company

## Test Cases

- Given Sara has no account, when she signs up with her name, a new email, a valid password and "ABC Tech", then her account and company are created and she lands on the empty HR Dashboard.
- Given an account already exists for sara@abctech.com, when Sara tries to sign up with that email, then she sees "Email already in use" and a link to log in.
- Given Sara is on the HR sign up form, when she leaves the company name empty and clicks Sign up, then the field shows "This field is required" and no account is created.

## Dependencies

- **Depends on:** None. This is the first feature.
- **Depended on by:** Every other feature.

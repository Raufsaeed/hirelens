# Feature 28 · Delete Account

## Description

A candidate can delete their account and all their data from Settings. This cannot be undone.

## User Stories

- As a **candidate**, I want to delete my account and all my data, so that I stay in control of my information.

## Functional Requirements

1. **Delete account (candidates only):** A section on Settings (Feature 27).
   - The candidate types DELETE to confirm.
   - Their account, profile, applications, CVs (including the default CV), saved jobs, screening results, status history, notes, interviews, interview feedback, interview questions and email log are removed.
   - They are logged out and see "Your account has been deleted".

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Settings – Delete account (candidate) | Warning, a field to type DELETE, and a Delete account button. | Button disabled until DELETE is typed | Button spinner | "Couldn't delete your account, try again" | Logged out; "Your account has been deleted" |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Delete account | Types DELETE and clicks Delete account | All candidate data removed; logged out |

## Data Used

- **Removed on delete:** rows in `profiles`, `applications`, `screenings`, `saved_jobs`, `status_history`, `notes`, `interviews`, `interview_feedback`, `interview_questions` and `notifications` for that candidate, and all their files in the `cvs` bucket, including the default CV.
- **How they link:** Everything is found through the user's `profiles.id`.

## Business Rules and Permissions

- Only candidates can delete their account here. HR accounts are not deleted from Settings.
- Account delete removes all the candidate's data and cannot be undone.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| DELETE not typed | N/A | The Delete account button stays disabled. |
| Network or server failure | "Couldn't delete your account, try again" | Never shows a raw error. |

## Acceptance Criteria

- [ ] Candidates can delete their account and all their data after typing DELETE.

## User Flows

- Flow 28 · Candidate deletes their account

## Test Cases

- Given Ali has applied to ABC Tech, when he types DELETE and deletes his account, then he is logged out, his CV and application are removed, and Sara no longer sees him in her candidates list.
- Given Sara is HR, when she opens Settings, then she sees a link to Company Settings and no Delete account section.
- Given Ali has not typed DELETE, when he looks at the Delete account button, then it stays disabled.

## Dependencies

- **Depends on:** Feature 12 (Apply with CV) and Feature 27 (Account Settings).
- **Depended on by:** None.

## Done When

- [ ] The Delete account button stays disabled until DELETE is typed.
- [ ] Deleting logs Ali out and shows "Your account has been deleted".
- [ ] Ali's CVs, applications and other data are removed, and Sara no longer sees him in her candidates list.
- [ ] Sara (HR) sees a link to Company Settings and no Delete account section.
- [ ] If deleting fails, "Couldn't delete your account, try again" shows.

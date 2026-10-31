# Feature 14 · Withdraw and Delete Application Data

## Description

A candidate can withdraw an application, or delete one application with its CV and all linked data.

## User Stories

- As a **candidate**, I want to withdraw an application or delete my CV and data, so that I stay in control of my information.

## Functional Requirements

1. **Withdraw:** On Application Detail (Feature 13), the candidate can withdraw while the status is Applied or Shortlisted. The status becomes Withdrawn, and a history row is saved with the candidate as `changed_by` (Feature 20).
2. **After withdraw:** HR sees the card greyed out and cannot move it (Feature 20). No more status emails are sent (Feature 29).
3. **Delete my data:** For one application, the candidate can delete their CV and data after confirming. This removes the application and everything linked to it (screening, status history, notes, interviews, interview feedback and interview questions) and the CV file. HR no longer sees that candidate for that job.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Application Detail (actions) | Withdraw and Delete my data buttons. | N/A | Button spinner after confirming | "You can't withdraw at this stage"; "Something went wrong, please try again" | "Application withdrawn" or "Your data has been deleted" |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Withdraw | Clicks Withdraw and confirms | Status Withdrawn; shown in the timeline |
| Delete my data | Clicks "Delete my data" and confirms | The application, everything linked to it and the CV file removed; "Your data has been deleted" |

## Data Used

- **`applications.status`** (Feature 12): set to `withdrawn`.
- **`status_history`** (Feature 20): the change to `withdrawn`, with the candidate as `changed_by`.
- **On delete:** the application row and, by cascade, its `screenings`, `status_history`, `notes`, `interviews`, `interview_feedback` and `interview_questions` rows; the CV file in `cvs`.

## Business Rules and Permissions

- Withdraw is only allowed while the status is Applied or Shortlisted.
- Withdrawn applications cannot be moved by HR.
- "Delete my data" needs confirmation and cannot be undone.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Withdraw not allowed | "You can't withdraw at this stage" | Hides or disables the Withdraw button after Shortlisted. |
| Network or server failure | "Something went wrong, please try again" | Never shows a raw error. |

## Acceptance Criteria

- [ ] Candidates can withdraw while Applied or Shortlisted, and can delete their CV and data.

## User Flows

- Flow 14 · Candidate withdraws an application or deletes its data

## Test Cases

- Given Ali's application is Shortlisted, when he clicks Withdraw and confirms, then the status becomes Withdrawn and Sara sees his card greyed out.
- Given Ali's application to ABC Tech is Shortlisted, when he withdraws it, then a history row from Shortlisted to Withdrawn is saved with Ali as `changed_by`.
- Given Ali applied to Junior Web Developer at ABC Tech, when he clicks "Delete my data" on that application and confirms, then the application, its screening, history, notes and interviews and his CV file are removed, and Sara no longer sees Ali in that job's candidates list.
- Given Ali's application is at Interview, when he opens the application detail, then the Withdraw button is not available.

## Dependencies

- **Depends on:** Feature 13 (My Applications).
- **Depended on by:** None.

## Done When

- [ ] Withdrawing a Shortlisted application sets it to Withdrawn and saves a history row with Ali as `changed_by`.
- [ ] Sara sees Ali's withdrawn card greyed out.
- [ ] "Delete my data" removes the application, everything linked to it and the CV file, and Sara no longer sees Ali for that job.
- [ ] At Interview, Withdraw is not available ("You can't withdraw at this stage").

# Feature 06 · Hiring Pipeline

## Description

This feature gives HR a board for each job to move candidates through the hiring stages, from Applied to Hired or Rejected. Every move is saved with a history and shown to the candidate in My Applications. HR can also keep notes on any candidate.

## User Stories

- As an **HR user**, I want to see all candidates for a job on one board, so that I know who is at which stage.
- As an **HR user**, I want to move candidates by dragging or with a dropdown, so that I can update them on a laptop or a phone.
- As an **HR user**, I want to confirm before hiring or rejecting, so that I don't make a big change by mistake.
- As an **HR user**, I want a history of every status change, so that I know who changed what and when.
- As a **candidate**, I want to see my status change, so that I know what is happening with my application.

## Functional Requirements

1. **Pipeline Board:** One board per job with columns Applied, Shortlisted, Interview, Offer, Hired and Rejected. Each card shows the candidate's name, score and days since applying.
2. **Moving cards:**
   - Drag and drop between columns.
   - A status dropdown on each card, for phone and keyboard users.
3. **Confirmation:** Moving to Rejected or Hired asks for confirmation first.
4. **Bulk reject:** HR can select several cards and reject them together, with one confirmation.
5. **Interview step:** Moving to Interview opens the schedule form (Feature 07).
6. **Notes:** HR can add notes to any candidate. Each note shows the author's name (saved as `author_name` when the note is written) and time. Notes cannot be edited or deleted in this version.
7. **Status history:** Every status change is saved with who made it, the old status, the new status and when. The first row is saved when the candidate applies, from empty to Applied (Feature 03).
8. **Candidate view:** The candidate sees each change in My Applications (Feature 03), with no score.
9. **Withdrawn candidates:** They appear greyed out and cannot be moved.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Pipeline Board | Six columns with candidate cards, a status dropdown per card, and bulk select. | "No candidates yet" in every column | Skeleton columns | "Couldn't move this candidate, try again" (the card goes back to where it was); "Couldn't load the board" with Retry | Card shown in its new column; "Ali moved to Interview" |
| Confirm dialog | "Move Ali to Hired?" or "Reject 20 candidates?" with Confirm and Cancel. | N/A | Confirm button spinner | "Couldn't save, try again" | Dialog closes and cards move |
| Candidate notes and history panel | Notes with author and time, and the status history. | "No notes yet" and "No changes yet" | Skeleton list | "Couldn't save note, try again" | "Note saved"; history updated |
| My Applications (candidate) | The candidate's current status and timeline (Feature 03). | N/A | Skeleton timeline | "Couldn't load your applications" with Retry | New status shown, never the score |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Move card | Drags a card or picks a status from the dropdown | New status saved, history entry added, candidate sees the change |
| Hire / Reject | Moves to Hired or Rejected and confirms | Status saved after confirmation |
| Bulk reject | Selects cards, clicks Reject, confirms | All selected candidates moved to Rejected |
| Add note | Note text | Note saved with author and time |

## Data Used

- **`applications.status`** (Feature 03): the candidate's current stage.
- **`status_history` table:**
  - `id`
  - `application_id`
  - `from_status`: empty for the first row, written when the candidate applies
  - `to_status`
  - `changed_by`: the HR user, or the candidate for a change to `withdrawn`
  - `changed_at`
- **`notes` table:**
  - `id`
  - `application_id`
  - `author_id`
  - `author_name`: the HR user's name, saved when the note is written
  - `body`
  - `is_manual_review`: true when HR reviewed an unreadable CV by hand (Feature 05)
  - `created_at`
- **How they link:** Both tables point to `applications.id`. `changed_by` and `author_id` point to `profiles.id`.

## Business Rules and Permissions

- Only HR of the job's company can see the board, move cards or add notes.
- Every status change is made by HR, except that a candidate can withdraw their own application (Feature 03). Only for a change to `withdrawn` can `changed_by` be the candidate. AI never moves a candidate.
- Hired and Rejected need confirmation.
- Withdrawn candidates cannot be moved by HR.
- Every change is added to the history, and history entries cannot be edited or deleted. The only exception: they are removed automatically when the candidate deletes their account (Feature 14) or deletes their data for that application (Feature 03).
- Candidates see their own status and timeline, but never notes, scores or other candidates.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Move fails (network or server) | "Couldn't move this candidate, try again" | Puts the card back in its old column; nothing is saved. |
| Moving a withdrawn candidate | "This candidate has withdrawn" | The card cannot be dragged and the dropdown is disabled. |
| Cancel on the confirm dialog | N/A | Card stays where it was. |
| Empty note | "Note can't be empty" | Does not save. |
| Candidate opens the board URL | "You don't have access to this page" | Shows no data. |
| HR opens another company's board | "You don't have access to this page" | Shows no data. |

## Acceptance Criteria

- [ ] Each job has a board with the six columns and a card for every candidate.
- [ ] Cards can be moved by drag and drop and by the status dropdown.
- [ ] Moving to Hired or Rejected asks for confirmation.
- [ ] HR can reject several candidates at once.
- [ ] Every move is saved in the history with who, from, to and when.
- [ ] HR can add notes with author and time.
- [ ] The candidate sees every status change in My Applications, with no score.
- [ ] Withdrawn candidates appear greyed out and cannot be moved.

## Test Cases

- Given Ali is in Shortlisted, when Sara drags him to Interview, then his card moves, a history entry is saved, and Ali's My Applications shows "Interview".
- Given Sara is on her phone, when she changes Ali's status with the dropdown, then the change is saved the same way as a drag.
- Given Ali is in Offer, when Sara moves him to Hired, then she is asked to confirm, and only after confirming does Ali see "Hired".
- Given a move fails because the connection drops, when Sara drags a card, then the card goes back and she sees "Couldn't move this candidate, try again".
- Given Ali is logged in, when he tries to open another candidate's application by changing the URL, then he sees "You don't have access to this page" and no data.
- Given Usman has withdrawn, when Sara views the board, then his card is greyed out and cannot be moved.
- Given Ali's application to ABC Tech is Shortlisted, when he withdraws it, then a history row from Shortlisted to Withdrawn is saved with Ali as `changed_by`.
- Given Ali has just applied to Junior Web Developer, when Sara opens his history, then the first entry goes from empty to Applied.

## Dependencies

- **Depends on:** Feature 03 (Candidate Apply Portal) and Feature 05 (Candidate Ranking).
- **Depended on by:** Feature 07 (Interview Management) and Feature 10 (Reports & Analytics).
- See Feature 15 · Email Notifications.

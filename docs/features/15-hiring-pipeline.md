# Feature 15 · Hiring Pipeline

## Description

HR has a board for each job to move candidates through the hiring stages, from Applied to Hired or Rejected. Every move is saved in a history and shown to the candidate in My Applications (Feature 09).

## User Stories

- As an **HR user**, I want to see all candidates for a job on one board, so that I know who is at which stage.
- As an **HR user**, I want to move candidates by dragging or with a dropdown, so that I can update them on a laptop or a phone.
- As an **HR user**, I want to confirm before hiring or rejecting, so that I don't make a big change by mistake.
- As an **HR user**, I want a history of every status change, so that I know who changed what and when.

## Functional Requirements

1. **Pipeline Board:** One board per job with columns Applied, Shortlisted, Interview, Offer, Hired and Rejected. Each card shows the candidate's name, score and days since applying.
2. **Moving cards:**
   - Drag and drop between columns.
   - A status dropdown on each card, for phone and keyboard users.
3. **Confirmation:** Moving to Rejected or Hired asks for confirmation first.
4. **Interview step:** Moving to Interview opens the schedule form (Feature 16).
5. **Status history:** Every status change is saved with who made it, the old status, the new status and when. The first row is saved when the candidate applies (Feature 08).
6. **Candidate view:** The candidate sees each change in My Applications (Feature 09), with no score, and gets a status email (Feature 23).
7. **Withdrawn candidates:** They appear greyed out and cannot be moved.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Pipeline Board | Six columns with candidate cards and a status dropdown per card. | "No candidates yet" in every column | Skeleton columns | "Couldn't move this candidate, try again" (the card goes back to where it was); "Couldn't load the board" with Retry | Card shown in its new column; "Ali moved to Interview" |
| Confirm dialog | "Move Ali to Hired?" or "Reject Ayesha?" with Confirm and Cancel. | N/A | Confirm button spinner | "Couldn't save, try again" | Dialog closes and cards move |
| Status history panel | The status history of one candidate. | "No changes yet" | Skeleton list | N/A | History updated |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Move card | Drags a card or picks a status from the dropdown | New status saved, history entry added, candidate sees the change |
| Hire / Reject | Moves to Hired or Rejected and confirms | Status saved after confirmation |

## Data Used

- **`applications.status`** (Feature 08): the candidate's current stage.
- **`status_history` table:**
  - `id`
  - `application_id`
  - `from_status`: empty for the first row, written when the candidate applies
  - `to_status`
  - `changed_by`: the HR user, or the candidate for a change to `withdrawn`
  - `changed_at`
- **How they link:** `status_history.application_id` points to `applications.id`, and `changed_by` points to `profiles.id`.

## Business Rules and Permissions

- Only HR of the job's company can see the board or move cards.
- Every status change is made by HR, except that a candidate can withdraw their own application (Feature 10). Only for a change to `withdrawn` can `changed_by` be the candidate. AI never moves a candidate.
- Hired and Rejected need confirmation.
- Withdrawn candidates cannot be moved by HR.
- Every change is added to the history, and history entries cannot be edited or deleted. The only exception: they are removed automatically when the candidate deletes their account (Feature 22) or their data for that application (Feature 10).
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Move fails (network or server) | "Couldn't move this candidate, try again" | Puts the card back in its old column; nothing is saved. |
| Moving a withdrawn candidate | "This candidate has withdrawn" | The card cannot be dragged and the dropdown is disabled. |
| Cancel on the confirm dialog | N/A | Card stays where it was. |
| Candidate opens the board URL | "You don't have access to this page" | Shows no data. |
| HR opens another company's board | "You don't have access to this page" | Shows no data. |

## Acceptance Criteria

- [ ] Each job has a board with the six columns and a card for every candidate.
- [ ] Cards can be moved by drag and drop and by the status dropdown.
- [ ] Moving to Hired or Rejected asks for confirmation.
- [ ] Every move is saved in the history with who, from, to and when.
- [ ] The candidate sees every status change in My Applications, with no score.
- [ ] Withdrawn candidates appear greyed out and cannot be moved.

## User Flows

- Flow 15 · HR moves a candidate through the pipeline

## Test Cases

- Given Ali is in Shortlisted, when Sara drags him to Interview, then his card moves, a history entry is saved, and Ali's My Applications shows "Interview".
- Given Sara is on her phone, when she changes Ali's status with the dropdown, then the change is saved the same way as a drag.
- Given Ali is in Offer, when Sara moves him to Hired, then she is asked to confirm, and only after confirming does Ali see "Hired".
- Given a move fails because the connection drops, when Sara drags a card, then the card goes back and she sees "Couldn't move this candidate, try again".
- Given Usman has withdrawn, when Sara views the board, then his card is greyed out and cannot be moved.

## Dependencies

- **Depends on:** Feature 14 (Candidate Review and Shortlist).
- **Depended on by:** Feature 16 (Interview Scheduling), Feature 19 (Reports) and Feature 23 (Email Notifications).

## Done When

- [ ] The board shows six columns with a card for every candidate.
- [ ] Dragging a card (or using the status dropdown) moves it, saves a history entry, and Ali sees the new status.
- [ ] Moving to Hired or Rejected asks for confirmation first.
- [ ] A failed move puts the card back and shows "Couldn't move this candidate, try again".
- [ ] A withdrawn candidate's card is greyed out and cannot be moved.
- [ ] Privacy: Ali sees each status change in My Applications, never his score.

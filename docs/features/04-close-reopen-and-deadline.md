# Feature 04 · Close, Reopen and Deadline

## Description

HR closes and reopens jobs. A job with an "Apply by" date closes by itself after that day ends, and HR can extend the deadline to reopen it.

## User Stories

- As an **HR user**, I want to close and reopen a job, so that the job stays correct as needs change.
- As an **HR user**, I want an "Apply by" date that closes the job automatically, so that I don't have to remember to close it.

## Functional Requirements

1. **Close job:** After confirming, the job becomes Closed (`closed_reason` `manual`) and the public link stops accepting applications.
2. **Reopen job:** A Closed job can be set back to Open, and the public link accepts applications again.
3. **Closed job page:** On the Public Job Detail page (Feature 07), the Apply button is replaced with "This job is no longer accepting applications".
4. **When the deadline passes:** After the end of the Apply by day (11:59 pm Pakistan time), the job closes automatically. The app runs only on localhost with no scheduler, so the server checks this whenever a job is read (job lists, the public job page, apply submit and HR pages): if `apply_by` has passed and the job is still Open, the server closes it with `closed_reason` `deadline`.
   - The Apply button is replaced by "Applications closed on 20 Oct".
   - HR sees the job as Closed with the reason "Deadline passed".
5. **Extending it:** HR can set a new future Apply by date. If the job was closed by its deadline, this reopens it.
6. **Late submit:** The deadline is checked again on every Submit (Feature 08).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| My Jobs (close and reopen) | Close and Reopen actions on each job (the list is Feature 02). | "You have no jobs yet" with "Post your first job" | Skeleton rows | "Couldn't load your jobs" with Retry | "Job closed" or "Job reopened"; closed jobs show "Deadline passed" when that was the reason |
| Edit Job (deadline) | The Apply by field. | N/A | Save spinner | "Apply by date can't be in the past"; "Set a new Apply by date to reopen this job"; "Couldn't save, try again" | "Deadline extended. The job is open again" when a deadline-closed job is extended |
| Public Job Detail (closed states) | The closed message in place of Apply. | N/A | N/A | "This job is no longer accepting applications" (closed); "Applications closed on 20 Oct" (deadline passed) | N/A |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Close job | Clicks Close and confirms | Status Closed; public page shows "This job is no longer accepting applications" |
| Reopen job | Clicks Reopen | Status Open; Apply button back on the public page |
| Deadline passes (System) | The job is read after the Apply by day has ended | Job Closed with reason "Deadline passed"; public page shows "Applications closed on 20 Oct" |
| Extend deadline | A new future Apply by date on a deadline-closed job | Job reopened; Apply button back on the public page |

## Data Used

- **`jobs`** (Feature 02):
  - `status`: `draft`, `open` or `closed`
  - `apply_by`
  - `closed_reason`: `manual` or `deadline`
  - `closed_at`

## Business Rules and Permissions

- Jobs are never deleted, only closed.
- Only Open jobs accept applications.
- A job closes automatically after its Apply by day ends. The server checks the deadline whenever the job is read, and again on every Submit.
- Extending the deadline to a future date reopens a job that was closed by its deadline.
- To reopen a job whose deadline has passed, HR must set a new Apply by date.
- Only HR of the job's company can close, reopen or extend it.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Apply by date in the past | "Apply by date can't be in the past" | Does not save until a valid date is chosen. |
| Reopening a job whose deadline has passed | "Set a new Apply by date to reopen this job" | Keeps the job Closed until a future date is set. |

## Acceptance Criteria

- [ ] HR can close and reopen a job, and the public page always shows the correct state.
- [ ] After the deadline the job closes automatically, the public page shows "Applications closed on 20 Oct", and HR sees "Deadline passed".
- [ ] Extending the deadline reopens the job.

## User Flows

- Flow 4 · HR closes, reopens or extends a job

## Test Cases

- Given Sara has closed Junior Web Developer, when Ali opens the job link, then he sees "This job is no longer accepting applications" instead of the Apply button.
- Given the job is Closed, when Sara clicks Reopen, then the status becomes Open and the public link shows the Apply button again.
- Given Junior Web Developer has an Apply by date of 20 Oct, when 20 Oct ends, then the job closes, Ali sees "Applications closed on 20 Oct" instead of Apply, and Sara sees it as Closed with "Deadline passed".
- Given the job was closed by its deadline, when Sara sets a new Apply by date of 30 Oct, then the job is Open again and the public page shows the Apply button.
- Given Junior Web Developer is still Open with an Apply by date of 20 Oct, when Ali opens the job link on 21 Oct, then the server closes the job with reason "Deadline passed" and Ali sees "Applications closed on 20 Oct".

## Dependencies

- **Depends on:** Feature 02 (Post a Job).
- **Depended on by:** Feature 07 (Job Search), Feature 08 (Apply with CV) and Feature 21 (Saved Jobs).

## Done When

- [x] Closing a job (after confirming) makes the public page show "This job is no longer accepting applications".
- [x] Reopening a closed job brings back the Apply button.
- [x] A job read after its Apply by day closes, shows "Applications closed on 20 Oct", and Sara sees "Deadline passed".
- [x] Setting a new future Apply by date reopens a deadline-closed job.
- [x] Reopening a deadline-closed job without a new date shows "Set a new Apply by date to reopen this job".

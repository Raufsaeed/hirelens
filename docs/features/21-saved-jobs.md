# Feature 21 · Saved Jobs

## Description

A logged-in candidate saves open jobs to look at later. A Saved Jobs page lists them with an Apply button, or shows "Applications closed" when a job has closed or its deadline has passed.

## User Stories

- As a **candidate**, I want to save a job I'm interested in, so that I can apply later when my CV is ready.
- As a **candidate**, I want one page with all my saved jobs, so that I don't have to search for them again.
- As a **candidate**, I want to remove a job I no longer want, so that my list stays short.
- As a **candidate**, I want to see when a saved job is no longer open, so that I don't waste time on it.

## Functional Requirements

1. **Save button:** A Save button (bookmark icon with the word "Save") on each job in the Public Jobs List and on the Public Job Detail page (Feature 07). Only Open jobs can be saved.
2. **Unsave:** Clicking the button again on a saved job removes it ("Saved" → "Save").
3. **Logged-out users:** Clicking Save asks them to log in or sign up (Feature 01). They are returned to the same job, and the job is saved.
4. **Saved Jobs page:** Lists saved jobs, newest first, with title, company, location, job type and Apply by date. Each job shows:
   - **Apply** if the job is Open and the candidate hasn't applied (opens Feature 08).
   - **Applied** if the candidate already applied.
   - **"Applications closed"** if the job is Closed or past its deadline (Feature 04).
5. **Remove from the page:** Each saved job has a Remove button.
6. **Private:** HR never sees who saved their jobs.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Save button (Jobs List and Job Detail) | "Save" or "Saved" with a bookmark icon. | N/A | Button disabled briefly | "Couldn't save this job, try again" | "Job saved" or "Removed from saved jobs" |
| Saved Jobs | Saved jobs with Apply, Applied or "Applications closed", and Remove. | "You haven't saved any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your saved jobs" with Retry | List of saved jobs |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Save | Clicks Save on an open job | Job saved; button shows "Saved" |
| Unsave / Remove | Clicks Saved or Remove | Job removed from the list |
| Save while logged out | Clicks Save | Login or sign up, then back on the job with it saved |
| Open Saved Jobs | Opens the page | Saved jobs with their current state |

## Data Used

- **`saved_jobs` table:**
  - `id`
  - `candidate_id`
  - `job_id`
  - `saved_at`
- **Unique rule:** one row per candidate and job.
- **`jobs`** (Feature 02): title, status and Apply by date. **`applications`** (Feature 08): shows "Applied".
- **How they link:** `saved_jobs.candidate_id` points to `profiles.id`, and `saved_jobs.job_id` points to `jobs.id`.

## Business Rules and Permissions

- Only logged-in candidates can save jobs. HR users don't see the Save button.
- A candidate can save the same job only once.
- Only Open jobs can be saved. A saved job that later closes stays on the list with "Applications closed".
- Open and closed jobs are never deleted, only closed, so a saved job stays on the list until the candidate removes it.
- A candidate sees only their own saved jobs.
- HR never sees who saved a job.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Logged-out user clicks Save | "Log in to save jobs" | Opens login or sign up and returns to the job, then saves it. |
| Job already saved (double click) | N/A | Keeps one saved row; the button shows "Saved". |
| Job closed or past its deadline | "Applications closed" | Shows this instead of Apply on Saved Jobs. |
| Network or server failure | "Couldn't save this job, try again" | Puts the button back to its old state. |

## Acceptance Criteria

- [ ] A logged-in candidate can save and unsave an open job from the Jobs List and the Job Detail page.
- [ ] A logged-out user who clicks Save is asked to log in and returned to the job with it saved.
- [ ] Saved Jobs lists every saved job with Apply, Applied or "Applications closed".
- [ ] A job can only be saved once per candidate.
- [ ] HR never sees who saved their jobs.

## User Flows

- Flow 21 · Candidate saves a job

## Test Cases

- Given Ali is logged in and viewing Junior Web Developer at ABC Tech, when he clicks Save, then the button shows "Saved" and the job appears on his Saved Jobs page with an Apply button.
- Given Ali is logged out, when he clicks Save on Junior Web Developer, then he is asked to log in, and after logging in he is back on the job with it saved.
- Given Ali saved Junior Web Developer and Sara has since closed it, when Ali opens Saved Jobs, then the job shows "Applications closed" instead of Apply.
- Given Ali saved a job and its Apply by date has passed, when he opens Saved Jobs, then it shows "Applications closed".
- Given Ali has saved a job, when he clicks Remove on Saved Jobs, then the job disappears from the list and the job page shows "Save" again.

## Dependencies

- **Depends on:** Feature 01 (Authentication), Feature 04 (Close, Reopen and Deadline), Feature 07 (Job Search) and Feature 08 (Apply with CV).
- **Depended on by:** None.

## Done When

- [x] Clicking Save shows "Saved", and the job appears on Saved Jobs with an Apply button.
- [x] A logged-out user who clicks Save logs in and is back on the job with it saved.
- [x] A saved job that is closed or past its deadline shows "Applications closed".
- [x] Remove takes the job off the list, and the job page shows "Save" again.
- [x] Privacy: HR never sees who saved a job.

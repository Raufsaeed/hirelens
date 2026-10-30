# Feature 02 · Job Posting

## Description

This feature lets HR create, save, publish, edit, close and reopen jobs for their company. Publishing gives each job a public, readable link that HR can share anywhere. Candidates open that link to read the job and click Apply. HR can also set an optional "Apply by" deadline, after which the job closes automatically.

## User Stories

- As an **HR user**, I want to create a job with clear requirements, so that candidates and the AI screening know exactly what we need.
- As an **HR user**, I want to save a job as a draft, so that I can finish it later before anyone sees it.
- As an **HR user**, I want a shareable link with a "Copy link" button, so that I can post the job on LinkedIn or WhatsApp quickly.
- As an **HR user**, I want to see all my jobs with their status and number of applicants, so that I know where hiring stands.
- As an **HR user**, I want to edit, close and reopen a job, so that the job stays correct as needs change.
- As a **candidate**, I want to open a job link and read the details, so that I can decide whether to apply.
- As an **HR user**, I want to set an "Apply by" date that closes the job automatically, so that I don't have to remember to close it.
- As a **candidate**, I want to see how many days are left to apply, so that I don't miss the deadline.

## Functional Requirements

1. **Create job:** HR enters:
   - Title
   - Location
   - Job type: full-time, part-time, internship or remote
   - Required years of experience
   - Required degree
   - Requirements: a list of skills and tools, each marked "must have" or "nice to have"
   - Description (with an optional "Write with AI" button, see Feature 09)
2. **Save as draft:** HR can save an unfinished job as a Draft. Drafts are never public.
3. **Publish:** Publishing sets the job to Open and creates a public link with a readable slug made from the company name and title, for example `/jobs/abc-tech-junior-web-developer`. If that slug is taken, a short number is added at the end.
4. **Copy link:** After publishing, and on My Jobs, HR can click "Copy link".
5. **My Jobs:** HR sees all their company's jobs with title, status (Draft, Open, Closed), number of applicants, and the actions Edit, Close, Reopen and Copy link.
6. **HR Dashboard job cards:** Each job shows as a card with title, status and the number of applicants (and new applicants). New applicants are applications HR has not opened yet (`applications.viewed_at` is empty, see Feature 05).
7. **Edit job:** HR can change any field. If requirements change after candidates have applied, the app shows a warning that existing candidates were screened against the old requirements and offers "Re-screen candidates". The re-screening itself belongs to Feature 04.
8. **Close job:** After confirming, the job becomes Closed and the public link stops accepting applications.
9. **Reopen job:** A Closed job can be set back to Open, and the public link accepts applications again.
10. **Public job detail:** Shows company name and logo, title, location, job type, required years, degree, requirements, description and an Apply button. For a Closed job, the Apply button is replaced with "This job is no longer accepting applications".
11. **Application deadline:**
    - **Setting it:** HR can set an optional "Apply by" date when creating or editing a job. It cannot be in the past.
    - **Showing it:** Job cards and the Public Job Detail page show "Apply by 20 Oct". When 7 days or fewer are left, they also show "3 days left" (or "Last day" on the final day).
    - **When it passes:** After the end of the Apply by day (11:59 pm Pakistan time), the job closes automatically. The app runs only on localhost with no scheduler, so the server checks this whenever a job is read (job lists, the public job page, apply submit and HR pages): if `apply_by` has passed and the job is still Open, the server closes it with `closed_reason` `deadline`.
      - The Apply button is replaced by "Applications closed on 20 Oct".
      - HR sees the job as Closed with the reason "Deadline passed".
    - **Extending it:** HR can set a new future Apply by date. If the job was closed by its deadline, this reopens it.
    - **Late submit:** A candidate who submits after the deadline sees "Applications for this job closed on 20 Oct", and the application is not saved.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| HR Dashboard (job cards) | One card per job with title, status, applicant counts and "Apply by 20 Oct · 3 days left" when a deadline is set. | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Job cards shown |
| My Jobs | Table of all jobs with status, applicants, Apply by date and actions. | "You have no jobs yet" with "Post your first job" | Skeleton rows | "Couldn't load your jobs" with Retry | List shown; "Job closed", "Job reopened" or "Link copied" messages; closed jobs show "Deadline passed" when that was the reason |
| Create Job | The job form, including an optional "Apply by" date, with Save as draft and Publish buttons. | Blank form with hints; Apply by empty | Button spinner, buttons disabled | Missing or invalid fields highlighted; "Apply by date can't be in the past"; "Couldn't save, try again" | Draft saved, or job published with its link and "Copy link" |
| Edit Job | The same form filled in with the current details, including Apply by. | N/A | Skeleton form, then Save spinner | Field errors; "Apply by date can't be in the past"; "Couldn't save, try again"; re-screen warning when requirements changed | "Job updated"; "Deadline extended. The job is open again" when a deadline-closed job is extended |
| Public Job Detail | Company name and logo, job details, "Apply by 20 Oct · 3 days left" when set, and Apply button. | N/A | Skeleton of the job page | "This job could not be found" (draft or unknown link); "This job is no longer accepting applications" (closed); "Applications closed on 20 Oct" (deadline passed) | Job details and Apply button shown |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Create Job → Save as draft | Any fields filled so far (title required) | Job saved as Draft; shown on My Jobs |
| Create Job → Publish | All required fields and at least one requirement | Job set to Open; public link and "Copy link" button |
| Copy link | Clicks "Copy link" | Link copied; "Link copied" message |
| Edit Job | Changed fields | Job updated; re-screen warning if requirements changed after people applied |
| Close job | Clicks Close and confirms | Status Closed; public page shows "This job is no longer accepting applications" |
| Reopen job | Clicks Reopen | Status Open; Apply button back on the public page |
| Public Job Detail | Opens the job link | Job details with Apply button, or a closed / not found message |
| Set Apply by | A date today or later (optional) | Deadline saved and shown on job cards and the public page |
| Deadline passes (System) | The job is read after the Apply by day has ended | Job Closed with reason "Deadline passed"; public page shows "Applications closed on 20 Oct" |
| Extend deadline | A new future Apply by date on a deadline-closed job | Job reopened; Apply button back on the public page |

## Data Used

- **`jobs` table:**
  - `id`
  - `company_id`
  - `title`
  - `slug`
  - `location`
  - `job_type`: `full-time`, `part-time`, `internship` or `remote`
  - `required_years`
  - `required_degree`
  - `requirements`: a list, each item with `name` and `type` (`must` or `nice`)
  - `description`
  - `status`: `draft`, `open` or `closed`
  - `created_at`, `updated_at`, `closed_at`
  - `apply_by`: optional deadline date
  - `closed_reason`: `manual` or `deadline`
- **`companies` table** (from Feature 01): `name` and `logo_url`, shown on the public job page.
- **How they link:** `jobs.company_id` points to `companies.id`. Applicant counts come from the applications table (Feature 03). New applicant counts are applications with `viewed_at` empty (Feature 05).

## Business Rules and Permissions

- HR can only see, create and manage jobs of their own company.
- Anyone, even when logged out, can view Open and Closed jobs through the public link.
- Drafts are never public. Their link shows "This job could not be found".
- Jobs are never deleted, only closed.
- Only Open jobs accept applications.
- A job needs a title, location, job type, required years, required degree, description and at least one requirement before it can be published.
- Required years must be a whole number from 0 to 30.
- A company cannot have two Draft or Open jobs with the same title.
- Each slug is unique.
- Candidates cannot open Create Job, Edit Job or My Jobs.
- Row Level Security enforces these rules in the database, not only in the pages.
- The Apply by date is optional and cannot be in the past.
- A job closes automatically after its Apply by day ends. The server checks the deadline whenever the job is read, and again on every Submit.
- Extending the deadline to a future date reopens a job that was closed by its deadline.
- To reopen a job whose deadline has passed, HR must set a new Apply by date.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Missing required fields | "This field is required" under each empty field | Highlights the fields and does not publish. |
| No requirements added | "Add at least one requirement" | Does not publish; Save as draft still works. |
| Required years not a number | "Enter a number of years, for example 1" | Does not save until fixed. |
| Duplicate title for the same company | "You already have an open job called Junior Web Developer" | Does not save; HR can change the title or close the old job. |
| Opening a draft job link or an unknown link | "This job could not be found" | Shows no job details and no Apply button. |
| Candidate opens the Create Job page | "You don't have access to this page" | Blocks the page; offers a link to My Applications. |
| Editing requirements after people applied | "23 candidates were screened against the old requirements. Re-screen them now?" | Saves the job; offers "Re-screen candidates" or "Not now" (re-screening is Feature 04). |
| Network failure while saving | "Couldn't save, try again" | Keeps everything HR typed and lets her retry; never shows a raw error. |
| Apply by date in the past | "Apply by date can't be in the past" | Does not save until a valid date is chosen. |
| Candidate submits after the deadline | "Applications for this job closed on 20 Oct" | Does not save the application. |
| Reopening a job whose deadline has passed | "Set a new Apply by date to reopen this job" | Keeps the job Closed until a future date is set. |

## Acceptance Criteria

- [ ] HR can create a job with all fields, including requirements marked "must have" or "nice to have".
- [ ] HR can save a job as a Draft, and drafts are never public.
- [ ] Publishing creates a readable public link, and "Copy link" works.
- [ ] My Jobs and the HR Dashboard show every job with its status and number of applicants.
- [ ] HR can edit, close and reopen a job, and the public page always shows the correct state.
- [ ] Editing requirements after people have applied shows the re-screen warning.
- [ ] The public job page shows company name, logo, job details and Apply, or the closed message.
- [ ] HR only sees their own company's jobs, and candidates cannot open HR job pages.
- [ ] Every error case shows a clear, friendly message.
- [ ] HR can set an optional Apply by date that cannot be in the past.
- [ ] Job cards and the public page show the Apply by date, and "X days left" when 7 days or fewer remain.
- [ ] After the deadline the job closes automatically, the public page shows "Applications closed on 20 Oct", and HR sees "Deadline passed".
- [ ] Extending the deadline reopens the job.

## Test Cases

- Given Sara is on the Create Job form, when she fills in Junior Web Developer with all fields and clicks Publish, then the job is Open, she gets the link `/jobs/abc-tech-junior-web-developer` with "Copy link", and the job appears on her dashboard with 0 applicants.
- Given Sara is on the Create Job form, when she clicks Publish without adding any requirements, then the job is not published and she sees "Add at least one requirement".
- Given Sara is editing the job, when she clears the title and clicks Save, then the job is not saved and the title field shows "This field is required".
- Given Sara has closed Junior Web Developer, when Ali opens the job link, then he sees "This job is no longer accepting applications" instead of the Apply button.
- Given the job is Closed, when Sara clicks Reopen, then the status becomes Open and the public link shows the Apply button again.
- Given 23 candidates have applied, when Sara adds "TypeScript" to the requirements and saves, then she sees the warning that candidates were screened against the old requirements and the "Re-screen candidates" option.
- Given Sara is creating Junior Web Developer, when she sets the Apply by date to yesterday, then she sees "Apply by date can't be in the past" and the job is not saved.
- Given Junior Web Developer has an Apply by date of 20 Oct, when 20 Oct ends, then the job closes, Ali sees "Applications closed on 20 Oct" instead of Apply, and Sara sees it as Closed with "Deadline passed".
- Given Ali opened the apply form on 20 Oct, when he clicks Submit after the deadline has passed, then he sees "Applications for this job closed on 20 Oct" and no application is saved.
- Given the job was closed by its deadline, when Sara sets a new Apply by date of 30 Oct, then the job is Open again and the public page shows the Apply button.
- Given Junior Web Developer is still Open with an Apply by date of 20 Oct, when Ali opens the job link on 21 Oct, then the server closes the job with reason "Deadline passed" and Ali sees "Applications closed on 20 Oct".
- Given 5 people have applied to Junior Web Developer and Sara has opened none of them, when she opens Ali's candidate detail page and goes back to the dashboard, then the job card shows 5 applicants and 4 new.

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles).
- **Depended on by:** Feature 03 (Candidate Apply Portal), Feature 04 (CV Screening) and Feature 09 (AI Job Description Writer).
- See Feature 12 · Saved Jobs and Feature 13 · Company Page.

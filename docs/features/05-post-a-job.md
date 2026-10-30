# Feature 05 · Post a Job

## Description

HR creates a job, saves it as a draft or publishes it, and gets a public link to share. HR can set an optional "Apply by" deadline. All jobs show on My Jobs and the HR Dashboard.

## User Stories

- As an **HR user**, I want to create a job with clear requirements, so that candidates and the AI screening know exactly what we need.
- As an **HR user**, I want to save a job as a draft, so that I can finish it later before anyone sees it.
- As an **HR user**, I want a shareable link with a "Copy link" button, so that I can post the job on LinkedIn or WhatsApp quickly.
- As an **HR user**, I want to see all my jobs with their status and number of applicants, so that I know where hiring stands.
- As an **HR user**, I want to set an "Apply by" date, so that the job closes by itself (Feature 07).
- As a **candidate**, I want to see how many days are left to apply, so that I don't miss the deadline.

## Functional Requirements

1. **Create job:** HR enters:
   - Title
   - Location
   - Job type: full-time, part-time, internship or remote
   - Required years of experience
   - Required degree
   - Requirements: a list of skills and tools, each marked "must have" or "nice to have"
   - Description (with an optional "Write with AI" button, Feature 08)
   - Optional "Apply by" date
2. **Save as draft:** HR can save an unfinished job as a Draft. Drafts are never public.
3. **Publish:** Publishing sets the job to Open and creates a public link with a readable slug made from the company name and title, for example `/jobs/abc-tech-junior-web-developer`. If that slug is taken, a short number is added at the end.
4. **Copy link:** After publishing, and on My Jobs, HR can click "Copy link".
5. **My Jobs:** HR sees all their company's jobs with title, status (Draft, Open, Closed), number of applicants, Apply by date, and the actions Edit (Feature 06), Close and Reopen (Feature 07), and Copy link.
6. **HR Dashboard job cards:** Each job shows as a card with title, status and the number of applicants (and new applicants). New applicants are applications HR has not opened yet (`applications.viewed_at` is empty, Feature 19).
7. **Showing the deadline:** Job cards show "Apply by 20 Oct". When 7 days or fewer are left, they also show "3 days left" (or "Last day" on the final day). The same display is used on the Public Job Detail page (Feature 11).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| HR Dashboard (job cards) | One card per job with title, status, applicant counts and "Apply by 20 Oct · 3 days left" when a deadline is set. | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Job cards shown |
| My Jobs | Table of all jobs with status, applicants, Apply by date and actions. | "You have no jobs yet" with "Post your first job" | Skeleton rows | "Couldn't load your jobs" with Retry | List shown; "Link copied" |
| Create Job | The job form, including an optional "Apply by" date, with Save as draft and Publish buttons. | Blank form with hints; Apply by empty | Button spinner, buttons disabled | Missing or invalid fields highlighted; "Apply by date can't be in the past"; "Couldn't save, try again" | Draft saved, or job published with its link and "Copy link" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Create Job → Save as draft | Any fields filled so far (title required) | Job saved as Draft; shown on My Jobs |
| Create Job → Publish | All required fields and at least one requirement | Job set to Open; public link and "Copy link" button |
| Copy link | Clicks "Copy link" | Link copied; "Link copied" message |
| Set Apply by | A date today or later (optional) | Deadline saved and shown on job cards and the public page |

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
  - `apply_by`: optional deadline date
  - `created_at`, `updated_at`
  - `closed_reason` and `closed_at`: see Feature 07
- **`companies` table** (Feature 01): `name` and `logo_url`, shown on the public job page.
- **How they link:** `jobs.company_id` points to `companies.id`. Applicant counts come from `applications` (Feature 12). New applicant counts are applications with `viewed_at` empty (Feature 19).

## Business Rules and Permissions

- HR can only see, create and manage jobs of their own company.
- Drafts are never public.
- A job needs a title, location, job type, required years, required degree, description and at least one requirement before it can be published.
- Required years must be a whole number from 0 to 30.
- A company cannot have two Draft or Open jobs with the same title.
- Each slug is unique.
- The Apply by date is optional and cannot be in the past.
- Candidates cannot open Create Job, Edit Job or My Jobs.
- Row Level Security enforces these rules in the database, not only in the pages.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Missing required fields | "This field is required" under each empty field | Highlights the fields and does not publish. |
| No requirements added | "Add at least one requirement" | Does not publish; Save as draft still works. |
| Required years not a number | "Enter a number of years, for example 1" | Does not save until fixed. |
| Duplicate title for the same company | "You already have an open job called Junior Web Developer" | Does not save; HR can change the title or close the old job. |
| Candidate opens the Create Job page | "You don't have access to this page" | Blocks the page; offers a link to My Applications. |
| Network failure while saving | "Couldn't save, try again" | Keeps everything HR typed and lets her retry; never shows a raw error. |
| Apply by date in the past | "Apply by date can't be in the past" | Does not save until a valid date is chosen. |

## Acceptance Criteria

- [ ] HR can create a job with all fields, including requirements marked "must have" or "nice to have".
- [ ] HR can save a job as a Draft, and drafts are never public.
- [ ] Publishing creates a readable public link, and "Copy link" works.
- [ ] My Jobs and the HR Dashboard show every job with its status and number of applicants.
- [ ] HR only sees their own company's jobs, and candidates cannot open HR job pages.
- [ ] HR can set an optional Apply by date that cannot be in the past.
- [ ] Job cards show the Apply by date, and "X days left" when 7 days or fewer remain.
- [ ] Every error case shows a clear, friendly message.

## User Flows

- Flow 5 · HR posts a job

## Test Cases

- Given Sara is on the Create Job form, when she fills in Junior Web Developer with all fields and clicks Publish, then the job is Open, she gets the link `/jobs/abc-tech-junior-web-developer` with "Copy link", and the job appears on her dashboard with 0 applicants.
- Given Sara is on the Create Job form, when she clicks Publish without adding any requirements, then the job is not published and she sees "Add at least one requirement".
- Given Sara is creating Junior Web Developer, when she sets the Apply by date to yesterday, then she sees "Apply by date can't be in the past" and the job is not saved.

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up) and Feature 03 (Login and Logout).
- **Depended on by:** Feature 06 (Edit Job and Re-screen), Feature 07 (Close, Reopen and Deadline), Feature 08 (AI Job Description Writer), Feature 10 (Public Company Page), Feature 11 (Job Search), Feature 15 (AI CV Screening) and Feature 24 (Reports).

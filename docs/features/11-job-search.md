# Feature 11 · Job Search

## Description

Anyone can browse and search open jobs, and open a job's public page to read it and click Apply.

## User Stories

- As a **candidate**, I want to browse and search open jobs, so that I can find roles that suit me.
- As a **candidate**, I want to open a job link and read the details, so that I can decide whether to apply.

## Functional Requirements

1. **Public Jobs List:** Shows all Open jobs with title, company, location, job type and Apply by date. Includes search by title or company and filters for job type and location.
2. **Public Job Detail:** Shows company name (linking to the company page, Feature 10) and logo, title, location, job type, required years, degree, requirements, description, the Apply by date with "3 days left" (rules in Feature 05), an Apply button (Feature 12) and a Save button (Feature 26).
3. **Closed or past deadline:** The Apply button is replaced with the closed message from Feature 07.
4. **Draft or unknown link:** Shows "This job could not be found".
5. **Deadline check:** Opening the list or a job page runs the server deadline check from Feature 07.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Public Jobs List | Open jobs with search, job type and location filters. | "No open jobs right now" or "No jobs match your search" with "Clear filters" | Skeleton cards | "Couldn't load jobs" with Retry | List of open jobs |
| Public Job Detail | Company name and logo, job details, "Apply by 20 Oct · 3 days left" when set, and Apply button. | N/A | Skeleton of the job page | "This job could not be found" (draft or unknown link); "This job is no longer accepting applications" (closed); "Applications closed on 20 Oct" (deadline passed) | Job details and Apply button shown |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Search jobs | Search text, job type, location | Matching open jobs |
| Public Job Detail | Opens the job link | Job details with Apply button, or a closed / not found message |

## Data Used

- **`jobs`** (Feature 05): open jobs for the list; open and closed jobs for the detail page.
- **`companies`** (Features 01 and 09): `name` and `logo_url`.

## Business Rules and Permissions

- Anyone, even when logged out, can view Open and Closed jobs through the public link.
- The Public Jobs List shows Open jobs only.
- Drafts are never public. Their link shows "This job could not be found".
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Opening a draft job link or an unknown link | "This job could not be found" | Shows no job details and no Apply button. |
| Search finds nothing | "No jobs match your search" | Shows a "Clear filters" button. |

## Acceptance Criteria

- [ ] Candidates can browse, search and filter open jobs.
- [ ] The public job page shows company name, logo, job details and Apply, or the closed message.
- [ ] The public job page shows the Apply by date, and "X days left" when 7 days or fewer remain.

## User Flows

- Flow 11 · Candidate finds a job

## Test Cases

- Given Junior Web Developer has an Apply by date of 20 Oct, when Ali views it on 17 Oct, then he sees "Apply by 20 Oct · 3 days left" and an Apply button.
- Given the deadline was 20 Oct, when Ali opens the job on 21 Oct, then he sees "Applications closed on 20 Oct" instead of Apply.
- Given no open job matches "xyz", when Ali searches "xyz", then he sees "No jobs match your search" with "Clear filters".

## Dependencies

- **Depends on:** Feature 05 (Post a Job) and Feature 07 (Close, Reopen and Deadline).
- **Depended on by:** Feature 12 (Apply with CV) and Feature 26 (Saved Jobs).

## Done When

- [ ] The Public Jobs List shows only Open jobs, with search and job type and location filters.
- [ ] A job page shows the job details, "Apply by 20 Oct · 3 days left" and an Apply button.
- [ ] A search with no matches shows "No jobs match your search" with "Clear filters".
- [ ] A job past its deadline shows "Applications closed on 20 Oct" instead of Apply.
- [ ] A draft or unknown job link shows "This job could not be found".

# Feature 03 · Candidate Apply Portal

## Description

This feature lets candidates find open jobs, apply with a PDF CV and track their applications. After an application is submitted, the CV is stored privately and screening (Feature 04) starts in the background. Candidates only ever see their status, never their score.

## User Stories

- As a **candidate**, I want to browse and search open jobs, so that I can find roles that suit me.
- As a **candidate**, I want to apply with my PDF CV in a few steps, so that applying is quick even on my phone.
- As a **candidate**, I want to sign up or log in while applying and come back to the same job, so that I don't lose my place.
- As a **candidate**, I want to see the status of each application and my interview details, so that I know where I stand.
- As a **candidate**, I want to withdraw an application or delete my CV and data, so that I stay in control of my information.

## Functional Requirements

1. **Public Jobs List:** Shows all Open jobs with title, company, location and job type. Includes search by title or company and filters for job type and location.
2. **Apply:** The Apply button is on the Public Job Detail page (Feature 02).
3. **Login during apply:** If the candidate is not logged in, they sign up or log in (Feature 01) and are returned to the same job's apply form.
4. **Apply form:**
   - Name and email (filled in from the account)
   - Phone
   - Optional cover note, up to 500 characters
   - PDF CV upload, by drag and drop or by choosing a file
5. **Checks before submit:**
   - The job is still Open.
   - The candidate has not applied to this job before.
   - The file is a PDF.
   - The file is under 5 MB.
   - All required fields are filled.
6. **On submit:**
   - The CV is saved in the private storage bucket `cvs` at `{candidate_id}/applications/{job_id}/{original-file-name}.pdf`.
   - An application is created with status Applied and screening status Queued. The name and email from the form are saved on it as `candidate_name` and `candidate_email`.
   - The first status history row is saved, from empty to Applied (Feature 06).
   - A confirmation is shown: "Your application has been sent to ABC Tech".
   - Feature 04 (CV Screening) starts in the background. The candidate does not wait for it.
7. **My Applications:** A list showing job title, company, applied date and status. Status is one of: Applied, Shortlisted, Interview (with date, time and link), Offer, Hired, Rejected, Withdrawn.
8. **Application detail:** A status timeline with the date of each change, plus interview details when there are any.
9. **Never shown to candidates:** Score, match percentage, AI summary, or HR notes.
10. **Withdraw:** The candidate can withdraw while the status is Applied or Shortlisted. The status becomes Withdrawn.
11. **Delete my data:** For one application, the candidate can delete their CV and data after confirming. This removes the application and everything linked to it (screening, status history, notes, interviews, interview feedback and interview questions) and the CV file. HR no longer sees that candidate for that job.
12. **Phone-friendly:** Every candidate page works on a phone screen with no horizontal scrolling.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Public Jobs List | Open jobs with search, job type and location filters. | "No open jobs right now" or "No jobs match your search" with "Clear filters" | Skeleton cards | "Couldn't load jobs" with Retry | List of open jobs |
| Apply Form | Name, email, phone, cover note and the CV upload box. | Name and email filled in; empty upload box saying "Drag your PDF CV here or choose a file" | Upload progress bar, then Submit spinner | "Only PDF files are accepted", "File must be under 5 MB", "You have already applied to this job", "This job is no longer accepting applications", "This field is required" | Application saved and Confirmation opens |
| Confirmation | Confirmation message and a link to My Applications. | N/A | N/A | N/A | "Your application has been sent to ABC Tech" |
| My Applications | One card per application with job, company, applied date and status. | "You haven't applied to any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your applications" with Retry | List of applications with status only |
| Application Detail | Status timeline, interview details, Withdraw and Delete my data buttons. | N/A | Skeleton timeline | "Couldn't load this application" with Retry | Timeline shown; "Application withdrawn" or "Your data has been deleted" after those actions |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Search jobs | Search text, job type, location | Matching open jobs |
| Apply | Phone, optional cover note (max 500 characters), PDF CV | Application with status Applied and screening Queued; Confirmation screen |
| My Applications | Opens the page | Their applications with status, never score |
| Withdraw | Clicks Withdraw and confirms | Status Withdrawn; shown in the timeline |
| Delete my data | Clicks "Delete my data" and confirms | The application, everything linked to it and the CV file removed; "Your data has been deleted" |

## Data Used

- **`applications` table:**
  - `id`
  - `job_id`
  - `candidate_id`
  - `candidate_name`, `candidate_email`: copied from the apply form. HR reads names and emails only from here, never from `profiles`
  - `cv_file_path`
  - `phone`
  - `cover_note`
  - `status`: `applied`, `shortlisted`, `interview`, `offer`, `hired`, `rejected` or `withdrawn`
  - `screening_status`: `queued`, `processing`, `done`, `pending` or `failed`
  - `applied_at`, `updated_at`
  - `viewed_at`: set the first time HR opens the candidate detail page (Feature 05)
- **Storage bucket `cvs`:** A private bucket holding the PDF files, at `{candidate_id}/applications/{job_id}/{original-file-name}.pdf`. `cv_file_path` points to the file.
- **How they link:** `applications.job_id` points to `jobs.id` (Feature 02) and `applications.candidate_id` points to `profiles.id` (Feature 01).

## Business Rules and Permissions

- One application per candidate per job.
- Only Open jobs accept applications. This is checked again on Submit.
- PDF only, under 5 MB. Cover note up to 500 characters.
- CVs go in the private bucket `cvs` and are never public.
- A candidate can only see their own applications.
- Candidates never see score, match percentage, AI summary or HR notes.
- Withdraw is only allowed while the status is Applied or Shortlisted.
- Withdrawn applications cannot be moved by HR (see Feature 06).
- "Delete my data" needs confirmation and cannot be undone. It removes the application, its screening, status history, notes, interviews, interview feedback and interview questions, and the CV file.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| File is not a PDF | "Only PDF files are accepted" | Rejects the file; Submit stays disabled. |
| File over 5 MB | "File must be under 5 MB" | Does not upload the file. |
| Applied before | "You have already applied to this job" | Blocks a second application and links to My Applications. |
| Job closed | "This job is no longer accepting applications" | Does not save the application. |
| Empty required field | "This field is required" | Highlights the field and does not submit. |
| Cover note too long | "Cover note can be up to 500 characters" | Shows a character counter and does not submit. |
| Upload fails | "Your CV didn't upload, please try again" | Keeps the form filled in and lets the candidate retry. |
| Withdraw not allowed | "You can't withdraw at this stage" | Hides or disables the Withdraw button after Shortlisted. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the candidate typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Candidates can browse, search and filter open jobs.
- [ ] Clicking Apply when logged out leads to sign up or log in and back to the same job.
- [ ] Candidates can apply with a PDF CV by drag and drop or by choosing a file.
- [ ] Non-PDF files, files over 5 MB, repeat applications and closed jobs are blocked with clear messages.
- [ ] On submit, the CV is in the private `cvs` bucket and the application has status Applied and screening Queued.
- [ ] Screening starts in the background and the candidate does not wait.
- [ ] My Applications shows job, company, date, status and timeline, and never shows a score.
- [ ] Candidates can withdraw while Applied or Shortlisted, and can delete their CV and data.
- [ ] All candidate pages work on a phone with no horizontal scrolling.

## Test Cases

- Given Ali is on the apply form for Junior Web Developer, when he uploads a .docx file, then he sees "Only PDF files are accepted" and the Submit button stays disabled.
- Given Ali is on the apply form, when he uploads a 7 MB PDF, then he sees "File must be under 5 MB" and the file is not uploaded.
- Given Ali has already applied to Junior Web Developer, when he clicks Apply on the same job again, then he sees "You have already applied to this job" and no second application is created.
- Given Ali submits a valid PDF CV, when the submission finishes, then he sees "Your application has been sent to ABC Tech" and My Applications shows "Junior Web Developer · ABC Tech · Applied".
- Given Ali opens My Applications on a 360 px wide phone, when the page loads, then everything fits the screen with no horizontal scroll and no score or match percentage appears anywhere.
- Given Ali's application is Shortlisted, when he clicks Withdraw and confirms, then the status becomes Withdrawn and Sara sees his card greyed out.
- Given Ali applied to Junior Web Developer at ABC Tech, when he clicks "Delete my data" on that application and confirms, then the application, its screening, history, notes and interviews and his CV file are removed, and Sara no longer sees Ali in that job's candidates list.

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles) and Feature 02 (Job Posting).
- **Depended on by:** Feature 04 (CV Screening), Feature 05 (Candidate Ranking) and Feature 06 (Hiring Pipeline).
- See Feature 11 · Candidate Profile, Feature 12 · Saved Jobs and Feature 15 · Email Notifications.

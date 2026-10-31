# Feature 08 · Apply with CV

## Description

A logged-in candidate applies to an open job with a PDF CV. The CV is stored privately, the application is saved, and screening (Feature 11) starts in the background.

## User Stories

- As a **candidate**, I want to apply with my PDF CV in a few steps, so that applying is quick even on my phone.
- As a **candidate**, I want to sign up or log in while applying and come back to the same job, so that I don't lose my place.

## Functional Requirements

1. **Apply:** The Apply button is on the Public Job Detail page (Feature 07).
2. **Login during apply:** If the candidate is not logged in, they sign up or log in (Feature 01) and are returned to the same job's apply form.
3. **Apply form:**
   - Name and email (filled in from the account)
   - Phone
   - Optional cover note, up to 500 characters
   - PDF CV upload, by drag and drop or by choosing a file

   With a profile, the form is prefilled and offers the default CV (Feature 20).
4. **Checks before submit:**
   - The job is still Open and its deadline has not passed (Feature 04).
   - The candidate has not applied to this job before.
   - The file is a PDF.
   - The file is under 5 MB.
   - All required fields are filled.
5. **On submit:**
   - The CV is saved in the private storage bucket `cvs` at `{candidate_id}/applications/{job_id}/{original-file-name}.pdf`.
   - An application is created with status Applied and screening status Queued. The name and email from the form are saved on it as `candidate_name` and `candidate_email`.
   - The first status history row is saved, from empty to Applied (Feature 15).
   - A confirmation is shown: "Your application has been sent to ABC Tech".
   - Feature 11 (AI CV Screening and Retry) starts in the background. The candidate does not wait for it.
   - A confirmation email is sent (Feature 23).
6. **Late submit:** A candidate who submits after the deadline sees "Applications for this job closed on 20 Oct", and the application is not saved.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Apply Form | Name, email, phone, cover note and the CV upload box. | Name and email filled in; empty upload box saying "Drag your PDF CV here or choose a file" | Upload progress bar, then Submit spinner | "Only PDF files are accepted", "File must be under 5 MB", "You have already applied to this job", "This job is no longer accepting applications", "Applications for this job closed on 20 Oct", "This field is required" | Application saved and Confirmation opens |
| Confirmation | Confirmation message and a link to My Applications. | N/A | N/A | N/A | "Your application has been sent to ABC Tech" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Apply | Phone, optional cover note (max 500 characters), PDF CV | Application with status Applied and screening Queued; Confirmation screen |

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
  - `viewed_at`: see Feature 14
- **Storage bucket `cvs`:** A private bucket holding the PDF files, at `{candidate_id}/applications/{job_id}/{original-file-name}.pdf`. `cv_file_path` points to the file.
- **How they link:** `applications.job_id` points to `jobs.id` (Feature 02) and `applications.candidate_id` points to `profiles.id` (Feature 01).

## Business Rules and Permissions

- One application per candidate per job.
- Only Open jobs accept applications. This is checked again on Submit.
- CV rule: PDF only, under 5 MB (also used by Feature 20). Cover note up to 500 characters.
- CVs go in the private bucket `cvs` and are never public.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| File is not a PDF | "Only PDF files are accepted" | Rejects the file; Submit stays disabled. |
| File over 5 MB | "File must be under 5 MB" | Does not upload the file. |
| Applied before | "You have already applied to this job" | Blocks a second application and links to My Applications. |
| Job closed | "This job is no longer accepting applications" | Does not save the application. |
| Candidate submits after the deadline | "Applications for this job closed on 20 Oct" | Does not save the application. |
| Empty required field | "This field is required" | Highlights the field and does not submit. |
| Cover note too long | "Cover note can be up to 500 characters" | Shows a character counter and does not submit. |
| Upload fails | "Your CV didn't upload, please try again" | Keeps the form filled in and lets the candidate retry. |
| Network or server failure | "Something went wrong, please try again" | Keeps what the candidate typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Clicking Apply when logged out leads to sign up or log in and back to the same job.
- [ ] Candidates can apply with a PDF CV by drag and drop or by choosing a file.
- [ ] Non-PDF files, files over 5 MB, repeat applications, closed jobs and late submits are blocked with clear messages.
- [ ] On submit, the CV is in the private `cvs` bucket and the application has status Applied and screening Queued.
- [ ] Screening starts in the background and the candidate does not wait.

## User Flows

- Flow 8 · Candidate applies with a CV

## Test Cases

- Given Ali is on the apply form for Junior Web Developer, when he uploads a .docx file, then he sees "Only PDF files are accepted" and the Submit button stays disabled.
- Given Ali is on the apply form, when he uploads a 7 MB PDF, then he sees "File must be under 5 MB" and the file is not uploaded.
- Given Ali has already applied to Junior Web Developer, when he clicks Apply on the same job again, then he sees "You have already applied to this job" and no second application is created.
- Given Ali submits a valid PDF CV, when the submission finishes, then he sees "Your application has been sent to ABC Tech" and My Applications shows "Junior Web Developer · ABC Tech · Applied".
- Given Ali opened the apply form on 20 Oct, when he clicks Submit after the deadline has passed, then he sees "Applications for this job closed on 20 Oct" and no application is saved.
- Given Ali has just applied to Junior Web Developer, when Sara opens his history, then the first entry goes from empty to Applied.

## Dependencies

- **Depends on:** Feature 01 (Authentication), Feature 04 (Close, Reopen and Deadline) and Feature 07 (Job Search).
- **Depended on by:** Feature 09 (My Applications), Feature 11 (AI CV Screening and Retry), Feature 19 (Reports), Feature 20 (Candidate Profile), Feature 21 (Saved Jobs), Feature 22 (Account Settings and Deletion) and Feature 23 (Email Notifications).

## Done When

- [ ] Ali applies with a PDF CV and sees "Your application has been sent to ABC Tech".
- [ ] My Applications shows "Junior Web Developer · ABC Tech · Applied", and the first history entry goes from empty to Applied.
- [ ] The CV is saved in the private `cvs` bucket and screening starts in the background.
- [ ] A .docx file shows "Only PDF files are accepted", and a 7 MB PDF shows "File must be under 5 MB".
- [ ] Applying twice shows "You have already applied to this job", and submitting after the deadline shows "Applications for this job closed on 20 Oct".

# Feature 25 · Candidate Profile

## Description

Each candidate has a profile with basic details and one default CV. The apply form is filled in from the profile, and the candidate can use the default CV with one click or upload a different CV for one job. HR never browses profiles.

## User Stories

- As a **candidate**, I want to save my phone, city and a short headline once, so that I don't type them again for every job.
- As a **candidate**, I want to keep one default CV, so that I can apply to several jobs quickly.
- As a **candidate**, I want to upload a different CV for one job, so that I can send a CV that fits that role.
- As a **candidate**, I want to replace or delete my default CV, so that it is always up to date and under my control.
- As a **candidate**, I want my profile to stay private, so that companies only see what I choose to send them.

## Functional Requirements

1. **My Profile page:** The candidate can view and edit:
   - Full name
   - Phone
   - City
   - Short headline (up to 100 characters), for example "Junior React developer"
   - Default CV
2. **Upload default CV:** By drag and drop or by choosing a file, with the CV rule from Feature 12 (PDF only, under 5 MB).
3. **Replace default CV:** Uploading a new file replaces the old default CV.
4. **Delete default CV:** After confirming, the default CV file is removed.
5. **Prefill when applying:** The apply form (Feature 12) is filled in with the profile's name, email and phone.
6. **CV choice when applying:** The apply form offers "Use my default CV (ali-cv.pdf)" or "Upload a different CV for this job". A different CV is used for that application only and does not change the default CV.
7. **Submitted CVs are frozen:** When a candidate applies, the chosen CV is copied into that application. Replacing or deleting the default CV later never changes a CV already sent.
8. **No HR browsing:** HR cannot search, list or open candidate profiles. HR only sees the details and CV submitted with an application.
9. **Empty profile:** A new candidate sees a prompt to complete their profile. Applying still works without a complete profile.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| My Profile | Name, phone, city, headline, default CV box with Replace and Delete. | "Complete your profile to apply faster" with empty fields and an empty CV box | Skeleton form; upload progress bar; Save spinner | "Only PDF files are accepted", "File must be under 5 MB", "Headline can be up to 100 characters", "Couldn't save, try again" | "Profile saved", "CV uploaded" or "Default CV deleted" |
| Apply Form (CV choice) | Prefilled name, email and phone, plus "Use my default CV" or "Upload a different CV for this job". | No default CV: only the upload box | Upload progress bar, then Submit spinner | Same file errors as above | Application sent with the chosen CV |
| Delete CV dialog | "Delete your default CV? CVs you already sent to companies are not affected." | N/A | Delete button spinner | "Couldn't delete, try again" | Dialog closes; empty CV box shown |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Save profile | Full name, phone, city, headline | Profile updated; "Profile saved" |
| Upload / replace default CV | PDF file under 5 MB | File saved privately as the default CV; "CV uploaded" |
| Delete default CV | Clicks Delete and confirms | Default CV removed; "Default CV deleted" |
| Apply with default CV | Chooses "Use my default CV" | A copy of the default CV is attached to the application |
| Apply with a different CV | Uploads another PDF | That file is attached to this application only |

## Data Used

- **`profiles` table** (Feature 01), new fields for candidate rows only:
  - `phone`
  - `city`
  - `headline`
  - `default_cv_path`
- **Storage bucket `cvs`** (Feature 12): the default CV is stored here, privately, at `{candidate_id}/default/{original-file-name}.pdf`.
- **`applications.cv_file_path`** (Feature 12): points to the copy of the CV sent with each application.
- **How they link:** `default_cv_path` points to a file in `cvs`. When applying, that file is copied to `{candidate_id}/applications/{job_id}/{original-file-name}.pdf` and the copy's path is saved in `applications.cv_file_path`.

## Business Rules and Permissions

- Only the candidate can see and edit their own profile.
- HR never sees profiles. HR only sees what was submitted with an application.
- The new profile fields are only used for candidate rows. HR rows leave them empty.
- The default CV follows the same rules as any CV: PDF only, under 5 MB, private bucket.
- A CV already sent to a company never changes when the default CV is replaced or deleted.
- City is never sent to AI or used in screening.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Default CV not a PDF | "Only PDF files are accepted" | Rejects the file; the old default CV stays. |
| Default CV over 5 MB | "File must be under 5 MB" | Does not upload the file. |
| Headline too long | "Headline can be up to 100 characters" | Shows a character counter and does not save. |
| Default CV deleted while applying | "Your default CV is no longer available. Please upload a CV" | Switches the apply form to the upload box. |
| HR opens a profile URL | "You don't have access to this page" | Shows no profile data. |
| Network or server failure | "Couldn't save, try again" | Keeps what the candidate typed; never shows a raw error. |

## Acceptance Criteria

- [ ] A candidate can save name, phone, city and headline on My Profile.
- [ ] A candidate can upload, replace and delete a default CV, with PDF and 5 MB checks.
- [ ] The apply form is prefilled from the profile.
- [ ] The candidate can apply with the default CV or a different CV for that job only.
- [ ] Replacing or deleting the default CV never changes a CV already sent.
- [ ] HR cannot browse or open candidate profiles.

## User Flows

- Flow 25 · Candidate sets up a profile and default CV

## Test Cases

- Given Ali has saved his phone and a default CV, when he opens the apply form for Junior Web Developer at ABC Tech, then his name, email and phone are filled in and "Use my default CV (ali-cv.pdf)" is selected.
- Given Ali is applying, when he chooses "Upload a different CV for this job" and uploads ali-react-cv.pdf, then that CV is sent to ABC Tech and his default CV stays ali-cv.pdf.
- Given Ali applied to ABC Tech with ali-cv.pdf, when he replaces his default CV with a new file, then Sara still sees the original ali-cv.pdf on his application.
- Given Ali is on My Profile, when he uploads a .docx file as his default CV, then he sees "Only PDF files are accepted" and his old default CV stays.
- Given Sara is logged in as HR, when she opens the URL of Ali's profile page, then she sees "You don't have access to this page" and no profile data.

## Dependencies

- **Depends on:** Feature 02 (Candidate Sign Up) and Feature 12 (Apply with CV).
- **Depended on by:** None.

# Feature 29 · Candidate Email Updates

## Description

Candidates get short, friendly emails, sent with Resend, when they apply, when their status changes and when an interview is scheduled or changed. Emails never include scores, AI results or HR notes. This feature also holds the email rules used by Feature 30.

## User Stories

- As a **candidate**, I want an email when my application is submitted, so that I know it reached the company.
- As a **candidate**, I want an email when my status changes, so that I don't have to keep checking the site.
- As a **candidate**, I want an email with interview details, and when they change, so that I don't miss my interview.
- As **any user**, I want to turn optional emails off, so that I only get the emails I want.

## Functional Requirements

1. **Sending:** All emails are sent with Resend from server code.
2. **Candidate emails:**
   - **Application submitted** (Feature 12): "Your application to ABC Tech was received" (always sent).
   - **Status changed** to Shortlisted, Interview, Offer, Hired or Rejected (Feature 20): "Update on your application to ABC Tech" (optional).
   - **Interview scheduled, rescheduled or cancelled** (Feature 21): includes date, time, duration and meeting link or address (always sent).
3. **Email content:** Each email has a short subject, a friendly message and one button to the right page (My Applications, the application, or the Candidates List).
4. **Never in an email:** Scores, match percentages, AI summaries, HR notes or other candidates' details.
5. **Preference:** In Settings (Feature 27), candidates can turn status updates on or off. Application confirmation and interview emails are always sent.
6. **If sending fails:** The action that caused it, such as submitting or moving a candidate, still succeeds. The failure is saved in the notifications log.
7. **Templates:** Each email type has its own template.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Email (in the user's inbox) | Short subject, friendly message, one button. | N/A | N/A | N/A | Email received; the button opens the right page |
| Settings – Email preferences (Feature 27) | "Status updates" switch, with a note that application and interview emails are always sent. | Switches on by default | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

## Input / Output

| Trigger | Input | Output |
|---------|-------|--------|
| Application submitted (Feature 12) | Application ID | Confirmation email to the candidate |
| Status changed by HR (Feature 20) | Application ID, new status | Status email to the candidate, if turned on |
| Interview scheduled, rescheduled or cancelled (Feature 21) | Interview ID | Interview email to the candidate |
| Preference switch | On or off | Preference saved on the profile |

## Data Used

- **`notifications` table:**
  - `id`
  - `user_id`
  - `type`: one of `application_received`, `status_changed`, `interview_scheduled`, `interview_rescheduled`, `interview_cancelled`, `daily_summary`
  - `application_id`: optional, the application the email is about
  - `interview_id`: optional, the interview the email is about
  - `sent_at`
  - `status`: `sent` or `failed`
  - `error_message`: optional, why sending failed
- **`profiles`** (Feature 01), new field: `email_status_updates` (candidates, default on).
- **Read from:** `applications` (Feature 12), `status_history` (Feature 20), `interviews` (Feature 21), `jobs` and `companies`.
- **How they link:** `notifications.user_id` points to `profiles.id`, `application_id` to `applications.id`, and `interview_id` to `interviews.id`.

## Business Rules and Permissions

These email rules also apply to Feature 30.

- Emails are sent only from server code. `RESEND_API_KEY` lives only in `.env.local`.
- Emails never contain scores, match percentages, AI summaries, HR notes or other candidates' details.
- Application confirmation and interview emails are always sent and cannot be turned off.
- Status updates can be turned off.
- A failed email never blocks or undoes the action that triggered it.
- Each user can only see and change their own preferences.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Resend is down or the request fails | None to the user | The action still succeeds; the email is logged as `failed` with an `error_message`. |
| Invalid or bounced email address | None to the user | Logged as `failed` with an `error_message`. |
| Optional email turned off | N/A | That email is not sent. |
| Preference save fails | "Couldn't save your preference, try again" | Puts the switch back. |
| Withdrawn candidate | N/A | No more status emails are sent for that application. |

## Acceptance Criteria

- [ ] Candidates get an email when they apply, when their status changes, and when an interview is scheduled, rescheduled or cancelled.
- [ ] Every email has a short subject, a friendly message and a button to the right page.
- [ ] No email ever contains a score, AI result or HR note.
- [ ] Candidates can turn status updates on or off in Settings.
- [ ] If sending fails, the action still succeeds and the failure is logged.

## User Flows

- Flow 29 · Candidate receives email updates

## Test Cases

- Given Ali submits his application to Junior Web Developer, when the submission succeeds, then he gets an email "Your application to ABC Tech was received" with a button to My Applications.
- Given Sara schedules Ali's interview, when she saves it, then Ali gets an email with the date, time, duration and meeting link.
- Given Ali has a score of 74, when he gets any email from HireLens, then it contains no score, match percentage, AI summary or HR note.
- Given Ali has turned off status updates, when Sara moves him to Shortlisted, then no status email is sent, but he still gets interview emails.
- Given Resend is unavailable, when Sara moves Ali to Interview, then the move succeeds, Ali sees the new status in My Applications, and the email is logged as `failed`.

## Dependencies

- **Depends on:** Feature 12 (Apply with CV), Feature 20 (Hiring Pipeline), Feature 21 (Interview Scheduling) and Feature 27 (Account Settings).
- **Depended on by:** Feature 30 (HR Daily Summary).

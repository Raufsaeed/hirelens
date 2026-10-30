# Feature 15 · Email Notifications

## Description

This feature sends short, friendly emails with Resend when something important happens. Candidates hear about their applications, status changes and interviews, and HR gets one daily summary of new applicants. Emails never include scores, AI results or HR notes.

## User Stories

- As a **candidate**, I want an email when my application is submitted, so that I know it reached the company.
- As a **candidate**, I want an email when my status changes, so that I don't have to keep checking the site.
- As a **candidate**, I want an email with interview details, and when they change, so that I don't miss my interview.
- As an **HR user**, I want one daily summary of new applicants, so that I know when to review without getting an email for every CV.
- As **any user**, I want to turn optional emails off, so that I only get the emails I want.

## Functional Requirements

1. **Sending:** All emails are sent with Resend from server code.
2. **Candidate emails:**
   - **Application submitted:** "Your application to ABC Tech was received" (always sent).
   - **Status changed** to Shortlisted, Interview, Offer, Hired or Rejected: "Update on your application to ABC Tech" (optional).
   - **Interview scheduled, rescheduled or cancelled:** includes date, time, duration and meeting link or address (always sent).
3. **HR email:**
   - **Daily summary:** one email to the company's HR user listing new applicants per job since the last summary, for example "Junior Web Developer · 5 new". It is only sent if there are new applicants (optional).
   - **How it is sent:** The app runs only on localhost with no scheduler, so the summary is sent from a server route that HR triggers with a "Send today's summary" button on the HR Dashboard, for the demo. A real scheduled job at 9:00 am (Pakistan time) is a future step.
4. **Email content:** Each email has a short subject, a friendly message and one button to the right page (My Applications, the application, or the Candidates List).
5. **Never in an email:** Scores, match percentages, AI summaries, HR notes or other candidates' details.
6. **Preferences:** In Profile Settings (Feature 14), users can turn optional emails on or off:
   - Candidates: status updates.
   - HR: daily summary.

   Application confirmation and interview emails are always sent.
7. **If sending fails:** The action that caused it, such as submitting or moving a candidate, still succeeds. The failure is saved in the notifications log.
8. **Templates:** Each email type has its own template.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Email (in the user's inbox) | Short subject, friendly message, one button. | N/A | N/A | N/A | Email received; the button opens the right page |
| HR Dashboard ("Send today's summary") | A "Send today's summary" button for the company's HR user. | N/A | Button spinner | "Couldn't send the summary, try again" | "Summary sent", or "No new applicants since the last summary" |
| Settings – Email preferences (Feature 14) | Switches: "Status updates" (candidates) or "Daily applicant summary" (HR), with a note that application and interview emails are always sent. | Switches on by default | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

## Input / Output

| Trigger | Input | Output |
|---------|-------|--------|
| Application submitted (Feature 03) | Application ID | Confirmation email to the candidate |
| Status changed by HR (Feature 06) | Application ID, new status | Status email to the candidate, if turned on |
| Interview scheduled, rescheduled or cancelled (Feature 07) | Interview ID | Interview email to the candidate |
| HR clicks "Send today's summary" | Company ID | Summary email to the company's HR user, if the summary is turned on and there are new applicants |
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
- **`profiles`** (Feature 01), new email preference fields:
  - `email_status_updates` (candidates, default on)
  - `email_daily_summary` (HR, default on)
- **Read from:** `applications` (Feature 03), `status_history` (Feature 06), `interviews` (Feature 07), `jobs` and `companies`.
- **How they link:** `notifications.user_id` points to `profiles.id`, `application_id` to `applications.id`, and `interview_id` to `interviews.id`.

## Business Rules and Permissions

- Emails are sent only from server code. `RESEND_API_KEY` lives only in `.env.local`.
- Emails never contain scores, match percentages, AI summaries, HR notes or other candidates' details.
- Application confirmation and interview emails are always sent and cannot be turned off.
- Status updates and the daily summary can be turned off.
- A failed email never blocks or undoes the action that triggered it.
- This version has one HR user per company. Inviting team members is a future feature.
- Each user can only see and change their own preferences.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Resend is down or the request fails | None to the user | The action still succeeds; the email is logged as `failed` with an `error_message`. |
| Invalid or bounced email address | None to the user | Logged as `failed` with an `error_message`. |
| No new applicants since the last summary | "No new applicants since the last summary" | No summary email is sent. |
| Optional email turned off | N/A | That email is not sent. |
| Preference save fails | "Couldn't save your preference, try again" | Puts the switch back. |
| Withdrawn candidate | N/A | No more status emails are sent for that application. |

## Acceptance Criteria

- [ ] Candidates get an email when they apply, when their status changes, and when an interview is scheduled, rescheduled or cancelled.
- [ ] The company's HR user gets a summary of new applicants per job from the "Send today's summary" button, only when there are new applicants.
- [ ] Every email has a short subject, a friendly message and a button to the right page.
- [ ] No email ever contains a score, AI result or HR note.
- [ ] Users can turn status updates and the daily summary on or off in Profile Settings.
- [ ] If sending fails, the action still succeeds and the failure is logged.

## Test Cases

- Given Ali submits his application to Junior Web Developer, when the submission succeeds, then he gets an email "Your application to ABC Tech was received" with a button to My Applications.
- Given Sara schedules Ali's interview, when she saves it, then Ali gets an email with the date, time, duration and meeting link.
- Given Ali has a score of 74, when he gets any email from HireLens, then it contains no score, match percentage, AI summary or HR note.
- Given Ali has turned off status updates, when Sara moves him to Shortlisted, then no status email is sent, but he still gets interview emails.
- Given Resend is unavailable, when Sara moves Ali to Interview, then the move succeeds, Ali sees the new status in My Applications, and the email is logged as `failed`.
- Given 5 people applied to Junior Web Developer since the last summary, when Sara clicks "Send today's summary", then she gets one email listing "Junior Web Developer · 5 new".

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles), Feature 03 (Candidate Apply Portal), Feature 06 (Hiring Pipeline), Feature 07 (Interview Management) and Feature 14 (Profile Settings).
- **Depended on by:** None.

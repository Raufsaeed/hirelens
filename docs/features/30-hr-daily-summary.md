# Feature 30 · HR Daily Summary

## Description

HR gets one email listing new applicants per job since the last summary, instead of one email per CV.

## User Stories

- As an **HR user**, I want one daily summary of new applicants, so that I know when to review without getting an email for every CV.

## Functional Requirements

1. **Daily summary:** One email to the company's HR user listing new applicants per job since the last summary, for example "Junior Web Developer · 5 new". It is only sent if there are new applicants.
2. **How it is sent:** The app runs only on localhost with no scheduler, so the summary is sent from a server route that HR triggers with a "Send today's summary" button on the HR Dashboard, for the demo. A real scheduled job at 9:00 am (Pakistan time) is a future step.
3. **Email content:** Short subject, friendly message and one button to the Candidates List. The email rules from Feature 29 apply.
4. **Preference:** In Settings (Feature 27), HR can turn the daily summary on or off (optional email).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| HR Dashboard ("Send today's summary") | A "Send today's summary" button for the company's HR user. | N/A | Button spinner | "Couldn't send the summary, try again" | "Summary sent", or "No new applicants since the last summary" |
| Settings – Email preferences (Feature 27) | "Daily applicant summary" switch. | Switches on by default | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

## Input / Output

| Trigger | Input | Output |
|---------|-------|--------|
| HR clicks "Send today's summary" | Company ID | Summary email to the company's HR user, if the summary is turned on and there are new applicants |
| Preference switch | On or off | Preference saved on the profile |

## Data Used

- **`notifications`** (Feature 29): rows with `type` `daily_summary`. "New applicants" are applications with `applied_at` after the last `daily_summary` row for that HR user.
- **`profiles`** (Feature 01), new field: `email_daily_summary` (HR, default on).
- **Read from:** `applications` (Feature 12) and `jobs` (Feature 05).

## Business Rules and Permissions

- Same email rules as Feature 29.
- The daily summary can be turned off.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| No new applicants since the last summary | "No new applicants since the last summary" | No summary email is sent. |
| Summary turned off | N/A | The summary is not sent. |
| Sending fails | "Couldn't send the summary, try again" | Logged as `failed` with an `error_message`. |

## Acceptance Criteria

- [ ] The company's HR user gets a summary of new applicants per job from the "Send today's summary" button, only when there are new applicants.
- [ ] HR can turn the daily summary on or off in Settings.

## User Flows

- Flow 30 · HR sends the daily applicant summary

## Test Cases

- Given 5 people applied to Junior Web Developer since the last summary, when Sara clicks "Send today's summary", then she gets one email listing "Junior Web Developer · 5 new".
- Given nobody has applied since the last summary, when Sara clicks "Send today's summary", then she sees "No new applicants since the last summary" and no email is sent.
- Given Sara has turned off "Daily applicant summary", when she clicks "Send today's summary", then no summary email is sent.

## Dependencies

- **Depends on:** Feature 27 (Account Settings) and Feature 29 (Candidate Email Updates).
- **Depended on by:** None.

## Done When

- [ ] "Send today's summary" sends Sara one email listing "Junior Web Developer · 5 new".
- [ ] With no new applicants, Sara sees "No new applicants since the last summary" and no email is sent.
- [ ] With "Daily applicant summary" turned off, no summary email is sent.
- [ ] If sending fails, Sara sees "Couldn't send the summary, try again".
- [ ] Privacy: the summary follows the email rules from Feature 29 (no scores, AI results or HR notes).

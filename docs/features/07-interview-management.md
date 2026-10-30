# Feature 07 · Interview Management

## Description

This feature lets HR schedule, reschedule and cancel interviews, and record feedback afterwards. The candidate sees the interview details in My Applications. An Interviews page shows HR all upcoming and past interviews in one place.

## User Stories

- As an **HR user**, I want to schedule an interview when I move a candidate to Interview, so that both of us know when and where it is.
- As a **candidate**, I want to see the date, time and meeting link, so that I can join on time.
- As an **HR user**, I want to reschedule or cancel an interview, so that I can handle changes.
- As an **HR user**, I want a list of upcoming and past interviews, so that I can plan my week.
- As an **HR user**, I want to record a rating and feedback after each interview, so that I can make and explain my decision.

## Functional Requirements

1. **Schedule form:** Moving a candidate to Interview (Feature 06) opens a form with:
   - Date and time
   - Duration (default 30 minutes)
   - Meeting link or office address
   - Interviewer name
2. **Candidate view:** The candidate sees the date, time, duration and meeting link or address in My Applications (Feature 03).
3. **Reschedule:** HR can change the details. The candidate sees the updated details.
4. **Cancel:** HR can cancel after confirming. The candidate sees "Interview cancelled".
5. **Interviews page:**
   - Upcoming interviews (soonest first) and past interviews.
   - Each shows the candidate, job, time and status.
6. **Feedback form:** After the interview, HR fills in:
   - Rating from 1 to 5
   - Strengths
   - Concerns
   - Recommendation: Offer, Reject or Another round

   Saving it creates the interview's feedback record in `interview_feedback` (one per interview) and marks the interview as done. The feedback is shown on the candidate detail page, visible only to HR.
7. **Advice only:** The recommendation is a note for HR. The candidate's status only changes when HR moves them on the Pipeline Board.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Schedule Interview | Date, time, duration, meeting link or address, interviewer name. | Blank form with duration set to 30 minutes | Save button spinner | "Please choose a date in the future", "Add a meeting link or an office address", "Please enter a valid link", "You already have an interview at this time" | "Interview scheduled"; card shows the date |
| Interviews page | Upcoming and past interviews. | "No interviews scheduled yet" | Skeleton list | "Couldn't load interviews" with Retry | Lists shown |
| Interview Feedback | Rating, strengths, concerns and recommendation. | Blank form | Save button spinner | "Please add a rating and a recommendation" | "Feedback saved"; interview marked done |
| My Applications (candidate) | Interview date, time, duration and link or address. | N/A | Skeleton timeline | "Couldn't load your applications" with Retry | Interview details shown, or "Interview cancelled" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Schedule | Date, time, duration, link or address, interviewer name | Interview saved as `scheduled`; candidate sees the details |
| Reschedule | Changed details | Interview updated; candidate sees the new details |
| Cancel | Clicks Cancel and confirms | Interview `cancelled`; candidate sees "Interview cancelled" |
| Feedback | Rating 1–5, strengths, concerns, recommendation | Feedback saved; interview `done` |

## Data Used

- **`interviews` table:**
  - `id`
  - `application_id`
  - `scheduled_at`
  - `duration_minutes`
  - `meeting_link`
  - `location`
  - `interviewer_name`
  - `status`: `scheduled`, `done` or `cancelled`
  - `created_at`, `updated_at`
- **`interview_feedback` table:**
  - `id`
  - `interview_id` (unique: one feedback record per interview)
  - `rating`
  - `strengths`
  - `concerns`
  - `recommendation`: `offer`, `reject` or `another_round`
  - `created_by`
  - `created_at`
- **How they link:** `interviews.application_id` points to `applications.id` (Feature 03). One application can have more than one interview, for example when the recommendation is "Another round". `interview_feedback.interview_id` points to `interviews.id`, and `created_by` points to `profiles.id`.

## Business Rules and Permissions

- Only HR of the job's company can schedule, change, cancel or give feedback.
- An interview must be in the future when scheduled or rescheduled.
- An interview needs a meeting link or an office address (or both).
- Rating must be a whole number from 1 to 5.
- The candidate can read their own `interviews` rows (time, duration, link, location and status). They can never read `interview_feedback`, so they never see rating, strengths, concerns or recommendation.
- Only HR of the job's company can read or write `interview_feedback`.
- The recommendation never changes the pipeline status by itself.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Date in the past | "Please choose a date in the future" | Does not save. |
| Missing link and location | "Add a meeting link or an office address" | Does not save. |
| Invalid meeting link | "Please enter a valid link" | Does not save. |
| Overlapping interviews (same interviewer, same time) | "You already have an interview at this time" | Shows the clashing interview; HR can change the time or choose "Schedule anyway". |
| Feedback missing rating or recommendation | "Please add a rating and a recommendation" | Does not save. |
| Network or server failure | "Something went wrong, please try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Moving a candidate to Interview opens the schedule form.
- [ ] HR can schedule, reschedule and cancel interviews.
- [ ] The candidate sees the interview details, and any change or cancellation, in My Applications.
- [ ] The Interviews page lists upcoming and past interviews.
- [ ] HR can save feedback with a rating, strengths, concerns and recommendation.
- [ ] Past dates, missing link and location, and overlapping interviews are handled with clear messages.
- [ ] Candidates never see feedback.

## Test Cases

- Given Ali is in Shortlisted, when Sara moves him to Interview and saves a date, time and meeting link, then Ali's My Applications shows "Interview" with those details.
- Given Sara is on the schedule form, when she picks yesterday's date, then she sees "Please choose a date in the future" and nothing is saved.
- Given Sara leaves both the meeting link and the address empty, when she clicks Save, then she sees "Add a meeting link or an office address".
- Given Sara already has an interview with Ayesha at 11:00 on Tuesday, when she schedules Ali at 11:00 on Tuesday, then she sees "You already have an interview at this time".
- Given Ali's interview is over, when Sara saves a rating of 4 with strengths, concerns and "Offer", then the interview is marked done, Ali's status does not change until Sara moves him, and Ali sees none of the feedback.

## Dependencies

- **Depends on:** Feature 06 (Hiring Pipeline).
- **Depended on by:** Feature 08 (AI Interview Questions).
- See Feature 15 · Email Notifications.

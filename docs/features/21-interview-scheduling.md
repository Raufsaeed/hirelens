# Feature 21 · Interview Scheduling

## Description

HR schedules, reschedules and cancels interviews. The candidate sees the details in My Applications. An Interviews page shows HR all upcoming and past interviews.

## User Stories

- As an **HR user**, I want to schedule an interview when I move a candidate to Interview, so that both of us know when and where it is.
- As a **candidate**, I want to see the date, time and meeting link, so that I can join on time.
- As an **HR user**, I want to reschedule or cancel an interview, so that I can handle changes.
- As an **HR user**, I want a list of upcoming and past interviews, so that I can plan my week.

## Functional Requirements

1. **Schedule form:** Moving a candidate to Interview (Feature 20) opens a form with:
   - Date and time
   - Duration (default 30 minutes)
   - Meeting link or office address
   - Interviewer name
2. **Candidate view:** The candidate sees the date, time, duration and meeting link or address in My Applications (Feature 13), and gets an email (Feature 29).
3. **Reschedule:** HR can change the details. The candidate sees the updated details.
4. **Cancel:** HR can cancel after confirming. The candidate sees "Interview cancelled".
5. **Interviews page:**
   - Upcoming interviews (soonest first) and past interviews.
   - Each shows the candidate, job, time and status.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Schedule Interview | Date, time, duration, meeting link or address, interviewer name. | Blank form with duration set to 30 minutes | Save button spinner | "Please choose a date in the future", "Add a meeting link or an office address", "Please enter a valid link", "You already have an interview at this time" | "Interview scheduled"; card shows the date |
| Interviews page | Upcoming and past interviews. | "No interviews scheduled yet" | Skeleton list | "Couldn't load interviews" with Retry | Lists shown |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Schedule | Date, time, duration, link or address, interviewer name | Interview saved as `scheduled`; candidate sees the details |
| Reschedule | Changed details | Interview updated; candidate sees the new details |
| Cancel | Clicks Cancel and confirms | Interview `cancelled`; candidate sees "Interview cancelled" |

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
- **How they link:** `interviews.application_id` points to `applications.id` (Feature 12). One application can have more than one interview, for example when the recommendation is "Another round" (Feature 22).

## Business Rules and Permissions

- Only HR of the job's company can schedule, change or cancel interviews.
- An interview must be in the future when scheduled or rescheduled.
- An interview needs a meeting link or an office address (or both).
- The candidate can read their own `interviews` rows (time, duration, link, location and status).
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Date in the past | "Please choose a date in the future" | Does not save. |
| Missing link and location | "Add a meeting link or an office address" | Does not save. |
| Invalid meeting link | "Please enter a valid link" | Does not save. |
| Overlapping interviews (same interviewer, same time) | "You already have an interview at this time" | Shows the clashing interview; HR can change the time or choose "Schedule anyway". |
| Network or server failure | "Something went wrong, please try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Moving a candidate to Interview opens the schedule form.
- [ ] HR can schedule, reschedule and cancel interviews.
- [ ] The candidate sees the interview details, and any change or cancellation, in My Applications.
- [ ] The Interviews page lists upcoming and past interviews.
- [ ] Past dates, missing link and location, and overlapping interviews are handled with clear messages.

## User Flows

- Flow 21 · HR schedules an interview

## Test Cases

- Given Ali is in Shortlisted, when Sara moves him to Interview and saves a date, time and meeting link, then Ali's My Applications shows "Interview" with those details.
- Given Sara is on the schedule form, when she picks yesterday's date, then she sees "Please choose a date in the future" and nothing is saved.
- Given Sara leaves both the meeting link and the address empty, when she clicks Save, then she sees "Add a meeting link or an office address".
- Given Sara already has an interview with Ayesha at 11:00 on Tuesday, when she schedules Ali at 11:00 on Tuesday, then she sees "You already have an interview at this time".

## Dependencies

- **Depends on:** Feature 20 (Hiring Pipeline).
- **Depended on by:** Feature 22 (Interview Feedback), Feature 23 (AI Interview Questions) and Feature 29 (Candidate Email Updates).

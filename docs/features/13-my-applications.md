# Feature 13 · My Applications

## Description

Candidates see each of their applications with its status, a timeline and interview details, on any screen size. Candidates never see their score or any AI or HR data.

## User Stories

- As a **candidate**, I want to see the status of each application and my interview details, so that I know where I stand.
- As a **candidate**, I want to see my status change, so that I know what is happening with my application.

## Functional Requirements

1. **My Applications:** A list showing job title, company, applied date and status. Status is one of: Applied, Shortlisted, Interview (with date, time and link), Offer, Hired, Rejected, Withdrawn.
2. **Application detail:** A status timeline with the date of each change, plus interview details (date, time, duration, meeting link or address, Feature 21) or "Interview cancelled". Withdraw and Delete my data are here too (Feature 14).
3. **Never shown to candidates:** Score, match percentage, AI summary or HR notes. This rule applies to every candidate screen and email.
4. **Phone-friendly:** Every candidate page works on a phone screen with no horizontal scrolling.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| My Applications | One card per application with job, company, applied date and status. | "You haven't applied to any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your applications" with Retry | List of applications with status only, never the score |
| Application Detail | Status timeline and interview details. | N/A | Skeleton timeline | "Couldn't load this application" with Retry | Timeline and interview details shown, or "Interview cancelled" |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| My Applications | Opens the page | Their applications with status, never score |
| Application Detail | Opens one application | Status timeline and interview details |

## Data Used

- **`applications`** (Feature 12): job, applied date and status. This table holds no score.
- **`status_history`** (Feature 20): the timeline.
- **`interviews`** (Feature 21): the candidate's own interview rows (time, duration, link, location, status).

## Business Rules and Permissions

- A candidate can only see their own applications.
- Candidates never see score, match percentage, AI summary or HR notes.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Candidate opens another candidate's application or their own score by URL | "You don't have access to this page" | Shows no data. |
| Network or server failure | "Couldn't load your applications" with Retry | Never shows a raw error. |

## Acceptance Criteria

- [ ] My Applications shows job, company, date, status and timeline, and never shows a score.
- [ ] The candidate sees every status change and interview details.
- [ ] All candidate pages work on a phone with no horizontal scrolling.

## User Flows

- Flow 13 · Candidate tracks application status, including on a phone

## Test Cases

- Given Ali opens My Applications on a 360 px wide phone, when the page loads, then everything fits the screen with no horizontal scroll and no score or match percentage appears anywhere.
- Given Ali is logged in, when he tries to open another candidate's application by changing the URL, then he sees "You don't have access to this page" and no data.
- Given Sara has moved Ali to Interview, when Ali opens his application on his phone, then the timeline shows "Interview" with the correct date, time and meeting link.

## Dependencies

- **Depends on:** Feature 12 (Apply with CV).
- **Depended on by:** Feature 14 (Withdraw and Delete Application Data).

# Feature 19 · Reports

## Description

HR gets a Reports page with charts and numbers about their jobs, applicants and hiring progress, for all jobs or one job and a date range. Every number comes from real data and is calculated in code or database queries, never by AI.

## User Stories

- As an **HR user**, I want to see how many people applied to each job, so that I know which jobs attract interest.
- As an **HR user**, I want to see the pipeline funnel and time to hire, so that I can find slow steps.
- As an **HR user**, I want to see the most commonly missing requirements, so that I can adjust job posts or training plans.
- As an **HR user**, I want to filter by job and date range, so that I can prepare a monthly update for my manager.
- As an **HR user**, I want a table version of every chart, so that I can read the exact numbers and copy them.

## Functional Requirements

1. **Filters:** HR chooses "All jobs" or one job, and a date range (default: this month). Every chart updates.
2. **Applicants per job:** A bar chart of the number of applications per job in the date range.
3. **Average score per job:** The average screening score per job. Only applications whose `screening_status` is `done` are counted.
4. **Pipeline funnel:** The number of candidates who reached each stage: Applied → Shortlisted → Interview → Offer → Hired. Taken from status history.
5. **Average time to hire:** Average days from applying to being moved to Hired. Shows "No hires yet" when there are none.
6. **Top missing requirements:** The five requirements most often marked missing across candidates.
7. **Screening health:** The share of applications whose `screening_status` is `pending` or `failed`.
8. **Charts and tables:** Charts use Recharts. Every chart has a "Show as table" option for accessibility.
9. **Empty states:** Clear messages when there are no jobs or no applicants.
10. **No AI:** All numbers come from code or database queries.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| HR Dashboard (Reports link) | A Reports link in the menu and on the dashboard. | N/A | N/A | N/A | Opens the Reports page |
| Reports | Job and date filters, the six charts with table versions. | "Not enough data yet. Reports appear once candidates apply" (no jobs or no applicants); "No applicants for this job yet" (one job selected) | Skeleton charts | "Couldn't load reports" with Retry | Charts and numbers for the chosen job and dates |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Open Reports | Clicks Reports | Charts for all jobs, this month |
| Choose job | Picks "All jobs" or one job | All charts updated for that choice |
| Choose date range | Start and end date | All charts updated for those dates |
| Show as table | Clicks "Show as table" on a chart | The same numbers in a simple table |

## Data Used

- **`jobs`** (Feature 02): job titles and company.
- **`applications`** (Feature 08): applied dates, current status and `screening_status`.
- **`screenings`** (Feature 11): scores and requirements results. A screenings row exists from the first attempt, but its score and results stay empty while screening is `pending` or `failed`.
- **`status_history`** (Feature 15): stage changes for the funnel and time to hire.
- **How they link:** All queries start from the HR user's `company_id` and only read jobs, applications and screenings of that company.

**How each number is calculated:**

| Number | Calculation |
|--------|-------------|
| Applicants per job | Count of applications per job with `applied_at` in the date range |
| Average score | Average of `screenings.score` where `applications.screening_status` is `done` |
| Funnel | Count of applications that ever reached each stage (from `status_history`) |
| Time to hire | Average of (date moved to Hired − `applied_at`) in days |
| Top missing requirements | Count of each requirement marked missing in `requirements_result`, top five |
| Screening health | Applications with `screening_status` `pending` or `failed` ÷ all applications, as a percentage (from `applications.screening_status`) |

## Business Rules and Permissions

- HR sees only their own company's data.
- Every number is calculated in code or database queries from real data, never by AI.
- Withdrawn applications count in applicants per job but not in later funnel stages they never reached.
- Pending or failed screenings are left out of the average score but counted in screening health.
- Candidates cannot open Reports.
- Row Level Security enforces company limits in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Company has no jobs | "Not enough data yet. Reports appear once candidates apply" | Shows no empty or broken charts; links to "Post your first job". |
| Job has no applicants | "No applicants for this job yet" | Hides the charts for that job; time to hire shows "No hires yet". |
| No hires yet | "No hires yet" | Shows that in place of the time-to-hire number. |
| Start date after end date | "Start date must be before end date" | Does not run the query. |
| Candidate opens the Reports URL | "You don't have access to this page" | Shows no data. |
| Network or server failure | "Couldn't load reports" with Retry | Keeps the chosen filters; never shows a raw error. |

## Acceptance Criteria

- [ ] Reports shows applicants per job, average score, the funnel, time to hire, top five missing requirements and screening health.
- [ ] HR can filter by all jobs or one job and by date range.
- [ ] Every chart has a table version.
- [ ] Numbers match the candidates list and pipeline board exactly.
- [ ] Empty states are shown for no jobs and no applicants.
- [ ] HR only sees their own company's data.
- [ ] No AI is used for any number.

## User Flows

- Flow 19 · HR views reports

## Test Cases

- Given ABC Tech has no jobs, when Sara opens Reports, then she sees "Not enough data yet" and no broken or empty charts.
- Given a job has no applicants, when Sara filters Reports by that job, then she sees "No applicants for this job yet" and time to hire shows "No hires yet".
- Given Junior Web Developer has 23 applicants with 2 shortlisted, when Sara filters Reports by that job, then the applicant count and funnel numbers match the candidates list and pipeline board exactly.
- Given 15 of the 23 candidates are missing REST APIs, when Sara opens Reports for Junior Web Developer, then REST APIs is first in the top missing requirements with 15.
- Given another company has its own jobs and candidates, when Sara opens Reports, then none of that company's data appears in any chart or table.

## Dependencies

- **Depends on:** Feature 02 (Post a Job), Feature 08 (Apply with CV), Feature 11 (AI CV Screening and Retry), Feature 12 (Ranked Candidates List) and Feature 15 (Hiring Pipeline).
- **Depended on by:** None.

## Done When

- [x] Reports shows applicants per job, average score, the funnel, time to hire, top missing requirements and screening health.
- [x] Filtering by Junior Web Developer gives numbers that match the candidates list and pipeline board exactly.
- [x] Every chart has "Show as table".
- [x] With no jobs, Sara sees "Not enough data yet" and no broken or empty charts.
- [x] Privacy: no other company's data appears in any chart or table.

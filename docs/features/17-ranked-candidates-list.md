# Feature 17 · Ranked Candidates List

## Description

HR sees every candidate for a job, ranked by screening score from high to low, with filters to narrow the list. AI only advises. HR always decides.

## User Stories

- As an **HR user**, I want candidates ranked by score, so that I can look at the strongest ones first.
- As an **HR user**, I want to filter by score, years, skill and status, so that I can find the right people quickly.
- As an **HR user**, I want to hide names at first, so that I judge candidates on their skills and not their names.

## Functional Requirements

1. **Candidates List:** One list per job, sorted by score from high to low. Each row shows:
   - Name, or "Candidate #1" in anonymised view
   - Score
   - Match percentage
   - Relevant years
   - Degree found and degree match, for example "BS IT ✗"
   - Screening status
   - Pipeline status
2. **Anonymised-first view:** HR can turn on a view that hides names in the list. The name is shown once HR opens the candidate (Feature 19).
3. **Filters:**
   - Minimum score
   - Minimum years
   - A specific skill (from the job's requirements)
   - Pipeline status

   The list updates as filters change and shows how many candidates match.
4. **Pending and failed screenings:** Shown at the bottom with a badge (Feature 16).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidates List | Ranked candidates with filters and the anonymised toggle. | "No one has applied yet. Share your job link" or "No candidates match these filters" with "Clear filters" | Skeleton rows; "Screening…" on rows being retried | "Couldn't load candidates" with Retry | Ranked list with match count |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Filter list | Minimum score, minimum years, skill, status | Filtered ranked list and match count |
| Anonymised view | Turns the toggle on or off | Names hidden or shown in the list |
| Open candidate | Clicks a row | Candidate Detail (Feature 19) |

## Data Used

- **`applications`** (Feature 12): status, screening status and `candidate_name`.
- **`screenings`** (Feature 15): score, match percentage, relevant years, degree match and degree found.
- **How they link:** Applications are joined to their job and screening. Only applications for the HR user's company jobs are read.

## Business Rules and Permissions

- HR sees only candidates who applied to their own company's jobs.
- HR reads candidate names and emails only from `applications`, never from `profiles`.
- Ranking is by score from high to low. Ties are broken by match percentage, then by earliest applied date.
- Pending and failed screenings always sit at the bottom.
- AI never shortlists or rejects. Every status change is a click by HR.
- Candidates cannot open this page.
- Row Level Security enforces company limits in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| No candidates yet | "No one has applied yet. Share your job link" | Shows the job link with "Copy link". |
| Filters return nothing | "No candidates match these filters" | Shows a "Clear filters" button. |
| Network or server failure | "Something went wrong, please try again" | Keeps filters; never shows a raw error. |

## Acceptance Criteria

- [ ] Candidates are listed by score from high to low with all the listed columns.
- [ ] The anonymised view hides names in the list.
- [ ] Filters for score, years, skill and status work together and show a match count.
- [ ] The list shows the degree found next to the degree match.
- [ ] HR only sees their own company's candidates.

## User Flows

- Flow 17 · HR reviews the ranked candidates list

## Test Cases

- Given 23 candidates have applied, when Sara opens the Candidates List, then Ayesha (88), Ali (74) and Usman (61) appear in that order with their match percentage, years, degree found and degree match.
- Given 23 candidates have applied, when Sara sets the minimum score to 95, then she sees "No candidates match these filters" and a "Clear filters" button.
- Given Ali's screening is pending, when Sara opens the list, then Ali is at the bottom with a "Pending" badge and filtering and opening other candidates still works.
- Given Ali's CV lists "BS Computer Science" and the job needs BS Computer Science, when Sara opens the Candidates List, then Ali's row shows "BS CS ✓".

## Dependencies

- **Depends on:** Feature 15 (AI CV Screening).
- **Depended on by:** Feature 16 (Retry Screening), Feature 18 (Candidate Search), Feature 19 (Candidate Review and Shortlist) and Feature 24 (Reports).

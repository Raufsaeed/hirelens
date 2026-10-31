# Feature 13 · Candidate Search

## Description

HR searches for a candidate by name or email across all of their company's jobs.

## User Stories

- As an **HR user**, I want to search for a candidate by name or email across all our jobs, so that I can find someone fast when they call or email me.

## Functional Requirements

1. **Where:** A search box in the HR top navigation (on every HR page) and on the Candidates page.
2. **What it matches:** Name or email (`applications.candidate_name` and `candidate_email`), part of a word, not case-sensitive, from 2 characters.
3. **Scope:** All jobs of the HR user's own company only.
4. **Results:** One row per candidate, showing name, job(s) applied to, and the score and status for each job. Clicking a result opens that Candidate Detail page (Feature 14).
5. **With filters:** On the Candidates page, search works together with the filters (score, years, skill, status) from Feature 12.
6. **No results:** Shows "No candidates found for 'xyz'".

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidate Search (top navigation and Candidates page) | Search box and a results list with name, job(s), score and status. | "Search by name or email" placeholder; "No candidates found for 'xyz'" when nothing matches | "Searching…" under the box | "Couldn't search right now, try again"; "Type at least 2 characters" | Matching candidates shown; clicking one opens Candidate Detail |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Search candidates | Name or email (2+ characters) | Matching candidates from the company's jobs, with job(s), score and status |

## Data Used

- **`applications`** (Feature 08): `candidate_name`, `candidate_email`, job and status.
- **`screenings`** (Feature 11): score.

## Business Rules and Permissions

- Candidate Search only returns candidates who applied to the HR user's own company's jobs, never candidates from other companies.
- Candidates cannot use Candidate Search.
- Row Level Security enforces company limits in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Search finds nothing | "No candidates found for 'xyz'" | Shows a "Clear search" button. |
| Search text too short | "Type at least 2 characters" | Does not search yet. |
| Search for a name that only exists at another company | "No candidates found for 'xyz'" | Returns nothing from other companies. |
| Search fails | "Couldn't search right now, try again" | Keeps the search text. |

## Acceptance Criteria

- [ ] HR can search by name or email from the top navigation and the Candidates page, across all of their company's jobs.
- [ ] Search results show name, job(s), score and status, and open Candidate Detail.
- [ ] Search works together with the existing filters.
- [ ] Search shows "No candidates found for …" when empty and never returns other companies' candidates.

## User Flows

- Flow 13 · HR searches for a candidate

## Test Cases

- Given Ali applied to two ABC Tech jobs, when Sara types "ali" in the top navigation search, then Ali appears once with both jobs and their scores and statuses, and clicking a job opens his Candidate Detail page.
- Given Sara has set the minimum score to 70 on the Candidates page, when she searches "usman", then she sees "No candidates found for 'usman'" because Usman's score is 61.
- Given a candidate named Bilal applied only to another company, when Sara searches "bilal", then she sees "No candidates found for 'bilal'".

## Dependencies

- **Depends on:** Feature 12 (Ranked Candidates List).
- **Depended on by:** None.

## Done When

- [ ] Typing "ali" in the top navigation shows Ali once with both jobs and their scores and statuses.
- [ ] Clicking a result opens Ali's Candidate Detail page.
- [ ] With the minimum score set to 70, searching "usman" shows "No candidates found for 'usman'".
- [ ] Typing fewer than 2 characters shows "Type at least 2 characters".
- [ ] Privacy: searching "bilal" (another company's candidate) shows "No candidates found for 'bilal'".

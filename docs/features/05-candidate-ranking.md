# Feature 05 · Candidate Ranking

## Description

This feature shows HR every candidate for a job, ranked by screening score from high to low, with filters to narrow the list. HR opens a candidate to see the CV next to the full AI breakdown and the evidence behind it, then shortlists or rejects. HR can also search for any candidate by name or email across all of their company's jobs. AI only advises. HR always decides.

## User Stories

- As an **HR user**, I want candidates ranked by score, so that I can look at the strongest ones first.
- As an **HR user**, I want to filter by score, years, skill and status, so that I can find the right people quickly.
- As an **HR user**, I want to hide names at first, so that I judge candidates on their skills and not their names.
- As an **HR user**, I want to see the evidence behind each score, so that I can check the AI's work before I decide.
- As an **HR user**, I want to add notes and shortlist or reject from the same page, so that I can review quickly.
- As an **HR user**, I want to search for a candidate by name or email across all our jobs, so that I can find someone fast when they call or email me.

## Functional Requirements

1. **Candidates List:** One list per job, sorted by score from high to low. Each row shows:
   - Name, or "Candidate #1" in anonymised view
   - Score
   - Match percentage
   - Relevant years
   - Degree found and degree match, for example "BS IT ✗"
   - Screening status
   - Pipeline status
2. **Anonymised-first view:** HR can turn on a view that hides names in the list. The name is shown once HR opens the candidate.
3. **Filters:**
   - Minimum score
   - Minimum years
   - A specific skill (from the job's requirements)
   - Pipeline status

   The list updates as filters change and shows how many candidates match.
4. **Pending and failed screenings:** Candidates whose screening is `pending` or `failed` appear at the bottom with a badge. Pending ones have a "Retry screening" button (runs Feature 04). Failed ones show "CV could not be read".
5. **Candidate Detail:**
   - CV preview using a short-lived signed link to the private file
   - Score breakdown with the reason for each rubric part
   - Requirements found with evidence, and requirements missing
   - Experience list showing which items were counted and how (full, half or not counted)
   - Degree found and degree match
   - AI summary
   - HR notes
   - Shortlist and Reject buttons
6. **Manual review:** For a candidate whose CV could not be read, HR can open the original CV and add a note about it. The candidate stays in the list without a score.
7. **AI note:** Every Candidate Detail page shows: "AI suggestions are advice only — you make the decision."
8. **Shortlist / Reject:** Clicking either updates the pipeline status (Feature 06), and the candidate sees the new status.
9. **Candidate Search:**
   - **Where:** A search box in the HR top navigation (on every HR page) and on the Candidates page.
   - **What it matches:** Name or email (`applications.candidate_name` and `candidate_email`), part of a word, not case-sensitive, from 2 characters.
   - **Scope:** All jobs of the HR user's own company only.
   - **Results:** One row per candidate, showing name, job(s) applied to, and the score and status for each job. Clicking a result opens that Candidate Detail page.
   - **With filters:** On the Candidates page, search works together with the existing filters (score, years, skill, status).
   - **No results:** Shows "No candidates found for 'xyz'".
10. **Viewed and new:** The first time HR opens a candidate's detail page, `applications.viewed_at` is set. Applicants whose `viewed_at` is empty count as "new" on the HR Dashboard and job cards (Feature 02).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidates List | Ranked candidates with filters and the anonymised toggle. | "No one has applied yet. Share your job link" or "No candidates match these filters" with "Clear filters" | Skeleton rows; "Screening…" on rows being retried | "Couldn't load candidates" with Retry | Ranked list with match count |
| Candidate Search (top navigation and Candidates page) | Search box and a results list with name, job(s), score and status. | "Search by name or email" placeholder; "No candidates found for 'xyz'" when nothing matches | "Searching…" under the box | "Couldn't search right now, try again"; "Type at least 2 characters" | Matching candidates shown; clicking one opens Candidate Detail |
| Candidate Detail | CV preview, score breakdown, requirements, experience, summary, notes, Shortlist / Reject and the AI note. | "No notes yet" in the notes box | Skeleton of the CV preview and score panel | "Couldn't load this candidate" with Retry; "CV preview has expired" with Reload; "Screening pending" with Retry; "CV could not be read" with "Open original CV" | All details shown; "Note saved", "Candidate shortlisted" or "Candidate rejected" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Filter list | Minimum score, minimum years, skill, status | Filtered ranked list and match count |
| Anonymised view | Turns the toggle on or off | Names hidden or shown in the list |
| Retry screening | Clicks "Retry screening" | Runs Feature 04; row updates with a score or stays Pending |
| Open candidate | Clicks a row | Candidate Detail with a fresh signed CV link; `viewed_at` set on the first open |
| Add note | Note text | Note saved with author and time |
| Review an unreadable CV | Opens the original CV and adds a note | Note saved; the candidate stays in the list without a score |
| Shortlist / Reject | Clicks the button (Reject asks to confirm) | Pipeline status updated |
| Search candidates | Name or email (2+ characters) | Matching candidates from the company's jobs, with job(s), score and status |

## Data Used

- **`applications`** (Feature 03): status, screening status, `candidate_name`, `candidate_email` and `viewed_at`.
- **`screenings`** (Feature 04): score, rubric breakdown, match percentages, requirements result, experience items, relevant years, degree match, degree found and summary.
- **`notes`** (Feature 06): HR notes with `author_name` and time.
- **Storage bucket `cvs`:** The CV preview uses a signed link that expires after a few minutes.
- **How they link:** Applications are joined to their job and screening. Candidate names and emails come from the application, never from `profiles`. Only applications for the HR user's company jobs are read.

## Business Rules and Permissions

- HR sees only candidates who applied to their own company's jobs.
- HR reads candidate names and emails only from `applications`, never from `profiles`.
- Notes cannot be edited or deleted in this version.
- Ranking is by score from high to low. Ties are broken by match percentage, then by earliest applied date.
- Pending and failed screenings always sit at the bottom.
- AI never shortlists or rejects. Every status change is a click by HR.
- CV links are signed and short-lived. The bucket is never public.
- Candidates cannot open this page.
- Row Level Security enforces company limits in the database.
- Candidate Search only returns candidates who applied to the HR user's own company's jobs, never candidates from other companies.
- Candidates cannot use Candidate Search.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| No candidates yet | "No one has applied yet. Share your job link" | Shows the job link with "Copy link". |
| Filters return nothing | "No candidates match these filters" | Shows a "Clear filters" button. |
| CV preview link expired | "CV preview has expired" | Offers Reload, which creates a new signed link. |
| Another company's candidate URL | "You don't have access to this page" | Shows no candidate data. |
| Screening still pending | "Screening pending" | Shows "Retry screening"; the rest of the page still works. |
| Network or server failure | "Something went wrong, please try again" | Keeps filters and typed notes; never shows a raw error. |
| Search finds nothing | "No candidates found for 'xyz'" | Shows a "Clear search" button. |
| Search text too short | "Type at least 2 characters" | Does not search yet. |
| Search for a name that only exists at another company | "No candidates found for 'xyz'" | Returns nothing from other companies. |
| Search fails | "Couldn't search right now, try again" | Keeps the search text. |

## Acceptance Criteria

- [ ] Candidates are listed by score from high to low with all the listed columns.
- [ ] The anonymised view hides names in the list.
- [ ] Filters for score, years, skill and status work together and show a match count.
- [ ] Pending and failed screenings appear at the bottom with a badge and "Retry screening".
- [ ] Candidate Detail shows the CV preview, score breakdown with reasons, requirements with evidence, counted experience, summary and notes.
- [ ] The "AI suggestions are advice only" note is on every Candidate Detail page.
- [ ] Shortlist and Reject update the pipeline status.
- [ ] HR only sees their own company's candidates.
- [ ] HR can search by name or email from the top navigation and the Candidates page, across all of their company's jobs.
- [ ] Search results show name, job(s), score and status, and open Candidate Detail.
- [ ] Search works together with the existing filters.
- [ ] Search shows "No candidates found for …" when empty and never returns other companies' candidates.
- [ ] The list and detail page show the degree found next to the degree match.
- [ ] Opening a candidate for the first time sets `viewed_at`, and they no longer count as new.

## Test Cases

- Given 23 candidates have applied, when Sara opens the Candidates List, then Ayesha (88), Ali (74) and Usman (61) appear in that order with their match percentage, years, degree found and degree match.
- Given 23 candidates have applied, when Sara sets the minimum score to 95, then she sees "No candidates match these filters" and a "Clear filters" button.
- Given Ali's screening is pending, when Sara opens the list, then Ali is at the bottom with a "Pending" badge and filtering and opening other candidates still works.
- Given Sara opened Ali's detail page a while ago, when the CV preview link has expired, then she sees "CV preview has expired" and Reload shows the CV again.
- Given another company has candidates, when Sara opens the URL of one of their candidates, then she sees "You don't have access to this page" and no data.
- Given Sara is on Ali's detail page, when she adds a note and clicks Shortlist, then the note is saved with her name and time and Ali's status becomes Shortlisted.
- Given Ali applied to two ABC Tech jobs, when Sara types "ali" in the top navigation search, then Ali appears once with both jobs and their scores and statuses, and clicking a job opens his Candidate Detail page.
- Given Sara has set the minimum score to 70 on the Candidates page, when she searches "usman", then she sees "No candidates found for 'usman'" because Usman's score is 61.
- Given a candidate named Bilal applied only to another company, when Sara searches "bilal", then she sees "No candidates found for 'bilal'".
- Given Sara has never opened Ali's application for Junior Web Developer, when she opens his Candidate Detail page, then `viewed_at` is set and the ABC Tech job card shows one fewer new applicant.
- Given Ali's CV lists "BS IT" and the job needs BS Computer Science, when Sara opens the Candidates List, then Ali's row shows "BS IT ✗".

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles), Feature 02 (Job Posting), Feature 03 (Candidate Apply Portal) and Feature 04 (CV Screening).
- **Depended on by:** Feature 06 (Hiring Pipeline).

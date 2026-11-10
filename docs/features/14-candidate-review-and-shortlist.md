# Feature 14 · Candidate Review and Shortlist

## Description

HR opens a candidate to see the CV next to the full AI breakdown and the evidence behind it, adds notes, then shortlists or rejects. AI only advises. HR always decides.

## User Stories

- As an **HR user**, I want to see the evidence behind each score, so that I can check the AI's work before I decide.
- As an **HR user**, I want to add notes and shortlist or reject from the same page, so that I can review quickly.

## Functional Requirements

1. **Candidate Detail:**
   - CV preview using a short-lived signed link to the private file
   - Score breakdown with the reason for each rubric part
   - Requirements found with evidence, and requirements missing
   - Experience list showing which items were counted and how (full, half or not counted)
   - Degree found and degree match
   - AI summary
   - HR notes
   - Interview feedback, when there is any (Feature 17)
   - Shortlist and Reject buttons
2. **AI note:** Every Candidate Detail page shows: "AI suggestions are advice only — you make the decision."
3. **Shortlist / Reject:** Clicking either updates the pipeline status (Feature 15), and the candidate sees the new status. Reject asks to confirm, with the line "This is final and can't be changed later." For a Hired or Rejected candidate, Shortlist and Reject are hidden; notes, interview feedback and the CV stay available.
4. **Notes:** HR can add notes to any candidate. Each note shows the author's name (saved as `author_name` when the note is written) and time. Notes cannot be edited or deleted in this version.
5. **Viewed and new:** The first time HR opens a candidate's detail page, `applications.viewed_at` is set. Applicants whose `viewed_at` is empty count as "new" on the HR Dashboard and job cards (Feature 02).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidate Detail | CV preview, score breakdown, requirements, experience, summary, notes, Shortlist / Reject and the AI note. | "No notes yet" in the notes box | Skeleton of the CV preview and score panel | "Couldn't load this candidate" with Retry; "CV preview has expired" with Reload; "Screening pending" with Retry; "CV could not be read" with "Open original CV" | All details shown; "Note saved", "Candidate shortlisted" or "Candidate rejected" |
| Notes panel | Notes with author and time. | "No notes yet" | Skeleton list | "Couldn't save note, try again" | "Note saved" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Open candidate | Clicks a row on the Candidates List or a search result | Candidate Detail with a fresh signed CV link; `viewed_at` set on the first open |
| Add note | Note text | Note saved with author and time |
| Shortlist / Reject | Clicks the button (Reject asks to confirm) | Pipeline status updated |

## Data Used

- **`applications`** (Feature 08): status, `candidate_name`, `candidate_email` and `viewed_at` (set the first time HR opens the candidate detail page; empty means "new").
- **`screenings`** (Feature 11): score, rubric breakdown, match percentages, requirements result, experience items, relevant years, degree match, degree found and summary.
- **`notes` table:**
  - `id`
  - `application_id`
  - `author_id`
  - `author_name`: the HR user's name, saved when the note is written
  - `body`
  - `is_manual_review`: true when HR reviewed an unreadable CV by hand (Feature 11)
  - `created_at`
- **Storage bucket `cvs`:** The CV preview uses a signed link that expires after a few minutes.
- **How they link:** `notes.application_id` points to `applications.id`, and `author_id` points to `profiles.id`. Candidate names and emails come from the application, never from `profiles`.

## Business Rules and Permissions

- HR sees only candidates who applied to their own company's jobs.
- Notes cannot be edited or deleted in this version.
- AI never shortlists or rejects. Every status change is a click by HR.
- Hired and Rejected are final; their status never changes (Feature 15).
- CV links are signed and short-lived. The bucket is never public.
- Candidates never see notes (Feature 09) and cannot open this page.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| CV preview link expired | "CV preview has expired" | Offers Reload, which creates a new signed link. |
| Another company's candidate URL | "You don't have access to this page" | Shows no candidate data. |
| Screening still pending | "Screening pending" | Shows "Retry screening" (Feature 11); the rest of the page still works. |
| Empty note | "Note can't be empty" | Does not save. |
| Network or server failure | "Something went wrong, please try again" | Keeps typed notes; never shows a raw error. |

## Acceptance Criteria

- [ ] Candidate Detail shows the CV preview, score breakdown with reasons, requirements with evidence, counted experience, degree found and match, summary and notes.
- [ ] The "AI suggestions are advice only" note is on every Candidate Detail page.
- [ ] Shortlist and Reject update the pipeline status, and are hidden for a Hired or Rejected candidate.
- [ ] HR can add notes with author and time.
- [ ] Opening a candidate for the first time sets `viewed_at`, and they no longer count as new.

## User Flows

- Flow 14 · HR reviews a candidate and shortlists or rejects

## Test Cases

- Given Sara opened Ali's detail page a while ago, when the CV preview link has expired, then she sees "CV preview has expired" and Reload shows the CV again.
- Given another company has candidates, when Sara opens the URL of one of their candidates, then she sees "You don't have access to this page" and no data.
- Given Sara is on Ali's detail page, when she adds a note and clicks Shortlist, then the note is saved with her name and time and Ali's status becomes Shortlisted.
- Given Sara has never opened Ali's application for Junior Web Developer, when she opens his Candidate Detail page, then `viewed_at` is set and the ABC Tech job card shows one fewer new applicant.
- Given 5 people have applied to Junior Web Developer and Sara has opened none of them, when she opens Ali's candidate detail page and goes back to the dashboard, then the job card shows 5 applicants and 4 new.

## Dependencies

- **Depends on:** Feature 11 (AI CV Screening and Retry) and Feature 12 (Ranked Candidates List).
- **Depended on by:** Feature 15 (Hiring Pipeline).

## Done When

- [x] Candidate Detail shows the CV preview, score breakdown with reasons, requirements with evidence, experience, degree and summary.
- [x] The note "AI suggestions are advice only — you make the decision" is shown.
- [x] A note saves with Sara's name and time, and Shortlist changes Ali's status to Shortlisted.
- [x] Opening a candidate for the first time lowers the job card's new applicant count by one.
- [x] An expired CV preview shows "CV preview has expired", and Reload shows the CV again.
- [x] Privacy: another company's candidate URL shows "You don't have access to this page".
- [x] A Rejected candidate has no Shortlist or Reject button; notes and the CV stay available.

# Feature 16 · Retry Screening

## Description

HR retries a screening that is Pending, or reviews by hand a CV that could not be read.

## User Stories

- As an **HR user**, I want to retry a failed screening, so that every candidate has an up-to-date result.

## Functional Requirements

1. **Pending and failed rows:** Candidates whose screening is `pending` or `failed` appear at the bottom of the Candidates List (Feature 17) with a badge.
2. **Retry screening:** Pending rows have a "Retry screening" button. It runs Feature 15 again and shows "Screening…" on that row only. Repeat clicks are ignored while it runs.
3. **Failed rows:** Show "CV could not be read".
4. **Manual review:** For a candidate whose CV could not be read, HR can open the original CV and add a note about it (saved with `is_manual_review` true). The candidate stays in the list without a score.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidates List (retry) | "Pending" badge with "Retry screening", or "CV could not be read". | N/A | "Screening…" on the retried row only | "AI is still unavailable, try again in a few minutes"; "Screening is already in progress" | Score shown and the candidate placed in the ranking |
| Candidate Detail (unreadable CV) | "Open original CV" and the notes box. | N/A | Skeleton of the CV preview | "CV could not be read" with "Open original CV" | Original CV shown and the note saved |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Retry screening | Clicks "Retry screening" on one candidate | Runs Feature 15; new result, or still `pending` with a message |
| Review an unreadable CV | Opens the original CV and adds a note | Note saved; the candidate stays in the list without a score |

## Data Used

- **`applications.screening_status`** (Feature 12) and **`screenings.error_message`** (Feature 15).
- **`notes.is_manual_review`** (notes table in Feature 19): true when HR reviewed an unreadable CV by hand.

## Business Rules and Permissions

- Only HR of the job's company can start a retry.
- A failed or pending screening never blocks the rest of the candidates list.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Retry clicked while screening is running | "Screening is already in progress" | Ignores the repeat click. |
| AI still unavailable after retry | "AI is still unavailable, try again in a few minutes" | Keeps the candidate `pending`. |
| Scanned or damaged PDF | "CV could not be read" | Offers "Open original CV" for manual review. |

## Acceptance Criteria

- [ ] Pending and failed screenings appear at the bottom with a badge and "Retry screening".
- [ ] Retry screening works.
- [ ] HR can open an unreadable CV and add a manual review note.

## User Flows

- Flow 16 · HR retries a failed or pending screening

## Test Cases

- Given Usman uploaded a scanned PDF with no text, when screening runs, then his status is "CV could not be read" and Sara can open the original CV.
- Given Bilal is "Pending" and AI is working again, when Sara clicks "Retry screening", then Bilal gets a score and appears in the right place in the ranking.
- Given AI is still unavailable, when Sara clicks "Retry screening", then Bilal stays "Pending" and she sees "AI is still unavailable, try again in a few minutes".

## Dependencies

- **Depends on:** Feature 15 (AI CV Screening) and Feature 17 (Ranked Candidates List).
- **Depended on by:** None.

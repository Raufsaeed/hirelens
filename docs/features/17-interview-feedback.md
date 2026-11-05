# Feature 17 · Interview Feedback

## Description

After an interview, HR records a rating, strengths, concerns and a recommendation. Feedback is visible only to HR.

## User Stories

- As an **HR user**, I want to record a rating and feedback after each interview, so that I can make and explain my decision.

## Functional Requirements

1. **Feedback form:** After the interview, HR fills in:
   - Rating from 1 to 5
   - Strengths
   - Concerns
   - Recommendation: Offer, Reject or Another round
2. **Save:** Saving creates the interview's feedback record (one per interview) and marks the interview as done. The feedback is shown on the Candidate Detail page (Feature 14), visible only to HR.
3. **Advice only:** The recommendation is a note for HR. The candidate's status only changes when HR moves them on the Pipeline Board (Feature 15).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Interview Feedback | Rating, strengths, concerns and recommendation. | Blank form | Save button spinner | "Please add a rating and a recommendation" | "Feedback saved"; interview marked done |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| Feedback | Rating 1–5, strengths, concerns, recommendation | Feedback saved; interview `done` |

## Data Used

- **`interview_feedback` table:**
  - `id`
  - `interview_id` (unique: one feedback record per interview)
  - `rating`
  - `strengths`
  - `concerns`
  - `recommendation`: `offer`, `reject` or `another_round`
  - `created_by`
  - `created_at`
- **`interviews.status`** (Feature 16): set to `done`.
- **How they link:** `interview_feedback.interview_id` points to `interviews.id`, and `created_by` points to `profiles.id`.

## Business Rules and Permissions

- Only HR of the job's company can read or write `interview_feedback`.
- Rating must be a whole number from 1 to 5.
- Candidates can never read `interview_feedback`, so they never see rating, strengths, concerns or recommendation.
- The recommendation never changes the pipeline status by itself.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Feedback missing rating or recommendation | "Please add a rating and a recommendation" | Does not save. |
| Network or server failure | "Something went wrong, please try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can save feedback with a rating, strengths, concerns and recommendation.
- [ ] Candidates never see feedback.

## User Flows

- Flow 17 · HR records interview feedback

## Test Cases

- Given Ali's interview is over, when Sara saves a rating of 4 with strengths, concerns and "Offer", then the interview is marked done, Ali's status does not change until Sara moves him, and Ali sees none of the feedback.
- Given Sara is on the feedback form, when she clicks Save without a rating, then she sees "Please add a rating and a recommendation" and nothing is saved.

## Dependencies

- **Depends on:** Feature 16 (Interview Scheduling).
- **Depended on by:** None.

## Done When

- [x] Sara saves a rating, strengths, concerns and a recommendation, and the interview is marked done.
- [x] The feedback shows on Ali's Candidate Detail page.
- [x] Saving "Offer" does not change Ali's status until Sara moves him.
- [x] Saving without a rating shows "Please add a rating and a recommendation".
- [x] Privacy: Ali never sees the rating, strengths, concerns or recommendation.

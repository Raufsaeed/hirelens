# Feature 06 · Edit Job and Re-screen

## Description

HR edits a job. If the requirements change after people have applied, HR is warned and can re-screen every candidate against the new requirements.

## User Stories

- As an **HR user**, I want to edit a job, so that the job stays correct as needs change.
- As an **HR user**, I want to re-screen after changing requirements, so that every candidate has an up-to-date result.

## Functional Requirements

1. **Edit job:** HR can change any field. The form opens filled in with the current details, including Apply by. The publishing rules from Feature 05 apply when saving.
2. **Re-screen warning:** If requirements change after candidates have applied, the app warns that existing candidates were screened against the old requirements and offers "Re-screen candidates" or "Not now". "Not now" saves the job and keeps the old scores.
3. **Re-screen candidates:** Runs the screening from Feature 15 again for every candidate of that job, with the new requirements. Each new result replaces the old one. Progress is shown while it runs.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Edit Job | The job form filled in with the current details, including Apply by. | N/A | Skeleton form, then Save spinner | Field errors; "Apply by date can't be in the past"; "Couldn't save, try again"; re-screen warning when requirements changed | "Job updated" |
| Re-screen progress (Edit Job and Candidates List) | Progress while re-screening after a requirements change. | N/A | "Re-screening 5 of 23…" | "3 candidates could not be screened and are Pending" | "All candidates re-screened" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Edit Job | Changed fields | Job updated; re-screen warning if requirements changed after people applied |
| Re-screen candidates | Clicks "Re-screen candidates" after editing requirements | Every candidate for that job screened again with the new requirements |

## Data Used

- **`jobs`** (Feature 05): the edited fields and `updated_at`.
- **`screenings`** (Feature 15): one row per application, replaced on re-screen.

## Business Rules and Permissions

- Only HR of the job's company can edit a job or start a re-screen.
- A re-screen replaces the old result for each application.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Missing required fields | "This field is required" under each empty field | Highlights the fields and does not save. |
| Editing requirements after people applied | "23 candidates were screened against the old requirements. Re-screen them now?" | Saves the job; offers "Re-screen candidates" or "Not now". |
| Some candidates fail during re-screen | "3 candidates could not be screened and are Pending" | Saves the results that worked; marks the rest `pending` (Feature 16). |
| Network failure while saving | "Couldn't save, try again" | Keeps everything HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can edit any field of a job.
- [ ] Editing requirements after people have applied shows the re-screen warning.
- [ ] "Re-screen candidates" screens every candidate again with the new requirements.

## User Flows

- Flow 6 · HR edits a job and re-screens candidates

## Test Cases

- Given Sara is editing the job, when she clears the title and clicks Save, then the job is not saved and the title field shows "This field is required".
- Given 23 candidates have applied, when Sara adds "TypeScript" to the requirements and saves, then she sees the warning that candidates were screened against the old requirements and the "Re-screen candidates" option.
- Given Sara adds "TypeScript" to the requirements and clicks "Re-screen", when re-screening finishes, then each candidate's found and missing requirements include TypeScript and scores are updated.

## Dependencies

- **Depends on:** Feature 05 (Post a Job) and Feature 15 (AI CV Screening).
- **Depended on by:** None.

## Done When

- [ ] Sara edits a job, saves it and sees "Job updated".
- [ ] Changing requirements after people applied shows the re-screen warning with "Re-screen candidates" and "Not now".
- [ ] "Re-screen candidates" shows progress and updates every candidate's found and missing requirements and score.
- [ ] Clearing the title shows "This field is required" and the job is not saved.
- [ ] If some candidates fail, "3 candidates could not be screened and are Pending" shows and the other results are saved.

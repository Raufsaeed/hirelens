# Feature 11 · AI CV Screening and Retry

## Description

Each candidate's PDF CV is checked against the job using Google Gemini. AI only reads and judges: it marks each requirement found or missing with evidence, gives rubric marks, lists experience and writes a short summary. Code then calculates the score, match percentage and experience years, so results stay consistent and explainable. AI never decides who is hired or rejected. HR can retry a screening that is Pending, or review by hand a CV that could not be read.

## User Stories

- As an **HR user**, I want every CV screened automatically against my job, so that I don't have to read hundreds of CVs by hand.
- As an **HR user**, I want to see evidence from the CV for each requirement, so that I can trust and check the result.
- As an **HR user**, I want skills matched by meaning, so that "ReactJS" counts as React and good candidates aren't missed.
- As an **HR user**, I want to retry a failed screening, so that every candidate has an up-to-date result.
- As a **candidate**, I want my personal details kept away from AI, so that I'm judged only on my skills, experience and education.

## Functional Requirements

1. **When it runs:**
   - Automatically after each application (Feature 08).
   - When HR clicks "Retry screening".
   - When HR clicks "Re-screen candidates" after editing requirements (Feature 03).
2. **Status updates:** Screening status moves from `queued` to `processing` to `done`, or to `pending` or `failed`.
3. **Extract text:** Text is read from the PDF with pdf-parse.
4. **Unreadable CV:** If there is almost no text (fewer than 200 characters), the status becomes `failed` with "CV could not be read" so HR can review the CV by hand.
5. **Remove personal details:** Before anything goes to AI, the code removes name, email, phone, links to photos and addresses. The cleaned text is saved for later use, for example by Feature 18.
6. **Send to Gemini:** The cleaned CV text and the job (title, required years, degree, requirements with must/nice) are sent using four separate prompts (see AI Details).
7. **Code calculates:**
   - The total score out of 100
   - Match percentage, plus must-have and nice-to-have matches shown separately
   - Relevant experience years
   - Whether the required years are met
   - Whether the degree matches
8. **Save:** A `screenings` row is created on the first attempt. When screening works, all results are saved and the screening status becomes `done`. While it is `pending` or `failed`, the score and results stay empty and `error_message` holds the reason.
9. **Re-screening:** Running it again replaces the old result for that application.
10. **Timing:** A screening should finish within about 30 seconds.
11. **Pending and failed rows:** Candidates whose screening is `pending` or `failed` appear at the bottom of the Candidates List (Feature 12) with a badge.
12. **Retry screening:** Pending rows have a "Retry screening" button. It runs the screening again and shows "Screening…" on that row only. Repeat clicks are ignored while it runs.
13. **Failed rows:** Show "CV could not be read".
14. **Manual review:** For a candidate whose CV could not be read, HR can open the original CV and add a note about it (saved with `is_manual_review` true). The candidate stays in the list without a score.

## Screens

Screening runs in the background. HR sees its results on Features 12 and 14.

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Candidates List (screening badge and retry) | Each candidate's screening status next to their name; "Pending" badge with "Retry screening", or "CV could not be read". | N/A | "Queued" or "Screening…" badge; "Screening…" on the retried row only | "Pending" with "Retry screening"; "CV could not be read"; "AI is still unavailable, try again in a few minutes"; "Screening is already in progress" | Score and match percentage shown, and the candidate placed in the ranking |
| Candidate Detail (screening panel) | Score breakdown, requirements found and missing, experience items, summary; "Open original CV" and the notes box for an unreadable CV. | N/A | "Screening in progress" with a spinner; skeleton of the score panel | "Screening pending" with Retry; "CV could not be read" with "Open original CV" | Full screening results shown; or the original CV shown and the note saved |

## Input / Output

| Action | Input | Output |
|--------|-------|--------|
| Screen a CV | Application ID (CV file and job details are read from the database) | Screening result saved and status `done`, `pending` or `failed` |
| Retry screening | HR clicks "Retry screening" on one candidate | New result, or still `pending` with a message |
| Review an unreadable CV | HR opens the original CV and adds a note | Note saved; the candidate stays in the list without a score |

## Data Used

- **`screenings` table:**
  - `id`
  - `application_id`
  - `score`
  - `rubric_breakdown`
  - `match_percent`
  - `must_have_match`
  - `nice_to_have_match`
  - `requirements_result`
  - `experience_items`
  - `relevant_years`
  - `meets_required_years`
  - `degree_match`
  - `degree_found`: the degree found in the CV, from the AI's education result, for example "BS IT"
  - `summary`
  - `cv_text_clean`: the CV text with personal details removed
  - `model_name`
  - `screened_at`
  - `error_message`
- **`applications.screening_status`** (Feature 08) is updated as screening runs.
- **`jobs`** (Feature 02) gives title, required years, degree and requirements.
- **`notes.is_manual_review`** (notes table in Feature 14): true when HR reviewed an unreadable CV by hand.
- **How they link:** `screenings.application_id` points to `applications.id`. There is one screening row per application, created on the first attempt and replaced on re-screen.

## AI Details

**Prompt files** (in `prompts/`):

| File | What the AI does |
|------|------------------|
| `cv-screening.txt` | Gives a mark for each rubric part with a one-line reason. |
| `job-requirements.txt` | Marks each requirement found or missing, with a short evidence quote from the CV. Matches by meaning, for example ReactJS = React and GitHub = Git. |
| `experience.txt` | Lists every job, internship and project with start, end (or "present"), type and whether it is relevant. Does not calculate totals. |
| `candidate-summary.txt` | Writes a neutral three-line summary. |

**What is sent to the AI:**

- The cleaned CV text. Name, email, phone, photo links and addresses are removed first.
- The job's title, required years, required degree, and requirements with must/nice.
- Nothing else: no candidate name, no company data, no cover note.

**Rubric (total 100):**

| Part | Max marks |
|------|-----------|
| Skills match | 35 |
| Experience | 40 |
| Education | 10 |
| Structure and formatting | 5 |
| Contact info, summary and links | 5 |
| Grammar and clarity | 5 |

**Example JSON the AI must return**

`cv-screening.txt`:

```json
{
  "rubric": [
    { "part": "skills_match", "marks": 28, "reason": "Strong HTML, CSS, React and Git; no REST API work shown." },
    { "part": "experience", "marks": 28, "reason": "About one year of relevant front-end work including an internship." },
    { "part": "education", "marks": 10, "reason": "BS Computer Science matches the required degree." },
    { "part": "structure_formatting", "marks": 3, "reason": "Clear sections but long paragraphs in the projects part." },
    { "part": "contact_summary_links", "marks": 3, "reason": "Has a summary and GitHub link; no portfolio link." },
    { "part": "grammar_clarity", "marks": 2, "reason": "Several spelling and tense mistakes." }
  ]
}
```

`job-requirements.txt`:

```json
{
  "requirements": [
    { "name": "HTML", "type": "must", "found": true, "evidence": "Built responsive pages with HTML5 and CSS3" },
    { "name": "CSS", "type": "must", "found": true, "evidence": "Built responsive pages with HTML5 and CSS3" },
    { "name": "React", "type": "must", "found": true, "evidence": "Developed dashboard components in ReactJS" },
    { "name": "Git", "type": "must", "found": true, "evidence": "Managed code on GitHub with pull requests" },
    { "name": "REST APIs", "type": "nice", "found": false, "evidence": "" }
  ]
}
```

`experience.txt`:

```json
{
  "experience": [
    { "title": "Frontend Developer Intern", "type": "internship", "start": "2025-03", "end": "2025-08", "relevant": true },
    { "title": "Junior Frontend Developer", "type": "job", "start": "2025-11", "end": "present", "relevant": true },
    { "title": "Final year project: Hostel booking site", "type": "project", "start": "2024-09", "end": "2025-06", "relevant": true }
  ],
  "education": [
    { "degree": "BS Computer Science", "end": "2025-06" }
  ]
}
```

`candidate-summary.txt`:

```json
{
  "summary": [
    "Junior front-end developer with about one year of React experience.",
    "Has built responsive pages and dashboards and uses Git daily.",
    "No REST API experience is shown in the CV."
  ]
}
```

**What the code calculates after the response:**

- **Score:** Each rubric mark is checked to be between 0 and its maximum, then the marks are added to make a total out of 100. In the example, 28 + 28 + 10 + 3 + 3 + 2 = **74**.
- **Match percentage:** Requirements found ÷ total requirements. In the example, 4 ÷ 5 = **80%**.
  - Must-have: 4 ÷ 4 = 100%.
  - Nice-to-have: 0 ÷ 1 = 0%.
- **Relevant years:**
  - Only relevant items count.
  - Jobs count in full, internships count half, and projects do not count.
  - "Present" means today, and overlapping months are counted once.
  - In the example, 6 months of internship counts as 3 months. Nov 2025 to today counts in full. The total is about **1.2 years**.
- **Meets required years:** Relevant years ≥ the job's required years (1.2 ≥ 1 → yes).
- **Degree match:** Whether the degree the AI found is the same as, or equivalent to, the required degree (BS Computer Science → yes). The degree found is saved as `degree_found`.

**Temperature:** 0.

**If the AI fails or returns bad JSON:**

- The JSON is checked in code against the fixed format (field names, types, mark limits, every job requirement present).
- If the call fails or the JSON is invalid, the code retries once automatically.
- If it fails again, screening status becomes `pending`, `error_message` is saved, and HR sees "Retry screening".
- A raw AI error is never shown to anyone.

**AI limits:**

- AI judges only skills, experience and education, never gender, age, religion, city or name.
- AI must not invent skills or experience that are not in the CV. Every "found" requirement needs an evidence quote.
- AI never decides hire or reject.

## Business Rules and Permissions

These AI rules also apply to Features 05 and 18.

- AI runs only on the server. The Gemini key is never sent to the browser.
- Personal details are always removed before any CV text is sent to AI.
- Right before screening (including Retry and Re-screen), the stored CV is checked again for hidden text and prompt injection (see "Prompt injection" in AGENTS.md), because a stored file can be swapped after upload. A refused CV is never sent to AI.
- The manual review note is checked for prompt injection like any HR note (Feature 14).
- All totals, percentages, years and rankings are calculated in code, never by AI.
- Prompts live only in `prompts/` as `.txt` files.
- Only HR of the job's company can see screening results or start a retry.
- Candidates never see screening results (Feature 09).
- A failed or pending screening never blocks the application or the rest of the candidates list.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Scanned PDF or almost no text | "CV could not be read" (HR only) | Sets status `failed`; HR can open the original CV and review it by hand. |
| PDF is damaged or can't be opened | "CV could not be read" (HR only) | Sets status `failed` and saves the error message. |
| Stored CV has hidden text or prompt injection | "CV could not be read" (HR only) | Sets status `failed` without calling AI and saves the error message; HR can open the original CV and review it by hand. |
| Manual review note contains prompt injection | "This text contains content that isn't allowed. Please remove it and try again." | Does not save the note. |
| Gemini unavailable or times out | "Screening pending" with "Retry screening" (HR only) | Retries once, then sets status `pending`. |
| Invalid JSON from AI | "Screening pending" with "Retry screening" (HR only) | Retries once, then sets status `pending`; saves the error message. |
| Retry clicked while screening is running | "Screening is already in progress" | Ignores the repeat click. |
| AI still unavailable after retry | "AI is still unavailable, try again in a few minutes" | Keeps the candidate `pending`. |

## Acceptance Criteria

- [ ] Every new application is screened automatically, usually within about 30 seconds.
- [ ] Name, email, phone, photo links and addresses are removed before text is sent to AI.
- [ ] Each requirement is marked found or missing, with an evidence quote for found ones.
- [ ] Skills are matched by meaning (ReactJS = React, GitHub = Git).
- [ ] Score, match percentage (with must and nice separately), relevant years, required years met and degree match are calculated in code.
- [ ] The same CV screened twice gets a similar score.
- [ ] Scanned PDFs are marked "CV could not be read".
- [ ] AI failure or invalid JSON leads to one automatic retry, then `pending` with "Retry screening".
- [ ] Pending and failed screenings appear at the bottom with a badge and "Retry screening".
- [ ] Retry screening works.
- [ ] HR can open an unreadable CV and add a manual review note.
- [ ] Candidates never see any screening result.

## User Flows

- Flow 11 · System screens a CV with AI and HR retries a failed screening

## Test Cases

- Given Ali's CV has been screened once with a score of 74, when the same CV is screened again for the same job, then the new score is within a few points of 74.
- Given Google Gemini is unavailable, when Ali's application is screened, then the code retries once, the screening status becomes `pending`, and Sara sees "Retry screening".
- Given Gemini returns text that is not valid JSON, when the code checks the response, then it retries once, then marks the screening `pending` and saves the error message.
- Given Ali's CV says "ReactJS" and the job requires "React", when screening runs, then React is marked found with the evidence "Developed dashboard components in ReactJS".
- Given Ali's CV contains his name, email and phone number, when the text is sent to Gemini, then none of those details are in the text that was sent.
- Given Hira uploaded a scanned PDF with no text, when screening runs, then her status is "CV could not be read" and Sara can open the original CV.
- Given Bilal is "Pending" and AI is working again, when Sara clicks "Retry screening", then Bilal gets a score and appears in the right place in the ranking.
- Given AI is still unavailable, when Sara clicks "Retry screening", then Bilal stays "Pending" and she sees "AI is still unavailable, try again in a few minutes".

## Dependencies

- **Depends on:** Feature 02 (Post a Job) and Feature 08 (Apply with CV).
- **Depended on by:** Feature 03 (Edit Job and Re-screen), Feature 12 (Ranked Candidates List), Feature 14 (Candidate Review and Shortlist), Feature 18 (AI Interview Questions) and Feature 19 (Reports).

## Done When

- [x] A new application is screened within about 30 seconds and shows a score and match percentage.
- [x] Each requirement is marked found or missing, with an evidence quote for found ones ("ReactJS" counts as React).
- [x] The same CV screened twice gets a score within a few points.
- [x] If Gemini is unavailable or returns invalid JSON, it retries once, then shows "Pending" with "Retry screening".
- [x] Privacy: name, email and phone are not in the text sent to Gemini.
- [x] Privacy: candidates never see any screening result.
- [x] Pending and failed candidates appear at the bottom of the list with a badge.
- [x] "Retry screening" gives Bilal a score and places him in the ranking once AI works again.
- [x] If AI is still down, Bilal stays "Pending" and Sara sees "AI is still unavailable, try again in a few minutes".
- [x] Hira's scanned CV shows "CV could not be read"; Sara opens the original CV and saves a manual review note.
- [x] A pending screening never blocks the rest of the candidates list.

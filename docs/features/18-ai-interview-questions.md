# Feature 18 · AI Interview Questions

## Description

With one click, AI writes eight interview questions based on the job and the candidate's CV, including at least one about a missing skill. HR can edit the list, and it is saved with the interview.

## User Stories

- As an **HR user**, I want interview questions made for each candidate, so that I can prepare in minutes.
- As an **HR user**, I want at least one question about a missing skill, so that I can check gaps the screening found.
- As an **HR user**, I want a hint about what a good answer includes, so that I can judge answers even outside my expertise.
- As an **HR user**, I want to regenerate, delete or add questions, so that the final list is mine.

## Functional Requirements

1. **Generate:** On the Candidate Detail or Interview page, HR clicks "Generate questions". The candidate must have a scheduled interview (Feature 16). Otherwise the button shows "Schedule an interview first".
2. **What is sent:** The app sends Gemini:
   - The job details
   - The saved CV text with personal details removed (`screenings.cv_text_clean` from Feature 11)
   - The missing requirements from Feature 11

   It uses `prompts/interview-questions.txt`.
3. **What comes back:** Eight questions:
   - Three technical
   - Three behavioural
   - Two about the candidate's own projects

   At least one focuses on a missing skill. Each question has a short "what a good answer includes" hint.
4. **Edit the list:** HR can regenerate the whole list, delete a question or add their own. A question HR adds must have a type: technical, behavioural or project.
5. **Save:** Questions are saved in `interview_questions`, linked to the interview and kept in display order (`position`). HR can open them again later.
6. **Personal matters:** Questions must never ask about age, religion, marital status, family plans, health or other personal matters.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Interview Questions panel (on Candidate Detail or Interview page) | Eight questions grouped by type, each with a hint, plus Regenerate, Delete and "Add question". | "Generate questions" button and no questions yet, or "Schedule an interview first" | "Writing questions…" spinner | "Couldn't generate questions" with Retry | Questions shown and saved; "Question added" or "Question deleted" |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Generate questions | Clicks the button | Eight questions with hints, saved in `interview_questions` for the interview |
| Regenerate | Clicks Regenerate and confirms | A new set of eight replaces the old one (HR's own questions are kept) |
| Delete question | Clicks Delete on a question | Question removed |
| Add question | Question text, type and optional hint | Question added to the list |

## Data Used

- **`jobs`** (Feature 02): title, required years, degree, requirements.
- **`screenings`** (Feature 11): `cv_text_clean` and the missing items from `requirements_result`.
- **`interviews`** (Feature 16): the interview the questions belong to.
- **`interview_questions` table:**
  - `id`
  - `interview_id`
  - `type`: `technical`, `behavioural` or `project` (required, also for HR's own questions)
  - `question`
  - `good_answer_hint`
  - `focus`: optional, the skill or topic the question checks, for example "REST APIs (missing)"
  - `source`: `ai` or `hr`
  - `position`: display order
  - `created_at`
- **How they link:** `interview_questions.interview_id` points to `interviews.id`. The interview points to the application, which points to its job and screening.

## AI Details

**Prompt file:** `prompts/interview-questions.txt`

**What is sent to the AI:**

- Job title, required years, required degree, and requirements with must/nice.
- The cleaned CV text, with name, email, phone, photo links and addresses removed.
- The list of missing requirements, for example `["REST APIs"]`.
- Nothing else: no name, score, notes or cover note.

**Example JSON the AI must return:**

```json
{
  "questions": [
    { "type": "technical", "question": "How do you manage state in a React app with several pages?", "good_answer_hint": "Mentions useState/useContext or a state library and when to use each.", "focus": "React" },
    { "type": "technical", "question": "How would you fetch data from a REST API in React and handle errors?", "good_answer_hint": "Uses fetch or axios in useEffect, shows loading and error states, knows GET vs POST.", "focus": "REST APIs (missing)" },
    { "type": "technical", "question": "Walk me through how you use Git branches in a team.", "good_answer_hint": "Feature branches, pull requests, resolving merge conflicts.", "focus": "Git" },
    { "type": "behavioural", "question": "Tell me about a time you had to learn a new tool quickly.", "good_answer_hint": "Clear situation, steps taken, result and what they learned.", "focus": "Learning" },
    { "type": "behavioural", "question": "Describe a disagreement with a teammate and how you handled it.", "good_answer_hint": "Listens, stays respectful, focuses on the solution.", "focus": "Teamwork" },
    { "type": "behavioural", "question": "How do you handle a deadline you might miss?", "good_answer_hint": "Tells people early, sets priorities, suggests options.", "focus": "Ownership" },
    { "type": "project", "question": "In your hostel booking project, what was the hardest part and how did you solve it?", "good_answer_hint": "Explains a real technical problem and their own part in solving it.", "focus": "Final year project" },
    { "type": "project", "question": "What would you change in the dashboard you built at your current job?", "good_answer_hint": "Can review their own work and suggest real improvements.", "focus": "Dashboard project" }
  ]
}
```

**What the code checks after the response:**

- There are exactly 8 questions: 3 `technical`, 3 `behavioural` and 2 `project`.
- At least one question's `focus` matches a missing requirement (when there are missing requirements).
- Every question has non-empty `question` and `good_answer_hint`.
- No question contains blocked personal topics (age, religion, marital status, family, health and similar). Any that do are removed and the set is regenerated.

**Temperature:** 0.4.

**If the AI fails or returns bad JSON:**

- The code retries once automatically.
- If it fails again, HR sees "Couldn't generate questions" with Retry. Existing saved questions are kept.
- The rest of the page keeps working, and HR can still add questions by hand.
- A raw AI error is never shown.

## Business Rules and Permissions

- Only HR of the job's company can generate, see or edit questions.
- Candidates never see the questions.
- Questions never ask about age, religion, marital status or other personal matters.
- AI only suggests questions. HR decides what to ask and makes every hiring decision.
- The AI rules from Feature 11 apply (personal details removed, server-only key, prompts in `prompts/`).

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| No interview scheduled | "Schedule an interview first" | The Generate button is disabled. |
| Gemini unavailable or times out | "Couldn't generate questions" with Retry | Retries once first; keeps any saved questions. |
| Invalid JSON or wrong number of questions | "Couldn't generate questions" with Retry | Retries once first; never shows a broken list. |
| A question touches a personal topic | N/A (HR never sees it) | Removes it and regenerates the set. |
| Screening not done yet (no CV text) | "Questions need a finished CV screening" | The Generate button is disabled until screening is done. |
| Empty custom question | "Question can't be empty" | Does not add it. |
| Custom question without a type | "Please choose a question type" | Does not add it. |

## Acceptance Criteria

- [ ] "Generate questions" returns eight questions: three technical, three behavioural and two about projects.
- [ ] At least one question is about a missing skill from screening.
- [ ] Every question has a "what a good answer includes" hint.
- [ ] HR can regenerate, delete and add questions (each with a type), and they are saved in `interview_questions` for the interview.
- [ ] No question asks about personal matters.
- [ ] Personal details are never sent to AI.
- [ ] AI failure shows a clear message with Retry, and the page still works.

## User Flows

- Flow 18 · HR generates interview questions with AI

## Test Cases

- Given Ali has an interview scheduled and is missing REST APIs, when Sara clicks "Generate questions", then she sees eight questions, including one about REST APIs, each with a hint.
- Given Google Gemini is unavailable, when Sara clicks "Generate questions", then she sees "Couldn't generate questions" with Retry, and she can still add her own questions.
- Given Sara has generated questions, when she deletes one and adds "Tell me about your GitHub portfolio", then the list is saved with her change and shown again next time.
- Given Sara is adding "Tell me about your GitHub portfolio" for Ali's ABC Tech interview, when she clicks Add without choosing a type, then she sees "Please choose a question type" and the question is not added.
- Given the AI returns a question about marital status, when the code checks the response, then that question is never shown and the set is regenerated.
- Given Ali's CV contains his name and phone number, when the questions request is sent, then neither appears in the text sent to Gemini.

## Dependencies

- **Depends on:** Feature 11 (AI CV Screening and Retry) and Feature 16 (Interview Scheduling).
- **Depended on by:** None.

## Done When

- [ ] "Generate questions" shows eight questions (3 technical, 3 behavioural, 2 project), each with a hint, including one about REST APIs.
- [ ] Sara can delete, add (with a type) and regenerate questions, and the list is saved for next time.
- [ ] Without a scheduled interview, the button shows "Schedule an interview first".
- [ ] If Gemini is unavailable, Sara sees "Couldn't generate questions" with Retry and can still add her own questions.
- [ ] Privacy: Ali's name and phone are not in the text sent to Gemini, and candidates never see the questions.

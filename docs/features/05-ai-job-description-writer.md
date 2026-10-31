# Feature 05 · AI Job Description Writer

## Description

HR enters a title and a few key points, clicks "Write with AI", and gets a draft job description in the form to edit. Nothing is published until HR checks it and clicks Publish.

## User Stories

- As an **HR user**, I want a draft job description from a few points, so that I can post a job quickly.
- As an **HR user**, I want the draft to use only what I entered, so that candidates aren't misled by requirements we don't need.
- As an **HR user**, I want to regenerate the draft, so that I can get a version I like.
- As an **HR user**, I want to edit the draft before publishing, so that the final text is mine.
- As a **candidate**, I want clear, inclusive job descriptions, so that I know what the job needs and feel welcome to apply.

## Functional Requirements

1. **Input:** On the Create Job form (Feature 02), HR enters a title and a few key points, for example "small friendly team, hybrid in Lahore". Requirements already in the form are also used.
2. **Write with AI:** The button works only when there is a title and at least one key point or requirement.
3. **Send:** The app sends the title, key points, requirements, location, job type, years and degree to Gemini using `prompts/jd-writer.txt`.
4. **Draft:** The AI returns a description of about 150–250 words with three sections: About the role, Responsibilities, and What we're looking for.
5. **Suggested requirements:** The AI may suggest extra requirements, each clearly labelled "Suggestion". HR can accept or remove each one. Suggestions are never added without HR accepting them.
6. **Fill the form:** The draft goes into the description box for HR to edit, with the note "Review and edit before publishing".
7. **Regenerate:** HR can get a new draft. If HR has edited the text, the app asks before replacing it.
8. **No auto-publish:** Nothing is published or saved automatically. HR clicks Save as draft or Publish (Feature 02).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Create Job form (Write with AI) | Title, key points, requirements, "Write with AI" and Regenerate buttons, description box and suggested requirements. | "Write with AI" disabled with "Add a title and at least one requirement first" | "Writing description…" spinner in the description box | "Couldn't write a description right now. You can write it yourself or try again" | Draft in the description box with suggestions shown separately |
| Replace draft dialog | "Replace your edited text with a new draft?" with Replace and Cancel. | N/A | N/A | N/A | New draft shown, or the old text kept |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Write with AI | Title, key points (and any requirements already entered) | Draft description in the form plus labelled suggested requirements |
| Accept / remove suggestion | Clicks Accept or Remove on a suggestion | Suggestion added to the requirements, or dropped |
| Regenerate | Clicks Regenerate (confirms if text was edited) | A new draft |
| Edit | Changes the text by hand | HR's text is kept |
| Publish | Clicks Publish | Job published with HR's final text (Feature 02) |

## Data Used

- **Nothing new is stored.** The final description and accepted requirements are saved in `jobs` (Feature 02) only when HR saves or publishes.
- **Inputs read from the form:** title, key points, location, job type, required years, required degree, requirements.

## AI Details

**Prompt file:** `prompts/jd-writer.txt`

**What is sent to the AI:**

- Job title, location, job type, required years, required degree.
- The requirements HR entered, with must/nice.
- HR's key points as typed.
- Nothing about any candidate.

**Example JSON the AI must return:**

```json
{
  "description": {
    "about_the_role": "ABC Tech is looking for a Junior Web Developer to join our small, friendly team in Lahore on a hybrid basis. You will help build and improve the web apps our clients use every day.",
    "responsibilities": [
      "Build responsive pages with HTML, CSS and React.",
      "Connect the front end to our REST APIs.",
      "Use Git to manage code and review pull requests with the team.",
      "Fix bugs and improve page speed and accessibility."
    ],
    "what_we_are_looking_for": [
      "1 year of experience in web development.",
      "BS in Computer Science.",
      "Good knowledge of HTML, CSS, React and Git.",
      "Experience with REST APIs is a plus."
    ]
  },
  "suggested_requirements": [
    { "name": "TypeScript", "type": "nice", "label": "suggestion" }
  ]
}
```

**What the code does after the response:**

- Checks the JSON matches the fixed format.
- Joins the three sections into the description and checks it is roughly 150–250 words.
- Checks the description only mentions requirements HR entered. Anything else must appear only in `suggested_requirements` with the label `suggestion`.
- Shows suggestions separately from the description, each with Accept and Remove.

**Temperature:** 0.7.

**If the AI fails or returns bad JSON:**

- The code retries once automatically.
- If it fails again, HR sees "Couldn't write a description right now. You can write it yourself or try again".
- Anything HR typed is kept, and HR can still write the description by hand and publish.
- A raw AI error is never shown.

**AI limits:**

- The AI must not add requirements HR did not mention, unless clearly labelled as suggestions.
- It must use inclusive, non-discriminatory language: no age, gender, religion, marital status or similar preferences, and no words like "young" or "native speaker".

## Business Rules and Permissions

- Only HR can use "Write with AI", and only for their own company's jobs.
- The AI draft is never published automatically. HR must review and publish.
- Suggested requirements are only added when HR accepts them.
- The Gemini key and prompt rules from Feature 11 apply.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Too little input | "Add a title and at least one requirement first" | Keeps the button disabled. |
| Gemini unavailable or times out | "Couldn't write a description right now. You can write it yourself or try again" | Retries once first; keeps HR's text. |
| Invalid JSON | "Couldn't write a description right now. You can write it yourself or try again" | Retries once first; never shows broken text. |
| Draft mentions a requirement HR didn't give | N/A (HR never sees it) | Retries, so the extra item only appears as a labelled suggestion. |
| Regenerate after editing | "Replace your edited text with a new draft?" | Replaces only if HR confirms. |

## Acceptance Criteria

- [ ] "Write with AI" works only with a title and at least one key point or requirement.
- [ ] The draft has About the role, Responsibilities and What we're looking for, and is about 150–250 words.
- [ ] The draft never adds requirements HR didn't give. Extra ideas show only as labelled suggestions.
- [ ] HR can edit, regenerate (with a warning if edited), and accept or remove suggestions.
- [ ] Nothing is published until HR clicks Publish.
- [ ] AI failure shows a clear message and HR can still write the description.
- [ ] The language is inclusive and non-discriminatory.

## User Flows

- Flow 5 · HR writes a job description with AI

## Test Cases

- Given Sara has entered only the title, when she looks at "Write with AI", then the button is disabled with "Add a title and at least one requirement first".
- Given Google Gemini is unavailable, when Sara clicks "Write with AI", then she sees "Couldn't write a description right now" and can still type the description and publish.
- Given AI has written a draft, when Sara edits it and clicks Publish, then the published job shows her edited text, not the original draft.
- Given Sara entered HTML, CSS, React, Git and REST APIs as requirements, when AI writes the description, then it lists no other skill, degree or experience, and any extra idea (like TypeScript) appears only as a labelled suggestion.
- Given Sara has edited the draft, when she clicks Regenerate, then she is asked "Replace your edited text with a new draft?" and her text stays unless she confirms.

## Dependencies

- **Depends on:** Feature 02 (Post a Job).
- **Depended on by:** None.

## Done When

- [ ] With a title and requirements, "Write with AI" fills the description box with a draft in three sections.
- [ ] Extra ideas appear only as labelled suggestions that Sara can accept or remove.
- [ ] The published job shows Sara's edited text; nothing is published until she clicks Publish.
- [ ] With only a title, the button is disabled with "Add a title and at least one requirement first".
- [ ] If Gemini is unavailable, Sara sees "Couldn't write a description right now" and can still write the description and publish.

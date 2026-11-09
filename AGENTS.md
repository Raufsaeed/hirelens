# AGENTS.md

Rules that every AI coding assistant working on HireLens must follow, every time.

## Project Summary

- HireLens is an AI-powered hiring platform.
- HR posts jobs, and candidates apply with PDF CVs.
- AI screens and ranks the CVs.
- HR always makes the final decision.

## Read Before Working

- Always read these before building anything:
  - `docs/product-brief.md`
  - `docs/user-flow.md`
  - The relevant file in `docs/features/` (there are 23 feature files, `01` to `23`)
  - `docs/database.md` (when it exists)
  - The `design/` folder
- Before building or changing any page or component, read `design/design-guidelines.md` and `design/README.md`, then the matching `design/components/<Name>/README.md` and `preview.html`. The previews show the exact look to copy.

## Workflow Rules

- Do not start building the website until the user clearly says "start building".
- Build one feature at a time, and only the feature the user asks for.
- Before any big change, explain the plan in a few lines first.
- After each feature, explain exactly how to test it in the browser.
- If the user asks to build all features at once, still build them one at a time in the build order. After each feature: give any SQL to run in the Supabase SQL Editor, give a short browser test checklist from that feature's test cases, then STOP and wait for the user to reply "next".
- After the user tests a feature and confirms it works, tick its Done When boxes (- [x]) in its feature file. Never tick a box the user has not tested.
- Never add features that are not in the docs. If something is unclear, ask.
- Keep explanations simple. The user is a student.
- Build order: 01, 02, 04, 07, 08, 09, 10, 11, 12, 03, 13, 14, 15, 06, 22, 05, 16, 17, 18, 19, 20, 21, 23.
  - This order follows feature dependencies, so earlier features must be built and tested first.
- Each feature gets its own branch named after it (for example f01-authentication). Use small commits whose messages say why. When the review is clean, open a PR with What, Why and How I tested it. Merge to main only after the user approves.
  - Features 01 and 02 were built this way. From Feature 04 on, use the group plan below instead.

### Group plan (Features 04 to 23)

- The remaining features are built in 5 groups, in this order:
  - Group 1: 04, 07, 08, 09, 10
  - Group 2: 11, 12, 03, 13
  - Group 3: 14, 15, 06, 22
  - Group 4: 05, 16, 17, 18
  - Group 5: 19, 20, 21, 23
- Each group has one branch named after it (group-1, group-2 and so on). For each group:
  1. Build its features one by one in the order above, with small commits. For each feature: write its Playwright test first, save its SQL in `supabase/sql/` named after the feature, and run lint and build.
  2. When the whole group is built, combine that group's SQL, in order, into one file `supabase/sql/group-1-all.sql` (`group-2-all.sql` and so on), so the user pastes and runs it only once. Then STOP and wait for the user to confirm the SQL ran.
  3. After the user confirms, run all Playwright tests and fix failures. Then run the code-reviewer and fix every BLOCKS MERGE item, and run the review again.
  4. Give the user one short browser test checklist for the whole group, then STOP.
  5. After the user replies "approve", tick the group's Done When boxes, open one PR for the group (What, Why and How I tested it), merge it, update main and start the next group.

## Testing Rules

- Before building each feature, write its Playwright test in `tests/e2e/` from that feature's test cases and Done When list, run it and show that it fails. Then build the feature until the test passes.
- Run all tests, not only the new one, so older features are checked again.
- Show the result as passed and failed counts. If a test fails, fix the code, not the test, unless the test is wrong.
- Tick a Done When box only when its test passes and the user confirms it works in the browser.
- Never write pass or fail results into the feature files.
- Tests use dummy test accounts and data, never real keys in test files.
- Playwright tests never call the real Gemini API. They use saved fake Gemini responses in `tests/e2e/fixtures/` (the development-only `hl_ai_test` cookie, see `lib/ai/test-mode.js`). Keep only one test that calls the real Gemini, and skip it unless the env flag `RUN_REAL_AI` is set (`RUN_REAL_AI=1 npm run test:e2e`).

## Tech Stack

- Next.js (App Router) with JavaScript
- Tailwind CSS
- Supabase: Auth, Postgres, Storage, Row Level Security
- @supabase/ssr (Supabase clients for Next.js)
- Google Gemini API
- pdf-parse
- Recharts
- Resend for emails
- lucide-react (icons)
- framer-motion (animation)
- Playwright (@playwright/test) for end-to-end tests
- server-only (stops server code with secret keys from being imported into browser code)
- Do not switch or add libraries without asking.

## Setup Decisions

- Gemini:
  - Use Google's latest official Gemini SDK (`@google/genai`) with the native Gemini endpoint. Never use the OpenAI-compatible endpoint.
  - Send the key only once. Never check or validate the key by its prefix.
- Supabase uses the new key names:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` holds the Supabase publishable key.
  - `SUPABASE_SERVICE_ROLE_KEY` holds the Supabase secret key.
- Automatic Row Level Security is on in Supabase for every new table in the `public` schema. Every table needs explicit RLS policies, or its data will be blocked.
- A private storage bucket named `cvs` already exists in Supabase. Never create it again, and never create a public bucket for CVs.
- A public storage bucket named `logos` already exists in Supabase and holds company logos. Never create it again.
  - Images only: PNG or JPG, under 2 MB, at `{company_id}/logo.{png or jpg}`.
  - Only HR of that company can upload or replace a logo. Anyone can read it.
  - Never store CVs in `logos`.
- There is no scheduler, because the app runs only on localhost:
  - Whenever a job is read (job lists, job page, apply submit, HR pages), if `apply_by` has passed and the job is still open, the server closes it with `closed_reason` `deadline`.
  - The daily summary email (Feature 23) is sent from a server route that HR triggers with a "Send today's summary" button, for the demo. A real scheduled job is a future step.
- Email confirmation is off in Supabase for development and the demo, so sign up logs the user in straight away. Turning it on is a future step.
- The app runs only on localhost. There is no hosting for now.
- Tables are created only through SQL that you give the user to run in the Supabase SQL Editor. Never assume a table exists.
- Save every SQL file you give the user in supabase/sql/, named after its feature (for example 01-authentication.sql), and commit it with that feature.
- Before writing SQL for a feature, check the SQL already given for earlier features and reuse the same table, column and status names.
- Never create a table that already exists; give `ALTER TABLE` statements to add columns instead.
- After each feature, add the tables and columns it created to `docs/database.md` (create the file if it doesn't exist), so it always shows the current database.

## Folder Structure

- `app/`: pages and API routes
- `components/`: reusable UI
- `lib/`: logic (Supabase clients, Gemini client, PDF text extraction, scoring)
- `lib/email/`: sending emails
- `emails/`: email templates
- `prompts/`: AI prompt text files
- `docs/`: documents
- `design/`: design files
- `tests/e2e/`: Playwright tests, one file per feature (for example 01-authentication.spec.js)
- Keep each feature in its own small files.

## Security Rules

- API keys and secrets go only in `.env.local`. Never hard-code them, print them or use them in frontend code.
- `.env.local` must be in `.gitignore`.
- Never open, read, print or edit `.env.local`. Use `.env.example` for variable names. If a key seems missing or wrong, ask the user to check `.env.local`.
- The Supabase secret / service role key and the Gemini key are used only in server code.
- `RESEND_API_KEY` lives only in `.env.local` and is used only in server code.
- Emails never contain scores, AI results or HR notes.
- Candidate search and company pages never expose another company's private data.
- Every table has Row Level Security.
- HR sees only their own company's jobs and candidates.
- Only draft jobs can be deleted, by HR of that company. Open and closed jobs are never deleted, only closed.
- Candidates see only their own applications, and never their score.
- CVs are stored in a private storage bucket.
- Validate all inputs: PDF only, max 5 MB, required fields filled.
- Passwords must have at least 8 characters, at least one capital letter (A–Z), and at least one special character such as @, #, $ or !. Show the error "Password must be at least 8 characters and include one capital letter and one special character (like @)".

### Environment Variables

- Real keys live only in `.env.local`.
- `.env.example` lists the variable names without values. It is safe to share.
- Keys must never be pasted into chat, code, docs or commits.

## AI Rules

- All prompts live in `prompts/` as `.txt` files, never inside code.
- AI must always return JSON in a fixed format.
- Validate the JSON in code, and handle bad responses.
- Temperature: 0 for screening, at most 0.7 for writing tools.
- AI only extracts and judges. All totals, percentages, experience years and ranking are calculated in code.
- Remove name, email, phone and photo from CV text before sending it to AI.
- AI judges only skills, experience and education, never gender, age, religion, city or name.
- AI must not invent skills or experience that are not in the CV.
- If AI fails, save the application with screening status "Pending" and allow "Retry screening".
- One CV screening uses only one Gemini request, to save the free quota: the four task prompts (`cv-screening.txt`, `job-requirements.txt`, `experience.txt`, `candidate-summary.txt`) are sent together in `prompts/cv-screening-request.txt`, which returns one JSON object with the same parts and formats. The only extra requests are the one automatic retry (failed call or bad JSON) and the 1s, 2s, 4s retries on 429 or network errors that every outside call gets; the Gemini call limit caps them all.
- For every outside API call (Gemini, Supabase, Resend): check the response before using it, on 429 or a failed call wait and retry with 1s, 2s, then 4s, and keep a limit on calls so a bug or loop cannot make many calls.

## Scoring Rules

- Rubric (total 100):

  | Part | Marks |
  |------|-------|
  | Skills match | 35 |
  | Experience | 40 |
  | Education | 10 |
  | Structure and formatting | 5 |
  | Contact info, summary and links | 5 |
  | Grammar and clarity | 5 |

- Match percentage = requirements found ÷ total requirements.
- Experience:
  - Internships count as half.
  - Projects do not count.
  - "Present" means today.

## Design Rules

- `design/design-guidelines.md` and `design/tokens.css` are the single source of truth for the look.
- Colours:
  - Deep purple navigation (`--nav-bg` `#24164F`)
  - Warm cream pages (`--surface-page` `#F3EEE6`)
  - Light cream cards (`--surface` `#FBF8F2`) with warm sand borders (`--border` `#E3DACB`)
  - Deeper cream sunken areas (`--surface-sunken` `#EFE7DA`) and pipeline columns (`--surface-column` `#EAE1D2`)
  - Brand purple `--primary` `#5B3FD9`
  - Teal for found, orange for missing, red for errors
  - Nothing pure white
    - Exception: The landing page How it works section may use pure white.
- Use the tokens as CSS variables mapped into the Tailwind theme. Never hard-code colours, sizes, radius, shadows or durations.
- Use `lucide-react` icons only, as mapped in the icon library (`design/components/IconLibrary/`), with `strokeWidth` 1.75.
- Use `framer-motion` and the motion rules in the guidelines, and support `prefers-reduced-motion`.
- Layout:
  - 248px HR sidebar
  - 56px candidate top bar
  - 44px touch targets
  - No horizontal scroll at 360px
  - WCAG AA contrast
- Never show a score, match percentage, AI summary or HR note on candidate screens or public pages.
  - Exception: the landing hero may show a score and match % on a clearly labelled example card with dummy data only.

## Code Quality

- Simple, readable code with short comments.
- Meaningful names.
- No unused code.
- Friendly error messages. Never show raw errors or blank pages.

## Never Do

- Never commit `.env` files or expose keys.
- Never let AI make the final hire or reject decision.
- Never store CVs in a public bucket.
- Never delete files or data without asking first.
- Never edit files inside `design/` unless the user asks.
- Never overwrite or replace the project README.md; update it only when the user asks.

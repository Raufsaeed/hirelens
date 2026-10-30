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
  - The relevant file in `docs/features/` (there are 15 feature files, `01` to `15`)
  - `docs/database.md` (when it exists)
  - The `design/` folder
- Before building or changing any page or component, read `design/design-guidelines.md` and `design/README.md`, then the matching `design/components/<Name>/README.md` and `preview.html`. The previews show the exact look to copy.

## Workflow Rules

- Do not start building the website until the user clearly says "start building".
- Build one feature at a time, and only the feature the user asks for.
- Before any big change, explain the plan in a few lines first.
- After each feature, explain exactly how to test it in the browser.
- Never add features that are not in the docs. If something is unclear, ask.
- Keep explanations simple. The user is a student.
- Build order: 01, 02, 03, 04, 05, 06, 13, 14, 09, 07, 08, 10, 11, 12, 15.
  - This order follows feature dependencies, so earlier features must be built and tested first.

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
- A public storage bucket named `logos` holds company logos. The user must create it in Supabase.
  - Images only: PNG or JPG, under 2 MB, at `{company_id}/logo.{png or jpg}`.
  - Only HR of that company can upload or replace a logo. Anyone can read it.
  - Never store CVs in `logos`.
- There is no scheduler, because the app runs only on localhost:
  - Whenever a job is read (job lists, job page, apply submit, HR pages), if `apply_by` has passed and the job is still open, the server closes it with `closed_reason` `deadline`.
  - The daily summary email (Feature 15) is sent from a server route that HR triggers with a "Send today's summary" button, for the demo. A real scheduled job is a future step.
- Email confirmation is off in Supabase for development and the demo, so sign up logs the user in straight away. Turning it on is a future step.
- The app runs only on localhost. There is no hosting for now.
- Tables are created only through SQL that you give the user to run in the Supabase SQL Editor. Never assume a table exists.
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
- Keep each feature in its own small files.

## Security Rules

- API keys and secrets go only in `.env.local`. Never hard-code them, print them or use them in frontend code.
- `.env.local` must be in `.gitignore`.
- The Supabase secret / service role key and the Gemini key are used only in server code.
- `RESEND_API_KEY` lives only in `.env.local` and is used only in server code.
- Emails never contain scores, AI results or HR notes.
- Candidate search and company pages never expose another company's private data.
- Every table has Row Level Security.
- HR sees only their own company's jobs and candidates.
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
  - Lavender pages (`--surface-page` `#EEEAFB`)
  - Light lilac cards (`--surface` `#FCFBFF`) with lilac borders (`--border` `#DCD5F5`)
  - Brand purple `--primary` `#5B3FD9`
  - Teal for found, orange for missing, red for errors
  - Nothing pure white
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

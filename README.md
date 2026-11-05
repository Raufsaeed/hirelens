# HireLens

HireLens is an AI-powered hiring platform for small and medium companies. HR posts a job, candidates apply with a PDF CV, and AI screens every CV against the job, giving a score with clear reasons and evidence and ranking the candidates. AI only advises: HR always makes the final decision.

## Main features

HireLens has 23 features, covering 23 user flows. AI-powered features are marked **(AI)**.

1. **Authentication:** sign up as HR or candidate, log in, log out and reset a password. Each role reaches only its own pages.
2. **Post a Job:** create, draft and publish a job with a shareable link.
3. **Edit Job and Re-screen:** edit a job and re-screen candidates if requirements change.
4. **Close, Reopen and Deadline:** close or reopen a job; jobs close after their "Apply by" date.
5. **AI Job Description Writer (AI):** drafts a job description from a few points.
6. **Company Profile and Public Page:** edit the company name, logo, About us, website and location; a public page shows them with the open jobs.
7. **Job Search:** browse, search and view open jobs.
8. **Apply with CV:** apply to a job with a PDF CV.
9. **My Applications:** candidates track their status, never their score.
10. **Withdraw and Delete Application Data:** withdraw an application or delete its data.
11. **AI CV Screening and Retry (AI):** checks each CV against the job; code calculates the score. HR can retry a failed screening or review an unreadable CV by hand.
12. **Ranked Candidates List:** candidates sorted by score, with filters.
13. **Candidate Search:** find a candidate by name or email across all jobs.
14. **Candidate Review and Shortlist:** review the evidence, add notes, shortlist or reject.
15. **Hiring Pipeline:** move candidates from Applied to Hired or Rejected.
16. **Interview Scheduling:** schedule, reschedule and cancel interviews.
17. **Interview Feedback:** record a rating and feedback after an interview.
18. **AI Interview Questions (AI):** suggests questions based on the job and the candidate's CV.
19. **Reports:** charts on applicants, scores and hiring progress.
20. **Candidate Profile:** save details and a default CV to apply faster.
21. **Saved Jobs:** save jobs to apply to later.
22. **Account Settings and Deletion:** change name, email and password. Candidates can delete their account and all their data.
23. **Email Notifications:** emails for applications, status changes and interviews, and one daily summary of new applicants for HR.

## Tech stack

| Part | Tool |
|------|------|
| Website and backend | Next.js (App Router, JavaScript) |
| Styling | Tailwind CSS |
| Login, database, file storage and permissions | Supabase (with `@supabase/ssr`) |
| AI | Google Gemini API (`@google/genai`) |
| Reading CV text | pdf-parse |
| Charts | Recharts |
| Emails | Resend |
| Icons | lucide-react |
| Animations | framer-motion |
| End-to-end tests | Playwright |

## Getting started

**You need:**

- Node.js installed on your computer.
- A Supabase project with:
  - Two storage buckets: `cvs` (**private**, for CVs) and `logos` (**public**, for company logos).
  - Email confirmation turned off (Authentication settings), so sign up logs you in straight away.
- A Google Gemini API key and a Resend API key.

**Steps:**

1. Copy `.env.example` to a new file called `.env.local`.
2. Open `.env.local` and fill in your own keys (Gemini, Supabase and Resend).
3. Create the database: in the Supabase SQL Editor, run these files from `supabase/sql/` once each, in this order:
   1. `01-authentication.sql`
   2. `02-post-a-job.sql`
   3. `group-1-all.sql`
   4. `group-2-all.sql`
   5. `group-3-all.sql`
   6. `group-4-all.sql`
   7. `group-5-all.sql`
   8. `23-email-notifications-deny-policy.sql`
4. Install the packages:
   ```bash
   npm install
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 to see the app.
7. Open http://localhost:3000/dev-check to check the setup.

**Good to know:**

- The app runs only on your own computer (localhost). There is no online hosting yet.
- There is no scheduler: past-deadline jobs close whenever jobs are read, and HR sends the daily applicant summary with the **Send today's summary** button on the Dashboard.
- Emails are sent from Resend's test sender (`onboarding@resend.dev`). A free Resend account only delivers to the email address of that Resend account; emails to other addresses are logged as failed.

## Running the tests

The end-to-end tests use Playwright and dummy accounts that are deleted after each run. They never call the real Gemini API or send real emails.

```bash
npm run test:e2e
```

One test calls the real Gemini API. It is skipped unless you set `RUN_REAL_AI=1`:

```bash
RUN_REAL_AI=1 npm run test:e2e
```

## Folder structure

| Folder | What it holds |
|--------|---------------|
| `docs/` | Product brief, user flows, the 23 feature files and the database plan |
| `design/` | The design system: guidelines, tokens and component previews |
| `prompts/` | AI prompt text files (prompts never go inside code) |
| `app/` | Pages and API routes |
| `components/` | Reusable UI pieces |
| `lib/` | Logic: Supabase and Gemini clients, PDF text extraction, scoring |
| `lib/email/` | Sending emails |
| `emails/` | Email templates |
| `supabase/sql/` | The SQL files that create the database, one per feature plus one combined file per group |
| `tests/e2e/` | Playwright end-to-end tests, one file per feature |

## Documentation

- [Product brief](docs/product-brief.md): what HireLens is and who it's for
- [User flows](docs/user-flow.md): the 23 user journeys, step by step
- [Feature files](docs/features/): one file per feature, `01` to `23`
- [Database](docs/database.md): every table, column and access rule
- [SQL files](supabase/sql/): the SQL that creates the database
- [Design guidelines](design/design-guidelines.md): colours, fonts, components and motion
- [AGENTS.md](AGENTS.md): rules for AI coding assistants working on this project

## Security notes

- API keys live only in `.env.local`, which is never committed to git. `.env.example` lists the key names without values.
- Candidates never see their score, match percentage, AI summary or HR notes.
- AI only advises. HR makes every shortlist, reject and hire decision.

## Author

Rauf Saeed Baloch

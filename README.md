# HireLens

HireLens is an AI-powered hiring platform for small and medium companies. HR posts a job, candidates apply with a PDF CV, and AI screens every CV against the job, giving a score with clear reasons and evidence and ranking the candidates. AI only advises: HR always makes the final decision.

## Main features

HireLens has 30 features. Each one does one job and matches one user flow. AI-powered features are marked **(AI)**.

1. **HR Sign Up:** HR signs up and creates their company.
2. **Candidate Sign Up:** candidates sign up, even in the middle of applying.
3. **Login and Logout:** each role reaches only its own pages.
4. **Password Reset:** reset a forgotten password by email.
5. **Post a Job:** create, draft and publish a job with a shareable link.
6. **Edit Job and Re-screen:** edit a job and re-screen candidates if requirements change.
7. **Close, Reopen and Deadline:** close or reopen a job; jobs close after their "Apply by" date.
8. **AI Job Description Writer (AI):** drafts a job description from a few points.
9. **Company Profile and Logo:** edit the company name, logo, About us, website and location.
10. **Public Company Page:** a public page for each company with its open jobs.
11. **Job Search:** browse, search and view open jobs.
12. **Apply with CV:** apply to a job with a PDF CV.
13. **My Applications:** candidates track their status, never their score.
14. **Withdraw and Delete Application Data:** withdraw an application or delete its data.
15. **AI CV Screening (AI):** checks each CV against the job; code calculates the score.
16. **Retry Screening:** retry a failed screening or review an unreadable CV by hand.
17. **Ranked Candidates List:** candidates sorted by score, with filters.
18. **Candidate Search:** find a candidate by name or email across all jobs.
19. **Candidate Review and Shortlist:** review the evidence, add notes, shortlist or reject.
20. **Hiring Pipeline:** move candidates from Applied to Hired or Rejected.
21. **Interview Scheduling:** schedule, reschedule and cancel interviews.
22. **Interview Feedback:** record a rating and feedback after an interview.
23. **AI Interview Questions (AI):** suggests questions based on the job and the candidate's CV.
24. **Reports:** charts on applicants, scores and hiring progress.
25. **Candidate Profile:** save details and a default CV to apply faster.
26. **Saved Jobs:** save jobs to apply to later.
27. **Account Settings:** change name, email and password.
28. **Delete Account:** candidates delete their account and all their data.
29. **Candidate Email Updates:** emails for applications, status changes and interviews.
30. **HR Daily Summary:** one email listing new applicants.

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

## Getting started

> **Note:** The app code is not built yet. These steps apply once it is.

**You need:**

- Node.js installed on your computer.
- A Supabase project with two storage buckets:
  - `cvs`: **private**, for CVs.
  - `logos`: **public**, for company logos.

**Steps:**

1. Copy `.env.example` to a new file called `.env.local`.
2. Open `.env.local` and fill in your own keys (Gemini, Supabase and Resend).
3. Install the packages:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 to see the app.
6. Open http://localhost:3000/dev-check to check the setup.

The app runs only on your own computer (localhost). There is no online hosting yet.

## Folder structure

| Folder | What it holds |
|--------|---------------|
| `docs/` | Product brief, user flows, the 30 feature files and the database plan |
| `design/` | The design system: guidelines, tokens and component previews |
| `prompts/` | AI prompt text files (prompts never go inside code) |
| `app/` | Pages and API routes |
| `components/` | Reusable UI pieces |
| `lib/` | Logic: Supabase and Gemini clients, PDF text extraction, scoring |
| `lib/email/` | Sending emails |
| `emails/` | Email templates |

## Documentation

- [Product brief](docs/product-brief.md): what HireLens is and who it's for
- [User flows](docs/user-flow.md): the 30 user journeys, step by step
- [Feature files](docs/features/): one file per feature, `01` to `30`
- [Database](docs/database.md): every table, column and access rule
- [Design guidelines](design/design-guidelines.md): colours, fonts, components and motion
- [AGENTS.md](AGENTS.md): rules for AI coding assistants working on this project

## Security notes

- API keys live only in `.env.local`, which is never committed to git. `.env.example` lists the key names without values.
- Candidates never see their score, match percentage, AI summary or HR notes.
- AI only advises. HR makes every shortlist, reject and hire decision.

## Author

Rauf Saeed Baloch

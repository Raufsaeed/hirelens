# HireLens

HireLens is an AI-powered hiring platform for small and medium companies. HR posts a job, candidates apply with a PDF CV, and AI screens every CV against the job, giving a score with clear reasons and evidence and ranking the candidates. AI only advises: HR always makes the final decision.

## Main features

AI-powered modules are marked **(AI)**.

1. **Accounts & Roles:** sign up and log in as HR or candidate.
2. **Job Posting:** create, edit, share, close and reopen jobs, with an optional "Apply by" date.
3. **Candidate Apply Portal:** browse open jobs and apply with a PDF CV.
4. **CV Screening (AI):** checks each CV against the job and gives a score, reasons and missing requirements.
5. **Candidate Ranking:** candidates sorted by score, with filters and candidate search.
6. **Hiring Pipeline:** move candidates from Applied to Hired or Rejected. Candidates see their status.
7. **Interview Management:** schedule interviews and record feedback.
8. **AI Interview Questions (AI):** suggests questions based on the job and the candidate's CV.
9. **AI Job Description Writer (AI):** drafts a job description from a few points.
10. **Reports & Analytics:** charts on applicants, scores and hiring progress.
11. **Candidate Profile:** save details and a default CV to apply faster.
12. **Saved Jobs:** save jobs to apply to later.
13. **Company Page:** a public page for each company with its open jobs.
14. **Profile Settings:** change name, email and password. Candidates can delete their account.
15. **Email Notifications:** emails for applications, status changes, interviews and an HR summary.

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
| `docs/` | Product brief, user flows, the 15 feature files and the database plan |
| `design/` | The design system: guidelines, tokens and component previews |
| `prompts/` | AI prompt text files (prompts never go inside code) |
| `app/` | Pages and API routes |
| `components/` | Reusable UI pieces |
| `lib/` | Logic: Supabase and Gemini clients, PDF text extraction, scoring |

## Documentation

- [Product brief](docs/product-brief.md): what HireLens is and who it's for
- [User flows](docs/user-flow.md): the 13 main journeys, step by step
- [Feature files](docs/features/): one file per module, `01` to `15`
- [Database](docs/database.md): every table, column and access rule
- [Design guidelines](design/design-guidelines.md): colours, fonts, components and motion
- [AGENTS.md](AGENTS.md): rules for AI coding assistants working on this project

## Security notes

- API keys live only in `.env.local`, which is never committed to git. `.env.example` lists the key names without values.
- Candidates never see their score, match percentage, AI summary or HR notes.
- AI only advises. HR makes every shortlist, reject and hire decision.

## Author

Rauf Saeed Baloch

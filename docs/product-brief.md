# HireLens — Product Brief

## Product in Brief

HireLens is an AI-powered hiring platform. HR posts a job, and candidates apply by uploading a PDF CV. AI then screens every CV against the job requirements, gives each one a score with clear reasons, shows which requirements are missing, and ranks all candidates. HireLens helps HR work faster and more fairly, but HR always makes the final hiring decision.

## Who It's For

- **Main users:** HR staff and recruiters at small and medium companies who need to review many applicants quickly.
- **Second users:** Job candidates who want a simple way to apply and see where their application stands.

## The Problem Today

- HR reads hundreds of CVs by hand, which is slow and tiring.
- Manual review is inconsistent — two people can judge the same CV very differently.
- Good candidates get missed when HR is rushed or the CV is worded differently.
- Existing screening tools only match exact keywords, so they miss skills described in other words.
- Big tools like LinkedIn Recruiter and Workable are too expensive for small Pakistani companies.

## What It Will Do

| # | Feature | What It Does | AI? |
|---|---------|--------------|-----|
| 1 | HR Sign Up | HR signs up and creates their company. | No |
| 2 | Candidate Sign Up | Candidates sign up, even in the middle of applying. | No |
| 3 | Login and Logout | Users log in and out; each role reaches only its own pages. | No |
| 4 | Password Reset | Users reset a forgotten password by email. | No |
| 5 | Post a Job | HR creates, drafts and publishes a job with a shareable link. | No |
| 6 | Edit Job and Re-screen | HR edits a job and re-screens candidates if requirements change. | No |
| 7 | Close, Reopen and Deadline | HR closes or reopens a job; jobs close after their Apply by date. | No |
| 8 | AI Job Description Writer | AI drafts a job description from a few points. | Yes |
| 9 | Company Profile and Logo | HR edits the company name, logo, About us, website and location. | No |
| 10 | Public Company Page | A public page for each company with its open jobs. | No |
| 11 | Job Search | Anyone browses, searches and opens open jobs. | No |
| 12 | Apply with CV | Candidates apply to a job with a PDF CV. | No |
| 13 | My Applications | Candidates track their application status, never their score. | No |
| 14 | Withdraw and Delete Application Data | Candidates withdraw an application or delete its data. | No |
| 15 | AI CV Screening | AI checks each CV against the job; code calculates the score. | Yes |
| 16 | Retry Screening | HR retries a failed screening or reviews an unreadable CV by hand. | No |
| 17 | Ranked Candidates List | HR sees candidates ranked by score, with filters. | No |
| 18 | Candidate Search | HR finds a candidate by name or email across all jobs. | No |
| 19 | Candidate Review and Shortlist | HR reviews a candidate's evidence, adds notes and shortlists or rejects. | No |
| 20 | Hiring Pipeline | HR moves candidates through hiring stages. | No |
| 21 | Interview Scheduling | HR schedules, reschedules and cancels interviews. | No |
| 22 | Interview Feedback | HR records a rating and feedback after an interview. | No |
| 23 | AI Interview Questions | AI suggests interview questions from the job and the CV. | Yes |
| 24 | Reports | Charts and numbers on jobs, applicants and hiring progress. | No |
| 25 | Candidate Profile | Candidates save their details and a default CV. | No |
| 26 | Saved Jobs | Candidates save jobs to apply to later. | No |
| 27 | Account Settings | Users change their name, email and password. | No |
| 28 | Delete Account | Candidates delete their account and all their data. | No |
| 29 | Candidate Email Updates | Candidates get emails about applications, status and interviews. | No |
| 30 | HR Daily Summary | HR gets one email listing new applicants. | No |

We use a pre-trained Google Gemini model through an API, with no custom training. AI reads CVs and judges how well they meet each requirement, while scores, match percentages and rankings are calculated in code, so results stay consistent and explainable.

Detailed features are in docs/features/.

## What It Will NOT Do

- AI will never make the final hire or reject decision — HR always decides.
- No payments.
- No mobile app — web only, but mobile friendly.
- No video interviews inside the platform.
- No Word or image CVs — PDF only.
- No scraping of job boards.
- No custom-trained AI model in this version.

## Stack

| Part | Tool |
|------|------|
| Website and backend | Next.js |
| Login, database, CV storage and permissions | Supabase |
| AI | Google Gemini API |
| Reading CV text | pdf-parse |
| Charts | Recharts |
| Email notifications | Resend |
| Icons | lucide-react |
| Animations | framer-motion |
| Running the app | Locally on the developer's laptop (localhost) for development and the demo; online hosting can be added later |
| Development | VS Code with the Claude extension |

## What Success Looks Like at Demo Day

- [ ] HR signs up and posts a job in under two minutes.
- [ ] A candidate applies with a real PDF CV through the job link.
- [ ] Within about thirty seconds, the CV shows a score, match percentage, and found and missing requirements with evidence.
- [ ] Several candidates appear ranked, and HR filters the list and opens one.
- [ ] HR moves a candidate through the pipeline, and the candidate sees the status change.
- [ ] The same CV gets a similar score when screened again.
- [ ] Error cases, like a wrong file type or an AI failure, show clear messages.
- [ ] HR schedules an interview and generates AI interview questions for a candidate.
- [ ] AI writes a job description from a few points, and HR edits it before publishing.
- [ ] The Reports page shows applicants, average score and the hiring funnel.
- [ ] A visitor opens the company page and sees only open jobs.

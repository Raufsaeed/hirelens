# Feature 10 · Public Company Page

## Description

Every company has a public page, for example `/companies/abc-tech`, with its logo, name, About us, website, location and open jobs. Anyone can open it, even when logged out.

## User Stories

- As an **HR user**, I want a public page for my company, so that candidates learn who we are and see all our open jobs.
- As a **candidate**, I want to read about a company and see its other open jobs, so that I can decide where to apply.
- As a **visitor** who is not logged in, I want to open a company page from a shared link, so that I can look before signing up.

## Functional Requirements

1. **Public company page:** Every company has a page at `/companies/[slug]`. It shows:
   - Logo and name
   - About us
   - Website (opens in a new tab)
   - Location
   - A list of the company's Open jobs, each linking to its Job Detail page (Feature 11)
2. **Slug:** Made from the company name when the company is created (Feature 01). If the slug is taken, a short number is added. The slug does not change when the name changes, so links keep working.
3. **Link from Job Detail:** The company name on every Public Job Detail page (Feature 11) links to the company page.
4. **Only open jobs:** Drafts and Closed jobs are never listed. Jobs past their Apply by date are closed (Feature 07), so they are not listed either.
5. **Empty parts:** If About us, website or location is empty, that part is hidden, not shown blank.
6. **Public:** Anyone can view the page, even when logged out.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Public Company Page | Logo, name, About us, website, location and open jobs. | "ABC Tech has no open jobs right now" (no open jobs); missing About us, website or location hidden | Skeleton header and job cards | "This company could not be found" | Company details and open jobs shown |

## Input / Output

| Action | User enters | App returns |
|--------|-------------|-------------|
| Open company page | Opens `/companies/abc-tech` or clicks the company name on a job | Company details and open jobs |
| Click a job on the company page | Clicks a job card | That job's Public Job Detail page |

## Data Used

- **`companies`** (Features 01 and 09): `name`, `slug` (unique), `logo_url`, `about`, `website`, `location`.
- **Storage bucket `logos`** (Feature 09): public, so the logo shows to logged-out visitors.
- **`jobs`** (Feature 05): only jobs with status `open` for that company are listed.
- **How they link:** `jobs.company_id` points to `companies.id`. The page is found by `companies.slug`.

## Business Rules and Permissions

- Anyone can view a company page, even when logged out.
- The page lists only Open jobs. Drafts and Closed jobs are never shown.
- The page never shows private data: no HR names or emails, no applicant counts, no candidates.
- Each slug is unique and stays the same when the company name changes.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Unknown company slug | "This company could not be found" | Shows no data and a link to browse jobs. |
| Company has no open jobs | "ABC Tech has no open jobs right now" | Shows the company details without a job list. |

## Acceptance Criteria

- [ ] Every company has a public page at `/companies/[slug]` with logo, name, About us, website, location and open jobs.
- [ ] The company name on the Job Detail page links to the company page.
- [ ] Drafts, Closed jobs and jobs past their deadline are never listed.
- [ ] The page works for logged-out visitors.
- [ ] No private company or candidate data appears on the page.

## User Flows

- Flow 10 · Visitor views a company page

## Test Cases

- Given Sara has filled in About us, website and location for ABC Tech, when Ali opens `/companies/abc-tech`, then he sees the logo, name, About us, website, location and the Junior Web Developer job.
- Given ABC Tech has one Open job, one Draft and one Closed job, when anyone opens the company page, then only the Open job is listed.
- Given Ali is on the Junior Web Developer Job Detail page, when he clicks "ABC Tech", then the ABC Tech company page opens.
- Given a visitor is not logged in, when they open `/companies/abc-tech`, then the page shows normally and contains no HR names, applicant counts or candidate data.

## Dependencies

- **Depends on:** Feature 05 (Post a Job) and Feature 09 (Company Profile and Logo).
- **Depended on by:** None.

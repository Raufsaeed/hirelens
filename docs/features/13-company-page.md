# Feature 13 · Company Page

## Description

This feature gives every company a public page, for example `/companies/abc-tech`, with its logo, name, About us, website, location and open jobs. HR edits this information in Company Settings. Candidates and visitors reach the page from the company name on any Job Detail page.

## User Stories

- As an **HR user**, I want a public page for my company, so that candidates learn who we are and see all our open jobs.
- As an **HR user**, I want to edit About us, website and location, so that the page stays correct.
- As a **candidate**, I want to read about a company and see its other open jobs, so that I can decide where to apply.
- As a **visitor** who is not logged in, I want to open a company page from a shared link, so that I can look before signing up.

## Functional Requirements

1. **Public company page:** Every company has a page at `/companies/[slug]`, for example `/companies/abc-tech`. It shows:
   - Logo and name (from Feature 01)
   - About us
   - Website (opens in a new tab)
   - Location
   - A list of the company's Open jobs, each linking to its Job Detail page
2. **Slug:** Made from the company name when the company is created. If the slug is taken, a short number is added at the end. The slug does not change when the name changes, so links keep working.
3. **Edit in Company Settings:** HR edits About us (up to 1,000 characters), website and location in Company Settings (the screen from Feature 01). There is a "View company page" link.
4. **Link from Job Detail:** The company name on every Public Job Detail page (Feature 02) links to the company page.
5. **Only open jobs:** Drafts and Closed jobs are never listed. Jobs past their Apply by date are closed (Feature 02), so they are not listed either.
6. **Empty parts:** If About us, website or location is empty, that part is hidden, not shown blank.
7. **Public:** Anyone can view the page, even when logged out.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Public Company Page | Logo, name, About us, website, location and open jobs. | "ABC Tech has no open jobs right now" (no open jobs); missing About us, website or location hidden | Skeleton header and job cards | "This company could not be found" | Company details and open jobs shown |
| Company Settings (company page part) | About us, website and location fields with a "View company page" link. | Blank fields with hints, for example "Tell candidates about your team" | Save button spinner | "About us can be up to 1,000 characters", "Please enter a valid website, for example https://abctech.com", "Couldn't save, try again" | "Company updated" |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Edit company page | About us, website, location | Company updated; the public page shows the new details |
| Open company page | Opens `/companies/abc-tech` or clicks the company name on a job | Company details and open jobs |
| Click a job on the company page | Clicks a job card | That job's Public Job Detail page |

## Data Used

- **`companies` table** (Feature 01), new fields:
  - `about`
  - `website`
  - `location`
  - `slug` (unique)
- **Storage bucket `logos`** (Feature 01): a public bucket, so the logo at `{company_id}/logo.{png or jpg}` shows to logged-out visitors.
- **`jobs`** (Feature 02): only jobs with status `open` for that company are listed.
- **How they link:** `jobs.company_id` points to `companies.id`. The page is found by `companies.slug`.

## Business Rules and Permissions

- Anyone can view a company page, even when logged out.
- Only HR of that company can edit its About us, website and location.
- The logo comes from the public `logos` bucket. Only HR of that company can upload or replace it, and CVs are never stored there.
- The page lists only Open jobs. Drafts and Closed jobs are never shown.
- The page never shows private data: no HR names or emails, no applicant counts, no candidates.
- Each slug is unique and stays the same when the company name changes.
- Website must start with `http://` or `https://`.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Unknown company slug | "This company could not be found" | Shows no data and a link to browse jobs. |
| About us too long | "About us can be up to 1,000 characters" | Shows a character counter and does not save. |
| Invalid website | "Please enter a valid website, for example https://abctech.com" | Does not save. |
| Company has no open jobs | "ABC Tech has no open jobs right now" | Shows the company details without a job list. |
| Candidate opens Company Settings | "You don't have access to this page" | Shows no settings. |
| Network or server failure | "Couldn't save, try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] Every company has a public page at `/companies/[slug]` with logo, name, About us, website, location and open jobs.
- [ ] HR can edit About us, website and location in Company Settings.
- [ ] The company name on the Job Detail page links to the company page.
- [ ] Drafts, Closed jobs and jobs past their deadline are never listed.
- [ ] The page works for logged-out visitors.
- [ ] No private company or candidate data appears on the page.

## Test Cases

- Given Sara has filled in About us, website and location for ABC Tech, when Ali opens `/companies/abc-tech`, then he sees the logo, name, About us, website, location and the Junior Web Developer job.
- Given ABC Tech has one Open job, one Draft and one Closed job, when anyone opens the company page, then only the Open job is listed.
- Given Ali is on the Junior Web Developer Job Detail page, when he clicks "ABC Tech", then the ABC Tech company page opens.
- Given Sara is in Company Settings, when she enters "abctech" as the website and clicks Save, then she sees "Please enter a valid website, for example https://abctech.com" and nothing is saved.
- Given a visitor is not logged in, when they open `/companies/abc-tech`, then the page shows normally and contains no HR names, applicant counts or candidate data.

## Dependencies

- **Depends on:** Feature 01 (Accounts & Roles) and Feature 02 (Job Posting).
- **Depended on by:** None.

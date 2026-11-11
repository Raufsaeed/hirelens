# Feature 06 · Company Profile and Public Page

## Description

HR edits the company's name, logo, About us, website and location in Company Settings. Every company has a public page, for example `/companies/abc-tech`, that shows these details and its open jobs. Anyone can open it, even when logged out.

## User Stories

- As an **HR user**, I want a public page for my company, so that candidates learn who we are and see all our open jobs.
- As an **HR user**, I want to edit About us, website and location, so that the company page stays correct.
- As an **HR user**, I want to upload our logo, so that candidates recognise our company.
- As a **candidate**, I want to read about a company and see its other open jobs, so that I can decide where to apply.
- As a **visitor** who is not logged in, I want to open a company page from a shared link, so that I can look before signing up.

## Functional Requirements

1. **Company Settings (HR only):** HR can view and edit:
   - Company name
   - Logo (optional)
   - About us (up to 1,000 characters)
   - Website
   - Location

   There is a "View company page" link. Company Settings is reached from a link on Settings (Feature 22).
2. **Logo:** A PNG or JPG under 2 MB, stored in the public storage bucket `logos` at `{company_id}/logo.{png or jpg}`. Uploading a new logo replaces the old one.
3. **Public company page:** Every company has a page at `/companies/[slug]`. It shows:
   - Logo and name
   - About us
   - Website (opens in a new tab)
   - Location
   - A list of the company's Open jobs, each linking to its Job Detail page (Feature 07)
4. **Slug:** Made from the company name when the company is created (Feature 01). If the slug is taken, a short number is added. The slug does not change when the name changes, so links keep working.
5. **Link from Job Detail:** The company name on every Public Job Detail page (Feature 07) links to the company page.
6. **Only open jobs:** Drafts and Closed jobs are never listed. Jobs past their Apply by date are closed (Feature 04), so they are not listed either.
7. **Empty parts:** If About us, website or location is empty, that part is hidden, not shown blank.
8. **Public:** Anyone can view the page, even when logged out.

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Company Settings | Company name, logo, About us, website and location, with a Save button and a "View company page" link (HR only). | Name filled in, no logo yet; blank fields with hints, for example "Tell candidates about your team" | Save button spinner; logo upload progress | "Company name is required", "Logo must be a PNG or JPG under 2 MB", "About us can be up to 1,000 characters", "Please enter a valid website, for example https://abctech.com", "Couldn't save, try again" | "Company updated" |
| Public Company Page | Logo, name, About us, website, location and open jobs. | "ABC Tech has no open jobs right now" (no open jobs); missing About us, website or location hidden | Skeleton header and job cards | "This company could not be found" | Company details and open jobs shown |

## Input / Output

| Form / Action | User enters | App returns |
|---------------|-------------|-------------|
| Company Settings | Company name, optional logo, About us, website, location | Updated company profile and "Company updated"; the public page shows the new details |
| Open company page | Opens `/companies/abc-tech` or clicks the company name on a job | Company details and open jobs |
| Click a job on the company page | Clicks a job card | That job's Public Job Detail page |

## Data Used

- **`companies` table** (Feature 01), plus these fields:
  - `about`
  - `website`
  - `location`
- **`companies.slug`** (unique): the page is found by it.
- **Storage bucket `logos`:** A public bucket holding company logos at `{company_id}/logo.{png or jpg}`, so the logo shows to logged-out visitors. `companies.logo_url` points to the file. CVs are never stored here.
- **`jobs`** (Feature 02): only jobs with status `open` for that company are listed.
- **How they link:** `jobs.company_id` points to `companies.id`.

## Business Rules and Permissions

- Anyone, even logged out, can read company info (name, slug, logo, about, website, location), because job pages and company pages are public.
- Only HR of that company can update it.
- Only HR of that company can upload or replace its logo in `logos`. Anyone can view logos. Logos must be PNG or JPG, under 2 MB. CVs are never stored in `logos`.
- Website must start with `http://` or `https://`.
- Company name and About us are checked for prompt injection (see "Prompt injection" in AGENTS.md), in the browser and again on the server. Blocked text is not saved.
- The page lists only Open jobs. Drafts and Closed jobs are never shown.
- The page never shows private data: no HR names or emails, no applicant counts, no candidates.
- Each slug is unique and stays the same when the company name changes.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Logo is not a PNG or JPG, or is over 2 MB | "Logo must be a PNG or JPG under 2 MB" | Does not upload the file; the old logo stays. |
| About us too long | "About us can be up to 1,000 characters" | Shows a character counter and does not save. |
| Invalid website | "Please enter a valid website, for example https://abctech.com" | Does not save. |
| Company name or About us contains prompt injection | "This text contains content that isn't allowed. Please remove it and try again." under that field | Does not save. Never shows why the text was blocked. |
| Candidate opens Company Settings | "You don't have access to this page" | Shows no settings. |
| Unknown company slug | "This company could not be found" | Shows no data and a link to browse jobs. |
| Company has no open jobs | "ABC Tech has no open jobs right now" | Shows the company details without a job list. |
| Network or server failure | "Couldn't save, try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can edit the company name and logo.
- [ ] HR can edit About us, website and location in Company Settings.
- [ ] Every company has a public page at `/companies/[slug]` with logo, name, About us, website, location and open jobs.
- [ ] The company name on the Job Detail page links to the company page.
- [ ] Drafts, Closed jobs and jobs past their deadline are never listed.
- [ ] The page works for logged-out visitors.
- [ ] No private company or candidate data appears on the page.

## User Flows

- Flow 6 · HR updates the company profile and a visitor views the company page

## Test Cases

- Given Sara is in Company Settings, when she uploads a 3 MB logo for ABC Tech, then she sees "Logo must be a PNG or JPG under 2 MB" and the old logo stays.
- Given Sara is in Company Settings, when she enters "abctech" as the website and clicks Save, then she sees "Please enter a valid website, for example https://abctech.com" and nothing is saved.
- Given the ABC Tech page is at `/companies/abc-tech`, when Sara changes the company name and saves, then the page address stays `/companies/abc-tech`.
- Given Sara has filled in About us, website and location for ABC Tech, when Ali opens `/companies/abc-tech`, then he sees the logo, name, About us, website, location and the Junior Web Developer job.
- Given ABC Tech has one Open job, one Draft and one Closed job, when anyone opens the company page, then only the Open job is listed.
- Given Ali is on the Junior Web Developer Job Detail page, when he clicks "ABC Tech", then the ABC Tech company page opens.
- Given a visitor is not logged in, when they open `/companies/abc-tech`, then the page shows normally and contains no HR names, applicant counts or candidate data.

## Dependencies

- **Depends on:** Feature 01 (Authentication) and Feature 02 (Post a Job).
- **Depended on by:** None.

## Done When

- [x] Sara saves About us, website and location and sees "Company updated".
- [x] A PNG or JPG logo under 2 MB uploads and replaces the old logo.
- [x] A 3 MB logo shows "Logo must be a PNG or JPG under 2 MB" and the old logo stays.
- [x] "abctech" as the website shows "Please enter a valid website, for example https://abctech.com".
- [x] Changing the company name keeps the page at `/companies/abc-tech`.
- [x] Privacy: a candidate who opens Company Settings sees "You don't have access to this page".
- [x] `/companies/abc-tech` shows the logo, name, About us, website, location and open jobs.
- [x] Only Open jobs are listed, never Draft or Closed jobs.
- [x] Clicking "ABC Tech" on the Junior Web Developer job page opens the company page.
- [x] `/companies/unknown-company` shows "This company could not be found".
- [x] Privacy: a logged-out visitor sees the page with no HR names, applicant counts or candidate data.

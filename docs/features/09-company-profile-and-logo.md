# Feature 09 · Company Profile and Logo

## Description

HR edits the company's name, logo, About us, website and location in Company Settings. These details show on the public company page (Feature 10) and on job pages.

## User Stories

- As an **HR user**, I want to edit About us, website and location, so that the company page stays correct.
- As an **HR user**, I want to upload our logo, so that candidates recognise our company.

## Functional Requirements

1. **Company Settings (HR only):** HR can view and edit:
   - Company name
   - Logo (optional)
   - About us (up to 1,000 characters)
   - Website
   - Location

   There is a "View company page" link. Company Settings is reached from a link on Settings (Feature 27).
2. **Logo:** A PNG or JPG under 2 MB, stored in the public storage bucket `logos` at `{company_id}/logo.{png or jpg}`. Uploading a new logo replaces the old one.
3. **Slug stays the same:** Changing the company name does not change the page address (Feature 10).

## Screens

| Screen | What it shows | Empty | Loading | Error | Success |
|--------|---------------|-------|---------|-------|---------|
| Company Settings | Company name, logo, About us, website and location, with a Save button and a "View company page" link (HR only). | Name filled in, no logo yet; blank fields with hints, for example "Tell candidates about your team" | Save button spinner; logo upload progress | "Company name is required", "Logo must be a PNG or JPG under 2 MB", "About us can be up to 1,000 characters", "Please enter a valid website, for example https://abctech.com", "Couldn't save, try again" | "Company updated" |

## Input / Output

| Form | User enters | App returns |
|------|-------------|-------------|
| Company Settings | Company name, optional logo, About us, website, location | Updated company profile and "Company updated"; the public page shows the new details |

## Data Used

- **`companies` table** (Feature 01), plus these fields:
  - `about`
  - `website`
  - `location`
- **Storage bucket `logos`:** A public bucket holding company logos at `{company_id}/logo.{png or jpg}`. `companies.logo_url` points to the file. CVs are never stored here.

## Business Rules and Permissions

- Anyone, even logged out, can read company info (name, slug, logo, about, website, location), because job pages and company pages are public.
- Only HR of that company can update it.
- Only HR of that company can upload or replace its logo in `logos`. Anyone can view logos. Logos must be PNG or JPG, under 2 MB. CVs are never stored in `logos`.
- Website must start with `http://` or `https://`.
- Row Level Security enforces these rules in the database.

## Error Cases

| Case | Message Shown | What the System Does |
|------|---------------|----------------------|
| Logo is not a PNG or JPG, or is over 2 MB | "Logo must be a PNG or JPG under 2 MB" | Does not upload the file; the old logo stays. |
| About us too long | "About us can be up to 1,000 characters" | Shows a character counter and does not save. |
| Invalid website | "Please enter a valid website, for example https://abctech.com" | Does not save. |
| Candidate opens Company Settings | "You don't have access to this page" | Shows no settings. |
| Network or server failure | "Couldn't save, try again" | Keeps what HR typed; never shows a raw error. |

## Acceptance Criteria

- [ ] HR can edit the company name and logo.
- [ ] HR can edit About us, website and location in Company Settings.

## User Flows

- Flow 9 · HR updates the company profile and logo

## Test Cases

- Given Sara is in Company Settings, when she uploads a 3 MB logo for ABC Tech, then she sees "Logo must be a PNG or JPG under 2 MB" and the old logo stays.
- Given Sara is in Company Settings, when she enters "abctech" as the website and clicks Save, then she sees "Please enter a valid website, for example https://abctech.com" and nothing is saved.
- Given the ABC Tech page is at `/companies/abc-tech`, when Sara changes the company name and saves, then the page address stays `/companies/abc-tech`.

## Dependencies

- **Depends on:** Feature 01 (HR Sign Up).
- **Depended on by:** Feature 10 (Public Company Page).

## Done When

- [ ] Sara saves About us, website and location and sees "Company updated".
- [ ] A PNG or JPG logo under 2 MB uploads and replaces the old logo.
- [ ] A 3 MB logo shows "Logo must be a PNG or JPG under 2 MB" and the old logo stays.
- [ ] "abctech" as the website shows "Please enter a valid website, for example https://abctech.com".
- [ ] Changing the company name keeps the page at `/companies/abc-tech`.
- [ ] Privacy: a candidate who opens Company Settings sees "You don't have access to this page".

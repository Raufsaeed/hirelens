# User flows

A flow is one thing a user sets out to do, step by step, from start to finish. Each flow does one thing only. When a flow needs another flow first (for example, applying needs a logged-in candidate), it starts from that point and names the other flow by number. Every screen lists all its states, not just the happy one.

**Running example:** **ABC Tech** is hiring a **Junior Web Developer** (1 year experience, BS Computer Science, skills HTML, CSS, React, Git and REST APIs). The HR user is **Sara** and the candidate is **Ali**. Other candidates: **Ayesha** (score 88), **Usman** (score 61), **Bilal** (pending screening in retry examples, and another company's candidate in search examples) and **Hira** (a scanned CV that can't be read).

**Demo Day story:** Flows 1 → 5 → 12 → 15 → 17 → 19 → 20 → 21 → 23 → 22 → 8 → 24 → 10.

---

## Flow 1 · HR signs up and creates a company

**Who and when:** Sara, an HR officer at a small company, on a Monday morning when her team needs a new developer.

**Starts on:** Landing page · **Done when:** Sara's HR account and ABC Tech exist, she is logged in, and she sees the empty HR dashboard.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Landing page | Clicks "I'm hiring". | Opens HR sign up with the "I'm hiring" role chosen. |
| 2 | Sign up | Enters name, email, password and company name (ABC Tech). | Shows the three password requirements (8+ characters, one capital letter, one special character) and ticks each as she types. |
| 3 | Sign up | Clicks Sign up. | Checks the details, creates the HR account and ABC Tech (page address `/companies/abc-tech`), and logs her in. |
| 4 | HR dashboard | Sees her dashboard. | Shows "You have no jobs yet" with "Post your first job" (continues in Flow 5). |

If Sara already has an account, she logs in instead (Flow 3).

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Landing page | N/A | Page loading | "Something went wrong, please refresh" | "I'm hiring" and "I'm looking for a job" buttons shown |
| Sign up | Blank form with Sign up and Log in tabs | Button spinner, button disabled | Field errors ("This field is required"), "Email already in use. Log in instead?", or "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Sara logged in and sent to the HR dashboard |
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs with applicant counts |

**What could go wrong**

Sara may use an email that already has an account, so the app must say so and point her to log in. She may pick a weak password, so the three requirements must be ticked as she types. She may leave the company name empty, so the form must not submit. The network may drop, so her typing must be kept and she can retry, with no raw error.

**Test cases**

- Given Sara has no account, when she signs up with her name, a new email, a valid password and "ABC Tech", then her account and company are created and she lands on the empty HR dashboard.
- Given an account already exists for sara@abctech.com, when Sara tries to sign up with that email, then she sees "Email already in use" and a link to log in.
- Given Sara is on the HR sign up form, when she leaves the company name empty and clicks Sign up, then the field shows "This field is required" and no account is created.

---

## Flow 2 · Candidate signs up

**Who and when:** Ali, a fresh graduate, on a Friday evening after seeing the Junior Web Developer link on LinkedIn. He clicks Apply but has no account.

**Starts on:** Public job detail page (or landing page) · **Done when:** Ali has a candidate account, is logged in, and is back on the apply form for the same job (or on My Applications if he started on the landing page).

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public job detail | Clicks Apply on Junior Web Developer (finding the job is Flow 11). | Sees he isn't logged in, remembers the job and opens candidate sign up. |
| 2 | Landing page | **Other way in:** clicks "I'm looking for a job". | Opens sign up with the candidate role chosen. |
| 3 | Sign up | Enters name, email and password. | Ticks the three password requirements as he types. |
| 4 | Sign up | Clicks Sign up. | Creates the candidate account and logs him in. |
| 5 | Apply form or My Applications | Lands where he was going. | Returns him to the apply form for this job (continues in Flow 12), or to My Applications if he started on the landing page. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Sign up | Blank form | Button spinner | Field errors, "Email already in use. Log in instead?", or "Password must be at least 8 characters and include one capital letter and one special character (like @)" | Ali logged in and sent back to the apply form |

**What could go wrong**

Ali may already have an account, so the app must say "Email already in use" and point him to log in (Flow 3). He may pick a weak password, so the requirements must be ticked live and the form must not submit until all three are met. He must never lose his place: he comes back to the job he clicked Apply on.

**Test cases**

- Given Ali is on the Sign Up form, when he enters the password "abctech2026" (long enough but with no capital letter or special character), then only the 8-character requirement is ticked, the account is not created, and he sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali is logged out and clicks Apply on Junior Web Developer, when he signs up with a new email and a valid password, then he is logged in and back on the apply form for Junior Web Developer.
- Given an account already exists for Ali's email, when he tries to sign up with it, then he sees "Email already in use. Log in instead?" and no second account is created.

---

## Flow 3 · User logs in and logs out

**Who and when:** Sara at the start of her workday on her laptop, or Ali on his commute on his phone.

**Starts on:** Log in page · **Done when:** The user is logged in on the right page for their role, then signs out and is back on the log in page.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Log in | Enters email and password and clicks Log in. On a phone, Ali sees a single-column form with large tap targets. | Checks the details and logs the user in. |
| 2 | Log in | **Wrong details:** enters a wrong email or password. | Shows "Email or password is incorrect" with "Forgot password" (Flow 4) and keeps the email filled in. |
| 3 | Dashboard | Is logged in. | Sends Sara to the HR dashboard and Ali to My Applications (or back to the job he was applying for). |
| 4 | Any protected page | **Logged out:** opens a protected page URL, such as an HR candidates page. | Shows "Please log in to continue", sends the user to Log in, and returns them to that page after login. Shows no data first. |
| 5 | Menu (phone) | Ali taps the menu icon, then Sign out. On a laptop, Sign out is in the user menu on every page. | Signs him out and returns him to the log in page. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Log in | Blank form with "Forgot password" link | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and sent to the right page for the role |
| Log in (phone) | Blank form | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and sent to My Applications |
| Menu (phone) | N/A | N/A | "Couldn't sign out, try again" | Signed out and back on the log in page |

**What could go wrong**

Sara may type the wrong password, so the error must not say which part was wrong and must offer "Forgot password". A logged-out user must never see an HR page. A candidate who opens an HR page must see "You don't have access to this page" and no HR data. Small buttons may be hard to tap on a phone.

**Test cases**

- Given Sara has an account, when she logs in with the wrong password, then she sees "Email or password is incorrect" with a "Forgot password" link and stays on the log in page.
- Given a user is not logged in, when they open the URL of an HR candidates page, then they are sent to the log in page and no candidate data is shown.
- Given Ali is logged in as a candidate, when he opens the URL of an HR page, then he sees "You don't have access to this page" and no HR data is shown.
- Given Ali is logged in on his phone, when he taps the menu icon and then Sign out, then he is back on the log in page and opening My Applications asks him to log in again.

---

## Flow 4 · User resets a forgotten password

**Who and when:** Ali or Sara, when they can't remember their password.

**Starts on:** Log in page · **Done when:** The user sets a new password and is logged in to the right dashboard for their role.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Log in | Clicks "Forgot password". | Opens the forgot password page. |
| 2 | Forgot password | Enters their email and clicks "Send reset link". | Always shows "If an account exists for this email, we've sent a reset link". Sends the email only if the account exists. |
| 3 | Email inbox | Clicks the reset link in the email. | Opens the set new password page if the link is still valid. |
| 4 | Set new password | Enters a new password twice and clicks Save. | Shows the three password requirements (8+ characters, one capital letter, one special character) and ticks each as the user types. Saves only if all three are met and both passwords match. |
| 5 | Log in / Dashboard | Is logged in. | Sends Sara to the HR dashboard and Ali to My Applications. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Log in | Blank form with "Forgot password" link | Button spinner | "Email or password is incorrect" | Logged in |
| Forgot password | Blank email field | Button spinner | "Please enter a valid email" | Neutral "If an account exists…" message |
| Set new password | Two blank password fields | Save button spinner | "This link has expired, request a new one", "Password must be at least 8 characters and include one capital letter and one special character (like @)", or "Passwords don't match" | "Password updated" and logged in |
| Dashboard | Depends on role (see Flows 1 and 13) | Skeleton | "Couldn't load your dashboard" with Retry | Correct dashboard for the role |

**What could go wrong**

Saying an email is not registered would let attackers find out who has an account, so the message must be the same either way. Reset links can be old or already used, so they must expire. Users may pick a weak password or mistype it. After the reset, users must land on their own role's dashboard.

**Test cases**

- Given no account exists for test@example.com, when someone requests a reset for it, then they see the same "If an account exists for this email, we've sent a reset link" message and no email is sent.
- Given Ali's reset link is older than its time limit, when he opens it, then he sees "This link has expired, request a new one".
- Given Sara is on the set new password page, when she enters "123" or two passwords that don't match, then the password is not saved and she sees the matching error.
- Given Sara (HR) and Ali (candidate) each reset their password, when they are logged in, then Sara lands on the HR dashboard and Ali lands on My Applications.

---

## Flow 5 · HR posts a job

**Who and when:** Sara, right after signing up (Flow 1), when her team needs a new developer.

**Starts on:** HR dashboard · **Done when:** The job is published, Sara has a shareable link, and the job is on her dashboard.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Clicks "Post your first job". | Opens the create job form. |
| 2 | Create job form | Fills in title (Junior Web Developer), location, type, required years (1), degree (BS Computer Science), requirements (HTML, CSS, React, Git, REST APIs, each "must have" or "nice to have"), a description and an optional "Apply by" date (20 Oct). Can click "Write with AI" for the description (Flow 8). | Checks required fields as she types, checks Apply by is not in the past, and shows what is missing. |
| 3 | Create job form | **Not ready yet:** clicks "Save as draft". | Saves a Draft only ABC Tech's HR can see. Drafts are never public. |
| 4 | Create job form | Clicks Publish. | Saves the job as Open and shows its public link (`/jobs/abc-tech-junior-web-developer`) with "Copy link". |
| 5 | Job published | Clicks "Copy link". | Copies the link and shows "Link copied". |
| 6 | HR dashboard | Goes back to the dashboard. | Shows the job with 0 applicants, status Open and "Apply by 20 Oct". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs with applicant counts |
| Create job form | Blank form with hints | Publish button spinner | Missing fields highlighted with a short message; "Apply by date can't be in the past"; "You already have an open job called Junior Web Developer"; "Couldn't publish, try again" | Job saved and Job published screen opens |
| Job published | N/A | N/A | "Couldn't copy, select the link and copy it by hand" | Link shown and "Link copied" |

**What could go wrong**

She may skip a required field such as degree or requirements, so Publish stays blocked until the form is complete. The network may drop while publishing, so her form must not be lost. She may pick a past Apply by date, so the form must stop her. She may already have an open job with the same title, so the form must tell her.

**Test cases**

- Given Sara is on the create job form, when she fills in Junior Web Developer with all fields and clicks Publish, then the job is Open, she gets the link `/jobs/abc-tech-junior-web-developer` with "Copy link", and the job appears on her dashboard with 0 applicants.
- Given Sara is on the create job form, when she clicks Publish without filling in the requirements, then the job is not published and she sees "Add at least one requirement".
- Given Sara is on the create job form, when she sets the Apply by date to yesterday, then she sees "Apply by date can't be in the past" and the job is not published.

---

## Flow 6 · HR edits a job and re-screens candidates

**Who and when:** Sara, two days after posting, when the team decides the job also needs TypeScript.

**Starts on:** My Jobs · **Done when:** The job is saved with the new details, and candidates are re-screened against the new requirements (or Sara chose "Not now").

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Jobs | Clicks Edit on Junior Web Developer. | Opens the edit form with the current details. |
| 2 | Edit job form | Adds "TypeScript" to the requirements and clicks Save. | Warns: "23 candidates were screened against the old requirements. Re-screen them now?" with "Re-screen" and "Not now". |
| 3 | Edit job form | Clicks "Re-screen". ("Not now" saves the job and keeps the old scores.) | Saves the job, re-screens in the background, and shows progress on the candidates list. |
| 4 | Candidates list | Keeps working. | Shows "Re-screening 5 of 23…", then updated scores. Failed screenings show "Pending" (Flow 16). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Jobs | "You have no jobs yet" with "Post your first job" | Skeleton list | "Couldn't load your jobs" with Retry | Jobs with status and Edit, Close and Reopen actions |
| Edit job form | N/A | Save button spinner; "Re-screening 5 of 23…" | Missing fields highlighted; "Couldn't save, try again" | "Job updated" |
| Candidates list (re-screen progress) | N/A | "Re-screening 5 of 23…" | "3 candidates could not be screened and are Pending" | "All candidates re-screened" |

**What could go wrong**

Sara may delete a required field, so Save must be blocked. New requirements make old scores out of date, so the app must warn her and let her choose to re-screen. Re-screening takes time and AI may fail for some candidates, who then show "Pending".

**Test cases**

- Given Sara is editing the job, when she clears the title and clicks Save, then the job is not saved and the title field shows "This field is required".
- Given 23 candidates have applied, when Sara adds "TypeScript" to the requirements and saves, then she sees the warning that candidates were screened against the old requirements and the "Re-screen" option.
- Given Sara adds "TypeScript" to the requirements and clicks "Re-screen", when re-screening finishes, then each candidate's found and missing requirements include TypeScript and scores are updated.

---

## Flow 7 · HR closes, reopens or extends a job

**Who and when:** Sara, when the position is filled, when she wants a job open again, or when a deadline passed too soon.

**Starts on:** My Jobs · **Done when:** The job is closed, reopened or extended, and the public link shows the right state.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Jobs (or Pipeline board) | Once the position is filled (Ali Hired, others Rejected, see Flow 20), clicks "Close job". | Asks to confirm, then marks the job Closed. The public link shows "This job is no longer accepting applications". |
| 2 | Public job detail | Anyone (for example Ali) opens the job link. | Shows "This job is no longer accepting applications" instead of Apply. |
| 3 | My Jobs | Later, clicks "Reopen job". | Marks the job Open. The public link accepts applications again. |
| 4 | (System) | Nothing. | When an Open job is read after its Apply by day ends (11:59 pm Pakistan time), the server closes it with the reason "Deadline passed". |
| 5 | My Jobs | Sees another job as "Closed · Deadline passed" (Apply by was 20 Oct). Clicks Edit, sets Apply by to 30 Oct and saves. | Shows "Deadline extended. The job is open again". The public link shows "Apply by 30 Oct" and Apply. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Jobs | "You have no jobs yet" with "Post your first job" | Skeleton list | "Couldn't load your jobs" with Retry | Jobs with status Open or Closed ("Deadline passed" when that was the reason) and Edit, Close and Reopen actions; "Job closed" or "Job reopened" |
| Edit job form (deadline) | N/A | Save button spinner | "Apply by date can't be in the past"; "Set a new Apply by date to reopen this job"; "Couldn't save, try again" | "Deadline extended. The job is open again" |
| Public job detail | N/A | Skeleton of the job page | "This job is no longer accepting applications" | Updated job details with Apply button |

**What could go wrong**

A candidate may be mid-application when the job closes, so Submit must check again (Flow 12). Sara may reopen a job whose deadline has passed, so the app must ask for a new Apply by date first. Closing stops new applications at once, so it must be confirmed.

**Test cases**

- Given Sara has closed the Junior Web Developer job, when Ali opens the job link and tries to apply, then he sees "This job is no longer accepting applications".
- Given the job is closed, when Sara clicks "Reopen job", then the status becomes Open and the public link accepts applications again.
- Given a job was closed because its Apply by date of 20 Oct passed, when Sara sets a new Apply by date of 30 Oct, then the job is Open again and the public link shows the Apply button.
- Given Ali is Hired and the others are Rejected, when Sara closes the job, then each candidate sees their final status and the job link shows "This job is no longer accepting applications".

---

## Flow 8 · HR writes a job description with AI

**Who and when:** Sara, when she needs to post a job quickly but has no written description.

**Starts on:** Create job form (Flow 5, step 2) · **Done when:** The AI draft is in the form, Sara has edited it, and the job is published.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Create job form | Enters the title, requirements (HTML, CSS, React, Git, REST APIs, 1 year, BS Computer Science) and key points such as "small friendly team, hybrid in Lahore". | Enables "Write with AI" once there is enough input. |
| 2 | Create job form | Clicks "Write with AI". | Sends only what Sara entered to AI and shows "Writing description…". |
| 3 | Create job form | Reads the draft in the description box. | Shows the draft with the note "Review and edit before publishing". |
| 4 | Create job form | Dislikes the tone and clicks "Regenerate". | Writes a new draft from the same input. |
| 5 | Create job form | Edits a few lines by hand. | Keeps her edits. |
| 6 | Create job form | Clicks Publish. | Publishes the job with her edited text and shows the shareable link (as in Flow 5). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Create job form | Blank form; "Write with AI" disabled with "Add a title and at least one requirement first" | "Writing description…" spinner in the description box | "Couldn't write a description right now. You can write it yourself or try again" | Editable draft in the description box |
| Job published | N/A | N/A | "Couldn't copy, select the link and copy it by hand" | Link shown with "Copy link" |

**What could go wrong**

With almost no input, AI would guess, so the button stays disabled until there is enough. AI may be down, so Sara must still be able to write the description herself. AI may invent requirements she never gave, such as "3 years of Angular", which would mislead candidates and change screening, so the draft must use only what she entered. Regenerating must not wipe edits without warning.

**Test cases**

- Given Sara has entered only the title, when she looks at "Write with AI", then the button is disabled with "Add a title and at least one requirement first".
- Given Google Gemini is unavailable, when Sara clicks "Write with AI", then she sees "Couldn't write a description right now" and can still type the description and publish.
- Given AI has written a draft, when Sara edits it and clicks Publish, then the published job shows her edited text, not the original draft.
- Given Sara entered HTML, CSS, React, Git and REST APIs as requirements, when AI writes the description, then it does not list any skill, degree or experience she did not enter.

---

## Flow 9 · HR updates the company profile and logo

**Who and when:** Sara, after posting her first job, when she wants candidates to learn about ABC Tech.

**Starts on:** Company Settings · **Done when:** ABC Tech's name, logo, About us, website and location are saved and shown on the public company page.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Settings | Opens Settings from the user menu and clicks the Company Settings link. | Opens Company Settings with name, logo, About us, website, location and a "View company page" link. |
| 2 | Company Settings | Uploads the ABC Tech logo (PNG under 2 MB). | Shows upload progress, saves it in the public `logos` bucket and replaces any old logo. |
| 3 | Company Settings | Fills in About us, website (https://abctech.com) and location (Lahore), then clicks Save. | Checks About us is up to 1,000 characters and the website starts with `http://` or `https://`, saves, and shows "Company updated". |
| 4 | Company Settings | Clicks "View company page". | Opens `/companies/abc-tech` with the logo, About us and the new job in the open jobs list (Flow 10). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Company Settings | Name filled in, no logo yet; blank fields with hints, for example "Tell candidates about your team" | Save button spinner; logo upload progress | "Company name is required", "Logo must be a PNG or JPG under 2 MB", "About us can be up to 1,000 characters", "Please enter a valid website, for example https://abctech.com", "Couldn't save, try again" | "Company updated" |

**What could go wrong**

The logo may be too big or not PNG or JPG, so the old logo must stay. The website may lack `https://`, so Save is blocked with an example. About us may be too long, so a character counter shows. A name change must not change the page address, so shared links keep working. Candidates must never open Company Settings. If the network fails, her typing must be kept.

**Test cases**

- Given Sara is in Company Settings, when she uploads a 3 MB logo for ABC Tech, then she sees "Logo must be a PNG or JPG under 2 MB" and the old logo stays.
- Given Sara is in Company Settings, when she enters "abctech" as the website and clicks Save, then she sees "Please enter a valid website, for example https://abctech.com" and nothing is saved.
- Given the ABC Tech page is at `/companies/abc-tech`, when Sara changes the company name and saves, then the page address stays `/companies/abc-tech`.
- Given Ali is logged in as a candidate, when he opens the Company Settings URL, then he sees "You don't have access to this page" and no settings.

---

## Flow 10 · Visitor views a company page

**Who and when:** Ali, on 17 Oct, after a friend says ABC Tech is hiring, or any logged-out visitor with a shared company link.

**Starts on:** Public job detail page (or a shared `/companies/abc-tech` link) · **Done when:** The visitor has read the company page and opened one of its open jobs.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public job detail | Clicks the company name "ABC Tech". | Opens `/companies/abc-tech`. |
| 2 | Company page | Reads About us, website, location and open jobs. | Shows logo, name, About us, website, location and only Open jobs, never drafts or closed jobs. Hides any empty part (About us, website or location). |
| 3 | Company page | Clicks the website. | Opens it in a new tab. |
| 4 | Company page | Clicks Junior Web Developer. | Opens the job with "Apply by 20 Oct · 3 days left" and Apply (applying is Flow 12). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Company page | "ABC Tech has no open jobs right now" | Skeleton header and job cards | "This company could not be found" | Company details and open jobs |

**What could go wrong**

Showing closed or draft jobs would confuse candidates, so the page must list only Open ones. A company may have no open jobs, so the page must say so. The page is public, so it must never show HR names, applicant counts or candidate data.

**Test cases**

- Given ABC Tech has one Open job, one Draft and one Closed job, when Ali opens `/companies/abc-tech`, then only the Open job is listed.
- Given Ali is on the Junior Web Developer job detail page, when he clicks "ABC Tech", then the ABC Tech company page opens.
- Given a visitor is not logged in, when they open `/companies/abc-tech`, then the page shows normally and contains no HR names, applicant counts or candidate data.
- Given someone opens `/companies/unknown-company`, when the page loads, then they see "This company could not be found".

---

## Flow 11 · Candidate finds a job

**Who and when:** Ali, on 17 Oct, after a friend says ABC Tech is hiring but he has no job link.

**Starts on:** Public jobs list · **Done when:** Ali is on the Junior Web Developer job page, ready to apply.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public jobs list | Searches "ABC Tech" and can filter by job type and location. | Shows Junior Web Developer · ABC Tech with "Apply by 20 Oct · 3 days left". |
| 2 | Public job detail | Opens the job (or a shared link, for example from LinkedIn). | Shows title, company, location, type, requirements, description, "Apply by 20 Oct · 3 days left" and Apply. The company name links to the company page (Flow 10). There is a Save button (Flow 26). |
| 3 | Public job detail | Clicks Apply. | Continues in Flow 12 (or Flow 2 or 3 first if he is logged out). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Public jobs list | "No open jobs right now", or "No jobs match your search" with "Clear filters" | Skeleton cards | "Couldn't load jobs" with Retry | Matching jobs with Apply by dates |
| Public job detail | N/A | Skeleton of the job page | "This job could not be found", "This job is no longer accepting applications", or "Applications closed on 20 Oct" | Job details, Apply by date, "3 days left" and Apply button |

**What could go wrong**

Drafts must never appear in the list or open from a link. The deadline may have passed since the link was shared, so the page must show "Applications closed on 20 Oct" instead of Apply. A search may find nothing, so the list must say so and offer "Clear filters".

**Test cases**

- Given Junior Web Developer has an Apply by date of 20 Oct, when Ali views it on 17 Oct, then he sees "Apply by 20 Oct · 3 days left" and an Apply button.
- Given Junior Web Developer is still Open with an Apply by date of 20 Oct, when Ali opens the job on 21 Oct, then the server closes the job with reason "Deadline passed" and Ali sees "Applications closed on 20 Oct" instead of Apply.
- Given no open job matches "xyz", when Ali searches "xyz", then he sees "No jobs match your search" with "Clear filters".

---

## Flow 12 · Candidate applies with a CV

**Who and when:** Ali, on a Friday evening, right after opening the Junior Web Developer job.

**Starts on:** Apply form (Ali is logged in, see Flows 2 and 3, and clicked Apply in Flow 11) · **Done when:** The application is submitted, Ali sees a confirmation, and My Applications shows "Applied".

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Apply form | Checks name and email, adds phone and an optional cover note, and uploads his PDF CV (drag and drop or choose a file). With a profile (Flow 25), his phone is filled in and he can pick "Use my default CV (ali-cv.pdf)" or upload a different CV for this job. | Checks the job is open, the deadline hasn't passed, Ali hasn't applied before, and the file is a PDF under 5 MB. |
| 2 | Apply form | Clicks Submit. | Checks the deadline again, saves the CV privately, saves the application as "Applied" and shows the confirmation. |
| 3 | Confirmation | Reads "Your application has been sent to ABC Tech". | Starts screening in the background (Flow 15); Ali doesn't wait. Sends the confirmation email (Flow 29). |
| 4 | My Applications | Opens My Applications. | Shows "Junior Web Developer · ABC Tech · Applied", never the score. (Tracking status is Flow 13.) |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Apply form | Name and email filled in (plus phone and default CV from his profile) and an empty upload box saying "Drag your PDF CV here or choose a file"; the upload box shows only if there's no default CV | Upload progress bar, then Submit spinner | "Only PDF files are accepted", "File must be under 5 MB", "You have already applied to this job", "This job is no longer accepting applications", "Applications for this job closed on 20 Oct", "This field is required", "Cover note can be up to 500 characters", "Your CV didn't upload, please try again", "Your default CV is no longer available. Please upload a CV" | Application saved and confirmation opens |
| Confirmation | N/A | N/A | N/A | "Your application has been sent to ABC Tech" with a link to My Applications |

**What could go wrong**

Ali may upload a Word file, a photo of his CV or a very large PDF, so each needs its own clear message. He may click Apply twice or try again later, so a second application to the same job must be blocked. The job may close, or the deadline may pass, while he fills in the form, so Submit must check both again.

**Test cases**

- Given Ali is on the apply form, when he uploads a .docx file, then he sees "Only PDF files are accepted" and the Submit button stays disabled.
- Given Ali is on the apply form, when he uploads a PDF of 7 MB, then he sees "File must be under 5 MB" and the file is not uploaded.
- Given Ali has already applied to Junior Web Developer, when he clicks Apply on the same job again, then he sees "You have already applied to this job" and no second application is created.
- Given Ali opened the apply form on 20 Oct, when he clicks Submit after the deadline has passed, then he sees "Applications for this job closed on 20 Oct" and no application is saved.
- Given Ali has saved a default CV, when he opens the apply form for Junior Web Developer, then his details are filled in and "Use my default CV (ali-cv.pdf)" is selected.

---

## Flow 13 · Candidate tracks application status, including on a phone

**Who and when:** Ali, on his commute, checking if ABC Tech has replied.

**Starts on:** My Applications on a phone (Ali is logged in, see Flow 3) · **Done when:** Ali sees his status and interview details with no sideways scrolling or broken controls.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Applications (phone) | Sees his list. | Shows each application as a full-width card with job title, company, applied date and status, or the empty state if he has none. |
| 2 | My Applications (phone) | Taps "Junior Web Developer · ABC Tech". | Opens the application detail. |
| 3 | Application detail (phone) | Reads the status timeline. | Shows Applied → Shortlisted → Interview with dates, plus the interview date, time, duration and a tappable meeting link (set in Flow 21). No score. |
| 4 | Application detail (phone) | Checks again later. | Shows each new status as HR changes it (Offer, Hired or Rejected, see Flow 20), or "Interview cancelled". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Applications (phone) | "You haven't applied to any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your applications" with Retry | Cards with title, company and status, never the score |
| Application detail (phone) | N/A | Skeleton timeline | "Couldn't load this application" with Retry | Status timeline and interview details, or "Interview cancelled" |

**What could go wrong**

Tables or long text may force sideways scrolling on a small screen. Long job titles or company names may push buttons off the screen. Small buttons may be hard to tap. A slow connection may show old status, so the page must load fresh data each time. Ali must see only his own application and status, never a score or anyone else's details, on any screen size.

**Test cases**

- Given Ali opens My Applications on a 360 px wide phone screen, when the page loads, then everything fits the screen with no horizontal scroll and all buttons can be tapped.
- Given a job titled "Junior Full Stack Web Developer (React, Node and REST APIs) — Remote Friendly" at a company with a very long name, when Ali views it on his phone, then the text wraps onto new lines and nothing is cut off or overlaps.
- Given Sara has moved Ali to Interview, when Ali opens his application on his phone, then the timeline shows "Interview" with the correct date, time and meeting link.
- Given Ali's application has a score of 74, when he views any screen on his phone, then no score or match percentage is shown anywhere.
- Given Ali is logged in, when he tries to open his score or another candidate's application by changing the URL, then he sees "You don't have access to this page" and no data is shown.

---

## Flow 14 · Candidate withdraws an application or deletes its data

**Who and when:** Ali, after accepting another offer, when he no longer wants ABC Tech to consider him.

**Starts on:** Application detail (from My Applications, Flow 13) · **Done when:** The application shows "Withdrawn", or the application and its CV are deleted.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Application detail | Opens Junior Web Developer · ABC Tech. | Shows the timeline with Withdraw (only while Applied or Shortlisted) and "Delete my data". |
| 2 | Application detail | Clicks Withdraw and confirms. | Sets the status to Withdrawn, adds it to the timeline and shows "Application withdrawn". Sara sees his card greyed out and can't move it (Flow 20). |
| 3 | Application detail | **Or:** clicks "Delete my data" and confirms. | Deletes the application, everything linked to it (screening, status history, notes, interviews, interview feedback, interview questions) and the CV file, then shows "Your data has been deleted". Sara no longer sees Ali for that job. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Application detail | N/A | Skeleton timeline; button spinner after confirming | "Couldn't load this application" with Retry; "You can't withdraw at this stage"; "Something went wrong, please try again" | "Application withdrawn" or "Your data has been deleted" |

**What could go wrong**

Withdrawing after Interview is not allowed, so Withdraw must be hidden or disabled after Shortlisted. "Delete my data" can't be undone, so it must be confirmed. Deleting must remove everything for that application, including the CV file, so HR can't see it.

**Test cases**

- Given Ali's application is Shortlisted, when he clicks Withdraw and confirms, then the status becomes Withdrawn and Sara sees his card greyed out.
- Given Ali's application to ABC Tech is Shortlisted, when he withdraws it, then a history row from Shortlisted to Withdrawn is saved with Ali as `changed_by`.
- Given Ali applied to Junior Web Developer at ABC Tech, when he clicks "Delete my data" on that application and confirms, then the application, its screening, history, notes and interviews and his CV file are removed, and Sara no longer sees Ali in that job's candidates list.
- Given Ali's application is at Interview, when he opens the application detail, then the Withdraw button is not available.

---

## Flow 15 · System screens a CV with AI in the background

**Who and when:** The system, right after Ali submits (Flow 12). Nobody waits.

**Starts on:** (Background) Ali's application is saved with screening status Queued · **Done when:** Sara sees Ali's score, or the screening is marked Pending or "CV could not be read" so HR can act (Flow 16).

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | (Background) | Nothing. | Sets screening to Processing. The CV is saved privately so only ABC Tech's HR and Ali can open it. Extracts the PDF text and removes name, email, phone, photo links and addresses before AI sees it. |
| 2 | (Background) | Nothing. | If there is almost no text (a scanned PDF), marks it "CV could not be read" and stops (Flow 16). |
| 3 | (Background) | Nothing. | Sends the CV text and job requirements to Google Gemini. AI returns found and missing requirements with CV evidence, rubric marks, experience dates and a short summary. |
| 4 | (Background) | Nothing. | Code calculates score, match percentage, years of experience and education match, and saves them. If AI fails (after one automatic retry), saves the application as "Pending" so HR can retry. |
| 5 | Candidates list (Sara) | Opens the job's candidates. | Shows "Queued" or "Screening…", then Ali's score and match percentage (74, 80%). |
| 6 | My Applications (Ali) | Opens My Applications. | Shows "Applied" only, never the score or screening status. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidates list (screening badge) | N/A | "Queued" or "Screening…" badge | "Pending" with "Retry screening"; "CV could not be read" | Score and match percentage shown |
| Candidate detail (screening panel) | N/A | "Screening in progress" with a spinner | "Screening pending" with Retry; "CV could not be read" with "Open original CV" | Full screening results shown |

**What could go wrong**

Gemini may be slow or down, so the application must still be saved and shown as "Applied" to Ali, and as "Pending" with a retry option to HR. Ali's personal details must be removed before the text goes to AI. Scores must stay steady: the same CV screened again should get a similar score, which is why AI only judges each requirement and code calculates the numbers. A scanned PDF has no text, so it must be clearly marked instead of getting a wrong score.

**Test cases**

- Given Google Gemini is unavailable, when Ali submits his application, then he sees the normal confirmation, My Applications shows "Applied", and Sara sees his application as "Pending" with "Retry screening".
- Given Ali's CV has been screened once with a score of 74, when the same CV is screened again for the same job, then the new score is within a few points of 74.
- Given Ali's CV contains his name, email and phone number, when the text is sent to Gemini, then none of those details are in the text that was sent.
- Given Ali's CV says "ReactJS" and the job requires "React", when screening runs, then React is marked found with the evidence "Developed dashboard components in ReactJS".

---

## Flow 16 · HR retries a failed or pending screening

**Who and when:** Sara, when a candidate shows "Pending" or "CV could not be read".

**Starts on:** Candidates list · **Done when:** The candidate has a score after a retry, or Sara has reviewed the CV by hand and added a note.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Candidates list | Sees Bilal with a "Pending" badge instead of a score. | Ranks screened candidates as normal and lists pending ones at the bottom with the badge. |
| 2 | Candidates list | Clicks "Retry screening" next to Bilal. | Sends his CV text and the job requirements to AI again and shows "Screening…" on his row only. |
| 3 | Candidates list | Waits or keeps working. | When done, shows Bilal's score and moves him to his place in the ranking. |
| 4 | Candidates list | Sees Hira with "CV could not be read". | Explains no text was found, likely because the PDF is a scan. |
| 5 | Candidate detail | Opens Hira and clicks "Open original CV". | Shows the original PDF. |
| 6 | Candidate detail | Reads the CV and adds a note: "Reviewed manually: 1 year React, no Git". | Saves the note. Hira stays in the list without a score. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidates list | "No one has applied yet. Share your job link" | "Screening…" on the retried row only | "AI is still unavailable, try again in a few minutes" on that row; "Screening is already in progress" | Score shown and candidate placed in the ranking |
| Candidate detail | N/A | Skeleton of the CV preview | "CV could not be read" with "Open original CV" | Original CV shown and note saved |

**What could go wrong**

AI may still be down after a retry, so the candidate stays "Pending" with a clear message and can be retried later. Sara may click Retry several times, so repeat clicks are ignored while one runs. Retrying never helps a scanned PDF (it has no text), so the app must point her to manual review. One pending screening must never block the rest of the list.

**Test cases**

- Given Bilal is "Pending" and AI is working again, when Sara clicks "Retry screening", then Bilal gets a score and appears in the right place in the ranking.
- Given AI is still unavailable, when Sara clicks "Retry screening", then Bilal stays "Pending" and she sees "AI is still unavailable, try again in a few minutes".
- Given Hira uploaded a scanned PDF with no text, when screening runs, then she shows "CV could not be read" and Sara can open the original CV and add a manual note.
- Given Bilal's screening is pending, when Sara filters, sorts or opens other candidates, then the list works normally.

---

## Flow 17 · HR reviews the ranked candidates list

**Who and when:** Sara, two days after posting, when 23 candidates have applied.

**Starts on:** HR dashboard · **Done when:** Sara sees the Junior Web Developer candidates ranked by score and has narrowed the list with filters.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Sees "Junior Web Developer · 23 applicants · 23 new" and clicks the job. | Opens the ranked candidates list. |
| 2 | Candidates list | Reads the list. | Ranks by score, for example: Ayesha 88 (92% match, 2 years, BS CS ✓), Ali 74 (80% match, 1 year, BS CS ✓), Usman 61 (60% match, 0.5 years, BS IT ✗). Pending and failed screenings sit at the bottom (Flow 16). |
| 3 | Candidates list | **Optional:** turns on the anonymised view. | Hides names in the list ("Candidate #1"). The name shows when she opens a candidate. |
| 4 | Candidates list | Sets filters: minimum score 70, at least 1 year experience, skill "React". | Updates the list at once and shows how many match. |
| 5 | Candidates list | Clicks a candidate. | Opens the candidate detail page (Flow 19). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs with applicant and new applicant counts |
| Candidates list | "No one has applied yet. Share your job link" or "No candidates match these filters" with "Clear filters" | Skeleton rows | "Couldn't load candidates" with Retry | Ranked list with score, match %, years, degree and status |

**What could go wrong**

Strict filters may leave nothing, so the list must say so and offer "Clear filters". Sara must never see another company's candidates, and logged-out users must never see an HR page.

**Test cases**

- Given 23 candidates have applied, when Sara opens the candidates list, then Ayesha (88), Ali (74) and Usman (61) appear in that order with their match percentage, years, degree found and degree match.
- Given 23 candidates have applied, when Sara sets the minimum score to 95, then she sees "No candidates match these filters" and a "Clear filters" button.
- Given another company has candidates for its own jobs, when Sara opens her candidates list, then she only sees candidates who applied to ABC Tech jobs.
- Given a user is not logged in, when they open the URL of an HR candidates page, then they are sent to the log in page and no candidate data is shown.

---

## Flow 18 · HR searches for a candidate

**Who and when:** Sara, when Ali emails her about his application and she wants to find him fast.

**Starts on:** Any HR page (top navigation search box) · **Done when:** Sara has found Ali and opened his candidate detail page.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Any HR page | Types "ali" in the top navigation search box. | From 2 characters, searches names and emails across ABC Tech jobs only. |
| 2 | Candidate search | Reads the results. | Shows matching candidates with job(s), score and status. Ali appears once, with each job he applied to. |
| 3 | Candidate search | Clicks Ali's Junior Web Developer result. | Opens his candidate detail page (Flow 19). |
| 4 | Candidates list | **Other way in:** uses the search box on the Candidates page. | Searches together with any filters already set (score, years, skill, status). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidate search | "Search by name or email" placeholder; "No candidates found for 'xyz'" with "Clear search" | "Searching…" | "Couldn't search right now, try again"; "Type at least 2 characters" | Matching candidates with job(s), score and status |

**What could go wrong**

Search must stay inside ABC Tech's candidates, even if a name matches someone at another company. Filters may hide a candidate, so the empty message must be clear. If search fails, the typed text must be kept.

**Test cases**

- Given a candidate named Bilal applied only to another company, when Sara searches "bilal", then she sees "No candidates found for 'bilal'".
- Given Ali applied to two ABC Tech jobs, when Sara types "ali" in the top navigation search, then Ali appears once with both jobs and their scores and statuses, and clicking a job opens his candidate detail page.
- Given Sara has set the minimum score to 70 on the Candidates page, when she searches "usman", then she sees "No candidates found for 'usman'" because Usman's score is 61.
- Given Sara types one letter "a", when she looks at the results, then she sees "Type at least 2 characters" and no search runs.

---

## Flow 19 · HR reviews a candidate and shortlists or rejects

**Who and when:** Sara, after narrowing the list (Flow 17) or finding a candidate by search (Flow 18).

**Starts on:** Candidates list · **Done when:** Sara has reviewed a candidate's AI breakdown and moved the best to Shortlisted (or a weak one to Rejected).

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Candidates list | Clicks Ali. | Opens his candidate detail page. On the first open, Ali stops counting as "new". |
| 2 | Candidate detail | Reads the CV preview, score breakdown, found requirements (HTML, CSS, React, Git, with CV evidence), missing requirements (REST APIs) and the AI summary. | Shows each found requirement with the CV line that proves it, and the note "AI suggestions are advice only — you make the decision". |
| 3 | Candidate detail | Adds a note: "Good React projects, ask about APIs". | Saves the note with her name and the time. |
| 4 | Candidate detail | Clicks Shortlist (or Reject for a weak candidate, which asks to confirm). | Moves the candidate to Shortlisted (or Rejected) and updates the status the candidate sees. |
| 5 | Candidates list | Goes back and shortlists Ayesha too. | Shows both with a "Shortlisted" badge. |

AI only advises. It never shortlists, rejects or hires anyone. Every status change is a click by Sara.

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidate detail | "No notes yet" in the notes box | Skeleton of the CV preview and score panel | "Couldn't load this candidate" with Retry; "CV preview has expired" with Reload; "Screening pending" with Retry screening | CV preview, score breakdown, found and missing requirements, summary, notes, Shortlist and Reject buttons; "Note saved", "Candidate shortlisted" or "Candidate rejected" |

**What could go wrong**

Sara may trust the score too much, so the page must show the evidence behind each match and remind her she decides. The CV preview link is short-lived, so an expired link must offer Reload, not a blank box. Rejecting is a big step, so it must be confirmed.

**Test cases**

- Given Sara is on Ali's detail page, when she adds a note and clicks Shortlist, then the note is saved with her name and time and Ali's status becomes Shortlisted.
- Given Sara opened Ali's detail page a while ago, when the CV preview link has expired, then she sees "CV preview has expired" and Reload shows the CV again.
- Given Sara has never opened Ali's application for Junior Web Developer, when she opens his candidate detail page, then the job card shows one fewer new applicant.

---

## Flow 20 · HR moves a candidate through the pipeline

**Who and when:** Sara, during interview week.

**Starts on:** Pipeline board · **Done when:** One candidate is Hired, the rest are Rejected, and every candidate sees their final status.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Pipeline board | Opens the Junior Web Developer board. | Shows columns Applied, Shortlisted, Interview, Offer, Hired and Rejected, with a card per candidate (name, score, days since applying). |
| 2 | Pipeline board | Drags Ali from Shortlisted to Interview (on a phone, uses the card's status dropdown). | Opens the schedule interview form (Flow 21). |
| 3 | Pipeline board | After the interview (Flows 21, 23 and 22), moves Ali to Offer, then later to Hired, confirming the Hired move. | Updates his status and saves a history entry each time. Ali sees "Offer", then "Hired" (Flow 13), and gets a status email (Flow 29). |
| 4 | Pipeline board | Moves each other candidate to Rejected one by one, confirming each. | Moves each to Rejected and updates their status. Each gets a short status email with no score (Flow 29). |
| 5 | Pipeline board | Sees Usman's card greyed out because he withdrew (Flow 14). | Blocks any move of a withdrawn card. |

When the position is filled, Sara closes the job (Flow 7).

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Pipeline board | "No candidates yet" in every column | Skeleton columns | "Couldn't move this candidate, try again" (the card goes back); "Couldn't load the board" with Retry; "This candidate has withdrawn" | Card in its new column; "Ali moved to Interview" |
| Confirm dialog | N/A | Confirm button spinner | "Couldn't save, try again" | "Move Ali to Hired?" or "Reject Ayesha?" confirmed; dialog closes and cards move |

**What could go wrong**

A drag may fail on a weak connection, so the card must go back and show an error instead of looking moved. Hiring or rejecting by mistake is costly, so both need confirmation. Withdrawn candidates can't be moved. AI never moves a candidate; every move is Sara's.

**Test cases**

- Given Ali is in Offer, when Sara moves him to Hired, then she is asked to confirm, and only after confirming does Ali see "Hired".
- Given Sara is on her phone, when she changes Ali's status with the dropdown, then the change is saved the same way as a drag.
- Given a move fails because the connection drops, when Sara drags a card, then the card goes back and she sees "Couldn't move this candidate, try again".
- Given Usman has withdrawn, when Sara views the board, then his card is greyed out and cannot be moved.

---

## Flow 21 · HR schedules an interview

**Who and when:** Sara, right after moving Ali to Interview (Flow 20).

**Starts on:** Schedule interview form · **Done when:** The interview is saved, Ali is in Interview, and he sees the date, time and meeting link.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Schedule interview | Enters date, time, duration (30 minutes by default), a meeting link (or office address) and the interviewer name, then clicks Save. | Saves the interview, moves Ali to Interview and updates his status. Emails Ali the date, time and meeting link (Flow 29). |
| 2 | (Ali's My Applications) | Ali opens his application. | Shows "Interview" with the date, time and meeting link (Flow 13). |
| 3 | Interviews page | Opens Interviews. | Shows upcoming interviews (soonest first) and past ones, each with candidate, job, time and status. |
| 4 | Interviews page | **If plans change:** reschedules Ali, or cancels after confirming. | Saves the change. Ali sees the new details or "Interview cancelled" and gets an email (Flow 29). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Schedule interview | Blank date, time and link fields; duration set to 30 minutes | Save button spinner | "Please choose a date in the future", "Add a meeting link or an office address", "Please enter a valid link", or "You already have an interview at this time" | Interview saved and shown on the card |
| Interviews page | "No interviews scheduled yet" | Skeleton list | "Couldn't load interviews" with Retry | Upcoming and past interviews listed |

**What could go wrong**

Sara may enter a past date or a broken link, or leave both link and address empty. She may book the same interviewer twice at one time, so the app must warn her and let her change the time or schedule anyway.

**Test cases**

- Given Ali is in Shortlisted, when Sara moves him to Interview and saves a date, time and link, then Ali's My Applications shows "Interview" with those details.
- Given Sara is on the schedule form, when she picks yesterday's date, then she sees "Please choose a date in the future" and nothing is saved.
- Given Sara leaves both the meeting link and the address empty, when she clicks Save, then she sees "Add a meeting link or an office address".
- Given Sara already has an interview with Ayesha at 11:00 on Tuesday, when she schedules Ali at 11:00 on Tuesday, then she sees "You already have an interview at this time".

---

## Flow 22 · HR records interview feedback

**Who and when:** Sara, straight after Ali's interview.

**Starts on:** Interview feedback form (from the Interviews page or Ali's candidate detail page) · **Done when:** The feedback is saved on Ali's candidate detail page and the interview is marked done.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Interview feedback | Fills in a rating from 1 to 5, strengths, concerns and a recommendation (Offer, Reject or Another round). | Checks a rating and a recommendation are filled in. |
| 2 | Interview feedback | Clicks Save. | Saves the feedback on Ali's candidate detail page (HR only) and marks the interview done. |
| 3 | Candidate detail | Reads the feedback. | Shows it next to the screening results. The recommendation is advice only: Ali's status changes only when Sara moves him on the board (Flow 20). |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Interview feedback | Blank form | Save button spinner | "Please add a rating and a recommendation" | Feedback saved and shown on the candidate detail page; interview marked done |

**What could go wrong**

Sara may skip the rating or recommendation, so Save must be blocked. Feedback is private, so Ali must never see the rating, strengths, concerns or recommendation. An "Offer" recommendation must not move Ali by itself.

**Test cases**

- Given Ali's interview is over, when Sara saves a rating of 4 with strengths, concerns and "Offer", then the interview is marked done and Ali's status does not change until Sara moves him.
- Given Sara is on the feedback form, when she clicks Save without a rating, then she sees "Please add a rating and a recommendation" and nothing is saved.
- Given Sara saved feedback for Ali, when Ali opens his application, then he sees none of the rating, strengths, concerns or recommendation.

---

## Flow 23 · HR generates interview questions with AI

**Who and when:** Sara, the day before Ali's interview.

**Starts on:** Candidate detail (Ali has a scheduled interview, Flow 21) · **Done when:** Sara has a saved question list for Ali's interview.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Candidate detail | Clicks "Generate questions". | Sends Ali's CV (personal details removed) and the job to AI and shows eight questions, including one on his missing REST APIs skill, each with a "what a good answer includes" hint. |
| 2 | Candidate detail | Deletes one question and adds her own, "Tell me about your GitHub portfolio", with the type "project". | Saves the list in order, linked to the interview. |
| 3 | Candidate detail | **Optional:** clicks Regenerate and confirms. | Writes a new set of eight AI questions and keeps Sara's own. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidate detail (questions) | "Generate questions" button and no questions yet; "Schedule an interview first" | "Writing questions…" spinner | "Couldn't generate questions" with Retry; "Question can't be empty"; "Please choose a question type" | Eight questions shown; "Question added" or "Question deleted" |

**What could go wrong**

AI may fail or be slow, so there must be a Retry, and Sara can still run the interview without it. AI may ask about a personal matter such as marital status, so the code must remove it and regenerate the set before Sara sees it. The button must wait until an interview is scheduled.

**Test cases**

- Given Google Gemini is unavailable, when Sara clicks "Generate questions", then she sees "Couldn't generate questions" with a Retry button, and the rest of the page keeps working.
- Given Ali has an interview scheduled and is missing REST APIs, when Sara clicks "Generate questions", then she sees eight questions, including one about REST APIs, each with a hint.
- Given Ali has no interview scheduled, when Sara opens his candidate detail page, then the button shows "Schedule an interview first" and is disabled.
- Given Sara is adding "Tell me about your GitHub portfolio", when she clicks Add without choosing a type, then she sees "Please choose a question type" and the question is not added.

---

## Flow 24 · HR views reports

**Who and when:** Sara, at month end, preparing an update for her manager.

**Starts on:** HR dashboard · **Done when:** Sara sees applicants per job, average score, the pipeline funnel, time to hire and the most missing skills, and can filter by job.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Clicks Reports. | Opens Reports for all ABC Tech jobs. |
| 2 | Reports | Reads the overview. | Shows applicants per job, average score, the funnel (Applied → Shortlisted → Interview → Offer → Hired), average time to hire and the most missing skills. |
| 3 | Reports | Picks "Junior Web Developer" in the job filter. | Updates every chart for that job, for example 23 applicants, average score 66, and REST APIs as the most missing skill. |
| 4 | Reports | Switches back to "All jobs". | Shows the totals again. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs and a Reports link |
| Reports | "Not enough data yet. Reports appear once candidates apply" | Skeleton charts | "Couldn't load reports" with Retry | Charts and numbers for the chosen job or all jobs |

**What could go wrong**

A new company may have no jobs or applicants, so charts must show a clear empty state, not zeros that look like errors. Time to hire needs a hire, so it shows "No hires yet" until then. Numbers must match the candidates list and pipeline, or Sara will lose trust. Reports use only ABC Tech's data.

**Test cases**

- Given a company has no jobs, when Sara opens Reports, then she sees "Not enough data yet" and no broken or empty charts.
- Given a job has no applicants, when Sara filters Reports by that job, then she sees "No applicants for this job yet" and time to hire shows "No hires yet".
- Given Junior Web Developer has 23 applicants with 2 shortlisted, when Sara filters Reports by that job, then the applicant count and funnel numbers match the candidates list and pipeline board exactly.
- Given another company has its own jobs and candidates, when Sara opens Reports, then none of that company's data appears in any chart or number.

---

## Flow 25 · Candidate sets up a profile and default CV

**Who and when:** Ali, on a Sunday afternoon, getting ready to apply to several jobs this week.

**Starts on:** My Profile · **Done when:** Ali's profile has his phone, city, headline and a default CV.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Profile | Opens My Profile from the menu. | Shows "Complete your profile to apply faster" with empty fields and an empty CV box. |
| 2 | My Profile | Enters phone, city "Lahore" and headline "Junior React developer", then clicks Save. | Saves and shows "Profile saved". |
| 3 | My Profile | Drags ali-cv.pdf into the CV box. | Checks it is a PDF under 5 MB, saves it privately as his default CV and shows "CV uploaded". |
| 4 | My Profile | **Later:** replaces it with a newer file, or deletes it after confirming. | Replaces or removes the default CV. CVs already sent are not affected. |

From now on, the apply form is filled in from his profile (Flow 12).

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Profile | "Complete your profile to apply faster" | Skeleton form; upload progress bar; Save spinner | "Only PDF files are accepted", "File must be under 5 MB", "Headline can be up to 100 characters", "Couldn't save, try again" | "Profile saved", "CV uploaded" or "Default CV deleted" |
| Delete CV dialog | N/A | Delete button spinner | "Couldn't delete, try again" | "Delete your default CV? CVs you already sent to companies are not affected." confirmed; empty CV box shown |

**What could go wrong**

Ali may upload a Word file or a very large PDF, so the same checks as applying apply. Replacing his default CV must never change a CV he already sent. Sara must never browse his profile.

**Test cases**

- Given Ali applied with ali-cv.pdf, when he replaces his default CV, then Sara still sees ali-cv.pdf on his application.
- Given Sara is HR, when she opens the URL of Ali's profile, then she sees "You don't have access to this page".
- Given Ali is on My Profile, when he uploads a .docx file as his default CV, then he sees "Only PDF files are accepted" and his old default CV stays.
- Given Ali types a headline longer than 100 characters, when he clicks Save, then he sees "Headline can be up to 100 characters" and the profile is not saved.

---

## Flow 26 · Candidate saves a job

**Who and when:** Ali, browsing jobs on Sunday, when he finds Junior Web Developer but wants to apply later.

**Starts on:** Public jobs list · **Done when:** Junior Web Developer is on Ali's Saved Jobs page.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public jobs list | Clicks Save on Junior Web Developer at ABC Tech. | Saves the job; the button shows "Saved". If Ali is logged out, asks him to log in first (Flow 3), then saves it. |
| 2 | Saved Jobs | Opens Saved Jobs. | Lists Junior Web Developer with "Apply by 20 Oct" and Apply. |
| 3 | Saved Jobs | **Later:** clicks Apply. | Opens the apply form (continues in Flow 12). |
| 4 | Saved Jobs | **Or:** clicks Remove on a job he no longer wants. | Removes it; the job page shows "Save" again. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Public jobs list | "No open jobs right now" | Skeleton cards; Save button disabled briefly | "Couldn't save this job, try again" | "Job saved"; button shows "Saved" |
| Saved Jobs | "You haven't saved any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your saved jobs" with Retry | Saved jobs with Apply, Applied or "Applications closed" |

**What could go wrong**

He may click Save twice, so the job is saved only once. A saved job may close or pass its deadline, so Saved Jobs must show "Applications closed" instead of Apply. HR must never see who saved their jobs.

**Test cases**

- Given Ali is logged in and viewing Junior Web Developer at ABC Tech, when he clicks Save, then the button shows "Saved" and the job appears on his Saved Jobs page with an Apply button.
- Given Ali is logged out, when he clicks Save on Junior Web Developer, then he is asked to log in, and after logging in he is back on the job with it saved.
- Given Ali saved Junior Web Developer and its Apply by date has passed, when he opens Saved Jobs, then it shows "Applications closed".
- Given Ali has saved a job, when he clicks Remove on Saved Jobs, then the job disappears from the list and the job page shows "Save" again.

---

## Flow 27 · User updates name, email and password

**Who and when:** Sara, after marrying and changing her surname, and wanting a stronger password.

**Starts on:** Settings page · **Done when:** Sara's new name is saved, her new email is confirmed, and her new password works at the next login.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Settings | Opens Settings from the user menu. | Shows Name, Email, Password, Email preferences (Flows 29 and 30) and a Company Settings link (Flow 9). |
| 2 | Settings – Name | Changes her name to "Sara Khan" and clicks Save. | Saves and shows "Name updated". The menu shows the new name. |
| 3 | Settings – Email | Enters sara.khan@abctech.com and clicks "Send confirmation link". | Sends a link to the new email and shows "Check your new email to confirm the change". The old email still works. |
| 4 | Email inbox | Clicks the confirmation link. | Changes the email and shows "Email updated". |
| 5 | Settings – Password | Enters her current password and a new password twice. | Shows the three password requirements and ticks each as she types. |
| 6 | Settings – Password | Clicks Save. | Checks the current password and the new password rules, saves, and shows "Password updated". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Settings – Name | Current name filled in | Save spinner | "This field is required" | "Name updated" |
| Settings – Email | Current email shown; new email blank | Button spinner | "Please enter a valid email", "Email already in use", "This link has expired, please request a new one" | "Check your new email to confirm the change", then "Email updated" |
| Settings – Password | Three blank fields, requirements unticked | Save spinner | "Current password is incorrect", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated" |

**What could go wrong**

Someone else may use Sara's open laptop, so a new password needs the current one. She may mistype her new email, so it changes only after she clicks the link, and the old email works until then. She may pick a weak password, so the requirements are shown and ticked as she types.

**Test cases**

- Given Sara is on Settings, when she changes her name to "Sara Khan" and saves, then she sees "Name updated" and the new name appears in the menu.
- Given Sara requested an email change, when she hasn't clicked the confirmation link yet, then she can still log in with her old email.
- Given Sara enters the wrong current password, when she clicks Save, then she sees "Current password is incorrect" and her password does not change.
- Given Sara enters the new password "abctech2026", when she clicks Save, then only the 8-character requirement is ticked and she sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".

---

## Flow 28 · Candidate deletes their account

**Who and when:** Ali, after finding a job, when he wants all his data removed from HireLens.

**Starts on:** Settings – Delete account · **Done when:** Ali's account and all his data are removed and he is logged out.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Settings – Delete account | Opens Settings and goes to Delete account. | Warns that this removes everything and can't be undone. Shows a field to type DELETE and a disabled Delete account button. |
| 2 | Settings – Delete account | Types DELETE. | Enables the button. |
| 3 | Settings – Delete account | Clicks Delete account. | Removes his account, profile, applications, CVs (including the default CV), saved jobs, screening results, status history, notes, interviews, interview feedback, interview questions and email log. Logs him out and shows "Your account has been deleted". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Settings – Delete account (candidate) | Button disabled until DELETE is typed | Button spinner | "Couldn't delete your account, try again" | Logged out; "Your account has been deleted" |

**What could go wrong**

Deleting removes everything, so Ali must type DELETE first. All his data must go, including CV files, so HR no longer sees him. HR accounts can't be deleted from Settings.

**Test cases**

- Given Ali is a candidate, when he types DELETE and deletes his account, then he is logged out and his CV and applications are removed.
- Given Ali has applied to ABC Tech, when he deletes his account, then Sara no longer sees him in her candidates list.
- Given Ali has not typed DELETE, when he looks at the Delete account button, then it stays disabled.
- Given Sara is HR, when she opens Settings, then she sees a link to Company Settings and no Delete account section.

---

## Flow 29 · Candidate receives email updates

**Who and when:** Ali, from applying until he hears the final decision.

**Starts on:** Ali submits his application (Flow 12) · **Done when:** Ali has the confirmation, status and interview emails he should get, none with a score.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Email inbox | Opens "Your application to ABC Tech was received". | Sent after Submit (Flow 12), with one button to My Applications. Always sent. |
| 2 | Email inbox | Opens the interview email after Sara schedules him (Flow 21). | Shows date, time, duration and meeting link. Also sent on reschedule or cancel. Always sent. |
| 3 | Email inbox | Opens "Update on your application to ABC Tech" each time Sara moves him to Shortlisted, Interview, Offer, Hired or Rejected (Flow 20). | Sent only if status emails are on. Never includes a score, AI summary or HR note. |
| 4 | Settings – Email preferences | **Optional:** turns off "Status updates". | Saves and shows "Preference saved". Application and interview emails still come. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Email (in the inbox) | N/A | N/A | N/A | Email received; the button opens the right page |
| Settings – Email preferences | Switches on by default, with a note that application and interview emails are always sent | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

**What could go wrong**

An email may fail to send, but the application or status change must still be saved and shown in My Applications. Emails must never contain a score, AI summary or HR note. A withdrawn candidate gets no more status emails.

**Test cases**

- Given Ali submits his application to Junior Web Developer, when the submission succeeds, then he gets an email "Your application to ABC Tech was received" with a button to My Applications.
- Given Ali has a score of 74, when Sara moves him to Interview and he gets the interview email, then the email has the date, time and meeting link but no score, AI summary or HR note.
- Given Ali has turned off status updates, when Sara moves him to Shortlisted, then no status email is sent, but he still gets interview emails.
- Given Resend is unavailable, when Sara moves Ali to Interview, then the move succeeds, Ali sees the new status in My Applications, and the email is logged as `failed`.

---

## Flow 30 · HR sends the daily applicant summary

**Who and when:** Sara, each morning, when she wants one email listing new applicants instead of one per CV.

**Starts on:** HR dashboard · **Done when:** Sara has the summary email listing new applicants per job, or sees there are none.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Clicks "Send today's summary". | Finds applications since the last summary and sends Sara one email, for example "Junior Web Developer · 5 new". Shows "Summary sent". |
| 2 | Email inbox | Opens the summary and clicks its button. | Opens the candidates list. |
| 3 | HR dashboard | Clicks the button again later, with no new applicants. | Shows "No new applicants since the last summary" and sends nothing. |
| 4 | Settings – Email preferences | **Optional:** turns off "Daily applicant summary". | Saves and shows "Preference saved". |

There is no scheduler on localhost, so for the demo the summary is sent from this button. A real 9:00 am scheduled job is a future step.

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard ("Send today's summary") | N/A | Button spinner | "Couldn't send the summary, try again" | "Summary sent", or "No new applicants since the last summary" |
| Settings – Email preferences | Switches on by default | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

**What could go wrong**

With no new applicants, no empty email should be sent. Sending may fail, so the failure is logged and Sara can try again. The summary must never include scores, AI results or HR notes.

**Test cases**

- Given 5 people applied to Junior Web Developer since the last summary, when Sara clicks "Send today's summary", then she gets one email listing "Junior Web Developer · 5 new".
- Given nobody has applied since the last summary, when Sara clicks "Send today's summary", then she sees "No new applicants since the last summary" and no email is sent.
- Given Sara has turned off "Daily applicant summary", when she clicks "Send today's summary", then no summary email is sent.

---

## Flows by feature

| Feature | Flow |
|---------|------|
| 01 · HR Sign Up | 1 |
| 02 · Candidate Sign Up | 2 |
| 03 · Login and Logout | 3 |
| 04 · Password Reset | 4 |
| 05 · Post a Job | 5 |
| 06 · Edit Job and Re-screen | 6 |
| 07 · Close, Reopen and Deadline | 7 |
| 08 · AI Job Description Writer | 8 |
| 09 · Company Profile and Logo | 9 |
| 10 · Public Company Page | 10 |
| 11 · Job Search | 11 |
| 12 · Apply with CV | 12 |
| 13 · My Applications | 13 |
| 14 · Withdraw and Delete Application Data | 14 |
| 15 · AI CV Screening | 15 |
| 16 · Retry Screening | 16 |
| 17 · Ranked Candidates List | 17 |
| 18 · Candidate Search | 18 |
| 19 · Candidate Review and Shortlist | 19 |
| 20 · Hiring Pipeline | 20 |
| 21 · Interview Scheduling | 21 |
| 22 · Interview Feedback | 22 |
| 23 · AI Interview Questions | 23 |
| 24 · Reports | 24 |
| 25 · Candidate Profile | 25 |
| 26 · Saved Jobs | 26 |
| 27 · Account Settings | 27 |
| 28 · Delete Account | 28 |
| 29 · Candidate Email Updates | 29 |
| 30 · HR Daily Summary | 30 |

# User flows

A flow is one thing a user sets out to do, step by step, from where they start to where they're done. For every screen we list the states it can be in, not just the happy one. These thirteen flows cover the full HireLens journey; Flows 1 to 4 are the Demo Day story.

**Running example:** The company **ABC Tech** is hiring a **Junior Web Developer** (1 year experience, BS Computer Science, skills HTML, CSS, React, Git and REST APIs). The HR user is **Sara** and the candidate is **Ali**.

---

## Flow 1 · HR signs up or logs in and posts a job

**Who and when:** Sara, an HR officer at a small company, on a Monday morning when her team needs a new developer.

**Starts on:** Landing page · **Done when:** The job is published, Sara has a shareable link, and the job appears on her dashboard.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Landing page | Clicks "I'm hiring". | Opens the HR sign up / log in page. |
| 2 | Sign up / Log in | **No account:** enters name, email, password and company name, then clicks Sign up. | Checks the details, creates the HR account and the ABC Tech company, and logs her in. |
| 3 | Sign up / Log in | **Has an account:** enters email and password, then clicks Log in. | Checks the details and logs her in. |
| 4 | Sign up / Log in | **Wrong details:** enters a wrong email or password. | Shows "Email or password is incorrect" with a "Forgot password" link, and keeps the email filled in. |
| 5 | HR dashboard | Sees the empty state and clicks "Post your first job". | Opens the create job form. |
| 6 | Create job form | Fills in title (Junior Web Developer), location, type, required years (1), degree (BS Computer Science), requirements (HTML, CSS, React, Git, REST APIs), a description and an optional "Apply by" date (20 Oct). Can optionally click "Write with AI" for the description (see Flow 9). | Checks required fields as she types, checks the Apply by date is not in the past, and shows what is missing. |
| 7 | Create job form | Clicks Publish. | Saves the job as Open, creates a public job link and shows it with a "Copy link" button. |
| 8 | Job published | Clicks "Copy link". | Copies the link and shows "Link copied". |
| 9 | HR dashboard | Goes back to the dashboard. | Shows the new job with 0 applicants, its status Open and "Apply by 20 Oct". |
| 10 | Company page | Clicks "View company page" in Company Settings. | Opens `/companies/abc-tech` with ABC Tech's logo, About us and the new job in its open jobs list. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Landing page | N/A | Page loading | "Something went wrong, please refresh" | "I'm hiring" and "I'm looking for a job" buttons shown |
| Sign up / Log in | Blank form with Sign up and Log in tabs | Button shows a spinner and is disabled | Field errors, "Email already in use", or "Email or password is incorrect" with "Forgot password" | Sara is logged in and sent to the HR dashboard |
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | List of jobs with applicant counts |
| Create job form | Blank form with hints | Publish button shows a spinner | Missing fields highlighted with a short message; "Apply by date can't be in the past"; "Couldn't publish, try again" | Job saved and the Job published screen opens |
| Job published | N/A | N/A | "Couldn't copy, select the link and copy it by hand" | Link shown and "Link copied" message |
| Company page | "ABC Tech has no open jobs right now" | Skeleton header and job cards | "This company could not be found" | Company details and the open job shown |

**What could go wrong**

Sara may try to sign up with an email that already has an account, so the app must tell her clearly and point her to log in. She may type the wrong password, so the error must not say which part was wrong and must offer "Forgot password". She may forget a required field such as the degree or requirements, so Publish must stay blocked until the form is complete. The network may drop while publishing, so her typed form must not be lost. She may pick an Apply by date that has already passed, so the form must stop her.

**Test cases**

- Given Sara has no account, when she signs up with her name, a new email, a valid password and "ABC Tech", then her account and company are created and she lands on the empty HR dashboard.
- Given an account already exists for sara@abctech.com, when Sara tries to sign up with that email, then she sees "Email already in use" and a link to log in.
- Given Sara has an account, when she logs in with the wrong password, then she sees "Email or password is incorrect" with a "Forgot password" link and stays on the log in page.
- Given Sara is on the create job form, when she clicks Publish without filling in the requirements, then the job is not published and the requirements field is highlighted with "This field is required".
- Given Sara is on the create job form, when she sets the Apply by date to yesterday, then she sees "Apply by date can't be in the past" and the job is not published.

---

## Flow 2 · Candidate signs up or logs in and applies with a CV

**Who and when:** Ali, a fresh graduate, on a Friday evening after seeing the job link on LinkedIn.

**Starts on:** Public job detail page · **Done when:** The application is submitted, Ali sees a confirmation, and My Applications shows the job as "Applied".

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public job detail | Opens the link and reads the Junior Web Developer job at ABC Tech. | Shows the title, company, location, type, requirements, description, "Apply by 20 Oct · 3 days left" and an Apply button. The company name links to the ABC Tech company page. |
| 2 | Public job detail | Clicks Apply. | Checks whether Ali is logged in. If not, opens the candidate sign up / log in page and remembers this job. |
| 3 | Sign up / Log in | **No account:** signs up with name, email and password. **Has an account:** logs in. | Creates or logs in the candidate account and returns him to the apply form for this job. |
| 4 | Apply form | Checks his name and email, adds his phone number and uploads his CV as a PDF. If he has a profile, his phone is filled in and he can choose "Use my default CV" or upload a different CV for this job. | Checks that the job is still open, that the deadline hasn't passed, that Ali has not applied before, that the file is a PDF, and that it is under 5 MB. |
| 5 | Apply form | Clicks Submit. | Checks the deadline again, saves the application with status "Applied" and shows the confirmation. |
| 6 | Confirmation | Reads "Your application has been sent to ABC Tech". | Starts the screening in the background (steps 7–9). Ali does not have to wait. Also emails Ali "Your application to ABC Tech was received". |
| 7 | (Background) | Nothing. | Saves the CV privately so only ABC Tech's HR and Ali can open it. Extracts the text from the PDF and removes name, email and phone before AI sees it. |
| 8 | (Background) | Nothing. | Sends the CV text and the job requirements to Google Gemini. AI returns found and missing requirements with evidence from the CV, rubric marks, experience dates and a short summary. |
| 9 | (Background) | Nothing. | Code calculates the score, match percentage, years of experience and education match, then saves the results. If AI fails, the application is saved as "Pending" so HR can retry. |
| 10 | My Applications | Opens My Applications. | Shows "Junior Web Developer · ABC Tech · Applied". Never shows the score. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Public job detail | N/A | Skeleton of the job page | "This job could not be found", "This job is closed and no longer accepting applications", or "Applications closed on 20 Oct" | Job details, Apply by date and Apply button shown |
| Sign up / Log in | Blank form | Button shows a spinner | Field errors, "Email already in use", or "Email or password is incorrect" | Ali is logged in and sent back to the apply form |
| Apply form | Form with name and email filled in (and phone and default CV from his profile) and an empty CV upload box | Upload progress bar, then Submit spinner | "Only PDF files are accepted", "File must be under 5 MB", "You have already applied to this job", "This job is closed", or "Applications for this job closed on 20 Oct" | Application saved and the confirmation opens |
| Confirmation | N/A | N/A | N/A | "Your application has been sent to ABC Tech" with a link to My Applications |
| My Applications | "You haven't applied to any jobs yet" with a link to browse jobs | Skeleton list | "Couldn't load your applications" with Retry | List of applications with their status only |

**What could go wrong**

Ali may upload a Word file, a photo of his CV or a very large PDF, so each case needs its own clear message. He may click Apply twice or come back later and try again, so the app must block a second application to the same job. The job may close while he is filling in the form, so the app must check again on Submit. Google Gemini may be slow or down, so the application must still be saved and shown as "Applied" to Ali, while HR sees it as "Pending" with a retry option. Ali's personal details must be removed before the CV text goes to AI. The deadline may pass while he is on the form, so Submit must check it again. The confirmation email may fail to send, but the application must still be saved.

**Test cases**

- Given Ali is on the apply form, when he uploads a .docx file, then he sees "Only PDF files are accepted" and the Submit button stays disabled.
- Given Ali is on the apply form, when he uploads a PDF of 7 MB, then he sees "File must be under 5 MB" and the file is not uploaded.
- Given Ali has already applied to Junior Web Developer, when he clicks Apply on the same job again, then he sees "You have already applied to this job" and no second application is created.
- Given Sara has closed the Junior Web Developer job, when Ali opens the job link and tries to apply, then he sees "This job is closed and no longer accepting applications".
- Given Google Gemini is unavailable, when Ali submits his application, then he sees the normal confirmation, My Applications shows "Applied", and Sara sees his application as "Pending" with "Retry screening".

---

## Flow 3 · HR reviews AI-ranked candidates and shortlists

**Who and when:** Sara, two days after posting, when 23 candidates have applied.

**Starts on:** HR dashboard · **Done when:** Sara has reviewed a candidate's AI breakdown and moved the best candidates to Shortlisted.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Sees "Junior Web Developer · 23 applicants · 23 new" and clicks the job. | Opens the ranked candidates list for this job. |
| 2 | Candidates list | Reads the list. | Shows candidates ranked by score, for example: Ayesha 88 (92% match, 2 years, BS CS ✓), Ali 74 (80% match, 1 year, BS CS ✓), Usman 61 (60% match, 0.5 years, BS IT ✗). |
| 3 | Candidates list | Sets filters: minimum score 70, at least 1 year experience, skill "React". | Updates the list straight away and shows how many candidates match. |
| 4 | Candidates list | Ali has emailed her, so she types "ali" in the search box in the top navigation. | Shows matching candidates from all ABC Tech jobs, with job(s), score and status. |
| 5 | Candidates list | Clicks Ali. | Opens Ali's candidate detail page. |
| 6 | Candidate detail | Reads the CV preview, score breakdown, found requirements (HTML, CSS, React, Git with evidence from the CV), missing requirements (REST APIs) and the AI summary. | Shows each found requirement with the line from the CV that proves it, and a note that "AI suggestions are advice only — you make the decision". |
| 7 | Candidate detail | Adds a note: "Good React projects, ask about APIs". | Saves the note with her name and the time. |
| 8 | Candidate detail | Clicks Shortlist (or Reject for a weak candidate). | Moves the candidate to Shortlisted (or Rejected) and updates the status the candidate sees. |
| 9 | Candidates list | Goes back and shortlists Ayesha too. | Shows both with a "Shortlisted" badge. |

AI only advises. It never shortlists, rejects or hires anyone on its own. Every status change is a click by Sara.

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs with applicant and new applicant counts |
| Candidates list | "No one has applied yet. Share your job link" or "No candidates match these filters" with "Clear filters" | Skeleton rows | "Couldn't load candidates" with Retry | Ranked list with score, match %, years, degree and status |
| Candidate search | "No candidates found for 'xyz'" | "Searching…" | "Couldn't search right now, try again"; "Type at least 2 characters" | Matching candidates with job(s), score and status |
| Candidate detail | N/A | Skeleton of the CV preview and score panel | "Couldn't load this candidate" with Retry; "Screening pending" with Retry screening | CV preview, score breakdown, found and missing requirements, summary, notes, Shortlist and Reject buttons |

**What could go wrong**

Filters may be so strict that nothing is left, so the list must say so and offer "Clear filters". Sara may trust the score too much, so the detail page must show the evidence behind each match and remind her that she decides. Scores must stay steady: if the same CV is screened again it should get a similar score, which is why AI only judges each requirement and code calculates the numbers. Sara must never see candidates from another company, and someone who is not logged in must never see any HR page. Search must also stay inside ABC Tech's own candidates, even if a name matches someone at another company.

**Test cases**

- Given 23 candidates have applied, when Sara sets the minimum score to 95, then she sees "No candidates match these filters" and a "Clear filters" button.
- Given Ali's CV has been screened once with a score of 74, when the same CV is screened again for the same job, then the new score is within a few points of 74.
- Given another company has candidates for its own jobs, when Sara opens her candidates list, then she only sees candidates who applied to ABC Tech jobs.
- Given a user is not logged in, when they open the URL of an HR candidates page, then they are sent to the log in page and no candidate data is shown.
- Given a candidate named Bilal applied only to another company, when Sara searches "bilal", then she sees "No candidates found for 'bilal'".

---

## Flow 4 · HR moves a candidate through the pipeline to hire

**Who and when:** Sara, during the interview week.

**Starts on:** Pipeline board · **Done when:** One candidate is Hired, the rest are Rejected, the job is closed, and candidates see their final status.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Pipeline board | Opens the board for Junior Web Developer. | Shows columns Applied, Shortlisted, Interview, Offer, Hired and Rejected, with each candidate as a card. |
| 2 | Pipeline board | Drags Ali from Shortlisted to Interview. | Opens the schedule interview form. |
| 3 | Schedule interview | Enters date, time and a meeting link, then clicks Save. | Saves the interview, moves Ali to Interview and updates his status. Emails Ali the date, time and meeting link. |
| 4 | (Ali's My Applications) | Ali opens his application. | Shows "Interview" with the date, time and meeting link. |
| 5 | Candidate detail | Sara clicks "Generate questions". | Sends Ali's CV and the job to AI and shows eight questions, including one about his missing REST APIs skill. |
| 6 | Interview feedback | After the interview, fills in a rating from 1 to 5, strengths, concerns and a recommendation. | Saves the feedback on Ali's candidate detail page (visible only to HR). |
| 7 | Pipeline board | Drags Ali to Offer, then later to Hired. | Updates his status each time. Ali sees "Offer", then "Hired". Ali also gets a status email each time (unless he turned status emails off). |
| 8 | Pipeline board | Moves each remaining candidate to Rejected one by one, confirming each move. | Moves each one to Rejected and updates their status. Each gets a short status email with no score. |
| 9 | Pipeline board | Clicks "Close job". | Asks to confirm, then closes the job. The public link stops accepting applications. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Pipeline board | "No candidates yet" in every column | Skeleton columns | "Couldn't move this candidate, try again" (the card goes back to where it was) | Card shown in its new column |
| Schedule interview | Blank date, time and link fields | Save button spinner | "Please choose a date in the future" or "Please enter a valid link" | Interview saved and shown on the card |
| Candidate detail (questions) | "Generate questions" button and no questions yet | "Writing questions…" spinner | "Couldn't generate questions" with Retry | Eight questions shown |
| Interview feedback | Blank form | Save button spinner | "Please add a rating and a recommendation" | Feedback saved and shown on the profile |
| My Applications (Ali) | N/A | Skeleton list | "Couldn't load your applications" with Retry | Current status and interview details, never the score |

**What could go wrong**

A drag may fail because of a weak connection, so the card must go back and show an error instead of appearing moved. Sara may enter a past date or a broken meeting link. AI question writing may fail or be slow, so there must be a Retry and Sara can still run the interview without it. Candidates must only see their own application and status, never their score or anyone else's details. An email may fail to send, but the status change must still be saved and shown in My Applications.

**Test cases**

- Given Ali is in Shortlisted, when Sara moves him to Interview and saves a date, time and link, then Ali's My Applications shows "Interview" with those details.
- Given Ali is logged in, when he tries to open his score or another candidate's application by changing the URL, then he sees "You don't have access to this page" and no data is shown.
- Given Google Gemini is unavailable, when Sara clicks "Generate questions", then she sees "Couldn't generate questions" with a Retry button, and the rest of the page keeps working.
- Given Ali is Hired and the others are Rejected, when Sara closes the job, then each candidate sees their final status and the job link shows "This job is closed".
- Given Ali has a score of 74, when Sara moves him to Interview and he gets the interview email, then the email has the date, time and meeting link but no score, AI summary or HR note.

---

## Flow 5 · Candidate tracks application status on a phone

**Who and when:** Ali, on his commute, checking if ABC Tech has replied.

**Starts on:** Login page on a phone · **Done when:** Ali sees his current status and interview details on My Applications without horizontal scrolling or broken controls, and can sign out.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Log in (phone) | Opens HireLens on his phone and enters his email and password. | Shows a single-column form with large tap targets and logs him in. |
| 2 | My Applications (phone) | Sees his list. | Shows each application as a full-width card with job title, company and status. If he has none, shows the empty state. |
| 3 | My Applications (phone) | Taps "Junior Web Developer · ABC Tech". | Opens the application detail. |
| 4 | Application detail (phone) | Reads the status timeline. | Shows Applied → Shortlisted → Interview with dates, and the interview date, time and a tappable meeting link. No score is shown. |
| 5 | Application detail (phone) | Taps the menu icon, then Sign out. | Opens the menu, signs him out and returns him to the log in page. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Log in (phone) | Blank form | Button spinner | "Email or password is incorrect" with "Forgot password" | Logged in and sent to My Applications |
| My Applications (phone) | "You haven't applied to any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your applications" with Retry | Cards with title, company and status |
| Application detail (phone) | N/A | Skeleton timeline | "Couldn't load this application" with Retry | Status timeline and interview details |
| Menu (phone) | N/A | N/A | "Couldn't sign out, try again" | Signed out and back on the log in page |

**What could go wrong**

Tables or long text may overflow and force sideways scrolling on a small screen. Long job titles or company names may push buttons off the screen. Small buttons may be hard to tap. A slow mobile connection may show stale status, so the page must load fresh data each time. The score must never appear on the candidate side, on any screen size.

**Test cases**

- Given Ali opens My Applications on a 360 px wide phone screen, when the page loads, then everything fits the screen with no horizontal scroll and all buttons can be tapped.
- Given a job titled "Junior Full Stack Web Developer (React, Node and REST APIs) — Remote Friendly" at a company with a very long name, when Ali views it on his phone, then the text wraps onto new lines and nothing is cut off or overlaps.
- Given Sara has moved Ali to Interview, when Ali opens his application on his phone, then the timeline shows "Interview" with the correct date, time and meeting link.
- Given Ali's application has a score of 74, when he views any screen on his phone, then no score or match percentage is shown anywhere.

---

## Flow 6 · HR handles a failed or pending screening

**Who and when:** Sara, when she notices one candidate shows "Pending" or "CV could not be read".

**Starts on:** Candidates list · **Done when:** The candidate has a score after a retry, or Sara has reviewed the CV manually and added a note.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Candidates list | Sees Ali with a "Pending" badge instead of a score. | Ranks all screened candidates as normal and lists pending ones at the bottom with the badge. |
| 2 | Candidates list | Clicks "Retry screening" next to Ali. | Sends his CV text and the job requirements to AI again and shows "Screening…" on his row only. |
| 3 | Candidates list | Waits or keeps working with other candidates. | When done, shows Ali's score and moves him to his place in the ranking. |
| 4 | Candidates list | Sees another candidate, Hira, with "CV could not be read". | Explains that no text was found, likely because the PDF is a scan. |
| 5 | Candidate detail | Opens Hira and clicks "Open original CV". | Shows the original PDF. |
| 6 | Candidate detail | Reads the CV herself and adds a note: "Reviewed manually: 1 year React, no Git". | Saves the note, and the candidate stays in the list without a score. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Candidates list | "No one has applied yet. Share your job link" | "Screening…" on the retried row only | "AI is still unavailable, try again in a few minutes" on that row | Score shown and the candidate placed in the ranking |
| Candidate detail | N/A | Skeleton of the CV preview | "CV could not be read" with "Open original CV" | Original CV shown and the note saved |

**What could go wrong**

AI may still be down after a retry, so the candidate must stay "Pending" with a clear message and the option to try later. Sara may click Retry several times, so the app must ignore repeat clicks while one is running. A scanned PDF has no text, so retrying will never help and the app must point her to manual review instead. One pending screening must never block the rest of the list.

**Test cases**

- Given Ali is "Pending" and AI is working again, when Sara clicks "Retry screening", then Ali gets a score and appears in the right place in the ranking.
- Given AI is still unavailable, when Sara clicks "Retry screening", then Ali stays "Pending" and she sees "AI is still unavailable, try again in a few minutes".
- Given Hira uploaded a scanned PDF with no text, when screening runs, then she shows "CV could not be read" and Sara can open the original CV and add a manual note.
- Given Ali's screening is pending, when Sara filters, sorts or opens other candidates, then the list works normally.

---

## Flow 7 · HR edits, closes or reopens a job

**Who and when:** Sara, when the requirements change or the position is filled.

**Starts on:** My Jobs · **Done when:** The job is updated, closed or reopened, and the public job link shows the correct state.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Jobs | Clicks Edit on Junior Web Developer. | Opens the edit job form with the current details. |
| 2 | Edit job form | Adds "TypeScript" to the requirements and clicks Save. | Warns: "23 candidates were screened against the old requirements. Re-screen them now?" with "Re-screen" and "Not now". |
| 3 | Edit job form | Clicks "Re-screen". | Saves the job, starts re-screening in the background, and shows progress on the candidates list. |
| 4 | My Jobs | Clicks "Close job" once the position is filled. | Asks to confirm, then marks the job Closed. The public link shows "This job is closed". |
| 5 | My Jobs | Later, clicks "Reopen job". | Marks the job Open again. The public link accepts applications again. |
| 6 | My Jobs | For another job, sees "Closed · Deadline passed" because its Apply by date was 20 Oct. Clicks Edit, sets a new Apply by date of 30 Oct and saves. | Shows "Deadline extended. The job is open again". The public link shows "Apply by 30 Oct" and the Apply button. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Jobs | "You have no jobs yet" with "Post your first job" | Skeleton list | "Couldn't load your jobs" with Retry | Jobs with status Open or Closed (with "Deadline passed" when that was the reason) and Edit, Close and Reopen actions |
| Edit job form | N/A | Save button spinner; "Re-screening 5 of 23…" | Missing fields highlighted; "Apply by date can't be in the past"; "Set a new Apply by date to reopen this job"; "Couldn't save, try again" | "Job updated" or "Deadline extended. The job is open again" |
| Public job detail | N/A | Skeleton of the job page | "This job is closed and no longer accepting applications" | Updated job details with Apply button |

**What could go wrong**

Sara may delete a required field while editing, so Save must be blocked. Changing requirements makes old scores out of date, so the app must warn her and let her choose whether to re-screen. Re-screening many candidates takes time and AI may fail for some, which then show as "Pending". A candidate may be partway through applying when the job is closed, so Submit must check again. Sara may try to reopen a job whose deadline has passed, so the app must ask her for a new Apply by date first.

**Test cases**

- Given Sara is editing the job, when she clears the title and clicks Save, then the job is not saved and the title field shows "This field is required".
- Given the job is closed, when Ali opens the job link and tries to apply, then he sees "This job is closed and no longer accepting applications".
- Given the job is closed, when Sara clicks "Reopen job", then the status becomes Open and the public link accepts applications again.
- Given Sara adds "TypeScript" to the requirements and clicks "Re-screen", when re-screening finishes, then each candidate's found and missing requirements include TypeScript and scores are updated.
- Given a job was closed because its Apply by date of 20 Oct passed, when Sara sets a new Apply by date of 30 Oct, then the job is Open again and the public link shows the Apply button.

---

## Flow 8 · User resets a forgotten password

**Who and when:** Ali or Sara, when they cannot remember their password.

**Starts on:** Log in page · **Done when:** The user sets a new password and is logged in to the correct dashboard for their role.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Log in | Clicks "Forgot password". | Opens the forgot password page. |
| 2 | Forgot password | Enters their email and clicks "Send reset link". | Always shows "If an account exists for this email, we've sent a reset link". Sends the email only if the account exists. |
| 3 | Email inbox | Opens the email and clicks the reset link. | Opens the set new password page if the link is still valid. |
| 4 | Set new password | Enters a new password twice and clicks Save. | Shows the three password requirements (8+ characters, one capital letter, one special character) under the field and ticks each one as the user types. Checks all three are met and both passwords match, then saves it. |
| 5 | Log in / Dashboard | Is logged in. | Sends Sara to the HR dashboard and Ali to My Applications. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Log in | Blank form with "Forgot password" link | Button spinner | "Email or password is incorrect" | Logged in |
| Forgot password | Blank email field | Button spinner | "Please enter a valid email" | Neutral "If an account exists…" message |
| Set new password | Two blank password fields | Save button spinner | "This link has expired, request a new one", "Password must be at least 8 characters and include one capital letter and one special character (like @)", or "Passwords don't match" | "Password updated" and logged in |
| Dashboard | Depends on role (see Flows 1 and 2) | Skeleton | "Couldn't load your dashboard" with Retry | Correct dashboard for the role |

**What could go wrong**

Telling someone that an email is not registered would let attackers find out who has an account, so the message must be the same either way. Reset links can be old or already used, so they must expire. Users may pick a weak password or mistype it. After the reset, the user must land on the dashboard for their own role, not the other one.

**Test cases**

- Given no account exists for test@example.com, when someone requests a reset for it, then they see the same "If an account exists for this email, we've sent a reset link" message and no email is sent.
- Given Ali's reset link is older than its time limit, when he opens it, then he sees "This link has expired, request a new one".
- Given Sara is on the set new password page, when she enters "123" or two passwords that don't match, then the password is not saved and she sees the matching error.
- Given Sara (HR) and Ali (candidate) each reset their password, when they are logged in, then Sara lands on the HR dashboard and Ali lands on My Applications.

---

## Flow 9 · HR writes a job description with AI

**Who and when:** Sara, when she needs to post a job quickly but does not have a written description.

**Starts on:** Create job form · **Done when:** The AI-written description is in the form, Sara has edited it, and the job is published.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Create job form | Enters the title, requirements (HTML, CSS, React, Git, REST APIs, 1 year, BS Computer Science) and a few key points such as "small friendly team, hybrid in Lahore". | Enables the "Write with AI" button once there is enough input. |
| 2 | Create job form | Clicks "Write with AI". | Sends only what Sara entered to AI and shows "Writing description…". |
| 3 | Create job form | Reads the draft in the description box. | Shows the draft with a note: "Review and edit before publishing". |
| 4 | Create job form | Doesn't like the tone and clicks "Regenerate". | Writes a new draft from the same input. |
| 5 | Create job form | Edits a few lines by hand. | Keeps her edits. |
| 6 | Create job form | Clicks Publish. | Publishes the job with her edited description and shows the shareable link. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Create job form | Blank form; "Write with AI" disabled with "Add a title and at least one requirement first" | "Writing description…" spinner in the description box | "Couldn't write a description right now. You can write it yourself or try again" | Draft in the description box, editable |
| Job published | N/A | N/A | "Couldn't copy, select the link and copy it by hand" | Link shown with "Copy link" |

**What could go wrong**

Sara may click the button with almost no input, which would make AI guess, so the button must stay disabled until there is enough. AI may be down, so she must still be able to write the description herself. AI may invent requirements she never asked for, such as "3 years of Angular", which would mislead candidates and change screening, so the draft must only use what she entered. Regenerating must not wipe edits without warning.

**Test cases**

- Given Sara has entered only the title, when she looks at "Write with AI", then the button is disabled with "Add a title and at least one requirement first".
- Given Google Gemini is unavailable, when Sara clicks "Write with AI", then she sees "Couldn't write a description right now" and can still type the description and publish.
- Given AI has written a draft, when Sara edits it and clicks Publish, then the published job shows her edited text, not the original draft.
- Given Sara entered HTML, CSS, React, Git and REST APIs as requirements, when AI writes the description, then it does not list any skill, degree or experience she did not enter.

---

## Flow 10 · HR views reports and analytics

**Who and when:** Sara, at the end of the month, preparing an update for her manager.

**Starts on:** HR dashboard · **Done when:** Sara sees applicants per job, average score, the pipeline funnel, time to hire and the most commonly missing skills, and can filter by job.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | HR dashboard | Clicks Reports. | Opens the Reports page for all ABC Tech jobs. |
| 2 | Reports | Reads the overview. | Shows applicants per job, average score, the pipeline funnel (Applied → Shortlisted → Interview → Offer → Hired), average time to hire, and the most commonly missing skills. |
| 3 | Reports | Chooses "Junior Web Developer" from the job filter. | Updates every chart for that job only, for example 23 applicants, average score 66, and REST APIs as the most missing skill. |
| 4 | Reports | Switches back to "All jobs". | Shows the totals again. |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| HR dashboard | "You have no jobs yet" with "Post your first job" | Skeleton cards | "Couldn't load your jobs" with Retry | Jobs and a Reports link |
| Reports | "Not enough data yet. Reports appear once candidates apply" | Skeleton charts | "Couldn't load reports" with Retry | Charts and numbers for the chosen job or all jobs |

**What could go wrong**

A new company may have no jobs or no applicants yet, so charts must show a clear empty state instead of zeros that look like errors. Time to hire can only be calculated once someone is hired, so it must say "No hires yet" until then. Numbers must match what Sara sees on the candidates list and pipeline, or she will lose trust in them. Reports must only use ABC Tech's own data.

**Test cases**

- Given a company has no jobs, when Sara opens Reports, then she sees "Not enough data yet" and no broken or empty charts.
- Given a job has no applicants, when Sara filters Reports by that job, then she sees "No applicants for this job yet" and time to hire shows "No hires yet".
- Given Junior Web Developer has 23 applicants with 2 shortlisted, when Sara filters Reports by that job, then the applicant count and funnel numbers match the candidates list and pipeline board exactly.
- Given another company has its own jobs and candidates, when Sara opens Reports, then none of that company's data appears in any chart or number.

---

## Flow 11 · Candidate sets up a profile and saves jobs

**Who and when:** Ali, on a Sunday afternoon, getting ready to apply to several jobs in the coming week.

**Starts on:** My Profile · **Done when:** Ali's profile has his phone, city, headline and a default CV, and Junior Web Developer is on his Saved Jobs page.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | My Profile | Opens My Profile from the menu. | Shows "Complete your profile to apply faster" with empty fields and an empty CV box. |
| 2 | My Profile | Enters his phone, city "Lahore" and headline "Junior React developer", then clicks Save. | Saves the profile and shows "Profile saved". |
| 3 | My Profile | Drags ali-cv.pdf into the CV box. | Checks it is a PDF under 5 MB, saves it privately as his default CV, and shows "CV uploaded". |
| 4 | Public jobs list | Browses jobs and clicks Save on Junior Web Developer at ABC Tech. | Saves the job; the button shows "Saved". |
| 5 | Saved Jobs | Opens Saved Jobs. | Lists Junior Web Developer with "Apply by 20 Oct" and an Apply button. |
| 6 | Apply form | Later clicks Apply from Saved Jobs. | Fills in his name, email and phone, and selects "Use my default CV (ali-cv.pdf)". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| My Profile | "Complete your profile to apply faster" | Skeleton form; upload progress bar; Save spinner | "Only PDF files are accepted", "File must be under 5 MB", "Headline can be up to 100 characters", "Couldn't save, try again" | "Profile saved" or "CV uploaded" |
| Public jobs list | "No open jobs right now" | Skeleton cards | "Couldn't save this job, try again" | "Job saved"; button shows "Saved" |
| Saved Jobs | "You haven't saved any jobs yet" with a link to browse jobs | Skeleton cards | "Couldn't load your saved jobs" with Retry | Saved jobs with Apply, Applied or "Applications closed" |
| Apply form | Upload box only if there's no default CV | Submit spinner | Same file errors as above | Prefilled form with the default CV selected |

**What could go wrong**

Ali may upload a Word file or a very large PDF as his default CV, so the same checks as applying must apply. He may click Save twice, so the job must only be saved once. A saved job may close or pass its deadline before he applies, so Saved Jobs must show "Applications closed" instead of Apply. Replacing his default CV later must never change a CV he already sent. Sara must never be able to browse his profile.

**Test cases**

- Given Ali has saved a default CV, when he opens the apply form for Junior Web Developer, then his details are filled in and "Use my default CV (ali-cv.pdf)" is selected.
- Given Ali is logged out, when he clicks Save on Junior Web Developer, then he is asked to log in, and after logging in he is back on the job with it saved.
- Given Ali saved Junior Web Developer and its Apply by date has passed, when he opens Saved Jobs, then it shows "Applications closed".
- Given Ali applied with ali-cv.pdf, when he replaces his default CV, then Sara still sees ali-cv.pdf on his application.
- Given Sara is HR, when she opens the URL of Ali's profile, then she sees "You don't have access to this page".

---

## Flow 12 · User updates profile settings and password

**Who and when:** Sara, after getting married and changing her surname, and wanting a stronger password.

**Starts on:** Settings page · **Done when:** Sara's new name is saved, her new email is confirmed, and her new password works at the next login.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Settings | Opens Settings from the user menu. | Shows Name, Email, Password, Email preferences and a link to Company Settings. |
| 2 | Settings – Name | Changes her name to "Sara Khan" and clicks Save. | Saves it and shows "Name updated". The menu shows the new name. |
| 3 | Settings – Email | Enters sara.khan@abctech.com and clicks "Send confirmation link". | Sends a link to the new email and shows "Check your new email to confirm the change". The old email still works. |
| 4 | Email inbox | Clicks the confirmation link. | Changes the email and shows "Email updated". |
| 5 | Settings – Password | Enters her current password and a new password twice. | Shows the three password requirements under the field and ticks each one as she types. |
| 6 | Settings – Password | Clicks Save. | Checks the current password and the new password rules, saves it and shows "Password updated". |
| 7 | Settings – Email preferences | Turns off "Daily applicant summary". | Saves it and shows "Preference saved". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Settings – Name | Current name filled in | Save spinner | "This field is required" | "Name updated" |
| Settings – Email | Current email shown; new email blank | Button spinner | "Please enter a valid email", "Email already in use", "This link has expired, please request a new one" | "Check your new email to confirm the change", then "Email updated" |
| Settings – Password | Three blank fields, requirements unticked | Save spinner | "Current password is incorrect", "Password must be at least 8 characters and include one capital letter and one special character (like @)", "Passwords don't match" | "Password updated" |
| Settings – Email preferences | Switches on by default | Switch disabled briefly | "Couldn't save your preference, try again" | "Preference saved" |

**What could go wrong**

Someone else may be using Sara's open laptop, so changing the password must need the current password. Sara may mistype her new email, so the change must only happen after she clicks the link sent to it, and her old email must keep working until then. She may pick a weak password, so the requirements must be shown and ticked as she types. For a candidate like Ali, deleting the account removes everything, so it must need him to type DELETE first.

**Test cases**

- Given Sara is on Settings, when she changes her name to "Sara Khan" and saves, then she sees "Name updated" and the new name appears in the menu.
- Given Sara requested an email change, when she hasn't clicked the confirmation link yet, then she can still log in with her old email.
- Given Sara enters the wrong current password, when she clicks Save, then she sees "Current password is incorrect" and her password does not change.
- Given Sara enters the new password "abctech2026", when she clicks Save, then only the 8-character requirement is ticked and she sees "Password must be at least 8 characters and include one capital letter and one special character (like @)".
- Given Ali is a candidate, when he types DELETE and deletes his account, then he is logged out and his CV and applications are removed.

---

## Flow 13 · Candidate browses a company page and applies before the deadline

**Who and when:** Ali, on 17 Oct, after a friend tells him ABC Tech is hiring but he doesn't have the job link.

**Starts on:** Public jobs list · **Done when:** Ali has read the ABC Tech company page and submitted his application before the 20 Oct deadline.

| Step | Screen | The user… | The app… |
|------|--------|-----------|----------|
| 1 | Public jobs list | Searches "ABC Tech". | Shows Junior Web Developer · ABC Tech with "Apply by 20 Oct · 3 days left". |
| 2 | Public job detail | Opens the job and clicks the company name "ABC Tech". | Opens `/companies/abc-tech`. |
| 3 | Company page | Reads About us, the website and location, and the list of open jobs. | Shows only Open jobs, never drafts or closed jobs. |
| 4 | Company page | Clicks Junior Web Developer. | Opens the job detail with "Apply by 20 Oct · 3 days left" and an Apply button. |
| 5 | Apply form | Clicks Apply, logs in, uploads his CV and clicks Submit. | Checks the deadline again, saves the application and shows "Your application has been sent to ABC Tech". |

**States on each screen**

| Screen | Empty | Loading | Error | Success |
|--------|-------|---------|-------|---------|
| Public jobs list | "No jobs match your search" with "Clear filters" | Skeleton cards | "Couldn't load jobs" with Retry | Matching jobs with Apply by dates |
| Public job detail | N/A | Skeleton of the job page | "This job could not be found"; "Applications closed on 20 Oct" | Job details, "3 days left" and Apply button |
| Company page | "ABC Tech has no open jobs right now" | Skeleton header and job cards | "This company could not be found" | Company details and open jobs |
| Apply form | Name and email filled in; empty CV upload box | Upload progress bar, then Submit spinner | File errors; "Applications for this job closed on 20 Oct" | Confirmation shown |

**What could go wrong**

The company page may show closed or draft jobs by mistake, which would confuse candidates, so it must list only Open ones. A company may have no open jobs, so the page must say so clearly. Ali may open the form just before the deadline and submit just after, so Submit must check the deadline again. The company page is public, so it must never show HR names, applicant counts or candidate data.

**Test cases**

- Given ABC Tech has one Open job, one Draft and one Closed job, when Ali opens `/companies/abc-tech`, then only the Open job is listed.
- Given Junior Web Developer has an Apply by date of 20 Oct, when Ali views it on 17 Oct, then he sees "Apply by 20 Oct · 3 days left" and an Apply button.
- Given the deadline was 20 Oct, when Ali opens the job on 21 Oct, then he sees "Applications closed on 20 Oct" instead of Apply.
- Given Ali opened the apply form on 20 Oct, when he clicks Submit after the deadline has passed, then he sees "Applications for this job closed on 20 Oct" and no application is saved.
- Given someone opens `/companies/unknown-company`, when the page loads, then they see "This company could not be found".

---

## All flows

1. HR signs up or logs in and posts a job
2. Candidate signs up or logs in and applies with a CV
3. HR reviews AI-ranked candidates and shortlists
4. HR moves a candidate through the pipeline to hire
5. Candidate tracks application status on a phone
6. HR handles a failed or pending screening
7. HR edits, closes or reopens a job
8. User resets a forgotten password
9. HR writes a job description with AI
10. HR views reports and analytics
11. Candidate sets up a profile and saves jobs
12. User updates profile settings and password
13. Candidate browses a company page and applies before the deadline

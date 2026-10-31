# HireLens — Database

This file describes every table HireLens needs. It is based on the "Data Used", "Business Rules and Permissions" and "Functional Requirements" sections of `docs/features/01` to `23`. Names are copied exactly from the feature files. Section 7 lists the decisions that settled earlier differences between the files.

No table exists yet. Each table is created only through SQL given to the user to run in the Supabase SQL Editor, feature by feature. After each feature, this file is updated with the tables and columns it created.

---

## 1. Overview

HireLens stores companies and their HR user, the jobs they post, the candidates who apply with a PDF CV, and the AI screening result for each application. HR moves applications through a pipeline, and every move is logged. It also stores interviews, interview feedback, interview questions, saved jobs and an email log. All tables are in the `public` schema. Automatic Row Level Security is on, so every table needs explicit policies or its data is blocked.

| Table | Purpose | Used by features |
|-------|---------|------------------|
| `companies` | One row per company: name, logo and public page details | 01, 02, 06, 07, 23 |
| `profiles` | One row per user (HR or candidate), linked to the Supabase Auth user | 01, 08, 14, 15, 17, 20, 21, 22, 23 |
| `jobs` | Jobs posted by a company | 02, 03, 04, 05, 06, 07, 08, 11, 18, 19, 21, 23 |
| `applications` | One candidate's application to one job, with their name, email, CV path and status | 02, 08, 09, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23 |
| `screenings` | The AI screening result for one application | 03, 10, 11, 12, 13, 14, 18, 19, 22 |
| `status_history` | A log of every status change of an application | 08, 09, 10, 15, 19, 22, 23 |
| `notes` | HR notes on an application | 10, 11, 14, 22 |
| `interviews` | Scheduled interviews | 09, 10, 16, 17, 18, 22, 23 |
| `interview_feedback` | HR feedback for one interview (HR only) | 10, 14, 17, 22 |
| `interview_questions` | AI and HR interview questions for one interview | 10, 18, 22 |
| `saved_jobs` | Jobs a candidate saved for later | 21, 22 |
| `notifications` | A log of every email sent or failed | 22, 23 |

Feature 05 (AI Job Description Writer) stores nothing new. It only fills the `jobs` form.

**Rules used in every table**

- `id` is a `uuid` with default `gen_random_uuid()`, unless noted.
- Fixed lists (statuses, types) are stored as `text` with a check rule that only allows the values in section 3.
- "HR of the same company" means: the logged-in user has `profiles.role = 'hr'`, and their `profiles.company_id` is the company that owns the row (directly, or through the job the application belongs to).
- "Server only" means only server code using the secret key can do it. The browser cannot.
- This version has one HR user per company. Inviting team members is a future feature.
- Jobs are never deleted, only closed. Every foreign key to `jobs` uses **restrict**.

---

## 2. Tables

### 2.1 `companies`

**Purpose:** One row per company, created when an HR user signs up.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Company id |
| `name` | text | yes | — | Company name, for example "ABC Tech" |
| `slug` | text | yes | — | Public page address, for example `abc-tech`. Made from the name when the company is created. It never changes (Feature 06) |
| `logo_url` | text | optional | — | Link to the logo in the public `logos` bucket, at `{company_id}/logo.{png or jpg}` |
| `about` | text | optional | — | "About us", up to 1,000 characters (Feature 06) |
| `website` | text | optional | — | Must start with `http://` or `https://` (Feature 06) |
| `location` | text | optional | — | Company location (Feature 06) |
| `created_at` | timestamptz | yes | `now()` | When the company was created |

- **Primary key:** `id`
- **Foreign keys:** none
- **Unique rules:** `slug` is unique. If a slug is taken, a short number is added at the end.
- **Checks:** `about` is 1,000 characters or fewer, and `website` starts with `http://` or `https://` when filled.
- **Indexes:** unique index on `slug`, used by the public company page.
- **Row Level Security:**
  - **Select:** anyone, even logged out. Every column (name, slug, logo, about, website, location) is public info for job pages and the company page.
  - **Insert:** server only, during HR sign up.
  - **Update:** HR of this company only.
  - **Delete:** nobody. No feature deletes a company.

---

### 2.2 `profiles`

**Purpose:** One row per user, with the same `id` as the Supabase Auth user.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Same as the Auth user's id |
| `full_name` | text | yes | — | User's full name |
| `email` | text | yes | — | Kept in step with the Auth email (it changes only after the new email is confirmed, Feature 22) |
| `role` | text | yes | — | `hr` or `candidate`. Set at sign up and never changed |
| `company_id` | uuid | optional | — | Filled for HR, empty for candidates |
| `created_at` | timestamptz | yes | `now()` | When the account was created |
| `phone` | text | optional | — | Candidate only (Feature 20) |
| `city` | text | optional | — | Candidate only. Never sent to AI or used in screening (Feature 20) |
| `headline` | text | optional | — | Candidate only, up to 100 characters (Feature 20) |
| `default_cv_path` | text | optional | — | Candidate only. Path of the default CV in the `cvs` bucket (Feature 20) |
| `email_status_updates` | boolean | yes | `true` | Candidate email preference for status emails (Feature 23) |
| `email_daily_summary` | boolean | yes | `true` | HR email preference for the daily summary (Feature 23) |

- **Primary key:** `id`
- **Foreign keys:**
  - `id` → Auth user (`auth.users.id`). On delete: **cascade**, so deleting the Auth user removes the profile.
  - `company_id` → `companies.id`. On delete: **restrict**, because companies are never deleted.
- **Unique rules:**
  - `email` is unique (one email, one account).
  - `company_id` is unique when filled (one HR user per company in this version).
- **Checks:** `role = 'hr'` needs a `company_id`, and `role = 'candidate'` must have an empty `company_id`. `headline` is 100 characters or fewer.
- **Indexes:** the unique `company_id` and `email`.
- **Row Level Security:**
  - **Select:** the user can read their own row only. HR never reads candidate profiles. Candidate names and emails come from `applications`, and note authors come from `notes.author_name`.
  - **Insert:** server only, at sign up.
  - **Update:** the user can update their own row, but not `role`, `company_id` or `email`. These are protected in server code or by a database check. `email` changes only through the Auth confirmation.
  - **Delete:** server only, when a candidate deletes their account (Feature 22). HR accounts are not deleted.

---

### 2.3 `jobs`

**Purpose:** A job posted by a company, from draft to open to closed.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Job id |
| `company_id` | uuid | yes | — | The company that owns the job |
| `title` | text | yes | — | Job title. The only field needed for a draft |
| `slug` | text | optional | — | Public link, for example `abc-tech-junior-web-developer`. Set when the job is first published |
| `location` | text | optional | — | Needed to publish |
| `job_type` | text | optional | — | `full-time`, `part-time`, `internship` or `remote`. Needed to publish |
| `required_years` | integer | optional | — | Whole number from 0 to 30. Needed to publish |
| `required_degree` | text | optional | — | Needed to publish |
| `requirements` | jsonb | yes | `'[]'` | List of `{ "name": "React", "type": "must" }`. `type` is `must` or `nice`. At least one item is needed to publish |
| `description` | text | optional | — | Needed to publish |
| `status` | text | yes | `'draft'` | `draft`, `open` or `closed` |
| `apply_by` | date | optional | — | Deadline. Cannot be in the past when saved. Ends at 11:59 pm Pakistan time on this day |
| `closed_reason` | text | optional | — | `manual` or `deadline`. Filled only when the job is closed |
| `created_at` | timestamptz | yes | `now()` | When the job was created |
| `updated_at` | timestamptz | yes | `now()` | Last change |
| `closed_at` | timestamptz | optional | — | When the job was closed |

- **Primary key:** `id`
- **Foreign keys:** `company_id` → `companies.id`. On delete: **restrict**.
- **Unique rules:**
  - `slug` is unique (when filled). If a slug is taken, a short number is added.
  - A company cannot have two jobs with the same title while both are `draft` or `open`. This is a unique index on `company_id` + `lower(title)`, only for rows with status `draft` or `open`.
- **Checks:** `required_years` from 0 to 30. `job_type`, `status` and `closed_reason` only allow the values in section 3. `closed_reason` is empty unless `status = 'closed'`.
- **Indexes:** `company_id`, `status`, `status` + `apply_by` (finding open jobs past their deadline), and the unique `slug`.
- **Deadline close:** There is no scheduler (localhost only). Whenever a job is read (job lists, the public job page, apply submit, HR pages), if `apply_by` has passed and the job is still `open`, the server sets `status = 'closed'`, `closed_reason = 'deadline'` and `closed_at`.
- **Row Level Security:**
  - **Select:**
    - Anyone, even logged out, can read jobs with status `open` or `closed`. This is how the public link works (Feature 07).
    - The public jobs list and the company page show `open` jobs only.
    - Drafts are only visible to HR of the same company.
  - **Insert:** HR of the same company.
  - **Update:** HR of the same company, plus the server for the deadline close.
  - **Delete:** nobody. Jobs are never deleted, only closed.

---

### 2.4 `applications`

**Purpose:** One candidate's application to one job.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Application id |
| `job_id` | uuid | yes | — | The job applied to |
| `candidate_id` | uuid | yes | — | The candidate's `profiles.id` |
| `candidate_name` | text | yes | — | Copied from the apply form on submit. HR reads names only from here |
| `candidate_email` | text | yes | — | Copied from the apply form on submit. HR reads emails only from here |
| `cv_file_path` | text | yes | — | Path of this application's own CV copy in `cvs`: `{candidate_id}/applications/{job_id}/{original-file-name}.pdf`. It never changes when the default CV changes (Feature 20) |
| `phone` | text | yes | — | Phone entered on the apply form |
| `cover_note` | text | optional | — | Up to 500 characters |
| `status` | text | yes | `'applied'` | `applied`, `shortlisted`, `interview`, `offer`, `hired`, `rejected` or `withdrawn` |
| `screening_status` | text | yes | `'queued'` | `queued`, `processing`, `done`, `pending` or `failed` |
| `applied_at` | timestamptz | yes | `now()` | When the candidate applied |
| `updated_at` | timestamptz | yes | `now()` | Last change |
| `viewed_at` | timestamptz | optional | — | Set the first time HR opens the candidate detail page. Empty means "new" (Features 02 and 14) |

- **Primary key:** `id`
- **Foreign keys:**
  - `job_id` → `jobs.id`. On delete: **restrict**.
  - `candidate_id` → `profiles.id`. On delete: **cascade**, so deleting a candidate account removes their applications (Feature 22).
- **Unique rules:** one application per candidate per job, so `job_id` + `candidate_id` is unique.
- **Checks:** `cover_note` is 500 characters or fewer. `status` and `screening_status` only allow the values in section 3.
- **Indexes:**
  - `job_id`, `candidate_id`, and `job_id` + `status` (pipeline board and filters).
  - `job_id` + `viewed_at` (new applicant counts).
  - `applied_at` (reports and the daily summary).
  - `lower(candidate_name)` and `lower(candidate_email)` (candidate search).
- **On submit (server):** the application is saved with status `applied` and screening status `queued`. The first `status_history` row is written (from empty to `applied`), and screening starts (Feature 11).
- **Row Level Security:**
  - **Select:**
    - The candidate who owns the row.
    - HR of the company that owns the job.
    - This table holds no score, so candidates reading their own row is safe.
  - **Insert:** the candidate, for themselves only, and only when the job is `open` and its `apply_by` has not passed. This is checked again on Submit.
  - **Update:**
    - HR of the same company can change `status`, but never on a `withdrawn` row. HR can also set `viewed_at`.
    - The candidate can only set `status` to `withdrawn`, and only while it is `applied` or `shortlisted`.
    - `screening_status` is changed by the server only.
    - Column limits like these are safest in server code.
  - **Delete:**
    - The candidate who owns the row ("Delete my data", Feature 10). This removes the application and, by cascade, its screening, status history, notes, interviews, interview feedback and interview questions. The server also deletes the CV file.
    - The server, on account delete (Feature 22).
    - HR cannot delete.

---

### 2.5 `screenings`

**Purpose:** The AI screening result for one application. One row per application, created on the first attempt and replaced on re-screen.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Screening id |
| `application_id` | uuid | yes | — | The application screened |
| `score` | integer | optional | — | Total out of 100, calculated in code. Empty while pending or failed |
| `rubric_breakdown` | jsonb | optional | — | The six rubric parts with marks and reasons (see section 3) |
| `match_percent` | numeric | optional | — | Requirements found ÷ total requirements × 100 |
| `must_have_match` | numeric | optional | — | Must-have match percentage |
| `nice_to_have_match` | numeric | optional | — | Nice-to-have match percentage |
| `requirements_result` | jsonb | optional | — | Each requirement with `name`, `type`, `found`, `evidence` |
| `experience_items` | jsonb | optional | — | Each job, internship or project with `title`, `type`, `start`, `end`, `relevant`, and how it was counted (full, half or not counted) |
| `relevant_years` | numeric | optional | — | Calculated in code (internships half, projects not counted, "present" = today) |
| `meets_required_years` | boolean | optional | — | `relevant_years` ≥ the job's `required_years` |
| `degree_match` | boolean | optional | — | Whether the CV degree matches the required degree |
| `degree_found` | text | optional | — | The degree found in the CV, from the AI's education result, for example "BS IT". Shown on the candidate list and detail page |
| `summary` | text[] | optional | — | The three-line AI summary |
| `cv_text_clean` | text | optional | — | CV text with name, email, phone, photo links and addresses removed. Used again by Feature 18 |
| `model_name` | text | optional | — | The Gemini model used |
| `screened_at` | timestamptz | optional | — | When the screening finished |
| `error_message` | text | optional | — | The reason when screening is `pending` or `failed`. Never shown raw to anyone |

While `applications.screening_status` is `pending` or `failed`, the score and result columns stay empty and `error_message` holds the reason.

- **Primary key:** `id`
- **Foreign keys:** `application_id` → `applications.id`. On delete: **cascade**.
- **Unique rules:** `application_id` is unique (one screening per application).
- **Checks:** `score` is from 0 to 100, and each percentage is from 0 to 100.
- **Indexes:** the unique `application_id`, and `score` (ranking).
- **Row Level Security:**
  - **Select:** HR of the company that owns the job. **Never candidates.**
  - **Insert / Update:** server only (screening runs only on the server).
  - **Delete:** server only, plus the cascade from `applications`.

---

### 2.6 `status_history`

**Purpose:** A permanent log of every status change of an application.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | History entry id |
| `application_id` | uuid | yes | — | The application that changed |
| `from_status` | text | optional | — | Old status. Empty for the first row, written on submit |
| `to_status` | text | yes | — | New status. `applied` for the first row |
| `changed_by` | uuid | optional | — | `profiles.id` of who made the change: the HR user, or the candidate for a change to `withdrawn` |
| `changed_at` | timestamptz | yes | `now()` | When it changed |

- **Primary key:** `id`
- **Foreign keys:**
  - `application_id` → `applications.id`. On delete: **cascade**.
  - `changed_by` → `profiles.id`. On delete: **set null**.
- **Unique rules:** none.
- **Checks:**
  - `from_status` and `to_status` only allow application status values.
  - A row whose `changed_by` is the candidate must have `to_status = 'withdrawn'`.
- **Indexes:** `application_id` + `changed_at` (timeline), and `to_status` (funnel and time to hire).
- **Row Level Security:**
  - **Select:** HR of the company that owns the job, and the candidate who owns the application (their timeline).
  - **Insert:** server only. It writes the first row on submit, and a row every time `applications.status` changes.
  - **Update / Delete:** nobody. Rows are only removed automatically by the cascade, when the candidate deletes their account (Feature 22) or deletes their data for that application (Feature 10).

---

### 2.7 `notes`

**Purpose:** Private HR notes on an application.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Note id |
| `application_id` | uuid | yes | — | The application the note is about |
| `author_id` | uuid | optional | — | `profiles.id` of the HR user who wrote it |
| `author_name` | text | yes | — | The HR user's name, saved when the note is written |
| `body` | text | yes | — | Note text. Cannot be empty |
| `is_manual_review` | boolean | yes | `false` | True when HR reviewed an unreadable CV by hand (Feature 11) |
| `created_at` | timestamptz | yes | `now()` | When it was written |

- **Primary key:** `id`
- **Foreign keys:**
  - `application_id` → `applications.id`. On delete: **cascade**.
  - `author_id` → `profiles.id`. On delete: **set null**.
- **Unique rules:** none.
- **Checks:** `body` is not empty.
- **Indexes:** `application_id` + `created_at`.
- **Row Level Security:**
  - **Select:** HR of the company that owns the job. **Never candidates.**
  - **Insert:** HR of the same company, with `author_id` set to themselves.
  - **Update / Delete:** nobody. Notes cannot be edited or deleted in this version. They are only removed by the cascade from `applications`.

---

### 2.8 `interviews`

**Purpose:** One scheduled interview for an application. One application can have several interviews. Feedback lives in `interview_feedback`.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Interview id |
| `application_id` | uuid | yes | — | The application |
| `scheduled_at` | timestamptz | yes | — | Date and time. Must be in the future when scheduled or rescheduled |
| `duration_minutes` | integer | yes | `30` | Length in minutes |
| `meeting_link` | text | optional | — | Online meeting link |
| `location` | text | optional | — | Office address |
| `interviewer_name` | text | optional | — | Name of the interviewer |
| `status` | text | yes | `'scheduled'` | `scheduled`, `done` or `cancelled` |
| `created_at` | timestamptz | yes | `now()` | When it was scheduled |
| `updated_at` | timestamptz | yes | `now()` | Last change (reschedule, cancel, done) |

- **Primary key:** `id`
- **Foreign keys:** `application_id` → `applications.id`. On delete: **cascade**.
- **Unique rules:** none.
- **Checks:** at least one of `meeting_link` or `location` is filled. `status` only allows the values in section 3.
- **Indexes:** `application_id`, `scheduled_at` (Interviews page), and `interviewer_name` + `scheduled_at` (overlap check).
- **Row Level Security:**
  - **Select:** HR of the company that owns the job, and the candidate who owns the application. This table holds no feedback, so the candidate can safely read their own rows (time, duration, link, location, status).
  - **Insert / Update:** HR of the same company. Cancelling is an update to `cancelled`.
  - **Delete:** nobody, except the cascade from `applications`.

---

### 2.9 `interview_feedback`

**Purpose:** HR's feedback for one interview. HR only.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Feedback id |
| `interview_id` | uuid | yes | — | The interview |
| `rating` | integer | yes | — | Whole number from 1 to 5 |
| `strengths` | text | optional | — | Strengths |
| `concerns` | text | optional | — | Concerns |
| `recommendation` | text | yes | — | `offer`, `reject` or `another_round`. Advice only, it never changes the pipeline status |
| `created_by` | uuid | optional | — | `profiles.id` of the HR user who wrote it |
| `created_at` | timestamptz | yes | `now()` | When it was saved |

- **Primary key:** `id`
- **Foreign keys:**
  - `interview_id` → `interviews.id`. On delete: **cascade**.
  - `created_by` → `profiles.id`. On delete: **set null**.
- **Unique rules:** `interview_id` is unique (one feedback record per interview).
- **Checks:** `rating` from 1 to 5. `recommendation` only allows the values in section 3.
- **Indexes:** the unique `interview_id`.
- **Row Level Security:**
  - **Select / Insert / Update:** HR of the company that owns the job.
  - **Delete:** nobody, except the cascade.
  - **Candidates:** never.

---

### 2.10 `interview_questions`

**Purpose:** The question list for one interview, written by AI or added by HR.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Question id |
| `interview_id` | uuid | yes | — | The interview the question belongs to |
| `type` | text | yes | — | `technical`, `behavioural` or `project`. HR-added questions must choose one too |
| `question` | text | yes | — | Question text. Cannot be empty |
| `good_answer_hint` | text | optional | — | "What a good answer includes". Always filled for AI questions, optional for HR questions |
| `focus` | text | optional | — | The skill or topic the question checks, for example "REST APIs (missing)" |
| `source` | text | yes | — | `ai` or `hr`. On Regenerate, `ai` rows are replaced and `hr` rows are kept |
| `position` | integer | yes | — | Display order |
| `created_at` | timestamptz | yes | `now()` | When it was added |

- **Primary key:** `id`
- **Foreign keys:** `interview_id` → `interviews.id`. On delete: **cascade**.
- **Unique rules:** none.
- **Checks:** `type` and `source` only allow the values in section 3, and `question` is not empty.
- **Indexes:** `interview_id` + `position`.
- **Row Level Security:**
  - **Select / Insert / Update / Delete:** HR of the company that owns the job. AI questions are saved by the server.
  - **Candidates:** never.

---

### 2.11 `saved_jobs`

**Purpose:** Jobs a candidate saved to apply to later.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Saved row id |
| `candidate_id` | uuid | yes | — | The candidate's `profiles.id` |
| `job_id` | uuid | yes | — | The saved job |
| `saved_at` | timestamptz | yes | `now()` | When it was saved (the list is newest first) |

- **Primary key:** `id`
- **Foreign keys:**
  - `candidate_id` → `profiles.id`. On delete: **cascade**.
  - `job_id` → `jobs.id`. On delete: **restrict** (jobs are never deleted; a closed job shows "Applications closed").
- **Unique rules:** `candidate_id` + `job_id` is unique (one row per candidate and job).
- **Indexes:** the unique pair, and `candidate_id` + `saved_at`.
- **Row Level Security:**
  - **Select:** the candidate who owns the row. **HR never** (HR never sees who saved a job).
  - **Insert:** a logged-in candidate, for themselves, and only for `open` jobs.
  - **Update:** nobody.
  - **Delete:** the candidate who owns the row (Unsave / Remove), and the cascade on account delete.

---

### 2.12 `notifications`

**Purpose:** A log of every email HireLens tried to send.

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | yes | `gen_random_uuid()` | Log id |
| `user_id` | uuid | yes | — | The `profiles.id` the email was sent to |
| `type` | text | yes | — | See section 3 |
| `application_id` | uuid | optional | — | The application the email is about |
| `interview_id` | uuid | optional | — | The interview the email is about |
| `sent_at` | timestamptz | yes | `now()` | When it was sent or tried |
| `status` | text | yes | — | `sent` or `failed` |
| `error_message` | text | optional | — | Why sending failed |

- **Primary key:** `id`
- **Foreign keys:**
  - `user_id` → `profiles.id`. On delete: **cascade**.
  - `application_id` → `applications.id`. On delete: **cascade**.
  - `interview_id` → `interviews.id`. On delete: **cascade**.
- **Unique rules:** none.
- **Checks:** `type` and `status` only allow the values in section 3.
- **Indexes:** `user_id` + `type` + `sent_at` (to find the last daily summary).
- **Daily summary:** sent from a server route that HR triggers with the "Send today's summary" button (no scheduler on localhost). "New applicants" for the summary are applications with `applied_at` after the last `daily_summary` row for that HR user.
- **Row Level Security:**
  - **Select / Insert / Update / Delete:** server only. No screen shows this log.

---

## 3. Status values and fixed lists

| List | Column | Allowed values |
|------|--------|----------------|
| Application status | `applications.status`, `status_history.from_status`, `status_history.to_status` | `applied`, `shortlisted`, `interview`, `offer`, `hired`, `rejected`, `withdrawn` |
| Screening status | `applications.screening_status` | `queued`, `processing`, `done`, `pending`, `failed` |
| Job status | `jobs.status` | `draft`, `open`, `closed` |
| Job type | `jobs.job_type` | `full-time`, `part-time`, `internship`, `remote` |
| Job closed reason | `jobs.closed_reason` | `manual`, `deadline` |
| Requirement type | `jobs.requirements[].type`, `screenings.requirements_result[].type` | `must`, `nice` |
| User role | `profiles.role` | `hr`, `candidate` |
| Interview status | `interviews.status` | `scheduled`, `done`, `cancelled` |
| Interview recommendation | `interview_feedback.recommendation` | `offer`, `reject`, `another_round` |
| Interview question type | `interview_questions.type` | `technical`, `behavioural`, `project` |
| Interview question source | `interview_questions.source` | `ai`, `hr` |
| Notification type | `notifications.type` | `application_received`, `status_changed`, `interview_scheduled`, `interview_rescheduled`, `interview_cancelled`, `daily_summary` |
| Notification status | `notifications.status` | `sent`, `failed` |
| Experience item type | `screenings.experience_items[].type` | `job`, `internship`, `project` |
| Rubric part | `screenings.rubric_breakdown[].part` | `skills_match` (max 35), `experience` (40), `education` (10), `structure_formatting` (5), `contact_summary_links` (5), `grammar_clarity` (5) |

**Allowed moves**

- **Screening:**
  - `queued` → `processing` → `done`, `pending` or `failed`.
  - Retry or re-screen goes back to `queued` or `processing`.
  - The `screenings` row is created on the first attempt.
- **Application:**
  - The first history row on submit goes from empty to `applied`.
  - HR can move between `applied`, `shortlisted`, `interview`, `offer`, `hired` and `rejected`. Moving to `hired` or `rejected` needs a confirmation.
  - Only the candidate sets `withdrawn`, and only from `applied` or `shortlisted`.
  - A `withdrawn` application cannot be moved.
- **Job:**
  - `draft` → `open` (publish).
  - `open` → `closed`: `manual` when HR closes it, or `deadline` when the server finds `apply_by` has passed.
  - `closed` → `open` (reopen). A job closed by its deadline reopens only when HR sets a new future `apply_by`.

---

## 4. Storage

### Bucket `cvs` (private)

It already exists. Never create it again, and never make a public bucket for CVs.

| File | Path | Saved in |
|------|------|----------|
| CV sent with an application | `{candidate_id}/applications/{job_id}/{original-file-name}.pdf` | `applications.cv_file_path` |
| Default CV | `{candidate_id}/default/{original-file-name}.pdf` | `profiles.default_cv_path` |

- The first folder is always the candidate's id, so storage policies can check the owner easily.
- When a candidate applies with their default CV, the file is **copied** to the application path. Replacing or deleting the default CV never changes a CV already sent (Feature 20).
- Using `job_id` in the path works because a candidate can apply to a job only once.
- PDF only, under 5 MB.

| Action | Application CVs | Default CVs |
|--------|-----------------|-------------|
| Read | The candidate who uploaded it, and HR of the company that owns the job, through a short-lived signed link | The candidate only (HR never sees profiles) |
| Upload | The candidate, into their own folder only | The candidate, into their own folder only |
| Delete | The candidate ("Delete my data") and the server on account delete | The candidate (Delete or Replace) and the server on account delete |
| Anyone else | Nothing | Nothing |

### Bucket `logos` (public)

It already exists in Supabase. Never create it again, and never store CVs in it.

| File | Path | Saved in |
|------|------|----------|
| Company logo | `{company_id}/logo.{png or jpg}` | `companies.logo_url` |

- Images only: PNG or JPG, under 2 MB. A new upload replaces the old logo.

| Action | Who |
|--------|-----|
| Read | Anyone, even logged out (logos show on job pages and company pages) |
| Upload / Replace | HR of that company only |
| Delete | HR of that company only |

---

## 5. Relationships

```
auth.users (Supabase Auth)
   │ 1:1
   ▼
profiles ──────────────┐ company_id (one HR per company)
   │                   ▼
   │               companies ── logo in bucket "logos"
   │                   │ 1:many
   │                   ▼
   │                  jobs ◄──────────── saved_jobs ──► profiles (candidate)
   │                   │ 1:many
   │ candidate_id      ▼
   └──────────────► applications ── CV in bucket "cvs"
                       │
       ┌───────────────┼──────────────┬───────────────┐
       │ 1:1           │ 1:many       │ 1:many        │ 1:many
       ▼               ▼              ▼               ▼
   screenings   status_history      notes         interviews
                (changed_by →    (author_id →         │
                 profiles)        profiles)     ┌─────┴──────────┐
                                                │ 1:1            │ 1:many
                                                ▼                ▼
                                       interview_feedback  interview_questions

notifications ──► profiles (user_id), applications (application_id), interviews (interview_id)
```

---

## 6. Privacy checks

- [x] **Candidates never read screenings.** `screenings` has no candidate select rule. Score, match percentages, degree found, AI summary and `cv_text_clean` live only there.
- [x] **Candidates never read scores.** `applications` holds no score columns, so candidates can safely read their own application row.
- [x] **Candidates never read HR notes.** `notes` has no candidate select rule.
- [x] **Candidates never read interview feedback or questions.**
  - Rating, strengths, concerns and recommendation live in `interview_feedback`, which only HR can read.
  - Candidates read only their own `interviews` rows: time, duration, link, location and status.
  - `interview_questions` is HR only.
- [x] **HR never reads another company's data.** Every HR rule checks that the row's company (directly, or through job → application) equals the HR user's `company_id`.
- [x] **HR never reads profiles or saved jobs.** `profiles` is own-row only. HR gets candidate names and emails from `applications`, and note authors from `notes.author_name`. `saved_jobs` has no HR rule.
- [x] **Public pages only read public data.**
  - Logged-out visitors can read `companies` (name, slug, logo, about, website, location), logos in the `logos` bucket, and `jobs` with status `open` or `closed`.
  - Open and closed jobs are public through their link. Only open jobs appear in the public jobs list and on the company page.
  - Drafts, applications and everything else are never public.
- [x] **Emails and the email log** are written by the server only, and never contain scores, AI results or HR notes.

---

## 7. Resolved decisions

These decisions settled the earlier differences between the feature files. Every feature file has been updated to match.

| # | Decision |
|---|----------|
| M1 | `applications.candidate_name` and `candidate_email` are copied from the apply form. HR reads names and emails only from `applications`, never from `profiles`. `notes.author_name` is saved when a note is written. Candidate search uses `candidate_name` and `candidate_email`. |
| M2 | Interview questions live in a separate `interview_questions` table. |
| M3 | Rating, strengths, concerns and recommendation live in `interview_feedback` (HR only). Candidates read their own `interviews` rows. |
| M4 | "Recommendation" is used everywhere. |
| M5 | On submit, the first `status_history` row goes from empty to `applied`. |
| M6 | `changed_by` can be the candidate, but only for a change to `withdrawn`. |
| M7 | History rows cannot be edited or deleted. They are removed automatically only when the candidate deletes their account or their data for that application. |
| M8 | Screening health uses `applications.screening_status`. A `screenings` row is created on the first attempt, with empty results and an `error_message` while pending or failed. |
| M9 | "Delete my data" removes the application, everything linked to it and the CV file. HR no longer sees that candidate for that job. |
| M10 | Jobs are never deleted, only closed. Foreign keys to `jobs` use restrict. A closed saved job shows "Applications closed". |
| M11 | Account delete also removes `notifications`, `interview_questions`, `interview_feedback` and the default CV file. |
| M12 | Open and closed jobs are public through their link. Only open jobs appear in the public jobs list and on the company page. |
| M13 | Notes cannot be edited or deleted in this version. |
| M14 | `applications.viewed_at` is set the first time HR opens the candidate detail page. "New" means `viewed_at` is empty. |
| M15 | Logos live in a public bucket `logos` (PNG or JPG, under 2 MB, `{company_id}/logo.{png or jpg}`). Only HR of that company can upload or replace. Anyone can read. No CVs there. |
| M16 | One HR user per company in this version. Inviting team members is a future feature. |
| M17 | CV paths: `{candidate_id}/applications/{job_id}/{original-file-name}.pdf` and `{candidate_id}/default/{original-file-name}.pdf`. |
| M18 | `screenings.degree_found` is filled from the AI's education result and shown on the candidate list and detail page. |
| M19 | `interview_questions.focus` is saved. HR-added questions must choose a type. |
| M20 | `notifications` has `application_id`, `interview_id` and `error_message`, and a fixed type list. |
| M21 | `interviews` has `created_at` and `updated_at`. `interview_questions` has `position` for display order. |
| M22 | No scheduler: the server closes past-deadline jobs whenever a job is read. The daily summary is sent from a "Send today's summary" button. A real scheduled job is a future step. |
| M23 | `companies` is publicly readable. Only HR of that company can update it. |

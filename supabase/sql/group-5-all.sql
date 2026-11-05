-- Group 5 (Features 19, 20, 21, 23): all SQL in build order. Feature 19 needs no SQL.
-- Paste and run this whole file once in the Supabase SQL Editor.


-- ==================================================================
-- 20-candidate-profile.sql
-- ==================================================================
-- Feature 20 · Candidate Profile

-- 1. New profile details for candidates (the profiles table already exists from Feature 01).
alter table public.profiles
  add column phone text check (char_length(phone) <= 30),
  add column city text check (char_length(city) <= 100),
  add column headline text check (char_length(headline) <= 100),
  add column default_cv_path text;

-- These fields are for candidate rows only; HR rows leave them empty.
alter table public.profiles
  add constraint profiles_candidate_fields check (
    role = 'candidate' or (phone is null and city is null and headline is null and default_cv_path is null)
  );

-- 2. A candidate can update their own phone, city and headline (full_name was granted in Feature 01).
-- The existing policy already limits updates to the user's own row.
-- default_cv_path is set only by the server (secret key), after it checks and saves the PDF.
grant update (phone, city, headline) on public.profiles to authenticated;

-- 3. Storage: the default CV lives in the private cvs bucket at {candidate_id}/default/{file}.pdf.
-- The Feature 08 policy already lets candidates read files in their own {candidate_id}/ folder.
-- Uploads and deletes are server only, so no new storage policy is needed.


-- ==================================================================
-- 21-saved-jobs.sql
-- ==================================================================
-- Feature 21 · Saved Jobs

-- 1. Jobs a candidate saved to apply to later. One row per candidate and job.
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  -- Jobs are never deleted (only closed), so a saved job stays until the candidate removes it.
  job_id uuid not null references public.jobs (id) on delete restrict,
  saved_at timestamptz not null default now(),
  constraint saved_jobs_candidate_job_unique unique (candidate_id, job_id)
);

-- The Saved Jobs page lists a candidate's rows newest first.
create index saved_jobs_candidate_saved_at_idx on public.saved_jobs (candidate_id, saved_at desc);

alter table public.saved_jobs enable row level security;

-- 2. A candidate reads only their own saved jobs. HR never reads this table,
-- so HR never sees who saved their jobs.
create policy "Candidates can read their own saved jobs"
  on public.saved_jobs for select
  to authenticated
  using (candidate_id = (select auth.uid()));

-- A logged-in candidate saves a job for themselves, and only while the job is open.
create policy "Candidates can save open jobs"
  on public.saved_jobs for insert
  to authenticated
  with check (
    candidate_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'candidate')
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open')
  );

-- A candidate removes their own saved jobs (Unsave / Remove).
create policy "Candidates can remove their own saved jobs"
  on public.saved_jobs for delete
  to authenticated
  using (candidate_id = (select auth.uid()));

-- Nobody updates a saved row.
revoke update on public.saved_jobs from anon, authenticated;


-- ==================================================================
-- 23-email-notifications.sql
-- ==================================================================
-- Feature 23 · Email Notifications

-- 1. Email preferences on the profile (the profiles table already exists from Feature 01).
-- Application and interview emails are always sent, so they have no switch.
alter table public.profiles
  add column email_status_updates boolean not null default true, -- candidates: status update emails
  add column email_daily_summary boolean not null default true;  -- HR: the daily applicant summary

-- Each user can switch their own preferences (the Feature 01 policy limits updates to their own row).
grant update (email_status_updates, email_daily_summary) on public.profiles to authenticated;

-- 2. A log of every email HireLens tried to send.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'application_received', 'status_changed', 'interview_scheduled',
    'interview_rescheduled', 'interview_cancelled', 'daily_summary'
  )),
  application_id uuid references public.applications (id) on delete cascade,
  interview_id uuid references public.interviews (id) on delete cascade,
  sent_at timestamptz not null default now(),
  status text not null check (status in ('sent', 'failed')),
  error_message text
);

-- Finds the last daily summary for an HR user ("new applicants since the last summary").
create index notifications_user_type_sent_at_idx on public.notifications (user_id, type, sent_at desc);

-- Server only: Row Level Security is on with no policies, so the browser can't read or write the log.
-- The server uses the secret key. No screen shows this log.
alter table public.notifications enable row level security;

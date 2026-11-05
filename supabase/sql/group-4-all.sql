-- Group 4 (Features 05, 16, 17, 18): all SQL in build order. Feature 05 needs no SQL.
-- Paste and run this whole file once in the Supabase SQL Editor.


-- ==================================================================
-- 16-interview-scheduling.sql
-- ==================================================================
-- Feature 16 · Interview Scheduling
-- Run once in the Supabase SQL Editor. Uses public.is_hr_for_application() (Feature 11)
-- and public.set_updated_at() (Feature 02).

-- 1. The interviews table: one row per interview. An application can have several.
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 15 and 240),
  meeting_link text check (meeting_link is null or length(meeting_link) <= 500),
  location text check (location is null or length(location) <= 300),
  interviewer_name text check (interviewer_name is null or length(interviewer_name) <= 100),
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- An interview needs a meeting link or an office address (or both).
  constraint interviews_link_or_location check (
    coalesce(length(trim(meeting_link)), 0) > 0 or coalesce(length(trim(location)), 0) > 0
  )
);

create index interviews_application_idx on public.interviews (application_id);
create index interviews_scheduled_at_idx on public.interviews (scheduled_at);
create index interviews_interviewer_idx on public.interviews (lower(interviewer_name), scheduled_at);

create trigger interviews_set_updated_at
  before update on public.interviews
  for each row execute function public.set_updated_at();

-- 2. Row Level Security
alter table public.interviews enable row level security;

-- HR of the job's company can read, schedule and change (reschedule, cancel) its interviews.
create policy "HR can read their company's interviews"
  on public.interviews for select
  to authenticated
  using ((select public.is_hr_for_application(application_id)));

create policy "HR can schedule interviews for their company's applications"
  on public.interviews for insert
  to authenticated
  with check ((select public.is_hr_for_application(application_id)));

create policy "HR can change their company's interviews"
  on public.interviews for update
  to authenticated
  using ((select public.is_hr_for_application(application_id)))
  with check ((select public.is_hr_for_application(application_id)));

-- The candidate can read the interviews of their own applications (time, duration, link, place, status).
create policy "Candidates can read their own interviews"
  on public.interviews for select
  to authenticated
  using (
    exists (
      select 1 from public.applications
      where applications.id = interviews.application_id
        and applications.candidate_id = (select auth.uid())
    )
  );

-- Nobody deletes interviews; they go only by cascade when the application is deleted.
-- An interview never moves to another application.
revoke update on public.interviews from anon, authenticated;
grant update (scheduled_at, duration_minutes, meeting_link, location, interviewer_name, status)
  on public.interviews to authenticated;

-- ==================================================================
-- 17-interview-feedback.sql
-- ==================================================================
-- Feature 17 · Interview Feedback
-- Run once in the Supabase SQL Editor, after 16-interview-scheduling.sql.

-- 1. One feedback record per interview. HR only; candidates never read it.
create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references public.interviews (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  strengths text check (strengths is null or length(strengths) <= 2000),
  concerns text check (concerns is null or length(concerns) <= 2000),
  recommendation text not null check (recommendation in ('offer', 'reject', 'another_round')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Row Level Security
alter table public.interview_feedback enable row level security;

-- Helper: true when the logged-in user is HR of the company that owns this interview's job.
create or replace function public.is_hr_for_interview(target_interview_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.interviews
    where interviews.id = target_interview_id
      and public.is_hr_for_application(interviews.application_id)
  )
$$;

revoke execute on function public.is_hr_for_interview(uuid) from public, anon;
grant execute on function public.is_hr_for_interview(uuid) to authenticated;

create policy "HR can read feedback on their company's interviews"
  on public.interview_feedback for select
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

-- HR writes feedback as themselves.
create policy "HR can add feedback on their company's interviews"
  on public.interview_feedback for insert
  to authenticated
  with check (
    (select public.is_hr_for_interview(interview_id))
    and created_by = (select auth.uid())
  );

create policy "HR can change feedback on their company's interviews"
  on public.interview_feedback for update
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)))
  with check ((select public.is_hr_for_interview(interview_id)));

-- Only the feedback itself can change; it never moves to another interview or author.
-- Nobody deletes feedback; it goes only by cascade.
revoke update on public.interview_feedback from anon, authenticated;
grant update (rating, strengths, concerns, recommendation) on public.interview_feedback to authenticated;

-- ==================================================================
-- 18-ai-interview-questions.sql
-- ==================================================================
-- Feature 18 · AI Interview Questions
-- Run once in the Supabase SQL Editor, after 17-interview-feedback.sql
-- (uses public.is_hr_for_interview()).

-- 1. The question list for one interview, written by AI or added by HR. HR only.
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  type text not null check (type in ('technical', 'behavioural', 'project')),
  question text not null check (length(trim(question)) > 0 and length(question) <= 500),
  good_answer_hint text check (good_answer_hint is null or length(good_answer_hint) <= 500),
  focus text check (focus is null or length(focus) <= 100),
  source text not null check (source in ('ai', 'hr')),
  position integer not null,
  created_at timestamptz not null default now()
);

create index interview_questions_interview_idx on public.interview_questions (interview_id, position);

-- 2. Row Level Security: HR of the job's company only. Candidates never read questions.
alter table public.interview_questions enable row level security;

create policy "HR can read questions for their company's interviews"
  on public.interview_questions for select
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

create policy "HR can add questions to their company's interviews"
  on public.interview_questions for insert
  to authenticated
  with check ((select public.is_hr_for_interview(interview_id)));

create policy "HR can change questions for their company's interviews"
  on public.interview_questions for update
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)))
  with check ((select public.is_hr_for_interview(interview_id)));

create policy "HR can delete questions for their company's interviews"
  on public.interview_questions for delete
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

-- A question never moves to another interview.
revoke update on public.interview_questions from anon, authenticated;
grant update (type, question, good_answer_hint, focus, position) on public.interview_questions to authenticated;

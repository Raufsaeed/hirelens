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

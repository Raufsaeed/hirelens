-- Feature 11 · AI CV Screening and Retry: screenings, and notes (for the manual review of unreadable CVs)

-- 1. Screenings: the AI screening result for one application (one row, replaced on re-screen).
--    HR only. Candidates never read this table.
create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  score integer check (score between 0 and 100),
  rubric_breakdown jsonb,
  match_percent numeric check (match_percent between 0 and 100),
  must_have_match numeric check (must_have_match between 0 and 100),
  nice_to_have_match numeric check (nice_to_have_match between 0 and 100),
  requirements_result jsonb,
  experience_items jsonb,
  relevant_years numeric check (relevant_years >= 0),
  meets_required_years boolean,
  degree_match boolean,
  degree_found text,
  summary text[],
  cv_text_clean text,
  model_name text,
  screened_at timestamptz,
  error_message text
);

create index screenings_score_idx on public.screenings (score);

-- 2. Notes: private HR notes on an application. Feature 11 uses them for manual review of an
--    unreadable CV (is_manual_review = true); Feature 14 adds the notes box.
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  body text not null check (length(trim(body)) > 0),
  is_manual_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index notes_application_idx on public.notes (application_id, created_at);

-- 3. Row Level Security
alter table public.screenings enable row level security;
alter table public.notes enable row level security;

-- Helper: true when the logged-in user is HR of the company that owns this application's job.
create or replace function public.is_hr_for_application(target_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications
    join public.jobs on jobs.id = applications.job_id
    where applications.id = target_application_id
      and jobs.company_id = (
        select company_id from public.profiles where id = (select auth.uid()) and role = 'hr'
      )
  )
$$;

revoke execute on function public.is_hr_for_application(uuid) from public, anon;
grant execute on function public.is_hr_for_application(uuid) to authenticated;

-- Screenings: HR of the job's company can read. Inserts and updates are server only (screening runs on the server).
create policy "HR can read screenings of their company's applications"
  on public.screenings for select
  to authenticated
  using ((select public.is_hr_for_application(application_id)));

revoke insert, update, delete on public.screenings from anon, authenticated;

-- Notes: HR of the job's company can read them and add notes as themselves. Never candidates.
-- Notes can't be edited or deleted in this version.
create policy "HR can read notes of their company's applications"
  on public.notes for select
  to authenticated
  using ((select public.is_hr_for_application(application_id)));

create policy "HR can add notes to their company's applications"
  on public.notes for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (select public.is_hr_for_application(application_id))
  );

revoke update, delete on public.notes from anon, authenticated;

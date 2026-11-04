-- Group 1 (Features 04, 07, 08, 09, 10): all SQL in build order. Run once in the Supabase SQL Editor.
-- Features 04, 07 and 09 need no SQL changes.

-- ============ 08-apply-with-cv.sql ============
-- Feature 08 · Apply with CV: applications, status_history and CV storage rules

-- 1. Applications: one candidate's application to one job. Holds no score.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete restrict,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  candidate_name text not null check (length(trim(candidate_name)) > 0),
  candidate_email text not null check (length(trim(candidate_email)) > 0),
  cv_file_path text not null,
  phone text not null check (length(trim(phone)) > 0),
  cover_note text check (char_length(cover_note) <= 500),
  status text not null default 'applied'
    check (status in ('applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  screening_status text not null default 'queued'
    check (screening_status in ('queued', 'processing', 'done', 'pending', 'failed')),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  viewed_at timestamptz,
  -- One application per candidate per job.
  constraint applications_job_candidate_key unique (job_id, candidate_id)
);

create index applications_job_id_idx on public.applications (job_id);
create index applications_candidate_id_idx on public.applications (candidate_id);
create index applications_job_status_idx on public.applications (job_id, status);
create index applications_job_viewed_idx on public.applications (job_id, viewed_at);
create index applications_applied_at_idx on public.applications (applied_at);
create index applications_name_idx on public.applications (lower(candidate_name));
create index applications_email_idx on public.applications (lower(candidate_email));

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- 2. Status history: a permanent log of every status change (the first row goes from empty to applied).
create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  from_status text
    check (from_status in ('applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  to_status text not null
    check (to_status in ('applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  changed_by uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);

create index status_history_application_idx on public.status_history (application_id, changed_at);
create index status_history_to_status_idx on public.status_history (to_status);

-- A row changed by the candidate can only be a change to withdrawn.
create or replace function public.check_status_history_candidate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.changed_by is not null
     and exists (select 1 from public.profiles where id = new.changed_by and role = 'candidate')
     and new.to_status <> 'withdrawn' then
    raise exception 'A candidate can only change an application to withdrawn';
  end if;
  return new;
end;
$$;

create trigger status_history_candidate_check
  before insert on public.status_history
  for each row execute function public.check_status_history_candidate();

-- 3. Row Level Security
alter table public.applications enable row level security;
alter table public.status_history enable row level security;

-- The candidate who owns the application can read it.
create policy "Candidates can read their own applications"
  on public.applications for select
  to authenticated
  using (candidate_id = (select auth.uid()));

-- HR can read applications to their own company's jobs.
create policy "HR can read applications to their company's jobs"
  on public.applications for select
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.company_id = (select public.current_hr_company_id())
    )
  );

-- A candidate can apply for themselves only, to an Open job whose Apply by day has not ended
-- (Pakistan time), starting as applied / queued.
create policy "Candidates can apply to open jobs"
  on public.applications for insert
  to authenticated
  with check (
    candidate_id = (select auth.uid())
    and status = 'applied'
    and screening_status = 'queued'
    and viewed_at is null
    and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'candidate')
    and exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.status = 'open'
        and (jobs.apply_by is null or jobs.apply_by >= (now() at time zone 'Asia/Karachi')::date)
    )
  );

-- Status and screening changes are made by the server only (no update policy yet; Feature 15 adds HR moves).
-- Status history: the candidate reads their own timeline, HR reads their company's. Inserts are server only.
create policy "Candidates can read their own status history"
  on public.status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.applications
      where applications.id = status_history.application_id
        and applications.candidate_id = (select auth.uid())
    )
  );

create policy "HR can read status history of their company's applications"
  on public.status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.applications
      join public.jobs on jobs.id = applications.job_id
      where applications.id = status_history.application_id
        and jobs.company_id = (select public.current_hr_company_id())
    )
  );

revoke update, delete on public.status_history from anon, authenticated;

-- 4. CV storage (the private bucket cvs already exists; it is not created here).
-- The first folder of every CV path is the candidate's id: {candidate_id}/applications/{job_id}/file.pdf
create policy "Candidates can read their own CVs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Candidates can upload CVs to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============ 10-withdraw-and-delete-application-data.sql ============
-- Feature 10 · Withdraw and Delete Application Data

-- "Delete my data": the candidate who owns an application can delete it.
-- Its status history goes with it (on delete cascade); later features' tables cascade the same way.
create policy "Candidates can delete their own applications"
  on public.applications for delete
  to authenticated
  using (candidate_id = (select auth.uid()));

-- The candidate can delete CV files in their own folder of the private cvs bucket.
create policy "Candidates can delete their own CVs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Withdraw (status -> withdrawn, only from applied or shortlisted) is done by the server,
-- which also writes the history row with the candidate as changed_by.

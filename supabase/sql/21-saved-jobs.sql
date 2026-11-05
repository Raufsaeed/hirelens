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

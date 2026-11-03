-- Feature 02 · Post a Job: jobs

-- 1. Jobs: a job posted by a company, from draft to open to closed.
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  slug text unique,
  location text,
  job_type text check (job_type in ('full-time', 'part-time', 'internship', 'remote')),
  required_years integer check (required_years between 0 and 30),
  required_degree text,
  requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(requirements) = 'array'),
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  apply_by date,
  closed_reason text check (closed_reason in ('manual', 'deadline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  -- closed_reason is filled only when the job is closed.
  constraint jobs_closed_reason_only_when_closed check (closed_reason is null or status = 'closed'),
  -- An open (published) job always has its public slug.
  constraint jobs_open_has_slug check (status = 'draft' or slug is not null)
);

-- A company can't have two draft or open jobs with the same title.
create unique index jobs_company_active_title_idx
  on public.jobs (company_id, lower(title))
  where status in ('draft', 'open');

create index jobs_company_id_idx on public.jobs (company_id);
create index jobs_status_idx on public.jobs (status);
create index jobs_status_apply_by_idx on public.jobs (status, apply_by);

-- 2. Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- 3. Row Level Security
alter table public.jobs enable row level security;

-- Anyone, even logged out, can read open and closed jobs (the public link works).
create policy "Anyone can read open and closed jobs"
  on public.jobs for select
  to anon, authenticated
  using (status in ('open', 'closed'));

-- HR can read every job of their own company, including drafts.
create policy "HR can read their company's jobs"
  on public.jobs for select
  to authenticated
  using (company_id = (select public.current_hr_company_id()));

-- HR can create jobs only for their own company.
create policy "HR can create jobs for their company"
  on public.jobs for insert
  to authenticated
  with check (company_id = (select public.current_hr_company_id()));

-- HR can update only their own company's jobs, and can't move them to another company.
create policy "HR can update their company's jobs"
  on public.jobs for update
  to authenticated
  using (company_id = (select public.current_hr_company_id()))
  with check (company_id = (select public.current_hr_company_id()));

-- No delete policy: jobs are never deleted, only closed.
revoke delete on public.jobs from anon, authenticated;

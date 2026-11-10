-- Final statuses and deleting jobs with no applicants
-- Run once in the Supabase SQL Editor, after 15-hiring-pipeline.sql, 21-saved-jobs.sql
-- and 02-delete-draft-jobs.sql.

-- 1. Hired and Rejected are final.
-- HR of the job's company can change an application's status, but never on a withdrawn, hired or
-- rejected application, and never to "withdrawn" (only the candidate withdraws, through the server).
drop policy "HR can move their company's applications" on public.applications;

create policy "HR can move their company's applications"
  on public.applications for update
  to authenticated
  using (
    status not in ('withdrawn', 'hired', 'rejected')
    and exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.company_id = (select public.current_hr_company_id())
    )
  )
  with check (
    status <> 'withdrawn'
    and exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.company_id = (select public.current_hr_company_id())
    )
  );

-- 2. HR can delete a job of their company if it is a draft or has no applications at all
-- (withdrawn ones count). Jobs with applications are never deleted, only closed.

-- True when the job has any application. It runs as its owner so the jobs policy doesn't loop
-- through the applications policy (which reads jobs again).
create or replace function public.job_has_applications(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.applications where applications.job_id = target_job_id)
$$;

revoke execute on function public.job_has_applications(uuid) from public, anon;
grant execute on function public.job_has_applications(uuid) to authenticated;

drop policy "HR can delete their company's draft jobs" on public.jobs;

create policy "HR can delete their company's jobs with no applications"
  on public.jobs for delete
  to authenticated
  using (
    company_id = (select public.current_hr_company_id())
    and (status = 'draft' or not public.job_has_applications(id))
  );

-- 3. When a job is deleted, candidates' saved copies of it go too.
-- (saved_jobs_job_id_fkey is the name Postgres gave the job_id foreign key in 21-saved-jobs.sql.)
alter table public.saved_jobs drop constraint saved_jobs_job_id_fkey;

alter table public.saved_jobs
  add constraint saved_jobs_job_id_fkey
  foreign key (job_id) references public.jobs (id) on delete cascade;

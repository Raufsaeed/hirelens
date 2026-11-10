-- Follow-up to 15-final-statuses-and-job-delete.sql (code review F1)
-- job_has_applications now answers only for jobs of the caller's own company, so nobody can learn
-- whether another company's job has applications. For any other job it returns false; the jobs
-- delete policy still blocks those, because it also checks the job's company.
-- Run once in the Supabase SQL Editor.

create or replace function public.job_has_applications(target_job_id uuid)
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
    where applications.job_id = target_job_id
      and jobs.company_id = (
        select company_id from public.profiles where id = (select auth.uid()) and role = 'hr'
      )
  )
$$;

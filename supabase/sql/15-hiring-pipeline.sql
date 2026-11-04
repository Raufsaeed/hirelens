-- Feature 15 · Hiring Pipeline (also used by Feature 14's Shortlist and Reject)

-- HR of the job's company can change an application's pipeline status, but never on a withdrawn
-- application and never to "withdrawn" (only the candidate withdraws, through the server).
create policy "HR can move their company's applications"
  on public.applications for update
  to authenticated
  using (
    status <> 'withdrawn'
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

-- The only column anyone can update from the browser is status. Screening status, names, CV paths
-- and viewed_at are changed by the server only. The history row for each move is written by the server.
revoke update on public.applications from anon, authenticated;
grant update (status) on public.applications to authenticated;

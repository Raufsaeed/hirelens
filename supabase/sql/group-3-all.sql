-- Group 3 (Features 14, 15, 06, 22): all SQL in build order. Run once in the Supabase SQL Editor.
-- Features 14 and 22 need no SQL of their own (14 uses the 15 rule below and the notes table from Group 2).

-- ============ 15-hiring-pipeline.sql ============
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

-- ============ 06-company-profile-and-public-page.sql ============
-- Feature 06 · Company Profile and Public Page

-- 1. New company details (the companies table already exists from Feature 01).
alter table public.companies
  add column about text check (char_length(about) <= 1000),
  add column website text check (website ~* '^https?://'),
  add column location text;

-- HR of the company can now also update these columns (name and logo_url were granted in Feature 01).
-- The slug still can't change, so links keep working.
grant update (about, website, location) on public.companies to authenticated;

-- 2. Logos (the public bucket logos already exists; it is not created here).
-- Files live at {company_id}/logo.png or logo.jpg. Anyone can read logos;
-- only HR of that company can upload, replace or delete them.
create policy "Anyone can read company logos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

create policy "HR can upload their company logo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select public.current_hr_company_id())::text);

create policy "HR can replace their company logo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select public.current_hr_company_id())::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select public.current_hr_company_id())::text);

create policy "HR can delete their company logo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select public.current_hr_company_id())::text);

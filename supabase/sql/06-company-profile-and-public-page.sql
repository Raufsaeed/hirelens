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

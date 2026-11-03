-- Feature 01 · Authentication: companies and profiles

-- 1. Companies: one row per company, created when an HR user signs up.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

-- 2. Profiles: one row per user, same id as the Supabase Auth user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  email text not null unique,
  role text not null check (role in ('hr', 'candidate')),
  company_id uuid unique references public.companies (id) on delete restrict,
  created_at timestamptz not null default now(),
  -- HR always has a company; a candidate never has one.
  constraint profiles_role_company check (
    (role = 'hr' and company_id is not null)
    or (role = 'candidate' and company_id is null)
  )
);

-- 3. Helper used by policies: the company of the logged-in HR user (empty for candidates).
create or replace function public.current_hr_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id from public.profiles
  where id = (select auth.uid()) and role = 'hr'
$$;

revoke execute on function public.current_hr_company_id() from public, anon;
grant execute on function public.current_hr_company_id() to authenticated;

-- 4. Row Level Security
alter table public.companies enable row level security;
alter table public.profiles enable row level security;

-- Companies: anyone can read (job and company pages are public).
create policy "Anyone can read companies"
  on public.companies for select
  to anon, authenticated
  using (true);

-- Companies: only HR of that company can update it.
create policy "HR can update their own company"
  on public.companies for update
  to authenticated
  using (id = (select public.current_hr_company_id()))
  with check (id = (select public.current_hr_company_id()));

-- The slug never changes (links keep working), so HR can only update these columns.
revoke update on public.companies from anon, authenticated;
grant update (name, logo_url) on public.companies to authenticated;

-- Profiles: each user reads only their own row.
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Profiles: each user updates only their own row ...
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ... and only the full_name column. role, company_id and email can't be changed by the user.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Companies and profiles are inserted only by the server (secret key) at sign up.
-- No insert or delete policies, so the browser can't do either.

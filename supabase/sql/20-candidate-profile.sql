-- Feature 20 · Candidate Profile

-- 1. New profile details for candidates (the profiles table already exists from Feature 01).
alter table public.profiles
  add column phone text check (char_length(phone) <= 30),
  add column city text check (char_length(city) <= 100),
  add column headline text check (char_length(headline) <= 100),
  add column default_cv_path text;

-- These fields are for candidate rows only; HR rows leave them empty.
alter table public.profiles
  add constraint profiles_candidate_fields check (
    role = 'candidate' or (phone is null and city is null and headline is null and default_cv_path is null)
  );

-- 2. A candidate can update their own phone, city and headline (full_name was granted in Feature 01).
-- The existing policy already limits updates to the user's own row.
-- default_cv_path is set only by the server (secret key), after it checks and saves the PDF.
grant update (phone, city, headline) on public.profiles to authenticated;

-- 3. Storage: the default CV lives in the private cvs bucket at {candidate_id}/default/{file}.pdf.
-- The Feature 08 policy already lets candidates read files in their own {candidate_id}/ folder.
-- Uploads and deletes are server only, so no new storage policy is needed.

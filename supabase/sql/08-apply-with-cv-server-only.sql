-- Feature 08 fix · Applications and CV uploads are server only
-- Run once, after group-1-all.sql. The apply form always goes through the server (/api/applications),
-- which checks the job, the deadline, "applied before", that the file is a real PDF under 5 MB,
-- and writes the first status history row. Without these rules a candidate could skip those checks
-- by calling Supabase directly with the public key.

-- Candidates can no longer insert applications themselves; the server inserts them.
drop policy if exists "Candidates can apply to open jobs" on public.applications;
revoke insert on public.applications from anon, authenticated;

-- Candidates can no longer upload into the cvs bucket themselves; the server uploads the CV.
-- (Reading and deleting their own CVs stays allowed.)
drop policy if exists "Candidates can upload CVs to their own folder" on storage.objects;

-- Feature 10 · Withdraw and Delete Application Data

-- "Delete my data": the candidate who owns an application can delete it.
-- Its status history goes with it (on delete cascade); later features' tables cascade the same way.
create policy "Candidates can delete their own applications"
  on public.applications for delete
  to authenticated
  using (candidate_id = (select auth.uid()));

-- The candidate can delete CV files in their own folder of the private cvs bucket.
create policy "Candidates can delete their own CVs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Withdraw (status -> withdrawn, only from applied or shortlisted) is done by the server,
-- which also writes the history row with the candidate as changed_by.

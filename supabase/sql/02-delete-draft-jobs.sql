-- Feature 02 · Delete draft jobs
-- HR can delete their own company's jobs, but only while the job is a draft.
-- Open and closed jobs can never be deleted (they keep their applications and saved jobs).
-- Run once in the Supabase SQL Editor, after 02-post-a-job.sql.

-- HR of the job's company can delete it only while its status is 'draft'.
create policy "HR can delete their company's draft jobs"
  on public.jobs for delete
  to authenticated
  using (
    company_id = (select public.current_hr_company_id())
    and status = 'draft'
  );

-- Logged-in users get the delete right; the policy above limits it to HR's own drafts.
-- Logged-out visitors (anon) still can't delete.
grant delete on public.jobs to authenticated;

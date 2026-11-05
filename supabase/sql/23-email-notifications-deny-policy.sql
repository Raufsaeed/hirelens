-- Feature 23 · Email Notifications: an explicit policy for the notifications log.
-- The log is server only (secret key). This policy makes that rule explicit:
-- the browser (anon or logged in) can never read, add, change or delete a row.
create policy "Notifications are server only"
  on public.notifications
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

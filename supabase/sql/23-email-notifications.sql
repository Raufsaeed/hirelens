-- Feature 23 · Email Notifications

-- 1. Email preferences on the profile (the profiles table already exists from Feature 01).
-- Application and interview emails are always sent, so they have no switch.
alter table public.profiles
  add column email_status_updates boolean not null default true, -- candidates: status update emails
  add column email_daily_summary boolean not null default true;  -- HR: the daily applicant summary

-- Each user can switch their own preferences (the Feature 01 policy limits updates to their own row).
grant update (email_status_updates, email_daily_summary) on public.profiles to authenticated;

-- 2. A log of every email HireLens tried to send.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'application_received', 'status_changed', 'interview_scheduled',
    'interview_rescheduled', 'interview_cancelled', 'daily_summary'
  )),
  application_id uuid references public.applications (id) on delete cascade,
  interview_id uuid references public.interviews (id) on delete cascade,
  sent_at timestamptz not null default now(),
  status text not null check (status in ('sent', 'failed')),
  error_message text
);

-- Finds the last daily summary for an HR user ("new applicants since the last summary").
create index notifications_user_type_sent_at_idx on public.notifications (user_id, type, sent_at desc);

-- Server only: Row Level Security is on with no policies, so the browser can't read or write the log.
-- The server uses the secret key. No screen shows this log.
alter table public.notifications enable row level security;

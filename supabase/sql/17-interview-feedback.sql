-- Feature 17 · Interview Feedback
-- Run once in the Supabase SQL Editor, after 16-interview-scheduling.sql.

-- 1. One feedback record per interview. HR only; candidates never read it.
create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references public.interviews (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  strengths text check (strengths is null or length(strengths) <= 2000),
  concerns text check (concerns is null or length(concerns) <= 2000),
  recommendation text not null check (recommendation in ('offer', 'reject', 'another_round')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Row Level Security
alter table public.interview_feedback enable row level security;

-- Helper: true when the logged-in user is HR of the company that owns this interview's job.
create or replace function public.is_hr_for_interview(target_interview_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.interviews
    where interviews.id = target_interview_id
      and public.is_hr_for_application(interviews.application_id)
  )
$$;

revoke execute on function public.is_hr_for_interview(uuid) from public, anon;
grant execute on function public.is_hr_for_interview(uuid) to authenticated;

create policy "HR can read feedback on their company's interviews"
  on public.interview_feedback for select
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

-- HR writes feedback as themselves.
create policy "HR can add feedback on their company's interviews"
  on public.interview_feedback for insert
  to authenticated
  with check (
    (select public.is_hr_for_interview(interview_id))
    and created_by = (select auth.uid())
  );

create policy "HR can change feedback on their company's interviews"
  on public.interview_feedback for update
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)))
  with check ((select public.is_hr_for_interview(interview_id)));

-- Only the feedback itself can change; it never moves to another interview or author.
-- Nobody deletes feedback; it goes only by cascade.
revoke update on public.interview_feedback from anon, authenticated;
grant update (rating, strengths, concerns, recommendation) on public.interview_feedback to authenticated;

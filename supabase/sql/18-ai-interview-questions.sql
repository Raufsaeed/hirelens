-- Feature 18 · AI Interview Questions
-- Run once in the Supabase SQL Editor, after 17-interview-feedback.sql
-- (uses public.is_hr_for_interview()).

-- 1. The question list for one interview, written by AI or added by HR. HR only.
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  type text not null check (type in ('technical', 'behavioural', 'project')),
  question text not null check (length(trim(question)) > 0 and length(question) <= 500),
  good_answer_hint text check (good_answer_hint is null or length(good_answer_hint) <= 500),
  focus text check (focus is null or length(focus) <= 100),
  source text not null check (source in ('ai', 'hr')),
  position integer not null,
  created_at timestamptz not null default now()
);

create index interview_questions_interview_idx on public.interview_questions (interview_id, position);

-- 2. Row Level Security: HR of the job's company only. Candidates never read questions.
alter table public.interview_questions enable row level security;

create policy "HR can read questions for their company's interviews"
  on public.interview_questions for select
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

create policy "HR can add questions to their company's interviews"
  on public.interview_questions for insert
  to authenticated
  with check ((select public.is_hr_for_interview(interview_id)));

create policy "HR can change questions for their company's interviews"
  on public.interview_questions for update
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)))
  with check ((select public.is_hr_for_interview(interview_id)));

create policy "HR can delete questions for their company's interviews"
  on public.interview_questions for delete
  to authenticated
  using ((select public.is_hr_for_interview(interview_id)));

-- A question never moves to another interview.
revoke update on public.interview_questions from anon, authenticated;
grant update (type, question, good_answer_hint, focus, position) on public.interview_questions to authenticated;

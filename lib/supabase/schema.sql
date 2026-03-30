-- ============================================================
-- StormPrep Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  plan          text not null default 'free',
  -- Onboarding data
  goal          text,    -- 'land_offer' | 'level_up' | 'stay_sharp' | 'switching'
  target_role   text,    -- 'SWE' | 'PM' | 'Design' | etc
  companies     text[],  -- free-typed company names
  interview_urgency text, -- 'this_week' | '1_2_weeks' | '3_4_weeks' | 'exploring'
  weakness      text,    -- selected weakness category
  onboarding_done boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Sessions
create table if not exists public.sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  role           text not null,
  company        text,
  seniority      text not null,  -- 'Junior' | 'Mid' | 'Senior' | 'Staff'
  interview_type text not null,  -- 'Behavioral' | 'Technical' | 'Mixed'
  duration_mins  int  not null default 15,
  -- Voice scores
  overall_score  int,
  clarity        int,
  structure      int,
  relevance      int,
  pacing         int,
  confidence     int,
  -- Camera scores
  camera_score   int,
  eye_contact    int,
  posture        int,
  expression     int,
  -- High-level analysis
  overall_summary  text,
  top_strengths    text[],
  areas_to_improve text[],
  -- Evaluation dimensions
  resume_alignment int,
  fluency          int,
  -- State
  status         text not null default 'in_progress', -- 'in_progress' | 'completed'
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- Session Answers (one row per Q&A exchange)
create table if not exists public.session_answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  question    text not null,
  answer      text not null default '',
  feedback    text,
  score       int,
  turn_index  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Question cache (reduce OpenAI calls — same role+type reuses questions)
create table if not exists public.question_cache (
  id             uuid primary key default gen_random_uuid(),
  role           text not null,
  interview_type text not null,
  seniority      text not null,
  questions      jsonb not null,  -- string[]
  created_at     timestamptz not null default now(),
  unique(role, interview_type, seniority)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_answers enable row level security;
alter table public.question_cache enable row level security;

-- Profiles: users can only see/edit their own
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Sessions: users can only see their own
drop policy if exists "sessions_own" on public.sessions;
create policy "sessions_own" on public.sessions
  for all using (auth.uid() = user_id);

-- Answers: accessible through session ownership
drop policy if exists "answers_own" on public.session_answers;
create policy "answers_own" on public.session_answers
  for all using (
    exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
  );

-- Question cache: readable by all authenticated users
drop policy if exists "cache_read" on public.question_cache;
create policy "cache_read" on public.question_cache
  for select using (auth.role() = 'authenticated');

drop policy if exists "cache_insert" on public.question_cache;
create policy "cache_insert" on public.question_cache
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

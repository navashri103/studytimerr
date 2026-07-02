-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists daily_stats (
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  focus_minutes int not null default 0,
  tasks_completed int not null default 0,
  primary key (user_id, date)
);

create table if not exists eisenhower_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  quadrant text not null check (quadrant in ('do', 'decide', 'delegate', 'delete')),
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists pareto_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  vital boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists spotify_tokens (
  user_id uuid primary key references auth.users on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  is_premium boolean not null default false,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Short-lived row mapping an OAuth `state` value back to the StudyTimer user
-- who started the flow, since Spotify's redirect to /spotify/callback carries
-- no Authorization header we could otherwise use to identify them.
create table if not exists spotify_oauth_state (
  state text primary key,
  user_id uuid not null references auth.users on delete cascade,
  expires_at timestamptz not null
);

alter table daily_stats enable row level security;
alter table eisenhower_tasks enable row level security;
alter table pareto_items enable row level security;
alter table spotify_tokens enable row level security;
alter table spotify_oauth_state enable row level security;

create policy "Users manage their own daily_stats"
  on daily_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own eisenhower_tasks"
  on eisenhower_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own pareto_items"
  on pareto_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own spotify_tokens"
  on spotify_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No user-facing policy on spotify_oauth_state: the backend writes/reads it
-- exclusively via the Supabase service-role key (see app/db.py), since the
-- OAuth callback has no user JWT to authenticate as.

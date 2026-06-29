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

alter table daily_stats enable row level security;
alter table eisenhower_tasks enable row level security;
alter table pareto_items enable row level security;

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

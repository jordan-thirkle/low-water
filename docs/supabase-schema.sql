-- LOW WATER persistence sketch.
-- Apply in a Supabase project only after reviewing the current schema and RLS policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  xp integer not null default 0 check (xp >= 0),
  rank integer not null default 1 check (rank >= 1),
  banked_finds integer not null default 0 check (banked_finds >= 0),
  completed_runs integer not null default 0 check (completed_runs >= 0),
  best_combo numeric(4, 1) not null default 0 check (best_combo >= 0),
  streak integer not null default 0 check (streak >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_code text not null check (room_code ~ '^[a-z0-9-]{4,32}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 120),
  created_at timestamptz not null default now()
);

create index if not exists room_messages_room_created_idx
  on public.room_messages (room_code, created_at desc);

alter table public.profiles enable row level security;
alter table public.room_messages enable row level security;

create policy "profiles are readable by signed-in users"
  on public.profiles for select to authenticated using (true);

create policy "users can update only their profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "users can read messages in rooms"
  on public.room_messages for select to authenticated using (true);

create policy "users can write their own messages"
  on public.room_messages for insert to authenticated with check (auth.uid() = user_id);

-- Economy note: clients must not be allowed to write XP, Marks, unlocks, or rota completion directly.
-- Use a server-side function/Edge Function or authoritative match service to validate run results.

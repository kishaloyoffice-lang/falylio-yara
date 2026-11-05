-- =============================================================================
-- FALYLIO YARA — SUPABASE ACCOUNT SYSTEM & RLS MIGRATION
-- Project URL: https://bejcibiobhrjekenhevc.supabase.co
-- Instructions: Copy and execute this entire script inside the Supabase SQL Editor.
-- =============================================================================

-- Enable pgcrypto extension for gen_random_uuid() if not already enabled
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. TABLE: public.profiles
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (username is null or char_length(username) between 3 and 32)
);

create index if not exists idx_profiles_username on public.profiles (username);

-- Automatically update updated_at timestamp on profile edits
create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_profiles_updated_at();

-- Automatically create a profile row when a new user registers in auth.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''), '/assets/fy/user-avatar.png')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- =============================================================================
-- 2. TABLE: public.user_favorites
-- =============================================================================
create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'tool',
  created_at timestamptz not null default now(),
  constraint user_favorites_unique_user_item unique (user_id, item_id, item_type)
);

create index if not exists idx_user_favorites_user_created
  on public.user_favorites (user_id, created_at desc);

-- =============================================================================
-- 3. TABLE: public.recently_viewed
-- =============================================================================
create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'tool',
  viewed_at timestamptz not null default now(),
  constraint recently_viewed_unique_user_item unique (user_id, item_id, item_type)
);

create index if not exists idx_recently_viewed_user_viewed
  on public.recently_viewed (user_id, viewed_at desc);

-- =============================================================================
-- 4. TABLE: public.saved_items
-- =============================================================================
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  title text not null,
  created_at timestamptz not null default now(),
  constraint saved_items_unique_user_item unique (user_id, item_id, item_type)
);

create index if not exists idx_saved_items_user_created
  on public.saved_items (user_id, created_at desc);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.user_favorites enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.saved_items enable row level security;

-- profiles policies (ownership: auth.uid() = id)
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- user_favorites policies (ownership: auth.uid() = user_id)
drop policy if exists "Users can read their own favorites" on public.user_favorites;
create policy "Users can read their own favorites"
  on public.user_favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favorites" on public.user_favorites;
create policy "Users can insert their own favorites"
  on public.user_favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own favorites" on public.user_favorites;
create policy "Users can update their own favorites"
  on public.user_favorites
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own favorites" on public.user_favorites;
create policy "Users can delete their own favorites"
  on public.user_favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- recently_viewed policies (ownership: auth.uid() = user_id)
drop policy if exists "Users can read their own recently viewed items" on public.recently_viewed;
create policy "Users can read their own recently viewed items"
  on public.recently_viewed
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recently viewed items" on public.recently_viewed;
create policy "Users can insert their own recently viewed items"
  on public.recently_viewed
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recently viewed items" on public.recently_viewed;
create policy "Users can update their own recently viewed items"
  on public.recently_viewed
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own recently viewed items" on public.recently_viewed;
create policy "Users can delete their own recently viewed items"
  on public.recently_viewed
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- saved_items policies (ownership: auth.uid() = user_id)
drop policy if exists "Users can read their own saved items" on public.saved_items;
create policy "Users can read their own saved items"
  on public.saved_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own saved items" on public.saved_items;
create policy "Users can insert their own saved items"
  on public.saved_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved items" on public.saved_items;
create policy "Users can update their own saved items"
  on public.saved_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved items" on public.saved_items;
create policy "Users can delete their own saved items"
  on public.saved_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

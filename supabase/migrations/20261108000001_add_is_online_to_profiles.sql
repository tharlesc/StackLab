-- =============================================================================
-- MIGRATION: Adiciona coluna is_online e last_sync_at em public.profiles
-- =============================================================================

alter table public.profiles
  add column if not exists is_online boolean not null default false,
  add column if not exists last_sync_at timestamptz default now();

create index if not exists profiles_is_online_idx on public.profiles (is_online);

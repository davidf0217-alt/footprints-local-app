-- 雪糕足迹：真实项目已执行同等迁移。本文件用于审计、重建和后续环境一致性。
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text check (char_length(nickname) between 1 and 40),
  home_city_id text check (char_length(home_city_id) <= 64),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- trips 是历史遗留表：保留 bigint 主键，client_id 是离线幂等身份。
alter table public.trips add column if not exists client_id uuid;
alter table public.trips add column if not exists city_id text;
alter table public.trips add column if not exists district_name text;
alter table public.trips add column if not exists coord jsonb;
alter table public.trips add column if not exists arrived_on date;
alter table public.trips add column if not exists transport text check (transport in ('flight','train','other'));
alter table public.trips add column if not exists service_number text check (char_length(service_number) <= 20);
alter table public.trips add column if not exists source text not null default 'manual' check (source in ('manual','image_ocr','text_paste','json_import','plan_completion'));
alter table public.trips add column if not exists device_id uuid;
alter table public.trips add column if not exists revision integer not null default 1 check (revision > 0);
alter table public.trips add column if not exists deleted_at timestamptz;
update public.trips set client_id = gen_random_uuid() where client_id is null;
alter table public.trips alter column client_id set not null;
create unique index if not exists trips_owner_client_idx on public.trips(user_id, client_id);
create index if not exists trips_owner_sync_idx on public.trips(user_id, updated_at desc);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null default gen_random_uuid(), city_id text not null, city_name text not null check (char_length(city_name) between 1 and 80),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  status text not null default 'draft' check (status in ('draft','upcoming','completed','cancelled')),
  device_id uuid, revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), deleted_at timestamptz,
  unique(user_id, client_id)
);
create index if not exists plans_owner_sync_idx on public.plans(user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.plans enable row level security;
drop policy if exists "profile own select" on public.profiles; create policy "profile own select" on public.profiles for select to authenticated using (id=auth.uid());
drop policy if exists "profile own update" on public.profiles; create policy "profile own update" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
drop policy if exists "trip own all" on public.trips; create policy "trip own all" on public.trips for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "plan own all" on public.plans; create policy "plan own all" on public.plans for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
grant usage on schema public to authenticated;
grant select,insert,update,delete on public.profiles,public.trips,public.plans to authenticated;
revoke all on public.profiles,public.trips,public.plans from anon;

drop trigger if exists trips_updated on public.trips; create trigger trips_updated before update on public.trips for each row execute function public.set_updated_at();
drop trigger if exists plans_updated on public.plans; create trigger plans_updated before update on public.plans for each row execute function public.set_updated_at();

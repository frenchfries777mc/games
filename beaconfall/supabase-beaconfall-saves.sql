-- Beaconfall 계정 저장 (Frenchfries777 계정)
-- Supabase 대시보드 > SQL Editor 에 붙여 넣고 한 번 실행하면 돼요.
create table if not exists public.beaconfall_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.beaconfall_saves enable row level security;

drop policy if exists "beaconfall_saves_select_own" on public.beaconfall_saves;
create policy "beaconfall_saves_select_own" on public.beaconfall_saves
  for select using (auth.uid() = user_id);

drop policy if exists "beaconfall_saves_insert_own" on public.beaconfall_saves;
create policy "beaconfall_saves_insert_own" on public.beaconfall_saves
  for insert with check (auth.uid() = user_id);

drop policy if exists "beaconfall_saves_update_own" on public.beaconfall_saves;
create policy "beaconfall_saves_update_own" on public.beaconfall_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

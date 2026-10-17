-- Frenchfries777 허브: 게임별 소식 받기 (구독한 게임의 새 패치노트를 뉴스에 표시)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
create table if not exists public.ff_follow (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game       text not null check (game in ('stickseum','crownenvoy','beaconfall')),
  seen       text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, game)
);
alter table public.ff_follow enable row level security;
drop policy if exists ff_follow_own on public.ff_follow;
create policy ff_follow_own on public.ff_follow for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

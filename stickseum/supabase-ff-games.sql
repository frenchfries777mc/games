-- Frenchfries777 게임 공용: 어떤 게임을 플레이했는지 기록 (Stickseum · Crown Envoy · Beaconfall)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- 이 기록으로 "세 게임 모두 플레이" 도전과제와 다른 게임 캐릭터 해금, 공용 프로필 카드가 동작해요.

create table if not exists public.ff_played (
  user_id   uuid not null references auth.users(id) on delete cascade,
  game      text not null check (game ~ '^[a-z0-9_]{2,24}$'),
  plays     int  not null default 1,
  first_at  timestamptz not null default now(),
  last_at   timestamptz not null default now(),
  primary key (user_id, game)
);
alter table public.ff_played enable row level security;
drop policy if exists ff_played_read on public.ff_played;
create policy ff_played_read on public.ff_played for select using (true);   -- 다른 사람 프로필 카드에서도 보이도록

-- 게임을 열고 로그인하면 이걸 한 번 불러요:  sb.rpc('ff_mark_played', { p_game: 'crownenvoy' })
-- (하루에 여러 번 불러도 plays는 6시간에 한 번만 올라가요)
create or replace function public.ff_mark_played(p_game text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  insert into public.ff_played (user_id, game) values (auth.uid(), p_game)
  on conflict (user_id, game) do update
    set plays   = public.ff_played.plays + case when public.ff_played.last_at < now() - interval '6 hours' then 1 else 0 end,
        last_at = now();
end $$;
revoke all on function public.ff_mark_played(text) from public;
grant execute on function public.ff_mark_played(text) to authenticated;

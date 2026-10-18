-- Frenchfries777 게임 랭킹 (게임별 누적 점수)
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 한 번 실행하면 돼요. 여러 번 실행해도 괜찮아요.
-- 게임은 판이 끝날 때 ff_add_score(게임id, 점수, 승리여부)를 불러 점수를 더해요.

create table if not exists public.ff_rank(
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null check (game in ('stickseum','crownenvoy','beaconfall')),
  points integer not null default 0,
  wins integer not null default 0,
  games integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,game)
);
create index if not exists ff_rank_game_points on public.ff_rank(game,points desc);

alter table public.ff_rank enable row level security;
drop policy if exists "ff_rank read" on public.ff_rank;
create policy "ff_rank read" on public.ff_rank for select using (true);
-- 직접 쓰기는 막고, 아래 함수로만 점수를 더해요 (한 판 최대 200점, 1분에 한 번)

create or replace function public.ff_add_score(p_game text, p_points integer, p_win boolean)
returns void language plpgsql security definer set search_path=public as $$
declare last timestamptz;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  select updated_at into last from ff_rank where user_id=auth.uid() and game=p_game;
  if last is not null and last > now() - interval '1 minute' then return; end if;
  insert into ff_rank(user_id,game,points,wins,games,updated_at)
  values(auth.uid(),p_game,greatest(0,least(coalesce(p_points,0),200)),case when p_win then 1 else 0 end,1,now())
  on conflict(user_id,game) do update set
    points=ff_rank.points+excluded.points,
    wins=ff_rank.wins+excluded.wins,
    games=ff_rank.games+1,
    updated_at=now();
end $$;
revoke all on function public.ff_add_score(text,integer,boolean) from public;
grant execute on function public.ff_add_score(text,integer,boolean) to authenticated;

-- Crown Envoy 시즌 랭킹 (월별 점수와 칭호용 기록)
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 한 번 실행하면 돼요. 여러 번 실행해도 괜찮아요.
-- 시즌은 한국 시간 기준 한 달이에요 (예: 2026-10). 게임은 판이 끝날 때 ce_add_season을 불러요.

create table if not exists public.ce_season(
  user_id uuid not null references auth.users(id) on delete cascade,
  season text not null,
  points integer not null default 0,
  wins integer not null default 0,
  games integer not null default 0,
  conq integer not null default 0,
  bw integer not null default 0,
  peace integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,season)
);
create index if not exists ce_season_pts on public.ce_season(season,points desc);

alter table public.ce_season enable row level security;
drop policy if exists "ce_season read" on public.ce_season;
create policy "ce_season read" on public.ce_season for select using (true);
-- 직접 쓰기는 막고, 아래 함수로만 더해요 (한 판 최대 점수·횟수 제한, 30초에 한 번)

create or replace function public.ce_add_season(p_season text, p_points integer, p_win boolean, p_conq integer, p_bw integer, p_peace integer)
returns void language plpgsql security definer set search_path=public as $$
declare last timestamptz;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if p_season !~ '^\d{4}-\d{2}$' then raise exception 'bad season'; end if;
  select updated_at into last from ce_season where user_id=auth.uid() and season=p_season;
  if last is not null and last > now() - interval '30 seconds' then return; end if;
  insert into ce_season(user_id,season,points,wins,games,conq,bw,peace,updated_at)
  values(auth.uid(),p_season,
    greatest(0,least(coalesce(p_points,0),200)),
    case when p_win then 1 else 0 end,1,
    greatest(0,least(coalesce(p_conq,0),80)),
    greatest(0,least(coalesce(p_bw,0),200)),
    greatest(0,least(coalesce(p_peace,0),40)),now())
  on conflict(user_id,season) do update set
    points=ce_season.points+excluded.points,
    wins=ce_season.wins+excluded.wins,
    games=ce_season.games+1,
    conq=ce_season.conq+excluded.conq,
    bw=ce_season.bw+excluded.bw,
    peace=ce_season.peace+excluded.peace,
    updated_at=now();
end $$;
revoke all on function public.ce_add_season(text,integer,boolean,integer,integer,integer) from public;
grant execute on function public.ce_add_season(text,integer,boolean,integer,integer,integer) to authenticated;

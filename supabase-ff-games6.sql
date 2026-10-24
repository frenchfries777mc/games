-- 게임 6개(Stickseum, Crown Envoy, Beaconfall, Isleport, Vowkeep, Dummy Party)를 계정에 보내기
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일 (이 순서): supabase-ff-hub.sql, supabase-ff-extra.sql, supabase-ff-achievements.sql,
--   supabase-ff-ach-list.sql, supabase-ff-more.sql, supabase-ff-follow.sql, supabase-ff-playtime-invite.sql
-- 게임 아이디: stickseum, crownenvoy, beaconfall, isleport, vowkeep, dummyparty

-- 1) 대표 게임 · 평점 · 같이 하기 · 소식 받기가 새 게임 세 개도 받게 허용
alter table public.ff_card    drop constraint if exists ff_card_fav_check;
alter table public.ff_card    add  constraint ff_card_fav_check    check (fav is null or fav in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty'));
alter table public.ff_ratings drop constraint if exists ff_ratings_game_check;
alter table public.ff_ratings add  constraint ff_ratings_game_check check (game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty'));
alter table public.ff_lfg     drop constraint if exists ff_lfg_game_check;
alter table public.ff_lfg     add  constraint ff_lfg_game_check    check (game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty'));
alter table public.ff_follow  drop constraint if exists ff_follow_game_check;
alter table public.ff_follow  add  constraint ff_follow_game_check check (game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty'));

-- 2) 접속 표시 · 플레이 시간 · 하루 한 줄 기록 (ff_ping 최신 판에서 하루 기록 대상만 6개로)
create or replace function public.ff_ping(p_game text) returns void language plpgsql security definer set search_path = public as $$
declare prev record; d int := 0;
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  select game, at into prev from public.ff_presence where user_id = auth.uid();
  if found and prev.game = p_game and now() - prev.at <= interval '100 seconds' then
    d := floor(extract(epoch from now() - prev.at))::int;
    if d < 5 then d := 0; end if;
    if d > 90 then d := 90; end if;
  end if;
  insert into public.ff_presence (user_id, game, at) values (auth.uid(), p_game, now())
  on conflict (user_id) do update set game = excluded.game, at = now();
  if d > 0 then
    insert into public.ff_playtime (user_id, game, secs) values (auth.uid(), p_game, d)
    on conflict (user_id, game) do update set secs = public.ff_playtime.secs + d;
  end if;
  if p_game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty') then
    insert into public.ff_play_days (user_id, game, day) values (auth.uid(), p_game, current_date) on conflict do nothing;
  end if;
end $$;
revoke all on function public.ff_ping(text) from public;
grant execute on function public.ff_ping(text) to authenticated;

create or replace function public.ff_week_games() returns table (game text, players int, last_week int) language sql stable security definer set search_path = public as $$
  select g.game,
    (select count(distinct user_id)::int from public.ff_play_days d where d.game = g.game and d.day > current_date - 7),
    (select count(distinct user_id)::int from public.ff_play_days d where d.game = g.game and d.day <= current_date - 7 and d.day > current_date - 14)
  from (values ('stickseum'),('crownenvoy'),('beaconfall'),('isleport'),('vowkeep'),('dummyparty')) g(game);
$$;
grant execute on function public.ff_week_games() to anon, authenticated;

-- 3) Isleport가 예전에 'islandtrade'라는 이름으로 보낸 기록을 'isleport'로 합치기 (플레이 횟수·도전과제·플레이 시간)
insert into public.ff_played (user_id, game, plays, ach_done, ach_total)
  select user_id, 'isleport', plays, ach_done, ach_total from public.ff_played where game = 'islandtrade'
  on conflict (user_id, game) do update set
    plays = greatest(public.ff_played.plays, excluded.plays),
    ach_done = greatest(public.ff_played.ach_done, excluded.ach_done),
    ach_total = greatest(public.ff_played.ach_total, excluded.ach_total);
delete from public.ff_played where game = 'islandtrade';
insert into public.ff_ach (user_id, game, ach_id, at)
  select user_id, 'isleport', ach_id, at from public.ff_ach where game = 'islandtrade'
  on conflict do nothing;
delete from public.ff_ach where game = 'islandtrade';
insert into public.ff_playtime (user_id, game, secs)
  select user_id, 'isleport', secs from public.ff_playtime where game = 'islandtrade'
  on conflict (user_id, game) do update set secs = public.ff_playtime.secs + excluded.secs;
delete from public.ff_playtime where game = 'islandtrade';

-- 확인: 아래 세 줄이 모두 0 이면 성공이에요. (islandtrade 기록이 남아 있지 않다는 뜻)
select (select count(*) from public.ff_played   where game = 'islandtrade') as played_left,
       (select count(*) from public.ff_ach      where game = 'islandtrade') as ach_left,
       (select count(*) from public.ff_playtime where game = 'islandtrade') as time_left;

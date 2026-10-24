-- 플레이 횟수가 실제보다 적게 나오던 것과, 플레이했는데 "아직 안 해봤어요"로 나오던 것 고치기
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일 (이 순서): stickseum/supabase-ff-games.sql(ff_played, ff_mark_played),
--   supabase-ff-playtime-invite.sql(ff_playtime, ff_ping), supabase-ff-games6.sql
--
-- 원인 1) 플레이 횟수는 "6시간에 한 번"만 올라갔어요. 마지막 기록에서 30분이 지난 뒤 다시 열면 1번으로 세도록 바꿔요.
-- 원인 2) 게임 쪽에서 "해 봤어요"를 보내는 코드가 없거나 로그인 전에 열어서, 플레이 기록 줄이 안 생긴 경우가 있었어요.
--        게임이 열려 있는 동안 1분마다 가는 접속 신호(ff_ping)가 기록 줄도 만들어 주고,
--        이미 플레이 시간이 1분 넘게 쌓였는데 기록 줄이 없는 사람은 아래에서 한 번 채워요.

-- 1) 플레이 횟수: 30분 이상 쉬었다가 다시 열면 1번
create or replace function public.ff_mark_played(p_game text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  insert into public.ff_played (user_id, game) values (auth.uid(), p_game)
  on conflict (user_id, game) do update
    set plays   = public.ff_played.plays + case when public.ff_played.last_at < now() - interval '30 minutes' then 1 else 0 end,
        last_at = now();
end $$;
revoke all on function public.ff_mark_played(text) from public;
grant execute on function public.ff_mark_played(text) to authenticated;

-- 2) 접속 신호가 플레이 기록 줄도 만들어요 (이미 있으면 그대로 둬요)
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
  insert into public.ff_played (user_id, game) values (auth.uid(), p_game) on conflict (user_id, game) do nothing;
  if p_game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty') then
    insert into public.ff_play_days (user_id, game, day) values (auth.uid(), p_game, current_date) on conflict do nothing;
  end if;
end $$;
revoke all on function public.ff_ping(text) from public;
grant execute on function public.ff_ping(text) to authenticated;

-- 3) 이미 플레이 시간이 쌓였는데 기록 줄이 없는 사람 채우기
insert into public.ff_played (user_id, game)
  select t.user_id, t.game from public.ff_playtime t
  where t.secs >= 60 and t.game in ('stickseum','crownenvoy','beaconfall','isleport','vowkeep','dummyparty')
  on conflict (user_id, game) do nothing;

-- 확인: 아래 조회는 "플레이 시간은 있는데 기록 줄이 없는 사람 수"예요. 0 이면 성공이에요.
select count(*) as still_missing
  from public.ff_playtime t
  where t.secs >= 60 and not exists (select 1 from public.ff_played p where p.user_id = t.user_id and p.game = t.game);

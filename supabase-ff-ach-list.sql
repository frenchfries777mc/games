-- Frenchfries777 공용 프로필 카드: 게임별로 "어떤 도전과제를 달성했는지"와 "전체 플레이어 중 몇 %가 달성했는지"
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-games.sql, supabase-ff-achievements.sql 을 먼저 실행한 뒤에 실행하세요.

-- 1) 누가 어떤 도전과제를 달성했는지 (Crown Envoy · Beaconfall 등). Stickseum은 원래 올리던 profiles.stats.ach 를 그대로 읽어요.
create table if not exists public.ff_ach (
  user_id uuid not null references auth.users(id) on delete cascade,
  game    text not null check (game ~ '^[a-z0-9_]{2,24}$'),
  ach_id  text not null check (ach_id ~ '^[A-Za-z0-9_.:-]{1,64}$'),
  at      timestamptz not null default now(),
  primary key (user_id, game, ach_id)
);
alter table public.ff_ach enable row level security;
drop policy if exists ff_ach_read on public.ff_ach;
create policy ff_ach_read on public.ff_ach for select using (true);   -- 다른 사람 프로필 카드에서도 보이도록

-- 2) 게임이 달성한 도전과제 목록을 올릴 때 불러요 (달성은 지워지지 않고 더해지기만 해요):
--   FFProfile.setAchievements(sb, 'crownenvoy', 달성한 수, 전체 수, ['first_game','first_win', ...])
create or replace function public.ff_sync_achievements(p_game text, p_ids text[], p_total int)
returns void language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  p_total := greatest(0, least(coalesce(p_total, 0), 1000));
  insert into public.ff_ach (user_id, game, ach_id)
    select auth.uid(), p_game, x from (select distinct unnest(coalesce(p_ids, '{}')) as x limit 1000) s
    where x ~ '^[A-Za-z0-9_.:-]{1,64}$'
  on conflict do nothing;
  select count(*) into n from public.ff_ach where user_id = auth.uid() and game = p_game;
  insert into public.ff_played (user_id, game, ach_done, ach_total) values (auth.uid(), p_game, least(n, p_total), p_total)
  on conflict (user_id, game) do update set ach_done = excluded.ach_done, ach_total = excluded.ach_total;
end $$;
revoke all on function public.ff_sync_achievements(text, text[], int) from public;
grant execute on function public.ff_sync_achievements(text, text[], int) to authenticated;

-- 3) 도전과제별 달성 비율. 결과: { "crownenvoy": { "players": 120, "ach": { "first_win": 87, ... } }, ... }
--    players = 그 게임을 플레이한 계정 수. Stickseum은 게임 안 도전과제 화면과 같은 기준(기록이 있는 계정 수)이에요.
create or replace function public.ff_ach_rates()
returns jsonb language sql stable security definer set search_path = public as $$
  with stk as (
    select id, stats->'ach' as ach from public.profiles where jsonb_typeof(stats) = 'object'
  ),
  done as (
    select game, ach_id, user_id from public.ff_ach where game <> 'stickseum'
    union
    select 'stickseum', a, id from stk, jsonb_array_elements_text(case when jsonb_typeof(ach) = 'array' then ach else '[]'::jsonb end) a
  ),
  players as (
    select game, count(*)::int as n from (
      select game, user_id from public.ff_played where game <> 'stickseum'
      union select game, user_id from done where game <> 'stickseum'
    ) p group by game
    union all
    select 'stickseum', count(*)::int from stk
  ),
  counts as (
    select game, jsonb_object_agg(ach_id, n) as ach from (
      select game, ach_id, count(distinct user_id)::int as n from done group by game, ach_id
    ) c group by game
  )
  select coalesce(jsonb_object_agg(p.game, jsonb_build_object('players', p.n, 'ach', coalesce(c.ach, '{}'::jsonb))), '{}'::jsonb)
  from players p left join counts c on c.game = p.game;
$$;
revoke all on function public.ff_ach_rates() from public;
grant execute on function public.ff_ach_rates() to anon, authenticated;

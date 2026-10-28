-- Crown Envoy 꼼수 방지: 옛 버전·직접 호출로 점수, 코인, 도전과제 보상을 올리지 못하게 막아요.
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 한 번 실행하면 돼요. 여러 번 실행해도 괜찮아요.
-- 먼저 supabase-ff-rank.sql, supabase-ce-season.sql, supabase-ce-coin.sql 이 돌려져 있어야 해요.
--
-- 무엇을 막나요
--  1) 판 시작 기록(ce_game_begin)이 없으면 랭킹 점수·코인·도전과제 코인이 올라가지 않아요. 옛 버전(0.1~0.4)과 b119 이전 빌드는 이 기록을 못 보내서 진행도가 오르지 않아요.
--  2) 랭킹 점수는 ce_game_finish로만 올라가요. 판 시작 뒤 90초가 지나야 하고, 한 번 쓰면 닫혀요. 하루 점수 600점·20판 한도가 있어요. (ff_rank·ce_season의 crownenvoy 줄은 직접 넣거나 고칠 수 없게 막혀요)
--  3) 도전과제 코인은 서버에 적어 둔 도전과제 이름과 금액(ce_ach_defs)만 받아요. 보내는 쪽이 정한 금액은 무시해요.
--  4) 플레이 코인은 판 시작 뒤 2분이 지나야 하고 2분에 한 번만 줘요.
--  5) 최소 빌드(ce_config.min_build)보다 낮은 빌드는 판을 시작할 수 없어요. 나중에 꼼수가 보이면 이 숫자만 올리면 돼요.
-- 확인 쿼리는 맨 아래에 있어요.

create table if not exists public.ce_config(key text primary key, val int not null);
alter table public.ce_config enable row level security;
insert into public.ce_config(key,val) values ('min_build',119) on conflict (key) do nothing;

create table if not exists public.ce_game_tokens(
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  build int not null default 0,
  used boolean not null default false,
  day date,
  pts_today int not null default 0,
  games_today int not null default 0
);
alter table public.ce_game_tokens enable row level security;

create table if not exists public.ce_ach_defs(key text primary key, amount int not null);
alter table public.ce_ach_defs enable row level security;
insert into public.ce_ach_defs(key,amount) values
  ('first_game',5),
  ('games10',10),
  ('games50',30),
  ('first_win',10),
  ('wins10',30),
  ('first_capture',5),
  ('caps100',40),
  ('def20',20),
  ('battles100',30),
  ('underdog',15),
  ('naval',15),
  ('empire30',25),
  ('rich',15),
  ('ally',10),
  ('nap',5),
  ('trade',5),
  ('truce',5),
  ('vassal',15),
  ('captor',15),
  ('master_gen',20),
  ('phoenix',30),
  ('coalition',20),
  ('conquest',40),
  ('dominion',40),
  ('tpl_win',15),
  ('friends',10),
  ('pvp_win',20),
  ('long_game',25),
  ('fallen',5),
  ('all',50)
on conflict (key) do update set amount = excluded.amount;

-- 판 시작을 알린다
create or replace function public.ce_game_begin(p_build int, p_turns int)
returns void language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); d date := (now() at time zone 'Asia/Seoul')::date; mb int;
begin
  if uid is null then raise exception 'login required'; end if;
  select val into mb from ce_config where key='min_build';
  if coalesce(p_build,0) < coalesce(mb,0) then raise exception 'update required'; end if;
  insert into ce_game_tokens(user_id,started_at,build,used,day,pts_today,games_today)
  values(uid,now(),p_build,false,d,0,0)
  on conflict (user_id) do update set
    started_at = now(), build = p_build, used = false,
    pts_today = case when ce_game_tokens.day is distinct from d then 0 else ce_game_tokens.pts_today end,
    games_today = case when ce_game_tokens.day is distinct from d then 0 else ce_game_tokens.games_today end,
    day = d;
end $$;
revoke all on function public.ce_game_begin(int,int) from public;
grant execute on function public.ce_game_begin(int,int) to authenticated;

-- 판이 끝났을 때 점수를 올린다 (돌려주는 값 = 실제로 올라간 점수)
create or replace function public.ce_game_finish(p_points int, p_win boolean, p_conq int, p_bw int, p_peace int)
returns int language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); t ce_game_tokens; g int;
begin
  if uid is null then raise exception 'login required'; end if;
  select * into t from ce_game_tokens where user_id=uid for update;
  if not found or t.used then raise exception 'no game'; end if;
  if now() - t.started_at < interval '90 seconds' then raise exception 'too fast'; end if;
  if t.games_today >= 20 then raise exception 'daily limit'; end if;
  g := greatest(0, least(coalesce(p_points,0), 200, 600 - t.pts_today));
  update ce_game_tokens set used=true, pts_today=t.pts_today+g, games_today=t.games_today+1 where user_id=uid;
  perform set_config('ce.ok','1',true);
  perform public.ff_add_score('crownenvoy', g, coalesce(p_win,false));
  perform public.ce_add_season(to_char(now() at time zone 'Asia/Seoul','YYYY-MM'), g, coalesce(p_win,false), p_conq, p_bw, p_peace);
  return g;
end $$;
revoke all on function public.ce_game_finish(int,boolean,int,int,int) from public;
grant execute on function public.ce_game_finish(int,boolean,int,int,int) to authenticated;

-- crownenvoy 점수 줄은 ce_game_finish 안에서만 쓸 수 있다
create or replace function public.ce_guard_rank() returns trigger language plpgsql as $$
begin
  if NEW.game = 'crownenvoy' and coalesce(current_setting('ce.ok', true),'') <> '1' then
    raise exception 'crownenvoy score is server-guarded';
  end if;
  return NEW;
end $$;
create or replace function public.ce_guard_season() returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('ce.ok', true),'') <> '1' then
    raise exception 'crownenvoy score is server-guarded';
  end if;
  return NEW;
end $$;
drop trigger if exists ce_guard_rank_t on public.ff_rank;
create trigger ce_guard_rank_t before insert or update on public.ff_rank for each row execute function public.ce_guard_rank();
drop trigger if exists ce_guard_season_t on public.ce_season;
create trigger ce_guard_season_t before insert or update on public.ce_season for each row execute function public.ce_guard_season();

-- 플레이 코인: 판 시작 기록이 있고 2분이 지나야, 2분에 한 번만
create or replace function public.ce_coin_play()
returns table(balance int, got int, today int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); d date := (now() at time zone 'Asia/Seoul')::date; w public.ce_wallet; g int; t ce_game_tokens;
begin
  if uid is null then raise exception 'login required'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  select * into w from public.ce_wallet x where x.user_id = uid for update;
  select * into t from ce_game_tokens where user_id = uid;
  if w.day is distinct from d then w.earned_today := 0; end if;
  g := least(10, 100 - w.earned_today);
  if g <= 0 or not found or t.started_at > now() - interval '12 hours' is not true
     or now() - t.started_at < interval '2 minutes'
     or (w.last_play is not null and now() - w.last_play < interval '2 minutes') then g := 0; end if;
  update public.ce_wallet x set balance = x.balance + g, earned_today = w.earned_today + g, day = d,
    last_play = case when g > 0 then now() else x.last_play end, updated_at = now()
   where x.user_id = uid returning * into w;
  if g > 0 then insert into public.ce_coin_log(user_id, delta, reason) values (uid, g, 'play'); end if;
  return query select w.balance, g, w.earned_today;
end $$;

-- 도전과제 코인: 서버에 적어 둔 이름만, 서버에 적어 둔 금액으로, 판 시작 기록이 있을 때만
create or replace function public.ce_coin_ach(p_items jsonb)
returns table(balance int, got int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); it jsonb; k text; n int; tot int := 0; ins int; b int; ok boolean;
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 60 then raise exception 'bad items'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  perform 1 from public.ce_wallet x where x.user_id = uid for update;
  select exists(select 1 from ce_game_tokens where user_id = uid and started_at > now() - interval '12 hours') into ok;
  if ok then
    for it in select * from jsonb_array_elements(p_items) loop
      k := left(coalesce(it->>'id',''), 40);
      select amount into n from ce_ach_defs where key = k;
      if k = '' or n is null then continue; end if;
      insert into public.ce_coin_ach(user_id, key, amount) values (uid, k, n) on conflict do nothing;
      get diagnostics ins = row_count;
      if ins > 0 then
        tot := tot + n;
        insert into public.ce_coin_log(user_id, delta, reason, ref) values (uid, n, 'ach', k);
      end if;
    end loop;
  end if;
  update public.ce_wallet x set balance = x.balance + tot, updated_at = now() where x.user_id = uid returning x.balance into b;
  return query select b, tot;
end $$;

-- 확인 쿼리 (결과가 모두 나오면 돼요)
--   select key, val from public.ce_config;                       -- min_build 119
--   select count(*) from public.ce_ach_defs;                     -- 30
--   select tgname from pg_trigger where tgname like 'ce_guard%'; -- 2줄

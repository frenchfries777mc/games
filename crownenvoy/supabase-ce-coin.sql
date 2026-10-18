-- Crown Envoy CrownCoin (cC): 지갑, 게임 플레이/도전과제 보상, 공유 시나리오 가격 · 체험 · 구매
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 Run 하세요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일 (이 순서):
--   1) supabase-ff-hub.sql  2) supabase-ff-coin.sql (ff_coin_rates, ff_coin_claim 이 있어야 해요)
--   3) supabase-ce-scenarios.sql (공유 시나리오 표)
-- 다 이미 실행하셨다면 이 파일만 실행하면 돼요.
-- 규칙: 게임 플레이 15턴마다 +10cC (하루 최대 100cC), 도전과제 +5~50cC (한 번씩),
--       허브 코인 1개 = 20cC, 시나리오 가격 0~500cC (기존 공유 시나리오는 모두 무료),
--       구매하면 판매 금액 전부가 올린 사람에게 가요 (수수료 없음).

-- ================= 1) 지갑 =================
create table if not exists public.ce_wallet(
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  day date,
  earned_today int not null default 0,
  last_play timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.ce_wallet enable row level security;
drop policy if exists ce_wallet_read on public.ce_wallet;
create policy ce_wallet_read on public.ce_wallet for select using (user_id = auth.uid());

create table if not exists public.ce_coin_log(
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta int not null,
  reason text not null check (reason in ('play','ach','exchange','buy','sale')),
  ref text,
  created_at timestamptz not null default now()
);
alter table public.ce_coin_log enable row level security;
drop policy if exists ce_coin_log_read on public.ce_coin_log;
create policy ce_coin_log_read on public.ce_coin_log for select using (user_id = auth.uid());
create index if not exists ce_coin_log_user on public.ce_coin_log(user_id, created_at desc);

create table if not exists public.ce_coin_ach(
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 40),
  amount int not null,
  primary key(user_id, key)
);
alter table public.ce_coin_ach enable row level security;

-- 허브 코인 환전 비율: 허브 코인 1개 = 20cC
insert into public.ff_coin_rates (game, unit, per_coin, active)
values ('crownenvoy', 'cC', 20, true)
on conflict (game) do update set unit = excluded.unit, per_coin = excluded.per_coin, active = true;

-- 지갑 열기: 허브에서 바꾼 코인을 받아 오고, 잔액과 오늘 번 양을 돌려줘요
create or replace function public.ce_wallet_get()
returns table(balance int, today int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); d date := (now() at time zone 'Asia/Seoul')::date; amt int; w public.ce_wallet;
begin
  if uid is null then raise exception 'login required'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  select * into w from public.ce_wallet x where x.user_id = uid for update;
  amt := coalesce(public.ff_coin_claim('crownenvoy'), 0);
  update public.ce_wallet x set
    balance = x.balance + amt,
    earned_today = case when x.day is distinct from d then 0 else x.earned_today end,
    day = d, updated_at = now()
   where x.user_id = uid returning * into w;
  if amt > 0 then insert into public.ce_coin_log(user_id, delta, reason) values (uid, amt, 'exchange'); end if;
  return query select w.balance, w.earned_today;
end $$;

-- 게임 플레이 보상: 부를 때마다 +10cC, 하루 100cC까지 (20초에 한 번)
create or replace function public.ce_coin_play()
returns table(balance int, got int, today int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); d date := (now() at time zone 'Asia/Seoul')::date; w public.ce_wallet; g int;
begin
  if uid is null then raise exception 'login required'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  select * into w from public.ce_wallet x where x.user_id = uid for update;
  if w.day is distinct from d then w.earned_today := 0; end if;
  g := least(10, 100 - w.earned_today);
  if g <= 0 or (w.last_play is not null and now() - w.last_play < interval '20 seconds') then g := 0; end if;
  update public.ce_wallet x set balance = x.balance + g, earned_today = w.earned_today + g, day = d,
    last_play = case when g > 0 then now() else x.last_play end, updated_at = now()
   where x.user_id = uid returning * into w;
  if g > 0 then insert into public.ce_coin_log(user_id, delta, reason) values (uid, g, 'play'); end if;
  return query select w.balance, g, w.earned_today;
end $$;

-- 도전과제 보상: p_items = [{"id":"phoenix","n":30}, ...]. 도전과제마다 한 번만, 5~50cC. 하루 한도에는 안 들어가요
create or replace function public.ce_coin_ach(p_items jsonb)
returns table(balance int, got int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); it jsonb; k text; n int; tot int := 0; ins int; b int;
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 60 then raise exception 'bad items'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  perform 1 from public.ce_wallet x where x.user_id = uid for update;
  for it in select * from jsonb_array_elements(p_items) loop
    k := left(coalesce(it->>'id',''), 40);
    n := least(50, greatest(5, coalesce((it->>'n')::int, 5)));
    if k = '' then continue; end if;
    insert into public.ce_coin_ach(user_id, key, amount) values (uid, k, n) on conflict do nothing;
    get diagnostics ins = row_count;
    if ins > 0 then
      tot := tot + n;
      insert into public.ce_coin_log(user_id, delta, reason, ref) values (uid, n, 'ach', k);
    end if;
  end loop;
  update public.ce_wallet x set balance = x.balance + tot, updated_at = now() where x.user_id = uid returning x.balance into b;
  return query select b, tot;
end $$;

-- ================= 2) 공유 시나리오 가격 · 체험 · 구매 =================
alter table public.ce_scenarios add column if not exists price int not null default 0;
alter table public.ce_scenarios add column if not exists sales int not null default 0;
alter table public.ce_scenarios drop constraint if exists ce_scenarios_price_check;
alter table public.ce_scenarios add constraint ce_scenarios_price_check check (price between 0 and 500);

create table if not exists public.ce_scen_buyers(
  scen_id uuid not null references public.ce_scenarios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  price int not null default 0,
  created_at timestamptz not null default now(),
  primary key(scen_id, user_id)
);
create table if not exists public.ce_scen_trials(
  scen_id uuid not null references public.ce_scenarios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(scen_id, user_id)
);
alter table public.ce_scen_buyers enable row level security;
alter table public.ce_scen_trials enable row level security;
drop policy if exists ce_buyers_read on public.ce_scen_buyers;
create policy ce_buyers_read on public.ce_scen_buyers for select using (user_id = auth.uid());
drop policy if exists ce_trials_read on public.ce_scen_trials;
create policy ce_trials_read on public.ce_scen_trials for select using (user_id = auth.uid());

-- 시나리오 내용(data)은 목록 조회로 못 읽게 막고, 아래 함수로만 줘요 (무료/내 것/산 것/체험 한 번)
revoke select on public.ce_scenarios from anon, authenticated;
grant select (id, user_id, author, name, descr, map, likes, downloads, created_at, updated_at, price, sales)
  on public.ce_scenarios to anon, authenticated;

-- 올리기 (가격 포함). 예전 5개 인자 함수는 그대로 두면 무료로 올라가요
create or replace function public.ce_scen_share(p_id uuid, p_name text, p_desc text, p_map int, p_data jsonb, p_price int)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text; rid uuid; pr int := least(500, greatest(0, coalesce(p_price, 0)));
begin
  if uid is null then raise exception 'login required'; end if;
  select coalesce(nullif(display_name,''), nullif(username,''), '이름 없음') into nm from public.profiles where id = uid;
  if p_id is not null and exists(select 1 from public.ce_scenarios where id = p_id and user_id = uid) then
    update public.ce_scenarios set name = left(p_name,24), descr = left(coalesce(p_desc,''),300), map = p_map, data = p_data,
      price = pr, author = coalesce(nm,'이름 없음'), updated_at = now() where id = p_id;
    return p_id;
  end if;
  if (select count(*) from public.ce_scenarios where user_id = uid) >= 30 then raise exception 'limit'; end if;
  insert into public.ce_scenarios(user_id, author, name, descr, map, data, price)
    values (uid, coalesce(nm,'이름 없음'), left(p_name,24), left(coalesce(p_desc,''),300), p_map, p_data, pr) returning id into rid;
  return rid;
end $$;

-- 시나리오 받기: 무료이거나 내 것이거나 이미 산 것만. 아니면 'paid' 오류
create or replace function public.ce_scen_get(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s public.ce_scenarios;
begin
  if uid is null then raise exception 'login required'; end if;
  select * into s from public.ce_scenarios where id = p_id;
  if not found then raise exception 'not found'; end if;
  if s.price > 0 and s.user_id <> uid and not exists(select 1 from public.ce_scen_buyers where scen_id = p_id and user_id = uid) then
    raise exception 'paid';
  end if;
  return jsonb_build_object('id', s.id, 'name', s.name, 'descr', s.descr, 'map', s.map, 'data', s.data, 'price', s.price);
end $$;

-- 체험: 유료 시나리오를 사기 전에 딱 한 번. 두 번째는 'trial used' 오류
create or replace function public.ce_scen_trial(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s public.ce_scenarios; ins int;
begin
  if uid is null then raise exception 'login required'; end if;
  select * into s from public.ce_scenarios where id = p_id;
  if not found then raise exception 'not found'; end if;
  if s.price > 0 and s.user_id <> uid and not exists(select 1 from public.ce_scen_buyers where scen_id = p_id and user_id = uid) then
    insert into public.ce_scen_trials(scen_id, user_id) values (p_id, uid) on conflict do nothing;
    get diagnostics ins = row_count;
    if ins = 0 then raise exception 'trial used'; end if;
  end if;
  return jsonb_build_object('id', s.id, 'name', s.name, 'descr', s.descr, 'map', s.map, 'data', s.data, 'price', s.price);
end $$;

-- 구매: 내 cC를 빼고 올린 사람에게 같은 만큼 줘요. 한꺼번에 처리돼서 중간에 끊겨도 한쪽만 바뀌지 않아요
create or replace function public.ce_scen_buy(p_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s public.ce_scenarios; b int;
begin
  if uid is null then raise exception 'login required'; end if;
  select * into s from public.ce_scenarios where id = p_id for update;
  if not found then raise exception 'not found'; end if;
  insert into public.ce_wallet(user_id) values (uid) on conflict (user_id) do nothing;
  if s.price = 0 or s.user_id = uid or exists(select 1 from public.ce_scen_buyers where scen_id = p_id and user_id = uid) then
    select balance into b from public.ce_wallet where user_id = uid; return b;
  end if;
  update public.ce_wallet set balance = balance - s.price, updated_at = now()
   where user_id = uid and balance >= s.price returning balance into b;
  if not found then raise exception 'not enough'; end if;
  insert into public.ce_wallet(user_id) values (s.user_id) on conflict (user_id) do nothing;
  update public.ce_wallet set balance = balance + s.price, updated_at = now() where user_id = s.user_id;
  insert into public.ce_scen_buyers(scen_id, user_id, price) values (p_id, uid, s.price);
  update public.ce_scenarios set sales = sales + 1 where id = p_id;
  insert into public.ce_coin_log(user_id, delta, reason, ref) values (uid, -s.price, 'buy', p_id::text), (s.user_id, s.price, 'sale', p_id::text);
  return b;
end $$;

revoke all on function public.ce_wallet_get() from public, anon;
revoke all on function public.ce_coin_play() from public, anon;
revoke all on function public.ce_coin_ach(jsonb) from public, anon;
revoke all on function public.ce_scen_share(uuid,text,text,int,jsonb,int) from public, anon;
revoke all on function public.ce_scen_get(uuid) from public, anon;
revoke all on function public.ce_scen_trial(uuid) from public, anon;
revoke all on function public.ce_scen_buy(uuid) from public, anon;
grant execute on function public.ce_wallet_get() to authenticated;
grant execute on function public.ce_coin_play() to authenticated;
grant execute on function public.ce_coin_ach(jsonb) to authenticated;
grant execute on function public.ce_scen_share(uuid,text,text,int,jsonb,int) to authenticated;
grant execute on function public.ce_scen_get(uuid) to authenticated;
grant execute on function public.ce_scen_trial(uuid) to authenticated;
grant execute on function public.ce_scen_buy(uuid) to authenticated;

-- ================= 확인 =================
-- 아래 표의 모든 줄이 ok = true 여야 해요.
select 'ce_wallet 표' as item, to_regclass('public.ce_wallet') is not null as ok
union all select 'ce_scen_buyers 표', to_regclass('public.ce_scen_buyers') is not null
union all select 'price 열', exists(select 1 from information_schema.columns where table_name='ce_scenarios' and column_name='price')
union all select '함수 7개', (select count(*) from pg_proc where proname in ('ce_wallet_get','ce_coin_play','ce_coin_ach','ce_scen_share','ce_scen_get','ce_scen_trial','ce_scen_buy')) >= 7
union all select '환전 비율 20cC', exists(select 1 from public.ff_coin_rates where game='crownenvoy' and per_coin=20 and active)
union all select 'data 열 직접 조회 막힘', not has_column_privilege('authenticated','public.ce_scenarios','data','select');

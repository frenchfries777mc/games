-- Frenchfries777 허브: 출석 달력 7일 보너스 · Hub Coin 선물 · 게임 공략 위키 · 지금 접속 중
-- Supabase SQL Editor에 통째로 붙여 넣고 Run 하세요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일: supabase-ff-hub.sql, supabase-ff-social.sql, supabase-ff-coin.sql

-- ================= 1) 출석 7일 연속 보너스 (+20) · 선물 기록 =================
alter table public.ff_coin_log drop constraint if exists ff_coin_log_reason_check;
alter table public.ff_coin_log add constraint ff_coin_log_reason_check
  check (reason in ('daily','streak','exchange','admin','gift_in','gift_out'));
alter table public.ff_coin_log add column if not exists other_id uuid references auth.users(id) on delete set null;

-- got = 이번에 받은 코인 (출석 10 + 7일마다 보너스 20). 이미 받았으면 0
create or replace function public.ff_coin_daily()
returns table (coins int, got int, streak int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Seoul')::date; w public.ff_coins; bonus int := 0;
begin
  if uid is null then raise exception 'login required'; end if;
  insert into public.ff_coins (user_id) values (uid) on conflict (user_id) do nothing;
  select * into w from public.ff_coins c where c.user_id = uid for update;
  if w.last_day is not distinct from today then
    return query select w.coins, 0, w.streak; return;
  end if;
  update public.ff_coins c set last_day = today,
         streak = case when w.last_day = today - 1 then c.streak + 1 else 1 end, updated_at = now()
   where c.user_id = uid returning * into w;
  if w.streak % 7 = 0 then bonus := 20; end if;
  update public.ff_coins c set coins = c.coins + 10 + bonus, earned = c.earned + 10 + bonus where c.user_id = uid returning * into w;
  insert into public.ff_coin_log (user_id, delta, reason) values (uid, 10, 'daily');
  if bonus > 0 then insert into public.ff_coin_log (user_id, delta, reason) values (uid, bonus, 'streak'); end if;
  return query select w.coins, 10 + bonus, w.streak;
end $$;
revoke all on function public.ff_coin_daily() from public, anon;
grant execute on function public.ff_coin_daily() to authenticated;

-- ================= 2) Hub Coin 선물 (친구끼리만, 한 번에 1~100개, 하루에 보내는 양 최대 100개) =================
alter table public.ff_notes drop constraint if exists ff_notes_kind_check;
alter table public.ff_notes add constraint ff_notes_kind_check
  check (kind in ('comment','like','friend','dm','feedback','report','mention','mentionc','coin'));

create or replace function public.ff_coin_gift(p_to uuid, p_coins int)
returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); left_ int; sent int; today_start timestamptz := ((now() at time zone 'Asia/Seoul')::date)::timestamp at time zone 'Asia/Seoul';
begin
  if uid is null then raise exception 'login required'; end if;
  if p_to is null or p_to = uid then raise exception 'bad target'; end if;
  if p_coins is null or p_coins < 1 or p_coins > 100 then raise exception 'bad amount'; end if;
  if not exists (select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = uid and f.addressee_id = p_to) or (f.requester_id = p_to and f.addressee_id = uid))) then
    raise exception 'not friends';
  end if;
  if public.ff_blocked(p_to, uid) then raise exception 'not friends'; end if;
  select coalesce(-sum(delta), 0) into sent from public.ff_coin_log where user_id = uid and reason = 'gift_out' and created_at >= today_start;
  if sent + p_coins > 100 then raise exception 'daily gift limit'; end if;
  update public.ff_coins c set coins = c.coins - p_coins, updated_at = now()
   where c.user_id = uid and c.coins >= p_coins returning c.coins into left_;
  if not found then raise exception 'not enough coins'; end if;
  insert into public.ff_coins (user_id, coins, earned) values (p_to, p_coins, 0)
  on conflict (user_id) do update set coins = public.ff_coins.coins + p_coins, updated_at = now();
  insert into public.ff_coin_log (user_id, delta, reason, other_id) values (uid, -p_coins, 'gift_out', p_to), (p_to, p_coins, 'gift_in', uid);
  insert into public.ff_notes (user_id, kind, actor_id, ref) values (p_to, 'coin', uid, p_coins);
  return left_;
end $$;
revoke all on function public.ff_coin_gift(uuid, int) from public, anon;
grant execute on function public.ff_coin_gift(uuid, int) to authenticated;

-- ================= 3) 게임 공략 위키 (누구나 읽고, 로그인하면 고칠 수 있어요. 고친 기록이 남아요) =================
create table if not exists public.ff_wiki (
  game       text not null check (game ~ '^[a-z0-9_]{2,24}$'),
  slug       text not null check (slug ~ '^[a-z0-9-]{1,40}$'),
  title      text not null check (char_length(title) between 1 and 60),
  body       text not null default '' check (char_length(body) <= 20000),
  sort       int not null default 100,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (game, slug)
);
alter table public.ff_wiki enable row level security;
drop policy if exists ff_wiki_read on public.ff_wiki;
create policy ff_wiki_read on public.ff_wiki for select using (true);
drop policy if exists ff_wiki_admin on public.ff_wiki;
create policy ff_wiki_admin on public.ff_wiki for delete using (public.ff_is_admin());

create table if not exists public.ff_wiki_hist (
  id         bigint generated always as identity primary key,
  game       text not null,
  slug       text not null,
  title      text not null,
  body       text not null,
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.ff_wiki_hist enable row level security;
drop policy if exists ff_wiki_hist_read on public.ff_wiki_hist;
create policy ff_wiki_hist_read on public.ff_wiki_hist for select using (true);
create index if not exists ff_wiki_hist_page on public.ff_wiki_hist (game, slug, created_at desc);

-- 글 저장 (새 글도 이걸로 만들어요). 10분에 10번까지
create or replace function public.ff_wiki_save(p_game text, p_slug text, p_title text, p_body text)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'login required'; end if;
  if p_game not in ('stickseum','crownenvoy','beaconfall') then raise exception 'bad game'; end if;
  select count(*) into n from public.ff_wiki_hist where user_id = uid and created_at > now() - interval '10 minutes';
  if n >= 10 and not public.ff_is_admin() then raise exception 'too many, slow down' using errcode = 'P0001'; end if;
  insert into public.ff_wiki (game, slug, title, body, updated_by, updated_at)
  values (p_game, p_slug, trim(p_title), coalesce(p_body, ''), uid, now())
  on conflict (game, slug) do update set title = excluded.title, body = excluded.body, updated_by = uid, updated_at = now();
  insert into public.ff_wiki_hist (game, slug, title, body, user_id) values (p_game, p_slug, trim(p_title), coalesce(p_body, ''), uid);
end $$;
revoke all on function public.ff_wiki_save(text, text, text, text) from public, anon;
grant execute on function public.ff_wiki_save(text, text, text, text) to authenticated;

-- ================= 4) 지금 접속 중 =================
-- 허브를 보고 있는 사람 (hub.js 가 1분마다 알려요). 게임 중인 사람은 ff_presence 에 있어요
create table if not exists public.ff_hub_seen (
  user_id uuid primary key references auth.users(id) on delete cascade,
  at      timestamptz not null default now()
);
alter table public.ff_hub_seen enable row level security;
create or replace function public.ff_hub_ping() returns void language sql security definer set search_path = public as $$
  insert into public.ff_hub_seen (user_id, at) select auth.uid(), now() where auth.uid() is not null
  on conflict (user_id) do update set at = now();
$$;
revoke all on function public.ff_hub_ping() from public, anon;
grant execute on function public.ff_hub_ping() to authenticated;

-- 2분 안에 신호를 보낸 사람 수 (게임별 + 허브). 누가 접속했는지는 알려 주지 않아요
create or replace function public.ff_online()
returns table (place text, people int)
language sql stable security definer set search_path = public as $$
  with p as (
    select user_id, game as place from public.ff_presence where at > now() - interval '2 minutes'
    union all
    select h.user_id, 'hub' from public.ff_hub_seen h where h.at > now() - interval '2 minutes'
      and not exists (select 1 from public.ff_presence x where x.user_id = h.user_id and x.at > now() - interval '2 minutes'))
  select place, count(distinct user_id)::int from p group by place
  union all
  select 'all', count(distinct user_id)::int from p;
$$;
grant execute on function public.ff_online() to anon, authenticated;

-- 지금 접속 중인 내 친구 (게임 중이면 게임 이름, 아니면 hub)
create or replace function public.ff_online_friends()
returns table (user_id uuid, place text)
language sql stable security definer set search_path = public as $$
  with fr as (
    select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as id
      from public.friendships f
     where f.status = 'accepted' and (f.requester_id = auth.uid() or f.addressee_id = auth.uid()))
  select fr.id, coalesce(
           (select p.game from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '2 minutes'),
           (select 'hub' from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '2 minutes'))
    from fr
   where exists (select 1 from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '2 minutes')
      or exists (select 1 from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '2 minutes');
$$;
revoke all on function public.ff_online_friends() from public, anon;
grant execute on function public.ff_online_friends() to authenticated;

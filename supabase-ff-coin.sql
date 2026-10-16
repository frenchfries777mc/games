-- Frenchfries777 허브: Hub Coin (매일 출석 +10, 게임 재화로 환전) + @멘션 알림
-- Supabase SQL Editor에 통째로 붙여 넣고 Run 하세요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일: supabase-ff-hub.sql, supabase-ff-social.sql

-- ================= 1) Hub Coin =================
-- 지갑 (본인만 볼 수 있어요. 숫자는 아래 함수로만 바뀌어요)
create table if not exists public.ff_coins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  coins      int not null default 0 check (coins >= 0),
  earned     int not null default 0,
  last_day   date,
  streak     int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.ff_coins enable row level security;
drop policy if exists ff_coins_read on public.ff_coins;
create policy ff_coins_read on public.ff_coins for select using (user_id = auth.uid());

-- 코인 기록 (받은 것, 쓴 것)
create table if not exists public.ff_coin_log (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  delta      int not null,
  reason     text not null check (reason in ('daily','exchange','admin')),
  game       text,
  created_at timestamptz not null default now()
);
alter table public.ff_coin_log enable row level security;
drop policy if exists ff_coin_log_read on public.ff_coin_log;
create policy ff_coin_log_read on public.ff_coin_log for select using (user_id = auth.uid());
create index if not exists ff_coin_log_user on public.ff_coin_log (user_id, created_at desc);

-- 환전 비율 (누구나 보고, 관리자만 바꿔요). per_coin = 코인 1개로 받는 게임 재화 수
create table if not exists public.ff_coin_rates (
  game     text primary key check (char_length(game) between 1 and 30),
  unit     text not null check (char_length(unit) between 1 and 20),
  per_coin int not null check (per_coin between 1 and 100000),
  active   boolean not null default true
);
alter table public.ff_coin_rates enable row level security;
drop policy if exists ff_coin_rates_read on public.ff_coin_rates;
create policy ff_coin_rates_read on public.ff_coin_rates for select using (true);
drop policy if exists ff_coin_rates_admin on public.ff_coin_rates;
create policy ff_coin_rates_admin on public.ff_coin_rates for all using (public.ff_is_admin()) with check (public.ff_is_admin());
insert into public.ff_coin_rates (game, unit, per_coin) values ('stickseum', 'gold', 10) on conflict (game) do nothing;

-- 환전한 재화가 게임에 들어가기를 기다리는 곳. 게임이 ff_coin_claim 으로 한 번만 받아 가요
create table if not exists public.ff_coin_out (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  game       text not null,
  coins      int not null check (coins > 0),
  amount     int not null check (amount > 0),
  claimed    boolean not null default false,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
alter table public.ff_coin_out enable row level security;
drop policy if exists ff_coin_out_read on public.ff_coin_out;
create policy ff_coin_out_read on public.ff_coin_out for select using (user_id = auth.uid());
create index if not exists ff_coin_out_wait on public.ff_coin_out (user_id, game) where not claimed;

-- 매일 출석: 한국 시간 기준 하루 한 번 +10. got = 이번에 받은 코인 (이미 받았으면 0)
create or replace function public.ff_coin_daily()
returns table (coins int, got int, streak int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Seoul')::date; w public.ff_coins;
begin
  if uid is null then raise exception 'login required'; end if;
  insert into public.ff_coins (user_id) values (uid) on conflict (user_id) do nothing;
  select * into w from public.ff_coins c where c.user_id = uid for update;
  if w.last_day is not distinct from today then
    return query select w.coins, 0, w.streak; return;
  end if;
  update public.ff_coins c set coins = c.coins + 10, earned = c.earned + 10, last_day = today,
         streak = case when w.last_day = today - 1 then c.streak + 1 else 1 end, updated_at = now()
   where c.user_id = uid returning * into w;
  insert into public.ff_coin_log (user_id, delta, reason) values (uid, 10, 'daily');
  return query select w.coins, 10, w.streak;
end $$;
revoke all on function public.ff_coin_daily() from public, anon;
grant execute on function public.ff_coin_daily() to authenticated;

-- 환전: 코인을 빼고, 그 게임에서 받을 재화를 남겨 둬요
create or replace function public.ff_coin_exchange(p_game text, p_coins int)
returns table (coins int, amount int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r public.ff_coin_rates; left_ int; amt int;
begin
  if uid is null then raise exception 'login required'; end if;
  if p_coins is null or p_coins < 1 or p_coins > 100000 then raise exception 'bad amount'; end if;
  select * into r from public.ff_coin_rates x where x.game = p_game and x.active;
  if not found then raise exception 'no such game'; end if;
  update public.ff_coins c set coins = c.coins - p_coins, updated_at = now()
   where c.user_id = uid and c.coins >= p_coins returning c.coins into left_;
  if not found then raise exception 'not enough coins'; end if;
  amt := p_coins * r.per_coin;
  insert into public.ff_coin_out (user_id, game, coins, amount) values (uid, p_game, p_coins, amt);
  insert into public.ff_coin_log (user_id, delta, reason, game) values (uid, -p_coins, 'exchange', p_game);
  return query select left_, amt;
end $$;
revoke all on function public.ff_coin_exchange(text, int) from public, anon;
grant execute on function public.ff_coin_exchange(text, int) to authenticated;

-- 게임이 부르는 함수: 기다리던 재화를 모두 받아 가요 (두 창에서 동시에 불러도 한 번만)
create or replace function public.ff_coin_claim(p_game text)
returns int
language sql security definer set search_path = public as $$
  with t as (
    update public.ff_coin_out o set claimed = true, claimed_at = now()
     where o.user_id = auth.uid() and o.game = p_game and not o.claimed
    returning o.amount)
  select coalesce(sum(amount), 0)::int from t;
$$;
revoke all on function public.ff_coin_claim(text) from public, anon;
grant execute on function public.ff_coin_claim(text) to authenticated;

-- ================= 2) @멘션 알림 =================
-- 알림 종류에 mention(글 · 댓글), mentionc(채팅) 추가
alter table public.ff_notes drop constraint if exists ff_notes_kind_check;
alter table public.ff_notes add constraint ff_notes_kind_check
  check (kind in ('comment','like','friend','dm','feedback','report','mention','mentionc'));

-- 글에서 @닉네임 으로 부른 사람들 (최대 5명). 닉네임 뒤에는 공백이나 문장부호가 와야 해요
create or replace function public.ff_mentioned(p_text text)
returns setof uuid language sql stable security definer set search_path = public as $$
  select p.id from public.profiles p
   where p_text like '%@%'
     and char_length(trim(coalesce(p.display_name, ''))) between 1 and 24
     and lower(p_text) ~ ('@' || regexp_replace(lower(trim(p.display_name)), '([.*+?^${}()|\[\]\\])', '\\\1', 'g') || '($|[^[:alnum:]_가-힣])')
   limit 5;
$$;
revoke all on function public.ff_mentioned(text) from public, anon, authenticated;

create or replace function public.ff_note_mention() returns trigger language plpgsql security definer set search_path = public as $$
declare u uuid; txt text; k text := 'mention'; ref_ bigint;
begin
  if tg_table_name = 'ff_posts' then txt := coalesce(new.title, '') || ' ' || coalesce(new.body, ''); ref_ := new.id;
  elsif tg_table_name = 'ff_comments' then txt := new.body; ref_ := new.post_id;
  else txt := new.body; ref_ := new.id; k := 'mentionc'; end if;
  if txt is null or position('@' in txt) = 0 then return new; end if;
  for u in select public.ff_mentioned(txt) loop
    perform public.ff_note(u, k, new.user_id, ref_);
  end loop;
  return new;
end $$;
drop trigger if exists ff_note_mention on public.ff_posts;
create trigger ff_note_mention after insert on public.ff_posts for each row execute function public.ff_note_mention();
drop trigger if exists ff_note_mention on public.ff_comments;
create trigger ff_note_mention after insert on public.ff_comments for each row execute function public.ff_note_mention();
drop trigger if exists ff_note_mention on public.ff_chat;
create trigger ff_note_mention after insert on public.ff_chat for each row execute function public.ff_note_mention();

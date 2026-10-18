-- Stickseum: 랭크전 + 선물하기 (Supabase 테이블)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)

-- ================= 랭크전 =================
create table if not exists public.ranked_ratings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  season     text not null,                       -- 'YYYY-MM' (한국 시간), 매달 새 시즌
  name       text not null default '',
  rating     int  not null default 1000,
  wins       int  not null default 0,
  losses     int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, season)
);
create index if not exists ranked_ratings_board on public.ranked_ratings (season, rating desc);
alter table public.ranked_ratings enable row level security;
drop policy if exists ranked_ratings_read on public.ranked_ratings;
create policy ranked_ratings_read on public.ranked_ratings for select using (true);

create table if not exists public.ranked_matches (
  id         bigserial primary key,
  season     text not null,
  winner     uuid not null references auth.users(id) on delete cascade,
  loser      uuid not null references auth.users(id) on delete cascade,
  delta      int  not null,
  created_at timestamptz not null default now()
);
create index if not exists ranked_matches_pair on public.ranked_matches (winner, loser, created_at);
alter table public.ranked_matches enable row level security;
drop policy if exists ranked_matches_read on public.ranked_matches;
create policy ranked_matches_read on public.ranked_matches for select using (true);

-- 경기를 연 사람(호스트)이 끝난 랭크전의 승자/패자를 알려요. 점수는 여기서만 바뀌어요 (직접 수정 불가).
create or replace function public.ranked_report(p_win uuid, p_lose uuid)
returns table (win_rating int, lose_rating int, delta int, lost int, capped boolean)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  s  text := to_char(now() at time zone 'Asia/Seoul', 'YYYY-MM');
  rw int; rl int; d int; dl int; n int; nw text; nl text;
begin
  if auth.uid() is null or p_win is null or p_lose is null or p_win = p_lose or auth.uid() not in (p_win, p_lose) then
    raise exception 'not allowed';
  end if;
  select coalesce(nullif(trim(p.display_name), ''), p.username, '') into nw from public.profiles p where p.id = p_win;
  select coalesce(nullif(trim(p.display_name), ''), p.username, '') into nl from public.profiles p where p.id = p_lose;
  insert into public.ranked_ratings (user_id, season, name) values (p_win,  s, left(coalesce(nw, ''), 16))
    on conflict (user_id, season) do update set name = excluded.name;
  insert into public.ranked_ratings (user_id, season, name) values (p_lose, s, left(coalesce(nl, ''), 16))
    on conflict (user_id, season) do update set name = excluded.name;
  -- 두 줄을 같은 순서로 잠가서 동시에 보고해도 꼬이지 않게
  perform 1 from public.ranked_ratings r where r.season = s and r.user_id in (p_win, p_lose) order by r.user_id for update;
  select r.rating into rw from public.ranked_ratings r where r.user_id = p_win  and r.season = s;
  select r.rating into rl from public.ranked_ratings r where r.user_id = p_lose and r.season = s;
  -- 같은 두 사람은 24시간에 3판까지만 점수가 바뀌어요
  select count(*) into n from public.ranked_matches m
   where m.created_at > now() - interval '1 day'
     and ((m.winner = p_win and m.loser = p_lose) or (m.winner = p_lose and m.loser = p_win));
  if n >= 3 then
    return query select rw, rl, 0, 0, true;
    return;
  end if;
  d  := greatest(1, round(32 * (1 - 1.0 / (1 + power(10.0, (rl - rw) / 400.0))))::int);
  dl := least(d, rl);
  update public.ranked_ratings r set rating = r.rating + d,  wins   = r.wins + 1,   updated_at = now() where r.user_id = p_win  and r.season = s returning r.rating into rw;
  update public.ranked_ratings r set rating = r.rating - dl, losses = r.losses + 1, updated_at = now() where r.user_id = p_lose and r.season = s returning r.rating into rl;
  insert into public.ranked_matches (season, winner, loser, delta) values (s, p_win, p_lose, d);
  return query select rw, rl, d, dl, false;
end $$;
revoke all on function public.ranked_report(uuid, uuid) from public;
grant execute on function public.ranked_report(uuid, uuid) to authenticated;

-- ================= 선물하기 =================
create table if not exists public.gifts (
  id         bigserial primary key,
  from_id    uuid not null references auth.users(id) on delete cascade,
  to_id      uuid not null references auth.users(id) on delete cascade,
  item_id    text not null check (char_length(item_id) between 1 and 40),
  from_name  text not null default '' check (char_length(from_name) <= 16),
  msg        text not null default '' check (char_length(msg) <= 40),
  claimed    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists gifts_inbox on public.gifts (to_id) where not claimed;
alter table public.gifts enable row level security;
drop policy if exists gifts_read on public.gifts;
create policy gifts_read on public.gifts for select using (auth.uid() = from_id or auth.uid() = to_id);
drop policy if exists gifts_send on public.gifts;
create policy gifts_send on public.gifts for insert with check (
  auth.uid() = from_id and from_id <> to_id and claimed = false
  and exists (select 1 from public.friendships f
               where f.status = 'accepted'
                 and ((f.requester_id = from_id and f.addressee_id = to_id) or (f.requester_id = to_id and f.addressee_id = from_id)))
);

-- 받는 사람이 선물을 받아요. 한 번만 받을 수 있어요 (브라우저 두 개에서 동시에 받아도 한 번).
create or replace function public.gift_claim(p_id bigint)
returns table (item_id text, from_name text, msg text)
language sql security definer set search_path = public as $$
  update public.gifts g set claimed = true
   where g.id = p_id and g.to_id = auth.uid() and g.claimed = false
  returning g.item_id, g.from_name, g.msg;
$$;
revoke all on function public.gift_claim(bigint) from public;
grant execute on function public.gift_claim(bigint) to authenticated;

-- 온라인일 때 선물이 바로 도착하도록 (실시간 알림)
do $$ begin
  alter publication supabase_realtime add table public.gifts;
exception when duplicate_object then null; when undefined_object then null;
end $$;

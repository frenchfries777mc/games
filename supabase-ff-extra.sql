-- Frenchfries777 허브: 프로필 카드 꾸미기 · 이번 주 인기 게임 · 투표
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-hub.sql 을 먼저 실행한 뒤에 실행하세요.
-- (게임 랭킹은 crownenvoy 저장소의 supabase-ff-rank.sql 을 따로 실행해야 보여요)

-- 1) 프로필 카드 꾸미기: 허브 도전과제를 모은 개수만큼 카드 배경 · 테두리가 열려요
create table if not exists public.ff_deco (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  bg         text not null default 'base',
  fr         text not null default 'gold',
  updated_at timestamptz not null default now()
);
alter table public.ff_deco enable row level security;
drop policy if exists ff_deco_read on public.ff_deco;
create policy ff_deco_read on public.ff_deco for select using (true);
drop policy if exists ff_deco_own on public.ff_deco;
create policy ff_deco_own on public.ff_deco for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- how many hub achievements each look needs (keep in step with DECO in ff-profile.js)
create or replace function public.ff_deco_need(p_kind text, p_id text) returns int language sql immutable as $$
  select case p_kind
    when 'bg' then case p_id when 'base' then 0 when 'night' then 2 when 'ocean' then 4 when 'forest' then 6 when 'sakura' then 9 when 'galaxy' then 12 end
    when 'fr' then case p_id when 'gold' then 0 when 'silver' then 3 when 'ruby' then 5 when 'emerald' then 8 when 'rainbow' then 11 when 'crown' then 15 end
  end;
$$;
create or replace function public.ff_deco_check() returns trigger language plpgsql security definer set search_path = public as $$
declare have int; nb int := public.ff_deco_need('bg', new.bg); nf int := public.ff_deco_need('fr', new.fr);
begin
  if nb is null or nf is null then raise exception 'unknown look'; end if;
  select count(*) into have from public.ff_ach where user_id = new.user_id and game = 'hub';
  if have < greatest(nb, nf) then raise exception 'locked'; end if;
  new.updated_at := now(); return new;
end $$;
drop trigger if exists ff_deco_check on public.ff_deco;
create trigger ff_deco_check before insert or update on public.ff_deco for each row execute function public.ff_deco_check();

-- 2) 이번 주 인기 게임: 게임을 한 날을 하루에 한 줄씩 기록해요 (ff-presence.js 가 부르는 ff_ping 이 같이 적어요)
create table if not exists public.ff_play_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  game    text not null,
  day     date not null default current_date,
  primary key (user_id, game, day)
);
alter table public.ff_play_days enable row level security;   -- nobody reads it directly; only the counts below
create index if not exists ff_play_days_day on public.ff_play_days (day);
create or replace function public.ff_ping(p_game text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  insert into public.ff_presence (user_id, game, at) values (auth.uid(), p_game, now())
  on conflict (user_id) do update set game = excluded.game, at = now();
  if p_game in ('stickseum','crownenvoy','beaconfall') then
    insert into public.ff_play_days (user_id, game, day) values (auth.uid(), p_game, current_date) on conflict do nothing;
  end if;
end $$;
revoke all on function public.ff_ping(text) from public;
grant execute on function public.ff_ping(text) to authenticated;
-- players per game in the last 7 days, and the 7 days before that (to show up/down)
create or replace function public.ff_week_games() returns table (game text, players int, last_week int) language sql stable security definer set search_path = public as $$
  select g.game,
    (select count(distinct user_id)::int from public.ff_play_days d where d.game = g.game and d.day > current_date - 7),
    (select count(distinct user_id)::int from public.ff_play_days d where d.game = g.game and d.day <= current_date - 7 and d.day > current_date - 14)
  from (values ('stickseum'),('crownenvoy'),('beaconfall')) g(game);
$$;
grant execute on function public.ff_week_games() to anon, authenticated;
delete from public.ff_play_days where day < current_date - 30;

-- 3) 투표 (관리자가 올리고, 로그인한 사람은 한 표씩. 다시 누르면 바꿀 수 있어요. 누가 뭘 골랐는지는 안 보여요)
create table if not exists public.ff_polls (
  id         bigint generated always as identity primary key,
  question   text not null check (char_length(question) between 1 and 200),
  options    text[] not null check (cardinality(options) between 2 and 6),
  active     boolean not null default true,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.ff_polls enable row level security;
drop policy if exists ff_polls_read on public.ff_polls;
create policy ff_polls_read on public.ff_polls for select using (true);
drop policy if exists ff_polls_admin on public.ff_polls;
create policy ff_polls_admin on public.ff_polls for all using (public.ff_is_admin()) with check (public.ff_is_admin());

create table if not exists public.ff_votes (
  poll_id    bigint not null references public.ff_polls(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  choice     int not null check (choice between 0 and 5),
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);
alter table public.ff_votes enable row level security;
drop policy if exists ff_votes_own on public.ff_votes;
create policy ff_votes_own on public.ff_votes for select using (user_id = auth.uid());
drop policy if exists ff_votes_del on public.ff_votes;
create policy ff_votes_del on public.ff_votes for delete using (user_id = auth.uid());
-- voting goes through this function so a closed or finished poll can't take votes
create or replace function public.ff_vote(p_poll bigint, p_choice int) returns void language plpgsql security definer set search_path = public as $$
declare p public.ff_polls;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  select * into p from public.ff_polls where id = p_poll;
  if p.id is null or not p.active or (p.ends_at is not null and p.ends_at < now()) then raise exception 'poll closed'; end if;
  if p_choice < 0 or p_choice >= cardinality(p.options) then raise exception 'bad choice'; end if;
  insert into public.ff_votes (poll_id, user_id, choice) values (p_poll, auth.uid(), p_choice)
  on conflict (poll_id, user_id) do update set choice = excluded.choice, created_at = now();
end $$;
revoke all on function public.ff_vote(bigint, int) from public;
grant execute on function public.ff_vote(bigint, int) to authenticated;
create or replace function public.ff_poll_counts(p_ids bigint[]) returns table (poll_id bigint, choice int, votes int) language sql stable security definer set search_path = public as $$
  select poll_id, choice, count(*)::int from public.ff_votes where poll_id = any(p_ids) group by poll_id, choice;
$$;
grant execute on function public.ff_poll_counts(bigint[]) to anon, authenticated;

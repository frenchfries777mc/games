-- Frenchfries777 허브: 프로필 소개글 · 대표 게임 · 칭호 / 게임 평점 · 한줄평 / 방 모집
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-hub.sql 을 먼저 실행한 뒤에 실행하세요.

-- 1) 프로필 카드: 한 줄 소개 · 대표 게임 · 칭호 (칭호는 그 칭호의 허브 도전과제를 달성해야 고를 수 있어요)
create table if not exists public.ff_card (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  bio        text not null default '' check (char_length(bio) <= 60),
  fav        text check (fav is null or fav in ('stickseum','crownenvoy','beaconfall')),
  title      text,
  updated_at timestamptz not null default now()
);
alter table public.ff_card enable row level security;
drop policy if exists ff_card_read on public.ff_card;
create policy ff_card_read on public.ff_card for select using (true);
drop policy if exists ff_card_own on public.ff_card;
create policy ff_card_own on public.ff_card for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- which hub achievement each title needs (keep in step with TITLES in ff-profile.js)
create or replace function public.ff_title_need(p_title text) returns text language sql immutable as $$
  select case p_title
    when 'newbie' then 'hub_join' when 'traveler' then 'play_2' when 'explorer' then 'play_3' when 'friendly' then 'friend_1'
    when 'popular' then 'friend_5' when 'writer' then 'post_1' when 'commenter' then 'comment_1' when 'chatter' then 'chat_1'
    when 'helper' then 'feedback_1' when 'allround' then 'ach_each' when 'collector' then 'ach_30' when 'master' then 'ach_60'
    when 'legend' then 'hub_all' end;
$$;
create or replace function public.ff_card_check() returns trigger language plpgsql security definer set search_path = public as $$
declare need text;
begin
  if new.title is not null then
    need := public.ff_title_need(new.title);
    if need is null then raise exception 'unknown title'; end if;
    if not exists(select 1 from public.ff_ach where user_id = new.user_id and game = 'hub' and ach_id = need) then raise exception 'locked'; end if;
  end if;
  new.updated_at := now(); return new;
end $$;
drop trigger if exists ff_card_check on public.ff_card;
create trigger ff_card_check before insert or update on public.ff_card for each row execute function public.ff_card_check();

-- 2) 게임 평점 · 한줄평 (한 게임에 한 사람 하나, 다시 쓰면 바뀌어요)
create table if not exists public.ff_ratings (
  game       text not null check (game in ('stickseum','crownenvoy','beaconfall')),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  stars      int not null check (stars between 1 and 5),
  review     text not null default '' check (char_length(review) <= 100),
  updated_at timestamptz not null default now(),
  primary key (game, user_id)
);
alter table public.ff_ratings enable row level security;
drop policy if exists ff_ratings_read on public.ff_ratings;
create policy ff_ratings_read on public.ff_ratings for select using (true);
drop policy if exists ff_ratings_own on public.ff_ratings;
create policy ff_ratings_own on public.ff_ratings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists ff_ratings_admin on public.ff_ratings;
create policy ff_ratings_admin on public.ff_ratings for delete using (public.ff_is_admin());
create or replace function public.ff_rating_summary() returns table (game text, avg numeric, votes int) language sql stable security definer set search_path = public as $$
  select game, round(avg(stars)::numeric, 1), count(*)::int from public.ff_ratings group by game;
$$;
grant execute on function public.ff_rating_summary() to anon, authenticated;

-- 3) 방 모집: "지금 같이 할 사람" (2시간 지나면 목록에서 사라져요)
create table if not exists public.ff_lfg (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game       text not null check (game in ('stickseum','crownenvoy','beaconfall')),
  note       text not null check (char_length(note) between 1 and 100),
  link       text check (link is null or (char_length(link) <= 300 and link ~ '^https://')),
  created_at timestamptz not null default now()
);
alter table public.ff_lfg enable row level security;
drop policy if exists ff_lfg_read on public.ff_lfg;
create policy ff_lfg_read on public.ff_lfg for select using (true);
drop policy if exists ff_lfg_add on public.ff_lfg;
create policy ff_lfg_add on public.ff_lfg for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_lfg_del on public.ff_lfg;
create policy ff_lfg_del on public.ff_lfg for delete using (user_id = auth.uid() or public.ff_is_admin());
create index if not exists ff_lfg_new on public.ff_lfg (created_at desc);
drop trigger if exists ff_lfg_rl on public.ff_lfg;
create trigger ff_lfg_rl before insert on public.ff_lfg for each row execute function public.ff_rate_limit('5', '1 hour');
delete from public.ff_lfg where created_at < now() - interval '1 day';
do $$ begin alter publication supabase_realtime add table public.ff_lfg; exception when duplicate_object then null; when undefined_object then null; end $$;

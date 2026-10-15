-- Frenchfries777 허브: 친구가 하는 게임 표시 · 피드백/버그 신고 · 게시판 · 채팅 · 허브 도전과제
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-games.sql, supabase-ff-achievements.sql, supabase-ff-ach-list.sql 을 먼저 실행한 뒤에 실행하세요.
--
-- ★ 맨 아래 한 줄에서 '내아이디' 를 내 로그인 아이디로 바꾸면, 그 계정이 관리자가 돼요
--   (관리자: 받은 피드백 보기, 아무 글 · 댓글 · 채팅 지우기)

-- 0) 관리자
create table if not exists public.ff_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.ff_admins enable row level security;
drop policy if exists ff_admins_read on public.ff_admins;
create policy ff_admins_read on public.ff_admins for select using (user_id = auth.uid());
create or replace function public.ff_is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.ff_admins where user_id = auth.uid());
$$;
grant execute on function public.ff_is_admin() to anon, authenticated;

-- 도배 막기: 한 사람이 정해진 시간 안에 너무 많이 쓰면 거절
create or replace function public.ff_rate_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare n int; lim int := tg_argv[0]::int; win interval := tg_argv[1]::interval;
begin
  execute format('select count(*) from public.%I where user_id = $1 and created_at > now() - $2', tg_table_name) into n using new.user_id, win;
  if n >= lim then raise exception 'too many, slow down' using errcode = 'P0001'; end if;
  return new;
end $$;

-- 1) 지금 어떤 게임을 하고 있는지 (게임이 열려 있는 동안 1분마다 ff-presence.js 가 알려요). 친구와 나만 볼 수 있어요.
create table if not exists public.ff_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game    text not null check (game ~ '^[a-z0-9_]{2,24}$'),
  at      timestamptz not null default now()
);
alter table public.ff_presence enable row level security;
drop policy if exists ff_presence_read on public.ff_presence;
create policy ff_presence_read on public.ff_presence for select using (
  user_id = auth.uid() or exists (
    select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = auth.uid() and f.addressee_id = ff_presence.user_id) or (f.addressee_id = auth.uid() and f.requester_id = ff_presence.user_id))));
create or replace function public.ff_ping(p_game text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  insert into public.ff_presence (user_id, game, at) values (auth.uid(), p_game, now())
  on conflict (user_id) do update set game = excluded.game, at = now();
end $$;
revoke all on function public.ff_ping(text) from public;
grant execute on function public.ff_ping(text) to authenticated;

-- 2) 피드백 · 버그 신고 (쓴 사람과 관리자만 볼 수 있어요)
create table if not exists public.ff_feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('bug','idea','other')),
  game       text not null default 'hub' check (game ~ '^[a-z0-9_]{2,24}$'),
  body       text not null check (char_length(body) between 1 and 2000),
  page       text check (char_length(page) <= 300),
  ua         text check (char_length(ua) <= 300),
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.ff_feedback enable row level security;
drop policy if exists ff_feedback_read on public.ff_feedback;
create policy ff_feedback_read on public.ff_feedback for select using (user_id = auth.uid() or public.ff_is_admin());
drop policy if exists ff_feedback_add on public.ff_feedback;
create policy ff_feedback_add on public.ff_feedback for insert to authenticated with check (user_id = auth.uid() and done = false);
drop policy if exists ff_feedback_admin on public.ff_feedback;
create policy ff_feedback_admin on public.ff_feedback for update using (public.ff_is_admin());
drop policy if exists ff_feedback_del on public.ff_feedback;
create policy ff_feedback_del on public.ff_feedback for delete using (public.ff_is_admin());
drop trigger if exists ff_feedback_rl on public.ff_feedback;
create trigger ff_feedback_rl before insert on public.ff_feedback for each row execute function public.ff_rate_limit('10', '1 hour');

-- 3) 게시판
create table if not exists public.ff_posts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game       text not null default 'free' check (game ~ '^[a-z0-9_]{2,24}$'),
  title      text not null check (char_length(title) between 1 and 80),
  body       text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at  timestamptz
);
alter table public.ff_posts enable row level security;
drop policy if exists ff_posts_read on public.ff_posts;
create policy ff_posts_read on public.ff_posts for select using (true);
drop policy if exists ff_posts_add on public.ff_posts;
create policy ff_posts_add on public.ff_posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_posts_edit on public.ff_posts;
create policy ff_posts_edit on public.ff_posts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists ff_posts_del on public.ff_posts;
create policy ff_posts_del on public.ff_posts for delete using (user_id = auth.uid() or public.ff_is_admin());
drop trigger if exists ff_posts_rl on public.ff_posts;
create trigger ff_posts_rl before insert on public.ff_posts for each row execute function public.ff_rate_limit('5', '10 minutes');
create index if not exists ff_posts_new on public.ff_posts (created_at desc);

create table if not exists public.ff_comments (
  id         bigint generated always as identity primary key,
  post_id    bigint not null references public.ff_posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.ff_comments enable row level security;
drop policy if exists ff_comments_read on public.ff_comments;
create policy ff_comments_read on public.ff_comments for select using (true);
drop policy if exists ff_comments_add on public.ff_comments;
create policy ff_comments_add on public.ff_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_comments_del on public.ff_comments;
create policy ff_comments_del on public.ff_comments for delete using (user_id = auth.uid() or public.ff_is_admin());
drop trigger if exists ff_comments_rl on public.ff_comments;
create trigger ff_comments_rl before insert on public.ff_comments for each row execute function public.ff_rate_limit('20', '10 minutes');
create index if not exists ff_comments_post on public.ff_comments (post_id, created_at);

-- 4) 채팅 (모두가 보는 방 하나)
create table if not exists public.ff_chat (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
alter table public.ff_chat enable row level security;
drop policy if exists ff_chat_read on public.ff_chat;
create policy ff_chat_read on public.ff_chat for select using (true);
drop policy if exists ff_chat_add on public.ff_chat;
create policy ff_chat_add on public.ff_chat for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_chat_del on public.ff_chat;
create policy ff_chat_del on public.ff_chat for delete using (user_id = auth.uid() or public.ff_is_admin());
drop trigger if exists ff_chat_rl on public.ff_chat;
create trigger ff_chat_rl before insert on public.ff_chat for each row execute function public.ff_rate_limit('20', '1 minute');
create index if not exists ff_chat_new on public.ff_chat (created_at desc);
-- 새 채팅이 바로 보이도록 (Realtime)
do $$ begin
  alter publication supabase_realtime add table public.ff_chat;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- 5) 내 기록 수 (허브 도전과제용: 친구 수, 글 · 채팅 · 피드백을 써 봤는지)
create or replace function public.ff_hub_counts() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'friends',  (select count(*) from public.friendships where status = 'accepted' and (requester_id = auth.uid() or addressee_id = auth.uid())),
    'posts',    (select count(*) from public.ff_posts    where user_id = auth.uid()),
    'comments', (select count(*) from public.ff_comments where user_id = auth.uid()),
    'chats',    (select count(*) from public.ff_chat     where user_id = auth.uid()),
    'feedback', (select count(*) from public.ff_feedback where user_id = auth.uid()));
$$;
revoke all on function public.ff_hub_counts() from public;
grant execute on function public.ff_hub_counts() to authenticated;

-- ★ 관리자 정하기: '내아이디' 를 내 로그인 아이디(로그인할 때 쓰는 아이디)로 바꿔서 실행하세요
insert into public.ff_admins (user_id) select id from public.profiles where lower(username) = lower('내아이디') on conflict do nothing;

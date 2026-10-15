-- Frenchfries777 허브: 알림함 · 공지 배너 · 좋아요 · 1:1 메시지 · 신고 · 차단
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-hub.sql 을 먼저 실행한 뒤에 실행하세요.

-- 0) 차단: 내가 차단한 사람의 글 · 댓글 · 채팅은 안 보이고, 그 사람은 나에게 메시지를 보낼 수 없어요
create table if not exists public.ff_blocks (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);
alter table public.ff_blocks enable row level security;
drop policy if exists ff_blocks_own on public.ff_blocks;
create policy ff_blocks_own on public.ff_blocks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create or replace function public.ff_blocked(a uuid, b uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.ff_blocks where user_id = a and blocked_id = b);
$$;

-- 1) 알림함 (아래 트리거들이 알아서 넣어요. 받는 사람만 볼 수 있어요)
create table if not exists public.ff_notes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('comment','like','friend','dm','feedback','report')),
  actor_id   uuid references auth.users(id) on delete cascade,
  ref        bigint,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.ff_notes enable row level security;
drop policy if exists ff_notes_read on public.ff_notes;
create policy ff_notes_read on public.ff_notes for select using (user_id = auth.uid());
drop policy if exists ff_notes_mark on public.ff_notes;
create policy ff_notes_mark on public.ff_notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists ff_notes_del on public.ff_notes;
create policy ff_notes_del on public.ff_notes for delete using (user_id = auth.uid());
create index if not exists ff_notes_user on public.ff_notes (user_id, created_at desc);
do $$ begin alter publication supabase_realtime add table public.ff_notes; exception when duplicate_object then null; when undefined_object then null; end $$;

create or replace function public.ff_note(p_user uuid, p_kind text, p_actor uuid, p_ref bigint) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_user = p_actor then return; end if;
  if p_actor is not null and public.ff_blocked(p_user, p_actor) then return; end if;
  -- the same unread notice from the same person about the same thing only once
  if exists(select 1 from public.ff_notes where user_id = p_user and kind = p_kind and actor_id is not distinct from p_actor and ref is not distinct from p_ref and not read) then return; end if;
  insert into public.ff_notes (user_id, kind, actor_id, ref) values (p_user, p_kind, p_actor, p_ref);
  delete from public.ff_notes where user_id = p_user and id not in (select id from public.ff_notes where user_id = p_user order by created_at desc limit 100);
end $$;
revoke all on function public.ff_note(uuid, text, uuid, bigint) from public, anon, authenticated;

create or replace function public.ff_note_comment() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.ff_note((select user_id from public.ff_posts where id = new.post_id), 'comment', new.user_id, new.post_id); return new; end $$;
drop trigger if exists ff_note_comment on public.ff_comments;
create trigger ff_note_comment after insert on public.ff_comments for each row execute function public.ff_note_comment();

create or replace function public.ff_note_friend() returns trigger language plpgsql security definer set search_path = public as $$
begin if new.status = 'pending' then perform public.ff_note(new.addressee_id, 'friend', new.requester_id, null); end if; return new; end $$;
drop trigger if exists ff_note_friend on public.friendships;
create trigger ff_note_friend after insert on public.friendships for each row execute function public.ff_note_friend();

create or replace function public.ff_note_feedback() returns trigger language plpgsql security definer set search_path = public as $$
begin if new.done and not old.done then perform public.ff_note(new.user_id, 'feedback', null, new.id); end if; return new; end $$;
drop trigger if exists ff_note_feedback on public.ff_feedback;
create trigger ff_note_feedback after update on public.ff_feedback for each row execute function public.ff_note_feedback();

-- 2) 좋아요
create table if not exists public.ff_likes (
  post_id    bigint not null references public.ff_posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.ff_likes enable row level security;
drop policy if exists ff_likes_read on public.ff_likes;
create policy ff_likes_read on public.ff_likes for select using (true);
drop policy if exists ff_likes_add on public.ff_likes;
create policy ff_likes_add on public.ff_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_likes_del on public.ff_likes;
create policy ff_likes_del on public.ff_likes for delete using (user_id = auth.uid());
create index if not exists ff_likes_new on public.ff_likes (created_at desc);
create or replace function public.ff_note_like() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.ff_note((select user_id from public.ff_posts where id = new.post_id), 'like', new.user_id, new.post_id); return new; end $$;
drop trigger if exists ff_note_like on public.ff_likes;
create trigger ff_note_like after insert on public.ff_likes for each row execute function public.ff_note_like();

-- 인기글: 최근 30일 동안 좋아요를 많이 받은 글
create or replace function public.ff_popular(p_limit int default 20) returns table (post_id bigint, likes int) language sql stable security definer set search_path = public as $$
  select post_id, count(*)::int from public.ff_likes where created_at > now() - interval '30 days'
  group by post_id order by count(*) desc, max(created_at) desc limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;
grant execute on function public.ff_popular(int) to anon, authenticated;

-- 3) 공지 · 이벤트 배너 (관리자만 쓰고, 누구나 봐요)
create table if not exists public.ff_announce (
  id         bigint generated always as identity primary key,
  kind       text not null default 'notice' check (kind in ('notice','event')),
  body       text not null check (char_length(body) between 1 and 300),
  link       text check (link is null or (char_length(link) <= 300 and link ~ '^https://')),
  active     boolean not null default true,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.ff_announce enable row level security;
drop policy if exists ff_announce_read on public.ff_announce;
create policy ff_announce_read on public.ff_announce for select using (true);
drop policy if exists ff_announce_admin on public.ff_announce;
create policy ff_announce_admin on public.ff_announce for all using (public.ff_is_admin()) with check (public.ff_is_admin());

-- 4) 1:1 메시지 (친구끼리만, 차단하면 못 보내요. 보낸 사람과 받는 사람만 볼 수 있어요)
create table if not exists public.ff_dm (
  id           bigint generated always as identity primary key,
  sender_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 1000),
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
alter table public.ff_dm enable row level security;
drop policy if exists ff_dm_read on public.ff_dm;
create policy ff_dm_read on public.ff_dm for select using (sender_id = auth.uid() or recipient_id = auth.uid());
drop policy if exists ff_dm_add on public.ff_dm;
create policy ff_dm_add on public.ff_dm for insert to authenticated with check (
  sender_id = auth.uid() and read_at is null and not public.ff_blocked(recipient_id, auth.uid()) and exists (
    select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = auth.uid() and f.addressee_id = recipient_id) or (f.addressee_id = auth.uid() and f.requester_id = recipient_id))));
drop policy if exists ff_dm_seen on public.ff_dm;
create policy ff_dm_seen on public.ff_dm for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create index if not exists ff_dm_pair on public.ff_dm (recipient_id, sender_id, created_at desc);
create index if not exists ff_dm_sent on public.ff_dm (sender_id, created_at desc);
create or replace function public.ff_dm_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.ff_dm where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'too many, slow down' using errcode = 'P0001'; end if;
  return new;
end $$;
drop trigger if exists ff_dm_rl on public.ff_dm;
create trigger ff_dm_rl before insert on public.ff_dm for each row execute function public.ff_dm_limit();
do $$ begin alter publication supabase_realtime add table public.ff_dm; exception when duplicate_object then null; when undefined_object then null; end $$;
create or replace function public.ff_note_dm() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.ff_note(new.recipient_id, 'dm', new.sender_id, null); return new; end $$;
drop trigger if exists ff_note_dm on public.ff_dm;
create trigger ff_note_dm after insert on public.ff_dm for each row execute function public.ff_note_dm();

-- 5) 신고 (신고한 사람과 관리자만 봐요)
create table if not exists public.ff_reports (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('post','comment','chat','user')),
  target_id   bigint,
  target_user uuid references auth.users(id) on delete cascade,
  reason      text not null check (char_length(reason) between 1 and 500),
  snapshot    text check (char_length(snapshot) <= 600),
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.ff_reports enable row level security;
drop policy if exists ff_reports_read on public.ff_reports;
create policy ff_reports_read on public.ff_reports for select using (user_id = auth.uid() or public.ff_is_admin());
drop policy if exists ff_reports_add on public.ff_reports;
create policy ff_reports_add on public.ff_reports for insert to authenticated with check (user_id = auth.uid() and done = false);
drop policy if exists ff_reports_admin on public.ff_reports;
create policy ff_reports_admin on public.ff_reports for update using (public.ff_is_admin());
drop policy if exists ff_reports_del on public.ff_reports;
create policy ff_reports_del on public.ff_reports for delete using (public.ff_is_admin());
drop trigger if exists ff_reports_rl on public.ff_reports;
create trigger ff_reports_rl before insert on public.ff_reports for each row execute function public.ff_rate_limit('10', '1 hour');
create or replace function public.ff_note_report() returns trigger language plpgsql security definer set search_path = public as $$
begin if new.done and not old.done then perform public.ff_note(new.user_id, 'report', null, new.id); end if; return new; end $$;
drop trigger if exists ff_note_report on public.ff_reports;
create trigger ff_note_report after update on public.ff_reports for each row execute function public.ff_note_report();

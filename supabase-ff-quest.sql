-- Frenchfries777 허브: 오늘의 퀘스트 · 개발자 일지 · 다음 업데이트 투표
-- Supabase SQL Editor에 통째로 붙여 넣고 Run 하세요. 여러 번 실행해도 괜찮아요.
-- 먼저 실행돼 있어야 하는 파일: supabase-ff-hub.sql, supabase-ff-extra.sql, supabase-ff-coin.sql, supabase-ff-wiki.sql, supabase-ff-dev.sql

-- ================= 0) 개발자인지 알아보는 함수 =================
create or replace function public.ff_is_dev() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ff_devs where user_id = auth.uid());
$$;
revoke all on function public.ff_is_dev() from public, anon;
grant execute on function public.ff_is_dev() to authenticated;

-- ================= 1) 오늘의 퀘스트 =================
alter table public.ff_coin_log drop constraint if exists ff_coin_log_reason_check;
alter table public.ff_coin_log add constraint ff_coin_log_reason_check
  check (reason in ('daily','streak','exchange','admin','gift_in','gift_out','quest'));

create table if not exists public.ff_quest_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  qid     text not null,
  primary key (user_id, day, qid)
);
alter table public.ff_quest_claims enable row level security;
drop policy if exists ff_quest_claims_read on public.ff_quest_claims;
create policy ff_quest_claims_read on public.ff_quest_claims for select using (user_id = auth.uid());

-- 오늘(한국 시간)의 퀘스트 3개: 4개 중 하루에 하나씩 돌아가며 빠져요
create or replace function public.ff_quest_list() returns text[]
language sql stable set search_path = public as $$
  select array_agg(q order by n) from unnest(array['play','board','chat','vote']) with ordinality t(q, n)
   where n - 1 <> (((now() at time zone 'Asia/Seoul')::date - date '2026-01-01') % 4);
$$;

create or replace function public.ff_quest_done(p_uid uuid, p_qid text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare start_ timestamptz := (((now() at time zone 'Asia/Seoul')::date)::timestamp at time zone 'Asia/Seoul');
begin
  if p_qid = 'play' then
    return exists (select 1 from public.ff_play_days where user_id = p_uid and day >= current_date);
  elsif p_qid = 'board' then
    return exists (select 1 from public.ff_posts where user_id = p_uid and created_at >= start_)
        or exists (select 1 from public.ff_comments where user_id = p_uid and created_at >= start_);
  elsif p_qid = 'chat' then
    return exists (select 1 from public.ff_chat where user_id = p_uid and created_at >= start_);
  elsif p_qid = 'vote' then
    return exists (select 1 from public.ff_votes where user_id = p_uid and created_at >= start_);
  end if;
  return false;
end $$;
revoke all on function public.ff_quest_done(uuid, text) from public, anon, authenticated;

create or replace function public.ff_quest_status()
returns table (qid text, done boolean, claimed boolean)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Seoul')::date; q text;
begin
  if uid is null then raise exception 'login required'; end if;
  foreach q in array public.ff_quest_list() loop
    qid := q; done := public.ff_quest_done(uid, q);
    claimed := exists (select 1 from public.ff_quest_claims c where c.user_id = uid and c.day = today and c.qid = q);
    return next;
  end loop;
end $$;
revoke all on function public.ff_quest_status() from public, anon;
grant execute on function public.ff_quest_status() to authenticated;

-- 퀘스트 보상: 하나당 5코인, 3개를 다 받으면 5코인 더. got = 이번에 받은 코인
create or replace function public.ff_quest_claim(p_qid text)
returns table (coins int, got int)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Seoul')::date; n int; amt int := 5; w int;
begin
  if uid is null then raise exception 'login required'; end if;
  if not (p_qid = any (public.ff_quest_list())) then raise exception 'not today'; end if;
  if not public.ff_quest_done(uid, p_qid) then raise exception 'not done'; end if;
  insert into public.ff_quest_claims (user_id, day, qid) values (uid, today, p_qid) on conflict do nothing;
  if not found then
    select c.coins into w from public.ff_coins c where c.user_id = uid;
    return query select coalesce(w, 0), 0; return;
  end if;
  select count(*) into n from public.ff_quest_claims c where c.user_id = uid and c.day = today;
  if n >= 3 then amt := 10; end if;
  insert into public.ff_coins (user_id) values (uid) on conflict (user_id) do nothing;
  update public.ff_coins c set coins = c.coins + amt, earned = c.earned + amt, updated_at = now()
   where c.user_id = uid returning c.coins into w;
  insert into public.ff_coin_log (user_id, delta, reason) values (uid, amt, 'quest');
  return query select w, amt;
end $$;
revoke all on function public.ff_quest_claim(text) from public, anon;
grant execute on function public.ff_quest_claim(text) to authenticated;

-- ================= 2) 개발자 일지: 게시판의 'devlog' 분류는 개발자만 쓸 수 있어요 =================
create or replace function public.ff_devlog_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.game = 'devlog' and not public.ff_is_dev() then raise exception 'developers only'; end if;
  return new;
end $$;
drop trigger if exists ff_devlog_guard on public.ff_posts;
create trigger ff_devlog_guard before insert or update on public.ff_posts
  for each row execute function public.ff_devlog_guard();

-- ================= 3) 다음 업데이트 투표: 개발자가 후보를 올리고 모두가 투표해요 =================
alter table public.ff_polls add column if not exists kind text not null default 'poll';
alter table public.ff_polls drop constraint if exists ff_polls_kind_check;
alter table public.ff_polls add constraint ff_polls_kind_check check (kind in ('poll','update'));
alter table public.ff_polls add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;

drop policy if exists ff_polls_dev_add on public.ff_polls;
create policy ff_polls_dev_add on public.ff_polls for insert to authenticated
  with check (public.ff_is_dev() and kind = 'update' and created_by = auth.uid());
drop policy if exists ff_polls_dev_edit on public.ff_polls;
create policy ff_polls_dev_edit on public.ff_polls for update
  using (public.ff_is_dev() and kind = 'update' and created_by = auth.uid())
  with check (kind = 'update' and created_by = auth.uid());
drop policy if exists ff_polls_dev_del on public.ff_polls;
create policy ff_polls_dev_del on public.ff_polls for delete
  using (public.ff_is_dev() and kind = 'update' and created_by = auth.uid());

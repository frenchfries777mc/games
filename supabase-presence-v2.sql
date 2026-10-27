-- 접속 기록 v2: 접속 창 150초(신호 45초 간격), 로그인 전 손님 집계, 방 서버 계정(ffhost) 제외, 친구 접속도 150초.
-- 실행 순서: 이 파일 하나만. 선행 조건: supabase-ff-presence2.sql(이미 실행됨). 다시 실행해도 안전해요.
-- 이 파일은 supabase-online-exclude-host.sql 을 대신해요(ffhost 제외 포함). 그 파일은 안 돌려도 돼요.
-- 확인: select * from public.ff_online();  /  select count(*) from public.ff_guest_seen;
create table if not exists public.ff_guest_seen(gid uuid primary key, place text not null, at timestamptz not null default now());
alter table public.ff_guest_seen enable row level security;

create or replace function public.ff_guest_ping(p_gid uuid, p_place text)
returns void language plpgsql security definer set search_path to 'public' as $f$
begin
  if p_gid is null or p_place is null or p_place !~ '^[a-z0-9_]{2,24}$' then return; end if;
  insert into public.ff_guest_seen(gid, place, at) values (p_gid, p_place, now())
    on conflict (gid) do update set place = excluded.place, at = now();
  if random() < 0.02 then delete from public.ff_guest_seen where at < now() - interval '1 day'; end if;
end $f$;
revoke all on function public.ff_guest_ping(uuid, text) from public;
grant execute on function public.ff_guest_ping(uuid, text) to anon, authenticated;

create or replace function public.ff_online()
returns table(place text, people integer)
language sql stable security definer set search_path to 'public' as $f$
  with bots as (select id from public.profiles where lower(username) = 'ffhost'),
  p as (
    select user_id::text as k, game as place from public.ff_presence
      where at > now() - interval '150 seconds' and user_id not in (select id from bots)
    union all
    select h.user_id::text, 'hub' from public.ff_hub_seen h
      where h.at > now() - interval '150 seconds' and h.user_id not in (select id from bots)
      and not exists (select 1 from public.ff_presence x where x.user_id = h.user_id and x.at > now() - interval '150 seconds')
    union all
    select g.gid::text, g.place from public.ff_guest_seen g where g.at > now() - interval '150 seconds')
  select place, count(distinct k)::int from p group by place
  union all
  select 'all', count(distinct k)::int from p;
$f$;
grant execute on function public.ff_online() to anon, authenticated;

create or replace function public.ff_online_friends()
returns table (user_id uuid, place text)
language sql stable security definer set search_path = public as $$
  with fr as (
    select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as id
      from public.friendships f
     where f.status = 'accepted' and (f.requester_id = auth.uid() or f.addressee_id = auth.uid()))
  select fr.id, coalesce(
           (select p.game from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '150 seconds'),
           (select 'hub' from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '150 seconds'))
    from fr
   where exists (select 1 from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '150 seconds')
      or exists (select 1 from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '150 seconds');
$$;
revoke all on function public.ff_online_friends() from public, anon;
grant execute on function public.ff_online_friends() to authenticated;

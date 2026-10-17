-- 접속 표시를 더 빨리 반영: 창을 닫으면 바로 빠지고, 신호가 없으면 100초 뒤에 빠져요
create or replace function public.ff_leave() returns void language sql security definer set search_path = public as $$
  delete from public.ff_presence where user_id = auth.uid();
  update public.ff_hub_seen set at = now() - interval '1 hour' where user_id = auth.uid();
$$;
revoke all on function public.ff_leave() from public, anon;
grant execute on function public.ff_leave() to authenticated;

create or replace function public.ff_online()
returns table (place text, people int)
language sql stable security definer set search_path = public as $$
  with p as (
    select user_id, game as place from public.ff_presence where at > now() - interval '100 seconds'
    union all
    select h.user_id, 'hub' from public.ff_hub_seen h where h.at > now() - interval '100 seconds'
      and not exists (select 1 from public.ff_presence x where x.user_id = h.user_id and x.at > now() - interval '100 seconds'))
  select place, count(distinct user_id)::int from p group by place
  union all
  select 'all', count(distinct user_id)::int from p;
$$;
grant execute on function public.ff_online() to anon, authenticated;

create or replace function public.ff_online_friends()
returns table (user_id uuid, place text)
language sql stable security definer set search_path = public as $$
  with fr as (
    select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as id
      from public.friendships f
     where f.status = 'accepted' and (f.requester_id = auth.uid() or f.addressee_id = auth.uid()))
  select fr.id, coalesce(
           (select p.game from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '100 seconds'),
           (select 'hub' from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '100 seconds'))
    from fr
   where exists (select 1 from public.ff_presence p where p.user_id = fr.id and p.at > now() - interval '100 seconds')
      or exists (select 1 from public.ff_hub_seen h where h.user_id = fr.id and h.at > now() - interval '100 seconds');
$$;
revoke all on function public.ff_online_friends() from public, anon;
grant execute on function public.ff_online_friends() to authenticated;

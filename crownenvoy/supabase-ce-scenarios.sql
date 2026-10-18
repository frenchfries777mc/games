-- Crown Envoy 공유 시나리오 (Supabase SQL Editor에서 한 번 실행)
-- 시나리오 편집기에서 만든 시나리오를 올리고, 다른 사람이 내려받고 추천할 수 있게 한다.
create table if not exists public.ce_scenarios(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author text not null default '',
  name text not null check (char_length(name) between 1 and 24),
  descr text not null default '' check (char_length(descr) <= 300),
  map int not null default 0,
  data jsonb not null check (pg_column_size(data) < 300000),
  likes int not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ce_scenarios_likes on public.ce_scenarios(likes desc, created_at desc);
create index if not exists ce_scenarios_user on public.ce_scenarios(user_id);
create table if not exists public.ce_scenario_likes(
  user_id uuid not null references auth.users(id) on delete cascade,
  scen_id uuid not null references public.ce_scenarios(id) on delete cascade,
  primary key(user_id, scen_id)
);
alter table public.ce_scenarios enable row level security;
alter table public.ce_scenario_likes enable row level security;
drop policy if exists ce_scen_read on public.ce_scenarios;
create policy ce_scen_read on public.ce_scenarios for select using (true);
drop policy if exists ce_scen_del on public.ce_scenarios;
create policy ce_scen_del on public.ce_scenarios for delete using (auth.uid() = user_id);
drop policy if exists ce_like_read on public.ce_scenario_likes;
create policy ce_like_read on public.ce_scenario_likes for select using (auth.uid() = user_id);

-- 올리기(이미 올린 내 시나리오면 덮어쓰기). 한 사람당 30개까지.
create or replace function public.ce_scen_share(p_id uuid, p_name text, p_desc text, p_map int, p_data jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text; rid uuid;
begin
  if uid is null then raise exception 'login required'; end if;
  select coalesce(nullif(display_name,''), nullif(username,''), '이름 없음') into nm from public.profiles where id = uid;
  if p_id is not null and exists(select 1 from public.ce_scenarios where id = p_id and user_id = uid) then
    update public.ce_scenarios set name = left(p_name,24), descr = left(coalesce(p_desc,''),300), map = p_map, data = p_data,
      author = coalesce(nm,'이름 없음'), updated_at = now() where id = p_id;
    return p_id;
  end if;
  if (select count(*) from public.ce_scenarios where user_id = uid) >= 30 then raise exception 'limit'; end if;
  insert into public.ce_scenarios(user_id, author, name, descr, map, data)
    values (uid, coalesce(nm,'이름 없음'), left(p_name,24), left(coalesce(p_desc,''),300), p_map, p_data) returning id into rid;
  return rid;
end $$;

-- 추천 누르기/취소. 바뀐 추천 수를 돌려준다.
create or replace function public.ce_scen_like(p_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'login required'; end if;
  if exists(select 1 from public.ce_scenario_likes where user_id = uid and scen_id = p_id) then
    delete from public.ce_scenario_likes where user_id = uid and scen_id = p_id;
    update public.ce_scenarios set likes = greatest(0, likes - 1) where id = p_id returning likes into n;
  else
    insert into public.ce_scenario_likes(user_id, scen_id) values (uid, p_id);
    update public.ce_scenarios set likes = likes + 1 where id = p_id returning likes into n;
  end if;
  return coalesce(n,0);
end $$;

-- 내려받은 횟수 +1
create or replace function public.ce_scen_dl(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.ce_scenarios set downloads = downloads + 1 where id = p_id;
$$;

revoke all on function public.ce_scen_share(uuid,text,text,int,jsonb) from public;
revoke all on function public.ce_scen_like(uuid) from public;
grant execute on function public.ce_scen_share(uuid,text,text,int,jsonb) to authenticated;
grant execute on function public.ce_scen_like(uuid) to authenticated;
grant execute on function public.ce_scen_dl(uuid) to anon, authenticated;

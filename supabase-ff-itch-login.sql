-- itch.io 판 Google 로그인 넘기기용 (한 번 실행). 로그인 정보를 최대 5분만 맡기고, 한 번 받아 가면 지워요.
create table if not exists public.ff_itch_handoff(
  code text primary key check (code ~ '^[a-f0-9]{48}$'),
  access_token text not null,
  refresh_token text not null,
  created_at timestamptz not null default now()
);
alter table public.ff_itch_handoff enable row level security;   -- 정책 없음: 직접 읽기·쓰기는 막고 아래 함수로만

create or replace function public.ff_itch_put(p_code text, p_access text, p_refresh text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  delete from public.ff_itch_handoff where created_at < now() - interval '5 minutes';
  insert into public.ff_itch_handoff(code, access_token, refresh_token) values (p_code, p_access, p_refresh)
  on conflict (code) do nothing;
end $$;

create or replace function public.ff_itch_take(p_code text)
returns table(access_token text, refresh_token text) language plpgsql security definer set search_path = public as $$
begin
  delete from public.ff_itch_handoff where created_at < now() - interval '5 minutes';
  return query with d as (delete from public.ff_itch_handoff h where h.code = p_code returning h.access_token, h.refresh_token) select d.access_token, d.refresh_token from d;
end $$;

revoke all on function public.ff_itch_put(text,text,text) from public, anon;
grant execute on function public.ff_itch_put(text,text,text) to authenticated;
revoke all on function public.ff_itch_take(text) from public;
grant execute on function public.ff_itch_take(text) to anon, authenticated;

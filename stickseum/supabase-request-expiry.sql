-- Stickseum: requests run out after 3 hours
-- Friend requests, clan invites and game invites that nobody answered within 3 hours are deleted,
-- so the same request can be sent again. Paste into the Supabase SQL Editor and run. Safe to run more than once.

-- 1) every request table gets the time it was sent (rows that are already there count from now)
do $$
begin
  if to_regclass('public.friendships') is not null then
    alter table public.friendships add column if not exists created_at timestamptz not null default now();
  end if;
  if to_regclass('public.clan_invites') is not null then
    alter table public.clan_invites add column if not exists created_at timestamptz not null default now();
  end if;
  if to_regclass('public.game_invites') is not null then
    alter table public.game_invites add column if not exists created_at timestamptz not null default now();
  end if;
end $$;

-- 2) the game calls this before it reads or sends requests; it removes everything unanswered for 3 hours
create or replace function public.expire_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer := 0;
  k integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  if to_regclass('public.friendships') is not null then
    delete from public.friendships where status = 'pending' and created_at < now() - interval '3 hours';
    get diagnostics k = row_count; n := n + k;
  end if;
  if to_regclass('public.clan_invites') is not null then
    delete from public.clan_invites where created_at < now() - interval '3 hours';
    get diagnostics k = row_count; n := n + k;
  end if;
  if to_regclass('public.game_invites') is not null then
    delete from public.game_invites where status = 'pending' and created_at < now() - interval '3 hours';
    get diagnostics k = row_count; n := n + k;
  end if;
  return n;
end;
$$;

revoke all on function public.expire_requests() from public;
grant execute on function public.expire_requests() to authenticated;

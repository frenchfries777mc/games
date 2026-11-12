-- Stickseum 1111킬 챌린지 (2026-11-09 ~ 11/15 KST). Re-runnable.
create table if not exists public.challenge_kills(
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge text not null,
  kills int not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id, challenge)
);
alter table public.challenge_kills enable row level security;
-- no direct policies: everything goes through the functions below

create or replace function public.challenge_add_kills(p_challenge text, p_n int)
returns json language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(p_n,0),0),20); mine int; tot bigint;
begin
  if uid is null then raise exception 'login required'; end if;
  if p_challenge <> 'k1111_2026_11' then raise exception 'unknown challenge'; end if;
  if now() < timestamptz '2026-11-09 00:00:00+09' or now() >= timestamptz '2026-11-16 00:00:00+09' then
    select coalesce(sum(kills),0) into tot from challenge_kills where challenge=p_challenge;
    return json_build_object('total',tot,'mine',(select kills from challenge_kills where user_id=uid and challenge=p_challenge),'closed',true);
  end if;
  if n>0 then
    insert into challenge_kills(user_id,challenge,kills) values(uid,p_challenge,n)
    on conflict(user_id,challenge) do update set kills=least(challenge_kills.kills+n,500), updated_at=now();
  end if;
  select coalesce(kills,0) into mine from challenge_kills where user_id=uid and challenge=p_challenge;
  select coalesce(sum(kills),0) into tot from challenge_kills where challenge=p_challenge;
  return json_build_object('total',tot,'mine',coalesce(mine,0));
end $$;

create or replace function public.challenge_totals(p_challenge text)
returns json language sql security definer set search_path=public as $$
  select json_build_object(
    'total',(select coalesce(sum(kills),0) from challenge_kills where challenge=p_challenge),
    'mine',(select coalesce(kills,0) from challenge_kills where user_id=auth.uid() and challenge=p_challenge));
$$;
grant execute on function public.challenge_add_kills(text,int) to authenticated;
grant execute on function public.challenge_totals(text) to anon, authenticated;

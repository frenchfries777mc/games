-- Developer roles: 'owner' (can designate developers) and 'dev' (badge only).
create table if not exists public.ff_devs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'dev' check (role in ('owner','dev')),
  added_by uuid,
  added_at timestamptz not null default now()
);
alter table public.ff_devs enable row level security;
drop policy if exists ff_devs_read on public.ff_devs;
create policy ff_devs_read on public.ff_devs for select using (true);

insert into public.ff_devs (user_id, role)
select id, 'owner' from public.profiles where lower(username) = 'wjh20130126'
on conflict (user_id) do update set role = 'owner';

create or replace function public.ff_dev_set(p_username text, p_on boolean)
returns text language plpgsql security definer set search_path = public as $f$
declare v_uid uuid;
begin
  if not exists (select 1 from public.ff_devs where user_id = auth.uid() and role = 'owner') then
    return 'denied';
  end if;
  select id into v_uid from public.profiles where lower(username) = lower(trim(p_username));
  if v_uid is null then return 'nouser'; end if;
  if exists (select 1 from public.ff_devs where user_id = v_uid and role = 'owner') then return 'owner'; end if;
  if p_on then
    insert into public.ff_devs (user_id, role, added_by) values (v_uid, 'dev', auth.uid()) on conflict (user_id) do nothing;
  else
    delete from public.ff_devs where user_id = v_uid and role = 'dev';
  end if;
  return 'ok';
end $f$;
grant execute on function public.ff_dev_set(text, boolean) to authenticated;

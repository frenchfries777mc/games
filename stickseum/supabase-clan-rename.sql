-- Clan rename: the clan owner can change the clan's name and tag after it was made.
-- Run once in the Supabase SQL Editor (safe to run again).
create or replace function public.clan_rename(p_name text, p_tag text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_tag  text := upper(regexp_replace(coalesce(p_tag, ''), '[^A-Za-z0-9가-힣]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 12 then raise exception 'bad name'; end if;
  v_tag := left(v_tag, 4);
  if char_length(v_tag) < 2 then raise exception 'bad tag'; end if;
  update public.clans set name = v_name, tag = v_tag where owner = auth.uid();
  if not found then raise exception 'only the clan owner can rename the clan'; end if;
end;
$$;
grant execute on function public.clan_rename(text, text) to authenticated;

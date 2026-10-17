-- 위키에 hub 문서(허브 사이트 안내, 음악 감상실)를 쓸 수 있게 한다. 이미 적용했다.
create or replace function public.ff_wiki_save(p_game text, p_slug text, p_title text, p_body text)
 returns void language plpgsql security definer set search_path to 'public' as $function$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'login required'; end if;
  if p_game not in ('stickseum','crownenvoy','beaconfall','tools','educations','hub') then raise exception 'bad game'; end if;
  select count(*) into n from public.ff_wiki_hist where user_id = uid and created_at > now() - interval '10 minutes';
  if n >= 10 and not public.ff_is_admin() then raise exception 'too many, slow down' using errcode = 'P0001'; end if;
  insert into public.ff_wiki (game, slug, title, body, updated_by, updated_at)
  values (p_game, p_slug, trim(p_title), coalesce(p_body, ''), uid, now())
  on conflict (game, slug) do update set title = excluded.title, body = excluded.body, updated_by = uid, updated_at = now();
  insert into public.ff_wiki_hist (game, slug, title, body, user_id) values (p_game, p_slug, trim(p_title), coalesce(p_body, ''), uid);
end $function$;

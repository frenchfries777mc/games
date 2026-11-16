-- 게시판 표 목록: 말머리 · 공지 고정 · 조회수 · 답글(대댓글)
-- 허브(커뮤니티) 게시판이 새 칸이 없으면 예전 모양으로 동작하므로, 이 SQL은 언제 실행해도 안전해요. 여러 번 실행해도 돼요.

alter table public.ff_posts add column if not exists topic  text;
alter table public.ff_posts add column if not exists pinned boolean not null default false;
alter table public.ff_posts add column if not exists views  int not null default 0;
alter table public.ff_comments add column if not exists parent_id bigint references public.ff_comments(id) on delete cascade;

alter table public.ff_posts drop constraint if exists ff_posts_topic_chk;
alter table public.ff_posts add constraint ff_posts_topic_chk check (topic is null or topic in ('guide','question','brag','bug','chat','notice'));

-- 글쓴이가 고정(pinned)을 마음대로 켜거나 조회수를 바꾸지 못하게 막기 (관리자만 허용)
create or replace function public.ff_posts_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.views := 0;
    if not public.ff_is_admin() then new.pinned := false; if new.topic = 'notice' then new.topic := null; end if; end if;
  else
    if coalesce(current_setting('ff.view', true), '') <> '1' then new.views := old.views; end if;
    if not public.ff_is_admin() then new.pinned := old.pinned; if new.topic = 'notice' and old.topic is distinct from 'notice' then new.topic := old.topic; end if; end if;
  end if;
  return new;
end $$;
drop trigger if exists ff_posts_guard on public.ff_posts;
create trigger ff_posts_guard before insert or update on public.ff_posts for each row execute function public.ff_posts_guard();

-- 글을 열면 조회수 +1 (같은 기기에서는 한 번만 부르도록 화면에서 막아요)
create or replace function public.ff_post_view(p_id bigint) returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('ff.view', '1', true);
  update public.ff_posts set views = views + 1 where id = p_id;
end $$;
revoke all on function public.ff_post_view(bigint) from public;
grant execute on function public.ff_post_view(bigint) to anon, authenticated;

-- 관리자: 글 공지 고정 / 해제
create or replace function public.ff_pin_post(p_id bigint, p_pin boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.ff_is_admin() then raise exception 'admin only'; end if;
  update public.ff_posts set pinned = p_pin where id = p_id;
end $$;
revoke all on function public.ff_pin_post(bigint, boolean) from public;
grant execute on function public.ff_pin_post(bigint, boolean) to authenticated;

-- Frenchfries777 허브: 이모지 반응 (게시판 글 · 댓글 · 채팅에 😂😮😢🔥❤️👏)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-hub.sql 을 먼저 실행한 뒤에 실행하세요.

create table if not exists public.ff_reacts (
  kind       text not null check (kind in ('post','comment','chat')),
  target     bigint not null,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  emoji      text not null check (emoji in ('😂','😮','😢','🔥','❤️','👏')),
  created_at timestamptz not null default now(),
  primary key (kind, target, user_id, emoji)
);
alter table public.ff_reacts enable row level security;
drop policy if exists ff_reacts_read on public.ff_reacts;
create policy ff_reacts_read on public.ff_reacts for select using (true);
drop policy if exists ff_reacts_add on public.ff_reacts;
create policy ff_reacts_add on public.ff_reacts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists ff_reacts_del on public.ff_reacts;
create policy ff_reacts_del on public.ff_reacts for delete using (user_id = auth.uid());
create index if not exists ff_reacts_target on public.ff_reacts (kind, target);
drop trigger if exists ff_reacts_rl on public.ff_reacts;
create trigger ff_reacts_rl before insert on public.ff_reacts for each row execute function public.ff_rate_limit('120', '1 hour');

-- 글 · 댓글 · 채팅이 지워지면 그 반응도 같이 지워요
create or replace function public.ff_reacts_gone() returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.ff_reacts where kind = tg_argv[0] and target = old.id;
  return old;
end $$;
drop trigger if exists ff_reacts_gone on public.ff_posts;
create trigger ff_reacts_gone after delete on public.ff_posts for each row execute function public.ff_reacts_gone('post');
drop trigger if exists ff_reacts_gone on public.ff_comments;
create trigger ff_reacts_gone after delete on public.ff_comments for each row execute function public.ff_reacts_gone('comment');
drop trigger if exists ff_reacts_gone on public.ff_chat;
create trigger ff_reacts_gone after delete on public.ff_chat for each row execute function public.ff_reacts_gone('chat');

do $$ begin alter publication supabase_realtime add table public.ff_reacts; exception when duplicate_object then null; when undefined_object then null; end $$;

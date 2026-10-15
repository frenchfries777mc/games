-- Frenchfries777 허브: 게시판 · 채팅에 사진 올리기
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-hub.sql 을 먼저 실행한 뒤에 실행하세요.

-- 1) 사진을 담는 저장소 (누구나 볼 수 있고, 로그인한 사람이 자기 폴더에만 올릴 수 있어요. 한 장 최대 3MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ff-images', 'ff-images', true, 3145728, array['image/webp','image/jpeg','image/png','image/gif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists ff_images_add on storage.objects;
create policy ff_images_add on storage.objects for insert to authenticated
  with check (bucket_id = 'ff-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists ff_images_del on storage.objects;
create policy ff_images_del on storage.objects for delete to authenticated
  using (bucket_id = 'ff-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.ff_is_admin()));

-- 2) 글 · 채팅에 붙는 사진 주소 (이 저장소의 사진만, 글은 4장 · 채팅은 1장까지)
create or replace function public.ff_imgs_ok(a text[], maxn int) returns boolean language sql immutable as $$
  select coalesce(cardinality(a), 0) <= maxn and not exists (
    select 1 from unnest(coalesce(a, '{}')) u
    where u !~ '^https://kebsbuvuutilitwlvxzv\.supabase\.co/storage/v1/object/public/ff-images/[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$');
$$;
alter table public.ff_posts add column if not exists images text[] not null default '{}';
alter table public.ff_chat  add column if not exists images text[] not null default '{}';
alter table public.ff_posts drop constraint if exists ff_posts_images_ok;
alter table public.ff_posts add constraint ff_posts_images_ok check (public.ff_imgs_ok(images, 4));
alter table public.ff_chat  drop constraint if exists ff_chat_images_ok;
alter table public.ff_chat  add constraint ff_chat_images_ok check (public.ff_imgs_ok(images, 1));

-- 사진만 보내는 채팅 · 사진만 있는 글도 되도록 (글자 또는 사진 중 하나는 있어야 해요)
alter table public.ff_chat  drop constraint if exists ff_chat_body_check;
alter table public.ff_chat  drop constraint if exists ff_chat_body_ok;
alter table public.ff_chat  add constraint ff_chat_body_ok check (char_length(body) <= 300 and (char_length(body) >= 1 or cardinality(images) >= 1));
alter table public.ff_posts drop constraint if exists ff_posts_body_check;
alter table public.ff_posts drop constraint if exists ff_posts_body_ok;
alter table public.ff_posts add constraint ff_posts_body_ok check (char_length(body) <= 4000 and (char_length(body) >= 1 or cardinality(images) >= 1));

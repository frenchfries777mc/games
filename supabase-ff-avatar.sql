-- Frenchfries777 허브: 프로필 사진 (기본 / 허브 코인으로 구매 / 허브 도전과제로 해금)
-- Supabase SQL Editor에 통째로 붙여 넣고 Run 하세요. 여러 번 실행해도 괜찮아요.
--
-- 실행 순서: 이 파일 하나만 실행하면 돼요.
-- 먼저 실행돼 있어야 하는 파일 (이미 실행했을 거예요): supabase-ff-coin.sql, supabase-ff-wiki.sql, supabase-ff-quest.sql(코인 기록 종류), supabase-ff-ach-list.sql(도전과제 기록)
-- 성공 확인: 맨 아래 확인 쿼리를 실행하면 사진 17개(free 6, coin 6, ach 5)가 나와요.
-- 가격·조건을 바꾸고 싶으면 아래 insert 의 값만 고쳐서 다시 Run 하세요 (사이트 화면의 가격 표시는 ff-profile.js 의 AVATARS 에도 있어서 같이 고쳐야 해요).

-- ================= 1) 코인 기록에 'avatar' 종류 추가 =================
alter table public.ff_coin_log drop constraint if exists ff_coin_log_reason_check;
alter table public.ff_coin_log add constraint ff_coin_log_reason_check
  check (reason in ('daily','streak','exchange','admin','gift_in','gift_out','quest','avatar'));

-- ================= 2) 사진 목록 (누구나 볼 수 있고, 바꾸는 건 SQL 에서만) =================
create table if not exists public.ff_avatar_items (
  id    text primary key check (char_length(id) between 1 and 30),
  kind  text not null check (kind in ('free','coin','ach')),
  price int  not null default 0 check (price >= 0),
  ach_id text
);
alter table public.ff_avatar_items enable row level security;
drop policy if exists ff_avatar_items_read on public.ff_avatar_items;
create policy ff_avatar_items_read on public.ff_avatar_items for select using (true);

insert into public.ff_avatar_items (id, kind, price, ach_id) values
  ('account','free',0,null), ('fries','free',0,null), ('stickseum','free',0,null),
  ('crownenvoy','free',0,null), ('beaconfall','free',0,null), ('isleport','free',0,null),
  ('dummyparty','coin',30,null), ('vowkeep','coin',40,null), ('ranking','coin',50,null),
  ('fry-lab','coin',50,null), ('wiki','coin',60,null), ('coin','coin',100,null),
  ('proverb','ach',0,'play_2'), ('planet','ach',0,'play_3'), ('munjang','ach',0,'post_1'),
  ('achievements','ach',0,'ach_10'), ('timeline','ach',0,'ach_30')
on conflict (id) do update set kind = excluded.kind, price = excluded.price, ach_id = excluded.ach_id;

-- ================= 3) 산 사진 (본인만 볼 수 있어요) =================
create table if not exists public.ff_avatar_own (
  user_id    uuid not null references auth.users(id) on delete cascade,
  avatar_id  text not null references public.ff_avatar_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, avatar_id)
);
alter table public.ff_avatar_own enable row level security;
drop policy if exists ff_avatar_own_read on public.ff_avatar_own;
create policy ff_avatar_own_read on public.ff_avatar_own for select using (user_id = auth.uid());

-- ================= 4) 지금 쓰는 사진 (누구나 볼 수 있어요. 바꾸는 건 아래 함수로만) =================
create table if not exists public.ff_avatar (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  pick       text references public.ff_avatar_items(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.ff_avatar enable row level security;
drop policy if exists ff_avatar_read on public.ff_avatar;
create policy ff_avatar_read on public.ff_avatar for select using (true);

-- ================= 5) 사진 사기: 코인을 빼고 내 사진으로 등록 =================
-- 돌려주는 값 = 남은 허브 코인. 이미 가진 사진이면 코인을 빼지 않고 지금 코인만 돌려줘요
create or replace function public.ff_avatar_buy(p_id text)
returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); it public.ff_avatar_items; left_ int;
begin
  if uid is null then raise exception 'login required'; end if;
  select * into it from public.ff_avatar_items x where x.id = p_id;
  if not found or it.kind <> 'coin' then raise exception 'not for sale'; end if;
  if exists (select 1 from public.ff_avatar_own o where o.user_id = uid and o.avatar_id = p_id) then
    select c.coins into left_ from public.ff_coins c where c.user_id = uid;
    return coalesce(left_, 0);
  end if;
  update public.ff_coins c set coins = c.coins - it.price, updated_at = now()
   where c.user_id = uid and c.coins >= it.price returning c.coins into left_;
  if not found then raise exception 'not enough coins'; end if;
  insert into public.ff_avatar_own (user_id, avatar_id) values (uid, p_id) on conflict do nothing;
  insert into public.ff_coin_log (user_id, delta, reason, game) values (uid, -it.price, 'avatar', p_id);
  return left_;
end $$;
revoke all on function public.ff_avatar_buy(text) from public, anon;
grant execute on function public.ff_avatar_buy(text) to authenticated;

-- ================= 6) 사진 고르기: 기본 사진, 산 사진, 도전과제를 달성한 사진만 가능 (null = 게임 캐릭터 그림) =================
create or replace function public.ff_avatar_set(p_id text)
returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); it public.ff_avatar_items;
begin
  if uid is null then raise exception 'login required'; end if;
  if p_id is null then
    insert into public.ff_avatar (user_id, pick) values (uid, null)
      on conflict (user_id) do update set pick = null, updated_at = now();
    return null;
  end if;
  select * into it from public.ff_avatar_items x where x.id = p_id;
  if not found then raise exception 'unknown avatar'; end if;
  if it.kind = 'coin' and not exists (select 1 from public.ff_avatar_own o where o.user_id = uid and o.avatar_id = p_id) then raise exception 'locked'; end if;
  if it.kind = 'ach' and not exists (select 1 from public.ff_ach a where a.user_id = uid and a.game = 'hub' and a.ach_id = it.ach_id) then raise exception 'locked'; end if;
  insert into public.ff_avatar (user_id, pick) values (uid, p_id)
    on conflict (user_id) do update set pick = excluded.pick, updated_at = now();
  return p_id;
end $$;
revoke all on function public.ff_avatar_set(text) from public, anon;
grant execute on function public.ff_avatar_set(text) to authenticated;

-- ================= 확인 =================
-- 아래를 따로 실행해 보세요. kind 별 개수가 free 6, coin 6, ach 5 로 나오면 성공이에요.
-- select kind, count(*) from public.ff_avatar_items group by kind order by kind;

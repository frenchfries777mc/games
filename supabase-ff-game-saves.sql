-- 게임 저장 계정 보관 (ff-save.js): 키 하나가 한 줄, 내 계정 것만 보여요
create table if not exists public.ff_game_saves(
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  game text not null check (char_length(game) between 1 and 40),
  k text not null check (char_length(k) between 1 and 200),
  v text not null,
  t timestamptz not null default now(),
  primary key (user_id, game, k)
);
alter table public.ff_game_saves enable row level security;
create policy ff_game_saves_sel on public.ff_game_saves for select to authenticated using (auth.uid() = user_id);
create policy ff_game_saves_ins on public.ff_game_saves for insert to authenticated with check (auth.uid() = user_id);
create policy ff_game_saves_upd on public.ff_game_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy ff_game_saves_del on public.ff_game_saves for delete to authenticated using (auth.uid() = user_id);
create or replace function public.ff_game_saves_guard() returns trigger language plpgsql set search_path = public as $$
begin
  if char_length(new.v) > 6000000 then raise exception 'value too large'; end if;
  new.t := now();
  if tg_op = 'INSERT' and (select count(*) from public.ff_game_saves where user_id = new.user_id and game = new.game) >= 400 then
    raise exception 'too many keys';
  end if;
  return new;
end $$;
create trigger ff_game_saves_guard before insert or update on public.ff_game_saves for each row execute function public.ff_game_saves_guard();

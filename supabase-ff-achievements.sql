-- Frenchfries777 공용 프로필 카드: 게임별 도전과제 진행상황 (Stickseum · Crown Envoy · Beaconfall)
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 을 한 번 누르면 돼요. (여러 번 실행해도 괜찮아요)
-- supabase-ff-games.sql (ff_played 표) 을 먼저 실행한 뒤에 실행하세요.

alter table public.ff_played add column if not exists ach_done  int not null default 0;
alter table public.ff_played add column if not exists ach_total int not null default 0;

-- 게임이 도전과제를 달성했을 때(또는 로그인했을 때) 불러요:
--   sb.rpc('ff_set_achievements', { p_game: 'crownenvoy', p_done: 12, p_total: 30 })
-- 또는 공용 카드 스크립트로:  FFProfile.setAchievements(sb, 'crownenvoy', 12, 30)
create or replace function public.ff_set_achievements(p_game text, p_done int, p_total int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-z0-9_]{2,24}$' then raise exception 'bad game id'; end if;
  p_total := greatest(0, least(coalesce(p_total, 0), 10000));
  p_done  := greatest(0, least(coalesce(p_done, 0), p_total));
  insert into public.ff_played (user_id, game, ach_done, ach_total) values (auth.uid(), p_game, p_done, p_total)
  on conflict (user_id, game) do update
    set ach_done = excluded.ach_done, ach_total = excluded.ach_total;
end $$;
revoke all on function public.ff_set_achievements(text, int, int) from public;
grant execute on function public.ff_set_achievements(text, int, int) to authenticated;

-- Crown Envoy: 시나리오 둘러보기의 지도 미리보기 (ce_scenarios.prev 열)
-- 실행 순서: supabase-ce-scenarios.sql → supabase-ce-coin.sql 을 이미 실행한 뒤 이 파일을 한 번 실행하세요. 여러 번 실행해도 괜찮아요.
-- 하는 일: 공유된 시나리오마다 '영토 주인 + 나라 색'만 뽑아 prev 열에 담아요. 시나리오 본문(data)은 그대로 막혀 있어요.
--          앞으로 공유·수정되는 시나리오는 트리거가 prev를 자동으로 채워요.

alter table public.ce_scenarios add column if not exists prev jsonb;

create or replace function public.ce_scen_prev_of(d jsonb) returns jsonb
language sql immutable as $$
  select case when jsonb_typeof(d->'owner')='array' and jsonb_typeof(d->'nations')='array' then
    jsonb_build_object(
      'o', d->'owner',
      'c', (select coalesce(jsonb_agg(n.value->'color' order by n.ord),'[]'::jsonb) from jsonb_array_elements(d->'nations') with ordinality as n(value,ord)),
      'm', d->'mrev',
      'r', d->'crev')
  else null end
$$;

create or replace function public.ce_scen_prev_trg() returns trigger
language plpgsql as $$
begin
  new.prev := public.ce_scen_prev_of(new.data);
  return new;
end $$;

drop trigger if exists ce_scen_prev on public.ce_scenarios;
create trigger ce_scen_prev before insert or update of data on public.ce_scenarios
  for each row execute function public.ce_scen_prev_trg();

update public.ce_scenarios set prev = public.ce_scen_prev_of(data) where prev is null;

grant select (prev) on public.ce_scenarios to anon, authenticated;

-- 확인: 두 숫자가 같으면 성공이에요.
select count(*) as 공유된_시나리오, count(prev) as 미리보기_있음 from public.ce_scenarios;

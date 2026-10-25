-- Crown Envoy: 공유 시나리오 분류 정보(시대·분류·나라 수·난이도) 미리보기에 담기
-- 실행 순서: supabase-ce-scen-prev.sql 을 이미 실행한 뒤 이 파일을 한 번 실행하세요. 여러 번 실행해도 괜찮아요.
-- 하는 일: prev 열에 'k'(분류 정보)를 추가해요. 앞으로 공유·수정되는 시나리오는 트리거가 자동으로 채우고,
--          이미 공유된 시나리오는 아래 update가 한 번 채워요. (옛 시나리오는 게임에서 다시 공유하면 분류가 생겨요.)

create or replace function public.ce_scen_prev_of(d jsonb) returns jsonb
language sql immutable as $$
  select case when jsonb_typeof(d->'owner')='array' and jsonb_typeof(d->'nations')='array' then
    jsonb_build_object(
      'o', d->'owner',
      'c', (select coalesce(jsonb_agg(n.value->'color' order by n.ord),'[]'::jsonb) from jsonb_array_elements(d->'nations') with ordinality as n(value,ord)),
      'm', d->'mrev',
      'r', d->'crev',
      'k', case when jsonb_typeof(d->'meta')='object' then d->'meta' else null end)
  else null end
$$;

update public.ce_scenarios set prev = public.ce_scen_prev_of(data);

-- 확인: 분류_있음이 0보다 크면 성공이에요(새로 공유한 시나리오부터 늘어나요).
select count(*) as 공유된_시나리오, count(*) filter (where prev ? 'k' and prev->'k' <> 'null'::jsonb) as 분류_있음 from public.ce_scenarios;

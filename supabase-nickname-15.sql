-- 닉네임(profiles.display_name) 글자 수 제한을 15자로 (2026-10-25)
-- 실행 순서: 이 파일 하나만 실행해요. 앞서 실행할 파일은 없어요. 여러 번 실행해도 안전해요.
-- 하는 일: profiles 표에 display_name 길이를 막는 규칙이 있으면 지우고, "15자 이하" 규칙 하나로 바꿔요.
--   (이 저장소에는 profiles 표를 만든 SQL이 없어서 서버에 길이 규칙이 있는지 확실하지 않아요. 없으면 15자 규칙만 새로 생겨요.)
--   기존 닉네임은 모두 12자 이하라서 그대로 통과해요.

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%display_name%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
  alter table public.profiles add constraint profiles_display_name_len
    check (display_name is null or char_length(display_name) <= 15);
end $$;

-- 확인 1: 아래는 규칙 이름과 내용이 한 줄로 나와요. profiles_display_name_len 이고 15 가 들어 있어야 해요.
select conname, pg_get_constraintdef(oid) as rule
from pg_constraint
where conrelid = 'public.profiles'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%display_name%';

-- 확인 2: 16자 이상 닉네임이 없어야 해요 (0이면 정상).
select count(*) as too_long from public.profiles where char_length(display_name) > 15;

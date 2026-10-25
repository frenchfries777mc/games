# 번역 대기 목록 (i18n-todo)

오너 지시(2026-10-18): 개발은 한국어만 하고, 다른 언어(en·es·fr·de·ja·zh·pt·ru·tr, 신어 nw) 번역은 하루에 한 번 번역 스레드에서 모아서 처리한다.
한 줄 형식: `파일 또는 위키 문서 | 키 또는 내용 | 한국어 문구 | 바뀐 PR | 날짜`. 처리가 끝난 줄은 지운다.
한국어로만 바뀐 문서는 다른 언어 화면에서 한국어가 그대로 보인다. (위키는 번역 글의 해시가 다르면 한국어 원문을 보여 준다.)

## 위키
위키 한국어 본문은 /mnt/project-files/frenchfries777-hub/wiki-src/all.ko.json 에 있고, 바뀐 내용은 batchNN-notes.md 에 있다. batch32까지의 번역은 wiki/tr 에 들어갔다(2026-10-20 번역 묶음).

## 허브 패치노트
- Dummy Party build 6 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안에 있어요: 패치노트 build 6 블록, 해설위원 대사 전부(소스 fun.js의 CMT, 지금은 한국어일 때만 보여요), 캔버스 글자 '리플레이', '시상식', '바보상'.

## Crown Envoy (b69)
- Dummy Party build 7 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 7 블록 "저작권 표기" (게임 화면 하단 저작권 줄은 번역 불필요).
- Dummy Party build 8 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 8 블록 "dC와 스킨 가게", 지갑 줄("로그인하면 판이 끝날 때마다 dC를 모아서…", "허브 코인 1개 = 8dC", "허브 코인으로 바꾸기"), 꾸미기 안내("잠긴 꾸미기는 라운드 1등을 하거나 dC로 살 수 있어요"), 구매 안내 토스트(소스 wallet.js: "~dC에 살까요? 한 번 더 누르면 사요" 등), 얼굴 스킨 이름 없음(그림만).
- Dummy Party build 9 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 9 블록 "점프와 해설 위치", 무너지는 발판 설명(how)과 조작 이름 "점프", 시작 화면 팁 "점프로 빈 칸을 건너요".
- Dummy Party build 10 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 10 블록 "우노 카드 설명", 우노 카드 설명 말풍선 문구 전부(소스 mg_draw.js 우노 draw의 title/desc/note).
- Dummy Party build 11 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 11 블록 "승리 춤과 해설 대폭 추가", 꾸미기 안내 문구("잠긴 칸은 눌러서 구경하고 dC로 살 수 있어요. 맨 아래 줄은 이길 때 추는 춤이에요"), 춤 이름(소스 dances.js DANCE_NAMES: 기본 춤, 디스코 파티, 로봇 춤, 발레 공연, 브레이크댄스), 구매 토스트, 해설 대사 270줄(소스 fun.js CMT, 한국어일 때만 나와요).
- Dummy Party build 12 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 12 블록 "미로 끼임 수정" 한 줄.
- Dummy Party build 13 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 13 블록 "병맛 신작 3개, 상단 바 정리", 새 미니게임 3개(방귀 로켓 레이스, 핫도그 먹기 대회, 닭 몰이)의 이름/설명/방법/조작 문구 및 인트로, 상단 바 메뉴(위키·커뮤니티·라운지·설정), 해설 대사 g_fartrace/g_hotdog/g_chicken(소스 fun.js, mg_e.js).

- Dummy Party build 14 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 14 블록 "나가기 버튼, 상단 바 제거"(3줄), 나가기 버튼, 나가기 확인창("게임에서 나가 허브로 돌아갈까요?"), 계정 한 줄("Frenchfries777 계정으로 접속 중", "허브에서 로그인하면 dC와 꾸미기가 저장돼요").
- Dummy Party build 15 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 15 블록 "dC 보상 상향" 한 줄.

- Dummy Party build 16 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 16 블록 "7판과 칠판, 미니게임 3개", 푸터 "판마다 19개 미니게임 중 7개", 새 미니게임 3개(엉터리 댄스 배틀, 라면 3분 맞히기, 풍선 부풀리기)의 이름/설명/방법/조작/인트로 문구, 결과 칠판 문구(지금까지: 등수와 점수, 분필 한마디 10개: 소스 flow.js CHALK), 해설 g_dancebeat/g_ramen/g_balloon(소스 fun.js, mg_f.js).
- Dummy Party build 17 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 17 블록 "해설 효과음" 두 줄, build 16 블록 문구 수정(칠판 줄 삭제).

- Dummy Party build 18 (2026-10-20): prototypes/dummyparty/index.html 패치노트 build 18 블록 "의자 뺏기 음악" 두 줄 | 의자 뺏기에 신나는 음악이 나와요. 두 곡 중 하나가 무작위로 나오고, 음악이 멈추면 같이 멈춰요 / 소리 켜기·끄기 설정을 따라가요
- Dummy Party build 19 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 19 블록 "미니게임 4개, 볼풀 수정", 푸터 "판마다 23개 미니게임 중 7개", 새 미니게임 4개(시몬 가라사대, 줄넘기 대회, 두더지 잡기, 가위바위보 토너먼트)의 이름/설명/방법/조작/인트로 문구와 게임 안 글자(명령, 탈락, 고르는 중 등), 볼풀 설명(밀치기), 해설 g_simon/g_rope/g_mole/g_rps(소스 fun.js, mg_g.js).

- Dummy Party build 20 (2026-10-20): prototypes/dummyparty/index.html 패치노트 build 20 블록 "미니게임 배경음악" | 의자 뺏기를 뺀 미니게임 진행 중에 밝은 8비트 음악이 나와요 / 소리 켜기·끄기 설정을 따라가요

## Crown Envoy (b70)
- Dummy Party build 21 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 21 블록 "허브 방 초대" 한 줄.
- Dummy Party build 22 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 22 블록 "시작 화면 개편"(3줄), 시작 화면 버튼(방 만들기, 혼자 하기, 상점), 상점 창(상점, 닫기), 춤 이름 2개(소스 dances.js DANCE_NAMES: 약 올리기 춤, 엉덩이 바이바이), 춤 속 글자(메롱~, L, 엉엉..., ㅋㅋㅋㅋ, 찰싹!, 엉덩이~, 잘 가~), 로비 안내("2명 이상이어야 시작할 수 있어요.").
- Dummy Party build 23 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 23 블록 "어둠 없애기, 장애물 또렷하게"(3줄).
- prototypes/dummyparty/index.html | patch note block "build 24 · 시작 화면 배경" | "시작 화면 배경에 실제 게임 장면이 나옵니다" etc. | b24 | 2026-10-20
- prototypes/dummyparty/index.html | DANCE_NAMES[5] "L을 가져가", floating text "L을 가져가!" | b24 | 2026-10-20

- munjang/index.html | 위험을 무릅쓰고 | 설령 내일 비가 오더라도 소풍은 간다. | 힘들고 어려운 일을 참고 견딘다는 뜻은 '무릅쓰다'예요. | '설령'은 '-더라도, -ㄹ지라도'와 어울려요. | educations | 2026-10-20
- planetsearch/index.html | 검정 = 우주 · 하양 = 행성 (땅, 물, 얼음이 구분되지 않아요) / 위에서 열을 골라 표를 만들어 보세요. 고른 열만 표에 나타나요. / 스캔한 자료 / 인구 N명을 ... 로 보냄 | educations | 2026-10-20
- proverb/index.html | 소리 끄기 / 소리 켜기 / 정답은 100점이에요. 4초 안에 풀면 +20점, 8초 안에 풀면 +10점을 더 받아요. / 정답 +{0}점 / 빠른 수사 보너스 +{0}점 / 정답은 초록색 보기예요. / 목숨이 하나 줄었어요 (남은 목숨 {0}개) / 목숨을 모두 잃었어요 / 정답률 {0}% / 빠른 수사 보너스 {0}점 / 시간이 끝나 {0}건은 풀지 못했어요 / 새 최고 기록! | educations | 2026-10-20
- balance/index.html | 작용점을 누른 채 끌거나 방향 버튼으로 화살표를 그려요. 키보드는 방향키와 Enter를 써요. / 방향이 달라요. 주어진 힘들의 합력과 반대 방향이어야 해요. / 방향은 맞지만 힘이 너무 커요. 내가 그린 힘 쪽으로 끌려가요. / 방향은 맞지만 힘이 너무 작아요. 주어진 힘 쪽으로 끌려가요. / 합력이 {0} 남았어요. / 다음 도면 / 새 최고 기록! / 이 스테이지 최고 기록 {0}점 / 최고 {0}점 / 놓친 조건이 없어요. 세 조건을 모두 지켰어요! / {2}으로 {3}을 더하면 합력이 0이 돼요. | educations | 2026-10-20
- timeline/index.html | 목숨을 모두 잃었어요, 여기까지 도전했어요, 정확도 {0}% (모든 카드를 놓았어요는 기존 문구) | educations | 2026-10-20

## Crown Envoy b73 (2026-10-20)
- crownenvoy/index.html | patchnotes b73 | 사이트 시작 오류와 조사 수정 (번역할 문구는 패치노트 항목만) | b73 | 2026-10-20
- index.html (educations) | 같은 반 코드를 넣으면 모두 같은 문제로 시작해서 결과를 비교할 수 있어요. | proverb/index.html | 입이 짧다 · 음식을 심하게 가린다 · 식은{땀을} 흘리다 · 말 한마디에 천 냥 빚도 갚는다 | educations | 2026-10-20

## Crown Envoy b74 (2026-10-20)
- crownenvoy/CrownEnvoy-v0.3.html | 튜토리얼 선전포고 보조 문구 | 상대 병력은 약 N명이에요. / 상대 병력은 (소규모~대군) 규모예요. | b74 | 2026-10-20
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b83"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 폰 세로 화면에서 공격 버튼이 청사진·사진 버튼과 겹치고 조이스틱이 체력 하트를 가리던 배치를 고침 | b83 | 2026-10-20
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b83"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 시작할 때 로딩 화면에서 Made by 글자가 로딩바와 겹치던 문제 수정 | b83 | 2026-10-20
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b83"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 게임 중 Esc를 한 번 눌러도 바로 로비로 나가지 않고, 2초 안에 한 번 더 눌러야 나가도록 확인 추가 | b83 | 2026-10-20
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b83"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 패치노트를 빌드별로 나누고 안 쓰는 옛 파일(BEACONFALL.html, bg.jpg 등) 정리 | b83 | 2026-10-20
- speedcode/index.html | 정답 | educations | 2026-10-21
- munjang/index.html | 기억하기 / 소속 / 검수 1라인 / 직책 / 문장 수리공 / 등급 / 견습 / 검수 우수 / 검수 합격 / 재검수 필요 (131개 문제 해설 및 기억 팁은 한국어 데이터라 번역 대상 아님) | educations | 2026-10-21
- planetsearch/index.html | 켜진 1의 자릿값을 모두 더해 10진수로 바꿔 보세요. / 행성 줄을 누르면 고른 종족이 그 행성에 정착해요. / 어디에도 해당 없음 / 크레딧 세금 / 섹터 N(보고서 상단 표시) / ±N명(인구 증감 표시) | educations | 2026-10-21
- proverb/index.html | 뜻 (해설 메모의 작은 라벨) | educations | 2026-10-21
- balance/index.html | 작용선 · 탄성력은 늘어난 길이에 비례해요. {0} N/cm × {1} cm = {2}. 추가 가만히 있으니 탄성력은 추의 무게와 크기가 같고 방향은 반대(위)예요. · 무게 = 질량 × 9.8 N/kg. {0} × 9.8 N/kg = {1}이라서 실이 당기는 힘도 {1}이에요. 무게는 무게중심에서 아래로 작용하니, 바로 위 고리 {2}에 걸어요. · 실이 당기는 힘 {0}은 무게와 크기가 같고 방향이 반대예요. 무게는 무게중심에서 아래로 작용하니, 바로 위 고리 {1}에 걸어야 두 힘이 같은 작용선 위에 있어요. · 왼쪽 힘의 합 {0}, 오른쪽 힘의 합 {1}. 같은 방향의 힘은 더하고 반대 방향의 힘은 빼서 비교하면 {2}이 {3} 모자라요. {2}으로 {3}을 당기면 합력이 0이 돼요. · 상자가 움직이지 않아도 미는 힘의 합력과 크기가 같고 방향이 반대인 마찰력이 작용해요. 미는 힘을 더하고 빼서 합력을 구하면, 마찰력은 {0}으로 {1}이에요. | educations | 2026-10-21
- timeline/index.html | 서기 1년~ (연표 시대 라벨, 한국어 전용 코드 문자열, 기존 번역 키 재사용 외 새 tr 키 없음) | educations | 2026-10-21

## Crown Envoy b75 (2026-10-21)
- crownenvoy/CrownEnvoy-v0.3.html | 상시 방침 장군 결투 | 장군 결투 신청 / 내 장군이 공격할 때 상대 장군이 있으면 결투를 청해요. 이기면 우리 사기 +8, 상대 −12예요. 지면 장군이 다치거나 포로·전사할 수 있어요. / 끔·켬 | b75 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 상시 방침 결투 받기 | 결투 신청 받기 / 상대가 결투를 청하면 받아요. 거절하면 수비군 사기가 5 내려가요. / 거절·받기 | b75 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 상시 방침 결투 전술 | 결투 3합 전술 / 강타는 빈틈을, 빈틈은 방어를, 방어는 강타를 이겨요. 합마다 낼 수를 미리 정해요. / 1합·2합·3합 / 강타·방어·빈틈 | b75 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 결투 로그 | N 결투: A의 X이(가) B의 Y을(를) (N대N로/판정으로) 꺾었다. (승리 사기 +N, 패배 사기 −12) / 결투를 청했지만 거절했다. (수비군 사기 −5) | b75 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 분기 소식 결투 | 결투 신청 거절당함·거절함 / 결투: X 승 (N:N) · 상대 장군 전사·포로 | b75 | 2026-10-21
- educations/index.html | 선생님 인증 창 문구(초대 코드 입력, 오류, 완료) | educations | 2026-10-21

## Crown Envoy b76 (2026-10-21)
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 의회 | 🏛 의회 / 위원마다 성향이 있어요. N턴 뒤에 가장 많은 성향이 요구를 해요. 받아들이면 사기 +5, 거부하면 6턴 동안 반란 확률이 올라요. 한 성향이 위원의 60% 이상이면 안정도가 매턴 내려가요. / 반란 확률 증가 N턴 남음 / ⚠ N으로 쏠렸어요. 안정도가 매턴 −1이에요. / 해고 / 새 위원 임명 (80금, 한 턴에 한 번 · 해고하면 안정도 −2) | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 성향 | 군부파·상인파·귀족파·민권파·성직자파 / 군비 증액·상업 보조금·영지 하사금·구휼 지출·성당 건립비 / 각 요구 문구와 효과 설명 | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 요구 결정 | 의회의 요구: X / 수락하면 금화 N을(를) 쓰고 사기가 +5 올라요. … 거부하면 6턴 동안 반란 확률이 올라요. (고르지 않으면 거부로 처리돼요) / 수락 (−N금) / 거부 | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 알림·로그 | 의회가 요구를 했어요 / 의회가 N으로 쏠렸어요. 안정도가 매턴 내려가요. 위원을 바꿔 보세요. / 의회 위원은 한 턴에 한 번만 바꿀 수 있어요. / 위원은 최대 7명·최소 3명 / 위원 임명·해고 결과 문구 / 의회 요구를 받아들였다·거부했다 로그 | b76 | 2026-10-21
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b84"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 번개가 치는 폭풍우, 화염 룬 무기에 불붙은 몬스터, 화산의 용암 때문에 숲과 나무 구조물에 불이 붙어 번지는 '번지는 불' 추가 (비가 오면 잘 번지지 않고 꺼지기도 함) | b84 | 2026-10-21
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b84"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 불은 6~12초 타며 나무와 나무로 된 건물·가구를 태우고 재를 남김, 불에 닿으면 화상을 입음 (내화 물약·화산석 갑옷으로 막을 수 있음) | b84 | 2026-10-21
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b84"].items (en·es·fr·de·ja 칸에 한국어 임시 입력) | 양동이(판자 4개 + 막대기 1개) 추가: 물가나 우물에서 물을 떠 불 옆에서 사용하면 근처 불을 끔 (사용 키로 사용) | b84 | 2026-10-21
- beaconfall/BEACONFALL-v0.3.html | ITEMS.bucket.name · ITEMS.bucket_w.name · 양동이 레시피 note (게임 안 문자열, I18N_D에 없음 = 한국어 표시) | 양동이 / 물 양동이 / 물가나 우물에서 물을 떠 번지는 불을 꺼요 | b84 | 2026-10-21
- balance/index.html | 반 이름 · 반 이름: {0} · ✅ 선생님 · 결과 저장 (CSV) | educations | 2026-10-21
- munjang/index.html | 반 이름 / 예: 3학년 2반 / 결과 저장 (CSV) / ✅ 선생님(teacher.js 제공) | educations | 2026-10-21
- proverb/index.html | 반 이름 | 예: 3학년 2반 | 날짜 | 순위 | 이름 | 점수 | 푼 사건 수 | 전체 사건 수 | 결과 저장 (CSV) | 속담탐정 | 결과 | ✅ 선생님 | educations | 2026-10-21
- speedcode/index.html | 반 이름 / 예: 3학년 2반 / 반 / 결과 저장 (CSV) / ✅ 선생님 / 결과 / 날짜 / 순위 / 이름 / 점수 / 해독 / 정확도 / 최고 자릿수 | educations | 2026-10-21
- timeline/index.html | 반 이름, 예: 3학년 2반, 결과 저장 (CSV), ✅ 선생님, 타임라인(CSV 파일 이름), CSV 열 이름(반 이름/날짜/순위/이름/점수/정답/정확도/최고 연속) | educations | 2026-10-21

## Crown Envoy b77 (2026-10-21)
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 유언장 | 📜 유언장 / 군주가 늙으면 언제든 세상을 떠날 수 있어요. 후계자를 정해 두지 않으면 계승 전쟁이 나서 안정도 −25, 사기 하락, 영토 이탈이 생겨요. / 왕자·장군·의회 추대 설명 / 지정·지정됨 | b77 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 군주 사망·계승 알림과 신문 | 군주 X이(가) 세상을 떠났어요 / 계승 전쟁이 일어나다 / 유언장 알림 | b77 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 망명 정부 알림·신문·로그 | 마지막 영토를 잃었지만 X으로 망명했어요 / 망명 정부가 돌아오다 / 되찾아 나라가 되살아났어요 | b77 | 2026-10-21
- crownenvoy/patchnotes.json·i18n.js | N["b77"] (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 망명 정부와 유언장 추가 외 3줄 | b77 | 2026-10-21
index.html | 랭킹 표 | 랭크 점수, 재산, 승, 패, 이번 시즌 랭크전 기록이 아직 없어요., 아직 재산을 보낸 사람이 없어요., 재산 순위는 서버 준비 중이에요., {0} 시즌 · 매달 새로 시작해요, 내 순위: {0}위 · 재산 {1} | 랭킹 Stickseum(랭크 점수)·Isleport(재산) | 2026-10-21
index.html | 랭킹 표 | 최장 생존 일수, 생존 순위는 서버 준비 중이에요., 아직 생존 기록을 보낸 사람이 없어요., 내 순위: {0}위 · {1}일 | Beaconfall 랭킹 | 2026-10-21
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b85"] (en·es·fr·de·ja 칸에 한국어 임시 입력) | 허브 랭킹 '최장 생존 일수' 연결 1줄

## Vowkeep v0.1 b1 (2026-10-21)
- prototypes/index.html | 소개 문장·Vowkeep 카드 | Dummy Party와 Vowkeep이 올라와 있어요. / 무너진 기사단의 마지막 기사가 되어 친구, 봇과 함께 던전을 내려가는 협동 게임이에요. | b1 | 2026-10-21
- prototypes/vowkeep/ (index.html, js/data.js, js/main.js) | 게임 안 모든 문자열 (로비, 대기실, 역할·장비, 업적, 설정, 인트로, 전투 알림, 축복, 결과) | 한국어만 있음, 다국어 구조 없음 | b1 | 2026-10-21
- patchnotes.json | "프로토타입 Vowkeep 추가" 3줄 | b1 | 2026-10-21
- patchnotes.json | "Vowkeep 화면 지글거림 줄이기" 3줄 | Vowkeep b2 | 2026-10-21
- patchnotes.json | "Vowkeep 매끄러운 화면과 부드러운 움직임" 4줄 | Vowkeep b3 | 2026-10-22
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b87"] (en·es·fr·de·ja 칸에 한국어 임시 입력) | 머리·표정 꾸미기 1줄. 게임 안 새 글자(머리·표정 이름, '머리 모양', '머리 색 (무료)', '표정', '머리·표정 꾸미기', '스킨 상점으로')는 I18N_D 11칸 배열에 번역 필요
## 은하 표준어 (2026-10-22)
- patchnotes.json (허브) | "은하 표준어 추가" 3줄 | 2026-10-22
- beaconfall/patchnotes.json | v0.3 b88 1줄 | 2026-10-22
- crownenvoy/patchnotes.json | b79 1줄 | 2026-10-22
- isleport/patchnotes.json | v0.2 build 43 1줄 (게임 안 NOTES는 ko/en만) | 2026-10-22
- 언어 이름 "Standard Galactic"은 은하 표준어 글꼴로만 보여서 번역하지 않음
- prototypes/vowkeep/ (js/data.js, js/main.js, index.html) | 구역 이름 9개(무너진 계단, 해골 병영, 무기고, 버려진 예배당, 물에 잠긴 회랑, 성물실, 근위대 무덤, 단장의 길, 기사단장의 방)와 구역 첫 입장 문장, 상자·제단·모닥불 안내, "건너뛰기"·"건너뛰기 기다리는 중 (n/m)", 모닥불 부활 문구, 깨어남·저장·전멸 알림, 업적 문구 2개 변경 | 한국어만 있음 | Vowkeep b4 | 2026-10-22
- patchnotes.json | "Vowkeep 거대한 지하 맵과 이야기 건너뛰기" 6줄 | Vowkeep b4 | 2026-10-22
- munjang/index.html | 새 문제 12개(스무 명/가는 대로/때문에/도무지/좀처럼/마치/제발/할머니께서 주셨다/오셨다/제가/말씀하셨다 등)의 문장·해설·팁(한국어 전용 콘텐츠), 결과 '다시 볼 문장'의 분류 표시는 기존 문구 재사용 | educations | 2026-10-21
- planetsearch/index.html | 신호 {n} / 4 정확 · 기록 {n} / 3, 총 인구 / 명 / 최고 기록!, {n} 부족 (정비소 버튼) | educations | 2026-10-21
- timeline/index.html | 점수 (기존 문구 재사용, 결과 화면 점수 라벨) | educations | 2026-10-21
- patchnotes.json | "Vowkeep 난이도 상승" 6줄 | Vowkeep b5 | 2026-10-22
- 허브 사이트 (2026-10-22): Korean only. hub/index.html 소개 문구 한 단락, 옛 주소 안내 문구(games/lounge, settings, music 자리표시 페이지 "이 페이지는 … 로 옮겼어요.").
- patchnotes.json | "Vowkeep 원래 픽셀 그래픽과 화려한 기술 연출" 5줄 | Vowkeep b8 | 2026-10-22
- beaconfall/patchnotes.json | v0.3 b89·b90 (b90은 i18n.js N에 13개 언어 번역 넣음, nw·gk만 남음) | 2026-10-22
- 허브 사이트 (2026-10-22): 새 문구 없음. 옛 주소 안내 자리표시 페이지(games/wiki, community, patchnotes)는 lounge와 같은 문구.
- 브라우저 기본 팝업(confirm/alert/prompt) 금지 (오너 2026-10-22). 새 문구 없음.
- prototypes/vowkeep/js/data.js | 2~4장 제목·장소·이야기(시작 4줄, 결말 3줄), 보스 이름 3개와 단계 안내 문구, 구역 이름·첫 입장 문장 27개, 장별 적 이름 12개(FOES), 업적 3개(ch2~ch4), 1장 결말 문장 변경 | 한국어만 있음 | Vowkeep b9 | 2026-10-22
- prototypes/vowkeep/js/main.js, index.html | 대기실 장 고르기("N장", "잠김", "보스:"), 결과 화면 "OO이 열렸어요."·"모든 장을 깼어요. 서약을 끝까지 지켰어요." | 한국어만 있음 | Vowkeep b9 | 2026-10-22
- patchnotes.json | "Vowkeep 2~4장과 새 보스 3명" 7줄 | Vowkeep b9 | 2026-10-22
- prototypes/vowkeep/js/main.js | 대기실 이야기 안내 문장, "N장 이어서 시작", "원정 시작", "…완료 · 방장과 함께 다음 장으로 가요", 다음 장 안내 알림 | 한국어만 있음 | Vowkeep b10 | 2026-10-22
- patchnotes.json | "Vowkeep 이어지는 이야기와 캐릭터 그림" 8줄 | Vowkeep b10 | 2026-10-22
- crownenvoy/patchnotes.json | b81 1줄 (i18n.js N에 15개 언어 번역 넣음) | 2026-10-22
- 이탈리아어·폴란드어·아랍어 추가 (오너 2026-10-22): 앞으로 새 문구는 it/pl/ar도 함께 번역해야 함 (Crown Envoy는 ar이 원래 있었음, it/pl 추가)
- isleport/patchnotes.json | v0.2 build 46 1줄 (게임 안 NOTES는 it/pl/ar까지 넣음) | 2026-10-22

## Crown Envoy b82 (2026-10-22)
- crownenvoy/CrownEnvoy-v0.3.html | 메뉴 나가기 | 나가기 / 이 창을 닫아요. AI 대전은 자동 저장돼 있으면 홈 화면의 [저장된 게임]에서 이어 할 수 있어요. / 게임 중이면 나가는 것과 같아요. | b82 | 2026-10-22
- crownenvoy/CrownEnvoy-v0.3.html | 나가기 확인·안내 창 | 게임을 나가고 이 창을 닫을까요? / 브라우저가 이 창을 닫지 못했어요. 탭을 직접 닫거나 사이트로 이동해 주세요. / 사이트로 이동 / 그대로 있기 | b82 | 2026-10-22
- crownenvoy/CrownEnvoy-v0.3.html | 메뉴 이름 변경 | 게임에서 나가기 → 게임 그만두기 / 버튼 그만두기 | b82 | 2026-10-22
- crownenvoy/patchnotes.json·i18n.js | N["b82"] (en·es·fr·de·ja·ar 한국어 임시) | 나가기 버튼 변경 외 3줄 | b82 | 2026-10-22
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b91"] (en·es·fr·de·ja·zh·pt·ru·tr·it·pl·ar 칸에 한국어 임시 입력) | 나가기 버튼 1줄. 게임 안 새 글자: '나가기', '이 창은 직접 닫을 수 없어요. 탭을 닫거나 사이트로 이동해 주세요.', '사이트로 이동' (I18N_D 14칸)
- prototypes/vowkeep/js/data.js, main.js | 보스 단계 이름 8개(CHAPTERS boss.ph), "보스가 기절했어요. 지금 공격해요", "N장까지 완료", 업적 설명 3개(elite, nodown, all4) 변경 | 한국어만 있음 | Vowkeep b11 | 2026-10-22
- patchnotes.json | "Vowkeep 전투 화면 정리와 장별 문구 수정" 13줄 | Vowkeep b11 | 2026-10-22
- patchnotes.json | "Vowkeep 활 자세와 화려한 연출" 9줄 | Vowkeep b12 | 2026-10-22
- prototypes/vowkeep/js/data.js | 기사단장 3단계 안내 문장, 단계 이름 "갑옷 균열" | 한국어만 있음 | Vowkeep b12 | 2026-10-22
- prototypes/vowkeep/js/main.js, data.js, index.html | "완벽한 회피!", "N 연타", "· 다음 강타", "집중 · 피해 +50%", 업적 pdodge 이름·설명, 조작 설명 기술 줄 | 한국어만 있음 | Vowkeep b13 | 2026-10-22
- patchnotes.json | "Vowkeep 저스트 회피와 연타" 6줄 | Vowkeep b13 | 2026-10-22
- prototypes/vowkeep/js/main.js, index.html | "F를 꾹 눌러 모닥불 피우기", "강타!", 조작 설명 문장 변경 | 한국어만 있음 | Vowkeep b14 | 2026-10-22
- patchnotes.json | "Vowkeep 연타와 모닥불 조작 수정" 4줄 | Vowkeep b14 | 2026-10-22
- patchnotes.json | "Vowkeep 캐릭터 공격·기술 동작" 6줄 | Vowkeep b15 | 2026-10-22
- patchnotes.json | "Vowkeep 강타 내려찍기 동작" 4줄 | Vowkeep b16 | 2026-10-22
- prototypes/vowkeep/index.html | 조작 설명 연타 문장 변경(기사 전용) | 한국어만 있음 | Vowkeep b17 | 2026-10-22
- patchnotes.json | "Vowkeep 기사 전용 연타" 2줄 | Vowkeep b17 | 2026-10-22
- prototypes/vowkeep/js/main.js, index.html | 장 버튼 "N장", "N장 시작", 조작 설명 3단 베기 문장 | 한국어만 있음 | Vowkeep b18 | 2026-10-22
- patchnotes.json | "Vowkeep 장 고르기와 기사 3단 베기" 4줄 | Vowkeep b18 | 2026-10-22


## Crown Envoy b83 (2026-10-22)
- crownenvoy/CrownEnvoy-v0.3.html | 로비 설정 버튼·설정 창 | 설정 / 소리, 언어, 업적·도감, 단축키 등을 열어요. / 설정 창: 효과음·배경음악·하켄크로이츠 흐리게·업적·단축키·튜토리얼("게임 하는 법을 처음부터 안내해 줘요." / 보기)·내 이름·저작권·나가기("이 창을 닫아요.") | b83 | 2026-10-22
- crownenvoy/patchnotes.json·i18n.js | N["b83"] (en·es·fr·de·ja·ar 한국어 임시) | 로비에 설정 버튼 추가 | b83 | 2026-10-22

## Crown Envoy b84 (2026-10-22)
- crownenvoy/index.html·i18n.js | 첫 화면 s_p "고대부터 현대까지 15개의 역사 템플릿이 준비돼 있어요…" (숫자 16→15, 모든 언어 칸 숫자만 바꿈) | b84 | 2026-10-22
- crownenvoy/patchnotes.json·i18n.js | N["b84"] (en·es·fr·de·ja·ar 한국어 임시) | 삼국 대륙 템플릿 삭제 | b84 | 2026-10-22

## Crown Envoy b85 (2026-10-22)
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 교황청 | ✝ 교황청 / 크리스트교 나라는 교황의 호감을 얻어야 해요. … / 교황의 호감 N/100 / 성전 중 … / 헌금 N금 / 파문 해제 N금 / 파문 중 / 헌금: 호감 +12 | b85 | 2026-10-22
- crownenvoy/CrownEnvoy-v0.3.html | 교황 결정 창·알림·신문·로그 | 교황청의 헌금 요구 / 성전 선포: X / 교황 ○○ N세 파문·선종·선출 문구 / 같은 신자를 쳐서 교황의 호감이 떨어졌어요 | b85 | 2026-10-22
- crownenvoy/patchnotes.json·i18n.js | N["b85"] (en·es·fr·de·ja·ar 한국어 임시) | 교황 시스템 추가 외 4줄 | b85 | 2026-10-22

## Crown Envoy b86 (2026-10-22)
- crownenvoy/patchnotes.json·i18n.js | N["b86"] (en·es·fr·de·ja·ar 한국어 임시) | 징집 순서 변경 (게임 안 새 문구 없음) | b86 | 2026-10-22

## Crown Envoy b87 (2026-10-22)
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 신성로마제국 | 👑 신성로마제국 / 황제: X / 나폴레옹 전쟁 이전에는 8턴마다 제국 영토를 가진 나라들이 황제를 뽑아요. … / 지금 선거 중이에요. 결정 창에서 투표해 주세요. / 다음 선거까지 N턴 · 내 투표권 N표 | b87 | 2026-10-22
- crownenvoy/CrownEnvoy-v0.3.html | 황제 선거 결정 창·알림·신문·로그 | 신성로마제국 황제 선거 / 제국 영토 1곳이 1표예요. … / 기권 / 황제 선거 결과 / X이(가) 신성로마제국의 황제로 선출됐다 | b87 | 2026-10-22
- crownenvoy/patchnotes.json·i18n.js | N["b87"] (en·es·fr·de·ja·ar 한국어 임시) | 신성로마제국 황제 선거 추가 외 3줄 | b87 | 2026-10-22

## Crown Envoy b88 (2026-10-22)
crownenvoy/i18n.js | N.b88.title | 버전 0.4, 나라 색 바꾸기 제거 | b88 | 2026-10-22
crownenvoy/i18n.js | N.b88.items | 버전 0.4 시작: 0.3까지의 변경 사항은 그대로 이어받음 / 나라 색 바꾸기 기능 제거: 나라 색은 처음에 자동으로 정해지며 바꿀 수 없음 | b88 | 2026-10-22
crownenvoy/i18n.js | V.0.4.title | 오래된 제국과 교황의 시대 | b88 | 2026-10-22
crownenvoy/i18n.js | V.0.4.summary | 교황청·신성로마제국 황제 선거·망명 정부·유언장 등 왕실 정치 확장 / 의회, 장군 결투, 첩보원 직접 조종 / 나라 색 자동 지정, 삼국 대륙 제거 | b88 | 2026-10-22

## Crown Envoy b89 (2026-10-22)
crownenvoy/i18n.js | N.b89.title | 공화국 선거와 전투 이름, 영토 한글 이름 | b89 | 2026-10-22
crownenvoy/i18n.js | N.b89.items | 패치노트 6줄(공화국 선거·통치자 성향·큰 전투 이름·선전포고 대기·영토 한글 이름·숫자 위치 수정) | b89 | 2026-10-22
crownenvoy/i18n.js | V.0.4.summary | 교황청·신성로마제국 황제 선거·망명 정부·유언장·공화국 선거 등 왕실 정치 확장 / 통치자 성향, 큰 전투 이름과 신문 보도, 선전포고 다음 턴부터 공격 / 영토 한글 이름, 의회·장군 결투·첩보원 직접 조종 | b89 | 2026-10-22
crownenvoy/CrownEnvoy-v0.4.html | TR (통치자 성향 7종 이름·설명) | 호전적, 외교가, 상인 기질, 검소함, 인자함, 학자풍, 야심가 + 각 설명 | b89 | 2026-10-22
crownenvoy/CrownEnvoy-v0.4.html | 공화국 지도자 UI/신문/알림 | 🏛 대통령·제1 서기장·총리 카드, "대통령 선거/당대회/총선", 신문 "새 대통령을 뽑다", 알림 "새 ~이(가) 취임했어요" | b89 | 2026-10-22
crownenvoy/CrownEnvoy-v0.4.html | 대규모 전투 신문 | 전투 이름("~ 전투/침략/방어전/해전" 등)과 본문 "~의 N명과 ~의 M명이 ~에서 맞붙었다…" | b89 | 2026-10-22
crownenvoy/CrownEnvoy-v0.4.html | 선전포고 대기 안내 | "선전포고 소식이 신문에 실린 다음 턴부터 공격할 수 있어요" 등 3곳 | b89 | 2026-10-22
crownenvoy/CrownEnvoy-v0.4.html | KON (영토 한글 이름 1,451개) | 영어 원래 이름 → 한글 이름 표. 다른 언어는 원래 이름 그대로이므로 번역 담당이 언어별 표기(독일어 Wien, 프랑스어 Vienne 등)를 추가할 수 있음 | b89 | 2026-10-22
## Vowkeep b19 (2026-10-22)
- patchnotes.json | "Vowkeep 과장된 강타·기술 동작" 5줄 | Vowkeep b19 | 2026-10-22

## Vowkeep b20 (2026-10-22)
- patchnotes.json | "Vowkeep 실제로 뛰어오르는 강타" 3줄 | Vowkeep b20 | 2026-10-22

## Vowkeep b21 (2026-10-22)
- prototypes/vowkeep/js/main.js | 적 머리 위 "둔화" 표시 | 한국어만 있음 | Vowkeep b21 | 2026-10-22
- patchnotes.json | "Vowkeep 범위 강타와 사제·종자 큰 공격" 5줄 | Vowkeep b21 | 2026-10-22

## Vowkeep b22 (2026-10-22)
- patchnotes.json | "Vowkeep 두리번거리기와 걷기 동작" 3줄 | Vowkeep b22 | 2026-10-22

## Vowkeep b23 (2026-10-22)
- patchnotes.json | "Vowkeep 잡몹 난이도 낮춤" 3줄 | Vowkeep b23 | 2026-10-22

## Vowkeep b24 (2026-10-22)
- patchnotes.json | "Vowkeep 봇 따라오기와 제자리 강타" 3줄 | Vowkeep b24 | 2026-10-22

## Vowkeep b25 (2026-10-23)
- prototypes/vowkeep/js/data.js | TALK 1~4장 게임 중 대사 (구역별·보스 앞, 약 60줄), 1~4장 시작·결말 이야기 문장 변경, 구역 문장 2개 변경 | 한국어만 있음 | Vowkeep b25 | 2026-10-23
- patchnotes.json | "Vowkeep 맵 디테일과 동료 대사" 9줄 | Vowkeep b25 | 2026-10-23

## Vowkeep b26 (2026-10-23)
- prototypes/vowkeep/js/data.js | CHAPTERS 5~8장 (제목·장소·시작·결말 이야기·보스 이름·단계 안내), 5~8장 구역 이름·문장 36개, FOES 5~8장 적 이름 16개, TALK 5~8장 대사 (약 60줄), 4장 결말 문장 변경, 업적 5~8장 이름·설명, 4장 업적 이름 '왕관을 깨다' | 한국어만 있음 | Vowkeep b26 | 2026-10-23
- patchnotes.json | "Vowkeep 5~8장 추가" 7줄 | Vowkeep b26 | 2026-10-23

## Crown Envoy b90 (2026-10-23)
crownenvoy/i18n.js | N.b90.title / items | 선교사·군주 친서·전신망 추가 (패치노트 3줄) | b90 | 2026-10-23
crownenvoy/i18n.js | V.0.4.summary | 교황청·… / 통치자 성향·… / 선교사·군주 친서·전신망, 영토 한글 이름 | b90 | 2026-10-23
crownenvoy/CrownEnvoy-v0.4.html | 선교사 파견 (외교 카드 선물 창) | "✝ 선교사 파견", "다른 신앙을 믿는 나라에 선교사를 보내요…", 알림·신문("~(으)로 돌아서다") | b90 | 2026-10-23
crownenvoy/CrownEnvoy-v0.4.html | 군주 친서 (외교 카드 선물 창) | "✉ 군주 친서", "군주가 직접 편지를 써 호감을 사요…", 알림 "친서를 보냈어요/유출됐어요" | b90 | 2026-10-23
crownenvoy/CrownEnvoy-v0.4.html | 전신망 (정치 탭 카드) | "📡 전신망", "전신선을 깔면 첩보 공작이 바로 실행되고…", "전신망 깔기", "전신선이 끊겼어요!" | b90 | 2026-10-23
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b93"] 한국어 임시 입력 | 무덤·혼불 등 2줄. 게임 안 새 글자(I18N_D 14칸): '혼불 등', '수정 2 · 횃불 1 · 깃털 1 — 손에 들면 푸른 불꽃이 무덤 쪽으로 앞장서고, 무덤에서는 빛기둥이 솟아요', '쓰러진 자리의 무덤에 물건이 모두 남아 있어요', '무덤에서 잃은 물건을 모두 되찾았어요'
- speedcode/index.html | 자주 틀린 자릿값, 자릿값 {n}에서 가장 많이 틀렸어요. 이 자리를 한 번 더 확인해 보세요. | educations | 2026-10-23
- proverb/index.html | 속담·관용구 78개 장면(그림 이모지, 상황 한 줄, 대사)은 한국어 전용이라 번역하지 않음. 다른 언어는 장면이 나오지 않음 | educations | 2026-10-23
- balance/index.html | 느리게 다시 보기, 합력, 돌리는 힘 | educations | 2026-10-23
- timeline/index.html | 사건 지도의 장소 이름 121개(EVLOC)는 한국어 화면에서만 보이고 다른 언어에서는 핀만 보임 | educations | 2026-10-23
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b94"] 한국어 임시 입력 | 펭귄·공룡 뼈 발굴·공룡 골격 전시 3줄. 게임 안 새 글자(I18N_D 14칸): '공룡 뼈 조각', '공룡 골격 전시', '공룡 뼈 조각 12 — 설치하면 커다란 공룡 골격이 서요 (뼈는 섬 곳곳 땅속에 묻혀 있어요)', '뼈를 파내는 중… 움직이지 마세요', '아기 펭귄이 태어났어요'

## Vowkeep b27 (2026-10-23)
- prototypes/vowkeep/js/data.js | LORE 옛 기록 32줄 (8장 × 비석 2개 × 2줄), COMBOS 합동기 이름 5개, CURSES 저주 이름·설명 7개, 심연 층 이름·시작·결말 문장, 업적 6개 (비밀 방, 옛 기록, 합동기, 심연 5·10층) 이름·설명 | 한국어만 있음 | Vowkeep b27 | 2026-10-23
- prototypes/vowkeep/js/main.js | '비밀 방을 찾았어요', 'F를 꾹 눌러 옛 기록 읽기', '옛 기록', '합동기!', '끝없는 심연', '심연으로 내려가기', 심연 결과 화면·저주 알림 문장 | 한국어만 있음 | Vowkeep b27 | 2026-10-23
- patchnotes.json | "Vowkeep 비밀 방, 합동기, 끝없는 심연" 8줄 | Vowkeep b27 | 2026-10-23

## Crown Envoy b91 (2026-10-23)
- patchnotes.json | "게임 중 배경음악 추가" 1줄 (CrownEnvoy-v0.4.html 소스에는 새 한국어 문구 없음) | Crown Envoy b91 | 2026-10-23

## Crown Envoy b91 (2026-10-23)
| file | key | Korean text | build | date |
|---|---|---|---|---|
| CrownEnvoy-v0.4.html | 국정 도구 카드 | 🏛 국정 도구 (🗳 국민투표 · 📜 법전 편찬 · 🕊 중립 선언 · 📰 보도 통제 설명·버튼·알림 문구 전체) | b91 | 2026-10-23 |
| CrownEnvoy-v0.4.html | 신문 | 〇〇, 언론 탄압 들통나다 | b91 | 2026-10-23 |

## Vowkeep b28 (2026-10-23)
- prototypes/vowkeep/js/data.js | 1~8장 새 방 이름 24개 (수수께끼 방·어둠의 방), 수수께끼·어둠의 방 안내 문장 4개, TALK_X 대사 12줄 (발판·화로·석상·어둠·무너지는 성·미믹), 적 이름 '미믹', 심연 '심연의 수수께끼', 업적 5개 이름·설명 | 한국어만 있음 | Vowkeep b28 | 2026-10-23
- prototypes/vowkeep/js/main.js | 수수께끼 안내 ('모두 발판 위에 서요', '화로에 불 붙이기', '석상 돌리기' 등), 횃불 안내, '미믹이에요!', '수수께끼를 풀었어요', '순서가 틀렸어요', '봇 동료가 수수께끼를 도와줘요', '성이 무너지기 시작해요!', '출구까지 N초', '무너진 돌에 길이 막혔어요', '무너지는 곳을 빠져나왔어요' | 한국어만 있음 | Vowkeep b28 | 2026-10-23
- patchnotes.json | "Vowkeep 수수께끼 방, 어둠의 방, 무너지는 성" 8줄 | Vowkeep b28 | 2026-10-23
- beaconfall/patchnotes.json·i18n.js | N["v0.3 b95"] 한국어 임시 입력 | 컴퓨터 키(R·G·P) 1줄. i18n.js G[조작] 새 줄: ko·en만 있음, 나머지 언어 번역 필요

## Vowkeep b29 (2026-10-23)
- prototypes/vowkeep/js/data.js | 1~8장 새 방 이름 16개 (끊어진 길·도르래 승강기), 방 안내 문장 2개, TALK_X 대사 4줄 (pit, lift), 업적 2개 (기둥 다리, 도르래 일꾼) 이름·설명 | 한국어만 있음 | Vowkeep b29 | 2026-10-23
- prototypes/vowkeep/js/main.js | '봇 동료가 기둥을 쳐서 쓰러뜨려요', '기둥이 쓰러졌어요', '쓰러진 기둥을 밟고 건너요', '승강기가 위층에 닿았어요. 다시 돌리면 내려가요.', '모두 위층에 올라왔어요', '이제 승강기는 혼자 타도 움직여요', 기둥·손잡이 안내 문장 3개 | 한국어만 있음 | Vowkeep b29 | 2026-10-23
- patchnotes.json | "Vowkeep 끊어진 길, 도르래 승강기, 이어지는 기사 베기" 6줄 | Vowkeep b29 | 2026-10-23

## Crown Envoy b92 (2026-10-23)
(번역할 새 문구 없음)

## Vowkeep b30 (2026-10-23)
- prototypes/vowkeep/js/data.js | 궁수 역할 설명 ('공격을 꾹 누르면 0.8초에 두 발, 2초에 세 발을 한 번에 쏴요'), 사제 부활의 빛·종자 물약·덫·함성 설명 수정 | 한국어만 있음 | Vowkeep b30 | 2026-10-23
- patchnotes.json | "Vowkeep 궁수 모아 쏘기, 사제·종자 균형" 5줄 | Vowkeep b30 | 2026-10-23

## 갤러리 Isleport·Dummy Party·Vowkeep (2026-10-23)
- gallery/index.html | 새 사진 11장의 제목·설명 (ko, en만 작성; 나머지 언어는 en으로 표시됨), 프로토타입 배지 글자(ko,en,es,fr,de,ja,zh,pt,ru,tr,it,pl,ar 작성됨, nw 없음)
- patchnotes.json | "갤러리에 Isleport·Dummy Party·Vowkeep" 3줄
## Vowkeep b31 (2026-10-23)
- patchnotes.json | "Vowkeep 궁수 화살 장전 모습" 2줄 (게임 소스에 새 문구 없음) | Vowkeep b31 | 2026-10-23

## Vowkeep b32 (2026-10-23)
- prototypes/vowkeep/index.html, js/main.js | '초대하기', '친구나 지금 접속 중인 플레이어에게 초대를 보내면 바로 들어와요.', '불러오는 중이에요...', '친구 (N)', '아직 친구가 없어요.', '접속 안 함', '지금 접속 중인 플레이어 (N)', '접속 중인 플레이어 목록은 곧 열려요.', '지금 접속 중인 다른 플레이어가 없어요.', '초대', '보냈어요', '못 보냈어요', '허브' | 한국어만 있음 | Vowkeep b32 | 2026-10-23
- patchnotes.json | "Vowkeep 초대 창" 2줄 | Vowkeep b32 | 2026-10-23

## 음악 인트로 곡 (Crown Envoy b93, Beaconfall b96, 2026-10-23)
- crownenvoy/patchnotes.json | b93 title·items 2줄 | Crown Envoy b93 | 2026-10-23
- beaconfall/patchnotes.json | v0.3 b96 items 1줄 | Beaconfall b96 | 2026-10-23
- CrownEnvoy-v0.4.html, BEACONFALL-v0.3.html | 인트로 안내 | 화면을 누르면 시작해요 | b93 / b96 | 2026-10-23

## 첫 화면 스킨 칸 (2026-10-23)
- index.html | 숫자 띠의 "스킨" (라벨 한 단어, 숫자는 skins.json에서 읽음)
- index.html (educations) | 과목 (첫 화면 숫자 띠 라벨, 모든 언어 배열에 임시로 한국어 "과목"을 넣어 둠) | educations | 2026-10-23

## 이모지어 (2026-10-23)
- patchnotes.json (허브) | "이모지어 추가" 3줄 | 2026-10-23
- beaconfall/patchnotes.json | v0.3 b97 1줄 | 2026-10-23
- crownenvoy/patchnotes.json | b94 1줄 | 2026-10-23
- isleport/patchnotes.json | v0.2 build 54 1줄 (게임 안 NOTES는 ko/en만) | 2026-10-23
- 언어 이름 "😀💬"은 이모지라 번역하지 않음

## 프로필 사진 (2026-10-23)
- ff-profile.js | AVS 문구 (ko, en 작성; 나머지 언어는 en으로 표시), AVATARS 사진 이름 (ko, en)
- patchnotes.json | "프로필 사진 고르기" 3줄
## Vowkeep b33 (2026-10-23)
- patchnotes.json | "Vowkeep 인트로" 2줄 (인트로 글자는 영어 'Made by', 'With'로 번역 필요 없음) | Vowkeep b33 | 2026-10-23

## Crown Envoy b95 (2026-10-23)
| CrownEnvoy-v0.4.html | 패치 노트 | 지도 가장자리 빈 띠 줄임 | b95 | 2026-10-23 |

## 인트로 곡 (Isleport b55, Vowkeep b34, 2026-10-23)
- IslandTrade-v0.2.html, prototypes/vowkeep/js/main.js | 인트로 안내 | 화면을 누르면 시작해요 | Isleport b55 / Vowkeep b34 | 2026-10-23
- patchnotes.json | "Vowkeep 인트로 곡" 2줄 | Vowkeep b34 | 2026-10-23

## Vowkeep b35 (2026-10-23)
- prototypes/vowkeep/js/main.js | '취소', '초대함 · N분 남음', '못 취소했어요', '취소됐거나 30분이 지나 만료된 초대예요.' | 한국어만 있음 | Vowkeep b35 | 2026-10-23
- patchnotes.json | "Vowkeep 초대 취소" 3줄 | Vowkeep b35 | 2026-10-23

## Vowkeep b36 (2026-10-23)
- prototypes/vowkeep/js/data.js | ROLE_PUZ 이름·설명 4개 ('방패 맹세의 방' 등), TALK_X oath·targets·basins·vines 대사 8줄 | 한국어만 있음 | Vowkeep b36 | 2026-10-23
- prototypes/vowkeep/js/main.js | 역할 수수께끼 안내 8줄 ('방패 석판 위에 서서 막기(Q)를 써요' 등), '10초가 지났어요. 과녁을 처음부터 다시 맞혀요.' | 한국어만 있음 | Vowkeep b36 | 2026-10-23
- patchnotes.json | "Vowkeep 역할 전용 수수께끼, 이어지는 공격 동작" 4줄 | Vowkeep b36 | 2026-10-23

## 공용 최적화 설정 (2026-10-23)
- hub/settings/index.html | T.ko 최적화 항목 문구 12개 (perf, perfN, low, lowD, fx, fxD, fxhigh/mid/low, fps, fpsD, fps0) | 한국어만 있음 (다른 언어는 한국어로 대체돼요) | 2026-10-23
- patchnotes.json | "공용 최적화 설정" 2줄 | 2026-10-23

## Crown Envoy b96 (2026-10-23)
| CrownEnvoy-v0.4.html | 설정 | 최적화 (모든 게임이 같이 쓰는 설정이에요. 켜면 지도 해상도를 낮추고 계절·도장 연출을 끄고 전투 연출을 요약으로 줄여서 느린 기기에서도 부드러워져요.) | b96 | 2026-10-23 |
- beaconfall/BEACONFALL-v0.3.html b98 | 설정 '저사양 모드·효과·프레임' 라벨/힌트 (ff_perf 공유), 레시피 터치 안내 문구 | 2026-10-23

## Crown Envoy b97 (2026-10-23)
| CrownEnvoy-v0.4.html | 정치 탭 카드 | 🏙 점령지 동화 (설명·안정·동화 중·동화 버튼 문구 전체) | b97 | 2026-10-23 |
| CrownEnvoy-v0.4.html | 알림 | 〇〇이(가) 완전히 안정됐어요. / 동화 정책을 폈어요 문구 | b97 | 2026-10-23 |

## Dummy Party 사이트 (games/dummyparty/) b62 (2026-10-24)
- 페이지 전체 문구(소개, 미니게임, 노는 법, 패치노트, 버전)가 한국어 전용이에요. 번역은 게임 공개 결정 뒤에 해요.
## Vowkeep b37 (2026-10-23)
- vowkeep/i18n.js | 게임 사이트 문구 전체 (소개, 특징 6개, 공략 12개, 도움말, 질문 3개) | 한국어만 있음 (L: ['ko']) | Vowkeep b37 | 2026-10-23
- vowkeep/patchnotes.json, vowkeep/versions.json | 패치 노트 35개, 버전 제목 '첫 서약'과 설명 | 한국어만 있음 | Vowkeep b37 | 2026-10-23
- vowkeep/play/js/data.js | 업적 2개 ('깃발을 지킨 자', '기사단의 벽') | 한국어만 있음 | Vowkeep b37 | 2026-10-23
- vowkeep/play/js/main.js | 깃발 안내 ('깃발을 든 채 장을 끝내요 · F 내려놓기', 'F를 꾹 눌러 기사단 깃발 들기', '기사단 깃발', '든 채로 장을 끝내면 로비 벽에 걸려요. 적이 깃발을 노려요', '…가 기사단 깃발을 들었어요.', '기사단 깃발이 떨어졌어요. 다시 주워 들어요.', '기사단 깃발을 로비 벽에 걸었어요.') | 한국어만 있음 | Vowkeep b37 | 2026-10-23
- vowkeep/play/index.html | 설정 '최적화', '켜기', '끄기' | 한국어만 있음 | Vowkeep b37 | 2026-10-23
- prototypes/vowkeep/index.html | 옮김 안내 'Vowkeep이 새 주소로 옮겼어요. 새 주소로 가기' | 한국어만 있음 | Vowkeep b37 | 2026-10-23
- patchnotes.json | "Vowkeep 정식 게임 사이트, 기사단 깃발" 6줄 | Vowkeep b37 | 2026-10-23

## Vowkeep 허브 연결 (2026-10-23)
- index.html | Vowkeep 카드 문구 (배지 '협동 던전', 태그 3개, 설명 1줄과 목록 3줄) | 한국어만 있음 | 2026-10-23
- ach/vowkeep.json | 업적 33개 이름과 설명 | 한국어만 있음 | 2026-10-23
- patchnotes.json | "Vowkeep 정식 공개" 4줄 | 2026-10-23
- index.html | Dummy Party 카드 문구 (배지 '파티 게임', 태그 3개, 설명 1줄과 목록 3줄) | 한국어만 있음 | b62 | 2026-10-24

## Dummy Party 허브 연결 (2026-10-24)
- hub.js | 통합 검색 Dummy Party 설명 '마네킹들이 벌이는 병맛 미니게임 파티' | 한국어만 있음 | 2026-10-24
- patchnotes.json | "Dummy Party 허브 연결" 4줄 | 2026-10-24

## Vowkeep b38 (2026-10-24)
- vowkeep/i18n.js | v_build '마지막 빌드 {b} · {d}' | 한국어만 있음 | Vowkeep b38 | 2026-10-24
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 연타 시간, 버전 목록" 4줄 | Vowkeep b38 | 2026-10-24
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 봇 바라보는 방향" 1줄 | Vowkeep b39 | 2026-10-24
- vowkeep/play/js/data.js | 5~8장 보스 단계 안내 8줄 ('얼음 창 세 줄 사이로 비켜서요…' 등) | 한국어만 있음 | Vowkeep b40 | 2026-10-24
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 보스마다 다른 공격, 픽셀체" 3줄 | Vowkeep b40 | 2026-10-24

## 도전의 왕 80개 (2026-10-24)
- ach/hub.json | ach_60 설명 15개 언어는 숫자만 80으로 고침 (번역 필요 없음) | 2026-10-24
- patchnotes.json | "허브 도전과제 도전의 왕 80개" 1줄 | 2026-10-24
- beaconfall/BEACONFALL-v0.3.html b99 | 업적 '비콘 생태 조사서'(kill_all) 이름·설명 | 2026-10-24

## 프로필 카드 게임 6개 (2026-10-24)
- ff-profile.js | 새 게임 이름은 영어 고유명이라 번역 없음 | 2026-10-24
- patchnotes.json | "프로필 카드에 게임 6개" 4줄 | 2026-10-24
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 계정 업적 연동" 1줄 | Vowkeep b41 | 2026-10-24
- beaconfall/BEACONFALL-v0.3.html b100 | 해먹·통발 이름/설명/모달 문구, 낮잠 문구('쿨쿨… 낮잠 중'), 샌드박스 업적 안내 토스트 | 2026-10-25
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 궁수 화살 수, 대검, 승강기 갇힘" 5줄 | Vowkeep b42 | 2026-10-25
- vowkeep/play/js/data.js, main.js | 새 수수께끼 9가지 이름·설명·안내 (GEN_PUZ, ROLE_PUZ, puzPrompt), 패치 노트 "Vowkeep 장마다 다른 수수께끼" | Vowkeep b43 | 2026-10-25
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 장마다 다른 지도" 4줄 | Vowkeep b44 | 2026-10-25
- vowkeep/play/js/data.js | 종자 덫·함성·역할 설명 3줄 바뀜, 패치 노트 "Vowkeep 종자 다리 걸기, 과장된 적 동작" 6줄 | Vowkeep b45 | 2026-10-25
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 하얀 대검, 연타 시간 0.65초" 2줄 | Vowkeep b46 | 2026-10-25
- vowkeep/play/js/data.js, vowkeep/versions.json, patchnotes.json | 새 통로 방 이름·한 줄 14개 (EXTRA), 버전 0.2 "갈라진 길" 제목·요약, 패치 노트 4줄 | Vowkeep b47 | 2026-10-25
- patchnotes.json, vowkeep/patchnotes.json | "Vowkeep 기사 2타 자세" 1줄 | Vowkeep b48 | 2026-10-25
- vowkeep/play/js/data.js, main.js, ach/vowkeep.json, vowkeep/i18n.js, vowkeep/play/index.html | 6~8장 보스 4단계 이름·안내(p4, ph[2]), '마지막 단계', 도전과제 '빠른 보스 사냥' 이름·설명, 심연 방 이름 '떠도는 돌길', 사이트 f2 문장, PC 조작 안내 문장, 패치 노트 13줄 | Vowkeep b49 | 2026-10-25
- crownenvoy/CrownEnvoy-v0.5.html b98 | 로비(방 만들기·방 참여하기·시나리오·저장된 게임 버튼과 설명, 공개 방/비공개 방 고르기, 방 이름, 공개 방 목록 카드·상태·빈 목록 안내, 코드로 입장), 시나리오 메뉴(시나리오 만들기·시나리오 둘러보기), 대기실 제목 '공개 방'·'비공개 방'과 안내, 중세 병종 이름·능력(창병·중무장보병·궁병·기사·사석포·거포)과 기술 5개(장창 전술·판금 갑옷·기사도·장궁 부대·거포 주조), '이 시대에는 더 올릴 수 없어요'·'이 시대에는 없는 기술이에요', 전투 화면 '검·창·활·공성 병기', 휴전회의 결렬·성립 결과 카드와 요청 알림 2종, 반격 취소 알림 | 2026-10-25
- crownenvoy/patchnotes.json·i18n.js | N["b98"] 13줄, V["0.5"] 제목·요약 (en·es·fr·de·ja·ar 한국어 임시) | Crown Envoy b98 | 2026-10-25

## 게임 목록 자동 반영 (2026-10-24)
- index.html | 계정 안내 문장은 모든 언어에 새 문구를 직접 넣음 (게임 이름은 이름표가 따로 보여줌) | 번역 필요 없음 | 2026-10-24
- patchnotes.json | "게임 목록 자동 반영, 플레이 횟수 수정" 4줄 | 2026-10-24
- ff-pnsearch.js | 빌드 번호나 내용으로 검색, {0}개 찾음, 찾는 패치노트가 없어요. | 패치노트 검색 | 2026-10-25
- crownenvoy/i18n.js·versions.json | V["0.1"].title "첫 사절의 시대", V["0.2"].title "여론과 왕위 계승의 시대" (en·es·fr·de·ja·ar 한국어 임시) | Crown Envoy 버전 이름 | 2026-10-25
- beaconfall/versions.json + i18n.js V[0.1/0.2/0.3].title | 버전 이름 0.1 표류의 첫날, 0.2 함께 켠 봉화, 0.3 하늘 위의 신호 (ko만) | 2026-10-25

## Dummy Party 사이트 버전 이름 (2026-10-25)
- 마네킹들의 첫 파티

## 패치노트·위키 목록에 모든 게임 (2026-10-25)
- 패치노트·위키 목록에 모든 게임 (제목)
- 허브 패치노트 페이지에 Isleport, Vowkeep, Dummy Party가 들어왔어요
- 허브 소식과 소식 받기에도 Dummy Party가 들어왔어요
- 위키 목록에 Vowkeep과 Dummy Party 칸이 생겼어요
- 게임 목록이 한 곳(ff-lang.js)에서 나와서, 새 게임을 넣으면 패치노트·소식·위키·글쓰기 목록에 같이 나와요
- beaconfall/BEACONFALL-v0.4.html b103 | 엔딩 대사·이름표(외계인 조종사/나)·'수락한다/거절한다'·'그리고 시간이 흘러…'·결말 제목, 설정 '효과음' 라벨, 도감 새 아이템 4개 이름(번역 없음) | 2026-10-25
- presence.js (educations) | 지금 {n}명 접속 중, 친구 (Educations 첫 화면 접속 표시줄, 허브 hub.js 와 같은 한국어 문구) | educations | 2026-10-25

## 업적 조건과 접속 표시줄 (2026-10-25)
- 업적 조건과 접속 표시줄 (제목)
- 허브 업적 "고른 실력"과 "세 개의 왕관"이 아무 게임 3개에서 달성하면 되도록 바뀌었어요
- "지금 N명 접속 중" 표시줄이 Educations와 Tools 사이트에도 나와요
- ff-auth.js + beaconfall/BEACONFALL-v0.4.html b104 | 계정 메뉴 '🏆 도전과제' 버튼 (ko/en만, 다른 언어는 영어) | 2026-10-25
- crownenvoy/CrownEnvoy-v0.5.html b99 | 휴전회의 '내가 낼 배상금'·'상대가 낼 배상금'·안내 문구, 회의 기록 '배상금 N금을 내겠다고 했다'·'내겠다던 배상금을 거뒀다'·'배상금 N금을 냈다' | 속국 만들기 '속국 색'·'지도에서 속국을 이 색으로 칠해요.'·'직접 고르기' | 지도 정보창 '종주국'·'속국' | 나라 이름 '동고트족'·'왈라키아·몰다비아'·'네덜란드 왕국'·'벨기에 왕국'·'스위스 연방' | 2026-10-25

## 계정 메뉴에 도전과제 버튼 (2026-10-25)
- 계정 메뉴에 도전과제 버튼 (제목)
- 계정 메뉴의 "🏆 도전과제" 버튼이 모든 사이트에서 보이고, 게임 안에서는 그 게임의 도전과제 창이, 그 밖에서는 프로필 카드의 도전과제 창이 열려요

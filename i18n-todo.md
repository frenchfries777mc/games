# 번역 대기 목록 (i18n-todo)

오너 지시(2026-10-18): 개발은 한국어만 하고, 다른 언어(en·es·fr·de·ja) 번역은 하루에 한 번 번역 스레드에서 모아서 처리한다.
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
index.html | 첫 화면 숫자 줄 라벨 | 계정 하나로 모든 게임, 필요한 설치, 숫자로 보기 | 허브 숫자 줄 | 2026-10-20
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
- educations/index.html | 선생님 인증 창(제목, 메일 안내, 코드 입력, 오류와 완료 문구) | educations | 2026-10-21

## Crown Envoy b76 (2026-10-21)
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 의회 | 🏛 의회 / 위원마다 성향이 있어요. N턴 뒤에 가장 많은 성향이 요구를 해요. 받아들이면 사기 +5, 거부하면 6턴 동안 반란 확률이 올라요. 한 성향이 위원의 60% 이상이면 안정도가 매턴 내려가요. / 반란 확률 증가 N턴 남음 / ⚠ N으로 쏠렸어요. 안정도가 매턴 −1이에요. / 해고 / 새 위원 임명 (80금, 한 턴에 한 번 · 해고하면 안정도 −2) | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 성향 | 군부파·상인파·귀족파·민권파·성직자파 / 군비 증액·상업 보조금·영지 하사금·구휼 지출·성당 건립비 / 각 요구 문구와 효과 설명 | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 요구 결정 | 의회의 요구: X / 수락하면 금화 N을(를) 쓰고 사기가 +5 올라요. … 거부하면 6턴 동안 반란 확률이 올라요. (고르지 않으면 거부로 처리돼요) / 수락 (−N금) / 거부 | b76 | 2026-10-21
- crownenvoy/CrownEnvoy-v0.3.html | 의회 알림·로그 | 의회가 요구를 했어요 / 의회가 N으로 쏠렸어요. 안정도가 매턴 내려가요. 위원을 바꿔 보세요. / 의회 위원은 한 턴에 한 번만 바꿀 수 있어요. / 위원은 최대 7명·최소 3명 / 위원 임명·해고 결과 문구 / 의회 요구를 받아들였다·거부했다 로그 | b76 | 2026-10-21

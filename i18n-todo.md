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

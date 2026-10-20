# 번역 대기 목록 (i18n-todo)

오너 지시(2026-10-18): 개발은 한국어만 하고, 다른 언어(en·es·fr·de·ja) 번역은 하루에 한 번 번역 스레드에서 모아서 처리한다.
한 줄 형식: `파일 또는 위키 문서 | 키 또는 내용 | 한국어 문구 | 바뀐 PR | 날짜`. 처리가 끝난 줄은 지운다.
한국어로만 바뀐 문서는 다른 언어 화면에서 한국어가 그대로 보인다. (위키는 번역 글의 해시가 다르면 한국어 원문을 보여 준다.)

## 위키
위키 한국어 본문은 /mnt/project-files/frenchfries777-hub/wiki-src/all.ko.json 에 있고, 바뀐 내용은 batchNN-notes.md 에 있다. batch30까지의 번역은 wiki/tr 에 들어갔다(2026-10-19 번역 묶음).


## 허브 패치노트
patchnotes.json | 2026-10-20 저작권 표기 | 제목 "저작권 표기"와 항목 2줄 | 저작권 표기 PR | 2026-10-20
- Dummy Party build 6 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안에 있어요: 패치노트 build 6 블록, 해설위원 대사 전부(소스 fun.js의 CMT, 지금은 한국어일 때만 보여요), 캔버스 글자 '리플레이', '시상식', '바보상'.
- beaconfall/patchnotes.json·i18n.js | N["v0.3"].items 맨 위 항목 (en·es·fr·de·ja 칸에 한국어 임시 입력) | 설정 화면과 파일 상단에 저작권 표기(© 2026 Frenchfries777 · CC BY-NC-ND 4.0) 추가 | b80 | 2026-10-20

## Crown Envoy (b69)
- crownenvoy/patchnotes.json·i18n.js | N["b69"] 제목 "저작권 표기"와 항목 1개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 저작권 표기 추가 (© 2026 Frenchfries777 · CC BY-NC-ND 4.0, 시작 화면 아래와 기록·설정에서 확인) | b69 | 2026-10-20
- crownenvoy/CrownEnvoy-v0.3.html | 기록·설정 메뉴 "저작권" 줄 제목 | 한국어 고정 문구 ("© 2026 Frenchfries777 · CC BY-NC-ND 4.0" 표기 자체는 번역하지 않음) | b69 | 2026-10-20
- Dummy Party build 7 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 7 블록 "저작권 표기" (게임 화면 하단 저작권 줄은 번역 불필요).
- Dummy Party build 8 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 8 블록 "dC와 스킨 가게", 지갑 줄("로그인하면 판이 끝날 때마다 dC를 모아서…", "허브 코인 1개 = 8dC", "허브 코인으로 바꾸기"), 꾸미기 안내("잠긴 꾸미기는 라운드 1등을 하거나 dC로 살 수 있어요"), 구매 안내 토스트(소스 wallet.js: "~dC에 살까요? 한 번 더 누르면 사요" 등), 얼굴 스킨 이름 없음(그림만).
- Dummy Party build 9 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 9 블록 "점프와 해설 위치", 무너지는 발판 설명(how)과 조작 이름 "점프", 시작 화면 팁 "점프로 빈 칸을 건너요".
- Dummy Party build 10 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 10 블록 "우노 카드 설명", 우노 카드 설명 말풍선 문구 전부(소스 mg_draw.js 우노 draw의 title/desc/note).
- Dummy Party build 11 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 11 블록 "승리 춤과 해설 대폭 추가", 꾸미기 안내 문구("잠긴 칸은 눌러서 구경하고 dC로 살 수 있어요. 맨 아래 줄은 이길 때 추는 춤이에요"), 춤 이름(소스 dances.js DANCE_NAMES: 기본 춤, 디스코 파티, 로봇 춤, 발레 공연, 브레이크댄스), 구매 토스트, 해설 대사 270줄(소스 fun.js CMT, 한국어일 때만 나와요).
- Dummy Party build 12 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 12 블록 "미로 끼임 수정" 한 줄.
- 허브 ff-auth.js 알림·친구 창 (2026-10-20): ko 키 invite, inviteOld, invBtn, invDone, invFail (NL.ko 안, 다른 언어 번역 전에는 한국어로 보임). 패치노트 "플레이 시간·방 초대" 3줄.
- Dummy Party build 13 (2026-10-20): Korean only. 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 13 블록 "병맛 신작 3개, 상단 바 정리", 새 미니게임 3개(방귀 로켓 레이스, 핫도그 먹기 대회, 닭 몰이)의 이름/설명/방법/조작 문구 및 인트로, 상단 바 메뉴(위키·커뮤니티·라운지·설정), 해설 대사 g_fartrace/g_hotdog/g_chicken(소스 fun.js, mg_e.js).

- isleport/patchnotes.json | build 11 항목 5번째 (ja·es·fr·de 칸에 영어 임시 입력) | 배경음악이 여섯 곡으로 늘어났어요. 새 곡 둘은 포근한 피아노가 이어지는 잔잔한 곡과 마림바가 얹힌 경쾌한 곡이에요 | 음악 스레드 | 2026-10-20

- Dummy Party build 14 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 14 블록 "나가기 버튼, 상단 바 제거"(3줄), 나가기 버튼, 나가기 확인창("게임에서 나가 허브로 돌아갈까요?"), 계정 한 줄("Frenchfries777 계정으로 접속 중", "허브에서 로그인하면 dC와 꾸미기가 저장돼요").
- Dummy Party build 15 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 15 블록 "dC 보상 상향" 한 줄.

- isleport/patchnotes.json | build 11 항목 6번째 (ja·es·fr·de 칸에 영어 임시 입력) | 배경음악이 일곱 곡으로 늘어났어요. 새 곡 '항구의 새벽'은 플루트와 느린 피아노가 어우러진 차분한 곡이에요 | 음악 스레드 | 2026-10-20
- Dummy Party build 16 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 16 블록 "7판과 칠판, 미니게임 3개", 푸터 "판마다 19개 미니게임 중 7개", 새 미니게임 3개(엉터리 댄스 배틀, 라면 3분 맞히기, 풍선 부풀리기)의 이름/설명/방법/조작/인트로 문구, 결과 칠판 문구(지금까지: 등수와 점수, 분필 한마디 10개: 소스 flow.js CHALK), 해설 g_dancebeat/g_ramen/g_balloon(소스 fun.js, mg_f.js).
- Dummy Party build 17 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 17 블록 "해설 효과음" 두 줄, build 16 블록 문구 수정(칠판 줄 삭제).

- Dummy Party build 18 (2026-10-20): prototypes/dummyparty/index.html 패치노트 build 18 블록 "의자 뺏기 음악" 두 줄 | 의자 뺏기에 신나는 음악이 나와요. 두 곡 중 하나가 무작위로 나오고, 음악이 멈추면 같이 멈춰요 / 소리 켜기·끄기 설정을 따라가요
- Dummy Party build 19 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 19 블록 "미니게임 4개, 볼풀 수정", 푸터 "판마다 23개 미니게임 중 7개", 새 미니게임 4개(시몬 가라사대, 줄넘기 대회, 두더지 잡기, 가위바위보 토너먼트)의 이름/설명/방법/조작/인트로 문구와 게임 안 글자(명령, 탈락, 고르는 중 등), 볼풀 설명(밀치기), 해설 g_simon/g_rope/g_mole/g_rps(소스 fun.js, mg_g.js).

- Dummy Party build 20 (2026-10-20): prototypes/dummyparty/index.html 패치노트 build 20 블록 "미니게임 배경음악" | 의자 뺏기를 뺀 미니게임 진행 중에 밝은 8비트 음악이 나와요 / 소리 켜기·끄기 설정을 따라가요

## Crown Envoy (b70)
- crownenvoy/patchnotes.json·i18n.js | N["b70"] 제목 "허브 방 초대 연결"과 항목 1개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 허브 친구 초대 연결 (비공개 방에 있으면 허브에서 친구가 초대 알림으로 바로 입장) | b70 | 2026-10-20
- Dummy Party build 21 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 21 블록 "허브 방 초대" 한 줄.
- beaconfall/patchnotes.json·i18n.js | N["v0.3"].items 맨 위 항목 (en·es·fr·de·ja 칸에 한국어 임시 입력) | 방을 열면 허브 친구 방 초대에 방 코드를 알리고 닫으면 지우도록 연결함 | b81 | 2026-10-20
- Dummy Party build 22 (2026-10-20): 새 문구는 prototypes/dummyparty/index.html 안: 패치노트 build 22 블록 "시작 화면 개편"(3줄), 시작 화면 버튼(방 만들기, 혼자 하기, 상점), 상점 창(상점, 닫기), 춤 이름 2개(소스 dances.js DANCE_NAMES: 약 올리기 춤, 엉덩이 바이바이), 춤 속 글자(메롱~, L, 엉엉..., ㅋㅋㅋㅋ, 찰싹!, 엉덩이~, 잘 가~), 로비 안내("2명 이상이어야 시작할 수 있어요.").

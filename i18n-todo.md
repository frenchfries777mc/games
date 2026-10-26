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

## Vowkeep v0.1 b1 (2026-10-21)
- prototypes/index.html | 소개 문장·Vowkeep 카드 | Dummy Party와 Vowkeep이 올라와 있어요. / 무너진 기사단의 마지막 기사가 되어 친구, 봇과 함께 던전을 내려가는 협동 게임이에요. | b1 | 2026-10-21

## 갤러리 Isleport·Dummy Party·Vowkeep (2026-10-23)
- gallery/index.html | 새 사진 11장의 제목·설명 (ko, en만 작성; 나머지 언어는 en으로 표시됨), 프로토타입 배지 글자(ko,en,es,fr,de,ja,zh,pt,ru,tr,it,pl,ar 작성됨, nw 없음)
- patchnotes.json | "갤러리에 Isleport·Dummy Party·Vowkeep" 3줄

## Dummy Party 사이트 (games/dummyparty/) b62 (2026-10-24)
- 페이지 전체 문구(소개, 미니게임, 노는 법, 패치노트, 버전)가 한국어 전용이에요. 번역은 게임 공개 결정 뒤에 해요.

## Vowkeep 허브 연결 (2026-10-23)
- index.html | Dummy Party 카드 문구 (배지 '파티 게임', 태그 3개, 설명 1줄과 목록 3줄) | 한국어만 있음 | b62 | 2026-10-24

## Dummy Party 허브 연결 (2026-10-24)
- hub.js | 통합 검색 Dummy Party 설명 '마네킹들이 벌이는 병맛 미니게임 파티' | 한국어만 있음 | 2026-10-24
- patchnotes.json | "Dummy Party 허브 연결" 4줄 | 2026-10-24

## Dummy Party 사이트 버전 이름 (2026-10-25)
- 마네킹들의 첫 파티

## 패치노트·위키 목록에 모든 게임 (2026-10-25)
- 허브 패치노트 페이지에 Isleport, Vowkeep, Dummy Party가 들어왔어요
- 허브 소식과 소식 받기에도 Dummy Party가 들어왔어요
- 위키 목록에 Vowkeep과 Dummy Party 칸이 생겼어요

## Dummy Party 사이트 b68 (2026-10-25)
- 칭호 상점과 연습장 (제목)
- 상점에 "칭호" 탭이 생겼어요. 아무개, 방귀쟁이, 뿡뿡이, 12중 스파이, 대통령 같은 병맛 칭호 12개를 dC로 사고, 이름 옆에 작게 달 수 있어요
- 첫 화면에 "연습장" 추가: 미니게임 하나를 골라 봇 한 명과 3번 연습해요 (점수, 코인, 업적, 랭킹에는 안 들어가요)
- 로그인했다면 한 판이 끝날 때 허브 랭킹의 Dummy Party 칸에 점수가 쌓여요
- 닉네임을 최대 15글자까지 쓸 수 있어요
- 줄다리기에서 자리에 따라 유리하던 것을 고치고, 핫도그 먹기 봇 실력이 자리 번호로 정해지던 것을 판마다 랜덤으로 바꿨어요

## 랭킹 Dummy Party 탭 (2026-10-25)
- hub.js/index.html | 랭킹 탭 "Dummy Party"(기존 문구 재사용: 점수·승리·판, 아직 순위가 없어요. 게임을 끝내면 점수가 쌓여요.) | 번역 불필요
- 접속 표시줄 친구 칸 프로필 사진: 새 문구 없음

## Crown Envoy b102 (2026-10-25)
- prototypes/tumblecrown (Tumblecrown 프로토타입 b1, 2026-10-25): 화면 문구 전부 한국어만 (로비 메뉴, 대기실, 무기 3종 이름·설명·기술, 조작 안내, 경기 알림, 결과표, 패치노트). 오너가 정식 등록하기 전까지는 번역 보류
- prototypes/tumblecrown b2 (2026-10-25): 직업 7개 이름·설명·공격·기술, 직업 고르기 화면(힘, 속도, 사거리, 난이도, 기본 공격), 새 로비 부제 '무너지는 섬, 왕관은 하나 · 일곱 직업 난투'. 정식 등록 전까지 번역 보류

## Dummy Party 사이트 b69 (2026-10-25)
- 방장 컴퓨터 부담 줄이기 (제목)
- 방장 컴퓨터가 느려도 게임이 덜 느려져요: 상태를 한 번만 만들어 가볍게 보내고, 회선이 막힌 사람에겐 건너뛰고, 방장이 밀려도 게임 속도를 따라잡아요
- 방장 컴퓨터가 계속 밀리면 그 컴퓨터에서만 그림을 자동으로 가볍게 바꾸고 보내는 횟수도 줄여요 (규칙은 그대로예요)

## Tumblecrown b4 (2026-10-25)
- 배틀로얄 (게임 방식)
- 남은 사람 N명 / 탈락! / N명 남았어요 / 마지막까지 살아남으세요 / 마지막까지 살아남았어요 / 다음 판에는 끝까지 버텨 보세요 / 버틴 시간
- 배틀로얄이에요. 방 바닥이 바깥부터 무너지고, 방 밖으로 떨어지면 탈락이에요. 마지막까지 남은 한 명이 왕관을 써요!

## Tumblecrown b5 (2026-10-25)
- 체력바 (제목)
- 맞을수록 머리 위 체력바가 줄어들고 더 멀리 날아가요

## 허브 카드 다듬기, Dummy Party 업적 (2026-10-25)
- ach/dummyparty.json | 업적 33개: ko+en/es/fr/de/ja는 게임 안 번역표에서 가져옴, 나머지 언어(zh,pt,ru,tr,it,pl,ar 등)는 en으로 대체돼요 | 번역 필요
- prototypes/index.html | 시험 게임을 모아 두는 곳이에요. / Tumblecrown / 무너지는 섬에서 일곱 직업으로 왕관 하나를 두고 싸우는 난투예요.

## Tumblecrown b6 (2026-10-25)
- 더 큰 방과 캐릭터, 강타 (제목)

## Tumblecrown b7 (2026-10-25)
- 3연타와 강타 (제목)

## Tumblecrown b8 (2026-10-25)
- 체력으로 싸우기 (제목)
- 배틀로얄이에요. 맞을수록 머리 위 체력바가 줄고, 다 닳으면 쓰러져요. 마지막까지 남은 한 명이 왕관을 써요! 맞아도 밀려나지 않고 바닥도 무너지지 않아요.
- 쓰러뜨림 / 쓰러졌어요 / 쓰러뜨렸어요

## Tumblecrown b9 (2026-10-25)
- Vowkeep 파티클 (제목)

## Tumblecrown b10 (2026-10-25)
- 바닥 그림자 (제목)

## Tumblecrown b11 (2026-10-25)
- Vowkeep 코드로 다시 만들기 (제목)
- 투기장 / 마지막 한 명이 남을 때까지 싸워요. 체력이 다하면 탈락해요. / 마지막 한 명이 남을 때까지 싸우는 투기장이다. / 체력이 다하면 탈락한다. 쓰러진 동료를 일으킬 수는 없다. / 투기장에 마지막 한 명이 남았다. / 그 사람이 오늘의 왕관을 쓴다.
- 직업: 바이킹 / 맘루크 / 마녀 / 스켈레톤 / 사냥꾼 (설명·기술 이름·기술 설명 전부: 돌격, 포효, 지진, 질주, 회전 베기, 낙인, 독 물약, 저주, 주문 가속, 뼈 창, 뼈 돌진, 광란, 천벌)
- 혼자 대전 준비 / 친구와 대전 / 내 직업을 고르세요. 나머지 여섯 자리는 봇이 맡아요. / 직업을 하나 골라 주세요. 빈 자리는 봇이 맡아요. / 방장이 시작하면 대전이 시작돼요. / 내 직업을 먼저 골라 주세요. / 대전 시작
- 남은 사람 {0}명 / 탈락 / {0}위 / {0}명 쓰러뜨림 / {0} 우승! / {0} 우승 / 무승부 / 순위 / 직업 / 이름 / 쓰러뜨림 / 버틴 시간 / 탈락했어요 / 끝까지 지켜봐요
- {0}가 {1}를 쓰러뜨렸어요 / {0}가 쓰러졌어요
- 업적: 첫 대전 / 마지막 한 명 / 일곱 직업의 왕관 / 연속 탈락 / 함께하는 대전 (설명 포함)
- 페이지: 마지막 한 명이 남을 때까지 / 혼자 대전 / 친구와 대전 / 직업·장비 / 대전 준비 / 대전에서 받은 명예로 직업 레벨이 오르고
- vowkeep/play b53 | 명예→vC 이름 바꿈('vC {0}', '지금 vC {0}', 'vC {0} 받음', '받은 vC {0}', '첫 완주 vC +300', 'vC의 길' 등), '허브 코인에서 바꾼 vC {0}을 받았어요.', 갑옷 스킨·움직이는 오라·움직이는 날개 이름(흑철, 설원, 진홍 갑주, 황금 갑주, 떠도는 불씨, 서리 결정, 푸른 영혼불, 달빛 후광, 천사 날개, 불꽃 날개, 그림자 날개) | 2026-10-26

## Tumblecrown b12 (2026-10-25)
- 관전 중 · {0} / 화면을 누르면 다음 사람 / 로 바꾸기
- 힘 / 속도 / 사거리 / 난이도 / 공격 / 기본 공격
- 대결 준비 · 방장 / 대결 준비 / 봇과 연습 / 봇을 넣거나 친구를 초대해 주세요. / 방장이 시작하기를 기다리는 중...
- 빨강 / 파랑 / 초록 / 노랑 / 보라 / 주황 / 준비!
- {0}초 뒤 시작해요 (Tumblecrown b14)

## Tumblecrown b15
- 도약 강타 / 피의 갈증 / 연속 찌르기 / 순간 베기 / 뼈 흩어지기 / 뼈 창 세 갈래 / 뼈 폭풍 (+ 각 설명)

## Tumblecrown b16
- 방패 강타 / 서리 폭발 (+설명) / 마지막 한 명 / 우승! / {0} 우승! / 쓰러뜨림 {0} / 순위 보기 / 로비로

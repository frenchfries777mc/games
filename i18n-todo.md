# 번역 대기 목록 (i18n-todo)

오너 지시(2026-10-18): 개발은 한국어만 하고, 다른 언어(en·es·fr·de·ja) 번역은 하루에 한 번 번역 스레드에서 모아서 처리한다.
한 줄 형식: `파일 또는 위키 문서 | 키 또는 내용 | 한국어 문구 | 바뀐 PR | 날짜`. 처리가 끝난 줄은 지운다.
한국어로만 바뀐 문서는 다른 언어 화면에서 한국어가 그대로 보인다. (위키는 번역 글의 해시가 다르면 한국어 원문을 보여 준다.)

## Dummy Party 프로토타입 (v0.1 build 1)

- prototypes/dummyparty/index.html | 게임 화면 전체 | 한국어만 있음 (프로토타입이라 번역 보류, 이름·방 코드·미니게임 설명·카드 이름·패치노트 포함) | dummyparty v0.1 b1 | 2026-10-19
- prototypes/index.html | 소개 문장과 카드 | "첫 프로토타입으로 Dummy Party가 올라왔어요." / 카드 "Dummy Party" "하얀 마네킹으로 즐기는 병맛 미니게임 멀티 대결이에요." | dummyparty v0.1 b1 | 2026-10-19

## 위키 (batch27, 2026-10-18)
위키 한국어 본문은 /mnt/project-files/frenchfries777-hub/wiki-src/all.ko.json 에 있고, 바뀐 내용은 batch27-notes.md 에 있다. batch26까지의 번역은 wiki/tr 에 들어갔다(games 저장소, 2026-10-18 번역 묶음).

- wiki (DB ff_wiki) | 2026-10-18 21시 묶음 batch27에서 바뀐 한국어 문서 30개 (stickseum 11, crownenvoy 5, tools 13, educations getting-started) | 원문은 wiki-src/all.ko.json, 번역본 wiki/tr은 해당 문서가 한국어로 대체 표시 | batch27 | 2026-10-18

## Crown Envoy (b62)

- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 세율 | 제목 "세율", 단계 "낮음/보통/높음", 설명 "수입 −12%, 반란 확률 −10%, 여론이 높은 쪽으로 안정" / "기본 세율" / "수입 +18%, 반란 확률 +20%, 사기 −5%, 여론이 낮은 쪽으로 안정", "N턴 뒤 바꿀 수 있어요", 결과 "세율을 ~(으)로 바꿨어요.", "이미 그 세율이에요.", "세율은 N턴 뒤에 다시 바꿀 수 있어요." | b62 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 정치 탭 칙령 | 제목 "칙령", 이름 "징병령/상업 장려령/계엄령/관용령", 설명 "징집 비용 −20%, 수입 −5%, 여론 하락" / "수입 +12%, 병사 유지비 +10%" / "반란 확률 −50%, 수입 −10%, 여론 하락" / "반란 확률 −20%, 사기 −3%, 여론 상승", "거두기", "남은 N턴", "칙령은 6턴 동안 시행되고, 내린 뒤 10턴이 지나야 다시 내릴 수 있어요.", 결과·오류 "~을(를) 내렸어요. ...", "이미 칙령이 시행 중이에요.", "칙령은 N턴 뒤에 다시 내릴 수 있어요.", "칙령을 거뒀어요.", "시행 중인 칙령이 없어요.", 소식 "~이(가) ~을(를) 내렸다." | b62 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 건물 | "상인 길드" 설명 "매턴 금화 +(그 지역 수입의 40%, 최소 14) · 전쟁 중에는 길드 2곳마다 여론이 −1 더 떨어져요 (최대 6곳까지 셈)" / "대학" 설명 "매턴 기술 연구 +4 · 연구 속도 +20% (최대 3곳까지 겹쳐요)" | b62 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 지도 계획 표시 | 버튼 툴팁 "계획 표시 (핀·화살표, 동맹도 봐요)" / "내 계획 표시 모두 지우기", 안내 "계획 표시: 핀. 지도에서 지역을 눌러 찍어요." / "계획 표시: 화살표. 시작 지역, 도착 지역 순서로 눌러요." / "계획 표시를 껐어요." / "시작 지역을 골랐어요. 도착 지역을 눌러요.", 결과 "계획을 표시했어요. 동맹도 볼 수 있어요." / "내 계획 표시를 지웠어요." | b62 | 2026-10-19
- crownenvoy/patchnotes.json·i18n.js | N["b62"] 제목과 항목 5개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 세율·칙령·상인 길드·계획 표시·대학 강화 | b62 | 2026-10-19

## Isleport (build 8)
- isleport/patchnotes.json | build 8 "항구 음악" 항목 2개 (ja·es·fr·de 칸에 영어 임시 입력) | Isleport 전용 배경음악이 생겼어요. 기타와 전자 피아노가 어우러진 느긋한 곡이에요 / 음악 파일이 게임 옆에 따로 있어요. 파일을 못 불러오면 예전처럼 만들어 내는 음악이 나와요 | 음악 스레드 | 2026-10-19

## Isleport (build 11)
- isleport/patchnotes.json | build 11 "새 항구 음악" 항목 1개 (ja·es·fr·de 칸에 영어 임시 입력) | Isleport 배경음악을 새 곡으로 바꿨어요. 기타와 피아노, 현악이 겹쳐지는 느긋한 곡이에요 | 음악 스레드 | 2026-10-19

- isleport/patchnotes.json | build 11 항목 2번째 (ja·es·fr·de 칸에 영어 임시 입력) | 배경음악이 두 곡으로 늘어서 번갈아 나와요. 새 곡은 신스 패드와 피아노가 어우러진 느긋한 곡이에요 | 음악 스레드 | 2026-10-19

- isleport/patchnotes.json | build 11 항목 3번째 (ja·es·fr·de 칸에 영어 임시 입력) | 배경음악이 세 곡으로 늘어서 번갈아 나와요. 새 곡은 패드와 피아노, 유리 종소리가 넓게 퍼지는 차분한 느린 곡이에요 | 음악 스레드 | 2026-10-19
- beaconfall/patchnotes.json·i18n.js | N["v0.3"].items 맨 위 항목 (en·es·fr·de·ja 칸에 한국어 임시 입력) | 로비 음악이 봄·여름·가을·겨울 곡 중에서 무작위로 하나 재생됨 (로비로 돌아올 때마다 새로 뽑음) | b74 | 2026-10-19
- wiki (DB ff_wiki) | 2026-10-19 18시 묶음 batch29에서 바뀐 한국어 문서 5개 (stickseum all-characters·patch-history, beaconfall survival-tips, hub music-room, tools blocks-reference) | 원문은 wiki-src/all.ko.json, 번역본 wiki/tr은 해당 문서가 한국어로 대체 표시 | batch29 | 2026-10-19

- isleport/patchnotes.json | build 11 항목 4번째 (ja·es·fr·de 칸에 영어 임시 입력) | 배경음악이 네 곡으로 늘어났어요. 새 곡은 박자가 빠르고 하나의 화음 위에서 가볍게 흐르는 곡이에요 | 음악 스레드 | 2026-10-19

## Crown Envoy (b63)
- crownenvoy/patchnotes.json·i18n.js | N["b63"] 제목 "승리·패배 음악"과 항목 2개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 게임이 끝나면 승리했을 땐 금관 팡파르가, 졌을 땐 느린 피아노 곡이 한 번 흘러요 / 음악 파일이 게임 옆에 따로 있어요. 파일을 못 불러오면 조용히 넘어가요 | b63 | 2026-10-19
- beaconfall/patchnotes.json·i18n.js | N["v0.3"].items 맨 아래 항목 (en·es·fr·de·ja 칸에 한국어 임시 입력) | 폭풍우가 오면 계절 곡이 거의 사라지고 낮은 패드와 천둥이 깔리는 폭풍우 곡이 흘러요 | b75 | 2026-10-19
- educations/balance/index.html | 무한 설계 모드 문구: "무한 설계" / "목숨 3개. 도면 하나를 세 번 안에 승인받지 못하면 목숨이 줄고, 다 잃을 때까지 도면이 끝없이 이어져요." / "혼자만 · 끝없이" / "목숨" | educations#45 | 2026-10-19

## Crown Envoy (b64)
- crownenvoy/patchnotes.json·i18n.js | N["b64"] 제목 "시나리오 편집기 확장"과 항목 8개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 승리 조건 설정·이벤트 종류 추가·조건부 이벤트·오프닝 글·분류 태그·나라별 시작 금화·자원·실행 취소·AI 시험 돌리기 | b64 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 시나리오 편집기 새 문구 전부 (분류, 시작 금화·자원, 승리 조건, 오프닝, 이벤트 종류 "조약 파기·병력 증감·정치체제 변경·장군 등장·장군 사망", "일어나는 때" 조건 목록, AI 시험, 실행 취소 버튼 설명) | 한국어 고정 문구 | b64 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 로비 분류 필터 "모든 분류·역사·가상·학습·균형·재미", 게임 시작 때 오프닝 신문 "시나리오의 시작"·"🏆 승리 조건: …", 이벤트 신문 문구 (병력이 모였다·조약이 깨졌다·정치체제가 바뀌었다·장군이 나타났다·세상을 떠났다), 승리 문구 "시나리오의 승리 조건을 이뤘다" | 한국어 고정 문구 | b64 | 2026-10-19
- lounge/index.html | 라운지 카드 3개: "프로토타입" / "아직 다듬는 중인 시험 게임을 모아 둔 곳이에요." / "GitHub" / "만든 코드를 구경해요." / "AI 체험" / "tarius, lectus, premus와 대화해 봐요. 곧 열려요." | hub | 2026-10-19
- prototypes/index.html | 프로토타입 페이지 문구: "아직 다듬는 중인 시험 게임을 모아 두는 곳이에요. 지금은 비어 있고, 첫 프로토타입이 나오면 여기에 올라와요." / "준비 중" / "첫 프로토타입을 기다리고 있어요." | hub | 2026-10-19

## Crown Envoy (b65)
- crownenvoy/patchnotes.json·i18n.js | N["b65"] 제목 "사이트로 돌아가기"와 항목 1개 (en·es·fr·de·ja·ar 칸에 한국어 임시 입력) | 기록·설정 화면에 "사이트로 돌아가기" 버튼 추가 | b65 | 2026-10-19
- crownenvoy/CrownEnvoy-v0.3.html | 기록·설정 메뉴 "사이트로 돌아가기" 줄 설명 ("Frenchfries777 게임 사이트(허브)로 가요. …")과 버튼 "돌아가기", 확인창 "게임을 나가 사이트로 돌아갈까요?" | 한국어 고정 문구 | b65 | 2026-10-19
- beaconfall/BEACONFALL-v0.3.html | 설정 화면 버튼 `사이트로 돌아가기` (I18N_D 사전에 번역 추가 필요) | 사이트로 돌아가기 | b76 | 2026-10-19
- beaconfall/patchnotes.json·i18n.js | N["v0.3"].items 맨 위 항목 (en·es·fr·de·ja 칸에 한국어 임시 입력) | 설정 화면에 '사이트로 돌아가기' 버튼 추가 (누르면 게임 허브로 이동) | b76 | 2026-10-19

- Dummy Party build 2 (2026-10-19): strings in prototypes/dummyparty/index.html — Korean only; new: 패치노트 build 2 block, intro card labels, uno/maze/brawl icon bubbles (mostly icons, little text).

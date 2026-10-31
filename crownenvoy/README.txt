Crown Envoy 사이트 (정적 사이트: 서버 프로그램이 필요 없어요)
================================================================
주소: https://frenchfries777mc.github.io/games/crownenvoy/
이 폴더는 games 저장소의 crownenvoy/ 폴더예요 (2026-10-18에 crownenvoy 저장소에서 옮겨 왔어요). 파일은 이 폴더에 올려요.


모든 파일이 폴더 없이 한 곳에 있어요. 이 파일들을 그대로 GitHub 저장소에 올리면 돼요.

  index.html                 첫 화면 (바로 플레이 / 다운로드 / 버전 목록 / 패치노트 / 도움말)
  versions.json              버전 목록 (새 버전을 낼 때 여기에 한 줄 추가)
  patchnotes.json            패치노트 (새 패치마다 맨 위에 항목 추가)
  CrownEnvoy-v0.1.html       v0.1 게임 파일
  CrownEnvoy-v0.2.html       v0.2 게임 파일
  CrownEnvoy-v0.3.html       v0.3 게임 파일(최신)
  CrownEnvoy-latest.html     시작 파일 (versions.json 의 latestFile 을 받는 동안 진행률 막대를 보여 주고, 다 받으면 게임으로 바뀌어요. "바로 플레이"가 이 파일을 열어요. 고치지 않아요. 안의 FALLBACK 이름은 새 버전을 낼 때 같이 바꿔요)
  CrownEnvoy-music.mp3       게임 배경음악 (v0.2·v0.3 게임 파일이 이 파일을 불러와요. 지우면 안 돼요)
  i18n.js                    7개 언어 번역(ko·en·es·fr·de·ja·ar). 접속자 브라우저 언어를 자동 감지
  hero.js, hero-map.js       첫 화면 배경(유럽 지도에서 두 나라가 영토를 뺏고 뺏기는 장면)
  map.jpg, battle-*.jpg      사이트 배경·소개 이미지

[ 올리는 방법: GitHub Pages ]
  1. 저장소 화면에서 Add file > Upload files
  2. 이 폴더의 파일을 모두 골라 끌어다 놓기 (폴더가 아니라 파일들이에요)
  3. Commit changes
  4. Settings > Pages > Deploy from a branch > main / (root) > Save
  5. 주소:  https://내아이디.github.io/저장소이름/

[ 새 버전을 낼 때 ]
  1. 새 게임 파일을 CrownEnvoy-v0.2.html 처럼 올리기
  2. versions.json 맨 위에 새 항목을 추가하고, 이전 최신 항목의 "latest"를 false로, latest 값과 latestFile(새 파일 이름)을 바꾸기
  3. patchnotes.json 맨 위에 패치노트 추가
  4. 새 버전의 제목·요약·패치노트 번역은 i18n.js 의 V, N 항목에 버전 번호로 추가 (없으면 한국어 원문이 표시돼요)
  (index.html 안의 FALLBACK 복사본은 파일로 직접 열 때만 쓰이니, 서버에 올릴 땐 json만 고치면 돼요)

[ 알아 둘 점 ]
  - 친구들이 모두 "바로 플레이" 링크로 들어오면 항상 같은 버전이라 서로 맞지 않는 문제가 없어요.
  - 진행 상황(저장된 게임 등)은 접속한 사이트 주소마다 따로 저장돼요.

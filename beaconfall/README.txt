BEACONFALL 사이트 (정적 사이트: 서버 프로그램이 필요 없어요)
=========================================================
주소: https://frenchfries777mc.github.io/games/beaconfall/
이 폴더는 games 저장소의 beaconfall/ 폴더예요 (2026-10-18에 beaconfall 저장소에서 옮겨 왔어요). 파일은 이 폴더에 올려요.

모든 파일이 폴더 없이 한 곳에 있어요. 파일을 전부(폴더 말고 파일들) 그대로 GitHub 저장소에 올리고 Pages를 켜면 돼요.

  index.html            첫 화면 (바로 플레이 / 다운로드 / 섬 둘러보기 / 아이템 / 버전 / 패치노트 / 도움말)
  i18n.js               사이트 번역 6개 언어 (한국어·English·Français·Deutsch·Español·日本語), 브라우저 언어로 자동 선택
  versions.json         버전 목록 (새 버전을 낼 때 맨 위에 한 줄 추가)
  (공략 글은 i18n.js 의 G 항목에 있어요)
  patchnotes.json       패치노트 (새 패치마다 맨 위에 항목 추가)
  BEACONFALL-v0.3.html  게임 파일 (이전 버전 파일도 함께 남겨요)
  BEACONFALL-latest.html  시작 파일 (versions.json 의 latestFile 을 받는 동안 진행률 막대를 보여 주고, 다 받으면 게임으로 바뀌어요. "바로 플레이"가 이 파일을 열어요. 고치지 않아요. 안의 FALLBACK 이름은 새 버전을 낼 때 같이 바꿔요)
  shot-*.png, i-*.png   게임 화면(도트)과 아이템 아이콘
  Galmuri11*.woff2      도트 글꼴 (SIL OFL 1.1, OFL.txt 참고)

[ 새 버전을 낼 때 ]
  1. 새 게임 파일을 BEACONFALL-v0.2.html 처럼 올리기
  2. versions.json 맨 위에 새 항목 추가, 이전 최신 항목의 "latest"를 false로, latest 값과 latestFile 바꾸기
  3. patchnotes.json 맨 위에 패치노트 추가 (번역은 i18n.js 의 N, V 에 "v0.2" 형태로 추가, 없으면 한국어 원문이 보여요)

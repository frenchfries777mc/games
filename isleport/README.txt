Isleport 사이트 (정적 사이트: 서버 프로그램이 필요 없어요)
=========================================================
모든 파일을 폴더 없이 한 곳에 GitHub 저장소에 올리고 Pages를 켜면 돼요.

  index.html            첫 화면 (게임 타이틀 화면 히어로, 특징 카드, 공략 탭, 게임 화면, 버전, 패치노트, 도움말·FAQ)
  i18n.js               사이트 번역 6개 언어 (한국어·English·日本語·Español·Français·Deutsch), 브라우저 언어로 자동 선택
  versions.json         버전 목록 (새 버전을 낼 때 맨 위에 한 줄 추가, 이전 최신의 "latest"를 false로)
  patchnotes.json       패치노트 (게임에서 만든 파일 그대로, 항목마다 6개 언어 번역이 들어 있어요)
  IslandTrade-v0.2.html 게임 파일 (이전 버전 v0.1도 함께)
  title-bg.png, shot-*.png  게임 화면
  Galmuri11*.woff2      도트 글꼴 (SIL OFL 1.1, OFL.txt 참고)

[ 새 버전을 낼 때 ]
  1. 새 게임 파일을 IslandTrade-v0.3.html 처럼 올리기
  2. versions.json 맨 위에 새 항목 추가, latest / latestFile 바꾸기
  3. patchnotes.json 을 게임 쪽 최신 파일로 교체

[ 색 설정 ]
  허브의 ⚙️ 에서 고른 테마(다크·라이트·노랑·빨강·파랑)를 따라 배경과 패널 색이 바뀌어요. (ff-lang.js 가 html 에 data-ff-theme / data-ff-accent 를 붙여요)

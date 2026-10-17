Frenchfries777 게임 허브 사이트
==============================
주소: https://frenchfries777mc.github.io/games/

  index.html          첫 화면 (게임 3개 소개, 플레이 버튼, 로그인)
  stickseum.webp      Stickseum 미리보기 그림
  crown-envoy.webp    Crown Envoy 미리보기 그림
  beaconfall.webp     Beaconfall 미리보기 그림
  ff-profile.js       세 게임이 같이 쓰는 Frenchfries777 프로필 카드
  ff-auth.js          Frenchfries777 계정 로그인 버튼과 로그인 창 (허브·게임 사이트 공용)
  ff-lang.js          언어 설정을 허브·게임 사이트·게임이 같이 쓰게 맞춰 주는 스크립트
  supabase-ff-achievements.sql  프로필 카드의 게임별 도전과제 진행상황용 SQL (Supabase에서 한 번 실행)
  supabase-ff-ach-list.sql      카드 아래 도전과제 목록 · 달성 비율용 SQL (위 SQL 다음에 한 번 실행)
  ach/<게임>.json               카드에 보이는 각 게임의 도전과제 목록 (이름 · 아이콘 · 설명, 6개 언어). ach/hub.json 은 허브 도전과제
  hub.js                        허브의 커뮤니티(게시판 · 채팅 · 피드백/버그 신고 · 신고 목록)와 맨 위 공지 배너, 아래쪽 뉴스(게임 + 허브 패치노트 중 최근 6개)
  ff-presence.js                게임을 하는 동안 친구 목록에 "🟢 ○○ 하는 중"을 띄워요 (ff-lang.js 가 게임 화면에서 불러요)
  supabase-ff-hub.sql           커뮤니티 · 친구 접속 표시 · 허브 도전과제용 SQL (맨 아래 줄에 내 아이디를 넣으면 관리자가 돼요)
  supabase-ff-images.sql        게시판 · 채팅 사진 올리기용 SQL (사진 저장소 ff-images, 위 SQL 다음에 실행)
  supabase-ff-social.sql        🔔 알림함 · 공지 배너 · 좋아요 · 친구 1:1 메시지 · 신고 · 차단용 SQL (supabase-ff-hub.sql 다음에 실행)
  supabase-ff-extra.sql         프로필 카드 꾸미기 · 이번 주 인기 게임 · 투표용 SQL (supabase-ff-hub.sql 다음에 실행). 게임 랭킹은 crownenvoy 저장소의 supabase-ff-rank.sql
  supabase-ff-more.sql          프로필 소개글 · 대표 게임 · 칭호, 게임 평점 · 한줄평, 같이 하기(방 모집)용 SQL (supabase-ff-hub.sql 다음에 실행)
  supabase-ff-react.sql         글 · 댓글 · 채팅 이모지 반응용 SQL (supabase-ff-hub.sql 다음에 실행)
  supabase-ff-coin.sql          🪙 Hub Coin (매일 출석 +10, 게임 재화로 환전) · @멘션 알림용 SQL (supabase-ff-social.sql 다음에 실행)
                                게임 쪽: 로그인 뒤 sb.rpc('ff_coin_claim',{p_game:'stickseum'}) → 받은 숫자만큼 재화를 더해요. 환전 비율은 ff_coin_rates 표
  supabase-ff-wiki.sql          📅 출석 7일 보너스 · 코인 선물 · 공략 위키 · 지금 접속 중 SQL (supabase-ff-coin.sql 다음에 실행)
  wiki/                         📖 공략 위키 사이트 (/games/wiki/). 글 원문은 Supabase ff_wiki, 번역은 wiki/tr/<언어>.json (원문 해시 h 가 맞을 때만 번역을 보여 줘요)
  patchnotes/                   📜 패치노트 사이트 (/games/patchnotes/). 허브와 세 게임의 patchnotes.json 을 모아 게임별로 보고 검색해요
  patchnotes.json               허브 패치노트 (뉴스에 '허브'로 나오고, 뉴스의 '허브 패치노트 →'에서 전체 목록)

[ 플레이 버튼 주소 ]
  - Stickseum   https://frenchfries777mc.github.io/stickseum/
  - Crown Envoy https://frenchfries777mc.github.io/crownenvoy/
  - Beaconfall  https://frenchfries777mc.github.io/beaconfall/

[ 로그인이 이어지는 원리 ]
  허브와 세 게임은 모두 frenchfries777mc.github.io 아래에 있어서 브라우저 저장소를 같이 써요.
  로그인 정보는 Supabase 기본 위치(localStorage 'sb-kebsbuvuutilitwlvxzv-auth-token')에 저장돼요.
  그래서 허브에서 로그인하면, 같은 기본 위치를 쓰는 게임(지금은 Stickseum, Beaconfall)은
  열자마자 로그인된 채로 시작해요.

[ 게임 사이트에 로그인 버튼 붙이기 ]
  로그인 버튼이 들어갈 자리에:   <span data-ff-account></span>
  </body> 바로 앞에:            <script src="https://frenchfries777mc.github.io/games/ff-auth.js"></script>
  로그인 전에는 "로그인" 버튼, 로그인 후에는 닉네임이 보여요. 닉네임을 누르면 친구, 프로필 카드, 로그아웃이 나와요.
  허브가 아닌 페이지에는 그 옆에 '← 허브' 버튼도 붙어요(휴대폰에서는 화면 왼쪽 아래). 빼려면 자리에 data-ff-nohub.

[ 친구 ]
  친구는 Stickseum과 같은 friendships 표를 써요. 그래서 허브나 게임 사이트에서 맺은 친구는 게임 안에서도 친구예요.
  닉네임(profiles.display_name)으로 찾고, 답이 없는 요청은 3시간 뒤에 사라져요(Stickseum과 같은 규칙).

[ 게임 파일 쪽 조건 ]
  supabase.createClient(URL, KEY)를 옵션 없이(또는 storageKey를 바꾸지 않고) 만들고,
  시작할 때 sb.auth.getSession()으로 로그인 상태를 확인하면 자동 로그인이 돼요.
  Crown Envoy는 지금 로그인을 따로('ce_sb') 저장해서, 이 기본 위치를 쓰도록 바꿔야 이어져요.

[ 언어 공유 ]
  게임마다 언어를 저장하는 이름이 달라요(arenaClashLang, ce_lang, cq_lang, beaconfallSiteLang, Beaconfall 설정 안의 lang).
  ff-lang.js가 이 이름들을 같은 언어로 맞춰요. 어느 한 곳에서 바꾸면, ff-lang.js나 ff-auth.js가 있는 페이지가 열릴 때 전부 그 언어가 돼요.
  가장 확실하게 하려면 각 사이트·게임의 <head> 맨 앞에:  <script src="https://frenchfries777mc.github.io/games/ff-lang.js"></script>

[ 프로필 카드의 도전과제 ]
  supabase-ff-achievements.sql을 실행한 뒤, 각 게임이 도전과제를 달성할 때(또는 로그인할 때):
    FFProfile.setAchievements(sb, 'crownenvoy', 달성한 수, 전체 수);   // 'stickseum' | 'crownenvoy' | 'beaconfall'
  Stickseum은 게임이 이미 올리는 기록으로도 보여요.
  카드를 아래로 내리면 게임별 도전과제 목록이 나와요: 달성한 것(✓), 그리고 전체 플레이어 중 몇 %가 달성했는지.
  달성한 id 목록도 같이 올려 주면 정확해요:  FFProfile.setAchievements(sb, 'crownenvoy', 달성한 수, 전체 수, ['first_game', ...])
  게임에 도전과제를 추가하면 ach/<게임>.json 도 고쳐요 (게임 파일에서 다시 뽑는 도구: Stickseum 작업 폴더의 tools/extract_ach.js).

[ 커뮤니티 · 뉴스 ]
  게시판, 채팅, 피드백/버그 신고는 로그인한 사람만 쓸 수 있고, 도배는 서버에서 막아요.
  게시판 글에는 사진 4장, 채팅에는 한 번에 1장까지 넣을 수 있어요 (붙여넣기도 돼요). 사진은 긴 쪽 1600px로 줄여서 Supabase 저장소 ff-images 에 올라가요.
  피드백은 보낸 사람과 관리자만 봐요. 관리자는 허브의 피드백 탭에서 받은 피드백을 보고, 아무 글 · 댓글 · 채팅을 지울 수 있어요.
  뉴스는 각 게임 사이트의 patchnotes.json 을 읽어서 최신순으로 보여줘요. 게임 쪽에서 패치노트만 쓰면 허브에도 자동으로 떠요.

[ 프로필 카드 링크 ]
  https://frenchfries777mc.github.io/games/?card=<로그인 아이디>  를 열면 그 사람의 카드가 열려요. 카드의 "🔗 링크" 버튼이 이 주소를 복사해요.

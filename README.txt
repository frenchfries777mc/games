Frenchfries777 게임 허브 사이트
==============================
주소: https://frenchfries777mc.github.io/games/

  index.html          첫 화면 (게임 3개 소개, 플레이 버튼, 로그인)
  stickseum.webp      Stickseum 미리보기 그림
  crown-envoy.webp    Crown Envoy 미리보기 그림
  beaconfall.webp     Beaconfall 미리보기 그림
  ff-profile.js       세 게임이 같이 쓰는 Frenchfries777 프로필 카드
  ff-auth.js          Frenchfries777 계정 로그인 버튼과 로그인 창 (허브·게임 사이트 공용)

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

[ 친구 ]
  친구는 Stickseum과 같은 friendships 표를 써요. 그래서 허브나 게임 사이트에서 맺은 친구는 게임 안에서도 친구예요.
  닉네임(profiles.display_name)으로 찾고, 답이 없는 요청은 3시간 뒤에 사라져요(Stickseum과 같은 규칙).

[ 게임 파일 쪽 조건 ]
  supabase.createClient(URL, KEY)를 옵션 없이(또는 storageKey를 바꾸지 않고) 만들고,
  시작할 때 sb.auth.getSession()으로 로그인 상태를 확인하면 자동 로그인이 돼요.
  Crown Envoy는 지금 로그인을 따로('ce_sb') 저장해서, 이 기본 위치를 쓰도록 바꿔야 이어져요.

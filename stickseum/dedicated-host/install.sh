#!/bin/bash
# Stickseum 전용 방장 설치 (Oracle Cloud Ubuntu 22.04 ARM 서버에서 한 번만 실행)
#   curl -fsSLo install.sh https://frenchfries777mc.github.io/games/stickseum/dedicated-host/install.sh && bash install.sh
# 다시 실행해도 괜찮아요 (프로그램만 새로 받고 설정은 다시 물어봐요).
set -e
BASE="https://frenchfries777mc.github.io/games/stickseum/dedicated-host"
PW_VER="1.56.1"

echo "== 1/6 기본 프로그램 설치 =="
sudo apt-get update -y
sudo apt-get install -y curl ca-certificates iptables-persistent < /dev/null
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "== 2/6 서버 방화벽 열기 (게임 연결용 UDP) =="
if ! sudo iptables -C INPUT -p udp -j ACCEPT 2>/dev/null; then sudo iptables -I INPUT -p udp -j ACCEPT; fi
sudo sh -c 'iptables-save > /etc/iptables/rules.v4' || true

echo "== 3/6 프로그램 받기 =="
sudo mkdir -p /opt/ff-host && sudo chown "$USER" /opt/ff-host
cd /opt/ff-host
curl -fsSL "$BASE/ff-host.js" -o ff-host.js
[ -f package.json ] || npm init -y >/dev/null
npm i "playwright@$PW_VER" --no-audit --no-fund

echo "== 4/6 화면 없는 브라우저 설치 (몇 분 걸려요) =="
sudo env "PATH=$PATH" npx playwright install --with-deps chromium
npx playwright install chromium

echo "== 5/6 심판 계정 정하기 =="
echo "랭크 결과를 서버에 알리는 전용 계정이에요. 평소 쓰는 계정이 아닌 새 이름을 정하세요. 처음 실행 때 자동으로 만들어져요."
read -r -p "심판 계정 아이디 (영문/숫자/밑줄 3~16자, 예: ffhost): " FFU
read -r -s -p "심판 계정 비밀번호 (6자 이상, 화면에 안 보여요): " FFP; echo
printf 'FF_USER=%s\nFF_PASS=%s\nFF_WAITING=3\nFF_MAX=10\n' "$FFU" "$FFP" | sudo tee /etc/ff-host.env >/dev/null
sudo chmod 600 /etc/ff-host.env

echo "== 6/6 자동 실행 등록 =="
sudo tee /etc/systemd/system/ff-host.service >/dev/null <<UNIT
[Unit]
Description=Stickseum dedicated host
After=network-online.target
Wants=network-online.target
[Service]
User=$USER
WorkingDirectory=/opt/ff-host
EnvironmentFile=/etc/ff-host.env
ExecStart=$(command -v node) /opt/ff-host/ff-host.js
Restart=always
RestartSec=5
[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now ff-host
sleep 15
echo
echo "설치 끝! 아래 글에 '심판 계정 로그인 성공'과 '방 열림'이 나오면 잘 돌아가는 거예요. (Ctrl+C 로 나가도 계속 돌아가요)"
sudo journalctl -u ff-host -f -n 30

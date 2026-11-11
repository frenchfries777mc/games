#!/bin/bash
# SeumArena 전용 방장 설치 (Stickseum 전용 방장이 이미 깔린 Oracle 서버에서 실행)
#   curl -fsSLo sa-install.sh https://frenchfries777.com/games/seumarena/dedicated-host/install.sh && bash sa-install.sh
# 게임이 바뀌었을 때도 이걸 다시 실행하면 새 게임 파일을 받고 다시 시작해요 (진행 중이던 경기는 끊겨요).
# 새 포트를 열거나 Caddy 를 고칠 필요가 없어요: 방장은 밖으로만 연결해요 (PeerJS + 기존 coturn).
set -e
BASE="https://frenchfries777.com/games/seumarena/dedicated-host"
PW="/opt/ff-host/node_modules"

echo "== 1/3 프로그램과 게임 받기 =="
if [ ! -d "$PW/playwright" ]; then echo "/opt/ff-host 의 playwright 를 못 찾았어요 (Stickseum 전용 방장이 먼저 깔려 있어야 해요)"; exit 1; fi
sudo mkdir -p /opt/sa-host && sudo chown "$USER" /opt/sa-host
cd /opt/sa-host
curl -fsSL "$BASE/sa-host.js" -o sa-host.js
curl -fsSL "$BASE/seumarena.html?t=$(date +%s)" -o seumarena.html.new && mv seumarena.html.new seumarena.html
echo "게임 파일 $(du -h seumarena.html | cut -f1)"

echo "== 2/3 설정 =="
[ -f /etc/sa-host.env ] || printf 'SA_GAME=/opt/sa-host/seumarena.html\nSA_WAITING=1\nSA_MAX=6\nSA_RESTART_H=6\nNODE_PATH=%s\n' "$PW" | sudo tee /etc/sa-host.env >/dev/null

echo "== 3/3 자동 실행 등록 =="
sudo tee /etc/systemd/system/sa-host.service >/dev/null <<UNIT
[Unit]
Description=SeumArena dedicated host
After=network-online.target
Wants=network-online.target
[Service]
User=$USER
WorkingDirectory=/opt/sa-host
EnvironmentFile=/etc/sa-host.env
ExecStart=$(command -v node) /opt/sa-host/sa-host.js
Restart=always
RestartSec=5
[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable sa-host >/dev/null 2>&1
sudo systemctl restart sa-host
sleep 15
echo
echo "설치 끝! 아래에 '방 열림 team 0' 같은 줄이 나오면 잘 돌아가는 거예요. (Ctrl+C 로 나가도 계속 돌아가요)"
sudo journalctl -u sa-host -f -n 30

#!/bin/bash
# Tumblecrown 전용 방장 설치. 먼저 Stickseum 전용 방장(ff-host)이 설치돼 있어야 해요 (같은 프로그램 폴더와 브라우저를 같이 써요).
# 다시 실행해도 괜찮아요.
set -e
BASE="https://frenchfries777mc.github.io/games/prototypes/tumblecrown/dedicated-host"
if [ ! -d /opt/ff-host/node_modules/playwright ]; then echo "먼저 Stickseum 전용 방장을 설치해 주세요 (/opt/ff-host 가 없어요)"; exit 1; fi
cd /opt/ff-host
curl -fsSL "$BASE/tc-host.js" -o tc-host.js
sudo tee /etc/systemd/system/tc-host.service >/dev/null <<UNIT
[Unit]
Description=Tumblecrown dedicated host
After=network-online.target
Wants=network-online.target
[Service]
User=$USER
WorkingDirectory=/opt/ff-host
ExecStart=$(command -v node) /opt/ff-host/tc-host.js
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now tc-host
sleep 3
systemctl status tc-host --no-pager | head -12
echo "끝났어요. 로그는 journalctl -u tc-host -f 로 볼 수 있어요."

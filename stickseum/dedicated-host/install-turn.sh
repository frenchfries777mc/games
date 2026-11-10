#!/bin/bash
# Stickseum 자체 중계 서버(TURN) 설치 (오라클 서버에서 한 번만 실행)
#   curl -fsSLo install-turn.sh https://frenchfries777.com/games/stickseum/dedicated-host/install-turn.sh && bash install-turn.sh
# 다시 실행해도 괜찮아요.
set -e
PUB="140.238.55.153"
USERN="ffturn"
PASS="a2daa08340367f7b1d03ff30"
PRIV=$(hostname -I | awk '{print $1}')

echo "== 1/4 coturn 설치 =="
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y coturn iptables-persistent

echo "== 2/4 설정 =="
sudo tee /etc/turnserver.conf >/dev/null <<CONF
listening-port=3478
listening-ip=$PRIV
external-ip=$PUB/$PRIV
min-port=49152
max-port=49999
fingerprint
lt-cred-mech
user=$USERN:$PASS
realm=frenchfries777.com
no-tls
no-dtls
no-cli
no-multicast-peers
user-quota=30
total-quota=300
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
allowed-peer-ip=$PRIV
log-file=/var/log/turnserver.log
simple-log
CONF
sudo sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn || true

echo "== 3/4 서버 방화벽 열기 =="
for r in "-p udp --dport 3478" "-p tcp --dport 3478" "-p udp --dport 49152:49999"; do
  if ! sudo iptables -C INPUT $r -j ACCEPT 2>/dev/null; then sudo iptables -I INPUT $r -j ACCEPT; fi
done
sudo sh -c 'iptables-save > /etc/iptables/rules.v4' || true

echo "== 4/4 실행 =="
sudo systemctl enable coturn
sudo systemctl restart coturn
sleep 3
systemctl is-active coturn && echo "중계 서버 켜짐!"
echo
echo "마지막으로 오라클 콘솔에서 이 서버의 보안 목록(Security List) 수신 규칙에 아래 3개를 추가하세요 (소스 0.0.0.0/0):"
echo "  UDP 3478 / TCP 3478 / UDP 49152-49999"

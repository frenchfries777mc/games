// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 로비, 대기실, 멀티(PeerJS), 입력, 화면 갱신
import { BUILD, VERSION, CLS, CLS_IDS, COLORS, BOT_NAMES, MAX_PLAYERS, DASH } from './data.js';
import { createGame, step, snapshot, ST, PILLARS, NT } from './sim.js';
import { View } from './render.js';
import { SFX } from './sfx.js';

const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const PREFIX = 'ff-tumblecrown-', CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', STEP = 1 / 30, SEND = 1 / 20;
const GAME_ID = 'tumblecrown', GAME_PATH = 'prototypes/tumblecrown/index.html';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hex = c => '#' + c.toString(16).padStart(6, '0');

const SAVE = Object.assign({ cls: 'knight', col: 0, bots: 3, set: { vol: 70, px: 3, bloom: 1 } }, lsGet('tumblecrown.v1', {}));
const save = () => lsSet('tumblecrown.v1', SAVE);
let UID = lsGet('tumblecrown.uid', null); if (!UID) { UID = 'u' + Math.random().toString(36).slice(2, 10); lsSet('tumblecrown.uid', UID); }
$('ver').textContent = 'v' + VERSION + ' · 빌드 ' + BUILD + ' · 프로토타입';

/* ---------- 상태 ---------- */
const S = { scr: 'sLobby', net: null, code: '', peer: null, conns: {}, conn: null, slots: [], G: null, snap: null, me: null, meta: [], rin: {}, acc: 0, sendAcc: 0, evq: [], sendEv: [], overT: 0, resultShown: false, sent: {} };
const view = new View($('gl'));
view.setPixel(SAVE.set.px); view.setBloom(!!SAVE.set.bloom); SFX.setVol(SAVE.set.vol / 100);
addEventListener('resize', () => { view.resize(); sizeOv(); });
const ov = $('ov'), oc = ov.getContext('2d');
function sizeOv() { const d = Math.min(2, devicePixelRatio || 1); ov.width = innerWidth * d; ov.height = innerHeight * d; oc.setTransform(d, 0, 0, d, 0, 0); }
sizeOv();

// 로비 뒤 장면: 방 가운데 모인 싸움꾼들
const DEMO = [{ id: 'd0', col: COLORS[0].c, cls: 'knight', x: -4, z: 1.6 }, { id: 'd1', col: COLORS[1].c, cls: 'witch', x: 4, z: 1.2 }, { id: 'd2', col: COLORS[2].c, cls: 'viking', x: -0.4, z: 4.4 }, { id: 'd3', col: COLORS[3].c, cls: 'skeleton', x: 8, z: 5.2 }, { id: 'd4', col: COLORS[4].c, cls: 'hunter', x: -8.4, z: 4.6 }];
function demoScene() { view.setPlayers(DEMO); view.ring = undefined; view.resetTiles(); view.fit(true); S.demoT = 0; }
const DEMO_TL = Array.from({ length: NT }, (c, i) => PILLARS.includes(i) ? '3' : '0').join('');
function demoSnap(t) {
  const ph = (t % 6) / 6;
  return { ring: 7, tl: DEMO_TL, c: [0, 1.6, 0.6, null],
    p: DEMO.map((d, i) => { const ch = i === 0 && ph > 0.55 && ph < 0.85; const sw = i === 0 && ph >= 0.85 && ph < 0.95;
      return [d.id, d.x, 0, d.z, -d.x * 0.3, 1, ch ? ST.charge : sw ? ST.swing : ST.idle, sw ? (ph - 0.85) * 6 : 0, ch ? Math.min(1, (ph - 0.55) / 0.25) : 0, 0, 0, 0, 0, 0, -d.x * 0.3, 1]; }) };
}

/* ---------- 처음 인트로: 건너뛸 수 없어요 ---------- */
let INTRO = !(qs.get('test') && LOCAL);
if (INTRO) setTimeout(() => { INTRO = false; document.documentElement.classList.add('tcReady'); $('tcIntro').classList.add('out'); setTimeout(() => $('tcIntro').remove(), 900); }, 6200);
else { document.documentElement.classList.add('tcReady'); $('tcIntro').remove(); }
demoScene();

/* ---------- 화면 전환 ---------- */
function show(id) {
  if (id !== 'sRoom') view.setPreview(null);
  S.scr = id; document.querySelectorAll('.scr').forEach(e => e.classList.toggle('on', e.id === id));
  const game = id === 'game'; $('hud').classList.toggle('on', game); $('touch').classList.toggle('on', game && document.body.classList.contains('touch'));
}
function homeMsg(t) { $('homeMsg').textContent = t || ''; }
const inGame = () => S.scr === 'game' || S.scr === 'sResult';

/* ---------- 로그인 ---------- */
function loggedIn() { try { return !!(window.FFAuth && FFAuth.user()); } catch (e) { return false; } }
function myName() { try { const n = window.FFAuth && FFAuth.user() && FFAuth.nickname(); if (n) return String(n).slice(0, 15); } catch (e) { } return '나'; }
function paintWho() {
  $('who').innerHTML = ''; const s = document.createElement('span'); s.className = 'tx'; s.textContent = loggedIn() ? myName() : '로그인 안 함'; $('who').appendChild(s);
  if (!loggedIn() && window.FFAuth) { const b = document.createElement('button'); b.textContent = '로그인'; b.onclick = () => { try { FFAuth.openLogin(); } catch (e) { } }; $('who').appendChild(b); }
}
if (window.FFAuth) { FFAuth.ready.then(() => { paintWho(); autoJoin(); }); FFAuth.onChange(() => paintWho()); }
paintWho();
function needLogin() { if (!window.FFAuth) return false; if (loggedIn()) return false; homeMsg('친구와 대결은 Frenchfries777 계정으로 로그인해야 해요.'); try { FFAuth.openLogin(); } catch (e) { } return true; }
function hubRoom(on) { try { if (window.FFAuth && FFAuth.setRoom) FFAuth.setRoom(on && S.code ? { game: GAME_ID, code: S.code, path: GAME_PATH } : null); } catch (e) { } }
let autoDone = false;
function autoJoin() {
  const c = (qs.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (autoDone || c.length !== 6 || S.net) return; autoDone = true;
  if (!(LOCAL && qs.get('test')) && needLogin()) return;
  const sb = window.FFAuth && FFAuth.client && FFAuth.client();
  if (!sb || LOCAL) { startGuest(c); return; }
  sb.rpc('ff_invite_live', { p_code: c }).then(r => { if (r && !r.error && r.data === false) homeMsg('취소됐거나 30분이 지나 만료된 초대예요.'); else startGuest(c); }, () => startGuest(c));
}
if (LOCAL && qs.get('join')) setTimeout(autoJoin, INTRO ? 6400 : 300);

/* ---------- 메뉴 ---------- */
document.querySelectorAll('#menu button').forEach(b => b.addEventListener('click', () => { SFX.unlock(); SFX.play('click'); menu(b.dataset.go); }));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { SFX.play('click'); if (S.scr === 'sRoom') leaveNet(); show('sLobby'); }));
function menu(go) {
  homeMsg('');
  if (go === 'solo') { leaveNet(); S.net = 'solo'; S.slots = [meSlot()]; openRoom(); }
  else if (go === 'host') { if (!(LOCAL && qs.get('test')) && needLogin()) return; startHost(); }
  else if (go === 'weps') { paintWepInfo(); show('sWeps'); }
  else if (go === 'notes') { loadNotes(); show('sNotes'); }
  else if (go === 'settings') { paintSettings(); show('sSettings'); }
  else if (go === 'site') location.href = '../../';
}
function meSlot() { return { uid: UID, name: myName(), cls: SAVE.cls, col: SAVE.col }; }

/* ---------- 직업 소개 ---------- */
function clsCard(id) { const c = CLS[id]; return '<div class="wc"><b>' + c.name + '</b><small>' + c.desc + '</small><em>공격: ' + c.atk + '</em><em>기술: ' + c.sk.name + '</em><small>' + c.sk.desc + '</small></div>'; }
function paintWepInfo() { $('wepInfo').innerHTML = CLS_IDS.map(clsCard).join(''); }

/* ---------- 설정 ---------- */
function seg(id, cur, f) { const el = $(id); el.querySelectorAll('button').forEach(b => { b.classList.toggle('on', +b.dataset.v === +cur); b.onclick = () => { SFX.play('click'); f(+b.dataset.v); el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); save(); }; }); }
function paintSettings() {
  $('setVol').value = SAVE.set.vol; $('setVol').oninput = e => { SAVE.set.vol = +e.target.value; SFX.setVol(SAVE.set.vol / 100); save(); };
  seg('setPx', SAVE.set.px, v => { SAVE.set.px = v; view.setPixel(v); });
  seg('setBloom', SAVE.set.bloom, v => { SAVE.set.bloom = v; view.setBloom(!!v); });
}

/* ---------- 패치노트 ---------- */
let NOTES = null;
function loadNotes() { if (NOTES) return renderNotes(); fetch('patchnotes.json?v=' + BUILD).then(r => r.json()).then(d => { NOTES = d; renderNotes(); }, () => { $('notesBox').innerHTML = '<p class="note">패치노트를 불러오지 못했어요.</p>'; }); }
function renderNotes() {
  const raw = (NOTES && NOTES.notes) || [], list = window.FFPN ? FFPN.filter(raw) : raw, box = $('notesBox');
  if (window.FFPN) { FFPN.mount('notesBox', renderNotes); FFPN.count(list.length); }
  if (!list.length) { box.innerHTML = raw.length && window.FFPN ? FFPN.none() : '<p class="note">아직 패치노트가 없어요.</p>'; return; }
  box.innerHTML = list.map((n, i) => '<details' + (i ? '' : ' open') + '><summary><b>' + esc(n.title) + '</b><small>' + esc(n.date) + ' · ' + esc(n.build) + '</small></summary><ul>' + n.items.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></details>').join('');
}

/* ---------- 대기실 = 직업 고르기 화면 ---------- */
// 왼쪽 직업 목록, 가운데 받침돌 위 캐릭터, 오른쪽 능력 카드, 위에 참가자 줄, 아래에 색·봇·시작
function openRoom() { show('sRoom'); paintRoom(); }
const BARS = ['힘', '속도', '사거리', '난이도'];
function paintRoom() {
  const host = S.net !== 'guest', mine = S.slots.find(s => s.uid === UID) || meSlot(), c = CLS[mine.cls] || CLS.knight;
  $('roomTitle').textContent = S.net === 'solo' ? '봇과 연습' : host ? '대결 준비 · 방장' : '대결 준비';
  $('inviteBtn').style.display = S.net === 'host' ? '' : 'none';
  $('clsList').innerHTML = CLS_IDS.map((id, k) => '<button data-c="' + id + '"' + (mine.cls === id ? ' class="on"' : '') + '><i>' + (k + 1) + '</i><b>' + CLS[id].name + '</b></button>').join('');
  $('clsList').querySelectorAll('button').forEach(el => el.onclick = () => { SFX.play('click'); SAVE.cls = el.dataset.c; save(); pick(); });
  $('clsInfo').innerHTML = '<h2>' + c.name + '</h2><p>' + c.desc + '</p>' + BARS.map((n, k) => '<div class="bar"><span>' + n + '</span><u>' + '<i class="on"></i>'.repeat(c.st[k]) + '<i></i>'.repeat(5 - c.st[k]) + '</u></div>').join('') +
    '<h4>기본 공격</h4><p>' + c.atk + '</p><h4>기술 · ' + c.sk.name + '</h4><p>' + c.sk.desc + '</p>';
  const taken = new Set(S.slots.filter(s => s.uid !== UID).map(s => s.col));
  $('colPick').innerHTML = COLORS.map((cc, i) => '<button style="background:' + hex(cc.c) + '" title="' + cc.name + '" data-c="' + i + '"' + (mine.col === i ? ' class="on"' : '') + (taken.has(i) ? ' disabled' : '') + '></button>').join('');
  $('colPick').querySelectorAll('button').forEach(el => el.onclick = () => { SFX.play('click'); SAVE.col = +el.dataset.c; save(); pick(); });
  const all = roster();
  $('slots').innerHTML = all.map(s => '<div class="slot' + (s.uid === UID ? ' me' : '') + '"><i style="background:' + hex(COLORS[s.col].c) + '"></i><b>' + esc(s.name) + '</b><small>' + CLS[s.cls].name + (s.bot ? ' · 봇' : '') + '</small></div>').join('') +
    '<span class="cnt">' + all.length + '/' + MAX_PLAYERS + '</span>';
  $('botN').textContent = S.botN; $('botRow').style.display = host ? '' : 'none';
  $('startBtn').style.display = host ? '' : 'none';
  $('roomMsg').textContent = host ? (all.length < 2 ? '봇을 넣거나 친구를 초대해 주세요.' : '') : '방장이 시작하기를 기다리는 중...';
  view.setPreview(mine.cls, COLORS[mine.col].c);
}
addEventListener('keydown', e => { if (S.scr !== 'sRoom') return; const n = +e.key; if (n >= 1 && n <= 7) { SAVE.cls = CLS_IDS[n - 1]; save(); pick(); } });
// 사람 + 봇 목록 (봇은 남은 색과 무기를 받아요)
function roster() {
  const out = S.slots.map(s => Object.assign({}, s)), used = new Set();
  for (const s of out) { if (used.has(s.col)) s.col = COLORS.findIndex((c, i) => !used.has(i)); used.add(s.col); }
  const nb = Math.max(0, Math.min(S.botN, MAX_PLAYERS - out.length));
  for (let i = 0; i < nb; i++) { const col = COLORS.findIndex((c, k) => !used.has(k)); used.add(col); out.push({ bot: true, name: BOT_NAMES[i], cls: CLS_IDS[(i * 3 + 1) % 7], col }); }
  return out;
}
S.botN = SAVE.bots;
$('botMinus').onclick = () => { SFX.play('click'); S.botN = Math.max(0, S.botN - 1); SAVE.bots = S.botN; save(); paintRoom(); hostLobby(); };
$('botPlus').onclick = () => { SFX.play('click'); S.botN = Math.min(MAX_PLAYERS - S.slots.length, S.botN + 1); SAVE.bots = S.botN; save(); paintRoom(); hostLobby(); };
function pick() {
  if (S.net === 'guest') { send({ t: 'pick', cls: SAVE.cls, col: SAVE.col }); const m = S.slots.find(s => s.uid === UID); if (m) { m.cls = SAVE.cls; m.col = SAVE.col; } paintRoom(); return; }
  const m = S.slots.find(s => s.uid === UID); if (m) { m.cls = SAVE.cls; if (!S.slots.some(s => s !== m && s.col === SAVE.col)) m.col = SAVE.col; }
  paintRoom(); hostLobby();
}
$('startBtn').onclick = () => { SFX.unlock(); SFX.play('click'); if (S.net === 'guest') return; if (roster().length < 2) return; beginGame(); };

/* ---------- 초대 (Vowkeep과 같은 방식: 친구 먼저, 그 아래 접속 중인 플레이어) ---------- */
$('inviteBtn').onclick = () => { SFX.play('click'); openInvite(); };
const GN = { stickseum: 'Stickseum', crownenvoy: 'Crown Envoy', beaconfall: 'Beaconfall', isleport: 'Isleport', dummyparty: 'Dummy Party', vowkeep: 'Vowkeep', tumblecrown: 'Tumblecrown', hub: '허브' };
const INV_T = 30 * 60 * 1000;
function sentLive(id) { const v = S.sent[id]; if (!v || v.code !== S.code || Date.now() - v.at >= INV_T) return null; return v; }
function cancelInvites() {
  const sb = window.FFAuth && FFAuth.client && FFAuth.client();
  for (const id in S.sent) { const v = sentLive(id); if (sb && v && v.id != null) try { sb.rpc('ff_uninvite', { p_id: v.id }).then(() => { }, () => { }); } catch (e) { } }
  S.sent = {};
}
async function openInvite() {
  if (needLogin()) return;
  const sb = window.FFAuth && FFAuth.client && FFAuth.client(), me = FFAuth.user(); if (!sb || !me) return;
  const L = $('invList'); $('inv').classList.add('on'); L.innerHTML = '<p class="note">불러오는 중이에요...</p>';
  const blocked = id => { try { return FFAuth.isBlocked(id); } catch (e) { return false; } };
  const fr = (FFAuth.friends() || []).filter(f => f.status === 'accepted' && !blocked(f.otherId));
  let onF = {}, others = [], otherErr = false;
  try { const r = await sb.rpc('ff_online_friends'); ((r && r.data) || []).forEach(x => { onF[x.user_id] = x.place; }); } catch (e) { }
  try { const r = await sb.rpc('ff_online_players', { p_limit: 40 }); if (r.error) otherErr = true; others = ((r && r.data) || []).filter(x => x.user_id !== me.id && !blocked(x.user_id) && !fr.some(f => f.otherId === x.user_id)); } catch (e) { otherErr = true; }
  fr.sort((a, b) => ((onF[b.otherId] ? 1 : 0) - (onF[a.otherId] ? 1 : 0)) || a.name.localeCompare(b.name, 'ko'));
  L.innerHTML = '';
  const head = t => { const h = document.createElement('h4'); h.textContent = t; L.appendChild(h); };
  const row = (id, name, tag, on) => {
    const d = document.createElement('div'); d.className = 'r' + (on ? ' on' : ''); d.innerHTML = '<b></b><small></small><button class="btn gold">초대</button>';
    d.querySelector('b').textContent = name; d.querySelector('small').textContent = tag;
    const bt = d.querySelector('button'), sm = d.querySelector('small');
    const paint = () => {
      clearTimeout(bt._t); const v = sentLive(id); bt.disabled = false; bt.textContent = v ? '취소' : '초대'; bt.className = v ? 'btn' : 'btn gold';
      sm.textContent = v ? '초대함 · ' + Math.max(1, Math.ceil((v.at + INV_T - Date.now()) / 60000)) + '분 남음' : tag;
      if (v) bt._t = setTimeout(() => { if (d.isConnected) paint(); }, Math.min(30000, v.at + INV_T - Date.now() + 50));
    };
    bt.onclick = async () => {
      SFX.play('click'); bt.disabled = true; const v = sentLive(id);
      if (v) { let ok = false; try { const r = await sb.rpc('ff_uninvite', { p_id: v.id }); ok = !(r && r.error); } catch (e) { } if (ok) { delete S.sent[id]; paint(); } else { bt.textContent = '못 취소했어요'; setTimeout(paint, 2000); } return; }
      let ok = false, nid = null;
      try { const r = await sb.rpc('ff_invite', { p_to: id, p_game: GAME_ID, p_code: S.code, p_path: GAME_PATH }); ok = !(r && r.error); nid = ok ? r.data : null; } catch (e) { }
      if (ok) { S.sent[id] = { id: nid, at: Date.now(), code: S.code }; paint(); } else { bt.textContent = '못 보냈어요'; setTimeout(paint, 2000); }
    };
    paint(); L.appendChild(d);
  };
  head('친구 (' + fr.length + ')');
  if (!fr.length) L.insertAdjacentHTML('beforeend', '<p class="note">아직 친구가 없어요.</p>');
  fr.forEach(f => row(f.otherId, f.name, onF[f.otherId] ? '🟢 ' + (GN[onF[f.otherId]] || onF[f.otherId]) : '접속 안 함', !!onF[f.otherId]));
  head('지금 접속 중인 플레이어 (' + others.length + ')');
  if (otherErr) L.insertAdjacentHTML('beforeend', '<p class="note">접속 중인 플레이어 목록은 곧 열려요.</p>');
  else if (!others.length) L.insertAdjacentHTML('beforeend', '<p class="note">지금 접속 중인 다른 플레이어가 없어요.</p>');
  others.forEach(x => row(x.user_id, x.name || '???', '🟢 ' + (GN[x.place] || x.place || ''), true));
}
$('invX').onclick = () => $('inv').classList.remove('on');
$('inv').addEventListener('click', e => { if (e.target === $('inv')) $('inv').classList.remove('on'); });

/* ---------- 멀티: PeerJS (방장이 게임을 돌리고 장면을 보내요) ---------- */
function peerOpts() {
  const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] } };
  const ps = qs.get('ps'); if (ps) { const m = ps.match(/^([^:\/]+)(?::(\d+))?(\/.*)?$/); if (m) { o.host = m[1]; o.port = +(m[2] || 443); o.path = m[3] || '/'; o.secure = location.protocol === 'https:'; } }
  return o;
}
function newCode() { let s = ''; for (let i = 0; i < 6; i++) s += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; return s; }
function leaveNet() {
  hubRoom(false); cancelInvites();
  if (S.peer) { try { S.peer.destroy(); } catch (e) { } }
  S.peer = null; S.conn = null; S.conns = {}; S.net = null; S.code = ''; S.G = null; S.snap = null;
}
function send(d) { if (S.conn && S.conn.open) try { S.conn.send(d); } catch (e) { } }
function bcast(d) { for (const k in S.conns) { const c = S.conns[k]; if (c.open) try { c.send(d); } catch (e) { } } }
function startHost(tries = 0) {
  if (!window.Peer) { homeMsg('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.'); return; }
  leaveNet(); S.net = 'host'; S.code = (LOCAL && qs.get('room')) || newCode(); homeMsg('방을 만드는 중...');
  S.slots = [meSlot()];
  const p = new Peer(PREFIX + S.code, peerOpts()); S.peer = p;
  p.on('open', () => { if (S.peer !== p) return; homeMsg(''); hubRoom(true); openRoom(); });
  p.on('connection', c => { c.on('data', d => hostMsg(c, d)); c.on('close', () => dropConn(c)); c.on('error', () => dropConn(c)); });
  p.on('disconnected', () => { if (S.peer === p && !p.destroyed) setTimeout(() => { if (S.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
  p.on('error', err => { if (S.peer !== p) return; if (err.type === 'unavailable-id' && tries < 5) { startHost(tries + 1); return; } if (S.scr !== 'sRoom' && !inGame()) { homeMsg('방을 만들지 못했어요 (' + err.type + '). 잠시 후 다시 해 보세요.'); leaveNet(); } });
}
function hostLobby() { if (S.net === 'host') bcast({ t: 'lobby', slots: S.slots, bots: S.botN }); }
function hostMsg(c, d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'hello') {
    const uid = String(d.uid || '').slice(0, 20), name = String(d.name || '손님').slice(0, 15);
    c._uid = uid; c._name = name;
    const cls = CLS[d.cls] ? d.cls : 'knight';
    if (S.G) { // 경기 중: 봇 자리를 맡거나 내 자리로 돌아와요
      const p = S.G.players.find(q => q.uid === uid) || S.G.players.find(q => q.bot);
      if (!p) { c.send({ t: 'deny', why: '방이 가득 찼어요 (최대 6명).' }); setTimeout(() => c.close(), 300); return; }
      p.bot = false; p.uid = uid; p.name = name; S.conns[uid] = c; c._pid = p.id;
      const m = S.meta.find(x => x.id === p.id); if (m) { m.name = name; m.bot = false; }
      bcast({ t: 'meta', meta: S.meta }); c.send({ t: 'start', pid: p.id, meta: S.meta }); feed(name + '님이 들어왔어요.');
      return;
    }
    let sl = S.slots.find(s => s.uid === uid);
    if (!sl) {
      if (S.slots.length >= MAX_PLAYERS) { c.send({ t: 'deny', why: '방이 가득 찼어요 (최대 6명).' }); setTimeout(() => c.close(), 300); return; }
      const used = new Set(S.slots.map(s => s.col)); let col = +d.col | 0; if (used.has(col) || !COLORS[col]) col = COLORS.findIndex((x, i) => !used.has(i));
      sl = { uid, name, cls, col }; S.slots.push(sl); S.botN = Math.min(S.botN, MAX_PLAYERS - S.slots.length);
    }
    S.conns[uid] = c; c.send({ t: 'welcome', uid }); hostLobby(); if (S.scr === 'sRoom') paintRoom(); SFX.play('click');
    return;
  }
  const uid = c._uid; if (!uid) return;
  if (d.t === 'pick' && !S.G) { const sl = S.slots.find(s => s.uid === uid); if (sl) { if (CLS[d.cls]) sl.cls = d.cls; const col = +d.col | 0; if (COLORS[col] && !S.slots.some(s => s !== sl && s.col === col)) sl.col = col; hostLobby(); if (S.scr === 'sRoom') paintRoom(); } }
  else if (d.t === 'i' && S.G) { const pid = c._pid; if (!pid) return; const r = S.rin[pid] || (S.rin[pid] = {}); const once = { dash: r.dash || d.dash, sk: r.sk || d.sk }; Object.assign(r, d, once); }
}
function dropConn(c) {
  const uid = c._uid; if (!uid || S.conns[uid] !== c) return; delete S.conns[uid];
  if (S.G) { const p = S.G.players.find(q => q.uid === uid); if (p) { p.bot = true; p.uid = null; delete S.rin[p.id]; feed(p.name + '님이 나가서 봇이 대신해요.'); } }
  const i = S.slots.findIndex(s => s.uid === uid); if (i >= 0) S.slots.splice(i, 1);
  hostLobby(); if (S.scr === 'sRoom') paintRoom();
}
function startGuest(code) {
  if (!window.Peer) { homeMsg('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.'); return; }
  leaveNet(); S.net = 'guest'; S.code = code; homeMsg('방에 들어가는 중...');
  const p = new Peer(peerOpts()); S.peer = p;
  const tm = setTimeout(() => { if (S.peer === p && S.scr !== 'sRoom' && !inGame()) { homeMsg('연결 시간이 초과됐어요. 초대를 다시 받아 주세요.'); leaveNet(); } }, 15000);
  p.on('open', () => {
    const c = p.connect(PREFIX + code, { reliable: true, serialization: 'json' }); S.conn = c;
    c.on('open', () => c.send({ t: 'hello', uid: UID, name: myName(), cls: SAVE.cls, col: SAVE.col }));
    c.on('data', d => { clearTimeout(tm); guestMsg(d); });
    c.on('close', () => { if (S.conn !== c) return; const was = inGame(); leaveNet(); toLobby(was ? '방장이 나가서 대결이 끝났어요.' : '방이 닫혔어요.'); });
  });
  p.on('error', err => { if (S.peer !== p) return; clearTimeout(tm); if (S.scr !== 'sRoom' && !inGame()) { homeMsg(err.type === 'peer-unavailable' ? '초대받은 방이 이미 닫혔어요.' : '연결하지 못했어요 (' + err.type + ').'); leaveNet(); } });
}
function guestMsg(d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'welcome') { homeMsg(''); openRoom(); }
  else if (d.t === 'lobby') { S.slots = d.slots; S.botN = d.bots | 0; if (S.scr === 'sRoom') paintRoom(); }
  else if (d.t === 'deny') { homeMsg(d.why || '들어갈 수 없어요.'); leaveNet(); }
  else if (d.t === 'start') { S.me = d.pid; S.meta = d.meta; startClient(); }
  else if (d.t === 'meta') { S.meta = d.meta; }
  else if (d.t === 'room') { openRoom(); }
  else if (d.t === 's') { S.snap = d.S; if (d.ev) for (const e of d.ev) S.evq.push(e); }
}

/* ---------- 경기 시작 ---------- */
function beginGame() {
  const all = roster();
  const slots = all.map((s, i) => ({ id: 'p' + i, uid: s.uid || null, name: s.name, bot: !!s.bot, cls: s.cls, col: COLORS[s.col].c }));
  S.G = createGame(slots); S.rin = {};
  S.meta = slots.map(s => ({ id: s.id, name: s.name, cls: s.cls, col: s.col, bot: s.bot }));
  S.me = slots.find(s => s.uid === UID).id;
  if (S.net === 'host') for (const uid in S.conns) { const p = S.G.players.find(q => q.uid === uid); if (p) { S.conns[uid]._pid = p.id; S.conns[uid].send({ t: 'start', pid: p.id, meta: S.meta }); } }
  startClient();
}
function startClient() {
  S.acc = 0; S.sendAcc = 0; S.evq = []; S.sendEv = []; S.overT = 0; S.resultShown = false; S.lastCd = 9;
  if (S.G) S.snap = snapshot(S.G);
  view.setPlayers(S.meta); view.resetTiles(); view.ring = undefined; view.fit(true);
  $('feed').innerHTML = ''; $('skName').textContent = CLS[(S.meta.find(m => m.id === S.me) || {}).cls || 'knight'].sk.name;
  exitArm(false); show('game'); paintBoard(true);
}
function toLobby(msg) { show('sLobby'); demoScene(); homeMsg(msg || ''); }

/* ---------- 입력 ---------- */
const KEY = {}; const IN = { mx: 0, mz: 0, ax: 0, az: 1, atk: false, dash: false, sk: false };
let mouse = null, mDown = false;
addEventListener('keydown', e => {
  if (e.repeat) return; KEY[e.code] = true; if (S.scr !== 'game') return;
  if (e.code === 'Space') { IN.dash = true; e.preventDefault(); }
  if (e.code === 'KeyQ' || e.code === 'KeyE') IN.sk = true;
  if (e.code === 'KeyJ') mDown = true;
});
addEventListener('keyup', e => { KEY[e.code] = false; if (e.code === 'KeyJ') mDown = false; });
addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; mDown = false; });
$('gl').addEventListener('contextmenu', e => e.preventDefault());
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY }; });
addEventListener('pointerdown', e => {
  SFX.unlock(); if (e.pointerType !== 'mouse') { if (!document.body.classList.contains('touch')) { document.body.classList.add('touch'); if (S.scr === 'game') $('touch').classList.add('on'); } return; }
  if (S.scr !== 'game' || e.target.closest('button')) return;
  if (e.button === 0) mDown = true; else if (e.button === 2) IN.sk = true;
});
addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) mDown = false; });
// 휴대폰: 왼쪽 엄지 이동, 오른쪽 버튼
const joy = { id: null, x: 0, y: 0, dx: 0, dy: 0 };
$('joy').addEventListener('pointerdown', e => { joy.id = e.pointerId; joy.x = e.clientX; joy.y = e.clientY; joy.dx = joy.dy = 0; const b = $('joyBase'); b.style.display = 'block'; b.style.left = (e.clientX - 60) + 'px'; b.style.top = (e.clientY - 60) + 'px'; $('joy').setPointerCapture(e.pointerId); });
$('joy').addEventListener('pointermove', e => { if (e.pointerId !== joy.id) return; let dx = e.clientX - joy.x, dy = e.clientY - joy.y; const L = Math.hypot(dx, dy); if (L > 50) { dx *= 50 / L; dy *= 50 / L; } joy.dx = dx / 50; joy.dy = dy / 50; $('joyKnob').style.left = (30 + dx) + 'px'; $('joyKnob').style.top = (30 + dy) + 'px'; });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.dx = joy.dy = 0; $('joyBase').style.display = 'none'; $('joyKnob').style.left = $('joyKnob').style.top = '30px'; };
$('joy').addEventListener('pointerup', joyEnd); $('joy').addEventListener('pointercancel', joyEnd);
let tAtk = false;
$('tA').addEventListener('pointerdown', e => { tAtk = true; e.preventDefault(); }); ['pointerup', 'pointercancel', 'pointerleave'].forEach(k => $('tA').addEventListener(k, () => { tAtk = false; }));
$('tD').addEventListener('pointerdown', e => { IN.dash = true; e.preventDefault(); });
$('tS').addEventListener('pointerdown', e => { IN.sk = true; e.preventDefault(); });

function readInput() {
  let mx = (KEY.KeyD || KEY.ArrowRight ? 1 : 0) - (KEY.KeyA || KEY.ArrowLeft ? 1 : 0), mz = (KEY.KeyS || KEY.ArrowDown ? 1 : 0) - (KEY.KeyW || KEY.ArrowUp ? 1 : 0);
  if (joy.id != null) { mx = joy.dx; mz = joy.dy; }
  IN.mx = mx; IN.mz = mz; IN.atk = mDown || tAtk;
  const me = S.snap && S.snap.p.find(a => a[0] === S.me);
  if (me) {
    if (document.body.classList.contains('touch')) {
      // 가까운 상대 자동 조준 (없으면 움직이는 방향)
      let best = null, bd = 7; for (const a of S.snap.p) { if (a[0] === S.me || a[6] === ST.out) continue; const d = Math.hypot(a[1] - me[1], a[3] - me[3]); if (d < bd) { bd = d; best = a; } }
      if (best) { IN.ax = best[1] - me[1]; IN.az = best[3] - me[3]; } else if (Math.hypot(mx, mz) > 0.2) { IN.ax = mx; IN.az = mz; }
    } else if (mouse) { const g = view.ground(mouse.x, mouse.y, Math.max(0, me[2])); if (g) { const dx = g.x - me[1], dz = g.z - me[3]; if (Math.hypot(dx, dz) > 0.2) { IN.ax = dx; IN.az = dz; } } }
  }
  return { mx: IN.mx, mz: IN.mz, ax: IN.ax, az: IN.az, atk: IN.atk, dash: IN.dash, sk: IN.sk };
}

/* ---------- 나가기: 두 번 눌러야 나가요 (브라우저 팝업 없이) ---------- */
let exitT = 0;
function exitArm(on) { clearTimeout(exitT); const b = $('exitBtn'); b.classList.toggle('warn', on); b.textContent = on ? '한 번 더 누르면 나가요' : '나가기'; if (on) exitT = setTimeout(() => exitArm(false), 2500); }
$('exitBtn').onclick = () => { SFX.play('click'); if (!$('exitBtn').classList.contains('warn')) { exitArm(true); return; } exitArm(false); leaveGame(); };
function leaveGame() { leaveNet(); toLobby(''); }

/* ---------- 경기 화면 글자 ---------- */
let bigT = 0;
function big(t, sub, dur = 1.4) { $('bigMsg').textContent = t; $('subMsg').textContent = sub || ''; $('bigMsg').style.opacity = 1; $('subMsg').style.opacity = sub ? 1 : 0; bigT = dur; }
function feed(t) { const f = $('feed'), d = document.createElement('div'); d.textContent = t; f.prepend(d); while (f.children.length > 4) f.lastChild.remove(); setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 600); }, 3500); }
const nameOf = id => { const m = S.meta.find(x => x.id === id); return m ? m.name : '?'; };
function paintBoard(force) {
  const s = S.snap; if (!s) return; const B = $('board');
  if (force || B.children.length !== s.p.length) B.innerHTML = s.p.map(a => { const m = S.meta.find(x => x.id === a[0]) || {}; return '<div class="bd" data-id="' + a[0] + '"><div class="n"><i style="background:' + hex(m.col || 0) + '"></i><span>' + esc(m.name || '') + '</span></div><div class="bar"><u></u></div></div>'; }).join('');
  for (const el of B.children) { const a = s.p.find(x => x[0] === el.dataset.id); if (!a) continue; const dead = a[6] === ST.out; el.querySelector('u').style.width = dead ? '0%' : Math.max(4, 100 - Math.min(100, a[9] / 1.5)) + '%'; el.classList.toggle('out', dead); el.classList.toggle('hold', s.w === a[0]); el.classList.toggle('me', a[0] === S.me); }
  const n = s.p.filter(a => a[6] !== ST.out).length; $('alive').textContent = s.ph === 'over' ? '' : '남은 사람 ' + n + '명';
}
function onEvent(e) {
  view.onEvent(e);
  if (e.k === 'hit') SFX.play('hit', e.s);
  else if (e.k === 'swing') SFX.play('swing', e.c);
  else if (e.k === 'dash') SFX.play('dash');
  else if (e.k === 'slam') SFX.play('slam');
  else if (e.k === 'drop') SFX.play('drop');
  else if (e.k === 'ko') { SFX.play(e.id === S.me ? 'fall' : 'ko'); feed((e.by ? nameOf(e.by) + '님이 ' + nameOf(e.id) + '님을 떨어뜨렸어요' : nameOf(e.id) + '님이 떨어졌어요') + ' (남은 ' + e.left + '명)'); if (e.id === S.me) big('탈락!', e.left + '명 남았어요 · ' + (e.left + 1) + '등', 1.6); else if (e.by === S.me) big('떨어뜨림!', '남은 ' + e.left + '명', 0.9); }
  else if (e.k === 'shrink') { SFX.play('crack'); big('섬이 무너져요!', '바깥 고리가 곧 떨어져요', 1.6); }
  else if (e.k === 'tfall') { }
  else if (e.k === 'go') { SFX.play('go'); big('시작!', '', 0.8); }
  else if (e.k === 'win') SFX.play('win');
}
function drawOverlay(s, t) {
  oc.clearRect(0, 0, innerWidth, innerHeight); if (!s) return;
  oc.textAlign = 'center'; oc.lineJoin = 'round';
  for (const a of s.p) {
    if (a[6] === ST.out) continue; const e = view.ents.get(a[0]); if (!e) continue;
    const m = S.meta.find(x => x.id === a[0]) || {}, p = view.project(e.x, e.y + 3.4 + (s.c[3] === a[0] ? 0.9 : 0), e.z);
    const pct = a[9], c = pct < 40 ? '#ffffff' : pct < 90 ? '#ffe08a' : pct < 140 ? '#ff9c4a' : '#ff5a4a';
    oc.font = '700 12px Galmuri, sans-serif'; oc.lineWidth = 4; oc.strokeStyle = '#14203a'; oc.strokeText(m.name || '', p.x, p.y - 14); oc.fillStyle = a[0] === S.me ? '#ffe08a' : '#fff8ea'; oc.fillText(m.name || '', p.x, p.y - 14);
    // 체력바: 가득 찬 상태에서 맞을수록 줄어요 (150%면 텅 비어요. 줄어들수록 더 멀리 날아가요)
    const hp = Math.max(0, 1 - pct / 150), bw = 46, bx = p.x - bw / 2, by = p.y - 8;
    oc.fillStyle = '#14203a'; oc.fillRect(bx - 2, by - 2, bw + 4, 11); oc.fillStyle = '#3a2430'; oc.fillRect(bx, by, bw, 7);
    oc.fillStyle = a[0] !== S.me ? '#e0403a' : hp > 0.6 ? '#7ae07a' : hp > 0.35 ? '#ffe08a' : hp > 0.15 ? '#ff9c4a' : '#ff5a4a'; oc.fillRect(bx, by, Math.round(bw * hp), 7);
    if (a[0] === S.me) { oc.fillStyle = '#ffe08a'; oc.beginPath(); oc.moveTo(p.x - 6, p.y + 6); oc.lineTo(p.x + 6, p.y + 6); oc.lineTo(p.x, p.y + 13); oc.fill(); }
  }
  // 조준선: 내 캐릭터 앞에 짧은 화살표 (PC)
  const me = s.p.find(a => a[0] === S.me);
  if (me && me[6] !== ST.out && !document.body.classList.contains('touch')) {
    const e = view.ents.get(S.me); if (e) { const L = Math.hypot(me[14], me[15]) || 1, a = view.project(e.x + me[14] / L * 1.3, Math.max(0, e.y) + 0.1, e.z + me[15] / L * 1.3), b = view.project(e.x + me[14] / L * 2.1, Math.max(0, e.y) + 0.1, e.z + me[15] / L * 2.1);
      oc.strokeStyle = 'rgba(255,240,180,' + (me[6] === ST.charge ? 0.5 + me[8] * 0.5 : 0.45) + ')'; oc.lineWidth = me[6] === ST.charge ? 3 + me[8] * 3 : 3; oc.beginPath(); oc.moveTo(a.x, a.y); oc.lineTo(b.x, b.y); oc.stroke(); }
  }
}
function hudTick(s, dt) {
  if (bigT > 0 && (bigT -= dt) <= 0) { $('bigMsg').style.opacity = 0; $('subMsg').style.opacity = 0; }
  if (s.ph === 'count') { const n = Math.ceil(s.cd); if (n !== S.lastCd && n > 0) { S.lastCd = n; big(String(n), '마지막까지 살아남으세요', 1); SFX.play('count'); } }
  const me = s.p.find(a => a[0] === S.me);
  if (me) {
    const w = CLS[(S.meta.find(m => m.id === S.me) || {}).cls || 'knight'];
    const dc = Math.min(1, me[16] / DASH.cd), sc = Math.min(1, me[17] / w.sk.cd);
    $('skD').querySelector('.cd').style.height = dc * 100 + '%'; $('skS').querySelector('.cd').style.height = sc * 100 + '%';
    $('tD').querySelector('.cd').style.height = dc * 100 + '%'; $('tS').querySelector('.cd').style.height = sc * 100 + '%';
  }
  paintBoard(false);
  if (s.ph === 'over' && !S.resultShown) {
    if (!S.overT) { S.overT = 0.001; const w = s.w; big(nameOf(w) + ' 승리!', w === S.me ? '마지막까지 살아남았어요!' : '', 3); }
    S.overT += dt; if (S.overT > 2.6) { S.resultShown = true; showResult(s); }
  }
}
function showResult(s) {
  const rows = s.p.slice().sort((a, b) => a[10] - b[10]);
  const host = S.net !== 'guest';
  $('result').innerHTML = '<div class="big">' + esc(nameOf(s.w)) + ' 승리!</div><p class="note">' + (s.w === S.me ? '마지막까지 살아남았어요.' : '다음 판에는 끝까지 버텨 보세요.') + '</p>' +
    '<table><tr><th>순위</th><th>이름</th><th>버틴 시간</th><th>떨어뜨림</th></tr>' +
    rows.map(a => '<tr' + (a[0] === S.me ? ' style="color:#ffe08a"' : '') + '><td>' + a[10] + '</td><td>' + esc(nameOf(a[0])) + '</td><td>' + Math.floor(a[19]) + '초</td><td>' + a[11] + '</td></tr>').join('') + '</table>' +
    '<div class="row">' + (host ? '<button class="btn gold" id="againBtn">다시 하기</button><button class="btn" id="roomBtn">대기실로</button>' : '<span class="note">방장이 다음 판을 고르는 중...</span>') + '<button class="btn" id="quitBtn">나가기</button></div>';
  show('sResult'); $('hud').classList.add('on');
  if (host) { $('againBtn').onclick = () => { SFX.play('click'); beginGame(); }; $('roomBtn').onclick = () => { SFX.play('click'); S.G = null; S.snap = null; bcast({ t: 'room' }); demoScene(); openRoom(); }; }
  $('quitBtn').onclick = () => { SFX.play('click'); leaveGame(); };
}

/* ---------- 매 프레임 ---------- */
let last = performance.now(), T = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (inGame() && S.snap) {
    const inp = readInput();
    if (S.G) {
      S.acc += dt;
      while (S.acc >= STEP) {
        S.acc -= STEP; const ins = Object.assign({}, S.rin); ins[S.me] = inp;
        step(S.G, STEP, ins);
        IN.dash = IN.sk = false; inp.dash = inp.sk = false; for (const k in S.rin) { S.rin[k].dash = false; S.rin[k].sk = false; }
        for (const e of S.G.ev) { S.evq.push(e); S.sendEv.push(e); }
      }
      S.snap = snapshot(S.G);
      if (S.net === 'host' && (S.sendAcc += dt) >= SEND) { S.sendAcc = 0; bcast({ t: 's', S: S.snap, ev: S.sendEv }); S.sendEv = []; }
      else if (S.net !== 'host') S.sendEv = [];
    } else if (S.net === 'guest' && (S.sendAcc += dt) >= STEP) { S.sendAcc = 0; send(Object.assign({ t: 'i' }, inp)); IN.dash = IN.sk = false; }
    while (S.evq.length) onEvent(S.evq.shift());
    view.update(S.snap, dt, T); hudTick(S.snap, dt); drawOverlay(S.snap, T);
  } else {
    view.update(demoSnap(T), dt, T); oc.clearRect(0, 0, innerWidth, innerHeight);
  }
  view.render();
}
requestAnimationFrame(frame);
// 시험용 (내 컴퓨터에서만)
if (LOCAL) window.__T = { S, view, menu, beginGame };
if (LOCAL && qs.get('auto') === 'solo') setTimeout(() => { menu('solo'); setTimeout(beginGame, 200); }, INTRO ? 6400 : 100);
if (LOCAL && qs.get('auto') === 'host') setTimeout(() => menu('host'), INTRO ? 6400 : 100);

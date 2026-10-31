/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0 */
'use strict';
const $ = id => document.getElementById(id), qs = new URLSearchParams(location.search);
const PREFIX = 'ff-gatecrash-', CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', SNAP = 1 / 20, MAXP = 4;
$('ver').textContent = 'v' + VERSION + ' · b' + BUILD;
const SAVE = (() => { try { return JSON.parse(localStorage.getItem('gatecrash.save') || '{}'); } catch (e) { return {}; } })();
function save() { try { localStorage.setItem('gatecrash.save', JSON.stringify(SAVE)); } catch (e) { } }
SAVE.gc = SAVE.gc | 0; if (!SAVE.skins || !Array.isArray(SAVE.skins.own)) SAVE.skins = { own: [], on: '' };
function skinOf() { return SKINS[SAVE.skins.on] && SAVE.skins.own.includes(SAVE.skins.on) ? SAVE.skins.on : ''; }
if (!SAVE.uid) { SAVE.uid = Math.random().toString(36).slice(2, 10); SAVE.col = (Math.random() * COLORS.length) | 0; save(); }
const UID = SAVE.uid;

/* ---------- 최적화: 사이트 공용 설정 FFPerf(ff_perf = {low, fx, fps})를 따라요. 공용 설정이 없으면 이 게임 안의 값을 써요.
   켜면 화면을 1배 해상도로 그리고 초당 30번만 그려요 (게임 규칙과 속도는 그대로) ---------- */
let OPT = false, FPSCAP = 0;
function perfRead() {
  let p = null; try { p = window.FFPerf ? FFPerf.get() : null; } catch (e) { }
  if (!p) p = { low: SAVE.opt === 1 };
  const low = !!p.low, fx = p.fx || (low ? 'low' : 'high'), fps = p.fps != null ? p.fps : (low ? 30 : 0);
  OPT = low || fx === 'low'; FPSCAP = fps === 30 || fps === 60 ? fps : 0;
  const b = document.querySelector('#menu [data-go="opt"]'); if (b) b.textContent = OPT ? '최적화 켬' : '최적화 끔';
}
perfRead();
window.addEventListener('ffperf', perfRead);
/* 느린 화면 안내: 최적화가 꺼져 있는데 달리는 동안 화면이 계속 느리면, 다음에 로비로 돌아왔을 때 이 기기에서 한 번만 알려 줘요 */
let lhDone = !!SAVE.lowHint, lhPend = false, lhAvg = 16, lhN = 0;
function lowHintTick(gap) {
  if (lhDone || lhPend || OPT) return;
  lhAvg = lhAvg * 0.97 + Math.min(gap, 100) * 0.03; lhN = lhAvg > 40 ? lhN + 1 : 0;
  if (lhN > 240) lhPend = true;
}

/* ---------- 모달 (브라우저 팝업 대신) ---------- */
function say(t) { $('modalT').textContent = t; $('modal').classList.add('on'); }
$('modalOk').onclick = () => $('modal').classList.remove('on');

/* ---------- 계정 / 프로필 ---------- */
function loggedIn() { try { return !!(window.FFAuth && FFAuth.user()); } catch (e) { return false; } }
function myAid() { try { const u = window.FFAuth && FFAuth.user(); return u && u.id ? String(u.id) : ''; } catch (e) { return ''; } }
function openProf(aid) { try { if (aid && window.FFAuth && FFAuth.openProfile) FFAuth.openProfile(aid, { game: 'gatecrash' }); } catch (e) { } }
function myName() { try { const n = window.FFAuth && FFAuth.user() && FFAuth.nickname(); if (n) return String(n).slice(0, 15); } catch (e) { } return '손님'; }
function paintWho() {
  const w = $('who'); w.innerHTML = '';
  const s = document.createElement('span'); s.textContent = loggedIn() ? myName() : '로그인 안 함'; w.appendChild(s);
  if (!loggedIn() && window.FFAuth) { const b = document.createElement('button'); b.textContent = '로그인'; b.onclick = () => { try { FFAuth.openLogin(); } catch (e) { } }; w.appendChild(b); }
}
let ffMarked = '';
function ffProfile() {
  if (window.FFProfile) return Promise.resolve(true);
  return new Promise(res => { const s = document.createElement('script'); s.src = 'https://frenchfries777mc.github.io/games/ff-profile.js?v=20261029b'; s.onload = () => res(!!window.FFProfile); s.onerror = () => res(false); document.head.appendChild(s); });
}
async function ffSync() {
  try {
    const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u || !(await ffProfile())) return;
    if (ffMarked !== u.id) { ffMarked = u.id; FFProfile.markPlayed(sb, 'gatecrash'); claimGC(); }
  } catch (e) { }
}
if (window.FFAuth) { FFAuth.ready.then(() => { paintWho(); ffSync(); }); FFAuth.onChange(() => { paintWho(); ffSync(); }); }
paintWho();
function needLogin() { if (!window.FFAuth || loggedIn()) return false; homeMsg('온라인 대전은 Frenchfries777 계정으로 로그인해야 해요.'); try { FFAuth.openLogin(); } catch (e) { } return true; }
function homeMsg(t) { $('homeMsg').textContent = t || ''; }

/* ---------- 화면 ---------- */
let scr = 'sLobby';
function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); scr = id; $('hud').classList.toggle('on', id === 'game'); if (id === 'sLobby' && lhPend && !lhDone) { lhDone = true; SAVE.lowHint = 1; save(); homeMsg('화면이 느렸어요. 「최적화」 버튼을 누르면 화질과 효과를 줄여 더 부드러워져요.'); } }
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { if (scr === 'sRoom' || scr === 'sMap') leaveNet(); show('sLobby'); paintWho(); }));
document.querySelectorAll('#menu .btn').forEach(b => b.addEventListener('click', () => menu(b.dataset.go)));
function pickMap(cb) {
  $('mapPick').innerHTML = MAP_IDS.map(id => '<button class="mapc" data-m="' + id + '"><b>' + MAPS[id].name + '</b><small>' + MAPS[id].desc + '</small></button>').join('');
  $('mapPick').querySelectorAll('button').forEach(b => b.onclick = () => { SFX.unlock(); cb(b.dataset.m); });
  show('sMap');
}
function menu(go) {
  SFX.unlock();
  homeMsg('');
  if (go === 'solo') { leaveNet(); N.mode = 'solo'; N.players = [{ id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length], skin: skinOf() }]; pickMap(id => { N.pick = id; beginGame(); }); }
  else if (go === 'match') { if (needLogin()) return; startMatch(); }
  else if (go === 'shop') { paintShop(); show('sShop'); }
  else if (go === 'host') { if (needLogin()) return; startHost(); }
  else if (go === 'join') { if (needLogin()) return; $('joinMsg').textContent = ''; $('joinCode').value = ''; show('sJoin'); setTimeout(() => $('joinCode').focus(), 50); }
  else if (go === 'help') { $('wl').innerHTML = WEP_IDS.map(k => { const w = WEAPONS[k]; return '<div><b>' + w.name + '</b><small>' + ({ melee: '가까이 휘둘러요', shot: '멀리 쏴요', spray: '뿌리는 동안 뒤로 밀려요', rocket: '터지면 주변이 다 날아가요' })[w.kind] + ' · ' + w.uses + '번</small></div>'; }).join(''); show('sHelp'); }
  else if (go === 'notes') { loadNotes(); show('sNotes'); }
  else if (go === 'opt') {
    const on = !OPT;
    if (window.FFPerf) { try { FFPerf.set({ low: on, fx: on ? 'low' : 'high', fps: on ? 30 : 0 }); } catch (e) { } }   // 사이트 설정과 같은 값
    else { SAVE.opt = on ? 1 : 0; save(); }
    perfRead(); homeMsg(on ? '최적화를 켰어요. 화질과 효과를 줄여 더 부드럽게 해요.' : '최적화를 껐어요.');
  }
  else if (go === 'site') location.href = '../../';
}
/* 꾸미기 */
function paintShop() {
  $('gcNow').textContent = '내 gC ' + SAVE.gc;
  const ids = ['', ...Object.keys(SKINS)], box = $('skinList'); box.innerHTML = '';
  for (const id of ids) {
    const own = id === '' || SAVE.skins.own.includes(id), on = (SAVE.skins.on || '') === id, cost = id ? SKINS[id].cost : 0;
    const d = document.createElement('div'); d.className = 'sk' + (on ? ' on' : '');
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false; cx.translate(8, 8); cx.fillStyle = 'rgba(255,255,255,.06)'; cx.fillRect(-8, -8, 32, 32);
    drawRacer(cx, { x: 3, y: 4, vx: 0, face: 1, ground: true, anim: 0, inv: 0, stun: 0, flash: 0, wep: null, swing: 0, aim: 0, col: COLORS[SAVE.col % COLORS.length], slot: SAVE.col | 0, skin: id }, 0, false);
    d.appendChild(cv); const nm = document.createElement('div'); nm.textContent = id ? SKINS[id].name : '기본'; d.appendChild(nm);
    const b = document.createElement('button'); b.className = 'btn' + (own && !on ? ' go' : '');
    if (on) { b.textContent = '입고 있어요'; b.disabled = true; }
    else if (own) { b.textContent = '입기'; b.onclick = () => { SAVE.skins.on = id; save(); paintShop(); }; }
    else { b.textContent = cost + ' gC'; b.disabled = SAVE.gc < cost; b.onclick = () => { if (SAVE.gc < cost) return; SAVE.gc -= cost; SAVE.skins.own.push(id); SAVE.skins.on = id; save(); SFX.unlock(); paintShop(); }; }
    d.appendChild(b); box.appendChild(d);
  }
}
/* 허브 코인 → gC: 허브에서 바꾼 코인을 로그인할 때 한 번씩 받아 와요 (1코인 = 20gC) */
async function claimGC() {
  try {
    const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u) return;
    const r = await sb.rpc('ff_coin_claim', { p_game: 'gatecrash' }), n = r && r.data | 0; if (!n || r.error) return;
    SAVE.gc += n; save(); homeMsg('허브 코인에서 바꾼 gC ' + n + '을 받았어요.');
  } catch (e) { }
}
let NOTES = null;
function loadNotes() { if (NOTES) return renderNotes(); fetch('patchnotes.json?v=' + BUILD).then(r => r.json()).then(d => { NOTES = d; renderNotes(); }, () => { $('notesBox').textContent = '패치노트를 불러오지 못했어요.'; }); }
function renderNotes() {
  const raw = (NOTES && NOTES.notes) || [], list = window.FFPN ? FFPN.filter(raw) : raw, box = $('notesBox');
  if (window.FFPN) { FFPN.mount('notesBox', renderNotes); FFPN.count(list.length); }
  box.innerHTML = list.map(n => '<h3>' + n.build + ' · ' + n.title + ' <span class="note">' + n.date + '</span></h3><ul>' + n.items.map(i => '<li>' + i + '</li>').join('') + '</ul>').join('');
}

/* ---------- 방 / 네트워크 ---------- */
const N = { mode: '', peer: null, conns: [], players: [], map: 'office', code: '', mg: 0, host: null, G: null, me: UID, gen: 0 };
function peerOpts() {
  const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] } };
  const ps = qs.get('ps'); if (ps) { const m = ps.match(/^([^:\/]+)(?::(\d+))?(\/.*)?$/); if (m) { o.host = m[1]; o.port = +(m[2] || 443); o.path = m[3] || '/'; o.secure = location.protocol === 'https:'; } }
  return o;
}
function leaveNet() {
  N.gen++; N.mg++; try { N.peer && N.peer.destroy(); } catch (e) { } N.peer = null; N.conns = []; N.host = null; N.mode = ''; N.pub = false; N.G = null; N.code = ''; clearTimeout(N.autoT);
  try { if (window.FFAuth && FFAuth.setRoom) FFAuth.setRoom(null); } catch (e) { }
}
function send(c, m) { try { c.open && c.send(m); } catch (e) { } }
function bcast(m) { N.conns.forEach(c => send(c, m)); }
function rcode() { let s = ''; for (let i = 0; i < 5; i++) s += CODE_CH[(Math.random() * CODE_CH.length) | 0]; return s; }
function usedCols() { return N.players.map(p => p.col); }
function pickCol(want) { return COLORS.includes(want) && !usedCols().includes(want) ? want : COLORS.find(c => !usedCols().includes(c)); }

function openRoom() {
  show('sRoom');
  const host = N.mode === 'solo' || N.mode === 'host';
  $('roomTitle').textContent = N.mode === 'solo' ? '봇과 연습' : N.pub ? '온라인 대전' : '친구와 대결';
  $('roomSub').textContent = (N.mode === 'host' || N.pub) && N.code ? (N.pub ? '누구든 시작을 누르면 빈자리를 봇이 채워 시작해요' : '방 코드 ' + N.code + ' · 친구는 로비의 "코드로 입장"에 이 코드를 입력해요') : '';
  $('startBtn').style.display = host || N.pub ? '' : 'none'; 
  paintSlots();
}
function paintSlots() {
  let h = ''; for (let i = 0; i < MAXP; i++) { const p = N.players[i]; h += p ? '<div class="slot' + (p.aid ? ' pn' : '') + '"' + (p.aid ? ' data-aid="' + esc(p.aid) + '"' : '') + '><i style="background:' + p.col + '"></i><b>' + esc(p.name) + '</b></div>' : '<div class="slot empty"><i style="background:#555"></i>비어 있음 (봇)</div>'; }
  $('slots').innerHTML = h;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.slot.pn'); if (t) openProf(t.dataset.aid); });
function pushRoom() { if (N.mode === 'host') bcast({ t: 'room', players: N.players }); }
$('startBtn').onclick = () => { if (N.mode === 'solo' || N.mode === 'host') beginGame(); else if (N.mode === 'guest' && N.pub) send(N.host, { t: 'go' }); };

function hostHandlers(p) {
  p.on('connection', c => {
    c.on('data', d => {
      if (!d) return;
      if (d.t === 'hello') {
        if (d.v !== VERSION) { send(c, { t: 'no', why: '버전이 달라요 (v' + VERSION + ')' }); setTimeout(() => c.close(), 300); return; }
        if (N.G || N.players.length >= MAXP) { send(c, { t: 'no', why: '가득 찼거나 이미 시작했어요' }); setTimeout(() => c.close(), 300); return; }
        const pl = { id: d.id, aid: /^[0-9a-f-]{36}$/i.test(String(d.aid || '')) ? String(d.aid) : '', name: String(d.name || '손님').slice(0, 15), col: pickCol(d.col), skin: SKINS[d.skin] ? d.skin : '' }; c.gid = d.id; N.players.push(pl); N.conns.push(c);
        send(c, { t: 'welcome', id: d.id, players: N.players }); pushRoom(); paintSlots();
      } else if (d.t === 'go') { if (N.pub && !N.G && N.mode === 'host') beginGame();
      } else if (d.t === 'i') { N.inputs[c.gid] = Object.assign(N.inputs[c.gid] || {}, d.i, { jp: (N.inputs[c.gid] || {}).jp || d.i.jp, swap: (N.inputs[c.gid] || {}).swap || d.i.swap, emo: d.i.emo || (N.inputs[c.gid] || {}).emo }); }
    });
    const drop = () => { N.conns = N.conns.filter(x => x !== c); if (!N.G) { N.players = N.players.filter(p => p.id !== c.gid); pushRoom(); if (scr === 'sRoom') paintSlots(); } else { const r = N.G.racers.find(r => r.id === c.gid); if (r) { r.bot = true; r.ai = { plan: null, stuck: 0, best: Infinity, wait: 0, noise: .3, aimT: 0, react: .35 }; } } };
    c.on('close', drop); c.on('error', drop);
  });
  p.on('disconnected', () => { if (N.peer === p && !p.destroyed) setTimeout(() => { if (N.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
}
N.inputs = {};
function startHost() {
  leaveNet(); const gen = N.gen; N.mode = 'host'; N.pub = false; N.code = rcode(); N.players = [{ id: UID, aid: myAid(), name: myName(), col: COLORS[SAVE.col % COLORS.length], skin: skinOf() }];
  homeMsg('방을 만드는 중이에요'); const p = new Peer(PREFIX + N.code, peerOpts()); N.peer = p; hostHandlers(p);
  p.on('open', () => { if (N.gen !== gen) return; homeMsg(''); try { FFAuth.setRoom && FFAuth.setRoom({ game: 'gatecrash', code: N.code, path: 'prototypes/gatecrash/index.html' }); } catch (e) { } openRoom(); });
  p.on('error', e => { if (N.gen !== gen) return; if (e.type === 'unavailable-id') startHost(); else { leaveNet(); show('sLobby'); homeMsg('연결하지 못했어요. 잠시 뒤에 다시 해 봐요.'); } });
}
function startGuest(code) {
  leaveNet(); const gen = N.gen; N.mode = 'guest'; homeMsg('방에 들어가는 중이에요');
  const p = new Peer(peerOpts()); N.peer = p; let done = false;
  const fail = t => { if (done || N.gen !== gen) return; done = true; leaveNet(); show('sLobby'); homeMsg(t); };
  p.on('error', () => fail('방을 찾지 못했어요.'));
  p.on('open', () => {
    const c = p.connect(PREFIX + code, { reliable: false }); N.host = c; setTimeout(() => { if (!c.open) fail('방을 찾지 못했어요.'); }, 6000);
    c.on('open', () => send(c, { t: 'hello', v: VERSION, id: UID, aid: myAid(), name: myName(), col: COLORS[SAVE.col % COLORS.length], skin: skinOf() }));
    c.on('data', d => guestMsg(d, fail, () => { done = true; })); c.on('close', () => { if (!done || N.mode === 'guest') { if (N.G) { endToLobby('연결이 끊겼어요.'); } else fail('방과 연결이 끊겼어요.'); } });
  });
}
function doJoin() {
  const c = $('joinCode').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (c.length !== 5) { $('joinMsg').textContent = '방 코드는 5글자예요.'; return; }
  startGuest(c);
}
$('joinBtn').onclick = doJoin; $('joinCode').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') doJoin(); });
function endToLobby(msg) {
  BGM.play('top-of-the-leaderboard'); leaveNet(); show('sLobby'); paintWho(); homeMsg(msg || ''); }
function guestMsg(d, fail, ok) {
  if (!d) return;
  if (d.t === 'no') fail(d.why);
  else if (d.t === 'welcome') { ok(); homeMsg(''); N.players = d.players; N.code = 'guest'; openRoom(); }
  else if (d.t === 'room') { N.players = d.players; if (scr === 'sRoom') openRoom(); }
  else if (d.t === 'start') { playGame(d.map, d.pl); }
  else if (d.t === 's' && N.G) applySnap(d);
}
/* 온라인 대전: 열려 있는 빠른 방을 찾아 들어가고, 없으면 내가 방을 열어요 */
function startMatch() {
  leaveNet(); const gen = N.gen; homeMsg('상대를 찾는 중이에요'); let n = 1;
  const tryJoin = () => {
    if (N.gen !== gen) return;
    if (n > 3) { openQuick(gen, 1); return; }
    const p = new Peer(peerOpts()); N.peer = p; let ended = false;
    const next = () => { if (ended) return; ended = true; try { p.destroy(); } catch (e) { } n++; tryJoin(); };
    p.on('error', next);
    p.on('open', () => {
      const c = p.connect(PREFIX + 'q' + n, { reliable: false }); N.host = c; N.mode = 'guest'; N.pub = true; const to = setTimeout(next, 3500);
      c.on('open', () => { clearTimeout(to); send(c, { t: 'hello', v: VERSION, id: UID, aid: myAid(), name: myName(), col: COLORS[SAVE.col % COLORS.length], skin: skinOf() }); });
      c.on('data', d => { if (d && d.t === 'no') { clearTimeout(to); next(); } else if (d && d.t === 'welcome') { ended = true; homeMsg(''); guestMsg(d, () => { }, () => { }); } else guestMsg(d, () => { }, () => { }); });
      c.on('close', () => { if (ended) { if (N.G) endToLobby('연결이 끊겼어요.'); } else next(); });
    });
  };
  tryJoin();
}
function openQuick(gen, k) {
  k = k || 1; if (N.gen !== gen) return; if (k > 3) { leaveNet(); show('sLobby'); homeMsg('빈 방을 만들지 못했어요. 잠시 뒤에 다시 해 봐요.'); return; }
  try { N.peer && N.peer.destroy(); } catch (e) { }
  N.mode = 'host'; N.pub = true; N.code = 'q' + k; N.players = [{ id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length], skin: skinOf() }]; N.conns = []; N.host = null;
  const p = new Peer(PREFIX + 'q' + k, peerOpts()); N.peer = p; hostHandlers(p);
  p.on('open', () => { if (N.gen !== gen) return; homeMsg(''); openRoom(); });
  p.on('error', e => { if (N.gen !== gen) return; if (e.type === 'unavailable-id') openQuick(gen, k + 1); else { leaveNet(); show('sLobby'); homeMsg('연결하지 못했어요.'); } });
}

/* ---------- 경기 ---------- */
let G = null, myId = UID, cam = { x: 0, y: 0 }, view = { x: 0, y: 0 }, baked = null, t0 = 0, fx = [], acc = 0, last = 0, sendT = 0, snapT = 0;
const keys = {}, mouse = { x: 0, y: 0, down: false }, pend = { jp: false, swap: false, emo: 0 };
function beginGame() {
  clearTimeout(N.autoT); if (N.mode !== 'solo' && N.mode !== 'host') return;
  const map = N.mode === 'solo' && N.pick ? N.pick : MAP_IDS[(Math.random() * MAP_IDS.length) | 0], pl = N.players.map(p => ({ id: p.id, name: p.name, col: p.col, skin: p.skin || '', bot: false }));
  const names = ['토끼', '여우', '고양이', '펭귄', '곰'];
  while (pl.length < MAXP) { const c = COLORS.find(c => !pl.some(p => p.col === c)); pl.push({ id: 'bot' + pl.length, name: '봇 ' + names[pl.length], col: c, bot: true }); }
  bcast({ t: 'start', map, pl }); playGame(map, pl);
}
function playGame(map, pl) {
  N.G = G = newGame(map, pl.map((p, i) => ({ id: p.id, name: p.name, col: p.col, skin: SKINS[p.skin] ? p.skin : '', bot: p.bot, own: p.id === UID })));
    baked = bakeWorld(G.W); fx = []; REC.length = 0; RP = null; recT = 0; N.inputs = {}; last = performance.now(); acc = 0; PHOTO.url = ''; PHOTO.tried = false; $('res').classList.remove('on'); const og = $('resGc'); if (og) og.remove();
  const me = G.racers.find(r => r.id === UID); cam.x = me ? me.x : 0; cam.y = me ? me.y : 0; snapT = 0;
  $('hint').style.visibility = ''; $('hint').textContent = 'A D 이동 · W/Space 점프 · 클릭 무기 · F 바꾸기';
  show('game'); BGM.play('pixel-sprint'); loop.on = true; requestAnimationFrame(loop);
}
/* 한 판을 끝까지 마치고(결과 화면에서) 로비로 돌아올 때만 한 번 허브 퀘스트에 알려요 */
async function ffMatchDone() {
  try { const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u || !(await ffProfile())) return; FFProfile.matchDone(sb, 'gatecrash'); } catch (e) { }
}
$('resBack').onclick = () => { loop.on = false; ffMatchDone(); endToLobby(); };
$('exitBtn').onclick = () => { loop.on = false; RP = null; $('res').classList.remove('on'); endToLobby(); };

document.addEventListener('pointerdown', () => { SFX.unlock(); if (scr !== 'game' && !document.getElementById('intro')) BGM.play('top-of-the-leaderboard'); });
window.GCIntroDone = () => { if (scr !== 'game') BGM.play('top-of-the-leaderboard'); };
addEventListener('keydown', e => {
  if (scr !== 'game') return; const k = e.key.toLowerCase();
  if (e.repeat) { if (['a', 'd', 'w', ' ', 'f'].includes(k)) e.preventDefault(); return; }
  if (k === 'a' || k === 'd') keys[k] = true;
  if (k === 'w' || k === ' ') { keys.j = true; pend.jp = true; e.preventDefault(); }
  if (k === 'f') pend.swap = true;
});
addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (k === 'a' || k === 'd') keys[k] = false; if (k === 'w' || k === ' ') keys.j = false; });
addEventListener('blur', () => { keys.a = keys.d = keys.j = false; mouse.down = false; });
const gl = $('gl');
gl.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
gl.addEventListener('mousedown', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.down = true; });
addEventListener('mouseup', () => { mouse.down = false; });
gl.addEventListener('contextmenu', e => e.preventDefault());
/* 모바일: 화면을 누르면 그쪽으로 조준해 쏘고, 버튼으로 이동·점프·교체해요 */
const TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (matchMedia && matchMedia('(pointer:coarse)').matches);
if (TOUCH) {
  document.body.classList.add('touch');
  let aimId = null;
  gl.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; e.preventDefault(); aimId = e.pointerId; mouse.x = e.clientX; mouse.y = e.clientY; mouse.down = true; });
  gl.addEventListener('pointermove', e => { if (e.pointerId === aimId) { mouse.x = e.clientX; mouse.y = e.clientY; } });
  const upA = e => { if (e.pointerId === aimId) { aimId = null; mouse.down = false; } };
  gl.addEventListener('pointerup', upA); gl.addEventListener('pointercancel', upA);
  const hold = (id, on, off) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); SFX.unlock(); try { b.setPointerCapture(e.pointerId); } catch (_) { } b.classList.add('on'); on(); });
    const up = e => { b.classList.remove('on'); off && off(); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); b.addEventListener('contextmenu', e => e.preventDefault()); };
  hold('tL', () => { keys.a = true; }, () => { keys.a = false; });
  hold('tR', () => { keys.d = true; }, () => { keys.d = false; });
  hold('tJ', () => { keys.j = true; pend.jp = true; }, () => { keys.j = false; });
  hold('tF', () => { pend.swap = true; });
}

/* 이모티콘 버튼 */
(function () {
  const box = $('emo'); if (!box) return;
  for (let i = 1; i <= 4; i++) { const b = document.createElement('button'); b.className = 'eb'; const c = document.createElement('canvas'); c.width = 11; c.height = 11; b.appendChild(c); drawEmoPix(c.getContext('2d'), i); b.title = EMO_NAMES[i];
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); pend.emo = i; }); box.appendChild(b); }
})();
function myInput() {
  const sc = gl.clientHeight / VH, me = G.racers.find(r => r.id === UID), meG = me;
  const wx = view.x + mouse.x / sc, wy = view.y + mouse.y / sc;
  const aim = me ? Math.atan2(wy - (me.y + 8), wx - (me.x + 5)) : 0;
  const inp = { d: (keys.d ? 1 : 0) - (keys.a ? 1 : 0), jp: pend.jp || (!!keys.j && !!meG && meG.ground), j: !!keys.j, atk: mouse.down, aim, swap: pend.swap, emo: pend.emo | 0 };
  return inp;
}
function snapshot() {
  return { t: 's', ph: G.phase, tt: G.t, ck: G.clock, rk: G.rank,
    r: G.racers.map(r => [r.id, +r.x.toFixed(1), +r.y.toFixed(1), +r.vx.toFixed(0), +r.vy.toFixed(0), r.hp | 0, r.wep ? r.wep.k : '', r.face, +r.aim.toFixed(2), r.swing > 0 ? 1 : 0, r.fin ? 1 : 0, r.inv > 0 ? 1 : 0, r.flash > 0 ? 1 : 0, r.stun > 0 ? 1 : 0, r.ground ? 1 : 0, r.ko, r.prog.toFixed(1), r.emoT > 0 ? r.emo : 0]),
    it: G.items.map(i => [i.on ? 1 : 0, i.k]), sh: G.shots.map(s => [s.k, +s.x.toFixed(0), +s.y.toFixed(0), +s.vx.toFixed(0), +s.vy.toFixed(0)]), tr: G.traps.map(t => [Math.round(t.x), Math.round(t.y)]), ev: G.ev };
}
function applySnap(d) {
  if (d.ph === 'count' && d.tt <= 3 && Math.ceil(d.tt) !== Math.ceil(G.t)) SFX.beep();
  G.phase = d.ph; G.t = d.tt; G.clock = d.ck; G.rank = d.rk;
  for (const a of d.r) {
    const r = G.racers.find(r => r.id === a[0]); if (!r) continue;
    if (r.id === UID) { a[8] = r.aim; a[7] = r.face; const dx = a[1] - r.x, dy = a[2] - r.y; if (Math.hypot(dx, dy) > 40) { r.x = a[1]; r.y = a[2]; } else { r.x += dx * .12; r.y += dy * .12; } }
    else { r.tx = a[1]; r.ty = a[2]; if (Math.hypot(a[1] - r.x, a[2] - r.y) > 60) { r.x = a[1]; r.y = a[2]; } }
    if (r.id !== UID || G.phase !== 'race') { r.vx = a[3]; r.vy = a[4]; } r.hp = a[5]; r.wep = a[6] ? { k: a[6], u: 1 } : null; r.face = a[7]; r.aim = a[8]; r.swing = a[9] ? .1 : 0; r.fin = !!a[10]; r.inv = a[11] ? 1 : 0; r.flash = a[12] ? .1 : 0; r.stun = a[13] ? .1 : 0; r.ground = !!a[14]; r.ko = a[15]; r.prog = +a[16]; r.emo = a[17] | 0; r.emoT = r.emo ? 1 : 0;
  }
  d.it.forEach((a, i) => { if (G.items[i]) { G.items[i].on = !!a[0]; G.items[i].k = a[1]; } });
  G.traps = (d.tr || []).map(a => ({ x: a[0], y: a[1], t: 1 }));
  evUpdate(G.W, G.clock, G.phase); liftCap(G);
  G.shots = d.sh.map(a => ({ k: a[0], x: a[1], y: a[2], vx: a[3], vy: a[4], t: 1 }));
  G.ev.push(...d.ev);
}
function loop(now) {
  if (!loop.on || !G) return; requestAnimationFrame(loop);
  if (FPSCAP && now - last < 1000 / FPSCAP - 3) return;      // 최적화: 프레임 제한 (게임 속도는 그대로)
  const raw = now - last, dt = Math.min(0.05, raw / 1000); last = now; acc += dt; lowHintTick(raw);
  const guest = N.mode === 'guest', inp = myInput();
  if (!guest) {
    const oi = N.inputs[UID] || {};
    N.inputs[UID] = Object.assign(oi, inp, { jp: inp.jp || oi.jp, swap: inp.swap || oi.swap, emo: inp.emo || oi.emo });
    let ran = false;
    while (acc >= 1 / 60) {
      acc -= 1 / 60; for (const r of G.racers) { r.px = r.x; r.py = r.y; } const pc = G.phase, pt = Math.ceil(G.t); stepGame(G, 1 / 60, N.inputs); ran = true;
      for (const k in N.inputs) { N.inputs[k].jp = false; N.inputs[k].swap = false; N.inputs[k].emo = 0; }
      if (G.phase === 'count' && G.t <= 3 && Math.ceil(G.t) !== pt) SFX.beep();
    }
    if (ran) { pend.jp = false; pend.swap = false; pend.emo = 0; N.inputs[UID].jp = false; N.inputs[UID].swap = false; N.inputs[UID].emo = 0; }
    if (N.conns.length) { snapT += dt; if (snapT >= SNAP) { snapT = 0; bcast(snapshot()); G.ev.length = 0; } }
  } else {
    const me = G.racers.find(r => r.id === UID);
    if (me && me.wep) { me.aim = inp.aim; me.face = Math.cos(inp.aim) >= 0 ? 1 : -1; }
    sendT += dt; if (sendT > 1 / 30) { sendT = 0; send(N.host, { t: 'i', i: inp }); pend.jp = false; pend.swap = false; pend.emo = 0; }
    // 내 캐릭터는 바로 움직여요 (서버 위치로 조금씩 맞춰요)
    while (acc >= 1 / 60) { acc -= 1 / 60; if (me) { me.px = me.x; me.py = me.y; } if (me && G.phase === 'race' && !me.fin && me.stun <= 0) { const own = Object.assign({}, inp, { jp: inp.jp || pend.jp }); if (stepBody(G.W, me, own, 1 / 60)) { addFx({ t: 'jump', x: me.x + 5, y: me.y + 22, id: UID, local: 1 }); } } }
    for (const r of G.racers) if (r !== me && r.tx !== undefined) { r.x += (r.tx - r.x) * Math.min(1, dt * 14); r.y += (r.ty - r.y) * Math.min(1, dt * 14); }
    evUpdate(G.W, G.clock, G.phase); liftCap(G);
  }
  ialpha = Math.min(1, acc * 60);
  for (const e of G.ev) addFx(e); G.ev.length = 0;
  fx = fx.filter(f => (f.age += dt) < f.life);
  if (guest && G.phase === 'end') { /* 결과는 호스트 신호로 */ }
  recFrame(dt);
  if (G.phase === 'end' && !PHOTO.url && !PHOTO.tried) { PHOTO.tried = true; takePhoto(G); }       // 막 렌더링된 화면 = 결승선을 통과한 순간
  if (G.phase === 'end' && !RP && !$('res').classList.contains('on') && (guest || G.endT > 1.5)) startReplay();
  if (RP) { RP.t += dt; const g = replayAt(RP.t); if (!g) { RP = null; showResult(); } else render(now / 1000, g, { replay: true, focus: RP.focus }); }
  else render(now / 1000, G);
}
/* ---------- 리플레이: 지난 13초를 20번/초로 기록해 두었다가 우승자 시점으로 다시 보여 줘요 ---------- */
const REC = [], REC_HZ = 20, REC_MAX = 260; let RP = null, recT = 0;
function recFrame(dt) {
  if (G.phase !== 'race') return; recT += dt; if (recT < 1 / REC_HZ) return; recT = 0;
  REC.push({ r: G.racers.map(r => ({ id: r.id, name: r.name, col: r.col, skin: r.skin, slot: r.slot, x: r.x, y: r.y, vx: r.vx, face: r.face, aim: r.aim, swing: r.swing > 0 ? .1 : 0, wep: r.wep ? { k: r.wep.k, u: 1 } : null, hp: r.hp, fin: r.fin, inv: r.inv > 0 ? 1 : 0, flash: r.flash > 0 ? .1 : 0, stun: r.stun > 0 ? .1 : 0, ground: r.ground, anim: r.anim, prog: 1 })), it: G.items.map(i => [i.on, i.k]), sh: G.shots.map(s => ({ k: s.k, x: s.x, y: s.y, vx: s.vx, vy: s.vy })), tr: G.traps.map(t => [t.x, t.y]) });
  if (REC.length > REC_MAX) REC.shift();
}
function startReplay() { if (REC.length < 20) return; RP = { t: 0, frames: REC.slice(), focus: G.rank[0] || UID }; }
function replayAt(t) {
  const f = RP.frames, p = t * REC_HZ, i = Math.floor(p); if (i >= f.length - 1) return null;
  const a = f[i], b = f[i + 1], k = p - i, L = (u, v) => u + (v - u) * k;
  return { W: G.W, phase: 'race', t: 0, clock: 99, rank: [], ev: [], shots: a.sh, traps: (a.tr || []).map(q => ({ x: q[0], y: q[1] })), items: G.items.map((it, n) => ({ id: it.id, x: it.x, y: it.y, on: a.it[n][0], k: a.it[n][1] })),
    racers: a.r.map((r, n) => Object.assign({}, r, { x: L(r.x, b.r[n].x), y: L(r.y, b.r[n].y), anim: L(r.anim, b.r[n].anim) })) };
}
function addFx(e) {
  if (e.t === 'jump' && N.mode !== 'guest') { /* 소리는 sfx에서 */ }
  if (e.t === 'hit') fx.push({ t: 'hit', x: e.x, y: e.y, age: 0, life: .3, s: Math.random() * 6 });
  else if (e.t === 'boom') fx.push({ t: 'boom', x: e.x, y: e.y, age: 0, life: .45 });
  else if (e.t === 'ko') fx.push({ t: 'ko', x: e.x, y: e.y, age: 0, life: .6 });
  else if (e.t === 'jump') fx.push({ t: 'dust', x: e.x, y: e.y, age: 0, life: .3, dx: -1 }, { t: 'dust', x: e.x, y: e.y, age: 0, life: .3, dx: 1 });
  const me = G && G.racers.find(r => r.id === UID);
  if (e.t === 'jump' && (e.id !== UID || (N.mode === 'guest' && !e.local))) return;
  if (me && e.x !== undefined && Math.hypot(e.x - me.x, e.y - me.y) > 450) return;
  GCSfx(e);
}
let ialpha = 1;
/* 물리는 1/60초 단위라서 화면이 더 빠른 기기에서는 그 사이 위치를 이어서 그려요 */
function render(t, G, op) {
  const sv = [];
  if (!(op && op.replay)) for (const r of G.racers) if (r.px !== undefined && Math.abs(r.x - r.px) < 48 && Math.abs(r.y - r.py) < 48) { sv.push([r, r.x, r.y]); r.x = r.px + (r.x - r.px) * ialpha; r.y = r.py + (r.y - r.py) * ialpha; }
  try { render0(t, G, op); } finally { for (const q of sv) { q[0].x = q[1]; q[0].y = q[2]; } }
}
function render0(t, G, op) {
  op = op || {};
  const rdt = Math.min(.1, Math.max(0, t - (render0.lt || t))); render0.lt = t;
  const c = gl, dpr = Math.min(OPT ? 1 : 2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const sc = h / VH, vw = w / sc, me = G.racers.find(r => r.id === (op.focus || UID)) || G.racers[0];
  const tx = me.x + 5 - vw / 2, ty = me.y - VH / 2 + 30;
  if (!op.replay && G.phase === 'count' && G.t > 3) {
    // 시작 전 맵 소개: 출발점에서 목표 지점까지 부드럽게 보여 줘요
    const IT = G.W.introT, u = IT + 4.5 - G.t, F = G.W.finish, gx = (F.x0 + F.x1 + 1) / 2 * TS - vw / 2, gy = (F.y0 + F.y1) / 2 * TS - VH / 2 + 30, ez = k => k * k * (3 - 2 * k);
    const e = u < IT ? ez(u / IT) : u < IT + .5 ? 1 : 1 - ez(Math.min(1, u - IT - .5));
    cam.x = tx + (gx - tx) * e; cam.y = ty + (gy - ty) * e;
  } else if (op.replay) { cam.x += (tx - cam.x) * .1; cam.y += (ty - cam.y) * .1; }
  else { const k = 1 - Math.exp(-rdt * 7.7); cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; }
  const cx = Math.max(0, Math.min(G.W.pw - vw, cam.x)), cy = Math.max(0, Math.min(G.W.ph - VH, cam.y));
  if (!op.replay) { view.x = Math.round(cx); view.y = Math.round(cy); }
  x.setTransform(sc, 0, 0, sc, 0, 0); x.fillStyle = '#0c1220'; x.fillRect(0, 0, vw + 2, VH + 2);
  drawBackdrop(x, G.W, t, cx, cy, vw);
  x.translate(-Math.round(cx), -Math.round(cy)); x.drawImage(baked, 0, 0);
  drawItems(x, G, t); drawTraps(x, G.traps || []);
  if (G.W.wet) drawWet(x, G.W, cx, cy, vw);
  if (G.W.soonK && G.phase === 'race') drawWarn(x, G.W, t);
  if (G.W.liftOff) for (const o of G.W.objs) if (o.t === 'liftshaft') drawLiftOff(x, o);
  for (const r of G.racers) if (r !== me) drawRacer(x, r, t, false);
  drawRacer(x, me, t, true);
  if (!op.replay && me.wep && G.phase === 'race' && !me.fin) { x.fillStyle = 'rgba(255,255,255,.7)'; for (let d = 14; d < 70; d += 8) x.fillRect(me.x + 5 + Math.cos(me.aim) * d, me.y + 10 + Math.sin(me.aim) * d, 2, 2); }
  for (const r of G.racers) if (r.emoT > 0 && r.emo) drawEmo(x, r.emo, r.x + 5, r.y - 30);
  drawShots(x, G); drawFx(x, op.replay ? [] : fx);
  drawShade(x, G.W, cx, cy, vw);
  x.setTransform(1, 0, 0, 1, 0, 0); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  const S = (px, py) => [(px - Math.round(cx)) * sc, (py - Math.round(cy)) * sc], fs = Math.max(11, Math.round(sc * 4.4));
  x.font = '700 ' + fs + 'px Galmuri, sans-serif';
  for (const r of G.racers) {
    const [X, Y] = S(r.x + 5, r.y - 9), bw = 26 * sc;
    x.fillStyle = 'rgba(0,0,0,.65)'; x.fillRect(X - bw / 2 - 2, Y - 1, bw + 4, 4 * sc); x.fillStyle = r.hp > 50 ? '#6fe08a' : r.hp > 25 ? '#ffd36b' : '#ff6a5a'; x.fillRect(X - bw / 2, Y, bw * Math.max(0, r.hp) / MAX_HP, 2.4 * sc);
    x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.8)'; x.strokeText(r.name, X, Y - 4); x.fillStyle = r === me ? '#ffd36b' : '#fff'; x.fillText(r.name, X, Y - 4);
  }
  if (op.replay) {
    x.setTransform(1, 0, 0, 1, 0, 0); x.textAlign = 'left'; const fz = Math.max(16, Math.round(sc * 7));
    x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, w, fz * 1.8); x.fillStyle = '#ff6a5a'; x.font = '700 ' + fz + 'px Galmuri, sans-serif'; x.fillText('● 리플레이', fz * .6, fz * 1.25);
    $('big').textContent = ''; $('hint').style.visibility = 'hidden'; return;
  }
  x.setTransform(sc, 0, 0, sc, 0, 0); x.textAlign = 'left';
  const bw = Math.min(vw - 40, 220), bx = (vw - bw) / 2; x.fillStyle = 'rgba(8,12,24,.75)'; x.fillRect(bx - 3, 5, bw + 6, 11); x.fillStyle = '#334'; x.fillRect(bx, 9, bw, 3);
  for (const r of G.racers) { const p = r.fin ? 1 : 1 - Math.min(1, r.prog / G.W.maxDist); x.fillStyle = r.col; x.fillRect(bx + p * bw - 2, 7, 4, 7); }
  x.fillStyle = '#ffd36b'; x.fillRect(bx + bw + 4, 7, 2, 7);
  x.setTransform(1, 0, 0, 1, 0, 0);
  const pad = 8 * sc / 2.7, fs2 = Math.max(12, Math.round(sc * 5)), bw2 = 130 * sc / 2.7;
  x.fillStyle = 'rgba(8,12,24,.75)'; x.fillRect(pad, pad, bw2 + 20, fs2 * 2.6);
  x.textAlign = 'left'; x.font = '700 ' + fs2 + 'px Galmuri, sans-serif'; x.fillStyle = '#fff'; x.fillText(me.wep ? WEAPONS[me.wep.k].name + ' ' + me.wep.u : '맨손', pad + 8, pad + fs2 * 1.15);
  x.fillStyle = '#222'; x.fillRect(pad + 8, pad + fs2 * 1.5, bw2, fs2 * .5); x.fillStyle = '#6fe08a'; x.fillRect(pad + 8, pad + fs2 * 1.5, bw2 * Math.max(0, me.hp) / MAX_HP, fs2 * .5);
  const near = !me.fin && G.items.find(i => i.on && Math.abs(i.x - (me.x + 5)) < 16 && Math.abs(i.y - (me.y + 11)) < 18);
  if (near && me.wep) { x.textAlign = 'center'; x.fillStyle = '#ffd36b'; x.strokeStyle = '#000'; x.lineWidth = 3; const t2 = 'F: ' + WEAPONS[near.k].name + '(으)로 바꾸기'; x.strokeText(t2, w / 2, h - 40 * dpr); x.fillText(t2, w / 2, h - 40 * dpr); }
  const order = G.racers.slice().sort((a, b) => (a.fin ? G.rank.indexOf(a.id) - 99 : a.prog) - (b.fin ? G.rank.indexOf(b.id) - 99 : b.prog));
  const pos = order.indexOf(me) + 1, ps = Math.round(fs2 * 1.6); x.fillStyle = 'rgba(8,12,24,.75)'; x.fillRect(w - pad - ps * 2.4, pad, ps * 2.4, ps * 1.3); x.fillStyle = '#ffd36b'; x.textAlign = 'center'; x.font = '700 ' + ps + 'px Galmuri, sans-serif'; x.fillText(pos + '/' + G.racers.length, w - pad - ps * 1.2, pad + ps * 1.05);
  const evb = $('evb'); evb.textContent = G.phase === 'race' ? G.W.evMsg : ''; evb.className = G.W.evNow ? 'now' : '';
  const big = $('big');
  if (G.phase === 'count') big.textContent = G.t > 3 ? (G.t > 4 ? MAPS[G.W.id].name : '') : Math.max(1, Math.ceil(G.t)); else if (G.phase === 'race' && G.clock < .8) big.textContent = 'GO!'; else big.textContent = '';
}
/* 포토 피니시: 결승선을 통과한 순간의 화면을 사진으로 남겨요 */
const PHOTO = { url: '' };
function takePhoto(G) {
  try {
    const c = document.createElement('canvas'), w = Math.min(960, gl.width), h = Math.round(w * gl.height / gl.width); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(gl, 0, 0, w, h);
    const first = G.racers.find(r => r.id === G.rank[0]), fs = Math.round(h * .05);
    x.fillStyle = 'rgba(8,12,24,.7)'; x.fillRect(0, h - fs * 1.9, w, fs * 1.9); x.fillStyle = '#ffd36b'; x.font = '700 ' + fs + 'px Galmuri, sans-serif'; x.textAlign = 'left'; x.fillText('GATECRASH · ' + MAPS[G.W.id].name, fs * .6, h - fs * .6);
    x.textAlign = 'right'; x.fillStyle = '#fff'; x.fillText((first ? first.name : '') + ' 1등', w - fs * .6, h - fs * .6);
    PHOTO.url = c.toDataURL('image/jpeg', .85);
  } catch (e) { PHOTO.url = ''; }
}
function showResult() {
  if ($('res').classList.contains('on')) return;
  const og = $('resGc'); if (og) og.remove(); const op = $('resPh'); if (op) op.remove();
  const list = G.rank.map(id => G.racers.find(r => r.id === id)).filter(Boolean);
  for (const r of G.racers.slice().sort((a, b) => a.prog - b.prog)) if (!list.includes(r)) list.push(r);
  const me = list.findIndex(r => r.id === UID);
  BGM.duck(.35); if (me === 0) SFX.win();
  $('resT').textContent = me === 0 ? '1등!' : (me + 1) + '등'; $('resL').innerHTML = list.map(r => '<li style="color:' + r.col + '">' + esc(r.name) + '</li>').join('');
  let prize = 0;
  if (me >= 0 && !G.paid) { G.paid = true; if (N.mode !== 'solo') { prize = GC_PRIZE[Math.min(me, GC_PRIZE.length - 1)]; SAVE.gc += prize; save(); } }
  if (prize) $('resL').insertAdjacentHTML('afterend', '<div class="note" id="resGc">+' + prize + ' gC (지금 ' + SAVE.gc + ' gC)</div>');
  if (PHOTO.url) $('resL').insertAdjacentHTML('beforebegin', '<div id="resPh"><img alt="결승선 사진" src="' + PHOTO.url + '" style="max-width:100%;border-radius:6px;display:block;margin-bottom:8px"><a class="btn" download="gatecrash-finish.jpg" href="' + PHOTO.url + '" style="display:inline-block;margin-bottom:10px">사진 저장</a></div>');
  $('res').classList.add('on');
}
// 로비 배경: 인트로와 같은 공항 레이스 장면
(function () {
  const c = $('bgv'), x = c.getContext('2d'); let T = 0, last = 0;
  function f(now) {
    if (scr === 'sLobby' && !document.getElementById('intro')) {
      const dpr = Math.min(OPT ? 1 : 2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      T += Math.min(.05, (now - last) / 1000 || .016);
      const sc = h / VH; x.setTransform(sc, 0, 0, sc, 0, 0); x.imageSmoothingEnabled = false;
      GCScene(x, w / sc, T % 6, T * 150);
      x.fillStyle = 'rgba(8,12,28,.32)'; x.fillRect(0, 0, w / sc + 2, VH + 2);
    }
    last = now; requestAnimationFrame(f);
  } requestAnimationFrame(f);
})();
// 초대 링크
FFAuthJoin();
function FFAuthJoin() {
  const c = (qs.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); if (c.length !== 5) return;
  const go = () => { if (needLogin()) return; startGuest(c); };
  if (window.FFAuth) FFAuth.ready.then(go); else go();
}
if (qs.get('test')) { if (qs.get('auto') === 'solo') { setTimeout(() => { menu('solo'); setTimeout(beginGame, 200); }, 300); } }

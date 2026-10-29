/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0 */
'use strict';
const $ = id => document.getElementById(id), qs = new URLSearchParams(location.search);
const PREFIX = 'ff-gatecrash-', CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', SNAP = 1 / 20, MAXP = 4;
$('ver').textContent = 'v' + VERSION + ' · b' + BUILD;
const SAVE = (() => { try { return JSON.parse(localStorage.getItem('gatecrash.save') || '{}'); } catch (e) { return {}; } })();
function save() { try { localStorage.setItem('gatecrash.save', JSON.stringify(SAVE)); } catch (e) { } }
if (!SAVE.uid) { SAVE.uid = Math.random().toString(36).slice(2, 10); SAVE.col = (Math.random() * COLORS.length) | 0; save(); }
const UID = SAVE.uid;

/* ---------- 모달 (브라우저 팝업 대신) ---------- */
function say(t) { $('modalT').textContent = t; $('modal').classList.add('on'); }
$('modalOk').onclick = () => $('modal').classList.remove('on');

/* ---------- 계정 / 프로필 ---------- */
function loggedIn() { try { return !!(window.FFAuth && FFAuth.user()); } catch (e) { return false; } }
function myName() { try { const n = window.FFAuth && FFAuth.user() && FFAuth.nickname(); if (n) return String(n).slice(0, 15); } catch (e) { } return '손님'; }
function paintWho() {
  const w = $('who'); w.innerHTML = '';
  const s = document.createElement('span'); s.textContent = loggedIn() ? myName() : '로그인 안 함'; w.appendChild(s);
  if (!loggedIn() && window.FFAuth) { const b = document.createElement('button'); b.textContent = '로그인'; b.onclick = () => { try { FFAuth.openLogin(); } catch (e) { } }; w.appendChild(b); }
  const sl = document.createElement('span'); sl.setAttribute('data-ff-account', ''); sl.style.marginLeft = '10px'; w.appendChild(sl);
  try { if (window.FFAuth && FFAuth.refresh) FFAuth.refresh(); } catch (e) { }
}
let ffMarked = '';
function ffProfile() {
  if (window.FFProfile) return Promise.resolve(true);
  return new Promise(res => { const s = document.createElement('script'); s.src = 'https://frenchfries777mc.github.io/games/ff-profile.js?v=20261029b'; s.onload = () => res(!!window.FFProfile); s.onerror = () => res(false); document.head.appendChild(s); });
}
async function ffSync() {
  try {
    const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u || !(await ffProfile())) return;
    if (ffMarked !== u.id) { ffMarked = u.id; FFProfile.markPlayed(sb, 'gatecrash'); }
  } catch (e) { }
}
if (window.FFAuth) { FFAuth.ready.then(() => { paintWho(); ffSync(); }); FFAuth.onChange(() => { paintWho(); ffSync(); }); }
paintWho();
function needLogin() { if (!window.FFAuth || loggedIn()) return false; homeMsg('온라인 대전은 Frenchfries777 계정으로 로그인해야 해요.'); try { FFAuth.openLogin(); } catch (e) { } return true; }
function homeMsg(t) { $('homeMsg').textContent = t || ''; }

/* ---------- 화면 ---------- */
let scr = 'sLobby';
function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); scr = id; $('hud').classList.toggle('on', id === 'game'); }
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { if (scr === 'sRoom') leaveNet(); show('sLobby'); paintWho(); }));
document.querySelectorAll('#menu .btn').forEach(b => b.addEventListener('click', () => menu(b.dataset.go)));
function menu(go) {
  homeMsg('');
  if (go === 'solo') { leaveNet(); N.mode = 'solo'; N.players = [{ id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length] }]; openRoom(); }
  else if (go === 'match') { if (needLogin()) return; startMatch(); }
  else if (go === 'host') { if (needLogin()) return; startHost(); }
  else if (go === 'help') { $('wl').innerHTML = WEP_IDS.map(k => { const w = WEAPONS[k]; return '<div><b>' + w.name + '</b><small>' + ({ melee: '가까이 휘둘러요', shot: '멀리 쏴요', spray: '뿌리는 동안 뒤로 밀려요', rocket: '터지면 주변이 다 날아가요' })[w.kind] + ' · ' + w.uses + '번</small></div>'; }).join(''); show('sHelp'); }
  else if (go === 'notes') { loadNotes(); show('sNotes'); }
  else if (go === 'site') location.href = '../../';
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
  N.gen++; N.mg++; try { N.peer && N.peer.destroy(); } catch (e) { } N.peer = null; N.conns = []; N.host = null; N.mode = ''; N.G = null; N.code = ''; clearTimeout(N.autoT);
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
  $('roomSub').textContent = N.mode === 'host' && N.code ? (N.pub ? '곧 시작해요. 빈자리는 봇이 채워요' : '방 코드 ' + N.code + ' · 친구가 주소 끝에 ?join=' + N.code + ' 로 들어와요') : '';
  $('startBtn').style.display = host ? '' : 'none'; $('mapRow').style.display = host ? '' : 'none';
  $('maps').innerHTML = MAP_IDS.map(id => '<button class="mapc ' + (N.map === id ? 'on' : '') + '" data-m="' + id + '"><b>' + MAPS[id].name + '</b><small>' + MAPS[id].desc + '</small></button>').join('');
  $('maps').querySelectorAll('button').forEach(b => b.onclick = () => { if (!host) return; N.map = b.dataset.m; openRoom(); pushRoom(); });
  paintSlots();
}
function paintSlots() {
  let h = ''; for (let i = 0; i < MAXP; i++) { const p = N.players[i]; h += p ? '<div class="slot"><i style="background:' + p.col + '"></i><b>' + esc(p.name) + '</b></div>' : '<div class="slot empty"><i style="background:#555"></i>비어 있음 (봇)</div>'; }
  $('slots').innerHTML = h;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function pushRoom() { if (N.mode === 'host') bcast({ t: 'room', players: N.players, map: N.map }); }
$('startBtn').onclick = () => { if (N.mode === 'solo' || N.mode === 'host') beginGame(); };

function hostHandlers(p) {
  p.on('connection', c => {
    c.on('data', d => {
      if (!d) return;
      if (d.t === 'hello') {
        if (d.v !== VERSION) { send(c, { t: 'no', why: '버전이 달라요 (v' + VERSION + ')' }); setTimeout(() => c.close(), 300); return; }
        if (N.G || N.players.length >= MAXP) { send(c, { t: 'no', why: '가득 찼거나 이미 시작했어요' }); setTimeout(() => c.close(), 300); return; }
        const pl = { id: d.id, name: String(d.name || '손님').slice(0, 15), col: pickCol(d.col) }; c.gid = d.id; N.players.push(pl); N.conns.push(c);
        send(c, { t: 'welcome', id: d.id, players: N.players, map: N.map }); pushRoom(); paintSlots();
      } else if (d.t === 'i') { N.inputs[c.gid] = Object.assign(N.inputs[c.gid] || {}, d.i, { jp: (N.inputs[c.gid] || {}).jp || d.i.jp, swap: (N.inputs[c.gid] || {}).swap || d.i.swap }); }
    });
    const drop = () => { N.conns = N.conns.filter(x => x !== c); if (!N.G) { N.players = N.players.filter(p => p.id !== c.gid); pushRoom(); if (scr === 'sRoom') paintSlots(); } else { const r = N.G.racers.find(r => r.id === c.gid); if (r) { r.bot = true; r.ai = { plan: null, stuck: 0, best: Infinity, wait: 0, noise: .3, aimT: 0, react: .35 }; } } };
    c.on('close', drop); c.on('error', drop);
  });
  p.on('disconnected', () => { if (N.peer === p && !p.destroyed) setTimeout(() => { if (N.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
}
N.inputs = {};
function startHost() {
  leaveNet(); const gen = N.gen; N.mode = 'host'; N.pub = false; N.code = rcode(); N.players = [{ id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length] }];
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
    c.on('open', () => send(c, { t: 'hello', v: VERSION, id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length] }));
    c.on('data', d => guestMsg(d, fail, () => { done = true; })); c.on('close', () => { if (!done || N.mode === 'guest') { if (N.G) { endToLobby('방장과 연결이 끊겼어요.'); } else fail('방과 연결이 끊겼어요.'); } });
  });
}
function endToLobby(msg) { leaveNet(); show('sLobby'); paintWho(); homeMsg(msg || ''); }
function guestMsg(d, fail, ok) {
  if (!d) return;
  if (d.t === 'no') fail(d.why);
  else if (d.t === 'welcome') { ok(); homeMsg(''); N.players = d.players; N.map = d.map; N.code = 'guest'; openRoom(); }
  else if (d.t === 'room') { N.players = d.players; N.map = d.map; if (scr === 'sRoom') openRoom(); }
  else if (d.t === 'start') { playGame(d.map, d.pl); }
  else if (d.t === 's' && N.G) applySnap(d);
}
/* 온라인 대전: 열려 있는 빠른 방을 찾아 들어가고, 없으면 내가 방을 열어요 */
function startMatch() {
  leaveNet(); const gen = N.gen; homeMsg('상대를 찾는 중이에요'); let n = 1;
  const tryJoin = () => {
    if (N.gen !== gen) return;
    if (n > 3) { openQuick(gen); return; }
    const p = new Peer(peerOpts()); N.peer = p; let ended = false;
    const next = () => { if (ended) return; ended = true; try { p.destroy(); } catch (e) { } n++; tryJoin(); };
    p.on('error', next);
    p.on('open', () => {
      const c = p.connect(PREFIX + 'q' + n, { reliable: false }); N.host = c; N.mode = 'guest'; const to = setTimeout(next, 3500);
      c.on('open', () => { clearTimeout(to); send(c, { t: 'hello', v: VERSION, id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length] }); });
      c.on('data', d => { if (d && d.t === 'no') { clearTimeout(to); next(); } else if (d && d.t === 'welcome') { ended = true; homeMsg(''); guestMsg(d, () => { }, () => { }); } else guestMsg(d, () => { }, () => { }); });
      c.on('close', () => { if (ended) { if (N.G) endToLobby('방장과 연결이 끊겼어요.'); } else next(); });
    });
  };
  tryJoin();
}
function openQuick(gen, k) {
  k = k || 1; if (N.gen !== gen) return; if (k > 3) { leaveNet(); show('sLobby'); homeMsg('빈 방을 만들지 못했어요. 잠시 뒤에 다시 해 봐요.'); return; }
  try { N.peer && N.peer.destroy(); } catch (e) { }
  N.mode = 'host'; N.pub = true; N.code = 'q' + k; N.players = [{ id: UID, name: myName(), col: COLORS[SAVE.col % COLORS.length] }]; N.conns = []; N.host = null;
  const p = new Peer(PREFIX + 'q' + k, peerOpts()); N.peer = p; hostHandlers(p);
  p.on('open', () => { if (N.gen !== gen) return; homeMsg(''); openRoom(); let s = 14; const tick = () => { if (N.gen !== gen || N.G) return; $('roomMsg').textContent = s + '초 뒤 시작해요'; if (s-- <= 0) beginGame(); else N.autoT = setTimeout(tick, 1000); }; tick(); });
  p.on('error', e => { if (N.gen !== gen) return; if (e.type === 'unavailable-id') openQuick(gen, k + 1); else { leaveNet(); show('sLobby'); homeMsg('연결하지 못했어요.'); } });
}

/* ---------- 경기 ---------- */
let G = null, myId = UID, cam = { x: 0, y: 0 }, baked = null, t0 = 0, fx = [], acc = 0, last = 0, sendT = 0, snapT = 0;
const keys = {}, mouse = { x: 0, y: 0, down: false }, pend = { jp: false, swap: false };
function beginGame() {
  clearTimeout(N.autoT); if (N.mode !== 'solo' && N.mode !== 'host') return;
  const map = N.map, pl = N.players.map(p => ({ id: p.id, name: p.name, col: p.col, bot: false }));
  const names = ['토끼', '여우', '고양이', '펭귄', '곰'];
  while (pl.length < MAXP) { const c = COLORS.find(c => !pl.some(p => p.col === c)); pl.push({ id: 'bot' + pl.length, name: '봇 ' + names[pl.length], col: c, bot: true }); }
  bcast({ t: 'start', map, pl }); playGame(map, pl);
}
function playGame(map, pl) {
  N.G = G = newGame(map, pl.map((p, i) => ({ id: p.id, name: p.name, col: p.col, bot: p.bot, own: p.id === UID })));
  baked = bakeWorld(G.W); fx = []; N.inputs = {}; last = performance.now(); acc = 0; $('res').classList.remove('on');
  const me = G.racers.find(r => r.id === UID); cam.x = me ? me.x : 0; cam.y = me ? me.y : 0; snapT = 0;
  $('hint').textContent = 'A D 이동 · W/Space 점프 · 클릭 무기 · F 바꾸기';
  show('game'); loop.on = true; requestAnimationFrame(loop);
}
$('resBack').onclick = () => { loop.on = false; endToLobby(); };
$('resAgain').onclick = () => { if (N.mode === 'solo' || N.mode === 'host') { loop.on = false; if (N.mode === 'host') { bcast({ t: 'room', players: N.players, map: N.map }); } N.G = null; beginGame(); } else $('resAgain').textContent = '방장이 다시 시작해요'; };

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

function myInput() {
  const sc = gl.clientHeight / VH, me = G.racers.find(r => r.id === UID);
  const wx = cam.x + mouse.x / sc - gl.clientWidth / sc / 2, wy = cam.y + mouse.y / sc - VH / 2;
  const aim = me ? Math.atan2(wy - (me.y + 8), wx - (me.x + 5)) : 0;
  const inp = { d: (keys.d ? 1 : 0) - (keys.a ? 1 : 0), jp: pend.jp, j: !!keys.j, atk: mouse.down, aim, swap: pend.swap };
  pend.jp = false; pend.swap = false; return inp;
}
function snapshot() {
  return { t: 's', ph: G.phase, tt: G.t, ck: G.clock, rk: G.rank,
    r: G.racers.map(r => [r.id, +r.x.toFixed(1), +r.y.toFixed(1), +r.vx.toFixed(0), +r.vy.toFixed(0), r.hp | 0, r.wep ? r.wep.k : '', r.face, +r.aim.toFixed(2), r.swing > 0 ? 1 : 0, r.fin ? 1 : 0, r.inv > 0 ? 1 : 0, r.flash > 0 ? 1 : 0, r.stun > 0 ? 1 : 0, r.ground ? 1 : 0, r.ko, r.prog.toFixed(1)]),
    it: G.items.map(i => [i.on ? 1 : 0, i.k]), sh: G.shots.map(s => [s.k, +s.x.toFixed(0), +s.y.toFixed(0), +s.vx.toFixed(0), +s.vy.toFixed(0)]), ev: G.ev };
}
function applySnap(d) {
  G.phase = d.ph; G.t = d.tt; G.clock = d.ck; G.rank = d.rk;
  for (const a of d.r) {
    const r = G.racers.find(r => r.id === a[0]); if (!r) continue;
    if (r.id === UID) { const dx = a[1] - r.x, dy = a[2] - r.y; if (Math.hypot(dx, dy) > 28) { r.x = a[1]; r.y = a[2]; } else { r.x += dx * .35; r.y += dy * .35; } }
    else { r.tx = a[1]; r.ty = a[2]; if (Math.hypot(a[1] - r.x, a[2] - r.y) > 60) { r.x = a[1]; r.y = a[2]; } }
    r.vx = a[3]; r.vy = a[4]; r.hp = a[5]; r.wep = a[6] ? { k: a[6], u: 1 } : null; r.face = a[7]; r.aim = a[8]; r.swing = a[9] ? .1 : 0; r.fin = !!a[10]; r.inv = a[11] ? 1 : 0; r.flash = a[12] ? .1 : 0; r.stun = a[13] ? .1 : 0; r.ground = !!a[14]; r.ko = a[15]; r.prog = +a[16];
  }
  d.it.forEach((a, i) => { if (G.items[i]) { G.items[i].on = !!a[0]; G.items[i].k = a[1]; } });
  G.shots = d.sh.map(a => ({ k: a[0], x: a[1], y: a[2], vx: a[3], vy: a[4], t: 1 }));
  G.ev.push(...d.ev);
}
function loop(now) {
  if (!loop.on || !G) return; requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; acc += dt;
  const guest = N.mode === 'guest', inp = myInput();
  if (!guest) {
    N.inputs[UID] = inp;
    // 방 손님 입력의 눌림 신호는 한 번만 쓰고 지워요
    while (acc >= 1 / 60) { acc -= 1 / 60; stepGame(G, 1 / 60, N.inputs); for (const k in N.inputs) { N.inputs[k].jp = false; N.inputs[k].swap = false; } }
    if (N.conns.length) { snapT += dt; if (snapT >= SNAP) { snapT = 0; bcast(snapshot()); G.ev = G.ev.filter(() => false); } }
  } else {
    const me = G.racers.find(r => r.id === UID);
    sendT += dt; if (sendT > 1 / 30) { sendT = 0; send(N.host, { t: 'i', i: Object.assign({}, inp, { jp: inp.jp || nextJp, swap: inp.swap || nextSw }) }); nextJp = nextSw = false; } else { nextJp = nextJp || inp.jp; nextSw = nextSw || inp.swap; }
    for (const r of G.racers) if (r !== me && r.tx !== undefined) { r.x += (r.tx - r.x) * Math.min(1, dt * 14); r.y += (r.ty - r.y) * Math.min(1, dt * 14); }
    if (me && me.ground) { me.x += me.vx * dt * .0; }
    acc = 0;
  }
  for (const e of G.ev) addFx(e); G.ev.length = 0;
  fx = fx.filter(f => (f.age += dt) < f.life);
  if (guest && G.phase === 'end') { /* 결과는 호스트 신호로 */ }
  render(now / 1000);
  if (G.phase === 'end' && (guest ? true : G.endT > 1.8)) showResult();
}
let nextJp = false, nextSw = false;
function addFx(e) {
  if (e.t === 'hit') fx.push({ t: 'hit', x: e.x, y: e.y, age: 0, life: .3, s: Math.random() * 6 });
  else if (e.t === 'boom') fx.push({ t: 'boom', x: e.x, y: e.y, age: 0, life: .45 });
  else if (e.t === 'ko') fx.push({ t: 'ko', x: e.x, y: e.y, age: 0, life: .6 });
  else if (e.t === 'jump') fx.push({ t: 'dust', x: e.x, y: e.y, age: 0, life: .3, dx: -1 }, { t: 'dust', x: e.x, y: e.y, age: 0, life: .3, dx: 1 });
  if (window.GCSfx) GCSfx(e);
}
function render(t) {
  const c = gl, dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const sc = h / VH, vw = w / sc, me = G.racers.find(r => r.id === UID) || G.racers[0];
  const tx = me.x + 5 - vw / 2, ty = me.y - VH / 2 + 30;
  cam.x += (tx - cam.x) * .12; cam.y += (ty - cam.y) * .12;
  const cx = Math.max(0, Math.min(G.W.pw - vw, cam.x)), cy = Math.max(0, Math.min(G.W.ph - VH, cam.y));
  x.setTransform(sc, 0, 0, sc, 0, 0); x.fillStyle = '#0c1220'; x.fillRect(0, 0, vw + 2, VH + 2);
  x.translate(-Math.round(cx), -Math.round(cy)); x.drawImage(baked, 0, 0);
  drawItems(x, G, t);
  for (const r of G.racers) if (r !== me) drawRacer(x, r, t, false);
  drawRacer(x, me, t, true);
  drawShots(x, G); drawFx(x, fx);
  // 이름표·체력
  x.font = 'bold 7px monospace'; x.textAlign = 'center';
  for (const r of G.racers) { const X = r.x + 5, Y = r.y - 10; x.fillStyle = '#000a'; x.fillRect(X - 13, Y - 1, 26, 4); x.fillStyle = r.hp > 50 ? '#6fe08a' : r.hp > 25 ? '#ffd36b' : '#ff6a5a'; x.fillRect(X - 12, Y, 24 * Math.max(0, r.hp) / MAX_HP, 2); x.fillStyle = r === me ? '#ffd36b' : '#fff'; x.fillText(r.name, X, Y - 3); }
  x.setTransform(sc, 0, 0, sc, 0, 0); x.textAlign = 'left';
  // 진행 막대
  const bw = Math.min(vw - 40, 220), bx = (vw - bw) / 2; x.fillStyle = '#000a'; x.fillRect(bx - 2, 6, bw + 4, 9); x.fillStyle = '#334'; x.fillRect(bx, 9, bw, 3);
  for (const r of G.racers) { const p = r.fin ? 1 : 1 - Math.min(1, r.prog / G.W.maxDist); x.fillStyle = r.col; x.fillRect(bx + p * bw - 2, 7, 4, 7); }
  // 내 무기
  x.fillStyle = '#000a'; x.fillRect(6, 6, 74, 22); x.fillStyle = '#fff'; x.font = 'bold 8px monospace';
  x.fillText(me.wep ? WEAPONS[me.wep.k].name : '맨손', 10, 16); x.fillStyle = '#6fe08a'; x.fillRect(10, 20, 64 * Math.max(0, me.hp) / MAX_HP, 4);
  const near = !me.fin && G.items.find(i => i.on && Math.abs(i.x - (me.x + 5)) < 16 && Math.abs(i.y - (me.y + 11)) < 18);
  if (near && me.wep) { x.fillStyle = '#ffd36b'; x.textAlign = 'center'; x.fillText('F: ' + WEAPONS[near.k].name + '(으)로 바꾸기', vw / 2, VH - 14); x.textAlign = 'left'; }
  // 순위
  const order = G.racers.slice().sort((a, b) => (a.fin ? G.rank.indexOf(a.id) - 99 : a.prog) - (b.fin ? G.rank.indexOf(b.id) - 99 : b.prog));
  const pos = order.indexOf(me) + 1; x.fillStyle = '#000a'; x.fillRect(vw - 40, 6, 34, 18); x.fillStyle = '#ffd36b'; x.font = 'bold 12px monospace'; x.fillText(pos + '/' + G.racers.length, vw - 36, 19);
  const big = $('big');
  if (G.phase === 'count') big.textContent = Math.max(1, Math.ceil(G.t)); else if (G.phase === 'race' && G.clock < .8) big.textContent = 'GO!'; else big.textContent = '';
}
function showResult() {
  if ($('res').classList.contains('on')) return;
  const list = G.rank.map(id => G.racers.find(r => r.id === id)).filter(Boolean);
  for (const r of G.racers.slice().sort((a, b) => a.prog - b.prog)) if (!list.includes(r)) list.push(r);
  const me = list.findIndex(r => r.id === UID);
  $('resT').textContent = me === 0 ? '1등!' : (me + 1) + '등'; $('resL').innerHTML = list.map(r => '<li style="color:' + r.col + '">' + esc(r.name) + '</li>').join('');
  $('resAgain').textContent = '다시 하기'; $('res').classList.add('on');
}
// 로비 배경 (움직이는 픽셀 도시)
(function () {
  const c = $('bgv'), x = c.getContext('2d'); let T = 0;
  function f() {
    if (scr === 'sLobby') {
      const w = c.clientWidth >> 1, h = c.clientHeight >> 1; if (c.width !== w) { c.width = w; c.height = h; } T += .016; x.imageSmoothingEnabled = false; x.clearRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { const bw = 38 + (i * 13) % 30, bh = 60 + (i * 47) % 90, bx = (i * 61 - T * 4) % (w + 80) - 40; x.fillStyle = '#1a2b52'; x.fillRect(bx, h - bh - 24, bw, bh); for (let k = 0; k < 8; k++) { x.fillStyle = (k + i) % 3 ? '#ffd36b66' : '#0004'; x.fillRect(bx + 5 + (k % 3) * 11, h - bh - 18 + ((k / 3) | 0) * 14, 6, 8); } }
      x.fillStyle = '#0e1630'; x.fillRect(0, h - 24, w, 24);
      const rx = (T * 40) % (w + 40) - 20; x.fillStyle = '#e8483b'; x.fillRect(rx, h - 40, 6, 12); x.fillStyle = '#3b8de8'; x.fillRect(rx - 30, h - 40, 6, 12);
    }
    requestAnimationFrame(f);
  } f();
})();
// 초대 링크
FFAuthJoin();
function FFAuthJoin() {
  const c = (qs.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); if (c.length !== 5) return;
  const go = () => { if (needLogin()) return; startGuest(c); };
  if (window.FFAuth) FFAuth.ready.then(go); else go();
}
if (qs.get('test')) { if (qs.get('auto') === 'solo') { setTimeout(() => { menu('solo'); setTimeout(beginGame, 200); }, 300); } }

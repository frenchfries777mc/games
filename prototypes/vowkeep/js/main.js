// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 흐름, 조작, 멀티(친구 초대, PeerJS), 저장
import { View } from './render.js';
import { createGame, step, snapshot, chooseBless, carryOver, INTRO_T, HV_DELAY } from './sim.js';
import { ROLES, ROLE_IDS, BLESSINGS, CHAPTERS, CH, FOES, MAP, ACHIEVEMENTS, TALK, GEAR_TIERS, GEAR_COST, VERSION, BUILD, roleLevel } from './data.js';
import { collide as mapCollide, areaAt, floorCell, MW, MH, CS, cw, useChapter, chapterIndex } from './map.js';
import * as SFX from './sfx.js';
import * as MUS from './music.js';

const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const PREFIX = 'ff-vowkeep-', CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', SNAP_HZ = 20;
const TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (TOUCH) document.body.classList.add('touch');

/* ---------- 저장 ---------- */
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const SAVE = Object.assign({ honor: 0, xp: {}, gear: {}, ach: {}, clears: {}, role: 'knight', set: { vol: 70, px: 3, bloom: 1, shake: 1 } }, lsGet('vowkeep.save', {}));
SAVE.set = Object.assign({ vol: 70, px: 3, bloom: 1, shake: 1 }, SAVE.set || {});
// 깬 장 수 (예전 저장은 1장을 깼으면 1)
if (SAVE.chMax == null) SAVE.chMax = Object.keys(SAVE.clears || {}).length ? 1 : 0;
// 다음에 이어서 할 장 (모든 장을 깼으면 1장부터 새 원정)
const chOpen = () => (SAVE.chMax | 0) >= CHAPTERS.length ? 0 : SAVE.chMax | 0;
function save() { lsSet('vowkeep.save', SAVE); }
let UID = lsGet('vowkeep.uid', null); if (!UID) { UID = 'u' + Math.random().toString(36).slice(2, 10); lsSet('vowkeep.uid', UID); }
const gearOf = r => Object.assign({ weapon: 0, armor: 0 }, SAVE.gear[r] || {});

/* ---------- 상태 ---------- */
const S = {
  scr: 'lobby', net: null, code: '', peer: null, conns: {}, conn: null, slots: [], G: null, snap: null, me: null,
  rin: {}, acc: 0, sendAcc: 0, evq: [], built: false, area: -2, seenA: {}, lastPh: '', nums: [], local: null, saved: false,
  wonT: 0, resultShown: false, everDown: false, lastBless: null, t0: performance.now(), chSel: 0
};
S.chSel = chOpen();
const view = new View($('gl'));
view.setPixel(SAVE.set.px); view.setBloom(!!SAVE.set.bloom); view.shakeOn = !!SAVE.set.shake; SFX.setVol(SAVE.set.vol / 100); MUS.setVol(SAVE.set.vol / 100);
view.buildLobby();
addEventListener('resize', () => { view.resize(); sizeOv(); });
const ov = $('ov'), oc = ov.getContext('2d');
function sizeOv() { const d = Math.min(2, devicePixelRatio || 1); ov.width = innerWidth * d; ov.height = innerHeight * d; oc.setTransform(d, 0, 0, d, 0, 0); }
sizeOv();
$('ver').textContent = VERSION + ' (build ' + BUILD + ')';

/* ---------- 화면 전환 ---------- */
function show(id) {
  ['sLobby', 'sRoom', 'sRoles', 'sAchs', 'sSettings', 'sIntro', 'sResult'].forEach(s => $(s).classList.toggle('on', s === id));
  S.scr = id;
}
function inGame() { return !!S.snap && S.scr !== 'sLobby' && S.scr !== 'sRoom'; }
function setHud(on) { $('hud').classList.toggle('on', on); $('touch').classList.toggle('on', on && TOUCH); }
function homeMsg(t) { $('homeMsg').textContent = t || ''; }
function toast(t, ms = 2200) { const el = $('toast'); el.textContent = t; el.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => el.style.display = 'none', ms); }
// 보스 등장 때 위아래 검은 띠, 보스가 쓰러질 때 하얀 번쩍임
function letterbox(ms) { document.body.classList.add('lbox'); clearTimeout(letterbox._t); letterbox._t = setTimeout(() => document.body.classList.remove('lbox'), ms); }
function flashScreen() { const f = $('wflash'); f.style.transition = 'none'; f.style.opacity = 0.85; requestAnimationFrame(() => { f.style.transition = 'opacity 1.1s'; f.style.opacity = 0; }); }
function bigMsg(a, b, ms = 2400) { $('bigMsg').textContent = a || ''; $('subMsg').textContent = b || ''; $('bigMsg').style.opacity = a ? 1 : 0; $('subMsg').style.opacity = b ? 1 : 0; clearTimeout(bigMsg._t); if (ms) bigMsg._t = setTimeout(() => { $('bigMsg').style.opacity = 0; $('subMsg').style.opacity = 0; }, ms); }

/* ---------- 게임 중 대사 ---------- */
// 구역에 처음 들어가거나 보스가 나타나면 동료들이 한두 마디씩 해요. 한 줄씩 글자가 찍히고 잠시 뒤 다음 줄로 넘어가요
const TK = { q: [], cur: null, wait: 0, gen: 0 };
function talk(key, delay = 0) {
  const gen = TK.gen, L = (TALK[chapterIndex()] || {})[key]; if (!L) return;
  setTimeout(() => { if (gen !== TK.gen) return; for (const [r, t] of L) TK.q.push({ r, t }); }, delay);
}
function talkReset() { TK.gen++; TK.q.length = 0; TK.cur = null; TK.wait = 0; $('talk').classList.remove('on'); }
function talkTick(dt, on) {
  const el = $('talk');
  if (!on) { el.classList.remove('on'); return; }
  if (!TK.cur) {
    if ((TK.wait -= dt) > 0 || !TK.q.length) { if (!TK.q.length) el.classList.remove('on'); return; }
    TK.cur = TK.q.shift(); TK.cur.age = 0; const R = ROLES[TK.cur.r];
    $('talkFace').src = view.portrait(TK.cur.r, true); $('talkWho').textContent = R.name; $('talkWho').style.color = R.color === '#e8e4ef' ? '#efe3c8' : R.color; el.classList.add('on');
  }
  const c = TK.cur; c.age += dt; const n = Math.min(c.t.length, Math.floor(c.age * 30)); $('talkText').textContent = c.t.slice(0, n);
  if (c.age > c.t.length / 30 + 2.4) { TK.cur = null; TK.wait = 0.25; }
}

/* ---------- 로그인 ---------- */
function loggedIn() { try { return !!(window.FFAuth && FFAuth.user()); } catch (e) { return false; } }
function myName() { try { const n = window.FFAuth && FFAuth.user() && FFAuth.nickname(); if (n) return String(n).slice(0, 12); } catch (e) { } return '기사'; }
function paintWho() {
  const lv = roleLevel(SAVE.xp[SAVE.role] || 0);
  $('who').innerHTML = '';
  const s = document.createElement('span'); s.className = 'tx'; s.textContent = (loggedIn() ? myName() : '로그인 안 함') + ' · ' + ROLES[SAVE.role].name + ' Lv ' + lv + ' · 명예 ' + SAVE.honor; $('who').appendChild(s);
  if (!loggedIn() && window.FFAuth) { const b = document.createElement('button'); b.textContent = '로그인'; b.onclick = () => { try { FFAuth.openLogin(); } catch (e) { } }; $('who').appendChild(b); }
}
if (window.FFAuth) { FFAuth.ready.then(() => { paintWho(); autoJoin(); }); FFAuth.onChange(paintWho); }
paintWho();
function needLogin() { if (!window.FFAuth) return false; if (loggedIn()) return false; homeMsg('친구와 원정은 Frenchfries777 계정으로 로그인해야 해요.'); try { FFAuth.openLogin(); } catch (e) { } return true; }
function hubRoom(on) { try { if (window.FFAuth && FFAuth.setRoom) FFAuth.setRoom(on && S.code ? { game: 'vowkeep', code: S.code, path: 'prototypes/vowkeep/index.html' } : null); } catch (e) { } }
let autoDone = false;
function autoJoin() { const c = (qs.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (autoDone || c.length !== 6 || S.net) return; autoDone = true; if (needLogin()) return; startGuest(c); }

/* ---------- 메뉴 ---------- */
document.querySelectorAll('#menu button').forEach(b => b.addEventListener('click', () => { SFX.unlock(); SFX.play('click'); menu(b.dataset.go); }));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { SFX.play('click'); if (S.scr === 'sRoom') leaveNet(); show('sLobby'); paintWho(); }));
function menu(go) {
  homeMsg('');
  if (go === 'solo') { leaveNet(); S.net = 'solo'; S.slots = ROLE_IDS.map(r => ({ role: r, uid: r === SAVE.role ? UID : null, name: r === SAVE.role ? myName() : '' })); openRoom(); }
  else if (go === 'host') { if (needLogin()) return; startHost(); }
  else if (go === 'roles') { paintRoles(); show('sRoles'); }
  else if (go === 'achs') { paintAchs(); show('sAchs'); }
  else if (go === 'settings') { paintSettings(); show('sSettings'); }
  else if (go === 'site') { location.href = '../'; }
}

function paintRoles() {
  $('honorNow').textContent = '지금 명예 ' + SAVE.honor;
  const box = $('roleCards'); box.innerHTML = '';
  ROLE_IDS.forEach(r => {
    const R = ROLES[r], xp = SAVE.xp[r] || 0, lv = roleLevel(xp), g = gearOf(r), cl = SAVE.clears[r] ? ' · ' + SAVE.clears[r] + '장까지 완료' : '';
    const d = document.createElement('div'); d.className = 'rc';
    d.innerHTML = `<img class="pt" alt="" src="${view.portrait(r)}"><h3 style="color:${R.color === '#e8e4ef' ? '#efe3c8' : R.color}">${R.name}</h3><div class="lv">Lv ${lv} (명예 ${xp} 받음)${cl}</div><div class="note">${R.role} 체력 ${R.hp}</div><ul>${R.skills.map(s => `<li><b>${s.key} ${s.name}</b>: ${s.desc}</li>`).join('')}</ul>`;
    const gr = document.createElement('div'); gr.className = 'gear';
    [['weapon', '무기'], ['armor', '갑옷']].forEach(([k, lab]) => {
      const t = g[k] | 0, sp = document.createElement('span'); sp.textContent = lab + ': ' + GEAR_TIERS[t] + ' ' + lab; gr.appendChild(sp);
      if (t < 2) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = GEAR_TIERS[t + 1] + ' ' + lab + ' (명예 ' + GEAR_COST[t + 1] + ')'; b.disabled = SAVE.honor < GEAR_COST[t + 1]; b.onclick = () => { if (SAVE.honor < GEAR_COST[t + 1]) return; SAVE.honor -= GEAR_COST[t + 1]; g[k] = t + 1; SAVE.gear[r] = g; save(); SFX.play('bless'); paintRoles(); }; gr.appendChild(b); }
    });
    d.appendChild(gr);
    const pick = document.createElement('button'); pick.className = 'btn' + (SAVE.role === r ? ' gold' : ''); pick.style.marginTop = '8px'; pick.textContent = SAVE.role === r ? '기본 역할' : '기본 역할로 정하기';
    pick.onclick = () => { SAVE.role = r; save(); paintRoles(); paintWho(); }; d.appendChild(pick);
    box.appendChild(d);
  });
}
function paintAchs() { const b = $('achList'); b.innerHTML = ''; ACHIEVEMENTS.forEach(a => { const d = document.createElement('div'); d.className = 'ach' + (SAVE.ach[a.id] ? ' on' : ''); d.innerHTML = `<b>${SAVE.ach[a.id] ? '★ ' : ''}${a.name}</b><span>${a.desc}</span>`; b.appendChild(d); }); }
function unlock(id) { if (SAVE.ach[id]) return; const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return; SAVE.ach[id] = Date.now(); save(); toast('업적: ' + a.name, 3000); }
function paintSettings() {
  $('setVol').value = SAVE.set.vol;
  const seg = (id, v, f) => { const el = $(id); el.querySelectorAll('button').forEach(b => { b.classList.toggle('on', +b.dataset.v === +v); b.onclick = () => { f(+b.dataset.v); save(); paintSettings(); }; }); };
  seg('setPx', SAVE.set.px, v => { SAVE.set.px = v; view.setPixel(v); });
  seg('setBloom', SAVE.set.bloom, v => { SAVE.set.bloom = v; view.setBloom(!!v); });
  seg('setShake', SAVE.set.shake, v => { SAVE.set.shake = v; view.shakeOn = !!v; });
}
$('setVol').oninput = e => { SAVE.set.vol = +e.target.value; SFX.setVol(SAVE.set.vol / 100); MUS.setVol(SAVE.set.vol / 100); save(); };

/* ---------- 대기실 ---------- */
// 대기실: 장은 고르지 않고, 저장된 이야기에서 이어서 시작해요. 친구 방은 방장의 이야기를 따라가요
function paintChapters() {
  const c = CHAPTERS[S.chSel], prev = CHAPTERS[S.chSel - 1];
  // 깬 장까지는 골라서 다시 할 수 있어요 (기본은 이어서 할 장)
  const top = Math.min(CHAPTERS.length - 1, SAVE.chMax | 0), pick = S.net !== 'guest' && top > 0;
  $('chRow').innerHTML = (pick ? `<div class="chpick">${CHAPTERS.slice(0, top + 1).map((ch, i) => `<button class="btn${i === S.chSel ? ' gold' : ''}" data-ch="${i}">${i + 1}장</button>`).join('')}</div>` : '') + `<div class="story"><b>${S.chSel ? '이어서 ' : ''}${esc(c.title)}</b><small>${esc(prev ? prev.outro[prev.outro.length - 1] : c.intro[0])}</small></div>`;
  $('chNote').textContent = S.net === 'guest' ? '방장의 원정을 함께 이어 가요.' : S.chSel === chOpen() && S.chSel ? '지난번에 멈춘 곳에서 이야기가 이어져요.' : '';
  if (S.net !== 'guest') $('startBtn').textContent = S.chSel ? S.chSel + 1 + '장 시작' : '원정 시작';
  $('chRow').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { SFX.play('click'); S.chSel = +b.dataset.ch; paintChapters(); hostLobby(); });
}
function openRoom() {
  show('sRoom'); const solo = S.net === 'solo'; if (S.net !== 'guest') S.chSel = chOpen(); paintChapters();
  $('roomTitle').textContent = solo ? '혼자 원정 준비' : S.net === 'host' ? '친구와 원정' : '친구 방';
  $('codeRow').style.display = S.net === 'host' ? 'flex' : 'none';
  $('roomNote').textContent = solo ? '내 역할을 고르세요. 나머지 세 자리는 봇 동료가 맡아요.' : '역할을 하나 골라 주세요. 빈 자리는 봇 동료가 맡아요.';
  $('startBtn').style.display = S.net === 'guest' ? 'none' : '';
  $('roomMsg').textContent = S.net === 'guest' ? '방장이 시작하면 원정이 시작돼요.' : '';
  paintSlots();
}
function paintSlots() {
  const box = $('slots'); box.innerHTML = '';
  S.slots.forEach((sl, i) => {
    const R = ROLES[sl.role], mine = sl.uid === UID, d = document.createElement('div');
    d.className = 'slot' + (mine ? ' mine' : '') + (sl.uid && !mine ? ' taken' : '');
    const lv = mine ? roleLevel(SAVE.xp[sl.role] || 0) : null;
    d.innerHTML = `<img class="pt" alt="" src="${view.portrait(sl.role)}"><b>${R.name}</b><div class="who">${sl.uid ? esc(sl.name) + (mine ? ' (나)' : '') : '봇'}</div><small>${R.role}</small>${mine ? `<small style="color:#ffd36b">Lv ${lv} · ${GEAR_TIERS[gearOf(sl.role).weapon]} 무기 · ${GEAR_TIERS[gearOf(sl.role).armor]} 갑옷</small>` : ''}`;
    d.onclick = () => { if (sl.uid) return; SFX.play('click'); pickRole(sl.role); };
    box.appendChild(d);
  });
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function pickRole(r) {
  SAVE.role = r; save();
  if (S.net === 'guest') { send({ t: 'role', role: r }); return; }
  const cur = S.slots.find(s => s.uid === UID), tgt = S.slots.find(s => s.role === r);
  if (!tgt || tgt.uid) return; if (cur) { cur.uid = null; cur.name = ''; }
  tgt.uid = UID; tgt.name = myName(); paintSlots(); hostLobby();
}
$('inviteBtn').onclick = () => { SFX.play('click'); try { if (window.FFAuth && FFAuth.openFriends) FFAuth.openFriends(); } catch (e) { } };
$('startBtn').onclick = () => { SFX.unlock(); SFX.play('click'); if (S.net === 'guest') return; beginGame(); };

/* ---------- 멀티: 친구 초대 (허브 초대 링크 ?join=) ---------- */
function peerOpts() {
  const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] } };
  const ps = qs.get('ps'); if (ps) { const m = ps.match(/^([^:\/]+)(?::(\d+))?(\/.*)?$/); if (m) { o.host = m[1]; o.port = +(m[2] || 443); o.path = m[3] || '/'; o.secure = location.protocol === 'https:'; } }
  return o;
}
function newCode() { let s = ''; for (let i = 0; i < 6; i++) s += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; return s; }
function leaveNet() {
  hubRoom(false);
  if (S.peer) { try { S.peer.destroy(); } catch (e) { } }
  S.peer = null; S.conn = null; S.conns = {}; S.net = null; S.code = '';
}
function send(d) { if (S.conn && S.conn.open) try { S.conn.send(d); } catch (e) { } }
function bcast(d) { for (const k in S.conns) { const c = S.conns[k]; if (c.open) try { c.send(d); } catch (e) { } } }
function startHost(tries = 0) {
  if (!window.Peer) { homeMsg('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.'); return; }
  leaveNet(); S.net = 'host'; S.code = newCode(); homeMsg('방을 만드는 중...');
  S.slots = ROLE_IDS.map(r => ({ role: r, uid: r === SAVE.role ? UID : null, name: r === SAVE.role ? myName() : '' }));
  const p = new Peer(PREFIX + S.code, peerOpts()); S.peer = p;
  p.on('open', () => { if (S.peer !== p) return; homeMsg(''); hubRoom(true); openRoom(); });
  p.on('connection', c => { c.on('data', d => hostMsg(c, d)); c.on('close', () => dropConn(c)); c.on('error', () => dropConn(c)); });
  p.on('disconnected', () => { if (S.peer === p && !p.destroyed) setTimeout(() => { if (S.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
  p.on('error', err => { if (S.peer !== p) return; if (err.type === 'unavailable-id' && tries < 5) { startHost(tries + 1); return; } if (S.scr !== 'sRoom' && !inGame()) { homeMsg('방을 만들지 못했어요 (' + err.type + '). 잠시 후 다시 해 보세요.'); leaveNet(); } });
}
function lobbyMeta() { return { t: 'lobby', slots: S.slots.map(s => ({ role: s.role, uid: s.uid, name: s.name })), code: S.code, ch: S.chSel }; }
function hostLobby() { if (S.net === 'host') bcast(lobbyMeta()); }
function hostMsg(c, d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'hello') {
    const uid = String(d.uid || '').slice(0, 20), name = String(d.name || '기사').slice(0, 12);
    c._uid = uid; c._name = name; c._xp = d.xp || {}; c._gear = d.gear || {};
    if (S.G) { // 진행 중: 내 자리로 돌아오거나, 봇 자리를 맡아요
      let p = S.G.players.find(q => q.uid === uid) || S.G.players.find(q => q.bot && q.wasHuman == null) || S.G.players.find(q => q.bot);
      if (!p || (!p.bot && p.uid !== uid)) { c.send({ t: 'deny', why: '방이 가득 찼어요 (최대 4명).' }); setTimeout(() => c.close(), 300); return; }
      p.bot = false; p.uid = uid; p.name = name; p.wasHuman = true; S.G.humans = S.G.players.filter(q => !q.bot).length;
      S.conns[uid] = c; c._pid = p.id;
      c.send({ t: 'welcome', uid, start: true, pid: p.id, ch: S.G.ch }); toast(name + '님이 ' + ROLES[p.role].name + ' 자리에 들어왔어요.');
      return;
    }
    let sl = S.slots.find(s => s.uid === uid) || S.slots.find(s => !s.uid && s.role === d.role) || S.slots.find(s => !s.uid);
    if (!sl) { c.send({ t: 'deny', why: '방이 가득 찼어요 (최대 4명).' }); setTimeout(() => c.close(), 300); return; }
    sl.uid = uid; sl.name = name; S.conns[uid] = c;
    c.send({ t: 'welcome', uid }); hostLobby(); paintSlots(); SFX.play('click');
    return;
  }
  const uid = c._uid; if (!uid) return;
  if (d.t === 'role' && !S.G) { const tgt = S.slots.find(s => s.role === d.role); if (tgt && !tgt.uid) { const cur = S.slots.find(s => s.uid === uid); if (cur) { cur.uid = null; cur.name = ''; } tgt.uid = uid; tgt.name = c._name || '기사'; hostLobby(); paintSlots(); } }
  else if (d.t === 'i' && S.G) { const pid = c._pid; if (!pid) return; const r = S.rin[pid] || (S.rin[pid] = {}); const once = { q: r.q || d.q, e: r.e || d.e, r: r.r || d.r, roll: r.roll || d.roll, skip: r.skip || d.skip }; Object.assign(r, d, once); }
  else if (d.t === 'b' && S.G) { if (c._pid) chooseBless(S.G, c._pid, d.id); }
}
function dropConn(c) {
  const uid = c._uid; if (!uid || S.conns[uid] !== c) return; delete S.conns[uid];
  if (S.G) { const p = S.G.players.find(q => q.uid === uid); if (p) { p.bot = true; S.G.humans = Math.max(1, S.G.players.filter(q => !q.bot).length); toast(p.name + '님이 나가서 봇이 대신해요.'); p.name = p.name + ' (봇)'; delete S.rin[p.id]; } }
  else { const sl = S.slots.find(s => s.uid === uid); if (sl) { sl.uid = null; sl.name = ''; } hostLobby(); paintSlots(); }
}
function startGuest(code) {
  if (!window.Peer) { homeMsg('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.'); return; }
  leaveNet(); S.net = 'guest'; S.code = code; homeMsg('방에 들어가는 중...');
  const p = new Peer(peerOpts()); S.peer = p;
  const tm = setTimeout(() => { if (S.peer === p && S.scr !== 'sRoom' && !inGame()) { homeMsg('연결 시간이 초과됐어요. 초대를 다시 받아 주세요.'); leaveNet(); } }, 15000);
  p.on('open', () => {
    const c = p.connect(PREFIX + code, { reliable: true, serialization: 'json' }); S.conn = c;
    c.on('open', () => { c.send({ t: 'hello', uid: UID, name: myName(), role: SAVE.role, xp: SAVE.xp, gear: SAVE.gear }); });
    c.on('data', d => { clearTimeout(tm); guestMsg(d); });
    c.on('close', () => { if (S.conn !== c) return; const wasGame = inGame(); endToLobby(wasGame ? '방장이 나가서 원정이 끝났어요.' : '방이 닫혔어요.'); });
  });
  p.on('error', err => { if (S.peer !== p) return; clearTimeout(tm); if (S.scr !== 'sRoom' && !inGame()) { homeMsg(err.type === 'peer-unavailable' ? '초대받은 방이 이미 닫혔어요.' : '연결하지 못했어요 (' + err.type + ').'); leaveNet(); } });
}
function guestMsg(d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'welcome') { homeMsg(''); if (d.start) { S.me = d.pid; useChapter(d.ch | 0); startClient(); } else { openRoom(); } }
  else if (d.t === 'lobby') { S.slots = d.slots; S.chSel = d.ch | 0; if (S.scr === 'sRoom') { paintSlots(); paintChapters(); } }
  else if (d.t === 'deny') { homeMsg(d.why || '들어갈 수 없어요.'); leaveNet(); }
  else if (d.t === 'start') { if (S.snap && S.snap.won) clearChapter(); S.me = d.pid; useChapter(d.ch | 0); startClient(); }
  else if (d.t === 's') { if (d.S && d.S.c != null && d.S.c !== chapterIndex()) { useChapter(d.S.c); S.built = false; } S.snap = d.S; if (d.ev) for (const e of d.ev) S.evq.push(e); }
}

/* ---------- 게임 시작 ---------- */
function beginGame(prevG) {
  const solo = S.net === 'solo';
  const sl = prevG ? S.lastSl : S.slots.map((s, i) => {
    const id = 's' + i;
    if (s.uid === UID) return { id, uid: UID, role: s.role, name: myName(), bot: false, lv: roleLevel(SAVE.xp[s.role] || 0), gear: gearOf(s.role) };
    if (s.uid) { const c = S.conns[s.uid]; const xp = c && c._xp ? c._xp[s.role] : 0, gr = c && c._gear ? c._gear[s.role] : null; return { id, uid: s.uid, role: s.role, name: s.name, bot: false, lv: roleLevel(xp || 0), gear: gr || { weapon: 0, armor: 0 } }; }
    return { id, role: s.role, name: ROLES[s.role].name + ' (봇)', bot: true, lv: 1 };
  });
  if (!prevG && !sl.some(s => s.uid === UID)) { $('roomMsg').textContent = '내 역할을 먼저 골라 주세요.'; return; }
  if (prevG) sl.forEach((s, i) => { const q = prevG.players[i]; s.bot = q.bot; s.uid = q.uid; s.name = q.name; });
  S.lastSl = sl;
  S.G = createGame(sl, (Math.random() * 4e9) >>> 0, S.chSel);
  S.G.players.forEach((p, i) => { p.uid = sl[i].uid; });
  if (prevG) carryOver(S.G, prevG);
  S.me = sl.find(s => s.uid === UID).id;
  if (!solo) { for (const uid in S.conns) { const p = S.G.players.find(q => q.uid === uid); if (p) { S.conns[uid]._pid = p.id; S.conns[uid].send({ t: 'start', pid: p.id, ch: S.G.ch }); } } }
  if (S.G.humans > 1) unlock('friends');
  startClient();
}
function startClient() {
  talkReset(); S.cleared = false; S.built = false; S.area = -2; S.seenA = {}; S.voted = false; S.lastPh = ''; S.saved = false; S.resultShown = false; S.everDown = false; S.local = null; S.nums = []; S.evq = []; S.wonT = 0; S.lastBless = null;
  if (S.G) S.snap = snapshot(S.G);
  unlock('first');
  setHud(false); show('sIntro'); $('introCh').textContent = CH.title; $('introLine').classList.remove('on'); S.introIdx = -1;
  hubRoom(S.net === 'host');
}
function endToLobby(msg) {
  awardHonor();
  leaveNet(); S.G = null; S.snap = null; setHud(false); $('bless').classList.remove('on');
  view.buildLobby(); show('sLobby'); paintWho(); if (msg) homeMsg(msg);
}
$('exitBtn').onclick = () => {
  const b = $('exitBtn');
  if (b.dataset.arm) { delete b.dataset.arm; b.textContent = '나가기'; endToLobby(''); return; }
  b.dataset.arm = 1; b.textContent = '한 번 더 누르면 나가요'; setTimeout(() => { delete b.dataset.arm; b.textContent = '나가기'; }, 2200);
};
function myP() { return S.snap && S.snap.pl.find(p => p.id === S.me); }
function awardHonor() {
  if (S.saved || !S.snap || !S.me) return; S.saved = true;
  const p = myP(); if (!p) return;
  let h = Math.round((S.snap.honor[S.me] || 0) * ((p.b || []).indexOf('honor') >= 0 ? 1.25 : 1));
  SAVE.honor += h; SAVE.xp[p.role] = (SAVE.xp[p.role] || 0) + h; save();
  return h;
}

/* ---------- 조작 ---------- */
// 한글 입력 상태여도 같은 자리의 글쇠로 읽어요 (e.code 기준)
function keyOf(e) { const c = e.code || ''; if (/^Key[A-Z]$/.test(c)) return c[3].toLowerCase(); if (/^Digit[0-9]$/.test(c)) return c[5]; if (c === 'Space') return ' '; return e.key.toLowerCase(); }
const K = {}; let mouse = { x: innerWidth / 2, y: innerHeight / 2, down: false }; const once = { q: 0, e: 0, r: 0, roll: 0, skip: 0 };
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const k = keyOf(e); K[k] = true; SFX.unlock();
  if (!inGame()) return;
  if (S.snap && S.snap.ph === 'won' && (k === ' ' || k === 'enter') && S.wonT > 1) { S.wonT = Math.max(S.wonT, 9); return; }
  if (S.scr === 'sIntro') { if (k === ' ' || k === 'enter' || k === 'escape') { once.skip = 1; e.preventDefault(); } return; }
  if (k === 'q' || k === 'ㅂ') once.q = 1; if (k === 'e' || k === 'ㄷ') once.e = 1; if (k === 'r' || k === 'ㄱ') once.r = 1; if (k === ' ') { once.roll = 1; e.preventDefault(); }
  if (k === '1' || k === '2' || k === '3') pickBlessIdx(+k - 1);
});
addEventListener('keyup', e => { K[keyOf(e)] = false; K[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in K) K[k] = false; mouse.down = false; });
$('gl').addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
$('gl').addEventListener('mousedown', e => { if (e.button === 0) mouse.down = true; SFX.unlock(); });
addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });
$('gl').addEventListener('contextmenu', e => e.preventDefault());
const keyDown = (...ks) => ks.some(k => K[k]);
// 휴대폰
const touch = { jx: 0, jz: 0, jid: null, atk: false, f: false };
(function setupTouch() {
  const joy = $('joy'), base = $('joyBase'), knob = $('joyKnob'); let ox = 0, oy = 0;
  joy.addEventListener('touchstart', e => { SFX.unlock(); const t = e.changedTouches[0]; touch.jid = t.identifier; ox = t.clientX; oy = t.clientY; base.style.display = 'block'; base.style.left = (ox - 60) + 'px'; base.style.top = (oy - 60) + 'px'; knob.style.left = '33px'; knob.style.top = '33px'; e.preventDefault(); }, { passive: false });
  joy.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === touch.jid) { let dx = t.clientX - ox, dy = t.clientY - oy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx = dx / l * m; dy = dy / l * m; } knob.style.left = (33 + dx) + 'px'; knob.style.top = (33 + dy) + 'px'; touch.jx = dx / m; touch.jz = dy / m; } e.preventDefault(); }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === touch.jid) { touch.jid = null; touch.jx = touch.jz = 0; base.style.display = 'none'; } };
  joy.addEventListener('touchend', end); joy.addEventListener('touchcancel', end);
  const hold = (id, k) => { const b = $(id); b.addEventListener('touchstart', e => { SFX.unlock(); touch[k] = true; e.preventDefault(); }, { passive: false }); b.addEventListener('touchend', e => { touch[k] = false; e.preventDefault(); }); b.addEventListener('touchcancel', () => touch[k] = false); };
  hold('tA', 'atk'); hold('tF', 'f');
  const tap = (id, k) => $(id).addEventListener('touchstart', e => { once[k] = 1; e.preventDefault(); }, { passive: false });
  tap('tQ', 'q'); tap('tE', 'e'); tap('tR', 'r'); tap('tRoll', 'roll');
})();

function nearestFoe(p, maxd) { let best = null, bd = maxd; for (const e of S.snap.en) { if (e.hp <= 0 || e.st === 'rise') continue; const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < bd) { bd = d; best = e; } } return best; }
function gatherInput(p) {
  const inp = {};
  let mx = 0, mz = 0;
  if (keyDown('w', 'arrowup', 'ㅈ')) mz -= 1; if (keyDown('s', 'arrowdown', 'ㄴ')) mz += 1; if (keyDown('a', 'arrowleft', 'ㅁ')) mx -= 1; if (keyDown('d', 'arrowright', 'ㅇ')) mx += 1;
  if (touch.jid != null) { mx = touch.jx; mz = touch.jz; }
  inp.mx = mx; inp.mz = mz;
  const pos = S.local && S.net === 'guest' ? S.local : p;
  if (TOUCH) {
    const f = nearestFoe(pos, 14);
    if (f) { inp.aim = Math.atan2(f.z - pos.z, f.x - pos.x); inp.ax = f.x; inp.az = f.z; }
    else if (Math.hypot(mx, mz) > 0.2) inp.aim = Math.atan2(mz, mx);
    if (p.role === 'squire') { const low = S.snap.pl.filter(q => !q.dn && !q.dd && q.hp < q.mx * 0.7).sort((a, b) => a.hp / a.mx - b.hp / b.mx)[0]; if (low && once.q) { inp.ax = low.x; inp.az = low.z; inp.aim = Math.atan2(low.z - pos.z, low.x - pos.x); } }
    inp.atk = touch.atk; inp.f = touch.f;
  } else {
    const g = view.groundAt(mouse.x, mouse.y); inp.aim = Math.atan2(g.z - pos.z, g.x - pos.x); inp.ax = g.x; inp.az = g.z;
    inp.atk = mouse.down; inp.f = keyDown('f', 'ㄹ');
  }
  inp.q = once.q; inp.e = once.e; inp.r = once.r; inp.roll = once.roll; if (once.skip) S.voted = true; inp.skip = once.skip; once.q = once.e = once.r = once.roll = once.skip = 0;
  return inp;
}

/* 게스트: 내 캐릭터는 내 화면에서 바로 움직여요 */
function localMove(p, inp, dt) {
  const L = S.local; const R = ROLES[p.role];
  if (p.dn || p.dd || S.snap.ph === 'intro' || S.snap.ph === 'wipe' || S.snap.ph === 'won') { L.x = p.x; L.z = p.z; L.roll = 0; return; }
  if (Math.hypot(L.x - p.x, L.z - p.z) > 5) { L.x = p.x; L.z = p.z; }
  L.rollCd = Math.max(0, (L.rollCd || 0) - dt);
  let mx = inp.mx, mz = inp.mz; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  // 기사 강타: 방장이 강타를 알려 오면 내 화면에서도 공중에 있는 동안 제자리에 멈춰요
  if (p.aN !== L.aN) { if (L.aN != null && p.ak === 'hv') L.lp = HV_DELAY; L.aN = p.aN; }
  if (L.lp > 0) { L.lp -= dt; return; }
  if (inp.roll && L.rollCd <= 0 && !(L.roll > 0)) { L.roll = 0.35; L.rollCd = 1.2 * ((p.b || []).indexOf('roll') >= 0 ? 0.6 : 1); const ra = ml > 0.1 ? Math.atan2(mz, mx) : p.a; L.rdx = Math.cos(ra); L.rdz = Math.sin(ra); }
  if (L.roll > 0) { L.roll -= dt; L.x += L.rdx * 15 * dt; L.z += L.rdz * 15 * dt; }
  else { const sp = R.speed * ((p.b || []).indexOf('feet') >= 0 ? 1.12 : 1) * (p.ra ? 1.3 : 1) * (p.bk ? 0.8 : 1); L.x += mx * sp * dt; L.z += mz * sp * dt; }
  mapCollide(L, 0.6);
}

$('gl').addEventListener('touchstart', () => { if (S.snap && S.snap.ph === 'won' && S.wonT > 1) S.wonT = Math.max(S.wonT, 9); }, { passive: true });
$('introSkip').addEventListener('click', () => { SFX.unlock(); SFX.play('click'); once.skip = 1; });
/* ---------- 축복 고르기 ---------- */
function paintBless() {
  const opts = S.snap && S.snap.bless && S.snap.bless[S.me];
  const key = opts ? opts.join(',') : '';
  if (key === S.lastBless) return; S.lastBless = key;
  const el = $('bless'); if (!opts) { el.classList.remove('on'); return; }
  const box = $('blessCards'); box.innerHTML = '';
  opts.forEach((id, i) => { const B = BLESSINGS.find(b => b.id === id); const d = document.createElement('div'); d.className = 'card'; d.innerHTML = `<b>${B.name}</b><span>${B.desc}</span><em>${i + 1}</em>`; d.onclick = () => pickBlessIdx(i); box.appendChild(d); });
  el.classList.add('on');
}
function pickBlessIdx(i) {
  const opts = S.snap && S.snap.bless && S.snap.bless[S.me]; if (!opts || !opts[i]) return;
  SFX.play('bless');
  if (S.G) chooseBless(S.G, S.me, opts[i]); else send({ t: 'b', id: opts[i] });
  S.snap.bless[S.me] = null; S.lastBless = null; paintBless();
}

/* ---------- 이벤트 → 효과 ---------- */
// 기술마다 번쩍임, 바닥 문양, 충격파 같은 연출을 붙여요
function skillFx(e) {
  const c = Math.cos(e.a || 0), s = Math.sin(e.a || 0), mine = e.id === S.me;
  if (mine && ['block', 'pierce', 'ward', 'trap', 'rain', 'heal'].includes(e.s)) view.shake = Math.max(view.shake, 0.35);
  switch (e.s) {
    case 'block': view.dome(e.x + c * 0.6, e.z + s * 0.6, 1.9, 0xffe08a, 1.2); view.burst(e.x + c, 1.6, e.z + s, 0xffe08a, 10, 5, 0.35, 0.1); view.flash(e.x, e.z, 0xffe08a, 70); SFX.play('clang'); break;
    case 'dash': view.streak(e.x, e.z, e.a, 6, 0xcfe0ff, 0.4, 1.2); view.burst(e.x, 0.4, e.z, 0xbcae94, 16, 5, 0.6, 0.16); view.shock(e.x + c * 6, e.z + s * 6, 2.4, 0xcfe0ff, 0.35); view.flash(e.x + c * 4, e.z + s * 4, 0xcfe0ff, 90); if (mine) view.shake = Math.max(view.shake, 0.75); SFX.play('roll'); break;
    case 'taunt': view.shock(e.x, e.z, 10, 0xff6a4a, 0.6); view.rune(e.x, e.z, 2.6, 0xff6a4a, 1.2, 3); view.rise(e.x, e.z, 0xff6a4a, 18, 1.5, 0.9, 7); view.flash(e.x, e.z, 0xff6a4a, 120); if (mine) view.shake = Math.max(view.shake, 1.0); SFX.play('roar'); break;
    case 'pierce': view.streak(e.x, e.z, e.a, 18, 0xffe08a, 0.3, 0.35); view.burst(e.x + c, 1.6, e.z + s, 0xffe08a, 12, 6, 0.4, 0.12); view.flash(e.x, e.z, 0xffe08a, 80); break;
    case 'rain': view.rune(e.x, e.z, 1.2, 0xffd36b, 0.5, 5); view.rise(e.x, e.z, 0xffd36b, 8, 0.8, 0.5, 9); break;
    case 'heal': view.rune(e.x, e.z, 4.5, 0x9af0a8, 0.9, 1.5); view.rise(e.x, e.z, 0x9af0a8, 12, 4, 1, 4); view.column(e.x, e.z, 0x9af0a8, 0.5); view.flash(e.x, e.z, 0x9af0a8, 45); break;
    case 'ward': view.rune(e.x, e.z, 5, 0x9af0e0, 0.9, -1.5); view.flash(e.x, e.z, 0x9af0e0, 40); break;
    case 'raise': view.rune(e.x, e.z, 8, 0xfff0b0, 1.8, 1); view.column(e.x, e.z, 0xfff0b0, 1.4); view.rise(e.x, e.z, 0xfff0b0, 28, 7, 1.6, 6); view.shock(e.x, e.z, 8, 0xfff0b0, 0.7); view.flash(e.x, e.z, 0xfff0b0, 200); view.shake = Math.max(view.shake, 0.9); break;
    case 'potion': view.burst(e.x + c, 1.8, e.z + s, 0xd0543a, 6, 3, 0.3, 0.1); break;
    case 'trap': view.rune(e.x, e.z, 1.5, 0xffb060, 0.8, 6); view.burst(e.x, 0.3, e.z, 0x9a9aa6, 10, 4, 0.4, 0.12); SFX.play('click'); break;
    case 'rally': view.shock(e.x, e.z, 9, 0xffd36b, 0.6); view.rune(e.x, e.z, 3, 0xffb040, 1.2, -3); view.flash(e.x, e.z, 0xffb040, 120); if (mine) view.shake = Math.max(view.shake, 0.9); SFX.play('roar'); break;
  }
}
const COL = { knight: 0xcfe0ff, squire: 0xffb060 };
function onEvent(e) {
  const me = S.me;
  switch (e.k) {
    case 'swing': view.arc(e.x, e.z, e.a, e.r, COL[e.role] || 0xffffff); SFX.play('swing'); break;
    case 'shoot': SFX.play(e.pk === 'orb' ? 'orb' : 'arrow'); break;
    case 'eshoot': SFX.play('arrow'); break;
    case 'ehit': if (e.hv) view.spark(e.x, e.z, e.id, true); else view.burst(e.x, 1.6, e.z, 0xe8e0c8, e.crit ? 6 : 3, 4, 0.3, 0.09); num(e.x, e.z, e.v, e.crit ? '#ffd36b' : '#ffffff', e.crit ? 1.3 : 1); SFX.play('hit'); break;
    case 'pdodge': view.ring(e.x, e.z, 2.6, 0x9ad0ff, 0.4); view.streak(e.x, e.z, 0, 0.1, 0x9ad0ff, 0.2, 0.1); view.rise(e.x, e.z, 0x9ad0ff, 10, 1, 0.6, 6); if (e.id === me) { num(e.x, e.z, '완벽한 회피!', '#9ad0ff', 1.3, 4.2); view.flash(e.x, e.z, 0x9ad0ff, 120); SFX.play('parry'); if (S.net === 'solo') S.slowT = Math.max(S.slowT || 0, 0.45); } break;
    case 'heavy': { // 내려찍은 자리: 큰 충격파 두 겹, 흙먼지, 땅 문양, 화면 크게 흔들기
      const hp = view.entPos('p' + e.id); if (hp) { view.ring(hp.x + Math.cos(e.a) * 1.4, hp.z + Math.sin(e.a) * 1.4, 3.4, 0xffe08a, 0.4); view.burst(hp.x + Math.cos(e.a) * 1.4, 0.3, hp.z + Math.sin(e.a) * 1.4, 0xbcae94, 26, 9, 0.6, 0.18); }
      view.shock(e.x, e.z, 6, 0xffe08a, 0.45); view.ring(e.x - Math.cos(e.a) * 0.4, e.z - Math.sin(e.a) * 0.4, 3.2, 0x7ac8ff, 0.6); view.shock(e.x, e.z, 3.2, 0xffffff, 0.3); view.rune(e.x, e.z, 2.2, 0xffb040, 0.7, 0); view.streak(e.x - Math.cos(e.a) * 2.5, e.z - Math.sin(e.a) * 2.5, e.a, 5, 0xfff0b0, 0.28, 0.9); view.rise(e.x, e.z, 0xffd36b, 16, 1.6, 0.6, 9); view.flash(e.x, e.z, 0xffe08a, 150);
      if (e.id === me) { num(e.x, e.z, '강타!', '#ffd36b', 1.5, 4.2); view.shake = Math.max(view.shake, 1.0); if (S.net === 'solo') S.slowT = Math.max(S.slowT || 0, 0.12); } SFX.play('clang'); break; }
    case 'big': { // 사제·종자 세 번째 큰 공격
      const col = e.role === 'priest' ? 0xfff0b0 : 0xffb060; view.shock(e.x, e.z, 3.6, col, 0.4); view.burst(e.x, 1.4, e.z, col, 18, 8, 0.45, 0.14); view.rise(e.x, e.z, col, 10, 1.2, 0.5, 7); view.flash(e.x, e.z, col, 110);
      if (e.id === me) view.shake = Math.max(view.shake, 0.6); SFX.play('clang'); break; }
    case 'weak': num(e.x, e.z, '약점!', '#ff9c4a', 1.4, 3.8); view.shock(e.x, e.z, 3, 0xff7a20, 0.35); view.burst(e.x, 2.4, e.z, 0xffb060, 14, 9, 0.5, 0.14); view.flash(e.x, e.z, 0xff7a20, 90); view.shake = Math.max(view.shake, 0.35); SFX.play('parry'); break;
    case 'phit': num(e.x, e.z, '-' + e.v, '#ff7a6a', 1); if (e.id === me) { view.shake = Math.max(view.shake, 0.5); SFX.play('phit'); } break;
    case 'ekill': {
      const boss = e.en === 'boss', big = boss || e.en === 'elite';
      view.shatter(e.x, e.z, boss ? [0x3a2e2a, 0xff5a3a, 0xe6c15a, 0x5a5f70] : [0xd8d0bc, 0x6a6470, 0x5a5040, 0x8a8a96], boss ? 70 : big ? 30 : 16, big);
      view.burst(e.x, 1.2, e.z, boss ? 0xff3a3a : 0xffe8b0, boss ? 40 : 8, 7, 0.6, 0.12); SFX.play('kill');
      if (big) { view.shock(e.x, e.z, boss ? 12 : 5, boss ? 0xff6a3a : 0xffe08a, boss ? 0.9 : 0.5); view.flash(e.x, e.z, 0xffd08a, boss ? 300 : 120); view.shake = Math.max(view.shake, boss ? 1.6 : 0.6); }
      // 보스가 쓰러지면 화면이 하얗게 번쩍이고 잠깐 느려져요
      if (boss) { view.column(e.x, e.z, 0xfff0b0, 1.6); view.rise(e.x, e.z, 0xffd08a, 40, 4, 2, 6); flashScreen(); S.slowT = 1.4; }
      break;
    }
    case 'block': case 'clang': SFX.play('clang'); view.burst(e.x, 1.8, e.z, 0xffe08a, 4, 4, 0.25, 0.08); break;
    case 'heal': num(e.x, e.z, '+' + e.v, '#9af0a8', 1); view.burst(e.x, 1.5, e.z, 0x9af0c0, 6, 3, 0.7, 0.1); SFX.play('heal'); break;
    case 'ward': { const p = view.entPos('p' + e.id); if (p) { view.dome(p.x, p.z, 1.8, 0x9af0e0, 0.9); view.rise(p.x, p.z, 0x9af0e0, 8, 1, 0.8, 4); } break; }
    case 'rally': { const p = view.entPos('p' + e.id); if (p) { view.ring(p.x, p.z, 2.4, 0xffd36b); view.rise(p.x, p.z, 0xffb040, 8, 1, 0.7, 6); } break; }
    case 'skill': setTimeout(() => skillFx(e), 130); break; // 예비 동작이 끝나고 터지는 순간에 맞춰요
    case 'mark': view.rune(e.x, e.z, 1.6, 0xff3a3a, 1.4, 4); view.column(e.x, e.z, 0xff3a3a, 0.6); view.flash(e.x, e.z, 0xff3a3a, 60); break;
    case 'splash': view.burst(e.x, 0.6, e.z, 0x9af0a8, 16, 6, 0.6, 0.14); view.ring(e.x, e.z, 3, 0x9af0a8, 0.5); view.rise(e.x, e.z, 0x9af0a8, 10, 2.5, 0.8, 4); view.flash(e.x, e.z, 0x9af0a8, 70); break;
    case 'down': SFX.play('down'); if (e.id === me) { S.everDown = true; bigMsg('쓰러졌어요', '동료가 일으켜 줄 때까지 버텨요', 2200); } break;
    case 'revive': view.column(e.x, e.z, 0xfff0b0); SFX.play('revive'); if (e.id === me) bigMsg('다시 일어났어요', '', 1400); break;
    case 'roll': if (e.id !== me) SFX.play('roll'); break;
    case 'spawn': view.burst(e.x, 0.3, e.z, 0x6a5a7a, 10, 3, 0.8, 0.14); SFX.play('spawn'); break;
    case 'slam': view.ring(e.x, e.z, 3.6, 0xff5a3a, 0.45); view.burst(e.x, 0.4, e.z, 0x8a7a6a, 18, 8, 0.7, 0.16); view.shake = Math.max(view.shake, 1.1); SFX.play('slam'); break;
    case 'bsweep': view.arc(e.x, e.z, e.a, 5.4, 0xff6a4a); SFX.play('swing'); view.shake = Math.max(view.shake, 0.5); break;
    case 'bwind': SFX.play('warn'); break;
    case 'bcharge': SFX.play('roar'); break;
    case 'roar': SFX.play('roar'); view.shake = 1; break;
    case 'bphase': { const P = e.p === 2 ? CH.boss.p2 : e.p === 3 ? CH.boss.p3 : null, sub = P && P[1], mp = myP();
      // 기사단장 3단계: 망토가 찢겨 날아가요
      if (e.p === 3 && CH.boss.ai === 'warden') { const b = S.snap && S.snap.en.find(q => q.k === 'boss'); if (b) { view.shatter(b.x, b.z, [0x3a0e14, 0x5a1a22, 0x2a0a10], 36, true); view.shock(b.x, b.z, 7, 0xff5a20, 0.6); view.flash(b.x, b.z, 0xff5a20, 220); } } if (P) { if (mp && mp.dn) toast(P[0] + ' · ' + sub, 3600); else bigMsg(P[0], sub, 3700); } } SFX.play('roar'); view.shake = 1.2; break;
    case 'parry': bigMsg('완벽한 막기!', '보스가 기절했어요. 지금 공격해요', 2400); SFX.play('parry'); view.burst(e.x, 2, e.z, 0xffffff, 16, 8, 0.6, 0.12); view.shake = 0.8; break;
    case 'summon': SFX.play('spawn'); break;
    case 'fire': SFX.play('fire'); break;
    case 'snap': SFX.play('clang'); break;
    case 'disarm': toast('종자가 바닥 함정을 해체했어요.'); SFX.play('click'); break;
    case 'chest': toast('상자에서 명예 25를 얻었어요.'); SFX.play('clear'); break;
    case 'altar': bigMsg('제단의 축복', '축복을 하나 골라요', 2200); SFX.play('clear'); view.column(e.x, e.z, 0xffe08a, 1.2); break;
    case 'checkpoint': bigMsg('모닥불에 불을 붙였어요', '모두 쓰러지면 여기서 다시 시작해요', 3000); SFX.play('door'); break;
    case 'wake': if (!S.wakeT || performance.now() - S.wakeT > 1500) { S.wakeT = performance.now(); SFX.play('spawn'); } view.burst(e.x, 0.3, e.z, 0x6a5a7a, 6, 3, 0.6, 0.12); break;
    case 'bossIntro': { talk('boss', 3400); bigMsg(CH.boss.name, MAP.areas.find(a => a.boss).line, 3400); const b = S.snap && S.snap.en.find(q => q.k === 'boss'); if (b) { view.focusOn(b.x, b.z, 3); view.shock(b.x, b.z, 8, 0xff5a3a, 0.8); view.flash(b.x, b.z, 0xff5a3a, 200); } view.shake = Math.max(view.shake, 0.8); letterbox(3000); break; }
    case 'bvolley': SFX.play('arrow'); view.burst(e.x, 1.8, e.z, 0xffb060, 8, 4, 0.3, 0.1); break;
    case 'nova': SFX.play('orb'); view.shock(e.x, e.z, 4, CH.boss.ai === 'king' ? 0xff7a20 : 0x6ab0ff, 0.4); view.flash(e.x, e.z, CH.boss.ai === 'king' ? 0xff7a20 : 0x6ab0ff, 120); break;
    case 'pillar': view.column(e.x, e.z, 0x6ab0ff, 0.9); view.burst(e.x, 0.5, e.z, 0x9ad0ff, 14, 6, 0.6, 0.14); view.flash(e.x, e.z, 0x6ab0ff, 80); SFX.play('slam'); break;
    case 'blink': view.column(e.x, e.z, 0x9ad0ff, 0.5); view.rise(e.x, e.z, 0x9ad0ff, 12, 1.5, 0.7, 6); SFX.play('orb'); break;
    case 'respawn': view.column(e.x, e.z, 0xff9a48); if (e.id === me) bigMsg('모닥불에서 다시 일어났어요', '', 1800); break;
    case 'wipe': bigMsg('모두 쓰러졌어요', '잠시 뒤 마지막 모닥불에서 다시 시작해요', 3000); SFX.play('wipe'); break;
    case 'restart': toast('깨어 있던 적은 제자리로 돌아갔어요.'); break;
    case 'won': SFX.play('won'); break;
    case 'ach': if (!e.pid || e.pid === me) unlock(e.id); break;
  }
}
// 피해 숫자: 같은 자리에 잇달아 뜨면 하나로 합쳐서 덩어리지지 않게 해요
function num(x, z, v, col, sc = 1, y = 3) {
  v = String(v); const m = /^([+-]?)(\d+)$/.exec(v);
  if (m) { const o = S.nums.find(n => n.col === col && n.t < 0.45 && n.n != null && Math.abs(n.x - x) < 1.6 && Math.abs(n.z - z) < 1.6); if (o) { o.n += +m[2]; o.v = m[1] + o.n; o.t = Math.min(o.t, 0.12); o.sc = Math.min(1.6, Math.max(o.sc, sc) + 0.04); return; } }
  S.nums.push({ x: x + (Math.random() - .5) * 0.6, z, y, v, n: m ? +m[2] : null, col, sc, t: 0 });
  if (S.nums.length > 18) S.nums.shift();
}

/* ---------- 화면 갱신 ---------- */
function syncScene() {
  const sn = S.snap;
  if (!S.built) { view.buildMap(); S.built = true; S.local = null; mini.reset(); }
  if (sn.ph !== S.lastPh) {
    const prev = S.lastPh; S.lastPh = sn.ph;
    if (sn.ph === 'intro') { show('sIntro'); setHud(false); }
    else if (prev === 'intro' || prev === '') { show(''); setHud(true); S.area = -2; }
    if (sn.ph === 'won') { S.wonT = 0; bigMsg('', '', 0); }
  }
  // 새 구역에 처음 들어가면 이름을 보여 줘요
  const me = myP();
  if (me && sn.ph !== 'intro') {
    const pos = S.local || me, a = areaAt(pos.x, pos.z);
    if (a >= 0 && a !== S.area) { S.area = a; if (!S.seenA[a]) { S.seenA[a] = 1; const A = MAP.areas[a]; if (!A.boss) { bigMsg(A.name, A.line, 3200); talk(a, 2600); } } }
    mini.reveal(pos.x, pos.z);
  }
}
function paintIntro() {
  const lines = CH.intro, per = INTRO_T / lines.length, t = S.snap.pt, i = Math.min(lines.length - 1, Math.floor(t / per));
  if (i !== S.introIdx) { S.introIdx = i; const el = $('introLine'); el.classList.remove('on'); setTimeout(() => { el.textContent = lines[i]; el.classList.add('on'); }, 250); }
  $('introBar').firstElementChild.style.width = Math.min(100, t / INTRO_T * 100) + '%';
  const sk = $('introSkip'), voted = S.voted;
  sk.textContent = (voted ? '건너뛰기 기다리는 중' : '건너뛰기') + (S.snap.hu > 1 ? ' (' + S.snap.sk + '/' + S.snap.hu + ')' : '');
  sk.classList.toggle('on', !!voted);
}
function paintHud() {
  const sn = S.snap, me = myP();
  $('roomTag').textContent = CH.title + (S.area >= 0 ? ' · ' + MAP.areas[S.area].name : '') + ' · 남은 적 ' + sn.w.left;
  const boss = sn.w.boss && !sn.w.bd ? sn.en.find(e => e.k === 'boss') : null;
  $('bossBar').style.display = boss ? 'block' : 'none'; if (boss && $('bossName').textContent !== CH.boss.name) $('bossName').textContent = CH.boss.name;
  if (boss) { $('bossHp').style.width = Math.max(0, boss.hp / boss.mx * 100) + '%'; $('bossPh').textContent = boss.sn ? '기절!' : ['', '1단계', '2단계 · ' + CH.boss.ph[0], '3단계 · ' + CH.boss.ph[1]][boss.ph] || ''; }
  // 동료 칸
  const pb = $('party'); if (pb.children.length !== sn.pl.length) { pb.innerHTML = ''; sn.pl.forEach(() => { const d = document.createElement('div'); d.className = 'pf'; d.innerHTML = '<div class="n"><i></i><b></b><span></span></div><div class="hp"><i></i><em></em></div><div class="st"></div>'; pb.appendChild(d); }); }
  sn.pl.forEach((p, i) => {
    const d = pb.children[i], R = ROLES[p.role];
    d.querySelector('.n i').style.background = R.color; d.querySelector('.n b').textContent = R.name; d.querySelector('.n span').textContent = p.id === S.me ? '나' : p.bot ? '봇' : p.name;
    d.querySelector('.hp i').style.width = (p.hp / p.mx * 100) + '%'; d.querySelector('.hp em').style.width = Math.min(100, p.sh / p.mx * 100) + '%';
    d.classList.toggle('down', !!(p.dn || p.dd));
    d.querySelector('.st').textContent = p.dd ? '모닥불에서 ' + Math.max(1, Math.ceil(p.rs)) + '초 뒤 일어나요' : p.dn ? '쓰러짐 ' + Math.ceil(p.bl) + '초' : p.tn ? '외침' : p.ra ? '함성' : '';
  });
  // 기술 칸
  if (me) {
    const R = ROLES[me.role], sk = $('skills');
    if (sk.dataset.role !== me.role) { sk.dataset.role = me.role; sk.innerHTML = ''; R.skills.concat([{ key: 'Space', name: '구르기', cd: 1.2 }]).forEach(s => { const d = document.createElement('div'); d.className = 'sk'; d.innerHTML = `<i class="cd"></i><span class="nm">${s.name}</span><small>${s.key}</small><b class="cn"></b>`; sk.appendChild(d); }); ['tQ', 'tE', 'tR'].forEach((id, i) => $(id).querySelector('span').textContent = R.skills[i].name); }
    const cds = me.cd.concat([me.rc]), maxs = R.skills.map(s => s.cd).concat([1.2]);
    [...sk.children].forEach((d, i) => { const c = Math.max(0, cds[i]); d.querySelector('.cd').style.height = Math.min(100, c / maxs[i] * 100) + '%'; d.querySelector('.cn').textContent = c > 0.05 ? Math.ceil(c) : ''; d.classList.toggle('cool', c > 0.05); });
    ['tQ', 'tE', 'tR', 'tRoll'].forEach((id, i) => { const c = Math.max(0, cds[i]); $(id).querySelector('.cd').style.height = Math.min(100, c / maxs[i] * 100) + '%'; });
  }
  // 안내
  let pr = '';
  if (me && !me.dn && !me.dd) {
    const pos = S.local || me;
    const dn = sn.pl.find(q => q.dn && !q.dd && Math.hypot(q.x - pos.x, q.z - pos.z) < 2.2);
    if (dn) pr = (TOUCH ? 'F 버튼' : 'F') + '를 꾹 눌러 ' + ROLES[dn.role].name + ' 일으키기';
    else if (MAP.chests.some(([x, y], k) => !sn.w.ch[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.6)) pr = (TOUCH ? 'F 버튼' : 'F') + '를 꾹 눌러 상자 열기';
    else if (MAP.fires.some(([x, y], k) => !sn.w.fi[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 3)) pr = (TOUCH ? 'F 버튼' : 'F') + '를 꾹 눌러 모닥불 피우기';
    else if (MAP.altars.some(([x, y], k) => !sn.w.al[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.8)) pr = (TOUCH ? 'F 버튼' : 'F') + '를 꾹 눌러 제단에서 축복 받기';
    else if (MAP.fires.some(([x, y], k) => sn.w.fi[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 4) && me.hp < me.mx) pr = '모닥불 곁에서 체력이 차올라요';
    else if (sn.bless && Object.values(sn.bless).some(Boolean) && !(sn.bless[S.me])) pr = '동료가 축복을 고르는 중이에요';
  }
  const pe = $('prompt'); pe.textContent = pr; pe.style.display = pr ? 'block' : 'none';
}
/* 작은 지도: 가 본 곳만 보여요 */
const WATERC = (i, j) => MAP.water.some(([x, y, w, h]) => i >= x && i < x + w && j >= y && j < y + h);
const mini = {
  c: document.createElement('canvas'), seen: new Uint8Array(MW * MH), dirty: true,
  reset() { this.seen.fill(0); this.c.width = MW * 3; this.c.height = MH * 3; this.dirty = true; },
  reveal(x, z) {
    const ci = Math.floor(x / CS), cj = Math.floor(z / CS), R = 9;
    for (let j = cj - R; j <= cj + R; j++) for (let i = ci - R; i <= ci + R; i++) { if (i < 0 || j < 0 || i >= MW || j >= MH || (i - ci) ** 2 + (j - cj) ** 2 > R * R) continue; const k = j * MW + i; if (!this.seen[k]) { this.seen[k] = 1; this.dirty = true; } }
  },
  paint() {
    const g = this.c.getContext('2d'); g.clearRect(0, 0, this.c.width, this.c.height);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) { if (!this.seen[j * MW + i] || !floorCell(i, j)) continue; g.fillStyle = WATERC(i, j) ? '#6a8ab0' : '#a49cb0'; g.fillRect(i * 3, j * 3, 3, 3); }
    this.dirty = false;
  },
  draw(sn) {
    if (this.dirty) this.paint();
    const sc = innerWidth < 700 ? 1.4 : 2, w = MW * sc, h = MH * sc, x0 = innerWidth - w - 14, y0 = 64;
    oc.globalAlpha = 0.82; oc.fillStyle = 'rgba(10,8,14,.75)'; oc.fillRect(x0 - 4, y0 - 4, w + 8, h + 8); oc.drawImage(this.c, x0, y0, w, h); oc.globalAlpha = 1;
    const P = (wx, wz) => [x0 + wx / CS * sc, y0 + wz / CS * sc];
    MAP.fires.forEach(([fx, fy], k) => { if (!this.seen[fy * MW + fx | 0]) return; const [a, b] = P(cw(fx), cw(fy)); oc.fillStyle = sn.w.fi[k] ? '#ffb040' : '#6a5a4a'; oc.fillRect(a - 2.5, b - 2.5, 5, 5); });
    MAP.altars.forEach(([ax, ay], k) => { if (!this.seen[(ay | 0) * MW + (ax | 0)] || sn.w.al[k]) return; const [a, b] = P(cw(ax), cw(ay)); oc.fillStyle = '#ffe08a'; oc.beginPath(); oc.arc(a, b, 2.5, 0, 7); oc.fill(); });
    for (const p of sn.pl) { if (p.dd) continue; const q = p.id === S.me && S.local ? S.local : p, [a, b] = P(q.x, q.z); oc.fillStyle = ROLES[p.role].color; oc.beginPath(); oc.arc(a, b, p.id === S.me ? 3.5 : 2.5, 0, 7); oc.fill(); if (p.id === S.me) { oc.strokeStyle = '#fff'; oc.lineWidth = 1.2; oc.stroke(); } }
  }
};
function drawOverlay(dt) {
  oc.clearRect(0, 0, innerWidth, innerHeight);
  const sn = S.snap; if (!sn || S.scr === 'sIntro') return;
  if (sn.w) mini.draw(sn);
  oc.textAlign = 'center'; oc.textBaseline = 'middle';
  // 적 체력
  for (const e of sn.en) {
    if (e.k === 'boss' || e.hp <= 0 || e.st === 'rise') continue;
    const E = view.ents.get('e' + e.id); if (!E) continue;
    const h = e.k === 'elite' ? 4.6 : 3.4, s = view.project(E.x, h, E.z), w = e.k === 'elite' ? 54 : 38;
    if (e.hp < e.mx) { oc.fillStyle = 'rgba(20,10,14,.85)'; oc.fillRect(s.x - w / 2 - 1, s.y - 1, w + 2, 6); oc.fillStyle = '#d0443a'; oc.fillRect(s.x - w / 2, s.y, w * e.hp / e.mx, 4); }
    if (e.mk) { oc.fillStyle = '#ff5a4a'; oc.font = 'bold 16px system-ui'; oc.fillText('▼', s.x, s.y - 12); }
    if (e.sl && !e.sn && !e.mk) { oc.fillStyle = '#7ac8ff'; oc.font = 'bold 12px system-ui'; oc.strokeStyle = '#140f18'; oc.lineWidth = 3; const ly = s.y - (e.k === 'elite' ? 28 : 11); oc.strokeText('둔화', s.x, ly); oc.fillText('둔화', s.x, ly); }
    if (e.sn) { oc.fillStyle = '#ffe08a'; oc.font = 'bold 14px system-ui'; oc.fillText('★ ★', s.x, s.y - 12); }
    if (e.k === 'elite') { oc.fillStyle = '#efe3c8'; oc.font = 'bold 13px system-ui'; oc.strokeStyle = '#140f18'; oc.lineWidth = 4; oc.strokeText(FOES[chapterIndex()].elite.name, s.x, s.y - 12); oc.fillText(FOES[chapterIndex()].elite.name, s.x, s.y - 12); }
  }
  // 동료 이름, 쓰러짐
  const tags = [];
  for (const p of sn.pl) {
    if (p.dd) continue; const E = view.ents.get('p' + p.id); if (!E) continue;
    const s = view.project(E.x, 3.9, E.z);
    // 이름표가 겹치면 위로 비켜 올려요
    if (p.id !== S.me) { for (let k = 0; k < 4 && tags.some(t => Math.abs(t.x - s.x) < 64 && Math.abs(t.y - s.y) < 20); k++) s.y -= 20; tags.push({ x: s.x, y: s.y }); oc.font = 'bold 13px system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const t = p.bot ? ROLES[p.role].name + ' 봇' : p.name; oc.strokeText(t, s.x, s.y - 10); oc.fillStyle = ROLES[p.role].color; oc.fillText(t, s.x, s.y - 10); oc.fillStyle = 'rgba(20,10,14,.85)'; oc.fillRect(s.x - 20, s.y - 1, 40, 6); oc.fillStyle = '#4cc06a'; oc.fillRect(s.x - 19, s.y, 38 * p.hp / p.mx, 4); }
    if (p.dn) {
      const c = view.project(E.x, 1.5, E.z); oc.lineWidth = 5; oc.strokeStyle = 'rgba(20,10,14,.85)'; oc.beginPath(); oc.arc(c.x, c.y - 30, 16, 0, 7); oc.stroke();
      oc.strokeStyle = '#fff0b0'; oc.beginPath(); oc.arc(c.x, c.y - 30, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.rv / 1.6)); oc.stroke();
      oc.fillStyle = '#ff9c94'; oc.font = 'bold 13px system-ui'; oc.fillText(Math.ceil(p.bl), c.x, c.y - 30);
    }
  }
  // 내 연타 수와 집중 상태
  { const p = sn.pl.find(q => q.id === S.me), E = p && view.ents.get('p' + p.id);
    if (E && !p.dn) { const c = view.project(E.x, 4.1, E.z); oc.lineWidth = 4; oc.strokeStyle = '#140f18';
      if (p.fc) { oc.font = 'bold 13px system-ui'; oc.strokeText('집중 · 피해 +50%', c.x, c.y - 18); oc.fillStyle = '#9ad0ff'; oc.fillText('집중 · 피해 +50%', c.x, c.y - 18); } } }
  // 피해 숫자
  for (const n of S.nums) { n.t += dt; const s = view.project(n.x, n.y + n.t * 2.2, n.z); oc.globalAlpha = Math.max(0, 1 - n.t / 0.9); oc.font = 'bold ' + Math.round(18 * n.sc) + 'px system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; oc.strokeText(n.v, s.x, s.y); oc.fillStyle = n.col; oc.fillText(n.v, s.x, s.y); }
  oc.globalAlpha = 1; S.nums = S.nums.filter(n => n.t < 0.9);
}
// 장을 깼을 때: 명예와 이야기 진행을 저장해요 (한 장에 한 번)
function clearChapter() {
  if (S.cleared) return S.lastH || 0; S.cleared = true;
  const h = S.lastH = awardHonor() || 0, me = myP(), ci = chapterIndex();
  if (me) { SAVE.clears[me.role] = Math.max(SAVE.clears[me.role] || 0, ci + 1); if (!S.everDown) unlock('nodown'); if (ROLE_IDS.every(r => SAVE.clears[r])) unlock('all4'); }
  if (ci === 0) unlock('boss'); else unlock('ch' + (ci + 1));
  SAVE.chMax = Math.max(SAVE.chMax | 0, ci + 1); save();
  return h;
}
// 결말이 끝나면 같은 동료와 다음 장 이야기로 바로 넘어가요
function afterOutro() {
  const ci = chapterIndex(), h = clearChapter();
  if (ci + 1 >= CHAPTERS.length) { showResult(); return; }
  S.resultShown = true;
  if (S.net === 'guest') { bigMsg(CH.title + ' 완료', '명예 ' + h + ' · 방장과 함께 다음 장으로 가요', 0); return; }
  toast(CH.title + ' 완료 · 명예 ' + h, 3200);
  S.chSel = ci + 1; beginGame(S.G);
}
function showResult() {
  S.resultShown = true; const h = clearChapter();
  const ci = chapterIndex(); S.chSel = chOpen();
  const next = ci + 1 < CHAPTERS.length ? `<p class="note">${CHAPTERS[ci + 1].title}이 열렸어요.</p>` : '<p class="note">모든 장을 깼어요. 서약을 끝까지 지켰어요.</p>';
  const rows = S.snap.pl.map(p => `<tr><td style="color:${ROLES[p.role].color}">${ROLES[p.role].name}</td><td>${esc(p.id === S.me ? '나' : p.bot ? '봇' : p.name)}</td><td>${(p.b || []).map(b => (BLESSINGS.find(x => x.id === b) || {}).name).join(', ') || '-'}</td></tr>`).join('');
  $('result').innerHTML = `<div class="big">${CH.title} 완료</div><p class="note">${CH.outro.join(' ')}</p><table>${rows}</table><p>받은 명예 <b style="color:#ffd36b">${h}</b> · 지금 명예 ${SAVE.honor}</p>${next}<div class="row"><button class="btn gold" id="resBack">로비로</button></div>`;
  $('resBack').onclick = () => endToLobby('');
  setHud(false); show('sResult');
}

/* ---------- 메인 루프 ---------- */
// 규칙은 1초에 30번 돌아요. 그 사이 화면은 직전 위치와 지금 위치 사이를 이어서 그려 부드럽게 움직여요.
function posMap(G) { const m = new Map(); for (const a of [G.players, G.enemies, G.projs]) for (const o of a) m.set(o.id, [o.x, o.z]); return m; }
function smoothSnap(sn, G, prev, al) {
  if (!prev) return; const cur = new Map(); for (const a of [G.players, G.enemies, G.projs]) for (const o of a) cur.set(o.id, o);
  for (const a of [sn.pl, sn.en, sn.pr]) for (const o of a) { const c = cur.get(o.id), p = prev.get(o.id); if (!c) continue; if (!p || Math.abs(c.x - p[0]) + Math.abs(c.z - p[1]) > 3) { o.x = c.x; o.z = c.z; continue; } o.x = p[0] + (c.x - p[0]) * al; o.z = p[1] + (c.z - p[1]) * al; }
}
// 배경음악: 화면 밖(로비, 이야기)은 로비 곡, 기사단장의 방에서 싸우는 동안은 보스 곡, 나머지 던전은 동굴 곡
function musicTick(dt, now) {
  const sn = S.snap, playing = !!sn && S.scr === '' && sn.ph === 'play';
  const want = !playing ? 'lobby' : (sn.w.boss && !sn.w.bd && S.area === MAP.areas.findIndex(a => a.boss) ? 'boss' : 'dungeon');
  MUS.tick(want, dt, now);
}
addEventListener('pointerdown', () => MUS.kick()); addEventListener('keydown', () => MUS.kick());
let lastT = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; const t = (now - S.t0) / 1000;
  musicTick(dt, now); talkTick(dt, !!S.snap && S.scr === '' && (S.snap.ph === 'play' || S.snap.ph === 'bossIntro'));
  if (S.snap && (S.G || S.net === 'guest') && S.scr !== 'sLobby' && S.scr !== 'sRoom') {
    const me = myP();
    const inp = me ? gatherInput(me) : {};
    if (S.G) {
      // 방장·혼자: 규칙을 직접 돌려요
      // 한 번 누르는 입력은 규칙이 실제로 돌 때까지 모아 둬요 (화면이 규칙보다 자주 그려져도 눌림이 사라지지 않게)
      const pr = S.rin[S.me]; if (pr) for (const k of ['q', 'e', 'r', 'roll', 'skip']) inp[k] = inp[k] || pr[k];
      S.rin[S.me] = inp;
      if (S.slowT > 0) S.slowT -= dt;
      S.acc += dt * (S.slowT > 0 ? 0.35 : 1); const h = 1 / 30;
      while (S.acc >= h) {
        S.acc -= h; S.prevPos = posMap(S.G); step(S.G, h, S.rin);
        for (const pid in S.rin) { const r = S.rin[pid]; r.q = r.e = r.r = r.roll = r.skip = 0; }
        for (const e of S.G.ev) { S.evq.push(e); if (S.net === 'host') (S.netEv || (S.netEv = [])).push(e); }
        S.G.ev.length = 0;
      }
      S.snap = snapshot(S.G); smoothSnap(S.snap, S.G, S.prevPos, S.acc / h);
      if (S.net === 'host') { S.sendAcc += dt; if (S.sendAcc >= 1 / SNAP_HZ) { S.sendAcc = 0; bcast({ t: 's', S: S.snap, ev: S.netEv || [] }); S.netEv = []; } }
    } else if (me) {
      // 게스트: 내 이동은 바로, 나머지는 방장에게 보내요
      if (!S.local || S.local.ri !== S.snap.ri) S.local = { x: me.x, z: me.z, ri: S.snap.ri, roll: 0, rollCd: 0 };
      localMove(me, inp, dt);
      S.sendAcc += dt; const o = S.pend || (S.pend = {}); o.q = o.q || inp.q; o.e = o.e || inp.e; o.r = o.r || inp.r; o.roll = o.roll || inp.roll; o.skip = o.skip || inp.skip;
      if (S.sendAcc >= 1 / 30) { S.sendAcc = 0; send({ t: 'i', px: +S.local.x.toFixed(2), pz: +S.local.z.toFixed(2), aim: inp.aim, ax: inp.ax, az: inp.az, atk: !!inp.atk, f: !!inp.f, q: o.q, e: o.e, r: o.r, roll: o.roll, skip: o.skip }); S.pend = {}; }
      me.x = S.local.x; me.z = S.local.z; if (S.local.roll > 0) me.ro = 1; if (inp.aim != null) me.a = inp.aim;
    }
    syncScene();
    const ph = S.snap.ph;
    if (ph === 'intro') paintIntro();
    else {
      for (const e of S.evq) onEvent(e); S.evq.length = 0;
      view.sync(S.snap, S.me, dt, t, !!S.G); paintHud(); paintBless();
      if (ph === 'won') { S.wonT += dt; if (S.wonT > 1.5 && S.wonT < 9) bigMsg(CH.outro[Math.min(CH.outro.length - 1, Math.floor((S.wonT - 1.5) / 2.5))], TOUCH ? '화면을 누르면 건너뛰어요' : 'Space 키로 건너뛰어요', 0); if (S.wonT >= 9 && !S.resultShown) afterOutro(); }
    }
    S.evq.length = 0;
  }
  view.tick(dt, t); view.render();
  if (S.snap && S.snap.ph !== 'intro' && $('hud').classList.contains('on')) drawOverlay(dt); else oc.clearRect(0, 0, innerWidth, innerHeight);
}
requestAnimationFrame(frame);

// 시험용: ?test=1 로 바로 혼자 원정을 시작해요 (화면 확인용). &skip=1 이야기 건너뛰기, &room=구역 번호
// 내 컴퓨터에서 열었을 때만 돼요 (배포된 주소에서는 잠긴 장이 열리지 않게)
const DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
if (DEV && qs.get('test')) {
  const r = qs.get('role') || 'knight'; SAVE.role = r;
  S.net = 'solo'; S.slots = ROLE_IDS.map(x => ({ role: x, uid: x === r ? UID : null, name: x === r ? myName() : '' }));
  S.chSel = +(qs.get('ch') || 1) - 1;
  beginGame(); const ri = +(qs.get('room') || 0);
  if (qs.get('skip')) { S.G.phase = 'play'; S.G.phaseT = 0; }
  if (ri) { const A = MAP.areas[ri], [x, y, w, h] = A.r[0]; const c = A.boss ? { x: cw(MAP.boss[0]), z: cw(MAP.boss[1] + 6) } : { x: (x + w / 2) * CS, z: (y + h - 1.5) * CS }; S.G.players.forEach((p, i) => { p.x = c.x + (i - 1.5) * 1.6; p.z = c.z; mapCollide(p, 0.6); }); }
  window.__S = S;
}
if (DEV && qs.get('dbg')) window.__S = S;

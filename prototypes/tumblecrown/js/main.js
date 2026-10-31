// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 흐름, 조작, 멀티(친구 초대, PeerJS), 저장
import { View } from './render.js';
import { createGame, step, snapshot, chooseBless, carryOver, koPlayer, INTRO_T, HV_DELAY, wallClamp, setupRange } from './sim.js';
import { PUSH_N, PUSH_T, TEAMS, FLAG_T, RESP_T, ARENA_THEMES, ROLES, ROLE_IDS, COLORS, BOT_NAMES, MAX_PLAYERS, BLESSINGS, CHAPTERS, CH, FOES, MAP, ACHIEVEMENTS, TALK, GEAR_TIERS, GEAR_COST, COSMETICS, MIDB, WEEKLY, weekInfo, VERSION, BUILD, roleLevel, LORE, COMBOS, CURSES, DEEP, DEEP_I, TALK_X, ROLE_PUZ, flagShown } from './data.js';
import { collide as mapCollide, areaAt, floorCell, MW, MH, CS, cw, useChapter, chapterIndex, SOPEN, openSecret, resetSecrets, hiddenCell, GOPEN, openGate, setDoors, DSTATE, PDOWN, dropPillar, LIFTH, liftOk, CUT } from './map.js';
import * as SFX from './sfx.js';
import * as MUS from './music.js';
import { T, trDom } from './tr.js';

trDom(document.body);

const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const DEV_CH = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && qs.has("ch");
const PUB_CAP = 10, PICK_T = 25, PREFIX = 'ff-tumblecrown-', CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', SNAP_HZ = 20;
const TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (TOUCH) document.body.classList.add('touch');

/* ---------- 저장 ---------- */
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const SAVE = Object.assign({ honor: 0, xp: {}, gear: {}, ach: {}, clears: {}, role: 'knight', cos: { own: {}, on: {} }, set: { vol: 70, px: 3, bloom: 1, shake: 1 } }, lsGet('tumblecrown.save', {}));
SAVE.set = Object.assign({ mv: 'wasd', keys: {}, vol: 70, px: 3, bloom: 1, shake: 1, opt: matchMedia('(pointer: coarse)').matches ? 1 : 0 }, SAVE.set || {});
// 최적화: 허브 설정의 공용 값(ff_perf)이 있으면 그걸 따르고, 여기서 바꾸면 공용 값도 같이 바꿔요
let FPS_CAP = 0;
function perfApply() {
  let has = false; try { has = !!localStorage.getItem('ff_perf'); } catch (e) { }
  const P = window.FFPerf && has ? FFPerf.get() : null;
  if (P) SAVE.set.opt = P.low || P.fx === 'low' ? 1 : 0;
  FPS_CAP = P && P.fps ? P.fps : SAVE.set.opt ? 30 : 0;
  try { view.setLow(!!SAVE.set.opt); } catch (e) { }   // 처음 부를 때는 아직 화면(view)이 없어요
}
perfApply();
addEventListener('ffperf', () => { perfApply(); if (S.scr === 'sSettings') paintSettings(); });
// 깬 장 수 (예전 저장은 1장을 깼으면 1)
if (SAVE.chMax == null) SAVE.chMax = Object.keys(SAVE.clears || {}).length ? 1 : 0;
SAVE.cos = SAVE.cos || { own: {}, on: {} }; SAVE.cos.own = SAVE.cos.own || {}; SAVE.cos.on = SAVE.cos.on || {};
SAVE.lore = SAVE.lore || {}; SAVE.flags = SAVE.flags || {}; SAVE.puz = SAVE.puz | 0; SAVE.combos = SAVE.combos || {}; SAVE.deepBest = SAVE.deepBest | 0;
// 다음에 이어서 할 장 (모든 장을 깼으면 1장부터 새 원정)
const chOpen = () => (SAVE.chMax | 0) >= CHAPTERS.length ? 0 : SAVE.chMax | 0;
function save() { lsSet('tumblecrown.save', SAVE); }
let UID = lsGet('tumblecrown.uid', null); if (!UID) { UID = 'u' + Math.random().toString(36).slice(2, 10); lsSet('tumblecrown.uid', UID); }
const gearOf = r => Object.assign({ weapon: 0, armor: 0 }, SAVE.gear[r] || {});

/* ---------- 상태 ---------- */
const S = {
  scr: 'lobby', net: null, code: '', peer: null, conns: {}, conn: null, slots: [], G: null, snap: null, me: null,
  rin: {}, acc: 0, sendAcc: 0, evq: [], built: false, area: -2, seenA: {}, lastPh: '', nums: [], local: null, saved: false,
  wonT: 0, resultShown: false, everDown: false, lastBless: null, t0: performance.now(), chSel: 0
};
S.chSel = chOpen();
const view = new View($('gl'));
view.lobbyFlags = SAVE.flags; view.cos = SAVE.cos.on; view.setLow(!!SAVE.set.opt); view.setPixel(SAVE.set.px); view.setBloom(!!SAVE.set.bloom); view.shakeOn = !!SAVE.set.shake; SFX.setVol(SAVE.set.vol / 100); MUS.setVol((SAVE.set.mus != null ? SAVE.set.mus : SAVE.set.vol) / 100);
// 처음 인트로: 글자 두 장면(Made by / With). 건너뛸 수 없어요 (끝까지 재생). 뒤에는 로비 장면이 깔려 있어요
let INTRO = !(qs.get('test') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
window.__introSongDone = INTRO ? 0 : 1;
view.buildLobby(false);   // 인트로 배경은 진짜 봇 경기를 찍은 영상 (intro-battle). 영상이 안 나오면 직접 그린 싸움 장면으로 대신해요
if (INTRO) { const tv = $('tcVid'); if (tv) { const bad = () => { if (INTRO) view.buildLobby(true); tv.remove(); }; tv.addEventListener('error', bad, true); tv.play && tv.play().catch(() => { }); } }
if (INTRO) MUS.sting(() => setTimeout(() => { view.buildLobby(false); INTRO = false; window.__introSongDone = 1; document.documentElement.classList.add('tcReady'); $('tcIntro').classList.add('out'); setTimeout(() => $('tcIntro').remove(), 900); }, 6200), h => {
  const el = $('tcIntro'); el.classList.toggle('hold', h);
  if (h) { const t = document.createElement('div'); t.id = 'tcHold'; t.textContent = T('화면을 누르면 시작해요'); el.appendChild(t); } else { const t = $('tcHold'); if (t) t.remove(); }
});
else { document.documentElement.classList.add('tcReady'); $('tcIntro').remove(); }
addEventListener('resize', () => { view.resize(); sizeOv(); });
const ov = $('ov'), oc = ov.getContext('2d');
function sizeOv() { const d = Math.min(2, devicePixelRatio || 1); ov.width = innerWidth * d; ov.height = innerHeight * d; oc.setTransform(d, 0, 0, d, 0, 0); }
sizeOv();
$('ver').textContent = VERSION + ' (build ' + BUILD + ')';

/* ---------- 화면 전환 ---------- */
function show(id) {
  document.querySelectorAll('.scr').forEach(e => e.classList.toggle('on', e.id === id));
  $('storm').classList.remove('on');
  if (id === 'sLobby' || id === 'sWeps' || id === 'sNotes' || id === 'sSettings') view.setPreview(null);
  S.scr = id;
}
function inGame() { return !!S.snap && S.scr !== 'sLobby' && S.scr !== 'sRoom'; }
function setHud(on) { $('hud').classList.toggle('on', on); $('touch').classList.toggle('on', on && TOUCH); $('exitBtn').style.display = on && S.net && S.net !== 'solo' ? 'none' : ''; }   // 온라인 대전 중에는 나가기 버튼이 없어요
// 같이 할 사람을 찾는 중에는 어떤 버튼도 누를 수 없어요 (찾기가 끝나거나 실패하면 풀려요, 늦어져도 25초 뒤엔 풀려요)
function homeMsg(t) {
  $('homeMsg').textContent = t || '';
  const on = t === T('같이 할 사람을 찾는 중...'); $('findBlock').style.display = on ? 'block' : 'none';
  clearTimeout(homeMsg._t); if (on) homeMsg._t = setTimeout(() => { $('findBlock').style.display = 'none'; }, 25000);
}
addEventListener('keydown', e => { if ($('findBlock').style.display === 'block') { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
function toast(t, ms = 2200) { const el = $('toast'); el.textContent = t; el.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => el.style.display = 'none', ms); }
// 보스 등장 때 위아래 검은 띠, 보스가 쓰러질 때 하얀 번쩍임
// 내가 쓰러뜨리면 화면 위쪽에 크게 알려요 (8초 안에 이어서 쓰러뜨리면 연속 처치 수가 올라가요)
function killBanner(name) {
  const now = performance.now(); S.kN = now - (S.kT || 0) < 8000 ? (S.kN | 0) + 1 : 1; S.kT = now;
  const el = $('killBanner'); el.innerHTML = '<b>' + T('처치!') + '</b> ' + esc(name) + (S.kN > 1 ? '<i>' + T('{0}연속 처치', S.kN) + ' · ' + T('기술 대기 절반') + '</i>' : '');
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(killBanner._t); killBanner._t = setTimeout(() => el.classList.remove('on'), 2200);
}
function killFeed(txt, mine) {
  const box = $('killFeed'), d = document.createElement('div'); d.className = 'kf' + (mine ? ' me' : ''); d.textContent = txt; box.prepend(d);
  while (box.children.length > 4) box.lastChild.remove();
  setTimeout(() => d.classList.add('out'), 4200); setTimeout(() => d.remove(), 4800);
}
function letterbox(ms) { document.body.classList.add('lbox'); clearTimeout(letterbox._t); letterbox._t = setTimeout(() => document.body.classList.remove('lbox'), ms); }
function redFlash(a) { const f = $('wflash'); f.style.transition = 'none'; f.style.background = '#ff3a2a'; f.style.opacity = a; requestAnimationFrame(() => { f.style.transition = 'opacity .35s'; f.style.opacity = 0; setTimeout(() => { f.style.background = ''; }, 400); }); }
function flashScreen() { const f = $('wflash'); f.style.transition = 'none'; f.style.opacity = 0.85; requestAnimationFrame(() => { f.style.transition = 'opacity 1.1s'; f.style.opacity = 0; }); }
function bigMsg(a, b, ms = 2400) { $('bigMsg').textContent = a || ''; $('subMsg').textContent = b || ''; $('bigMsg').style.opacity = a ? 1 : 0; $('subMsg').style.opacity = b ? 1 : 0; clearTimeout(bigMsg._t); if (ms) bigMsg._t = setTimeout(() => { $('bigMsg').style.opacity = 0; $('subMsg').style.opacity = 0; }, ms); }

/* ---------- 게임 중 대사 ---------- */
// 구역에 처음 들어가거나 보스가 나타나면 동료들이 한두 마디씩 해요. 한 줄씩 글자가 찍히고 잠시 뒤 다음 줄로 넘어가요
const TK = { q: [], cur: null, wait: 0, gen: 0 };
function talk(key, delay = 0) {
  return;   // 대전에는 이야기도 대사도 없어요
  const gen = TK.gen, L = (TALK[chapterIndex()] || {})[key] || TALK_X[key]; if (!L) return;
  setTimeout(() => { if (gen !== TK.gen) return; for (const [r, t] of L) TK.q.push({ r, t }); }, delay);
}
// 옛 기록 얼굴 칸: 금빛 글자가 새겨진 비석 그림
function loreIcon() {
  if (loreIcon.u) return loreIcon.u; const c = document.createElement('canvas'); c.width = c.height = 30; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 30, 30); g.fillStyle = '#5a5662'; g.fillRect(8, 6, 14, 22); g.fillRect(10, 4, 10, 2); g.fillStyle = '#7a7686'; g.fillRect(9, 7, 3, 20);
  g.fillStyle = '#ffd36b'; for (const [x, y, w] of [[12, 9, 7], [11, 13, 8], [13, 17, 5], [11, 21, 8]]) g.fillRect(x, y, w, 2); g.fillStyle = '#3a3640'; g.fillRect(6, 27, 18, 3);
  return loreIcon.u = c.toDataURL();
}
function talkReset() { TK.gen++; TK.q.length = 0; TK.cur = null; TK.wait = 0; $('talk').classList.remove('on'); }
function talkTick(dt, on) {
  const el = $('talk');
  if (!on) { el.classList.remove('on'); return; }
  if (!TK.cur) {
    if ((TK.wait -= dt) > 0 || !TK.q.length) { if (!TK.q.length) el.classList.remove('on'); return; }
    TK.cur = TK.q.shift(); TK.cur.age = 0; const R = ROLES[TK.cur.r] || { name: T('옛 기록'), color: '#ffd36b' };
    $('talkFace').src = TK.cur.r === 'lore' ? loreIcon() : view.portrait(TK.cur.r, true); $('talkWho').textContent = R.name; $('talkWho').style.color = R.color === '#e8e4ef' ? '#efe3c8' : R.color; el.classList.add('on');
  }
  const c = TK.cur; c.age += dt; const n = Math.min(c.t.length, Math.floor(c.age * 30)); $('talkText').textContent = c.t.slice(0, n);
  if (c.age > c.t.length / 30 + 2.4) { TK.cur = null; TK.wait = 0.25; }
}

/* ---------- 로그인 ---------- */
function loggedIn() { try { return !!(window.FFAuth && FFAuth.user()); } catch (e) { return false; } }
function myName() { try { const n = window.FFAuth && FFAuth.user() && FFAuth.nickname(); if (n) return String(n).slice(0, 15); } catch (e) { } return T('기사'); }
function paintWho() {
  $('who').innerHTML = '';
  const s = document.createElement('span'); s.className = 'tx'; s.textContent = loggedIn() ? myName() : T('로그인 안 함'); $('who').appendChild(s);
  if (!loggedIn() && window.FFAuth) { const b = document.createElement('button'); b.textContent = T('로그인'); b.onclick = () => { try { FFAuth.openLogin(); } catch (e) { } }; $('who').appendChild(b); }
}
// 계정 연동: 플레이 기록과 업적을 Frenchfries777 계정 프로필로 보내요
let ffMarked = '', ffAchT = 0;
function ffProfile() {
  if (window.FFProfile) return Promise.resolve(true);
  return new Promise(res => { const s = document.createElement('script'); s.src = 'https://frenchfries777mc.github.io/games/ff-profile.js?v=20261024b'; s.onload = () => res(!!window.FFProfile); s.onerror = () => res(false); document.head.appendChild(s); });
}
function ffSync() {
  return; // 시험작이라 계정 기록·업적을 보내지 않아요
  clearTimeout(ffAchT); ffAchT = setTimeout(async () => {
    try {
      const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u || !(await ffProfile())) return;
      if (ffMarked !== u.id) { ffMarked = u.id; FFProfile.markPlayed(sb, 'tumblecrown'); }
      const ids = ACHIEVEMENTS.filter(a => SAVE.ach[a.id]).map(a => a.id);
      if (FFProfile.setAchievements) FFProfile.setAchievements(sb, 'tumblecrown', ids.length, ACHIEVEMENTS.length, ids);
    } catch (e) { }
  }, 1500);
}
if (window.FFAuth) { FFAuth.ready.then(() => { paintWho(); autoJoin(); ffSync(); }); FFAuth.onChange(() => { paintWho(); ffSync(); }); }
paintWho();
function needLogin() { if (!window.FFAuth) return false; if (loggedIn()) return false; homeMsg(T('친구와 대전은 Frenchfries777 계정으로 로그인해야 해요.')); try { FFAuth.openLogin(); } catch (e) { } return true; }
function hubRoom(on) { try { if (window.FFAuth && FFAuth.setRoom) FFAuth.setRoom(on && S.code ? { game: 'tumblecrown', code: S.code, path: 'prototypes/tumblecrown/index.html' } : null); } catch (e) { } }
let autoDone = false;
function autoJoin() { const c = (qs.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (autoDone || c.length !== 6 || S.net) return; autoDone = true; if (needLogin()) return;
  // 초대 링크로 들어왔을 때: 취소됐거나 30분이 지난 초대면 들어가지 않아요 (확인 기능이 아직 없으면 그냥 들어가요)
  const sb = window.FFAuth && FFAuth.client && FFAuth.client();
  if (!sb) { startGuest(c); return; }
  sb.rpc('ff_invite_live', { p_code: c }).then(r => { if (r && !r.error && r.data === false) homeMsg(T('취소됐거나 30분이 지나 만료된 초대예요.')); else startGuest(c); }, () => startGuest(c));
}

/* ---------- 메뉴 ---------- */
document.querySelectorAll('#menu button, #menu2 button').forEach(b => b.addEventListener('click', () => { SFX.unlock(); SFX.play('click'); menu(b.dataset.go); }));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { SFX.play('click'); if (S.scr === 'sRoom') leaveNet(); show('sLobby'); paintWho(); }));
function menu(go) {
  homeMsg('');
  if (go === 'solo') { leaveNet(); S.net = 'solo'; S.slots = [meSlot()]; newBots(); openRoom(); }
  if (go === 'range') { leaveNet(); S.net = 'solo'; S.range = true; S.slots = [meSlot()]; newBots(); openRoom(); }
  else if (go === 'match') { if (needLogin()) return; startMatch(); }
  else if (go === 'host') { if (needLogin()) return; startHost(); }
  else if (go === 'ward') { S.wardTab = S.wardTab || 'skin'; S.wardSel = null; paintWard(); show('sWard'); view.cos = SAVE.cos.on; view.setPreview(SAVE.role, COLORS[SAVE.col | 0].c); }
  else if (go === 'weps') { paintWepInfo(); show('sWeps'); }
  else if (go === 'notes') { loadNotes(); show('sNotes'); }
  else if (go === 'settings') { paintSettings(); show('sSettings'); }
  else if (go === 'site') { try { window.close(); } catch (e) { } setTimeout(() => { location.href = '../../'; }, 250); }   // 창이 닫히면 그대로 사라지고, 못 닫으면 사이트로 가요
}
// 치장·스킨: 재화는 tC. 한 번 사면 계속 쓸 수 있고, 눌러서 입고 벗어요
function paintWard() {
  const tabs = Object.keys(COSMETICS), cur = COSMETICS[S.wardTab] ? S.wardTab : tabs[0];
  $('wardTc').textContent = SAVE.honor + ' tC';
  $('wardTabs').innerHTML = tabs.map(k => '<button data-k="' + k + '"' + (k === cur ? ' class="on"' : '') + '>' + COSMETICS[k].name + '</button>').join('');
  $('wardTabs').querySelectorAll('button').forEach(b => b.onclick = () => { SFX.play('click'); S.wardTab = b.dataset.k; paintWard(); });
  const on = SAVE.cos.on[cur] || '';
  // 누르면 바로 사지 않고 미리보기만 해요. 사는 것과 입고 벗는 건 아래 버튼으로 해요
  const sel = S.wardSel && S.wardSel.tab === cur ? S.wardSel.id : null;
  let act = $('wardAct'); if (!act) { act = document.createElement('div'); act.id = 'wardAct'; act.style.cssText = 'display:flex;gap:8px;margin-top:10px;align-items:center'; $('wardBox').appendChild(act); }
  $('wardGrid').innerHTML = COSMETICS[cur].items.map(it => { const own = !it.cost || SAVE.cos.own[cur + ':' + it.id]; return '<button data-i="' + it.id + '" class="' + ((on === it.id) ? 'on ' : '') + (own ? 'own ' : '') + (sel === it.id ? 'sel' : '') + '"' + (sel === it.id ? ' style="outline:2px solid #5ff0c0"' : '') + '><b>' + it.name + '</b><small>' + (on === it.id ? T('입는 중') : own ? T('보유') : it.cost + ' tC') + '</small></button>'; }).join('');
  const it0 = sel != null ? COSMETICS[cur].items.find(x => x.id === sel) : null, key0 = it0 ? cur + ':' + it0.id : '', own0 = it0 && (!it0.cost || SAVE.cos.own[key0]);
  act.innerHTML = it0 ? (own0 ? '<button class="btn gold" id="wardDo">' + ((SAVE.cos.on[cur] || '') === it0.id ? T('벗기') : T('입기')) + '</button>' : '<button class="btn gold" id="wardDo">' + T('구매 {0} tC', it0.cost) + '</button>') : '<small>' + T('아이템을 누르면 미리 볼 수 있어요') + '</small>';
  // 고른 아이템을 입혀 보여 줘요 (사거나 입기 전에는 저장하지 않아요)
  view.cos = it0 ? Object.assign({}, SAVE.cos.on, it0.id ? { [cur]: it0.id } : {}) : SAVE.cos.on; if (it0 && !it0.id) { view.cos = Object.assign({}, SAVE.cos.on); delete view.cos[cur]; }
  view.setPreview(SAVE.role, COLORS[SAVE.col | 0].c);
  $('wardGrid').querySelectorAll('button').forEach(b => b.onclick = () => { SFX.play('click'); S.wardSel = { tab: cur, id: b.dataset.i }; $('wardMsg').textContent = ''; paintWard(); });
  if ($('wardDo')) $('wardDo').onclick = () => {
    if (!own0) { if (SAVE.honor < it0.cost) { $('wardMsg').textContent = T('tC가 모자라요'); SFX.play('click'); return; } SAVE.honor -= it0.cost; SAVE.cos.own[key0] = 1; $('wardMsg').textContent = T('샀어요'); }
    else $('wardMsg').textContent = '';
    if ((SAVE.cos.on[cur] || '') === it0.id) delete SAVE.cos.on[cur]; else if (it0.id) SAVE.cos.on[cur] = it0.id; else delete SAVE.cos.on[cur];
    save(); SFX.play('click'); paintWard();
  };
}
function meSlot() { return S.srv ? { uid: UID, name: T('서버'), role: 'knight', col: 0, srv: 1 } : { uid: UID, name: myName(), role: SAVE.role, col: SAVE.col | 0 }; }
function unlock(id) { if (SAVE.ach[id]) return; const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return; SAVE.ach[id] = Date.now(); save(); ffSync(); }

/* ---------- 직업 소개 ---------- */
const BARS = [T('힘'), T('속도'), T('사거리'), T('난이도')];
function roleCard(id) { const c = ROLES[id]; return '<div class="wc"><b>' + c.name + '</b><small>' + c.role + '</small><em>' + T('공격') + ': ' + c.atkTxt + '</em>' + c.skills.map(s => '<em>' + s.key + ' · ' + s.name + '</em><small>' + s.desc + '</small>').join('') + '</div>'; }
function paintWepInfo() { $('wepInfo').innerHTML = ROLE_IDS.map(roleCard).join(''); }

/* ---------- 패치노트 ---------- */
let NOTES = null;
function loadNotes() { if (NOTES) return renderNotes(); fetch('patchnotes.json?v=' + BUILD).then(r => r.json()).then(d => { NOTES = d; renderNotes(); }, () => { $('notesBox').innerHTML = '<p class="note">' + T('패치노트를 불러오지 못했어요.') + '</p>'; }); }
function renderNotes() {
  const raw = (NOTES && NOTES.notes) || [], list = window.FFPN ? FFPN.filter(raw) : raw, box = $('notesBox');
  if (window.FFPN) { FFPN.mount('notesBox', renderNotes); FFPN.count(list.length); }
  if (!list.length) { box.innerHTML = raw.length && window.FFPN ? FFPN.none() : '<p class="note">' + T('아직 패치노트가 없어요.') + '</p>'; return; }
  box.innerHTML = list.map((n, i) => '<details' + (i ? '' : ' open') + '><summary><b>' + esc(n.title) + '</b><small>' + esc(n.date) + ' · ' + esc(n.build) + '</small></summary><ul>' + n.items.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></details>').join('');
}

function paintSettings() {
  $('setVol').value = SAVE.set.vol; $('setMus').value = SAVE.set.mus != null ? SAVE.set.mus : SAVE.set.vol;
  const sl = $('setLang'); if (!sl.options.length) { for (const [k, n] of LANG_NAMES) sl.add(new Option(n, k)); sl.onchange = () => { try { if (window.FFLang) FFLang.set(sl.value); } catch (e) { } }; }
  try { sl.value = (window.FFLang && FFLang.get()) || 'ko'; } catch (e) { }
  $('setMv').querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === SAVE.set.mv); b.onclick = () => { SAVE.set.mv = b.dataset.v; S.ck = null; save(); paintSettings(); }; });
  const names = { q: T('기술 1'), e: T('기술 2'), r: T('기술 3'), roll: T('구르기') }, kb = KB();
  $('setKeys').innerHTML = ''; ['q', 'e', 'r', 'roll'].forEach(n => { const b = document.createElement('button'); b.textContent = names[n] + ' · ' + keyLabel(kb[n]); b.onclick = () => bindKey(n, b); $('setKeys').appendChild(b); });
  $('setKeyReset').onclick = () => { SAVE.set.keys = {}; save(); paintSettings(); };
  const seg = (id, v, f) => { const el = $(id); el.querySelectorAll('button').forEach(b => { b.classList.toggle('on', +b.dataset.v === +v); b.onclick = () => { f(+b.dataset.v); save(); paintSettings(); }; }); };
  seg('setPx', SAVE.set.px, v => { SAVE.set.px = v; view.setPixel(v); });
  seg('setBloom', SAVE.set.bloom, v => { SAVE.set.bloom = v; view.setBloom(!!v); });
  seg('setShake', SAVE.set.shake, v => { SAVE.set.shake = v; view.shakeOn = !!v; });
  seg('setOpt', SAVE.set.opt, v => { SAVE.set.opt = v; try { if (window.FFPerf) FFPerf.set({ low: !!v, fx: v ? 'low' : 'high', fps: v ? 30 : 0 }); } catch (e) { } perfApply(); });
}
$('setVol').oninput = e => { SAVE.set.vol = +e.target.value; SFX.setVol(SAVE.set.vol / 100); save(); };
$('setMus').oninput = e => { SAVE.set.mus = +e.target.value; MUS.setVol(SAVE.set.mus / 100); save(); };
const LANG_NAMES = [['ko', '한국어'], ['en', 'English'], ['ja', '日本語'], ['zh', '简体中文'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['pt', 'Português (Brasil)'], ['ru', 'Русский'], ['tr', 'Türkçe'], ['it', 'Italiano'], ['pl', 'Polski'], ['ar', 'العربية']];
$('setProf').onclick = async () => {
  if (needLogin()) return;
  try { const sb = window.FFAuth && FFAuth.client && FFAuth.client(), u = window.FFAuth && FFAuth.user(); if (!sb || !u || !(await ffProfile())) return homeMsg(T('프로필을 불러오지 못했어요.')); FFProfile.open(sb, u.id, { game: 'tumblecrown' }); } catch (e) { homeMsg(T('프로필을 불러오지 못했어요.')); }
};
// 키 바꾸기: 버튼을 누르고 원하는 키를 눌러요 (Esc는 취소, 겹치는 키는 서로 바꿔요)
function bindKey(n, btn) {
  btn.textContent = T('키를 누르세요');
  const h = e => {
    e.preventDefault(); e.stopImmediatePropagation(); removeEventListener('keydown', h, true);
    const k = keyOf(e); if (k !== 'escape' && k !== 'tab' && k !== 'f' && k !== 'enter') { const b = KB(), old = b[n]; for (const o in b) if (o !== n && b[o] === k) SAVE.set.keys[o] = old; SAVE.set.keys[n] = k; save(); }
    paintSettings();
  };
  addEventListener('keydown', h, true);
}

/* ---------- 대기실 ---------- */
// 대기실: 장은 고르지 않고, 저장된 이야기에서 이어서 시작해요. 친구 방은 방장의 이야기를 따라가요
const fmtT = s => T('{0}분 {1}초', Math.floor(s / 60), String(Math.floor(s % 60)).padStart(2, '0'));
const weekLabel = id => { const m = /^(\d+)년 (\d+)주$/.exec(id); return m ? T('{0}년 {1}주', m[1], m[2]) : id; };
function weeklyRec(id) { SAVE.wkRec = SAVE.wkRec || {}; return SAVE.wkRec[id] || {}; }
function weeklyDone() {
  const W = S.snap.wk, t = S.snap.wt || 0, r = Object.assign({}, weeklyRec(W.id)), first = !r.paid; const old = r.best || 0;
  r.best = old ? Math.min(old, t) : t; r.tries = (r.tries | 0) + 1; r.paid = 1; SAVE.wkRec[W.id] = r;
  const ks = Object.keys(SAVE.wkRec).sort(); while (ks.length > 12) delete SAVE.wkRec[ks.shift()];
  if (first) SAVE.honor += 60; save();
  return { t, best: r.best, first, rec: !old || t < old, W };
}
function showWeeklyResult(h) {
  S.resultShown = true; const R = weeklyDone(), cn = R.W.curses.map(c => CURSES.find(x => x.id === c).name).join(', ');
  $('result').innerHTML = `<div class="big">${T('주간 원정 완료')}</div><p class="note">${CH.title}</p><p class="note">${T('이번 주 저주: {0}', cn)}</p><p>${T('걸린 시간 {0}', '<b style="color:#ffd36b">' + fmtT(R.t) + '</b>')}${R.rec ? ' · ' + T('새 최고 기록') : ''} · ${T('내 최고 {0}', fmtT(R.best))}</p><p>${T('받은 tC {0}', '<b style="color:#ffd36b">' + (h + (R.first ? 60 : 0)) + '</b>')}${R.first ? ' ' + T('(첫 완주 보너스 60 포함)') : ''} · ${T('지금 tC {0}', SAVE.honor)}</p><div class="row"><button class="btn gold" id="resBack">${T('로비로')}</button></div>`;
  $('resBack').onclick = () => endToLobby('');
  setHud(false); show('sResult');
}
/* ---------- 대기실 = 직업 고르기 화면 ---------- */
// 왼쪽 직업 목록, 가운데 받침돌 위 캐릭터, 오른쪽 능력 카드, 위에 참가자 줄, 아래에 색·봇·시작
const pcol = p => p.col ? '#' + p.col.toString(16).padStart(6, '0') : ROLES[p.role].color;
const hex = c => '#' + c.toString(16).padStart(6, '0');
// 봇이 직업을 고를 때: 같은 편에 이미 있는 직업은 피하고, 전체에서도 덜 나온 직업을 먼저 골라요
function botPickRole(sl) {
  const mine = S.slots.indexOf(sl) % 2, same = {}, all = {};
  S.slots.forEach((o, i) => { if (o === sl || !(o.bot ? S.rdy[o.uid] : o.role)) return; all[o.role] = (all[o.role] || 0) + 1; if (i % 2 === mine) same[o.role] = (same[o.role] || 0) + 1; });
  let best = null, bs = 1e9; for (const r of ROLE_IDS) { const sc = (same[r] || 0) * 10 + (all[r] || 0) * 3 + Math.random(); if (sc < bs) { bs = sc; best = r; } }
  return best;
}
function newBots() { S.botRoles = ROLE_IDS.slice().sort(() => Math.random() - 0.5); }
function openRoom() { S.chSel = 0; S.wk = false; if (!S.botRoles) newBots(); show('sRoom'); paintRoom(); }
function paintRoom() {
  const host = S.net !== 'guest', mine = S.slots.find(s => s.uid === UID) || meSlot(), c = ROLES[mine.role] || ROLES.knight;
  const online = S.net !== 'solo', wait = online && S.ph === 'wait', pickP = online && S.ph === 'pick';
  $('sRoom').classList.toggle('waiting', wait);
  $('roomTitle').textContent = S.range ? T('연습장') : S.net === 'solo' ? T('봇과 연습') : S.pub ? T('온라인 대전') : host ? T('친구와 대결 · 방장') : T('친구와 대결');
  $('inviteBtn').style.display = S.net === 'host' && !S.pub && wait ? '' : 'none';
  $('clsList').innerHTML = ROLE_IDS.map((id, k) => '<button data-c="' + id + '"' + (mine.role === id ? ' class="on"' : '') + '><i>' + (k + 1) + '</i><b>' + ROLES[id].name + '</b></button>').join('');
  $('clsList').querySelectorAll('button').forEach(el => el.onclick = () => { SFX.play('click'); SAVE.role = el.dataset.c; save(); pick(); });
  $('clsInfo').innerHTML = '<h2>' + c.name + '</h2><p>' + c.role + '</p>' + BARS.map((n, k) => '<div class="bar"><span>' + n + '</span><u>' + '<i class="on"></i>'.repeat(c.st[k]) + '<i></i>'.repeat(5 - c.st[k]) + '</u></div>').join('') +
    '<h4>' + T('기본 공격') + '</h4><p>' + c.atkTxt + '</p>' + c.skills.map(s => '<h4>' + s.key + ' · ' + s.name + '</h4><p>' + s.desc + '</p>').join('');
  const all = online ? S.slots : roster(), cap = online ? S.cap : MAX_PLAYERS;
  $('slots').innerHTML = all.map((s, i) => (s.team = i % 2, '<div class="slot' + (s.uid === UID ? ' me' : '') + '"><i style="background:' + hex(TEAMS[s.team == null ? 0 : s.team].c) + '"></i><b>' + esc(s.name) + '</b><small>' + (pickP ? (s.rd || (S.net === 'host' && S.rdy[s.uid]) ? '✔ ' + T('준비') + ' · ' : '') : '') + (wait ? '' : ROLES[s.role].name) + (s.bot ? ' · ' + T('봇') : '') + '</small></div>')).join('') +
    (online ? Array.from({ length: Math.max(0, cap - all.length) }, () => '<div class="slot empty"><i></i><b>' + T('빈자리') + '</b></div>').join('') : '') +
    '<span class="cnt">' + all.length + '/' + cap + '</span>';
  $('waitTxt').textContent = T('{0}/{1}명 모이는 중', all.length, cap); $('waitTitle').textContent = S.pub ? T('온라인 대전') : T('친구와 대결');
  $('waitList').innerHTML = all.map(s => '<span><i style="background:' + hex(TEAMS[s.team == null ? 0 : s.team].c) + '"></i>' + esc(s.name) + '</span>').join('') + Array.from({ length: Math.max(0, cap - all.length) }, () => '<span class="empty"><i></i>' + T('빈자리') + '</span>').join('');
  $('capRow').style.display = S.net === 'host' && !S.pub && wait ? '' : 'none'; $('capN').textContent = S.cap; $('readyBtn').style.display = pickP ? '' : 'none'; $('readyBtn').textContent = mine.rd || (S.net === 'host' && S.rdy[UID]) ? T('준비됨') : T('준비 완료');
  $('botRow').style.display = 'none'; $('colRow').style.display = 'none'; $('mapRow').style.display = 'none'; $('mapBtn').textContent = S.themeI ? ARENA_THEMES[S.themeI - 1].name : T('무작위');
  $('startBtn').style.display = !online ? '' : 'none';
  $('roomMsg').textContent = !online ? (all.length < 2 ? T('봇을 넣어 주세요.') : '') : wait ? (S.pub ? ((S.net === 'host' ? (S.fillT > 0 ? Math.ceil(FILL_T - S.fillT) : -1) : S.ft) >= 0 ? T('{0}초 뒤 빈자리를 봇으로 채워요.', S.net === 'host' ? Math.ceil(FILL_T - S.fillT) : S.ft) : T('다른 플레이어를 기다리는 중이에요.')) : T('친구를 초대해 주세요.')) : T('직업을 골라 주세요 · {0}초 뒤 시작', Math.max(0, Math.ceil(S.pickT))); 
  view.setPreview(wait ? null : mine.role, COLORS[mine.col].c);
}
addEventListener('keydown', e => { if (S.scr !== 'sRoom' || (S.net !== 'solo' && S.ph !== 'pick')) return; const n = e.key === '0' ? 10 : +e.key; if (n >= 1 && n <= ROLE_IDS.length) { SAVE.role = ROLE_IDS[n - 1]; save(); pick(); } });
// 사람 + 봇 목록 (봇은 남은 색과 직업을 받아요)
function roster() {
  const out = S.slots.map((s, i) => Object.assign({}, s, { team: i % 2 }));
  const nb = S.net === 'solo' && !S.range ? Math.max(0, MAX_PLAYERS - out.length) : 0, br = S.botRoles || ROLE_IDS;
  for (let i = 0; i < nb; i++) out.push({ bot: true, name: BOT_NAMES[i % BOT_NAMES.length], role: br[i % br.length], col: 0, team: out.length % 2 });
  return out;
}
S.botN = 0; S.botRoles = null; S.themeI = SAVE.theme | 0;
$('mapBtn').onclick = () => { SFX.play('click'); S.themeI = (S.themeI + 1) % (ARENA_THEMES.length + 1); SAVE.theme = S.themeI; save(); paintRoom(); };
function pick() {
  if (S.net !== 'solo' && S.ph !== 'pick') return;
  if (S.net === 'guest') { send({ t: 'pick', role: SAVE.role, col: SAVE.col | 0 }); const m = S.slots.find(s => s.uid === UID); if (m) { m.role = SAVE.role; m.col = SAVE.col | 0; } paintRoom(); return; }
  const m = S.slots.find(s => s.uid === UID); if (m) { m.role = SAVE.role; if (!S.slots.some(s => s !== m && s.col === (SAVE.col | 0))) m.col = SAVE.col | 0; }
  paintRoom(); hostLobby();
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
$('capMinus').onclick = () => { SFX.play('click'); S.cap = Math.max(Math.max(2, S.slots.length), S.cap - 2); SAVE.cap = S.cap; save(); paintRoom(); hostLobby(); };
$('capPlus').onclick = () => { SFX.play('click'); S.cap = Math.min(MAX_PLAYERS, S.cap + 2); SAVE.cap = S.cap; save(); paintRoom(); hostLobby(); };
$('readyBtn').onclick = () => { SFX.unlock(); SFX.play('click'); if (S.ph !== 'pick') return; if (S.net === 'guest') send({ t: 'rdy' }); else { S.rdy[UID] = !S.rdy[UID]; hostLobby(); paintRoom(); } };
$('inviteBtn').onclick = () => { SFX.play('click'); openInvite(); };
/* 초대 창: 친구는 접속 여부와 상관없이 맨 위(접속 중인 친구 먼저), 그 아래 지금 접속 중인 다른 플레이어 */
const GN = { vowkeep: 'Vowkeep', stickseum: 'Stickseum', crownenvoy: 'Crown Envoy', beaconfall: 'Beaconfall', isleport: 'Isleport', dummyparty: 'Dummy Party', tumblecrown: 'Tumblecrown', hub: T('허브') };
const INV_T = 30 * 60 * 1000; S.sent = {};
function sentLive(id) { const v = S.sent[id]; if (!v || v.code !== S.code || Date.now() - v.at >= INV_T) return null; return v; }
// 방을 나가면 아직 살아 있는 초대를 모두 취소해요
function cancelInvites() {
  const sb = window.FFAuth && FFAuth.client && FFAuth.client();
  for (const id in S.sent) { const v = sentLive(id); if (sb && v && v.id != null) try { sb.rpc('ff_uninvite', { p_id: v.id }).then(() => { }, () => { }); } catch (e) { } }
  S.sent = {};
}
async function openInvite() {
  if (needLogin()) return;
  const sb = window.FFAuth && FFAuth.client && FFAuth.client(), me = FFAuth.user(); if (!sb || !me) return;
  const L = $('invList'); $('inv').classList.add('on'); L.innerHTML = '<p class="note">' + T('불러오는 중이에요...') + '</p>';
  const blocked = id => { try { return FFAuth.isBlocked(id); } catch (e) { return false; } };
  const fr = (FFAuth.friends() || []).filter(f => f.status === 'accepted' && !blocked(f.otherId));
  let onF = {}, others = [], otherErr = false;
  try { const r = await sb.rpc('ff_online_friends'); ((r && r.data) || []).forEach(x => { onF[x.user_id] = x.place; }); } catch (e) { }
  try { const r = await sb.rpc('ff_online_players', { p_limit: 40 }); if (r.error) otherErr = true; others = ((r && r.data) || []).filter(x => x.user_id !== me.id && !blocked(x.user_id) && !fr.some(f => f.otherId === x.user_id)); } catch (e) { otherErr = true; }
  fr.sort((a, b) => ((onF[b.otherId] ? 1 : 0) - (onF[a.otherId] ? 1 : 0)) || a.name.localeCompare(b.name, 'ko'));
  L.innerHTML = '';
  const head = t => { const h = document.createElement('h4'); h.textContent = t; L.appendChild(h); };
  const row = (id, name, tag, on) => {
    const d = document.createElement('div'); d.className = 'r' + (on ? ' on' : ''); d.innerHTML = '<b></b><small></small><button class="btn gold">' + T('초대') + '</button>';
    d.querySelector('b').textContent = name; d.querySelector('small').textContent = tag;
    const bt = d.querySelector('button'), sm = d.querySelector('small');
    // 보낸 초대는 '취소'로 바뀌고, 30분이 지나면 저절로 만료돼서 다시 '초대'로 돌아와요
    const paint = () => {
      clearTimeout(bt._t); const v = sentLive(id); bt.disabled = false; bt.textContent = v ? T('취소') : T('초대'); bt.className = v ? 'btn' : 'btn gold';
      sm.textContent = v ? T('초대함 · {0}분 남음', Math.max(1, Math.ceil((v.at + INV_T - Date.now()) / 60000))) : tag;
      if (v) bt._t = setTimeout(() => { if (d.isConnected) paint(); }, Math.min(30000, v.at + INV_T - Date.now() + 50));
    };
    bt.onclick = async () => {
      SFX.play('click'); bt.disabled = true; const v = sentLive(id);
      if (v) {
        let ok = false; try { const r = await sb.rpc('ff_uninvite', { p_id: v.id }); ok = !(r && r.error); } catch (e) { }
        if (ok) { delete S.sent[id]; paint(); } else { bt.textContent = T('못 취소했어요'); setTimeout(paint, 2000); }
        return;
      }
      let ok = false, nid = null;
      try { const r = await sb.rpc('ff_invite', { p_to: id, p_game: 'tumblecrown', p_code: S.code, p_path: 'prototypes/tumblecrown/index.html' }); ok = !(r && r.error); nid = ok ? r.data : null; } catch (e) { }
      if (ok) { S.sent[id] = { id: nid, at: Date.now(), code: S.code }; paint(); } else { bt.textContent = T('못 보냈어요'); setTimeout(paint, 2000); }
    };
    paint();
    L.appendChild(d);
  };
  head(T('친구 ({0})', fr.length));
  if (!fr.length) L.insertAdjacentHTML('beforeend', '<p class="note">' + T('아직 친구가 없어요.') + '</p>');
  fr.forEach(f => row(f.otherId, f.name, onF[f.otherId] ? '🟢 ' + (GN[onF[f.otherId]] || onF[f.otherId]) : T('접속 안 함'), !!onF[f.otherId]));
  head(T('지금 접속 중인 플레이어 ({0})', others.length));
  if (otherErr) L.insertAdjacentHTML('beforeend', '<p class="note">' + T('접속 중인 플레이어 목록은 곧 열려요.') + '</p>');
  else if (!others.length) L.insertAdjacentHTML('beforeend', '<p class="note">' + T('지금 접속 중인 다른 플레이어가 없어요.') + '</p>');
  others.forEach(x => row(x.user_id, x.name || '???', '🟢 ' + (GN[x.place] || x.place || ''), true));
}
$('invX').onclick = () => $('inv').classList.remove('on');
$('inv').addEventListener('click', e => { if (e.target === $('inv')) $('inv').classList.remove('on'); });
$('startBtn').onclick = () => { SFX.unlock(); SFX.play('click'); if (S.net !== 'solo') return; if (roster().length < 2 && !S.range) return; beginGame(); };

/* ---------- 멀티: 친구 초대 (허브 초대 링크 ?join=) ---------- */
function peerOpts() {
  const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] } };
  const ps = qs.get('ps'); if (ps) { const m = ps.match(/^([^:\/]+)(?::(\d+))?(\/.*)?$/); if (m) { o.host = m[1]; o.port = +(m[2] || 443); o.path = m[3] || '/'; o.secure = location.protocol === 'https:'; } }
  return o;
}
function newCode() { let s = ''; for (let i = 0; i < 6; i++) s += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; return s; }
// 온라인: 사람이 다 모이면 직업을 고르는 시간(PICK_T초)이 열리고, 모두 준비하거나 시간이 다 되면 시작해요
setInterval(() => {
  if (S.net !== 'host' || S.G || S.ph !== 'pick') return;
  if (S.srv) S.rdy[UID] = true;   // 서버 방장은 늘 준비 상태예요
  S.pickT -= 0.25; const left = Math.max(0, Math.ceil(S.pickT));
  // 봇은 1~4초 랜덤으로 기다린 뒤 직업을 골라 준비해요
  for (const sl of S.slots) if (sl.bot && !S.rdy[sl.uid] && (sl.rdT -= 0.25) <= 0) { sl.role = botPickRole(sl); S.rdy[sl.uid] = true; hostLobby(); if (S.scr === 'sRoom') paintRoom(); }
  if (S.slots.length < S.cap) { S.ph = 'wait'; hostLobby(); if (S.scr === 'sRoom') paintRoom(); return; }
  if (S.pickT <= 0 || (S.slots.every(x => S.rdy[x.uid]) && S.pickT < PICK_T - 1.5)) { beginGame(); return; }
  if (left !== S.lastLeft) { S.lastLeft = left; hostLobby(); if (S.scr === 'sRoom') paintRoom(); }
}, 250);
// 공개 방: 사람이 한 명이라도 있으면 15초 뒤 빈자리를 봇으로 채워 시작해요
const FILL_T = 15;
setInterval(() => {
  if (S.net !== 'host' || S.G || !S.pub || S.ph !== 'wait') { S.fillT = 0; return; }
  if (!S.slots.some(s => !s.srv && !s.bot)) { S.fillT = 0; if (S.slots.some(s => s.bot)) { S.slots = S.slots.filter(s => !s.bot); hostLobby(); if (S.scr === 'sRoom') paintRoom(); } return; }
  S.fillT = (S.fillT || 0) + 0.25; const left = Math.max(0, Math.ceil(FILL_T - S.fillT));
  if (S.fillT >= FILL_T) {
    S.fillT = 0; newBots();
    const used = new Set(S.slots.map(s => s.col));
    for (let i = 0; S.slots.length < S.cap; i++) { let col = COLORS.findIndex((x, k) => !used.has(k)); if (col < 0) col = 0; used.add(col); S.slots.push({ uid: 'bot' + i, bot: true, name: BOT_NAMES[i % BOT_NAMES.length], role: S.botRoles[i % S.botRoles.length], col }); }
    checkFull(); hostLobby(); if (S.scr === 'sRoom') paintRoom(); return;
  }
  if (left !== S.lastFill) { S.lastFill = left; hostLobby(); if (S.scr === 'sRoom') paintRoom(); }
}, 250);
function checkFull() { if (S.net === 'host' && !S.G && S.ph === 'wait' && S.slots.length >= S.cap) { S.ph = 'pick'; S.pickT = PICK_T; S.rdy = {}; S.lastLeft = null; for (const sl of S.slots) if (sl.bot) sl.rdT = 1 + Math.random() * 3; SFX.play('click'); } }
function leaveNet() {
  S.range = false;
  S.ph = null; S.pub = false; S.rdy = {}; S.mg = (S.mg | 0) + 1;
  hubRoom(false); cancelInvites();
  if (S.peer) { try { S.peer.destroy(); } catch (e) { } }
  S.peer = null; S.conn = null; S.conns = {}; S.net = null; S.code = '';
}
function send(d) { if (S.conn && S.conn.open) try { S.conn.send(d); } catch (e) { } }
function bcast(d) { for (const k in S.conns) { const c = S.conns[k]; if (c.open) try { c.send(d); } catch (e) { } } }
function startHost(tries = 0) {
  if (!window.Peer) { homeMsg(T('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.')); return; }
  leaveNet(); S.net = 'host'; S.code = newCode(); homeMsg(T('방을 만드는 중...'));
  S.slots = [meSlot()]; newBots();
  S.ph = 'wait'; S.cap = Math.min(MAX_PLAYERS, Math.max(2, SAVE.cap | 0 || PUB_CAP)); S.rdy = {};
  const p = new Peer(PREFIX + S.code, peerOpts()); S.peer = p;
  p.on('open', () => { if (S.peer !== p) return; homeMsg(''); hubRoom(true); openRoom(); });
  p.on('connection', c => { c.on('data', d => hostMsg(c, d)); c.on('close', () => dropConn(c)); c.on('error', () => dropConn(c)); });
  p.on('disconnected', () => { if (S.peer === p && !p.destroyed) setTimeout(() => { if (S.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
  p.on('error', err => { if (S.peer !== p) return; if (err.type === 'unavailable-id' && tries < 5) { startHost(tries + 1); return; } if (S.scr !== 'sRoom' && !inGame()) { homeMsg(T('방을 만들지 못했어요 ({0}). 잠시 후 다시 해 보세요.', err.type)); leaveNet(); } });
}
// 서버 방장(?dedicated=1): 오라클 서버의 화면 없는 브라우저가 이 모드로 열어서 공개 방 하나를 대신 열어 둬요. 경기에서는 봇 한 자리로 서 있어요
if (qs.get('dedicated') === '1') {
  S.srv = true;
  window.__ffd = { open(n) { S.err = ''; startMatch(n); }, status() { return { live: S.net === 'host' && !!S.peer && !S.err, humans: S.slots.filter(s => !s.srv && !s.bot).length, started: !!S.G, ended: !!(S.snap && S.snap.ph === 'won'), err: S.err || '' }; } };
}
/* 온라인 대전 (Stickseum 방식): 방 이름 ff-tumblecrown-q1, q2... 를 차례로 만들어 보고, 이미 있으면 그 방에 들어가요. 가득 차거나 이미 시작했으면 다음 방으로 가요 */
function startMatch(n) {
  if (!window.Peer) { homeMsg(T('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.')); return; }
  leaveNet(); homeMsg(T('같이 할 사람을 찾는 중...')); matchTry(n || 1, S.mg);
}
function matchGone(p) { if (p) try { p.destroy(); } catch (e) { } }
function matchTry(n, gen) {
  if (S.mg !== gen) return;
  if (n > 12) { homeMsg(T('빈 방을 찾지 못했어요. 잠시 후 다시 해 보세요.')); leaveNet(); return; }
  const p = new Peer(PREFIX + 'q' + n, peerOpts()); S.peer = p;
  p.on('open', () => {
    if (S.mg !== gen || S.peer !== p) { matchGone(p); return; }
    S.net = 'host'; S.pub = true; S.cap = PUB_CAP; S.ph = 'wait'; S.rdy = {}; S.code = ''; S.slots = [meSlot()]; homeMsg('');
    p.on('connection', c => { c.on('data', d => hostMsg(c, d)); c.on('close', () => dropConn(c)); c.on('error', () => dropConn(c)); });
    p.on('disconnected', () => { if (S.peer === p && !p.destroyed) setTimeout(() => { if (S.peer === p && !p.destroyed) p.reconnect(); }, 1000); });
    openRoom();
  });
  p.on('error', err => {
    if (S.mg !== gen || S.peer !== p) return;
    if (err.type === 'unavailable-id') { matchGone(p); if (S.srv) { S.err = 'taken'; leaveNet(); return; } matchJoin(n, gen); return; }
    if (S.scr !== 'sRoom' && !inGame()) { homeMsg(T('연결하지 못했어요 ({0}).', err.type)); leaveNet(); }
  });
}
function matchJoin(n, gen) {
  if (S.mg !== gen) return;
  const p = new Peer(peerOpts()); S.peer = p; let done = false;
  const next = () => { if (done || S.mg !== gen) return; done = true; clearTimeout(tm); S.conn = null; matchGone(p); matchTry(n + 1, gen); };
  const tm = setTimeout(next, 7000);
  p.on('open', () => {
    if (S.mg !== gen || S.peer !== p) return;
    const c = p.connect(PREFIX + 'q' + n, { reliable: true, serialization: 'json' });
    c.on('open', () => { c.send({ t: 'hello', ver: VERSION, uid: UID, name: myName(), role: SAVE.role, col: SAVE.col | 0, cos: SAVE.cos.on }); });
    c.on('data', d => {
      if (S.mg !== gen) return;
      if (done) { guestMsg(d); return; }
      if (d && d.t === 'deny') { try { c.close(); } catch (e) { } next(); return; }
      if (d && d.t === 'welcome' && d.ver && d.ver !== VERSION) { try { c.close(); } catch (e) { } next(); return; }
      if (d && d.t === 'welcome') { done = true; clearTimeout(tm); S.net = 'guest'; S.conn = c; S.pub = true; c.on('close', () => { if (S.conn !== c) return; const wasGame = inGame(); endToLobby(wasGame ? T('방장이 나가서 대전이 끝났어요.') : T('방이 닫혔어요.')); }); }
      guestMsg(d);
    });
    c.on('close', () => { if (!done) next(); });
  });
  p.on('error', () => { if (!done) next(); });
}
function lobbyMeta() { return { t: 'lobby', slots: S.slots.map(s => ({ bot: s.bot ? 1 : 0, role: s.role, uid: s.uid, name: s.name, col: s.col, rd: S.rdy && S.rdy[s.uid] ? 1 : 0 })), bots: 0, code: S.code, ch: S.chSel, wk: S.wk ? 1 : 0, ph: S.ph, cap: S.cap, pub: S.pub ? 1 : 0, pt: S.pickT, ft: S.pub && S.ph === 'wait' && S.fillT > 0 ? Math.max(0, Math.ceil(FILL_T - S.fillT)) : -1 }; }
function hostLobby() { if (S.net === 'host') bcast(lobbyMeta()); }
function hostMsg(c, d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'hello') {
    if (d.ver && d.ver !== VERSION) { c.send({ t: 'deny', ver: VERSION, why: '버전이 달라요.' }); setTimeout(() => c.close(), 300); return; }
    const uid = String(d.uid || '').slice(0, 20), name = String(d.name || T('기사')).slice(0, 15);
    c._uid = uid; c._name = name; c._xp = d.xp || {}; c._gear = d.gear || {}; c._cos = d.cos || null;
    if (S.G) { // 진행 중: 내 자리로 돌아오거나, 봇 자리를 맡아요
      const p = S.G.players.find(q => q.uid === uid && !q.bot && !q.dead);
      if (!p) { c.send({ t: 'deny', why: '이미 시작한 방이에요.' }); setTimeout(() => c.close(), 300); return; }
      p.bot = false; p.uid = uid; p.name = name; p.wasHuman = true; S.G.humans = S.G.players.filter(q => !q.bot).length;
      S.conns[uid] = c; c._pid = p.id;
      c.send({ t: 'welcome', ver: VERSION, uid, start: true, pid: p.id, ch: S.G.ch, dp: S.G.deep, wk: S.G.weekly, th: CH.theme }); toast(T('{0}님이 {1} 자리에 들어왔어요.', name, ROLES[p.role].name));
      return;
    }
    let sl = S.slots.find(s => s.uid === uid);
    if (!sl) {
      if (S.slots.length >= S.cap || S.ph !== 'wait') { c.send({ t: 'deny', why: '방이 가득 찼어요.' }); setTimeout(() => c.close(), 300); return; }
      const used = new Set(S.slots.map(s => s.col)), pc = +d.col | 0, col = COLORS[pc] && !used.has(pc) ? pc : COLORS.findIndex((x, k) => !used.has(k));
      sl = { uid, name, role: ROLES[d.role] ? d.role : 'knight', col }; S.slots.push(sl);
    }
    S.conns[uid] = c;
    checkFull();
    c.send({ t: 'welcome', ver: VERSION, uid }); hostLobby(); if (S.scr === 'sRoom') paintRoom(); SFX.play('click');
    return;
  }
  const uid = c._uid; if (!uid) return;
  if (d.t === 'rdy' && !S.G && S.ph === 'pick') { S.rdy[uid] = !S.rdy[uid]; hostLobby(); if (S.scr === 'sRoom') paintRoom(); }
  else if (d.t === 'pick' && !S.G && S.ph === 'pick') { const sl = S.slots.find(s => s.uid === uid); if (sl) { if (ROLES[d.role]) sl.role = d.role; const col = +d.col | 0; if (COLORS[col] && !S.slots.some(s => s !== sl && s.col === col)) sl.col = col; hostLobby(); if (S.scr === 'sRoom') paintRoom(); } }
  else if (d.t === 'i' && S.G) { const pid = c._pid; if (!pid) return; const r = S.rin[pid] || (S.rin[pid] = {}); const once = { q: r.q || d.q, e: r.e || d.e, r: r.r || d.r, roll: r.roll || d.roll, skip: r.skip || d.skip, atkR: r.atkR || d.atkR, rcl: r.rcl || d.rcl }; Object.assign(r, d, once); }
  else if (d.t === 'b' && S.G) { if (c._pid) chooseBless(S.G, c._pid, d.id); }
}
function dropConn(c) {
  const uid = c._uid; if (!uid || S.conns[uid] !== c) return; delete S.conns[uid];
  if (S.G) { const p = S.G.players.find(q => q.uid === uid); if (p && !p.gone && !S.G.won) { p.gone = true; if (!p.dead) koPlayer(S.G, p, null); p.respT = 1e9; toast(T('{0}님이 나갔어요.', p.name)); delete S.rin[p.id]; } }
  else { S.slots = S.slots.filter(s => s.uid !== uid); delete S.rdy[uid]; if (S.ph === 'pick') { S.ph = 'wait'; S.rdy = {}; } hostLobby(); if (S.scr === 'sRoom') paintRoom(); }
}
function startGuest(code) {
  if (!window.Peer) { homeMsg(T('연결 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.')); return; }
  leaveNet(); S.net = 'guest'; S.code = code; homeMsg(T('방에 들어가는 중...'));
  const p = new Peer(peerOpts()); S.peer = p;
  const tm = setTimeout(() => { if (S.peer === p && S.scr !== 'sRoom' && !inGame()) { homeMsg(T('연결 시간이 초과됐어요. 초대를 다시 받아 주세요.')); leaveNet(); } }, 15000);
  p.on('open', () => {
    const c = p.connect(PREFIX + code, { reliable: true, serialization: 'json' }); S.conn = c;
    c.on('open', () => { c.send({ t: 'hello', ver: VERSION, uid: UID, name: myName(), role: SAVE.role, col: SAVE.col | 0, cos: SAVE.cos.on }); });
    c.on('data', d => { clearTimeout(tm); guestMsg(d); });
    c.on('close', () => { if (S.conn !== c) return; const wasGame = inGame(); endToLobby(wasGame ? T('방장이 나가서 대전이 끝났어요.') : T('방이 닫혔어요.')); });
  });
  p.on('error', err => { if (S.peer !== p) return; clearTimeout(tm); if (S.scr !== 'sRoom' && !inGame()) { homeMsg(err.type === 'peer-unavailable' ? T('초대받은 방이 이미 닫혔어요.') : T('연결하지 못했어요 ({0}).', err.type)); leaveNet(); } });
}
function guestMsg(d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'welcome' && d.ver && d.ver !== VERSION) { homeMsg(T('버전이 달라요. 이 방은 {0} 버전이에요.', d.ver)); leaveNet(); return; }
  if (d.t === 'welcome') { homeMsg(''); if (d.start) { S.me = d.pid; useDeep(d.dp); { const fw = useWk(d.wk); useChapter(d.ch | 0, !!d.dp || fw); if (d.th) CH.theme = d.th; } startClient(); } else { openRoom(); } }
  else if (d.t === 'lobby') { S.slots = d.slots; S.ph = d.ph; S.cap = d.cap || PUB_CAP; S.pub = !!d.pub; S.pickT = d.pt; S.ft = d.ft; if (S.scr === 'sRoom') paintRoom(); }
  else if (d.t === 'deny') { homeMsg(d.ver ? T('버전이 달라요. 이 방은 {0} 버전이에요.', d.ver) : T(d.why || '들어갈 수 없어요.')); leaveNet(); }
  else if (d.t === 'start') { if (S.snap && S.snap.won) clearChapter(); S.me = d.pid; useDeep(d.dp); { const fw = useWk(d.wk); useChapter(d.ch | 0, !!d.dp || fw); if (d.th) CH.theme = d.th; } startClient(); }
  else if (d.t === 's') {
    if (d.S && d.S.c != null && (d.S.c !== chapterIndex() || (d.S.dp && d.S.dp.floor !== DEEP.floor) || !!d.S.wk !== WEEKLY.on)) { useDeep(d.S.dp); useWk(d.S.wk); useChapter(d.S.c, true); S.built = false; }
    S.snap = d.S; if (d.ev) for (const e of d.ev) S.evq.push(e);
  }
}

// 끝없는 심연: 방장이 보낸 층·씨앗·저주로 같은 층을 만들어요
function useWk(wk) { const was = WEEKLY.on; WEEKLY.on = !!wk; if (wk) { WEEKLY.id = wk.id; WEEKLY.curses = wk.curses.slice(); } return was || !!wk; }
function useDeep(dp) { if (dp) { DEEP.floor = dp.floor; DEEP.seed = dp.seed; DEEP.curses = dp.curses.slice(); } }
/* ---------- 게임 시작 ---------- */
function beginGame(prevG) {
  const solo = S.net === 'solo';
  const sl = prevG ? S.lastSl : roster().map((s, i) => {
    const id = 's' + i, c = s.uid && s.uid !== UID ? S.conns[s.uid] : null;
    return { id, uid: s.uid, role: s.role, col: TEAMS[s.team].c, team: s.team, name: s.bot ? s.name : s.uid === UID ? myName() : s.name, bot: !!s.bot || !!s.srv, lv: 1, gear: { weapon: 0, armor: 0 }, cos: s.uid === UID ? SAVE.cos.on : c && c._cos || null };
  });
  if (!prevG && !sl.some(s => s.uid === UID)) { $('roomMsg').textContent = T('내 직업을 먼저 골라 주세요.'); return; }
  if (prevG) sl.forEach((s, i) => { const q = prevG.players[i]; s.bot = q.bot; s.uid = q.uid; s.name = q.name; });
  S.lastSl = sl;
  if (S.chSel === DEEP_I && !prevG) { DEEP.floor = 1; DEEP.seed = (Math.random() * 1e6) | 0; DEEP.curses = []; }
  { const wk = !!S.wk && !prevG && S.chSel !== DEEP_I, was = WEEKLY.on; WEEKLY.on = wk; if (wk) { const w = weekInfo(); WEEKLY.id = w.id; WEEKLY.curses = w.curses; S.chSel = w.ch; } if (wk || was) useChapter(S.chSel, true); }
  if (!prevG && !(DEV_CH)) S.chSel = Math.random() * CHAPTERS.length | 0;   // 지도는 판마다 무작위 (온라인은 방장이 골라 모두에게 알려요)
  S.G = createGame(sl, (Math.random() * 4e9) >>> 0, S.chSel);
  if (S.range) { S.G.range = true; setupRange(S.G); toast(T('연습장이에요. 허수아비를 쳐 보세요. 나가기를 누르면 직업을 바꿀 수 있어요.'), 6000); }
  S.G.lite = !!S.lite; 
  S.G.players.forEach((p, i) => { p.uid = sl[i].uid; });
  if (prevG) carryOver(S.G, prevG);
  S.me = sl.find(s => s.uid === UID).id;
  if (!solo) { for (const uid in S.conns) { const p = S.G.players.find(q => q.uid === uid); if (p) { S.conns[uid]._pid = p.id; S.conns[uid].send({ t: 'start', pid: p.id, ch: S.G.ch, dp: S.G.deep, wk: S.G.weekly, th: CH.theme }); } } }
  if (S.G.humans > 1) unlock('friends');
  startClient();
}
function startClient() {
  talkReset(); if (!S.G) resetSecrets(); S.overT = 0; S.cleared = false; S.built = false; S.area = -2; S.seenA = {}; S.voted = false; S.lastPh = ''; S.saved = false; S.resultShown = false; S.everDown = false; S.local = null; S.nums = []; S.evq = []; S.wonT = 0; S.lastBless = null; S.solvedP = {}; S.flagGot = 0;
  if (S.G) S.snap = snapshot(S.G);
  unlock('first');
  setHud(false); show('sIntro'); $('introCh').textContent = CH.title; $('introLine').classList.remove('on'); S.introIdx = -1;
  hubRoom(S.net === 'host');
}
function endToLobby(msg) {
  if (S.lite) { S.lite = false; S.slowN = 0; try { view.setLow(!!SAVE.set.opt); } catch (e) { } }
  const fin = !!(S.snap && S.snap.ph === 'won' && S.resultShown);   // 한 판을 끝까지 마친 경우만 허브 퀘스트에 알려요
  if (fin) ffProfile().then(ok => { try { const sb = window.FFAuth && FFAuth.client && FFAuth.client(); if (ok && sb && FFProfile.matchDone) FFProfile.matchDone(sb, 'tumblecrown'); } catch (e) { } });
  awardHonor(); S.wk = false; if (WEEKLY.on) { WEEKLY.on = false; useChapter(chapterIndex(), true); }
  leaveNet(); S.G = null; S.snap = null; setHud(false); $('bless').classList.remove('on');
  { const th = CH.theme; CH.theme = 'dungeon'; view.buildLobby(); CH.theme = th; } show('sLobby'); paintWho(); if (msg) homeMsg(msg);
}
$('exitBtn').onclick = () => {
  const b = $('exitBtn');
  if (b.dataset.arm) { delete b.dataset.arm; b.textContent = T('나가기'); endToLobby(''); return; }
  b.dataset.arm = 1; b.textContent = T('한 번 더 누르면 나가요'); setTimeout(() => { delete b.dataset.arm; b.textContent = T('나가기'); }, 2200);
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
// 기술·구르기 키 (설정에서 바꿔요)
const KEYDEF = { q: 'q', e: 'e', r: 'r', roll: ' ' }, JAMO = { q: 'ㅂ', e: 'ㄷ', r: 'ㄱ' };
const KB = () => Object.assign({}, KEYDEF, SAVE.set.keys || {});
const keyLabel = k => k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k.replace(/^arrow/, '');
function skOf(k) { const b = KB(); for (const n of ['q', 'e', 'r']) if (b[n] === k || JAMO[b[n]] === k) return n; return ''; }
function keyOf(e) { const c = e.code || ''; if (/^Key[A-Z]$/.test(c)) return c[3].toLowerCase(); if (/^Digit[0-9]$/.test(c)) return c[5]; if (c === 'Space') return ' '; return e.key.toLowerCase(); }
const K = {}; let mouse = { x: innerWidth / 2, y: innerHeight / 2, down: false }; const once = { q: 0, e: 0, r: 0, roll: 0, skip: 0, atkR: 0, rcl: 0 };
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const k = keyOf(e); K[k] = true; SFX.unlock();
  if (!inGame()) return;
  if (S.scr === 'sIntro') { if (k === ' ' || k === 'enter' || k === 'escape') { once.skip = 1; e.preventDefault(); } return; }
  const sk = skOf(k);
  if (sk) { if (aimedSkill(sk)) { if (!e.repeat && !S.aimK) S.aimK = sk; } else once[sk] = 1; }
  if (k === KB().roll) { once.roll = 1; e.preventDefault(); } else if (k === ' ') e.preventDefault();
  if ((k === 'f' || k === 'ㄹ') && !e.repeat) recallToggle(); else if (k === 'escape' && S.rcOpen) S.rcOpen = false;
  if (k === 'tab') e.preventDefault();
  if (k === '1' || k === '2' || k === '3') pickBlessIdx(+k - 1);
});
addEventListener('keyup', e => { K[keyOf(e)] = false; K[e.key.toLowerCase()] = false; const k = keyOf(e), sk = skOf(k); if (sk && S.aimK === sk) { S.aimK = null; if (inGame()) once[sk] = 1; } });
addEventListener('blur', () => { S.rcOpen = false; S.ck = null; S.ckDown = false; for (const k in K) K[k] = false; mouse.down = false; S.aimK = null; });
$('gl').addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
$('gl').addEventListener('mousedown', e => { if (e.button === 0) mouse.down = true; SFX.unlock(); });
addEventListener('mouseup', e => { if (e.button === 0) { if (mouse.down && inGame() && S.scr === '') { const m = myP(); if (m && relBasic(m.role)) once.atkR = 1; } mouse.down = false; } });
$('gl').addEventListener('contextmenu', e => e.preventDefault());
const keyDown = (...ks) => ks.some(k => K[k]);
// 휴대폰
const touch = { jx: 0, jz: 0, jid: null, atk: false, f: false };
(function setupTouch() {
  const joy = $('joy'), base = $('joyBase'), knob = $('joyKnob'); let ox = 0, oy = 0;
  // 지도가 떠 있을 때 왼쪽 반을 누르면 조이스틱 대신 지도를 눌러요
  joy.addEventListener('touchstart', e => { const t = e.changedTouches[0]; if (S.rcOpen) { const h = (S.rcHit || []).find(q => Math.hypot(q.x - t.clientX, q.y - t.clientY) < q.r + 14); once.rcl = h ? h.v : -1; S.rcOpen = false; SFX.play('click'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    const r = (S.rspHit || []).find(q => Math.hypot(q.x - t.clientX, q.y - t.clientY) < q.r + 14); if (r) { if (r.v === -9) S.rspDone = false; else { S.rspSel = r.v; S.rspDone = true; } SFX.play('click'); e.preventDefault(); e.stopImmediatePropagation(); } }, { passive: false, capture: true });
  joy.addEventListener('touchstart', e => { SFX.unlock(); const t = e.changedTouches[0]; if (SAVE.set.mv === 'click') { if (ckOn()) { S.ckDown = true; ckSet(t.clientX, t.clientY); } e.preventDefault(); return; } touch.jid = t.identifier; ox = t.clientX; oy = t.clientY; base.style.display = 'block'; base.style.left = (ox - 60) + 'px'; base.style.top = (oy - 60) + 'px'; knob.style.left = '33px'; knob.style.top = '33px'; e.preventDefault(); }, { passive: false });
  joy.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === touch.jid) { let dx = t.clientX - ox, dy = t.clientY - oy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx = dx / l * m; dy = dy / l * m; } knob.style.left = (33 + dx) + 'px'; knob.style.top = (33 + dy) + 'px'; touch.jx = dx / m; touch.jz = dy / m; } e.preventDefault(); }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === touch.jid) { touch.jid = null; touch.jx = touch.jz = 0; base.style.display = 'none'; } };
  joy.addEventListener('touchmove', e => { if (SAVE.set.mv === 'click' && S.ckDown && ckOn()) ckSet(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: true });
  joy.addEventListener('touchend', end); joy.addEventListener('touchcancel', end);
  const hold = (id, k) => { const b = $(id); b.addEventListener('touchstart', e => { SFX.unlock(); touch[k] = true; e.preventDefault(); }, { passive: false }); b.addEventListener('touchend', e => { touch[k] = false; e.preventDefault(); }); b.addEventListener('touchcancel', () => touch[k] = false); };
  hold('tA', 'atk'); hold('tF', 'f'); $('tF').addEventListener('touchstart', () => recallToggle());
  const tap = (id, k) => $(id).addEventListener('touchstart', e => { once[k] = 1; e.preventDefault(); }, { passive: false });
  tap('tRoll', 'roll');
  // 기술 버튼: 누르고 있으면 미리보기, 끌면 방향을 정하고, 떼면 나가요 (공격 버튼도 떼면 나가는 직업은 같아요)
  const dragBtn = (id, k) => {
    const b = $(id), mv = e => { for (const t of e.changedTouches) if (touch.drag && touch.drag.id === t.identifier) { touch.drag.cx = t.clientX; touch.drag.cy = t.clientY; } };
    b.addEventListener('touchstart', e => {
      SFX.unlock(); e.preventDefault(); const t = e.changedTouches[0], p = myP(); if (!p || p.dn || p.dd || S.scr !== '') return;
      touch.drag = { k, id: t.identifier, ox: t.clientX, oy: t.clientY, cx: t.clientX, cy: t.clientY };
      if (k !== 'atk') S.aimK = k;
    }, { passive: false });
    b.addEventListener('touchmove', mv, { passive: true });
    const end = e => {
      const d = touch.drag; if (!d || d.k !== k || ![...e.changedTouches].some(t => t.identifier === d.id)) return; mv(e); d.ended = true;
      const p = myP(); if (p && !p.dn && !p.dd) { if (k !== 'atk') once[k] = 1; else once.atkR = 1; }
    };
    b.addEventListener('touchend', end); b.addEventListener('touchcancel', e => { if (touch.drag && touch.drag.k === k) { touch.drag = null; S.aimK = null; } });
  };
  dragBtn('tQ', 'q'); dragBtn('tE', 'e'); dragBtn('tR', 'r'); dragBtn('tA', 'atk');
})();

function nearestFoe(p, maxd) { let best = null, bd = maxd;
  if (S.snap.pv) { for (const q of S.snap.pl) { if (q.id === S.me || q.dd) continue; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = q; } } return best; } for (const e of S.snap.en) { if (e.hp <= 0 || e.st === 'rise') continue; const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < bd) { bd = d; best = e; } } return best; }
/* 누르고 있으면 민트색으로 어디로 나갈지 보여 주고, 떼면 나가요 (Stickseum 방식). 원거리 기본 공격과 조준 기술 */
const BASEP = { orb: { k: 'line', len: 14, w: 0.9 }, arrow: { k: 'line', len: 26, w: 0.8 }, xbolt: { k: 'line', len: 32, w: 0.8 }, musket: { k: 'line', len: 60, w: 0.5 }, bomb: { k: 'circle', range: 13, r: 2.4 } };
const SKP = {
  smite: { k: 'circle', range: 12, r: 3.2 }, curse: { k: 'circle', range: 12, r: 2.6 }, potion: { k: 'circle', range: 12, r: 3 }, frost: { k: 'circle', range: 12, r: 3.2 }, rain: { k: 'circle', range: 12, r: 4 }, runetrap: { k: 'circle', range: 12, r: 4.5 }, courtswap: { k: 'self', r: 18 }, necroheal: { k: 'self', r: 9 }, necrodoom: { k: 'circle', range: 10, r: 6.5 }, necroraise: { k: 'self', r: 2.4 }, courtshift: { k: 'self', r: 22 }, mark: { k: 'circle', range: 14, r: 1.6 },
  bigbomb: { k: 'circle', range: 12, r: 4 }, sticky: { k: 'circle', range: 11, r: 4.5 }, barrage: { k: 'line', len: 12, w: 3.5 },
  pierce: { k: 'line', len: 26, w: 0.9 }, rootbolt: { k: 'line', len: 25, w: 0.9 }, rapidfire: { k: 'line', len: 46, w: 0.7 }, bigshot: { k: 'line', len: 34, w: 2 }, axeswing: { k: 'fan', range: 4.4, arc: 1.2 }, morale: { k: 'self', r: 10 }, lunge: { k: 'line', len: 7, w: 1.6 }, spearthrow: { k: 'line', len: 27, w: 1.1 }, sweep: { k: 'self', r: 3.9 }, lullaby: { k: 'self', r: 7 }, march: { k: 'self', r: 9 }, chorus: { k: 'self', r: 8 }, snipe: { k: 'line', len: 40, w: 1 }, fan: { k: 'line', len: 13, w: 5 },
  quake: { k: 'line', len: 11, w: 2.4 }, dash: { k: 'line', len: 10, w: 1.6 }, shieldbash: { k: 'line', len: 4, w: 1.8 }, flurry: { k: 'line', len: 5, w: 1.6 }, leap: { k: 'line', len: 9, w: 2 }, backstep: { k: 'line', len: 6, w: 1.4, rev: 1 }, wall: { k: 'wall' },
  whirl: { k: 'self', r: 3.4 }, bonestorm: { k: 'self', r: 3.6 }, bastion: { k: 'self', r: 4.5 }, vow: { k: 'self', r: 6 }, scatter: { k: 'self', r: 3 }, execute: { k: 'self', r: 13 }, blink: { k: 'self', r: 10 }
};
const SELFP = { k: 'self', r: 1.5 };
// 모든 기본 공격과 기술은 누르고 있으면 민트색으로 보이고 떼면 나가요 (궁수 모아 쏘기만 원래대로 누르고 있다가 떼요)
const relBasic = role => !TOUCH && role !== 'archer' && !!ROLES[role];
// 기사는 두 번 베면 다음 한 번이 강타예요 (0.65초 안에 이어 눌러야 해요). 그때는 내 둘레에 내려찍는 범위로 미리보기가 바뀌어요
function heavyNext(p) { const now = S.snap ? S.snap.t * 1000 : 0; if (p.aN !== S.kcN) { S.kcN = p.aN; if (p.ak === 'atk') { S.kcC = p.ac; S.kcT = now; } else if (p.ak === 'hv') S.kcC = -1; } return p.role === 'knight' && S.kcC === 1 && now - S.kcT < 650; }
function basicSpec(role, p) { const A = ROLES[role].atk; if (p && heavyNext(p)) return { k: 'self', r: 3.2 }; return A.kind === 'melee' ? (A.w ? { k: 'line', off: 0, len: A.range, w: A.w * 2 } : { k: 'fan', range: A.range + 0.3, arc: A.arc }) : BASEP[A.kind] || null; }
function skillSpec(role, key) { const R = ROLES[role]; const s = R && R.skills['qer'.indexOf(key)]; return s ? SKP[s.id] || SELFP : null; }
function aimedSkill(key) { const m = inGame() && S.scr === '' && !TOUCH ? myP() : null; return !!(m && !m.dn && !m.dd && skillSpec(m.role, key)); }
function aimTick(p, pos, inp) {
  let sp = null;
  if (S.scr === '' && !p.dn && !p.dd) {
    if (S.aimK) sp = skillSpec(p.role, S.aimK);
    else if (TOUCH ? touch.drag && touch.drag.k === 'atk' : mouse.down) sp = basicSpec(p.role, p);
  }
  if (S.aimK && !sp) S.aimK = null;
  view.setAim(sp, pos.x, pos.z, inp.aim == null ? p.a : inp.aim, inp.ax, inp.az);
}
function gatherInput(p) {
  const inp = {};
  let mx = 0, mz = 0;
  const mvm = SAVE.set.mv, wasd = mvm === 'wasd', arr = mvm !== 'click';
  if (keyDown(...(wasd ? ['w', 'ㅈ'] : []), ...(arr ? ['arrowup'] : []))) mz -= 1; if (keyDown(...(wasd ? ['s', 'ㄴ'] : []), ...(arr ? ['arrowdown'] : []))) mz += 1; if (keyDown(...(wasd ? ['a', 'ㅁ'] : []), ...(arr ? ['arrowleft'] : []))) mx -= 1; if (keyDown(...(wasd ? ['d', 'ㅇ'] : []), ...(arr ? ['arrowright'] : []))) mx += 1;
  if (mvm === 'click') {   // 누른 곳(PC는 우클릭, 모바일은 터치)으로 걸어가요
    if (p.dn || p.dd) S.ck = null;
    if (S.ck) { const q0 = S.local && S.net === 'guest' ? S.local : p, dx = S.ck.x - q0.x, dz = S.ck.z - q0.z, d = Math.hypot(dx, dz); if (d < 0.5 && !S.ckDown) S.ck = null; else if (d >= 0.5) { mx = dx / d; mz = dz / d; } }
  }
  if (touch.jid != null && mvm !== 'click') { mx = touch.jx; mz = touch.jz; }
  inp.mx = mx; inp.mz = mz;
  const pos = S.local && S.net === 'guest' ? S.local : p;
  if (TOUCH) {
    const f = nearestFoe(pos, 14);
    if (f) { inp.aim = Math.atan2(f.z - pos.z, f.x - pos.x); inp.ax = f.x; inp.az = f.z; }
    else if (Math.hypot(mx, mz) > 0.2) inp.aim = Math.atan2(mz, mx);
    if (p.role === 'squire') { const low = S.snap.pl.filter(q => !q.dn && !q.dd && q.hp < q.mx * 0.7).sort((a, b) => a.hp / a.mx - b.hp / b.mx)[0]; if (low && once.q) { inp.ax = low.x; inp.az = low.z; inp.aim = Math.atan2(low.z - pos.z, low.x - pos.x); } }
    if (touch.jid != null && Math.hypot(mx, mz) > 0.2) { const ml = Math.hypot(mx, mz); inp.aim = Math.atan2(mz, mx); inp.ax = pos.x + mx / ml * 8; inp.az = pos.z + mz / ml * 8; }   // 조이스틱을 움직이는 동안은 가는 방향을 봐요
    const dg = touch.drag;   // 버튼을 끈 방향으로 조준해요 (조금만 움직이면 가까운 상대에게 자동 조준)
    if (dg && Math.hypot(dg.cx - dg.ox, dg.cy - dg.oy) > 14) { try { const g0 = view.groundAt(dg.ox, dg.oy), g1 = view.groundAt(dg.cx, dg.cy), ddx = g1.x - g0.x, ddz = g1.z - g0.z; inp.aim = Math.atan2(ddz, ddx); inp.ax = pos.x + ddx * 1.6; inp.az = pos.z + ddz * 1.6; } catch (e) { } }
    if (dg && dg.ended) { touch.drag = null; S.aimK = null; }
    inp.atk = false; inp.f = touch.f;
  } else {
    const g = view.groundAt(mouse.x, mouse.y); inp.aim = Math.atan2(g.z - pos.z, g.x - pos.x); inp.ax = g.x; inp.az = g.z;
    inp.atk = relBasic(p.role) ? false : mouse.down; inp.f = keyDown('f', 'ㄹ');
  }
  inp.rsp = S.rspSel | 0; inp.q = once.q; inp.e = once.e; inp.r = once.r; inp.roll = once.roll; if (once.skip) S.voted = true; inp.skip = once.skip; inp.atkR = once.atkR; inp.rcl = once.rcl; once.q = once.e = once.r = once.roll = once.skip = once.atkR = once.rcl = 0;
  aimTick(p, pos, inp);
  return inp;
}

/* 게스트: 내 캐릭터는 내 화면에서 바로 움직여요 */
function localMove(p, inp, dt) {
  const L = S.local; const R = ROLES[p.role];
  if (p.dn || p.dd || S.snap.ph === 'intro' || S.snap.ph === 'wipe' || S.snap.ph === 'won') { L.x = p.x; L.z = p.z; L.roll = 0; return; }
  if (p.rct > 0 || Math.hypot(L.x - p.x, L.z - p.z) > 5) { L.x = p.x; L.z = p.z; }
  if (p.rct > 0) { L.roll = 0; return; }
  const ox = L.x, oz = L.z;
  L.rollCd = Math.max(0, (L.rollCd || 0) - dt);
  let mx = inp.mx, mz = inp.mz; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  // 기사 강타: 방장이 강타를 알려 오면 내 화면에서도 공중에 있는 동안 제자리에 멈춰요
  if (p.aN !== L.aN) { if (L.aN != null && p.ak === 'hv') L.lp = HV_DELAY; L.aN = p.aN; }
  if (L.lp > 0) { L.lp -= dt; return; }
  const fl = S.snap.w.fl && S.snap.w.fl[2] === p.id;
  if (inp.roll && !fl && L.rollCd <= 0 && !(L.roll > 0)) { L.roll = 0.35; L.rollCd = 1.2 * ((p.b || []).indexOf('roll') >= 0 ? 0.6 : 1); const ra = ml > 0.1 ? Math.atan2(mz, mx) : p.a; L.rdx = Math.cos(ra); L.rdz = Math.sin(ra); }
  if (L.roll > 0) { L.roll -= dt; L.x += L.rdx * 15 * dt; L.z += L.rdz * 15 * dt; }
  else { const sp = R.speed * ((p.b || []).indexOf('feet') >= 0 ? 1.12 : 1) * (p.ra ? 1.3 : 1) * (p.mr ? 1.5 : 1) * (p.cb ? 1.2 : 1) * (p.bk ? 0.8 : 1) * (fl ? 0.7 : 1) * (p.cl ? 0.6 : 1) * (p.em ? 0.75 : 1) * (p.stl ? 1.25 : 1) * (p.sp ? 0.25 : 1) * (p.bs ? 0.6 : 1); L.x += mx * sp * dt; L.z += mz * sp * dt; }
  if (L.kvx || L.kvz) { L.x += L.kvx * dt; L.z += L.kvz * dt; const dk = Math.pow(0.02, dt); L.kvx *= dk; L.kvz *= dk; if (Math.hypot(L.kvx, L.kvz) < 0.5) L.kvx = L.kvz = 0; }   // 밀치기 속도는 빠르게 줄어요
  mapCollide(L, 0.6);
  { const ws = (S.snap.zn || []).filter(z => z.k === 'wall' || z.k === 'cover'); if (ws.length && p.tm != null) wallClamp(ws, p.tm, ox, oz, L); }
  if (!liftOk(ox, oz, L.x, L.z)) { L.x = ox; L.z = oz; }
}

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
    case 'rapidfx': { const col = 0xffc060; view.burst(e.x + c * 2.2, 1.9, e.z + s * 2.2, col, 10, 6, 0.3, 0.1); view.flash(e.x + c * 2.2, e.z + s * 2.2, col, 90); for (const o of [-0.05, 0, 0.05]) view.streak(e.x, e.z, e.a + o, 40, col, 0.25, 0.3); SFX.play('slam'); break; }
    case 'coverfx': { const col = 0xd8c090; view.burst(e.x, 0.4, e.z, 0xbcae94, 18, 5, 0.6, 0.16); view.ring(e.x, e.z, 4.5, col, 0.5); view.shock(e.x, e.z, 5, col, 0.4); if (e.id === S.me) view.shake = Math.max(view.shake, 0.5); SFX.play('clang'); break; }
    case 'necrofx': {   // 네트로멘서 R: 초록 죽음의 파동이 넓은 원으로 퍼져요
      const col = 0x6aff8a; view.shock(e.x, e.z, e.r + 1, col, 0.7); view.ring(e.x, e.z, e.r, col, 1.0); view.ring(e.x, e.z, e.r * 0.55, 0xb8ffc8, 0.8); view.column(e.x, e.z, col, 1.0); view.rise(e.x, e.z, 0xb8ffc8, 28, e.r * 0.8, 1, 6); view.burst(e.x, 0.8, e.z, col, 26, 7, 0.7, 0.14); view.flash(e.x, e.z, col, 140);
      if (e.id === S.me) view.shake = Math.max(view.shake, 0.7); SFX.play('slam'); break; }
    case 'summonfx': {   // 네트로멘서 소환: 땅이 갈라지며 초록 불꽃과 뼛조각이 솟아요
      const col = 0x6aff8a; view.ring(e.x, e.z, 1.8, col, 0.8); view.column(e.x, e.z, col, 0.8); view.rise(e.x, e.z, 0xb8ffc8, 14, 1.2, 0.9, 5); view.burst(e.x, 0.3, e.z, 0xd8d0bc, 8, 4, 0.6, 0.12); view.flash(e.x, e.z, col, 80); SFX.play('spawn'); break; }
    case 'swapfx': {   // 자리 바꿈: 두 자리에서 보랏빛이 번쩍이고 서로를 잇는 줄이 그어져요 (n 1 = 궁정 전환, 더 크게)
      const col = 0xb070ff, a2 = Math.atan2(e.tz - e.z, e.tx - e.x), dd = Math.hypot(e.tx - e.x, e.tz - e.z), big = e.n === 1;
      for (const [x, z] of [[e.x, e.z], [e.tx, e.tz]]) { view.column(x, z, col, big ? 1.1 : 0.8); view.ring(x, z, big ? 4 : 2.6, col, 0.6); view.rise(x, z, 0xe0c8ff, big ? 20 : 12, 1.4, 0.8, 6); view.flash(x, z, col, big ? 130 : 90); }
      view.streak(e.x, e.z, a2, dd, col, 0.35, 0.5); if (big) view.shock(e.tx, e.tz, 6, col, 0.5);
      if (mine && big) view.shake = Math.max(view.shake, 0.6); SFX.play('orb'); break; }
    case 'dash': view.streak(e.x, e.z, e.a, 6, 0xcfe0ff, 0.4, 1.2); view.burst(e.x, 0.4, e.z, 0xbcae94, 16, 5, 0.6, 0.16); view.shock(e.x + c * 6, e.z + s * 6, 2.4, 0xcfe0ff, 0.35); view.flash(e.x + c * 4, e.z + s * 4, 0xcfe0ff, 90); if (mine) view.shake = Math.max(view.shake, 0.75); SFX.play('roll'); break;
    case 'taunt': view.shock(e.x, e.z, 10, 0xff6a4a, 0.6); view.rune(e.x, e.z, 2.6, 0xff6a4a, 1.2, 3); view.rise(e.x, e.z, 0xff6a4a, 18, 1.5, 0.9, 7); view.flash(e.x, e.z, 0xff6a4a, 120); if (mine) view.shake = Math.max(view.shake, 1.0); SFX.play('roar'); break;
    case 'pierce': view.streak(e.x, e.z, e.a, 18, 0xffe08a, 0.3, 0.35); view.burst(e.x + c, 1.6, e.z + s, 0xffe08a, 12, 6, 0.4, 0.12); view.flash(e.x, e.z, 0xffe08a, 80); break;
    case 'rain': view.rune(e.x, e.z, 1.2, 0xffd36b, 0.5, 5); view.rise(e.x, e.z, 0xffd36b, 8, 0.8, 0.5, 9); break;
    case 'heal': view.rune(e.x, e.z, 4.5, 0x9af0a8, 0.9, 1.5); view.rise(e.x, e.z, 0x9af0a8, 12, 4, 1, 4); view.column(e.x, e.z, 0x9af0a8, 0.5); view.flash(e.x, e.z, 0x9af0a8, 45); break;
    case 'ward': view.rune(e.x, e.z, 5, 0x9af0e0, 0.9, -1.5); view.flash(e.x, e.z, 0x9af0e0, 40); break;
    case 'raise': view.rune(e.x, e.z, 8, 0xfff0b0, 1.8, 1); view.column(e.x, e.z, 0xfff0b0, 1.4); view.rise(e.x, e.z, 0xfff0b0, 28, 7, 1.6, 6); view.shock(e.x, e.z, 8, 0xfff0b0, 0.7); view.flash(e.x, e.z, 0xfff0b0, 200); view.shake = Math.max(view.shake, 0.9); break;
    case 'potion': view.burst(e.x + c, 1.8, e.z + s, 0xd0543a, 6, 3, 0.3, 0.1); break;
    case 'trap': view.rune(e.x, e.z, 1.5, 0xffb060, 0.8, 6); view.burst(e.x, 0.3, e.z, 0x9a9aa6, 10, 4, 0.4, 0.12); SFX.play('click'); break;
    case 'whirl': view.shock(e.x, e.z, 4.4, 0xffd0a0, 0.45); view.ring(e.x, e.z, 3.4, 0xffd0a0, 0.5); view.burst(e.x, 1.2, e.z, 0xffd0a0, 18, 7, 0.5, 0.12); view.flash(e.x, e.z, 0xffd0a0, 90); if (mine) view.shake = Math.max(view.shake, 0.6); break;
    case 'leap': view.streak(e.x, e.z, e.a, 7, 0xffd0a0, 0.45, 1.4); view.burst(e.x, 0.4, e.z, 0xbcae94, 14, 5, 0.6, 0.16); SFX.play('roll'); break;
    case 'bloodlust': view.shock(e.x, e.z, 6, 0xd03030, 0.6); view.rise(e.x, e.z, 0xe04040, 22, 2, 1.2, 7); view.rune(e.x, e.z, 2.6, 0xd03030, 1.0, 3); view.flash(e.x, e.z, 0xd03030, 110); if (mine) view.shake = Math.max(view.shake, 0.6); SFX.play('roar'); break;
    case 'flurry': view.streak(e.x, e.z, e.a, 3.4, 0xffe0c0, 0.25, 0.6); view.streak(e.x, e.z + 0.5, e.a, 3.4, 0xffe0c0, 0.3, 0.6); view.burst(e.x + c * 2.4, 1.4, e.z + s * 2.4, 0xffe0c0, 12, 7, 0.35, 0.1); SFX.play('swing'); break;
    case 'blink': view.burst(e.x, 1.2, e.z, 0xb06aff, 20, 6, 0.5, 0.14); view.shock(e.x, e.z, 3, 0xb06aff, 0.4); view.flash(e.x, e.z, 0xb06aff, 100); if (mine) view.shake = Math.max(view.shake, 0.5); SFX.play('parry'); break;
    case 'scatter': view.streak(e.x, e.z, e.a + Math.PI, 5, 0xe8e0c8, 0.35, 1.0); view.burst(e.x, 1.2, e.z, 0xe8e0c8, 18, 7, 0.5, 0.14); SFX.play('roll'); break;
    case 'fan': view.burst(e.x + c, 1.4, e.z + s, 0xe8e0c8, 8, 5, 0.3, 0.1); SFX.play('swing'); break;
    case 'bonestorm': view.shock(e.x, e.z, 5, 0xe8e0c8, 0.5); view.ring(e.x, e.z, 3.2, 0xe8e0c8, 0.5); view.rise(e.x, e.z, 0xe8e0c8, 14, 1.5, 0.8, 7); if (mine) view.shake = Math.max(view.shake, 0.5); SFX.play('roar'); break;
    case 'bashfx': view.arc(e.x, e.z, e.a, 3.2, 0xffe08a); view.shock(e.x + c * 2, e.z + s * 2, 3.6, 0xffe08a, 0.4); view.burst(e.x + c * 2, 1.4, e.z + s * 2, 0xfff0c0, 18, 8, 0.35, 0.12); view.ring(e.x + c * 2.4, e.z + s * 2.4, 1.8, 0xffe08a, 0.4); view.flash(e.x + c * 2, e.z + s * 2, 0xffe08a, 130); if (mine) view.shake = Math.max(view.shake, 0.8); SFX.play('clang'); break;
    case 'leapland': view.shock(e.x, e.z, 7, 0xffd0a0, 0.55); view.ring(e.x, e.z, 3.4, 0xffd0a0, 0.5); view.burst(e.x, 0.4, e.z, 0xbcae94, 26, 9, 0.7, 0.18); view.rise(e.x, e.z, 0xe0c090, 14, 3, 0.8, 6); view.flash(e.x, e.z, 0xffd0a0, 120); if (mine) view.shake = Math.max(view.shake, 1.0); SFX.play('slam'); break;
    case 'bloodfx': view.shock(e.x, e.z, 7, 0xd03030, 0.6); view.ring(e.x, e.z, 2.4, 0xd03030, 0.7); view.rune(e.x, e.z, 2.6, 0xd03030, 1.0, 4); view.rise(e.x, e.z, 0xe04040, 30, 2, 1.4, 8); view.column(e.x, e.z, 0xd03030, 0.7); view.flash(e.x, e.z, 0xd03030, 140); if (mine) view.shake = Math.max(view.shake, 0.7); SFX.play('roar'); break;
    case 'quakeline': for (let i = 1; i <= 6; i++) setTimeout(() => { const x = e.x + c * i * 1.8, z = e.z + s * i * 1.8; view.shock(x, z, 3.6, 0xffb060, 0.45); view.burst(x, 0.4, z, 0xbcae94, 12, 7, 0.6, 0.16); view.rise(x, z, 0xff9a40, 6, 1.2, 0.7, 6); if (i % 2) view.column(x, z, 0xff9a40, 0.5); if (mine && i < 4) view.shake = Math.max(view.shake, 0.8); }, i * 55); view.flash(e.x + c * 6, e.z + s * 6, 0xffb060, 140); SFX.play('slam'); break;
    case 'flurryfx': view.burst(e.x + c * 2, 1.4, e.z + s * 2, 0xffe0c0, 10, 7, 0.3, 0.1); view.flash(e.x + c * 2, e.z + s * 2, 0xffe0c0, 90); break;
    case 'stabfx': { const o = (e.n % 2 ? 1 : -1) * 0.5, aa = e.a + (e.n % 2 ? 0.25 : -0.25); view.streak(e.x, e.z + o * 0.4, aa, 3.6, e.n % 2 ? 0xffe0c0 : 0xfff6e0, 0.2, 0.5); view.arc(e.x, e.z, aa, 3.0, 0xfff0d8); view.burst(e.x + c * 2.6, 1.4, e.z + s * 2.6, 0xffe0c0, 6, 6, 0.25, 0.09); SFX.play('swing'); break; }
    case 'blinkend': view.column(e.x, e.z, 0xb06aff, 0.55); view.burst(e.x, 1.2, e.z, 0xb06aff, 22, 7, 0.5, 0.14); view.shock(e.x, e.z, 3.4, 0xb06aff, 0.4); view.arc(e.x, e.z, e.a, 3.2, 0xe0c0ff); view.flash(e.x, e.z, 0xb06aff, 130); SFX.play('swing'); break;
    case 'scatterfx': view.burst(e.x, 1.2, e.z, 0xe8e0c8, 30, 10, 0.6, 0.14); view.shock(e.x, e.z, 5, 0xe8e0c8, 0.45); view.ring(e.x, e.z, 2.6, 0xe8e0c8, 0.5); view.rise(e.x, e.z, 0xcfc8b0, 16, 2, 0.9, 7); view.streak(e.x, e.z, e.a + Math.PI, 6, 0xe8e0c8, 0.35, 1.0); SFX.play('roll'); break;
    case 'stormfx': view.arc(e.x, e.z, (e.a || 0) + (e.n || 0) * 2.1, 3.2, e.role === 'mamluk' ? 0xffd0a0 : 0xe8e0c8); view.ring(e.x, e.z, 3.2, 0xe8e0c8, 0.35); view.burst(e.x, 1.4, e.z, 0xe8e0c8, 10, 8, 0.4, 0.12); SFX.play('swing'); break;
    case 'frostfx': view.shock(e.x, e.z, 7, 0x9ad8ff, 0.55); view.ring(e.x, e.z, 3.4, 0xc8ecff, 0.7); view.rune(e.x, e.z, 3.4, 0x9ad8ff, 1.2, 2); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, r = 1 + (i % 2) * 1.5; view.column(e.x + Math.cos(a) * r, e.z + Math.sin(a) * r, 0xc8ecff, 0.7); } view.burst(e.x, 0.8, e.z, 0xc8ecff, 28, 8, 0.7, 0.14); view.rise(e.x, e.z, 0x9ad8ff, 18, 3, 1, 5); view.flash(e.x, e.z, 0x9ad8ff, 140); if (mine) view.shake = Math.max(view.shake, 0.5); SFX.play('clang'); break;
    case 'quake': view.shock(e.x, e.z, 8, 0xffb060, 0.6); view.ring(e.x, e.z, 4.4, 0xffb060, 0.6); view.burst(e.x, 0.4, e.z, 0xbcae94, 26, 9, 0.7, 0.18); view.flash(e.x, e.z, 0xffb060, 120); if (mine) view.shake = Math.max(view.shake, 1.0); break;
    case 'smite': case 'curse': view.rune(e.x + c * 2, e.z + s * 2, 1.4, e.s === 'smite' ? 0xfff0b0 : 0xb06aff, 0.6, 3); view.rise(e.x, e.z, e.s === 'smite' ? 0xfff0b0 : 0xb06aff, 8, 1, 0.6, 6); break;
    case 'wallfx': view.shock(e.x, e.z, 5, 0xc8b890, 0.45); view.burst(e.x, 0.3, e.z, 0xbcae94, 28, 8, 0.7, 0.18); view.rise(e.x, e.z, 0xe0d0a0, 12, 2.4, 0.9, 6); view.flash(e.x, e.z, 0xffe08a, 100); if (mine) view.shake = Math.max(view.shake, 0.7); SFX.play('slam'); break;
    case 'vowfx': view.ring(e.x, e.z, 2.6, 0xffe08a, 0.9); view.rune(e.x, e.z, 2.2, 0xffd36b, 1.0, 3); view.column(e.x, e.z, 0xffe08a, 0.8); view.rise(e.x, e.z, 0xffe08a, 14, 2, 1.0, 6); SFX.play('clear'); break;
    case 'bastfx': view.shock(e.x, e.z, 8, 0xc8d8f0, 0.6); view.ring(e.x, e.z, 4.5, 0xc8d8f0, 0.8); view.rune(e.x, e.z, 3.2, 0xffe08a, 1.2, -3); view.burst(e.x, 1.2, e.z, 0xe8e0c8, 24, 8, 0.6, 0.14); view.flash(e.x, e.z, 0xc8d8f0, 130); if (mine) view.shake = Math.max(view.shake, 0.8); SFX.play('clang'); break;
    case 'vanishfx': view.burst(e.x, 1.2, e.z, 0x6a8a98, 30, 5, 0.9, 0.2); view.ring(e.x, e.z, 2.2, 0x6a8a98, 0.6); view.rise(e.x, e.z, 0x4a6a78, 16, 2, 1.0, 5); SFX.play('parry'); break;
    case 'unvanish': view.burst(e.x, 1.2, e.z, 0x6a8a98, 12, 4, 0.5, 0.14); break;
    case 'venomfx': view.rune(e.x, e.z, 1.8, 0x7ae070, 0.8, 4); view.rise(e.x, e.z, 0x7ae070, 14, 1.6, 0.9, 6); view.burst(e.x, 1.4, e.z, 0x7ae070, 12, 4, 0.5, 0.12); break;
    case 'execfx': view.column(e.x, e.z, 0xff4a5a, 0.6); view.burst(e.x, 1.2, e.z, 0xff4a5a, e.n ? 34 : 20, 8, 0.5, 0.14); view.shock(e.x, e.z, e.n ? 6 : 3.4, 0xff4a5a, 0.45); view.arc(e.x, e.z, e.a, 3.0, 0xffd0d0); view.flash(e.x, e.z, 0xff4a5a, e.n ? 170 : 110); if (e.n) { num(e.x, e.z, T('처형!'), '#ff6a6a', 1.5, 4.2); if (mine) view.shake = Math.max(view.shake, 0.9); } SFX.play('swing'); break;
    case 'backfx': view.streak(e.x, e.z, e.a + Math.PI, 6, 0xe8d8b0, 0.3, 0.9); view.burst(e.x, 0.4, e.z, 0xbcae94, 12, 5, 0.5, 0.14); SFX.play('roll'); break;
    case 'snipecharge': view.ring(e.x, e.z, 1.6, 0xff6a4a, 1.1); view.rise(e.x, e.z, 0xff6a4a, 10, 1.4, 1.1, 5); SFX.play('clang'); break;
    case 'snipefx': view.streak(e.x, e.z, e.a, 40, 0xffd0a0, 0.35, 1.2); view.flash(e.x + c * 2, e.z + s * 2, 0xffd0a0, 140); view.burst(e.x + c * 1.5, 1.4, e.z + s * 1.5, 0xffd0a0, 14, 9, 0.35, 0.1); if (mine) view.shake = Math.max(view.shake, 0.8); SFX.play('arrow'); break;
    case 'rally': view.shock(e.x, e.z, 9, 0xffd36b, 0.6); view.rune(e.x, e.z, 3, 0xffb040, 1.2, -3); view.flash(e.x, e.z, 0xffb040, 120); if (mine) view.shake = Math.max(view.shake, 0.9); SFX.play('roar'); break;
  }
}
const COL = { streltsy: 0xffc060, necro: 0x6aff8a, knight: 0xcfe0ff, viking: 0xffb060, mamluk: 0xffd0a0, skeleton: 0xe8e0c8 };
// 직업마다 다르게 쓰러져요: 무거운 직업은 땅이 울리고, 마법 직업은 영혼이 떠오르고, 날랜 직업은 연기로 사라져요
const DEATHFX = { knight: ['heavy', 0xc8d0dc], warden: ['heavy', 0x9a8f78], viking: ['heavy', 0xe0803a], spearman: ['heavy', 0x9ab0c8], priest: ['soul', 0xfff0b0], witch: ['soul', 0xb06aff], bard: ['soul', 0xff7aa0], court: ['soul', 0x9a6ad8], necro: ['bones', 0x7ad07a], assassin: ['smoke', 0x6a8a96], mamluk: ['smoke', 0xe0a050], archer: ['arrows', 0x8ac860], crossbow: ['arrows', 0xc8a060], bomber: ['boom', 0xff7a3a], skeleton: ['bones', 0xe8e0c8] };
function deathFx(role, x, z) {
  const d = DEATHFX[role]; if (!d) return; const [k, c] = d;
  if (k === 'heavy') { view.shock(x, z, 4.4, c, 0.5); view.burst(x, 0.4, z, c, 14, 6, 0.4, 0.12); view.shake = Math.max(view.shake, 0.8); SFX.play('clang'); }
  else if (k === 'soul') { view.rise(x, z, c, 18, 3.2, 1.8, 6); view.column(x, z, c, 1.6); }
  else if (k === 'smoke') { view.burst(x, 1.0, z, c, 26, 3, 0.9, 0.2); view.flash(x, z, c, 90); }
  else if (k === 'arrows') { for (let i = 0; i < 6; i++) view.streak(x, z, i * 1.05, 3.4, c, 0.35, 0.3); }
  else if (k === 'boom') { view.burst(x, 1.0, z, c, 30, 9, 0.5, 0.16); view.shock(x, z, 5.6, c, 0.45); view.flash(x, z, c, 170); view.shake = Math.max(view.shake, 0.9); SFX.play('slam'); }
  else view.burst(x, 0.6, z, c, 22, 5, 0.8, 0.12);
}
function onEvent(e) {
  const me = S.me;
  switch (e.k) {
    case 'swing': if (e.role === 'spearman' && !e.n) { const c = Math.cos(e.a), s = Math.sin(e.a); view.streak(e.x + c * 0.8, e.z + s * 0.8, e.a, 3.6, 0xe8f0ff, 0.12, 0.35); view.burst(e.x + c * 3.6, 1.2, e.z + s * 3.6, 0xe8f0ff, 5, 6, 0.2, 0.08); SFX.play('swing'); break; }
      if (e.role === 'necro') { const c = Math.cos(e.a), s = Math.sin(e.a); const w = e.w || 5; view.streak(e.x, e.z, e.a, e.r, 0x6aff8a, 0.4, w); view.streak(e.x, e.z, e.a, e.r * 0.85, 0xc8ffd8, 0.3, w * 0.45); view.burst(e.x + c * e.r * 0.7, 1.3, e.z + s * e.r * 0.7, 0x6aff8a, 10, 5, 0.35, 0.1); SFX.play('swing'); break; }
      if (e.role === 'streltsy') { const c = Math.cos(e.a), s = Math.sin(e.a); setTimeout(() => { view.fanSweep(e.x, e.z, e.a, e.r, 1.2, 0xdfe6f0, 0.34); view.streak(e.x + c * 0.6, e.z + s * 0.6, e.a, 4.4, 0xffffff, 0.3, 4.5); view.burst(e.x + c * 3, 1.3, e.z + s * 3, 0xdfe6f0, 16, 8, 0.4, 0.14); view.shock(e.x + c * 2, e.z + s * 2, 4.4, 0xdfe6f0, 0.4); view.shake = Math.max(view.shake, 0.5); }, 190); SFX.play('swing'); break; }
      view.arc(e.x, e.z, e.a, e.r, COL[e.role] || 0xffffff); SFX.play('swing'); break;
    case 'wallhit': view.burst(e.x, 1.4, e.z, 0xd8cca8, 8, 5, 0.3, 0.1); SFX.play('clang'); break;
    case 'vowhit': view.streak(e.tx, e.tz, Math.atan2(e.z - e.tz, e.x - e.tx), Math.hypot(e.x - e.tx, e.z - e.tz), 0xffe08a, 0.25, 0.4); break;
    case 'shoot': if (e.pk === 'musket') { const c = Math.cos(e.a || 0), s = Math.sin(e.a || 0); view.burst(e.x + c * 3.6, 2.0, e.z + s * 3.6, 0xffc060, 8, 5, 0.25, 0.1); view.burst(e.x + c * 3.2, 2.0, e.z + s * 3.2, 0x8a8a8a, 5, 2, 0.6, 0.2); view.flash(e.x + c * 3.4, e.z + s * 3.4, 0xffc060, 70); SFX.play('slam'); } else SFX.play(e.pk === 'orb' ? 'orb' : 'arrow'); break;
    case 'charge': view.ring(e.x, e.z, e.n === 3 ? 2.4 : 1.6, e.n === 3 ? 0xffd36b : 0x9af0a8, 0.4); view.burst(e.x, 1.8, e.z, e.n === 3 ? 0xffd36b : 0x9af0a8, e.n === 3 ? 12 : 6, 3, 0.4, 0.1); if (e.id === S.me) SFX.play(e.n === 3 ? 'clear' : 'clang'); break;
    case 'raising': view.column(e.x, e.z, 0xfff0b0, 1.1); view.ring(e.x, e.z, 6, 0xfff0b0, 1.0); break;
    case 'eshoot': SFX.play('arrow'); break;
    case 'ehit': view.react(e.id, e.hv || e.crit); if (e.hv) view.spark(e.x, e.z, e.id, true); else view.burst(e.x, 1.6, e.z, 0xe8e0c8, e.crit ? 6 : 3, 4, 0.3, 0.09); num(e.x, e.z, e.v, e.crit ? '#ffd36b' : '#ffffff', e.crit ? 1.3 : 1); SFX.play('hit'); break;
    case 'pdodge': view.ring(e.x, e.z, 2.6, 0x9ad0ff, 0.4); view.streak(e.x, e.z, 0, 0.1, 0x9ad0ff, 0.2, 0.1); view.rise(e.x, e.z, 0x9ad0ff, 10, 1, 0.6, 6); if (e.id === me) { num(e.x, e.z, T('완벽한 회피!'), '#9ad0ff', 1.3, 4.2); view.flash(e.x, e.z, 0x9ad0ff, 120); SFX.play('parry'); if (S.net === 'solo') S.slowT = Math.max(S.slowT || 0, 0.45); } break;
    case 'heavy': { // 내려찍은 자리: 큰 충격파 두 겹, 흙먼지, 땅 문양, 화면 크게 흔들기
      const hp = view.entPos('p' + e.id); if (hp) { view.ring(hp.x + Math.cos(e.a) * 1.4, hp.z + Math.sin(e.a) * 1.4, 3.4, 0xffe08a, 0.4); view.burst(hp.x + Math.cos(e.a) * 1.4, 0.3, hp.z + Math.sin(e.a) * 1.4, 0xbcae94, 26, 9, 0.6, 0.18); }
      view.shock(e.x, e.z, 6, 0xffe08a, 0.45); view.ring(e.x - Math.cos(e.a) * 0.4, e.z - Math.sin(e.a) * 0.4, 3.2, 0x7ac8ff, 0.6); view.shock(e.x, e.z, 3.2, 0xffffff, 0.3); view.rune(e.x, e.z, 2.2, 0xffb040, 0.7, 0); view.streak(e.x - Math.cos(e.a) * 2.5, e.z - Math.sin(e.a) * 2.5, e.a, 5, 0xfff0b0, 0.28, 0.9); view.rise(e.x, e.z, 0xffd36b, 16, 1.6, 0.6, 9); view.flash(e.x, e.z, 0xffe08a, 150);
      if (e.id === me) { num(e.x, e.z, T('강타!'), '#ffd36b', 1.5, 4.2); view.shake = Math.max(view.shake, 1.0); if (S.net === 'solo') S.slowT = Math.max(S.slowT || 0, 0.12); } SFX.play('clang'); break; }
    case 'pcharge': { // 사제 큰 빛 모으기: 발밑 문양과 모여드는 빛
      view.rune(e.x, e.z, 2.0, 0xfff0b0, 0.5, 0); view.rise(e.x, e.z, 0xfff0b0, 14, 1.0, 0.45, 5); view.ring(e.x, e.z, 2.4, 0x9af0d0, 0.45); view.flash(e.x, e.z, 0xfff0b0, 80); SFX.play('charge'); break; }
    case 'big': { // 사제·종자 세 번째 큰 공격
      const col = e.role === 'priest' ? 0xfff0b0 : e.role === 'witch' ? 0xd8a0ff : 0xffb060; view.shock(e.x, e.z, 3.6, col, 0.4); view.burst(e.x, 1.4, e.z, col, 18, 8, 0.45, 0.14); view.rise(e.x, e.z, col, 10, 1.2, 0.5, 7); view.flash(e.x, e.z, col, 110);
      if (e.id === me) view.shake = Math.max(view.shake, 0.6); SFX.play('clang'); break; }
    case 'weak': num(e.x, e.z, T('약점!'), '#ff9c4a', 1.4, 3.8); view.shock(e.x, e.z, 3, 0xff7a20, 0.35); view.burst(e.x, 2.4, e.z, 0xffb060, 14, 9, 0.5, 0.14); view.flash(e.x, e.z, 0xff7a20, 90); view.shake = Math.max(view.shake, 0.35); SFX.play('parry'); break;
    case 'phit': { // 맞는 순간: 빨간 불꽃과 충격파, 번쩍임, 큰 피해일수록 큰 숫자와 화면 흔들림, 때린 사람·맞은 사람 모두 잠깐 멈칫해요
      const big = e.v >= 25, hv = Math.min(1, e.v / 45);
      view.burst(e.x, 1.6, e.z, 0xff5a4a, 8 + (big ? 10 : 0), 6 + hv * 4, 0.35, 0.11); view.burst(e.x, 1.6, e.z, 0xfff0d0, 4, 5, 0.25, 0.08); view.shock(e.x, e.z, 2.2 + hv * 2.4, 0xff6a5a, 0.3); view.flash(e.x, e.z, 0xff6a5a, 70 + hv * 90);
      num(e.x, e.z, '-' + e.v, big ? '#ffd36b' : '#ff7a6a', big ? 1.5 : 1.1);
      if (e.id === me) { view.shake = Math.max(view.shake, 0.6 + hv * 0.8); SFX.play('phit'); redFlash(0.25 + hv * 0.3); }
      else if (e.by === me) { view.shake = Math.max(view.shake, 0.3 + hv * 0.5); SFX.play('hit'); }
      if ((e.id === me || e.by === me) && S.net === 'solo') S.slowT = Math.max(S.slowT || 0, big ? 0.1 : 0.05);
      break; }
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
    case 'ko': { // 탈락: 몸이 조각나 흩어져요
      view.shatter(e.x, e.z, [0xd8d0bc, 0x6a6470, 0x5a5040, 0x8a8a96], 30, true); view.burst(e.x, 1.2, e.z, 0xffe8b0, 16, 7, 0.6, 0.12); view.shock(e.x, e.z, 5, 0xffe08a, 0.5); view.flash(e.x, e.z, 0xffd08a, 140); view.shake = Math.max(view.shake, 0.6); SFX.play('kill');
      const by = S.snap && S.snap.pl.find(q => q.id === e.by), who = S.snap && S.snap.pl.find(q => q.id === e.id), nm = q => q ? (q.id === S.me ? T('나') : q.bot ? ROLES[q.role].name : q.name) : '';
      view.column(e.x, e.z, 0xffe8b0, 1.0); view.rise(e.x, e.z, 0xffe8b0, 22, 1.6, 1.4, 6); view.ring(e.x, e.z, 3.4, 0xffe8b0, 0.7);
      if (who) deathFx(who.role, e.x, e.z);
      if (who) killFeed(by ? T('{0} → {1}', nm(by), nm(who)) : T('{0} 쓰러짐', nm(who)), by && by.id === S.me);
      if (by && by.id !== e.id) view.pose(by.id, 'kill');
      if (by && by.id === S.me && who) killBanner(nm(who));
      if (e.id === me) bigMsg(T('쓰러졌어요'), T('{0}초 뒤 진지에서 다시 일어나요', Math.round((who && who.rs) || RESP_T)), 2600); break; }
    case 'down': SFX.play('down'); if (e.id === me) { S.everDown = true; bigMsg(T('쓰러졌어요'), T('동료가 일으켜 줄 때까지 버텨요'), 2200); } break;
    case 'revive': view.column(e.x, e.z, 0xfff0b0); SFX.play('revive'); if (e.id === me) bigMsg(T('다시 일어났어요'), '', 1400); break;
    case 'roll': if (e.id !== me) SFX.play('roll'); break;
    case 'spawn': view.burst(e.x, 0.3, e.z, 0x6a5a7a, 10, 3, 0.8, 0.14); SFX.play('spawn'); break;
    case 'slam': view.ring(e.x, e.z, 3.6, 0xff5a3a, 0.45); view.burst(e.x, 0.4, e.z, 0x8a7a6a, 18, 8, 0.7, 0.16); view.shake = Math.max(view.shake, 1.1); SFX.play('slam'); break;
    case 'bsweep': view.arc(e.x, e.z, e.a, 5.4, 0xff6a4a); SFX.play('swing'); view.shake = Math.max(view.shake, 0.5); break;
    case 'bwind': SFX.play('warn'); break;
    case 'bcharge': SFX.play('roar'); break;
    case 'roar': SFX.play('roar'); view.shake = 1; break;
    case 'eswing': view.eAct(e.id); break;
    case 'trip': SFX.play('clang'); view.trip(e.id, false); view.burst(e.x, 0.4, e.z, 0xb8a888, 10, 4, 0.4, 0.12); break;
    case 'launch': view.trip(e.id, true); view.burst(e.x, 0.6, e.z, 0xff8a2a, 22, 7, 0.6, 0.14); view.shock(e.x, e.z, 3, 0xff7a20, 0.4); view.flash(e.x, e.z, 0xff7a20, 110); break;
    case 'flare': view.burst(e.x, 1.4, e.z, 0xffa040, 12, 6, 0.4, 0.1); break;
    case 'bphase': { view.roar(); const P = e.p === 2 ? CH.boss.p2 : e.p === 3 ? CH.boss.p3 : e.p === 4 ? CH.boss.p4 : null, sub = P && P[1], mp = myP();
      // 기사단장 3단계: 망토가 찢겨 날아가요
      if (e.p === 3 && CH.boss.ai === 'warden') { const b = S.snap && S.snap.en.find(q => q.k === 'boss'); if (b) { view.shatter(b.x, b.z, [0x3a0e14, 0x5a1a22, 0x2a0a10], 36, true); view.shock(b.x, b.z, 7, 0xff5a20, 0.6); view.flash(b.x, b.z, 0xff5a20, 220); } } if (P) { if (mp && mp.dn) toast(P[0] + ' · ' + sub, 3600); else bigMsg(P[0], sub, 3700); } } SFX.play('roar'); view.shake = 1.2; break;
    case 'parry': bigMsg(T('완벽한 막기!'), T('보스가 기절했어요. 지금 공격해요'), 2400); SFX.play('parry'); view.burst(e.x, 2, e.z, 0xffffff, 16, 8, 0.6, 0.12); view.shake = 0.8; break;
    case 'summon': SFX.play('spawn'); break;
    case 'fire': SFX.play('fire'); break;
    case 'snap': SFX.play('clang'); break;
    case 'disarm': toast(T('종자가 바닥 함정을 해체했어요.')); SFX.play('click'); break;
    case 'chest': toast(T('상자에서 명예 {0}을 얻었어요.', e.h || 25)); SFX.play('clear'); view.rise(e.x, e.z, 0xffd36b, 16, 1.2, 1, 6); break;
    case 'secret': { // 금 간 벽이 무너지고 비밀 방이 열려요
      view.shatter(e.x, e.z, [0x6e6a74, 0x58545e, 0x8a8494, 0x4a4650], 40, true); view.burst(e.x, 1.5, e.z, 0xbcae94, 30, 8, 0.8, 0.2); view.shock(e.x, e.z, 5, 0xffe08a, 0.5); view.flash(e.x, e.z, 0xffe08a, 200);
      view.shake = Math.max(view.shake, 1.2); SFX.play('slam'); bigMsg(T('비밀 방을 찾았어요'), T('무너진 벽 너머에 옛 기사단의 방이 있어요'), 3200); mini.dirty = true; break; }
    case 'lore': { const ci = chapterIndex(), L = (LORE[ci] || [])[e.li]; if (!L) break; TK.q.length = 0; TK.cur = null; for (const t of L) TK.q.push({ r: 'lore', t }); TK.wait = 0; SFX.play('bless'); view.column(e.x, e.z, 0xffd36b, 0.8);
      SAVE.lore[ci + '-' + e.li] = 1; save(); if (Object.keys(SAVE.lore).length >= 16) unlock('lore'); break; }
    case 'combo': { // 합동기: 화면 가운데 큰 글씨, 크게 터지는 빛
      const col = { lightdash: 0xfff0b0, sanct: 0x9af0a8, wall: 0x9ad0ff, firerain: 0xff7a20, net: 0xffb060 }[e.c] || 0xffffff;
      bigMsg(T('합동기! {0}', (COMBOS.find(x => x.id === e.c) || e).name), '', 2000); view.shock(e.x, e.z, 7, col, 0.6); view.shock(e.x, e.z, 4, 0xffffff, 0.35); view.rune(e.x, e.z, 3.4, col, 1.2, 3); view.column(e.x, e.z, col, 1.0); view.rise(e.x, e.z, col, 30, 3, 1.4, 8); view.flash(e.x, e.z, col, 220);
      view.shake = Math.max(view.shake, 1.1); SFX.play('parry'); if (S.net === 'solo') S.slowT = Math.max(S.slowT || 0, 0.25); break; }
    case 'combo1': if (e.pid === me) { SAVE.combos[e.c] = 1; save(); if (COMBOS.every(c => SAVE.combos[c.id])) unlock('combo5'); } break;
    case 'over': bigMsg(T('모두 쓰러졌어요'), T('끝없는 심연 {0}층에서 원정이 끝났어요', e.floor), 3400); SFX.play('wipe'); break;
    case 'mimic': bigMsg(T('미믹이에요!'), T('상자가 이빨을 드러냈어요'), 2400); TK.q.length = 0; TK.cur = null; talk('mimic'); view.shock(e.x, e.z, 4, 0xff3a2a, 0.4); view.burst(e.x, 1.2, e.z, 0xe8b48a, 14, 6, 0.5, 0.12); view.shake = Math.max(view.shake, 0.8); SFX.play('roar'); break;
    case 'psolve': bigMsg(T('수수께끼를 풀었어요'), T('창살문이 올라가요'), 2600); SFX.play('door'); view.burst(e.x, 2, e.z, 0x9a9aa6, 20, 5, 0.8, 0.14); view.flash(e.x, e.z, 0x9af0a8, 120); view.shake = Math.max(view.shake, 0.5);
      if (e.pk != null && !S.solvedP[e.pk]) { S.solvedP[e.pk] = 1; SAVE.puz = (SAVE.puz | 0) + 1; save(); if (SAVE.puz >= 10) unlock('puzzle10'); } break;
    case 'plit': SFX.play('fire'); view.rise(e.x, e.z, 0xffd36b, 10, 0.8, 0.7, 6); view.flash(e.x, e.z, 0xffb050, 70); break;
    case 'pwrong': toast(T('순서가 틀렸어요. 화로 불이 모두 꺼졌어요.'), 2600); SFX.play('warn'); view.burst(e.x, 2, e.z, 0x6a6470, 12, 4, 0.7, 0.14); break;
    case 'pburn': SFX.play('fire'); view.burst(e.x, 1.4, e.z, 0xff8a2a, 16, 5, 0.7, 0.12); view.rise(e.x, e.z, 0x5a5050, 10, 1.2, 0.9, 5); view.flash(e.x, e.z, 0xff7a20, 90); break;
    case 'ptime': toast(T('10초가 지났어요. 과녁을 처음부터 다시 맞혀요.'), 2600); SFX.play('warn'); break;
    case 'plever': SFX.play('clang'); view.burst(e.x, 1.2, e.z, 0xffd36b, 6, 3, 0.4, 0.1); break;
    case 'pshatter': SFX.play('clang'); view.shatter(e.x, e.z, [0xbfe8ff, 0x9ae0ff, 0xffffff], 22, true); view.flash(e.x, e.z, 0x9ae0ff, 90); break;
    case 'pdouse': SFX.play('fire'); view.rise(e.x, e.z, 0xb0a8c0, 14, 1.2, 1.1, 5); view.burst(e.x, 1.2, e.z, 0x9af0e0, 10, 4, 0.5, 0.1); break;
    case 'pout': view.burst(e.x, 1.5, e.z, 0x6a4a8a, 6, 2, 0.5, 0.1); break;
    case 'emb': if (e.on) { SFX.play('fire'); view.burst(e.x, 1.6, e.z, 0xffb060, 10, 3, 0.5, 0.1); } break;
    case 'prot': SFX.play('clang'); view.burst(e.x, 0.6, e.z, 0x9a9aa6, 6, 3, 0.4, 0.1); break;
    case 'phelp': toast(e.pk === -1 ? T('봇 동료가 기둥을 쳐서 쓰러뜨려요.') : T('봇 동료가 수수께끼를 도와줘요.'), 2600); break;
    case 'pcrack': SFX.play('clang'); view.burst(e.x, 2 + Math.random() * 4, e.z + 1, 0x9a8e84, 8, 4, 0.6, 0.14); view.shake = Math.max(view.shake, 0.25); break;
    case 'pfall': bigMsg(T('기둥이 쓰러졌어요'), T('쓰러진 기둥을 밟고 건너요'), 2600); SFX.play('slam'); view.shake = Math.max(view.shake, 0.6); view.burst(e.x, 3, e.z, 0x9a8e84, 22, 6, 0.9, 0.18); break;
    case 'lstop': SFX.play('door'); view.burst(e.x, e.up ? 3 : 0.5, e.z, 0x9a8e84, 10, 3, 0.6, 0.12); if (e.up) toast(T('승강기가 위층에 닿았어요. 다시 돌리면 내려가요.'), 2400); break;
    case 'lifted': bigMsg(T('모두 위층에 올라왔어요'), T('이제 승강기는 혼자 타도 움직여요'), 2600); SFX.play('clear'); break;
    case 'flaggot': S.flagGot = 1; break;
    case 'torch': if (e.id === me) toast(e.on ? T('횃불을 들었어요. 들고 있는 동안은 기술을 못 써요.') : T('횃불을 내려놓았어요.'), 2400); SFX.play('fire'); break;
    case 'esc': TK.q.length = 0; TK.cur = null; talk('esc'); bigMsg(T('성이 무너지기 시작해요!'), T('초록빛 출구까지 모두 달려요'), 3200); SFX.play('slam'); view.shake = Math.max(view.shake, 1.4); flashScreen(); break;
    case 'rock': view.shatter(e.x, e.z, [0x6a625a, 0x58504a, 0x8a8076], 12, false); view.ring(e.x, e.z, 2, 0x8a7a6a, 0.4); view.burst(e.x, 0.4, e.z, 0x8a7a6a, 10, 5, 0.6, 0.14); if (Math.random() < 0.5) SFX.play('slam'); break;
    case 'escfail': bigMsg(T('무너진 돌에 길이 막혔어요'), T('보스 방에서 다시 달려요'), 3000); SFX.play('wipe'); break;
    case 'escaped': bigMsg(T('무너지는 곳을 빠져나왔어요'), '', 2400); SFX.play('clear'); break;
    case 'fork': bigMsg(MIDB[chapterIndex()][e.k], e.k ? T('부하를 부르는 중간 보스예요') : T('돌진하는 중간 보스예요'), 2400); SFX.play('clear'); view.column(e.x, e.z, e.k ? 0x6ab0ff : 0xff6a50, 1.6); break;
    case 'mbkill': bigMsg(T('중간 보스 처치'), T('명예 30'), 2000); SFX.play('clear'); view.rise(e.x, e.z, 0xffd36b, 24, 2, 1.2, 6); break;
    case 'altar': bigMsg(T('제단의 축복'), T('축복을 하나 골라요'), 2200); SFX.play('clear'); view.column(e.x, e.z, 0xffe08a, 1.2); break;
    case 'checkpoint': bigMsg(T('모닥불에 불을 붙였어요'), T('모두 쓰러지면 여기서 다시 시작해요'), 3000); SFX.play('door'); break;
    case 'wake': if (!S.wakeT || performance.now() - S.wakeT > 1500) { S.wakeT = performance.now(); SFX.play('spawn'); } view.burst(e.x, 0.3, e.z, 0x6a5a7a, 6, 3, 0.6, 0.12); break;
    case 'bossIntro': { view.roar(); talk('boss', 3400); bigMsg(CH.boss.name, MAP.areas.find(a => a.boss).line, 3400); const b = S.snap && S.snap.en.find(q => q.k === 'boss'); if (b) { view.focusOn(b.x, b.z, 3); view.shock(b.x, b.z, 8, 0xff5a3a, 0.8); view.flash(b.x, b.z, 0xff5a3a, 200); } view.shake = Math.max(view.shake, 0.8); letterbox(3000); break; }
    case 'bvolley': SFX.play('arrow'); view.burst(e.x, 1.8, e.z, 0xffb060, 8, 4, 0.3, 0.1); break;
    case 'nova': SFX.play('orb'); { const nc = CH.boss.col || (CH.boss.ai === 'king' ? 0xff7a20 : 0x6ab0ff); view.shock(e.x, e.z, 4, nc, 0.4); view.flash(e.x, e.z, nc, 120); } break;
    case 'throw': view.throwBomb(e.x, e.z, e.tx, e.tz, e.T); SFX.play('swing'); break;
    case 'foot': if (S.snap && S.snap.tf && e.tm !== myTm()) view.foot(e.x, e.z, e.a); break;
    case 'zfx': { // 늦게 터지는 보스 장판: 얼음 창, 불기둥, 고드름, 불덩이
      const col = { smite: 0xfff0b0, curse: 0xb06aff, lance: 0x9ad8ff, icicle: 0xc8ecff, frostnova: 0x6ad0ff, beam: 0xff8a30, meteor: 0xb06aff, rock: 0xb8a890 }[e.f] || 0xffffff;
      if (e.f === 'bomb') { view.burst(e.x, 1, e.z, 0xff9a40, 18, 8, 0.6, 0.15); view.burst(e.x, 1, e.z, 0xffe8b0, 8, 6, 0.4, 0.1); view.shock(e.x, e.z, e.r + 1, 0xffb060, 0.4); view.flash(e.x, e.z, 0xffa050, 120); view.shake = Math.max(view.shake, 0.35); SFX.play('slam'); break; }
      if (e.len) { for (let i = 1; i <= 5; i++) { const x = e.x + Math.cos(e.a) * e.len * i / 5, z = e.z + Math.sin(e.a) * e.len * i / 5; view.burst(x, 0.6, z, col, 6, 5, 0.5, 0.12); if (i % 2) view.column(x, z, col, 0.4); } view.flash(e.x, e.z, col, 90); SFX.play(e.f === 'beam' ? 'fire' : 'clang'); }
      else { if (e.f === 'smite' || e.f === 'curse') { view.shock(e.x, e.z, e.r + 2, col, 0.55); view.ring(e.x, e.z, e.r, col, 0.6); view.column(e.x, e.z, col, 1.0); view.rise(e.x, e.z, col, 20, e.r, 1, 7); view.shake = Math.max(view.shake, 0.7); } if (e.f === 'frostnova' || (e.f === 'rock' && e.r > 4)) view.shock(e.x, e.z, e.r || 6, col, 0.5); else view.column(e.x, e.z, col, 0.7); view.burst(e.x, 0.5, e.z, col, 14, 6, 0.6, 0.14); view.flash(e.x, e.z, col, 100); view.shake = Math.max(view.shake, 0.4); SFX.play('slam'); }
      break; }
    case 'pillar': view.column(e.x, e.z, 0x6ab0ff, 0.9); view.burst(e.x, 0.5, e.z, 0x9ad0ff, 14, 6, 0.6, 0.14); view.flash(e.x, e.z, 0x6ab0ff, 80); SFX.play('slam'); break;
    case 'blink': view.column(e.x, e.z, 0x9ad0ff, 0.5); view.rise(e.x, e.z, 0x9ad0ff, 12, 1.5, 0.7, 6); SFX.play('orb'); break;
    case 'recall': view.column(e.x, e.z, 0x9af0e0); if (e.id === me && e.end) bigMsg(T('깃발로 귀환했어요'), '', 1400); break;
    case 'respawn': view.column(e.x, e.z, 0xff9a48); if (e.id === me) bigMsg(T('진지에서 다시 일어났어요'), '', 1800); break;
    case 'flag': { const mine = e.own === myTm(), c = TEAMS[e.own].c; view.column(e.x, e.z, c, 1.4); view.ring(e.x, e.z, 6, c, 0.9); view.shock(e.x, e.z, 7, c, 0.6); view.flash(e.x, e.z, c, 120); bigMsg(mine ? T('깃발을 차지했어요!') : T('깃발을 빼앗겼어요!'), '', 1800); SFX.play(mine ? 'kill' : 'roar'); break; }
    case 'capbuff': view.rise(e.x, e.z, 0xffd36a, 12, 2.2, 0.9, 5); view.ring(e.x, e.z, 1.8, 0xffd36a, 0.5); if (e.id === me) { toast(T('점령 효과! 5초 동안 이동 속도와 공격이 20% 올라요'), 2400); SFX.play('bless'); } break;
    case 'door': toast(e.open ? T('신전 문이 열렸어요! 가운데 깃발을 차지할 수 있어요') : T('신전 문이 닫혔어요'), 2400); SFX.play(e.open ? 'warn' : 'slam'); view.shake = Math.max(view.shake, 0.5); break;
    case 'storm': toast(e.on ? T('모래폭풍이 불어요! 멀리가 안 보여요') : T('모래폭풍이 잦아들었어요'), 2400); break;
    case 'monster': view.column(e.x, e.z, 0xff7a3a, 1.6); view.shock(e.x, e.z, 8, 0xff7a3a, 0.6); view.flash(e.x, e.z, 0xff7a3a, 140); bigMsg(T('꼭짓점에 괴물이 나타났어요!'), T('쓰러뜨리면 우리 팀 공격과 점령 속도가 영구히 2% 올라요'), 2600); SFX.play('roar'); break;
    case 'push': if (e.id === S.me && S.local) { S.local.kvx = (S.local.kvx || 0) + e.vx; S.local.kvz = (S.local.kvz || 0) + e.vz; } break;
    case 'monkill': { const mine = e.tm === myTm(); view.column(e.x, e.z, TEAMS[e.tm].c, 1.4); view.shock(e.x, e.z, 8, TEAMS[e.tm].c, 0.6); bigMsg(mine ? T('괴물을 쓰러뜨렸어요! 괴물 처치 효과 lvl.{0}', e.lv) : T('상대가 괴물을 쓰러뜨렸어요 · lvl.{0}', e.lv), T('{0}팀 공격·점령 속도 +{1}%', mine ? T('우리') : T('상대'), e.lv * 2), 2800);
      // 레벨이 오르면 그 팀 모두의 발밑에서 빛이 솟아요 (살아 있는 팀원 모두)
      if (S.snap) for (const q of S.snap.pl) if (q.tm === e.tm && !q.dd) { view.ring(q.x, q.z, 3.4, TEAMS[e.tm].c, 0.9); view.rise(q.x, q.z, 0xffe08a, 16, 1.6, 1, 6); view.column(q.x, q.z, TEAMS[e.tm].c, 0.7); }
      SFX.play(mine ? 'bless' : 'warn'); if (mine) setTimeout(() => SFX.play('kill'), 220); break; }
    case 'wipe': bigMsg(T('모두 쓰러졌어요'), T('잠시 뒤 마지막 모닥불에서 다시 시작해요'), 3000); SFX.play('wipe'); break;
    case 'restart': toast(T('깨어 있던 적은 제자리로 돌아갔어요.')); break;
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
// 탈락하면 관전: 아직 살아 있는 사람의 시점을 따라가요 (←/→ 또는 화면 누르기로 바꿔요)
function myTm() { const m = S.snap && S.snap.pl.find(q => q.id === S.me); return m ? m.tm : 0; }
function specList() { return S.snap ? S.snap.pl.filter(q => !q.dd && q.id !== S.me && q.tm === myTm()) : []; }
function specCycle(d) { const L = specList(); if (!L.length) return; const i = L.findIndex(q => q.id === S.spec); S.spec = L[(i + d + L.length * 2) % L.length].id; SFX.play('click'); }
function specTick(me) {
  const on = !!me && !!me.dd && S.snap.ph === 'play', L = specList();
  if (on && (!L.some(q => q.id === S.spec))) S.spec = L.length ? L[0].id : null;
  const tgt = on && S.spec ? S.snap.pl.find(q => q.id === S.spec) : null;
  view.camId = tgt ? tgt.id : null;
  const el = $('specTag'); el.style.display = tgt ? 'block' : 'none';
  if (tgt) el.textContent = T('관전 중 · {0}', tgt.bot ? ROLES[tgt.role].name : tgt.name) + (TOUCH ? ' · ' + T('화면을 누르면 다음 사람') : ' · ← → ' + T('로 바꾸기'));
}
addEventListener('keydown', e => { if (!S.snap || S.scr !== '' || !view.camId) return; const k = e.key; if (k === 'ArrowRight' || k === 'd' || k === 'D') specCycle(1); else if (k === 'ArrowLeft' || k === 'a' || k === 'A') specCycle(-1); });
// 클릭 이동: PC는 우클릭(누른 채 끌면 따라와요), 모바일은 화면 터치
const ckSet = (x, y) => { try { const g = view.groundAt(x, y); if (g) S.ck = { x: g.x, z: g.z }; } catch (e) { } };
const ckOn = () => SAVE.set.mv === 'click' && inGame() && S.scr === '' && !S.rcOpen;
$('gl').addEventListener('mousedown', e => { if (e.button === 2 && ckOn()) { S.ckDown = true; ckSet(e.clientX, e.clientY); } });
addEventListener('mouseup', e => { if (e.button === 2) S.ckDown = false; });
addEventListener('mousemove', e => { if (S.ckDown && ckOn()) ckSet(e.clientX, e.clientY); });
$('gl').addEventListener('touchstart', e => { if (TOUCH && ckOn()) { S.ckDown = true; ckSet(e.changedTouches[0].clientX, e.changedTouches[0].clientY); } }, { passive: true });
$('gl').addEventListener('touchmove', e => { if (TOUCH && S.ckDown && ckOn()) ckSet(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: true });
addEventListener('touchend', () => { S.ckDown = false; });
// 귀환 지도: 우리 팀 깃발을 누르면 3초 뒤 그곳으로, 다른 곳을 누르면 취소(쿨타임은 돌아요)
$('gl').addEventListener('mousedown', e => { if (!S.rcOpen) return; e.stopImmediatePropagation(); e.preventDefault(); const h = (S.rcHit || []).find(q => Math.hypot(q.x - e.clientX, q.y - e.clientY) < q.r + 14); once.rcl = h ? h.v : -1; S.rcOpen = false; SFX.play('click'); }, true);
$('gl').addEventListener('pointerdown', e => {
  // 쓰러졌을 때 뜨는 지도에서 깃발(또는 진지)을 누르면 거기서 다시 일어나요
  if (S.rspHit && S.rspHit.length) { const h = S.rspHit.find(q => Math.hypot(q.x - e.clientX, q.y - e.clientY) < q.r + 8); if (h) { if (h.v === -9) S.rspDone = false; else { S.rspSel = h.v; S.rspDone = true; } SFX.play('click'); return; } }
  if (view.camId && !S.rspOpen) specCycle(1);
});
function syncScene() {
  const sn = S.snap;
  if (!S.built) { view.buildMap(); S.built = true; S.local = null; mini.reset(); }
  if (sn.ph !== S.lastPh) {
    const prev = S.lastPh; S.lastPh = sn.ph;
    if (sn.ph === 'intro') { show('sIntro'); setHud(false); }
    else if (prev === 'intro' || prev === '') { view.battleOff(); show(''); setHud(true); S.area = -2; S.introHero = null; view.camId = null; $('introCard').classList.remove('on'); }
    if (sn.ph === 'won') { S.wonT = 0; bigMsg('', '', 0); const w = sn.pl.find(q => q.id === sn.win); S.winId = w ? w.id : null; S.winPoseT = 0; if (w) { view.focusOn(w.x, w.z, 4); view.crownDrop(w.id); view.pose(w.id, 'rally'); view.flash(w.x, w.z, 0xffe08a, 160); SFX.play('won'); } } else if (sn.ph !== 'won') S.winId = null;
  }
  // 비밀 방: 열린 것은 지도와 화면에서도 열어요 (게스트는 여기서 길도 열어요)
  if (sn.w.sc) sn.w.sc.forEach((o, k) => { if (!o) return; if (!SOPEN[k]) { openSecret(k); mini.dirty = true; } if (!view.secOn[k]) view.openSecret(k, sn.w.lr); });
  if (sn.w.lr) view.loreRead(sn.w.lr);
  // 수수께끼 방 창살문: 게스트도 열린 문은 지나갈 수 있게
  if (sn.w.pz) sn.w.pz.forEach((q, k) => { if (q.d && !GOPEN[k]) { openGate(k); mini.dirty = true; } });
  // 쓰러진 기둥 다리와 승강기 높이도 게스트 화면에 맞춰요
  if (sn.w.pt) sn.w.pt.forEach((v, k) => { if (v === -1 && !PDOWN[k]) { dropPillar(k); mini.dirty = true; } });
  if (sn.w.lf) sn.w.lf.forEach((v, k) => { LIFTH[k] = v[0]; });
  // 새 구역에 처음 들어가면 이름을 보여 줘요
  const me = myP();
  if (me && sn.ph !== 'intro') {
    const pos = S.local || me, a = areaAt(pos.x, pos.z);
    if (a >= 0 && a !== S.area) { S.area = a; if (!S.seenA[a]) { S.seenA[a] = 1; const A = MAP.areas[a]; if (!A.boss && !sn.w.es) { bigMsg(A.name, A.line, 3200); talk(A.puz || (A.dark ? 'dark' : A.t), 2600); } } }
    mini.reveal(pos.x, pos.z);
  }
}
function paintIntro() {
  const IT = CH.introT || INTRO_T, t = S.snap.pt, n = Math.max(1, Math.ceil(IT - t));
  if (n !== S.introIdx) { S.introIdx = n; const el = $('introLine'); el.classList.remove('on'); setTimeout(() => { el.textContent = n > 3 ? T('준비!') : String(n); el.classList.add('on'); }, 50); }
  // 영웅 소개: 한 명씩 카메라가 다가가 이름과 직업을 보여 주고 포즈를 잡아요
  const pl = S.snap.pl.filter(q => q.tm === myTm()), k = Math.min(pl.length - 1, Math.floor(t / (IT / pl.length))), who = pl[k];   // 시작 전에는 우리 편만 소개해요
  if (who && S.introHero !== who.id) {
    S.introHero = who.id; view.camId = who.id; view.focusOn(who.x, who.z, 0.9);
    const card = $('introCard'); card.firstElementChild.textContent = who.name; card.lastElementChild.textContent = ROLES[who.role].name; card.classList.remove('on'); setTimeout(() => card.classList.add('on'), 30);
    if (who.role === 'streltsy') setTimeout(() => { view.burst(who.x, 3.6, who.z, 0xffc060, 10, 5, 0.3, 0.1); view.flash(who.x, who.z, 0xffc060, 80); SFX.play('slam'); }, 220);   // 하늘로 한 발
    view.pose(who.id, 'rally'); view.shock(who.x, who.z, 5, pcol(who) ? 0xffe08a : 0xffe08a, 0.5); view.flash(who.x, who.z, 0xffe08a, 90); SFX.play('parry');
  }
  $('introSkip').classList.remove('on'); $('introSkip').style.display = 'none';
}
function finalCheck(sn) { }
function paintHud() {
  const sn = S.snap, me = myP();
  if (sn.dr) { if (sn.dr[0] !== DSTATE.open) { setDoors(sn.dr[0]); mini.dirty = true; } } else if (DSTATE.open) { setDoors(0); mini.dirty = true; }
  $('storm').classList.toggle('on', !!(sn.sm && sn.sm[0]));   // 사막 신전 모래폭풍
  const mt = myTm(), nf = [0, 0]; if (sn.tf) for (const f of sn.tf) if (f[0] >= 0) nf[f[0]]++;
  $('roomTag').textContent = CH.title + ' · ' + T('우리 깃발 {0} · 상대 깃발 {1}', nf[mt], nf[1 - mt]);
  const boss = sn.w.boss && !sn.w.bd ? sn.en.find(e => e.k === 'boss') : null;
  $('bossBar').style.display = boss ? 'block' : 'none'; if (boss && $('bossName').textContent !== CH.boss.name) $('bossName').textContent = CH.boss.name;
  if (boss) { $('bossHp').style.width = Math.max(0, boss.hp / boss.mx * 100) + '%'; $('bossPh').textContent = boss.sn ? T('기절!') : ['', T('1단계'), T('2단계') + ' · ' + CH.boss.ph[0], T('3단계') + ' · ' + CH.boss.ph[1], T('마지막 단계') + ' · ' + (CH.boss.ph[2] || '')][boss.ph] || ''; }
  // 동료 칸
  const tl = sn.pl.filter(q => q.tm === mt), pb = $('party'); if (pb.children.length !== tl.length) { pb.innerHTML = ''; tl.forEach(() => { const d = document.createElement('div'); d.className = 'pf'; d.innerHTML = '<div class="n"><i></i><b></b><span></span></div><div class="hp"><i></i><em></em></div><div class="st"></div>'; pb.appendChild(d); }); }
  tl.forEach((p, i) => {
    const d = pb.children[i], R = ROLES[p.role];
    d.querySelector('.n i').style.background = pcol(p); d.querySelector('.n b').textContent = R.name; d.querySelector('.n span').textContent = p.id === S.me ? T('나') : p.bot ? T('봇') : p.name;
    d.querySelector('.hp i').style.width = (p.hp / p.mx * 100) + '%'; d.querySelector('.hp em').style.width = Math.min(100, p.sh / p.mx * 100) + '%';
    d.classList.toggle('down', !!(p.dn || p.dd));
    d.querySelector('.st').textContent = p.dd ? T('{0}초 뒤 부활', Math.ceil(p.rs)) : p.tn ? T('외침') : p.ra ? T('함성') : p.kl ? T('{0}명 쓰러뜨림', p.kl) : '';
  });
  // 기술 칸
  if (me) {
    const R = ROLES[me.role], sk = $('skills');
    const kbs = JSON.stringify(KB()); if (sk.dataset.role !== me.role || sk.dataset.kb !== kbs) { sk.dataset.role = me.role; sk.dataset.kb = kbs; sk.innerHTML = ''; R.skills.concat([{ key: 'roll', name: T('구르기'), cd: 1.2 }]).forEach((s, i) => { const kk = keyLabel(KB()[['q', 'e', 'r', 'roll'][i]]); const d = document.createElement('div'); d.className = 'sk'; d.innerHTML = `<i class="cd"></i><span class="nm">${s.name}</span><small>${kk}</small><b class="cn"></b>`; sk.appendChild(d); }); ['tQ', 'tE', 'tR'].forEach((id, i) => $(id).querySelector('span').textContent = R.skills[i].name); }
    const cds = me.cd.concat([me.rc]), maxs = R.skills.map(s => s.cd).concat([1.2]);
    [...sk.children].forEach((d, i) => { const c = Math.max(0, cds[i]); d.querySelector('.cd').style.height = Math.min(100, c / maxs[i] * 100) + '%'; d.querySelector('.cn').textContent = c > 0.05 ? Math.ceil(c) : ''; d.classList.toggle('cool', c > 0.05); });
    ['tQ', 'tE', 'tR', 'tRoll'].forEach((id, i) => { const c = Math.max(0, cds[i]); $(id).querySelector('.cd').style.height = Math.min(100, c / maxs[i] * 100) + '%'; });
  }
  // 안내
  let pr = '';
  if (me && !me.dn && !me.dd) {
    const pos = S.local || me;
    const dn = sn.pl.find(q => q.dn && !q.dd && Math.hypot(q.x - pos.x, q.z - pos.z) < 2.2);
    const fw = sn.w.fl, F = TOUCH ? T('F 버튼') : 'F';
    if (fw && fw[2] === me.id) pr = T('깃발을 든 채 장을 끝내요 · {0} 내려놓기', F);
    else if (dn) pr = T('{0}를 꾹 눌러 {1} 일으키기', F, ROLES[dn.role].name);
    else if (fw && !fw[2] && flagShown(sn.w.sc, sn.w.pz.map(q => q.d)) && Math.hypot(fw[0] - pos.x, fw[1] - pos.z) < 2.6) pr = T('{0}를 꾹 눌러 기사단 깃발 들기', F) + (fw[3] > 0 ? ' ' + Math.round(fw[3] / 1.5 * 100) + '%' : '');
    else if (MAP.chests.some(([x, y], k) => !sn.w.ch[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.6)) pr = T('{0}를 꾹 눌러 상자 열기', F);
    else if (MAP.lores.some(([x, y, q], k) => sn.w.sc[q] && !sn.w.lr[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.6)) pr = T('{0}를 꾹 눌러 옛 기록 읽기', F);
    else if (MAP.fires.some(([x, y], k) => !sn.w.fi[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 3)) pr = T('{0}를 꾹 눌러 모닥불 피우기', F);
    else if (MAP.darks.some((D, k) => Math.hypot(cw(D.stand[0]) - pos.x, cw(D.stand[1]) - pos.z) < 2.6 && (me.tc === k + 1 || sn.pl.filter(q => q.tc === k + 1).length < 2))) pr = me.tc ? T('{0}를 눌러 횃불 내려놓기', F) : T('{0}를 눌러 횃불 들기 (드는 동안 기술 못 씀)', F);
    else if (puzPrompt(sn, pos)) pr = puzPrompt(sn, pos);
    else if (cutPrompt(sn, pos)) pr = cutPrompt(sn, pos);
    else if (MAP.fork && sn.w.fk && sn.w.fk[0] < 0 && [MAP.fork.a, MAP.fork.b].some(q => Math.hypot(cw(q[0]) - pos.x, cw(q[1]) - pos.z) < 2.8)) { const k = Math.hypot(cw(MAP.fork.a[0]) - pos.x, cw(MAP.fork.a[1]) - pos.z) < 2.8 ? 0 : 1; pr = T('{0}를 꾹 눌러 {1} 길 고르기', F, k ? T('오른쪽') : T('왼쪽')) + ' · ' + MIDB[chapterIndex()][k] + ' ' + (k ? T('(부하를 불러요)') : T('(돌진해요)')); }
    else if (MAP.altars.some(([x, y], k) => !sn.w.al[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.8)) pr = T('{0}를 꾹 눌러 제단에서 축복 받기', F);
    else if (MAP.fires.some(([x, y], k) => sn.w.fi[k] && Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 4) && me.hp < me.mx) pr = T('모닥불 곁에서 체력이 차올라요');
    else if (sn.bless && Object.values(sn.bless).some(Boolean) && !(sn.bless[S.me])) pr = T('동료가 축복을 고르는 중이에요');
  }
  const pe = $('prompt'); pe.textContent = pr; pe.style.display = pr ? 'block' : 'none'; pe.classList.toggle('up', $('talk').classList.contains('on'));
}
// 수수께끼 방 안내
function puzPrompt(sn, pos) {
  const a = areaAt(pos.x, pos.z), F = TOUCH ? T('F 버튼') : 'F', Q = TOUCH ? T('Q 버튼') : 'Q';
  for (let k = 0; k < MAP.puzzles.length; k++) {
    const q = MAP.puzzles[k], z = sn.w.pz && sn.w.pz[k]; if (!z || z.d || q.area !== a) continue;
    const near = q.items.some(([x, y]) => Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.4);
    if (q.k === 'plates') return T('모두 발판 위에 서요') + ' · ' + z.o.split('').filter(c => c === '1').length + '/' + Math.min(4, sn.pl.filter(p => !p.dn && !p.dd).length);
    const RP = ROLE_PUZ[q.k];
    if (RP) {
      const n = z.l.split('').filter(c => c === '1').length + '/' + q.items.length, me = sn.pl.find(p => p.id === S.me), mine = me && me.role === RP.role, who = ROLES[RP.role].name;
      if (q.k === 'oath') return mine ? T('방패 석판 위에 서서 막기({0})를 써요', Q) + ' · ' + n : T('{0}만 풀 수 있어요. 방패 석판 위에서 막기를 써야 해요', who) + ' · ' + n;
      if (q.k === 'targets') return mine ? T('벽 높이 걸린 과녁을 10초 안에 모두 화살로 맞혀요') + ' · ' + n : T('{0}만 화살로 과녁을 맞힐 수 있어요', who) + ' · ' + n;
      if (q.k === 'basins') return mine ? T('빛 구슬이나 치유로 성수반을 채워요') + ' · ' + n : T('{0}만 빛으로 성수반을 채울 수 있어요', who) + ' · ' + n;
      if (q.k === 'icecrys') return mine ? T('공격·공격·강타의 강타로 얼음 수정을 깨요') + ' · ' + n : T('{0}만 강타로 얼음 수정을 깰 수 있어요', who) + ' · ' + n;
      if (q.k === 'lanterns') return mine ? T('등불 줄 끝에 서서 관통 화살({0}) 한 발로 셋을 꿰뚫어요', Q) + ' · ' + n : T('{0}만 관통 화살로 등불을 켤 수 있어요', who) + ' · ' + n;
      if (q.k === 'vigil') return mine ? T('빛의 원 안에 2초씩 서서 기도해요') + ' · ' + n : T('{0}만 기도의 원을 채울 수 있어요', who) + ' · ' + n;
      if (q.k === 'blackfire') return mine ? T('물약({0})을 던져 검은 불꽃을 꺼요', Q) + ' · ' + n : T('{0}만 물약으로 검은 불꽃을 끌 수 있어요', who) + ' · ' + n;
      return mine ? T('횃불 든 공격으로 가시덩굴을 태워요') + ' · ' + n : T('{0}만 횃불로 가시덩굴을 태울 수 있어요', who) + ' · ' + n;
    }
    const lc = z.l.split('').filter(c => c === '1').length;
    if (q.k === 'levers') return near ? T('{0}를 눌러 지렛대 당기기', F) : T('등불 넷을 모두 켜요 (지렛대는 양옆 등불도 바꿔요)') + ' · ' + lc + '/4';
    if (q.k === 'sigils') return T('빛나는 칸 옆으로 이어서 아홉 칸을 한 번씩 밟아요') + ' · ' + lc + '/9';
    if (q.k === 'crystals') return T('수정 넷을 공격해 함께 빛나게 해요 (8초 뒤 꺼져요)') + ' · ' + lc + '/4';
    if (q.k === 'mirrors') return near ? T('{0}를 눌러 거울 돌리기', F) : T('거울을 돌려 햇빛을 창살문까지 보내요');
    if (q.k === 'embers') { const me = sn.pl.find(p => p.id === S.me); return near ? (me && me.em ? T('{0}를 눌러 불씨 올리기', F) : T('{0}를 눌러 불씨 들기', F)) : T('불씨를 들어 빈 제단 셋에 올려요') + ' · ' + lc + '/3'; }
    if (q.k === 'braziers') return near ? T('{0}를 눌러 화로에 불 붙이기 (공격이나 화살로도 돼요)', F) : T('비석의 색 순서대로 화로에 불을 붙여요') + ' · ' + z.l.split('').filter(c => c === '1').length + '/4';
    return near ? T('{0}를 눌러 석상 돌리기', F) : T('석상 넷이 모두 가운데 문양을 보게 돌려요');
  }
  return '';
}
// 끊어진 길·승강기 안내
function cutPrompt(sn, pos) {
  const a = areaAt(pos.x, pos.z), F = TOUCH ? T('F 버튼') : 'F', Q = TOUCH ? T('Q 버튼') : 'Q';
  for (let k = 0; k < MAP.pits.length; k++) {
    const q = MAP.pits[k], v = sn.w.pt ? sn.w.pt[k] : -1; if (q.area !== a || v === -1) continue;
    return T('금 간 기둥을 강타로 내려찍거나 여러 번 쳐서 쓰러뜨려요') + ' · ' + Math.min(v, 6) + '/6';
  }
  for (let k = 0; k < MAP.lifts.length; k++) {
    const q = MAP.lifts[k], v = sn.w.lf && sn.w.lf[k]; if (!v || q.area !== a || v[1]) continue;
    const near = [q.cb, q.ct].some(([x, y]) => Math.hypot(cw(x) - pos.x, cw(y) - pos.z) < 2.2);
    if (near) return T('{0}를 꾹 눌러 손잡이 돌리기', F) + ' · ' + (v[0] >= 0.97 ? T('승강기 내리기') : v[0] <= 0.03 ? T('승강기 올리기') : T('승강기 움직이는 중'));
    return T('한 명이 손잡이를 돌리는 동안 나머지는 발판에 타요. 위에 간 동료가 다시 내려 줘요');
  }
  return '';
}
/* 작은 지도: 가 본 곳만 보여요 */
const WATERC = (i, j) => MAP.water.some(([x, y, w, h]) => i >= x && i < x + w && j >= y && j < y + h);
const mini = {
  c: document.createElement('canvas'), seen: new Uint8Array(MW * MH), dirty: true,
  reset() { S.mapImg = null; S.mapTry = 0; this.seen.fill(CH.pvp ? 1 : 0); this.c.width = MW * 3; this.c.height = MH * 3; this.dirty = true; },
  reveal(x, z) {
    const ci = Math.floor(x / CS), cj = Math.floor(z / CS), R = 9;
    for (let j = cj - R; j <= cj + R; j++) for (let i = ci - R; i <= ci + R; i++) { if (i < 0 || j < 0 || i >= MW || j >= MH || (i - ci) ** 2 + (j - cj) ** 2 > R * R) continue; const k = j * MW + i; if (!this.seen[k]) { this.seen[k] = 1; this.dirty = true; } }
  },
  paint() {
    const g = this.c.getContext('2d'); g.clearRect(0, 0, this.c.width, this.c.height);
    if (CH.pvp) {   // 팀 대전 지도: 바닥 무늬, 벽 두께와 그림자, 진지 색
      const pal = { dungeon: ['#8a8498', '#7c768a', '#3a3446'], abyss: ['#7a6a98', '#6c5c8a', '#2c2240'], temple: ['#b49a6c', '#a68c60', '#4a3a28'], forest: ['#6f8a58', '#62804c', '#2a3a20'], frost: ['#a8bccc', '#98aec0', '#2a3a4a'], deep: ['#4a8a9a', '#3e7a8a', '#142a38'], harbor: ['#8a7a5a', '#7a6c50', '#1e3a52'], tower: ['#9a7a6a', '#8a6c5e', '#3a2a28'], desert: ['#c8aa72', '#b89a64', '#5a4426'], sewer: ['#5a7a62', '#4e6c56', '#1a2e2a'] }[CH.theme] || ['#8a8498', '#7c768a', '#3a3446'];
      g.fillStyle = '#1a1424'; g.fillRect(0, 0, this.c.width, this.c.height);
      // 바닥은 모두 한 색, 벽은 밝은 색으로 또렷하게
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (floorCell(i, j)) { g.fillStyle = '#5a5470'; g.fillRect(i * 3, j * 3, 3, 3); }
        else { let nb = false; for (let dj = -2; dj <= 2 && !nb; dj++) for (let di = -2; di <= 2; di++) if (floorCell(i + di, j + dj)) { nb = true; break; } if (nb) { g.fillStyle = '#efe4c4'; g.fillRect(i * 3, j * 3, 3, 3); } }
      }
      MAP.tspawn.forEach(([a, b], ti) => { g.fillStyle = ti ? 'rgba(255,90,74,.28)' : 'rgba(74,140,255,.28)'; g.beginPath(); g.arc(a * 3 + 1.5, b * 3 + 1.5, 24, 0, 7); g.fill(); });
      MAP.tflags.forEach(([a, b]) => { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.beginPath(); g.arc(a * 3 + 1.5, b * 3 + 1.5, 13, 0, 7); g.stroke(); });
      this.dirty = false; return;
    }
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) { if (!this.seen[j * MW + i] || !floorCell(i, j) || hiddenCell(i, j)) continue; g.fillStyle = WATERC(i, j) ? '#6a8ab0' : CUT[j * MW + i] === 3 ? '#c8c0d6' : CUT[j * MW + i] === 4 ? '#c8a060' : '#a49cb0'; g.fillRect(i * 3, j * 3, 3, 3); }
    this.dirty = false;
  },
  draw(sn) {
    if (this.dirty) this.paint();
    const sc = Math.min(innerWidth < 700 ? 1.4 : 2, (innerWidth < 700 ? 140 : 200) / Math.max(MW, MH)), w = MW * sc, h = MH * sc, x0 = innerWidth - w - 14, y0 = 64;
    oc.globalAlpha = 0.82; oc.fillStyle = 'rgba(10,8,14,.75)'; oc.fillRect(x0 - 4, y0 - 4, w + 8, h + 8); oc.drawImage(this.c, x0, y0, w, h); oc.globalAlpha = 1;
    const P = (wx, wz) => [x0 + wx / CS * sc, y0 + wz / CS * sc];
    MAP.fires.forEach(([fx, fy], k) => { if (!this.seen[fy * MW + fx | 0]) return; const [a, b] = P(cw(fx), cw(fy)); oc.fillStyle = sn.w.fi[k] ? '#ffb040' : '#6a5a4a'; oc.fillRect(a - 2.5, b - 2.5, 5, 5); });
    MAP.altars.forEach(([ax, ay], k) => { if (!this.seen[(ay | 0) * MW + (ax | 0)] || sn.w.al[k]) return; const [a, b] = P(cw(ax), cw(ay)); oc.fillStyle = '#ffe08a'; oc.beginPath(); oc.arc(a, b, 2.5, 0, 7); oc.fill(); });
    MAP.puzzles.forEach((q, k) => { const [gx, gy, gw, gh] = q.gate; if (!this.seen[gy * MW + gx] || (sn.w.pz && sn.w.pz[k] && sn.w.pz[k].d)) return; const [a, b] = P(gx * CS, gy * CS); oc.fillStyle = '#8a8494'; oc.fillRect(a, b, gw * CS * sc / CS, gh * CS * sc / CS); });
    if (sn.w.es && MAP.exit) { const [a, b] = P(cw(MAP.exit[0]), cw(MAP.exit[1])); oc.fillStyle = (performance.now() / 300 | 0) % 2 ? '#9af0a8' : '#4ac06a'; oc.beginPath(); oc.arc(a, b, 5, 0, 7); oc.fill(); }
    for (const p of sn.pl) { if (p.dd) continue; const q = p.id === S.me && S.local ? S.local : p, [a, b] = P(q.x, q.z); oc.fillStyle = pcol(p); oc.beginPath(); oc.arc(a, b, p.id === S.me ? 3.5 : 2.5, 0, 7); oc.fill(); if (p.id === S.me) { oc.strokeStyle = '#fff'; oc.lineWidth = 1.2; oc.stroke(); } }
  }
};
// 팀 화면: 위쪽 가운데에 깃발 일곱 개의 주인과 점령 진행, 오른쪽 위에 지도 (같은 편은 늘 보이고, 상대는 우리 편 가까이에 있을 때만 보여요)
// Tab을 누르고 있는 동안 팀별 처치 표
function scoreboard(sn) {
  const w = Math.min(460, innerWidth - 24), x0 = (innerWidth - w) / 2, rh = 22, y0 = 120, rows = [0, 1].map(t => sn.pl.filter(q => q.tm === t));
  const h = 30 + rows.reduce((a, r) => a + 26 + r.length * rh, 0) + 8;
  oc.fillStyle = 'rgba(10,8,14,.86)'; oc.fillRect(x0, y0, w, h); oc.strokeStyle = '#c8b480'; oc.lineWidth = 2; oc.strokeRect(x0, y0, w, h);
  oc.font = 'bold 13px Galmuri, system-ui'; let y = y0 + 22;
  rows.forEach((r, t) => {
    oc.textAlign = 'left'; oc.fillStyle = hex(TEAMS[t].c); oc.fillText(TEAMS[t].name, x0 + 12, y); oc.textAlign = 'right'; oc.fillStyle = '#b8b0a0'; oc.fillText(T('쓰러뜨림'), x0 + w - 70, y); oc.fillText(T('쓰러짐'), x0 + w - 12, y); y += 4;
    for (const q of r.slice().sort((a, b) => (b.kl | 0) - (a.kl | 0))) { y += rh; oc.textAlign = 'left'; oc.fillStyle = q.id === S.me ? '#ffe08a' : ROLES[q.role].color; oc.fillText(ROLES[q.role].name + ' · ' + (q.id === S.me ? T('나') : q.bot ? T('봇') : q.name), x0 + 12, y); oc.textAlign = 'right'; oc.fillStyle = '#e8e0cc'; oc.fillText(q.kl | 0, x0 + w - 70, y); oc.fillText(q.dth | 0, x0 + w - 12, y); }
    y += 26;
  });
}
function teamHud(sn) {
  const mt = myTm(), n = sn.tf.length, x0 = innerWidth / 2 - (n - 1) * 17, y = innerWidth < 700 ? 74 : 40, nw = innerWidth < 1000, LX = nw ? innerWidth / 2 - 10 : x0 - 24, RX = nw ? innerWidth / 2 + 10 : x0 + (n - 1) * 34 + 24, yK = nw ? 24 : 4, yM = nw ? 56 : 22, yL = nw ? 40 : 38, dy = nw ? 40 : 0;   // 좁은 화면에서는 글자를 깃발 줄 아래 가운데에 쌓아요(방 이름·미니맵과 안 겹치게)
  // 깃발 줄은 우리 팀 시작 지점에서 가까운 깃발부터 차례로 늘어놓아요
  const sp = MAP.tspawn[mt] || MAP.tspawn[0], fd = i => Math.hypot(MAP.tflags[i][0] - sp[0], MAP.tflags[i][1] - sp[1]), ord = sn.tf.map((f, i) => i).sort((a, b) => fd(a) - fd(b));
  ord.forEach((i, k) => {
    const f = sn.tf[i], x = x0 + k * 34, own = f[0], cap = f[1], pr = f[2];
    oc.fillStyle = 'rgba(10,8,14,.78)'; oc.beginPath(); oc.arc(x, y, 14, 0, 7); oc.fill();
    oc.fillStyle = own < 0 ? '#6a6676' : hex(TEAMS[own].c); oc.beginPath(); oc.arc(x, y, 9, 0, 7); oc.fill();
    if (cap >= 0 && pr > 0) { oc.strokeStyle = hex(TEAMS[cap].c); oc.lineWidth = 4; oc.beginPath(); oc.arc(x, y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr / FLAG_T); oc.stroke(); }
    if (own === mt && cap >= 0 && cap !== mt && pr > 0) { const pu = 0.5 + 0.5 * Math.sin(performance.now() / 110); oc.strokeStyle = 'rgba(255,70,60,' + (0.45 + pu * 0.55) + ')'; oc.lineWidth = 3; oc.beginPath(); oc.arc(x, y, 18 + pu * 3, 0, 7); oc.stroke(); }
  });
  // 괴물 보너스: 우리 팀 점령이 빨라지는 동안 남은 시간을 깃발 아래에 보여 줘요
  if (sn.dr) { oc.font = 'bold 13px sans-serif'; oc.textAlign = 'center'; oc.fillStyle = sn.dr[0] ? '#7affb0' : '#ffb08a'; oc.fillText(sn.dr[0] ? T('신전 문 열림 ') + Math.ceil(sn.dr[1]) + T('초') : T('신전 문 닫힘 · ') + Math.ceil(sn.dr[1]) + T('초 뒤 열려요'), innerWidth / 2, y + 48 + dy); }
  if (sn.mc && sn.mc[mt] > 0) { oc.font = 'bold 13px sans-serif'; oc.textAlign = 'center'; oc.fillStyle = '#ffd36a'; oc.fillText(T('점령 1.5배 ') + sn.mc[mt] + T('초'), innerWidth / 2, y + 30 + dy); }
  // 괴물 처치 효과 레벨 (팀마다)
  { oc.font = 'bold 12px Galmuri, system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const mk = sn.mk || [0, 0];
    oc.textAlign = 'right'; oc.fillStyle = hex(TEAMS[0].c); const l0 = T('괴물 처치 효과 lvl.{0}', mk[0]); oc.strokeText(l0, LX, y + yL); oc.fillText(l0, LX, y + yL);
    oc.textAlign = 'left'; oc.fillStyle = hex(TEAMS[1].c); const l1 = T('괴물 처치 효과 lvl.{0}', mk[1]); oc.strokeText(l1, RX, y + yL); oc.fillText(l1, RX, y + yL); }
  // 팀별 처치 수 (깃발 줄 양옆) 와 내 처치 수
  { const kt = [0, 0]; for (const q of sn.pl) kt[q.tm] += q.kl | 0; const me1 = sn.pl.find(q => q.id === S.me);
    oc.font = 'bold 13px Galmuri, system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18';
    oc.textAlign = 'right'; oc.fillStyle = hex(TEAMS[0].c); const t0 = T('처치 {0}', kt[0]); oc.strokeText(t0, LX, y + yK); oc.fillText(t0, LX, y + yK);
    oc.textAlign = 'left'; oc.fillStyle = hex(TEAMS[1].c); const t1 = T('처치 {0}', kt[1]); oc.strokeText(t1, RX, y + yK); oc.fillText(t1, RX, y + yK);
    if (me1 && (me1.kl | 0) > 0) { oc.textAlign = 'right'; oc.fillStyle = '#ffe08a'; const t2 = T('내 처치 {0}', me1.kl | 0); oc.strokeText(t2, LX, y + yM); oc.fillText(t2, LX, y + yM); } }
  { const mb = sn.pl.find(q => q.id === S.me); if (mb && mb.cb > 0) { oc.font = 'bold 13px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const tx = T('점령 효과 · 이동 속도·공격 +20% · {0}초', Math.ceil(mb.cb)); oc.strokeText(tx, innerWidth / 2, y + 64 + dy); oc.fillStyle = '#ffd36a'; oc.fillText(tx, innerWidth / 2, y + 64 + dy); } }
  if (keyDown('tab')) scoreboard(sn);
  // 점령 경보: 우리 깃발을 상대가 점령하는 중이면 깃발이 깜빡이고 알림이 떠요
  { S.fAl = S.fAl || []; let any = false; sn.tf.forEach((f, i) => { const on = f[0] === mt && f[1] >= 0 && f[1] !== mt && f[2] > 0; if (on && !S.fAl[i]) SFX.play('warn'); S.fAl[i] = on; if (on) any = true; });
    if (any) { oc.font = 'bold 15px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const tx = T('우리 깃발을 점령당하고 있어요!'); oc.strokeText(tx, innerWidth / 2, y + 48 + dy); oc.fillStyle = Math.sin(performance.now() / 140) > 0 ? '#ff6a5a' : '#ffd0c8'; oc.fillText(tx, innerWidth / 2, y + 48 + dy); } }
  { const own = [0, 0]; for (const f of sn.tf) if (f[0] >= 0) own[f[0]]++; const pt = own[0] >= PUSH_N ? 0 : own[1] >= PUSH_N ? 1 : -1;
    if (pt >= 0) { oc.font = 'bold 13px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const tx = pt === mt ? T('몰아붙이는 중 · 상대 부활 +{0}초', PUSH_T) : T('몰리는 중 · 우리 부활 +{0}초', PUSH_T); oc.strokeText(tx, innerWidth / 2, y + 44 + dy); oc.fillStyle = pt === mt ? '#ffd36b' : '#ff8a7a'; oc.fillText(tx, innerWidth / 2, y + 44 + dy); } }
  const me0 = sn.pl.find(q => q.id === S.me); if (me0 && me0.fz && !me0.dd) { oc.font = 'bold 14px Galmuri, system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const tx = T('깃발의 가호 · 치유 · 공격 +20%'); oc.strokeText(tx, innerWidth / 2, y + 26 + dy); oc.fillStyle = '#9af0a8'; oc.fillText(tx, innerWidth / 2, y + 26 + dy); }
  const sc = Math.min(innerWidth < 700 ? 1.1 : 1.6, (innerWidth < 700 ? 130 : 190) / MW), w = MW * sc, h = MH * sc, mx = innerWidth - w - 14, my = innerWidth < 700 ? 100 : 64;
  if (mini.dirty) mini.paint(); if (!CH.pvp && !S.mapImg && !S.mapTry) { S.mapTry = 1; try { S.mapImg = view.captureMap(); } catch (e) { } }
  oc.fillStyle = 'rgba(10,8,14,.85)'; oc.fillRect(mx - 4, my - 4, w + 8, h + 8); oc.imageSmoothingEnabled = !!S.mapImg || !!CH.pvp; oc.globalAlpha = CH.pvp ? 1 : S.mapImg ? 0.95 : 0.8; oc.drawImage(S.mapImg || mini.c, mx, my, w, h); oc.globalAlpha = 1; oc.strokeStyle = '#c8b480'; oc.lineWidth = 2; oc.strokeRect(mx - 4, my - 4, w + 8, h + 8);
  const P = (wx, wz) => [mx + wx / CS * sc, my + wz / CS * sc], mate = sn.pl.filter(q => q.tm === mt && !q.dd);
  sn.tf.forEach((f, i) => { const fl = MAP.tflags[i], [a, b] = P(cw(fl[0]), cw(fl[1])); oc.fillStyle = f[0] < 0 ? '#9a96a6' : hex(TEAMS[f[0]].c); oc.fillRect(a - 3.5, b - 3.5, 7, 7); oc.strokeStyle = '#140f18'; oc.lineWidth = 1.5; oc.strokeRect(a - 3.5, b - 3.5, 7, 7); if (S.fAl && S.fAl[i]) { const pu = 0.5 + 0.5 * Math.sin(performance.now() / 110); oc.strokeStyle = 'rgba(255,70,60,' + (0.5 + pu * 0.5) + ')'; oc.lineWidth = 2; oc.beginPath(); oc.arc(a, b, 7 + pu * 4, 0, 7); oc.stroke(); } });
  for (const mn of sn.mn || []) { const [a, b] = P(mn[0], mn[1]), pu = 0.5 + 0.5 * Math.sin(performance.now() / 260); oc.fillStyle = '#ff7a3a'; oc.strokeStyle = '#140f18'; oc.lineWidth = 1.5; oc.beginPath(); oc.moveTo(a, b - 6); oc.lineTo(a + 5, b); oc.lineTo(a, b + 6); oc.lineTo(a - 5, b); oc.closePath(); oc.fill(); oc.stroke(); oc.strokeStyle = 'rgba(255,122,58,' + (0.3 + pu * 0.5) + ')'; oc.beginPath(); oc.arc(a, b, 8 + pu * 2, 0, 7); oc.stroke(); }
  for (const p of sn.pl) {
    if (p.dd) continue; const q = p.id === S.me && S.local ? S.local : p;
    if (p.tm !== mt && !mate.some(m => Math.hypot(m.x - q.x, m.z - q.z) < 36)) continue;
    const [a, b] = P(q.x, q.z); oc.fillStyle = hex(TEAMS[p.tm].c); oc.beginPath(); oc.arc(a, b, p.id === S.me ? 3.6 : 2.4, 0, 7); oc.fill();
    if (p.id === S.me) { oc.strokeStyle = '#fff'; oc.lineWidth = 1.5; oc.stroke(); }
  }
}
// 귀환(F): 살아 있을 때 큰 지도를 펴요 (쿨타임 25초)
function recallToggle() {
  const sn = S.snap, me = sn && sn.pl && sn.pl.find(q => q.id === S.me);
  if (S.rcOpen) { S.rcOpen = false; return; }
  if (!inGame() || S.scr !== '' || !sn || !sn.tf || sn.rg || sn.ph !== 'play' || !me || me.dn || me.dd || me.rct > 0 || me.rcc > 0) return;
  S.rcOpen = true;
}
// 귀환·부활 큰 지도의 자리: 위쪽 깃발 줄·방 이름 아래(96px)부터 화면 안에 들어오게 크기를 정해요
function bigMapRect() {
  const top = 96, avail = Math.max(120, innerHeight - top - 26), pw = Math.min(innerWidth * 0.78, avail * MW / MH), ph = pw * MH / MW;
  return { pw, ph, x0: (innerWidth - pw) / 2, y0: top + (avail - ph) / 2 };
}
function recallPanel(sn) {
  const me = sn.pl.find(q => q.id === S.me), live = me && !me.dn && !me.dd && sn.ph === 'play';
  S.rcHit = [];
  if (!live) { S.rcOpen = false; return; }
  oc.font = 'bold 15px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18';
  const st = me.rct > 0 ? T('귀환 중 {0}', Math.ceil(me.rct)) : me.rcc > 0 ? T('귀환 {0}', Math.ceil(me.rcc)) : '', yy = innerHeight - 118;
  if (st && !S.rcOpen) { oc.strokeText(st, innerWidth / 2, yy); oc.fillStyle = me.rct > 0 ? '#9af0e0' : '#c8c0d0'; oc.fillText(st, innerWidth / 2, yy); }
  if (!S.rcOpen) return;
  const mt = me.tm, { pw, ph, x0, y0 } = bigMapRect(), sc = pw / (MW * CS), P = (wx, wz) => [x0 + wx * sc, y0 + wz * sc];
  if (mini.dirty) mini.paint();
  oc.fillStyle = 'rgba(8,6,12,.93)'; oc.fillRect(x0 - 10, y0 - 40, pw + 20, ph + 56);
  oc.imageSmoothingEnabled = !!S.mapImg; oc.drawImage(S.mapImg || mini.c, x0, y0, pw, ph); oc.strokeStyle = '#c8b480'; oc.lineWidth = 3; oc.strokeRect(x0 - 2, y0 - 2, pw + 4, ph + 4);
  const tx = T('귀환할 우리 팀 깃발을 눌러요 · 다른 곳을 누르면 취소돼요'); oc.strokeText(tx, innerWidth / 2, y0 - 18); oc.fillStyle = '#9af0e0'; oc.fillText(tx, innerWidth / 2, y0 - 18);
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260), tc = hex(TEAMS[mt].c);
  sn.tf.forEach((f, i) => {
    const fl = MAP.tflags[i], [a, b] = P(cw(fl[0]), cw(fl[1])), mine = f[0] === mt;
    if (mine) { S.rcHit.push({ x: a, y: b, r: 15, v: i + 1 }); oc.fillStyle = 'rgba(' + (mt ? '255,90,74' : '74,140,255') + ',' + (0.18 + pulse * 0.25) + ')'; oc.beginPath(); oc.arc(a, b, 22 + pulse * 4, 0, 7); oc.fill(); }
    oc.fillStyle = mine ? tc : f[0] < 0 ? '#5a5666' : hex(TEAMS[f[0]].c); oc.globalAlpha = mine ? 1 : 0.4; oc.beginPath(); oc.arc(a, b, 11, 0, 7); oc.fill(); oc.globalAlpha = 1;
    oc.strokeStyle = '#140f18'; oc.lineWidth = 2; oc.beginPath(); oc.arc(a, b, 11, 0, 7); oc.stroke();
  });
  for (const p of sn.pl) if (!p.dd && p.tm === mt) { const [a, b] = P(p.x, p.z); oc.fillStyle = p.id === S.me ? '#ffe08a' : '#fff'; oc.beginPath(); oc.arc(a, b, p.id === S.me ? 4 : 3, 0, 7); oc.fill(); }
}
// 쓰러지면 큰 지도가 떠요: 우리 팀이 차지한 깃발과 진지가 밝게 보이고, 누르면 15초가 지난 뒤 거기서 다시 일어나요
function respawnPanel(sn) {
  const me = sn.pl.find(q => q.id === S.me); if (!me || !me.dd || sn.ph !== 'play') { if (me && !me.dd) { S.rspSel = 0; S.rspDone = false; } return; }
  if (S.rspDone) {   // 자리를 정하면 창이 닫히고 작은 안내만 남아요
    oc.font = 'bold 15px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const t2 = T('{0}초 뒤 되살아나요 · 다시 고르려면 여기를 눌러요', Math.max(0, Math.ceil(me.rs))), yy = innerHeight - 90;
    oc.strokeText(t2, innerWidth / 2, yy); oc.fillStyle = '#ffe08a'; oc.fillText(t2, innerWidth / 2, yy); S.rspHit.push({ x: innerWidth / 2, y: yy, r: Math.min(190, innerWidth / 2 - 10), v: -9 }); return;
  }
  const mt = me.tm, { pw, ph, x0, y0 } = bigMapRect(), sc = pw / (MW * CS), P = (wx, wz) => [x0 + wx * sc, y0 + wz * sc];
  if (mini.dirty) mini.paint();
  oc.fillStyle = 'rgba(8,6,12,.93)'; oc.fillRect(x0 - 10, y0 - 40, pw + 20, ph + 56);
  if (!S.mapImg && !S.mapTry) { S.mapTry = 1; try { S.mapImg = view.captureMap(); } catch (e) { } }
  oc.imageSmoothingEnabled = !!S.mapImg; oc.drawImage(S.mapImg || mini.c, x0, y0, pw, ph); oc.strokeStyle = '#c8b480'; oc.lineWidth = 3; oc.strokeRect(x0 - 2, y0 - 2, pw + 4, ph + 4);
  oc.font = 'bold 16px Galmuri, system-ui'; oc.textAlign = 'center'; oc.lineWidth = 4; oc.strokeStyle = '#140f18';
  const tx = T('{0}초 뒤 되살아나요 · 다시 일어날 곳을 눌러요', Math.max(0, Math.ceil(me.rs))); oc.strokeText(tx, innerWidth / 2, y0 - 18); oc.fillStyle = '#ffe08a'; oc.fillText(tx, innerWidth / 2, y0 - 18);
  S.rspOpen = true;   // 이 지도가 떠 있는 동안은 화면을 눌러도 관전 대상이 바뀌지 않아요
  oc.font = 'bold 13px Galmuri, system-ui'; oc.fillStyle = '#c8c0d0'; oc.strokeText(T('우리 팀 깃발과 진지에서만 일어날 수 있어요'), innerWidth / 2, y0 + ph + 22); oc.fillText(T('우리 팀 깃발과 진지에서만 일어날 수 있어요'), innerWidth / 2, y0 + ph + 22);
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260), tc = hex(TEAMS[mt].c), pick = S.rspSel | 0;
  const sp = MAP.tspawn[mt], [sx, sy] = P(cw(sp[0]), cw(sp[1]));
  S.rspHit.push({ x: sx, y: sy, r: 16, v: -1 });
  oc.fillStyle = tc; oc.globalAlpha = pick <= 0 ? 1 : 0.55; oc.fillRect(sx - 9, sy - 9, 18, 18); oc.globalAlpha = 1; oc.strokeStyle = pick <= 0 ? '#fff' : '#140f18'; oc.lineWidth = 2.5; oc.strokeRect(sx - 9, sy - 9, 18, 18);
  oc.fillStyle = '#fff'; oc.font = 'bold 12px Galmuri, system-ui'; oc.fillText(T('진지'), sx, sy + 24);
  sn.tf.forEach((f, i) => {
    const fl = MAP.tflags[i], [a, b] = P(cw(fl[0]), cw(fl[1])), mine = f[0] === mt;
    if (mine) { S.rspHit.push({ x: a, y: b, r: 15, v: i + 1 }); oc.fillStyle = 'rgba(' + (mt ? '255,90,74' : '74,140,255') + ',' + (0.18 + pulse * 0.25) + ')'; oc.beginPath(); oc.arc(a, b, 22 + pulse * 4, 0, 7); oc.fill(); }
    oc.fillStyle = mine ? tc : f[0] < 0 ? '#5a5666' : hex(TEAMS[f[0]].c); oc.globalAlpha = mine ? 1 : 0.4; oc.beginPath(); oc.arc(a, b, 11, 0, 7); oc.fill(); oc.globalAlpha = 1;
    oc.strokeStyle = pick === i + 1 ? '#fff' : '#140f18'; oc.lineWidth = pick === i + 1 ? 4 : 2; oc.beginPath(); oc.arc(a, b, 11, 0, 7); oc.stroke();
  });
  for (const p of sn.pl) if (!p.dd && p.tm === mt) { const [a, b] = P(p.x, p.z); oc.fillStyle = '#fff'; oc.beginPath(); oc.arc(a, b, 3, 0, 7); oc.fill(); }
}
// 머리 위 체력 막대: 나는 초록, 같은 편은 파랑, 상대는 빨강 (보호막은 하늘색으로 덧입혀요)
// 룬 표식: 궁정 마법사에게 표식이 남은 사람 머리 옆에 보랏빛 마름모와 남은 초가 떠요
function runeMark(x, y, sec) {
  if (!(sec > 0)) return; oc.save(); oc.textAlign = 'center'; oc.font = 'bold 13px Galmuri, system-ui'; oc.lineWidth = 3; oc.strokeStyle = '#140f18';
  const pu = 0.6 + 0.4 * Math.sin(performance.now() / 160); oc.fillStyle = 'rgba(190,130,255,' + pu + ')'; oc.beginPath(); oc.moveTo(x, y - 8); oc.lineTo(x + 7, y); oc.lineTo(x, y + 8); oc.lineTo(x - 7, y); oc.closePath(); oc.fill();
  const tx = Math.ceil(sec) + T('초'); oc.strokeText(tx, x, y + 22); oc.fillStyle = '#e0c8ff'; oc.fillText(tx, x, y + 22); oc.restore();
}
function hpBar(x, y, p, me, ally) {
  const w = me ? 60 : 52, f = Math.max(0, Math.min(1, p.hp / p.mx));
  oc.fillStyle = 'rgba(20,10,14,.9)'; oc.fillRect(x - w / 2 - 2, y - 2, w + 4, 9);
  oc.fillStyle = me ? '#4cd070' : ally ? '#4a9cff' : '#e0403a'; oc.fillRect(x - w / 2, y, w * f, 5);
  if (p.sh > 0) { oc.fillStyle = 'rgba(154,240,224,.85)'; oc.fillRect(x - w / 2, y, Math.min(w, w * p.sh / p.mx), 2); }
}
function drawOverlay(dt) {
  oc.clearRect(0, 0, innerWidth, innerHeight);
  const sn = S.snap; if (!sn || S.scr === 'sIntro') return;
  S.rspHit = []; S.rspOpen = false;
  if (sn.tf && !sn.rg && S.scr === '' && sn.ph !== 'won') { teamHud(sn); respawnPanel(sn); recallPanel(sn); }
  oc.textAlign = 'center'; oc.textBaseline = 'middle';
  // 적 체력
  for (const e of sn.en) {
    if (e.k === 'boss' || e.hp <= 0 || e.st === 'rise') continue;
    const E = view.ents.get('e' + e.id); if (!E) continue;
    const h = e.k === 'elite' ? 4.6 : 3.4, s = view.project(E.x, h, E.z), w = e.k === 'elite' ? 54 : 38;
    const mn = e.tm >= 0, mine2 = mn && e.tm === myTm();
    if (e.hp < e.mx) { oc.fillStyle = 'rgba(20,10,14,.85)'; oc.fillRect(s.x - w / 2 - 1, s.y - 1, w + 2, 6); oc.fillStyle = mn ? (mine2 ? '#6ad070' : '#d0443a') : '#d0443a'; oc.fillRect(s.x - w / 2, s.y, w * e.hp / e.mx, 4); }
    if (e.mk) { oc.fillStyle = '#ff5a4a'; oc.font = 'bold 16px Galmuri, system-ui'; oc.fillText('▼', s.x, s.y - 12); }
    runeMark(s.x + (w / 2 + 14), s.y + 2, e.rn);
    if (e.sl && !e.sn && !e.mk) { oc.fillStyle = '#7ac8ff'; oc.font = 'bold 12px Galmuri, system-ui'; oc.strokeStyle = '#140f18'; oc.lineWidth = 3; const ly = s.y - (e.k === 'elite' ? 28 : 11); oc.strokeText(T('둔화'), s.x, ly); oc.fillText(T('둔화'), s.x, ly); }
    if (e.sn) { oc.fillStyle = '#ffe08a'; oc.font = 'bold 14px Galmuri, system-ui'; oc.fillText('★ ★', s.x, s.y - 12); }
    if (e.k === 'elite') { oc.fillStyle = '#efe3c8'; oc.font = 'bold 13px Galmuri, system-ui'; oc.strokeStyle = '#140f18'; oc.lineWidth = 4; const nm = e.mb ? '★ ' + MIDB[chapterIndex()][e.mb - 1] : (FOES[chapterIndex()] ? FOES[chapterIndex()].elite.name : T('괴물')); oc.strokeText(nm, s.x, s.y - 12); oc.fillText(nm, s.x, s.y - 12); }
  }
  // 동료 이름, 쓰러짐
  const tags = [];
  for (const p of sn.pl) {
    if (p.dd) continue; const E = view.ents.get('p' + p.id); if (!E) continue;
    if (p.stl && p.id !== S.me && p.tm !== myTm() && S.snap && !sn.pl.some(q => q.id === S.me && Math.hypot(q.x - p.x, q.z - p.z) <= 2.8)) continue;   // 숨은 자객은 이름표도 숨겨요
    const s = view.project(E.x, 3.9, E.z);
    // 이름표가 겹치면 위로 비켜 올려요
    if (p.id !== S.me) { for (let k = 0; k < 4 && tags.some(t => Math.abs(t.x - s.x) < 64 && Math.abs(t.y - s.y) < 30); k++) s.y -= 30; tags.push({ x: s.x, y: s.y }); oc.font = 'bold 13px Galmuri, system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; const t = p.bot ? T('{0} 봇', ROLES[p.role].name) : p.name; oc.strokeText(t, s.x, s.y - 10); oc.fillStyle = pcol(p); oc.fillText(t, s.x, s.y - 10); { const ty = ROLES[p.role].type; if (ty) { oc.font = 'bold 11px Galmuri, system-ui'; oc.lineWidth = 3; oc.strokeText(ty, s.x, s.y - 24); oc.fillStyle = '#e8e0cc'; oc.fillText(ty, s.x, s.y - 24); } } hpBar(s.x, s.y, p, false, p.tm === myTm()); runeMark(s.x + 58, s.y, p.rn); }
    else hpBar(s.x, s.y, p, true);
    if (p.dn) {
      const c = view.project(E.x, 1.5, E.z); oc.lineWidth = 5; oc.strokeStyle = 'rgba(20,10,14,.85)'; oc.beginPath(); oc.arc(c.x, c.y - 30, 16, 0, 7); oc.stroke();
      oc.strokeStyle = '#fff0b0'; oc.beginPath(); oc.arc(c.x, c.y - 30, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.rv / 1.6)); oc.stroke();
      oc.fillStyle = '#ff9c94'; oc.font = 'bold 13px Galmuri, system-ui'; oc.fillText(Math.ceil(p.bl), c.x, c.y - 30);
    }
  }
  // 내 연타 수와 집중 상태
  { const p = sn.pl.find(q => q.id === S.me), E = p && view.ents.get('p' + p.id);
    if (E && !p.dn) { const c = view.project(E.x, 4.1, E.z); oc.lineWidth = 4; oc.strokeStyle = '#140f18';
      if (p.fc) { oc.font = 'bold 13px Galmuri, system-ui'; oc.strokeText(T('집중 · 피해 +50%'), c.x, c.y - 18); oc.fillStyle = '#9ad0ff'; oc.fillText(T('집중 · 피해 +50%'), c.x, c.y - 18); } } }
  // 무너지는 성: 남은 시간과 출구 방향 화살표
  if (sn.w.es && MAP.exit) {
    const left = Math.max(0, Math.ceil(sn.w.es[0])), urg = left <= 10; oc.font = 'bold ' + (urg ? 34 : 28) + 'px Galmuri, system-ui'; oc.lineWidth = 6; oc.strokeStyle = '#140f18';
    const tx = T('출구까지 {0}초', left); oc.strokeText(tx, innerWidth / 2, 96); oc.fillStyle = urg && (performance.now() / 250 | 0) % 2 ? '#ff5a4a' : '#ffd36b'; oc.fillText(tx, innerWidth / 2, 96);
    const p = sn.pl.find(q => q.id === S.me), E = p && view.ents.get('p' + p.id);
    if (E) { const ex = cw(MAP.exit[0]), ez = cw(MAP.exit[1]), d = Math.hypot(ex - E.x, ez - E.z); if (d > 6) { const c = view.project(E.x, 1, E.z), f = view.project(E.x + (ex - E.x) / d * 4, 1, E.z + (ez - E.z) / d * 4), a = Math.atan2(f.y - c.y, f.x - c.x), r = 62;
      oc.save(); oc.translate(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r); oc.rotate(a); oc.fillStyle = '#9af0a8'; oc.strokeStyle = '#140f18'; oc.lineWidth = 3; oc.beginPath(); oc.moveTo(14, 0); oc.lineTo(-8, -10); oc.lineTo(-3, 0); oc.lineTo(-8, 10); oc.closePath(); oc.stroke(); oc.fill(); oc.restore(); } }
  }
  // 피해 숫자
  for (const n of S.nums) { n.t += dt; const s = view.project(n.x, n.y + n.t * 2.2, n.z); oc.globalAlpha = Math.max(0, 1 - n.t / 0.9); oc.font = 'bold ' + Math.round(18 * n.sc) + 'px Galmuri, system-ui'; oc.lineWidth = 4; oc.strokeStyle = '#140f18'; oc.strokeText(n.v, s.x, s.y); oc.fillStyle = n.col; oc.fillText(n.v, s.x, s.y); }
  oc.globalAlpha = 1; S.nums = S.nums.filter(n => n.t < 0.9);
}
// 장을 깼을 때: 명예와 이야기 진행을 저장해요 (한 장에 한 번)
function clearChapter() {
  if (S.cleared) return S.lastH || 0; S.cleared = true;
  const h = S.lastH = awardHonor() || 0, me = myP(), ci = chapterIndex();
  if (CH.deep) { deepRecord(DEEP.floor + 1); return h; }
  if (S.snap && S.snap.wk) return h;
  if (me) { SAVE.clears[me.role] = Math.max(SAVE.clears[me.role] || 0, ci + 1); if (!S.everDown) unlock('nodown'); if (ROLE_IDS.every(r => SAVE.clears[r])) unlock('all4'); }
  if (ci === 0) unlock('boss'); else unlock('ch' + (ci + 1));
  if (S.flagGot) { SAVE.flags[ci] = 1; unlock('flag1'); if (CHAPTERS.every((c, i) => SAVE.flags[i])) unlock('flags'); toast(T('기사단 깃발을 로비 벽에 걸었어요.'), 3600); }
  SAVE.chMax = Math.max(SAVE.chMax | 0, ci + 1); save();
  return h;
}
// 결말이 끝나면 같은 동료와 다음 장 이야기로 바로 넘어가요
function deepRecord(f) { SAVE.deepBest = Math.max(SAVE.deepBest | 0, f); save(); if (f >= 5) unlock('deep5'); if (f >= 10) unlock('deep10'); }
function afterOutro() { showResult(); }
function showDeepResult() {
  S.resultShown = true; const h = awardHonor() || 0, f = S.snap.dp ? S.snap.dp.floor : DEEP.floor; deepRecord(f);
  const cs = (S.snap.dp ? S.snap.dp.curses : DEEP.curses).map(c => CURSES.find(x => x.id === c).name);
  $('result').innerHTML = `<div class="big">${T('끝없는 심연 {0}층', f)}</div><p class="note">${T('{0}층에서 모두 쓰러졌어요. {1}층까지 지나왔어요.', f, f - 1)}</p><p class="note">${T('쌓인 저주: {0}', cs.length ? cs.join(', ') : T('없음'))}</p><p>${T('받은 tC {0}', '<b style="color:#ffd36b">' + h + '</b>')} · ${T('최고 기록 {0}층', '<b style="color:#ffd36b">' + SAVE.deepBest)}</b></p><div class="row"><button class="btn gold" id="resBack">${T('로비로')}</button></div>`;
  $('resBack').onclick = () => endToLobby('');
  setHud(false); show('sResult');
}
// 우승 화면: 이긴 사람이 크게 나와요. '순위 보기'를 누르면 전체 순위표로 가요
function showWin() {
  S.resultShown = true; bigMsg('', '', 0); const h = S.lastH = awardHonor() || 0, sn = S.snap, mine = myP(), wt = sn.wtm, won = mine && mine.tm === wt;
  if (won) { unlock('win'); SAVE.wins = SAVE.wins || {}; SAVE.wins[mine.role] = 1; save(); if (ROLE_IDS.slice(0, 7).every(r => SAVE.wins[r])) unlock('winall'); }
  if (mine && mine.kl >= 3) unlock('kill3');
  const mem = sn.pl.filter(p => p.tm === wt);
  $('winBox').innerHTML = `<div class="wk">${TEAMS[wt].name}</div><div class="wt" style="color:${won ? '#ffd36b' : '#ff6a5a'}">${won ? T('승리!') : T('패배')}</div><div class="ws">${T('깃발 일곱 개를 모두 차지했어요')}</div><div class="wn">${mem.map(p => `<img alt="" width="48" src="${view.portrait(p.role)}">`).join('')}</div>`;
  $('winBox').classList.toggle('me', !!won);
  $('winNext').onclick = () => { SFX.play('click'); showResult(); };
  $('winBack').onclick = () => { SFX.play('click'); endToLobby(''); };
  setHud(false); show('sWin');
  if (mine) { const E = view.ents.get('p' + sn.win); if (E) view.burst(E.x, 1.5, E.z, 0xffd36b, 30, 8, 0.8, 0.14); }
}
function showResult() {
  S.resultShown = true; bigMsg('', '', 0); const h = awardHonor() || S.lastH || 0, sn = S.snap, wt = sn.wtm, mine0 = myP();
  const row = p => `<tr${p.id === S.me ? ' style="background:#2a2014"' : ''}><td style="color:${ROLES[p.role].color}">${ROLES[p.role].name}</td><td>${esc(p.id === S.me ? T('나') : p.bot ? T('봇') : p.name)}</td><td>${p.kl}</td><td>${p.dth}</td></tr>`;
  const tab = t => `<h3 style="color:${hex(TEAMS[t].c)}">${TEAMS[t].name}${t === wt ? ' · ' + T('승리') : ''}</h3><table><tr><th>${T('직업')}</th><th>${T('이름')}</th><th>${T('쓰러뜨림')}</th><th>${T('쓰러짐')}</th></tr>${sn.pl.filter(p => p.tm === t).map(row).join('')}</table>`;
  const top3 = sn.pl.slice().sort((a, b) => (b.kl | 0) - (a.kl | 0)).slice(0, 3), pod = [[1, 'd8d8e0', 58], [0, 'ffd36b', 78], [2, 'c8884a', 44]].filter(([i]) => top3[i]).map(([i, c, hh]) => { const q = top3[i]; return `<div style="flex:1;text-align:center"><div style="font-size:12px;color:${ROLES[q.role].color}">${ROLES[q.role].name}</div><div style="font-size:12px;margin:2px 0 4px">${esc(q.id === S.me ? T('나') : q.bot ? T('봇') : q.name)}</div><div style="height:${hh}px;background:#${c};color:#201810;font-weight:700;line-height:${hh}px;border-radius:4px 4px 0 0">${i + 1} · ${q.kl | 0}</div></div>`; }).join('');
  $('result').innerHTML = `<div class="big">${mine0 && mine0.tm === wt ? T('승리') : T('패배')}</div><div style="display:flex;align-items:flex-end;gap:8px;margin:8px 0 14px">${pod}</div>${tab(0)}${tab(1)}<p>${T('받은 tC {0}', '<b style="color:#ffd36b">' + h + '</b>')} · ${T('지금 tC {0}', SAVE.honor)}</p><div class="row"><button class="btn gold" id="resBack">${T('로비로')}</button></div>`;
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
  MUS.tick(window.__introSongDone ? want : null, dt, now);   // 인트로 곡이 끝날 때까지 다른 곡은 기다려요 (그 뒤엔 인트로 도중이라도 로비 곡)
}
addEventListener('pointerdown', () => MUS.kick()); addEventListener('keydown', () => MUS.kick());
let lastT = performance.now();
let lastF = 0;
function frame(now) {
  requestAnimationFrame(frame);
  // 최적화를 켜면 1초에 30번만 그려요 (휴대폰 발열·배터리)
  if (FPS_CAP && now - lastF < 1000 / FPS_CAP - 2) return; lastF = now;
  const raw = now - lastT; lastT = now; const dt = Math.min(0.05, raw / 1000);
  if (now - (S.ambN || 0) > 1000) { S.ambN = now; SFX.ambient(inGame() && S.scr === '' && S.snap && S.snap.ph === 'play' ? CH.theme : ''); }
  // 방장 컴퓨터가 느리면(화면 간격이 길게 이어지면) 스스로 가벼운 모드로 바꿔요: 전송 줄이기, 봇 판단 줄이기, 가벼운 화질 (규칙은 그대로)
  if (S.G && S.net === 'host' && S.scr === '' && !S.lite) { S.fAvg = (S.fAvg || 16) * 0.95 + Math.min(raw, 100) * 0.05; if (S.fAvg > 38) { S.slowN = (S.slowN | 0) + 1; if (S.slowN > 180) { S.lite = true; S.G.lite = true; try { view.setLow(true); } catch (e) { } toast('컴퓨터가 느려서 가벼운 모드로 바꿨어요. 친구 화면은 그대로예요.', 3600); } } else S.slowN = 0; }
 const t = (now - S.t0) / 1000;
  musicTick(dt, now); talkTick(dt, !!S.snap && S.scr === '' && (S.snap.ph === 'play' || S.snap.ph === 'bossIntro'));
  if (S.snap && (S.G || S.net === 'guest') && S.scr !== 'sLobby' && S.scr !== 'sRoom') {
    const me = myP();
    const inp = me ? gatherInput(me) : {};
    if (S.G) {
      // 방장·혼자: 규칙을 직접 돌려요
      // 한 번 누르는 입력은 규칙이 실제로 돌 때까지 모아 둬요 (화면이 규칙보다 자주 그려져도 눌림이 사라지지 않게)
      const pr = S.rin[S.me]; if (pr) for (const k of ['q', 'e', 'r', 'roll', 'skip', 'atkR', 'rcl']) inp[k] = inp[k] || pr[k];
      S.rin[S.me] = inp;
      if (S.slowT > 0) S.slowT -= dt;
      S.acc += dt * (S.slowT > 0 ? 0.35 : 1); const h = 1 / 30;
      while (S.acc >= h) {
        S.acc -= h; S.prevPos = posMap(S.G); step(S.G, h, S.rin); S.stepped = true;
        for (const pid in S.rin) { const r = S.rin[pid]; r.q = r.e = r.r = r.roll = r.skip = r.atkR = r.rcl = 0; }
        for (const e of S.G.ev) { S.evq.push(e); if (S.net === 'host') (S.netEv || (S.netEv = [])).push(e); }
        S.G.ev.length = 0;
      }
      // 규칙이 새로 돌았을 때만 상태를 새로 만들고, 아니면 이어 그리기만 해요
      if (S.stepped || !S.snap) { S.snap = snapshot(S.G); S.stepped = false; } smoothSnap(S.snap, S.G, S.prevPos, S.acc / h);
      if (S.net === 'host') { S.sendAcc += dt; if (S.sendAcc >= 1 / (S.lite ? 12 : SNAP_HZ)) { S.sendAcc = 0; bcast({ t: 's', S: S.snap, ev: S.netEv || [] }); S.netEv = []; } }
    } else if (me) {
      // 게스트: 내 이동은 바로, 나머지는 방장에게 보내요
      if (!S.local || S.local.ri !== S.snap.ri) S.local = { x: me.x, z: me.z, ri: S.snap.ri, roll: 0, rollCd: 0 };
      localMove(me, inp, dt);
      S.sendAcc += dt; const o = S.pend || (S.pend = {}); o.q = o.q || inp.q; o.e = o.e || inp.e; o.r = o.r || inp.r; o.roll = o.roll || inp.roll; o.skip = o.skip || inp.skip; o.atkR = o.atkR || inp.atkR; o.rcl = o.rcl || inp.rcl;
      if (S.sendAcc >= 1 / 30) { S.sendAcc = 0; send({ t: 'i', rsp: inp.rsp, px: +S.local.x.toFixed(2), pz: +S.local.z.toFixed(2), aim: inp.aim, ax: inp.ax, az: inp.az, atk: !!inp.atk, f: !!inp.f, q: o.q, e: o.e, r: o.r, roll: o.roll, skip: o.skip, atkR: o.atkR, rcl: o.rcl }); S.pend = {}; }
      me.x = S.local.x; me.z = S.local.z; if (S.local.roll > 0) me.ro = 1; if (inp.aim != null) me.a = inp.aim;
    }
    syncScene();
    const ph = S.snap.ph;
    if (ph === 'intro') { paintIntro(); view.sync(S.snap, S.me, dt, t, !!S.G); }
    else {
      for (const e of S.evq) onEvent(e); S.evq.length = 0;
      specTick(me); if (ph === 'won' && S.winId) view.camId = S.winId; view.sync(S.snap, S.me, dt, t, !!S.G); paintHud(); finalCheck(S.snap); paintBless();
      if (ph === 'over') { S.overT += dt; if (S.overT > 3.6 && !S.resultShown) showDeepResult(); }
      if (ph === 'won') { S.wonT += dt; S.winPoseT = (S.winPoseT || 0) + dt; if (S.winPoseT > 1.2 && S.winId) { S.winPoseT = 0; view.pose(S.winId, 'rally'); const w = S.snap.pl.find(q => q.id === S.winId); if (w) view.burst(w.x, 2.5, w.z, 0xffe08a, 16, 6, 0.8, 0.14); } if (S.wonT >= 1.6 && !S.resultShown) showWin(); }
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
if (DEV) window.__T = { SAVE, paintSettings, step, relBasic, aimedSkill, mouse, once, TOUCH, S, menu, beginGame, startHost, startMatch, startGuest, view, CH };
if (DEV && qs.get('test')) {
  const r = qs.get('role') || 'knight'; SAVE.role = r;
  S.net = 'solo'; S.slots = [meSlot()]; newBots(); S.botN = +(qs.get('bots') || 5);
  S.chSel = +(qs.get('ch') || 1) - 1;
  beginGame(); const ri = +(qs.get('room') || 0);
  if (qs.get('skip')) { S.G.phase = 'play'; S.G.phaseT = 0; }
  if (ri) { const A = MAP.areas[ri], [x, y, w, h] = A.r[0]; const c = A.boss ? { x: cw(MAP.boss[0]), z: cw(MAP.boss[1] + 6) } : { x: (x + w / 2) * CS, z: (y + h - 1.5) * CS }; S.G.players.forEach((p, i) => { p.x = c.x + (i - 1.5) * 1.6; p.z = c.z; mapCollide(p, 0.6); }); }
  window.__S = S;
}
if (DEV && qs.get("dbg")) { window.__S = S; window.__view = view; }

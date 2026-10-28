// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 규칙 (방장·혼자 하기에서만 돌아가요). three.js를 쓰지 않아서 node에서도 시험할 수 있어요.
import { ROLES, ROLE_IDS, ENEMIES, BLESSINGS, CHAPTERS, FOES, MAP, GEAR_BONUS, COMBOS, DEEP, ROLE_PUZ, flagShown } from './data.js';
import * as D from './data.js';
import { collide as mapCollide, isWall, lineClear, navDir, areaAt, cw, useChapter, PILLARS, resetSecrets, openSecret, secretFace, openGate, dropPillar, pillarAt, LIFTH, liftOk } from './map.js';

export const INTRO_T = 16;
const WAKE_R = 14, LEASH_R = 30;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const angTo = (a, b) => Math.atan2(b.z - a.z, b.x - a.x);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };

export function mkRng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

/* slots: [{id, role, name, bot, lv, gear:{weapon,armor}}] */
// 장마다 적 능력치: 1장 값에 장 난이도와 적 종류별 배율을 곱해요
function enemyStats(ch) {
  const C = D.CH, F = FOES[ch] || FOES[0], o = {}, cu = C.curse || {};
  for (const k of ['skel', 'archer', 'shield', 'elite']) {
    const b = ENEMIES[k], f = F[k] || {};
    // 잡몹은 쉽게: 체력 70%, 공격 75% (정예는 85%씩)
    const eh = k === 'elite' ? 0.85 : 0.7, ed = k === 'elite' ? 0.85 : 0.75;
    o[k] = Object.assign({}, b, { name: f.name || b.name, hp: Math.round(b.hp * (f.hp || 1) * C.diff * eh * (cu.hp || 1)), dmg: Math.round(b.dmg * C.diff * ed * (cu.dmg || 1)), speed: b.speed * (f.speed || 1) * (cu.spd || 1), r: f.r || b.r, proj: f.proj || 'earrow', psp: f.psp || 17 });
  }
  const mi = ENEMIES.mimic; o.mimic = Object.assign({}, mi, { hp: Math.round(mi.hp * C.diff * (cu.hp || 1)), dmg: Math.round(mi.dmg * C.diff * 0.85 * (cu.dmg || 1)), speed: mi.speed * (cu.spd || 1) });
  o.boss = Object.assign({}, ENEMIES.boss, C.boss, { honor: 0 }); o.boss.dmg = Math.round(o.boss.dmg * BOSS_DMG * (cu.dmg || 1));
  o.dummy = { name: '', hp: 1, speed: 0, r: 0.7, dmg: 0, honor: 0 };   // 대전에서 플레이어 하나하나를 대신해 맞아 주는 보이지 않는 표적
  return o;
}
export function createGame(slots, seed, ch = 0) {
  useChapter(ch, ch === D.DEEP_I); resetSecrets();
  const G = {
    ch, CH: D.CH, EN: enemyStats(ch), deep: D.CH.deep ? { floor: DEEP.floor, seed: DEEP.seed, curses: DEEP.curses.slice() } : null, sk: [], combos: {},
    secrets: MAP.secrets.map(() => ({ open: false })), lores: MAP.lores.map(() => ({ read: false, prog: 0 })), bossArea: MAP.areas.findIndex(a => a.boss),
    pvp: !!D.CH.pvp, winner: 0, t0: 0,
    t: 0, rng: mkRng(seed || Date.now()), phase: 'intro', phaseT: 0,
    players: [], enemies: [], projs: [], zones: [], ev: [], uid: 1, msg: '', stats: { downs: 0, kills: 0 },
    humans: slots.filter(s => !s.bot).length, bless: {}, honor: {}, won: false,
    skip: {}, cp: { x: cw(MAP.start[0]), z: cw(MAP.start[1]) }, cpI: -1, bossIntro: false, bossDead: false, route: 0,
    fires: MAP.fires.map(([x, y]) => ({ x: cw(x), z: cw(y), lit: false })),
    weekly: D.WEEKLY.on ? { id: D.WEEKLY.id, curses: D.WEEKLY.curses.slice() } : null,
    fork: MAP.fork ? { pick: -1, prog: [0, 0], done: 0 } : null,
    altars: MAP.altars.map(([x, y]) => ({ x: cw(x), z: cw(y), used: false, prog: 0 })),
    chests: MAP.chests.map(([x, y, sec], i) => ({ x: cw(x), z: cw(y), open: false, prog: 0, sec: sec || 0, mim: i === MAP.mimic })),
    puz: MAP.puzzles.map(q => ({ done: false, occ: [0, 0, 0, 0], hold: 0, n: 0, lit: q.lit0 ? q.lit0.slice() : q.items.map(() => 0), rot: q.rot0 ? q.rot0.slice() : [0, 0, 0, 0], idle: 0, help: false, tT: 0, ct: q.items.map(() => 0), pg: q.items.map(() => 0), head: -1, on: {} })),
    darks: MAP.darks.map(() => ({ t: 0 })), esc: null, escDone: false,
    flag: MAP.flag ? { x: cw(MAP.flag[0]), z: cw(MAP.flag[1]), hx: cw(MAP.flag[0]), hz: cw(MAP.flag[1]), by: 0, prog: 0, pT: 0, got: 0 } : null,
    pits: MAP.pits.map(() => ({ down: false, hits: 0, idle: 0, help: false })), lifts: MAP.lifts.map(() => ({ h: 0, dir: 1, lock: false, done: false, mv: 0 })),
    traps: MAP.traps.map(([x, y], i) => ({ id: i, x: cw(x), z: cw(y), on: true, t: i * 0.7, up: false }))
  };
  slots.forEach((s, i) => {
    const R = ROLES[s.role], lv = s.lv || 1, gear = s.gear || { weapon: 0, armor: 0 };
    const maxhp = Math.round(R.hp * (1 + 0.03 * (lv - 1)) + GEAR_BONUS.armor[gear.armor | 0]);
    G.players.push({
      id: s.id, role: s.role, col: s.col || 0, cos: s.cos || null, name: s.name, bot: !!s.bot, slot: i, x: 0, z: 0, vx: 0, vz: 0, a: -Math.PI / 2,
      hp: maxhp, maxhp, baseHp: maxhp, down: false, dead: false, bleed: 0, revT: 0, respT: 0, roll: 0, rollCd: 0, inv: 0,
      cd: { atk: 0, s0: 0, s1: 0, s2: 0 }, block: 0, taunt: 0, rally: 0, shield: 0, shieldT: 0,
      dmgMul: 1 + 0.03 * (lv - 1) + GEAR_BONUS.weapon[gear.weapon | 0], bl: [], anim: '', animT: 0, hitT: 0,
      ai: { t: 0, tx: 0, tz: 0, target: 0 }, everDown: false, kills: 0, place: 0, survT: 0
    });
    G.honor[s.id] = 0;
  });
  if (G.pvp) { pvpSpawn(G); return G; }
  placeAt(G, G.cp);
  // 몬스터는 지도에 정해진 자리에 한 번만 나와요
  for (const [k, x, y] of MAP.spawns) spawnEnemy(G, k, cw(x), cw(y), true);
  const b = spawnEnemy(G, 'boss', cw(MAP.boss[0]), cw(MAP.boss[1]), true); b.a = Math.PI / 2;
  return G;
}
/* ---------- 대전 (마지막 한 명이 남을 때까지) ---------- */
// 투기장 가장자리에 둥글게 서서 시작해요. 플레이어마다 보이지 않는 표적(dummy)이 따라다니고,
// 보우킵의 공격·화살·기술이 적을 치는 그대로 이 표적을 치면 그 플레이어가 피해를 받아요 (자기 표적은 못 쳐요)
export const PVP_DMG = 0.45;
function pvpSpawn(G) {
  const [x, y, w, h] = MAP.areas[0].r[0], cx = (x + w / 2) * 2, cz = (y + h / 2) * 2, rx = w * 2 * 0.36, rz = h * 2 * 0.34, n = G.players.length, o = G.rng() * TAU;
  G.players.forEach((p, i) => {
    const a = o + i / n * TAU; p.x = cx + Math.cos(a) * rx; p.z = cz + Math.sin(a) * rz; p.vx = p.vz = 0; p.a = Math.atan2(cz - p.z, cx - p.x); p.roll = 0; mapCollide(p, 0.6);
    const e = { id: G.uid++, k: 'dummy', pid: p.id, x: p.x, z: p.z, a: 0, hp: 1, maxhp: 1, dm: 1, st: 'idle', stT: 0, cd: 0, tgt: null, root: 0, burn: 0, burnT: 0, mark: 0, stun: 0, hitT: 0, vx: 0, vz: 0, wind: 0, r: 0.7, slow: 0, slowM: 1 };
    G.enemies.push(e); p.px = e;
  });
}
// 표적을 플레이어에게 맞춰요: 쓰러진 사람의 표적은 꺼지고, 표적이 받은 둔화·표시를 플레이어에게 옮겨요
function syncProxies(G, dt) {
  for (const p of G.players) {
    const e = p.px; if (!e) continue;
    e.x = p.x; e.z = p.z; e.a = p.a; e.hp = alive(p) ? 1 : 0;
    if (e.slow > 0) { p.slow = Math.max(p.slow || 0, e.slow); p.slowM = e.slowM || 0.5; e.slow = 0; }
    if (e.stun > 0) { p.stun = Math.max(p.stun || 0, e.stun); e.stun = 0; }
    if (e.mark > 0) e.mark = Math.max(0, e.mark - dt);
  }
}
function hurtProxy(G, e, dmg, p, o) {
  const t = G.players.find(q => q.id === e.pid);
  if (!t || (p && p.id === t.id) || !alive(t) || G.phase !== 'play') return 0;
  let d = dmg * (p ? p.dmgMul * (hasB(p, 'blade') ? 1.15 : 1) * (p.rally > 0 ? 1.3 : 1) * (p.focus > 0 ? 1.5 : 1) : 1);
  if (e.mark > 0) d *= 1.5;
  const r = hurtPlayer(G, t, Math.max(1, d * PVP_DMG), p);
  if (r > 0 && o.burn) t.burn = 3;
  if (r > 0 && p && p.leech > 0) p.hp = Math.min(p.maxhp, p.hp + r * 0.6);
  return r;
}
// 체력이 다하면 탈락해요: 일으켜 주는 사람도, 다시 일어나는 일도 없어요
export function koPlayer(G, p, src) {
  p.hp = 0; p.dead = true; p.down = false; p.respT = 1e9; p.roll = 0; p.hvT = p.pbT = 0; p.block = p.taunt = 0; p.burn = 0;
  p.place = G.players.filter(alive).length + 1; p.survT = G.t - (G.t0 || 0);
  const k = src && src.id && src.id !== p.id ? G.players.find(q => q.id === src.id) : null; if (k) k.kills++;
  G.stats.downs++; ev(G, 'ko', { id: p.id, by: k ? k.id : null, x: p.x, z: p.z });
}
function pvpCheck(G) {
  if (G.phase !== 'play') return;
  const al = G.players.filter(alive); if (al.length > 1) return;
  const w = al[0] || G.players.find(q => q.place === 1); if (w) { w.place = 1; if (alive(w)) w.survT = G.t - (G.t0 || 0); G.winner = w.id; }
  for (const p of G.players) { const pl = p.place || G.players.length; G.honor[p.id] += (pl === 1 ? 60 : pl === 2 ? 35 : pl === 3 ? 20 : 8) + (p.kills | 0) * 10; }
  G.won = true; G.winT = G.t; G.phase = 'won'; G.phaseT = 0; ev(G, 'won', {});
}
function placeAt(G, c) {
  G.players.forEach((p, i) => { p.x = c.x - 3 + i * 2; p.z = c.z + (i % 2) * 0.8; p.vx = p.vz = 0; p.a = -Math.PI / 2; p.roll = 0; mapCollide(p, 0.6); });
}

function hasB(p, id) { return p.bl.indexOf(id) >= 0; }
// 회복: 심연의 '마른 샘' 저주가 있으면 줄어요
function healP(G, q, v) { const n = v * ((G.CH.curse && G.CH.curse.heal) || 1); q.hp = Math.min(q.maxhp, q.hp + n); return Math.round(n); }
function ev(G, k, o) { G.ev.push(Object.assign({ k }, o || {})); }
function alive(p) { return !p.down && !p.dead; }
// 기사단 깃발을 든 사람: 느리고, 구르기·공격·기술을 못 써요. 적이 먼저 노려요
const hasFlag = (G, p) => !!(G.flag && G.flag.by === p.id);
function hpMul(G) { return 1 + 0.35 * (Math.max(1, G.humans) - 1); }

function spawnEnemy(G, k, x, z, home) {
  // 보스가 부른 부하는 장 난이도를 빼고 1장 수준으로 나와요
  const E = G.EN[k], weak = !home && k !== 'boss' ? 1 / G.CH.diff : 1, hp = Math.round(E.hp * hpMul(G) * weak);
  const e = { id: G.uid++, k, x, z, a: Math.PI / 2, hp, maxhp: hp, dm: weak, st: home ? 'sleep' : 'rise', stT: 0.9, cd: 0.3 + G.rng() * 0.6, tgt: null, root: 0, burn: 0, burnT: 0, mark: 0, stun: 0, hitT: 0, vx: 0, vz: 0, wind: 0, r: E.r };
  if (home) { e.hx = x; e.hz = z; } else e.summoned = true;
  if (k === 'boss') Object.assign(e, { phase: 1, pat: 0, summonT: 10, fireT: 5, atk: null, faceLock: 0 });
  G.enemies.push(e); if (!home) ev(G, 'spawn', { x, z, en: k });
  return e;
}
function wake(G, e) {
  if (e.st !== 'sleep' && e.st !== 'home') return;
  if (e.k === 'boss' && !G.bossIntro) return;
  e.st = 'idle'; e.cd = 0.4 + G.rng() * 0.8;
  if (e.k !== 'boss') ev(G, 'wake', { x: e.x, z: e.z, id: e.id });
  // 근처에 잠든 동료도 같이 깨워요
  for (const o of G.enemies) if (o !== e && o.hp > 0 && o.st === 'sleep' && o.k !== 'boss' && dist(o, e) < 12) { o.st = 'idle'; o.cd = 0.6 + G.rng(); }
}

/* ---------- 이동·충돌 ---------- */
function collide(G, o, r) { mapCollide(o, r); }

/* ---------- 피해 ---------- */
function hurtPlayer(G, p, dmg, src) {
  if (!alive(p) || p.inv > 0) return 0;
  // 저스트 회피: 구르기를 막 시작했을 때 맞을 뻔하면 잠깐 집중 상태가 돼요 (피해 +50%)
  if (p.roll > 0) { if (p.roll > 0.15 && !(p.pdCd > 0) && !p.bot) { p.focus = 2.5; p.pdCd = 0.6; ev(G, 'pdodge', { id: p.id, x: p.x, z: p.z }); if (!p.bot) ev(G, 'ach', { id: 'pdodge', pid: p.id }); } return 0; }
  let d = dmg;
  if (p.block > 0 && src) { const fa = angTo(p, src); if (angDiff(p.a, fa) < 1.3) { d *= 0.3; ev(G, 'block', { x: p.x, z: p.z }); } }
  if (p.taunt > 0) d *= 0.7;
  if (hasB(p, 'last') && p.hp < p.maxhp * 0.3) d *= 0.75;
  if (p.shield > 0) { const s = Math.min(p.shield, d); p.shield -= s; d -= s; }
  d = Math.round(d); if (d <= 0) return 0;
  p.hp -= d; p.hitT = 0.25; p.noHit = 0; ev(G, 'phit', { id: p.id, x: p.x, z: p.z, v: d, by: src && src.id || null });
  if (hasB(p, 'thorn') && src && src.hp > 0 && src.id) hurtEnemy(G, src, 8, null, {});
  if (p.hp <= 0 && G.pvp) { koPlayer(G, p, src); return d; }
  if (p.hp <= 0) { if (p.emb) { p.emb = 0; ev(G, 'emb', { id: p.id, on: 0 }); } p.hp = 0; p.down = true; p.bleed = 20; p.revT = 0; p.everDown = true; G.stats.downs++; ev(G, 'down', { id: p.id, x: p.x, z: p.z }); }
  return d;
}
function hurtEnemy(G, e, dmg, p, o) {
  if (e.hp <= 0 || e.st === 'rise') return 0;
  if (e.k === 'dummy') return hurtProxy(G, e, dmg, p, o);
  if (e.st === 'sleep' || e.st === 'home') wake(G, e);
  const E = G.EN[e.k];
  let d = dmg * (p ? p.dmgMul * (hasB(p, 'blade') ? 1.15 : 1) * (p.rally > 0 ? 1.3 : 1) * (p.focus > 0 ? 1.5 : 1) : 1);
  if (e.mark > 0) d *= 1.5;
  const from = o.from || p;
  if (E.front && from && !o.pierce) { if (angDiff(e.a, angTo(e, from)) < 1.0) { d *= E.front; ev(G, 'clang', { x: e.x, z: e.z }); } }
  if (e.k === 'boss') {
    if (e.stun > 0) d *= 1.5;
    if (e.phase >= 3 && from && angDiff(e.a, angTo(e, from)) > 1.9) { d *= 2; ev(G, 'weak', { x: e.x, z: e.z }); }
  }
  d = Math.max(1, Math.round(d));
  e.hp -= d; e.hitT = 0.15; ev(G, 'ehit', { x: e.x, z: e.z, v: d, id: e.id, crit: d > dmg * 1.4, hv: o.heavy ? 1 : 0 });
  if (p && hasB(p, 'leech') && alive(p)) healP(G, p, 1);
  if ((o.burn || (p && hasB(p, 'fire') && o.basic)) && e.hp > 0) { e.burn = 3; }
  // 종자 함성 중에는 횃불 공격의 불똥이 튀어 옆의 적도 불타요
  if (o.burn && p && p.role === 'squire' && p.rally > 0 && !o.spread) { let n = 0; for (const q of G.enemies) if (q !== e && q.hp > 0 && Math.hypot(q.x - e.x, q.z - e.z) < 3) { q.burn = 3; n++; } if (n) ev(G, 'flare', { x: e.x, z: e.z }); }
  if (o.kb && e.k !== 'boss') { e.vx += Math.cos(o.kbA) * o.kb; e.vz += Math.sin(o.kbA) * o.kb; }
  if (e.hp <= 0) killEnemy(G, e);
  return d;
}
function killEnemy(G, e) {
  e.hp = 0; G.stats.kills++; ev(G, 'ekill', { x: e.x, z: e.z, en: e.k, id: e.id }); ev(G, 'ach', { id: 'room1' });
  const h = G.EN[e.k].honor; for (const p of G.players) G.honor[p.id] += h;
  if (e.k === 'elite') ev(G, 'ach', { id: 'elite' });
  if (e.mb) { for (const p of G.players) G.honor[p.id] += 30; if (G.fork) G.fork.done = 1; ev(G, 'chest', { x: e.x, z: e.z, h: 30 }); ev(G, 'mbkill', { x: e.x, z: e.z }); }
  if (e.k === 'mimic') { for (const p of G.players) G.honor[p.id] += 40; ev(G, 'chest', { x: e.x, z: e.z, h: 40 }); for (const p of G.players) if (!p.bot) ev(G, 'ach', { id: 'mimic', pid: p.id }); }
  if (e.k === 'boss') { G.bossDead = true; for (const o of G.enemies) if (o !== e && o.hp > 0 && o.summoned) { o.hp = 0; ev(G, 'ekill', { x: o.x, z: o.z, en: o.k, id: o.id }); } }
}

/* ---------- 플레이어 행동 ---------- */
function cdMul(p, which, G) { return which === 'atk' ? (hasB(p, 'hands') ? 0.85 : 1) * (p && p.leech > 0 ? 0.7 : 1) : (hasB(p, 'focus') ? 0.85 : 1) * ((G && G.CH.curse && G.CH.curse.cd) || 1); }
function aimPoint(p, inp, range) {
  if (inp.ax != null) { const d = Math.hypot(inp.ax - p.x, inp.az - p.z); if (d <= range) return { x: inp.ax, z: inp.az }; }
  return { x: p.x + Math.cos(p.a) * range, z: p.z + Math.sin(p.a) * range };
}
// 보스 피해 배율 (모든 보스 공격이 세져요)
export const BOSS_DMG = 1.3;
export const COMBO_T = 0.65, COMBO_PRIEST = 0.65;
function basicAttack(G, p, inp, nShot = 1) {
  const R = ROLES[p.role], A = R.atk;
  p.cd.atk = A.cd * cdMul(p, 'atk');
  // 기사 3단 베기: 공격, 공격, 강타 뒤 처음부터 (0.5초 안에 다시 치지 않으면 처음부터, 사제는 0.75초). 기사 봇도 써요
  // 사제·종자: 세 번째 공격마다 크게 휘두르는 큰 공격 (피해 1.5배). 봇은 쓰지 않아요
  const cmb = (!p.bot || p.ai.cmbT > 0 || p.role === 'knight') && p.role !== 'archer', aid = p.atkN = (p.atkN || 0) + 1;
  if (cmb) { p.combo = p.comboT > 0 ? ((p.combo || 0) + 1) % 3 : 0; p.comboT = p.role === 'priest' || p.role === 'witch' ? COMBO_PRIEST : COMBO_T; }
  const third = cmb && p.combo === 2, heavy = third && p.role === 'knight', big = third && !heavy, hm = big ? 1.5 : 1;
  p.anim = heavy ? 'hv' : big ? 'big' : 'atk'; p.animT = heavy ? 0.95 : big ? 0.6 : 0.32; p.animN = (p.animN || 0) + 1;
  // 기사 베기 방향: 1타 오른쪽 위→왼쪽 아래, 2타 왼쪽 아래→오른쪽 아래 (봇은 둘을 번갈아)
  p.animC = cmb ? p.combo : (p.animN % 2);
  // 강타는 제자리에서 높이 뛰어올라, 땅에 내려찍는 순간 맞아요 (공중에 있는 동안은 움직이지 않아요)
  if (heavy) { p.hvT = HV_DELAY; p.hvAid = aid; return; }
  // 사제 세 번째 공격: 제자리에서 빛을 모았다가 (PB_DELAY) 적을 꿰뚫는 큰 빛을 쏴요
  if (big && (p.role === 'priest' || p.role === 'witch')) { p.pbT = PB_DELAY; p.pbAid = aid; p.animT = PB_T; ev(G, 'pcharge', { id: p.id, x: p.x, z: p.z }); return; }
  if (big) { ev(G, 'big', { id: p.id, role: p.role, x: p.x + Math.cos(p.a) * 1.4, z: p.z + Math.sin(p.a) * 1.4, a: p.a }); breakWall(G, p.x + Math.cos(p.a) * 1.6, p.z + Math.sin(p.a) * 1.6, 2.2, p); }
  if (A.kind === 'melee') {
    hitPuzzle(G, p.x + Math.cos(p.a) * 1.6, p.z + Math.sin(p.a) * 1.6, A.range * 0.8, p, 1, 'melee');
    ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: A.range * (big ? 1.3 : 1), role: p.role });
    for (const e of G.enemies) { if (e.hp <= 0) continue; const d = dist(p, e); if (d < A.range * (big ? 1.3 : 1) + e.r && angDiff(p.a, angTo(p, e)) < A.arc / 2 + (big ? 0.7 : 0.25)) hurtEnemy(G, e, A.dmg * hm, p, { basic: true, aid, burn: A.burn, kb: big ? 6 : 3, kbA: angTo(p, e) }); }
  } else {
    // 모아 쏜 화살: 두 발은 한 발마다 1.3배, 세 발은 1.7배 피해로 살짝 퍼져 나가요
    const sm = CHG_M[nShot - 1], spread = nShot === 1 ? [0] : nShot === 2 ? [-0.07, 0.07] : [-0.13, 0, 0.13];
    for (const da of spread) { const a = p.a + da; G.projs.push({ id: G.uid++, k: A.kind, big: big ? 1 : 0, own: p.id, x: p.x + Math.cos(a) * 0.8, z: p.z + Math.sin(a) * 0.8, vx: Math.cos(a) * A.speed * (nShot > 1 ? 1.15 : 1), vz: Math.sin(a) * A.speed * (nShot > 1 ? 1.15 : 1), dmg: A.dmg * hm * sm, life: 1.1, hit: [], basic: true, aid, team: 0, cs: nShot }); }
    ev(G, 'shoot', { id: p.id, pk: A.kind, x: p.x, z: p.z });
  }
}
export const PB_DELAY = 0.45, PB_T = 0.9;
function priestBlast(G, p) {
  const A = ROLES[p.role].atk, a = p.a;
  G.projs.push({ id: G.uid++, k: 'orb', big: 1, own: p.id, x: p.x + Math.cos(a) * 1.0, z: p.z + Math.sin(a) * 1.0, vx: Math.cos(a) * 22, vz: Math.sin(a) * 22, dmg: A.dmg * 2.4, life: 0.9, hit: [], basic: true, aid: p.pbAid, team: 0, pierce: true });
  ev(G, 'big', { id: p.id, role: p.role, x: p.x + Math.cos(a) * 1.4, z: p.z + Math.sin(a) * 1.4, a }); ev(G, 'shoot', { id: p.id, pk: 'orb', x: p.x, z: p.z });
}
export const HV_DELAY = 0.36, HV_R = 3.2, CHG_T = [0.8, 2], CHG_M = [1, 1.3, 1.7];
function heavyLand(G, p) {
  const A = ROLES[p.role].atk;
  ev(G, 'heavy', { id: p.id, x: p.x + Math.cos(p.a) * 1.6, z: p.z + Math.sin(p.a) * 1.6, a: p.a });
  ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: A.range, role: p.role });
  // 내려찍은 자리 둘레 전부를 쳐요 (피해 3.4배), 맞은 적은 느려져요 (보스는 덜, 짧게)
  const cx = p.x + Math.cos(p.a) * 1.2, cz = p.z + Math.sin(p.a) * 1.2;
  breakWall(G, cx, cz, HV_R, p); hitPuzzle(G, cx, cz, HV_R, p, 1, 'heavy');
  for (const e of G.enemies) { if (e.hp <= 0) continue; if (Math.hypot(e.x - cx, e.z - cz) < HV_R + e.r) { const kbA = Math.atan2(e.z - cz, e.x - cx); hurtEnemy(G, e, A.dmg * 3.4, p, { basic: true, aid: p.hvAid, heavy: true, burn: A.burn, kb: 7, kbA }); if (e.hp > 0) { const boss = e.k === 'boss'; e.slow = boss ? 1.5 : 2.5; e.slowM = boss ? 0.75 : 0.5; } } }
}
// 금 간 벽: 강타, 세 번째 큰 공격, 관통 화살이 닿으면 무너지고 비밀 방이 열려요
function breakWall(G, x, z, r, p) {
  G.pits.forEach((P, k) => { if (!P.down) { const o = pillarAt(k); if (Math.hypot(o.x - x, o.z - z) < r + 1.6) fellPillar(G, k, p); } });
  G.secrets.forEach((q, k) => {
    if (q.open) return; const f = secretFace(k); if (Math.hypot(f.x - x, f.z - z) > r + 1.4) return;
    openWall(G, k, p);
  });
}
function openWall(G, k, p) {
  const q = G.secrets[k], f = secretFace(k); q.open = true; openSecret(k); ev(G, 'secret', { i: k, x: f.x, z: f.z }); for (const o of G.players) G.honor[o.id] += 20;
  if (p && !p.bot) ev(G, 'ach', { id: 'secret', pid: p.id });
}
// 합동기: 짝이 맞는 기술을 다른 동료가 1초 안에 썼으면 함께 터져요
function tryCombo(G, p, sid) {
  if (G.pvp) return;   // 합동기는 협동 전용
  G.sk = G.sk.filter(o => G.t - o.t < 1);
  for (const C of COMBOS) {
    if (C.a !== sid && C.b !== sid) continue; const other = C.a === sid ? C.b : C.a;
    const o = G.sk.find(q => q.s === other && q.pid !== p.id); if (!o) continue;
    const q = G.players.find(x => x.id === o.pid); if (!q || !alive(q) || dist(p, q) > 12) continue;
    G.sk = G.sk.filter(x => x !== o);
    const A = C.a === sid ? p : q, B = A === p ? q : p; comboFx(G, C, A, B); return;
  }
  G.sk.push({ pid: p.id, s: sid, t: G.t });
}
function comboFx(G, C, A, B) {
  const hit = (e, dmg, by) => { if (e.hp > 0) hurtEnemy(G, e, dmg, by, { from: by }); };
  let x = A.x, z = A.z;
  switch (C.id) {
    case 'lightdash': { // 기사가 지나간 길을 따라 빛이 터져요
      const ox = A.x - Math.cos(A.a) * 6, oz = A.z - Math.sin(A.a) * 6; x = (ox + A.x) / 2; z = (oz + A.z) / 2;
      for (const e of G.enemies) if (e.hp > 0 && segDist(ox, oz, A.x + Math.cos(A.a) * 2, A.z + Math.sin(A.a) * 2, e.x, e.z) < 2.4 + e.r) { hit(e, 80, A); if (e.hp > 0) e.stun = Math.max(e.stun, e.k === 'boss' ? 0.6 : 1.5); }
      A.shield = Math.max(A.shield, 60); A.shieldT = 6; break;
    }
    case 'sanct': // 기사 둘레가 성역이 돼요
      for (const o of G.players) if (alive(o) && dist(A, o) < 8) ev(G, 'heal', { id: o.id, x: o.x, z: o.z, v: healP(G, o, 40) });
      for (const e of G.enemies) if (e.hp > 0 && dist(A, e) < 8 + e.r) hit(e, 55, B); break;
    case 'wall': // 방패진: 모두에게 큰 보호막
      for (const o of G.players) if (alive(o) && dist(A, o) < 10) { o.shield = Math.max(o.shield, 50); o.shieldT = 6; ev(G, 'ward', { id: o.id }); } break;
    case 'firerain': { // 화살비가 불타올라요
      const r = G.zones.filter(zz => zz.k === 'rain' && zz.own === A.id).pop(); if (r) { r.fire = 1; r.t += 1.5; r.r += 0.8; x = r.x; z = r.z; } break;
    }
    case 'net': { // 표시한 적 둘레를 모두 묶어요
      const m = G.enemies.filter(e => e.hp > 0 && e.mark > 0).sort((a, b) => dist(A, a) - dist(A, b))[0] || G.enemies.filter(e => e.hp > 0).sort((a, b) => dist(B, a) - dist(B, b))[0];
      if (m) { x = m.x; z = m.z; for (const e of G.enemies) if (e.hp > 0 && Math.hypot(e.x - m.x, e.z - m.z) < 5.5) { e.root = Math.max(e.root, e.k === 'boss' ? 1.2 : 3.5); if (e.k === 'boss') e.slow = 2, e.slowM = 0.6; hit(e, 30, B); } } break;
    }
  }
  G.combos[C.id] = 1;
  ev(G, 'combo', { c: C.id, name: C.name, x, z, a: A.id, b: B.id });
  if (!A.bot || !B.bot) { for (const o of [A, B]) if (!o.bot) { ev(G, 'ach', { id: 'combo', pid: o.id }); ev(G, 'combo1', { c: C.id, pid: o.id }); } }
}
const ANIMOF = { shieldbash: 'block', frost: 'curse', leap: 'leap', bloodlust: 'taunt', flurry: 'flurry', blink: 'shadow', scatter: 'scatter', fan: 'pierce', bonestorm: 'storm' };
const friends = (G, p) => G.pvp ? [p] : G.players;   // 대전에서는 내 편이 나뿐이에요
function useSkill(G, p, si, inp) {
  const R = ROLES[p.role], S = R.skills[si], key = 's' + si;
  if (p.cd[key] > 0) return;
  p.cd[key] = S.cd * cdMul(p, 'skill', G); p.anim = ANIMOF[S.id] || S.id; p.animT = 0.8; p.animN = (p.animN || 0) + 1;
  ev(G, 'skill', { id: p.id, s: S.id, x: p.x, z: p.z, a: p.a });
  switch (S.id) {
    case 'block': p.block = 1.2; rolePuz(G, p, 'oath', 1.7); break;
    case 'dash': {
      const ox = p.x, oz = p.z, L = 6;
      p.x += Math.cos(p.a) * L; p.z += Math.sin(p.a) * L; collide(G, p, 0.6); p.inv = 0.3;
      for (const e of G.enemies) { if (e.hp <= 0) continue; if (segDist(ox, oz, p.x, p.z, e.x, e.z) < 1.3 + e.r) hurtEnemy(G, e, 30, p, { kb: 8, kbA: p.a }); }
      break;
    }
    case 'taunt': p.taunt = 4; for (const e of G.enemies) if (dist(p, e) < 10) { e.tgt = p.id; e.tauntT = 4; } break;
    case 'pierce': G.projs.push({ id: G.uid++, k: 'pierce', own: p.id, x: p.x, z: p.z, vx: Math.cos(p.a) * 32, vz: Math.sin(p.a) * 32, dmg: 45, life: 1.2, pierce: true, hit: [], team: 0 }); break;
    case 'rain': { const q = aimPoint(p, inp, 12); G.zones.push({ id: G.uid++, k: 'rain', x: q.x, z: q.z, r: 3.5, t: 1.5, tick: 0, own: p.id }); break; }
    case 'mark': {
      let best = null, bs = 1e9;
      for (const e of G.enemies) { if (e.hp <= 0 || e.pid === p.id) continue; const s = angDiff(p.a, angTo(p, e)) * 8 + dist(p, e); if (s < bs) { bs = s; best = e; } }
      if (best) { best.mark = 6; ev(G, 'mark', { id: best.id, x: best.x, z: best.z }); }
      break;
    }
    case 'heal': for (const q of friends(G, p)) if (alive(q) && dist(p, q) < 6) ev(G, 'heal', { id: q.id, x: q.x, z: q.z, v: healP(G, q, 18) }); rolePuz(G, p, 'basins', 6); break;
    case 'ward': for (const q of friends(G, p)) if (alive(q) && dist(p, q) < 7.5) { q.shield = 24; q.shieldT = 5; ev(G, 'ward', { id: q.id }); } break;
    case 'raise': {
      // 1초 동안 빛을 모은 뒤 가까이 쓰러진 동료가 일어나요 (그 사이 사제가 쓰러지면 없던 일)
      const n = G.players.filter(q => q.down && !q.dead && dist(p, q) < 6).length;
      if (!n) p.cd[key] = 2; else { p.raiseT = 1; ev(G, 'raising', { id: p.id, x: p.x, z: p.z }); } // 아무도 없으면 대기 시간을 거의 쓰지 않아요
      break;
    }
    case 'potion': { const q = aimPoint(p, inp, 9); G.projs.push({ id: G.uid++, k: 'potion', own: p.id, x: p.x, z: p.z, tx: q.x, tz: q.z, sx: p.x, sz: p.z, t: 0, T: 0.55, team: 0 }); break; }
    case 'trap': G.zones.push({ id: G.uid++, k: 'ptrap', x: p.x, z: p.z, r: 1.4, t: 20, own: p.id }); break;
    case 'rally': for (const q of friends(G, p)) if (alive(q) && dist(p, q) < 9) { q.rally = 7; ev(G, 'rally', { id: q.id }); } break;
    case 'whirl': p.mh = { t: 0.8, tick: 0, gap: 0.27, dmg: 12, r: 3.4, fx: 'stormfx' }; p.animT = 1.0; break;   // 제자리에서 두 바퀴 돌며 둘레 모두를 세 번 베요
    case 'quake': { // 앞으로 길게 땅을 갈라요: 갈라진 길 위 모두가 피해를 받고 느려져요
      ev(G, 'skill', { id: p.id, s: 'quakeline', x: p.x, z: p.z, a: p.a });
      const L = 11, ex = p.x + Math.cos(p.a) * L, ez = p.z + Math.sin(p.a) * L;
      for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && segDist(p.x, p.z, ex, ez, e.x, e.z) < 1.9 + e.r) { hurtEnemy(G, e, 42, p, {}); if (e.hp > 0) { e.slow = 2.5; e.slowM = 0.5; } }
      break;
    }
    case 'shieldbash': { // 방패를 앞세워 파고들며 세게 쳐서 맞은 상대를 잠깐 기절시켜요
      p.x += Math.cos(p.a) * 2.6; p.z += Math.sin(p.a) * 2.6; collide(G, p, 0.6); ev(G, 'skill', { id: p.id, s: 'bashfx', x: p.x, z: p.z, a: p.a });
      ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: 3.0, role: p.role });
      for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && dist(p, e) < 3.0 + e.r && angDiff(p.a, angTo(p, e)) < 1.0) { hurtEnemy(G, e, 28, p, {}); e.stun = 1.1; }
      break;
    }
    case 'frost': { // 조준한 곳에 서리를 터뜨려 둘레 상대를 느리게 해요
      const q = aimPoint(p, inp, 12);
      ev(G, 'skill', { id: p.id, s: 'frostfx', x: q.x, z: q.z, a: p.a });
      for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && Math.hypot(e.x - q.x, e.z - q.z) < 3.4 + e.r) { hurtEnemy(G, e, 22, p, {}); if (e.hp > 0) { e.slow = 3; e.slowM = 0.5; e.stun = Math.max(e.stun || 0, 0.6); } }
      break;
    }
    case 'leap': { // 앞으로 크게 뛰어올라 내려앉으며 둘레에 피해
      p.x += Math.cos(p.a) * 7; p.z += Math.sin(p.a) * 7; collide(G, p, 0.6); p.inv = 0.4;
      ev(G, 'skill', { id: p.id, s: 'leapland', x: p.x, z: p.z, a: p.a });
      for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && dist(p, e) < 3.2 + e.r) hurtEnemy(G, e, 36, p, {});
      break;
    }
    case 'bloodlust': p.leech = 5; ev(G, 'skill', { id: p.id, s: 'bloodfx', x: p.x, z: p.z, a: p.a }); break;   // 5초 동안 준 피해의 일부를 체력으로 되찾아요
    case 'flurry': { // 앞으로 파고들며 다섯 번 번갈아 베요
      p.x += Math.cos(p.a) * 2.2; p.z += Math.sin(p.a) * 2.2; collide(G, p, 0.6); ev(G, 'skill', { id: p.id, s: 'flurryfx', x: p.x, z: p.z, a: p.a });
      p.mh = { t: 0.5, tick: 0.05, gap: 0.1, dmg: 9, r: 3.0, arc: 0.9, fx: 'stabfx' }; p.animT = 0.7; break;
    }
    case 'blink': { // 가장 가까운 상대 뒤로 순간이동해 베요
      let best = null, bd = 13;
      for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && dist(p, e) < bd) { bd = dist(p, e); best = e; }
      if (!best) { p.cd[key] = 2; break; }
      const a = angTo(p, best); p.x = best.x + Math.cos(a) * 1.7; p.z = best.z + Math.sin(a) * 1.7; collide(G, p, 0.6); p.a = angTo(p, best); p.inv = 0.4;
      ev(G, 'skill', { id: p.id, s: 'blinkend', x: p.x, z: p.z, a: p.a }); hurtEnemy(G, best, 34, p, {}); break;
    }
    case 'scatter': { // 몸이 뼈로 흩어지며 뒤로 빠지고, 뼛조각 여덟 개가 사방으로 튀어요
      const ox = p.x, oz = p.z; p.x -= Math.cos(p.a) * 6; p.z -= Math.sin(p.a) * 6; collide(G, p, 0.6); p.inv = 0.5;
      for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + p.a; G.projs.push({ id: G.uid++, k: 'arrow', own: p.id, x: ox + Math.cos(a) * 0.8, z: oz + Math.sin(a) * 0.8, vx: Math.cos(a) * 20, vz: Math.sin(a) * 20, dmg: 12, life: 0.45, hit: [], team: 0 }); }
      ev(G, 'skill', { id: p.id, s: 'scatterfx', x: ox, z: oz, a: p.a });
      break;
    }
    case 'fan': for (let k = -2; k <= 2; k++) G.projs.push({ id: G.uid++, k: 'arrow', own: p.id, x: p.x, z: p.z, vx: Math.cos(p.a + k * 0.26) * 28, vz: Math.sin(p.a + k * 0.26) * 28, dmg: 15, life: 0.85, hit: [], team: 0 }); break;
    case 'bonestorm': p.mh = { t: 1.4, tick: 0, gap: 0.35, dmg: 13, r: 3.2, fx: 'stormfx' }; p.animT = 1.5; break;   // 1.4초 동안 몸을 돌리며 둘레를 계속 쳐요
    case 'smite': case 'curse': { // 조준한 곳에 표시가 생기고, 잠시 뒤 터져요 (모두에게 보여서 피할 수 있어요)
      const sm = S.id === 'smite', q = aimPoint(p, inp, 12);
      G.zones.push({ id: G.uid++, k: 'tcircle', x: q.x, z: q.z, r: sm ? 3.2 : 2.6, t: sm ? 1.0 : 0.9, T: sm ? 1.0 : 0.9, dmg: sm ? 42 : 40, fx: S.id, own: p.id, chill: sm ? 0 : 3 });
      break;
    }
  }
  tryCombo(G, p, S.id);
}
function segDist(x1, z1, x2, z2, px, pz) {
  const dx = x2 - x1, dz = z2 - z1, L = dx * dx + dz * dz; let t = L ? ((px - x1) * dx + (pz - z1) * dz) / L : 0; t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + dx * t), pz - (z1 + dz * t));
}
function revive(G, q, frac, by) {
  q.down = false; q.dead = false; q.hp = Math.max(1, Math.round(q.maxhp * frac)); q.inv = 1.5; q.revT = 0;
  ev(G, 'revive', { id: q.id, x: q.x, z: q.z, by: by && by.id });
  if (by && !by.bot) ev(G, 'ach', { id: 'revive', pid: by.id });
}

/* ---------- 한 칸 진행 ---------- */
// inputs[pid] = { mx, mz, aim, ax, az, atk(held), q, e, r, roll, skip (one-shot), f(held), px, pz (원격 이동) }
export function step(G, dt, inputs) {
  G.t += dt; G.phaseT += dt;
  // 가벼운 모드(방장 컴퓨터가 느릴 때): 봇은 두 번에 한 번만 생각하고 그 사이엔 직전 판단을 써요 (봇끼리 번갈아)
  G.tick = (G.tick | 0) + 1;
  for (const p of G.players) if (p.bot) {
    if (G.lite && (G.tick + p.slot) % 2 && p.lastInp) { inputs[p.id] = p.lastInp; continue; }
    inputs[p.id] = p.lastInp = botFace(botThink(G, p, G.lite ? dt * 2 : dt));
  }

  // 이야기 건너뛰기: 사람 모두가 누르면 넘어가요
  if (G.phase === 'intro') {
    for (const p of G.players) if (!p.bot && inputs[p.id] && inputs[p.id].skip) G.skip[p.id] = 1;
    const hum = G.players.filter(p => !p.bot);
    if (G.phaseT > (G.CH.introT || INTRO_T) || (hum.length && hum.every(p => G.skip[p.id]))) { G.phase = 'play'; G.phaseT = 0; G.t0 = G.t; ev(G, 'start', {}); }
    return;
  }
  if (G.phase === 'wipe') { if (G.phaseT > 3) respawnAll(G); return; }
  if (G.phase === 'won' || G.phase === 'over') return;
  if (G.phase === 'bossIntro' && G.phaseT > 3.2) { G.phase = 'play'; G.phaseT = 0; const b = G.enemies.find(e => e.k === 'boss' && e.hp > 0); if (b) { wake(G, b); ev(G, 'roar', {}); } }

  // 플레이어
  if (G.pvp) syncProxies(G, dt);
  for (const p of G.players) stepPlayer(G, p, inputs[p.id] || {}, dt);
  if (G.pvp) { syncProxies(G, 0); pvpCheck(G); }

  // 보스 방에 들어가면 단장이 깨어나요
  if (!G.pvp && !G.bossIntro && !G.bossDead && G.players.some(p => alive(p) && inTrig(p))) { G.bossIntro = true; G.bossT0 = G.t; G.phase = 'bossIntro'; G.phaseT = 0; ev(G, 'bossIntro', {}); }

  // 적: 깨어 있거나 가까운 적만 움직여요
  for (const e of G.enemies) if (e.hp > 0) stepEnemy(G, e, dt);
  G.enemies = G.enemies.filter(e => e.k === 'dummy' || e.hp > 0 || (e.dieT = (e.dieT || 0) + dt) < 1.2);

  stepProjs(G, dt); stepZones(G, dt); stepPuzzles(G, dt); stepFlag(G); stepCuts(G, dt); if (G.esc) stepEsc(G, dt);

  // 바닥 함정: 3초마다 가시가 올라와요. 종자는 밟으면 해체해요
  for (const tr of G.traps) {
    if (!tr.on) continue; tr.t += dt; const up = (tr.t % 3) < 0.8;
    tr.up = up;
    for (const p of G.players) {
      if (!alive(p) || Math.hypot(p.x - tr.x, p.z - tr.z) > 1.1) continue;
      if (p.role === 'squire') { tr.on = false; ev(G, 'disarm', { x: tr.x, z: tr.z }); break; }
      if (up && !(p.trapHit > G.t)) { p.trapHit = G.t + 0.8; hurtPlayer(G, p, 10, null); }
    }
  }
  // 모닥불: 다가가면 불이 붙고, 쓰러지면 마지막으로 붙인 곳에서 다시 시작해요
  G.fires.forEach((f, i) => {
    for (const p of G.players) {
      if (!alive(p)) continue; const d = Math.hypot(p.x - f.x, p.z - f.z);
      // 불 붙이기: F를 꾹 눌러요 (사람이 없을 때만 봇이 대신 붙여요)
      if (d < 3 && !f.lit && (p.bot ? !G.humans : p.f)) { f.prog = (f.prog || 0) + dt; if (f.prog > 1) { f.lit = true; ev(G, 'checkpoint', { i, x: f.x, z: f.z }); ev(G, 'ach', { id: 'rest' }); } }
      if (f.lit && d < 4) healP(G, p, 5 * dt);
    }
    if (f.lit && i > G.cpI) { G.cpI = i; G.cp = { x: f.x, z: f.z + 2.5 }; }
  });

  // 전멸 확인
  if ((G.phase === 'play' || G.phase === 'bossIntro') && G.players.every(p => !alive(p))) {
    // 끝없는 심연은 모두 쓰러지면 거기서 끝나요
    if (G.deep) { G.phase = 'over'; G.phaseT = 0; ev(G, 'over', { floor: G.deep.floor }); }
    else { G.phase = 'wipe'; G.phaseT = 0; ev(G, 'wipe', {}); }
  }
  // 보스가 쓰러지면 바로 장을 깨요
  if (G.bossDead && !G.won && !G.enemies.some(e => e.k === 'boss')) win(G);
}

function inTrig(p) { const [x, y, w, h] = MAP.bossTrig, i = p.x / 2, j = p.z / 2; return i >= x && i < x + w && j >= y && j < y + h; }
function win(G) {
  for (const p of G.players) G.honor[p.id] += 90;
  if (G.flag && G.flag.by) { const c = G.players.find(p => p.id === G.flag.by); if (c && alive(c)) { G.flag.got = 1; ev(G, 'flaggot', { id: c.id }); } }
  // 빠른 보스 사냥: 보스 방에 들어간 뒤 3분 안에 쓰러뜨리기
  if (!G.deep && G.bossT0 != null && G.t - G.bossT0 <= 180) for (const p of G.players) if (!p.bot) ev(G, 'ach', { id: 'escape', pid: p.id });
  G.won = true; G.winT = G.t; G.phase = 'won'; G.phaseT = 0; ev(G, 'won', {});
}
function offerBless(G) {
  for (const p of G.players) {
    const pool = BLESSINGS.filter(b => !hasB(p, b.id)); const pick = [];
    while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(G.rng() * pool.length), 1)[0].id);
    G.bless[p.id] = pick;
  }
}
// 다음 장으로 넘어갈 때 받은 축복을 그대로 가져가요
export function carryOver(G, P) {
  G.players.forEach((p, i) => { const q = P.players[i]; if (!q) return; p.bl = q.bl.slice(); if (hasB(p, 'armor')) { p.maxhp += 25; p.hp = p.maxhp; } });
}
export function chooseBless(G, pid, bid) {
  const opts = G.bless[pid]; if (!opts || opts.indexOf(bid) < 0) return;
  const p = G.players.find(q => q.id === pid); if (!p) return;
  p.bl.push(bid); G.bless[pid] = null;
  if (bid === 'armor') { p.maxhp += 25; p.hp += 25; }
  ev(G, 'bless', { id: pid, b: bid });
}
// 전멸: 마지막 모닥불에서 다시 시작해요. 깨어난 적은 제자리로 돌아가 다시 잠들어요
function respawnAll(G) {
  for (const p of G.players) { p.down = false; p.dead = false; p.respT = 0; p.hp = Math.round(p.maxhp * 0.7); p.shield = 0; p.block = p.taunt = p.rally = 0; }
  placeAt(G, G.cp);
  G.enemies = G.enemies.filter(e => !e.summoned && e.hp > 0);
  for (const e of G.enemies) resetEnemy(e);
  G.projs = []; G.zones = [];
  if (!G.bossDead) G.bossIntro = false;
  if (G.esc) escReset(G);
  G.phase = 'play'; G.phaseT = 0; ev(G, 'restart', {});
}
function resetEnemy(e) {
  e.keepHp = e.hp; e.x = e.hx; e.z = e.hz; e.hp = e.maxhp; e.st = 'sleep'; e.vx = e.vz = 0; e.burn = e.mark = e.stun = e.root = e.slow = 0; e.tauntT = 0; e.charging = false;
  // 보스는 깎아 둔 체력과 단계를 그대로 두고 조금만 회복해요
  if (e.k === 'boss') { e.hp = Math.min(e.maxhp, e.keepHp + e.maxhp * 0.05); e.atk = null; e.summonT = 10; e.fireT = 5; e.cdT = 0; e.a = Math.PI / 2; }
}

// 자기 표적은 자기 공격에 맞지 않게, 내 차례 동안만 꺼 둬요
function stepPlayer(G, p, inp, dt) {
  if (p.stun > 0) { p.stun -= dt; inp = {}; }   // 기절하면 잠깐 아무것도 못 해요
  if (p.px) p.px.hp = 0;
  stepPlayer0(G, p, inp, dt);
  if (G.pvp && alive(p) && G.phase === 'play') {
    p.noHit = (p.noHit || 0) + dt;
    if (p.noHit > 4 && p.hp < p.maxhp) p.hp = Math.min(p.maxhp, p.hp + p.maxhp * 0.02 * dt);   // 맞지 않고 4초가 지나면 체력이 저절로 차올라요
    if (p.leech > 0) p.leech = Math.max(0, p.leech - dt);
    if (p.mh) { // 여러 번 이어서 치는 기술: 틱마다 둘레(또는 앞쪽)를 쳐요
      const m = p.mh; m.t -= dt; m.tick -= dt;
      if (m.tick <= 0) { m.tick = m.gap; ev(G, 'skill', { id: p.id, s: m.fx, x: p.x, z: p.z, a: p.a, n: m.n = (m.n || 0) + 1 }); for (const e of G.enemies) if (e.hp > 0 && e.pid !== p.id && dist(p, e) < m.r + e.r && (!m.arc || angDiff(p.a, angTo(p, e)) < m.arc)) hurtEnemy(G, e, m.dmg, p, {}); }
      if (m.t <= 0) p.mh = null;
    }
  }
  if (p.px) p.px.hp = alive(p) ? 1 : 0;
}
function stepPlayer0(G, p, inp, dt) {
  for (const k in p.cd) if (p.cd[k] > 0) p.cd[k] -= dt;
  ['block', 'taunt', 'rally', 'inv', 'hitT', 'animT', 'rollCd', 'focus', 'pdCd', 'chill', 'slow'].forEach(k => { if (p[k] > 0) p[k] = Math.max(0, p[k] - dt); });
  if (p.comboT > 0) { p.comboT -= dt; if (p.comboT <= 0) p.combo = 0; }
  if (p.ai && p.ai.cmbT > 0) p.ai.cmbT -= dt;
  if (p.hvT > 0) { p.hvT -= dt; if (p.hvT <= 0) { p.hvT = 0; if (!p.down && !p.dead) heavyLand(G, p); } }
  if (p.pbT > 0) { p.pbT -= dt; if (p.pbT <= 0) { p.pbT = 0; if (!p.down && !p.dead) priestBlast(G, p); } }
  if (p.raiseT > 0) { p.raiseT -= dt; if (p.down || p.dead) p.raiseT = 0; else if (p.raiseT <= 0) { p.raiseT = 0; for (const q of G.players) if (q.down && !q.dead && dist(p, q) < 6) revive(G, q, 0.25, p); } }
  if (p.shieldT > 0) { p.shieldT -= dt; if (p.shieldT <= 0) p.shield = 0; }
  if (p.dead) {
    // 완전히 쓰러지면 12초 뒤 마지막 모닥불에서 다시 일어나요
    p.respT -= dt;
    if (p.respT <= 0 && G.phase !== 'wipe' && G.players.some(alive)) { p.dead = false; p.down = false; p.hp = Math.round(p.maxhp * 0.5); p.inv = 2; p.x = G.cp.x; p.z = G.cp.z; mapCollide(p, 0.6); ev(G, 'respawn', { id: p.id, x: p.x, z: p.z }); }
    return;
  }
  if (p.down) {
    p.bleed -= dt; if (p.bleed <= 0) { p.dead = true; p.respT = 12; ev(G, 'dead', { id: p.id }); }
    // 일으키기: 근처 동료가 F를 누르고 있으면
    let helper = null;
    for (const q of G.players) if (q !== p && alive(q) && (inputs_f(q)) && dist(p, q) < 1.9) helper = q;
    if (helper) { p.revT += dt * (hasB(helper, 'bond') ? 2 : 1); helper.reviving = p.id; if (p.revT >= 1.6) revive(G, p, 0.5, helper); }
    else p.revT = Math.max(0, p.revT - dt * 0.5);
    return;
  }
  p.reviving = null;
  if (p.burn > 0) { p.burn -= dt; if ((p.burnT = (p.burnT || 0) - dt) <= 0) { p.burnT = 0.5; if (p.roll <= 0) hurtPlayer(G, p, 3, null); } }
  const R = ROLES[p.role];
  let sp = R.speed * (hasB(p, 'feet') ? 1.12 : 1) * (p.rally > 0 ? 1.3 : 1) * (p.block > 0 ? 0.8 : 1) * (hasFlag(G, p) ? 0.7 : 1) * (p.chill > 0 ? 0.6 : 1) * (p.emb ? 0.75 : 1) * (p.slow > 0 ? (p.slowM || 0.5) : 1);
  const fl = hasFlag(G, p);
  if (inp.aim != null && isFinite(inp.aim)) p.a = inp.aim;
  const ox = p.x, oz = p.z;
  if (inp.px != null && isFinite(inp.px)) {
    // 원격 플레이어: 자기 화면에서 움직인 위치를 믿되, 너무 멀리 뛰면 막아요
    const d = Math.hypot(inp.px - p.x, inp.pz - p.z), maxd = 22 * dt + 1.2;
    if (d <= maxd) { p.x = inp.px; p.z = inp.pz; } else { p.x += (inp.px - p.x) / d * maxd; p.z += (inp.pz - p.z) / d * maxd; }
    collide(G, p, 0.6);
    if (inp.roll && !fl && p.rollCd <= 0) { p.roll = 0.35; p.rollCd = 1.2 * (hasB(p, 'roll') ? 0.6 : 1); p.tkHit = {}; ev(G, 'roll', { id: p.id }); }
    if (p.roll > 0) p.roll -= dt;
  } else {
    let mx = inp.mx || 0, mz = inp.mz || 0; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    if (inp.roll && !fl && p.rollCd <= 0 && p.roll <= 0 && !(p.hvT > 0)) {
      p.roll = 0.35; p.rollCd = 1.2 * (hasB(p, 'roll') ? 0.6 : 1);
      const ra = ml > 0.1 ? Math.atan2(mz, mx) : p.a; p.rdx = Math.cos(ra); p.rdz = Math.sin(ra); p.tkHit = {}; ev(G, 'roll', { id: p.id });
    }
    if (p.hvT > 0 || p.pbT > 0) { /* 강타 공중·사제 빛 모으기: 제자리 */ }
    else if (p.roll > 0) { p.roll -= dt; p.x += p.rdx * 15 * dt; p.z += p.rdz * 15 * dt; }
    else { p.x += mx * sp * dt; p.z += mz * sp * dt; }
    p.moving = ml > 0.1;
    collide(G, p, 0.6);
  }
  // 승강기 발판: 발판이 오르내리는 동안은 타고 내릴 수 없어요
  if (!liftOk(ox, oz, p.x, p.z)) { p.x = ox; p.z = oz; }
  p.f = !!inp.f; const fe = p.f && !p.fPrev; p.fPrev = p.f;
  // 종자: 구르기 대신 미끄러지며 다리를 걸어요. 닿은 적은 넘어져 잠깐 기절해요
  if (p.role === 'squire' && p.roll > 0 && p.tkHit) for (const e of G.enemies) {
    if (e.hp <= 0 || e.st === 'rise' || p.tkHit[e.id] || Math.hypot(e.x - p.x, e.z - p.z) > 1.5 + e.r) continue;
    p.tkHit[e.id] = 1; hurtEnemy(G, e, 14, p, { basic: 1 }); if (e.hp > 0) { e.stun = Math.max(e.stun || 0, e.k === 'boss' ? 0.25 : 0.9); ev(G, 'trip', { id: e.id, x: e.x, z: e.z }); }
  }
  if (p.roll > 0) return;
  if (G.phase !== 'play' && G.phase !== 'bossIntro') return;
  // 궁수 모아 쏘기: 꾹 누르고 있다가 놓으면 쏴요 (0.8초 두 발, 2초 세 발). 봇은 바로바로 쏴요
  if (fl) { p.chg = 0; p.qShot = 0; }
  else if (p.role === 'archer' && !p.bot) {
    if (inp.atk && p.block <= 0) { const c0 = p.chg || 0; p.chg = c0 + dt; for (const T of CHG_T) if (c0 < T && p.chg >= T) ev(G, 'charge', { id: p.id, n: T === CHG_T[0] ? 2 : 3, x: p.x, z: p.z }); }
    else if (p.chg > 0) { p.qShot = p.chg >= CHG_T[1] ? 3 : p.chg >= CHG_T[0] ? 2 : 1; p.qT = 0.4; p.chg = 0; }
    if (p.qShot && p.cd.atk <= 0) { basicAttack(G, p, inp, p.qShot); p.qShot = 0; }
    if (p.qShot && (p.qT -= dt) <= 0) p.qShot = 0;
  } else if (inp.atk && p.cd.atk <= 0 && p.block <= 0) basicAttack(G, p, inp);
  // 횃불을 든 동안은 기술을 못 써요 (기본 공격은 돼요)
  if (!p.torch && !fl) { if (inp.q) useSkill(G, p, 0, inp); if (inp.e) useSkill(G, p, 1, inp); if (inp.r) useSkill(G, p, 2, inp); }
  if (!inp.f) p.flNo = false;
  if (fe && fl) { dropFlag(G, p); p.flNo = true; }
  else if (fe) interact(G, p);
  // 기사단 깃발: F를 꾹 눌러 들어요
  const F = G.flag;
  if (F && !F.by && !p.bot && inp.f && !p.flNo && !p.torch && flagShown(G.secrets.map(q => q.open), G.puz.map(q => q.done)) && Math.hypot(p.x - F.x, p.z - F.z) < 2.2) {
    F.prog += dt; F.pT = G.t; if (F.prog >= FLAG_T) { F.by = p.id; F.prog = 0; ev(G, 'flag', { id: p.id, on: 1, x: F.x, z: F.z }); }
  }
  // 상자와 제단: F를 꾹 눌러요
  for (const ch of G.chests) {
    if (ch.open || !inp.f || Math.hypot(p.x - ch.x, p.z - ch.z) > 2.2) continue;
    ch.prog += dt; if (ch.prog > 1.2 && ch.mim) { ch.open = true; const e = spawnEnemy(G, 'mimic', ch.x, ch.z, true); e.st = 'idle'; e.cd = 0.5; e.tgt = p.id; e.a = angTo(e, p); ev(G, 'mimic', { x: ch.x, z: ch.z, id: e.id }); continue; }
    if (ch.prog > 1.2) { ch.open = true; const h = ch.sec ? 60 : 25; for (const q of G.players) G.honor[q.id] += h; ev(G, 'chest', { x: ch.x, z: ch.z, h }); }
  }
  // 옛 기록 돌: F를 꾹 눌러 읽어요
  G.lores.forEach((lo, k) => {
    const L = MAP.lores[k]; if (lo.read || !inp.f || !G.secrets[L[2]].open || Math.hypot(p.x - cw(L[0]), p.z - cw(L[1])) > 2.4) return;
    lo.prog += dt; if (lo.prog > 0.8) { lo.read = true; ev(G, 'lore', { li: k, x: cw(L[0]), z: cw(L[1]) }); }
  });
  // 갈림길 비석: 한 번 고르면 다른 길은 닫혀요
  if (G.fork && G.fork.pick < 0) {
    const F = MAP.fork;
    [F.a, F.b].forEach((q, k) => {
      if (!inp.f || Math.hypot(p.x - cw(q[0]), p.z - cw(q[1])) > 2.4) return;
      G.fork.prog[k] += dt; if (G.fork.prog[k] > 1.2) {
        G.fork.pick = k;
        const e = spawnEnemy(G, 'elite', cw(F.c[0]), cw(F.c[1]), false); e.mb = k + 1; e.hp = e.maxhp = Math.round(e.maxhp * 3.2); e.dm = e.dm * (k ? 1 : 1.25); e.r = e.r * 1.25; e.sumT = 5;
        ev(G, 'fork', { x: cw(F.c[0]), z: cw(F.c[1]), k });
      }
    });
  }
  for (const al of G.altars) {
    if (al.used || !inp.f || Math.hypot(p.x - al.x, p.z - al.z) > 2.4) continue;
    al.prog += dt; if (al.prog > 1) { al.used = true; for (const q of G.players) G.honor[q.id] += 10; offerBless(G); ev(G, 'altar', { x: al.x, z: al.z }); }
  }
}
function inputs_f(q) { return q.f; }
export const FLAG_T = 1.5;
function dropFlag(G, p) {
  const F = G.flag; F.by = 0; F.prog = 0; F.x = p.x; F.z = p.z;
  if (isWall(F.x, F.z)) { F.x = F.hx; F.z = F.hz; }
  ev(G, 'flag', { id: p.id, on: 0, x: F.x, z: F.z });
}
// 든 사람이 쓰러지면 그 자리에 떨어져요. 시간 제한은 없어요
function stepFlag(G) {
  const F = G.flag; if (!F) return;
  if (!F.by) { if (F.prog > 0 && G.t - F.pT > 0.12) F.prog = 0; return; }
  const c = G.players.find(p => p.id === F.by);
  if (!c) { F.by = 0; F.x = F.hx; F.z = F.hz; ev(G, 'flag', { on: 0, x: F.x, z: F.z }); return; }
  if (!alive(c)) dropFlag(G, c);
}

/* ---------- 수수께끼 방, 어둠의 방, 무너지는 성 ---------- */
const itemPos = (q, i) => ({ x: cw(q.items[i][0]), z: cw(q.items[i][1]) });
// 석상이 가운데를 바라보는 방향 번호 (0 = 아래, 1 = 왼쪽, 2 = 위, 3 = 오른쪽: 위·오른쪽·아래·왼쪽에 놓인 석상 차례로)
const STAT_OK = [0, 1, 2, 3], CRYS_T = 8;
// 얼음 문양을 한 번에 다 밟는 길 (봇이 따라가요)
const SIG_PATH = [0, 1, 2, 5, 4, 3, 6, 7, 8];
function torchOf(G, k) { return G.players.filter(p => p.torch === k + 1); }
// F를 한 번 누르면: 횃불 들기·내려놓기, 화로 불 붙이기, 석상 돌리기
function interact(G, p) {
  for (let k = 0; k < MAP.darks.length; k++) {
    const D = MAP.darks[k], sx = cw(D.stand[0]), sz = cw(D.stand[1]); if (Math.hypot(p.x - sx, p.z - sz) > 2.6) continue;
    if (p.torch === k + 1) { p.torch = 0; ev(G, 'torch', { id: p.id, on: 0 }); return; }
    if (!p.torch && torchOf(G, k).length < 2) { p.torch = k + 1; ev(G, 'torch', { id: p.id, on: 1 }); if (!p.bot) ev(G, 'ach', { id: 'torch', pid: p.id }); return; }
  }
  MAP.puzzles.forEach((q, k) => {
    const P = G.puz[k]; if (P.done || areaAt(p.x, p.z) !== q.area) return;
    for (let i = 0; i < q.items.length; i++) {
      const o = itemPos(q, i); if (Math.hypot(p.x - o.x, p.z - o.z) > 2.4) continue;
      if (!p.bot) P.idle = 0;
      if (q.k === 'braziers') lightBrazier(G, k, i, p);
      else if (q.k === 'levers') { for (const j of [i - 1, i, i + 1]) if (j >= 0 && j < 4) P.lit[j] = 1 - P.lit[j]; ev(G, 'plever', { pk: k, i, x: o.x, z: o.z }); if (P.lit.every(v => v)) solvePuz(G, k); }
      else if (q.k === 'mirrors') { P.rot[i] = (P.rot[i] + 1) % 4; ev(G, 'prot', { pk: k, i, x: o.x, z: o.z }); if (P.rot.slice(0, 3).every(r => r === 0)) solvePuz(G, k); }
      else if (q.k === 'embers') {
        if (i === 0 && !p.emb) { p.emb = 1; ev(G, 'emb', { id: p.id, on: 1, x: o.x, z: o.z }); }
        else if (i > 0 && p.emb && !P.lit[i]) { p.emb = 0; P.lit[i] = 1; ev(G, 'emb', { id: p.id, on: 0 }); ev(G, 'plit', { pk: k, i, x: o.x, z: o.z }); if (P.lit.slice(1).every(v => v)) solvePuz(G, k); }
        else continue;
      }
      else if (q.k === 'statues') { P.rot[i] = (P.rot[i] + 1) % 4; if (!p.bot) P.idle = 0; ev(G, 'prot', { pk: k, i, x: o.x, z: o.z }); if (P.rot.every((r, j) => r === STAT_OK[j])) solvePuz(G, k); }
      return;
    }
  });
}
// 공격이나 화살·구슬이 화로에 닿아도 불이 붙어요
// src: 'melee' (근접 공격), 'heavy' (강타), 'potion', 또는 투사체 종류 ('arrow', 'pierce', 'orb' ...)
function hitPuzzle(G, x, z, r, p, pw = 1, src = '') {
  let hit = false;
  // 역할 전용 수수께끼: 과녁은 궁수 화살로만, 성수반은 사제 빛 구슬로만, 가시덩굴은 종자 횃불 공격으로만
  MAP.puzzles.forEach((q, k) => {
    const P = G.puz[k]; if (P.done) return;
    const ok = q.k === 'targets' ? (src === 'arrow' || src === 'pierce') : q.k === 'basins' ? src === 'orb' : q.k === 'vines' ? src === 'melee' && p && p.role === 'squire'
      : q.k === 'crystals' ? !!src : q.k === 'icecrys' ? src === 'heavy' : q.k === 'lanterns' ? src === 'pierce' : q.k === 'blackfire' ? src === 'potion' : false; if (!ok) return;
    q.items.forEach((_, i) => {
      const o = itemPos(q, i), oz = q.k === 'targets' ? o.z - 0.6 : o.z, rr = q.k === 'targets' ? 1.1 : q.k === 'basins' ? 1.2 : 1.5;
      if (Math.hypot(o.x - x, oz - z) > r + rr) return; if (q.k !== 'lanterns') hit = true;
      if (q.k === 'crystals') { if (!P.lit[i]) ev(G, 'plit', { pk: k, i, x: o.x, z: o.z, k: q.k }); P.lit[i] = 1; P.ct[i] = CRYS_T; if (p && !p.bot) P.idle = 0; if (P.lit.every(v => v)) solvePuz(G, k); return; }
      if (P.lit[i]) return;
      P.lit[i] = 1; if (p && !p.bot) P.idle = 0; if (q.k === 'targets' && !(P.tT > 0)) P.tT = 10; if (q.k === 'lanterns' && !(P.tT > 0)) P.tT = 1.2;
      ev(G, q.k === 'vines' ? 'pburn' : q.k === 'icecrys' ? 'pshatter' : q.k === 'blackfire' ? 'pdouse' : 'plit', { pk: k, i, x: o.x, z: oz, k: q.k });
      if (q.items.every((_, j) => P.lit[j])) solvePuz(G, k);
    });
  });
  // 금 간 기둥: 보통 공격은 여섯 번 맞히면, 강타·큰 공격·관통 화살은 한 번에 쓰러져요
  G.pits.forEach((P, k) => {
    if (P.down) return; const o = pillarAt(k); if (Math.hypot(o.x - x, o.z - z) > r + 1.3) return;
    hit = true; P.hits += pw; if (p && !p.bot) P.idle = 0;
    if (P.hits >= PIT_HITS) fellPillar(G, k, p); else ev(G, 'pcrack', { pk: k, x: o.x, z: o.z, n: P.hits });
  });
  // 금 간 벽: 누구든 보통 공격을 여섯 번 맞히면 무너져요 (강타·큰 공격·관통 화살은 한 번에)
  if (p) G.secrets.forEach((q, k) => {
    if (q.open) return; const f = secretFace(k); if (Math.hypot(f.x - x, f.z - z) > r + 1.4) return;
    hit = true; q.hits = (q.hits || 0) + pw; if (q.hits >= PIT_HITS) openWall(G, k, p); else ev(G, 'pcrack', { x: f.x, z: f.z, n: q.hits });
  });
  MAP.puzzles.forEach((q, k) => {
    const P = G.puz[k]; if (P.done || q.k !== 'braziers') return;
    for (let i = 0; i < 4; i++) { const o = itemPos(q, i); if (Math.hypot(o.x - x, o.z - z) < r + 0.8) { hit = true; if (!P.lit[i]) lightBrazier(G, k, i, p); } }
  });
  return hit;
}
// 기술로 푸는 역할 수수께끼: 기사 막기(방패 석판 위), 사제 치유(성수반 가까이)
function rolePuz(G, p, kind, r) {
  MAP.puzzles.forEach((q, k) => {
    const P = G.puz[k]; if (P.done || q.k !== kind) return;
    q.items.forEach((_, i) => { const o = itemPos(q, i); if (P.lit[i] || Math.hypot(o.x - p.x, o.z - p.z) > r) return; P.lit[i] = 1; if (!p.bot) P.idle = 0; ev(G, 'plit', { pk: k, i, x: o.x, z: o.z, k: kind }); });
    if (q.items.every((_, j) => P.lit[j])) solvePuz(G, k);
  });
}
function lightBrazier(G, k, i, p) {
  const q = MAP.puzzles[k], P = G.puz[k], o = itemPos(q, i); if (P.lit[i]) return;
  if (q.order[P.n] === i) { P.lit[i] = 1; P.n++; if (p && !p.bot) P.idle = 0; ev(G, 'plit', { pk: k, i, x: o.x, z: o.z }); if (P.n >= 4) solvePuz(G, k); }
  else { P.lit = [0, 0, 0, 0]; P.n = 0; ev(G, 'pwrong', { pk: k, x: o.x, z: o.z }); }
}
function solvePuz(G, k) {
  const q = MAP.puzzles[k], P = G.puz[k]; if (P.done) return; P.done = true; openGate(k);
  const [x, y, w, h] = q.gate; for (const o of G.players) G.honor[o.id] += 30;
  ev(G, 'psolve', { pk: k, x: (x + w / 2) * 2, z: (y + h / 2) * 2 });
  for (const o of G.players) if (!o.bot) ev(G, 'ach', { id: 'puzzle', pid: o.id });
}
function stepPuzzles(G, dt) {
  MAP.puzzles.forEach((q, k) => {
    const P = G.puz[k]; if (P.done) return;
    const inRoom = G.players.filter(p => alive(p) && areaAt(p.x, p.z) === q.area);
    if (q.k === 'plates') {
      // 발판: 살아 있는 동료 수만큼(최대 넷) 동시에 올라서면 열려요
      const live = G.players.filter(alive).length, need = Math.min(4, Math.max(1, live));
      P.occ = [0, 1, 2, 3].map(i => { const o = itemPos(q, i); return G.players.some(p => alive(p) && Math.hypot(p.x - o.x, p.z - o.z) < 1.3) ? 1 : 0; });
      const n = P.occ.reduce((a, b) => a + b, 0);
      if (n >= need) { P.hold += dt; if (P.hold > 0.8) solvePuz(G, k); } else P.hold = 0;
    } else if (inRoom.length && (inRoom.some(p => !p.bot) || !G.humans)) {
      // 화로·석상·역할 수수께끼: 한동안 못 풀면 봇 동료가 천천히 도와줘요
      P.idle += dt; if (G.humans && P.idle > PUZ_HELP && !P.help && puzHelper(G, q)) { P.help = true; ev(G, 'phelp', { pk: k }); }
    }
    // 과녁: 첫 과녁을 맞힌 뒤 10초 안에 셋 다 맞히지 못하면 다시 처음부터 (일렬 등불은 1.2초: 한 발로 꿰뚫어야 해요)
    if ((q.k === 'targets' || q.k === 'lanterns') && P.tT > 0 && (P.tT -= dt) <= 0) { P.lit = q.items.map(() => 0); ev(G, 'ptime', { pk: k }); }
    // 빛 수정: 켜진 빛은 8초 뒤 꺼져요
    if (q.k === 'crystals') P.ct.forEach((t, i) => { if (t > 0 && (P.ct[i] = t - dt) <= 0) { P.lit[i] = 0; const o = itemPos(q, i); ev(G, 'pout', { pk: k, i, x: o.x, z: o.z }); } });
    // 기도의 원: 사제가 원 안에 2초 서 있으면 켜져요
    if (q.k === 'vigil') q.items.forEach((_, i) => {
      if (P.lit[i]) return; const o = itemPos(q, i), pr = G.players.find(p => alive(p) && p.role === 'priest' && Math.hypot(p.x - o.x, p.z - o.z) < 1.5);
      if (!pr) return; if (!pr.bot) P.idle = 0; P.pg[i] = Math.min(1, P.pg[i] + dt / 2);
      if (P.pg[i] >= 1) { P.lit[i] = 1; ev(G, 'plit', { pk: k, i, x: o.x, z: o.z, k: q.k }); if (P.lit.every(v => v)) solvePuz(G, k); }
    });
    // 얼음 문양: 지난 칸 옆 칸을 밟으면 켜지고, 이미 켜진 칸(지난 칸 말고)을 밟으면 모두 꺼져요. 봇은 돕는 봇만 밟아요
    if (q.k === 'sigils') for (const p of G.players) {
      if (!alive(p) || (p.bot && !(P.help || !G.humans) || p.bot && puzHelper(G, q) !== p)) continue;
      const i = q.items.findIndex(([ix, iy]) => Math.abs(p.x - cw(ix)) < 2 && Math.abs(p.z - cw(iy)) < 2), was = P.on[p.id]; P.on[p.id] = i;
      if (i < 0 || i === was) continue; const o = itemPos(q, i); if (!p.bot) P.idle = 0;
      if (P.lit[i]) { if (i !== P.head) { P.lit = q.items.map(() => 0); P.head = -1; ev(G, 'pwrong', { pk: k, x: o.x, z: o.z }); } continue; }
      const h = P.head, adj = h < 0 || Math.abs((h % 3) - (i % 3)) + Math.abs(Math.floor(h / 3) - Math.floor(i / 3)) === 1; if (!adj) continue;
      P.lit[i] = 1; P.head = i; ev(G, 'plit', { pk: k, i, x: o.x, z: o.z, k: q.k }); if (P.lit.every(v => v)) solvePuz(G, k);
    }
  });
  // 횃불: 어둠의 방에서 멀리 나가면 횃불은 걸이로 돌아가요. 사람이 아무도 안 들면 봇이 들어요
  MAP.darks.forEach((D, k) => {
    const [x, y, w, h] = D.room, cx = (x + w / 2) * 2, cz = (y + h / 2) * 2, far = p => Math.abs(p.x - cx) > w + 8 || Math.abs(p.z - cz) > h + 8;
    for (const p of torchOf(G, k)) if (p.dead || far(p)) { p.torch = 0; ev(G, 'torch', { id: p.id, on: 0 }); }
    const there = G.players.some(p => alive(p) && areaAt(p.x, p.z) === D.area), Dk = G.darks[k];
    if (!there || torchOf(G, k).length) { Dk.t = 0; return; }
    Dk.t += dt; if (Dk.t < (G.humans ? 5 : 0.5)) return;
    const b = ['priest', 'squire', 'archer', 'knight'].map(r => G.players.find(p => p.bot && p.role === r && alive(p) && !p.torch && !far(p))).find(Boolean);
    if (b) { b.torch = k + 1; ev(G, 'torch', { id: b.id, on: 1 }); Dk.t = 0; }
  });
}
export const PIT_HITS = 6, LIFT_T = 3.5;
function fellPillar(G, k, p) {
  const P = G.pits[k]; if (P.down) return; P.down = true; dropPillar(k);
  const o = pillarAt(k); for (const q of G.players) G.honor[q.id] += 20;
  ev(G, 'pfall', { pk: k, x: o.x, z: o.z });
  if (p && !p.bot) ev(G, 'ach', { id: 'bridge', pid: p.id });
}
// 승강기에서 어느 쪽에 있는지: 0 아래층, 1 위층, 2 발판 위
function liftSide(q, p) {
  const i = Math.floor(p.x / 2), j = Math.floor(p.z / 2), [px, py, pw, ph] = q.plat;
  if (i >= px && i < px + pw && j >= py && j < py + ph) return 2;
  const a = areaAt(p.x, p.z); if (a >= 0 && a !== q.area) return a < q.area ? 0 : 1;
  const [bx, by, bw, bh] = q.band;
  return q.ax === 'h' ? (j < by ? 1 : 0) : (q.far > 0 ? (i > bx + 1 ? 1 : 0) : (i < bx + 1 ? 1 : 0));
}
function stepCuts(G, dt) {
  // 끊어진 길: 오래 못 쓰러뜨리면 봇 동료가 기둥을 쳐요
  MAP.pits.forEach((q, k) => {
    const P = G.pits[k]; if (P.down) return;
    const inRoom = G.players.filter(p => alive(p) && areaAt(p.x, p.z) === q.area);
    if (inRoom.length && (inRoom.some(p => !p.bot) || !G.humans)) { P.idle += dt; if (G.humans && P.idle > 20 && !P.help) { P.help = true; ev(G, 'phelp', { pk: -1 }); } }
  });
  // 승강기: 손잡이를 꾹 누르고 있는 동안 움직여요. 끝에 닿으면 손을 뗐다가 다시 눌러야 반대로 가요
  MAP.lifts.forEach((q, k) => {
    const L = G.lifts[k], ps = G.players.filter(alive), side = ps.map(p => liftSide(q, p)), onP = side.filter(v => v === 2).length;
    const cb = { x: cw(q.cb[0]), z: cw(q.cb[1]) }, ct = { x: cw(q.ct[0]), z: cw(q.ct[1]) };
    const hold = ps.filter((p, n) => p.f && side[n] !== 2 && (Math.hypot(p.x - cb.x, p.z - cb.z) < 2.2 || Math.hypot(p.x - ct.x, p.z - ct.z) < 2.2));
    const h0 = L.h;
    if (!L.done && ps.length && side.every(v => v === 1)) { L.done = true; for (const p of G.players) G.honor[p.id] += 20; ev(G, 'lifted', {}); for (const p of G.players) if (!p.bot) ev(G, 'ach', { id: 'lift', pid: p.id }); }
    if (L.done) {
      // 모두 한 번 올라간 뒤에는 혼자서도 탈 수 있게 저절로 움직여요 (다시 일어난 동료가 갇히지 않게)
      const tgt = onP ? 1 : 0; L.h = tgt > L.h ? Math.min(1, L.h + dt / LIFT_T) : Math.max(0, L.h - dt / LIFT_T);
    } else if (!hold.length) {
      // 손잡이를 놓으면 중간에 멈추지 않고 천천히 아래로 내려가요 (발판 위에 갇히지 않게)
      L.lock = false;
      if (L.h > 0 && L.h < 1) { L.h = Math.max(0, L.h - dt / (LIFT_T * 1.5)); if (L.h <= 0) L.dir = 1; }
    }
    else if (!L.lock) {
      L.h = clamp(L.h + L.dir * dt / LIFT_T, 0, 1);
      if (L.h >= 1 && L.dir > 0) { L.dir = -1; L.lock = true; ev(G, 'lstop', { x: cw(q.plat[0] + 1), z: cw(q.plat[1] + 1), up: 1 }); }
      else if (L.h <= 0 && L.dir < 0) { L.dir = 1; L.lock = true; ev(G, 'lstop', { x: cw(q.plat[0] + 1), z: cw(q.plat[1] + 1), up: 0 }); }
    }
    if (L.done) L.dir = L.h >= 1 ? -1 : L.h <= 0 ? 1 : L.dir;
    L.mv = L.h !== h0 ? 1 : 0; LIFTH[k] = L.h;
  });
}
// 봇: 끊어진 길에서는 기둥을 치고, 승강기에서는 손잡이를 돌리거나 발판에 타요
function botCut(G, p, inp, leader) {
  const me = areaAt(p.x, p.z), la = leader ? areaAt(leader.x, leader.z) : -1;
  for (let k = 0; k < MAP.pits.length; k++) {
    const q = MAP.pits[k], P = G.pits[k]; if (P.down || (me !== q.area && la !== q.area)) continue;
    if (P.idle < (G.humans ? 20 : 1.5)) return false;
    const helper = G.players.filter(o => o.bot && alive(o)).sort((a, b) => (ROLES[a.role].atk.kind === 'melee' ? 0 : 1) - (ROLES[b.role].atk.kind === 'melee' ? 0 : 1) || a.slot - b.slot)[0];
    if (helper !== p) return false;
    const o = pillarAt(k), a = Math.atan2(o.z - p.z, o.x - p.x);
    if (!moveTo(G, p, inp, o.x, o.z, ROLES[p.role].atk.kind === 'melee' ? 2.2 : 7)) { inp.aim = a; inp.atk = true; }
    return true;
  }
  for (let k = 0; k < MAP.lifts.length; k++) {
    const q = MAP.lifts[k], L = G.lifts[k]; if (L.done || (me !== q.area && la !== q.area)) continue;
    const ps = G.players.filter(alive), sd = o => liftSide(q, o), my = sd(p);
    const low = ps.filter(o => sd(o) === 0), onP = ps.filter(o => sd(o) === 2), up = ps.filter(o => sd(o) === 1);
    const cb = { x: cw(q.cb[0]), z: cw(q.cb[1]) }, ct = { x: cw(q.ct[0]), z: cw(q.ct[1]) }, [px, py] = q.plat, pc = { x: cw(px + 1), z: cw(py + 1) };
    const slotOff = o => ({ x: pc.x + ((o.slot % 2) - 0.5) * 1.6, z: pc.z + ((o.slot >> 1) - 0.5) * 1.6 });
    const crank = (c, want) => { if (!moveTo(G, p, inp, c.x, c.z, 1.2)) inp.f = !L.lock && want !== 0 && L.dir === want; return true; };
    if (my === 1) {
      const helper = up.filter(o => o.bot).sort((a, b) => a.slot - b.slot)[0];
      if (helper !== p) { moveTo(G, p, inp, ct.x + (p.slot - 1.5) * 1.5, ct.z + (q.ax === 'h' ? -2 : 0), 1.2); return true; }
      if (up.some(o => !o.bot && o.f && Math.hypot(o.x - ct.x, o.z - ct.z) < 2.2)) return true;
      // 끝 가까이 왔으면 끝까지 마저 돌려요 (중간에 멈추면 아무도 못 타요)
      const want = L.h > 0 && L.h < 0.1 && L.dir < 0 ? -1 : L.h > 0.9 && L.h < 1 && L.dir > 0 ? 1 : onP.length && (L.h > 0 || !low.length) ? 1 : !onP.length && low.length && L.h > 0 ? -1 : 0;
      return crank(ct, want);
    }
    // 아래층: 위에 아무도 없으면 봇 하나가 아래 손잡이를 돌리고 나머지는 발판에 타요
    const humanAtB = ps.some(o => !o.bot && Math.hypot(o.x - cb.x, o.z - cb.z) < 2.4);
    const crankBot = !up.length && !humanAtB ? low.concat(onP).filter(o => o.bot).sort((a, b) => b.slot - a.slot)[0] : null;
    if (crankBot === p) { const others = low.filter(o => o !== p).length; return crank(cb, !others && onP.length ? 1 : 0); }
    if (my === 2) { if (L.h >= 0.97) { const d = q.ax === 'h' ? { x: 0, z: -7 } : { x: 7 * q.far, z: 0 }; moveTo(G, p, inp, pc.x + d.x, pc.z + d.z, 1); } else { const o = slotOff(p); moveTo(G, p, inp, o.x, o.z, 0.4); } return true; }
    if (L.h <= 0.03) { const o = slotOff(p); moveTo(G, p, inp, o.x, o.z, 0.4); } else moveTo(G, p, inp, cb.x, cb.z, 2.5);
    return true;
  }
  return false;
}
export const ESC_T = 45;
function startEsc(G) {
  const [x, y, w, h] = MAP.areas[G.bossArea].r[0];
  G.esc = { t: ESC_T, T: ESC_T, x: cw(MAP.exit[0]), z: cw(MAP.exit[1]), area: MAP.exitA, rk: 1.2, bx: (x + w / 2) * 2, bz: (y + h / 2) * 2 };
  ev(G, 'esc', { x: G.esc.x, z: G.esc.z });
}
// 시간 안에 못 나가면 무너진 돌에 갇혀 보스 방에서 다시 달려요
function escReset(G) {
  const E = G.esc; E.t = E.T; E.rk = 1.5; G.zones = G.zones.filter(z => z.k !== 'rock');
  G.players.forEach((p, i) => { if (p.dead) return; p.down = false; p.hp = Math.max(p.hp, Math.round(p.maxhp * 0.6)); p.x = E.bx - 3 + i * 2; p.z = E.bz + 3; p.inv = 1.5; mapCollide(p, 0.6); });
}
function stepEsc(G, dt) {
  if (G.phase !== 'play') return;
  const E = G.esc; E.t -= dt;
  // 떨어지는 돌: 달려가는 동료 앞쪽에 그림자가 생기고 1초 뒤 떨어져요
  if ((E.rk -= dt) <= 0) {
    E.rk = 0.3 + G.rng() * 0.25; const ps = G.players.filter(alive); const p = ps[Math.floor(G.rng() * ps.length)];
    if (p) { const a = Math.atan2(E.z - p.z, E.x - p.x) + (G.rng() - 0.5) * 2, d = 1 + G.rng() * 5, x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d; if (!isWall(x, z)) G.zones.push({ id: G.uid++, k: 'rock', x, z, r: 1.7, t: 1.0, T: 1.0 }); }
  }
  const live = G.players.filter(p => !p.dead);
  if (live.length && live.every(p => areaAt(p.x, p.z) === E.area) && live.some(alive)) {
    G.escDone = true; ev(G, 'escaped', {}); for (const p of G.players) if (!p.bot) ev(G, 'ach', { id: 'escape', pid: p.id });
    G.zones = G.zones.filter(z => z.k !== 'rock'); win(G); return;
  }
  if (E.t <= 0) { ev(G, 'escfail', {}); escReset(G); }
}
// 봇: 수수께끼 방에서 할 일 (발판에 서기, 오래 못 풀면 화로·석상 대신 풀기)
// 사람이 있으면 12초쯤 못 풀 때 봇이 도와요. 역할 수수께끼는 그 역할의 봇만 풀 수 있어요
const PUZ_HELP = 12;
function puzHelper(G, q) {
  const RP = ROLE_PUZ[q.k], rg = o2 => q.k === 'crystals' && ROLES[o2.role].atk.kind === 'melee' ? 1 : 0, bots = G.players.filter(o2 => o2.bot && alive(o2) && !o2.torch && (!RP || o2.role === RP.role)).sort((a, b) => rg(a) - rg(b) || a.slot - b.slot);
  return bots[0] || null;
}
function botPuzzle(G, p, inp, leader) {
  const ai = p.ai, la = leader ? areaAt(leader.x, leader.z) : -1, me = areaAt(p.x, p.z);
  for (let k = 0; k < MAP.puzzles.length; k++) {
    const q = MAP.puzzles[k], P = G.puz[k]; if (P.done || (me !== q.area && la !== q.area)) continue;
    if (q.k === 'plates') {
      const taken = [0, 1, 2, 3].filter(i => { const o = itemPos(q, i); return G.players.some(o2 => !o2.bot && alive(o2) && Math.hypot(o2.x - o.x, o2.z - o.z) < 1.3); });
      const free = [0, 1, 2, 3].filter(i => taken.indexOf(i) < 0), bots = G.players.filter(o2 => o2.bot && alive(o2)).sort((a, b) => a.slot - b.slot), j = bots.indexOf(p);
      if (j < 0 || j >= free.length) return false;
      const o = itemPos(q, free[j]); moveTo(G, p, inp, o.x, o.z, 0.35); return true;
    }
    if (P.idle < (G.humans ? PUZ_HELP : 1.5)) return false;
    if (puzHelper(G, q) !== p) return false;
    // 사람처럼 한 번 하고 잠깐 멈췄다가 다음 것을 해요 (천천히)
    if (ai.pzW > 0) { ai.pzW -= 1 / 30; return true; }
    const RP = ROLE_PUZ[q.k], at = i => itemPos(q, i), tap = (o, near = 1.6, w = 0.7) => { if (!moveTo(G, p, inp, o.x, o.z, near)) { ai.fp = !ai.fp; inp.f = ai.fp; if (ai.fp) ai.pzW = w; } return true; };
    if (q.k === 'levers') {
      // 등불 넷이 다 켜지는 지렛대 조합을 찾아 첫 번째를 당겨요
      let best = -1; for (let m = 1; m < 16 && best < 0; m++) { const l = P.lit.slice(); for (let j = 0; j < 4; j++) if (m >> j & 1) for (const n of [j - 1, j, j + 1]) if (n >= 0 && n < 4) l[n] = 1 - l[n]; if (l.every(v => v)) best = [0, 1, 2, 3].find(j => m >> j & 1); }
      return best < 0 ? false : tap(at(best), 1.6, 1.0);
    }
    if (q.k === 'mirrors') { const j = P.rot.slice(0, 3).findIndex(r => r !== 0); return j < 0 ? false : tap(at(j), 1.6, 0.9); }
    if (q.k === 'embers') { const j = p.emb ? [1, 2, 3].find(n => !P.lit[n]) : 0; return j == null ? false : tap(at(j), 1.4, 0.5); }
    if (q.k === 'sigils') {
      const n = P.lit.reduce((a, b) => a + b, 0), ok = SIG_PATH.slice(0, n).every(j => P.lit[j]) && (n === 0 || P.head === SIG_PATH[n - 1]);
      const j = ok ? SIG_PATH[n] : P.lit.findIndex((v, m) => v && m !== P.head); if (j == null || j < 0) return false;
      const o = at(j); moveTo(G, p, inp, o.x, o.z, 0.4); return true;
    }
    if (q.k === 'crystals') {
      let j = -1, lo = 1e9; P.lit.forEach((v, m) => { const t = v ? P.ct[m] : -1; if (t < lo) { lo = t; j = m; } }); if (lo > 3) return true;
      const o = at(j), mel = ROLES[p.role].atk.kind === 'melee'; if (!moveTo(G, p, inp, o.x, o.z, mel ? 1.8 : 9)) { inp.aim = Math.atan2(o.z - p.z, o.x - p.x); inp.atk = true; inp.ax = o.x; inp.az = o.z; } return true;
    }
    if (q.k === 'icecrys') { const j = P.lit.findIndex(v => !v); if (j < 0) return false; const o = at(j); ai.cmbT = 0.5; if (!moveTo(G, p, inp, o.x, o.z, 1.8)) { inp.aim = Math.atan2(o.z - p.z, o.x - p.x); inp.atk = true; } return true; }
    if (q.k === 'lanterns') { const o = at(0), sx = o.x - 6; if (!moveTo(G, p, inp, sx, o.z, 0.4)) { inp.aim = 0; if (p.cd.s0 <= 0 && !(ai.pzW > 0)) { inp.q = true; ai.pzW = 1.6; } } return true; }
    if (q.k === 'vigil') { const j = P.lit.findIndex(v => !v); if (j < 0) return false; const o = at(j); moveTo(G, p, inp, o.x, o.z, 0.3); return true; }
    if (q.k === 'blackfire') { const j = P.lit.findIndex(v => !v); if (j < 0) return false; const o = at(j); if (!moveTo(G, p, inp, o.x, o.z, 6)) { inp.aim = Math.atan2(o.z - p.z, o.x - p.x); inp.ax = o.x; inp.az = o.z; if (p.cd.s0 <= 0) { inp.q = true; ai.pzW = 1.2; } } return true; }
    const i = q.k === 'braziers' ? q.order[P.n] : RP ? q.items.findIndex((_, j2) => !P.lit[j2]) : P.rot.findIndex((r, j2) => r !== STAT_OK[j2]); if (i < 0) return false;
    const o = itemPos(q, i);
    if (q.k === 'oath') { if (!moveTo(G, p, inp, o.x, o.z, 0.5) && p.cd.s0 <= 0) { inp.q = true; ai.pzW = 1.2; } return true; }
    if (q.k === 'targets') { const tz = o.z - 0.6, sz = o.z + 9; if (!moveTo(G, p, inp, o.x, sz, 1.2)) { inp.aim = Math.atan2(tz - p.z, o.x - p.x); inp.atk = true; ai.pzW = 0.9; } return true; }
    if (q.k === 'basins' || q.k === 'vines') { const near = q.k === 'basins' ? 5 : 1.6; if (!moveTo(G, p, inp, o.x, o.z, near)) { inp.aim = Math.atan2(o.z - p.z, o.x - p.x); inp.atk = true; ai.pzW = 1.1; } return true; }
    if (!moveTo(G, p, inp, o.x, o.z, 1.6)) { ai.fp = !ai.fp; inp.f = ai.fp; if (ai.fp) ai.pzW = 1.3; }
    return true;
  }
  return false;
}

/* ---------- 적 ---------- */
function pickTarget(G, e) {
  if (e.tauntT > 0) { const t = G.players.find(p => p.id === e.tgt && alive(p)); if (t) return t; }
  let best = null, bd = 1e9;
  for (const p of G.players) { if (!alive(p)) continue; let d = dist(e, p); if (p.taunt > 0) d -= 6; if (hasFlag(G, p)) d -= 4; if (d < bd) { bd = d; best = p; } }
  return best;
}
function stepEnemy(G, e, dt) {
  if (e.k === 'dummy') return;
  const E = G.EN[e.k];
  ['root', 'mark', 'stun', 'hitT', 'tauntT', 'slow'].forEach(k => { if (e[k] > 0) e[k] = Math.max(0, e[k] - dt); });
  if (e.burn > 0) { e.burn -= dt; e.burnT += dt; if (e.burnT >= 0.5) { e.burnT = 0; hurtEnemy(G, e, 2, null, {}); if (e.hp <= 0) return; } }
  // 잠든 적: 사람이 보이는 곳까지 오면 깨어나요
  if (e.st === 'sleep') {
    if (e.k === 'boss') return;
    for (const p of G.players) if (alive(p) && dist(p, e) < WAKE_R && lineClear(e.x, e.z, p.x, p.z)) { wake(G, e); break; }
    if (e.st === 'sleep') return;
  }
  e.x += e.vx * dt; e.z += e.vz * dt; e.vx *= Math.pow(0.02, dt); e.vz *= Math.pow(0.02, dt);
  collide(G, e, e.r);
  if (e.st === 'rise') { e.stT -= dt; if (e.stT <= 0) e.st = 'idle'; return; }
  // 너무 멀리 끌려가면 제자리로 돌아가 다시 잠들어요
  if (e.st === 'home') {
    const d = Math.hypot(e.hx - e.x, e.hz - e.z);
    for (const p of G.players) if (alive(p) && dist(p, e) < WAKE_R * 0.8 && lineClear(e.x, e.z, p.x, p.z)) { e.st = 'idle'; return; }
    if (d < 0.8) { e.st = 'sleep'; e.hp = e.maxhp; e.moving = false; return; }
    const a = navDir(e.x, e.z, e.hx, e.hz, G.t); if (a == null) { e.x = e.hx; e.z = e.hz; return; }
    e.a = a; e.x += Math.cos(a) * E.speed * 1.3 * dt; e.z += Math.sin(a) * E.speed * 1.3 * dt; e.moving = true; e.hp = Math.min(e.maxhp, e.hp + e.maxhp * 0.2 * dt);
    return;
  }
  if (e.k === 'boss') { stepBoss(G, e, dt); return; }
  if (!e.summoned && e.hx != null && !G.players.some(p => alive(p) && dist(p, e) < LEASH_R) && Math.hypot(e.hx - e.x, e.hz - e.z) > 4) { e.st = 'home'; e.tgt = null; return; }
  if (e.stun > 0) return;
  // 소환형 중간 보스: 아홉 초마다 부하 둘을 불러요
  if (e.mb === 2 && e.st !== 'rise') { e.sumT = (e.sumT || 5) - dt; if (e.sumT <= 0) { e.sumT = 9; for (let i = 0; i < 2; i++) { const a = G.rng() * TAU; let sx = e.x + Math.cos(a) * 3, sz = e.z + Math.sin(a) * 3; if (isWall(sx, sz) || !lineClear(e.x, e.z, sx, sz)) { sx = e.x; sz = e.z; } spawnEnemy(G, 'skel', sx, sz, false); } ev(G, 'summon', {}); } }
  // 함정
  for (const z of G.zones) if (z.k === 'ptrap' && Math.hypot(z.x - e.x, z.z - e.z) < z.r) { const ow = G.players.find(p => p.id === z.own); e.root = 2; hurtEnemy(G, e, 40, ow, {}); e.root = 2.5; z.t = 0; ev(G, 'snap', { x: z.x, z: z.z }); ev(G, 'launch', { id: e.id, x: e.x, z: e.z });
    // 덫이 터지며 불길이 번져요: 둘레 적이 불타고 조금 다쳐요
    for (const q of G.enemies) if (q !== e && q.hp > 0 && Math.hypot(q.x - z.x, q.z - z.z) < 3) { q.burn = 3; hurtEnemy(G, q, 10, ow, { spread: 1 }); } if (e.hp <= 0) return; }
  const t = pickTarget(G, e); if (!t) return;
  const d = dist(e, t), sees = lineClear(e.x, e.z, t.x, t.z), ta = angTo(e, t);
  if (e.st === 'wind') {
    e.wind -= dt;
    if (e.wind <= 0) {
      e.st = 'idle'; e.cd = E.cd * (0.8 + G.rng() * 0.4);
      if (e.k === 'archer') { G.projs.push({ id: G.uid++, k: E.proj, x: e.x, z: e.z, vx: Math.cos(e.a) * E.psp, vz: Math.sin(e.a) * E.psp, dmg: E.dmg * e.dm, life: 20 / E.psp, team: 1, src: e.id }); ev(G, 'eshoot', { x: e.x, z: e.z }); }
      else if (e.charging) { /* 돌진 끝 */ }
      else {
        ev(G, 'eswing', { id: e.id, x: e.x, z: e.z, a: e.a });
        for (const p of G.players) if (alive(p) && dist(e, p) < E.range + 0.7 && angDiff(e.a, angTo(e, p)) < 1.1) hurtPlayer(G, p, E.dmg * e.dm, e);
      }
    }
    return;
  }
  if (e.st === 'charge') {
    e.chT -= dt; const sp = 15; e.x += Math.cos(e.a) * sp * dt; e.z += Math.sin(e.a) * sp * dt; collide(G, e, e.r);
    for (const p of G.players) if (alive(p) && dist(e, p) < e.r + 0.7 && !e.hitSet[p.id]) { e.hitSet[p.id] = 1; hurtPlayer(G, p, E.dmg * e.dm, e); }
    if (e.chT <= 0) { e.st = 'idle'; e.cd = 1.5; }
    return;
  }
  if (e.st === 'wind2') return;
  e.cd -= dt;
  // 벽에 가려 있으면 길을 따라 돌아가요
  const ma = sees ? ta : (navDir(e.x, e.z, t.x, t.z, G.t) ?? ta);
  const turn = 6 * dt; let da = (sees ? ta : ma) - e.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.a += clamp(da, -turn, turn);
  let want = 0;
  if (e.k === 'archer') { want = !sees || d > E.keep + 1 ? 1 : d < E.keep - 2 ? -1 : 0; }
  else want = !sees || d > E.range * 0.85 ? 1 : 0;
  if (e.root <= 0 && want) {
    // 동료끼리 너무 붙지 않게 살짝 밀어요
    let sx = 0, sz = 0; for (const o of G.enemies) if (o !== e && o.hp > 0) { const dd = dist(e, o); if (dd < 1.6 && dd > 0) { sx += (e.x - o.x) / dd; sz += (e.z - o.z) / dd; } }
    const sm = e.slow > 0 ? e.slowM : 1; e.x += (Math.cos(ma) * want * E.speed * sm + sx * 1.5) * dt; e.z += (Math.sin(ma) * want * E.speed * sm + sz * 1.5) * dt; e.moving = true;
  } else e.moving = false;
  if (e.cd <= 0 && sees) {
    if (e.k === 'elite' && d > (e.mb === 1 ? 3 : 4) && d < 11 && G.rng() < (e.mb === 1 ? 0.85 : e.mb === 2 ? 0.15 : 0.5)) { e.st = 'chargeWind'; }
    else if (e.k === 'archer' ? d < E.range : d < E.range + 0.4) { e.st = 'wind'; e.wind = E.windup; e.a = ta; ev(G, 'ewind', { id: e.id }); }
  }
  if (e.st === 'chargeWind') { e.st = 'wind2'; e.wind = 0.8; e.a = ta; G.zones.push({ id: G.uid++, k: 'tline', x: e.x, z: e.z, a: ta, len: 9, w: 1.6, t: 0.8, T: 0.8 }); }
  if (e.st === 'wind2') { /* handled below */ }
}
// 근위대장 돌진 준비 처리 (wind2 → charge)
function eliteWind(G, e, dt) { e.wind -= dt; if (e.wind <= 0) { e.st = 'charge'; e.chT = 0.6; e.hitSet = {}; } }

/* ---------- 보스 ---------- */
// 장마다 보스가 달라요. 공통: 체력 60%·30%에서 단계가 바뀌고, 자기 방 안에 있는 사람만 쫓아요
function stepBoss(G, b, dt) {
  const f = b.hp / b.maxhp, B = G.EN.boss;
  // p4가 있는 보스(6~8장)는 체력 12%에서 마지막 4단계로 넘어가요
  const np = f > 0.6 ? 1 : f > 0.3 ? 2 : (B.p4 && f <= 0.12) ? 4 : 3;
  if (np !== b.phase) { b.phase = np; ev(G, 'bphase', { p: np }); b.cdT = 1.2; b.atk = null; b.st = 'idle'; if (np === 2) b.summonT = 1; if (np >= 3) b.fireT = 1; if (np === 4) { b.summonT = 2; b.p4T = 3; } }
  if (b.stun > 0) { b.atk = null; b.st = 'stun'; return; }
  if (b.st === 'stun') b.st = 'idle';
  let t = null, bd = 1e9; for (const p of G.players) { if (!alive(p) || areaAt(p.x, p.z) !== G.bossArea) continue; const dd = dist(b, p) - (p.taunt > 0 ? 6 : 0) - (hasFlag(G, p) ? 4 : 0); if (dd < bd) { bd = dd; t = p; } }
  if (!t) { b.atk = null; const hd = Math.hypot(b.hx - b.x, b.hz - b.z); if (hd > 1) { const a = Math.atan2(b.hz - b.z, b.hx - b.x); b.x += Math.cos(a) * 3 * dt; b.z += Math.sin(a) * 3 * dt; b.a = a; b.moving = true; } else b.moving = false; return; }
  const K = B.dmg / 55, ai = B.pat || B.ai || 'warden', d = dist(b, t), ta = angTo(b, t), P4 = b.phase === 4;
  // 4단계: 보스마다 다른 마지막 큰 공격이 자주 터져요
  if (P4) { b.p4T -= dt; if (b.p4T <= 0 && !b.atk) { b.p4T = 6.5; finale(G, b, t, K, ai); } }
  // 부하 부르기 (2단계부터)
  if (b.phase >= 2) { b.summonT -= dt; if (b.summonT <= 0) { b.summonT = ai === 'bishop' ? 13 : P4 ? 11 : 15; const n = P4 ? 4 : 3; for (let i = 0; i < n; i++) { const a = i / n * TAU + G.rng(); let sx = b.x + Math.cos(a) * 4, sz = b.z + Math.sin(a) * 4; if (isWall(sx, sz) || !lineClear(b.x, b.z, sx, sz)) { sx = b.x; sz = b.z; } spawnEnemy(G, i === n - 1 && G.rng() < 0.6 ? 'archer' : 'skel', sx, sz, false); } ev(G, 'summon', {}); } }
  // 3단계: 보스마다 다른 바닥 공격
  if (b.phase >= 3) {
    b.fireT -= dt * (P4 ? 1.4 : 1);
    if (b.fireT <= 0) {
      if (ai === 'warden') { b.fireT = 2.4; fireTrail(G, b, t); }
      else if (ai === 'hunter') { b.fireT = 5.5; fireRing(G, b.x, b.z, 6.5, 14); }
      else if (ai === 'bishop') { b.fireT = 2.6; for (const p of G.players) if (alive(p) && areaAt(p.x, p.z) === G.bossArea) G.zones.push({ id: G.uid++, k: 'tcircle', x: p.x, z: p.z, r: 2.2, t: 1.1, T: 1.1, then: 'fire' }); ev(G, 'bwind', { w: 'murk' }); }
      else if (ai === 'frost') { b.fireT = 2.8; for (const p of G.players) if (alive(p) && areaAt(p.x, p.z) === G.bossArea) hazard(G, { k: 'tcircle', x: p.x, z: p.z, r: 1.8, T: 1.0, dmg: 30 * K, chill: 2, fx: 'icicle' }); ev(G, 'bwind', { w: 'icicle' }); }
      else if (ai === 'giant') { b.fireT = 1.5; for (let i = 0; i < 2; i++) { const ps = G.players.filter(p => alive(p) && areaAt(p.x, p.z) === G.bossArea), p = ps[Math.floor(G.rng() * ps.length)]; if (!p) break; const x = p.x + (G.rng() - 0.5) * 5, z = p.z + (G.rng() - 0.5) * 5; if (!isWall(x, z)) G.zones.push({ id: G.uid++, k: 'rock', x, z, r: 1.9, t: 1.2, T: 1.2 }); } }
      else if (ai === 'prophet') { b.fireT = 3.4; b.rot = (b.rot || 0) + 0.45; for (let i = 0; i < 4; i++) hazard(G, { k: 'tline', x: b.x, z: b.z, a: b.rot + i * Math.PI / 2, len: 18, w: 2, T: 1.1, dmg: 30 * K, fx: 'beam' }); ev(G, 'bwind', { w: 'beam' }); }
      else if (ai === 'flame') { b.fireT = 2.4; meteors(G, b, 4, K); }
      else { b.fireT = 2.2; fireTrail(G, b, t); }
    }
  }
  if (b.atk) { bossAttack(G, b, dt, K); return; }
  // 걷기: 대주교는 거리를 두고, 나머지는 다가와요
  const sp = B.speed * (b.phase === 4 ? 1.4 : b.phase === 3 ? 1.25 : 1) * (b.slow > 0 ? b.slowM : 1) * (ai === 'giant' ? 0.8 : 1);
  let da = ta - b.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.a += clamp(da, -2.6 * dt, 2.6 * dt);
  let want = d > 3 ? 1 : 0; if (ai === 'bishop' || ai === 'prophet') want = d > 9 ? 1 : d < 5 ? -1 : 0;
  if (want) { const ma = lineClear(b.x, b.z, t.x, t.z) ? ta : (navDir(b.x, b.z, t.x, t.z, G.t) ?? ta); b.x += Math.cos(ma) * sp * want * dt; b.z += Math.sin(ma) * sp * want * dt; collide(G, b, b.r); b.moving = true; } else b.moving = false;
  b.cdT = (b.cdT || 0) - dt;
  if (b.cdT > 0) return;
  const r = G.rng(), tw = b.phase === 4 ? 0.65 : b.phase === 3 ? 0.75 : 1;
  const warn = (k, z) => { if (z) G.zones.push(Object.assign({ id: G.uid++, t: z.T }, z)); ev(G, 'bwind', { w: k }); };
  if (ai === 'warden' || ai === 'king') {
    const ring = ai === 'king' && b.phase >= 3 && r < 0.22;
    if (ring) { b.atk = { k: 'ring', t: 1.3, r: 7.5 }; warn('ring', { k: 'tcircle', x: b.x, z: b.z, r: 7.5, T: 1.3 }); }
    else if (b.phase >= 2 && d > 5 && r < 0.45) { b.a = ta; b.atk = { k: 'charge', t: 1.0 * tw }; warn('charge', { k: 'tline', x: b.x, z: b.z, a: ta, len: 15, w: 2.6, T: 1.0 * tw }); }
    else if (ai === 'king' && b.phase >= 2 && r < 0.62) { b.atk = { k: 'nova', t: 0.9 * tw, n: 10, pk: 'ember' }; warn('nova', { k: 'tcircle', x: b.x, z: b.z, r: 2.5, T: 0.8 * tw }); }
    else if (d < 5 && r < 0.75) { b.a = ta; b.atk = { k: 'sweep', t: 0.75 * tw }; warn('sweep', { k: 'tcone', x: b.x, z: b.z, a: ta, r: 5.2, arc: 2.1, T: 0.75 * tw }); }
    else { b.atk = { k: 'slam', t: 0.95 * tw, x: t.x, z: t.z, r: 3.4 }; b.a = ta; warn('slam', { k: 'tcircle', x: t.x, z: t.z, r: 3.4, T: 0.95 * tw }); }
  } else if (ai === 'hunter') {
    if (d > 6 && r < 0.4) { b.atk = { k: 'leap', t: 0.9 * tw, x: t.x, z: t.z, r: 3.2 }; b.a = ta; warn('leap', { k: 'tcircle', x: t.x, z: t.z, r: 3.2, T: 0.9 * tw }); }
    else if (d > 4 && r < 0.8) { b.a = ta; b.atk = { k: 'volley', t: 0.7 * tw, n: b.phase >= 2 ? 7 : 5, pk: 'spear', sp: 20 }; warn('volley', { k: 'tcone', x: b.x, z: b.z, a: ta, r: 12, arc: 1.1, T: 0.7 * tw }); }
    else if (d < 5) { b.a = ta; b.atk = { k: 'sweep', t: 0.6 * tw }; warn('sweep', { k: 'tcone', x: b.x, z: b.z, a: ta, r: 5.2, arc: 2.1, T: 0.6 * tw }); }
    else { b.atk = { k: 'leap', t: 0.9 * tw, x: t.x, z: t.z, r: 3.2 }; warn('leap', { k: 'tcircle', x: t.x, z: t.z, r: 3.2, T: 0.9 * tw }); }
  } else if (ai === 'bishop') {
    if (d < 3.5 || r < 0.2) { const q = bossSpot(G, b); b.atk = { k: 'blink', t: 0.6, x: q.x, z: q.z }; warn('blink', { k: 'tcircle', x: q.x, z: q.z, r: 1.6, T: 0.6 }); }
    else if (r < 0.55) { b.atk = { k: 'nova', t: 0.8 * tw, n: b.phase >= 2 ? 16 : 12, pk: 'eorb' }; warn('nova', { k: 'tcircle', x: b.x, z: b.z, r: 2.5, T: 0.8 * tw }); }
    else { b.atk = { k: 'pillars', t: 1.1 * tw, pts: [] }; for (const p of G.players) if (alive(p) && areaAt(p.x, p.z) === G.bossArea) { b.atk.pts.push([p.x, p.z]); G.zones.push({ id: G.uid++, k: 'tcircle', x: p.x, z: p.z, r: 2.4, t: 1.1 * tw, T: 1.1 * tw }); } ev(G, 'bwind', { w: 'pillars' }); }
  } else if (ai === 'frost') {
    // 하랄드: 얼음 창 세 줄, 둘레 얼리기, 내려찍기. 얼음에 맞으면 느려져요
    if (d > 4 && r < 0.45) { b.a = ta; const T = 0.95 * tw; for (const o of [-0.35, 0, 0.35]) hazard(G, { k: 'tline', x: b.x, z: b.z, a: ta + o, len: 16, w: 1.8, T, dmg: 30 * K, chill: 2.5, fx: 'lance' }); b.atk = { k: 'wait', t: T }; ev(G, 'bwind', { w: 'lance' }); }
    else if (d < 6.5 && r < 0.75) { const T = 1.1 * tw; hazard(G, { k: 'tcircle', x: b.x, z: b.z, r: 6, T, dmg: 36 * K, chill: 3, fx: 'frostnova' }); b.atk = { k: 'wait', t: T }; ev(G, 'bwind', { w: 'frostnova' }); }
    else { b.atk = { k: 'slam', t: 0.95 * tw, x: t.x, z: t.z, r: 3.2 }; b.a = ta; warn('slam', { k: 'tcircle', x: t.x, z: t.z, r: 3.2, T: 0.95 * tw }); }
  } else if (ai === 'giant') {
    // 그롬: 몸을 말아 벽에 튕기며 구르기, 발 구르기(밀쳐 냄), 바위 던지기. 느리지만 한 방이 커요
    if (b.phase >= 2 && r < 0.16) { const ps = G.players.filter(p => alive(p) && areaAt(p.x, p.z) === G.bossArea); for (let i = 0; i < 5; i++) { const p = ps[i % ps.length] || t, x = p.x + (G.rng() - 0.5) * 7, z = p.z + (G.rng() - 0.5) * 7; if (!isWall(x, z)) hazard(G, { k: 'tcircle', x, z, r: 2, T: 1.1 + i * 0.15, dmg: 34 * K, fx: 'rock' }); } b.atk = { k: 'wait', t: 1.0 }; ev(G, 'bwind', { w: 'rockrain' }); }
    else if (b.phase >= 2 && (d > 4 ? r < 0.45 : r < 0.2)) { b.a = ta; b.atk = { k: 'roll', t: 1.0 * tw }; warn('roll', { k: 'tline', x: b.x, z: b.z, a: ta, len: 15, w: 3.2, T: 1.0 * tw }); }
    else if (d < 6 && r < 0.7) { b.atk = { k: 'stomp', t: 1.2 * tw, r: 5.8 }; warn('stomp', { k: 'tcircle', x: b.x, z: b.z, r: 5.8, T: 1.2 * tw }); }
    else { b.a = ta; b.atk = { k: 'boulder', t: 1.3 * tw, x: t.x, z: t.z, r: 3 }; warn('boulder', { k: 'tcircle', x: t.x, z: t.z, r: 3, T: 1.3 * tw }); }
  } else if (ai === 'prophet') {
    // 세라핀: 가까우면 순간이동, 십자 불기둥, 불의 벽, 불씨 부채꼴
    if (d < 4 || r < 0.15) { const q = bossSpot(G, b); b.atk = { k: 'blink', t: 0.6, x: q.x, z: q.z }; warn('blink', { k: 'tcircle', x: q.x, z: q.z, r: 1.6, T: 0.6 }); }
    else if (b.phase >= 2 && r < 0.27) { b.atk = { k: 'nova', t: 0.8 * tw, n: 14, pk: 'ember' }; warn('nova', { k: 'tcircle', x: b.x, z: b.z, r: 2.5, T: 0.8 * tw }); }
    else if (r < 0.5) { const T = 1.0 * tw, o = (b.crs = !b.crs) ? 0 : Math.PI / 4; for (let i = 0; i < 4; i++) hazard(G, { k: 'tline', x: b.x, z: b.z, a: o + i * Math.PI / 2, len: 18, w: 2, T, dmg: 34 * K, fx: 'beam' }); b.atk = { k: 'wait', t: T }; ev(G, 'bwind', { w: 'beam' }); }
    else if (r < 0.78) { const pa = ta + Math.PI / 2, cx = (b.x + t.x) / 2, cz = (b.z + t.z) / 2; for (let i = -3; i <= 3; i++) { const x = cx + Math.cos(pa) * i * 1.8, z = cz + Math.sin(pa) * i * 1.8; if (!isWall(x, z)) G.zones.push({ id: G.uid++, k: 'tcircle', x, z, r: 1.3, t: 0.9, T: 0.9, then: 'fire' }); } b.atk = { k: 'wait', t: 0.9 }; ev(G, 'bwind', { w: 'firewall' }); }
    else { b.a = ta; b.atk = { k: 'volley', t: 0.7 * tw, n: b.phase >= 2 ? 7 : 5, pk: 'ember', sp: 15 }; warn('volley', { k: 'tcone', x: b.x, z: b.z, a: ta, r: 12, arc: 1.1, T: 0.7 * tw }); }
  } else if (ai === 'flame') {
    // 꺼지지 않는 불꽃: 세 번 이어지는 소용돌이 불씨, 불덩이 비, 휘두르기, 둘레 폭발
    if (b.phase >= 2 && r < 0.14) { const T = 1.1 * tw, o = G.rng() * TAU; for (let i = 0; i < 6; i++) hazard(G, { k: 'tline', x: b.x, z: b.z, a: o + i * TAU / 6, len: 18, w: 1.8, T, dmg: 34 * K, fx: 'beam' }); b.atk = { k: 'wait', t: T }; ev(G, 'bwind', { w: 'beam' }); }
    else if (r < 0.3) { b.atk = { k: 'spiral', t: 0.8 * tw, n: b.phase >= 3 ? 4 : 3, o: G.rng() * TAU }; warn('nova', { k: 'tcircle', x: b.x, z: b.z, r: 2.5, T: 0.8 * tw }); }
    else if (r < 0.55) { meteors(G, b, 3, K); b.atk = { k: 'wait', t: 0.8 }; }
    else if (d < 5 && r < 0.8) { b.a = ta; b.atk = { k: 'sweep', t: 0.7 * tw }; warn('sweep', { k: 'tcone', x: b.x, z: b.z, a: ta, r: 5.2, arc: 2.1, T: 0.7 * tw }); }
    else { b.atk = { k: 'ring', t: 1.3 * tw, r: 6.5 }; warn('ring', { k: 'tcircle', x: b.x, z: b.z, r: 6.5, T: 1.3 * tw }); }
  }
}
// 4단계 마지막 큰 공격
function finale(G, b, t, K, ai) {
  if (ai === 'giant') { // 땅 울림: 제자리에서 세 번 연달아 땅을 내리쳐요. 원 밖으로 피해 있어야 해요
    for (let i = 0; i < 3; i++) hazard(G, { k: 'tcircle', x: b.x, z: b.z, r: 6.5, T: 1.0 + i * 0.8, dmg: 30 * K, fx: 'rock' });
    b.atk = { k: 'wait', t: 2.8 }; ev(G, 'bwind', { w: 'quake' });
  } else if (ai === 'prophet') { // 태양의 심판: 여덟 줄 불기둥 두 번, 두 번째는 비스듬히
    for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) hazard(G, { k: 'tline', x: b.x, z: b.z, a: k * Math.PI / 4 + i * Math.PI / 2, len: 20, w: 2, T: 1.0 + k * 0.9, dmg: 34 * K, fx: 'beam' });
    b.atk = { k: 'wait', t: 2.0 }; ev(G, 'bwind', { w: 'beam' });
  } else if (ai === 'flame') { // 꺼지지 않는 불: 다섯 겹 소용돌이와 불덩이 비가 한꺼번에
    meteors(G, b, 5, K); b.atk = { k: 'spiral', t: 0.6, n: 5, o: G.rng() * TAU }; ev(G, 'bwind', { w: 'meteor' });
  }
}
// 늦게 터지는 경고 장판: 시간이 다 되면 그 안(선 위)에 있는 사람이 맞아요. chill이면 잠깐 몸이 얼어 느려져요
function hazard(G, z) { G.zones.push(Object.assign({ id: G.uid++, t: z.T }, z)); }
function meteors(G, b, n, K) {
  const pts = G.players.filter(p => alive(p) && areaAt(p.x, p.z) === G.bossArea).map(p => [p.x, p.z]);
  for (let i = 0; i < n; i++) { const q = bossSpot(G, b); pts.push([q.x, q.z]); }
  for (const [x, z] of pts) hazard(G, { k: 'tcircle', x, z, r: 2.2, T: 1.3, dmg: 36 * K, fx: 'meteor' });
  ev(G, 'bwind', { w: 'meteor' });
}
// 보스 공격이 터지는 순간
function bossAttack(G, b, dt, K) {
  const A = b.atk; A.t -= dt;
  if (A.k === 'charge' && A.go) {
    const ox = b.x + Math.cos(b.a) * 17 * dt, oz = b.z + Math.sin(b.a) * 17 * dt; b.x = ox; b.z = oz; collide(G, b, b.r); const bumped = Math.hypot(b.x - ox, b.z - oz) > 0.05;
    for (const p of G.players) {
      if (!alive(p) || A.hit[p.id] || dist(b, p) > b.r + 0.8) continue;
      A.hit[p.id] = 1;
      // 기사가 막기를 막 들었을 때 정면으로 받으면 받아치기
      if (p.role === 'knight' && p.block > 0.8 && angDiff(p.a, angTo(p, b)) < 1.2) { b.stun = 3; b.atk = null; ev(G, 'parry', { id: p.id, x: p.x, z: p.z }); if (!p.bot) ev(G, 'ach', { id: 'parry', pid: p.id }); return; }
      hurtPlayer(G, p, 42 * K, b); p.inv = Math.max(p.inv, 0.4);
    }
    if (A.t <= 0 || bumped) { b.atk = null; b.cdT = 1.4; }
    return;
  }
  if (A.k === 'rollgo') {
    // 그롬 구르기: 벽에 부딪히면 튕겨서 세 번까지 굴러요
    const ox = b.x, oz = b.z; b.x += Math.cos(b.a) * 15 * dt; b.z += Math.sin(b.a) * 15 * dt; collide(G, b, b.r);
    for (const p of G.players) { if (!alive(p) || A.hit[p.id] || dist(b, p) > b.r + 0.9) continue; A.hit[p.id] = 1; hurtPlayer(G, p, 40 * K, b); p.inv = Math.max(p.inv, 0.4); }
    if (Math.hypot(b.x - ox, b.z - oz) < 15 * dt * 0.5) { A.n--; A.hit = {}; ev(G, 'slam', { x: b.x, z: b.z }); const t = G.players.filter(alive).sort((p, q) => dist(b, p) - dist(b, q))[0]; b.a = t ? angTo(b, t) + (G.rng() - 0.5) * 0.8 : b.a + Math.PI; }
    if (A.t <= 0 || A.n <= 0) { b.atk = null; b.cdT = 1.6; }
    return;
  }
  if (A.t > 0) return;
  const area = (x, z, r, dmg) => { for (const p of G.players) if (alive(p) && Math.hypot(p.x - x, p.z - z) < r) hurtPlayer(G, p, dmg, b); };
  const shoot = (a, pk, sp, dmg) => G.projs.push({ id: G.uid++, k: pk, x: b.x + Math.cos(a) * 1.2, z: b.z + Math.sin(a) * 1.2, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, dmg, life: 22 / sp, team: 1, src: b.id });
  b.atk = null;
  switch (A.k) {
    case 'slam': ev(G, 'slam', { x: A.x, z: A.z }); area(A.x, A.z, A.r, 48 * K); b.cdT = 0.7; break;
    case 'sweep': ev(G, 'bsweep', { x: b.x, z: b.z, a: b.a }); for (const p of G.players) if (alive(p) && dist(b, p) < 5.2 && angDiff(b.a, angTo(b, p)) < 1.05) hurtPlayer(G, p, 34 * K, b); b.cdT = 0.5; break;
    case 'charge': b.atk = { k: 'charge', go: true, t: 0.9, hit: {} }; ev(G, 'bcharge', {}); break;
    case 'leap': b.x = A.x; b.z = A.z; collide(G, b, b.r); ev(G, 'slam', { x: A.x, z: A.z }); area(A.x, A.z, A.r, 44 * K); b.cdT = 0.8; break;
    case 'volley': for (let i = 0; i < A.n; i++) shoot(b.a + (i - (A.n - 1) / 2) * 0.17, A.pk, A.sp, 26 * K); ev(G, 'bvolley', { x: b.x, z: b.z }); b.cdT = 0.9; break;
    case 'nova': { const o = G.rng() * TAU; for (let i = 0; i < A.n; i++) shoot(o + i / A.n * TAU, A.pk, 9, 18 * K); ev(G, 'nova', { x: b.x, z: b.z }); b.cdT = 1.0; break; }
    case 'pillars': for (const [x, z] of A.pts) { ev(G, 'pillar', { x, z }); area(x, z, 2.4, 40 * K); } b.cdT = 0.8; break;
    case 'blink': ev(G, 'blink', { x: b.x, z: b.z }); b.x = A.x; b.z = A.z; ev(G, 'blink', { x: b.x, z: b.z }); b.cdT = 0.4; break;
    case 'ring': ev(G, 'slam', { x: b.x, z: b.z, big: 1 }); area(b.x, b.z, A.r, 50 * K); b.cdT = 1.2; break;
    case 'wait': b.cdT = 0.6; break;
    case 'stomp': ev(G, 'slam', { x: b.x, z: b.z, big: 1 }); for (const p of G.players) if (alive(p) && dist(b, p) < A.r) { hurtPlayer(G, p, 46 * K, b); const a = angTo(b, p); p.x += Math.cos(a) * 3.5; p.z += Math.sin(a) * 3.5; collide(G, p, 0.6); } b.cdT = 1.0; break;
    case 'boulder': ev(G, 'slam', { x: A.x, z: A.z }); ev(G, 'rock', { x: A.x, z: A.z }); area(A.x, A.z, A.r, 44 * K); b.cdT = 0.9; break;
    case 'roll': b.atk = { k: 'rollgo', t: 2.4, n: 3, hit: {} }; ev(G, 'bcharge', {}); break;
    case 'spiral': { for (let i = 0; i < 12; i++) shoot(A.o + i / 12 * TAU, 'ember', 8, 18 * K); ev(G, 'nova', { x: b.x, z: b.z }); if (A.n > 1) b.atk = { k: 'spiral', t: 0.35, n: A.n - 1, o: A.o + 0.26 }; else b.cdT = 1.0; break; }
  }
}
// 보스 방 안에서 순간이동할 자리
function bossSpot(G, b) {
  const [x, y, w, h] = MAP.areas[G.bossArea].r[0];
  for (let k = 0; k < 20; k++) { const q = { x: (x + 3 + G.rng() * (w - 6)) * 2, z: (y + 3 + G.rng() * (h - 6)) * 2 }; if (!isWall(q.x, q.z) && dist(q, b) > 6) return q; }
  return { x: b.hx, z: b.hz };
}
function fireTrail(G, b, t) {
  const a = angTo(b, t), n = 7;
  for (let i = 1; i <= n; i++) { const x = b.x + Math.cos(a) * i * 1.7, z = b.z + Math.sin(a) * i * 1.7; if (isWall(x, z)) break; G.zones.push({ id: G.uid++, k: 'fire', x, z, r: 1.3, t: 6.5, delay: i * 0.08, tick: 0 }); }
  ev(G, 'fire', {});
}
function fireRing(G, x, z, r, n) {
  for (let i = 0; i < n; i++) { const a = i / n * TAU, fx = x + Math.cos(a) * r, fz = z + Math.sin(a) * r; if (isWall(fx, fz)) continue; G.zones.push({ id: G.uid++, k: 'fire', x: fx, z: fz, r: 1.3, t: 5, delay: i * 0.04, tick: 0 }); }
  ev(G, 'fire', {});
}

/* ---------- 투사체·바닥 효과 ---------- */
function stepProjs(G, dt) {
  for (const pr of G.projs) {
    if (pr.k === 'potion') {
      pr.t += dt; const u = Math.min(1, pr.t / pr.T); pr.x = pr.sx + (pr.tx - pr.sx) * u; pr.z = pr.sz + (pr.tz - pr.sz) * u; pr.y = Math.sin(u * Math.PI) * 3;
      if (u >= 1) { pr.dead = true; hitPuzzle(G, pr.tx, pr.tz, 1.4, G.players.find(q => q.id === pr.own), 1, 'potion'); ev(G, 'splash', { x: pr.tx, z: pr.tz }); const po = G.players.find(q => q.id === pr.own);
        if (G.pvp) { for (const e of G.enemies) if (e.k === 'dummy' && e.hp > 0 && e.pid !== pr.own && Math.hypot(e.x - pr.tx, e.z - pr.tz) < 3.2) hurtEnemy(G, e, 30, po, { burn: 1 }); }
        else for (const q of G.players) if (alive(q) && Math.hypot(q.x - pr.tx, q.z - pr.tz) < 3) ev(G, 'heal', { id: q.id, x: q.x, z: q.z, v: healP(G, q, 40) }); }
      continue;
    }
    pr.x += pr.vx * dt; pr.z += pr.vz * dt; pr.life -= dt;
    if (pr.life <= 0 || isWall(pr.x, pr.z) || PILLARS.some(p => Math.hypot(p.x - pr.x, p.z - pr.z) < p.r)) { pr.dead = true; if (pr.k === 'pierce') { const o = G.players.find(p => p.id === pr.own); if (o && !o.bot) breakWall(G, pr.x, pr.z, 1.2, o); } continue; }
    if (pr.team === 0) {
      const own = G.players.find(p => p.id === pr.own);
      if (hitPuzzle(G, pr.x, pr.z, 0.5, own, pr.k === 'pierce' ? PIT_HITS : 1, pr.k)) { pr.dead = true; continue; }
      if (pr.k === 'orb') { // 사제 빛 구슬은 가까운 적을 살짝 따라가요
        let best = null, bd = 6; for (const e of G.enemies) { if (e.hp <= 0 || e.pid === pr.own) continue; const d = Math.hypot(e.x - pr.x, e.z - pr.z); if (d < bd) { bd = d; best = e; } }
        if (best) { const a = Math.atan2(best.z - pr.z, best.x - pr.x), sp = Math.hypot(pr.vx, pr.vz), ca = Math.atan2(pr.vz, pr.vx); let da = a - ca; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; const na = ca + clamp(da, -4 * dt, 4 * dt); pr.vx = Math.cos(na) * sp; pr.vz = Math.sin(na) * sp; }
      }
      for (const e of G.enemies) {
        if (e.hp <= 0 || e.st === 'rise' || e.pid === pr.own || pr.hit.indexOf(e.id) >= 0) continue;
        if (Math.hypot(e.x - pr.x, e.z - pr.z) < e.r + 0.35) {
          pr.hit.push(e.id); hurtEnemy(G, e, pr.dmg, own, { basic: pr.basic, aid: pr.aid, heavy: pr.heavy, pierce: pr.pierce, from: { x: pr.x - pr.vx * 0.05, z: pr.z - pr.vz * 0.05 } });
          if (!pr.pierce) { pr.dead = true; break; }
        }
      }
    } else {
      for (const p of G.players) {
        if (!alive(p)) continue;
        if (Math.hypot(p.x - pr.x, p.z - pr.z) < 0.75) { const src = G.enemies.find(e => e.id === pr.src); hurtPlayer(G, p, pr.dmg, src || { x: pr.x - pr.vx, z: pr.z - pr.vz }); pr.dead = true; break; }
      }
    }
  }
  G.projs = G.projs.filter(p => !p.dead);
}
function stepZones(G, dt) {
  for (const z of G.zones) {
    z.t -= dt;
    if (z.k === 'rain') { z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; const own = G.players.find(p => p.id === z.own); for (const e of G.enemies) if (e.hp > 0 && Math.hypot(e.x - z.x, e.z - z.z) < z.r + e.r) hurtEnemy(G, e, z.fire ? 36 : 18, own, { from: { x: e.x, z: e.z - 1 }, burn: z.fire }); } }
    if (z.k === 'fire') { if (z.delay > 0) { z.delay -= dt; continue; } z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; for (const p of G.players) if (alive(p) && Math.hypot(p.x - z.x, p.z - z.z) < z.r) hurtPlayer(G, p, 16, null); } }
  }
  for (const z of G.zones) if (z.t <= 0 && z.k === 'rock') { ev(G, 'rock', { x: z.x, z: z.z }); for (const p of G.players) if (alive(p) && Math.hypot(p.x - z.x, p.z - z.z) < z.r) hurtPlayer(G, p, 30, null); }
  for (const z of G.zones) if (z.t <= 0 && z.dmg) {
    const src = z.own ? G.players.find(q => q.id === z.own) : G.enemies.find(e => e.k === 'boss');
    for (const p of G.players) {
      if (!alive(p) || p.id === z.own) continue;
      const inside = z.k === 'tline' ? segDist(z.x, z.z, z.x + Math.cos(z.a) * z.len, z.z + Math.sin(z.a) * z.len, p.x, p.z) < z.w / 2 + 0.4 : Math.hypot(p.x - z.x, p.z - z.z) < z.r;
      if (inside && hurtPlayer(G, p, z.dmg * (z.own ? 0.7 : 1), src) > 0 && z.chill) p.chill = Math.max(p.chill || 0, z.chill);
    }
    ev(G, 'zfx', { f: z.fx, x: z.x, z: z.z, a: z.a, len: z.len, r: z.r });
  }
  for (const z of G.zones) if (z.t <= 0 && z.then === 'fire') { z.then = null; G.zones.push({ id: G.uid++, k: 'fire', x: z.x, z: z.z, r: z.r * 0.8, t: 5, delay: 0, tick: 0 }); }
  G.zones = G.zones.filter(z => z.t > 0);
  // 근위대장 돌진 준비
  for (const e of G.enemies) if (e.st === 'wind2') eliteWind(G, e, dt);
}

/* ---------- 봇 ---------- */
function inDanger(G, p) {
  for (const z of G.zones) {
    if ((z.k === 'tcircle' || z.k === 'rock') && z.t < 0.55 && Math.hypot(p.x - z.x, p.z - z.z) < z.r + 0.6) return Math.atan2(p.z - z.z, p.x - z.x);
    if (z.k === 'tcone' && z.t < 0.5 && Math.hypot(p.x - z.x, p.z - z.z) < z.r + 0.6 && angDiff(z.a, Math.atan2(p.z - z.z, p.x - z.x)) < z.arc / 2 + 0.2) return Math.atan2(p.z - z.z, p.x - z.x);
    if (z.k === 'tline' && z.t < 0.5) { const ex = z.x + Math.cos(z.a) * z.len, ez = z.z + Math.sin(z.a) * z.len; if (segDist(z.x, z.z, ex, ez, p.x, p.z) < z.w / 2 + 0.7) return z.a + Math.PI / 2 * (((p.x - z.x) * Math.sin(z.a) - (p.z - z.z) * Math.cos(z.a)) > 0 ? -1 : 1); }
    if (z.k === 'fire' && Math.hypot(p.x - z.x, p.z - z.z) < z.r + 0.4) return Math.atan2(p.z - z.z, p.x - z.x);
  }
  return null;
}
function moveTo(G, p, inp, gx, gz, near = 0.6) {
  const d = Math.hypot(gx - p.x, gz - p.z); if (d <= near) return false;
  const a = navDir(p.x, p.z, gx, gz, G.t); if (a == null) return false;
  inp.mx = Math.cos(a); inp.mz = Math.sin(a); return true;
}
// 봇이 조준할 곳이 없으면 걸어가는 쪽을 바라봐요
function botFace(inp) { if (inp.aim == null && Math.hypot(inp.mx || 0, inp.mz || 0) > 0.1) inp.aim = Math.atan2(inp.mz, inp.mx); return inp; }
function botThink(G, p, dt) {
  const inp = {}; if (p.dead || p.down) return inp;
  if (G.pvp) return botPvp(G, p, dt);
  const R = ROLES[p.role], ai = p.ai; ai.t -= dt;
  // 축복은 바로 골라요
  if (G.bless[p.id]) { const o = G.bless[p.id]; chooseBless(G, p.id, o[Math.floor(G.rng() * o.length)]); }
  if (G.phase === 'intro' || G.phase === 'wipe' || G.phase === 'won') return inp;
  const foes = G.enemies.filter(e => e.hp > 0 && e.st !== 'rise' && e.st !== 'sleep' && e.st !== 'home' && dist(p, e) < 18 && lineClear(p.x, p.z, e.x, e.z));
  const humans = G.players.filter(q => !q.bot && alive(q));
  const leader = humans[0] || G.players.find(q => q.bot && alive(q));
  // 너무 멀리 떨어지면 앞사람 곁으로 옮겨 와요
  if (leader && leader !== p && dist(p, leader) > 40 && !foes.length) { p.x = leader.x - Math.cos(leader.a) * 2 + (p.slot - 1.5); p.z = leader.z - Math.sin(leader.a) * 2; mapCollide(p, 0.6); }
  // 1) 위험 피하기
  const dz = inDanger(G, p);
  if (dz != null) { inp.mx = Math.cos(dz); inp.mz = Math.sin(dz); if (p.rollCd <= 0 && G.rng() < 0.5) inp.roll = true; if (p.role === 'knight' && G.enemies.some(e => e.k === 'boss' && e.atk && e.atk.k === 'charge') && p.cd.s0 <= 0) { inp.q = true; inp.mx = inp.mz = 0; } return inp; }
  // 2) 쓰러진 동료 일으키기
  const downed = G.players.find(q => q.down && !q.dead && dist(p, q) < 20);
  if (downed) {
    const near = foes.filter(e => dist(e, downed) < 3).length;
    if (p.role === 'priest' && p.cd.s2 <= 0 && dist(p, downed) < 5.5) { inp.r = true; return inp; }
    if (near < 2 || dist(p, downed) < 2) {
      if (!moveTo(G, p, inp, downed.x, downed.z, 1.4)) inp.f = true;
      return inp;
    }
  }
  // 사람이 합동기 짝 기술을 막 썼으면, 봇이 맞춰서 자기 짝 기술을 써 줘요
  const hk = G.sk.find(o => G.t - o.t < 0.7 && o.pid !== p.id && G.players.some(q => q.id === o.pid && !q.bot && alive(q) && dist(p, q) < 10));
  if (hk) for (const C of COMBOS) {
    const mine = C.a === hk.s ? C.b : C.b === hk.s ? C.a : null, si = mine ? R.skills.findIndex(x => x.id === mine) : -1;
    if (si < 0 || p.cd['s' + si] > 0) continue;
    inp.q = si === 0; inp.e = si === 1; inp.r = si === 2;
    if (mine === 'potion') { const z = G.zones.filter(zz => zz.k === 'rain').pop(); if (z) { inp.ax = z.x; inp.az = z.z; inp.aim = Math.atan2(z.z - p.z, z.x - p.x); } }
    return inp;
  }
  // 무너지는 성: 출구로 달려요
  if (G.esc) { moveTo(G, p, inp, G.esc.x, G.esc.z, 2); return inp; }
  // 3) 싸울 적이 없으면 앞사람을 따라가요. 앞장서는 봇은 정해진 길을 따라가요
  if (!foes.length && (botCut(G, p, inp, leader) || botPuzzle(G, p, inp, leader))) return inp;
  if (!foes.length) {
    if (leader === p) {
      // 이미 지나온 방의 길목이나, 다 올라온 승강기 아래층 길목은 건너뛰어요
      for (let la = areaAt(p.x, p.z); G.route < MAP.route.length - 1;) {
        const w = MAP.route[G.route], o = { x: cw(w[0]), z: cw(w[1]) }, wa = areaAt(o.x, o.z);
        if (wa >= 0 && la >= 0 && wa < la) G.route++;
        else if (wa >= 0 && wa === la && MAP.lifts.some((q, k) => q.area === wa && G.lifts[k].done && liftSide(q, p) === 1 && liftSide(q, o) !== 1)) G.route++;
        else break;
      }
      const wp = MAP.route[Math.min(G.route, MAP.route.length - 1)]; let wx = cw(wp[0]), wz = cw(wp[1]);
      // 끊어진 길 건너편이 목적지면 먼저 방 안(기둥 앞)까지 들어가요
      { const wa = areaAt(wx, wz); MAP.pits.forEach((q, k) => { if (!G.pits[k].down && q.area === wa && areaAt(p.x, p.z) !== q.area) { const o = pillarAt(k); wx = o.x; wz = o.z; } }); }
      if (Math.hypot(wx - p.x, wz - p.z) < 3 && G.route < MAP.route.length - 1) G.route++;
      moveTo(G, p, inp, wx, wz, 1);
    } else if (leader) {
      // 느슨하게 따라가요: 9m보다 멀어지면 출발하고 5m 안에 들면 멈춰요. 서 있는 자리는 봇마다 따로라서 내가 돌아도 우르르 움직이지 않아요
      const dl = dist(p, leader);
      if (dl > 9) ai.fol = true; else if (dl < 5) ai.fol = false;
      if (ai.fol) {
        const q = p.slot * 2.1 + 0.6, bx = leader.x + Math.cos(q) * 3.5, bz = leader.z + Math.sin(q) * 3.5;
        moveTo(G, p, inp, isWall(bx, bz) ? leader.x : bx, isWall(bx, bz) ? leader.z : bz, 1.2);
      } else {
        // 멈춰 있을 때는 가끔 근처를 몇 걸음 둘러봐요
        ai.wt = (ai.wt || 0) - dt;
        if (ai.wt <= 0) { ai.wt = 2.5 + G.rng() * 3; const r = G.rng(); ai.wa = r < 0.45 ? G.rng() * TAU : null; ai.wd = 0.5 + G.rng() * 0.6; }
        if (ai.wa != null && (ai.wd -= dt) > 0) { const nx = p.x + Math.cos(ai.wa) * 0.8, nz = p.z + Math.sin(ai.wa) * 0.8; if (!isWall(nx, nz) && Math.hypot(nx - leader.x, nz - leader.z) < 7) { inp.mx = Math.cos(ai.wa) * 0.45; inp.mz = Math.sin(ai.wa) * 0.45; inp.aim = ai.wa; } }
      }
    }
    return inp;
  }
  // 4) 싸우기
  let tgt = null, bd = 1e9; for (const e of foes) { let d = dist(p, e); if (e.k === 'boss') d -= 3; if (e.mark > 0) d -= 2; if (d < bd) { bd = d; tgt = e; } }
  const d = dist(p, tgt), ta = angTo(p, tgt); inp.aim = ta; inp.ax = tgt.x; inp.az = tgt.z;
  const ranged = R.atk.kind !== 'melee';
  let want = ranged ? 7 : (R.atk.range + tgt.r) * 0.75;
  // 보스 3단계: 근접 역할은 등 뒤로 돌아가요
  let gx = tgt.x - Math.cos(ta) * want, gz = tgt.z - Math.sin(ta) * want;
  if (tgt.k === 'boss' && tgt.phase >= 3 && p.role !== 'knight') { gx = tgt.x - Math.cos(tgt.a) * (ranged ? 6 : 2.6); gz = tgt.z - Math.sin(tgt.a) * (ranged ? 6 : 2.6); }
  if (ai.t <= 0) { ai.t = 0.4 + G.rng() * 0.3; ai.ox = (G.rng() - 0.5) * 2.4; ai.oz = (G.rng() - 0.5) * 2.4; }
  gx += ai.ox || 0; gz += ai.oz || 0;
  if (isWall(gx, gz)) { gx = tgt.x; gz = tgt.z; }
  moveTo(G, p, inp, gx, gz, 0.6);
  if (d < (ranged ? 13 : R.atk.range + tgt.r + 0.3)) { inp.atk = true; if (!ranged) inp.aim = ta; }
  const nearFoes = foes.filter(e => dist(p, e) < 6).length;
  const hurt = G.players.filter(q => alive(q) && q.hp < q.maxhp * 0.6);
  switch (p.role) {
    case 'knight': if (nearFoes >= 3 && p.cd.s2 <= 0) inp.r = true; else if (d > 3 && d < 7 && p.cd.s1 <= 0 && G.rng() < 0.02) inp.e = true; break;
    case 'archer': if (p.cd.s0 <= 0 && d < 12) inp.q = true; else if (p.cd.s1 <= 0 && nearFoes + foes.length >= 3) inp.e = true; else if (p.cd.s2 <= 0 && (tgt.k === 'boss' || tgt.k === 'elite')) inp.r = true; break;
    case 'priest': if (p.cd.s0 <= 0 && hurt.some(q => dist(p, q) < 6)) inp.q = true; else if (p.cd.s1 <= 0 && (foes.some(e => e.k === 'boss') || foes.length >= 4)) inp.e = true; break;
    case 'squire': {
      const low = hurt.find(q => dist(p, q) < 9); if (low && p.cd.s0 <= 0) { inp.q = true; inp.ax = low.x; inp.az = low.z; inp.aim = angTo(p, low); }
      else if (p.cd.s1 <= 0 && nearFoes >= 2) inp.e = true; else if (p.cd.s2 <= 0 && foes.length >= 3) inp.r = true; break;
    }
  }
  return inp;
}

// 대전 봇: 가까운 상대에게 다가가 싸우고, 틈틈이 기술을 써요
// 대전 봇: 날아오는 화살 피하기, 체력이 낮으면 물러나 회복, 움직이는 상대를 앞질러 조준, 상황에 맞춰 기술 쓰기
function safeDir(G, p, a) {
  for (const da of [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9]) { const b = a + da; if (!isWall(p.x + Math.cos(b) * 1.8, p.z + Math.sin(b) * 1.8)) return b; }
  return a;
}
function botPvp(G, p, dt) {
  const inp = {}, R = ROLES[p.role], ai = p.ai; ai.t -= dt; ai.cmbT = 1; ai.rush = (ai.rush || 0) - dt;
  if (G.phase !== 'play') return inp;
  const foes = G.players.filter(q => q !== p && alive(q)); if (!foes.length) return inp;
  let tgt = null, bs = 1e9;
  for (const q of foes) { const s = dist(p, q) + (q.hp / q.maxhp) * 7 - (q === ai.tg ? 3 : 0); if (s < bs) { bs = s; tgt = q; } }
  ai.tg = tgt;
  const d = dist(p, tgt), ta = angTo(p, tgt), ranged = R.atk.kind !== 'melee', clear = lineClear(p.x, p.z, tgt.x, tgt.z);
  const near = foes.filter(q => dist(p, q) < 6).length, low = p.hp < p.maxhp * 0.22 && tgt.hp / tgt.maxhp > p.hp / p.maxhp * 1.4, nearest = foes.reduce((m, q) => dist(p, q) < dist(p, m) ? q : m, foes[0]);
  // 앞질러 조준: 상대가 움직이는 방향으로 조금 앞을 겨눠요
  const sp = R.atk.speed || 20, lt = Math.min(0.6, d / sp), px = tgt.x + (tgt.vx || 0) * lt * 0.9, pz = tgt.z + (tgt.vz || 0) * lt * 0.9;
  inp.aim = Math.atan2(pz - p.z, px - p.x); inp.ax = px; inp.az = pz;
  // 1) 바닥 경고 피하기
  const dz = inDanger(G, p);
  if (dz != null) { const a = safeDir(G, p, dz); inp.mx = Math.cos(a); inp.mz = Math.sin(a); if (p.rollCd <= 0 && G.rng() < 0.5) inp.roll = true; return inp; }
  // 2) 날아오는 화살·구슬 피하기
  for (const pr of G.projs) {
    if (pr.own === p.id || pr.vx == null) continue;
    if (ai.pj !== pr.id) { ai.pj = pr.id; ai.pjOk = G.rng() < (ranged || d > 4 ? 0.4 : 0.15); }   // 날아오는 걸 알아채는 건 열에 여섯 번쯤이에요
    if (!ai.pjOk || ai.rush > 0) continue;   // 몰아칠 때는 날아오는 것도 무시하고 파고들어요
    const rx = p.x - pr.x, rz = p.z - pr.z, v2 = pr.vx * pr.vx + pr.vz * pr.vz; if (v2 < 1) continue;
    const t = (rx * pr.vx + rz * pr.vz) / v2; if (t < 0 || t > 0.55) continue;
    const cx = rx - pr.vx * t, cz = rz - pr.vz * t, cd = Math.hypot(cx, cz);
    if (cd < 1.5) {
      const a = Math.atan2(pr.vz, pr.vx) + (cx * pr.vz - cz * pr.vx > 0 ? -1 : 1) * Math.PI / 2;
      inp.mx = Math.cos(a); inp.mz = Math.sin(a); if (p.rollCd <= 0 && t < 0.3 && G.rng() < 0.7) inp.roll = true; break;
    }
  }
  if (ai.t <= 0) { ai.t = 0.4 + G.rng() * 0.5; ai.sd = G.rng() < 0.5 ? 1 : -1; ai.hold = G.rng() < 0.15; if (!(ai.rush > 0) && G.rng() < 0.45) ai.rush = 2.5 + G.rng() * 2; }
  const want = ranged ? 6.5 : (R.atk.range + 0.7) * 0.8;
  if (inp.mx == null) {
    if (low && d < 12) { const a = safeDir(G, p, Math.atan2(p.z - nearest.z, p.x - nearest.x)); inp.mx = Math.cos(a); inp.mz = Math.sin(a); if (d < 3 && p.rollCd <= 0 && G.rng() < 0.05) inp.roll = true; }   // 체력이 낮으면 물러나요 (맞지 않고 4초가 지나면 저절로 차올라요)
    else if (ai.rush > 0 && d > (ranged ? 4 : 1.6)) moveTo(G, p, inp, tgt.x, tgt.z, ranged ? 3.5 : 1.2);
    else if (d > want + 1.5 || !clear) moveTo(G, p, inp, tgt.x, tgt.z, 0.6);
    else if (ranged && d < 3.2 && d > 1.5) { const a = safeDir(G, p, ta + Math.PI); inp.mx = Math.cos(a); inp.mz = Math.sin(a); }
    else if (!ai.hold) { inp.mx = -Math.sin(ta) * ai.sd * 0.8 + Math.cos(ta) * 0.2; inp.mz = Math.cos(ta) * ai.sd * 0.8 + Math.sin(ta) * 0.2; }
    // 멀리서 구르며 파고들기
    if (!ranged && d > 7 && p.rollCd <= 0 && G.rng() < 0.02) inp.roll = true;
  }
  if (clear && d < (ranged ? 14 : R.atk.range + 0.9) && !(low && d > 4)) {
    if (p.role === 'archer') {   // 사냥꾼은 쉬지 않고 쏘지 않고, 잠깐 겨눴다가 한 번 쏘고 숨을 골라요
      ai.fireT = (ai.fireT || 0) - dt; if (ai.fireT <= -1.1) ai.fireT = 0.35 + G.rng() * 0.3;
      if (ai.fireT > 0 && d < 12) inp.atk = true;
    } else inp.atk = true;
  }
  R.skills.forEach((S, i) => {
    if (p.cd['s' + i] > 0 || (!clear && S.id !== 'heal' && S.id !== 'ward')) return;
    let go = false; const r = G.rng(), hpf = p.hp / p.maxhp;
    switch (S.id) {
      case 'block': go = d < 4 && hpf < 0.8 && r < 0.03; break;
      case 'shieldbash': go = d < 2.8 && r < 0.3; break;
      case 'dash': go = d > 4 && d < 8 && r < 0.15; break;
      case 'taunt': go = d < 6 && hpf < 0.7 && r < 0.1; break;
      case 'rally': go = d < 11 && r < 0.1; break;
      case 'pierce': go = d < 16 && r < 0.25; break;
      case 'rain': case 'potion': go = d < 12 && r < 0.14; break;
      case 'mark': go = d < 15 && r < 0.2; break;
      case 'heal': go = hpf < 0.6 && r < 0.3; break;
      case 'ward': go = d < 10 && hpf < 0.9 && r < 0.12; break;
      case 'smite': case 'curse': go = d < 12 && r < 0.16; break;
      case 'frost': go = d < 12 && r < 0.15; break;
      case 'whirl': go = d < 3.2 && r < 0.25; break;
      case 'bonestorm': go = d < 3.2 && r < 0.2; break;
      case 'leap': go = d > 3.5 && d < 9 && r < 0.15; break;
      case 'bloodlust': go = d < 5 && hpf < 0.9 && r < 0.1; break;
      case 'flurry': go = d < 3 && r < 0.25; break;
      case 'blink': go = d > 4 && d < 12 && r < 0.12; break;
      case 'scatter': go = d < 3 && hpf < 0.5 && r < 0.3; break;
      case 'fan': go = d < 12 && r < 0.2; break;
      case 'quake': go = d < 4.2 && r < 0.25; break;
    }
    if (go) { inp[i === 0 ? 'q' : i === 1 ? 'e' : 'r'] = true; }
  });
  return inp;
}

/* ---------- 네트워크용 요약 ---------- */
const r1 = v => Math.round(v * 100) / 100;
// 멀리서 잠든 적은 보내지 않아요 (주고받는 양을 줄여요)
export function snapshot(G) {
  const near = e => e.k === 'boss' || (e.st !== 'sleep') || G.players.some(p => Math.abs(p.x - e.x) < 34 && Math.abs(p.z - e.z) < 26);
  return {
    pv: G.pvp ? 1 : 0, win: G.winner || 0, t: r1(G.t), ph: G.phase, pt: r1(G.phaseT), c: G.ch, dp: G.deep, wk: G.weekly, wt: r1(G.winT || 0), msg: G.msg, won: G.won,
    sk: G.players.filter(p => !p.bot && G.skip[p.id]).length, hu: G.players.filter(p => !p.bot).length,
    pl: G.players.map(p => ({ id: p.id, role: p.role, col: p.col, cos: p.cos, name: p.name, bot: p.bot, x: r1(p.x), z: r1(p.z), a: r1(p.a), hp: Math.round(p.hp), mx: p.maxhp, dn: p.down ? 1 : 0, dd: p.dead ? 1 : 0, bl: r1(p.bleed), rs: r1(p.respT), rv: r1(p.revT), ro: p.roll > 0 ? 1 : 0, bk: p.block > 0 ? 1 : 0, sh: Math.round(p.shield), tn: p.taunt > 0 ? 1 : 0, ra: p.rally > 0 ? 1 : 0, an: p.animT > 0 ? p.anim : '', aN: p.animN || 0, ak: p.anim, mv: p.moving ? 1 : 0, cd: [r1(p.cd.s0), r1(p.cd.s1), r1(p.cd.s2)], rc: r1(p.rollCd), b: p.bl, cb: p.comboT > 0 ? p.combo : 0, ac: p.animC || 0, fc: p.focus > 0 ? 1 : 0, tc: p.torch || 0, cg: p.chg > 0 ? r1(p.chg) : 0, cl: p.chill > 0 ? 1 : 0, em: p.emb ? 1 : 0, kl: p.kills | 0, pc: p.place | 0, sv: r1(p.survT || 0), bn: p.burn > 0 ? 1 : 0, sw: p.slow > 0 ? 1 : 0 })),
    en: G.enemies.filter(e => e.k !== 'dummy' && near(e)).map(e => ({ id: e.id, k: e.k, x: r1(e.x), z: r1(e.z), a: r1(e.a), hp: Math.round(e.hp), mx: e.maxhp, st: e.st, mk: e.mark > 0 ? 1 : 0, sn: e.stun > 0 ? 1 : 0, sl: e.slow > 0 ? 1 : 0, bu: e.burn > 0 ? 1 : 0, ph: e.phase || 0, mb: e.mb || 0, mv: e.moving ? 1 : 0, ak: e.atk ? e.atk.k + (e.atk.go ? '!' : '') : '', ht: e.hitT > 0 ? 1 : 0 })),
    pr: G.projs.map(p => ({ id: p.id, k: p.k, x: r1(p.x), z: r1(p.z), y: r1(p.y || 0), bg: p.big ? 1 : 0, a: r1(Math.atan2(p.vz || (p.tz - p.sz) || 0, p.vx || (p.tx - p.sx) || 1)) })),
    zn: G.zones.map(z => ({ id: z.id, k: z.k, x: r1(z.x), z: r1(z.z), r: z.r, a: z.a, len: z.len, w: z.w, arc: z.arc, t: r1(z.t), T: z.T, dl: z.delay > 0 ? 1 : 0 })),
    w: { fk: G.fork ? [G.fork.pick, r1(G.fork.prog[0]), r1(G.fork.prog[1])] : 0, cp: G.cpI, fi: G.fires.map(f => f.lit ? 1 : 0), al: G.altars.map(a => a.used ? 1 : 0), ap: G.altars.map(a => r1(a.prog)), ch: G.chests.map(c => c.open ? 1 : 0), cp2: G.chests.map(c => r1(c.prog)), tr: G.traps.map(t => (t.on ? 1 : 0) + (t.up ? 2 : 0)), boss: G.bossIntro ? 1 : 0, bd: G.bossDead ? 1 : 0, sc: G.secrets.map(q => q.open ? 1 : 0), lr: G.lores.map(q => q.read ? 1 : 0), pz: G.puz.map(q => ({ d: q.done ? 1 : 0, o: q.occ.join(''), l: q.lit.join(''), r: q.rot.join(''), v: q.pg.map(v => Math.min(9, Math.floor(v * 10))).join(''), c: q.ct.map(v => Math.ceil(v)).join(',') })), es: G.esc ? [r1(G.esc.t), G.esc.T] : 0, fl: G.flag ? [r1(G.flag.x), r1(G.flag.z), G.flag.by, r1(G.flag.prog), G.flag.got] : 0, pt: G.pits.map(q => q.down ? -1 : q.hits), lf: G.lifts.map(q => [r1(q.h), q.done ? 1 : 0, q.mv]), left: G.pvp ? G.players.filter(alive).length : G.enemies.filter(e => e.hp > 0 && !e.summoned && e.k !== 'boss').length },
    bless: G.bless, honor: G.honor
  };
}
export { ROLE_IDS };

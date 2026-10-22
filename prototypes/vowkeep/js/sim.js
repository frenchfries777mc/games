// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 규칙 (방장·혼자 하기에서만 돌아가요). three.js를 쓰지 않아서 node에서도 시험할 수 있어요.
import { ROLES, ROLE_IDS, ENEMIES, BLESSINGS, CHAPTERS, FOES, MAP, GEAR_BONUS } from './data.js';
import { collide as mapCollide, isWall, lineClear, navDir, areaAt, cw, useChapter, PILLARS } from './map.js';

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
  const C = CHAPTERS[ch], F = FOES[ch] || FOES[0], o = {};
  for (const k of ['skel', 'archer', 'shield', 'elite']) {
    const b = ENEMIES[k], f = F[k] || {};
    o[k] = Object.assign({}, b, { name: f.name || b.name, hp: Math.round(b.hp * (f.hp || 1) * C.diff), dmg: Math.round(b.dmg * C.diff), speed: b.speed * (f.speed || 1), r: f.r || b.r, proj: f.proj || 'earrow', psp: f.psp || 17 });
  }
  o.boss = Object.assign({}, ENEMIES.boss, C.boss, { honor: 0 });
  return o;
}
export function createGame(slots, seed, ch = 0) {
  useChapter(ch);
  const G = {
    ch, CH: CHAPTERS[ch], EN: enemyStats(ch), bossArea: MAP.areas.findIndex(a => a.boss),
    t: 0, rng: mkRng(seed || Date.now()), phase: 'intro', phaseT: 0,
    players: [], enemies: [], projs: [], zones: [], ev: [], uid: 1, msg: '', stats: { downs: 0, kills: 0 },
    humans: slots.filter(s => !s.bot).length, bless: {}, honor: {}, won: false,
    skip: {}, cp: { x: cw(MAP.start[0]), z: cw(MAP.start[1]) }, cpI: -1, bossIntro: false, bossDead: false, route: 0,
    fires: MAP.fires.map(([x, y]) => ({ x: cw(x), z: cw(y), lit: false })),
    altars: MAP.altars.map(([x, y]) => ({ x: cw(x), z: cw(y), used: false, prog: 0 })),
    chests: MAP.chests.map(([x, y]) => ({ x: cw(x), z: cw(y), open: false, prog: 0 })),
    traps: MAP.traps.map(([x, y], i) => ({ id: i, x: cw(x), z: cw(y), on: true, t: i * 0.7, up: false }))
  };
  slots.forEach((s, i) => {
    const R = ROLES[s.role], lv = s.lv || 1, gear = s.gear || { weapon: 0, armor: 0 };
    const maxhp = Math.round(R.hp * (1 + 0.03 * (lv - 1)) + GEAR_BONUS.armor[gear.armor | 0]);
    G.players.push({
      id: s.id, role: s.role, name: s.name, bot: !!s.bot, slot: i, x: 0, z: 0, vx: 0, vz: 0, a: -Math.PI / 2,
      hp: maxhp, maxhp, baseHp: maxhp, down: false, dead: false, bleed: 0, revT: 0, respT: 0, roll: 0, rollCd: 0, inv: 0,
      cd: { atk: 0, s0: 0, s1: 0, s2: 0 }, block: 0, taunt: 0, rally: 0, shield: 0, shieldT: 0,
      dmgMul: 1 + 0.03 * (lv - 1) + GEAR_BONUS.weapon[gear.weapon | 0], bl: [], anim: '', animT: 0, hitT: 0,
      ai: { t: 0, tx: 0, tz: 0, target: 0 }, everDown: false
    });
    G.honor[s.id] = 0;
  });
  placeAt(G, G.cp);
  // 몬스터는 지도에 정해진 자리에 한 번만 나와요
  for (const [k, x, y] of MAP.spawns) spawnEnemy(G, k, cw(x), cw(y), true);
  const b = spawnEnemy(G, 'boss', cw(MAP.boss[0]), cw(MAP.boss[1]), true); b.a = Math.PI / 2;
  return G;
}
function placeAt(G, c) {
  G.players.forEach((p, i) => { p.x = c.x - 3 + i * 2; p.z = c.z + (i % 2) * 0.8; p.vx = p.vz = 0; p.a = -Math.PI / 2; p.roll = 0; mapCollide(p, 0.6); });
}

function hasB(p, id) { return p.bl.indexOf(id) >= 0; }
function ev(G, k, o) { G.ev.push(Object.assign({ k }, o || {})); }
function alive(p) { return !p.down && !p.dead; }
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
  p.hp -= d; p.hitT = 0.25; ev(G, 'phit', { id: p.id, x: p.x, z: p.z, v: d });
  if (hasB(p, 'thorn') && src && src.hp > 0 && src.id) hurtEnemy(G, src, 8, null, {});
  if (p.hp <= 0) { p.hp = 0; p.down = true; p.bleed = 20; p.revT = 0; p.everDown = true; G.stats.downs++; ev(G, 'down', { id: p.id, x: p.x, z: p.z }); }
  return d;
}
function hurtEnemy(G, e, dmg, p, o) {
  if (e.hp <= 0 || e.st === 'rise') return 0;
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
  if (p && hasB(p, 'leech') && alive(p)) p.hp = Math.min(p.maxhp, p.hp + 1);
  if ((o.burn || (p && hasB(p, 'fire') && o.basic)) && e.hp > 0) { e.burn = 3; }
  if (o.kb && e.k !== 'boss') { e.vx += Math.cos(o.kbA) * o.kb; e.vz += Math.sin(o.kbA) * o.kb; }
  if (e.hp <= 0) killEnemy(G, e);
  return d;
}
function killEnemy(G, e) {
  e.hp = 0; G.stats.kills++; ev(G, 'ekill', { x: e.x, z: e.z, en: e.k, id: e.id }); ev(G, 'ach', { id: 'room1' });
  const h = G.EN[e.k].honor; for (const p of G.players) G.honor[p.id] += h;
  if (e.k === 'elite') ev(G, 'ach', { id: 'elite' });
  if (e.k === 'boss') { G.bossDead = true; for (const o of G.enemies) if (o !== e && o.hp > 0 && o.summoned) { o.hp = 0; ev(G, 'ekill', { x: o.x, z: o.z, en: o.k, id: o.id }); } }
}

/* ---------- 플레이어 행동 ---------- */
function cdMul(p, which) { return which === 'atk' ? (hasB(p, 'hands') ? 0.85 : 1) : (hasB(p, 'focus') ? 0.85 : 1); }
function aimPoint(p, inp, range) {
  if (inp.ax != null) { const d = Math.hypot(inp.ax - p.x, inp.az - p.z); if (d <= range) return { x: inp.ax, z: inp.az }; }
  return { x: p.x + Math.cos(p.a) * range, z: p.z + Math.sin(p.a) * range };
}
function basicAttack(G, p, inp) {
  const R = ROLES[p.role], A = R.atk;
  p.cd.atk = A.cd * cdMul(p, 'atk');
  // 기사 3단 베기: 공격, 공격, 강타 뒤 처음부터 (1.2초 쉬면 처음부터). 봇은 쓰지 않아요
  // 사제·종자: 세 번째 공격마다 크게 휘두르는 큰 공격 (피해 1.5배). 봇은 쓰지 않아요
  const cmb = !p.bot && (p.role === 'knight' || p.role === 'priest' || p.role === 'squire'), aid = p.atkN = (p.atkN || 0) + 1;
  if (cmb) { p.combo = p.comboT > 0 ? ((p.combo || 0) + 1) % 3 : 0; p.comboT = 1.2; }
  const third = cmb && p.combo === 2, heavy = third && p.role === 'knight', big = third && !heavy, hm = big ? 1.5 : 1;
  p.anim = heavy ? 'hv' : big ? 'big' : 'atk'; p.animT = heavy ? 0.95 : big ? 0.6 : 0.32; p.animN = (p.animN || 0) + 1;
  // 강타는 조준한 쪽으로 실제로 뛰어올라 날아가서, 땅에 내려찍는 순간 맞아요
  if (heavy) { p.hvT = HV_DELAY; p.hvAid = aid; const L = leapDist(p, inp && inp.ax, inp && inp.az); p.lpx = Math.cos(p.a) * L / HV_DELAY; p.lpz = Math.sin(p.a) * L / HV_DELAY; return; }
  if (big) ev(G, 'big', { id: p.id, role: p.role, x: p.x + Math.cos(p.a) * 1.4, z: p.z + Math.sin(p.a) * 1.4, a: p.a });
  if (A.kind === 'melee') {
    ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: A.range * (big ? 1.3 : 1), role: p.role });
    for (const e of G.enemies) { if (e.hp <= 0) continue; const d = dist(p, e); if (d < A.range * (big ? 1.3 : 1) + e.r && angDiff(p.a, angTo(p, e)) < A.arc / 2 + (big ? 0.7 : 0.25)) hurtEnemy(G, e, A.dmg * hm, p, { basic: true, aid, burn: A.burn, kb: big ? 6 : 3, kbA: angTo(p, e) }); }
  } else {
    G.projs.push({ id: G.uid++, k: A.kind, big: big ? 1 : 0, own: p.id, x: p.x + Math.cos(p.a) * 0.8, z: p.z + Math.sin(p.a) * 0.8, vx: Math.cos(p.a) * A.speed, vz: Math.sin(p.a) * A.speed, dmg: A.dmg * hm, life: 1.1, hit: [], basic: true, aid, team: 0 });
    ev(G, 'shoot', { id: p.id, pk: A.kind, x: p.x, z: p.z });
  }
}
export const HV_DELAY = 0.36, LEAP_MAX = 4.5, HV_R = 3.2;
// 뛰는 거리: 조준한 곳 바로 앞까지, 최대 4.5m
export function leapDist(p, ax, az) { if (ax == null || !isFinite(ax)) return LEAP_MAX; return Math.max(0, Math.min(LEAP_MAX, Math.hypot(ax - p.x, az - p.z) - 1.2)); }
function heavyLand(G, p) {
  const A = ROLES[p.role].atk;
  ev(G, 'heavy', { id: p.id, x: p.x + Math.cos(p.a) * 1.6, z: p.z + Math.sin(p.a) * 1.6, a: p.a });
  ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: A.range, role: p.role });
  // 내려찍은 자리 둘레 전부를 쳐요 (피해 3.4배), 맞은 적은 느려져요 (보스는 덜, 짧게)
  const cx = p.x + Math.cos(p.a) * 1.2, cz = p.z + Math.sin(p.a) * 1.2;
  for (const e of G.enemies) { if (e.hp <= 0) continue; if (Math.hypot(e.x - cx, e.z - cz) < HV_R + e.r) { const kbA = Math.atan2(e.z - cz, e.x - cx); hurtEnemy(G, e, A.dmg * 3.4, p, { basic: true, aid: p.hvAid, heavy: true, burn: A.burn, kb: 7, kbA }); if (e.hp > 0) { const boss = e.k === 'boss'; e.slow = boss ? 1.5 : 2.5; e.slowM = boss ? 0.75 : 0.5; } } }
}
function useSkill(G, p, si, inp) {
  const R = ROLES[p.role], S = R.skills[si], key = 's' + si;
  if (p.cd[key] > 0) return;
  p.cd[key] = S.cd * cdMul(p, 'skill'); p.anim = S.id; p.animT = 0.8; p.animN = (p.animN || 0) + 1;
  ev(G, 'skill', { id: p.id, s: S.id, x: p.x, z: p.z, a: p.a });
  switch (S.id) {
    case 'block': p.block = 1.2; break;
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
      for (const e of G.enemies) { if (e.hp <= 0) continue; const s = angDiff(p.a, angTo(p, e)) * 8 + dist(p, e); if (s < bs) { bs = s; best = e; } }
      if (best) { best.mark = 6; ev(G, 'mark', { id: best.id, x: best.x, z: best.z }); }
      break;
    }
    case 'heal': for (const q of G.players) if (alive(q) && dist(p, q) < 6) { q.hp = Math.min(q.maxhp, q.hp + 35); ev(G, 'heal', { id: q.id, x: q.x, z: q.z, v: 35 }); } break;
    case 'ward': for (const q of G.players) if (alive(q) && dist(p, q) < 7.5) { q.shield = 25; q.shieldT = 5; ev(G, 'ward', { id: q.id }); } break;
    case 'raise': {
      let n = 0; for (const q of G.players) if (q.down && !q.dead && dist(p, q) < 8) { revive(G, q, 0.4, p); n++; }
      if (!n) p.cd[key] = 2; // 아무도 없으면 대기 시간을 거의 쓰지 않아요
      break;
    }
    case 'potion': { const q = aimPoint(p, inp, 9); G.projs.push({ id: G.uid++, k: 'potion', own: p.id, x: p.x, z: p.z, tx: q.x, tz: q.z, sx: p.x, sz: p.z, t: 0, T: 0.55, team: 0 }); break; }
    case 'trap': G.zones.push({ id: G.uid++, k: 'ptrap', x: p.x, z: p.z, r: 1.4, t: 20, own: p.id }); break;
    case 'rally': for (const q of G.players) if (alive(q) && dist(p, q) < 9) { q.rally = 6; ev(G, 'rally', { id: q.id }); } break;
  }
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
  for (const p of G.players) if (p.bot) inputs[p.id] = botThink(G, p, dt);

  // 이야기 건너뛰기: 사람 모두가 누르면 넘어가요
  if (G.phase === 'intro') {
    for (const p of G.players) if (!p.bot && inputs[p.id] && inputs[p.id].skip) G.skip[p.id] = 1;
    const hum = G.players.filter(p => !p.bot);
    if (G.phaseT > INTRO_T || (hum.length && hum.every(p => G.skip[p.id]))) { G.phase = 'play'; G.phaseT = 0; ev(G, 'start', {}); }
    return;
  }
  if (G.phase === 'wipe') { if (G.phaseT > 3) respawnAll(G); return; }
  if (G.phase === 'won') return;
  if (G.phase === 'bossIntro' && G.phaseT > 3.2) { G.phase = 'play'; G.phaseT = 0; const b = G.enemies.find(e => e.k === 'boss' && e.hp > 0); if (b) { wake(G, b); ev(G, 'roar', {}); } }

  // 플레이어
  for (const p of G.players) stepPlayer(G, p, inputs[p.id] || {}, dt);

  // 보스 방에 들어가면 단장이 깨어나요
  if (!G.bossIntro && !G.bossDead && G.players.some(p => alive(p) && inTrig(p))) { G.bossIntro = true; G.phase = 'bossIntro'; G.phaseT = 0; ev(G, 'bossIntro', {}); }

  // 적: 깨어 있거나 가까운 적만 움직여요
  for (const e of G.enemies) if (e.hp > 0) stepEnemy(G, e, dt);
  G.enemies = G.enemies.filter(e => e.hp > 0 || (e.dieT = (e.dieT || 0) + dt) < 1.2);

  stepProjs(G, dt); stepZones(G, dt);

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
      if (f.lit && d < 4) p.hp = Math.min(p.maxhp, p.hp + 5 * dt);
    }
    if (f.lit && i > G.cpI) { G.cpI = i; G.cp = { x: f.x, z: f.z + 2.5 }; }
  });

  // 전멸 확인
  if ((G.phase === 'play' || G.phase === 'bossIntro') && G.players.every(p => !alive(p))) { G.phase = 'wipe'; G.phaseT = 0; ev(G, 'wipe', {}); }
  if (G.bossDead && !G.won && !G.enemies.some(e => e.k === 'boss')) win(G);
}

function inTrig(p) { const [x, y, w, h] = MAP.bossTrig, i = p.x / 2, j = p.z / 2; return i >= x && i < x + w && j >= y && j < y + h; }
function win(G) {
  for (const p of G.players) G.honor[p.id] += 90;
  G.won = true; G.phase = 'won'; G.phaseT = 0; ev(G, 'won', {});
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
  G.phase = 'play'; G.phaseT = 0; ev(G, 'restart', {});
}
function resetEnemy(e) {
  e.keepHp = e.hp; e.x = e.hx; e.z = e.hz; e.hp = e.maxhp; e.st = 'sleep'; e.vx = e.vz = 0; e.burn = e.mark = e.stun = e.root = e.slow = 0; e.tauntT = 0; e.charging = false;
  // 보스는 깎아 둔 체력과 단계를 그대로 두고 조금만 회복해요
  if (e.k === 'boss') { e.hp = Math.min(e.maxhp, e.keepHp + e.maxhp * 0.05); e.atk = null; e.summonT = 10; e.fireT = 5; e.cdT = 0; e.a = Math.PI / 2; }
}

function stepPlayer(G, p, inp, dt) {
  for (const k in p.cd) if (p.cd[k] > 0) p.cd[k] -= dt;
  ['block', 'taunt', 'rally', 'inv', 'hitT', 'animT', 'rollCd', 'focus', 'pdCd'].forEach(k => { if (p[k] > 0) p[k] = Math.max(0, p[k] - dt); });
  if (p.comboT > 0) { p.comboT -= dt; if (p.comboT <= 0) p.combo = 0; }
  if (p.hvT > 0) { p.hvT -= dt; if (p.hvT <= 0) { p.hvT = 0; if (!p.down && !p.dead) heavyLand(G, p); } }
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
  const R = ROLES[p.role];
  let sp = R.speed * (hasB(p, 'feet') ? 1.12 : 1) * (p.rally > 0 ? 1.3 : 1) * (p.block > 0 ? 0.8 : 1);
  if (inp.aim != null && isFinite(inp.aim)) p.a = inp.aim;
  if (inp.px != null && isFinite(inp.px)) {
    // 원격 플레이어: 자기 화면에서 움직인 위치를 믿되, 너무 멀리 뛰면 막아요
    const d = Math.hypot(inp.px - p.x, inp.pz - p.z), maxd = 22 * dt + 1.2;
    if (d <= maxd) { p.x = inp.px; p.z = inp.pz; } else { p.x += (inp.px - p.x) / d * maxd; p.z += (inp.pz - p.z) / d * maxd; }
    collide(G, p, 0.6);
    if (inp.roll && p.rollCd <= 0) { p.roll = 0.35; p.rollCd = 1.2 * (hasB(p, 'roll') ? 0.6 : 1); ev(G, 'roll', { id: p.id }); }
    if (p.roll > 0) p.roll -= dt;
  } else {
    let mx = inp.mx || 0, mz = inp.mz || 0; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    if (inp.roll && p.rollCd <= 0 && p.roll <= 0 && !(p.hvT > 0)) {
      p.roll = 0.35; p.rollCd = 1.2 * (hasB(p, 'roll') ? 0.6 : 1);
      const ra = ml > 0.1 ? Math.atan2(mz, mx) : p.a; p.rdx = Math.cos(ra); p.rdz = Math.sin(ra); ev(G, 'roll', { id: p.id });
    }
    if (p.hvT > 0) { p.x += p.lpx * dt; p.z += p.lpz * dt; }
    else if (p.roll > 0) { p.roll -= dt; p.x += p.rdx * 15 * dt; p.z += p.rdz * 15 * dt; }
    else { p.x += mx * sp * dt; p.z += mz * sp * dt; }
    p.moving = ml > 0.1;
    collide(G, p, 0.6);
  }
  p.f = !!inp.f;
  if (p.roll > 0) return;
  if (G.phase !== 'play' && G.phase !== 'bossIntro') return;
  if (inp.atk && p.cd.atk <= 0 && p.block <= 0) basicAttack(G, p, inp);
  if (inp.q) useSkill(G, p, 0, inp);
  if (inp.e) useSkill(G, p, 1, inp);
  if (inp.r) useSkill(G, p, 2, inp);
  // 상자와 제단: F를 꾹 눌러요
  for (const ch of G.chests) {
    if (ch.open || !inp.f || Math.hypot(p.x - ch.x, p.z - ch.z) > 2.2) continue;
    ch.prog += dt; if (ch.prog > 1.2) { ch.open = true; for (const q of G.players) G.honor[q.id] += 25; ev(G, 'chest', { x: ch.x, z: ch.z }); }
  }
  for (const al of G.altars) {
    if (al.used || !inp.f || Math.hypot(p.x - al.x, p.z - al.z) > 2.4) continue;
    al.prog += dt; if (al.prog > 1) { al.used = true; for (const q of G.players) G.honor[q.id] += 10; offerBless(G); ev(G, 'altar', { x: al.x, z: al.z }); }
  }
}
function inputs_f(q) { return q.f; }

/* ---------- 적 ---------- */
function pickTarget(G, e) {
  if (e.tauntT > 0) { const t = G.players.find(p => p.id === e.tgt && alive(p)); if (t) return t; }
  let best = null, bd = 1e9;
  for (const p of G.players) { if (!alive(p)) continue; let d = dist(e, p); if (p.taunt > 0) d -= 6; if (d < bd) { bd = d; best = p; } }
  return best;
}
function stepEnemy(G, e, dt) {
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
  // 함정
  for (const z of G.zones) if (z.k === 'ptrap' && Math.hypot(z.x - e.x, z.z - e.z) < z.r) { e.root = 2; hurtEnemy(G, e, 25, G.players.find(p => p.id === z.own), {}); z.t = 0; ev(G, 'snap', { x: z.x, z: z.z }); if (e.hp <= 0) return; }
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
    if (e.k === 'elite' && d > 4 && d < 11 && G.rng() < 0.5) { e.st = 'chargeWind'; }
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
  const np = f > 0.6 ? 1 : f > 0.3 ? 2 : 3;
  if (np !== b.phase) { b.phase = np; ev(G, 'bphase', { p: np }); b.cdT = 1.2; b.atk = null; b.st = 'idle'; if (np === 2) b.summonT = 1; if (np === 3) b.fireT = 1; }
  if (b.stun > 0) { b.atk = null; b.st = 'stun'; return; }
  if (b.st === 'stun') b.st = 'idle';
  let t = null, bd = 1e9; for (const p of G.players) { if (!alive(p) || areaAt(p.x, p.z) !== G.bossArea) continue; const dd = dist(b, p) - (p.taunt > 0 ? 6 : 0); if (dd < bd) { bd = dd; t = p; } }
  if (!t) { b.atk = null; const hd = Math.hypot(b.hx - b.x, b.hz - b.z); if (hd > 1) { const a = Math.atan2(b.hz - b.z, b.hx - b.x); b.x += Math.cos(a) * 3 * dt; b.z += Math.sin(a) * 3 * dt; b.a = a; b.moving = true; } else b.moving = false; return; }
  const K = B.dmg / 55, ai = B.ai || 'warden', d = dist(b, t), ta = angTo(b, t);
  // 부하 부르기 (2단계부터)
  if (b.phase >= 2) { b.summonT -= dt; if (b.summonT <= 0) { b.summonT = ai === 'bishop' ? 13 : 15; const n = 3; for (let i = 0; i < n; i++) { const a = i / n * TAU + G.rng(); let sx = b.x + Math.cos(a) * 4, sz = b.z + Math.sin(a) * 4; if (isWall(sx, sz) || !lineClear(b.x, b.z, sx, sz)) { sx = b.x; sz = b.z; } spawnEnemy(G, i === n - 1 && G.rng() < 0.6 ? 'archer' : 'skel', sx, sz, false); } ev(G, 'summon', {}); } }
  // 3단계: 보스마다 다른 바닥 공격
  if (b.phase >= 3) {
    b.fireT -= dt;
    if (b.fireT <= 0) {
      if (ai === 'warden') { b.fireT = 2.4; fireTrail(G, b, t); }
      else if (ai === 'hunter') { b.fireT = 5.5; fireRing(G, b.x, b.z, 6.5, 14); }
      else if (ai === 'bishop') { b.fireT = 2.6; for (const p of G.players) if (alive(p) && areaAt(p.x, p.z) === G.bossArea) G.zones.push({ id: G.uid++, k: 'tcircle', x: p.x, z: p.z, r: 2.2, t: 1.1, T: 1.1, then: 'fire' }); ev(G, 'bwind', { w: 'murk' }); }
      else { b.fireT = 2.2; fireTrail(G, b, t); }
    }
  }
  if (b.atk) { bossAttack(G, b, dt, K); return; }
  // 걷기: 대주교는 거리를 두고, 나머지는 다가와요
  const sp = B.speed * (b.phase === 3 ? 1.25 : 1) * (b.slow > 0 ? b.slowM : 1);
  let da = ta - b.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.a += clamp(da, -2.6 * dt, 2.6 * dt);
  let want = d > 3 ? 1 : 0; if (ai === 'bishop') want = d > 9 ? 1 : d < 5 ? -1 : 0;
  if (want) { const ma = lineClear(b.x, b.z, t.x, t.z) ? ta : (navDir(b.x, b.z, t.x, t.z, G.t) ?? ta); b.x += Math.cos(ma) * sp * want * dt; b.z += Math.sin(ma) * sp * want * dt; collide(G, b, b.r); b.moving = true; } else b.moving = false;
  b.cdT = (b.cdT || 0) - dt;
  if (b.cdT > 0) return;
  const r = G.rng(), tw = b.phase === 3 ? 0.75 : 1;
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
  }
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
      if (u >= 1) { pr.dead = true; ev(G, 'splash', { x: pr.tx, z: pr.tz }); for (const q of G.players) if (alive(q) && Math.hypot(q.x - pr.tx, q.z - pr.tz) < 3) { q.hp = Math.min(q.maxhp, q.hp + 30); ev(G, 'heal', { id: q.id, x: q.x, z: q.z, v: 30 }); } }
      continue;
    }
    pr.x += pr.vx * dt; pr.z += pr.vz * dt; pr.life -= dt;
    if (pr.life <= 0 || isWall(pr.x, pr.z) || PILLARS.some(p => Math.hypot(p.x - pr.x, p.z - pr.z) < p.r)) { pr.dead = true; continue; }
    if (pr.team === 0) {
      const own = G.players.find(p => p.id === pr.own);
      if (pr.k === 'orb') { // 사제 빛 구슬은 가까운 적을 살짝 따라가요
        let best = null, bd = 6; for (const e of G.enemies) { if (e.hp <= 0) continue; const d = Math.hypot(e.x - pr.x, e.z - pr.z); if (d < bd) { bd = d; best = e; } }
        if (best) { const a = Math.atan2(best.z - pr.z, best.x - pr.x), sp = Math.hypot(pr.vx, pr.vz), ca = Math.atan2(pr.vz, pr.vx); let da = a - ca; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; const na = ca + clamp(da, -4 * dt, 4 * dt); pr.vx = Math.cos(na) * sp; pr.vz = Math.sin(na) * sp; }
      }
      for (const e of G.enemies) {
        if (e.hp <= 0 || e.st === 'rise' || pr.hit.indexOf(e.id) >= 0) continue;
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
    if (z.k === 'rain') { z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; const own = G.players.find(p => p.id === z.own); for (const e of G.enemies) if (e.hp > 0 && Math.hypot(e.x - z.x, e.z - z.z) < z.r + e.r) hurtEnemy(G, e, 18, own, { from: { x: e.x, z: e.z - 1 } }); } }
    if (z.k === 'fire') { if (z.delay > 0) { z.delay -= dt; continue; } z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; for (const p of G.players) if (alive(p) && Math.hypot(p.x - z.x, p.z - z.z) < z.r) hurtPlayer(G, p, 16, null); } }
  }
  for (const z of G.zones) if (z.t <= 0 && z.then === 'fire') { z.then = null; G.zones.push({ id: G.uid++, k: 'fire', x: z.x, z: z.z, r: z.r * 0.8, t: 5, delay: 0, tick: 0 }); }
  G.zones = G.zones.filter(z => z.t > 0);
  // 근위대장 돌진 준비
  for (const e of G.enemies) if (e.st === 'wind2') eliteWind(G, e, dt);
}

/* ---------- 봇 ---------- */
function inDanger(G, p) {
  for (const z of G.zones) {
    if (z.k === 'tcircle' && z.t < 0.55 && Math.hypot(p.x - z.x, p.z - z.z) < z.r + 0.6) return Math.atan2(p.z - z.z, p.x - z.x);
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
function botThink(G, p, dt) {
  const inp = {}; if (p.dead || p.down) return inp;
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
    if (p.role === 'priest' && p.cd.s2 <= 0 && dist(p, downed) < 7.5) { inp.r = true; return inp; }
    if (near < 2 || dist(p, downed) < 2) {
      if (!moveTo(G, p, inp, downed.x, downed.z, 1.4)) inp.f = true;
      return inp;
    }
  }
  // 3) 싸울 적이 없으면 앞사람을 따라가요. 앞장서는 봇은 정해진 길을 따라가요
  if (!foes.length) {
    if (leader === p) {
      const wp = MAP.route[Math.min(G.route, MAP.route.length - 1)], wx = cw(wp[0]), wz = cw(wp[1]);
      if (Math.hypot(wx - p.x, wz - p.z) < 3 && G.route < MAP.route.length - 1) G.route++;
      moveTo(G, p, inp, wx, wz, 1);
    } else if (leader) {
      const bx = leader.x - Math.cos(leader.a) * 2.2 + (p.slot - 1.5) * 1.3, bz = leader.z - Math.sin(leader.a) * 2.2;
      if (dist(p, leader) > 4.5) moveTo(G, p, inp, isWall(bx, bz) ? leader.x : bx, isWall(bx, bz) ? leader.z : bz, 0.8);
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

/* ---------- 네트워크용 요약 ---------- */
const r1 = v => Math.round(v * 100) / 100;
// 멀리서 잠든 적은 보내지 않아요 (주고받는 양을 줄여요)
export function snapshot(G) {
  const near = e => e.k === 'boss' || (e.st !== 'sleep') || G.players.some(p => Math.abs(p.x - e.x) < 34 && Math.abs(p.z - e.z) < 26);
  return {
    t: r1(G.t), ph: G.phase, pt: r1(G.phaseT), c: G.ch, msg: G.msg, won: G.won,
    sk: G.players.filter(p => !p.bot && G.skip[p.id]).length, hu: G.players.filter(p => !p.bot).length,
    pl: G.players.map(p => ({ id: p.id, role: p.role, name: p.name, bot: p.bot, x: r1(p.x), z: r1(p.z), a: r1(p.a), hp: Math.round(p.hp), mx: p.maxhp, dn: p.down ? 1 : 0, dd: p.dead ? 1 : 0, bl: r1(p.bleed), rs: r1(p.respT), rv: r1(p.revT), ro: p.roll > 0 ? 1 : 0, bk: p.block > 0 ? 1 : 0, sh: Math.round(p.shield), tn: p.taunt > 0 ? 1 : 0, ra: p.rally > 0 ? 1 : 0, an: p.animT > 0 ? p.anim : '', aN: p.animN || 0, ak: p.anim, mv: p.moving ? 1 : 0, cd: [r1(p.cd.s0), r1(p.cd.s1), r1(p.cd.s2)], rc: r1(p.rollCd), b: p.bl, cb: p.comboT > 0 ? p.combo : 0, fc: p.focus > 0 ? 1 : 0 })),
    en: G.enemies.filter(near).map(e => ({ id: e.id, k: e.k, x: r1(e.x), z: r1(e.z), a: r1(e.a), hp: Math.round(e.hp), mx: e.maxhp, st: e.st, mk: e.mark > 0 ? 1 : 0, sn: e.stun > 0 ? 1 : 0, sl: e.slow > 0 ? 1 : 0, bu: e.burn > 0 ? 1 : 0, ph: e.phase || 0, mv: e.moving ? 1 : 0, ak: e.atk ? e.atk.k + (e.atk.go ? '!' : '') : '', ht: e.hitT > 0 ? 1 : 0 })),
    pr: G.projs.map(p => ({ id: p.id, k: p.k, x: r1(p.x), z: r1(p.z), y: r1(p.y || 0), bg: p.big ? 1 : 0, a: r1(Math.atan2(p.vz || (p.tz - p.sz) || 0, p.vx || (p.tx - p.sx) || 1)) })),
    zn: G.zones.map(z => ({ id: z.id, k: z.k, x: r1(z.x), z: r1(z.z), r: z.r, a: z.a, len: z.len, w: z.w, arc: z.arc, t: r1(z.t), T: z.T, dl: z.delay > 0 ? 1 : 0 })),
    w: { cp: G.cpI, fi: G.fires.map(f => f.lit ? 1 : 0), al: G.altars.map(a => a.used ? 1 : 0), ap: G.altars.map(a => r1(a.prog)), ch: G.chests.map(c => c.open ? 1 : 0), cp2: G.chests.map(c => r1(c.prog)), tr: G.traps.map(t => (t.on ? 1 : 0) + (t.up ? 2 : 0)), boss: G.bossIntro ? 1 : 0, bd: G.bossDead ? 1 : 0, left: G.enemies.filter(e => e.hp > 0 && !e.summoned && e.k !== 'boss').length },
    bless: G.bless, honor: G.honor
  };
}
export { ROLE_IDS };

// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 규칙 (방장·혼자 하기에서만 돌아가요). three.js를 쓰지 않아서 node에서도 시험할 수 있어요.
import { ROLES, ROLE_IDS, ENEMIES, BLESSINGS, CHAPTER1, roleLevel, GEAR_BONUS } from './data.js';

export const RW = 17, RH = 10, INTRO_T = 16; // 방 크기 (x -RW..RW, z -RH..RH)
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const angTo = (a, b) => Math.atan2(b.z - a.z, b.x - a.x);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };

export function mkRng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

/* slots: [{id, role, name, bot, lv, gear:{weapon,armor}}] */
export function createGame(slots, seed) {
  const G = {
    t: 0, rng: mkRng(seed || Date.now()), ri: -1, room: null, phase: 'intro', phaseT: 0,
    players: [], enemies: [], projs: [], zones: [], ev: [], uid: 1, msg: '', stats: { downs: 0, kills: 0 },
    humans: slots.filter(s => !s.bot).length, bless: {}, honor: {}, won: false, chapter: CHAPTER1
  };
  slots.forEach((s, i) => {
    const R = ROLES[s.role], lv = s.lv || 1, gear = s.gear || { weapon: 0, armor: 0 };
    const maxhp = Math.round(R.hp * (1 + 0.03 * (lv - 1)) + GEAR_BONUS.armor[gear.armor | 0]);
    G.players.push({
      id: s.id, role: s.role, name: s.name, bot: !!s.bot, slot: i, x: -3 + i * 2, z: 7, vx: 0, vz: 0, a: -Math.PI / 2,
      hp: maxhp, maxhp, baseHp: maxhp, down: false, dead: false, bleed: 0, revT: 0, roll: 0, rollCd: 0, inv: 0,
      cd: { atk: 0, s0: 0, s1: 0, s2: 0 }, block: 0, taunt: 0, rally: 0, shield: 0, shieldT: 0,
      dmgMul: 1 + 0.03 * (lv - 1) + GEAR_BONUS.weapon[gear.weapon | 0], bl: [], anim: '', animT: 0, hitT: 0,
      ai: { t: 0, tx: 0, tz: 0, target: 0 }, everDown: false
    });
    G.honor[s.id] = 0;
  });
  enterRoom(G, 0);
  G.phase = 'intro'; G.phaseT = 0;
  return G;
}

function hasB(p, id) { return p.bl.indexOf(id) >= 0; }
function ev(G, k, o) { G.ev.push(Object.assign({ k }, o || {})); }
function alive(p) { return !p.down && !p.dead; }
function hpMul(G) { return 1 + 0.18 * (Math.max(1, G.humans) - 1); }

export function enterRoom(G, ri) {
  G.ri = ri; const R = G.chapter.rooms[ri]; G.room = { def: R, wave: 0, cleared: false, door: false, chest: null, fire: null, traps: [], pillars: [], waveT: 0 };
  G.enemies = []; G.projs = []; G.zones = [];
  const rng = G.rng;
  // 기둥
  const pc = R.pillars || 0, spots = [[-9, -3], [9, -3], [-9, 4], [9, 4], [-4, 0], [4, 0]];
  for (let i = 0; i < pc; i++) G.room.pillars.push({ x: spots[i][0], z: spots[i][1], r: 1.1 });
  // 바닥 함정
  for (let i = 0; i < (R.traps || 0); i++) {
    let x, z, ok, tries = 0;
    do { x = (rng() * 2 - 1) * (RW - 3); z = (rng() * 2 - 1) * (RH - 4); ok = Math.abs(x) > 2 || z < 3; tries++; } while ((!ok || G.room.pillars.some(p => Math.hypot(p.x - x, p.z - z) < 2.5)) && tries < 30);
    G.room.traps.push({ id: G.uid++, x, z, on: true, t: rng() * 3 });
  }
  if (R.kind === 'rest') { G.room.chest = { x: 6, z: -3, open: false, prog: 0 }; G.room.fire = { x: -3, z: -1 }; G.room.cleared = true; G.room.door = true; }
  G.players.forEach((p, i) => {
    p.x = -3 + i * 2; p.z = RH - 2; p.vx = p.vz = 0; p.a = -Math.PI / 2; p.roll = 0;
    if (p.dead) { p.dead = false; p.down = false; p.hp = Math.round(p.maxhp * 0.3); }
  });
  G.phase = R.kind === 'boss' ? 'bossIntro' : 'enter'; G.phaseT = 0;
  G.msg = R.name;
  ev(G, 'room', { ri });
}

function spawnWave(G) {
  const R = G.room.def, w = R.waves[G.room.wave], rng = G.rng;
  w.forEach((k, i) => {
    const E = ENEMIES[k];
    let x = (i / Math.max(1, w.length - 1) * 2 - 1) * (RW - 4) + (rng() - 0.5) * 2, z = -RH + 3 + rng() * 5;
    if (w.length === 1) x = 0;
    spawnEnemy(G, k, x, z);
  });
  G.room.wave++;
}
function spawnEnemy(G, k, x, z) {
  const E = ENEMIES[k], hp = Math.round(E.hp * hpMul(G));
  const e = { id: G.uid++, k, x, z, a: Math.PI / 2, hp, maxhp: hp, st: 'rise', stT: 0.9, cd: 0.3 + G.rng() * 0.6, tgt: null, root: 0, burn: 0, burnT: 0, mark: 0, stun: 0, hitT: 0, vx: 0, vz: 0, wind: 0, r: E.r };
  if (k === 'boss') Object.assign(e, { st: 'idle', stT: 0, phase: 1, pat: 0, summonT: 10, fireT: 5, atk: null, faceLock: 0 });
  G.enemies.push(e); ev(G, 'spawn', { x, z, en: k });
  return e;
}

/* ---------- 이동·충돌 ---------- */
function collide(G, o, r) {
  o.x = clamp(o.x, -RW + r, RW - r); o.z = clamp(o.z, -RH + r, RH - r);
  for (const p of G.room.pillars) { const d = Math.hypot(o.x - p.x, o.z - p.z), m = p.r + r; if (d < m && d > 0.0001) { o.x = p.x + (o.x - p.x) / d * m; o.z = p.z + (o.z - p.z) / d * m; } }
}

/* ---------- 피해 ---------- */
function hurtPlayer(G, p, dmg, src) {
  if (!alive(p) || p.inv > 0 || p.roll > 0) return 0;
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
  const E = ENEMIES[e.k];
  let d = dmg * (p ? p.dmgMul * (hasB(p, 'blade') ? 1.15 : 1) * (p.rally > 0 ? 1.3 : 1) : 1);
  if (e.mark > 0) d *= 1.5;
  const from = o.from || p;
  if (E.front && from && !o.pierce) { if (angDiff(e.a, angTo(e, from)) < 1.0) { d *= E.front; ev(G, 'clang', { x: e.x, z: e.z }); } }
  if (e.k === 'boss') {
    if (e.stun > 0) d *= 1.5;
    if (e.phase >= 3 && from && angDiff(e.a, angTo(e, from)) > 1.9) { d *= 2; ev(G, 'weak', { x: e.x, z: e.z }); }
  }
  d = Math.max(1, Math.round(d));
  e.hp -= d; e.hitT = 0.15; ev(G, 'ehit', { x: e.x, z: e.z, v: d, id: e.id, crit: d > dmg * 1.4 });
  if (p && hasB(p, 'leech') && alive(p)) p.hp = Math.min(p.maxhp, p.hp + 1);
  if ((o.burn || (p && hasB(p, 'fire') && o.basic)) && e.hp > 0) { e.burn = 3; }
  if (o.kb && e.k !== 'boss') { e.vx += Math.cos(o.kbA) * o.kb; e.vz += Math.sin(o.kbA) * o.kb; }
  if (e.hp <= 0) killEnemy(G, e);
  return d;
}
function killEnemy(G, e) {
  e.hp = 0; G.stats.kills++; ev(G, 'ekill', { x: e.x, z: e.z, en: e.k, id: e.id });
  const h = ENEMIES[e.k].honor; for (const p of G.players) G.honor[p.id] += h;
  if (e.k === 'elite') ev(G, 'ach', { id: 'elite' });
  if (e.k === 'boss') { G.bossDead = true; for (const o of G.enemies) if (o !== e && o.hp > 0) { o.hp = 0; ev(G, 'ekill', { x: o.x, z: o.z, en: o.k, id: o.id }); } }
}

/* ---------- 플레이어 행동 ---------- */
function cdMul(p, which) { return which === 'atk' ? (hasB(p, 'hands') ? 0.85 : 1) : (hasB(p, 'focus') ? 0.85 : 1); }
function aimPoint(p, inp, range) {
  if (inp.ax != null) { const d = Math.hypot(inp.ax - p.x, inp.az - p.z); if (d <= range) return { x: inp.ax, z: inp.az }; }
  return { x: p.x + Math.cos(p.a) * range, z: p.z + Math.sin(p.a) * range };
}
function basicAttack(G, p) {
  const R = ROLES[p.role], A = R.atk;
  p.cd.atk = A.cd * cdMul(p, 'atk'); p.anim = 'atk'; p.animT = 0.3;
  if (A.kind === 'melee') {
    ev(G, 'swing', { id: p.id, x: p.x, z: p.z, a: p.a, r: A.range, role: p.role });
    for (const e of G.enemies) { if (e.hp <= 0) continue; const d = dist(p, e); if (d < A.range + e.r && angDiff(p.a, angTo(p, e)) < A.arc / 2 + 0.25) hurtEnemy(G, e, A.dmg, p, { basic: true, burn: A.burn, kb: 3, kbA: angTo(p, e) }); }
  } else {
    G.projs.push({ id: G.uid++, k: A.kind, own: p.id, x: p.x + Math.cos(p.a) * 0.8, z: p.z + Math.sin(p.a) * 0.8, vx: Math.cos(p.a) * A.speed, vz: Math.sin(p.a) * A.speed, dmg: A.dmg, life: 1.1, pierce: false, hit: [], basic: true, team: 0 });
    ev(G, 'shoot', { id: p.id, pk: A.kind, x: p.x, z: p.z });
  }
}
function useSkill(G, p, si, inp) {
  const R = ROLES[p.role], S = R.skills[si], key = 's' + si;
  if (p.cd[key] > 0) return;
  p.cd[key] = S.cd * cdMul(p, 'skill'); p.anim = 'skill'; p.animT = 0.4;
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
// inputs[pid] = { mx, mz, aim, ax, az, atk(held), q, e, r, roll (one-shot), f(held), px, pz (원격 이동) }
export function step(G, dt, inputs) {
  G.t += dt; G.phaseT += dt;
  const room = G.room;
  for (const p of G.players) if (p.bot) inputs[p.id] = botThink(G, p, dt);

  // 진행 단계
  if (G.phase === 'intro') { if (G.phaseT > INTRO_T) { G.phase = 'enter'; G.phaseT = 0; } return; }
  if (G.phase === 'enter') { if (G.phaseT > 1.6) { G.phase = 'play'; G.phaseT = 0; if (room.def.kind === 'fight') spawnWave(G); } }
  if (G.phase === 'bossIntro') { if (G.phaseT > 3.2) { G.phase = 'play'; G.phaseT = 0; const b = spawnEnemy(G, 'boss', 0, -5); b.a = Math.PI / 2; ev(G, 'roar', {}); } }
  if (G.phase === 'wipe') { if (G.phaseT > 3) restartRoom(G); return; }
  if (G.phase === 'won') return;

  // 플레이어
  for (const p of G.players) stepPlayer(G, p, inputs[p.id] || {}, dt);

  // 적
  for (const e of G.enemies) if (e.hp > 0) stepEnemy(G, e, dt);
  G.enemies = G.enemies.filter(e => e.hp > 0 || (e.dieT = (e.dieT || 0) + dt) < 1.2);

  stepProjs(G, dt); stepZones(G, dt);

  // 바닥 함정: 1.5초마다 가시가 올라와요. 종자는 밟으면 해체해요
  for (const tr of room.traps) {
    if (!tr.on) continue; tr.t += dt; const up = (tr.t % 3) < 0.8;
    tr.up = up;
    for (const p of G.players) {
      if (!alive(p) || Math.hypot(p.x - tr.x, p.z - tr.z) > 1.1) continue;
      if (p.role === 'squire') { tr.on = false; ev(G, 'disarm', { x: tr.x, z: tr.z }); break; }
      if (up && !(p.trapHit > G.t)) { p.trapHit = G.t + 0.8; hurtPlayer(G, p, 10, null); }
    }
  }

  // 전투 방 진행
  if (G.phase === 'play' && room.def.kind !== 'rest' && !room.cleared) {
    const left = G.enemies.filter(e => e.hp > 0).length;
    if (left === 0) {
      if (room.def.kind === 'fight' && room.wave < room.def.waves.length) { room.waveT += dt; if (room.waveT > 1.2) { room.waveT = 0; spawnWave(G); } }
      else if (room.def.kind === 'boss' ? G.enemies.length === 0 && G.bossDead : true) clearRoom(G);
    }
  }
  // 쉼터: 모닥불 근처에서 회복
  if (room.fire) for (const p of G.players) if (alive(p) && Math.hypot(p.x - room.fire.x, p.z - room.fire.z) < 4) p.hp = Math.min(p.maxhp, p.hp + 12 * dt);

  // 전멸 확인
  if (G.phase === 'play' && G.players.every(p => !alive(p))) { G.phase = 'wipe'; G.phaseT = 0; ev(G, 'wipe', {}); }

  // 문으로 나가기: 사람(봇 제외)이 모두 문 앞에 서면 다음 방
  if (room.door && G.phase === 'play' && !Object.keys(G.bless).some(k => G.bless[k])) {
    const hum = G.players.filter(p => !p.bot && alive(p)), act = hum.length ? hum : G.players.filter(alive);
    const inDoor = q => Math.abs(q.x) < 2.6 && q.z < -RH + 1.8;
    if (act.length && act.every(inDoor)) {
      if (G.ri + 1 < G.chapter.rooms.length) { enterRoom(G, G.ri + 1); }
    }
  }
}

function clearRoom(G) {
  const room = G.room; room.cleared = true; room.door = true; G.zones = G.zones.filter(z => z.k === 'ptrap' ? false : true);
  for (const p of G.players) { G.honor[p.id] += 10; if (p.dead || p.down) { revive(G, p, 0.3, null); } }
  ev(G, 'clear', { ri: G.ri });
  if (room.def.kind === 'fight') { offerBless(G); ev(G, 'ach', { id: 'room1' }); }
  if (room.def.kind === 'boss') {
    for (const p of G.players) G.honor[p.id] += 90;
    G.won = true; G.phase = 'won'; G.phaseT = 0; ev(G, 'won', {});
  }
}
function offerBless(G) {
  for (const p of G.players) {
    const pool = BLESSINGS.filter(b => !hasB(p, b.id)); const pick = [];
    while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(G.rng() * pool.length), 1)[0].id);
    G.bless[p.id] = pick;
  }
}
export function chooseBless(G, pid, bid) {
  const opts = G.bless[pid]; if (!opts || opts.indexOf(bid) < 0) return;
  const p = G.players.find(q => q.id === pid); if (!p) return;
  p.bl.push(bid); G.bless[pid] = null;
  if (bid === 'armor') { p.maxhp += 25; p.hp += 25; }
  ev(G, 'bless', { id: pid, b: bid });
}
function restartRoom(G) {
  const ri = G.ri;
  G.bossDead = false;
  for (const p of G.players) { p.down = false; p.dead = false; p.hp = Math.round(p.maxhp * 0.7); p.shield = 0; p.block = p.taunt = p.rally = 0; }
  enterRoom(G, ri); ev(G, 'restart', {});
}

function stepPlayer(G, p, inp, dt) {
  for (const k in p.cd) if (p.cd[k] > 0) p.cd[k] -= dt;
  ['block', 'taunt', 'rally', 'inv', 'hitT', 'animT', 'rollCd'].forEach(k => { if (p[k] > 0) p[k] = Math.max(0, p[k] - dt); });
  if (p.shieldT > 0) { p.shieldT -= dt; if (p.shieldT <= 0) p.shield = 0; }
  if (p.dead) return;
  if (p.down) {
    p.bleed -= dt; if (p.bleed <= 0) { p.dead = true; ev(G, 'dead', { id: p.id }); }
    // 일으키기: 근처 동료가 F를 누르고 있으면
    let helper = null;
    for (const q of G.players) if (q !== p && alive(q) && (inputs_f(q)) && dist(p, q) < 1.9) helper = q;
    if (helper) { p.revT += dt * (hasB(helper, 'bond') ? 2 : 1); helper.reviving = p.id; if (p.revT >= 1.6) revive(G, p, 0.5, helper); }
    else p.revT = Math.max(0, p.revT - dt * 0.5);
    return;
  }
  p.reviving = null;
  const R = ROLES[p.role];
  let sp = R.speed * (hasB(p, 'feet') ? 1.12 : 1) * (p.rally > 0 ? 1.3 : 1) * (p.block > 0 ? 0.45 : 1);
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
    if (inp.roll && p.rollCd <= 0 && p.roll <= 0) {
      p.roll = 0.35; p.rollCd = 1.2 * (hasB(p, 'roll') ? 0.6 : 1);
      const ra = ml > 0.1 ? Math.atan2(mz, mx) : p.a; p.rdx = Math.cos(ra); p.rdz = Math.sin(ra); ev(G, 'roll', { id: p.id });
    }
    if (p.roll > 0) { p.roll -= dt; p.x += p.rdx * 15 * dt; p.z += p.rdz * 15 * dt; }
    else { p.x += mx * sp * dt; p.z += mz * sp * dt; }
    p.moving = ml > 0.1;
    collide(G, p, 0.6);
  }
  p.f = !!inp.f;
  if (p.roll > 0) return;
  if (G.phase !== 'play') return;
  if (inp.atk && p.cd.atk <= 0 && p.block <= 0) basicAttack(G, p);
  if (inp.q) useSkill(G, p, 0, inp);
  if (inp.e) useSkill(G, p, 1, inp);
  if (inp.r) useSkill(G, p, 2, inp);
  // 쉼터 상자
  const ch = G.room.chest;
  if (ch && !ch.open && inp.f && Math.hypot(p.x - ch.x, p.z - ch.z) < 2.2) {
    ch.prog += dt; if (ch.prog > 1.2) { ch.open = true; for (const q of G.players) G.honor[q.id] += 25; offerBless(G); ev(G, 'chest', {}); ev(G, 'ach', { id: 'rest' }); }
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
  const E = ENEMIES[e.k];
  ['root', 'mark', 'stun', 'hitT', 'tauntT'].forEach(k => { if (e[k] > 0) e[k] = Math.max(0, e[k] - dt); });
  if (e.burn > 0) { e.burn -= dt; e.burnT += dt; if (e.burnT >= 0.5) { e.burnT = 0; hurtEnemy(G, e, 2, null, {}); if (e.hp <= 0) return; } }
  e.x += e.vx * dt; e.z += e.vz * dt; e.vx *= Math.pow(0.02, dt); e.vz *= Math.pow(0.02, dt);
  collide(G, e, e.r);
  if (e.st === 'rise') { e.stT -= dt; if (e.stT <= 0) e.st = 'idle'; return; }
  if (e.k === 'boss') { stepBoss(G, e, dt); return; }
  if (e.stun > 0) return;
  // 함정
  for (const z of G.zones) if (z.k === 'ptrap' && Math.hypot(z.x - e.x, z.z - e.z) < z.r) { e.root = 2; hurtEnemy(G, e, 25, G.players.find(p => p.id === z.own), {}); z.t = 0; ev(G, 'snap', { x: z.x, z: z.z }); if (e.hp <= 0) return; }
  const t = pickTarget(G, e); if (!t) return;
  const d = dist(e, t), ta = angTo(e, t);
  if (e.st === 'wind') {
    e.wind -= dt;
    if (e.wind <= 0) {
      e.st = 'idle'; e.cd = E.cd * (0.8 + G.rng() * 0.4);
      if (e.k === 'archer') { G.projs.push({ id: G.uid++, k: 'earrow', x: e.x, z: e.z, vx: Math.cos(e.a) * 17, vz: Math.sin(e.a) * 17, dmg: E.dmg, life: 1.2, team: 1, src: e.id }); ev(G, 'eshoot', { x: e.x, z: e.z }); }
      else if (e.charging) { /* 돌진 끝 */ }
      else {
        ev(G, 'eswing', { id: e.id, x: e.x, z: e.z, a: e.a });
        for (const p of G.players) if (alive(p) && dist(e, p) < E.range + 0.7 && angDiff(e.a, angTo(e, p)) < 1.1) hurtPlayer(G, p, E.dmg, e);
      }
    }
    return;
  }
  if (e.st === 'charge') {
    e.chT -= dt; const sp = 15; e.x += Math.cos(e.a) * sp * dt; e.z += Math.sin(e.a) * sp * dt; collide(G, e, e.r);
    for (const p of G.players) if (alive(p) && dist(e, p) < e.r + 0.7 && !e.hitSet[p.id]) { e.hitSet[p.id] = 1; hurtPlayer(G, p, E.dmg, e); }
    if (e.chT <= 0) { e.st = 'idle'; e.cd = 1.5; }
    return;
  }
  if (e.st === 'wind2') return;
  e.cd -= dt;
  const turn = 6 * dt; let da = ta - e.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.a += clamp(da, -turn, turn);
  let want = 0;
  if (e.k === 'archer') { want = d > E.keep + 1 ? 1 : d < E.keep - 2 ? -1 : 0; }
  else want = d > E.range * 0.85 ? 1 : 0;
  if (e.root <= 0 && want) {
    // 동료끼리 너무 붙지 않게 살짝 밀어요
    let sx = 0, sz = 0; for (const o of G.enemies) if (o !== e && o.hp > 0) { const dd = dist(e, o); if (dd < 1.6 && dd > 0) { sx += (e.x - o.x) / dd; sz += (e.z - o.z) / dd; } }
    e.x += (Math.cos(ta) * want * E.speed + sx * 1.5) * dt; e.z += (Math.sin(ta) * want * E.speed + sz * 1.5) * dt; e.moving = true;
  } else e.moving = false;
  if (e.cd <= 0) {
    if (e.k === 'elite' && d > 4 && d < 11 && G.rng() < 0.5) { e.st = 'chargeWind'; }
    else if (e.k === 'archer' ? d < E.range : d < E.range + 0.4) { e.st = 'wind'; e.wind = E.windup; e.a = ta; ev(G, 'ewind', { id: e.id }); }
  }
  if (e.st === 'chargeWind') { e.st = 'wind2'; e.wind = 0.8; e.a = ta; G.zones.push({ id: G.uid++, k: 'tline', x: e.x, z: e.z, a: ta, len: 9, w: 1.6, t: 0.8, T: 0.8 }); }
  if (e.st === 'wind2') { /* handled below */ }
}
// 근위대장 돌진 준비 처리 (wind2 → charge)
function eliteWind(G, e, dt) { e.wind -= dt; if (e.wind <= 0) { e.st = 'charge'; e.chT = 0.6; e.hitSet = {}; } }

/* ---------- 보스 ---------- */
function stepBoss(G, b, dt) {
  const f = b.hp / b.maxhp;
  const np = f > 0.6 ? 1 : f > 0.3 ? 2 : 3;
  if (np !== b.phase) { b.phase = np; ev(G, 'bphase', { p: np }); b.cdT = 1.2; b.atk = null; b.st = 'idle'; if (np === 2) b.summonT = 1; if (np === 3) b.fireT = 1; }
  if (b.stun > 0) { b.atk = null; b.st = 'stun'; return; }
  if (b.st === 'stun') b.st = 'idle';
  const t = pickTarget(G, b); if (!t) return;
  const sp = ENEMIES.boss.speed * (b.phase === 3 ? 1.3 : 1);
  // 소환·불꽃은 따로 돌아가요
  if (b.phase >= 2) { b.summonT -= dt; if (b.summonT <= 0) { b.summonT = 15; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + G.rng(); spawnEnemy(G, i === 2 && G.rng() < 0.5 ? 'archer' : 'skel', clamp(b.x + Math.cos(a) * 4, -RW + 2, RW - 2), clamp(b.z + Math.sin(a) * 4, -RH + 2, RH - 2)); } ev(G, 'summon', {}); } }
  if (b.phase >= 3) { b.fireT -= dt; if (b.fireT <= 0) { b.fireT = 3.2; fireTrail(G, b, t); } }
  if (b.atk) {
    const A = b.atk; A.t -= dt;
    if (A.k === 'charge' && A.go) {
      b.x += Math.cos(b.a) * 17 * dt; b.z += Math.sin(b.a) * 17 * dt; collide(G, b, b.r);
      for (const p of G.players) {
        if (!alive(p) || A.hit[p.id] || dist(b, p) > b.r + 0.8) continue;
        A.hit[p.id] = 1;
        // 기사가 막기를 막 들었을 때 정면으로 받으면 받아치기
        if (p.role === 'knight' && p.block > 0.8 && angDiff(p.a, angTo(p, b)) < 1.2) { b.stun = 3; b.atk = null; ev(G, 'parry', { id: p.id, x: p.x, z: p.z }); if (!p.bot) ev(G, 'ach', { id: 'parry', pid: p.id }); return; }
        hurtPlayer(G, p, 42, b); p.inv = Math.max(p.inv, 0.4);
      }
      if (A.t <= 0 || Math.abs(b.x) > RW - b.r - 0.1 || Math.abs(b.z) > RH - b.r - 0.1) { b.atk = null; b.cdT = 1.4; }
      return;
    }
    if (A.t <= 0) {
      if (A.k === 'slam') { ev(G, 'slam', { x: A.x, z: A.z }); for (const p of G.players) if (alive(p) && Math.hypot(p.x - A.x, p.z - A.z) < A.r) hurtPlayer(G, p, 48, b); b.atk = null; b.cdT = 0.7; }
      else if (A.k === 'sweep') { ev(G, 'bsweep', { x: b.x, z: b.z, a: b.a }); for (const p of G.players) if (alive(p) && dist(b, p) < 5.2 && angDiff(b.a, angTo(b, p)) < 1.05) hurtPlayer(G, p, 34, b); b.atk = null; b.cdT = 0.5; }
      else if (A.k === 'charge') { A.go = true; A.t = 0.9; A.hit = {}; ev(G, 'bcharge', {}); }
    }
    return;
  }
  // 걷기
  const d = dist(b, t), ta = angTo(b, t);
  let da = ta - b.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.a += clamp(da, -2.6 * dt, 2.6 * dt);
  if (d > 3) { b.x += Math.cos(ta) * sp * dt; b.z += Math.sin(ta) * sp * dt; b.moving = true; } else b.moving = false;
  b.cdT = (b.cdT || 0) - dt;
  if (b.cdT <= 0) {
    const r = G.rng(), tw = b.phase === 3 ? 0.75 : 1;
    if (b.phase >= 2 && d > 5 && r < 0.45) { b.a = ta; b.atk = { k: 'charge', t: 1.0 * tw }; G.zones.push({ id: G.uid++, k: 'tline', x: b.x, z: b.z, a: ta, len: 15, w: 2.6, t: 1.0 * tw, T: 1.0 * tw }); ev(G, 'bwind', { w: 'charge' }); }
    else if (d < 5 && r < 0.6) { b.a = ta; b.atk = { k: 'sweep', t: 0.75 * tw }; G.zones.push({ id: G.uid++, k: 'tcone', x: b.x, z: b.z, a: ta, r: 5.2, arc: 2.1, t: 0.75 * tw, T: 0.75 * tw }); ev(G, 'bwind', { w: 'sweep' }); }
    else { b.atk = { k: 'slam', t: 0.95 * tw, x: t.x, z: t.z, r: 3.4 }; b.a = ta; G.zones.push({ id: G.uid++, k: 'tcircle', x: t.x, z: t.z, r: 3.4, t: 0.95 * tw, T: 0.95 * tw }); ev(G, 'bwind', { w: 'slam' }); }
  }
}
function fireTrail(G, b, t) {
  const a = angTo(b, t), n = 7;
  for (let i = 1; i <= n; i++) G.zones.push({ id: G.uid++, k: 'fire', x: clamp(b.x + Math.cos(a) * i * 1.7, -RW + 1, RW - 1), z: clamp(b.z + Math.sin(a) * i * 1.7, -RH + 1, RH - 1), r: 1.3, t: 6.5, delay: i * 0.08, tick: 0 });
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
    if (pr.life <= 0 || Math.abs(pr.x) > RW || Math.abs(pr.z) > RH || G.room.pillars.some(p => Math.hypot(p.x - pr.x, p.z - pr.z) < p.r)) { pr.dead = true; continue; }
    if (pr.team === 0) {
      const own = G.players.find(p => p.id === pr.own);
      if (pr.k === 'orb') { // 사제 빛 구슬은 가까운 적을 살짝 따라가요
        let best = null, bd = 6; for (const e of G.enemies) { if (e.hp <= 0) continue; const d = Math.hypot(e.x - pr.x, e.z - pr.z); if (d < bd) { bd = d; best = e; } }
        if (best) { const a = Math.atan2(best.z - pr.z, best.x - pr.x), sp = Math.hypot(pr.vx, pr.vz), ca = Math.atan2(pr.vz, pr.vx); let da = a - ca; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; const na = ca + clamp(da, -4 * dt, 4 * dt); pr.vx = Math.cos(na) * sp; pr.vz = Math.sin(na) * sp; }
      }
      for (const e of G.enemies) {
        if (e.hp <= 0 || e.st === 'rise' || pr.hit.indexOf(e.id) >= 0) continue;
        if (Math.hypot(e.x - pr.x, e.z - pr.z) < e.r + 0.35) {
          pr.hit.push(e.id); hurtEnemy(G, e, pr.dmg, own, { basic: pr.basic, pierce: pr.pierce, from: { x: pr.x - pr.vx * 0.05, z: pr.z - pr.vz * 0.05 } });
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
    if (z.k === 'fire') { if (z.delay > 0) { z.delay -= dt; continue; } z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; for (const p of G.players) if (alive(p) && Math.hypot(p.x - z.x, p.z - z.z) < z.r) hurtPlayer(G, p, 11, null); } }
  }
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
function botThink(G, p, dt) {
  const inp = {}; if (p.dead || p.down) return inp;
  const R = ROLES[p.role], ai = p.ai; ai.t -= dt;
  // 축복은 바로 골라요
  if (G.bless[p.id]) { const o = G.bless[p.id]; chooseBless(G, p.id, o[Math.floor(G.rng() * o.length)]); }
  const foes = G.enemies.filter(e => e.hp > 0 && e.st !== 'rise');
  const leader = G.players.find(q => !q.bot && alive(q));
  // 1) 위험 피하기
  const dz = inDanger(G, p);
  if (dz != null) { inp.mx = Math.cos(dz); inp.mz = Math.sin(dz); if (p.rollCd <= 0 && G.rng() < 0.5) inp.roll = true; if (p.role === 'knight' && G.enemies.some(e => e.k === 'boss' && e.atk && e.atk.k === 'charge') && p.cd.s0 <= 0) { inp.q = true; inp.mx = inp.mz = 0; } return inp; }
  // 2) 쓰러진 동료 일으키기
  const downed = G.players.find(q => q.down && !q.dead);
  if (downed) {
    const near = foes.filter(e => dist(e, downed) < 3).length;
    if (p.role === 'priest' && p.cd.s2 <= 0 && dist(p, downed) < 7.5) { inp.r = true; return inp; }
    if (near < 2 || dist(p, downed) < 2) {
      const d = dist(p, downed);
      if (d > 1.4) { const a = angTo(p, downed); inp.mx = Math.cos(a); inp.mz = Math.sin(a); } else inp.f = true;
      return inp;
    }
  }
  // 3) 쉼터·전투 끝: 상자와 문
  if (!foes.length) {
    const ch = G.room.chest;
    let goal = null;
    if (ch && !ch.open && !G.players.some(q => !q.bot)) goal = ch;
    else if (G.room.door && leader && leader !== p) goal = { x: leader.x + (p.slot - 1.5) * 1.4, z: leader.z + 1.6 };
    else if (G.room.door) goal = { x: 0, z: -RH + 1 };
    if (G.room.door && leader && !leader.bot && leader.z < -RH + 4) goal = { x: (p.slot - 1.5) * 1.2, z: -RH + 1 };
    if (goal) { const d = dist(p, goal); if (d > (ch && goal === ch ? 1.6 : 0.8)) { const a = angTo(p, goal); inp.mx = Math.cos(a); inp.mz = Math.sin(a); } else if (goal === ch) inp.f = true; }
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
  const gd = Math.hypot(gx - p.x, gz - p.z);
  if (gd > 0.6) { inp.mx = (gx - p.x) / gd; inp.mz = (gz - p.z) / gd; }
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
export function snapshot(G) {
  return {
    t: r1(G.t), ri: G.ri, ph: G.phase, pt: r1(G.phaseT), msg: G.msg, won: G.won,
    pl: G.players.map(p => ({ id: p.id, role: p.role, name: p.name, bot: p.bot, x: r1(p.x), z: r1(p.z), a: r1(p.a), hp: Math.round(p.hp), mx: p.maxhp, dn: p.down ? 1 : 0, dd: p.dead ? 1 : 0, bl: r1(p.bleed), rv: r1(p.revT), ro: p.roll > 0 ? 1 : 0, bk: p.block > 0 ? 1 : 0, sh: Math.round(p.shield), tn: p.taunt > 0 ? 1 : 0, ra: p.rally > 0 ? 1 : 0, an: p.animT > 0 ? p.anim : '', mv: p.moving ? 1 : 0, cd: [r1(p.cd.s0), r1(p.cd.s1), r1(p.cd.s2)], rc: r1(p.rollCd), b: p.bl })),
    en: G.enemies.map(e => ({ id: e.id, k: e.k, x: r1(e.x), z: r1(e.z), a: r1(e.a), hp: Math.round(e.hp), mx: e.maxhp, st: e.st, mk: e.mark > 0 ? 1 : 0, sn: e.stun > 0 ? 1 : 0, bu: e.burn > 0 ? 1 : 0, ph: e.phase || 0, mv: e.moving ? 1 : 0, ak: e.atk ? e.atk.k + (e.atk.go ? '!' : '') : '', ht: e.hitT > 0 ? 1 : 0 })),
    pr: G.projs.map(p => ({ id: p.id, k: p.k, x: r1(p.x), z: r1(p.z), y: r1(p.y || 0), a: r1(Math.atan2(p.vz || (p.tz - p.sz) || 0, p.vx || (p.tx - p.sx) || 1)) })),
    zn: G.zones.map(z => ({ id: z.id, k: z.k, x: r1(z.x), z: r1(z.z), r: z.r, a: z.a, len: z.len, w: z.w, arc: z.arc, t: r1(z.t), T: z.T, dl: z.delay > 0 ? 1 : 0 })),
    rm: { cl: G.room.cleared ? 1 : 0, dr: G.room.door ? 1 : 0, ch: G.room.chest ? { x: G.room.chest.x, z: G.room.chest.z, o: G.room.chest.open ? 1 : 0, p: r1(G.room.chest.prog) } : null, fi: G.room.fire, tr: G.room.traps.map(t => ({ id: t.id, x: r1(t.x), z: r1(t.z), on: t.on ? 1 : 0, up: t.up ? 1 : 0 })), pi: G.room.pillars, wv: G.room.wave },
    bless: G.bless, honor: G.honor
  };
}
export { ROLE_IDS };

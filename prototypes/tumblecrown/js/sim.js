// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 규칙: 방장 컴퓨터에서만 돌아가요 (1초에 30번). 다른 사람은 방장이 보낸 장면을 그려요
import { RING, HEX, TARGET, SHRINK_AT, SHRINK_EVERY, MIN_RING, KO_PTS, FALL_Y, RESPAWN, WEPS, DASH } from './data.js';

/* ---------- 육각 섬 ---------- */
const S3 = Math.sqrt(3);
export const TILES = []; const TIX = new Map();
for (let q = -RING; q <= RING; q++) for (let r = Math.max(-RING, -q - RING); r <= Math.min(RING, -q + RING); r++) {
  const i = TILES.length; TILES.push({ q, r, x: HEX * S3 * (q + r / 2), z: HEX * 1.5 * r, ring: (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 }); TIX.set(q + ',' + r, i);
}
export const NT = TILES.length;
// 바위 기둥: 가운데를 둘러싼 여섯 자리 (부딪히면 막혀요)
export const PILLARS = [[3, -1], [-2, 3], [-1, -2], [2, 1], [-3, 1], [0, -3]].map(([q, r]) => TIX.get(q + ',' + r));
export function tileAt(x, z) {
  const fq = (S3 / 3 * x - z / 3) / HEX, fr = (2 / 3 * z) / HEX, fs = -fq - fr;
  let q = Math.round(fq), r = Math.round(fr); const s = Math.round(fs);
  const dq = Math.abs(q - fq), dr = Math.abs(r - fr), ds = Math.abs(s - fs);
  if (dq > dr && dq > ds) q = -r - s; else if (dr > ds) r = -q - s;
  const i = TIX.get(q + ',' + r); return i == null ? -1 : i;
}
const hexDist = (a, b) => { const A = TILES[a], B = TILES[b]; return (Math.abs(A.q - B.q) + Math.abs(A.r - B.r) + Math.abs(A.q + A.r - B.q - B.r)) / 2; };
// 타일 상태: 0 단단함, 1 금 감(곧 떨어짐), 2 없음, 3 바위 기둥
const solid = (G, i) => i >= 0 && (G.tl[i] === 0 || G.tl[i] === 1 || G.tl[i] === 3);
export const standable = (G, x, z) => { const i = tileAt(x, z); return i >= 0 && (G.tl[i] === 0 || G.tl[i] === 1); };

/* ---------- 상태 번호 (화면과 같이 써요) ---------- */
export const ST = { idle: 0, run: 1, charge: 2, swing: 3, dash: 4, stun: 5, slam: 6, lunge: 7, grab: 8, held: 9, out: 10 };

export function createGame(slots, opts = {}) {
  const G = {
    t: 0, play: 0, phase: 'count', cd: 3, ring: RING, shrinkN: 0, tl: new Uint8Array(NT), tt: new Float32Array(NT), rg: new Float32Array(NT),
    players: [], crown: { x: 0, y: 3, z: 0, vx: 0, vy: 0, vz: 0, h: null, cd: 0, gone: 0 }, ev: [], winner: null, target: opts.target || TARGET
  };
  for (const i of PILLARS) G.tl[i] = 3;
  const n = slots.length;
  slots.forEach((s, k) => {
    const a = k / n * Math.PI * 2 + 0.3, R = HEX * 1.5 * 3.6;
    const p = {
      id: s.id, k, name: s.name, uid: s.uid || null, bot: !!s.bot, wep: s.wep, col: s.col,
      x: Math.cos(a) * R, z: Math.sin(a) * R, y: 0, vx: 0, vz: 0, vy: 0, fx: -Math.cos(a), fz: -Math.sin(a), ax: -Math.cos(a), az: -Math.sin(a),
      st: ST.idle, stT: 0, sa: 0, chg: 0, atkCd: 0, dashCd: 0, skCd: 0, pct: 0, score: 0, ko: 0, falls: 0, held: 0, hs: 0, inv: 0, resp: 0,
      air: true, airDash: true, lastHit: null, grab: null, hitSet: null, bump: null, noPick: 0, prevAtk: false, bot2: { t: 0, mx: 0, mz: 0, atk: false, want: 0 }
    };
    // 처음 자리가 바위 기둥이면 옆으로 비켜요
    if (!standable(G, p.x, p.z)) { p.x *= 0.82; p.z *= 0.82; }
    G.players.push(p);
  });
  return G;
}

const W = p => WEPS[p.wep] || WEPS.hammer;
const lerp = (a, b, k) => a + (b - a) * k;
const ev = (G, e) => G.ev.push(e);
function setSt(p, st, T = 0) { p.st = st; p.stT = T; p.sa = 0; }
const canAct = p => p.st === ST.idle || p.st === ST.run || p.st === ST.charge;

function hit(G, a, t, dx, dz, dmg, kb, kind) {
  if (t.st === ST.out || t.inv > 0) return false;
  const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  t.pct = Math.min(999, t.pct + dmg);
  const k = kb * (1 + t.pct / 90);
  t.vx = dx * k; t.vz = dz * k; t.vy = 3 + k * 0.32; t.air = true; t.y = Math.max(t.y, 0.05);
  if (t.st === ST.charge) t.chg = 0;
  if (t.grab) { const g = G.players.find(q => q.id === t.grab); if (g && g.st === ST.held) setSt(g, ST.stun, 0.3); t.grab = null; }
  setSt(t, ST.stun, 0.22 + k * 0.022);
  // 잠깐 멈칫 (때린 쪽과 맞은 쪽 모두)
  const hs = Math.min(0.14, 0.04 + k * 0.004); t.hs = hs; if (a) a.hs = Math.max(a.hs, hs * 0.8);
  if (a) t.lastHit = { id: a.id, t: G.t };
  if (G.crown.h === t.id && k >= 6) dropCrown(G, t, dx * k * 0.45, dz * k * 0.45);
  ev(G, { k: 'hit', x: t.x, y: t.y + 1, z: t.z, s: Math.round(k), w: kind || (a ? a.wep : ''), id: t.id });
  return true;
}
function dropCrown(G, p, vx, vz) {
  const c = G.crown; c.h = null; c.x = p.x; c.z = p.z; c.y = p.y + 2.2; c.vx = vx; c.vz = vz; c.vy = 7; c.cd = 0.5; p.noPick = 1.2;
  ev(G, { k: 'drop', id: p.id });
}

/* ---------- 한 번 진행 ---------- */
export function step(G, dt, inputs) {
  G.t += dt; G.ev.length = 0;
  if (G.phase === 'count') { G.cd -= dt; if (G.cd <= 0) { G.phase = 'play'; ev(G, { k: 'go' }); } }
  const live = G.phase === 'play';
  if (live) G.play += dt;
  // 섬이 바깥 고리부터 무너져요
  if (live && G.ring > MIN_RING && G.play >= SHRINK_AT + G.shrinkN * SHRINK_EVERY) {
    G.shrinkN++; for (let i = 0; i < NT; i++) if (TILES[i].ring === G.ring && G.tl[i] !== 2) { G.tl[i] = 1; G.tt[i] = 2.5; G.rg[i] = 0; }
    G.ring--; ev(G, { k: 'shrink', r: G.ring + 1 });
  }
  for (let i = 0; i < NT; i++) {
    if (G.tl[i] === 1 && (G.tt[i] -= dt) <= 0) { G.tl[i] = 2; ev(G, { k: 'tfall', i }); if (G.rg[i] > 0) G.rg[i] = 9; }
    else if (G.tl[i] === 2 && G.rg[i] > 0 && (G.rg[i] -= dt) <= 0) { G.rg[i] = 0; if (TILES[i].ring <= G.ring) { G.tl[i] = PILLARS.includes(i) ? 3 : 0; ev(G, { k: 'tgrow', i }); } }
  }
  for (const p of G.players) {
    const inp = p.bot ? botInput(G, p, dt) : (inputs[p.id] || {});
    stepPlayer(G, p, dt, live ? inp : {});
  }
  // 서로 겹치지 않게 살짝 밀어요
  const ps = G.players;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j]; if (a.st === ST.out || b.st === ST.out || a.st === ST.held || b.st === ST.held || Math.abs(a.y - b.y) > 1.2) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
    if (d < 0.95 && d > 0.001) { const o = (0.95 - d) / 2; a.x -= dx / d * o; a.z -= dz / d * o; b.x += dx / d * o; b.z += dz / d * o; }
  }
  stepCrown(G, dt);
  if (live) for (const p of G.players) if (G.crown.h === p.id) {
    p.score += dt; p.held += dt;
    if (p.score >= G.target) { G.phase = 'over'; G.winner = p.id; ev(G, { k: 'win', id: p.id }); break; }
  }
}

function stepPlayer(G, p, dt, inp) {
  const w = W(p);
  p.sa += dt; p.atkCd -= dt; p.dashCd -= dt; p.skCd -= dt; p.inv -= dt; p.noPick -= dt;
  if (p.st === ST.out) {
    if (G.phase === 'over') return;
    if ((p.resp -= dt) <= 0) respawn(G, p); return;
  }
  if (p.hs > 0) { p.hs -= dt; return; }
  // 조준 방향
  if (inp.ax != null && (inp.ax || inp.az)) { const L = Math.hypot(inp.ax, inp.az); p.ax = inp.ax / L; p.az = inp.az / L; }
  let mx = +inp.mx || 0, mz = +inp.mz || 0; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  const grounded = !p.air;
  if (p.stT > 0) p.stT -= dt;
  const atk = !!inp.atk;
  // 상태 끝
  if (p.st === ST.swing && p.stT <= 0) setSt(p, ST.idle);
  if (p.st === ST.stun && p.stT <= 0 && grounded) setSt(p, ST.idle);
  if (p.st === ST.dash && p.stT <= 0) { setSt(p, ST.idle); p.vx *= 0.35; p.vz *= 0.35; }
  if (p.st === ST.lunge && p.stT <= 0) { setSt(p, ST.idle); p.vx *= 0.3; p.vz *= 0.3; }
  if (p.st === ST.slam && p.stT <= 0) { doSlam(G, p); setSt(p, ST.swing, 0.25); }
  if (p.st === ST.grab && p.stT <= 0) doThrow(G, p);
  if (p.st === ST.held) { const g = G.players.find(q => q.id === p.heldBy); if (!g || g.st !== ST.grab) setSt(p, ST.stun, 0.2); else { p.x = g.x + g.ax * 1.0; p.z = g.z + g.az * 1.0; p.y = g.y + 0.9; p.vx = p.vz = p.vy = 0; return; } }
  // 공격 모으기와 휘두르기
  if (canAct(p) && grounded) {
    if (atk && p.st !== ST.charge && p.atkCd <= 0 && !p.prevAtk) { setSt(p, ST.charge); p.chg = 0; }
    if (p.st === ST.charge) {
      p.chg = Math.min(1, p.chg + dt / w.chg);
      if (!atk) swing(G, p);
    }
    if (inp.sk && p.skCd <= 0) skill(G, p);
    else if (inp.dash && p.dashCd <= 0) dash(G, p, mx, mz);
  } else if (inp.dash && p.dashCd <= 0 && p.air && p.airDash && (p.st === ST.stun ? p.stT <= 0.05 : canAct(p))) dash(G, p, mx, mz);
  p.prevAtk = atk;
  // 움직임
  if (canAct(p) && grounded) {
    const sp = w.spd * (p.st === ST.charge ? 0.45 : 1) * (G.crown.h === p.id ? 0.86 : 1);
    const k = 1 - Math.exp(-dt * 14); p.vx = lerp(p.vx, mx * sp, k); p.vz = lerp(p.vz, mz * sp, k);
    if (p.st !== ST.charge) { if (ml > 0.1) { p.fx = mx; p.fz = mz; if (p.st === ST.idle) setSt(p, ST.run); } else if (p.st === ST.run) setSt(p, ST.idle); }
    if (p.st === ST.charge) { p.fx = p.ax; p.fz = p.az; }
  } else if (p.st === ST.stun && grounded) { const f = Math.exp(-dt * 2.4); p.vx *= f; p.vz *= f; }
  else if (p.st === ST.swing && grounded) { const f = Math.exp(-dt * 10); p.vx *= f; p.vz *= f; }
  else if (p.air && canAct(p)) { p.vx = lerp(p.vx, mx * w.spd * 0.6, 1 - Math.exp(-dt * 2)); p.vz = lerp(p.vz, mz * w.spd * 0.6, 1 - Math.exp(-dt * 2)); }
  p.x += p.vx * dt; p.z += p.vz * dt;
  // 바위 기둥에 막혀요
  for (const i of PILLARS) if (G.tl[i] === 3 && p.y < 2.5) {
    const T = TILES[i], dx = p.x - T.x, dz = p.z - T.z, d = Math.hypot(dx, dz), R = 1.15;
    if (d < R && d > 0.001) { p.x = T.x + dx / d * R; p.z = T.z + dz / d * R; if (p.st === ST.stun) { const dot = (p.vx * dx + p.vz * dz) / d; if (dot < 0) { p.vx -= 1.6 * dot * dx / d; p.vz -= 1.6 * dot * dz / d; } } }
  }
  // 돌진과 구르기 중 부딪힘
  if (p.st === ST.lunge || p.st === ST.dash) for (const t of G.players) {
    if (t === p || t.st === ST.out || (p.hitSet && p.hitSet.has(t.id))) continue;
    if (Math.hypot(t.x - p.x, t.z - p.z) < 1.3 && Math.abs(t.y - p.y) < 1.4) {
      (p.hitSet || (p.hitSet = new Set())).add(t.id);
      if (p.st === ST.lunge) hit(G, p, t, p.ax * 2 + (t.x - p.x), p.az * 2 + (t.z - p.z), 12, 15, 'lunge');
      else hit(G, p, t, t.x - p.x, t.z - p.z, 2, 5.5, 'bump');
    }
  }
  // 떨어지기
  const sup = standable(G, p.x, p.z);
  if (!p.air && !sup) { p.air = true; p.vy = Math.min(p.vy, 0); }
  if (p.air) {
    p.vy -= 30 * dt; p.y += p.vy * dt;
    if (p.y <= 0 && p.y > -0.7 && sup && p.vy <= 0) { p.y = 0; p.vy = 0; p.air = false; p.airDash = true; if (p.st === ST.stun && p.stT <= 0) setSt(p, ST.idle); }
    if (p.y < FALL_Y) fallOut(G, p);
  }
}

function swing(G, p) {
  const w = W(p), c = p.chg; setSt(p, ST.swing, w.swing); p.atkCd = w.cd; p.fx = p.ax; p.fz = p.az;
  p.lastChg = c;
  const dmg = lerp(w.dmg[0], w.dmg[1], c), kb = lerp(w.kb[0], w.kb[1], c), rg = w.range + (p.wep === 'spear' ? c * 0.6 : 0);
  // 조금 앞으로 내딛어요
  p.vx += p.ax * 3; p.vz += p.az * 3;
  ev(G, { k: 'swing', id: p.id, c: Math.round(c * 10) / 10 });
  for (const t of G.players) {
    if (t === p || t.st === ST.out) continue;
    const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz);
    if (d > rg + 0.45 || Math.abs(t.y - p.y) > 1.6) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (dx * p.ax + dz * p.az) / (d || 1))));
    if (d > 0.6 && ang > w.arc / 2) continue;
    hit(G, p, t, dx / (d || 1) + p.ax, dz / (d || 1) + p.az, dmg, kb);
  }
  p.chg = 0;
}
function dash(G, p, mx, mz) {
  let dx = mx, dz = mz; if (Math.hypot(dx, dz) < 0.2) { dx = p.ax; dz = p.az; } const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  if (p.air) { p.airDash = false; p.vy = Math.max(p.vy, 5.5); }
  setSt(p, ST.dash, DASH.t); p.dashCd = DASH.cd; p.vx = dx * DASH.spd; p.vz = dz * DASH.spd; p.fx = dx; p.fz = dz; p.inv = 0.1; p.hitSet = new Set(); p.chg = 0;
  ev(G, { k: 'dash', id: p.id });
}
function skill(G, p) {
  const w = W(p); p.skCd = w.sk.cd; p.chg = 0; p.fx = p.ax; p.fz = p.az; p.hitSet = new Set();
  if (p.wep === 'hammer') { setSt(p, ST.slam, 0.38); p.vx = p.vz = 0; }
  else if (p.wep === 'spear') { setSt(p, ST.lunge, 0.3); p.vx = p.ax * 21; p.vz = p.az * 21; }
  else {
    // 잡기: 앞쪽 가까운 상대 하나
    let best = null, bd = 2.3;
    for (const t of G.players) { if (t === p || t.st === ST.out || t.inv > 0 || t.st === ST.held) continue; const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz); if (d < bd && (dx * p.ax + dz * p.az) / (d || 1) > 0.3 && Math.abs(t.y - p.y) < 1.4) { bd = d; best = t; } }
    if (best) { setSt(p, ST.grab, 0.42); p.grab = best.id; best.heldBy = p.id; setSt(best, ST.held, 9); best.chg = 0; if (G.crown.h === best.id) dropCrown(G, best, 0, 0); p.vx = p.vz = 0; }
    else { setSt(p, ST.swing, 0.3); p.skCd = 2; }
  }
  ev(G, { k: 'skill', id: p.id, w: p.wep });
}
function doSlam(G, p) {
  const cx = p.x + p.ax * 1.7, cz = p.z + p.az * 1.7;
  for (const t of G.players) { if (t === p || t.st === ST.out) continue; const dx = t.x - cx, dz = t.z - cz, d = Math.hypot(dx, dz); if (d < 3.3 && Math.abs(t.y - p.y) < 1.6) hit(G, p, t, dx || p.ax, dz || p.az, 10, 13.5, 'slam'); }
  const ti = tileAt(cx, cz);
  if (ti >= 0) for (let i = 0; i < NT; i++) if (G.tl[i] === 0 && hexDist(i, ti) <= 1) { G.tl[i] = 1; G.tt[i] = 1.4; G.rg[i] = 1; }
  ev(G, { k: 'slam', x: cx, z: cz });
}
function doThrow(G, p) {
  const t = G.players.find(q => q.id === p.grab); p.grab = null; setSt(p, ST.swing, 0.25);
  if (t && t.st === ST.held) { t.x = p.x - p.ax * 0.8; t.z = p.z - p.az * 0.8; t.y = 0.6; setSt(t, ST.stun, 0); hit(G, p, t, -p.ax, -p.az, 9, 16, 'throw'); }
}
function fallOut(G, p) {
  if (G.crown.h === p.id) { G.crown.h = null; G.crown.gone = 1.2; G.crown.y = -50; }
  setSt(p, ST.out); p.resp = RESPAWN; p.falls++; p.vx = p.vz = p.vy = 0; p.chg = 0;
  if (p.grab) p.grab = null;
  const lh = p.lastHit; let by = null;
  if (lh && G.t - lh.t < 7) { const k = G.players.find(q => q.id === lh.id); if (k && k !== p) { k.ko++; if (G.phase === 'play') k.score = Math.min(G.target - 0.5, k.score + KO_PTS); by = k.id; } }
  ev(G, { k: 'ko', id: p.id, by });
  p.lastHit = null;
}
function respawn(G, p) {
  let best = -1, bs = -1;
  for (let i = 0; i < NT; i++) {
    if (G.tl[i] !== 0 || TILES[i].ring > Math.max(1, G.ring - 1)) continue;
    let md = 99; for (const q of G.players) if (q !== p && q.st !== ST.out) md = Math.min(md, Math.hypot(q.x - TILES[i].x, q.z - TILES[i].z));
    const sc = Math.min(md, 7) + Math.random() * 1.5; if (sc > bs) { bs = sc; best = i; }
  }
  const T = TILES[best >= 0 ? best : 0];
  p.x = T.x; p.z = T.z; p.y = 7; p.vx = p.vz = 0; p.vy = 0; p.air = true; p.airDash = true; p.pct = 0; p.inv = 1.6; setSt(p, ST.idle);
  ev(G, { k: 'spawn', id: p.id });
}

function stepCrown(G, dt) {
  const c = G.crown; c.cd -= dt;
  if (c.h) { const p = G.players.find(q => q.id === c.h); if (p) { c.x = p.x; c.y = p.y + 2.6; c.z = p.z; } return; }
  if (c.gone > 0) { if ((c.gone -= dt) <= 0) { let bi = 0, bd = 99; for (let i = 0; i < NT; i++) if (G.tl[i] === 0 && TILES[i].ring < bd) { bd = TILES[i].ring; bi = i; } c.x = TILES[bi].x; c.z = TILES[bi].z; c.y = 6; c.vx = c.vz = c.vy = 0; ev(G, { k: 'crown' }); } return; }
  const sup = standable(G, c.x, c.z);
  c.vy -= 24 * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.y += c.vy * dt;
  if (c.y <= 0.5 && c.y > -0.4 && sup) { c.y = 0.5; if (c.vy < -4) c.vy = -c.vy * 0.35; else c.vy = 0; const f = Math.exp(-dt * 5); c.vx *= f; c.vz *= f; }
  if (c.y < FALL_Y) { c.gone = 1.5; c.y = -50; ev(G, { k: 'crownfall' }); return; }
  if (G.phase !== 'play' || c.cd > 0 || c.y > 1.8) return;
  for (const p of G.players) {
    if (p.st === ST.out || p.st === ST.held || p.st === ST.stun || p.noPick > 0 || p.air) continue;
    if (Math.hypot(p.x - c.x, p.z - c.z) < 1.2) { c.h = p.id; ev(G, { k: 'pick', id: p.id }); break; }
  }
}

/* ---------- 봇 ---------- */
function botInput(G, p, dt) {
  const b = p.bot2, w = W(p), c = G.crown; b.t -= dt;
  const out = { mx: b.mx, mz: b.mz, ax: p.ax, az: p.az, atk: false, dash: false, sk: false };
  if (p.st === ST.out || G.phase !== 'play') return { atk: false };
  // 떨어지는 중이면 섬 가운데로 구르기
  if (p.air && p.y < -0.3 && p.airDash) { const L = Math.hypot(p.x, p.z) || 1; return { mx: -p.x / L, mz: -p.z / L, dash: true }; }
  const foes = G.players.filter(q => q !== p && q.st !== ST.out);
  let near = null, nd = 99; for (const q of foes) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < nd) { nd = d; near = q; } }
  const holder = c.h && G.players.find(q => q.id === c.h);
  let tx, tz, target = null;
  if (holder === p) {
    // 왕관을 들고 있으면: 가까운 적에게서 멀어지되 섬 안쪽으로
    const awx = near ? p.x - near.x : 0, awz = near ? p.z - near.z : 0, aL = Math.hypot(awx, awz) || 1;
    const lim = HEX * 1.5 * Math.max(1.5, G.ring - 1.2), cen = Math.min(1.6, Math.hypot(p.x, p.z) / lim * 1.4);
    tx = p.x + awx / aL * 2 - p.x / (Math.hypot(p.x, p.z) || 1) * cen * 2.4; tz = p.z + awz / aL * 2 - p.z / (Math.hypot(p.x, p.z) || 1) * cen * 2.4;
    if (near && nd < w.range + 0.4) target = near;
  } else if (holder) { tx = holder.x; tz = holder.z; target = holder; if (near && nd < w.range * 0.8 && near !== holder) target = near; }
  else if (c.gone <= 0) { tx = c.x; tz = c.z; if (near && nd < w.range * 0.9) target = near; }
  else { tx = 0; tz = 0; target = near; }
  if (b.t <= 0) {
    b.t = 0.12 + Math.random() * 0.12;
    let dx = tx - p.x, dz = tz - p.z; const L = Math.hypot(dx, dz);
    if (L > 0.3) { dx /= L; dz /= L; } else { dx = dz = 0; }
    // 지금 공격할 상대가 사거리 안이면 멈춰서 휘둘러요
    if (target && target !== holder && Math.hypot(target.x - p.x, target.z - p.z) < w.range * 0.7) { dx *= 0.2; dz *= 0.2; }
    // 낭떠러지를 피해요
    for (let a = 0; a < 6 && (dx || dz); a++) {
      if (standable(G, p.x + dx * 1.4, p.z + dz * 1.4) && standable(G, p.x + dx * 0.7, p.z + dz * 0.7)) break;
      const r = (a % 2 ? -1 : 1) * (0.6 + a * 0.35), cs = Math.cos(r), sn = Math.sin(r); [dx, dz] = [dx * cs - dz * sn, dx * sn + dz * cs];
      if (a === 5) { const Lc = Math.hypot(p.x, p.z) || 1; dx = -p.x / Lc; dz = -p.z / Lc; }
    }
    b.mx = dx; b.mz = dz;
    if (target) { const d = Math.hypot(target.x - p.x, target.z - p.z);
      if (d < w.range + 0.3 && p.atkCd <= 0 && !b.atk && Math.random() < 0.75) { b.atk = true; b.want = Math.random() * (Math.random() < 0.4 ? 1 : 0.5); }
      if (p.skCd <= 0 && Math.random() < 0.25 && ((p.wep === 'spear' && d > 2 && d < 5.5) || (p.wep === 'hammer' && d < 2.8) || (p.wep === 'fist' && d < 1.9))) out.sk = true;
      if (p.dashCd <= 0 && target === holder && d > 3 && d < 7 && Math.random() < 0.18) out.dash = true;
    }
    out.mx = b.mx; out.mz = b.mz;
  }
  if (target) { const dx = target.x - p.x, dz = target.z - p.z, L = Math.hypot(dx, dz) || 1; out.ax = dx / L; out.az = dz / L; }
  if (b.atk) { if (p.st === ST.charge && p.chg >= b.want) b.atk = false; else if (p.st !== ST.charge && p.atkCd > 0 && p.sa > 0.05 && p.st === ST.swing) b.atk = false; }
  if (b.atk && p.st !== ST.charge && p.st !== ST.idle && p.st !== ST.run) b.atk = false;
  out.atk = b.atk;
  return out;
}

/* ---------- 장면 보내기 ---------- */
export function snapshot(G) {
  const r = n => Math.round(n * 100) / 100;
  return {
    t: r(G.t), ph: G.phase, cd: r(G.cd), ring: G.ring, pl: r(G.play), tl: Array.from(G.tl).join(''), w: G.winner, tg: G.target,
    p: G.players.map(p => [p.id, r(p.x), r(p.y), r(p.z), r(p.fx), r(p.fz), p.st, r(p.sa), r(p.chg), Math.round(p.pct), r(p.score), p.ko, p.falls, p.inv > 0 ? 1 : 0, r(p.ax), r(p.az), r(Math.max(0, p.dashCd)), r(Math.max(0, p.skCd)), r(Math.max(0, p.resp)), r(p.held)]),
    c: [r(G.crown.x), r(G.crown.y), r(G.crown.z), G.crown.h]
  };
}

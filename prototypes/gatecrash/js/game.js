/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   시뮬레이션: 물리, 길찾기(봇), 무기, 아이템 */
'use strict';

/* ---------- 월드 ---------- */
function makeWorld(mapId) {
  const m = MAPS[mapId].make();
  const W = { id: mapId, w: m.w, h: m.h, g: m.g, objs: m.objs, spawns: m.spawns, starts: m.starts, rooms: m.rooms, finish: m.finish, pw: m.w * TS, ph: m.h * TS };
  // 무기 자리가 가구 속이면 가까운 빈 바닥으로 옮겨요
  for (const sp of W.spawns) {
    const row = Math.floor(sp.y / TS), free = tx => tx > 0 && tx < W.w - 1 && !isSolid(tileAt(W, tx, row)) && !isSolid(tileAt(W, tx, row - 1)) && canStand(tileAt(W, tx, row + 1)) && tileAt(W, tx, row + 1) !== 'I';
    const tx0 = Math.floor(sp.x / TS);
    for (let d = 0; d < 14; d++) { const hit = [tx0 - d, tx0 + d].find(free); if (hit !== undefined) { sp.x = hit * TS + TS / 2; break; } }
  }
  W.hasLift = W.g.some(row => row.includes('U')); W.hasBelt = W.g.some(row => row.includes('>') || row.includes('<'));
  buildNav(W);
  return W;
}
function tileAt(W, tx, ty) { if (tx < 0 || tx >= W.w) return '#'; if (ty < 0) return '.'; if (ty >= W.h) return '#'; return W.g[ty][tx]; }
function isSolid(c) { return c === '#' || c === 'x' || c === '>' || c === '<' || c === 'I'; }
function canStand(c) { return isSolid(c) || c === '='; }

/* ---------- 물리 ---------- */
function newBody(x, y) { return { x, y, vx: 0, vy: 0, ground: false, coy: 0, buf: 0, jumped: false, stun: 0, air: 0 }; }
function approach(v, t, d) { return v < t ? Math.min(t, v + d) : Math.max(t, v - d); }

function moveX(W, b, dx) {
  if (!dx) return;
  let nx = b.x + dx;
  const y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + PH.H - 1) / TS);
  if (dx > 0) {
    const tx = Math.floor((nx + PH.W - 1) / TS);
    for (let ty = y0; ty <= y1; ty++) if (isSolid(tileAt(W, tx, ty))) { nx = tx * TS - PH.W; b.vx = Math.min(0, b.vx); break; }
  } else {
    const tx = Math.floor(nx / TS);
    for (let ty = y0; ty <= y1; ty++) if (isSolid(tileAt(W, tx, ty))) { nx = (tx + 1) * TS; b.vx = Math.max(0, b.vx); break; }
  }
  b.x = Math.max(0, Math.min(W.pw - PH.W, nx));
}
function moveY(W, b, dy) {
  b.ground = false;
  let ny = b.y + dy;
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + PH.W - 1) / TS);
  if (dy > 0) {
    const prevBottom = b.y + PH.H, ty = Math.floor((ny + PH.H) / TS);
    for (let tx = x0; tx <= x1; tx++) {
      const c = tileAt(W, tx, ty);
      if (isSolid(c) || (c === '=' && prevBottom <= ty * TS + 0.01)) { ny = ty * TS - PH.H; b.vy = 0; b.ground = true; break; }
    }
  } else if (dy < 0) {
    const ty = Math.floor(ny / TS);
    for (let tx = x0; tx <= x1; tx++) if (isSolid(tileAt(W, tx, ty))) { ny = (ty + 1) * TS; b.vy = 0; break; }
  }
  b.y = ny;
}
function iceUnder(W, b) { return b.ground && (W.wet || tileAt(W, Math.floor((b.x + PH.W / 2) / TS), Math.floor((b.y + PH.H) / TS)) === 'I'); }
function inLift(W, b) {
  const cx = Math.floor((b.x + PH.W / 2) / TS);
  if (W.liftOff || tileAt(W, cx, Math.floor((b.y + PH.H / 2) / TS)) !== 'U') return false;
  return !(b.ground && tileAt(W, cx, Math.floor((b.y + PH.H) / TS)) === '=');      // 승강로 위 발판에 서 있으면 끌려가지 않아요
}
function beltUnder(W, b) {
  if (!b.ground) return 0;
  const ty = Math.floor((b.y + PH.H) / TS), c = tileAt(W, Math.floor((b.x + PH.W / 2) / TS), ty);
  return (c === '>' ? 1 : c === '<' ? -1 : 0) * (W.flipB ? -1 : 1);
}
/* inp: { d: -1|0|1, jp: 이번에 누름, j: 누르고 있음 } */
function stepBody(W, b, inp, dt) {
  let dir = inp.d | 0;
  if (b.stun > 0) { b.stun -= dt; dir = 0; }
  if (b.stun > 0) b.vx -= b.vx * Math.min(1, dt * (b.ground ? 5 : 0.8));
  else b.vx = approach(b.vx, dir * PH.RUN, (b.ground ? (iceUnder(W, b) ? PH.ICE : PH.ACC) : PH.AIR) * dt);
  if (inp.jp) b.buf = PH.BUF; else b.buf = Math.max(0, b.buf - dt);
  if (b.ground) { b.coy = PH.COY; b.jumped = false; } else b.coy = Math.max(0, b.coy - dt);
  let jumpedNow = false;
  if (b.buf > 0 && b.coy > 0 && b.stun <= 0) { b.vy = -PH.JUMP; b.buf = 0; b.coy = 0; b.jumped = true; jumpedNow = true; }
  if (!inp.j && b.jumped && b.vy < -PH.CUT) b.vy = -PH.CUT;
  if (inLift(W, b)) b.vy = approach(b.vy, -PH.LIFT, 5000 * dt); else b.vy = Math.min(PH.MAXF, b.vy + PH.G * dt);
  const belt = beltUnder(W, b);
  moveX(W, b, (b.vx + belt * PH.BELT) * dt);
  moveY(W, b, b.vy * dt);
  b.air = b.ground ? 0 : b.air + dt;
  return jumpedNow;
}

/* ---------- 길찾기: 서 있을 수 있는 칸마다 실제 물리로 점프를 시험해 도착점까지 걸리는 시간을 계산해요 ---------- */
function isNode(W, tx, ty) {
  if (tx < 0 || tx >= W.w || ty < 1 || ty >= W.h - 1) return false;
  const c = tileAt(W, tx, ty), up = tileAt(W, tx, ty - 1);
  return !isSolid(c) && !isSolid(up) && c !== '=' && canStand(tileAt(W, tx, ty + 1));
}
function nodeOfFeet(W, x, y) {
  const tx = Math.floor((x + PH.W / 2) / TS), ty = Math.floor((y + PH.H) / TS) - 1;
  if (isNode(W, tx, ty)) return ty * W.w + tx;
  // 공중이면 아래로 내려가며 처음 서는 칸
  for (let k = ty + 1; k < Math.min(W.h - 1, ty + 12); k++) if (isNode(W, tx, k)) return k * W.w + tx;
  return -1;
}
const NAV_ACTS = [];
for (const off of [0, 0.5, 1]) for (const d of [-1, 0, 1]) NAV_ACTS.push({ jump: true, off, d, delay: 0 });
for (const off of [0, 0.5, 1]) for (const d of [-1, 1]) NAV_ACTS.push({ jump: true, off, d, delay: 0.16 });
NAV_ACTS.push({ jump: false, off: 0.5, d: -1, delay: 0 }, { jump: false, off: 0.5, d: 1, delay: 0 });

function simAct(W, tx, ty, a) {
  const b = newBody(tx * TS + a.off * (TS - PH.W), (ty + 1) * TS - PH.H);
  b.ground = true; b.coy = PH.COY;
  const dt = 1 / 60; let t = 0, left = false;
  for (let f = 0; f < 150; f++) {
    const d = t < a.delay ? 0 : a.d;
    stepBody(W, b, { d, jp: a.jump && f === 0, j: a.jump }, dt); t += dt;
    if (!b.ground) left = true;
    if (left && b.ground) break;
    if (!a.jump && !left && f > 30) return null;      // 걸어서 떨어지지 않음
  }
  if (!left || !b.ground) return null;
  const n = nodeOfFeet(W, b.x, b.y);
  if (n < 0 || n === ty * W.w + tx) return null;
  return { to: n, t, x: b.x };
}
function buildNav(W) {
  const N = W.w * W.h, edges = new Array(N), nodes = [];
  for (let ty = 0; ty < W.h; ty++) for (let tx = 0; tx < W.w; tx++) {
    const id = ty * W.w + tx; if (!isNode(W, tx, ty)) continue; nodes.push(id);
    const es = [];
    for (const dx of [-1, 1]) if (isNode(W, tx + dx, ty)) es.push({ to: id + dx, t: TS / PH.RUN, walk: dx });
    for (const a of NAV_ACTS) { const r = simAct(W, tx, ty, a); if (r && !es.some(e => e.to === r.to && e.t <= r.t + 0.05)) es.push({ to: r.to, t: r.t + (a.jump ? 0.06 : 0), act: a }); }
    edges[id] = es;
  }
  // 거꾸로 다익스트라: 도착 칸에서부터
  const dist = new Float64Array(N).fill(Infinity), rev = new Array(N);
  for (const id of nodes) for (const e of edges[id]) (rev[e.to] || (rev[e.to] = [])).push({ from: id, t: e.t });
  const F = W.finish, heap = [];
  const push = (d, id) => { heap.push([d, id]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  for (const id of nodes) { const tx = id % W.w, ty = (id / W.w) | 0; if (tx >= F.x0 && tx <= F.x1 && ty >= F.y0 && ty <= F.y1) { dist[id] = 0; push(0, id); } }
  while (heap.length) { const [d, id] = pop(); if (d > dist[id]) continue; for (const e of rev[id] || []) { const nd = d + e.t; if (nd < dist[e.from]) { dist[e.from] = nd; push(nd, e.from); } } }
  W.edges = edges; W.dist = dist; W.nodes = nodes;
  let mx = 0; for (const id of nodes) if (dist[id] < Infinity) mx = Math.max(mx, dist[id]);
  W.maxDist = mx || 1;
}
function inFinish(W, r) {
  const F = W.finish, cx = (r.x + PH.W / 2) / TS, cy = (r.y + PH.H - 2) / TS;
  return cx >= F.x0 && cx < F.x1 + 1 && cy >= F.y0 && cy < F.y1 + 1;
}

/* ---------- 맵 이벤트: 시간(G.clock)만으로 정해져서 모두에게 똑같이 일어나요 ---------- */
function evUpdate(W, clock, phase) {
  const kinds = ['wet']; if (W.hasLift) kinds.unshift('lift'); if (W.hasBelt) kinds.splice(1, 0, 'flip');
  const c = phase === 'race' ? clock % 40 : -99, n = Math.floor(clock / 40), k1 = kinds[(n * 2) % kinds.length], k2 = kinds[(n * 2 + 1) % kinds.length];
  const on1 = c >= 12 && c < 19, on2 = c >= 28 && c < 34, soon1 = c >= 9 && c < 12, soon2 = c >= 25 && c < 28;
  const act = k => (on1 && k1 === k) || (on2 && k2 === k);
  W.liftOff = act('lift'); W.wet = act('wet'); W.flipB = act('flip');
  const name = { lift: '엘리베이터 점검 중', wet: '물청소 중! 바닥이 미끄러워요', flip: '컨베이어가 거꾸로 돌아요' };
  W.evMsg = on1 ? name[k1] : on2 ? name[k2] : soon1 ? '곧 ' + name[k1] : soon2 ? '곧 ' + name[k2] : '';
  W.evNow = on1 || on2;
}

/* ---------- 레이서 ---------- */
function newRacer(o, W) {
  const s = W.starts[o.slot % W.starts.length];
  const r = Object.assign(newBody(s.x, s.y), { id: o.id, name: o.name, col: o.col, skin: o.skin || '', bot: !!o.bot, slot: o.slot, own: !!o.own,
    emo: 0, emoT: 0, emoCd: 0, face: 1, aim: 0, hp: MAX_HP, wep: null, cd: 0, inv: 0, swing: 0, flash: 0, fin: false, finT: 0, anim: 0, node: -1, prog: 1, ko: 0,
    ai: o.bot ? { plan: null, stuck: 0, best: Infinity, wait: 0, noise: 0.15 + Math.random() * 0.25, aimT: 0, react: 0.2 + Math.random() * 0.3, err: 0.03 + Math.random() * 0.07 } : null,
    tx: s.x, ty: s.y });
  return r;
}
function respawn(W, r) {
  const s = W.starts[r.slot % W.starts.length];
  r.x = s.x; r.y = s.y; r.vx = r.vy = 0; r.hp = MAX_HP; r.inv = 1.5; r.stun = 0; r.wep = null; r.ko++;
  if (r.ai) { r.ai.plan = null; r.ai.best = Infinity; r.ai.stuck = 0; }
}
function progressOf(W, r) {
  if (r.fin) return 0;
  const n = nodeOfFeet(W, r.x, r.y); if (n >= 0) r.node = n;
  const d = r.node >= 0 ? W.dist[r.node] : W.maxDist;
  return d === Infinity ? W.maxDist : d;
}

/* ---------- 봇 조종 ---------- */
function botInput(G, r, dt) {
  const W = G.W, ai = r.ai, inp = { d: 0, jp: false, j: true };
  if (r.fin || G.phase !== 'race') return { d: 0, jp: false, j: false };
  if (ai.wait > 0) { ai.wait -= dt; return { d: 0, jp: false, j: false }; }
  const cur = progressOf(W, r);
  if (cur < ai.best - 0.05) { ai.best = cur; ai.stuck = 0; } else ai.stuck += dt;
  if (ai.stuck > 2.5) { ai.stuck = 0; ai.best = Infinity; ai.plan = null; return { d: Math.random() < 0.5 ? -1 : 1, jp: true, j: true }; }
  if (inLift(W, r) && r.stun <= 0) {
    // 엘리베이터 안: 꼭대기 가까이 오면 방 안쪽으로 걸어 나와요
    const tx = Math.floor((r.x + PH.W / 2) / TS), ty = Math.floor((r.y + PH.H / 2) / TS);
    ai.plan = null; ai.stuck = 0; ai.best = Infinity; ai.liftT = 0.4;
    let a = tx, b = tx; while (tileAt(W, a - 1, ty) === 'U') a--; while (tileAt(W, b + 1, ty) === 'U') b++;
    if (tileAt(W, tx, ty - 2) !== 'U') {
      // 발밑이 단단한 쪽으로 나가요 (단상 위로 올라가는 승강기도 있어요)
      const fr = Math.floor((r.y + PH.H) / TS), okR = [0, 1, 2].some(k => isSolid(tileAt(W, b + 2, fr + k))), okL = [0, 1, 2].some(k => isSolid(tileAt(W, a - 2, fr + k)));
      if (!ai.exitD) ai.exitD = okR !== okL ? (okR ? 1 : -1) : r.x < W.pw / 2 ? 1 : -1;
      return { d: ai.exitD, jp: false, j: true };
    }
    const mid = (a + b + 1) * TS / 2 - PH.W / 2, dx = mid - r.x;      // 승강로 가운데로 맞춰서 벽에 걸리지 않게 해요
    return { d: Math.abs(dx) > 2 ? Math.sign(dx) : 0, jp: false, j: true };
  }
  if (ai.liftT > 0) { ai.liftT -= dt; if (ai.liftT <= 0) ai.exitD = 0; }
  if (r.ground && r.stun <= 0) {
    const n = nodeOfFeet(W, r.x, r.y);
    if (n >= 0 && (!ai.plan || ai.plan.from !== n || ai.plan.done)) {
      let best = null, bc = Infinity;
      for (const e of W.edges[n] || []) { const c = e.t + W.dist[e.to] + Math.random() * ai.noise * 0.3; if (c < bc) { bc = c; best = e; } }
      ai.plan = best ? { from: n, e: best, done: false, launched: false, shift: Math.random() < ai.err ? (Math.random() < .5 ? -1 : 1) * (5 + Math.random() * 8) : 0 } : null;
      if (ai.plan && Math.random() < ai.err * .45) ai.wait = .3 + Math.random() * .7;     // 잠깐 망설여요
      if (ai.plan && ai.plan.shift && Math.random() < .35 && W.edges[n].length > 1) ai.plan.e = W.edges[n][(Math.random() * W.edges[n].length) | 0];   // 엉뚱한 길로 가 봐요
    }
    const p = ai.plan;
    if (p && !p.launched) {
      const e = p.e, tx = p.from % W.w;
      if (e.walk) { inp.d = e.walk; }
      else {
        const lx = tx * TS + e.act.off * (TS - PH.W) + p.shift;
        const dx = lx - r.x;
        if (Math.abs(dx) > 2.5) inp.d = Math.sign(dx) * (Math.abs(dx) < 10 && Math.abs(r.vx) > 60 ? 0 : 1);
        else if (Math.abs(r.vx) > 45 && e.act.d !== Math.sign(r.vx)) inp.d = 0;
        else if (e.act.jump) { inp.jp = true; inp.d = e.act.delay ? 0 : e.act.d; p.launched = true; p.t = 0; }
        else { inp.d = e.act.d; p.launched = true; p.t = 0; }
      }
    } else if (p && p.launched) { if (p.e.act && !p.e.act.jump) inp.d = p.e.act.d; else p.done = true; }
  } else if (ai.plan && ai.plan.launched) {
    const p = ai.plan; p.t += dt;
    const a = p.e.act; inp.d = a ? (p.t < a.delay ? 0 : a.d) : 0;
    // 내려가는 중이면 착지 칸 쪽으로 살짝 맞춰요
    if (r.vy > 60 && a) { const to = p.e.to, cx = (to % W.w) * TS + (TS - PH.W) / 2; if (Math.abs(cx - r.x) > 5) inp.d = Math.sign(cx - r.x); }
  }
  return inp;
}
function botFight(G, r) {
  const ai = r.ai; if (!r.wep || r.cd > 0 || r.fin || G.phase !== 'race') return null;
  const w = WEAPONS[r.wep.k], reach = w.kind === 'melee' ? w.range + 8 : w.reach;
  if (w.kind === 'trap') { for (const o of G.racers) if (o !== r && !o.fin && Math.abs(o.x - r.x) < 110 && Math.abs(o.y - r.y) < 30 && o.prog > r.prog && r.ground) return 0; return null; }
  let tgt = null, bd = Infinity;
  for (const o of G.racers) {
    if (o === r || o.fin || o.inv > 0) continue;
    const dx = o.x - r.x, dy = o.y - r.y, d = Math.hypot(dx, dy);
    if (d < reach && d < bd && Math.abs(dy) < (w.kind === 'rocket' ? 70 : 34) && clearLine(G.W, r.x + PH.W / 2, r.y + 8, o.x + PH.W / 2, o.y + 8)) { bd = d; tgt = o; }
  }
  if (!tgt) { ai.aimT = 0; return null; }
  ai.aimT += 1 / 60; if (ai.aimT < ai.react) return null;
  return Math.atan2(tgt.y - r.y, tgt.x - r.x) + (Math.random() - 0.5) * 0.15;
}
function clearLine(W, x0, y0, x1, y1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
  for (let i = 1; i < n; i++) { const t = i / n; if (isSolid(tileAt(W, Math.floor((x0 + (x1 - x0) * t) / TS), Math.floor((y0 + (y1 - y0) * t) / TS)))) return false; }
  return true;
}

/* ---------- 경기 ---------- */
function newGame(mapId, players) {
  const W = makeWorld(mapId), G = { W, phase: 'count', t: 8, clock: 0, racers: [], items: [], shots: [], traps: [], fx: [], ev: [], rank: [], seq: 1 };
  players.forEach((p, i) => G.racers.push(newRacer(Object.assign({ slot: i }, p), W)));
  W.spawns.forEach((s, i) => G.items.push({ id: i, x: s.x, y: s.y, k: WEP_IDS[(i * 7 + 3) % WEP_IDS.length], on: true, t: 0 }));
  return G;
}
function nearItem(G, r) {
  for (const it of G.items) if (it.on && Math.abs(it.x - (r.x + PH.W / 2)) < 14 && Math.abs(it.y - (r.y + PH.H / 2)) < 16) return it;
  return null;
}
function hurt(G, v, from, w, dx, dy, mul) {
  if (v.inv > 0 || v.fin) return;
  const n = Math.hypot(dx, dy) || 1;
  v.hp -= w.dmg * (mul || 1); v.vx = dx / n * w.kb * (mul || 1); v.vy = -w.up - Math.max(0, -dy / n) * 60; v.ground = false; v.stun = Math.max(v.stun, w.stun); v.flash = 0.18;
  G.ev.push({ t: 'hit', x: v.x + 5, y: v.y + 8 }); if (v.bot && Math.random() < .25) { v.emo = 2; v.emoT = 2; }
  if (v.hp <= 0) { G.ev.push({ t: 'ko', x: v.x + 5, y: v.y + 8, id: v.id }); respawn(G.W, v); }
}
function useWeapon(G, r, ang) {
  if (!r.wep || r.cd > 0 || r.stun > 0 || r.fin || G.phase !== 'race') return;
  const w = WEAPONS[r.wep.k], cx = r.x + PH.W / 2, cy = r.y + 8;
  r.cd = w.cd; r.swing = 0.18; r.face = Math.cos(ang) >= 0 ? 1 : -1; r.aim = ang;
  if (w.kind === 'melee') {
    G.ev.push({ t: 'swing', x: cx, y: cy, a: ang });
    for (const o of G.racers) if (o !== r) {
      const dx = o.x + 5 - cx, dy = o.y + 11 - cy;
      if (Math.hypot(dx, dy) < w.range + 8 && (dx * Math.cos(ang) + dy * Math.sin(ang)) > -4) hurt(G, o, r, w, Math.cos(ang) * 1 + dx / 40, dy / 40, 1);
    }
  } else if (w.kind === 'shot' || w.kind === 'rocket') {
    for (let i = 0; i < (w.n || 1); i++) { const a = ang + (w.n ? (i / (w.n - 1) - .5) * w.spread : 0) + (w.spread && !w.n ? (Math.random() - .5) * w.spread : 0); G.shots.push({ k: r.wep.k, x: cx + Math.cos(a) * 8, y: cy + Math.sin(a) * 8, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, t: w.life, by: r.id }); }
    G.ev.push({ t: 'fire', x: cx, y: cy, k: r.wep.k });
  } else if (w.kind === 'trap') {
    G.traps.push({ x: cx, y: r.y + PH.H - 2, by: r.id, t: 25, arm: 0.7 });
    G.ev.push({ t: 'drop', x: cx, y: r.y + PH.H - 2 });
  } else if (w.kind === 'spray') {
    for (let i = 0; i < 2; i++) { const a = ang + (Math.random() - .5) * .35; G.shots.push({ k: r.wep.k, x: cx + Math.cos(a) * 8, y: cy + Math.sin(a) * 8, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, t: w.life, by: r.id }); }
    r.vx -= Math.cos(ang) * w.recoil; if (!r.ground) r.vy -= Math.sin(ang) * w.recoil * 0.4;
  }
  if (--r.wep.u <= 0) { r.wep = null; G.ev.push({ t: 'break', x: cx, y: cy }); }
}
function stepTraps(G, dt) {
  for (const t of G.traps) {
    t.t -= dt; t.arm -= dt;
    for (const o of G.racers) {
      if (t.t <= 0 || o.fin || o.inv > 0 || (o.id === t.by && t.arm > 0) || t.arm > 0 && o.id === t.by) continue;
      if (Math.abs(o.x + PH.W / 2 - t.x) < 10 && Math.abs(o.y + PH.H - t.y) < 8) {
        o.stun = Math.max(o.stun, WEAPONS.banana.stun); o.vx = ((o.vx >= 0 ? 1 : -1) * 280); o.vy = -230; o.ground = false; o.flash = .18; t.t = 0;
        G.ev.push({ t: 'hit', x: o.x + 5, y: o.y + 18 });
      }
    }
  }
  G.traps = G.traps.filter(t => t.t > 0);
}
function stepShots(G, dt) {
  for (const s of G.shots) {
    const w = WEAPONS[s.k]; s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
    if (w.kind === 'spray') s.vy += 120 * dt;
    let boom = false;
    if (isSolid(tileAt(G.W, Math.floor(s.x / TS), Math.floor(s.y / TS)))) { s.t = 0; boom = true; }
    for (const o of G.racers) if (o.id !== s.by && s.t > 0 && !o.fin && s.x > o.x - 2 && s.x < o.x + PH.W + 2 && s.y > o.y - 2 && s.y < o.y + PH.H + 2) {
      if (w.kind === 'rocket') { boom = true; s.t = 0; break; }
      hurt(G, o, null, w, s.vx, s.vy * .3, 1); s.t = 0;
    }
    if (boom && w.kind === 'rocket') {
      G.ev.push({ t: 'boom', x: s.x, y: s.y });
      for (const o of G.racers) { const dx = o.x + 5 - s.x, dy = o.y + 11 - s.y, d = Math.hypot(dx, dy); if (d < w.radius) hurt(G, o, null, w, dx || 1, dy, 1 - d / w.radius * 0.5); }
    }
  }
  G.shots = G.shots.filter(s => s.t > 0);
}
/* 한 걸음. inputs: id -> { d, jp, j, atk, aim, swap } */
function stepGame(G, dt, inputs) {
  G.clock += dt; evUpdate(G.W, G.clock, G.phase);
  if (G.phase === 'count') { G.t -= dt; if (G.t <= 0) { G.phase = 'race'; G.clock = 0; G.ev.push({ t: 'go' }); } }
  for (const r of G.racers) {
    const inp = r.bot ? botInput(G, r, dt) : (inputs[r.id] || { d: 0 });
    r.emoT = Math.max(0, r.emoT - dt); r.emoCd = Math.max(0, r.emoCd - dt); if (inp.emo && !r.bot && r.emoCd <= 0) { r.emo = inp.emo; r.emoT = 2; r.emoCd = 0.8; }
    r.cd = Math.max(0, r.cd - dt); r.inv = Math.max(0, r.inv - dt); r.swing = Math.max(0, r.swing - dt); r.flash = Math.max(0, r.flash - dt);
    if (r.fin || G.phase === 'end') { stepBody(G.W, r, { d: 0 }, dt); continue; }
    if (G.phase === 'count') { stepBody(G.W, r, { d: 0 }, dt); continue; }
    if (inp.d) r.face = inp.d;
    if (!r.bot && r.wep && inp.aim !== undefined) { r.aim = inp.aim; r.face = Math.cos(inp.aim) >= 0 ? 1 : -1; }      // 마우스로 직접 조준
    if (stepBody(G.W, r, inp, dt)) G.ev.push({ t: 'jump', x: r.x + 5, y: r.y + 22, id: r.id });
    r.anim += Math.abs(r.vx) * dt;
    if (r.y > G.W.ph + 40) respawn(G.W, r);
    const it = nearItem(G, r);
    if (it) {
      if (!r.wep) { r.wep = { k: it.k, u: WEAPONS[it.k].uses }; it.on = false; it.t = 14; G.ev.push({ t: 'pick', x: it.x, y: it.y }); }
      else if (inp.swap && !r.bot && r.wep.k !== it.k) { const old = r.wep.k; r.wep = { k: it.k, u: WEAPONS[it.k].uses }; it.k = old; G.ev.push({ t: 'pick', x: it.x, y: it.y }); }
    }
    if (inp.atk) { const a = r.bot ? botFight(G, r) : inp.aim; if (a !== null) useWeapon(G, r, a); }
    else if (r.bot) { const a = botFight(G, r); if (a !== null) useWeapon(G, r, a); }
    if (inFinish(G.W, r)) {
      r.fin = true; r.finT = G.clock; G.rank.push(r.id); G.ev.push({ t: 'fin', id: r.id });
      if (G.rank.length === 1) { G.phase = 'end'; G.endT = 0; }
    }
  }
  stepShots(G, dt); stepTraps(G, dt);
  for (const it of G.items) if (!it.on && it.t > 0 && (it.t -= dt) <= 0) { it.on = true; it.k = WEP_IDS[(Math.random() * WEP_IDS.length) | 0]; }
  for (const r of G.racers) r.prog = progressOf(G.W, r);
  if (G.phase === 'end') G.endT += dt;
}

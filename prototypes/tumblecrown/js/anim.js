// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 캐릭터 동작: Vowkeep의 동작(걷기·두리번·베기 연타·강타·기술·구르기)을 그대로 가져와 Tumblecrown 직업에 맞춰 쓴 것
import * as THREE from 'three';
import { ST } from './sim.js';
import { CLS } from './data.js';

const clampN = (v, a, b) => v < a ? a : v > b ? b : v;
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const seg = (u, a, b) => ease((u - a) / (b - a));
// 역할마다 공격·기술 동작. 몸 전체(허리 비틀기, 내딛기, 뛰어오르기)가 같이 움직여요
// 기사 베기 좌우 방향 (1이면 화면 오른쪽에서 시작)
const KS = 1, KR = 1, KH_T = 0.5;
// 기사 베기 자세. 1타: 오른쪽 위에서 감았다가 왼쪽 아래로 / 2타: 1타가 끝난 왼쪽 아래에서 조금 더 감았다가 오른쪽 아래로 낮게
// 1타 끝 자세 = 2타 시작 자세라서 두 번이 한 번에 이어지는 것처럼 보여요
// 2타는 몸을 펴고 일어서며 베어요 (납작하게 짜부라지지 않게 sq·by를 작게)
const K1E = { rx: -0.5, rz: 1.1, ry: 1.8, bry: 0.7, bx: 0.4, bz: 0.45, by: -0.2, lg: 0.7, sq: 0.1, lx: -0.4 };
const K2W = { rx: -1.0, rz: 1.5, ry: 1.6, bry: 1.0, bx: 0.25, bz: 0.15, by: -0.15, lg: 0.75, sq: 0.04, lx: -0.2 };
const K2E = { rx: -1.35, rz: -1.4, ry: 1.5, bry: -0.8, bx: 0.3, bz: 0.4, by: -0.08, lg: 0.9, sq: -0.06, lx: -0.5 };
function kPose(c, v, base) {
  const P = {};
  if (c === 0) {
    const w = seg(v, 0, 0.24), st = seg(v, 0.24, 0.54);
    P.rx = -2.3 * w * (1 - st) + K1E.rx * st; P.rz = KS * (-1.9 * w * (1 - st) + K1E.rz * st); P.ry = KR * (0.9 * w * (1 - st) + K1E.ry * st);
    P.bry = KS * (-0.9 * w * (1 - st) + K1E.bry * st); P.bx = -0.15 * w * (1 - st) + K1E.bx * st;
    for (const q of ['bz', 'by', 'lg', 'sq', 'lx']) P[q] = K1E[q] * st;
    P.rx = P.rx * Math.max(w, st) + base[0] * (1 - Math.max(w, st));
  } else {
    const w = seg(v, 0, 0.16), st = seg(v, 0.16, 0.5);
    for (const q in K1E) P[q] = (K1E[q] + (K2W[q] - K1E[q]) * w) * (1 - st) + K2E[q] * st;
    P.rz *= KS; P.bry *= KS; P.ry *= KR;
  }
  P.lx += base[1];
  return P;
}
// 궁수·사제·종자 연속 공격 자세. [1타 감기, 1타 끝, 2타 감기, 2타 끝]. 1타 끝 자세에서 2타가 바로 이어져요 (lxo = 왼팔 기본에서 벗어난 만큼)
const CHAIN = {
  archer: [
    // 활 든 팔은 과녁을 향해 그대로 두고, 시위만 뺨까지 당겼다가 놓아요. 놓으면 오른손이 뒤로 튕기고 몸이 살짝 밀려요
    { pull: 0.8, rpz: -0.7, rz: -0.3, bry: 0.18, bx: -0.05, lg: 0.35 },
    { pull: 0, rpz: -0.95, rx: -1.35, rz: -0.7, bry: 0.1, bx: -0.12, sq: 0.06, lg: 0.4, hx: -0.04 },
    { pull: 0.8, rpz: -0.7, rz: -0.3, bry: 0.2, bx: -0.05, lg: 0.4 },
    { pull: 0, rpz: -1.0, rx: -1.3, rz: -0.75, bry: 0.12, bx: -0.14, sq: 0.07, lg: 0.45, hx: -0.05 }
  ],
  priest: [
    { rx: -2.6, rz: -0.6, bry: -0.5, bx: -0.15, lxo: -0.6, sq: -0.1, hx: -0.15 },
    { rx: -1.35, rz: 0.7, bry: 0.6, bx: 0.35, bz: 0.4, by: -0.15, lxo: -1.1, lz: 0.4, lg: 0.8, sq: 0.15, hx: 0.1 },
    { rx: -2.9, rz: 0.9, bry: 0.8, bx: 0.0, lxo: -0.6, lz: 0.2, lg: 0.5, sq: -0.05 },
    { rx: -1.2, rz: -1.0, bry: -0.7, bx: 0.4, bz: 0.35, by: -0.3, lxo: -0.3, lz: -0.3, lg: 1.1, sq: 0.25, hx: 0.12 }
  ],
  squire: [
    { rx: -2.2, rz: -1.2, ry: -0.5, bry: -0.7, bx: -0.1, sq: 0.1, lg: 0.3 },
    { rx: -1.4, rz: 1.6, ry: 0.4, bry: 0.9, bx: 0.3, bz: 0.4, by: -0.2, lg: 0.9, sq: 0.2, lxo: -0.3 },
    { rx: -1.6, rz: 1.9, ry: 0.5, bry: 1.1, bx: 0.25, bz: 0.2, by: -0.15, lg: 0.8, sq: 0.2, lxo: -0.2 },
    { rx: -2.4, rz: -1.3, ry: -0.6, bry: -0.9, bx: 0.2, bz: 0.35, by: -0.1, lg: 1.0, sq: -0.1, lxo: -0.4, hx: -0.1 }
  ]
};
const CKEYS = ['rx', 'rz', 'ry', 'lxo', 'lz', 'bx', 'bz', 'by', 'bry', 'lg', 'sq', 'hx', 'rpz', 'pull'];
function cRest(role, base) { return role === 'archer' ? { rx: -1.5, rz: -0.25, lz: 0.12, rpz: -0.3, pull: 0.35 } : { rx: base[0] }; }
function cPose(role, c, v, base) {
  const R0 = cRest(role, base), [W1, E1, W2, E2] = CHAIN[role].map(o => Object.assign({}, R0, o)), g = (o, q) => o[q] != null ? o[q] : (R0[q] != null ? R0[q] : 0), P = {};
  if (c === 0) { const w = seg(v, 0, 0.24), st = seg(v, 0.24, 0.54); for (const q of CKEYS) { const a = g(R0, q); P[q] = (a + (g(W1, q) - a) * w) * (1 - st) + g(E1, q) * st; } }
  else { const w = seg(v, 0, 0.16), st = seg(v, 0.16, 0.5); for (const q of CKEYS) P[q] = (g(E1, q) + (g(W2, q) - g(E1, q)) * w) * (1 - st) + g(E2, q) * st; }
  P.lx = base[1] + P.lxo; delete P.lxo; if (role !== 'archer') { delete P.pull; delete P.rpz; }
  return P;
}
// 동작 중에 몸이 바닥 아래로 들어가면 그만큼 들어 올려요 (팔과 무기는 빼고 몸통·머리·다리만 봐요)
const FB = new THREE.Box3(), FB2 = new THREE.Box3();
function floorGuard(m, u) {
  m.updateMatrixWorld(true); FB.makeEmpty();
  for (const c of u.body.children) { if (c === u.armL || c === u.armR || !c.visible) continue; FB2.setFromObject(c); if (!FB2.isEmpty()) FB.union(FB2); }
  if (FB.isEmpty()) return; const d = m.position.y - FB.min.y - 0.02; if (d > 0) u.body.position.y += d;
}
function kApply(T, P, f) { if (f <= 0) return; for (const q in P) T[q] = T[q] * (1 - f) + P[q] * f; }

/* ---------- 직업 → Vowkeep 역할 ---------- */
const ROLE = { knight: 'knight', priest: 'priest', witch: 'priest', hunter: 'archer', viking: 'squire', mamluk: 'squire', skeleton: 'squire' };
const BASE = { knight: [-0.7, -0.6], archer: [-1.45, -1.55], priest: [-1.2, -0.4], squire: [-1.3, -0.6] };
// 기술 동작: 이름과 길이(초)
const SK = { dash: 0.5, heal: 0.8, mark: 0.8, pierce: 0.7, potion: 1.2, big: 0.6 };
const ACT = new Set([ST.swing, ST.cast, ST.spin, ST.lunge, ST.grab, ST.dash]);

// 한 캐릭터 한 프레임. E: 이 캐릭터가 기억하는 값, d: { cls, st, s(상태 시간), chg, run, air }
export function animate(E, m, d, dt, t) {
  const u = m.userData, cls = d.cls, role = ROLE[cls] || 'knight', base = BASE[role], W = CLS[cls] || CLS.knight;
  const mv = d.run > 0.15 && !d.air, st = d.st;
  if (E.ph == null) { E.ph = Math.random() * 6; E.pst = -1; E.ps = 0; E.aN = 0; E.lastC = 0; }
  // 동작 시작 알아채기 (상태가 바뀌었거나 같은 상태가 처음부터 다시 시작)
  const fresh = ACT.has(st) && (st !== E.pst || d.s < E.ps - 0.001 || (st === ST.swing && d.aN != null && d.aN !== E.paN));
  if (d.aN != null) E.paN = d.aN;
  if (fresh) {
    let ak = null, D = 0.5;
    if (st === ST.swing) {
      if (d.kind != null && cls !== 'hunter' && cls !== 'witch' && !(E.ak && E.aT < 0.5 && (E.ak === 'heal' || E.ak === 'mark')) && E.pst !== ST.grab) {
        ak = d.kind === 1 ? 'hv' : d.kind === 2 ? 'big' : 'atk'; D = ak === 'hv' ? 0.5 : ak === 'big' ? (cls === 'priest' ? 0.9 : SK.big) : Math.max(0.2, W.swing + 0.06);
        d.kc = d.cmb % 2;
      }
      else if (E.pst === ST.charge) { ak = E.lastC >= 0.45 ? 'hv' : 'atk'; D = ak === 'hv' ? 0.5 : Math.max(0.2, W.swing + 0.06); }
      else if (E.pst === ST.grab || (E.ak && E.aT < 0.5 && (E.ak === 'heal' || E.ak === 'mark'))) ak = null;   // 기술 끝의 휘두름은 같은 동작으로 이어가요
      else if (cls === 'hunter') { ak = 'pierce'; D = SK.pierce; }
      else { ak = 'atk'; D = Math.max(0.2, W.swing + 0.06); }
    } else if (st === ST.cast) { ak = cls === 'priest' ? 'heal' : 'mark'; D = SK[ak]; }
    else if (st === ST.spin) { ak = 'big'; D = SK.big; }
    else if (st === ST.lunge) { ak = 'dash'; D = SK.dash; }
    else if (st === ST.grab) { ak = 'potion'; D = SK.potion; }
    else if (st === ST.dash) { E.roT = 0.35; E.rollQ = 0; }
    if (ak) { if (E.ak || E.kh) E.blT = 0.1; E.ak = ak; E.aT = 0; E.D = D; E.aN++; E.kc = d.kc != null ? d.kc : E.aN % 2; E.kh = null; }
    E.lastC = 0;
  }
  if (st === ST.charge) E.lastC = d.chg;
  E.pst = st; E.ps = d.s;
  // 걷기 세기
  E.ph += dt * (mv ? 11 : 0); E.sw = (E.sw || 0) + ((mv ? Math.sin(E.ph) * 0.95 : 0) - (E.sw || 0)) * Math.min(1, dt * 14); const sw = E.sw;
  E.wk = (E.wk || 0) + ((mv ? 1 : 0) - (E.wk || 0)) * Math.min(1, dt * 10); const wk = E.wk, sn = Math.sin(E.ph);
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  const kind = E.ak || '', D = E.D || 0.5;
  if (E.ak) { E.aT += dt; if (E.aT > D) { if ((role === 'knight' || CHAIN[role]) && E.ak === 'atk') E.kh = { c: E.kc, t: 0 }; E.ak = null; } }
  if (E.kh && (E.kh.t += dt) > KH_T) E.kh = null;
  if (E.blT > 0) E.blT -= dt;
  const v = E.ak ? E.aT / D : 1;
  const T = { rx: base[0] - sw * 0.7, rz: 0, ry: 0, lx: base[1] + sw * 0.7, lz: 0, bx: 0.18 * wk, by: 0, bz: 0, bry: -sn * 0.22 * wk, brz: sn * 0.09 * wk, hx: 0, hy: sn * 0.15 * wk, hz: 0, rpz: 0, jy: 0, sq: 0, lg: 0, spin: 0 };
  // 가만히 있으면 숨 쉬고 가끔 두리번거려요
  const busy = E.ak || E.kh || st === ST.charge || st === ST.stun || st === ST.held;
  if (!mv && !busy) {
    E.idle = (E.idle || 0) + dt;
    if (E.idle > 0.8 && (E.lkT = (E.lkT || 0) - dt) <= 0) { const r = Math.random(); E.lkT = 1.2 + Math.random() * 1.8; E.lk = r < 0.25 ? 0 : (r < 0.62 ? -1 : 1) * (0.8 + Math.random() * 0.5); E.lkU = Math.random() < 0.3 ? -0.25 : Math.random() * 0.15; }
    const lk = E.idle > 0.8 ? (E.lk || 0) : 0; E.lkS = (E.lkS || 0) + (lk - (E.lkS || 0)) * Math.min(1, dt * 5);
    T.hy = E.lkS; T.bry = E.lkS * 0.45; T.hz = -E.lkS * 0.12; T.hx = E.idle > 0.8 ? (E.lkU || 0) : 0; T.sq = Math.sin(t * 2.2 + E.ph) * 0.025; T.lz = -Math.abs(E.lkS) * 0.1; T.rz = Math.abs(E.lkS) * 0.08;
  } else E.idle = 0;
  if (role === 'archer') { T.rx = -1.5; T.rz = -0.25; T.lx = -1.55; T.lz = 0.12; T.rpz = -0.3; }
  if (u.bow) u.bow.visible = false;
  const hop = (a, b, h) => { const q = (v - a) / (b - a); return q > 0 && q < 1 ? Math.sin(q * Math.PI) * h : 0; };
  const land = (a, n) => { const q = (v - a) / 0.25; return q >= 0 && q < 1 ? (1 - q) * (1 - q) * n : 0; };
  // 모으는 중: 궁수는 시위를 당기고, 사제·마녀는 지팡이에 빛을 모으고, 나머지는 웅크리며 무기를 뒤로 젖혀요
  if (st === ST.charge && !E.ak) {
    const c = d.chg, a = Math.min(1, c * 2.5), shake = c >= 1 ? Math.sin(t * 40) * 0.04 : 0;
    if (role === 'archer') { T.rpz = -0.3 - 0.5 * a; T.bx = -0.12 * a - 0.1 * c; T.bry = 0.35 * a; T.sq = 0.12 * c; T.lg = 0.6 * c; T.lx = -1.55 - 0.15 * a; if (u.bow) u.bow.visible = true; }
    else if (role === 'priest') { T.rx = -3.1 * a + base[0] * (1 - a) + shake; T.lx = -2.9 * a + base[1] * (1 - a) - shake; T.lz = 0.4 * a; T.rz = -0.3 * a; T.bx = -0.35 * a; T.hx = -0.45 * a; T.by = -0.25 * a; T.sq = 0.35 * a; T.lg = 0.7 * a; }
    else { T.rx = -2.6 * a + base[0] * (1 - a) + shake; T.lx = (role === 'knight' ? -0.6 : -1.2) * a + base[1] * (1 - a); T.rz = 0.35 * a; T.bx = -0.55 * a; T.hx = -0.25 * a; T.by = -0.3 * a; T.sq = 0.4 * a + (c >= 1 ? Math.sin(t * 40) * 0.03 : 0); T.lg = 0.8 * a; T.bry = 0.4 * a; }
  }
  if (E.ak) {
    const a = E.ak;
    if (a === 'big' && role === 'priest') { // 사제 세 번째: 지팡이를 머리 위로 들고 웅크려 빛을 모았다가 앞으로 내질러요
      const ch = seg(v, 0, 0.2), fi = seg(v, 0.48, 0.56), rc2 = seg(v, 0.72, 1), x2 = 1 - rc2, sh = v < 0.5 ? Math.sin(t * 60) * 0.05 * seg(v, 0.15, 0.5) : 0, hc = ch * (1 - fi);
      T.rx = (-3.1 * hc + (-1.5) * fi) * x2 + base[0] * rc2 + sh; T.lx = (-2.9 * hc - 1.4 * fi) * x2 + base[1] * rc2 - sh; T.lz = 0.4 * hc * x2; T.rz = -0.3 * hc * x2;
      T.bx = (-0.35 * hc + 0.75 * fi) * x2; T.hx = (-0.45 * hc + 0.15 * fi) * x2; T.bz = (-0.2 * hc + 0.7 * fi) * x2; T.by = -0.25 * hc * x2;
      T.sq = (0.35 * hc + land(0.48, 0.4)); T.lg = (0.7 * hc + 1.0 * fi) * x2; T.jy = hop(0.2, 0.46, 0.35);
    } else if (a === 'big') { // 바이킹 회오리: 웅크렸다가 뛰어오르며 한 바퀴
      const cr = seg(v, 0, 0.18), go = seg(v, 0.18, 0.5), rc = seg(v, 0.7, 1), x = 1 - rc, pc = cr * (1 - go);
      T.spin = -Math.PI * 2 * go; T.rx = -1.5 * x + base[0] * rc; T.rz = (1.2 * pc - 1.6 * go) * x; T.bx = 0.45 * pc - 0.2 * go * x; T.jy = hop(0.16, 0.55, 0.8); T.sq = 0.5 * pc - 0.3 * go * x * (1 - seg(v, 0.45, 0.55)) + land(0.55, 0.6); T.lg = 0.9 * pc + 0.7 * go * x; T.lx = -1.2 * go * x + base[1];
    } else if (a === 'atk' || a === 'hv') {
      if (a === 'hv') { // 강타: 웅크려 무기를 등 뒤까지 젖히고 몸을 던지듯 내려찍어요
        const L1 = 0.379, cr = seg(v, 0, 0.08), up = seg(v, 0.06, 0.18), dn = seg(v, 0.26, L1), rc = seg(v, 0.68, 1), x = 1 - rc, two = role !== 'knight' && role !== 'squire';
        T.rx = (-1.2 * cr - 2.6 * up + 2.9 * dn) * x + base[0] * rc; T.lx = (-0.6 * cr - 2.6 * up + (two ? 2.9 : 2.6) * dn) * x + base[1] * rc;
        T.rz = (0.35 * cr - 0.35 * dn) * x; T.lz = two ? 0.3 * x : -0.5 * up * (1 - dn) * x;
        T.bx = (0.35 * cr - 0.85 * up + 1.45 * dn) * x; T.hx = (-0.25 * up + 0.45 * dn) * x;
        T.jy = hop(0.07, L1, 2.6); T.bz = 0.3 * dn * x; T.bry = 0.5 * cr * (1 - dn) * x;
        T.sq = 0.5 * cr * (1 - up) - 0.4 * up * (1 - dn) + land(L1, 0.75); T.by = (-0.35 * cr * (1 - up) - 0.45 * dn) * x; T.lg = (0.6 * cr * (1 - up) + 0.9 * dn) * x;
        if (role === 'archer') { T.rpz = -0.4 * up * (1 - dn); }
      } else if (role === 'knight') kApply(T, kPose(E.kc, v, base), 1);
      else kApply(T, cPose(role, E.kc, v, base), 1);
    } else {
      const pre = seg(v, 0, 0.2), go = seg(v, 0.2, 0.34), hold = 1 - seg(v, 0.72, 1), pk = go * hold, cr = pre * (1 - go);
      switch (a) {
        case 'dash': T.rx = (0.6 * cr - 1.5 * go) * hold + base[0] * (1 - hold); T.bx = -0.15 * cr + 0.5 * pk; T.bz = 0.45 * pk; T.lx = 0.35 * pk + base[1] * (1 - pk); T.sq = 0.1 * cr - 0.1 * pk; T.jy = hop(0.2, 0.6, 0.15); T.lg = 0.6 * pk; T.bry = 0.25 * cr; break;
        case 'pierce': { const rl = seg(v, 0.42, 0.5); T.rpz = -0.3 - 0.8 * seg(v, 0, 0.4) * (1 - rl); T.bx = (-0.3 * seg(v, 0, 0.4) - 0.5 * rl) * hold; T.bry = 0.5 * seg(v, 0, 0.4) * (1 - rl); T.lx = -1.55 - 0.7 * rl * hold; T.bz = -0.8 * rl * hold; T.jy = hop(0.42, 0.75, 0.3); T.sq = 0.25 * seg(v, 0, 0.4) * (1 - rl) + land(0.75, 0.3); T.lg = 0.7 * pk; if (u.bow && v < 0.44) u.bow.visible = true; break; }
        case 'mark': T.lx = -1.75; T.lz = 0.5 * pk; T.rx = -0.4 * pk + base[0] * (1 - pk); T.rz = 0.9 * pk; T.bry = 0.5 * cr - 0.9 * pk; T.bx = 0.45 * pk; T.bz = 0.6 * pk; T.hx = 0.2 * pk; T.sq = 0.2 * cr - 0.15 * pk; T.lg = 0.9 * pk; break;
        case 'heal': T.rx = -3.0 * pk + base[0] * (1 - pk); T.rz = 0.45 * pk; T.lx = -2.8 * pk; T.lz = -1.1 * pk; T.hx = -0.7 * pk; T.bx = 0.35 * cr - 0.25 * pk; T.jy = hop(0.2, 0.95, 0.8); T.sq = 0.35 * cr - 0.2 * pk; T.by = -0.3 * cr; break;
        case 'potion': { const th = seg(v, 0.18, 0.36); T.rx = -3.3 * (1 - th) * hold - 0.6 * th * hold + base[0] * (1 - hold); T.rz = 0.6 * (1 - th) * hold; T.bx = (-0.55 * (1 - th) + 0.8 * th) * hold; T.bry = (0.8 - 1.6 * th) * hold; T.bz = 0.6 * th * hold; T.lx = -1.2 * th * hold; T.lg = 1.0 * pk; T.sq = -0.15 * (1 - th) * pre; break; }
        default: T.rx = -2.8 * hold;
      }
    }
  }
  // 베기 끝 자세 들고 있기: 연타가 끊길 즈음 기본 자세로
  if (!E.ak && E.kh) kApply(T, role === 'knight' ? kPose(E.kh.c, 1, base) : cPose(role, E.kh.c, 1, base), 1 - seg(E.kh.t, 0.18, KH_T));
  if ((E.ak && E.ak !== 'hv') || E.kh) { // 모든 동작을 크게: 기본 자세에서 벗어난 만큼을 키워요
    const ex = role !== 'knight' && !(E.ak === 'atk' || (!E.ak && E.kh)), big = E.ak === 'big', X = big ? 1.3 : ex ? 1.85 : 1.4, A = big ? 1.15 : ex ? 1.5 : 1.25;
    for (const k of ['rz', 'lz', 'bx', 'by', 'bz', 'bry', 'hx']) T[k] *= X;
    T.rx = base[0] + (T.rx - base[0]) * A; T.lx = base[1] + (T.lx - base[1]) * A; T.jy *= big ? 1.0 : ex ? 1.6 : 1.3; T.sq = clampN(T.sq * (ex ? 1.8 : 1.5), -0.55, 0.75); T.lg *= ex ? 1.6 : 1.3;
  }
  const k = Math.min(1, dt * (E.blT > 0 ? 14 : 30)), L = (kk, v2) => { E[kk] = E[kk] == null ? v2 : E[kk] + (v2 - E[kk]) * k; return E[kk]; };
  u.armR.rotation.order = 'XZY'; u.armR.rotation.set(L('ar', T.rx), L('ary', T.ry), L('arz', T.rz)); u.armL.rotation.set(L('al', T.lx), 0, L('alz', T.lz));
  u.armR.position.z = L('rpz', T.rpz); u.head.rotation.set(L('hx', T.hx), L('hy', T.hy), L('hz', T.hz));
  const bob = Math.abs(sn) * 0.16 * wk;
  u.body.rotation.set(L('bx', T.bx), L('bry', T.bry) + T.spin, L('brz', T.brz)); u.body.position.set(0, bob + L('by', T.by), L('bz', T.bz));
  const jy = L('jy', T.jy), sq = L('sq', T.sq); u.body.scale.set(1 + sq * 0.5, 1 - sq * 0.6, 1 + sq * 0.5);
  if (cls === 'viking') u.body.scale.x *= 1.12;
  const lg = L('lg', T.lg); if (E.ak || st === ST.charge) { u.legL.rotation.x = sw - lg * 0.6; u.legR.rotation.x = -sw + lg * 0.6; }
  if (u.orb) u.orb.scale.setScalar(st === ST.charge ? 1 + d.chg * 0.8 : 1);
  // 구르기 (대시): 몸을 공처럼 웅크려 앞으로 한 바퀴
  if (E.roT > 0) {
    E.roT -= dt; const q = E.rollQ = Math.min(1, (E.rollQ || 0) + dt / 0.35), tk = Math.min(1, q / 0.18, (1 - q) / 0.18 + 0.25), a = Math.PI * 2 * ease(q), c = 0.95;
    u.body.rotation.set(a, 0, 0); u.body.position.set(0, c - c * Math.cos(a) - 0.2 * tk, -c * Math.sin(a));
    u.legL.rotation.x = u.legR.rotation.x = -1.9 * tk; u.armL.rotation.x = u.armR.rotation.x = -1.4 * tk; u.armL.rotation.z = 0.35 * tk; u.armR.rotation.z = -0.35 * tk; u.head.rotation.x = 0.5 * tk;
    u.body.scale.set(1, 1 - 0.22 * tk, 1);
  }
  // 맞아서 날아갈 때: 팔다리를 휘저으며 빙글 돌아요
  if (st === ST.stun || st === ST.held) {
    const tw = (st === ST.held ? t : d.s) * 16;
    u.body.rotation.set(Math.sin(tw) * 0.5 - 0.3, 0, Math.cos(tw) * 0.5); u.body.position.set(0, 0, 0); u.body.scale.set(cls === 'viking' ? 1.12 : 1, 1, 1);
    u.armL.rotation.set(0, 0, 2.4 + Math.sin(tw) * 0.4); u.armR.rotation.set(0, 0, -2.4 - Math.sin(tw) * 0.4); u.legL.rotation.x = Math.sin(tw) * 0.9; u.legR.rotation.x = -Math.sin(tw) * 0.9;
    if (d.air && st === ST.stun) u.body.rotation.x = -d.s * 8;
  } else m.position.y = d.y + jy;
  if (st !== ST.stun && st !== ST.held) floorGuard(m, u);
}

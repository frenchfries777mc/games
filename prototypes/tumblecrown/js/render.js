// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 그리기: Vowkeep과 같은 그림 방식 (로우폴리 입체 → RenderPixelatedPass 픽셀, 캐릭터는 명암 3단계, 밤하늘과 횃불)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { CELL, NX, NZ } from './data.js';
import { TILES, NT, PILLARS, ST } from './sim.js';
import { animate } from './anim.js';

let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const MC = new Map();
let TOON = 0;
const TGRAD = new THREE.DataTexture(new Uint8Array([115, 115, 115, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1);
TGRAD.minFilter = TGRAD.magFilter = THREE.NearestFilter; TGRAD.needsUpdate = true;
const toonify = f => (...a) => { TOON++; try { return f(...a); } finally { TOON--; } };
// 캐릭터는 명암 3단계 재질, 바닥과 벽은 거친 일반 재질 (Vowkeep과 같아요)
const M = (c, o = {}) => {
  const key = (TOON && !o.op ? 't' : '') + c + '|' + JSON.stringify(o); if (MC.has(key) && !o.uniq) return MC.get(key);
  let m;
  if (TOON && !o.op) { const col = new THREE.Color(c); if (o.m) col.multiplyScalar(1.12); m = new THREE.MeshToonMaterial({ color: col, gradientMap: TGRAD, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide }); }
  else m = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, flatShading: true, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: o.op ? false : true, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
  if (!o.uniq) MC.set(key, m); return m;
};
const GC = new Map();
const geo = (k, f) => { if (!GC.has(k)) GC.set(k, f()); return GC.get(k); };
function mesh(g, m, x, y, z, p, sh = true) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = sh; if (p) p.add(o); return o; }
const box = (w, h, d, m, x, y, z, p) => mesh(geo('b' + [w, h, d], () => new THREE.BoxGeometry(w, h, d)), m, x, y, z, p);
const cyl = (rt, rb, h, s, m, x, y, z, p) => mesh(geo('c' + [rt, rb, h, s], () => new THREE.CylinderGeometry(rt, rb, h, s)), m, x, y, z, p);
const sph = (r, ws, hs, m, x, y, z, p, ex) => mesh(geo('s' + [r, ws, hs, ex], () => ex ? new THREE.SphereGeometry(r, ws, hs, 0, 6.3, 0, ex) : new THREE.SphereGeometry(r, ws, hs)), m, x, y, z, p);
const cap = (r, l, m, x, y, z, p) => mesh(geo('k' + [r, l], () => new THREE.CapsuleGeometry(r, l, 3, 8)), m, x, y, z, p);
const cone = (r, h, s, m, x, y, z, p) => mesh(geo('n' + [r, h, s], () => new THREE.ConeGeometry(r, h, s)), m, x, y, z, p);
const dod = (r, m, x, y, z, p) => mesh(geo('d' + r, () => new THREE.DodecahedronGeometry(r)), m, x, y, z, p);
const metal = () => M(0xb8bfcc, { m: 0.75, r: 0.35 }), dmetal = () => M(0x5a5f70, { m: 0.7, r: 0.45 }), skin = () => M(0xe8b48a), gold = () => M(0xe6c15a, { m: 0.8, r: 0.3 }), leather = () => M(0x5a3a22), bone = () => M(0xd8d0bc);

// 던전 돌바닥 색 (Vowkeep 1장과 같은 팔레트)
const FLOOR = [0x4a4550, 0x524d58, 0x5a5462, 0x463f4c, 0x55505c], BFLOOR = [0x3e3440, 0x463a48, 0x4e4250, 0x3a3040, 0x4a3e4c], WALL = [0x3e3846, 0x463f50, 0x4e4658, 0x38323f];

/* ---------- 직업 모델 (Vowkeep 사람 모양을 그대로 따라 만들어요) ---------- */
const HERO = {
  // 기사와 사제는 Vowkeep 모델 그대로
  knight: { body: 0x3f6fd0, leg: 'dm', arm: 'mt', helm: 1, sword: 2, shield: 1, cape: 0x24479a, belt: 1, vk: 1 },
  priest: { body: 0xe8e4ef, robe: 1, leg: 0x9a96a8, arm: 0xe8e4ef, hood: 0xcfc8dc, staff: 0x9af0d0, vk: 1 },
  hunter: { body: 0x467a3e, leg: 0x3a3a44, arm: 0x467a3e, hood: 0x2f5a32, bow: 1, quiver: 1, belt: 1 },
  viking: { body: 0x7a5a3a, leg: 0x4a3a2a, arm: 0xe8b48a, helm: 1, helmC: 0x8a8f9c, plume: 0, horns: 1, beard: 0xd07a2a, axe: 1, fur: 1, belt: 1, wide: 1.12 },
  mamluk: { body: 0xb0302a, leg: 0xe8dcc0, arm: 0xb0302a, turban: 1, scim: 1, buckler: 1, belt: 1 },
  witch: { body: 0x4a2a6a, robe: 1, leg: 0x2a1a3a, arm: 0x4a2a6a, skinC: 0xb8d0a0, hat: 1, staff: 0xc06aff },
  skeleton: { skel: 1 }
};
function matOf(v) { return v === 'dm' ? dmetal() : v === 'mt' ? metal() : M(v); }
export const makeHero = toonify(function (cls, col) {
  const o = HERO[cls] || HERO.knight, g = o.skel ? makeSkel(col) : makeFigure(o, col);
  g.userData.cls = cls; g.scale.setScalar(0.82);
  // 발밑 고리: 플레이어 색
  const ring = mesh(geo('pring', () => new THREE.RingGeometry(0.95, 1.2, 20)), M(col, { op: 0.75, ds: true, uniq: true }), 0, 0.06, 0, g, false); ring.rotation.x = -Math.PI / 2; g.userData.ring = ring;
  const bub = sph(1.9, 12, 9, M(0xbfe8ff, { op: 0.18, uniq: true }), 0, 1.6, 0, g); bub.castShadow = bub.receiveShadow = false; bub.visible = false; g.userData.bub = bub;
  return g;
});
function makeFigure(o, col) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const lg = matOf(o.leg), am = matOf(o.arm);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.25, 0.9, 0); legR.position.set(0.25, 0.9, 0); body.add(legL, legR);
  cap(0.2, 0.6, lg, 0, -0.4, 0, legL); cap(0.2, 0.6, lg, 0, -0.4, 0, legR);
  box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legL); box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legR);
  cyl(0.5, o.robe ? 0.85 : 0.62, o.robe ? 1.9 : 1.3, 10, M(o.body), 0, o.robe ? 1.1 : 1.45, 0, body);
  sph(0.55, 10, 8, M(o.body), 0, 2.05, 0, body).scale.set(1, 0.7, 0.85);
  // 허리띠: Vowkeep 모델은 가죽, 나머지는 플레이어 색 (누가 누군지 알아보기 쉽게)
  if (o.vk) { if (o.belt) { const b = mesh(geo('belt', () => new THREE.TorusGeometry(0.58, 0.08, 5, 12)), leather(), 0, 1.2, 0, body); b.rotation.x = Math.PI / 2; } }
  else { const b = mesh(geo('cbelt' + !!o.robe, () => new THREE.TorusGeometry(o.robe ? 0.66 : 0.58, 0.09, 5, 12)), M(col), 0, 1.2, 0, body); b.rotation.x = Math.PI / 2; }
  if (o.fur) { const f = mesh(geo('fur', () => new THREE.TorusGeometry(0.62, 0.22, 5, 10)), M(0xcfc0a0), 0, 2.25, 0, body); f.rotation.x = Math.PI / 2; }
  const head = new THREE.Group(); head.position.y = 2.75; body.add(head);
  if (o.helm) {
    const hm = o.helmC ? M(o.helmC, { m: 0.7, r: 0.4 }) : metal(); cyl(0.42, 0.45, 0.8, 10, hm, 0, 0, 0, head); sph(0.42, 10, 6, hm, 0, 0.4, 0, head, 1.6);
    if (o.horns) { for (const sx of [-1, 1]) { const hn = cone(0.12, 0.8, 5, bone(), sx * 0.5, 0.45, 0, head); hn.rotation.z = -sx * 0.9; } sph(0.26, 8, 6, skin(), 0, -0.12, 0.3, head); box(0.08, 0.08, 0.05, M(0x1a1418), -0.13, -0.05, 0.53, head); box(0.08, 0.08, 0.05, M(0x1a1418), 0.13, -0.05, 0.53, head); }
    else { const vm = M(0x0a0a0e); box(0.56, 0.08, 0.1, vm, 0, 0.05, 0.42, head); box(0.5, 0.15, 0.1, vm, 0, 0.06, 0.41, head); for (const sx of [-1, 1]) { const w = box(0.3, 0.13, 0.1, vm, sx * 0.31, 0.06, 0.3, head); w.rotation.y = sx * 0.75; } box(0.09, 0.34, 0.1, vm, 0, -0.17, 0.41, head); }
    if (o.plume !== 0) { const pl = cone(0.12, 0.7, 5, M(o.vk ? 0x3f6fd0 : col), 0, 0.95, -0.1, head); pl.rotation.x = -0.5; }
    if (o.beard) { const bd = cone(0.4, 0.9, 6, M(o.beard), 0, -0.55, 0.28, head); bd.rotation.x = Math.PI + 0.25; for (const sx of [-1, 1]) { const br = cone(0.1, 0.5, 4, M(o.beard), sx * 0.2, -0.9, 0.38, head); br.rotation.x = Math.PI; } }
  } else {
    const ey = M(0x1a1418);
    sph(0.42, 10, 8, o.skinC ? M(o.skinC) : skin(), 0, 0, 0, head); box(0.08, 0.1, 0.05, ey, -0.15, 0.02, 0.4, head); box(0.08, 0.1, 0.05, ey, 0.15, 0.02, 0.4, head);
    if (o.hood) { sph(0.52, 10, 8, M(o.hood), 0, 0.05, -0.05, head, 1.9); const c = cone(0.3, 0.6, 6, M(o.hood), 0, 0.1, -0.5, head); c.rotation.x = -1.9; }
    if (o.turban) { sph(0.5, 10, 7, M(0xf0e8d8), 0, 0.28, -0.02, head).scale.set(1, 0.75, 1); mesh(geo('tb', () => new THREE.TorusGeometry(0.45, 0.1, 5, 12)), M(0xe8dcc0), 0, 0.12, 0, head).rotation.x = Math.PI / 2; sph(0.1, 6, 5, M(col), 0, 0.35, 0.44, head); const f = cone(0.06, 0.5, 4, M(col), 0, 0.75, 0.3, head); f.rotation.x = 0.3; box(0.42, 0.14, 0.08, M(0x2a1a14), 0, -0.24, 0.36, head); }
    if (o.hat) { cyl(0.85, 0.85, 0.06, 12, M(0x2a1a3a), 0, 0.3, 0, head); const h = cone(0.45, 1.3, 8, M(0x2a1a3a), 0, 0.95, -0.08, head); h.rotation.x = -0.28; cyl(0.47, 0.47, 0.12, 10, M(col), 0, 0.38, 0, head); const nz = cone(0.07, 0.3, 4, M(o.skinC), 0, -0.04, 0.5, head); nz.rotation.x = Math.PI / 2; }
  }
  if (o.cape) { const cp = mesh(geo('cape', () => new THREE.PlaneGeometry(1.2, 2, 1, 3)), M(o.cape, { ds: true }), 0, 1.6, -0.6, body); cp.rotation.x = 0.18; }
  const armR = new THREE.Group(); armR.position.set(0.72, 2.15, 0); body.add(armR); cap(0.17, 0.7, am, 0, -0.45, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.72, 2.15, 0); body.add(armL); cap(0.17, 0.7, am, 0, -0.45, 0, armL);
  if (o.wide) { body.scale.x = o.wide; }
  let orb = null, bow = null;
  if (o.sword === 2) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); const bk = M(0xf2f4f8, { m: 0.6, r: 0.3 }); box(0.42, 2.5, 0.22, bk, 0, 1.45, 0, sw); box(0.1, 2.2, 0.23, M(0xc8d0dc, { m: 0.8, r: 0.25 }), 0, 1.35, 0, sw); cone(0.26, 0.34, 4, bk, 0, 2.86, 0, sw).rotation.y = Math.PI / 4; box(0.85, 0.16, 0.2, M(0xe2e6ee, { m: 0.7, r: 0.35 }), 0, 0.15, 0, sw); box(0.11, 0.55, 0.11, leather(), 0, -0.2, 0, sw); box(0.18, 0.14, 0.18, M(0xe2e6ee, { m: 0.7, r: 0.35 }), 0, -0.52, 0, sw); sw.rotation.x = Math.PI / 2; }
  else if (o.sword) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); box(0.14, 2, 0.05, M(0xe9edf5, { m: 0.9, r: 0.2 }), 0, 1.1, 0, sw); box(0.6, 0.1, 0.14, gold(), 0, 0.1, 0, sw); box(0.08, 0.35, 0.08, leather(), 0, -0.1, 0, sw); sw.rotation.x = Math.PI / 2; }
  if (o.shield) { const sh = new THREE.Group(); sh.position.set(-0.15, -0.7, 0.45); armL.add(sh); sh.rotation.x = 0.6; box(1.1, 1.4, 0.14, M(0x2c4f9e), 0, 0, 0, sh); const c = cone(0.78, 0.7, 4, M(0x2c4f9e), 0, -0.95, 0, sh); c.rotation.set(Math.PI, Math.PI / 4, 0); box(0.18, 1.2, 0.05, gold(), 0, -0.1, 0.09, sh); box(0.8, 0.18, 0.05, gold(), 0, 0.25, 0.09, sh); }
  if (o.staff) { const st = new THREE.Group(); st.position.set(0, -0.9, 0.1); armR.add(st); st.rotation.x = 0.7; cyl(0.07, 0.07, 3.2, 6, M(0x7a5a2a), 0, 0.5, 0, st); orb = mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(o.staff, { e: o.staff, ei: 4 }), 0, 2.3, 0, st); if (o.vk) { const L = new THREE.PointLight(0x6af0c0, 14, 8, 1.6); L.position.set(0, 2.4, 0); st.add(L); } }
  if (o.bow) {
    const bw = mesh(geo('bow', () => new THREE.TorusGeometry(1.2, 0.06, 4, 12, Math.PI * 0.8)), M(0x8a5a2a), 0, -0.95, 0.25, armL); bw.rotation.set(0, Math.PI / 2, Math.PI / 2 + Math.PI * 0.1);
    const ar = new THREE.Group(); ar.position.set(0, -0.95, 0.25); armL.add(ar); box(0.05, 1.3, 0.05, M(0x8a5a2a), 0, 0, -0.1, ar); const ah = cone(0.08, 0.25, 4, metal(), 0, 0.75, -0.1, ar); ah.visible = true; ar.rotation.x = Math.PI / 2; ar.visible = false; bow = ar;
  }
  if (o.quiver) { const q = cyl(0.2, 0.2, 1.1, 6, leather(), 0.3, 2.1, -0.55, body); q.rotation.x = 0.3; for (let i = 0; i < 3; i++) box(0.04, 0.4, 0.04, M(0xe8e0c8), 0.25 + i * 0.06, 2.75, -0.7, body); }
  if (o.axe) { const ax = new THREE.Group(); ax.position.set(0, -0.9, 0.15); armR.add(ax); ax.rotation.x = Math.PI / 2; cyl(0.08, 0.08, 2.4, 6, M(0x5a3a22), 0, 0.9, 0, ax); const hd = new THREE.Group(); hd.position.set(0.32, 1.9, 0); ax.add(hd); box(0.62, 0.9, 0.12, M(0xb8bfcc, { m: 0.8, r: 0.3 }), 0, 0, 0, hd); cyl(0.45, 0.45, 0.13, 10, M(0xd8dde8, { m: 0.8, r: 0.3 }), 0.28, 0, 0, hd).rotation.x = Math.PI / 2; }
  if (o.scim) { const sc = new THREE.Group(); sc.position.set(0, -0.9, 0.1); armR.add(sc); sc.rotation.x = Math.PI / 2; box(0.1, 0.4, 0.1, gold(), 0, 0, 0, sc); box(0.5, 0.08, 0.14, gold(), 0, 0.22, 0, sc); const bl = mesh(geo('scim', () => new THREE.TorusGeometry(1.4, 0.07, 3, 10, 1.2)), M(0xe9edf5, { m: 0.9, r: 0.2 }), -1.4, 0.25, 0, sc); bl.scale.set(1, 1, 1.8); }
  if (o.buckler) { const bk = cyl(0.5, 0.5, 0.12, 10, M(0xc8a040, { m: 0.7, r: 0.35 }), -0.1, -0.75, 0.3, armL); bk.rotation.x = Math.PI / 2 - 0.4; sph(0.12, 6, 5, gold(), -0.1, -0.75, 0.38, armL); }
  if (o.robe && o.hat) for (let i = 0; i < 3; i++) box(0.12, 0.12, 0.05, M(0xc06aff, { e: 0x8a3ad0, ei: 1.5 }), -0.3 + i * 0.3, 0.6 + (i % 2) * 0.2, 0.75, body);
  g.userData = { body, legL, legR, armL, armR, head, orb, bow };
  return g;
}
function makeSkel(col) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const bm = bone();
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.25, 1.15, 0); legR.position.set(0.25, 1.15, 0); body.add(legL, legR);
  cyl(0.09, 0.09, 1.1, 5, bm, 0, -0.55, 0, legL); cyl(0.09, 0.09, 1.1, 5, bm, 0, -0.55, 0, legR);
  box(0.3, 0.14, 0.45, bm, 0, -1.1, 0.08, legL); box(0.3, 0.14, 0.45, bm, 0, -1.1, 0.08, legR);
  const pel = mesh(geo('pel', () => new THREE.TorusGeometry(0.3, 0.08, 4, 8)), bm, 0, 1.2, 0, body); pel.rotation.x = Math.PI / 2;
  cyl(0.08, 0.08, 1, 5, bm, 0, 1.7, 0, body);
  for (let i = 0; i < 4; i++) { const rb = mesh(geo('rib' + i, () => new THREE.TorusGeometry(0.38 - i * 0.04, 0.05, 4, 10, Math.PI * 1.4)), bm, 0, 1.55 + i * 0.22, 0.05, body); rb.rotation.set(Math.PI / 2, 0, Math.PI * 0.8); }
  // 허리에 플레이어 색 천
  { const b = mesh(geo('sbelt', () => new THREE.TorusGeometry(0.36, 0.08, 5, 10)), M(col), 0, 1.28, 0, body); b.rotation.x = Math.PI / 2; box(0.3, 0.5, 0.05, M(col), 0.1, 1.0, 0.33, body); }
  const head = new THREE.Group(); head.position.set(0, 2.6, 0.05); body.add(head);
  sph(0.42, 8, 7, bm, 0, 0, 0, head); box(0.35, 0.2, 0.3, bm, 0, -0.3, 0.15, head);
  const eyeM = M(0x6af0ff, { e: 0x30c0ff, ei: 5 }); sph(0.09, 5, 4, eyeM, -0.15, 0.02, 0.33, head); sph(0.09, 5, 4, eyeM, 0.15, 0.02, 0.33, head);
  const armR = new THREE.Group(); armR.position.set(0.5, 2.1, 0); body.add(armR); cyl(0.07, 0.07, 1.1, 5, bm, 0, -0.5, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.5, 2.1, 0); body.add(armL); cyl(0.07, 0.07, 1.1, 5, bm, 0, -0.5, 0, armL);
  // 뼈 몽둥이
  const cl = new THREE.Group(); cl.position.set(0, -1.05, 0.05); armR.add(cl); cl.rotation.x = Math.PI / 2; cyl(0.1, 0.13, 1.5, 6, bm, 0, 0.7, 0, cl); sph(0.24, 6, 5, bm, 0.1, 1.5, 0, cl); sph(0.24, 6, 5, bm, -0.1, 1.5, 0, cl);
  g.userData = { body, legL, legR, armL, armR, head, skel: true };
  return g;
}

function makeCrown() {
  const g = new THREE.Group(), gm = M(0xf2c14a, { e: 0x8a5a10, ei: 0.6 });
  mesh(geo('crownR', () => new THREE.CylinderGeometry(0.46, 0.4, 0.34, 10, 1, true)), M(0xf2c14a, { e: 0x8a5a10, ei: 0.6, ds: true }), 0, 0, 0, g);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; cone(0.12, 0.42, 4, gm, Math.sin(a) * 0.43, 0.36, Math.cos(a) * 0.43, g); sph(0.07, 6, 5, M(i % 2 ? 0x3a8ae8 : 0xe83a4a, { e: i % 2 ? 0x1a4aa0 : 0xa01a2a, ei: 1 }), Math.sin(a) * 0.45, 0.05, Math.cos(a) * 0.45, g); }
  return g;
}

/* ---------- 장면 ---------- */
export class View {
  constructor(canvas) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = THREE.PCFShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.0;
    this.ps = 3; this.bloomOn = true; this.vs = 11; this.vsT = 11; this.mode = 'arena';
    this.cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 300); this.camP = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 100);
    this.ents = new Map(); this.fx = []; this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); this.pjM = [];
    this.build(); this.resize();
  }
  resize() {
    // 픽셀 칸이 고르게 나오도록 캔버스를 픽셀 크기의 배수로 맞춰요 (지글거림 방지)
    const dpr = devicePixelRatio || 1, P = Math.max(1, Math.round(this.ps * dpr)); this.P = P;
    const w = Math.ceil(innerWidth * dpr / P) * P, h = Math.ceil(innerHeight * dpr / P) * P; this.W = w; this.H = h;
    this.r.setPixelRatio(1); this.r.setSize(w, h, false);
    this.cssW = w / dpr; this.cssH = h / dpr; this.r.domElement.style.width = this.cssW + 'px'; this.r.domElement.style.height = this.cssH + 'px';
    this.fit(true); this.fitP();
    if (this.comp) { this.comp.setSize(w, h); this.pp.setPixelSize(P); }
  }
  // 섬 전체가 화면에 들어오게 크기를 맞춰요 (카메라는 움직이지 않아요)
  fit(now) {
    const asp = this.W / this.H, g = this.ring ?? 6, hw = (Math.min(g, NX) + 0.5) * CELL, hz = (Math.min(g, NZ) + 0.5) * CELL;
    this.vsT = Math.max((hw + 5) / asp, hz * 0.74 + 5, 7);
    if (now) this.vs = this.vsT; this.applyVs();
  }
  applyVs() { const asp = this.W / this.H, v = this.vs; this.cam.left = -v * asp; this.cam.right = v * asp; this.cam.top = v + 1; this.cam.bottom = -v + 1; this.cam.updateProjectionMatrix(); }
  // 직업 고르기 화면: 받침돌 위 캐릭터를 크게 (휴대폰 세로면 조금 위로)
  fitP() { const asp = this.W / this.H, v = asp < 1 ? 2.6 / Math.max(0.45, asp) : 3.9; this.camP.left = -v * asp; this.camP.right = v * asp; this.camP.top = v; this.camP.bottom = -v; this.camP.updateProjectionMatrix(); }
  setPixel(ps) { this.ps = ps; this.resize(); }
  setBloom(on) { this.bloomOn = on; if (this.bloom) this.bloom.enabled = on; }

  build() {
    const s = this.scene = new THREE.Scene(); s.background = new THREE.Color(0x07060c); this.flick = [];
    s.add(new THREE.AmbientLight(0x4a4a78, 1.7)); s.add(new THREE.HemisphereLight(0x8a90c8, 0x2a1e18, 0.9));
    const fill = new THREE.DirectionalLight(0xffc89a, 0.9); fill.position.set(0, 12, 30); s.add(fill);
    const moon = new THREE.DirectionalLight(0x6a78c0, 0.9); moon.position.set(-10, 30, 12); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 28, bottom: -28, near: 1, far: 90 }); moon.shadow.bias = -0.0008; s.add(moon);
    // 방 바닥: Vowkeep 1장 단장의 방 (돌 바닥, 기둥 네 개, 벽돌 벽, 깃발, 횃불)을 넓혀서 써요. 바닥 둘레는 어두운 구덩이
    this.tiles = []; this.tlState = new Uint8Array(NT);
    this.crackM = M(0x6a4a3a, { e: 0x601808, ei: 0.8 });
    const under = geo('hunder', () => new THREE.BoxGeometry(CELL * 0.97, 1.8, CELL * 0.97)), cob = geo('hcob', () => new THREE.BoxGeometry(CELL * 0.485, 0.5, CELL * 0.485));
    for (let i = 0; i < NT; i++) {
      const T = TILES[i], g = new THREE.Group(); g.position.set(T.x, 0, T.z); s.add(g);
      const boss = Math.abs(T.q) <= 5 && Math.abs(T.r) <= 4, tops = [], gms = [];
      for (let k = 0; k < 4; k++) {
        const gm = M((boss ? BFLOOR : FLOOR)[(R() * 5) | 0]); gms.push(gm);
        const h = 0.9 + R() * 0.2, c = mesh(cob, gm, (k % 2 ? 1 : -1) * CELL * 0.245 + (R() - 0.5) * 0.06, -0.25 + (h - 1) * 0.5 * 0.5, (k < 2 ? -1 : 1) * CELL * 0.245 + (R() - 0.5) * 0.06, g); c.scale.y = h; tops.push(c);
      }
      mesh(under, M(WALL[(R() * 4) | 0]), 0, -1.4, 0, g);
      if (R() < 0.1) box(0.7 + R() * 0.6, 0.05, 0.5 + R() * 0.4, M(0x3e5a36), (R() - 0.5) * 1.8, 0.02, (R() - 0.5) * 1.8, g).rotation.y = R() * 3;
      if (R() < 0.08) box(0.9 + R() * 0.6, 0.04, 0.08, M(0x2e2a34), (R() - 0.5) * 1.2, 0.02, (R() - 0.5) * 1.2, g).rotation.y = R() * 3;
      if (R() < 0.04 && !PILLARS.includes(i)) { const b = box(0.7, 0.1, 0.1, bone(), (R() - 0.5), 0.05, (R() - 0.5), g); b.rotation.y = R() * 3; sph(0.2, 6, 5, bone(), b.position.x + 0.4, 0.14, b.position.z, g); }
      if (PILLARS.includes(i)) {
        // Vowkeep 기둥 (받침, 원기둥, 머리돌, 깃발)
        g.scale.setScalar(1); box(2.2, 0.5, 2.2, M(0x5c5468), 0, 0.25, 0, g); cyl(0.85, 0.95, 2.4, 8, M(0x4e4858), 0, 1.7, 0, g); box(2.3, 0.5, 2.3, M(0x5c5468), 0, 3.15, 0, g);
        const bn = new THREE.Group(); bn.position.set(0, 2.8, 1.0); g.add(bn); box(1.4, 0.12, 0.12, M(0x8a6a30, { m: 0.6 }), 0, 0.1, 0, bn); box(1.1, 2.2, 0.06, M(0x7a1f22), 0, -1.1, 0.04, bn); box(0.45, 0.9, 0.08, gold(), 0, -1.15, 0.08, bn);
      }
      this.tiles.push({ g, tops, gms, vy: 0, fall: 0, grow: 0 });
    }
    // 벽: 뒤쪽 벽은 높게, 옆 벽은 낮게 (앞쪽은 카메라가 보이게 터 놓았어요). 바닥과 벽 사이는 구덩이
    const WX = (NX + 0.5) * CELL + 4, WZ = (NZ + 0.5) * CELL + 4, torches = [];
    const BK = 1.5;
    this.instBoxes(s, add => {
      for (let y = 0; y < 6; y++) for (let x = -WX - 3; x <= WX + 3; x += 2.2 * BK / 1.5 * 1.5) add(x + (y % 2 ? 1.65 : 0), (y + 0.45) * BK, -WZ - 1, 3.1, 0.95 * BK, 2.4, WALL[(R() * 4) | 0]);
      for (let x = -WX - 3; x <= WX + 3; x += 3.3) add(x, 6.14 * BK, -WZ - 1, 3.3, 0.3 * BK, 2.6, 0x2a2630);
      for (const sx of [-1, 1]) {
        for (let y = 0; y < 3; y++) for (let z = -WZ; z <= 12; z += 3.3) add(sx * (WX + 1), (y + 0.45) * BK, z + (y % 2 ? 1.65 : 0), 2.4, 0.95 * BK, 3.1, WALL[(R() * 4) | 0]);
        for (let z = -WZ; z <= 12; z += 3.3) add(sx * (WX + 1), 3.14 * BK, z, 2.6, 0.3 * BK, 3.3, 0x2a2630);
      }
    });
    for (const x of [-16, -5.5, 5.5, 16]) torches.push([x, -WZ + 0.2, 9.2]);
    for (const sx of [-1, 1]) torches.push([sx * (WX - 0.2), -4, 4.8]);
    torches.forEach(([x, z, y], k) => {
      box(0.5, 1.4, 0.5, M(0x4a3020), x, y - 0.4, z, s); box(0.9, 0.3, 0.9, M(0x2a2830, { m: 0.7 }), x, y + 0.3, z, s);
      cone(0.45, 1.2, 6, M(0xff9a3a, { e: 0xff7a20, ei: 3 }), x, y + 1.1, z, s); cone(0.26, 0.8, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), x, y + 1.0, z, s);
      const L = new THREE.PointLight(0xff9a48, 90, 36, 1.5); L.position.set(x, y + 1.6, z + (z < -5 ? 1.5 : 0)); s.add(L); this.flick.push({ L, b: 90, ph: k * 1.7 });
    });
    for (const x of [-11, 0, 11]) { const bn = new THREE.Group(); bn.position.set(x, 8.2, -WZ + 0.45); s.add(bn); bn.scale.setScalar(1.7); box(2.2, 0.16, 0.16, M(0x8a6a30, { m: 0.6 }), 0, 0.1, 0, bn); box(1.8, 3.6, 0.08, M(0x7a1f22), 0, -1.8, 0.05, bn); box(0.7, 1.4, 0.1, gold(), 0, -1.9, 0.12, bn); }
    // 구덩이 속에서 떠오르는 불씨
    this.embers = []; for (let i = 0; i < 24; i++) { const e = box(0.14, 0.14, 0.14, M(0xffb050, { e: 0xff8a30, ei: 5 }), 0, -50, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 4, x: (R() - 0.5) * 50, z: (R() - 0.5) * 36 }); }
    this.clouds = [];
    // 왕관
    this.crown = makeCrown(); s.add(this.crown);
    this.crownL = new THREE.PointLight(0xffd070, 22, 8, 1.6); s.add(this.crownL);
    this.beam = mesh(geo('beam', () => new THREE.CylinderGeometry(0.5, 0.5, 14, 10, 1, true)), M(0xffe08a, { op: 0.14, ds: true }), 0, 7, 0, s, false);
    this.ringMk = mesh(geo('ringMk', () => new THREE.RingGeometry(0.9, 1.15, 16)), M(0xffd36b, { op: 0.6, ds: true }), 0, 0.03, 0, s, false); this.ringMk.rotation.x = -Math.PI / 2;
    // 직업 고르기 받침돌 (섬에서 멀리 떨어진 곳)
    const P = this.ped = new THREE.Group(); P.position.set(200, 0, 0); s.add(P);
    cyl(1.8, 2.0, 0.6, 8, M(0x5c5468), 0, -0.3, 0, P); cyl(2.1, 2.3, 0.5, 8, M(0x4e4858), 0, -0.8, 0, P);
    for (const sx of [-1, 1]) { box(0.3, 2.4, 0.3, M(0x4a3020), sx * 3.4, 0.9, -2, P); cone(0.3, 0.8, 6, M(0xff9a3a, { e: 0xff7a20, ei: 3 }), sx * 3.4, 2.4, -2, P); cone(0.17, 0.55, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), sx * 3.4, 2.3, -2, P); }
    const PL = new THREE.PointLight(0xff9a48, 12, 14, 1.6); PL.position.set(1.5, 3.4, 3); P.add(PL); this.flick.push({ L: PL, b: 12, ph: 3 });
    this.camP.position.set(200, 5, 14); this.camP.lookAt(200, 1.3, 0); this.camP.updateMatrixWorld();
    this.comp = new EffectComposer(this.r); this.pp = new RenderPixelatedPass(this.P || 3, s, this.cam, { normalEdgeStrength: 0.2, depthEdgeStrength: 0.4 });
    this.comp.addPass(this.pp); this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.26, 0.2, 0.9); this.bloom.enabled = this.bloomOn; this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
    // 고정 카메라: Vowkeep처럼 비스듬히 내려다봐요
    this.cam.position.set(0, 22, 30); this.cam.lookAt(0, 0, 0); this.cam.updateMatrixWorld();
  }
  instBoxes(s, fill) {
    const items = []; fill((x, y, z, w, h, d, c) => items.push([x, y, z, w, h, d, c]));
    const im = new THREE.InstancedMesh(geo('ub', () => new THREE.BoxGeometry(1, 1, 1)), new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), items.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    items.forEach((it, i) => { m4.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], it[4], it[5])); im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(it[6])); });
    im.castShadow = im.receiveShadow = true; s.add(im); return im;
  }
  // 직업 고르기 화면 켜고 끄기
  setPreview(cls, col) {
    if (cls == null) { this.mode = 'arena'; this.pp.camera = this.cam; return; }
    this.mode = 'preview'; this.pp.camera = this.camP;
    if (this.pv && this.pv.cls === cls && this.pv.col === col) return;
    if (this.pv) this.ped.remove(this.pv.g);
    const g = makeHero(cls, col); g.scale.setScalar(1); g.rotation.y = 0.45; g.userData.ring.visible = false; this.ped.add(g); this.pv = { g, cls, col, t0: performance.now() / 1000, y0: g.position.y };
  }
  setTiles(tl, dt, t) {
    for (let i = 0; i < NT; i++) {
      const v = +tl[i], o = this.tlState[i], T = this.tiles[i];
      if (v !== o) {
        if (v === 2) { T.fall = 0.001; T.vy = 0; this.dust(TILES[i].x, 0, TILES[i].z, 6); }
        else if (o === 2) { T.fall = 0; T.grow = 0.001; T.g.visible = true; T.g.rotation.set(0, 0, 0); }
        T.tops.forEach((c, k) => { c.material = v === 1 ? this.crackM : T.gms[k]; });
        this.tlState[i] = v;
      }
      if (v === 1) T.g.position.y = -0.06 - Math.abs(Math.sin(t * 3 + i)) * 0.06;
      else if (T.fall > 0) { T.fall += dt; T.vy -= 22 * dt; T.g.position.y += T.vy * dt; T.g.rotation.x += dt * 0.6; T.g.rotation.z += dt * 0.4; if (T.g.position.y < -40) T.g.visible = false; }
      else if (T.grow > 0) { T.grow = Math.min(1, T.grow + dt * 1.8); const k = 1 - Math.pow(1 - T.grow, 3); T.g.position.y = -6 * (1 - k); if (T.grow >= 1) T.grow = 0; }
      else T.g.position.y = 0;
    }
  }
  resetTiles() { for (let i = 0; i < NT; i++) { const T = this.tiles[i]; T.fall = 0; T.grow = 0; T.g.visible = true; T.g.position.y = 0; T.g.rotation.set(0, 0, 0); T.tops.forEach((c, k) => { c.material = T.gms[k]; }); this.tlState[i] = PILLARS.includes(i) ? 3 : 0; } }
  setPlayers(list) {
    for (const [, e] of this.ents) this.scene.remove(e.g);
    this.ents.clear();
    for (const p of list) { const g = makeHero(p.cls, p.col); this.scene.add(g); this.ents.set(p.id, { g, x: 0, y: 0, z: 0, ry: 0, init: false, spd: 0, cls: p.cls }); }
  }

  update(snap, dt, t) {
    for (const f of this.flick) f.L.intensity = f.b * (0.88 + Math.sin(t * 3.1 + f.ph) * 0.06 + Math.sin(t * 5.3 + f.ph * 2) * 0.04);
    for (const c of this.clouds) { c.c.position.x += c.v * dt; if (c.c.position.x > 50) c.c.position.x = -50; }
    for (const e of this.embers) { e.t += dt; const k = (e.t % 4) / 4; e.m.position.set(e.x + Math.sin(e.t * 0.7) * 0.6, -2 + k * 10, e.z); e.m.scale.setScalar(1 - k); }
    if (this.mode === 'preview' && this.pv) {
      // 직업 시범: 서 있기, 걷기, 모아 베기, 기술, 구르기를 7초마다 되풀이해요
      const pv = this.pv, tt = (((t - pv.t0) % 7) + 7) % 7, cls = pv.cls, E = pv.E || (pv.E = {});
      const SKST = { knight: ST.lunge, mamluk: ST.lunge, priest: ST.cast, witch: ST.cast, viking: ST.spin, skeleton: ST.grab, hunter: ST.swing }[cls];
      let st = ST.idle, s0 = 0, chg = 0, run = 0;
      if (tt >= 1.4 && tt < 2.5) { st = ST.run; run = 1; }
      else if (tt >= 2.6 && tt < 3.4) { st = ST.charge; chg = Math.min(1, (tt - 2.6) / 0.7); s0 = tt - 2.6; }
      else if (tt >= 3.4 && tt < 3.8) { st = ST.swing; s0 = tt - 3.4; }
      else if (tt >= 4.6 && tt < 5.1) { st = SKST; s0 = tt - 4.6; }
      else if (tt >= 6.0 && tt < 6.17) { st = ST.dash; s0 = tt - 6.0; }
      animate(E, pv.g, { y: pv.y0, cls, st, s: s0, chg, run, air: false }, dt, t);
      this.stepFx(dt); return;
    }
    if (snap) {
      if (snap.ring !== this.ring) { this.ring = snap.ring; this.fit(false); }
      this.setTiles(snap.tl, dt, t);
      for (const a of snap.p) this.syncPlayer(a, dt, t);
      const [cx, cy, cz, ch] = snap.c, C = this.crown;
      if (ch) {
        const e = this.ents.get(ch); if (e) { C.position.set(e.g.position.x, e.g.position.y + 2.95 + Math.sin(t * 4) * 0.04, e.g.position.z); C.rotation.y += dt * 1.5; C.scale.setScalar(0.9); }
        this.beam.visible = false; this.ringMk.visible = false;
      } else {
        const k = 1 - Math.exp(-dt * 18); C.position.x += (cx - C.position.x) * k; C.position.y += (cy + 0.25 + Math.sin(t * 3) * 0.12 - C.position.y) * k; C.position.z += (cz - C.position.z) * k;
        if (Math.abs(cx - C.position.x) > 4 || Math.abs(cz - C.position.z) > 4) C.position.set(cx, cy, cz);
        C.rotation.y += dt * 2.2; C.scale.setScalar(1.15);
        this.beam.visible = cy > -2 && cy < 3; this.beam.position.set(C.position.x, 7, C.position.z); this.ringMk.visible = this.beam.visible; this.ringMk.position.set(C.position.x, 0.03, C.position.z); this.ringMk.rotation.z += dt;
      }
      C.visible = ch ? true : cy > -40;
      this.crownL.position.set(C.position.x, C.position.y + 1.2, C.position.z); this.crownL.intensity = C.visible ? 22 : 0;
      this.syncProj(snap.j || [], t);
    }
    if (Math.abs(this.vs - this.vsT) > 0.01) { this.vs += (this.vsT - this.vs) * Math.min(1, dt * 1.5); this.applyVs(); }
    // 큰 타격에는 화면이 흔들려요
    this.shake = (this.shake || 0) * Math.exp(-dt * 9);
    this.cam.position.set((Math.random() - 0.5) * this.shake, 22 + (Math.random() - 0.5) * this.shake, 30); this.cam.updateMatrixWorld();
    this.stepFx(dt);
  }
  syncPlayer(a, dt, t) {
    const [id, x, y, z, fx, fz, st, sa, chg, , , , , inv, ax, az] = a; const e = this.ents.get(id); if (!e) return;
    const g = e.g, u = g.userData;
    if (!e.init || Math.hypot(x - e.x, z - e.z) > 5 || (st !== ST.out && e.st === ST.out)) { e.x = x; e.y = y; e.z = z; e.init = true; }
    const k = 1 - Math.exp(-dt * 20), px = e.x, pz = e.z;
    e.x += (x - e.x) * k; e.y += (y - e.y) * k; e.z += (z - e.z) * k;
    const sp = Math.hypot(e.x - px, e.z - pz) / Math.max(dt, 1e-3); e.spd += (sp - e.spd) * Math.min(1, dt * 10);
    if (e.st !== st) { e.st = st; e.sa0 = t - sa; }
    const s = Math.max(0, t - (e.sa0 ?? t));
    g.visible = st !== ST.out; g.position.set(e.x, e.y, e.z);
    let ry = Math.atan2(fx, fz); if (st === ST.charge || st === ST.swing || st === ST.cast || st === ST.lunge || st === ST.grab) ry = Math.atan2(ax, az);
    let d = ry - e.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); e.ry += d * Math.min(1, dt * 18); g.rotation.y = e.ry;
    u.bub.visible = !!inv; u.ring.visible = e.y > -0.5 && e.y < 0.5;
    animate(e, g, { y: e.y, cls: e.cls, st, s, chg, run: Math.min(1, e.spd / 5), air: Math.abs(e.y) > 0.4 }, dt, t);
    if ((st === ST.dash || st === ST.lunge) && Math.random() < dt * 30) this.puff(e.x, e.y + 0.2, e.z);
    if (st === ST.charge && chg >= 1 && Math.random() < dt * 12) this.spark(e.x + (Math.random() - 0.5), e.y + 1.4 + Math.random(), e.z + (Math.random() - 0.5), 0xfff0a0);
  }
  // 화살과 마법 구슬
  syncProj(list, t) {
    while (this.pjM.length < list.length) {
      const g = new THREE.Group(); this.scene.add(g);
      const arrow = new THREE.Group(); g.add(arrow); box(0.06, 0.06, 1.2, M(0x8a5a2a), 0, 0, 0, arrow).castShadow = false; cone(0.1, 0.3, 4, M(0xd8dde8, { e: 0x8a8a9a, ei: 0.6 }), 0, 0, 0.7, arrow).rotation.x = Math.PI / 2; box(0.2, 0.04, 0.25, M(0xe8e0c8), 0, 0, -0.5, arrow);
      const orb = sph(0.32, 8, 6, M(0xc06aff, { e: 0x9a3aff, ei: 4 }), 0, 0, 0, g); orb.castShadow = false; const o2 = sph(0.5, 8, 6, M(0xd8a0ff, { op: 0.3 }), 0, 0, 0, g); o2.castShadow = false;
      this.pjM.push({ g, arrow, orb, o2 });
    }
    this.pjM.forEach((m, i) => {
      const b = list[i]; m.g.visible = !!b; if (!b) return;
      m.g.position.set(b[1], b[2], b[3]); m.g.rotation.y = Math.atan2(b[4], b[5]);
      m.arrow.visible = !b[0]; m.orb.visible = m.o2.visible = !!b[0]; if (b[0]) { m.o2.scale.setScalar(1 + Math.sin(t * 9) * 0.12); if (Math.random() < 0.3) this.spark(b[1], b[2], b[3], 0xd8a0ff); }
    });
  }

  /* ---------- 효과 ---------- */
  addFx(m, T, up) { this.fx.push({ m, t: 0, T, up }); }
  burst(x, y, z, col, n, sp, life = 0.5, size = 0.14) {
    for (let i = 0; i < n; i++) {
      const m = box(size, size, size, M(col, { e: col, ei: 2 }), x, y, z, this.scene); m.castShadow = false;
      const vx = (Math.random() - 0.5) * sp, vy = Math.random() * sp * 0.8 + 1, vz = (Math.random() - 0.5) * sp;
      this.addFx(m, life * (0.6 + Math.random() * 0.6), (f, dt) => { m.position.x += vx * dt; m.position.y += (vy - 14 * f.t) * dt; m.position.z += vz * dt; m.scale.setScalar(1 - f.t / f.T); });
    }
  }
  spark(x, y, z, col) { const m = box(0.12, 0.12, 0.12, M(col, { e: col, ei: 2 }), x, y, z, this.scene); m.castShadow = false; this.addFx(m, 0.35, (f, dt) => { m.position.y += dt * 2; m.scale.setScalar(1 - f.t / f.T); }); }
  puff(x, y, z) { const m = dod(0.25, M(0x8a8494), x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4, this.scene); m.castShadow = false; this.addFx(m, 0.4, (f, dt) => { m.position.y += dt * 1.2; m.scale.setScalar(1 + f.t * 2 - (f.t / f.T) * 1.5); }); }
  dust(x, y, z, n) { for (let i = 0; i < n; i++) this.puff(x + (Math.random() - 0.5) * 2, y + Math.random() * 0.4, z + (Math.random() - 0.5) * 2); }
  shock(x, z, r, col = 0xfff4d0) {
    const m = mesh(geo('shock', () => new THREE.RingGeometry(0.75, 1, 24)), M(col, { op: 0.7, ds: true, uniq: true }), x, 0.08, z, this.scene, false); m.rotation.x = -Math.PI / 2;
    this.addFx(m, 0.35, f => { const k = f.t / f.T; m.scale.setScalar(0.4 + k * r); m.material.opacity = 0.7 * (1 - k); });
  }
  star(x, y, z, s) {
    const g = new THREE.Group(); g.position.set(x, y, z); this.scene.add(g);
    for (let i = 0; i < 4; i++) { const b = box(0.12, 0.12, 0.8 + s * 0.04, M(0xffffff, { e: 0xfff0b0, ei: 2 }), 0, 0, 0, g); b.castShadow = false; b.rotation.y = i * Math.PI / 4; }
    this.addFx(g, 0.16, f => { g.scale.setScalar(0.6 + f.t / f.T * 1.2); });
  }
  stepFx(dt) { for (let i = this.fx.length - 1; i >= 0; i--) { const f = this.fx[i]; f.t += dt; f.up(f, dt); if (f.t >= f.T) { this.scene.remove(f.m); this.fx.splice(i, 1); } } }
  onEvent(e) {
    const P = id => this.ents.get(id);
    if (e.k === 'hit') { this.shake = Math.max(this.shake || 0, Math.min(1.1, e.s * 0.05)); this.burst(e.x, e.y, e.z, 0xfff6d8, Math.min(20, 4 + e.s), 3 + e.s * 0.35, 0.45); this.star(e.x, e.y, e.z, e.s); if (e.s >= 14) this.burst(e.x, e.y, e.z, 0xffc040, 6, 8, 0.6, 0.18); }
    else if (e.k === 'curse') { this.shock(e.x, e.z, 3, 0xc06aff); this.burst(e.x, 0.2, e.z, 0x9a3aff, 14, 6, 0.7, 0.18); }
    else if (e.k === 'boom') { this.burst(e.x, e.y, e.z, 0xc06aff, 14, 7, 0.5, 0.16); this.shock(e.x, e.z, 2.2, 0xd8a0ff); }
    else if (e.k === 'nova') { this.shock(e.x, e.z, 4, 0xfff0a0); this.burst(e.x, 1.5, e.z, 0xffe08a, 18, 7, 0.6); }
    else if (e.k === 'ko') { const p = P(e.id); if (p) { this.burst(p.x, 0.5, p.z, 0xffe08a, 16, 8, 0.7, 0.2); this.shock(p.x, p.z, 3, 0xffe08a); } this.shake = 1.2; }
    else if (e.k === 'spin') { this.shock(e.x, e.z, 3.4, 0xe8eef8); this.dust(e.x, 0, e.z, 5); }
    else if (e.k === 'dash') { const p = P(e.id); if (p) this.dust(p.x, 0, p.z, 2); }
    else if (e.k === 'pick') { const p = P(e.id); if (p) { this.burst(p.x, 2.6, p.z, 0xffd36b, 14, 5, 0.6); this.shock(p.x, p.z, 2.4, 0xffe08a); } }
    else if (e.k === 'spawn') { const p = P(e.id); if (p) p.init = false; }
    else if (e.k === 'swing') { const p = P(e.id); if (p && e.c >= 0.9 && !e.pj) this.shock(p.x, p.z, 1.6, 0xfff0a0); }
  }
  project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(this.cam); return { x: (v.x + 1) / 2 * this.cssW, y: (1 - v.y) / 2 * this.cssH }; }
  ground(cx, cy, h = 0) {
    const v = new THREE.Vector2(cx / this.cssW * 2 - 1, -(cy / this.cssH) * 2 + 1); this.ray.setFromCamera(v, this.cam); this.plane.constant = -h;
    const o = new THREE.Vector3(); return this.ray.ray.intersectPlane(this.plane, o) ? o : null;
  }
  render() { this.comp.render(); }
}

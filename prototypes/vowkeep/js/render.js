// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 그리기: three.js 입체 모델을 픽셀로 바꿔 그려요 (RenderPixelatedPass)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { ROLES, MAP, CH, FOES } from './data.js';
import { CS, MW, MH, floorCell, GRID, WATER, PILLARS, cw, chapterIndex } from './map.js';

let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const MC = new Map();
// 캐릭터는 명암을 3단계로만 나눠서 조금 납작하게 보여요
let TOON = 0, TGRAD = null;
const toonGrad = () => { if (!TGRAD) { TGRAD = new THREE.DataTexture(new Uint8Array([115, 115, 115, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1); TGRAD.minFilter = TGRAD.magFilter = THREE.NearestFilter; TGRAD.needsUpdate = true; } return TGRAD; };
const toonify = f => (...a) => { TOON++; try { return f(...a); } finally { TOON--; } };
const M = (c, o = {}) => {
  const key = (TOON && !o.op ? 't' : '') + c + '|' + JSON.stringify(o); if (MC.has(key) && !o.uniq) return MC.get(key);
  if (TOON && !o.op) {
    // 쇠붙이는 반짝임 대신 조금 밝게
    const col = new THREE.Color(c); if (o.m) col.multiplyScalar(1.12);
    const m = new THREE.MeshToonMaterial({ color: col, gradientMap: toonGrad(), emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
    if (!o.uniq) MC.set(key, m); return m;
  }
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, flatShading: true, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: o.op ? false : true, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
  if (!o.uniq) MC.set(key, m); return m;
};
const GC = new Map();
const geo = (k, f) => { if (!GC.has(k)) GC.set(k, f()); return GC.get(k); };
function mesh(g, m, x, y, z, p, shadow = true) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = shadow; if (p) p.add(o); return o; }
const box = (w, h, d, m, x, y, z, p) => mesh(geo('b' + w + ',' + h + ',' + d, () => new THREE.BoxGeometry(w, h, d)), m, x, y, z, p);
const cyl = (rt, rb, h, s, m, x, y, z, p) => mesh(geo('c' + [rt, rb, h, s], () => new THREE.CylinderGeometry(rt, rb, h, s)), m, x, y, z, p);
const sph = (r, ws, hs, m, x, y, z, p, extra) => mesh(geo('s' + [r, ws, hs, extra], () => extra ? new THREE.SphereGeometry(r, ws, hs, 0, 6.3, 0, extra) : new THREE.SphereGeometry(r, ws, hs)), m, x, y, z, p);
const cap = (r, l, m, x, y, z, p) => mesh(geo('k' + [r, l], () => new THREE.CapsuleGeometry(r, l, 3, 8)), m, x, y, z, p);
const cone = (r, h, s, m, x, y, z, p) => mesh(geo('n' + [r, h, s], () => new THREE.ConeGeometry(r, h, s)), m, x, y, z, p);

const metal = () => M(0xb8bfcc, { m: 0.75, r: 0.35 }), dmetal = () => M(0x5a5f70, { m: 0.7, r: 0.45 }), skin = () => M(0xe8b48a), gold = () => M(0xe6c15a, { m: 0.8, r: 0.3 }), leather = () => M(0x5a3a22), bone = () => M(0xd8d0bc);

/* ---------- 장마다 다른 색과 장식 ---------- */
const THEMES = {
  dungeon: { bg: 0x050407, fog: 0x07060a, amb: 0x4a4a78, hemi: 0x8a90c8, floor: [0x4a4550, 0x524d58, 0x5a5462, 0x463f4c, 0x55505c], bfloor: [0x3e3440, 0x463a48, 0x4e4250, 0x3a3040, 0x4a3e4c], wet: [0x34404c, 0x384656, 0x2e3a46, 0x3c4a58], wall: [0x3e3846, 0x463f50, 0x4e4658, 0x38323f], bwall: [0x3a2e3c, 0x423446, 0x4a3a50, 0x342a38], top: 0x2a2630, moss: 0x3e5a36, mossP: 0.06, torch: 0xff9a48, water: 0x3a6a9a, ring: 0x8a1a2a, fz: [0x5a1aa0, 0x8a2ad0], ember: [0xffb050, 0xff8a30], banner: 0x7a1f22 },
  forest: { bg: 0x08090a, fog: 0x161a1c, amb: 0x5a6070, hemi: 0xa0a8a0, floor: [0x3c3a2e, 0x3e4430, 0x3a4030, 0x34402c, 0x404a32], bfloor: [0x3a3226, 0x42382a, 0x3a3024, 0x463c2e, 0x34301e], wet: [0x2e3a36, 0x34403c, 0x2a3632, 0x38443e], wall: [0x2e2a24, 0x36302a, 0x2a2620, 0x3a3430], bwall: [0x30241e, 0x382a22, 0x2c201a, 0x3e2e26], top: 0x24301e, moss: 0x4a5a34, mossP: 0.22, torch: 0xffb060, water: 0x4a6a6a, ring: 0x6a3a1a, fz: [0x4a3a1a, 0xd06a20], ember: [0xd8d4cc, 0x9a968e], trees: 1 },
  abbey: { bg: 0x03060a, fog: 0x08101a, amb: 0x405478, hemi: 0x88a0d0, floor: [0x4a5058, 0x525a62, 0x485058, 0x565e68, 0x444c54], bfloor: [0x3a4450, 0x404a58, 0x36404c, 0x46505c, 0x343e4a], wet: [0x2e4054, 0x34485c, 0x2a3c50, 0x3a4e62], wall: [0x3c4450, 0x444c58, 0x4c5462, 0x363e4a], bwall: [0x2e3a4a, 0x344052, 0x3a4658, 0x2a3444], top: 0x262c36, moss: 0x3a5a4a, mossP: 0.1, torch: 0xffd08a, water: 0x2a5a9a, ring: 0x2a5ab0, fz: [0x1a3a6a, 0x3a8ae0], ember: [0x9ad0ff, 0x6aa0e0], windows: 1 },
  tower: { bg: 0x0a0505, fog: 0x160a08, amb: 0x6a4a4a, hemi: 0xc89a8a, floor: [0x4a4040, 0x524646, 0x5a4c4a, 0x463c3c, 0x54484a], bfloor: [0x4a3030, 0x523434, 0x5a3a36, 0x462c2c, 0x503432], wet: [0x3a3440, 0x403848, 0x36303c, 0x443c4c], wall: [0x4a3a36, 0x52423c, 0x5a4842, 0x443430], bwall: [0x5a2a22, 0x622e26, 0x6a3428, 0x52261e], top: 0x2e2220, moss: 0x5a4a2a, mossP: 0.04, torch: 0xff7a30, water: 0x6a3a2a, ring: 0xc04a10, fz: [0xa03a10, 0xff6a20], ember: [0xffa040, 0xff6a20], banner: 0x3a3a3a }
};
const THEME = () => THEMES[CH.theme] || THEMES.dungeon;

/* ---------- 캐릭터 모델 ---------- */
const HERO = {
  knight: { body: 0x3f6fd0, leg: 'dm', arm: 'mt', helm: 1, sword: 1, shield: 1, cape: 0x24479a, belt: 1 },
  archer: { body: 0x467a3e, leg: 0x3a3a44, arm: 0x467a3e, hood: 0x2f5a32, bow: 1, quiver: 1, belt: 1 },
  priest: { body: 0xe8e4ef, robe: 1, leg: 0x9a96a8, arm: 0xe8e4ef, hood: 0xcfc8dc, staff: 1 },
  squire: { body: 0x8a6a44, leg: 0x4a4250, arm: 0x8a6a44, cap: 0xb9443a, torch: 1, sack: 1, belt: 1 }
};
function matOf(v) { return v === 'dm' ? dmetal() : v === 'mt' ? metal() : M(v); }
export const makeHero = toonify(function (role) { const g = makeFigure(HERO[role]); g.userData.role = role; return g; });
// 사람 모양 (주인공과 사람 모양 적이 같이 써요)
function makeFigure(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const lg = matOf(o.leg), am = matOf(o.arm);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.25, 0.9, 0); legR.position.set(0.25, 0.9, 0); body.add(legL, legR);
  cap(0.2, 0.6, lg, 0, -0.4, 0, legL); cap(0.2, 0.6, lg, 0, -0.4, 0, legR);
  box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legL); box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legR);
  cyl(0.5, o.robe ? 0.85 : 0.62, o.robe ? 1.9 : 1.3, 10, M(o.body), 0, o.robe ? 1.1 : 1.45, 0, body);
  sph(0.55, 10, 8, M(o.body), 0, 2.05, 0, body).scale.set(1, 0.7, 0.85);
  if (o.belt) { const b = mesh(geo('belt', () => new THREE.TorusGeometry(0.58, 0.08, 5, 12)), leather(), 0, 1.2, 0, body); b.rotation.x = Math.PI / 2; }
  const head = new THREE.Group(); head.position.y = 2.75; body.add(head);
  if (o.helm) {
    const hm = o.helmC ? M(o.helmC, { m: 0.7, r: 0.4 }) : metal(); cyl(0.42, 0.45, 0.8, 10, hm, 0, 0, 0, head); sph(0.42, 10, 6, hm, 0, 0.4, 0, head, 1.6);
    box(0.6, 0.08, 0.1, o.eye ? M(o.eye, { e: o.eye, ei: 5 }) : M(0x0a0a0e), 0, 0.05, 0.42, head); if (o.plume !== 0) { const pl = cone(0.12, 0.7, 5, M(o.plume || 0x3f6fd0), 0, 0.95, -0.1, head); pl.rotation.x = -0.5; }
  } else {
    const ey = o.eye ? M(o.eye, { e: o.eye, ei: 5 }) : M(0x1a1418);
    sph(0.42, 10, 8, o.skinC ? M(o.skinC) : skin(), 0, 0, 0, head); box(0.08, 0.1, 0.05, ey, -0.15, 0.02, 0.4, head); box(0.08, 0.1, 0.05, ey, 0.15, 0.02, 0.4, head);
    if (o.hood) { sph(0.52, 10, 8, M(o.hood), 0, 0.05, -0.05, head, 1.9); const c = cone(0.3, 0.6, 6, M(o.hood), 0, 0.1, -0.5, head); c.rotation.x = -1.9; }
    if (o.cap) { cyl(0.46, 0.46, 0.25, 10, M(o.cap), 0, 0.3, 0, head); sph(0.44, 10, 6, M(o.cap), 0, 0.35, 0, head, 1.4); const f = cone(0.06, 0.6, 4, M(0xf0e8d0), 0.3, 0.7, -0.1, head); f.rotation.z = -0.6; }
  }
  if (o.cape) { const cp = mesh(geo('cape', () => new THREE.PlaneGeometry(1.2, 2, 1, 3)), M(o.cape, { ds: true }), 0, 1.6, -0.6, body); cp.rotation.x = 0.18; }
  if (o.antler) for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.3, 0.45, 0); head.add(a); a.rotation.z = -sx * 0.5; cyl(0.05, 0.07, 0.9, 4, M(0xcfc0a0), 0, 0.45, 0, a); for (let i = 0; i < 3; i++) { const t = cyl(0.04, 0.05, 0.4, 4, M(0xcfc0a0), sx * 0.15, 0.3 + i * 0.25, 0, a); t.rotation.z = -sx * 0.9; } }
  if (o.mitre) { const mt = cone(0.4, 1.2, 4, M(0xd8d4c8), 0, 0.75, 0, head); mt.rotation.y = Math.PI / 4; box(0.08, 1, 0.5, gold(), 0, 0.7, 0, head); }
  if (o.crown) { cyl(0.48, 0.5, 0.2, 8, gold(), 0, 0.7, 0, head); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; cone(0.08, 0.4, 4, gold(), Math.cos(a) * 0.44, 0.95, Math.sin(a) * 0.44, head); } }
  if (o.horns) for (const sx of [-1, 1]) { const hn = cone(0.1, 0.7, 5, M(0x2a2228), sx * 0.45, 0.5, 0, head); hn.rotation.z = -sx * 0.8; }
  if (o.bark) for (let i = 0; i < 5; i++) { const b = cone(0.12, 0.9, 4, M(0x4a3a26), Math.cos(i * 1.3) * 0.5, 2.4 + (i % 2) * 0.3, Math.sin(i * 1.3) * 0.4 - 0.2, body); b.rotation.set(Math.sin(i) * 0.8, 0, Math.cos(i) * 0.8); }
  const armR = new THREE.Group(); armR.position.set(0.72, 2.15, 0); body.add(armR); cap(0.17, 0.7, am, 0, -0.45, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.72, 2.15, 0); body.add(armL); cap(0.17, 0.7, am, 0, -0.45, 0, armL);
  let light = null;
  if (o.sword) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); box(0.12, 2, 0.04, M(0xe9edf5, { m: 0.9, r: 0.2 }), 0, 1.1, 0, sw); box(0.6, 0.1, 0.14, gold(), 0, 0.1, 0, sw); box(0.08, 0.35, 0.08, leather(), 0, -0.1, 0, sw); sw.rotation.x = Math.PI / 2; }
  if (o.shield) { const shc = o.shieldC || 0x2c4f9e; const sh = new THREE.Group(); sh.position.set(-0.15, -0.7, 0.45); armL.add(sh); sh.rotation.x = 0.6; box(1.1, 1.4, 0.14, M(shc), 0, 0, 0, sh); const c = cone(0.78, 0.7, 4, M(shc), 0, -0.95, 0, sh); c.rotation.set(Math.PI, Math.PI / 4, 0); box(0.18, 1.2, 0.05, gold(), 0, -0.1, 0.09, sh); box(0.8, 0.18, 0.05, gold(), 0, 0.25, 0.09, sh); }
  // 활: 왼손에 쥐고, 팔을 앞으로 뻗으면 위아래로 선 활이 조준 방향으로 휘어요 (시위는 몸 쪽)
  let bowS = null;
  if (o.bow) {
    // 얕게 휜 활: 손잡이는 손에, 시위는 몸 쪽. 시위는 두 가닥이라 당기면 V자로 접혀요
    const bw = mesh(geo('bow2', () => { const t = new THREE.TorusGeometry(1.6, 0.06, 4, 12, 1.24); t.rotateZ(Math.PI / 2 - 0.62); return t; }), M(0x8a5a2a), 0.12, 0.65, 0, armL);
    bw.setRotationFromMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0)));
    box(0.14, 0.22, 0.14, leather(), 0.12, -0.95, 0, armL);
    const sm = M(0xe8e0c8), sa = mesh(geo('str', () => new THREE.BoxGeometry(0.025, 0.025, 1)), sm, 0, 0, 0, armL, false), sb = mesh(geo('str', () => new THREE.BoxGeometry(0.025, 0.025, 1)), sm, 0, 0, 0, armL, false);
    const ar = new THREE.Group(); armL.add(ar); box(0.05, 1.3, 0.05, M(0x8a5a2a), 0, 0, 0, ar); const ah = cone(0.08, 0.25, 4, metal(), 0, -0.75, 0, ar); ah.rotation.x = Math.PI;
    bowS = { sa, sb, ar }; setPull(bowS, 0.05);
  }
  if (o.staff) { const sc = o.staffC || 0x9af0d0; const st = new THREE.Group(); st.position.set(0, -0.9, 0.1); armR.add(st); st.rotation.x = 0.7; cyl(0.07, 0.07, 3.2, 6, M(0x7a5a2a), 0, 0.5, 0, st); mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(sc, { e: sc, ei: 4 }), 0, 2.3, 0, st); if (!o.noLight) { light = new THREE.PointLight(0x6af0c0, 14, 8, 1.6); light.position.set(0, 2.4, 0); st.add(light); } }
  if (o.spear) { const sp = new THREE.Group(); sp.position.set(0, -0.9, 0.1); armR.add(sp); sp.rotation.x = Math.PI / 2; cyl(0.06, 0.06, 3.6, 5, M(0x5a3a22), 0, 0.8, 0, sp); cone(0.16, 0.6, 4, metal(), 0, 2.9, 0, sp); }
  if (o.great) { const gs = new THREE.Group(); gs.position.set(0, -0.9, 0.2); armR.add(gs); gs.rotation.x = Math.PI / 2; box(0.2, 2.8, 0.06, M(o.great, { m: 0.9, r: 0.3, e: o.greatE || 0, ei: 1.5 }), 0, 1.6, 0, gs); box(0.8, 0.12, 0.14, gold(), 0, 0.15, 0, gs); }
  if (o.censer) { const c = new THREE.Group(); c.position.set(0, -1.1, 0.2); armR.add(c); cyl(0.02, 0.02, 0.8, 4, dmetal(), 0, 0.4, 0, c); sph(0.3, 6, 5, M(0x8a7a40, { m: 0.7, e: 0x3a7ad0, ei: 1 }), 0, -0.1, 0, c); }
  if (o.bell) { const bl = new THREE.Group(); bl.position.set(-0.1, -0.8, 0.5); armL.add(bl); bl.rotation.x = 0.6; cyl(0.45, 0.8, 1.3, 8, M(0x8a7a4a, { m: 0.8, r: 0.35 }), 0, 0, 0, bl); }
  if (o.xbow) { const xb = new THREE.Group(); xb.position.set(0, -0.9, 0.3); armR.add(xb); xb.rotation.x = Math.PI / 2; box(0.14, 1.1, 0.14, M(0x4a3020), 0, 0.4, 0, xb); box(1.2, 0.1, 0.1, dmetal(), 0, 0.8, 0, xb); }
  if (o.torch) { const t = new THREE.Group(); t.position.set(0, -0.9, 0.1); armR.add(t); t.rotation.x = 0.9; cyl(0.08, 0.1, 1.2, 6, leather(), 0, 0.4, 0, t); cone(0.22, 0.6, 6, M(0xffa040, { e: 0xff7a20, ei: 3 }), 0, 1.2, 0, t); if (!o.noLight) { light = new THREE.PointLight(0xff9a48, 16, 9, 1.6); light.position.set(0, 1.4, 0); t.add(light); } }
  if (o.sack) sph(0.55, 8, 6, M(0xb89a6a), -0.1, 1.9, -0.7, body).scale.set(1, 1.1, 0.8);
  if (o.quiver) { const q = cyl(0.2, 0.2, 1.1, 6, leather(), 0.3, 2.1, -0.55, body); q.rotation.x = 0.3; for (let i = 0; i < 3; i++) box(0.04, 0.4, 0.04, M(0xe8e0c8), 0.25 + i * 0.06, 2.75, -0.7, body); }
  if (o.scale) g.scale.setScalar(o.scale);
  g.userData = { body, legL, legR, armL, armR, head, light, kind: 'hero', bowS };
  return g;
}
// 장마다 다른 적 모습
const FIG = {
  hunter: { body: 0x5a5040, leg: 0x3a3428, arm: 0x5a5040, hood: 0x3a3a2a, bow: 1, quiver: 1, belt: 1, eye: 0xffa040, skinC: 0x9a8a7a },
  treant: { body: 0x4a3a26, leg: 0x3a2a1a, arm: 0x4a3a26, skinC: 0x5a4630, eye: 0xffa040, bark: 1, scale: 1.3 },
  monk: { body: 0x3a4a4a, robe: 1, leg: 0x2a3434, arm: 0x3a4a4a, hood: 0x2a3a3a, skinC: 0x8aa0a0, eye: 0x6ad0ff },
  acolyte: { body: 0x2a3a5a, robe: 1, leg: 0x1a2a3a, arm: 0x2a3a5a, hood: 0x1e2c48, skinC: 0x8aa0a0, eye: 0x6ad0ff, staff: 1, staffC: 0x6ab0ff, noLight: 1 },
  bellman: { body: 0x3a4a4a, robe: 1, leg: 0x2a3434, arm: 0x3a4a4a, hood: 0x2a3a3a, skinC: 0x8aa0a0, eye: 0x6ad0ff, bell: 1 },
  monkw: { body: 0x2a3a3a, robe: 1, leg: 0x1a2a2a, arm: 0x2a3a3a, hood: 0x1a2828, skinC: 0x7a9090, eye: 0x6ad0ff, censer: 1, scale: 1.45 },
  ashknight: { body: 0x4a4448, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x5a5458, plume: 0x6a2a1a, eye: 0xff6a20, sword: 1, cape: 0x2a2224 },
  xbow: { body: 0x4a4448, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x5a5458, plume: 0, eye: 0xff6a20, xbow: 1 },
  ashshield: { body: 0x4a4448, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x5a5458, plume: 0, eye: 0xff6a20, sword: 1, shield: 1, shieldC: 0x3a3436 },
  royal: { body: 0x3a2e2a, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x6a5a40, plume: 0xc04a10, eye: 0xff6a20, great: 0x8a8a96, cape: 0x5a1a12, horns: 1, scale: 1.45 }
};
function makeWolf(big) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const fur = M(0x6a6470), dk = M(0x4a4450);
  box(0.9, 0.8, 1.9, fur, 0, 1.15, 0, body); box(0.8, 0.5, 0.6, dk, 0, 1.55, -0.5, body);
  const head = new THREE.Group(); head.position.set(0, 1.45, 1.1); body.add(head);
  box(0.7, 0.6, 0.7, fur, 0, 0, 0, head); box(0.4, 0.3, 0.55, dk, 0, -0.1, 0.5, head);
  for (const sx of [-1, 1]) { cone(0.12, 0.35, 4, dk, sx * 0.22, 0.42, -0.1, head); box(0.1, 0.08, 0.05, M(0xffa040, { e: 0xff7a20, ei: 5 }), sx * 0.18, 0.1, 0.36, head); }
  const tail = box(0.18, 0.18, 0.9, dk, 0, 1.4, -1.25, body); tail.rotation.x = 0.6;
  const legL = new THREE.Group(), legR = new THREE.Group(); body.add(legL, legR); legL.position.set(0, 0.9, 0.6); legR.position.set(0, 0.9, -0.6);
  for (const L of [legL, legR]) for (const sx of [-1, 1]) box(0.22, 0.9, 0.22, dk, sx * 0.32, -0.45, 0, L);
  const armR = new THREE.Group(), armL = new THREE.Group(); head.add(armR); body.add(armL);
  if (big) g.scale.setScalar(1.6);
  g.userData = { body, legL, legR, armL, armR, head, kind: 'wolf' };
  return g;
}
const makeFoe = toonify(makeFoe_);
function makeFoe_(k) {
  const f = (FOES[chapterIndex()] || FOES[0])[k] || {}, sk = f.skin || 'skel';
  if (sk === 'wolf') return makeWolf(k === 'elite');
  if (FIG[sk]) { const g = makeFigure(FIG[sk]); g.userData.kind = 'skel'; return g; }
  return makeSkel(k);
}
// 보스 모습
const BOSSFIG = {
  hunter: { body: 0x5a7a3a, leg: 0x3a4a2a, arm: 0x5a7a3a, hood: 0x4a5a2e, antler: 1, spear: 1, cape: 0x2a3a1a, eye: 0xffa040, skinC: 0x9a8a7a, scale: 2.0, belt: 1 },
  bishop: { body: 0x2a3a5a, robe: 1, leg: 0x1a2a3a, arm: 0x2a3a5a, skinC: 0x7a9aa0, eye: 0x6ad0ff, mitre: 1, staff: 1, staffC: 0x6ab0ff, noLight: 1, cape: 0x1a2848, scale: 2.1 },
  king: { body: 0x3a3436, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x4a4448, plume: 0, crown: 1, eye: 0xff6a20, great: 0x5a5a66, greatE: 0xff5a10, cape: 0x6a1a12, scale: 2.2 }
};
const makeBossOf = toonify(makeBossOf_);
function makeBossOf_(ai) {
  if (!BOSSFIG[ai]) return makeBoss();
  const g = makeFigure(BOSSFIG[ai]); const col = ai === 'hunter' ? 0xffa040 : ai === 'bishop' ? 0x6ab0ff : 0xff6a20;
  const light = new THREE.PointLight(col, 18, 10, 1.6); light.position.set(0, 3, 1); g.userData.body.add(light); g.userData.light = light; g.userData.kind = 'boss';
  return g;
}
export const makeSkel = toonify(makeSkel_);
function makeSkel_(k) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const bm = bone();
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.25, 1.15, 0); legR.position.set(0.25, 1.15, 0); body.add(legL, legR);
  cyl(0.09, 0.09, 1.1, 5, bm, 0, -0.55, 0, legL); cyl(0.09, 0.09, 1.1, 5, bm, 0, -0.55, 0, legR);
  const pel = mesh(geo('pel', () => new THREE.TorusGeometry(0.3, 0.08, 4, 8)), bm, 0, 1.2, 0, body); pel.rotation.x = Math.PI / 2;
  cyl(0.08, 0.08, 1, 5, bm, 0, 1.7, 0, body);
  for (let i = 0; i < 4; i++) { const rb = mesh(geo('rib' + i, () => new THREE.TorusGeometry(0.38 - i * 0.04, 0.05, 4, 10, Math.PI * 1.4)), bm, 0, 1.55 + i * 0.22, 0.05, body); rb.rotation.set(Math.PI / 2, 0, Math.PI * 0.8); }
  const head = new THREE.Group(); head.position.set(0, 2.6, 0.05); body.add(head);
  sph(0.42, 8, 7, bm, 0, 0, 0, head); box(0.35, 0.2, 0.3, bm, 0, -0.3, 0.15, head);
  const eyeM = M(0xff2a2a, { e: 0xff2020, ei: 5 }); sph(0.09, 5, 4, eyeM, -0.15, 0.02, 0.33, head); sph(0.09, 5, 4, eyeM, 0.15, 0.02, 0.33, head);
  const armR = new THREE.Group(); armR.position.set(0.5, 2.1, 0); body.add(armR); cyl(0.07, 0.07, 1.1, 5, bm, 0, -0.5, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.5, 2.1, 0); body.add(armL); cyl(0.07, 0.07, 1.1, 5, bm, 0, -0.5, 0, armL); armL.rotation.x = -0.7;
  if (k === 'archer') {
    const bw = mesh(geo('bow', () => new THREE.TorusGeometry(0.95, 0.06, 4, 12, Math.PI)), M(0x5a4a3a), 0, -1, 0.3, armL); bw.rotation.set(0, Math.PI / 2, Math.PI / 2);
  } else {
    const bl = new THREE.Group(); bl.position.set(0, -1.05, 0.05); armR.add(bl); box(0.12, 1.6, 0.04, M(0x8a8a96, { m: 0.7, r: 0.5 }), 0, 0.8, 0, bl); box(0.4, 0.08, 0.1, M(0x5a4a3a), 0, 0.05, 0, bl); bl.rotation.x = Math.PI / 2;
  }
  if (k === 'shield') { const s = mesh(geo('kite', () => new THREE.BoxGeometry(1.4, 1.8, 0.18)), M(0x5a4a3a), -0.1, -0.9, 0.45, armL); s.rotation.x = 0.7; box(1.5, 0.16, 0.2, dmetal(), -0.1, -0.5, 0.75, armL).rotation.x = 0.7; }
  if (k === 'elite') {
    g.scale.setScalar(1.45);
    cyl(0.5, 0.6, 0.9, 8, M(0x3a3446, { m: 0.75, r: 0.4 }), 0, 1.75, 0, body); cone(0.5, 0.6, 8, M(0x3a3446, { m: 0.75, r: 0.4 }), 0, 0.55, 0, head);
    const cp = mesh(geo('cape', () => new THREE.PlaneGeometry(1.2, 2, 1, 3)), M(0x5a1a22, { ds: true }), 0, 1.6, -0.5, body); cp.rotation.x = 0.15;
  }
  g.userData = { body, legL, legR, armL, armR, head, kind: 'skel' };
  return g;
}
export const makeBoss = toonify(makeBoss_);
function makeBoss_() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.scale.setScalar(2.1);
  const bA = M(0x3a3446, { m: 0.75, r: 0.4 }), bA2 = M(0x5a5268, { m: 0.75, r: 0.35 }), cloth = M(0x5a1a22);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.28, 0.9, 0); legR.position.set(0.28, 0.9, 0); body.add(legL, legR);
  cap(0.24, 0.7, bA, 0, -0.35, 0, legL); cap(0.24, 0.7, bA, 0, -0.35, 0, legR);
  cyl(0.55, 0.7, 1.4, 8, cloth, 0, 1.4, 0, body); sph(0.7, 8, 6, bA, 0, 2.15, 0, body).scale.set(1.1, 0.8, 0.85);
  for (const sx of [-1, 1]) { sph(0.42, 8, 6, bA2, sx * 0.82, 2.45, 0, body, 1.7); cone(0.12, 0.5, 5, bA2, sx * 0.95, 2.85, 0, body); }
  const head = new THREE.Group(); head.position.y = 3.05; body.add(head); cyl(0.45, 0.48, 0.85, 8, bA, 0, 0, 0, head); cone(0.48, 0.5, 8, bA, 0, 0.68, 0, head);
  for (const sx of [-1, 1]) { const hn = cone(0.12, 0.9, 5, M(0xcfc6b0), sx * 0.5, 0.45, 0, head); hn.rotation.z = -sx * 0.9; }
  const eyeM = M(0xff2020, { e: 0xff1010, ei: 8 }); sph(0.08, 5, 4, eyeM, -0.15, 0.05, 0.45, head); sph(0.08, 5, 4, eyeM, 0.15, 0.05, 0.45, head);
  const light = new THREE.PointLight(0xff2a2a, 18, 10, 1.6); light.position.set(0, 3, 1); body.add(light);
  const cp = mesh(geo('bcape', () => new THREE.PlaneGeometry(1.8, 2.6, 2, 4)), M(0x3a0e14, { ds: true }), 0, 1.6, -0.65, body); cp.rotation.x = 0.12;
  // 3단계: 망토가 찢기고 등 갑옷의 붉은 균열이 드러나요
  // 등에는 큰 균열, 앞과 어깨에는 작은 금이 보여요 (화면에서도 보이게)
  const crack = new THREE.Group(); body.add(crack); crack.visible = false; const ckM = M(0xffb060, { e: 0xff4a10, ei: 6, uniq: true });
  const back = new THREE.Group(); back.position.set(0, 2.0, -0.62); crack.add(back);
  for (const [x, y, h, r] of [[0, 0.3, 0.9, 0.2], [-0.18, -0.25, 0.6, -0.5], [0.2, -0.3, 0.7, 0.6], [-0.05, 0.75, 0.4, -0.3], [0.3, 0.35, 0.35, 1.1], [-0.32, 0.2, 0.3, -1.2]]) { const q = box(0.12, h, 0.08, ckM, x, y, 0, back); q.rotation.z = r; q.castShadow = false; }
  for (const [x, y, z, h, r] of [[0.25, 2.2, 0.6, 0.5, 0.5], [-0.2, 1.9, 0.62, 0.4, -0.7], [0.82, 2.75, 0.1, 0.35, 1.2], [-0.82, 2.75, 0.1, 0.35, -1.2], [0, 1.55, 0.66, 0.3, 0]]) { const q = box(0.08, h, 0.08, ckM, x, y, z, crack); q.rotation.z = r; q.castShadow = false; }
  const ckL = new THREE.PointLight(0xff5a20, 0, 7, 1.6); ckL.position.set(0, 2, -1.4); body.add(ckL);
  const armR = new THREE.Group(); armR.position.set(0.95, 2.3, 0); body.add(armR); cap(0.2, 0.7, bA2, 0, -0.45, 0, armR);
  const gs = new THREE.Group(); gs.position.set(0, -0.9, 0.2); armR.add(gs); gs.rotation.x = Math.PI / 2;
  box(0.22, 3.2, 0.06, M(0x7a7f90, { m: 0.9, r: 0.3 }), 0, 1.8, 0, gs); box(0.9, 0.14, 0.16, bA2, 0, 0.15, 0, gs); box(0.12, 0.6, 0.12, leather(), 0, -0.2, 0, gs);
  sph(0.2, 6, 5, M(0xff3a3a, { e: 0xff1a1a, ei: 3 }), 0, 0.15, 0.1, gs);
  const armL = new THREE.Group(); armL.position.set(-0.95, 2.3, 0); body.add(armL); cap(0.2, 0.7, bA2, 0, -0.45, 0, armL); armL.rotation.x = -0.5;
  g.userData = { body, legL, legR, armL, armR, head, kind: 'boss', light, cape: cp, crack, ckM, ckL };
  return g;
}

/* ---------- 장면 ---------- */
export class View {
  constructor(canvas) {
    this.canvas = canvas;
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = THREE.PCFShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.0;
    this.ps = 3; this.bloomOn = true; this.shake = 0; this.shakeOn = true;
    this.cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
    this.camT = new THREE.Vector3(); this.zoom = 9.6;
    this.ents = new Map(); this.fx = []; this.nums = [];
    this.scene = null; this.mode = '';
    this.resize();
  }
  resize() {
    // 화면 픽셀 칸이 고르게 나오도록 캔버스를 기기 픽셀 단위로, 픽셀 크기의 배수로 맞춰요 (지글거림 방지)
    const dpr = devicePixelRatio || 1, P = Math.max(1, Math.round(this.ps * dpr)); this.P = P;
    const w = Math.ceil(innerWidth * dpr / P) * P, h = Math.ceil(innerHeight * dpr / P) * P; this.W = w; this.H = h;
    this.r.setPixelRatio(1); this.r.setSize(w, h, false);
    this.cw = w / dpr; this.ch = h / dpr; this.r.domElement.style.width = (w / dpr) + 'px'; this.r.domElement.style.height = (h / dpr) + 'px';
    const asp = w / h, vs = this.mode === 'lobby' ? 7.6 : this.zoom * (asp < 1 ? 1.35 : 1);
    this.cam.left = -vs * asp; this.cam.right = vs * asp; this.cam.top = vs; this.cam.bottom = -vs; this.cam.updateProjectionMatrix();
    if (this.comp) this.comp.setSize(w, h);
    if (this.pp) this.pp.setPixelSize(P);
  }
  setPixel(ps) { this.ps = ps; this.resize(); }
  setBloom(on) { this.bloomOn = on; if (this.bloom) this.bloom.enabled = on; }
  newScene(bg, fog) {
    if (this.scene) this.scene.traverse(o => { if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); });
    const s = new THREE.Scene(); s.background = new THREE.Color(bg); s.fog = new THREE.Fog(fog, 45, 90);
    this.scene = s; this.ents.clear(); this.fx = []; this.nums = [];
    // 기술 번쩍임용 빛 하나 (빛 개수가 바뀌면 셰이더를 다시 만들어서 미리 넣어 둬요)
    this.fxL = new THREE.PointLight(0xffffff, 0, 16, 1.6); this.fxL.position.set(0, -50, 0); s.add(this.fxL); this.fxLI = 0;
    this.comp = new EffectComposer(this.r); this.pp = new RenderPixelatedPass(this.P, s, this.cam, { normalEdgeStrength: 0.2, depthEdgeStrength: 0.4 });
    this.comp.addPass(this.pp); this.bloom = new UnrealBloomPass(new THREE.Vector2(this.W / this.P, this.H / this.P), 0.26, 0.2, 0.9); this.bloom.enabled = this.bloomOn; this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
    this.comp.setSize(this.W, this.H);
    return s;
  }
  lights(s, amb = 1.3, T) {
    s.add(new THREE.AmbientLight(T ? T.amb : 0x4a4a78, amb)); s.add(new THREE.HemisphereLight(T ? T.hemi : 0x8a90c8, 0x2a1e18, 0.9));
    const fill = new THREE.DirectionalLight(0xffc89a, 0.9); fill.position.set(0, 12, 30); s.add(fill);
    const moon = this.moon = new THREE.DirectionalLight(0x6a78c0, 0.7); moon.position.set(-10, 30, 12); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); s.add(moon); s.add(moon.target);
  }
  flame(p, x, y, z, k = 1, light = true, col) {
    cone(0.32 * k, 0.9 * k, 6, col && col !== 0xff9a48 ? M(col, { e: col, ei: 3 }) : M(0xff9a3a, { e: 0xff7a20, ei: 3 }), x, y, z, p);
    cone(0.18 * k, 0.6 * k, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), x, y - 0.1 * k, z, p);
    if (light) { const L = new THREE.PointLight(0xff9a48, 55 * k, 24, 1.6); L.position.set(x, y + 0.4, z + 0.8); p.add(L); this.flick.push({ L, b: 55 * k, ph: R() * 9 }); }
  }

  /* ----- 로비: 밤의 성 안뜰 모닥불 ----- */
  buildLobby() {
    this.mode = 'lobby'; this.pool = null; this.trapM = null; const s = this.newScene(0x0e1024, 0x12142a); this.flick = []; this.lights(s);
    const cob = [0x4a4550, 0x534d5a, 0x5c5664, 0x45404c];
    instBoxes(s, (add) => { for (let x = -24; x <= 24; x += 1.4) for (let z = -12; z <= 24; z += 1.4) { const h = 0.25 + R() * 0.1; add(x + (R() - .5) * 0.15, h / 2 - 0.25, z + (R() - .5) * 0.15, 1.36, h, 1.36, cob[R() * 4 | 0]); } });
    const brick = [0x3e3846, 0x463f50, 0x4e4658, 0x38323f];
    instBoxes(s, (add) => {
      for (let y = 0; y < 9; y++) for (let x = -26; x <= 26; x += 2.2) { if (Math.abs(x) < 3.5 && y < 6) continue; add(x + (y % 2 ? 1.1 : 0), y + 0.45, -12, 2.1, 0.95, 1.6, brick[R() * 4 | 0]); }
      for (let x = -26; x <= 26; x += 2.2) add(x, 9.6, -12, 1.2, 1.3, 1.8, 0x5c5468);
    });
    box(7, 6, 0.3, M(0x1a1018, { e: 0x401808, ei: 1 }), 0, 3, -12.2, s);
    const tent = (x, z, c, rot) => { const t = cone(3.2, 4.2, 4, M(c), x, 2.1, z, s); t.rotation.y = rot; cyl(0.08, 0.08, 5.4, 5, leather(), x, 2.7, z, s); box(0.1, 0.8, 1.2, gold(), x, 5.6, z + 0.6, s); };
    tent(-10, -3, 0x2c4f9e, 0.6); tent(-14.5, 2.5, 0xd8d0bc, 0.9);
    for (let i = 0; i < 4; i++) { const sp = box(0.1, 3.4, 0.1, M(0x8a8f9c, { m: 0.8, r: 0.3 }), 8 + i * 0.7, 1.7, -1.5, s); sp.rotation.z = 0.12; }
    box(3.4, 0.2, 0.3, leather(), 9, 0.9, -1.5, s); box(3.4, 0.2, 0.3, leather(), 9, 2.6, -1.5, s);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mesh(geo('dod', () => new THREE.DodecahedronGeometry(0.35)), M(0x5a5462), Math.cos(a) * 1.1, 0.15, 2 + Math.sin(a) * 1.1, s); }
    for (let i = 0; i < 4; i++) { const l = cyl(0.15, 0.15, 1.8, 6, M(0x4a3020), 0, 0.3, 2, s); l.rotation.set(Math.PI / 2.3, i * 0.8, 0); }
    this.fireG = new THREE.Group(); this.fireG.position.set(0, 0.9, 2); s.add(this.fireG);
    for (let i = 0; i < 7; i++) cone(0.35 + R() * 0.2, 1.2 + R() * 0.9, 6, M(0xff8a2a, { e: 0xff6a10, ei: 3 }), (R() - .5) * 0.7, 0.1, (R() - .5) * 0.7, this.fireG);
    cone(0.3, 1.1, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), 0, 0, 0, this.fireG);
    const cf = new THREE.PointLight(0xff9040, 60, 26, 1.5); cf.position.set(0, 2.5, 2); cf.castShadow = true; cf.shadow.mapSize.set(512, 512); s.add(cf); this.flick.push({ L: cf, b: 60, ph: 0 });
    box(3, 0.6, 0.7, M(0x5a3a22), -3.6, 0.3, 4.6, s).rotation.y = 0.5; box(3, 0.6, 0.7, M(0x5a3a22), 3.4, 0.3, 4.8, s).rotation.y = -0.5;
    for (const tx of [-5, 5]) { box(0.3, 1, 0.3, M(0x4a3020), tx, 4, -11, s); this.flame(s, tx, 5, -11, 1); }
    for (let i = 0; i < 80; i++) box(0.12, 0.12, 0.12, M(0xffffff, { e: 0xdfe6ff, ei: 2 }), (R() - .5) * 70, 14 + R() * 10, -30, s);
    sph(2, 12, 10, M(0xffffff, { e: 0xe8ecff, ei: 2 }), -20, 22, -30, s);
    const poses = [['knight', -3.8, 4.6, 2.4], ['archer', 3.8, 4.8, -2.5], ['priest', -2.6, -1.2, 0.6], ['squire', 2.8, -0.8, -0.7]];
    this.lobbyHeroes = poses.map(([r, x, z, ry]) => { const h = makeHero(r); h.position.set(x, 0, z); h.rotation.y = ry; s.add(h); return h; });
    this.embers = []; for (let i = 0; i < 18; i++) { const e = box(0.14, 0.14, 0.14, M(0xffb050, { e: 0xff8a30, ei: 5 }), 0, 0, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 3 }); }
    this.resize();
    this.cam.position.set(-1.5, 13, 30); this.cam.lookAt(-1.5, 3.0, 1.5);
  }

  /* ----- 1장 지하 지도 (한 번만 만들어요) ----- */
  buildMap() {
    this.mode = 'map';
    const T = THEME();
    const s = this.newScene(T.bg, T.fog); s.fog = new THREE.Fog(T.fog, 52, 95); this.flick = []; this.lights(s, 1.25, T);
    seed = 31 + chapterIndex() * 7;
    const stone = T.floor, bstone = T.bfloor, wet = T.wet, brick = T.wall, bbrick = T.bwall;
    const bossA = MAP.areas.findIndex(a => a.boss), inBoss = (i, j) => MAP.areas[bossA].r.some(([x, y, w, h]) => i >= x && i < x + w && j >= y && j < y + h);
    const torches = [];
    instBoxes(s, (add) => {
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (!floorCell(i, j)) continue;
        const x = cw(i), z = cw(j), h = 0.3 + R() * 0.1, wt = WATER[j * MW + i], cols = wt ? wet : inBoss(i, j) ? bstone : stone;
        if (T.trees) add(x, h / 2 - 0.3 - (wt ? 0.15 : 0) + (R() - .5) * 0.08, z, 2.02, h, 2.02, cols[R() * cols.length | 0]); // 숲 바닥은 틈 없이 흙과 풀
        else add(x + (R() - .5) * 0.06, h / 2 - 0.3 - (wt ? 0.15 : 0), z + (R() - .5) * 0.06, 1.94, h, 1.94, cols[R() * cols.length | 0]);
        if (!wt && R() < T.mossP) add(x + (R() - .5) * 1.2, 0.04, z + (R() - .5) * 1.2, 0.6, 0.08, 0.5, T.moss);
      }
    });
    // 벽: 방 뒤쪽(북쪽) 벽은 높게, 앞쪽·옆 벽은 낮게 해서 캐릭터가 가려지지 않게 해요
    instBoxes(s, (add) => {
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (floorCell(i, j)) continue;
        let nb = false; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (floorCell(i + di, j + dj)) nb = true;
        if (!nb) continue;
        const x = cw(i), z = cw(j), bc = inBoss(i, j + 1) || inBoss(i, j - 1) ? bbrick : brick;
        const back = floorCell(i, j + 1) && !floorCell(i, j - 1);
        const rows = back ? 6 : floorCell(i, j - 1) && !floorCell(i, j + 1) ? 1 : 3;
        if (T.trees) {
          // 숲: 벽돌 대신 나무줄기와 덤불이 빽빽한 숲 가장자리
          const leaf = [0x2e3a26, 0x36402a, 0x3a4430, 0x2a3422], trunk = [0x3a2a1c, 0x44301e, 0x2e2216];
          if (back) { for (let k = 0; k < 2; k++) add(x + (R() - .5) * 1.4, 2.2, z + (R() - .5) * 0.8, 0.45 + R() * 0.2, 4.4, 0.45 + R() * 0.2, trunk[R() * 3 | 0]); for (let k = 0; k < 3; k++) add(x + (R() - .5) * 0.8, 4.3 + k * 0.8 + R() * 0.4, z + (R() - .5) * 0.6, 2.4 - k * 0.4, 1, 2.4 - k * 0.4, leaf[R() * 4 | 0]); }
          add(x + (R() - .5) * 0.3, rows * 0.35 + 0.1, z, 2.1, rows * 0.7 + 0.2, 2.1, leaf[R() * 4 | 0]); add(x + (R() - .5) * 0.6, rows * 0.7 + 0.35, z + (R() - .5) * 0.4, 1.3, 0.6, 1.3, leaf[R() * 4 | 0]);
        } else {
          for (let y = 0; y < rows; y++) { const off = (y + j) % 2 ? 0.5 : 0; add(x - 0.5 + off, y + 0.45, z, 1.02, 0.95, 1.9, bc[R() * 4 | 0]); add(x + 0.5 + off - (off ? 1 : 0), y + 0.45, z, 1.02, 0.95, 1.9, bc[R() * 4 | 0]); }
          add(x, rows + 0.12, z, 2.02, 0.24, 2.02, T.top);
        }
        if (back && i % 3 === 0 && !(i % 6 === 0 && R() < 0.3)) torches.push([x, z + 1.0]);
        if (back && T.banner && i % 6 === 3 && R() < 0.5) this.banner(s, x, z + 1.02, bc === bbrick, T.banner);
        // 수도원: 푸른 창
        if (T.windows && back && i % 4 === 2) { add(x, 3.2, z + 0.98, 0.9, 2.2, 0.06, 0x6ab0ff); }
      }
    });
    this.torchPos = torches;
    for (const [x, z] of torches) { box(0.3, T.trees ? 4.6 : 1, 0.3, M(0x4a3020), x, T.trees ? 2.3 : 4, z, s); box(0.6, 0.25, 0.6, M(0x2a2830, { m: 0.7 }), x, 4.5, z, s); this.flame(s, x, 5.05, z, 1, false, T.torch); }
    // 횃불 빛은 가까운 곳에만 몇 개 켜요 (빛이 너무 많으면 느려져요)
    this.pool = []; for (let k = 0; k < 8; k++) { const L = new THREE.PointLight(T.torch, 0, 22, 1.6); s.add(L); this.pool.push(L); this.flick.push({ L, b: 0, ph: k * 1.3, pool: true }); }
    this.poolT = 0;
    // 물
    for (const [x, y, w, h] of MAP.water) { const wm = mesh(new THREE.PlaneGeometry(w * CS, h * CS), M(T.water, { e: 0x0a2040, ei: 0.6, op: 0.35, r: 0.2, m: 0.3 }), (x + w / 2) * CS, 0.02, (y + h / 2) * CS, s, false); wm.rotation.x = -Math.PI / 2; wm.receiveShadow = true; }
    // 기둥
    for (const p of PILLARS) {
      if (T.trees) { cyl(0.8, 1.1, 4, 7, M(0x3a2a1c), p.x, 2, p.z, s); cone(2.4, 3, 6, M(0x2e3a26), p.x, 5, p.z, s); cone(1.8, 2.4, 6, M(0x3a4430), p.x, 6.4, p.z, s); continue; }
      box(2.4, 0.6, 2.4, M(0x5c5468), p.x, 0.3, p.z, s); instBoxes(s, add => { for (let y = 0.6; y < 6; y += 1.1) add(p.x, y + 0.5, p.z, 1.9, 1.05, 1.9, brick[R() * 4 | 0]); }); box(2.5, 0.5, 2.5, M(0x5c5468), p.x, 6.4, p.z, s);
    }
    // 구석 장식
    const barrel = (x, z) => { cyl(0.75, 0.75, 1.6, 10, M(0x6a4628), x, 0.8, z, s); cyl(0.8, 0.8, 0.12, 10, dmetal(), x, 0.3, z, s); cyl(0.8, 0.8, 0.12, 10, dmetal(), x, 1.3, z, s); };
    const rock = (x, z, k) => { const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M([0x4a4a44, 0x55534c, 0x3e3e3a][k % 3]), x, 0.4, z, s); r.scale.set(1 + (k % 2) * 0.5, 0.7, 1); r.rotation.y = k; };
    const decor = { forest: (a, ai, x, y, w, h) => { for (let k = 0; k < 4; k++) rock(cw(x + 1 + R() * (w - 2)), cw(y + 1 + R() * (h - 2)), ai + k); cyl(0.7, 0.8, 0.7, 7, M(0x5a4228), cw(x + w - 1), 0.35, cw(y), s); for (let k = 0; k < 3; k++) { const mx = cw(x + 1 + R() * (w - 2)), mz = cw(y + 1 + R() * (h - 2)); cyl(0.06, 0.08, 0.3, 4, M(0xd8d0bc), mx, 0.15, mz, s); sph(0.22, 6, 4, M(0xd06a3a, { e: 0x6a2a10, ei: 1 }), mx, 0.34, mz, s, 1.6); } },
      abbey: (a, ai, x, y, w, h) => { for (let k = 0; k < 2; k++) { const bz = cw(y + 2 + k * 2); box(3.4, 0.5, 0.8, M(0x4a3626), cw(x + 3), 0.5, bz, s); box(3.4, 0.9, 0.15, M(0x4a3626), cw(x + 3), 0.9, bz - 0.4, s); } for (let k = 0; k < 3; k++) { const cx = cw(x + w - 2) + (k - 1) * 0.6; cyl(0.08, 0.08, 0.6 + k * 0.2, 5, M(0xe8e0c8), cx, 0.3 + k * 0.1, cw(y), s); this.flame(s, cx, 0.75 + k * 0.2, cw(y), 0.35, false); } },
      tower: (a, ai, x, y, w, h) => { const bx = cw(x + 1), bz = cw(y); cyl(0.6, 0.4, 1.2, 6, dmetal(), bx, 0.6, bz, s); this.flame(s, bx, 1.5, bz, 0.9, false, T.torch); box(2.4, 2, 0.3, M(0x4a3020), cw(x + w - 2), 1, cw(y), s); for (let k = 0; k < 3; k++) box(0.1, 1.8, 0.1, metal(), cw(x + w - 2) - 0.7 + k * 0.7, 1.4, cw(y) + 0.25, s); }
    }[CH.theme];
    MAP.areas.forEach((a, ai) => { const [x, y, w, h] = a.r[0]; if (a.boss) return; if (decor) { decor(a, ai, x, y, w, h); return; } barrel(cw(x), cw(y) + 0.2); if (w > 6) barrel(cw(x) + 1.7, cw(y)); box(1.8, 1.6, 1.8, M(0x6a4628), cw(x + w - 1), 0.8, cw(y), s).rotation.y = 0.3 + ai; for (let k = 0; k < 3; k++) { const bx = cw(x + 1 + R() * (w - 2)), bz = cw(y + 1 + R() * (h - 2)); const b = box(1.2, 0.15, 0.15, bone(), bx, 0.12, bz, s); b.rotation.y = R() * 3; sph(0.35, 8, 6, bone(), bx + 0.8, 0.25, bz + 0.3, s); } });
    // 보스 방 바닥 문양
    { const ring = mesh(geo('bring', () => new THREE.TorusGeometry(6, 0.08, 4, 48)), M(T.ring, { e: T.ring, ei: 2 }), cw(MAP.boss[0]), 0.12, cw(MAP.boss[1]) + 3, s); ring.rotation.x = Math.PI / 2; ring.castShadow = false; }
    // 모닥불
    this.fires = MAP.fires.map(([fx, fy]) => {
      const x = cw(fx), z = cw(fy); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mesh(geo('dod', () => new THREE.DodecahedronGeometry(0.35)), M(0x5a5462), x + Math.cos(a) * 1.1, 0.15, z + Math.sin(a) * 1.1, s); }
      for (let i = 0; i < 4; i++) { const l = cyl(0.15, 0.15, 1.8, 6, M(0x2a1a12), x, 0.3, z, s); l.rotation.set(Math.PI / 2.3, i * 0.8, 0); }
      const g = new THREE.Group(); g.position.set(x, 0.9, z); s.add(g); g.visible = false;
      for (let i = 0; i < 6; i++) cone(0.35 + R() * 0.2, 1.2 + R() * 0.9, 6, M(0xff8a2a, { e: 0xff6a10, ei: 3 }), (R() - .5) * 0.7, 0.1, (R() - .5) * 0.7, g);
      const L = new THREE.PointLight(0xff9040, 0, 22, 1.5); L.position.set(x, 2.5, z); s.add(L);
      const ring = mesh(geo('hring', () => new THREE.RingGeometry(3.8, 4, 40)), M(0x9af0a8, { e: 0x6ad080, ei: 1, op: 0.35 }), x, 0.14, z, s, false); ring.rotation.x = -Math.PI / 2; ring.visible = false;
      return { g, L, ring, lit: false };
    });
    // 축복 제단
    this.altars = MAP.altars.map(([ax, ay]) => {
      const x = cw(ax), z = cw(ay); cyl(0.9, 1.1, 0.5, 8, M(0x6a6276), x, 0.25, z, s); cyl(0.5, 0.6, 1.2, 8, M(0x7a7286), x, 1.1, z, s);
      const c = mesh(geo('oct2', () => new THREE.OctahedronGeometry(0.45)), M(0xfff0b0, { e: 0xffd060, ei: 3, uniq: true }), x, 2.3, z, s);
      const L = new THREE.PointLight(0xffd070, 18, 9, 1.6); L.position.set(x, 2.6, z); s.add(L);
      return { c, L, used: false };
    });
    // 상자
    this.chests = MAP.chests.map(([cx, cy]) => {
      const ch = new THREE.Group(); ch.position.set(cw(cx), 0, cw(cy)); ch.rotation.y = -0.3; s.add(ch); box(2, 1.1, 1.3, M(0x6a4628), 0, 0.55, 0, ch);
      const lid = new THREE.Group(); lid.position.set(0, 1.1, -0.65); ch.add(lid); const lidM = cyl(0.65, 0.65, 2, 10, M(0x6a4628), 0, 0, 0.65, lid); lidM.rotation.z = Math.PI / 2; box(2.05, 0.15, 1.35, gold(), 0, -0.2, 0.65, lid);
      box(0.3, 0.4, 0.1, gold(), 0, 0.9, 0.7, ch); return { lid };
    });
    // 바닥 함정
    this.trapM = MAP.traps.map(([tx, ty]) => {
      const g = new THREE.Group(); g.position.set(cw(tx), 0, cw(ty)); s.add(g); box(1.8, 0.1, 1.8, M(0x2e2a32), 0, 0.02, 0, g);
      const sp = new THREE.Group(); g.add(sp); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) cone(0.15, 0.8, 4, M(0x9a9aa6, { m: 0.8, r: 0.4 }), i * 0.5, 0.3, j * 0.5, sp);
      sp.position.y = -0.8; return { g, sp };
    });
    // 공중에 떠다니는 것: 숲은 반딧불이, 그 밖은 불씨와 먼지
    this.embers = []; const ff = CH.theme === 'forest';
    for (let i = 0; i < 18; i++) { const e = box(0.15, 0.15, 0.15, M(T.ember[0], { e: T.ember[1], ei: ff ? 1 : 5 }), 0, -5, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 6, x: (R() - .5) * 40, z: (R() - .5) * 30 }); }
    const fly = ff ? [0xd8ff8a, 0xb0ff6a] : CH.theme === 'abbey' ? [0x9ad0ff, 0x6aa0e0] : [0xffd08a, 0xffa040];
    for (let i = 0; i < 26; i++) { const e = box(0.12, 0.12, 0.12, M(fly[0], { e: fly[1], ei: 6, uniq: true }), 0, -5, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 9, x: (R() - .5) * 44, z: (R() - .5) * 32, fly: 1, ph: R() * 6.28, h: 0.8 + R() * 3 }); }
    this.camT.set(cw(MAP.start[0]), 0, cw(MAP.start[1])); this.camInit = false;
    this.resize();
  }
  banner(s, x, z, dark, col = 0x7a1f22) {
    const g = new THREE.Group(); g.position.set(x, 5.4, z); s.add(g); box(2.2, 0.16, 0.16, M(0x8a6a30, { m: 0.6 }), 0, 0.1, 0, g);
    box(1.8, 3.6, 0.08, M(dark ? 0x3a0e14 : col), 0, -1.8, 0.05, g); box(0.7, 1.4, 0.1, gold(), 0, -1.9, 0.12, g);
  }

  /* ----- 스냅숏을 장면에 반영 ----- */
  sync(S, me, dt, t, exact) {
    const s = this.scene; if (!s) return;
    const seen = new Set();
    // 플레이어
    for (const p of S.pl) {
      const key = 'p' + p.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { const m = makeHero(p.role); s.add(m); E = { m, x: p.x, z: p.z, a: p.a, ph: 0 }; this.ents.set(key, E); E.ring = ringMesh(s, ROLES[p.role].color); E.ward = sph(1.3, 12, 10, M(0x9af0e0, { e: 0x6ad0c0, ei: 0.5, op: 0.08, uniq: true }), 0, 1.5, 0, m); E.ward.castShadow = false; }
      const k = exact || p.id === me ? 1 : Math.min(1, dt * 12);
      E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k; E.a = lerpA(E.a, p.a, Math.min(1, dt * 18));
      animHero(E, p, dt, t); E.ring.position.set(E.x, 0.12, E.z); E.ring.visible = !p.dd;
      E.ward.visible = p.sh > 0; E.m.visible = !p.dd;
    }
    // 적
    for (const e of S.en) {
      const key = 'e' + e.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { const m = e.k === 'boss' ? makeBossOf(CH.boss.ai) : makeFoe(e.k); s.add(m); E = { m, x: e.x, z: e.z, a: e.a, ph: R() * 6, base: m.scale.x }; this.ents.set(key, E); }
      const k = exact ? 1 : Math.min(1, dt * 12); E.x += (e.x - E.x) * k; E.z += (e.z - E.z) * k; E.a = lerpA(E.a, e.a, Math.min(1, dt * 14));
      animEnemy(E, e, dt, t, this);
    }
    // 투사체
    for (const p of S.pr) {
      const key = 'r' + p.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { E = { m: projMesh(p.k), x: p.x, z: p.z }; s.add(E.m); this.ents.set(key, E); }
      const k = exact ? 1 : Math.min(1, dt * 18); E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k;
      E.m.position.set(E.x, (p.k === 'potion' ? p.y : 0) + 1.6, E.z); E.m.rotation.y = -p.a; if (p.k === 'potion') E.m.rotation.z += dt * 12;
      const TC = { pierce: 0xffe08a, orb: 0x9af0d0, eorb: 0x6ab0ff, ember: 0xff7a20, arrow: 0xe8e0c8, bolt: 0xff8a5a, spear: 0xffb060, earrow: 0xff5a4a }[p.k]; if (TC && (E.tr = (E.tr || 0) - dt) <= 0) { E.tr = 0.03; const big = p.k !== 'arrow' && p.k !== 'earrow'; this.burst(E.x, 1.6, E.z, TC, big ? 3 : 1, 1.2, big ? 0.45 : 0.25, big ? 0.12 : 0.08); }
      // 빛 꼬리: 지나간 자리에 짧게 남는 선
      if (TC) { if (E.lx != null) { const dx = E.x - E.lx, dz = E.z - E.lz, L = Math.hypot(dx, dz); if (L > 0.05) this.tail(E.lx, E.lz, Math.atan2(dz, dx), L, TC, p.k === 'arrow' || p.k === 'earrow' ? 0.12 : 0.24); } E.lx = E.x; E.lz = E.z; }
    }
    // 바닥 효과
    for (const z of S.zn) {
      const key = 'z' + z.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { E = { m: zoneMesh(z) }; s.add(E.m); this.ents.set(key, E); E.m.position.set(z.x, 0.14, z.z); }
      zoneAnim(E, z, t);
    }
    for (const [key, E] of this.ents) if (!seen.has(key)) { s.remove(E.m); if (E.ring) s.remove(E.ring); this.ents.delete(key); }
    // 함정, 상자, 제단, 모닥불
    const W = S.w;
    if (W && this.trapM) {
      this.trapM.forEach((T, k) => { const v = W.tr[k] | 0, on = v & 1, up = v & 2; T.sp.position.y += ((on && up ? 0.1 : -0.8) - T.sp.position.y) * Math.min(1, dt * 18); if (!on) T.sp.visible = false; });
      this.chests.forEach((C, k) => { C.lid.rotation.x += ((W.ch[k] ? -1.6 : 0) - C.lid.rotation.x) * Math.min(1, dt * 6); });
      this.altars.forEach((A, k) => { const u = !!W.al[k]; A.c.position.y = 2.3 + Math.sin(t * 1.6 + k) * 0.12; A.c.rotation.y = t * 0.8; if (u !== A.used) { A.used = u; A.c.material.emissiveIntensity = u ? 0.2 : 3; A.L.intensity = u ? 0 : 18; } });
      this.fires.forEach((F, k) => { const lit = !!W.fi[k]; if (lit !== F.lit) { F.lit = lit; F.g.visible = lit; F.ring.visible = lit; F.L.intensity = lit ? 70 : 0; if (lit) this.flick.push({ L: F.L, b: 70, ph: k }); } if (lit) F.g.children.forEach((c, i) => { c.scale.y = 0.85 + Math.sin(t * 4 + i * 1.7) * 0.12; }); });
    }
    // 카메라: 내 캐릭터를 부드럽게 따라가요
    const mp = this.ents.get('p' + me);
    if (mp) {
      if (!this.camInit) { this.camT.set(mp.x, 0, mp.z); this.camInit = true; }
      let tx = mp.x, tz = mp.z - 1.5, zm = 1;
      if (this.focus) { const F = this.focus; F.t += dt; const u = F.t / F.T, w = u < 0.25 ? u / 0.25 : u > 0.8 ? (1 - u) / 0.2 : 1; if (u >= 1) this.focus = null; else { tx += (F.x - tx) * w * 0.7; tz += (F.z - tz) * w * 0.7; zm = 1 + 0.3 * w; } }
      const k = 1 - Math.exp(-dt * 6); this.camT.x += (tx - this.camT.x) * k; this.camT.z += (tz - this.camT.z) * k;
      if (Math.abs(this.cam.zoom - zm) > 0.002) { this.cam.zoom += (zm - this.cam.zoom) * Math.min(1, dt * 5); this.cam.updateProjectionMatrix(); }
    }
    let sx = 0, sz = 0; if (this.shake > 0 && this.shakeOn) { sx = (Math.random() - .5) * this.shake * 0.6; sz = (Math.random() - .5) * this.shake * 0.6; this.shake = Math.max(0, this.shake - dt * 3); }
    this.cam.position.set(this.camT.x + sx, 22, this.camT.z + 33 + sz); this.cam.lookAt(this.camT.x + sx, 1.8, this.camT.z + 0.4 + sz); this.snapCam();
    if (this.moon) { this.moon.position.set(this.camT.x - 10, 30, this.camT.z + 12); this.moon.target.position.set(this.camT.x, 0, this.camT.z); }
    // 가까운 횃불에만 빛을 켜요
    if (this.pool && (this.poolT -= dt) <= 0) {
      this.poolT = 0.3; const cx = this.camT.x, cz = this.camT.z - 4;
      const near = this.torchPos.map(p => [p, (p[0] - cx) ** 2 + (p[1] - cz) ** 2]).sort((a, b) => a[1] - b[1]).slice(0, this.pool.length);
      this.pool.forEach((L, k) => { const n = near[k]; if (!n) { L.intensity = 0; return; } L.position.set(n[0][0], 5.4, n[0][1] + 0.8); this.flick.find(f => f.L === L).b = 55; });
    }
  }
  tick(dt, t) {
    for (const f of this.flick || []) f.L.intensity = f.b * (0.9 + Math.sin(t * 2.2 + f.ph) * 0.04 + Math.sin(t * 3.7 + f.ph * 2) * 0.02);
    if (this.fireG) { this.fireG.children.forEach((c, i) => { c.scale.y = 0.85 + Math.sin(t * 4 + i * 1.7) * 0.12; }); }
    for (const e of this.embers || []) {
      e.t += dt; if (this.mode === 'lobby') { const u = (e.t % 3) / 3; e.m.position.set(Math.sin(e.t * 2 + e.m.id) * 1.2 * u, 1.5 + u * 7, 2 + Math.cos(e.t * 1.3 + e.m.id) * 1.2 * u); }
      else if (e.fly) { e.m.position.set(this.camT.x + e.x + Math.sin(e.t * 0.4 + e.ph) * 2.5, e.h + Math.sin(e.t * 0.9 + e.ph) * 0.6, this.camT.z + e.z + Math.cos(e.t * 0.3 + e.ph) * 2); e.m.material.emissiveIntensity = 2 + 5 * Math.max(0, Math.sin(e.t * 1.7 + e.ph)); }
      else { const u = (e.t % 6) / 6; e.m.position.set(this.camT.x + e.x + Math.sin(e.t) * 0.5, u * 8, this.camT.z + e.z); }
    }
    if (this.lobbyHeroes) this.lobbyHeroes.forEach((h, i) => { h.userData.body.position.y = Math.sin(t * 1.5 + i) * 0.03; h.userData.head.rotation.y = Math.sin(t * 0.6 + i * 2) * 0.3; });
    if (this.fxL && this.fxLI > 0) { this.fxLI = Math.max(0, this.fxLI - dt * this.fxLI * 5 - dt * 10); this.fxL.intensity = this.fxLI; }
    for (const f of this.fx) { f.t += dt; f.up(f, dt); }
    this.fx = this.fx.filter(f => { if (f.t >= f.T) { this.scene.remove(f.m); return false; } return true; });
  }
  render() { if (this.comp) this.comp.render(); }
  // 카메라를 픽셀 칸에 딱 맞춰 움직여요. 반 칸씩 밀리면 화면 전체가 지글거려요.
  snapCam() {
    const px = (this.cam.top - this.cam.bottom) / this.cam.zoom / (this.H / this.P); this.cam.updateMatrixWorld();
    const up = new THREE.Vector3().setFromMatrixColumn(this.cam.matrixWorld, 1), rt = new THREE.Vector3().setFromMatrixColumn(this.cam.matrixWorld, 0), p = this.cam.position;
    const a = p.dot(rt), b = p.dot(up);
    p.addScaledVector(rt, Math.round(a / px) * px - a).addScaledVector(up, Math.round(b / px) * px - b); this.cam.updateMatrixWorld();
  }

  /* ----- 효과 ----- */
  burst(x, y, z, col, n = 8, sp = 4, life = 0.5, size = 0.12) {
    for (let i = 0; i < n; i++) {
      const m = box(size, size, size, M(col, { e: col, ei: 2 }), x, y, z, this.scene); m.castShadow = false;
      const vx = (Math.random() - .5) * sp, vy = Math.random() * sp, vz = (Math.random() - .5) * sp;
      this.fx.push({ m, t: 0, T: life * (0.6 + Math.random() * 0.6), up: (f, dt) => { m.position.x += vx * dt; m.position.y += (vy - 9 * f.t) * dt; m.position.z += vz * dt; } });
    }
  }
  tail(x, z, a, len, col, w) {
    const m = mesh(geo('tail', () => new THREE.BoxGeometry(1, 0.06, 1)), M(col, { e: col, ei: 3, op: 0.7, uniq: true }), x + Math.cos(a) * len / 2, 1.6, z + Math.sin(a) * len / 2, this.scene, false);
    m.rotation.y = -a; m.scale.set(len + 0.1, 1, w);
    this.fx.push({ m, t: 0, T: 0.22, up: (f) => { const u = f.t / f.T; m.material.opacity = 0.7 * (1 - u); m.scale.z = w * (1 - u); } });
  }
  // 타격: 하얀 별 모양 번쩍임과 불똥, 맞은 적은 잠깐 부풀어요
  spark(x, z, id, big) {
    const E = this.ents.get('e' + id); if (E) { E.pop = big ? 0.14 : 0.1; if (E.base == null) E.base = E.m.scale.x; }
    const g = new THREE.Group(); g.position.set(x, 1.7, z); this.scene.add(g); const mat = M(0xffffff, { e: 0xffffff, ei: 4, op: 0.95, uniq: true });
    for (let i = 0; i < 2; i++) { const b = box(1.2, 0.08, 0.16, mat, 0, 0, 0, g); b.rotation.y = i * Math.PI / 2 + 0.4; b.castShadow = false; }
    this.fx.push({ m: g, t: 0, T: 0.12, up: (f) => { const u = f.t / f.T; g.scale.setScalar((big ? 1.5 : 1) * (0.5 + u)); mat.opacity = 0.95 * (1 - u); } });
    this.burst(x, 1.6, z, big ? 0xffd36b : 0xffe8b0, big ? 9 : 5, 7, 0.3, 0.09);
  }
  // 쓰러질 때 픽셀 조각으로 부서져요
  shatter(x, z, cols, n, big) {
    for (let i = 0; i < n; i++) {
      const c = cols[i % cols.length], sz = (big ? 0.3 : 0.18) * (0.6 + Math.random() * 0.8), m = box(sz, sz, sz, M(c), x + (Math.random() - .5) * 0.8, 0.6 + Math.random() * 2, z + (Math.random() - .5) * 0.8, this.scene); m.castShadow = false;
      const q = Math.random() * 6.283, v = (big ? 9 : 5) * (0.4 + Math.random()), vy = 3 + Math.random() * (big ? 9 : 5), sp = (Math.random() - .5) * 14; let vY = vy, land = false;
      this.fx.push({ m, t: 0, T: 1.1 + Math.random() * 0.5, up: (f, dt) => { if (!land) { m.position.x += Math.cos(q) * v * dt; m.position.z += Math.sin(q) * v * dt; vY -= 22 * dt; m.position.y += vY * dt; m.rotation.x += sp * dt; m.rotation.z += sp * dt; if (m.position.y < 0.1) { m.position.y = 0.1; land = true; } } if (f.t > f.T - 0.3) m.scale.setScalar(Math.max(0.01, (f.T - f.t) / 0.3)); } });
    }
  }
  // 보스 등장: 화면이 보스 쪽으로 다가갔다가 돌아와요
  focusOn(x, z, T = 2.6) { this.focus = { x, z, t: 0, T }; }
  arc(x, z, a, r, col) {
    const m = mesh(geo('arc' + r, () => new THREE.TorusGeometry(r * 0.8, 0.12, 3, 20, Math.PI * 0.75)), M(col, { e: col, ei: 3, op: 0.9, uniq: true }), x, 1.6, z, this.scene, false);
    m.rotation.set(-Math.PI / 2, 0, -a - Math.PI * 0.375);
    this.fx.push({ m, t: 0, T: 0.18, up: (f) => { m.material.opacity = 0.9 * (1 - f.t / f.T); m.scale.setScalar(1 + f.t * 2); } });
  }
  ring(x, z, r, col, T = 0.5) {
    const m = mesh(geo('ring1', () => new THREE.RingGeometry(0.9, 1, 32)), M(col, { e: col, ei: 2, op: 0.8, uniq: true }), x, 0.2, z, this.scene, false); m.rotation.x = -Math.PI / 2;
    this.fx.push({ m, t: 0, T, up: (f) => { const u = f.t / f.T; m.scale.setScalar(r * u + 0.2); m.material.opacity = 0.8 * (1 - u); } });
  }
  column(x, z, col, T = 0.8) {
    const m = mesh(geo('col', () => new THREE.CylinderGeometry(0.9, 0.9, 6, 12, 1, true)), M(col, { e: col, ei: 2, op: 0.5, uniq: true, ds: true }), x, 3, z, this.scene, false);
    this.fx.push({ m, t: 0, T, up: (f) => { m.material.opacity = 0.5 * (1 - f.t / f.T); m.scale.x = m.scale.z = 1 - f.t / f.T * 0.6; } });
  }
  // 역할 그림: 캐릭터 모델을 작게 그려서 픽셀 그림으로 만들어요 (한 번 그리고 저장해 둬요)
  portrait(role) {
    this._pt = this._pt || {}; if (this._pt[role]) return this._pt[role];
    const W = 42, H = 54, rt = new THREE.WebGLRenderTarget(W, H), sc = new THREE.Scene();
    sc.add(new THREE.AmbientLight(0x8a8ab0, 1.5)); const d = new THREE.DirectionalLight(0xffe0c0, 2.6); d.position.set(4, 6, 7); sc.add(d); const d2 = new THREE.DirectionalLight(0x7a88d0, 1.2); d2.position.set(-5, 3, -3); sc.add(d2);
    const m = makeHero(role); m.rotation.y = 0.55; sc.add(m); const u = m.userData; u.armR.rotation.x = -0.7; u.armL.rotation.x = -0.5;
    const cam = new THREE.OrthographicCamera(-1.75, 1.75, 2.25, -2.25, 0.1, 50); cam.position.set(0, 1.85, 10); cam.lookAt(0, 1.85, 0);
    const tm = this.r.toneMapping; this.r.toneMapping = THREE.NoToneMapping;
    this.r.setRenderTarget(rt); this.r.setClearColor(0x000000, 0); this.r.clear(); this.r.render(sc, cam);
    const px = new Uint8Array(W * H * 4); this.r.readRenderTargetPixels(rt, 0, 0, W, H, px); this.r.setRenderTarget(null); this.r.toneMapping = tm; rt.dispose();
    // 위아래 뒤집고 밝기 보정, 그리고 1칸짜리 어두운 테두리
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), img = g.createImageData(W, H), A = (x, y) => x >= 0 && y >= 0 && x < W && y < H && px[((H - 1 - y) * W + x) * 4 + 3] > 40;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = ((H - 1 - y) * W + x) * 4, o = (y * W + x) * 4;
      if (A(x, y)) { for (let k = 0; k < 3; k++) img.data[o + k] = Math.min(255, 255 * Math.pow(px[i + k] / 255, 1 / 2.2)); img.data[o + 3] = 255; }
      else if (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1)) { img.data[o] = 20; img.data[o + 1] = 15; img.data[o + 2] = 24; img.data[o + 3] = 255; }
    }
    g.putImageData(img, 0, 0); return (this._pt[role] = c.toDataURL());
  }
  // 기술 연출: 번쩍임, 바닥 문양, 솟는 빛 알갱이, 충격파, 잔상
  flash(x, z, col, I = 120) { if (!this.fxL) return; I *= 0.5; this.fxL.color.setHex(col); this.fxL.position.set(x, 3, z); this.fxLI = Math.max(this.fxLI, I); this.fxL.intensity = this.fxLI; }
  rune(x, z, r, col, T = 1.2, spin = 2) {
    const g = new THREE.Group(); g.position.set(x, 0.16, z); this.scene.add(g); const mat = M(col, { e: col, ei: 0.8, op: 0.3, uniq: true });
    const a = mesh(geo('rn1', () => new THREE.RingGeometry(0.92, 1, 32)), mat, 0, 0, 0, g, false); a.rotation.x = -Math.PI / 2;
    const b = mesh(geo('rn2', () => new THREE.RingGeometry(0.62, 0.68, 6)), mat, 0, 0.01, 0, g, false); b.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) { const q = i / 6 * 6.283; const d = box(0.16, 0.04, 0.34, mat, Math.cos(q) * 0.8, 0.02, Math.sin(q) * 0.8, g); d.rotation.y = -q; d.castShadow = false; }
    this.fx.push({ m: g, t: 0, T, up: (f, dt) => { const u = f.t / f.T; g.rotation.y += dt * spin; g.scale.setScalar(r * Math.min(1, u * 5)); mat.opacity = 0.3 * (u < 0.7 ? 1 : (1 - u) / 0.3); } });
  }
  rise(x, z, col, n = 14, r = 1.5, T = 1, sp = 5) {
    const mat = M(col, { e: col, ei: 4 });
    for (let i = 0; i < n; i++) {
      const q = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r, m = box(0.14, 0.14, 0.14, mat, x + Math.cos(q) * d, 0.3, z + Math.sin(q) * d, this.scene); m.castShadow = false;
      const v = sp * (0.5 + Math.random() * 0.7), w = (Math.random() - .5) * 2;
      this.fx.push({ m, t: -Math.random() * T * 0.4, T: T * (0.6 + Math.random() * 0.4), up: (f, dt) => { if (f.t < 0) { m.visible = false; return; } m.visible = true; m.position.y += v * dt; m.position.x += Math.cos(q + f.t * 3) * w * dt; m.position.z += Math.sin(q + f.t * 3) * w * dt; m.scale.setScalar(1 - f.t / f.T * 0.7); } });
    }
  }
  shock(x, z, r, col, T = 0.45) {
    this.ring(x, z, r, col, T); this.ring(x, z, r * 0.6, 0xffffff, T * 0.7);
    const mat = M(col, { e: col, ei: 3 });
    for (let i = 0; i < 18; i++) {
      const q = i / 18 * 6.283 + Math.random() * 0.2, m = box(0.18, 0.18, 0.18, mat, x, 0.3, z, this.scene); m.castShadow = false; const v = r / T * (0.8 + Math.random() * 0.3);
      this.fx.push({ m, t: 0, T: T * 1.1, up: (f, dt) => { m.position.x += Math.cos(q) * v * dt; m.position.z += Math.sin(q) * v * dt; m.position.y = 0.3 + Math.sin(f.t / f.T * 3.14) * 0.8; } });
    }
  }
  streak(x, z, a, len, col, T = 0.35, w = 0.5) {
    const m = mesh(geo('stk', () => new THREE.BoxGeometry(1, 0.1, 1)), M(col, { e: col, ei: 4, op: 0.85, uniq: true }), x + Math.cos(a) * len / 2, 1.2, z + Math.sin(a) * len / 2, this.scene, false);
    m.rotation.y = -a; m.scale.set(len, 1, w);
    this.fx.push({ m, t: 0, T, up: (f) => { const u = f.t / f.T; m.material.opacity = 0.85 * (1 - u); m.scale.z = w * (1 - u * 0.8); } });
  }
  dome(x, z, r, col, T = 0.7) {
    const m = mesh(geo('dome', () => new THREE.SphereGeometry(1, 10, 6, 0, 6.3, 0, 1.6)), M(col, { e: col, ei: 1, op: 0.3, uniq: true, ds: true }), x, 0, z, this.scene, false);
    this.fx.push({ m, t: 0, T, up: (f) => { const u = f.t / f.T; m.scale.setScalar(r * (0.6 + Math.min(1, u * 4) * 0.4)); m.material.opacity = 0.3 * (1 - u); } });
  }
  groundAt(sx, sy) { const v = new THREE.Vector3(sx / this.cw * 2 - 1, -(sy / this.ch) * 2 + 1, 0); const rc = new THREE.Raycaster(); rc.setFromCamera(v, this.cam); const t = -rc.ray.origin.y / rc.ray.direction.y; return { x: rc.ray.origin.x + rc.ray.direction.x * t, z: rc.ray.origin.z + rc.ray.direction.z * t }; }
  project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(this.cam); return { x: (v.x + 1) / 2 * this.cw, y: (1 - v.y) / 2 * this.ch }; }
  entPos(key) { const E = this.ents.get(key); return E ? { x: E.x, z: E.z } : null; }
}

function instBoxes(s, fill) {
  const items = []; fill((x, y, z, w, h, d, c) => items.push([x, y, z, w, h, d, c]));
  if (!items.length) return;
  const im = new THREE.InstancedMesh(geo('ub', () => new THREE.BoxGeometry(1, 1, 1)), new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), items.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  items.forEach((it, i) => { m4.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], it[4], it[5])); im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(it[6])); });
  im.castShadow = im.receiveShadow = true; s.add(im); return im;
}
function ringMesh(s, color) { const m = mesh(geo('pring', () => new THREE.RingGeometry(0.85, 1.0, 24)), M(new THREE.Color(color).getHex(), { e: new THREE.Color(color).getHex(), ei: 0.8, op: 0.55 }), 0, 0.12, 0, s, false); m.rotation.x = -Math.PI / 2; return m; }
function projMesh(k) {
  const g = new THREE.Group();
  if (k === 'arrow' || k === 'pierce' || k === 'earrow') {
    const c = k === 'pierce' ? 0xffe08a : k === 'earrow' ? 0xff5a4a : 0xe8e0c8;
    box(1.4, 0.07, 0.07, M(0x8a5a2a), 0, 0, 0, g); const h = cone(0.1, 0.3, 4, M(c, { e: c, ei: k === 'arrow' ? 0.3 : 2 }), 0.8, 0, 0, g); h.rotation.z = -Math.PI / 2;
    box(0.3, 0.02, 0.2, M(0xe8e0c8), -0.6, 0, 0, g); if (k === 'pierce') box(1.8, 0.04, 0.04, M(0xffe08a, { e: 0xffd060, ei: 2 }), -0.6, 0, 0, g);
  } else if (k === 'orb') { sph(0.28, 8, 6, M(0xd8fff0, { e: 0x9af0d0, ei: 4 }), 0, 0, 0, g); }
  else if (k === 'spear') { box(2.2, 0.08, 0.08, M(0x5a3a22), 0, 0, 0, g); const h = cone(0.14, 0.5, 4, M(0xffb060, { e: 0xff7a20, ei: 2 }), 1.3, 0, 0, g); h.rotation.z = -Math.PI / 2; }
  else if (k === 'eorb') { sph(0.34, 8, 6, M(0x9ad0ff, { e: 0x3a8ae0, ei: 4 }), 0, 0, 0, g); }
  else if (k === 'bolt') { box(1, 0.08, 0.08, M(0x3a2a20), 0, 0, 0, g); const h = cone(0.1, 0.25, 4, M(0xff6a20, { e: 0xff5a10, ei: 2 }), 0.6, 0, 0, g); h.rotation.z = -Math.PI / 2; }
  else if (k === 'ember') { sph(0.36, 8, 6, M(0xffa040, { e: 0xff5a10, ei: 4 }), 0, 0, 0, g); }
  else if (k === 'potion') { sph(0.3, 8, 6, M(0xd0543a, { e: 0x8a2a20, ei: 1 }), 0, 0, 0, g); cyl(0.1, 0.12, 0.3, 6, M(0xd8d0bc), 0, 0.35, 0, g); }
  g.traverse(o => o.castShadow = false); return g;
}
function zoneMesh(z) {
  const g = new THREE.Group();
  if (z.k === 'tcircle') { const f = mesh(geo('zc', () => new THREE.CircleGeometry(1, 32)), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.25, uniq: true }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.scale.setScalar(z.r); const r = mesh(geo('zr', () => new THREE.RingGeometry(0.94, 1, 40)), M(0xff4a3a, { e: 0xff2a1a, ei: 2, op: 0.8 }), 0, 0.01, 0, g, false); r.rotation.x = -Math.PI / 2; r.scale.setScalar(z.r); g.userData.fill = f; }
  else if (z.k === 'tcone') { const f = mesh(new THREE.CircleGeometry(z.r, 24, -z.arc / 2, z.arc), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.3, uniq: true }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.rotation.z = -z.a; g.userData.fill = f; }
  else if (z.k === 'tline') { const f = mesh(new THREE.PlaneGeometry(z.len, z.w), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.3, uniq: true }), z.len / 2, 0, 0, g, false); f.rotation.x = -Math.PI / 2; g.rotation.y = -z.a; g.userData.fill = f; }
  else if (z.k === 'fire') { const fz = THEME().fz; for (let i = 0; i < 4; i++) cone(0.35, 1 + Math.random(), 5, M(fz[0], { e: fz[1], ei: 3 }), (Math.random() - .5) * 1.4, 0.5, (Math.random() - .5) * 1.4, g); const f = mesh(geo('zc', () => new THREE.CircleGeometry(1, 32)), M(fz[0], { e: fz[1], ei: 0.5, op: 0.5 }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.scale.setScalar(z.r); g.traverse(o => o.castShadow = false); }
  else if (z.k === 'rain') { const r = mesh(geo('zr', () => new THREE.RingGeometry(0.94, 1, 40)), M(0xffe08a, { e: 0xffd060, ei: 1, op: 0.3 }), 0, 0.01, 0, g, false); r.rotation.x = -Math.PI / 2; r.scale.setScalar(z.r); g.userData.drops = []; for (let i = 0; i < 10; i++) { const d = box(0.06, 1, 0.06, M(0xe8e0c8, { e: 0xffe08a, ei: 1 }), (Math.random() - .5) * z.r * 1.4, 4, (Math.random() - .5) * z.r * 1.4, g); d.castShadow = false; g.userData.drops.push(d); } }
  else if (z.k === 'ptrap') { box(1.2, 0.12, 1.2, dmetal(), 0, 0.05, 0, g); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const t = cone(0.1, 0.4, 4, metal(), Math.cos(a) * 0.5, 0.25, Math.sin(a) * 0.5, g); t.rotation.z = Math.cos(a) * 0.5; t.rotation.x = -Math.sin(a) * 0.5; } }
  // 보스 바닥 경고는 다른 효과보다 늘 위에 그려요
  if (z.k === 'tcircle' || z.k === 'tcone' || z.k === 'tline') g.traverse(o => { if (o.material) { o.material.depthTest = false; o.renderOrder = 20; } });
  return g;
}
function zoneAnim(E, z, t) {
  const f = E.m.userData.fill;
  if (f && z.T) { const u = 1 - z.t / z.T; f.material.opacity = 0.24 + u * 0.4; if (z.k === 'tcircle') f.scale.setScalar(z.r * (0.2 + 0.8 * u)); }
  if (z.k === 'fire') { E.m.visible = !z.dl; E.m.children.forEach((c, i) => { if (c.geometry.type === 'ConeGeometry') c.scale.y = 0.8 + Math.sin(t * 4 + i) * 0.15; }); }
  if (z.k === 'rain') E.m.userData.drops.forEach((d, i) => { d.position.y = 4 - ((t * 9 + i * 0.37) % 1) * 4; });
}
function lerpA(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }
function clampN(v, a, b) { return v < a ? a : v > b ? b : v; }
// 활 시위 당기기: pull 0(쉼) ~ 0.75(가득)
function setPull(B, pull) {
  const ny = -0.65 + pull;
  for (const [m, tz] of [[B.sa, 0.93], [B.sb, -0.93]]) { const L = Math.hypot(pull, tz); m.position.set(0.12, -0.65 + pull / 2, tz / 2); m.rotation.set(Math.atan2(-pull, -tz), 0, 0); m.scale.z = L; }
  B.ar.position.set(0.12, ny - 0.62, 0); B.ar.visible = pull > 0.18;
}
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const seg = (u, a, b) => ease((u - a) / (b - a));
// 역할마다 공격·기술 동작. 몸 전체(허리 비틀기, 내딛기, 뛰어오르기)가 같이 움직여요
const ANIM_T = { atk: 0.32, hv: 0.55, skill: 0.5 };
function animHero(E, p, dt, t) {
  const m = E.m, u = m.userData; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  E.ph += dt * (p.mv ? 11 : 0); E.sw = (E.sw || 0) + ((p.mv ? Math.sin(E.ph) * 0.75 : 0) - (E.sw || 0)) * Math.min(1, dt * 14); const sw = E.sw;
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  // 동작 시작: 동작 번호가 바뀌면 처음부터
  if (p.aN !== E.aN) { E.aN = p.aN; if (E.aN != null && p.ak) { E.ak = p.ak; E.aT = 0; } }
  const kind = E.ak ? (E.ak === 'atk' || E.ak === 'hv' ? E.ak : 'skill') : '', D = ANIM_T[kind] || 0.5;
  if (E.ak) { E.aT += dt; if (E.aT > D) E.ak = null; }
  const v = E.ak ? E.aT / D : 1, role = p.role, side = (E.aN || 0) % 2 ? 1 : -1;
  const base = { knight: [-0.7, -0.6], archer: [-1.45, -1.55], priest: [-1.2, -0.4], squire: [-1.3, -0.6] }[role];
  // 기본 자세 (달릴 때는 앞으로 기울고 팔을 크게 흔들어요)
  const T = { rx: base[0] - sw * 0.45, rz: 0, lx: base[1] + sw * 0.45, lz: 0, bx: p.mv ? 0.14 : 0, by: 0, bz: 0, bry: 0, hx: 0, rpz: 0, pull: 0.35 };
  if (role === 'archer') { T.rx = -1.5; T.rz = -0.25; T.lx = -1.55; T.lz = 0.12; T.rpz = -0.3; T.pull = 0.35; }
  if (E.ak) {
    const a = E.ak;
    if (a === 'atk' || a === 'hv') {
      if (role === 'knight' || role === 'squire') {
        if (a === 'atk') { // 옆으로 크게 베기: 반대쪽으로 감았다가 휘둘러요
          const w = seg(v, 0, 0.18), st = seg(v, 0.18, 0.55), rc = seg(v, 0.6, 1);
          T.rx = -1.45; T.rz = (side * 1.3 * w - side * 2.6 * st) * (1 - rc); T.bry = (side * 0.5 * w - side * 1.1 * st) * (1 - rc); T.bz = 0.4 * st * (1 - rc); T.bx = 0.15 * st * (1 - rc); T.lx = base[1] - 0.3 * st;
        } else { // 강타: 높이 들어 뛰어올랐다가 내려찍기
          const up = seg(v, 0, 0.14), dn = seg(v, 0.14, 0.32), rc = seg(v, 0.65, 1);
          T.rx = (-3.1 * up + 2.6 * dn) * (1 - rc) + base[0] * rc; T.bx = (-0.25 * up + 0.7 * dn) * (1 - rc); T.by = (0.5 * up - 0.5 * dn) * (1 - rc) + Math.sin(up * Math.PI) * 0.3 * (1 - dn); T.bz = 0.5 * dn * (1 - rc); T.lx = -2.2 * up * (1 - dn) + base[1];
        }
      } else if (role === 'archer' && a === 'hv') { // 궁수 강타: 뛰어올라 활째로 내려찍으며 쏴요
        const up = seg(v, 0, 0.14), dn = seg(v, 0.14, 0.32), rc = seg(v, 0.65, 1), x = (1 - rc);
        T.lx = (-2.9 * up + 2.2 * dn) * x - 1.55 * rc; T.rx = (-2.7 * up + 2.0 * dn) * x - 1.5 * rc; T.rz = -0.25; T.pull = 0.75 * up * (1 - dn); T.rpz = -0.4 * up * (1 - dn);
        T.bx = (-0.25 * up + 0.7 * dn) * x; T.by = Math.sin(up * Math.PI) * 0.3 * (1 - dn) + (0.5 * up - 0.5 * dn) * x; T.bz = 0.45 * dn * x;
      } else if (role === 'archer') { // 시위를 놓고 반동, 다시 당겨요
        const rel = seg(v, 0, 0.12), re = seg(v, 0.25, 1);
        T.pull = 0.75 * (1 - rel) * 0 + re * 0.75; T.rpz = -0.55 * re; T.rz = -0.25 - 0.1 * re; T.lx = -1.55 - (a === 'hv' ? 0.45 : 0.25) * (1 - seg(v, 0.08, 0.5)); T.bx = -(a === 'hv' ? 0.3 : 0.12) * (1 - seg(v, 0.05, 0.6)); T.rx = -1.5 + 0.5 * (1 - seg(v, 0.05, 0.4));
      } else { // 사제: 지팡이를 앞으로 찔러 빛을 쏴요 (강타는 머리 위로 한 바퀴)
        if (a === 'atk') { const th = seg(v, 0, 0.3), rc = seg(v, 0.45, 1); T.bry = -0.5 * th * (1 - rc); T.rz = -0.4 * th * (1 - rc); T.rx = base[0] - 0.6 * th * (1 - rc); T.bx = 0.25 * th * (1 - rc); T.bz = 0.3 * th * (1 - rc); T.lx = -1.2 * th * (1 - rc) + base[1]; }
        else { // 사제 강타: 지팡이를 두 손으로 높이 들고 뛰어올라 땅을 내려찍어요
          const up = seg(v, 0, 0.14), dn = seg(v, 0.14, 0.32), rc = seg(v, 0.65, 1), x = 1 - rc;
          T.rx = (-2.7 * up + 2.3 * dn) * x + base[0] * rc; T.lx = (-2.6 * up + 2.0 * dn) * x + base[1] * rc; T.lz = 0.3 * x; T.bx = (-0.25 * up + 0.75 * dn) * x; T.by = Math.sin(up * Math.PI) * 0.3 * (1 - dn) + (0.5 * up - 0.5 * dn) * x; T.bz = 0.45 * dn * x; }
      }
    } else { // 기술
      const pk = Math.sin(Math.min(1, v * 1.4) * Math.PI), hold = 1 - seg(v, 0.7, 1);
      switch (a) {
        case 'block': T.lx = -1.65; T.lz = 0.3; T.by = -0.15; T.bx = 0.1; T.rx = -0.4; break;
        case 'dash': T.bx = 0.55 * hold; T.rx = -1.6; T.lx = 0.7 * hold; T.bz = 0.5 * pk; break;
        case 'taunt': T.rx = -2.7 * hold; T.rz = 0.9 * hold; T.lx = -2.7 * hold; T.lz = -0.9 * hold; T.hx = -0.4 * hold; T.by = 0.35 * pk; T.bx = -0.2 * hold; break;
        case 'pierce': { const dr = seg(v, 0, 0.45), rl = seg(v, 0.45, 0.55); T.pull = 0.75 * dr * (1 - rl); T.rpz = -0.6 * dr * (1 - rl); T.bx = -0.35 * rl * hold; T.lx = -1.55 - 0.4 * rl * hold; break; }
        case 'rain': T.lx = -2.5 * hold - 1.55 * (1 - hold); T.rx = -2.4 * hold - 1.5 * (1 - hold); T.bx = -0.3 * hold; T.pull = 0.75 * seg(v, 0, 0.4) * (1 - seg(v, 0.4, 0.5)); break;
        case 'mark': T.lx = -1.7; T.lz = 0.35 * hold; T.rx = -0.6; T.bry = -0.3 * hold; break;
        case 'heal': case 'raise': T.rx = -2.3 * hold + base[0] * (1 - hold); T.rz = 0.35 * hold; T.lx = -2.4 * hold; T.lz = -0.8 * hold; T.by = 0.3 * pk; T.hx = -0.35 * hold; break;
        case 'ward': T.rx = -0.9; T.by = -0.3 * hold; T.bx = 0.25 * hold; T.lx = -1.7 * hold; break;
        case 'potion': { const th = seg(v, 0.15, 0.4); T.rx = -3.0 * (1 - th) - 1.2 * th; T.bx = -0.2 + 0.5 * th; T.bry = 0.4 - 0.8 * th; break; }
        case 'trap': T.by = -0.45 * pk; T.bx = 0.5 * pk; T.rx = -0.9; T.lx = -0.9; break;
        case 'rally': T.rx = -3.05 * hold; T.lx = -2.2 * hold; T.lz = -0.5 * hold; T.by = 0.45 * pk; T.hx = -0.3 * hold; break;
        default: T.rx = -2.8 * hold;
      }
    }
  }
  if (p.bk && E.ak !== 'block') { T.lx = -1.6; }
  const k = Math.min(1, dt * 30), L = (o, kk, v2) => { E[kk] = E[kk] == null ? v2 : E[kk] + (v2 - E[kk]) * k; return E[kk]; };
  u.armR.rotation.set(L(0, 'ar', T.rx), 0, L(0, 'arz', T.rz)); u.armL.rotation.set(L(0, 'al', T.lx), 0, L(0, 'alz', T.lz));
  u.armR.position.z = L(0, 'rpz', T.rpz); u.head.rotation.x = L(0, 'hx', T.hx);
  if (u.bowS) setPull(u.bowS, L(0, 'pl', T.pull));
  const bob = p.mv ? Math.abs(Math.sin(E.ph)) * 0.1 : Math.sin(t * 2 + E.ph) * 0.03;
  u.body.rotation.set(L(0, 'bx', T.bx), L(0, 'bry', T.bry), 0); u.body.position.set(0, bob + L(0, 'by', T.by), L(0, 'bz', T.bz));
  if (p.ro) { E.rollA = (E.rollA || 0) + dt * 18; u.body.rotation.x = E.rollA; u.body.position.y = -0.6; } else E.rollA = 0;
  if (p.dn) { u.body.rotation.set(-Math.PI / 2 + 0.2, 0, 0); u.body.position.set(0, 0.4, -1); }
  if (u.light) u.light.intensity = (p.dn ? 3 : 15);
}
function animEnemy(E, e, dt, t, view) {
  const m = E.m, u = m.userData; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  // 맞으면 잠깐 부풀었다 돌아와요
  if (E.pop > 0) { E.pop = Math.max(0, E.pop - dt); const q = 1 + E.pop * 1.6; m.scale.set(E.base * q, E.base * (2 - q), E.base * q); } else if (E.pop === 0) { m.scale.setScalar(E.base); E.pop = null; }
  E.ph += dt * (e.mv ? 9 : 0); E.sw = (E.sw || 0) + ((e.mv ? Math.sin(E.ph) * 0.6 : 0) - (E.sw || 0)) * Math.min(1, dt * 14); const sw = E.sw;
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  let ar = -0.9 - sw * 0.3;
  if (e.st === 'wind' || e.st === 'wind2') ar = -2.6 + Math.sin(t * 30) * 0.1;
  if (e.k === 'boss') {
    if (e.ak === 'slam') ar = -3.0; else if (e.ak === 'sweep') { ar = -1.6; u.body.rotation.y = 0.9; } else u.body.rotation.y = 0;
    if (e.ak === 'charge!') { ar = -1.4; u.body.rotation.x = 0.35; } else u.body.rotation.x = e.sn ? 0.5 : 0;
    if (u.light) u.light.intensity = 18 + Math.sin(t * 1.5) * 2 + (e.ph === 3 ? 10 : 0);
    if (u.crack) { const on = e.ph === 3; u.crack.visible = on; u.cape.visible = !on; const pl = 0.5 + 0.5 * Math.sin(t * 6); u.ckM.emissiveIntensity = on ? 4 + pl * 5 : 0; u.ckL.intensity = on ? 10 + pl * 14 : 0; if (on && (E.ckT = (E.ckT || 0) - dt) <= 0) { E.ckT = 0.12; const bk = -E.a + Math.PI / 2, bx = E.x - Math.sin(bk) * 1.3, bz = E.z - Math.cos(bk) * 1.3; view.burst(bx, 4 + Math.random(), bz, 0xff7a20, 2, 2, 0.5, 0.12); } }
  }
  E.ar = E.ar == null ? ar : E.ar + (ar - E.ar) * Math.min(1, dt * 22); u.armR.rotation.x = E.ar;
  m.position.y = e.k === 'boss' && CH.boss.ai === 'bishop' ? 0.6 + Math.sin(t * 1.6) * 0.25 : 0;
  if (e.st === 'rise') m.position.y = -1.5;
  // 잠든 해골은 고개를 숙이고 있어요
  const zz = e.st === 'sleep' || e.st === 'home' && !e.mv ? 1 : 0; E.zz = (E.zz || 0) + (zz - (E.zz || 0)) * Math.min(1, dt * 4);
  if (e.k !== 'boss') { u.head.rotation.x = E.zz * 0.6; u.body.rotation.x = E.zz * 0.22 + (u.kind === 'wolf' && (e.st === 'wind' || e.st === 'charge') ? -0.25 : 0); }
  if (e.hp <= 0) { E.dieT = (E.dieT || 0) + dt; m.position.y = -E.dieT * 1.8; u.body.rotation.z = E.dieT * 1.2; }
  const pop = e.ht ? 1.08 : 1; m.scale.setScalar((E.base || 1) * pop);
  if (e.sn) u.head.rotation.y = t * 6; else u.head.rotation.y = 0;
}

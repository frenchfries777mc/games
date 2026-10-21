// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 그리기: three.js 입체 모델을 픽셀로 바꿔 그려요 (RenderPixelatedPass)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RW, RH } from './sim.js';
import { ROLES } from './data.js';

let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const MC = new Map();
const M = (c, o = {}) => {
  const key = c + '|' + JSON.stringify(o); if (MC.has(key) && !o.uniq) return MC.get(key);
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

/* ---------- 캐릭터 모델 ---------- */
const HERO = {
  knight: { body: 0x3f6fd0, leg: 'dm', arm: 'mt', helm: 1, sword: 1, shield: 1, cape: 0x24479a, belt: 1 },
  archer: { body: 0x467a3e, leg: 0x3a3a44, arm: 0x467a3e, hood: 0x2f5a32, bow: 1, quiver: 1, belt: 1 },
  priest: { body: 0xe8e4ef, robe: 1, leg: 0x9a96a8, arm: 0xe8e4ef, hood: 0xcfc8dc, staff: 1 },
  squire: { body: 0x8a6a44, leg: 0x4a4250, arm: 0x8a6a44, cap: 0xb9443a, torch: 1, sack: 1, belt: 1 }
};
function matOf(v) { return v === 'dm' ? dmetal() : v === 'mt' ? metal() : M(v); }
export function makeHero(role) {
  const o = HERO[role], g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const lg = matOf(o.leg), am = matOf(o.arm);
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-0.25, 0.9, 0); legR.position.set(0.25, 0.9, 0); body.add(legL, legR);
  cap(0.2, 0.6, lg, 0, -0.4, 0, legL); cap(0.2, 0.6, lg, 0, -0.4, 0, legR);
  box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legL); box(0.5, 0.25, 0.65, M(0x2a2228), 0, -0.78, 0.1, legR);
  cyl(0.5, o.robe ? 0.85 : 0.62, o.robe ? 1.9 : 1.3, 10, M(o.body), 0, o.robe ? 1.1 : 1.45, 0, body);
  sph(0.55, 10, 8, M(o.body), 0, 2.05, 0, body).scale.set(1, 0.7, 0.85);
  if (o.belt) { const b = mesh(geo('belt', () => new THREE.TorusGeometry(0.58, 0.08, 5, 12)), leather(), 0, 1.2, 0, body); b.rotation.x = Math.PI / 2; }
  const head = new THREE.Group(); head.position.y = 2.75; body.add(head);
  if (o.helm) {
    cyl(0.42, 0.45, 0.8, 10, metal(), 0, 0, 0, head); sph(0.42, 10, 6, metal(), 0, 0.4, 0, head, 1.6);
    box(0.6, 0.08, 0.1, M(0x0a0a0e), 0, 0.05, 0.42, head); const pl = cone(0.12, 0.7, 5, M(0x3f6fd0), 0, 0.95, -0.1, head); pl.rotation.x = -0.5;
  } else {
    sph(0.42, 10, 8, skin(), 0, 0, 0, head); box(0.08, 0.1, 0.05, M(0x1a1418), -0.15, 0.02, 0.4, head); box(0.08, 0.1, 0.05, M(0x1a1418), 0.15, 0.02, 0.4, head);
    if (o.hood) { sph(0.52, 10, 8, M(o.hood), 0, 0.05, -0.05, head, 1.9); const c = cone(0.3, 0.6, 6, M(o.hood), 0, 0.1, -0.5, head); c.rotation.x = -1.9; }
    if (o.cap) { cyl(0.46, 0.46, 0.25, 10, M(o.cap), 0, 0.3, 0, head); sph(0.44, 10, 6, M(o.cap), 0, 0.35, 0, head, 1.4); const f = cone(0.06, 0.6, 4, M(0xf0e8d0), 0.3, 0.7, -0.1, head); f.rotation.z = -0.6; }
  }
  if (o.cape) { const cp = mesh(geo('cape', () => new THREE.PlaneGeometry(1.2, 2, 1, 3)), M(o.cape, { ds: true }), 0, 1.6, -0.6, body); cp.rotation.x = 0.18; }
  const armR = new THREE.Group(); armR.position.set(0.72, 2.15, 0); body.add(armR); cap(0.17, 0.7, am, 0, -0.45, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.72, 2.15, 0); body.add(armL); cap(0.17, 0.7, am, 0, -0.45, 0, armL);
  let light = null;
  if (o.sword) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); box(0.12, 2, 0.04, M(0xe9edf5, { m: 0.9, r: 0.2 }), 0, 1.1, 0, sw); box(0.6, 0.1, 0.14, gold(), 0, 0.1, 0, sw); box(0.08, 0.35, 0.08, leather(), 0, -0.1, 0, sw); sw.rotation.x = Math.PI / 2; }
  if (o.shield) { const sh = new THREE.Group(); sh.position.set(-0.15, -0.7, 0.45); armL.add(sh); sh.rotation.x = 0.6; box(1.1, 1.4, 0.14, M(0x2c4f9e), 0, 0, 0, sh); const c = cone(0.78, 0.7, 4, M(0x2c4f9e), 0, -0.95, 0, sh); c.rotation.set(Math.PI, Math.PI / 4, 0); box(0.18, 1.2, 0.05, gold(), 0, -0.1, 0.09, sh); box(0.8, 0.18, 0.05, gold(), 0, 0.25, 0.09, sh); }
  if (o.bow) { const bw = mesh(geo('bow', () => new THREE.TorusGeometry(0.95, 0.06, 4, 12, Math.PI)), M(0x8a5a2a), -0.1, -0.8, 0.5, armL); bw.rotation.set(0, Math.PI / 2, Math.PI / 2); box(0.02, 1.9, 0.02, M(0xe8e0c8), -0.1, -0.8, 0.5, armL); }
  if (o.staff) { const st = new THREE.Group(); st.position.set(0, -0.9, 0.1); armR.add(st); st.rotation.x = 0.7; cyl(0.07, 0.07, 3.2, 6, M(0x7a5a2a), 0, 0.5, 0, st); mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(0x9af0d0, { e: 0x6af0c0, ei: 4 }), 0, 2.3, 0, st); light = new THREE.PointLight(0x6af0c0, 14, 8, 1.6); light.position.set(0, 2.4, 0); st.add(light); }
  if (o.torch) { const t = new THREE.Group(); t.position.set(0, -0.9, 0.1); armR.add(t); t.rotation.x = 0.9; cyl(0.08, 0.1, 1.2, 6, leather(), 0, 0.4, 0, t); cone(0.22, 0.6, 6, M(0xffa040, { e: 0xff7a20, ei: 3 }), 0, 1.2, 0, t); light = new THREE.PointLight(0xff9a48, 16, 9, 1.6); light.position.set(0, 1.4, 0); t.add(light); }
  if (o.sack) sph(0.55, 8, 6, M(0xb89a6a), -0.1, 1.9, -0.7, body).scale.set(1, 1.1, 0.8);
  if (o.quiver) { const q = cyl(0.2, 0.2, 1.1, 6, leather(), 0.3, 2.1, -0.55, body); q.rotation.x = 0.3; for (let i = 0; i < 3; i++) box(0.04, 0.4, 0.04, M(0xe8e0c8), 0.25 + i * 0.06, 2.75, -0.7, body); }
  g.userData = { body, legL, legR, armL, armR, head, role, light, kind: 'hero' };
  return g;
}
export function makeSkel(k) {
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
export function makeBoss() {
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
  const armR = new THREE.Group(); armR.position.set(0.95, 2.3, 0); body.add(armR); cap(0.2, 0.7, bA2, 0, -0.45, 0, armR);
  const gs = new THREE.Group(); gs.position.set(0, -0.9, 0.2); armR.add(gs); gs.rotation.x = Math.PI / 2;
  box(0.22, 3.2, 0.06, M(0x7a7f90, { m: 0.9, r: 0.3 }), 0, 1.8, 0, gs); box(0.9, 0.14, 0.16, bA2, 0, 0.15, 0, gs); box(0.12, 0.6, 0.12, leather(), 0, -0.2, 0, gs);
  sph(0.2, 6, 5, M(0xff3a3a, { e: 0xff1a1a, ei: 3 }), 0, 0.15, 0.1, gs);
  const armL = new THREE.Group(); armL.position.set(-0.95, 2.3, 0); body.add(armL); cap(0.2, 0.7, bA2, 0, -0.45, 0, armL); armL.rotation.x = -0.5;
  g.userData = { body, legL, legR, armL, armR, head, kind: 'boss', light };
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
    const w = innerWidth, h = innerHeight; this.W = w; this.H = h;
    this.r.setPixelRatio(1); this.r.setSize(w, h, false);
    const asp = w / h, vs = this.mode === 'lobby' ? 7.6 : this.zoom * (asp < 1 ? 1.35 : 1);
    this.cam.left = -vs * asp; this.cam.right = vs * asp; this.cam.top = vs; this.cam.bottom = -vs; this.cam.updateProjectionMatrix();
    if (this.comp) this.comp.setSize(w, h);
    if (this.pp) this.pp.setPixelSize(this.ps);
  }
  setPixel(ps) { this.ps = ps; if (this.pp) this.pp.setPixelSize(ps); }
  setBloom(on) { this.bloomOn = on; if (this.bloom) this.bloom.enabled = on; }
  newScene(bg, fog) {
    if (this.scene) this.scene.traverse(o => { if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); });
    const s = new THREE.Scene(); s.background = new THREE.Color(bg); s.fog = new THREE.Fog(fog, 45, 90);
    this.scene = s; this.ents.clear(); this.fx = []; this.nums = [];
    this.comp = new EffectComposer(this.r); this.pp = new RenderPixelatedPass(this.ps, s, this.cam, { normalEdgeStrength: 0.35, depthEdgeStrength: 0.55 });
    this.comp.addPass(this.pp); this.bloom = new UnrealBloomPass(new THREE.Vector2(this.W / this.ps, this.H / this.ps), 0.32, 0.2, 0.88); this.bloom.enabled = this.bloomOn; this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
    this.comp.setSize(this.W, this.H);
    return s;
  }
  lights(s, amb = 1.3) {
    s.add(new THREE.AmbientLight(0x4a4a78, amb)); s.add(new THREE.HemisphereLight(0x8a90c8, 0x2a1e18, 0.9));
    const fill = new THREE.DirectionalLight(0xffc89a, 0.9); fill.position.set(0, 12, 30); s.add(fill);
    const moon = new THREE.DirectionalLight(0x6a78c0, 0.7); moon.position.set(-10, 30, 12); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); s.add(moon); s.add(moon.target);
  }
  flame(p, x, y, z, k = 1, light = true) {
    cone(0.32 * k, 0.9 * k, 6, M(0xff9a3a, { e: 0xff7a20, ei: 3 }), x, y, z, p);
    cone(0.18 * k, 0.6 * k, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), x, y - 0.1 * k, z, p);
    if (light) { const L = new THREE.PointLight(0xff9a48, 55 * k, 24, 1.6); L.position.set(x, y + 0.4, z + 0.8); p.add(L); this.flick.push({ L, b: 55 * k, ph: R() * 9 }); }
  }

  /* ----- 로비: 밤의 성 안뜰 모닥불 ----- */
  buildLobby() {
    this.mode = 'lobby'; const s = this.newScene(0x0e1024, 0x12142a); this.flick = []; this.lights(s);
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
    this.embers = []; for (let i = 0; i < 30; i++) { const e = box(0.08, 0.08, 0.08, M(0xffb050, { e: 0xff8a30, ei: 5 }), 0, 0, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 3 }); }
    this.resize();
    this.cam.position.set(-1.5, 13, 30); this.cam.lookAt(-1.5, 3.0, 1.5);
  }

  /* ----- 던전 방 ----- */
  buildRoom(rm, ri, kind) {
    this.mode = 'room'; const boss = kind === 'boss', rest = kind === 'rest';
    const s = this.newScene(0x07060a, 0x0b0910); this.flick = []; this.lights(s, rest ? 1.5 : 1.3);
    seed = 11 + ri * 31;
    const stoneCols = boss ? [0x3e3440, 0x463a48, 0x4e4250, 0x3a3040, 0x4a3e4c] : [0x4a4550, 0x524d58, 0x5a5462, 0x463f4c, 0x55505c];
    instBoxes(s, (add) => {
      for (let x = -RW - 1; x <= RW + 1; x += 2) for (let z = -RH; z <= RH + 2; z += 2) { const off = (Math.round(z / 2) % 2) ? 1 : 0; const h = 0.3 + R() * 0.12; add(x + off, h / 2 - 0.3, z, 1.92, h, 1.92, stoneCols[R() * 5 | 0]); }
      for (let i = 0; i < 26; i++) add((R() - .5) * RW * 2, 0.05, (R() - .5) * RH * 2, 0.6, 0.08, 0.5, 0x3e5a36);
    });
    const brick = boss ? [0x3a2e3c, 0x423446, 0x4a3a50, 0x342a38] : [0x3e3846, 0x463f50, 0x4e4658, 0x38323f];
    instBoxes(s, (add) => {
      for (let y = 0; y < 7; y++) for (let x = -RW - 3; x <= RW + 3; x += 2.2) { const xx = x + (y % 2 ? 1.1 : 0); if (Math.abs(xx) < 3.2 && y < 5) continue; add(xx, y + 0.45, -RH - 0.9 + (R() - .5) * 0.1, 2.1, 0.95, 1.6, brick[R() * 4 | 0]); }
      for (const sx of [-RW - 0.9, RW + 0.9]) for (let y = 0; y < 4; y++) for (let z = -RH; z <= RH + 1; z += 2.2) add(sx, y + 0.45, z + (y % 2 ? 1.1 : 0), 1.6, 0.95, 2.1, brick[R() * 4 | 0]);
      for (let x = -RW - 1; x <= RW + 1; x += 2.2) add(x, 0.35, RH + 1.1, 2.1, 0.7, 1.4, brick[R() * 4 | 0]);
    });
    box(RW * 2 + 6, 0.5, 2.2, M(0x5c5468), 0, 7.1, -RH - 0.7, s);
    // 문
    const arch = new THREE.Group(); arch.position.set(0, 0, -RH - 0.6); s.add(arch);
    box(6, 7.6, 1.8, M(0x08070b), 0, 3.8, -0.3, arch);
    for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / 9) { const b = box(1, 1, 2, M(0x6a6276), Math.cos(a) * 3.4, 5 + Math.sin(a) * 2.6, 0, arch); b.rotation.z = a; }
    this.gate = new THREE.Group(); arch.add(this.gate);
    for (let x = -2.4; x <= 2.41; x += 0.8) box(0.18, 6.4, 0.2, M(0x2a2830, { m: 0.8, r: 0.4 }), x, 3.4, 0.6, this.gate);
    box(5.4, 0.2, 0.2, M(0x2a2830, { m: 0.8, r: 0.4 }), 0, 4, 0.6, this.gate); box(5.4, 0.2, 0.2, M(0x2a2830, { m: 0.8, r: 0.4 }), 0, 1.6, 0.6, this.gate);
    this.doorGlow = box(5, 0.1, 2.2, M(0xffd36b, { e: 0xffb040, ei: 1.5, op: 0.0 }), 0, 0.12, -RH + 0.9, s); this.doorGlow.castShadow = false;
    // 깃발과 횃불
    const bcol = boss ? 0x3a0e14 : 0x7a1f22;
    for (const bx of [-7.5, 7.5]) { const g = new THREE.Group(); g.position.set(bx, 6, -RH - 0.05); s.add(g); box(2.4, 0.18, 0.18, M(0x8a6a30, { m: 0.6 }), 0, 0.1, 0, g); box(2, 4.2, 0.08, M(bcol), 0, -2.1, 0.05, g); box(0.8, 1.6, 0.1, gold(), 0, -2.2, 0.12, g); }
    for (const tx of [-12, -4, 4, 12]) { box(0.3, 1, 0.3, M(0x4a3020), tx, 4, -RH - 0.05, s); box(0.6, 0.25, 0.6, M(0x2a2830, { m: 0.7 }), tx, 4.5, -RH - 0.05, s); this.flame(s, tx, 5.05, -RH - 0.05, 1); }
    // 기둥
    for (const p of rm.pi || []) { box(2.4, 0.6, 2.4, M(0x5c5468), p.x, 0.3, p.z, s); instBoxes(s, add => { for (let y = 0.6; y < 7; y += 1.1) add(p.x, y + 0.5, p.z, 1.9, 1.05, 1.9, brick[R() * 4 | 0]); }); box(2.5, 0.6, 2.5, M(0x5c5468), p.x, 7.2, p.z, s); }
    // 구석 장식
    const barrel = (x, z) => { cyl(0.75, 0.75, 1.6, 10, M(0x6a4628), x, 0.8, z, s); cyl(0.8, 0.8, 0.12, 10, dmetal(), x, 0.3, z, s); cyl(0.8, 0.8, 0.12, 10, dmetal(), x, 1.3, z, s); };
    barrel(-RW + 1.2, -RH + 1.4); barrel(-RW + 2.8, -RH + 1); box(1.8, 1.6, 1.8, M(0x6a4628), RW - 1.4, 0.8, -RH + 1.3, s).rotation.y = 0.3;
    for (const [x, z] of [[-RW + 3, RH - 1], [RW - 4, RH - 2], [6, 5]]) { const b = box(1.2, 0.15, 0.15, bone(), x, 0.12, z, s); b.rotation.y = R() * 3; sph(0.35, 6, 5, bone(), x + 0.8, 0.25, z + 0.3, s); }
    for (const cx of [-RW + 1, RW - 1]) for (let y = 6; y > 2.5; y -= 0.35) box(0.12, 0.3, 0.12, dmetal(), cx, y, -RH - 0.05, s);
    // 화로 (빛)
    const braz = (x, z) => { cyl(0.9, 0.5, 0.8, 8, M(0x2a2830, { m: 0.8, r: 0.4 }), x, 1.5, z, s); cyl(0.12, 0.2, 1.2, 6, M(0x2a2830, { m: 0.8 }), x, 0.6, z, s); for (let i = 0; i < 5; i++) cone(0.3, 0.9 + R() * 0.6, 5, M(0xff8a2a, { e: 0xff6a10, ei: 3 }), x + (R() - .5) * 0.8, 2.2, z + (R() - .5) * 0.8, s); const L = new THREE.PointLight(boss ? 0xff5a3a : 0xff8a3a, 70, 22, 1.5); L.position.set(x, 3, z); s.add(L); this.flick.push({ L, b: 70, ph: R() * 9 }); };
    braz(-RW + 1.5, RH - 2); braz(RW - 1.5, RH - 2);
    if (boss) { const ring = mesh(geo('bring', () => new THREE.TorusGeometry(6, 0.08, 4, 48)), M(0x8a1a2a, { e: 0xa01a30, ei: 2 }), 0, 0.12, -4, s); ring.rotation.x = Math.PI / 2; ring.castShadow = false; }
    if (rest) {
      const f = rm.fi; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mesh(geo('dod', () => new THREE.DodecahedronGeometry(0.35)), M(0x5a5462), f.x + Math.cos(a) * 1.1, 0.15, f.z + Math.sin(a) * 1.1, s); }
      this.fireG = new THREE.Group(); this.fireG.position.set(f.x, 0.9, f.z); s.add(this.fireG);
      for (let i = 0; i < 6; i++) cone(0.35 + R() * 0.2, 1.2 + R() * 0.9, 6, M(0xff8a2a, { e: 0xff6a10, ei: 3 }), (R() - .5) * 0.7, 0.1, (R() - .5) * 0.7, this.fireG);
      const L = new THREE.PointLight(0xff9040, 70, 22, 1.5); L.position.set(f.x, 2.5, f.z); s.add(L); this.flick.push({ L, b: 70, ph: 1 });
      const healR = mesh(geo('hring', () => new THREE.RingGeometry(3.8, 4, 40)), M(0x9af0a8, { e: 0x6ad080, ei: 1, op: 0.35 }), f.x, 0.14, f.z, s); healR.rotation.x = -Math.PI / 2; healR.castShadow = false;
    }
    if (rm.ch) {
      const ch = new THREE.Group(); ch.position.set(rm.ch.x, 0, rm.ch.z); ch.rotation.y = -0.3; s.add(ch); box(2, 1.1, 1.3, M(0x6a4628), 0, 0.55, 0, ch);
      this.lid = new THREE.Group(); this.lid.position.set(0, 1.1, -0.65); ch.add(this.lid); const lidM = cyl(0.65, 0.65, 2, 8, M(0x6a4628), 0, 0, 0.65, this.lid); lidM.rotation.z = Math.PI / 2; box(2.05, 0.15, 1.35, gold(), 0, -0.2, 0.65, this.lid);
      box(0.3, 0.4, 0.1, gold(), 0, 0.9, 0.7, ch);
    } else this.lid = null;
    // 바닥 함정
    this.trapM = new Map();
    for (const t of rm.tr || []) {
      const g = new THREE.Group(); g.position.set(t.x, 0, t.z); s.add(g); box(1.8, 0.1, 1.8, M(0x2e2a32), 0, 0.02, 0, g);
      const sp = new THREE.Group(); g.add(sp); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) cone(0.15, 0.8, 4, M(0x9a9aa6, { m: 0.8, r: 0.4 }), i * 0.5, 0.3, j * 0.5, sp);
      this.trapM.set(t.id, { g, sp });
    }
    this.embers = []; for (let i = 0; i < 40; i++) { const e = box(0.08, 0.08, 0.08, M(0xffb050, { e: 0xff8a30, ei: 5 }), 0, -5, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 6, x: (R() - .5) * RW * 2, z: (R() - .5) * RH * 2 }); }
    this.resize();
  }

  /* ----- 스냅숏을 장면에 반영 ----- */
  sync(S, me, dt, t) {
    const s = this.scene; if (!s) return;
    const seen = new Set();
    // 플레이어
    for (const p of S.pl) {
      const key = 'p' + p.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { const m = makeHero(p.role); s.add(m); E = { m, x: p.x, z: p.z, a: p.a, ph: 0 }; this.ents.set(key, E); E.ring = ringMesh(s, ROLES[p.role].color); E.ward = sph(1.6, 12, 10, M(0x9af0e0, { e: 0x6ad0c0, ei: 1, op: 0.18, uniq: true }), 0, 1.6, 0, m); E.ward.castShadow = false; }
      const k = p.id === me ? 1 : Math.min(1, dt * 14);
      E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k; E.a = lerpA(E.a, p.a, Math.min(1, dt * 18));
      animHero(E, p, dt, t); E.ring.position.set(E.x, 0.12, E.z); E.ring.visible = !p.dd;
      E.ward.visible = p.sh > 0; E.m.visible = !p.dd;
    }
    // 적
    for (const e of S.en) {
      const key = 'e' + e.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { const m = e.k === 'boss' ? makeBoss() : makeSkel(e.k); s.add(m); E = { m, x: e.x, z: e.z, a: e.a, ph: R() * 6, base: m.scale.x }; this.ents.set(key, E); }
      const k = Math.min(1, dt * 14); E.x += (e.x - E.x) * k; E.z += (e.z - E.z) * k; E.a = lerpA(E.a, e.a, Math.min(1, dt * 14));
      animEnemy(E, e, dt, t, this);
    }
    // 투사체
    for (const p of S.pr) {
      const key = 'r' + p.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { E = { m: projMesh(p.k), x: p.x, z: p.z }; s.add(E.m); this.ents.set(key, E); }
      const k = Math.min(1, dt * 20); E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k;
      E.m.position.set(E.x, (p.k === 'potion' ? p.y : 0) + 1.6, E.z); E.m.rotation.y = -p.a; if (p.k === 'potion') E.m.rotation.z += dt * 12;
    }
    // 바닥 효과
    for (const z of S.zn) {
      const key = 'z' + z.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { E = { m: zoneMesh(z) }; s.add(E.m); this.ents.set(key, E); E.m.position.set(z.x, 0.14, z.z); }
      zoneAnim(E, z, t);
    }
    for (const [key, E] of this.ents) if (!seen.has(key)) { s.remove(E.m); if (E.ring) s.remove(E.ring); this.ents.delete(key); }
    // 함정, 문, 상자
    if (S.rm && this.trapM) for (const tr of S.rm.tr) { const T = this.trapM.get(tr.id); if (!T) continue; T.sp.position.y += ((tr.on && tr.up ? 0.1 : -0.8) - T.sp.position.y) * Math.min(1, dt * 18); T.g.visible = true; if (!tr.on) T.sp.visible = false; }
    if (this.gate) { const y = S.rm && S.rm.dr ? 6.2 : 0; this.gate.position.y += (y - this.gate.position.y) * Math.min(1, dt * 3); }
    if (this.doorGlow) this.doorGlow.material.opacity = S.rm && S.rm.dr ? 0.25 + Math.sin(t * 4) * 0.12 : 0;
    if (this.lid && S.rm.ch) this.lid.rotation.x += ((S.rm.ch.o ? -1.6 : 0) - this.lid.rotation.x) * Math.min(1, dt * 6);
    // 카메라: 내 캐릭터를 따라가요
    const mp = this.ents.get('p' + me);
    if (mp) { this.camT.x += (clampN(mp.x, -RW + 8, RW - 8) - this.camT.x) * Math.min(1, dt * 5); this.camT.z += (-1.8 + clampN(mp.z, -RH, RH) * 0.15 - this.camT.z) * Math.min(1, dt * 5); }
    let sx = 0, sz = 0; if (this.shake > 0 && this.shakeOn) { sx = (Math.random() - .5) * this.shake; sz = (Math.random() - .5) * this.shake; this.shake = Math.max(0, this.shake - dt * 3); }
    this.cam.position.set(this.camT.x + sx, 22, this.camT.z + 33 + sz); this.cam.lookAt(this.camT.x + sx, 1.8, this.camT.z + 0.4 + sz);
  }
  tick(dt, t) {
    for (const f of this.flick || []) f.L.intensity = f.b * (0.85 + Math.sin(t * 9 + f.ph) * 0.08 + Math.sin(t * 23 + f.ph * 2) * 0.05);
    if (this.fireG) { this.fireG.children.forEach((c, i) => { c.scale.y = 0.8 + Math.sin(t * 10 + i * 1.7) * 0.25; }); }
    for (const e of this.embers || []) {
      e.t += dt; if (this.mode === 'lobby') { const u = (e.t % 3) / 3; e.m.position.set(Math.sin(e.t * 2 + e.m.id) * 1.2 * u, 1.5 + u * 7, 2 + Math.cos(e.t * 1.3 + e.m.id) * 1.2 * u); }
      else { const u = (e.t % 6) / 6; e.m.position.set(e.x + Math.sin(e.t) * 0.5, u * 8, e.z); }
    }
    if (this.lobbyHeroes) this.lobbyHeroes.forEach((h, i) => { h.userData.body.position.y = Math.sin(t * 1.5 + i) * 0.03; h.userData.head.rotation.y = Math.sin(t * 0.6 + i * 2) * 0.3; });
    for (const f of this.fx) { f.t += dt; f.up(f, dt); }
    this.fx = this.fx.filter(f => { if (f.t >= f.T) { this.scene.remove(f.m); return false; } return true; });
  }
  render() { if (this.comp) this.comp.render(); }

  /* ----- 효과 ----- */
  burst(x, y, z, col, n = 8, sp = 4, life = 0.5, size = 0.12) {
    for (let i = 0; i < n; i++) {
      const m = box(size, size, size, M(col, { e: col, ei: 2 }), x, y, z, this.scene); m.castShadow = false;
      const vx = (Math.random() - .5) * sp, vy = Math.random() * sp, vz = (Math.random() - .5) * sp;
      this.fx.push({ m, t: 0, T: life * (0.6 + Math.random() * 0.6), up: (f, dt) => { m.position.x += vx * dt; m.position.y += (vy - 9 * f.t) * dt; m.position.z += vz * dt; } });
    }
  }
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
  groundAt(sx, sy) { const v = new THREE.Vector3(sx / this.W * 2 - 1, -(sy / this.H) * 2 + 1, 0); const rc = new THREE.Raycaster(); rc.setFromCamera(v, this.cam); const t = -rc.ray.origin.y / rc.ray.direction.y; return { x: rc.ray.origin.x + rc.ray.direction.x * t, z: rc.ray.origin.z + rc.ray.direction.z * t }; }
  project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(this.cam); return { x: (v.x + 1) / 2 * this.W, y: (1 - v.y) / 2 * this.H }; }
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
  else if (k === 'potion') { sph(0.3, 8, 6, M(0xd0543a, { e: 0x8a2a20, ei: 1 }), 0, 0, 0, g); cyl(0.1, 0.12, 0.3, 6, M(0xd8d0bc), 0, 0.35, 0, g); }
  g.traverse(o => o.castShadow = false); return g;
}
function zoneMesh(z) {
  const g = new THREE.Group();
  if (z.k === 'tcircle') { const f = mesh(geo('zc', () => new THREE.CircleGeometry(1, 32)), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.25, uniq: true }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.scale.setScalar(z.r); const r = mesh(geo('zr', () => new THREE.RingGeometry(0.94, 1, 40)), M(0xff4a3a, { e: 0xff2a1a, ei: 2, op: 0.8 }), 0, 0.01, 0, g, false); r.rotation.x = -Math.PI / 2; r.scale.setScalar(z.r); g.userData.fill = f; }
  else if (z.k === 'tcone') { const f = mesh(new THREE.CircleGeometry(z.r, 24, -z.arc / 2, z.arc), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.3, uniq: true }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.rotation.z = -z.a; g.userData.fill = f; }
  else if (z.k === 'tline') { const f = mesh(new THREE.PlaneGeometry(z.len, z.w), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.3, uniq: true }), z.len / 2, 0, 0, g, false); f.rotation.x = -Math.PI / 2; g.rotation.y = -z.a; g.userData.fill = f; }
  else if (z.k === 'fire') { for (let i = 0; i < 4; i++) cone(0.35, 1 + Math.random(), 5, M(0x5a1aa0, { e: 0x8a2ad0, ei: 3 }), (Math.random() - .5) * 1.4, 0.5, (Math.random() - .5) * 1.4, g); const f = mesh(geo('zc', () => new THREE.CircleGeometry(1, 32)), M(0x3a0a5a, { e: 0x5a1a8a, ei: 1, op: 0.5 }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.scale.setScalar(z.r); g.traverse(o => o.castShadow = false); }
  else if (z.k === 'rain') { const r = mesh(geo('zr', () => new THREE.RingGeometry(0.94, 1, 40)), M(0xffe08a, { e: 0xffd060, ei: 2, op: 0.7 }), 0, 0.01, 0, g, false); r.rotation.x = -Math.PI / 2; r.scale.setScalar(z.r); g.userData.drops = []; for (let i = 0; i < 10; i++) { const d = box(0.06, 1, 0.06, M(0xe8e0c8, { e: 0xffe08a, ei: 1 }), (Math.random() - .5) * z.r * 1.4, 4, (Math.random() - .5) * z.r * 1.4, g); d.castShadow = false; g.userData.drops.push(d); } }
  else if (z.k === 'ptrap') { box(1.2, 0.12, 1.2, dmetal(), 0, 0.05, 0, g); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const t = cone(0.1, 0.4, 4, metal(), Math.cos(a) * 0.5, 0.25, Math.sin(a) * 0.5, g); t.rotation.z = Math.cos(a) * 0.5; t.rotation.x = -Math.sin(a) * 0.5; } }
  return g;
}
function zoneAnim(E, z, t) {
  const f = E.m.userData.fill;
  if (f && z.T) { const u = 1 - z.t / z.T; f.material.opacity = 0.18 + u * 0.4; if (z.k === 'tcircle') f.scale.setScalar(z.r * (0.2 + 0.8 * u)); }
  if (z.k === 'fire') { E.m.visible = !z.dl; E.m.children.forEach((c, i) => { if (c.geometry.type === 'ConeGeometry') c.scale.y = 0.7 + Math.sin(t * 12 + i) * 0.3; }); }
  if (z.k === 'rain') E.m.userData.drops.forEach((d, i) => { d.position.y = 4 - ((t * 9 + i * 0.37) % 1) * 4; });
}
function lerpA(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }
function clampN(v, a, b) { return v < a ? a : v > b ? b : v; }
function animHero(E, p, dt, t) {
  const m = E.m, u = m.userData; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  E.ph += dt * (p.mv ? 11 : 0); const sw = p.mv ? Math.sin(E.ph) * 0.7 : 0;
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  const base = { knight: [-0.7, -0.6], archer: [-1.4, -1.5], priest: [-1.2, -0.4], squire: [-1.3, -0.6] }[p.role];
  let ar = base[0] - sw * 0.4, al = base[1] + sw * 0.4;
  if (p.an === 'atk') { E.atkT = (E.atkT || 0) + dt * 9; ar = p.role === 'knight' || p.role === 'squire' ? -2.6 + Math.sin(Math.min(E.atkT, 3.14)) * 2.2 : ar - 0.3; } else E.atkT = 0;
  if (p.an === 'skill') ar = -2.8;
  if (p.bk) al = -1.6;
  u.armR.rotation.x = ar; u.armL.rotation.x = al;
  u.body.rotation.set(0, 0, 0); u.body.position.y = 0;
  if (p.ro) { E.rollA = (E.rollA || 0) + dt * 18; u.body.rotation.x = E.rollA; u.body.position.y = -0.6; } else E.rollA = 0;
  if (p.dn) { u.body.rotation.x = -Math.PI / 2 + 0.2; u.body.position.y = 0.4; u.body.position.z = -1; } else u.body.position.z = 0;
  if (u.light) u.light.intensity = (p.dn ? 3 : 15) * (0.9 + Math.sin(t * 13) * 0.1);
}
function animEnemy(E, e, dt, t, view) {
  const m = E.m, u = m.userData; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  E.ph += dt * (e.mv ? 9 : 0); const sw = e.mv ? Math.sin(E.ph) * 0.6 : 0;
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  let ar = -0.9 - sw * 0.3;
  if (e.st === 'wind' || e.st === 'wind2') ar = -2.6 + Math.sin(t * 30) * 0.1;
  if (e.k === 'boss') {
    if (e.ak === 'slam') ar = -3.0; else if (e.ak === 'sweep') { ar = -1.6; u.body.rotation.y = 0.9; } else u.body.rotation.y = 0;
    if (e.ak === 'charge!') { ar = -1.4; u.body.rotation.x = 0.35; } else u.body.rotation.x = e.sn ? 0.5 : 0;
    if (u.light) u.light.intensity = 18 + Math.sin(t * 5) * 6 + (e.ph === 3 ? 14 : 0);
  }
  u.armR.rotation.x = ar;
  m.position.y = 0;
  if (e.st === 'rise') m.position.y = -1.5;
  if (e.hp <= 0) { E.dieT = (E.dieT || 0) + dt; m.position.y = -E.dieT * 1.8; u.body.rotation.z = E.dieT * 1.2; }
  const pop = e.ht ? 1.08 : 1; m.scale.setScalar((E.base || 1) * pop);
  if (e.sn) u.head.rotation.y = t * 6; else u.head.rotation.y = 0;
}

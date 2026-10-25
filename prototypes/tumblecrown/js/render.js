// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 그리기: 로우폴리 입체 모델을 픽셀로 바꿔 그려요 (RenderPixelatedPass, 명암 3단계 재질)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { HEX, RING } from './data.js';
import { TILES, NT, PILLARS, ST } from './sim.js';

let seed = 11; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// 명암을 3단계로만 나눠 조금 납작하게 보여요
const TGRAD = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 195, 195, 195, 255, 255, 255, 255, 255]), 3, 1);
TGRAD.minFilter = TGRAD.magFilter = THREE.NearestFilter; TGRAD.needsUpdate = true;
const MC = new Map();
const M = (c, o = {}) => {
  const key = c + '|' + JSON.stringify(o); if (MC.has(key) && !o.uniq) return MC.get(key);
  const m = o.op ? new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o.op, depthWrite: false, side: o.ds ? THREE.DoubleSide : THREE.FrontSide })
    : new THREE.MeshToonMaterial({ color: c, gradientMap: TGRAD, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
  if (!o.uniq) MC.set(key, m); return m;
};
const GC = new Map();
const geo = (k, f) => { if (!GC.has(k)) GC.set(k, f()); return GC.get(k); };
function mesh(g, m, x, y, z, p, sh = true) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = sh; if (p) p.add(o); return o; }
const box = (w, h, d, m, x, y, z, p) => mesh(geo('b' + [w, h, d], () => new THREE.BoxGeometry(w, h, d)), m, x, y, z, p);
const cyl = (rt, rb, h, s, m, x, y, z, p) => mesh(geo('c' + [rt, rb, h, s], () => new THREE.CylinderGeometry(rt, rb, h, s)), m, x, y, z, p);
const sph = (r, ws, hs, m, x, y, z, p) => mesh(geo('s' + [r, ws, hs], () => new THREE.SphereGeometry(r, ws, hs)), m, x, y, z, p);
const cone = (r, h, s, m, x, y, z, p) => mesh(geo('n' + [r, h, s], () => new THREE.ConeGeometry(r, h, s)), m, x, y, z, p);
const dod = (r, m, x, y, z, p) => mesh(geo('d' + r, () => new THREE.DodecahedronGeometry(r)), m, x, y, z, p);

const GRASS = [0x6cbf4a, 0x74c652, 0x66b744, 0x7acb58], DIRT = 0x8a5a36, ROCK = 0x6e6a78, ROCK2 = 0x58546a;
const SKIN = 0xf2c49b, GLOVE = 0xf6f1e6, BOOT = 0x4a3428;

/* ---------- 싸움꾼 모델: 동그란 몸, 떠 있는 손발 ---------- */
export function makeBrawler(col, wep) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const dark = new THREE.Color(col).multiplyScalar(0.62).getHex(), lite = new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.45).getHex();
  sph(0.56, 12, 9, M(col), 0, 0.95, 0, body).scale.set(1, 0.95, 0.88);
  sph(0.4, 10, 8, M(lite), 0, 0.88, 0.2, body).scale.set(1, 1, 0.7);
  const head = new THREE.Group(); head.position.y = 1.78; body.add(head);
  sph(0.5, 12, 9, M(SKIN), 0, 0, 0, head);
  // 머리띠와 뒤로 날리는 끈
  const band = cyl(0.52, 0.52, 0.16, 12, M(dark), 0, 0.12, 0, head);
  const tail = new THREE.Group(); tail.position.set(0, 0.12, -0.5); head.add(tail);
  for (const s of [-1, 1]) { const t = box(0.1, 0.06, 0.5, M(dark), s * 0.09, 0, -0.22, tail); t.rotation.y = s * 0.3; }
  const eyeM = M(0x1a1420); const eL = box(0.09, 0.15, 0.05, eyeM, -0.16, -0.02, 0.47, head), eR = box(0.09, 0.15, 0.05, eyeM, 0.16, -0.02, 0.47, head);
  box(0.16, 0.04, 0.05, eyeM, -0.17, 0.12, 0.47, head).rotation.z = -0.25; box(0.16, 0.04, 0.05, eyeM, 0.17, 0.12, 0.47, head).rotation.z = 0.25;
  const big = wep === 'fist';
  const gloveM = big ? M(col === 0xd9483b ? 0x9a2a22 : 0xd9483b) : M(GLOVE);
  const handL = new THREE.Group(), handR = new THREE.Group(); handL.position.set(-0.78, 1.0, 0.1); handR.position.set(0.78, 1.0, 0.1); body.add(handL, handR);
  sph(big ? 0.3 : 0.2, 9, 7, gloveM, 0, 0, 0, handL); sph(big ? 0.3 : 0.2, 9, 7, gloveM, 0, 0, 0, handR);
  if (big) for (const h of [handL, handR]) cyl(0.2, 0.22, 0.14, 8, M(GLOVE), 0, 0, -0.26, h).rotation.x = Math.PI / 2;
  const footL = new THREE.Group(), footR = new THREE.Group(); footL.position.set(-0.27, 0.12, 0); footR.position.set(0.27, 0.12, 0); body.add(footL, footR);
  box(0.3, 0.2, 0.46, M(BOOT), 0, 0, 0.06, footL); box(0.3, 0.2, 0.46, M(BOOT), 0, 0, 0.06, footR);
  // 무기는 오른손에
  const wg = new THREE.Group(); handR.add(wg);
  if (wep === 'hammer') {
    cyl(0.07, 0.07, 1.5, 6, M(0x7a5232), 0, 0.55, 0, wg);
    box(0.62, 0.44, 0.44, M(0x9aa0ae), 0, 1.3, 0, wg); box(0.66, 0.14, 0.48, M(col), 0, 1.3, 0, wg);
  } else if (wep === 'spear') {
    const sp = new THREE.Group(); sp.rotation.x = Math.PI / 2; wg.add(sp);
    cyl(0.055, 0.055, 2.6, 6, M(0x8a6240), 0, 0.5, 0, sp); cone(0.15, 0.55, 5, M(0xc8ccd8), 0, 2.05, 0, sp); box(0.3, 0.12, 0.08, M(col), 0, 1.7, 0, sp);
  }
  g.userData = { body, head, handL, handR, footL, footR, wg, tail, eL, eR, wep, big };
  // 무적 시간: 은은한 방울
  const bub = sph(1.25, 12, 9, M(0xbfe8ff, { op: 0.22, uniq: true }), 0, 1.1, 0, g, false); bub.visible = false; g.userData.bub = bub;
  return g;
}

function makeCrown() {
  const g = new THREE.Group(), gm = M(0xf2c14a, { e: 0x8a5a10, ei: 0.6 });
  const ring = mesh(geo('crownR', () => new THREE.CylinderGeometry(0.46, 0.4, 0.34, 10, 1, true)), M(0xf2c14a, { e: 0x8a5a10, ei: 0.6, ds: true }), 0, 0, 0, g);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; cone(0.12, 0.42, 4, gm, Math.sin(a) * 0.43, 0.36, Math.cos(a) * 0.43, g); sph(0.07, 6, 5, M(i % 2 ? 0x3a8ae8 : 0xe83a4a, { e: i % 2 ? 0x1a4aa0 : 0xa01a2a, ei: 1 }), Math.sin(a) * 0.45, 0.05, Math.cos(a) * 0.45, g); }
  ring.castShadow = true;
  return g;
}

/* ---------- 장면 ---------- */
export class View {
  constructor(canvas) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = THREE.PCFShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.05;
    this.ps = 3; this.bloomOn = true; this.vs = 11; this.vsT = 11;
    this.cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 300);
    this.ents = new Map(); this.fx = []; this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.build(); this.resize();
  }
  resize() {
    // 픽셀 칸이 고르게 나오도록 캔버스를 픽셀 크기의 배수로 맞춰요 (지글거림 방지)
    const dpr = devicePixelRatio || 1, P = Math.max(1, Math.round(this.ps * dpr)); this.P = P;
    const w = Math.ceil(innerWidth * dpr / P) * P, h = Math.ceil(innerHeight * dpr / P) * P; this.W = w; this.H = h;
    this.r.setPixelRatio(1); this.r.setSize(w, h, false);
    this.cssW = w / dpr; this.cssH = h / dpr; this.r.domElement.style.width = this.cssW + 'px'; this.r.domElement.style.height = this.cssH + 'px';
    this.fit(true);
    if (this.comp) { this.comp.setSize(w, h); this.pp.setPixelSize(P); }
  }
  // 섬 전체가 화면에 들어오게 크기를 맞춰요 (카메라는 움직이지 않아요)
  fit(now) {
    const asp = this.W / this.H, rw = HEX * Math.sqrt(3) * ((this.ring ?? RING) + 0.6);
    this.vsT = Math.max((rw + 1.5) / asp, rw * 0.62 + 2.6, 6.5);
    if (now) this.vs = this.vsT; this.applyVs();
  }
  applyVs() { const asp = this.W / this.H, v = this.vs; this.cam.left = -v * asp; this.cam.right = v * asp; this.cam.top = v + 1; this.cam.bottom = -v + 1; this.cam.updateProjectionMatrix(); }
  setPixel(ps) { this.ps = ps; this.resize(); }
  setBloom(on) { this.bloomOn = on; if (this.bloom) this.bloom.enabled = on; }

  build() {
    const s = this.scene = new THREE.Scene();
    // 하늘: 위는 짙은 파랑, 아래는 옅은 하늘색
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#3f7fd0'); gr.addColorStop(0.6, '#86bfe8'); gr.addColorStop(1, '#d6ecf4'); cx.fillStyle = gr; cx.fillRect(0, 0, 2, 64);
    const bt = new THREE.CanvasTexture(cv); bt.colorSpace = THREE.SRGBColorSpace; s.background = bt;
    s.add(new THREE.AmbientLight(0x8aa0c8, 0.9)); s.add(new THREE.HemisphereLight(0xcfe8ff, 0x6a5a40, 1.1));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(-14, 30, 16); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 }); sun.shadow.bias = -0.0008; s.add(sun);
    // 섬 타일
    this.tiles = []; this.tlState = new Uint8Array(NT);
    const topG = geo('htop', () => new THREE.CylinderGeometry(HEX * 0.97, HEX * 0.97, 0.5, 6)), dirtG = geo('hdirt', () => new THREE.CylinderGeometry(HEX * 0.95, HEX * 0.62, 1.7, 6));
    this.crackM = M(0xb08a4a); this.crackM2 = M(0xc0623a);
    for (let i = 0; i < NT; i++) {
      const T = TILES[i], g = new THREE.Group(); g.position.set(T.x, 0, T.z); s.add(g);
      const gm = M(GRASS[(R() * 4) | 0]);
      const top = mesh(topG, gm, 0, -0.25, 0, g); mesh(dirtG, M(DIRT), 0, -1.35, 0, g);
      const rl = 0.8 + R() * (T.ring >= RING - 1 ? 2.2 : 1.2); cone(HEX * 0.5, rl, 5, M(R() < 0.5 ? ROCK : ROCK2), (R() - 0.5) * 0.4, -2.2 - rl / 2, (R() - 0.5) * 0.4, g).rotation.x = Math.PI;
      if (!PILLARS.includes(i) && R() < 0.35) for (let k = 0; k < 3; k++) cone(0.07, 0.3, 3, M(0x4f9a3a), (R() - 0.5) * 1.8, 0.1, (R() - 0.5) * 1.8, g).castShadow = false;
      if (!PILLARS.includes(i) && R() < 0.12) { const fc = [0xffe14a, 0xff7aa8, 0xffffff][(R() * 3) | 0]; const fx = (R() - 0.5) * 1.6, fz = (R() - 0.5) * 1.6; cyl(0.02, 0.02, 0.24, 3, M(0x3f8a30), fx, 0.12, fz, g); sph(0.08, 5, 4, M(fc), fx, 0.26, fz, g).castShadow = false; }
      if (PILLARS.includes(i)) { dod(0.95, M(ROCK), 0, 0.6, 0, g).rotation.y = R() * 3; dod(0.75, M(ROCK2), 0.1, 1.6, -0.05, g).rotation.y = R() * 3; dod(0.5, M(ROCK), -0.05, 2.4, 0.05, g); cone(0.3, 0.3, 5, M(0x5aa040), 0, 2.85, 0, g).castShadow = false; }
      this.tiles.push({ g, top, gm, vy: 0, fall: 0, grow: 0 });
    }
    // 섬 아래로 늘어진 큰 바위
    for (let k = 0; k < 9; k++) { const a = R() * 6.28, d = R() * 6; const c = cone(1.6 + R() * 1.4, 4 + R() * 4, 6, M(k % 2 ? ROCK : ROCK2), Math.cos(a) * d, -5.5 - R() * 2, Math.sin(a) * d, s); c.rotation.x = Math.PI; }
    // 아래로 흘러가는 구름과 멀리 떠 있는 작은 섬
    this.clouds = [];
    for (let k = 0; k < 14; k++) {
      const c = new THREE.Group(); c.position.set((R() - 0.5) * 90, -12 - R() * 10, (R() - 0.5) * 60 - 10); s.add(c);
      for (let j = 0; j < 4; j++) dod(1.6 + R() * 1.6, M(0xffffff), j * 2 - 3, R(), (R() - 0.5) * 2, c).castShadow = false;
      c.scale.y = 0.55; this.clouds.push({ c, v: 0.35 + R() * 0.5 });
    }
    for (const [x, y, z, n] of [[-34, -6, -18, 3], [36, -9, -8, 2], [24, -3, -30, 2], [-28, -12, 14, 2]]) {
      const g = new THREE.Group(); g.position.set(x, y, z); s.add(g);
      for (let k = 0; k < n; k++) { cyl(HEX * 0.97, HEX * 0.97, 0.5, 6, M(GRASS[k % 4]), k * 2.4 - 2, 0, (k % 2) * 1.3, g); cone(HEX * 0.8, 3, 5, M(ROCK2), k * 2.4 - 2, -1.8, (k % 2) * 1.3, g).rotation.x = Math.PI; }
    }
    // 왕관
    this.crown = makeCrown(); s.add(this.crown);
    this.crownL = new THREE.PointLight(0xffd070, 18, 7, 1.6); s.add(this.crownL);
    this.beam = mesh(geo('beam', () => new THREE.CylinderGeometry(0.5, 0.5, 14, 10, 1, true)), M(0xffe08a, { op: 0.16, ds: true }), 0, 7, 0, s, false);
    this.ringMk = mesh(geo('ringMk', () => new THREE.RingGeometry(0.9, 1.15, 16)), M(0xffd36b, { op: 0.6, ds: true }), 0, 0.03, 0, s, false); this.ringMk.rotation.x = -Math.PI / 2;
    // 효과용 재질
    this.fxShock = M(0xfff4d0, { op: 0.6, ds: true, uniq: true });
    this.comp = new EffectComposer(this.r); this.pp = new RenderPixelatedPass(this.P || 3, s, this.cam, { normalEdgeStrength: 0.25, depthEdgeStrength: 0.45 });
    this.comp.addPass(this.pp); this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.18, 0.2, 0.96); this.bloom.enabled = this.bloomOn; this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
    // 고정 카메라: 비스듬히 내려다봐요
    this.cam.position.set(0, 26, 30); this.cam.lookAt(0, 0, 0); this.cam.updateMatrixWorld();
  }

  // 타일 상태를 화면에 맞춰요
  setTiles(tl, dt, t) {
    for (let i = 0; i < NT; i++) {
      const v = +tl[i], o = this.tlState[i], T = this.tiles[i];
      if (v !== o) {
        if (v === 2) { T.fall = 0.001; T.vy = 0; this.dust(TILES[i].x, 0, TILES[i].z, 6); }
        else if (o === 2) { T.fall = 0; T.grow = 0.001; T.g.visible = true; T.g.rotation.set(0, 0, 0); }
        if (v === 1) T.top.material = this.crackM; else if (v === 0 || v === 3) T.top.material = T.gm;
        this.tlState[i] = v;
      }
      if (v === 1) { T.g.position.y = -0.06 - Math.abs(Math.sin(t * 3 + i)) * 0.06; }
      else if (T.fall > 0) { T.fall += dt; T.vy -= 22 * dt; T.g.position.y += T.vy * dt; T.g.rotation.x += dt * 0.6; T.g.rotation.z += dt * 0.4; if (T.g.position.y < -40) T.g.visible = false; }
      else if (T.grow > 0) { T.grow = Math.min(1, T.grow + dt * 1.8); const k = 1 - Math.pow(1 - T.grow, 3); T.g.position.y = -6 * (1 - k); if (T.grow >= 1) T.grow = 0; }
      else T.g.position.y = 0;
    }
  }
  resetTiles() { for (let i = 0; i < NT; i++) { const T = this.tiles[i]; T.fall = 0; T.grow = 0; T.g.visible = true; T.g.position.y = 0; T.g.rotation.set(0, 0, 0); T.top.material = T.gm; this.tlState[i] = 0; } }

  // 플레이어 모델 목록 맞추기
  setPlayers(list) {
    for (const [id, e] of this.ents) { this.scene.remove(e.g); }
    this.ents.clear();
    for (const p of list) { const g = makeBrawler(p.col, p.wep); this.scene.add(g); this.ents.set(p.id, { g, x: 0, y: 0, z: 0, ry: 0, init: false, rt: 0, spd: 0, wep: p.wep }); }
  }

  /* 한 장면 그리기: snap = 방장이 보낸(또는 내가 만든) 장면 */
  update(snap, dt, t) {
    if (snap) {
      if (snap.ring !== this.ring) { this.ring = snap.ring; this.fit(false); }
      this.setTiles(snap.tl, dt, t);
      for (const a of snap.p) this.syncPlayer(a, dt, t, snap);
      const [cx, cy, cz, ch] = snap.c, C = this.crown;
      if (ch) {
        const e = this.ents.get(ch); if (e) { C.position.set(e.g.position.x, e.g.position.y + 2.35 + Math.sin(t * 4) * 0.04, e.g.position.z); C.rotation.y += dt * 1.5; C.scale.setScalar(0.9); }
        this.beam.visible = false; this.ringMk.visible = false;
      } else {
        const k = 1 - Math.exp(-dt * 18); C.position.x += (cx - C.position.x) * k; C.position.y += (cy + 0.25 + Math.sin(t * 3) * 0.12 - C.position.y) * k; C.position.z += (cz - C.position.z) * k;
        if (Math.abs(cx - C.position.x) > 4 || Math.abs(cz - C.position.z) > 4) C.position.set(cx, cy, cz);
        C.rotation.y += dt * 2.2; C.scale.setScalar(1.15); C.visible = cy > -40;
        this.beam.visible = cy > -2 && cy < 3; this.beam.position.set(C.position.x, 7, C.position.z); this.ringMk.visible = this.beam.visible; this.ringMk.position.set(C.position.x, 0.03, C.position.z); this.ringMk.rotation.z += dt;
      }
      C.visible = ch ? true : cy > -40;
      this.crownL.position.set(C.position.x, C.position.y + 1.2, C.position.z); this.crownL.intensity = C.visible ? 18 : 0;
    }
    for (const c of this.clouds) { c.c.position.x += c.v * dt; if (c.c.position.x > 50) c.c.position.x = -50; }
    // 섬이 줄어들면 천천히 다가가요
    if (Math.abs(this.vs - this.vsT) > 0.01) { this.vs += (this.vsT - this.vs) * Math.min(1, dt * 1.5); this.applyVs(); }
    this.stepFx(dt);
  }
  syncPlayer(a, dt, t, snap) {
    const [id, x, y, z, fx, fz, st, sa, chg, pct, score, ko, falls, inv, ax, az] = a; const e = this.ents.get(id); if (!e) return;
    const g = e.g, u = g.userData;
    if (!e.init || Math.hypot(x - e.x, z - e.z) > 5 || (st !== ST.out && e.st === ST.out)) { e.x = x; e.y = y; e.z = z; e.init = true; }
    const k = 1 - Math.exp(-dt * 20), px = e.x, pz = e.z;
    e.x += (x - e.x) * k; e.y += (y - e.y) * k; e.z += (z - e.z) * k;
    const sp = Math.hypot(e.x - px, e.z - pz) / Math.max(dt, 1e-3); e.spd += (sp - e.spd) * Math.min(1, dt * 10);
    if (e.st !== st) { e.st = st; e.sa0 = t - sa; }
    const s = Math.max(0, t - (e.sa0 ?? t));
    g.visible = st !== ST.out; g.position.set(e.x, e.y, e.z);
    let ry = Math.atan2(fx, fz); if (st === ST.charge || st === ST.swing || st === ST.slam || st === ST.lunge || st === ST.grab) ry = Math.atan2(ax, az);
    let d = ry - e.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); e.ry += d * Math.min(1, dt * 18); g.rotation.y = e.ry;
    u.bub.visible = !!inv; if (inv) u.bub.material.opacity = 0.14 + Math.sin(t * 3) * 0.05;
    // 동작: 아주 크게
    const B = u.body, hR = u.handR, hL = u.handL, fL = u.footL, fR = u.footR, W = u.wg;
    B.position.set(0, 0, 0); B.rotation.set(0, 0, 0); B.scale.set(1, 1, 1); hR.position.set(0.78, 1.0, 0.1); hL.position.set(-0.78, 1.0, 0.1); hR.rotation.set(0, 0, 0); hL.rotation.set(0, 0, 0);
    fL.position.set(-0.27, 0.12, 0); fR.position.set(0.27, 0.12, 0); fL.rotation.set(0, 0, 0); fR.rotation.set(0, 0, 0); W.rotation.set(0, 0, 0); W.position.set(0, 0, 0); u.head.rotation.set(0, 0, 0);
    u.tail.rotation.x = 0.2 + Math.sin(t * 9) * 0.15;
    const wep = u.wep, run = Math.min(1, e.spd / 5);
    if (st === ST.idle || st === ST.run) {
      const ph = t * 13;
      B.position.y = Math.sin(t * 3) * 0.03 * (1 - run) + Math.abs(Math.sin(ph)) * 0.16 * run; B.rotation.x = 0.22 * run;
      fL.position.z = Math.sin(ph) * 0.42 * run; fR.position.z = -Math.sin(ph) * 0.42 * run; fL.position.y = 0.12 + Math.max(0, Math.cos(ph)) * 0.2 * run; fR.position.y = 0.12 + Math.max(0, -Math.cos(ph)) * 0.2 * run;
      hL.position.z = 0.1 - Math.sin(ph) * 0.45 * run; hR.position.z = 0.1 + Math.sin(ph) * 0.45 * run; hL.position.y = hR.position.y = 1.0 + Math.sin(t * 3) * 0.04;
      u.head.rotation.y = Math.sin(t * 0.9) * 0.25 * (1 - run);
      if (wep === 'hammer') { W.rotation.x = 0.35; } else if (wep === 'spear') { W.rotation.x = -0.15; }
    } else if (st === ST.charge) {
      const c = chg, j = c >= 1 ? Math.sin(t * 40) * 0.03 : 0;
      B.scale.set(1 + c * 0.14, 1 - c * 0.2, 1 + c * 0.14); B.rotation.x = -0.15 * c; B.position.x = j;
      if (wep === 'hammer') { hR.position.set(0.5, 1.4 + c * 0.5, -0.3 - c * 0.3); W.rotation.x = -0.6 - c * 1.9; hL.position.set(0.1, 1.35 + c * 0.4, -0.2 - c * 0.2); B.rotation.y = 0.3 * c; }
      else if (wep === 'spear') { hR.position.set(0.55, 1.15, -0.25 - c * 0.7); W.rotation.x = 0; hL.position.set(-0.3, 1.1, 0.4 - c * 0.3); B.rotation.y = 0.5 * c; }
      else { hR.position.set(0.65, 1.15, -0.3 - c * 0.6); hL.position.set(-0.55, 1.2, 0.45); B.rotation.y = 0.6 * c; }
      fL.position.z = 0.25; fR.position.z = -0.25;
    } else if (st === ST.swing) {
      const f = Math.min(1, s / 0.09), o = 1 - Math.min(1, Math.max(0, s - 0.12) / 0.2);
      B.rotation.x = 0.35 * f * o; B.scale.set(1 - 0.08 * f * o, 1 + 0.12 * f * o, 1 + 0.1 * f * o);
      if (wep === 'hammer') { hR.position.set(0.3, 1.0 + 0.6 * (1 - f), 0.6 * f); W.rotation.x = -2.4 + f * 3.9; hL.position.set(-0.1, 1.0, 0.5 * f); B.rotation.y = 0.3 - 0.9 * f * o; }
      else if (wep === 'spear') { hR.position.set(0.4, 1.15, -0.3 + f * 1.3); hL.position.set(-0.2, 1.1, 0.2 + f * 0.6); B.rotation.y = 0.5 - 0.9 * f * o; }
      else { const L = (Math.floor(t * 0) % 2); hR.position.set(0.35, 1.2, -0.2 + f * 1.25); B.rotation.y = 0.6 - 1.1 * f * o; hL.position.set(-0.6, 1.1, 0.2); void L; }
      fL.position.z = 0.35 * f; fR.position.z = -0.3 * f;
    } else if (st === ST.dash) {
      B.rotation.x = 0.6; B.scale.set(0.88, 0.86, 1.3); hL.position.set(-0.7, 1.1, -0.5); hR.position.set(0.7, 1.1, -0.5); fL.position.z = -0.4; fR.position.z = -0.5; fL.position.y = fR.position.y = 0.3;
      if (Math.random() < dt * 30) this.puff(e.x, e.y + 0.2, e.z);
    } else if (st === ST.stun) {
      const tw = s * 16; B.rotation.set(Math.sin(tw) * 0.5 - 0.4, 0, Math.cos(tw) * 0.6); B.position.y = 0.2;
      hL.position.set(-0.95, 1.6 + Math.sin(tw) * 0.3, 0); hR.position.set(0.95, 1.6 - Math.sin(tw) * 0.3, 0); fL.position.set(-0.4, 0.3, -0.3 + Math.sin(tw) * 0.3); fR.position.set(0.4, 0.3, 0.3 - Math.sin(tw) * 0.3);
      if (e.y > 0.5 || e.y < -0.5) B.rotation.x = -s * 9;
    } else if (st === ST.slam) {
      const f = Math.min(1, s / 0.34); B.scale.set(1 - 0.1 * f, 1 + 0.18 * f, 1 - 0.1 * f); B.position.y = 0.5 * Math.sin(f * Math.PI * 0.5); B.rotation.x = -0.4 * f;
      hR.position.set(0.25, 1.4 + f * 1.0, -0.2); hL.position.set(-0.25, 1.4 + f * 0.9, -0.2); W.rotation.x = -0.4 - f * 2.4;
    } else if (st === ST.lunge) {
      B.rotation.x = 0.7; B.scale.set(0.9, 0.85, 1.35); hR.position.set(0.3, 1.1, 1.1); hL.position.set(-0.2, 1.05, 0.7); fL.position.z = -0.6; fR.position.z = -0.4; fL.position.y = fR.position.y = 0.35;
      if (Math.random() < dt * 30) this.puff(e.x, e.y + 0.2, e.z);
    } else if (st === ST.grab) {
      const f = Math.min(1, s / 0.42); B.rotation.y = -f * Math.PI * 1.1; B.rotation.x = -0.2; hL.position.set(-0.35, 1.3, 0.75); hR.position.set(0.35, 1.3, 0.75);
    } else if (st === ST.held) {
      const tw = t * 22; B.rotation.set(0.3, 0, Math.sin(tw) * 0.4); hL.position.set(-1, 1.5 + Math.sin(tw) * 0.4, 0); hR.position.set(1, 1.5 - Math.sin(tw) * 0.4, 0); fL.position.y = 0.3 + Math.sin(tw) * 0.25; fR.position.y = 0.3 - Math.sin(tw) * 0.25;
    }
    if (st === ST.charge && chg >= 1 && Math.random() < dt * 14) this.spark(e.x + (Math.random() - 0.5), e.y + 1.4 + Math.random(), e.z + (Math.random() - 0.5), 0xfff0a0);
    if (wep === 'fist') { hR.scale.setScalar(1); }
  }

  /* ---------- 효과 ---------- */
  addFx(m, T, up) { this.fx.push({ m, t: 0, T, up }); }
  burst(x, y, z, col, n, sp, life = 0.5, size = 0.14) {
    for (let i = 0; i < n; i++) {
      const m = box(size, size, size, M(col), x, y, z, this.scene); m.castShadow = false;
      const vx = (Math.random() - 0.5) * sp, vy = Math.random() * sp * 0.8 + 1, vz = (Math.random() - 0.5) * sp;
      this.addFx(m, life * (0.6 + Math.random() * 0.6), (f, dt) => { m.position.x += vx * dt; m.position.y += (vy - 14 * f.t) * dt; m.position.z += vz * dt; m.scale.setScalar(1 - f.t / f.T); });
    }
  }
  spark(x, y, z, col) { const m = box(0.12, 0.12, 0.12, M(col, { e: col, ei: 2 }), x, y, z, this.scene); m.castShadow = false; this.addFx(m, 0.35, (f, dt) => { m.position.y += dt * 2; m.scale.setScalar(1 - f.t / f.T); }); }
  puff(x, y, z) { const m = dod(0.25, M(0xf2ede0), x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4, this.scene); m.castShadow = false; this.addFx(m, 0.4, (f, dt) => { m.position.y += dt * 1.2; m.scale.setScalar(1 + f.t * 2 - (f.t / f.T) * 1.5); }); }
  dust(x, y, z, n) { for (let i = 0; i < n; i++) this.puff(x + (Math.random() - 0.5) * 2, y + Math.random() * 0.4, z + (Math.random() - 0.5) * 2); }
  shock(x, z, r, col = 0xfff4d0) {
    const m = mesh(geo('shock', () => new THREE.RingGeometry(0.75, 1, 24)), M(col, { op: 0.7, ds: true, uniq: true }), x, 0.08, z, this.scene, false); m.rotation.x = -Math.PI / 2;
    this.addFx(m, 0.35, f => { const k = f.t / f.T; m.scale.setScalar(0.4 + k * r); m.material.opacity = 0.7 * (1 - k); }, true);
  }
  star(x, y, z, s) {
    // 맞은 자리에 별 모양 번쩍임 (짧게 한 번만)
    const g = new THREE.Group(); g.position.set(x, y, z); this.scene.add(g);
    for (let i = 0; i < 4; i++) { const b = box(0.12, 0.12, 0.8 + s * 0.04, M(0xffffff, { e: 0xfff0b0, ei: 2 }), 0, 0, 0, g); b.castShadow = false; b.rotation.y = i * Math.PI / 4; }
    this.addFx(g, 0.16, f => { const k = f.t / f.T; g.scale.setScalar(0.6 + k * 1.2); g.rotation.y += 0.05; });
  }
  stepFx(dt) {
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i]; f.t += dt; f.up(f, dt);
      if (f.t >= f.T) { this.scene.remove(f.m); if (f.m.material && f.m.material.userData && 0) f.m.material.dispose(); this.fx.splice(i, 1); }
    }
  }
  onEvent(e, ents) {
    const P = id => this.ents.get(id);
    if (e.k === 'hit') { const n = Math.min(20, 4 + e.s); this.burst(e.x, e.y, e.z, 0xfff6d8, n, 3 + e.s * 0.35, 0.45); this.star(e.x, e.y, e.z, e.s); if (e.s >= 14) this.burst(e.x, e.y, e.z, 0xffc040, 6, 8, 0.6, 0.18); }
    else if (e.k === 'slam') { this.shock(e.x, e.z, 3.6); this.burst(e.x, 0.2, e.z, 0x8a5a36, 14, 7, 0.7, 0.2); this.dust(e.x, 0, e.z, 6); }
    else if (e.k === 'dash') { const p = P(e.id); if (p) this.dust(p.x, 0, p.z, 2); }
    else if (e.k === 'pick') { const p = P(e.id); if (p) { this.burst(p.x, 2.6, p.z, 0xffd36b, 14, 5, 0.6); this.shock(p.x, p.z, 2.4, 0xffe08a); } }
    else if (e.k === 'spawn') { const p = P(e.id); if (p) p.init = false; }
    else if (e.k === 'tfall') { }
    else if (e.k === 'swing') { const p = P(e.id); if (p && e.c >= 0.9) this.shock(p.x, p.z, 1.6, 0xfff0a0); }
  }

  // 3D 위치를 화면 위치로
  project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(this.cam); return { x: (v.x + 1) / 2 * this.cssW, y: (1 - v.y) / 2 * this.cssH }; }
  // 화면 위치를 바닥 위치로 (마우스 조준)
  ground(cx, cy, h = 0) {
    const v = new THREE.Vector2(cx / this.cssW * 2 - 1, -(cy / this.cssH) * 2 + 1); this.ray.setFromCamera(v, this.cam); this.plane.constant = -h;
    const o = new THREE.Vector3(); return this.ray.ray.intersectPlane(this.plane, o) ? o : null;
  }
  render() { this.comp.render(); }
}

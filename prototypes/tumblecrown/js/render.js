// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 화면 그리기: three.js 입체 모델을 픽셀로 바꿔 그려요 (RenderPixelatedPass)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { ROLES, MAP, CH, FOES, COSMETICS } from './data.js';
import { CS, MW, MH, GRID, WATER, PILLARS, cw, chapterIndex, SEC, SOPEN, GATE, CUT, HGT, LEDGE_H, hAt, pillarAt } from './map.js';
// 화면에서 '바닥'은 비밀 방(SEC)을 뺀 곳이에요. 비밀 방은 따로 그려 두고 벽이 무너질 때 보여요. 창살문(GATE) 자리는 닫혀 있어도 바닥으로 그려요
const floorCell = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH && (GRID[j * MW + i] === 1 || GATE[j * MW + i] > 0) && !SEC[j * MW + i] && CUT[j * MW + i] !== 4 && CUT[j * MW + i] !== 1;
// 낭떠러지·절벽·승강기 칸 (벽을 세우지 않아요)
const cutCell = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH && CUT[j * MW + i] > 0 && CUT[j * MW + i] !== 3 && CUT[j * MW + i] !== 5;
const cellH = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH ? HGT[j * MW + i] * LEDGE_H : 0;
// 어둠의 방 안쪽 칸인지 (횃불·빛줄기를 달지 않아요)
const inDark = (i, j) => MAP.darks.some(({ room: [x, y, w, h] }) => i >= x - 1 && i <= x + w && j >= y - 1 && j <= y + h);

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
  frost: { bg: 0x04070c, fog: 0x0e1622, amb: 0x5a6a8a, hemi: 0xb0c8e8, floor: [0x5a6470, 0x626c7a, 0x6a7482, 0x56606c, 0x667080], bfloor: [0x4a5868, 0x526070, 0x5a6878, 0x465464, 0x56647a], wet: [0x7a98b8, 0x82a0c0, 0x7090b0, 0x88a8c8], wall: [0x4e5866, 0x56606e, 0x5e6878, 0x48525e], bwall: [0x3e4c5e, 0x465466, 0x4e5c70, 0x3a4658], top: 0xc8d8e8, moss: 0xd8e8f8, mossP: 0.12, torch: 0x9ad8ff, water: 0x8ab8e0, ring: 0x4aa0e0, fz: [0x3a7ab0, 0x9ad8ff], ember: [0xf0f8ff, 0xc8e0ff], banner: 0x2a4a6a },
  mine: { bg: 0x060403, fog: 0x120c08, amb: 0x5a4a3a, hemi: 0xb09878, floor: [0x4a4034, 0x524638, 0x5a4e40, 0x463c30, 0x54483a], bfloor: [0x3e3428, 0x463a2c, 0x4e4030, 0x3a3024, 0x4a3e2e], wet: [0x3a3a36, 0x40403a, 0x363632, 0x44443e], wall: [0x4a3e30, 0x524636, 0x5a4c3a, 0x44382c], bwall: [0x3a3026, 0x42362a, 0x4a3c2e, 0x362c22], top: 0x2a2018, moss: 0x5a8a9a, mossP: 0.05, torch: 0xffb060, water: 0x3a5a5a, ring: 0xc08a30, fz: [0x8a5a20, 0xffb050], ember: [0xffc070, 0xff9a40], banner: 0x5a3a1a },
  temple: { bg: 0x0a0402, fog: 0x1a0a04, amb: 0x7a4a30, hemi: 0xe0a070, floor: [0x6a5a44, 0x72624a, 0x7a6a50, 0x665640, 0x76664c], bfloor: [0x6a4a30, 0x725036, 0x7a583a, 0x66462c, 0x765436], wet: [0x8a3a10, 0x9a4414, 0x7a320c, 0xa04a18], wall: [0x5a4a36, 0x62523c, 0x6a5a42, 0x544430], bwall: [0x6a3a20, 0x724026, 0x7a4628, 0x64361c], top: 0x3a2a1a, moss: 0x8a6a2a, mossP: 0.03, torch: 0xffa040, water: 0xd05a10, ring: 0xff8a20, fz: [0xc04a10, 0xffa030], ember: [0xffc060, 0xff7a20], banner: 0x8a2a10, windows: 1 },
  // 끝없는 심연: 별이 흩어진 검푸른 허공 위에 떠 있는 청록빛 돌길
  deep: { bg: 0x010308, fog: 0x020810, amb: 0x2a4a6a, hemi: 0x6ac0d0, floor: [0x1e3440, 0x223a48, 0x1a2e3a, 0x26404e, 0x1c3240], bfloor: [0x16283a, 0x1a2e42, 0x14243a, 0x1e3448, 0x182a3e], wet: [0x1a4a5a, 0x1e5264, 0x16404e, 0x22586a], wall: [0x1a2838, 0x1e2e40, 0x223448, 0x162432], bwall: [0x142238, 0x182840, 0x1c2e48, 0x121e32], top: 0x0a1420, moss: 0x2ae0c0, mossP: 0.07, torch: 0x6af0e0, water: 0x1a6a8a, ring: 0x2ae0c0, fz: [0x1a6a8a, 0x6af0e0], ember: [0x9af8ff, 0x4ad8e0], banner: 0x0a3a4a },
  abyss: { bg: 0x040208, fog: 0x0c0614, amb: 0x4a3a6a, hemi: 0x9a80c8, floor: [0x3a3444, 0x423a4c, 0x4a4254, 0x36303e, 0x463e50], bfloor: [0x2e2440, 0x362a48, 0x3e3050, 0x2a203a, 0x3a2c4c], wet: [0x3a2a5a, 0x423064, 0x36264e, 0x4a366a], wall: [0x36303e, 0x3e3646, 0x463e50, 0x302a38], bwall: [0x2e2240, 0x362848, 0x3e2e52, 0x2a1e3a], top: 0x1e1828, moss: 0x5a3a8a, mossP: 0.08, torch: 0xc08aff, water: 0x5a3a9a, ring: 0xb06aff, fz: [0x5a1aa0, 0xb06aff], ember: [0xd0a0ff, 0xa06ae0], banner: 0x3a1a5a },
  tower: { bg: 0x0a0505, fog: 0x160a08, amb: 0x6a4a4a, hemi: 0xc89a8a, floor: [0x4a4040, 0x524646, 0x5a4c4a, 0x463c3c, 0x54484a], bfloor: [0x4a3030, 0x523434, 0x5a3a36, 0x462c2c, 0x503432], wet: [0x3a3440, 0x403848, 0x36303c, 0x443c4c], wall: [0x4a3a36, 0x52423c, 0x5a4842, 0x443430], bwall: [0x5a2a22, 0x622e26, 0x6a3428, 0x52261e], top: 0x2e2220, moss: 0x5a4a2a, mossP: 0.04, torch: 0xff7a30, water: 0x6a3a2a, ring: 0xc04a10, fz: [0xa03a10, 0xff6a20], ember: [0xffa040, 0xff6a20], banner: 0x3a3a3a }
};
// 장마다 다른 기사단 깃발 색 (1장부터 8장까지)
const FLAG_COL = [0x7a1f22, 0x2e5a2a, 0x2a4a8a, 0x4a4a4a, 0x2a5a7a, 0x6a4a1a, 0x8a2a10, 0x4a1a6a];
const THEME = () => THEMES[CH.theme] || THEMES.dungeon;

/* ---------- 캐릭터 모델 ---------- */
const HERO = {
  knight: { body: 0x3f6fd0, leg: 'dm', arm: 'mt', helm: 1, sword: 2, shield: 1, cape: 0x24479a, belt: 1 },
  archer: { body: 0x467a3e, leg: 0x3a3a44, arm: 0x467a3e, hood: 0x2f5a32, bow: 1, quiver: 1, belt: 1 },
  priest: { body: 0xe8e4ef, robe: 1, leg: 0x9a96a8, arm: 0xe8e4ef, hood: 0xcfc8dc, staff: 1 },
  squire: { body: 0x8a6a44, leg: 0x4a4250, arm: 0x8a6a44, cap: 0xb9443a, torch: 1, sack: 1, belt: 1 },
  viking: { body: 0x7a5a3a, leg: 0x4a3a2a, arm: 0xe8b48a, helm: 1, helmC: 0x8a8f9c, horns: 1, beard: 0xd07a2a, axe: 1, fur: 1, belt: 1, wide: 1.12 },
  mamluk: { body: 0xb0302a, leg: 0xe8dcc0, arm: 0xb0302a, turban: 1, scim: 1, buckler: 1, belt: 1 },
  witch: { body: 0x4a2a6a, robe: 1, leg: 0x2a1a3a, arm: 0x4a2a6a, skinC: 0xb8d0a0, hat: 1, staff: 1, staffC: 0xc06aff },
  skeleton: { skel: 1 }
};
// 동작은 비슷한 직업의 것을 같이 써요 (마녀는 사제처럼, 바이킹·맘루크·스켈레톤은 종자처럼)
const FAM = { witch: 'priest', viking: 'squire', mamluk: 'squire', skeleton: 'squire' };
function matOf(v) { return v === 'dm' ? dmetal() : v === 'mt' ? metal() : M(v); }
export const makeHero = toonify(function (role, cos) {
  const o = Object.assign({}, HERO[role]), cp = cos && COSMETICS.cape.items.find(i => i.id === cos.cape && i.col);
  if (cp) o.cape = cp.col;
  const g = o.skel ? makeSkel_('skel') : makeFigure(o); g.userData.role = role; if (cos && !o.skel) dressHero(g, cos); return g;
});
// 꾸밈: 투구 장식, 방패(없으면 가슴) 문장
function dressHero(g, cos) {
  const u = g.userData, head = u.head, hy = HERO[g.userData.role] && HERO[g.userData.role].helm ? 0.45 : 0.1, lit = c => M(c, { e: c, ei: 1.2 }), hold = [];
  if (cos.helm === 'plume') for (let i = 0; i < 3; i++) { const p = cone(0.13, 0.9 - i * 0.12, 5, M(0xc02a2a), 0, hy + 0.95 - i * 0.04, -0.12 - i * 0.14, head); p.rotation.x = -0.5 - i * 0.25; }
  else if (cos.helm === 'horns') for (const sx of [-1, 1]) { const h = cone(0.11, 0.85, 5, bone(), sx * 0.44, hy + 0.35, 0, head); h.rotation.z = -sx * 0.75; }
  else if (cos.helm === 'wreath') { const w = mesh(geo('wreath', () => new THREE.TorusGeometry(0.46, 0.055, 4, 14)), M(0x6aa04a), 0, hy + 0.2, 0, head); w.rotation.x = Math.PI / 2; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; sph(0.07, 5, 4, gold(), Math.cos(a) * 0.46, hy + 0.2, Math.sin(a) * 0.46, head); } }
  else if (cos.helm === 'crown') { cyl(0.44, 0.46, 0.18, 8, gold(), 0, hy + 0.55, 0, head); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; cone(0.07, 0.3, 4, gold(), Math.cos(a) * 0.42, hy + 0.78, Math.sin(a) * 0.42, head); } }
  if (cos.emblem) {
    const par = u.shield || u.body, z = u.shield ? 0.14 : 0.64, y = u.shield ? 0.08 : 1.7, s = u.shield ? 1 : 0.75, gm = lit(0xf0d070);
    const e = new THREE.Group(); e.position.set(0, y, z); e.scale.setScalar(s); par.add(e);
    if (cos.emblem === 'cross') { box(0.16, 0.7, 0.05, gm, 0, 0, 0, e); box(0.5, 0.16, 0.05, gm, 0, 0.1, 0, e); }
    else if (cos.emblem === 'star') for (let i = 0; i < 5; i++) { const c = cone(0.1, 0.42, 4, gm, 0, 0, 0, e); c.position.set(Math.sin(i * 1.2566) * 0.2, Math.cos(i * 1.2566) * 0.2, 0); c.rotation.z = -i * 1.2566; }
    else if (cos.emblem === 'flame') { cone(0.22, 0.7, 5, lit(0xff7a2a), 0, 0, 0, e); cone(0.12, 0.45, 5, lit(0xffd060), 0, -0.05, 0.03, e); }
    else if (cos.emblem === 'moon') { const m = mesh(geo('moon', () => new THREE.TorusGeometry(0.28, 0.07, 4, 12, 4.2)), gm, 0, 0, 0, e); m.rotation.z = 1.2; }
  }
}
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
    { const vm = o.eye ? M(o.eye, { e: o.eye, ei: 5 }) : M(0x0a0a0e); box(0.56, 0.08, 0.1, vm, 0, 0.05, 0.42, head);
      // 주인공 기사: 투구 틈을 굵게 하고 옆으로 둘러, 숨구멍 세로줄까지 넣어 어느 쪽에서 봐도 얼굴이 보여요
      if (!o.eye) { box(0.5, 0.15, 0.1, vm, 0, 0.06, 0.41, head); for (const sx of [-1, 1]) { const w = box(0.3, 0.13, 0.1, vm, sx * 0.31, 0.06, 0.3, head); w.rotation.y = sx * 0.75; } box(0.09, 0.34, 0.1, vm, 0, -0.17, 0.41, head); } } if (o.plume !== 0) { const pl = cone(0.12, 0.7, 5, M(o.plume || 0x3f6fd0), 0, 0.95, -0.1, head); pl.rotation.x = -0.5; }
  } else {
    const ey = o.eye ? M(o.eye, { e: o.eye, ei: 5 }) : M(0x1a1418);
    sph(0.42, 10, 8, o.skinC ? M(o.skinC) : skin(), 0, 0, 0, head); box(0.08, 0.1, 0.05, ey, -0.15, 0.02, 0.4, head); box(0.08, 0.1, 0.05, ey, 0.15, 0.02, 0.4, head);
    if (o.hood) { sph(0.52, 10, 8, M(o.hood), 0, 0.05, -0.05, head, 1.9); const c = cone(0.3, 0.6, 6, M(o.hood), 0, 0.1, -0.5, head); c.rotation.x = -1.9; }
    if (o.cap) { cyl(0.46, 0.46, 0.25, 10, M(o.cap), 0, 0.3, 0, head); sph(0.44, 10, 6, M(o.cap), 0, 0.35, 0, head, 1.4); const f = cone(0.06, 0.6, 4, M(0xf0e8d0), 0.3, 0.7, -0.1, head); f.rotation.z = -0.6; }
  }
  if (o.beard) { const bd = cone(0.4, 0.9, 6, M(o.beard), 0, -0.55, 0.28, head); bd.rotation.x = Math.PI + 0.25; for (const sx of [-1, 1]) { const br = cone(0.1, 0.5, 4, M(o.beard), sx * 0.2, -0.9, 0.38, head); br.rotation.x = Math.PI; } }
  if (o.turban) { sph(0.5, 10, 7, M(0xf0e8d8), 0, 0.28, -0.02, head).scale.set(1, 0.75, 1); mesh(geo('tb', () => new THREE.TorusGeometry(0.45, 0.1, 5, 12)), M(0xe8dcc0), 0, 0.12, 0, head).rotation.x = Math.PI / 2; sph(0.1, 6, 5, M(0xb0302a), 0, 0.35, 0.44, head); const f = cone(0.06, 0.5, 4, M(0xb0302a), 0, 0.75, 0.3, head); f.rotation.x = 0.3; box(0.42, 0.14, 0.08, M(0x2a1a14), 0, -0.24, 0.36, head); }
  if (o.hat) { cyl(0.85, 0.85, 0.06, 12, M(0x2a1a3a), 0, 0.3, 0, head); const h = cone(0.45, 1.3, 8, M(0x2a1a3a), 0, 0.95, -0.08, head); h.rotation.x = -0.28; cyl(0.47, 0.47, 0.12, 10, M(0xc06aff), 0, 0.38, 0, head); const nz = cone(0.07, 0.3, 4, M(o.skinC), 0, -0.04, 0.5, head); nz.rotation.x = Math.PI / 2; }
  if (o.fur) { const f = mesh(geo('fur', () => new THREE.TorusGeometry(0.62, 0.22, 5, 10)), M(0xcfc0a0), 0, 2.25, 0, body); f.rotation.x = Math.PI / 2; }
  if (o.cape) { const cp = mesh(geo('cape', () => new THREE.PlaneGeometry(1.2, 2, 1, 3)), M(o.cape, { ds: true }), 0, 1.6, -0.6, body); cp.rotation.x = 0.18; }
  if (o.antler) for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.3, 0.45, 0); head.add(a); a.rotation.z = -sx * 0.5; cyl(0.05, 0.07, 0.9, 4, M(0xcfc0a0), 0, 0.45, 0, a); for (let i = 0; i < 3; i++) { const t = cyl(0.04, 0.05, 0.4, 4, M(0xcfc0a0), sx * 0.15, 0.3 + i * 0.25, 0, a); t.rotation.z = -sx * 0.9; } }
  if (o.mitre) { const mt = cone(0.4, 1.2, 4, M(0xd8d4c8), 0, 0.75, 0, head); mt.rotation.y = Math.PI / 4; box(0.08, 1, 0.5, gold(), 0, 0.7, 0, head); }
  if (o.crown) { cyl(0.48, 0.5, 0.2, 8, gold(), 0, 0.7, 0, head); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; cone(0.08, 0.4, 4, gold(), Math.cos(a) * 0.44, 0.95, Math.sin(a) * 0.44, head); } }
  if (o.horns) for (const sx of [-1, 1]) { const hn = cone(0.1, 0.7, 5, M(0x2a2228), sx * 0.45, 0.5, 0, head); hn.rotation.z = -sx * 0.8; }
  if (o.bark) for (let i = 0; i < 5; i++) { const b = cone(0.12, 0.9, 4, M(0x4a3a26), Math.cos(i * 1.3) * 0.5, 2.4 + (i % 2) * 0.3, Math.sin(i * 1.3) * 0.4 - 0.2, body); b.rotation.set(Math.sin(i) * 0.8, 0, Math.cos(i) * 0.8); }
  const armR = new THREE.Group(); armR.position.set(0.72, 2.15, 0); body.add(armR); cap(0.17, 0.7, am, 0, -0.45, 0, armR);
  const armL = new THREE.Group(); armL.position.set(-0.72, 2.15, 0); body.add(armL); cap(0.17, 0.7, am, 0, -0.45, 0, armL);
  let light = null, shG = null;
  // 기사: 검고 두꺼운 대검 (넓은 날, 긴 손잡이, 날 가운데 홈)
  if (o.sword === 2) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); const bk = M(0xf2f4f8, { m: 0.6, r: 0.3 }); box(0.42, 2.5, 0.22, bk, 0, 1.45, 0, sw); box(0.1, 2.2, 0.23, M(0xc8d0dc, { m: 0.8, r: 0.25 }), 0, 1.35, 0, sw); cone(0.26, 0.34, 4, bk, 0, 2.86, 0, sw).rotation.y = Math.PI / 4; box(0.85, 0.16, 0.2, M(0xe2e6ee, { m: 0.7, r: 0.35 }), 0, 0.15, 0, sw); box(0.11, 0.55, 0.11, leather(), 0, -0.2, 0, sw); box(0.18, 0.14, 0.18, M(0xe2e6ee, { m: 0.7, r: 0.35 }), 0, -0.52, 0, sw); sw.rotation.x = Math.PI / 2; }
  else if (o.sword) { const sw = new THREE.Group(); sw.position.set(0, -0.9, 0.1); armR.add(sw); box(0.12, 2, 0.04, M(0xe9edf5, { m: 0.9, r: 0.2 }), 0, 1.1, 0, sw); box(0.6, 0.1, 0.14, gold(), 0, 0.1, 0, sw); box(0.08, 0.35, 0.08, leather(), 0, -0.1, 0, sw); sw.rotation.x = Math.PI / 2; }
  if (o.shield) { const shc = o.shieldC || 0x2c4f9e; const sh = new THREE.Group(); shG = sh; sh.position.set(-0.15, -0.7, 0.45); armL.add(sh); sh.rotation.x = 0.6; box(1.1, 1.4, 0.14, M(shc), 0, 0, 0, sh); const c = cone(0.78, 0.7, 4, M(shc), 0, -0.95, 0, sh); c.rotation.set(Math.PI, Math.PI / 4, 0); box(0.18, 1.2, 0.05, gold(), 0, -0.1, 0.09, sh); box(0.8, 0.18, 0.05, gold(), 0, 0.25, 0.09, sh); }
  // 활: 왼손에 쥐고, 팔을 앞으로 뻗으면 위아래로 선 활이 조준 방향으로 휘어요 (시위는 몸 쪽)
  let bowS = null;
  if (o.bow) {
    // 얕게 휜 활: 손잡이는 손에, 시위는 몸 쪽. 시위는 두 가닥이라 당기면 V자로 접혀요
    const bw = mesh(geo('bow2', () => { const t = new THREE.TorusGeometry(1.6, 0.06, 4, 12, 1.24); t.rotateZ(Math.PI / 2 - 0.62); return t; }), M(0x8a5a2a), 0.12, 0.65, 0, armL);
    bw.setRotationFromMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0)));
    box(0.14, 0.22, 0.14, leather(), 0.12, -0.95, 0, armL);
    const sm = M(0xe8e0c8), sa = mesh(geo('str', () => new THREE.BoxGeometry(0.025, 0.025, 1)), sm, 0, 0, 0, armL, false), sb = mesh(geo('str', () => new THREE.BoxGeometry(0.025, 0.025, 1)), sm, 0, 0, 0, armL, false);
    const ar = new THREE.Group(); armL.add(ar); box(0.05, 1.3, 0.05, M(0x8a5a2a), 0, 0, 0, ar); const ah = cone(0.08, 0.25, 4, metal(), 0, -0.75, 0, ar); ah.rotation.x = Math.PI;
    // 모아 쏘기용 화살 두 대: 두 발·세 발을 모으면 첫 화살 위·아래로 나란히 메겨져요 (모두 같은 보통 화살)
    const ex = [0.26, -0.26].map((dz, k) => { const g2 = new THREE.Group(); g2.position.z = dz; ar.add(g2); box(0.05, 1.3, 0.05, M(0x8a5a2a), 0, 0, 0, g2); const hm = metal(), h2 = cone(0.08, 0.25, 4, hm, 0, -0.75, 0, g2); h2.rotation.x = Math.PI; box(0.16, 0.2, 0.03, M(0xe8e0c8), 0, 0.58, 0, g2); g2.visible = false; return { g: g2, hm }; });
    bowS = { sa, sb, ar, ex }; setPull(bowS, 0.05);
  }
  if (o.staff) { const sc = o.staffC || 0x9af0d0; const st = new THREE.Group(); st.position.set(0, -0.9, 0.1); armR.add(st); st.rotation.x = 0.7; cyl(0.07, 0.07, 3.2, 6, M(0x7a5a2a), 0, 0.5, 0, st); mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(sc, { e: sc, ei: 4 }), 0, 2.3, 0, st); if (!o.noLight) { light = new THREE.PointLight(0x6af0c0, 14, 8, 1.6); light.position.set(0, 2.4, 0); st.add(light); } }
  if (o.spear) { const sp = new THREE.Group(); sp.position.set(0, -0.9, 0.1); armR.add(sp); sp.rotation.x = Math.PI / 2; cyl(0.06, 0.06, 3.6, 5, M(0x5a3a22), 0, 0.8, 0, sp); cone(0.16, 0.6, 4, metal(), 0, 2.9, 0, sp); }
  if (o.great) { const gs = new THREE.Group(); gs.position.set(0, -0.9, 0.2); armR.add(gs); gs.rotation.x = Math.PI / 2; box(0.2, 2.8, 0.06, M(o.great, { m: 0.9, r: 0.3, e: o.greatE || 0, ei: 1.5 }), 0, 1.6, 0, gs); box(0.8, 0.12, 0.14, gold(), 0, 0.15, 0, gs); }
  if (o.censer) { const c = new THREE.Group(); c.position.set(0, -1.1, 0.2); armR.add(c); cyl(0.02, 0.02, 0.8, 4, dmetal(), 0, 0.4, 0, c); sph(0.3, 6, 5, M(0x8a7a40, { m: 0.7, e: 0x3a7ad0, ei: 1 }), 0, -0.1, 0, c); }
  if (o.bell) { const bl = new THREE.Group(); bl.position.set(-0.1, -0.8, 0.5); armL.add(bl); bl.rotation.x = 0.6; cyl(0.45, 0.8, 1.3, 8, M(0x8a7a4a, { m: 0.8, r: 0.35 }), 0, 0, 0, bl); }
  if (o.xbow) { const xb = new THREE.Group(); xb.position.set(0, -0.9, 0.3); armR.add(xb); xb.rotation.x = Math.PI / 2; box(0.14, 1.1, 0.14, M(0x4a3020), 0, 0.4, 0, xb); box(1.2, 0.1, 0.1, dmetal(), 0, 0.8, 0, xb); }
  if (o.torch) { const t = new THREE.Group(); t.position.set(0, -0.9, 0.1); armR.add(t); t.rotation.x = 0.9; cyl(0.08, 0.1, 1.2, 6, leather(), 0, 0.4, 0, t); cone(0.22, 0.6, 6, M(0xffa040, { e: 0xff7a20, ei: 3 }), 0, 1.2, 0, t); if (!o.noLight) { light = new THREE.PointLight(0xff9a48, 16, 9, 1.6); light.position.set(0, 1.4, 0); t.add(light); } }
  if (o.axe) { const ax = new THREE.Group(); ax.position.set(0, -0.9, 0.15); armR.add(ax); ax.rotation.x = Math.PI / 2; cyl(0.08, 0.08, 2.4, 6, M(0x5a3a22), 0, 0.9, 0, ax); const hd = new THREE.Group(); hd.position.set(0.32, 1.9, 0); ax.add(hd); box(0.62, 0.9, 0.12, M(0xb8bfcc, { m: 0.8, r: 0.3 }), 0, 0, 0, hd); cyl(0.45, 0.45, 0.13, 10, M(0xd8dde8, { m: 0.8, r: 0.3 }), 0.28, 0, 0, hd).rotation.x = Math.PI / 2; }
  if (o.scim) { const sc = new THREE.Group(); sc.position.set(0, -0.9, 0.1); armR.add(sc); sc.rotation.x = Math.PI / 2; box(0.1, 0.4, 0.1, gold(), 0, 0, 0, sc); box(0.5, 0.08, 0.14, gold(), 0, 0.22, 0, sc); const bl = mesh(geo('scim', () => new THREE.TorusGeometry(1.4, 0.07, 3, 10, 1.2)), M(0xe9edf5, { m: 0.9, r: 0.2 }), -1.4, 0.25, 0, sc); bl.scale.set(1, 1, 1.8); }
  if (o.buckler) { const bk = cyl(0.5, 0.5, 0.12, 10, M(0xc8a040, { m: 0.7, r: 0.35 }), -0.1, -0.75, 0.3, armL); bk.rotation.x = Math.PI / 2 - 0.4; sph(0.12, 6, 5, gold(), -0.1, -0.75, 0.38, armL); }
  if (o.sack) sph(0.55, 8, 6, M(0xb89a6a), -0.1, 1.9, -0.7, body).scale.set(1, 1.1, 0.8);
  if (o.quiver) { const q = cyl(0.2, 0.2, 1.1, 6, leather(), 0.3, 2.1, -0.55, body); q.rotation.x = 0.3; for (let i = 0; i < 3; i++) box(0.04, 0.4, 0.04, M(0xe8e0c8), 0.25 + i * 0.06, 2.75, -0.7, body); }
  // 보스 전용 꾸밈 (장마다 다른 모습)
  if (o.mantle) { const mt = sph(0.95, 10, 6, M(o.mantle), 0, 2.15, -0.05, body, 1.5); mt.scale.set(1.15, 0.55, 1); for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4, ic = cone(0.09, 0.55, 4, M(0xd8f0ff, { e: 0x6ad0ff, ei: 1.2 }), Math.sin(a) * 0.95, 1.75, Math.cos(a) * -0.6, body); ic.rotation.x = Math.PI; } }
  if (o.icecrown) for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.45, c = cone(0.1, 0.75 + (i === 2 ? 0.35 : 0), 4, M(0xc8ecff, { e: 0x6ad0ff, ei: 2.5 }), Math.sin(a) * 0.42, 0.85, Math.cos(a) * 0.3, head); c.rotation.z = -a * 0.6; }
  if (o.wide) { body.scale.x = o.wide; armL.position.x = -0.72 * o.wide; armR.position.x = 0.72 * o.wide; }
  if (o.fists) for (const a of [armL, armR]) sph(0.42, 6, 5, M(o.fists), 0, -1.0, 0, a).scale.set(1, 0.9, 1);
  if (o.rocks) for (let i = 0; i < 6; i++) { const r = mesh(geo('rk', () => new THREE.DodecahedronGeometry(0.32)), M(0x6a6256), Math.cos(i * 1.1) * 0.55, 2.0 + (i % 3) * 0.3, -0.45 - (i % 2) * 0.15, body); r.rotation.set(i, i * 2, 0); }
  if (o.crystal) for (let i = 0; i < 3; i++) { const c = mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(o.crystal, { e: o.crystal, ei: 3 }), (i - 1) * 0.45, 2.55 + (i === 1 ? 0.25 : 0), -0.55, body); c.scale.set(0.6, 1.5, 0.6); }
  if (o.maul) { const mu = new THREE.Group(); mu.position.set(0, -0.9, 0.2); armR.add(mu); mu.rotation.x = Math.PI / 2; cyl(0.09, 0.09, 2.4, 6, M(0x4a3626), 0, 0.9, 0, mu); box(1.0, 0.7, 0.7, M(0x6a6256), 0, 2.2, 0, mu); box(1.05, 0.12, 0.75, M(o.maul, { e: o.maul, ei: 2 }), 0, 2.2, 0, mu); }
  if (o.halo) { const h = mesh(geo('halo', () => new THREE.TorusGeometry(0.75, 0.07, 5, 18)), M(o.halo, { e: o.halo, ei: 4 }), 0, 0.15, -0.45, head); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, c = cone(0.07, 0.4, 4, M(o.halo, { e: o.halo, ei: 4 }), Math.cos(a) * 0.95, 0.15 + Math.sin(a) * 0.95, -0.45, head); c.rotation.z = a - Math.PI / 2; } }
  if (o.wings) for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { const w = mesh(geo('wing', () => new THREE.PlaneGeometry(0.9, 2.0)), M(o.wings, { e: o.wings, ei: 1.6, ds: true }), sx * (0.55 + k * 0.35), 2.4 - k * 0.45, -0.6, body); w.rotation.set(0.2, sx * 0.5, -sx * (0.7 + k * 0.5)); }
  if (o.flamehead) for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, c = cone(0.16 + (i % 2) * 0.06, 0.9 + (i % 3) * 0.3, 5, M(o.flamehead, { e: o.flamehead, ei: 3.5 }), Math.cos(a) * 0.28, 0.75, Math.sin(a) * 0.28, head); c.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); }
  if (o.core) { sph(0.3, 8, 6, M(o.core, { e: o.core, ei: 5 }), 0, 1.9, 0.5, body); for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283, c = cone(0.08, 0.5, 4, M(0x1a1420), Math.cos(a) * 0.38, 1.9 + Math.sin(a) * 0.38, 0.45, body); c.rotation.set(Math.PI / 2, 0, a - Math.PI / 2); } }
  if (o.spikes) for (let i = 0; i < 5; i++) { const c = cone(0.14, 0.9 + (i === 2 ? 0.4 : 0), 4, M(0x1a1420), (i - 2) * 0.32, 2.3 + Math.abs(i - 2) * -0.15, -0.6, body); c.rotation.x = -0.9; }
  if (o.scale) g.scale.setScalar(o.scale);
  g.userData = { body, legL, legR, armL, armR, head, light, kind: 'hero', bowS, shield: shG };
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
  frostk: { body: 0x5a6a7a, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x9ab0c8, plume: 0, eye: 0x6ad0ff, sword: 1, cape: 0x2a4a6a },
  frostb: { body: 0x5a6a7a, leg: 0x3a4a5a, arm: 0x5a6a7a, hood: 0xc8d8e8, bow: 1, quiver: 1, eye: 0x6ad0ff, skinC: 0xa0b8c8 },
  frosts: { body: 0x5a6a7a, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x9ab0c8, plume: 0, eye: 0x6ad0ff, sword: 1, shield: 1, shieldC: 0x8ab8e0 },
  frostl: { body: 0x4a5a6a, leg: 'dm', arm: 'dm', helm: 1, helmC: 0xb8d0e8, plume: 0x6ad0ff, eye: 0x6ad0ff, great: 0xb8d8f0, cape: 0x2a4a6a, horns: 1, scale: 1.45 },
  miner: { body: 0x5a4a34, leg: 0x3a3024, arm: 0x5a4a34, hood: 0x6a5a40, belt: 1, sack: 1, eye: 0xffb060, skinC: 0x8a7a6a },
  golem: { body: 0x5a5448, leg: 0x4a443a, arm: 0x5a5448, skinC: 0x6a6458, eye: 0x6ad8e0, bark: 1, scale: 1.35 },
  golemk: { body: 0x4a3e30, leg: 0x3a3024, arm: 0x4a3e30, helm: 1, helmC: 0x6a5a3a, plume: 0, eye: 0xffb060, great: 0x7a6a5a, belt: 1, cape: 0x3a2a1a, scale: 1.45 },
  zealot: { body: 0x8a3a1a, robe: 1, leg: 0x5a2410, arm: 0x8a3a1a, hood: 0x6a2a10, skinC: 0xa08070, eye: 0xffa040, sword: 1 },
  pyro: { body: 0x6a2a10, robe: 1, leg: 0x4a1a0a, arm: 0x6a2a10, hood: 0x4a1a0a, skinC: 0xa08070, eye: 0xffa040, staff: 1, staffC: 0xff8a30, noLight: 1 },
  censer: { body: 0x7a4a20, robe: 1, leg: 0x4a2a10, arm: 0x7a4a20, hood: 0x5a3010, skinC: 0xa08070, eye: 0xffa040, censer: 1 },
  templar: { body: 0x8a6a3a, leg: 'dm', arm: 'dm', helm: 1, helmC: 0xc0a060, plume: 0xc04a10, eye: 0xffa040, great: 0xd0b070, greatE: 0xff8a30, cape: 0x8a2a10, scale: 1.45 },
  voidk: { body: 0x2e2838, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x3e3448, plume: 0x5a2a8a, eye: 0xd08aff, sword: 1, cape: 0x2a1a40 },
  voidb: { body: 0x2e2838, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x3e3448, plume: 0, eye: 0xd08aff, xbow: 1 },
  voids: { body: 0x2e2838, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x3e3448, plume: 0, eye: 0xd08aff, sword: 1, shield: 1, shieldC: 0x3a2a4a },
  voidl: { body: 0x26202e, leg: 'dm', arm: 'dm', helm: 1, helmC: 0x4a3a5a, plume: 0xb06aff, eye: 0xd08aff, great: 0x5a4a6a, greatE: 0xb06aff, cape: 0x3a1a5a, horns: 1, scale: 1.5 },
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
  if (k === 'mimic') return makeMimic();
  const f = (FOES[chapterIndex()] || FOES[0])[k] || {}, sk = f.skin || 'skel';
  if (sk === 'wolf') return makeWolf(k === 'elite');
  if (FIG[sk]) { const g = makeFigure(FIG[sk]); g.userData.kind = 'skel'; return g; }
  return makeSkel(k);
}
// 미믹: 상자 뚜껑이 입이에요. 위아래 이빨, 긴 혀, 상자 안에서 빛나는 눈, 짧은 다리 넷
function makeMimic() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const wood = M(0x6a4628), dk = M(0x1a0c0c), tooth = M(0xf0ead8), gd = gold();
  box(2, 1.0, 1.3, wood, 0, 0.75, 0, body); box(1.8, 0.1, 1.1, dk, 0, 1.22, 0, body); box(2.05, 0.15, 1.35, gd, 0, 0.35, 0, body);
  for (let i = 0; i < 6; i++) cone(0.1, 0.3, 4, tooth, -0.75 + i * 0.3, 1.38, 0.55, body);
  const eyeM = M(0xff3a2a, { e: 0xff2010, ei: 6 }); for (const sx of [-0.4, 0.4]) sph(0.11, 6, 4, eyeM, sx, 1.2, -0.1, body);
  const tg = box(0.45, 0.1, 1.2, M(0xc04a5a), 0, 1.26, 0.6, body); tg.rotation.x = 0.35;
  const lid = new THREE.Group(); lid.position.set(0, 1.25, -0.65); body.add(lid);
  const lm = cyl(0.65, 0.65, 2, 10, wood, 0, 0, 0.65, lid); lm.rotation.z = Math.PI / 2; box(2.05, 0.15, 1.35, gd, 0, -0.2, 0.65, lid);
  for (let i = 0; i < 6; i++) { const c = cone(0.1, 0.32, 4, tooth, -0.75 + i * 0.3, -0.28, 1.2, lid); c.rotation.x = Math.PI; }
  box(0.3, 0.4, 0.1, gd, 0, -0.1, 1.33, lid);
  const legL = new THREE.Group(), legR = new THREE.Group(); body.add(legL, legR); legL.position.set(-0.7, 0.3, 0); legR.position.set(0.7, 0.3, 0);
  for (const L of [legL, legR]) for (const z of [-0.4, 0.4]) box(0.22, 0.45, 0.22, M(0x4a3020), 0, -0.1, z, L);
  const head = new THREE.Group(); body.add(head); const armL = new THREE.Group(); body.add(armL);
  g.scale.setScalar(1.3); g.userData = { body, legL, legR, armL, armR: lid, head, kind: 'mimic', lid };
  return g;
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
  const g = makeFigure(Object.assign({}, BOSSFIG[ai], CH.boss.fig)); const col = CH.boss.col || (ai === 'hunter' ? 0xffa040 : ai === 'bishop' ? 0x6ab0ff : 0xff6a20);
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
    this.canvas = canvas; this.secOn = [];
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
    const asp = w / h, vs = this.mode === 'lobby' ? 7.6 : this.mode === 'intro' ? 6.4 : this.zoom * (asp < 1 ? 1.35 : 1);
    this.cam.left = -vs * asp; this.cam.right = vs * asp; this.cam.top = vs; this.cam.bottom = -vs; this.cam.updateProjectionMatrix();
    if (this.comp) this.comp.setSize(w, h);
    if (this.pp) this.pp.setPixelSize(P);
  }
  setPixel(ps) { this.ps = ps; this.resize(); }
  setBloom(on) { this.bloomOn = on; if (this.bloom) this.bloom.enabled = on && !this.low; }
  // 최적화: 그림자와 빛 번짐을 끄고 효과 조각을 절반으로 줄여요 (화면은 1초에 30번만 그려요, main.js)
  setLow(on) {
    this.low = !!on; this.r.shadowMap.enabled = !this.low; if (this.bloom) this.bloom.enabled = this.bloomOn && !this.low;
    if (this.scene) this.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.needsUpdate = true); });
  }
  newScene(bg, fog) {
    if (this.scene) this.scene.traverse(o => { if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose(); });
    const s = new THREE.Scene(); s.background = new THREE.Color(bg); s.fog = new THREE.Fog(fog, 45, 90);
    this.scene = s; this.ents.clear(); this.fx = []; this.nums = [];
    // 기술 번쩍임용 빛 하나 (빛 개수가 바뀌면 셰이더를 다시 만들어서 미리 넣어 둬요)
    this.fxL = new THREE.PointLight(0xffffff, 0, 16, 1.6); this.fxL.position.set(0, -50, 0); s.add(this.fxL); this.fxLI = 0;
    this.comp = new EffectComposer(this.r); this.pp = new RenderPixelatedPass(this.P, s, this.cam, { normalEdgeStrength: 0.2, depthEdgeStrength: 0.4 });
    this.comp.addPass(this.pp); this.bloom = new UnrealBloomPass(new THREE.Vector2(this.W / this.P, this.H / this.P), 0.26, 0.2, 0.9); this.bloom.enabled = this.bloomOn && !this.low; this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
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
    this.mode = 'lobby'; this.introHeroes = null; this.pool = null; this.trapM = null; const s = this.newScene(0x0e1024, 0x12142a); this.flick = []; this.lights(s);
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
    // 성벽의 기사단 깃발: 장을 깰 때 든 채로 지킨 깃발만 걸려요. 빈 자리에는 걸쇠만 있어요
    const FL = this.lobbyFlags || {}; this.flagGlow = []; this.flagDust = [];
    for (let i = 0; i < 8; i++) {
      const x = -14.4 + i * 1.15; box(0.3, 0.16, 0.3, dmetal(), x, 5.45, -11.15, s);
      if (!FL[i]) continue;
      // 걸린 깃발은 금빛 테두리와 함께 은은하게 빛나고 금가루가 피어올라요
      const fm = M(FLAG_COL[i], { e: FLAG_COL[i], ei: 1.2, uniq: true }), gm = M(0xffd36b, { e: 0xffc040, ei: 2.5, uniq: true });
      box(1.2, 2.2, 0.04, gm, x, 4.25, -11.02, s); this.flagGlow.push({ fm, gm, ph: i * 0.8, x });
      box(1.15, 0.1, 0.1, gold(), x, 5.35, -10.98, s); box(1.0, 2.0, 0.06, fm, x, 4.3, -10.98, s);
      box(0.36, 0.7, 0.08, gold(), x, 4.4, -10.93, s); for (const dx of [-0.33, 0.33]) box(0.42, 0.3, 0.06, M(FLAG_COL[i]), x + dx * 0.75, 3.2, -10.98, s).rotation.z = dx > 0 ? -0.78 : 0.78;
    }
    if (this.flagGlow.length) { const L = new THREE.PointLight(0xffd080, 22, 9, 1.4); L.position.set(-10.4, 4.4, -8.6); s.add(L); for (let i = 0; i < 24; i++) { const d = box(0.09, 0.09, 0.09, M(0xffe08a, { e: 0xffc040, ei: 5 }), 0, -5, 0, s); d.castShadow = false; this.flagDust.push({ m: d, t: R() * 2.5, f: this.flagGlow[i % this.flagGlow.length] }); } }
    for (let i = 0; i < 80; i++) box(0.12, 0.12, 0.12, M(0xffffff, { e: 0xdfe6ff, ei: 2 }), (R() - .5) * 70, 14 + R() * 10, -30, s);
    sph(2, 12, 10, M(0xffffff, { e: 0xe8ecff, ei: 2 }), -20, 22, -30, s);
    const poses = [['knight', -3.8, 4.6, 2.4], ['archer', 3.8, 4.8, -2.5], ['priest', -2.6, -1.2, 0.6], ['viking', 2.8, -0.8, -0.7]];
    this.lobbyHeroes = poses.map(([r, x, z, ry]) => { const h = makeHero(r, this.cos); h.position.set(x, 0, z); h.rotation.y = ry; s.add(h); return h; });
    this.embers = []; for (let i = 0; i < 18; i++) { const e = box(0.14, 0.14, 0.14, M(0xffb050, { e: 0xff8a30, ei: 5 }), 0, 0, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 3 }); }
    this.resize();
    this.cam.position.set(-1.5, 13, 30); this.cam.lookAt(-1.5, 3.0, 1.5);
  }

  /* ----- 처음 인트로: 횃불 켜진 던전 복도를 네 영웅이 걸어 나와요 ----- */
  buildIntro() {
    this.mode = 'intro'; this.pool = null; this.trapM = null; this.lobbyHeroes = null; this.embers = []; const s = this.newScene(0x07060c, 0x0a0812); s.fog.near = 30; s.fog.far = 70; this.flick = []; this.lights(s, 0.7);
    const T = THEMES.dungeon, stone = [0x3a3640, 0x423d48, 0x36323c, 0x4a4450];
    instBoxes(s, add => { for (let x = -9; x <= 9; x += 1.5) for (let z = -44; z <= 16; z += 1.5) { const h = 0.3 + R() * 0.08; add(x + (R() - .5) * 0.1, h / 2 - 0.3, z + (R() - .5) * 0.1, 1.44, h, 1.44, stone[R() * 4 | 0]); } });
    const brick = [0x3e3846, 0x463f50, 0x4e4658, 0x38323f];
    instBoxes(s, add => {
      for (const sx of [-1, 1]) for (let y = 0; y < 8; y++) for (let z = -44; z <= 14; z += 2.2) add(sx * 10, y + 0.45, z + (y % 2 ? 1.1 : 0), 1.6, 0.95, 2.1, brick[R() * 4 | 0]);
      for (let y = 0; y < 10; y++) for (let x = -10; x <= 10; x += 2.2) { if (Math.abs(x) < 3 && y < 6) continue; add(x + (y % 2 ? 1.1 : 0), y + 0.45, -44, 2.1, 0.95, 1.6, brick[R() * 4 | 0]); }
    });
    // 안쪽 문: 붉게 빛나는 입구
    box(5.4, 6, 0.3, M(0x2a0c0a, { e: 0x601808, ei: 1.4 }), 0, 3, -44.2, s);
    const gl = new THREE.PointLight(0xff5a2a, 70, 30, 1.4); gl.position.set(0, 3, -41); s.add(gl); this.flick.push({ L: gl, b: 70, ph: 2 });
    // 기둥, 횃불, 깃발
    for (let z = -38; z <= 10; z += 8) for (const sx of [-1, 1]) {
      box(1.6, 0.5, 1.6, M(0x5c5468), sx * 6.5, 0.25, z, s); cyl(0.6, 0.7, 7, 8, M(0x4e4858), sx * 6.5, 3.8, z, s); box(1.7, 0.5, 1.7, M(0x5c5468), sx * 6.5, 7.4, z, s);
      box(0.3, 1, 0.3, M(0x4a3020), sx * 9.1, 4, z + 4, s); this.flame(s, sx * 9.1, 5, z + 4, 1);
      if ((z / 8 | 0) % 2 === 0) this.banner(s, sx * 9.1, z, false, T.banner || 0x7a1f22);
    }
    for (let n = 0; n < 14; n++) { const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(brick[n % 4]), (R() < 0.5 ? -1 : 1) * (7.6 + R() * 1.6), 0.1, -40 + R() * 54, s); r.scale.setScalar(0.25 + R() * 0.3); r.rotation.y = R() * 3; }
    // 떠다니는 먼지
    for (let i = 0; i < 26; i++) { const e = box(0.1, 0.1, 0.1, M(0xffd090, { e: 0xffb060, ei: 3 }), 0, 0, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 8, x: (R() - .5) * 16, z: -30 + R() * 40, h: 1 + R() * 5, ph: R() * 9, intro: true }); }
    // 네 영웅: 기사가 앞, 나머지가 양옆과 뒤
    const row = [['archer', -3.3, -1.2], ['knight', -1.1, 0], ['priest', 1.1, -0.4], ['viking', 3.3, -1.4]];
    const hl = new THREE.PointLight(0xffc890, 22, 14, 1.6); s.add(hl); this.introL = hl;
    this.introHeroes = row.map(([r, x, z]) => { const h = makeHero(r); h.position.set(x, 0, z - 12); s.add(h); return { m: h, x, z, aL: h.userData.armL.rotation.x, aR: h.userData.armR.rotation.x }; });
    this.introT = 0; this.resize(); this.introCam();
  }
  introCam() {
    const u = Math.min(1, this.introT / 6.4), k = u * u * (3 - 2 * u), hz = -12 + Math.min(this.introT, 5.4) * 2.1;
    this.cam.position.set(-2.2 + k * 3.4, 8.5 - k * 1.5, hz + 18); this.cam.lookAt(-0.4 + k * 0.6, 3.6, hz - 3);
    if (this.introL) this.introL.position.set(0, 4, hz + 3);
  }
  tickIntro(dt, t) {
    this.introT += dt; const wt = Math.min(this.introT, 5.4), stop = this.introT > 5.4;
    (this.introHeroes || []).forEach((H, i) => {
      const u = H.m.userData, ph = this.introT * 9 + i * 0.7, sw = stop ? 0 : Math.sin(ph) * 0.8;
      H.m.position.set(H.x, 0, H.z - 12 + wt * 2.1); u.legL.rotation.x += (sw - u.legL.rotation.x) * Math.min(1, dt * 12); u.legR.rotation.x = -u.legL.rotation.x;
      u.armL.rotation.x = H.aL - u.legL.rotation.x * 0.4; u.armR.rotation.x = H.aR + u.legL.rotation.x * 0.4;
      u.body.position.y = stop ? Math.sin(t * 1.5 + i) * 0.03 : Math.abs(Math.sin(ph)) * 0.08; u.head.rotation.y = stop ? Math.sin(t * 0.8 + i * 2) * 0.25 : 0;
    });
    for (const e of this.embers) { e.t += dt; e.m.position.set(e.x + Math.sin(e.t * 0.4 + e.ph) * 2, e.h + Math.sin(e.t * 0.9 + e.ph) * 0.6, e.z + Math.cos(e.t * 0.3 + e.ph) * 2); e.m.material.emissiveIntensity = 1.5 + 3 * Math.max(0, Math.sin(e.t * 1.7 + e.ph)); }
    this.introCam();
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
        const x = cw(i), z = cw(j), wt = WATER[j * MW + i], lh = cellH(i, j), cols = wt ? wet : inBoss(i, j) || lh > 1.5 ? bstone : stone, h = 0.3 + R() * 0.1 + lh;
        if (T.trees) add(x, h / 2 - 0.3 - (wt ? 0.15 : 0) + (R() - .5) * 0.08, z, 2.02, h, 2.02, cols[R() * cols.length | 0]); // 숲 바닥은 틈 없이 흙과 풀
        else add(x + (R() - .5) * 0.06, h / 2 - 0.3 - (wt ? 0.15 : 0), z + (R() - .5) * 0.06, 1.94, h, 1.94, cols[R() * cols.length | 0]);
        if (!wt && R() < T.mossP) add(x + (R() - .5) * 1.2, 0.04 + lh, z + (R() - .5) * 1.2, 0.6, 0.08, 0.5, T.moss);
      }
    });
    // 벽: 방 뒤쪽(북쪽) 벽은 높게, 앞쪽·옆 벽은 낮게 해서 캐릭터가 가려지지 않게 해요
    instBoxes(s, (add) => {
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (floorCell(i, j) || SEC[j * MW + i] || cutCell(i, j)) continue;
        let nb = false, nh = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (floorCell(i + di, j + dj)) { nb = true; nh = Math.max(nh, cellH(i + di, j + dj)); }
        if (!nb) continue;
        const x = cw(i), z = cw(j), bc = inBoss(i, j + 1) || inBoss(i, j - 1) ? bbrick : brick;
        const back = floorCell(i, j + 1) && !floorCell(i, j - 1);
        const rows = (back ? 6 : floorCell(i, j - 1) && !floorCell(i, j + 1) ? 1 : 3) + Math.ceil(nh);
        if (T.trees) {
          // 숲: 벽돌 대신 나무줄기와 덤불이 빽빽한 숲 가장자리
          const leaf = [0x2e3a26, 0x36402a, 0x3a4430, 0x2a3422], trunk = [0x3a2a1c, 0x44301e, 0x2e2216];
          if (back) { for (let k = 0; k < 2; k++) add(x + (R() - .5) * 1.4, 2.2, z + (R() - .5) * 0.8, 0.45 + R() * 0.2, 4.4, 0.45 + R() * 0.2, trunk[R() * 3 | 0]); for (let k = 0; k < 3; k++) add(x + (R() - .5) * 0.8, 4.3 + k * 0.8 + R() * 0.4, z + (R() - .5) * 0.6, 2.4 - k * 0.4, 1, 2.4 - k * 0.4, leaf[R() * 4 | 0]); }
          add(x + (R() - .5) * 0.3, rows * 0.35 + 0.1, z, 2.1, rows * 0.7 + 0.2, 2.1, leaf[R() * 4 | 0]); add(x + (R() - .5) * 0.6, rows * 0.7 + 0.35, z + (R() - .5) * 0.4, 1.3, 0.6, 1.3, leaf[R() * 4 | 0]);
        } else {
          for (let y = 0; y < rows; y++) { const off = (y + j) % 2 ? 0.5 : 0; add(x - 0.5 + off, y + 0.45, z, 1.02, 0.95, 1.9, bc[R() * 4 | 0]); add(x + 0.5 + off - (off ? 1 : 0), y + 0.45, z, 1.02, 0.95, 1.9, bc[R() * 4 | 0]); }
          add(x, rows + 0.12, z, 2.02, 0.24, 2.02, T.top);
        }
        if (back && i % 3 === 0 && !(i % 6 === 0 && R() < 0.3) && !inDark(i, j + 1)) torches.push([x, z + 1.0]);
        if (back && T.banner && i % 6 === 3 && R() < 0.5) this.banner(s, x, z + 1.02, bc === bbrick, T.banner);
        // 수도원: 푸른 창
        if (T.windows && back && i % 4 === 2) { add(x, 3.2, z + 0.98, 0.9, 2.2, 0.06, 0x6ab0ff); }
      }
    });
    this.torchPos = torches;
    this.buildSecrets(s, T, brick); this.buildPuzzles(s, T); this.buildDarks(s); this.buildExit(s); this.buildCuts(s, T, brick); this.escOn = false;
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
    this.floaters = [];
    const decor = { forest: (a, ai, x, y, w, h) => { for (let k = 0; k < 4; k++) rock(cw(x + 1 + R() * (w - 2)), cw(y + 1 + R() * (h - 2)), ai + k); cyl(0.7, 0.8, 0.7, 7, M(0x5a4228), cw(x + w - 1), 0.35, cw(y), s); for (let k = 0; k < 3; k++) { const mx = cw(x + 1 + R() * (w - 2)), mz = cw(y + 1 + R() * (h - 2)); cyl(0.06, 0.08, 0.3, 4, M(0xd8d0bc), mx, 0.15, mz, s); sph(0.22, 6, 4, M(0xd06a3a, { e: 0x6a2a10, ei: 1 }), mx, 0.34, mz, s, 1.6); } },
      abbey: (a, ai, x, y, w, h) => { for (let k = 0; k < 2; k++) { const bz = cw(y + 2 + k * 2); box(3.4, 0.5, 0.8, M(0x4a3626), cw(x + 3), 0.5, bz, s); box(3.4, 0.9, 0.15, M(0x4a3626), cw(x + 3), 0.9, bz - 0.4, s); } for (let k = 0; k < 3; k++) { const cx = cw(x + w - 2) + (k - 1) * 0.6; cyl(0.08, 0.08, 0.6 + k * 0.2, 5, M(0xe8e0c8), cx, 0.3 + k * 0.1, cw(y), s); this.flame(s, cx, 0.75 + k * 0.2, cw(y), 0.35, false); } },
      frost: (a, ai, x, y, w, h) => { for (let k = 0; k < 5; k++) { const ix = cw(x + 1 + R() * (w - 2)), iz = cw(y + 1 + R() * (h - 2)); const c = cone(0.25 + R() * 0.25, 1 + R() * 1.4, 5, M(0xb8d8f0, { e: 0x4a8ac0, ei: 0.6 }), ix, 0.5, iz, s); c.rotation.z = (R() - .5) * 0.4; } box(1.8, 0.4, 1.4, M(0xd8e8f8), cw(x + w - 1), 0.2, cw(y), s); },
      mine: (a, ai, x, y, w, h) => { const rz = cw(y + (h >> 1)); for (const o of [-0.5, 0.5]) box((w - 1) * 2, 0.08, 0.1, dmetal(), cw(x) + w - 1, 0.1, rz + o, s); for (let k = 0; k < w; k++) box(0.25, 0.06, 1.4, M(0x4a3020), cw(x + k), 0.05, rz, s); box(1.4, 0.9, 1.1, M(0x5a4228), cw(x + 1), 0.75, rz, s); for (let k = 0; k < 4; k++) { const cx = cw(x + 1 + R() * (w - 2)), cz = cw(y + 1 + R() * (h - 2)); const c = cone(0.18, 0.7 + R() * 0.5, 4, M(0x7ad8e8, { e: 0x3ab0c0, ei: 2 }), cx, 0.35, cz, s); c.rotation.z = (R() - .5) * 0.6; c.castShadow = false; } },
      temple: (a, ai, x, y, w, h) => { for (const bx of [cw(x + 1), cw(x + w - 2)]) { const bz = cw(y); cyl(0.5, 0.3, 1.4, 8, M(0x8a6a3a, { m: 0.6 }), bx, 0.7, bz, s); this.flame(s, bx, 1.7, bz, 0.9, false, T.torch); } box(2.6, 0.8, 1.2, M(0x7a6a50), cw(x + (w >> 1)), 0.4, cw(y), s); },
      abyss: (a, ai, x, y, w, h) => { for (let k = 0; k < 5; k++) { const cx = cw(x + 1 + R() * (w - 2)), cz = cw(y + 1 + R() * (h - 2)); const c = cone(0.3, 1 + R() * 1.6, 4, M(0x8a5ad0, { e: 0x6a2ab0, ei: 2 }), cx, 0.5, cz, s); c.rotation.set((R() - .5) * 0.5, R() * 3, (R() - .5) * 0.5); c.castShadow = false; } },
      deep: (a, ai, x, y, w, h) => { // 떠 있는 빛 수정, 바닥의 빛나는 문양, 허공에 뜬 돌 조각
        for (let k = 0; k < 4; k++) { const cx = cw(x + 1 + R() * (w - 2)), cz = cw(y + 1 + R() * (h - 2)), c = mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), M(0x6af0e0, { e: 0x2ad8d0, ei: 3 }), cx, 2.2 + R() * 2.5, cz, s); c.scale.set(0.8, 1.8, 0.8); c.castShadow = false; this.floaters.push({ m: c, y: c.position.y, ph: R() * 6 }); }
        for (let k = 0; k < 2; k++) { const rg = mesh(geo('drune', () => new THREE.RingGeometry(1.1, 1.3, 6)), M(0x2ae0c0, { e: 0x2ae0c0, ei: 2, op: 0.7 }), cw(x + 2 + R() * (w - 4)), 0.13, cw(y + 2 + R() * (h - 4)), s, false); rg.rotation.x = -Math.PI / 2; }
        for (let k = 0; k < 3; k++) { const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(0x223448), cw(x + R() * w), 5 + R() * 3, cw(y + R() * h), s); r.scale.setScalar(0.5 + R() * 0.6); r.castShadow = false; this.floaters.push({ m: r, y: r.position.y, ph: R() * 6, spin: 1 }); }
      },
      tower: (a, ai, x, y, w, h) => { const bx = cw(x + 1), bz = cw(y); cyl(0.6, 0.4, 1.2, 6, dmetal(), bx, 0.6, bz, s); this.flame(s, bx, 1.5, bz, 0.9, false, T.torch); box(2.4, 2, 0.3, M(0x4a3020), cw(x + w - 2), 1, cw(y), s); for (let k = 0; k < 3; k++) box(0.1, 1.8, 0.1, metal(), cw(x + w - 2) - 0.7 + k * 0.7, 1.4, cw(y) + 0.25, s); }
    }[CH.theme];
    MAP.areas.forEach((a, ai) => { const [x, y, w, h] = a.r[0]; if (a.boss || a.cut) return; if (decor) { decor(a, ai, x, y, w, h); return; } barrel(cw(x), cw(y) + 0.2); if (w > 6) barrel(cw(x) + 1.7, cw(y)); box(1.8, 1.6, 1.8, M(0x6a4628), cw(x + w - 1), 0.8, cw(y), s).rotation.y = 0.3 + ai; for (let k = 0; k < 3; k++) { const bx = cw(x + 1 + R() * (w - 2)), bz = cw(y + 1 + R() * (h - 2)); const b = box(1.2, 0.15, 0.15, bone(), bx, 0.12, bz, s); b.rotation.y = R() * 3; sph(0.35, 8, 6, bone(), bx + 0.8, 0.25, bz + 0.3, s); } });
    this.details(s, T);
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
    // 갈림길 비석 둘: 왼쪽은 붉은 빛(돌격), 오른쪽은 푸른 빛(소환)
    this.forks = MAP.fork ? [[MAP.fork.a, 0xff6a50], [MAP.fork.b, 0x6ab0ff]].map(([q, col]) => {
      const x = cw(q[0]), z = cw(q[1]); cyl(0.8, 1.0, 0.4, 6, M(0x4a4658), x, 0.2, z, s); box(0.9, 2.2, 0.5, M(0x5a566a), x, 1.5, z, s);
      const c = mesh(geo('oct2', () => new THREE.OctahedronGeometry(0.4)), M(col, { e: col, ei: 3, uniq: true }), x, 3.1, z, s);
      const L = new THREE.PointLight(col, 16, 8, 1.6); L.position.set(x, 3.2, z); s.add(L);
      return { c, L, used: false };
    }) : [];
    // 상자
    this.chests = MAP.chests.map(([cx, cy, sec], ci) => {
      const ch = new THREE.Group(); ch.position.set(cw(cx), 0, cw(cy)); ch.rotation.y = -0.3; (sec ? this.secG[sec - 1] : s).add(ch); box(2, 1.1, 1.3, M(0x6a4628), 0, 0.55, 0, ch);
      const lid = new THREE.Group(); lid.position.set(0, 1.1, -0.65); ch.add(lid); const lidM = cyl(0.65, 0.65, 2, 10, M(0x6a4628), 0, 0, 0.65, lid); lidM.rotation.z = Math.PI / 2; box(2.05, 0.15, 1.35, gold(), 0, -0.2, 0.65, lid);
      box(0.3, 0.4, 0.1, gold(), 0, 0.9, 0.7, ch);
      // 미믹 상자: 뚜껑 틈으로 이빨 두 개가 살짝 보이고, 가끔 숨 쉬듯 들썩여요
      const mim = ci === MAP.mimic; if (mim) for (const sx of [-0.45, 0.35]) { const c = cone(0.07, 0.22, 4, M(0xf0ead8), sx, -0.1, 1.32, lid); c.rotation.x = Math.PI; }
      return { lid, g: ch, mim };
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
    const fly = ff ? [0xd8ff8a, 0xb0ff6a] : CH.theme === 'abbey' || CH.theme === 'frost' ? [0x9ad0ff, 0x6aa0e0] : CH.theme === 'abyss' ? [0xd0a0ff, 0xa06ae0] : CH.theme === 'deep' ? [0x9af8ff, 0x4ad8e0] : [0xffd08a, 0xffa040];
    for (let i = 0; i < 26; i++) { const e = box(0.12, 0.12, 0.12, M(fly[0], { e: fly[1], ei: 6, uniq: true }), 0, -5, 0, s); e.castShadow = false; this.embers.push({ m: e, t: R() * 9, x: (R() - .5) * 44, z: (R() - .5) * 32, fly: 1, ph: R() * 6.28, h: 0.8 + R() * 3 }); }
    this.camT.set(cw(MAP.start[0]), 0, cw(MAP.start[1])); this.camInit = false;
    this.resize();
  }
  // 비밀 방: 바닥·벽·옛 기록 돌은 따로 묶어 숨겨 두고, 통로 입구에는 금 간 벽을 세워요
  buildSecrets(s, T, brick) {
    this.secG = []; this.crackG = []; this.loreM = []; this.secOn = [];
    const fl = floorCell;
    MAP.secrets.forEach((q, k) => {
      const g = new THREE.Group(); s.add(g); const id = k + 1, inK = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH && Math.abs(SEC[j * MW + i]) === id, flK = (i, j) => inK(i, j) || fl(i, j);
      const [rx, ry, rw, rh] = q.room, [px, py, pw, ph] = q.pass, x0 = Math.min(rx, px) - 1, x1 = Math.max(rx + rw, px + pw) + 1, y0 = Math.min(ry, py) - 1, y1 = Math.max(ry + rh, py + ph) + 1;
      instBoxes(g, add => {
        for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) {
          const x = cw(i), z = cw(j);
          if (inK(i, j)) { add(x + (R() - .5) * 0.06, 0.15 - 0.3 + 0.05, z + (R() - .5) * 0.06, 1.94, 0.34, 1.94, T.bfloor[R() * T.bfloor.length | 0]); continue; }
          if (flK(i, j)) continue;
          let nb = false, nm = false; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (inK(i + di, j + dj)) nb = true; if (fl(i + di, j + dj)) nm = true; }
          if (!nb || nm) continue;
          const back = flK(i, j + 1) && !flK(i, j - 1), rows = back ? 6 : flK(i, j - 1) && !flK(i, j + 1) ? 1 : 3;
          for (let y = 0; y < rows; y++) { const off = (y + j) % 2 ? 0.5 : 0; add(x - 0.5 + off, y + 0.45, z, 1.02, 0.95, 1.9, brick[R() * 4 | 0]); add(x + 0.5 + off - (off ? 1 : 0), y + 0.45, z, 1.02, 0.95, 1.9, brick[R() * 4 | 0]); }
          add(x, rows + 0.12, z, 2.02, 0.24, 2.02, T.top);
        }
      });
      // 방 안: 옛 기록 돌, 촛불, 기사단 깃발, 뼈
      const lx = cw(q.lore[0]), lz = cw(q.lore[1]);
      box(1.6, 0.3, 0.9, M(0x5c5468), lx, 0.15, lz, g); box(1.3, 2.3, 0.45, M(0x6e6a74), lx, 1.45, lz, g); box(1.5, 0.3, 0.6, M(0x5c5468), lx, 2.7, lz, g);
      const rm = M(0xffd36b, { e: 0xffb040, ei: 3, uniq: true }); for (const [yy, ww] of [[2.1, 0.8], [1.7, 0.6], [1.3, 0.9], [0.9, 0.5]]) box(ww, 0.1, 0.06, rm, lx, yy, lz + 0.25, g);
      this.loreM[k] = rm;
      for (const [cx2, cz2] of [[-1.4, 0.4], [1.4, 0.4], [1.0, 1.0]]) { cyl(0.08, 0.08, 0.5, 5, M(0xe8e0c8), lx + cx2, 0.25, lz + cz2, g); this.flame(g, lx + cx2, 0.6, lz + cz2, 0.3, false); }
      const L = new THREE.PointLight(0xffc070, 16, 14, 1.6); L.position.set(cw(rx + 3), 3, cw(ry + 3)); g.add(L);
      this.banner(g, cw(rx + 1), cw(ry) - 0.98 + 0.02, false, T.banner || 0x7a1f22);
      for (let b = 0; b < 3; b++) { const bb = box(1.1, 0.14, 0.14, bone(), cw(rx + 1 + b * 2), 0.1, cw(ry + rh - 1), g); bb.rotation.y = b * 1.3; }
      g.visible = !!SOPEN[k]; this.secG[k] = g; this.secOn[k] = SOPEN[k] ? 1 : 0;
      // 금 간 벽: 벽돌 사이로 금이 가 있고, 발밑에 부스러기가 떨어져 있어요
      const cg = new THREE.Group(); s.add(cg); const [fx, fy, fw, fh] = q.face, dir = rx < fx ? 1 : -1, crackM = M(0x141016), glowM = M(0xffd08a, { e: 0xffb050, ei: 2.6 });
      for (let j = fy; j < fy + fh; j++) {
        const x = cw(fx), z = cw(j);
        instBoxes(cg, add => { for (let y = 0; y < 3; y++) { const off = (y + j) % 2 ? 0.5 : 0; add(x, y + 0.45, z - 0.5 + off, 1.9, 0.95, 1.02, brick[R() * 4 | 0]); add(x, y + 0.45, z + 0.5 + off - (off ? 1 : 0), 1.9, 0.95, 1.02, brick[R() * 4 | 0]); } add(x, 3.12, z, 2.02, 0.24, 2.02, T.top); });
        // 지그재그 금 (벽 앞면과 윗면)
        let cy = 2.9, cz = z + (R() - .5) * 0.6;
        for (let n = 0; n < 6; n++) { const ny = cy - 0.45, nz = cz + (R() - .5) * 0.9, seg = box(0.06, Math.hypot(cy - ny, cz - nz) + 0.06, 0.09, n % 2 ? glowM : crackM, x + dir * 0.97, (cy + ny) / 2, (cz + nz) / 2, cg); seg.rotation.x = Math.atan2(nz - cz, cy - ny); cy = ny; cz = nz; }
        for (let n = 0; n < 4; n++) box(1.2 + R() * 0.6, 0.06, 0.12, n % 2 ? glowM : crackM, x + (R() - .5) * 0.5, 3.26, z + (R() - .5) * 1.4, cg).rotation.y = (R() - .5) * 1.6;
        for (let n = 0; n < 4; n++) { const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(brick[n % 4]), x + dir * (1.3 + R() * 0.8), 0.1, z + (R() - .5) * 1.6, cg); r.scale.setScalar(0.22 + R() * 0.2); r.rotation.y = R() * 3; }
      }
      // 틈새로 새어 나오는 빛과 먼지
      const cl = new THREE.PointLight(0xffb060, 10, 7, 1.6); cl.position.set(cw(fx) + dir * 1.6, 2.2, cw(fy) + fh); cg.add(cl);
      cg.userData.dust = { x: cw(fx) + dir * 1.05, z: cw(fy) + fh, t: 0 };
      cg.visible = !SOPEN[k]; this.crackG[k] = cg;
    });
    // 기사단 깃발: 뒤쪽 비밀 방 구석에 꽂혀 있어요. 들면 등에 메고 다녀요
    this.flagG = null;
    if (MAP.flag) {
      const g = new THREE.Group(); s.add(g); const col = FLAG_COL[chapterIndex()] || T.banner || 0x7a1f22;
      cyl(0.09, 0.1, 5.6, 6, M(0x5a3a22), 0, 2.8, 0, g); sph(0.2, 8, 6, gold(), 0, 5.75, 0, g); box(1.9, 0.12, 0.12, gold(), 0, 5.4, 0, g);
      const cloth = new THREE.Group(); cloth.position.set(0, 5.35, 0.08); g.add(cloth);
      box(1.7, 2.5, 0.06, M(col), 0, -1.25, 0, cloth); box(0.6, 1.0, 0.08, gold(), 0, -1.15, 0.03, cloth); box(0.22, 0.6, 0.09, M(col), 0, -1.15, 0.06, cloth); box(1.7, 0.14, 0.08, gold(), 0, -2.45, 0.01, cloth);
      for (const dx of [-0.45, 0.45]) box(0.62, 0.42, 0.06, M(col), dx, -2.7, 0, cloth).rotation.z = dx > 0 ? -0.78 : 0.78;
      const L = new THREE.PointLight(0xffd36b, 6, 9, 1.6); L.position.set(0, 4.6, 1.6); g.add(L);
      g.position.set(cw(MAP.flag[0]), 0, cw(MAP.flag[1])); g.visible = MAP.flag[2] === 's' ? !!SOPEN[MAP.flag[3]] : MAP.flag[2] === 'd';
      if (MAP.flag[2] === 'd') L.intensity = 0; // 어둠 속 깃발은 횃불을 가까이 대야 보여요
      this.flagG = { g, cloth, L };
    }
  }
  openSecret(k, lr) { if (!this.secG || !this.secG[k]) return; this.secG[k].visible = true; this.crackG[k].visible = false; this.secOn[k] = 1; if (lr) this.loreRead(lr); }
  // 수수께끼 방: 창살문, 발판, 화로와 순서 비석, 석상과 가운데 문양
  buildPuzzles(s, T) {
    this.puzR = [];
    const stone = M(0x6e6a74), stoneD = M(0x58545e), bar = M(0x3a3640, { m: 0.7, r: 0.45 });
    MAP.puzzles.forEach((q, k) => {
      const P = { k: q.k, items: [], done: false };
      // 창살문: 쇠창살이 길목을 막고 있다가 풀면 위로 올라가요
      const [gx, gy, gw, gh] = q.gate, g = new THREE.Group(); s.add(g); const along = gh === 1, L = (along ? gw : gh) * CS, cx = (gx + gw / 2) * CS, cz = (gy + gh / 2) * CS;
      g.position.set(cx, 0, cz); if (!along) g.rotation.y = Math.PI / 2;
      for (let u = -L / 2 + 0.3; u <= L / 2 - 0.2; u += 0.55) { cyl(0.08, 0.08, 4.6, 5, bar, u, 2.3, 0, g); cone(0.12, 0.4, 4, bar, u, 0.0, 0, g).rotation.x = Math.PI; }
      for (const y of [1.2, 2.6, 4.0]) box(L, 0.16, 0.16, bar, 0, y, 0, g);
      const posts = new THREE.Group(); s.add(posts); posts.position.copy(g.position); posts.rotation.y = g.rotation.y;
      for (const sx of [-1, 1]) { box(0.9, 5.4, 0.9, stoneD, sx * (L / 2 + 0.45), 2.7, 0, posts); box(1.1, 0.3, 1.1, stone, sx * (L / 2 + 0.45), 5.5, 0, posts); }
      box(L + 1.8, 0.7, 0.9, stoneD, 0, 5.4, 0, posts);
      P.gate = g;
      // 바닥 문양 (가운데)
      const cxw = cw(q.c[0]), czw = cw(q.c[1]);
      if (q.k === 'plates') {
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy), base = box(3.0, 0.24, 3.0, stoneD, x, 0.12, z, s), m = M(0x5a5662, { e: 0x2a2630, ei: 1, uniq: true }), top = box(2.4, 0.14, 2.4, m, x, 0.22, z, s);
          // 발판 둘레의 빛나는 테두리와 가운데 문양 (밟으면 금빛, 풀리면 초록빛)
          const rm = M(0xb0a8c0, { e: 0xb0a8c0, ei: 1.2, uniq: true });
          for (const [dx, dz, w2, d2] of [[0, -1.25, 2.6, 0.14], [0, 1.25, 2.6, 0.14], [-1.25, 0, 0.14, 2.6], [1.25, 0, 0.14, 2.6]]) box(w2, 0.06, d2, rm, x + dx, 0.32, z + dz, s).castShadow = false;
          for (let r = 0; r < 4; r++) { const b = box(0.16, 0.06, 1.4, rm, x, 0.32, z, s); b.rotation.y = r * Math.PI / 4; b.castShadow = false; }
          return { top, m, rm, on: 0 };
        });
      } else if (q.k === 'braziers') {
        const COL = [0xff5a3a, 0x5ab0ff, 0x7ae07a, 0xffd36b];
        P.items = q.items.map(([ix, iy], i) => {
          const x = cw(ix), z = cw(iy); cyl(0.55, 0.75, 1.3, 8, stoneD, x, 0.65, z, s); cyl(0.95, 0.55, 0.55, 10, M(0x4a4048, { m: 0.6, r: 0.5 }), x, 1.55, z, s);
          const gem = mesh(geo('oct3', () => new THREE.OctahedronGeometry(0.28)), M(COL[i], { e: COL[i], ei: 1.6, uniq: true }), x, 0.8, z + 0.75, s);
          const fg = new THREE.Group(); fg.position.set(x, 1.85, z); s.add(fg); fg.visible = false;
          for (let n = 0; n < 5; n++) cone(0.3 + R() * 0.15, 0.9 + R() * 0.6, 6, M(COL[i], { e: COL[i], ei: 3 }), (R() - .5) * 0.5, 0.3, (R() - .5) * 0.5, fg);
          cone(0.22, 0.8, 6, M(0xfff0c0, { e: 0xfff0c0, ei: 4 }), 0, 0.2, 0, fg);
          const Lt = new THREE.PointLight(COL[i], 0, 14, 1.6); Lt.position.set(x, 3, z); s.add(Lt);
          return { fg, Lt, gem, on: 0 };
        });
        // 순서 비석: 불 붙일 화로의 색이 왼쪽부터 차례로 박혀 있어요
        box(4.4, 0.4, 1.2, stoneD, cxw, 0.2, czw, s); box(3.9, 2.4, 0.5, stone, cxw, 1.6, czw, s); box(4.2, 0.3, 0.7, stoneD, cxw, 2.95, czw, s);
        q.order.forEach((bi, n) => { const x = cxw - 1.35 + n * 0.9; mesh(geo('oct4', () => new THREE.OctahedronGeometry(0.26)), M(COL[bi], { e: COL[bi], ei: 2.4 }), x, 1.9, czw + 0.3, s); for (let d = 0; d <= n; d++) box(0.1, 0.1, 0.05, M(0xffe08a, { e: 0xffd060, ei: 2 }), x - n * 0.07 + d * 0.14, 1.2, czw + 0.28, s); });
      } else if (q.k === 'oath') {
        // 기사 전용: 방패 문양 석판. 위에서 막기를 쓰면 금빛이 들어와요
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy); box(2.8, 0.3, 2.8, stoneD, x, 0.15, z, s); const m = M(0x6a6478, { e: 0x3f6fd0, ei: 0.6, uniq: true });
          const sh = new THREE.Group(); sh.position.set(x, 0.32, z); s.add(sh); box(1.3, 0.08, 1.5, m, 0, 0, -0.1, sh); const tip = box(0.92, 0.08, 0.92, m, 0, 0, 0.55, sh); tip.rotation.y = Math.PI / 4;
          box(0.18, 0.1, 1.2, M(0xe6c15a, { e: 0xe6c15a, ei: 0.4, uniq: true }), 0, 0.03, 0.05, sh); box(0.8, 0.1, 0.18, M(0xe6c15a, { e: 0xe6c15a, ei: 0.4 }), 0, 0.03, -0.2, sh);
          const Lt = new THREE.PointLight(0xffd36b, 0, 10, 1.6); Lt.position.set(x, 2, z); s.add(Lt); return { m, Lt };
        });
      } else if (q.k === 'targets') {
        // 궁수 전용: 벽 높이 걸린 과녁. 맞히면 초록빛
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy) - 0.95, g2 = new THREE.Group(); g2.position.set(x, 4.3, z); g2.rotation.x = Math.PI / 2; s.add(g2);
          const m = M(0xd8d0bc, { uniq: true }), mr = M(0xc0392b, { e: 0x601010, ei: 0.4, uniq: true });
          cyl(0.9, 0.9, 0.16, 16, m, 0, 0, 0, g2); cyl(0.65, 0.65, 0.18, 16, mr, 0, 0.01, 0, g2); cyl(0.4, 0.4, 0.2, 16, m, 0, 0.02, 0, g2); cyl(0.18, 0.18, 0.22, 12, mr, 0, 0.03, 0, g2);
          box(0.2, 1.6, 0.2, leather(), x, 3.5, z - 0.1, s);
          const ar = new THREE.Group(); ar.position.set(0.1, 0.3, 0); g2.add(ar); cyl(0.04, 0.04, 1.0, 4, M(0x8a6a40), 0, 0.5, 0, ar); box(0.2, 0.2, 0.04, M(0xe8e4ef), 0, 0.95, 0, ar); ar.visible = false;
          return { m, mr, ar };
        });
      } else if (q.k === 'basins') {
        // 사제 전용: 말라 있는 성수반. 빛 구슬이 닿으면 빛나는 물이 차요
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy); cyl(0.4, 0.6, 1.2, 8, stoneD, x, 0.6, z, s); cyl(1.0, 0.6, 0.5, 12, stone, x, 1.4, z, s);
          const m = M(0x4a4652, { e: 0x9af0e0, ei: 0, uniq: true }), w = cyl(0.85, 0.85, 0.06, 12, m, x, 1.62, z, s);
          const Lt = new THREE.PointLight(0x9af0e0, 0, 12, 1.6); Lt.position.set(x, 2.6, z); s.add(Lt); return { m, w, Lt };
        });
      } else if (q.k === 'vines') {
        // 종자 전용: 가시덩굴. 횃불 공격에 불이 붙어 타 없어져요
        const vm = M(0x2f4a24), tm = M(0x5a6a2a);
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy), g2 = new THREE.Group(); g2.position.set(x, 0, z); s.add(g2);
          for (let n = 0; n < 7; n++) { const a = n / 7 * 6.283, c = cyl(0.14, 0.24, 2.6 + R(), 5, vm, Math.cos(a) * 0.7, 1.2, Math.sin(a) * 0.7, g2); c.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); for (let t2 = 0; t2 < 3; t2++) { const th = cone(0.08, 0.3, 4, tm, Math.cos(a) * (0.8 + t2 * 0.2), 0.6 + t2 * 0.7, Math.sin(a) * (0.8 + t2 * 0.2), g2); th.rotation.z = -Math.cos(a) * 1.4; th.rotation.x = Math.sin(a) * 1.4; } }
          sph(0.8, 8, 6, vm, 0, 0.5, 0, g2).scale.set(1.2, 0.6, 1.2);
          const fg = new THREE.Group(); fg.visible = false; g2.add(fg); for (let n = 0; n < 5; n++) cone(0.3, 1.1, 6, M(0xff8a2a, { e: 0xff6a10, ei: 3 }), (R() - .5) * 1.2, 1.4, (R() - .5) * 1.2, fg);
          return { g: g2, fg, burn: 0 };
        });
      } else if (q.k === 'levers') {
        // 지렛대 넷: 기둥 위 등불이 켜지면 금빛, 손잡이는 켜짐/꺼짐에 따라 앞뒤로 젖혀져요
        P.items = q.items.map(([ix, iy], i) => {
          const x = cw(ix), z = cw(iy); box(1.4, 0.4, 1.0, stoneD, x, 0.2, z, s); box(0.3, 3.2, 0.3, M(0x4a3020), x, 1.8, z - 0.6, s);
          const cage = M(0x3a3640, { m: 0.7, r: 0.4 }); box(0.8, 0.1, 0.8, cage, x, 3.45, z - 0.6, s); box(0.8, 0.1, 0.8, cage, x, 4.35, z - 0.6, s);
          const lm = M(0x4a4652, { e: 0xffc060, ei: 0, uniq: true }), core = box(0.5, 0.7, 0.5, lm, x, 3.9, z - 0.6, s);
          const h = new THREE.Group(); h.position.set(x, 0.45, z + 0.1); s.add(h); box(0.12, 1.3, 0.12, M(0x3a3640, { m: 0.7 }), 0, 0.65, 0, h); sph(0.18, 6, 5, M(0xc0392b), 0, 1.35, 0, h);
          const Lt = new THREE.PointLight(0xffc060, 0, 10, 1.6); Lt.position.set(x, 4, z); s.add(Lt);
          return { lm, h, Lt };
        });
      } else if (q.k === 'sigils') {
        // 얼음 문양 아홉 칸: 밟으면 하늘빛, 지금 밟고 있는 끝 칸은 하얗게
        P.items = q.items.map(([ix, iy]) => { const x = cw(ix), z = cw(iy), m = M(0x5a7a94, { e: 0x7ad0ff, ei: 0.25, uniq: true }), t2 = box(3.6, 0.1, 3.6, m, x, 0.06, z, s); t2.castShadow = false; for (let r = 0; r < 2; r++) { const b = box(0.18, 0.06, 2.4, M(0xd8f0ff, { e: 0x9ae0ff, ei: 0.6 }), x, 0.13, z, s); b.rotation.y = Math.PI / 4 + r * Math.PI / 2; b.castShadow = false; } return { m }; });
      } else if (q.k === 'crystals' || q.k === 'icecrys') {
        // 빛 수정(보라)·얼음 수정(하늘): 길쭉한 수정 덩어리
        const ice = q.k === 'icecrys', col = ice ? 0x9ae0ff : 0xb07aff;
        P.items = q.items.map(([ix, iy]) => {
          const x = cw(ix), z = cw(iy), g2 = new THREE.Group(); g2.position.set(x, 0, z); s.add(g2); const m = M(ice ? 0xbfe8ff : 0x6a4a8a, { e: col, ei: ice ? 0.6 : 0.2, uniq: true });
          for (let n = 0; n < 5; n++) { const c = mesh(geo('oct', () => new THREE.OctahedronGeometry(0.32)), m, (n ? Math.cos(n * 1.6) * 0.55 : 0), n ? 0.8 : 1.3, (n ? Math.sin(n * 1.6) * 0.55 : 0), g2); c.scale.set(n ? 1.4 : 2, n ? 3.2 : 5, n ? 1.4 : 2); c.rotation.z = n ? Math.cos(n * 1.6) * 0.4 : 0; c.rotation.x = n ? Math.sin(n * 1.6) * 0.4 : 0; }
          const Lt = new THREE.PointLight(col, 0, 10, 1.6); Lt.position.set(x, 2.4, z); s.add(Lt); return { g: g2, m, Lt };
        });
      } else if (q.k === 'mirrors') {
        // 거울 셋: 창문 빛(src)이 거울을 차례로 지나 창살문까지. 맞게 돌린 거울까지만 빛줄기가 이어져요
        const pts = [[cw(q.src[0]), cw(q.src[1])], ...q.items.map(([ix, iy]) => [cw(ix), cw(iy)]), [(q.gate[0] + q.gate[2] / 2) * CS, (q.gate[1] + q.gate[3] / 2) * CS]];
        sph(0.9, 10, 8, M(0xfff0c0, { e: 0xfff0c0, ei: 3 }), pts[0][0], 2.4, pts[0][1], s);
        const bm = M(0xfff0b0, { e: 0xffe08a, ei: 3, op: 0.75 });
        P.beams = pts.slice(0, -1).map((a2, n) => { const b2 = pts[n + 1], L2 = Math.hypot(b2[0] - a2[0], b2[1] - a2[1]), bb = box(0.25, 0.25, L2, bm, (a2[0] + b2[0]) / 2, 2.4, (a2[1] + b2[1]) / 2, s, false); bb.rotation.y = Math.atan2(b2[0] - a2[0], b2[1] - a2[1]); bb.castShadow = false; return bb; });
        P.items = q.items.map(([ix, iy], i) => {
          const x = cw(ix), z = cw(iy), a2 = pts[i], b2 = pts[i + 2], din = [x - a2[0], z - a2[1]], dout = [b2[0] - x, b2[1] - z], l1 = Math.hypot(...din), l2 = Math.hypot(...dout);
          const nx = -din[0] / l1 + dout[0] / l2, nz = -din[1] / l1 + dout[1] / l2, ok = Math.atan2(nx, nz);
          box(1.6, 0.5, 1.6, stoneD, x, 0.25, z, s); const g2 = new THREE.Group(); g2.position.set(x, 0.5, z); s.add(g2);
          box(0.2, 1.6, 0.2, M(0x8a6a30, { m: 0.6 }), 0, 0.8, 0, g2); box(1.7, 1.9, 0.16, M(0x8a6a30, { m: 0.6 }), 0, 1.9, 0, g2); box(1.4, 1.6, 0.06, M(0xd8e4f0, { m: 0.9, r: 0.1, e: 0x6a7a8a, ei: 0.5 }), 0, 1.9, 0.09, g2);
          return { g: g2, ok, cur: ok + q.rot0[i] * Math.PI / 4 };
        });
      } else if (q.k === 'embers') {
        // 불씨 더미(가운데)와 빈 제단 셋. 올리면 불이 붙어요
        P.items = q.items.map(([ix, iy], i) => {
          const x = cw(ix), z = cw(iy); cyl(0.7, 0.9, 1.0, 8, stoneD, x, 0.5, z, s); cyl(1.0, 0.7, 0.4, 10, M(0x3a3236, { m: 0.5 }), x, 1.2, z, s);
          const fg = new THREE.Group(); fg.position.set(x, 1.45, z); s.add(fg); for (let n = 0; n < 4; n++) cone(0.25, 0.8, 6, M(0xff7a2a, { e: 0xff5a10, ei: 3 }), (n % 2 - .5) * 0.4, 0.3, (n >> 1) * 0.4 - 0.2, fg);
          if (i === 0) for (let n = 0; n < 5; n++) sph(0.18, 6, 5, M(0xffb060, { e: 0xff8a20, ei: 3 }), x + Math.cos(n * 1.3) * 0.5, 1.5, z + Math.sin(n * 1.3) * 0.5, s);
          const Lt = new THREE.PointLight(0xff8a30, i === 0 ? 20 : 0, 10, 1.6); Lt.position.set(x, 2.5, z); s.add(Lt); fg.visible = i === 0; return { fg, Lt };
        });
      } else if (q.k === 'lanterns') {
        // 일렬 등불 셋: 쇠기둥에 걸린 등불. 관통 화살이 꿰뚫으면 켜져요
        P.items = q.items.map(([ix, iy]) => { const x = cw(ix), z = cw(iy); box(0.25, 2.2, 0.25, M(0x3a3640, { m: 0.7 }), x, 1.1, z + 0.9, s); box(0.9, 0.12, 0.12, M(0x3a3640, { m: 0.7 }), x, 2.2, z + 0.5, s); const lm = M(0x4a4652, { e: 0xffd36b, ei: 0, uniq: true }); box(0.6, 0.8, 0.6, lm, x, 1.6, z, s); const Lt = new THREE.PointLight(0xffd36b, 0, 10, 1.6); Lt.position.set(x, 2, z); s.add(Lt); return { lm, Lt }; });
        box(0.2, 0.05, 13, M(0xd8c8a0, { e: 0x6a5a30, ei: 0.4 }), cw(q.items[0][0]) - 6, 0.06, cw(q.items[0][1]), s).rotation.y = Math.PI / 2;
      } else if (q.k === 'vigil') {
        // 기도의 원 셋: 사제가 서 있으면 안쪽 원이 차올라요
        P.items = q.items.map(([ix, iy]) => { const x = cw(ix), z = cw(iy), rm = M(0xe8e4ef, { e: 0xfff4c0, ei: 0.6, uniq: true }), ring = mesh(geo('vring', () => new THREE.RingGeometry(1.3, 1.6, 28)), rm, x, 0.1, z, s, false); ring.rotation.x = -Math.PI / 2; const fm = M(0xfff4c0, { e: 0xfff4c0, ei: 2, op: 0.55 }), fill = mesh(geo('vdisc', () => new THREE.CircleGeometry(1.3, 24)), fm, x, 0.09, z, s, false); fill.rotation.x = -Math.PI / 2; fill.scale.setScalar(0.01); const Lt = new THREE.PointLight(0xfff4c0, 0, 10, 1.6); Lt.position.set(x, 2, z); s.add(Lt); return { rm, fill, Lt }; });
      } else if (q.k === 'blackfire') {
        // 검은 불꽃 셋: 보랏빛 검은 불. 물약에 꺼지면 연기만 남아요
        P.items = q.items.map(([ix, iy]) => { const x = cw(ix), z = cw(iy); cyl(0.8, 1.0, 0.8, 8, stoneD, x, 0.4, z, s); const fg = new THREE.Group(); fg.position.set(x, 0.8, z); s.add(fg); for (let n = 0; n < 5; n++) cone(0.3 + R() * 0.15, 1.2 + R() * 0.6, 6, M(0x1a0a24, { e: 0x6a2aa0, ei: 1.6 }), (R() - .5) * 0.6, 0.6, (R() - .5) * 0.6, fg); const Lt = new THREE.PointLight(0x8a3ad0, 18, 9, 1.6); Lt.position.set(x, 2, z); s.add(Lt); return { fg, Lt }; });
      } else {
        // 석상: 칼을 앞으로 내민 기사. 가운데 문양을 바라보면 문양에 빛이 들어와요
        const ring = mesh(geo('pring2', () => new THREE.RingGeometry(1.7, 2.1, 32)), M(0x8a8494, { e: 0x8a8494, ei: 0.5, uniq: true }), cxw, 0.14, czw, s, false); ring.rotation.x = -Math.PI / 2;
        P.ring = ring;
        P.items = q.items.map(([ix, iy], i) => {
          const x = cw(ix), z = cw(iy); box(2.0, 0.5, 2.0, stoneD, x, 0.25, z, s);
          const g2 = new THREE.Group(); g2.position.set(x, 0.5, z); s.add(g2);
          cyl(0.5, 0.65, 1.6, 8, stone, 0, 1.3, 0, g2); sph(0.55, 8, 6, stone, 0, 2.35, 0, g2).scale.set(1, 0.7, 0.85); cyl(0.38, 0.4, 0.7, 8, stone, 0, 3.0, 0, g2); sph(0.38, 8, 5, stone, 0, 3.35, 0, g2, 1.6);
          box(0.5, 0.08, 0.1, M(0x1a1618), 0, 3.05, 0.38, g2);
          const sw = box(0.16, 0.16, 2.0, M(0x8a8494), 0.45, 1.9, 1.0, g2); box(0.7, 0.12, 0.16, stoneD, 0.45, 1.9, 0.05, g2); box(1.0, 1.2, 0.18, stoneD, -0.6, 1.6, 0.35, g2);
          const eye = M(0x8a8494, { e: 0x6af0c0, ei: 0, uniq: true }); box(0.48, 0.07, 0.04, eye, 0, 3.06, 0.44, g2);
          return { g: g2, eye, r: q.rot0[i], cur: -q.rot0[i] * Math.PI / 2 };
        });
      }
      this.puzR.push(P);
    });
  }
  // 끊어진 길: 바닥이 꺼진 낭떠러지와 금 간 기둥 / 도르래 승강기: 절벽, 오르내리는 발판, 손잡이 둘
  buildCuts(s, T, brick) {
    this.pitR = []; this.liftR = [];
    const dark = M(0x0a080c), wood = M(0x6a4628), woodD = M(0x4a3020), rope = M(0xb09a70), stoneD = M(0x58545e), crackM = M(0x141016), glowM = M(0xffd08a, { e: 0xffb050, ei: 2.6 });
    const edges = (band, ax, depth, col) => instBoxes(s, add => {
      const [bx, by, bw, bh] = band;
      // 낭떠러지 안쪽 벽: 띠 둘레를 따라 아래로 내려가는 벽돌
      for (let j = by; j < by + bh; j++) for (let i = bx; i < bx + bw; i++) {
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = i + di, nj = j + dj; if (ni >= bx && ni < bx + bw && nj >= by && nj < by + bh) continue;
          const x = cw(i) + di * 0.95, z = cw(j) + dj * 0.95;
          for (let y = 0; y < depth; y++) add(x, -0.5 - y, z, di ? 0.12 : 1.96, 0.95, dj ? 0.12 : 1.96, col[(y + i + j) % col.length]);
        }
      }
    });
    MAP.pits.forEach((q, k) => {
      const [bx, by, bw, bh] = q.band;
      box(bw * CS, 0.2, bh * CS, dark, (bx + bw / 2) * CS, -6, (by + bh / 2) * CS, s, false);
      edges(q.band, q.ax, 5, brick);
      // 낭떠러지 끝 부스러기
      for (let n = 0; n < 10; n++) { const along = R() * (q.ax === 'h' ? bw : bh), side = R() < 0.5 ? -0.4 : (q.ax === 'h' ? bh : bw) + 0.4; const x = q.ax === 'h' ? (bx + along) * CS : (bx + side) * CS, z = q.ax === 'h' ? (by + side) * CS : (by + along) * CS; const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(brick[n % 4]), x, 0.1, z, s); r.scale.setScalar(0.25 + R() * 0.25); r.rotation.y = R() * 3; }
      // 기둥: 밑동을 축으로 먼 쪽을 향해 쓰러져요
      const o = pillarAt(k), g = new THREE.Group(); g.position.set(o.x, 0, o.z); s.add(g);
      const fall = new THREE.Group(); g.add(fall);
      // 쓰러지는 방향: 가로 띠는 위쪽(-z), 세로 띠는 far 쪽(±x)
      if (q.ax === 'h') g.rotation.y = 0; else g.rotation.y = q.far > 0 ? -Math.PI / 2 : Math.PI / 2;
      box(2.8, 0.6, 2.8, stoneD, 0, 0.3, 0, g);
      const Hp = 10.5;
      instBoxes(fall, add => { for (let y = 0.6; y < Hp - 0.6; y += 1.1) add((R() - .5) * 0.06, y + 0.5, (R() - .5) * 0.06, 2.0, 1.05, 2.0, brick[R() * 4 | 0]); add(0, Hp - 0.2, 0, 2.5, 0.5, 2.5, 0x5c5468); });
      // 앞면의 빛나는 금
      const cracks = new THREE.Group(); fall.add(cracks);
      let cy = 5.5, cx = 0; for (let n = 0; n < 7; n++) { const ny = cy - 0.6, nx = cx + (R() - .5) * 0.9, sg = box(Math.hypot(cx - nx, 0.01) + 0.08, 0.6 + 0.08, 0.08, n % 2 ? glowM : crackM, (cx + nx) / 2, (cy + ny) / 2, 1.02, cracks); sg.rotation.z = Math.atan2(nx - cx, 0.6); cy = ny; cx = nx; }
      for (let n = 0; n < 3; n++) { const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(brick[n % 4]), (R() - .5) * 2, 0.15, 1.6 + R() * 0.6, g); r.scale.setScalar(0.2 + R() * 0.15); }
      const L = new THREE.PointLight(0xffb060, 8, 7, 1.6); L.position.set(0, 3, 1.8); g.add(L);
      this.pitR.push({ g, fall, cracks, L, down: q.ax ? false : false, ang: 0, v: 0, hits: 0, done: false, Hp });
    });
    MAP.lifts.forEach((q, k) => {
      const [bx, by, bw, bh] = q.band, [px, py, pw, ph] = q.plat, H = LEDGE_H;
      // 절벽: 발판 자리만 비워 두고 위층 높이까지 벽돌을 쌓아요. 발판 구멍 아래는 어둡게
      instBoxes(s, add => { for (let j = by; j < by + bh; j++) for (let i = bx; i < bx + bw; i++) { if (i >= px && i < px + pw && j >= py && j < py + ph) continue; for (let y = 0; y < Math.ceil(H); y++) add(cw(i), y + 0.45 - (Math.ceil(H) - H), cw(j), 1.98, 0.95, 1.98, brick[(y + i + j) % 4]); add(cw(i), H + 0.1, cw(j), 2.02, 0.2, 2.02, T.top); } });
      // 위층 가장자리 난간 (발판 자리는 비워요): 위층이 높다는 게 한눈에 보이게
      const fence = (i, j, di, dj) => { const x = cw(i) - di * 0.85, z = cw(j) - dj * 0.85, y = H; box(0.22, 1.1, 0.22, woodD, x, y + 0.55, z, s); box(di ? 0.12 : 2.0, 0.14, dj ? 0.12 : 2.0, wood, x, y + 0.95, z, s); box(di ? 0.1 : 2.0, 0.1, dj ? 0.1 : 2.0, wood, x, y + 0.5, z, s); };
      if (q.ax === 'h') { for (let i = bx; i < bx + bw; i++) if (i < px || i >= px + pw) fence(i, by - 1, 0, -1); }
      else { const ei = q.far > 0 ? bx + 3 : bx - 1; for (let j = by; j < by + bh; j++) if (j < py || j >= py + ph) fence(ei, j, q.far > 0 ? 1 : -1, 0); }
      const pcx = (px + pw / 2) * CS, pcz = (py + ph / 2) * CS, W = pw * CS - 0.2;
      // 도르래 틀: 양옆 기둥과 위의 들보, 가운데 바퀴
      const perp = q.ax === 'h'; // 가로 띠: 기둥은 x 양옆
      for (const sgn of [-1, 1]) { const x = perp ? pcx + sgn * (W / 2 + 0.5) : pcx, z = perp ? pcz : pcz + sgn * (W / 2 + 0.5); box(0.6, H + 5.4, 0.6, woodD, x, (H + 5.4) / 2, z, s); }
      box(perp ? W + 1.6 : 0.6, 0.6, perp ? 0.6 : W + 1.6, woodD, pcx, H + 5.4, pcz, s);
      const wheel = new THREE.Group(); wheel.position.set(pcx, H + 4.8, pcz); s.add(wheel); if (!perp) wheel.rotation.y = Math.PI / 2;
      cyl(0.8, 0.8, 0.3, 10, wood, 0, 0, 0, wheel).rotation.x = Math.PI / 2; for (let n = 0; n < 4; n++) box(1.5, 0.12, 0.12, woodD, 0, 0, 0.18, wheel).rotation.z = n * Math.PI / 4;
      // 발판: 나무 판자, 난간, 네 귀퉁이 밧줄
      const plat = new THREE.Group(); plat.position.set(pcx, 0, pcz); s.add(plat);
      instBoxes(plat, add => { for (let n = 0; n < 6; n++) add(-W / 2 + W / 12 + n * W / 6, -0.15, 0, W / 6 - 0.08, 0.3, W, [0x6a4628, 0x5e3e22, 0x744c2c][n % 3]); });
      box(W, 0.16, 0.3, woodD, 0, -0.05, -W / 2, plat); box(W, 0.16, 0.3, woodD, 0, -0.05, W / 2, plat);
      const ropes = []; for (const [ax2, az2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const r = box(0.08, 1, 0.08, rope, ax2 * (W / 2 - 0.2), 0, az2 * (W / 2 - 0.2), plat); r.castShadow = false; ropes.push(r); }
      // 발판 위 빛나는 테두리 (움직일 수 있을 때 금빛)
      const rimM = M(0xffd36b, { e: 0xffb040, ei: 1.5, uniq: true }); for (const [dx, dz, w2, d2] of [[0, -W / 2 + 0.1, W, 0.1], [0, W / 2 - 0.1, W, 0.1], [-W / 2 + 0.1, 0, 0.1, W], [W / 2 - 0.1, 0, 0.1, W]]) box(w2, 0.05, d2, rimM, dx, 0.02, dz, plat).castShadow = false;
      // 손잡이: 아래층과 위층에 하나씩. 돌리면 바퀴가 돌아요
      const cranks = [q.cb, q.ct].map(([cx2, cy2], n) => {
        const x = cw(cx2), z = cw(cy2), y0 = n ? H : 0, cg = new THREE.Group(); cg.position.set(x, y0, z); s.add(cg);
        box(1.2, 1.4, 1.0, woodD, 0, 0.7, 0, cg); const wh = new THREE.Group(); wh.position.set(0, 1.5, 0.55); cg.add(wh);
        cyl(0.55, 0.55, 0.14, 10, wood, 0, 0, 0, wh).rotation.x = Math.PI / 2; box(0.12, 0.9, 0.12, woodD, 0, 0.3, 0.12, wh); cyl(0.07, 0.07, 0.5, 5, M(0xd8c8a0), 0, 0.75, 0.3, wh).rotation.x = Math.PI / 2;
        const gem = mesh(geo('oct3', () => new THREE.OctahedronGeometry(0.28)), M(0xffd36b, { e: 0xffb040, ei: 2, uniq: true }), 0, 2.4, 0, cg);
        return { cg, wh, gem };
      });
      this.liftR.push({ plat, wheel, ropes, rimM, cranks, H, h: 0 });
    });
  }
  syncCuts(W, dt, t) {
    if (!this.pitR) return;
    this.pitR.forEach((P, k) => {
      const v = W && W.pt ? W.pt[k] : 0, down = v === -1;
      if (!down && v > P.hits) { P.hits = v; P.fall.rotation.x = -0.04; P.cracks.scale.setScalar(1 + v * 0.12); P.L.intensity = 8 + v * 4; }
      P.fall.rotation.x += (0 - P.fall.rotation.x) * Math.min(1, dt * 10) * (P.down ? 0 : 1);
      if (down && !P.down) { P.down = true; P.v = 0; }
      if (P.down && !P.done) { P.v += dt * 3.2; P.ang = Math.min(Math.PI / 2, P.ang + P.v * dt * 2.4); P.fall.rotation.x = -P.ang; if (P.ang >= Math.PI / 2) { P.done = true; this.shake = Math.max(this.shake, 0.9); const o = P.g.position; const fx = o.x + (P.g.rotation.y ? -Math.sin(P.g.rotation.y) : 0) * 6, fz = o.z - (P.g.rotation.y ? 0 : 6); this.burst(fx, 0.6, fz, 0x9a8e84, 26, 6, 0.9, 0.22); this.ring(fx, fz, 4, 0xc8b89a, 0.6); P.L.intensity = 0; } }
      if (P.done) { P.fall.rotation.x = -Math.PI / 2; P.cracks.visible = false; }
    });
    this.liftR.forEach((L, k) => {
      const z = W && W.lf ? W.lf[k] : null; if (!z) return; const [h, done, mv] = z;
      L.h += (h - L.h) * Math.min(1, dt * 14); L.plat.position.y = L.h * L.H;
      // 밧줄은 발판에서 들보까지 늘었다 줄었다
      const top = L.H + 4.8 - L.plat.position.y; L.ropes.forEach(r => { r.scale.y = top; r.position.y = top / 2; });
      if (mv) { const d = (h >= L.h ? 1 : -1) * dt * 5; L.wheel.rotation.z += d; L.cranks.forEach(c => c.wh.rotation.z -= d * 1.6); }
      const ready = h <= 0.03 || h >= 0.97; L.rimM.emissiveIntensity = ready ? 1.5 + Math.sin(t * 4) * 0.6 : 0.3;
      L.cranks.forEach(c => { c.gem.visible = !done; c.gem.position.y = 2.4 + Math.sin(t * 2.5) * 0.12; c.gem.rotation.y = t; });
    });
  }
  // 어둠의 방: 방 위를 검은 막으로 덮고, 동료 둘레와 횃불 둘레만 구멍을 뚫어요. 입구에는 횃불 걸이가 있어요
  buildDarks(s) {
    this.darkR = [];
    const H = 4.5, SH = 1.614; this.darkH = { H, SH };
    MAP.darks.forEach(D => {
      const [x, y, w, h] = D.room, x0 = (x - 0.5) * CS, x1 = (x + w + 0.5) * CS, z0 = (y - 0.5) * CS + SH * H, z1 = (y + h + 0.5) * CS + SH * H;
      const L = []; for (let k = 0; k < 6; k++) L.push(new THREE.Vector3(0, 0, 0));
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false,
        uniforms: { uL: { value: L }, uR: { value: new THREE.Vector4(x0, z0, x1, z1) }, uA: { value: 0.96 } },
        vertexShader: 'varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform vec3 uL[6]; uniform vec4 uR; uniform float uA; varying vec2 vW; void main(){ float a = uA; for (int i = 0; i < 6; i++) { if (uL[i].z > 0.0) a *= smoothstep(uL[i].z * 0.45, uL[i].z, distance(vW, uL[i].xy)); } float e = min(min(vW.x - uR.x, uR.z - vW.x), min(vW.y - uR.y, uR.w - vW.y)); a *= smoothstep(0.0, 2.2, e); gl_FragColor = vec4(0.012, 0.008, 0.02, a); }'
      });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat); pl.rotation.x = -Math.PI / 2; pl.position.set((x0 + x1) / 2, H, (z0 + z1) / 2); pl.renderOrder = 15; s.add(pl);
      // 횃불 걸이
      const sx = cw(D.stand[0]), sz = cw(D.stand[1]), st = new THREE.Group(); st.position.set(sx, 0, sz); s.add(st);
      box(2.2, 0.25, 0.9, M(0x4a3020), 0, 0.12, 0, st); for (const ox of [-0.8, 0.8]) box(0.18, 2.2, 0.18, M(0x4a3020), ox, 1.1, 0, st); box(2.0, 0.16, 0.2, M(0x4a3020), 0, 1.9, 0, st);
      const tor = [-0.45, 0.45].map(ox => { const t = new THREE.Group(); t.position.set(ox, 1.0, 0.15); st.add(t); cyl(0.07, 0.09, 1.3, 6, leather(), 0, 0.4, 0, t); cone(0.2, 0.55, 6, M(0xffa040, { e: 0xff7a20, ei: 3 }), 0, 1.25, 0, t); return t; });
      const sl = new THREE.PointLight(0xff9a48, 8, 6, 1.6); sl.position.set(sx, 2.6, sz + 0.8); s.add(sl);
      this.darkR.push({ pl, mat, tor, sl, L });
    });
  }
  // 무너지는 성: 출구 표시 (초록빛 기둥)
  // 빛 개수가 바뀌면 화면이 잠깐 멈춰서, 출구 빛과 횃불 빛은 지도를 만들 때 미리 꺼 둔 채로 넣어 둬요
  buildExit(s) {
    this.exitG = null; this.torchL = [0, 1].map(() => { const L = new THREE.PointLight(0xffa050, 0, 16, 1.5); s.add(L); return L; });
    if (!MAP.exit || CH.deep) return; const x = cw(MAP.exit[0]), z = cw(MAP.exit[1]);
    const g = new THREE.Group(); g.position.set(x, 0, z); s.add(g);
    const m = M(0x9af0a8, { e: 0x6ad080, ei: 1.4, op: 0.28, uniq: true, ds: true }); mesh(geo('exitc', () => new THREE.CylinderGeometry(2.6, 2.6, 14, 16, 1, true)), m, 0, 7, 0, g, false);
    const r = mesh(geo('hring', () => new THREE.RingGeometry(3.8, 4, 40)), M(0x9af0a8, { e: 0x6ad080, ei: 2, op: 0.6 }), 0, 0.16, 0, g, false); r.rotation.x = -Math.PI / 2; r.scale.setScalar(0.7);
    const L = new THREE.PointLight(0x9af0a8, 0, 18, 1.6); L.position.set(0, 3, 0); g.add(L); g.children.forEach(c => { if (!c.isLight) c.visible = false; }); this.exitG = g; this.exitL = L; this.exitM = m;
  }
  loreRead(lr) { if (!this.loreM) return; lr.forEach((r, k) => { if (this.loreM[k]) this.loreM[k].emissiveIntensity = r ? 0.4 : 2.2 + Math.sin(performance.now() / 300) * 1.2; }); }
  // 맵 디테일: 빛줄기와 먼지, 쇠사슬과 창살, 깨진 타일·이끼·틈, 거미줄과 뼈, 쓰러진 석상과 갑옷, 흔들리는 풀과 덩굴, 물방울과 물결, 아치문과 기사단 문장
  details(s, T) {
    const th = CH.theme, ff = th === 'forest', stoneM = M(0x6e6a74), stoneD = M(0x58545e), boneM = bone(), dark = M(0x1a1618), webM = M(0xe8e8f0, { e: 0x8a8a9a, ei: 0.4, op: 0.5, uniq: true, ds: true });
    const beamC = ff ? 0xe8ffc8 : th === 'abbey' ? 0xbfe0ff : th === 'tower' ? 0xffc8a0 : 0xfff0d0;
    const beamM = M(beamC, { e: beamC, ei: 0.3, op: 0.035, uniq: true, ds: true }), glowM = M(beamC, { e: beamC, ei: 0.4, op: 0.07, uniq: true });
    const moteM = M(beamC, { e: beamC, ei: 4 }), dropM = M(0x9ad0ff, { e: 0x6aa0e0, ei: 3 }), wetM = M(0x2a3a4c, { op: 0.35, uniq: true, r: 0.2, m: 0.3 });
    const grassC = [0x4a6a34, 0x557a3a, 0x3e5a2c], vineM = M(0x3a5a2a);
    const crestC = T.banner || (ff ? 0x5a3a1a : 0x2a4a8a);
    this.motes = []; this.grass = []; this.vines = []; this.drips = [];
    const nd = (o) => { o.castShadow = false; return o; };
    MAP.areas.forEach((a, ai) => {
      const [x, y, w, h] = a.r[0], big = w * h > 150;
      const rx = () => cw(x + 1 + R() * (w - 2)), rz = () => cw(y + 1 + R() * (h - 2));
      const backs = []; for (let i = x; i < x + w; i++) if (floorCell(i, y) && !floorCell(i, y - 1)) backs.push(i);
      const wz = cw(y - 1) + 1.0;
      // 1) 무너진 천장 틈으로 내려오는 빛줄기와 떠다니는 먼지 (어둠의 방은 빼고)
      for (let k = 0; k < (a.dark || a.cut ? 0 : big ? 2 : 1); k++) {
        const bx = rx(), bz = rz(), b = nd(box(1.8, 12, 1.8, beamM, bx + 1.05, 6, bz - 2.2, s)); b.receiveShadow = false; b.rotation.set(-0.35, 0, -0.17);
        const g = nd(mesh(geo('glow', () => new THREE.CircleGeometry(1.6, 10)), glowM, bx, 0.12, bz, s)); g.rotation.x = -Math.PI / 2;
        for (let q = 0; q < 7; q++) { const m = nd(box(0.09, 0.09, 0.09, moteM, bx, 1, bz, s)); this.motes.push({ m, x: bx, z: bz, t: R() * 10, sp: 0.15 + R() * 0.2 }); }
      }
      // 2) 벽에 매달린 쇠사슬과 녹슨 창살 (숲은 덩굴)
      backs.forEach((i, n) => {
        const bx = cw(i);
        if (ff) { if (n % 3 === 1) { const g = new THREE.Group(); g.position.set(bx + (R() - .5), 4.6, wz + 0.1); s.add(g); for (let q = 0; q < 5; q++) { const v = cyl(0.07, 0.07, 0.7, 4, vineM, 0, -0.35 - q * 0.65, 0, g); v.castShadow = false; if (q % 2) nd(box(0.3, 0.06, 0.2, M(grassC[q % 3]), 0.15, -0.4 - q * 0.65, 0.05, g)); } this.vines.push({ g, ph: R() * 6 }); } return; }
        if (n % 5 === 2) { const L = 4 + (R() * 3 | 0); for (let q = 0; q < L; q++) { const l = nd(box(0.12, 0.34, 0.12, dmetal(), bx, 5.6 - q * 0.3, wz + 0.05, s)); l.rotation.y = q % 2 ? Math.PI / 2 : 0; l.scale.x = q % 2 ? 1 : 2; } }
      });
      if (!ff && backs.length > 6 && ai % 2 === 0) { const i = backs[Math.floor(backs.length * 0.75)], bx = cw(i); box(2.2, 2.6, 0.2, dark, bx, 1.6, wz - 0.02, s); for (let q = 0; q < 5; q++) box(0.1, 2.6, 0.12, M(0x6a4a3a, { m: 0.5 }), bx - 0.9 + q * 0.45, 1.6, wz + 0.1, s); box(2.3, 0.14, 0.14, M(0x6a4a3a, { m: 0.5 }), bx, 2.9, wz + 0.1, s); box(2.3, 0.14, 0.14, M(0x6a4a3a, { m: 0.5 }), bx, 0.4, wz + 0.1, s); }
      // 3) 깨진 타일, 이끼, 갈라진 틈
      for (let k = 0; k < (a.cut ? 0 : big ? 9 : 5); k++) { const c = nd(box(0.08, 0.05, 0.7 + R() * 1.1, dark, rx(), 0.11, rz(), s)); c.rotation.y = R() * 3; if (R() < 0.6) { const c2 = nd(box(0.07, 0.05, 0.5, dark, c.position.x + 0.3, 0.11, c.position.z + 0.3, s)); c2.rotation.y = c.rotation.y + 0.9; } }
      if (!ff && !a.cut) for (let k = 0; k < (big ? 4 : 2); k++) { const t = box(0.9, 0.18, 0.9, M(T.floor[k % T.floor.length]), rx(), 0.12, rz(), s); t.rotation.set(0.25, R() * 3, 0.15); }
      for (let k = 0; k < 4; k++) { const bx = cw(x + R() * w), mz = cw(y) - 0.6 + R() * 0.6; nd(box(0.8 + R() * 0.8, 0.06, 0.4 + R() * 0.5, M(T.moss), bx, 0.12, mz, s)); }
      // 4) 구석 거미줄과 뼈 무더기
      // 거미줄: 벽 위 모서리에서 퍼지는 실 다섯 가닥과 그 사이를 잇는 실 두 줄
      if (!a.rest) for (const [cx, sd] of [[cw(x) - 0.9, 1], [cw(x + w - 1) + 0.9, -1]]) {
        const g = new THREE.Group(); g.position.set(cx, 5.6, wz + 0.06); s.add(g); const A = q => -Math.PI / 2 * q / 4 * sd + (sd < 0 ? Math.PI : 0);
        for (let q = 0; q <= 4; q++) { const a2 = A(q), t = nd(box(1.9, 0.04, 0.02, webM, Math.cos(a2) * 0.95, Math.sin(a2) * 0.95, 0, g)); t.rotation.z = a2; }
        for (const r of [0.7, 1.35]) for (let q = 0; q < 4; q++) { const a1 = A(q), a2 = A(q + 1), x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r, x2 = Math.cos(a2) * r * 0.92, y2 = Math.sin(a2) * r * 0.92, t = nd(box(Math.hypot(x2 - x1, y2 - y1), 0.035, 0.02, webM, (x1 + x2) / 2, (y1 + y2) / 2, 0, g)); t.rotation.z = Math.atan2(y2 - y1, x2 - x1); }
      }
      for (let k = 0; k < (a.cut ? 0 : a.rest ? 1 : 2); k++) { const bx = rx(), bz = rz(); for (let q = 0; q < 5; q++) { const bn = cyl(0.06, 0.06, 0.7, 4, boneM, bx + (R() - .5) * 0.8, 0.16, bz + (R() - .5) * 0.8, s); bn.rotation.set(Math.PI / 2, R() * 3, 0); } sph(0.26, 6, 5, boneM, bx + 0.2, 0.3, bz, s); }
      // 5) 쓰러진 기사 석상과 부서진 갑옷 더미
      if (ai % 3 === 1 && !a.boss && !a.cut) {
        const bx = cw(x + w - 2), bz = cw(y + h - 2), st = new THREE.Group(); st.position.set(bx, 0, bz); st.rotation.y = 0.5 + R(); s.add(st);
        box(1.6, 0.7, 1.6, stoneD, -1.8, 0.35, 0, st); box(0.9, 0.7, 2.6, stoneM, 0, 0.45, 0, st); sph(0.42, 8, 6, stoneM, 0, 0.5, 1.75, st); box(0.25, 0.25, 2.6, stoneD, 0.6, 0.25, 0.4, st); box(0.9, 0.12, 0.25, stoneD, 0.6, 0.25, -0.7, st);
        for (let q = 0; q < 4; q++) mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), stoneD, -1 + R() * 2, 0.15, -1.6 + R(), st).scale.setScalar(0.35);
        const ax = rx(), az = rz(); cyl(0.38, 0.42, 0.55, 8, dmetal(), ax, 0.28, az, s).rotation.z = 1.2; box(0.9, 0.3, 1, dmetal(), ax + 0.7, 0.18, az + 0.3, s).rotation.y = 0.6; const sh = cyl(0.6, 0.6, 0.12, 8, M(0x2a4a8a), ax - 0.6, 0.1, az + 0.5, s);
      }
      // 6) 흔들리는 풀 (숲)
      if (ff && !a.cut) for (let k = 0; k < (big ? 26 : 16); k++) { const g = new THREE.Group(), gx = rx(), gz = rz(); g.position.set(gx, 0.05, gz); s.add(g); for (let q = 0; q < 3; q++) { const c = cone(0.1, 0.8 + R() * 0.5, 3, M(grassC[q]), (q - 1) * 0.15, 0.4, (R() - .5) * 0.2, g); c.castShadow = false; c.rotation.z = (q - 1) * 0.25; } this.grass.push({ g, x: gx, z: gz, b: 0, bx: 0, bz: 0, ph: R() * 6 }); }
      // 7) 천장에서 떨어지는 물방울과 물결
      for (let k = 0; k < (a.cut ? 0 : (th === 'abbey' ? 3 : 1) + (big ? 1 : 0)); k++) { const dx = rx(), dz = rz(); nd(mesh(geo('wet', () => new THREE.CircleGeometry(0.7, 8)), wetM, dx, 0.11, dz, s)).rotation.x = -Math.PI / 2; const m = nd(box(0.09, 0.22, 0.09, dropM, dx, 8, dz, s)); this.drips.push({ m, x: dx, z: dz, t: R() * 3, T: 2 + R() * 2.5 }); }
      // 8) 기사단 문장 (뒷벽 가운데)
      if (backs.length > 4 && !ff) { let i = backs[Math.floor(backs.length / 2)]; if (i % 3 === 0) i++; const bx = cw(i); box(1.5, 1.8, 0.12, M(crestC), bx, 3.4, wz + 0.02, s); cone(0.75, 0.6, 4, M(crestC), bx, 2.3, wz + 0.02, s).rotation.set(Math.PI, Math.PI / 4, 0); box(0.22, 1.5, 0.14, gold(), bx, 3.35, wz + 0.1, s); box(1.0, 0.22, 0.14, gold(), bx, 3.6, wz + 0.1, s); }
      // 8) 구역 입구 아치문
      const runs = [];
      const scan = (cells, kind) => { let cur = null; for (const [i, j] of cells) { if (floorCell(i, j)) { if (!cur) runs.push(cur = { kind, c: [] }); cur.c.push([i, j]); } else cur = null; } };
      const N = [], So = [], We = [], Ea = []; for (let i = x; i < x + w; i++) { N.push([i, y - 1]); So.push([i, y + h]); } for (let j = y; j < y + h; j++) { We.push([x - 1, j]); Ea.push([x + w, j]); }
      scan(N, 'n'); scan(So, 's'); scan(We, 'w'); scan(Ea, 'e');
      const archM = ff ? M(0x4a3420) : M(0x6a6474), capM = ff ? M(0x3a4a2a) : M(0x7a7484);
      for (const r of runs) {
        if (r.c.length > 6) continue; const a0 = r.c[0], a1 = r.c[r.c.length - 1];
        if (r.kind === 'n' || r.kind === 's') { const z = cw(a0[1]) + (r.kind === 'n' ? 0.9 : -0.9), x0 = cw(a0[0]) - 1.25, x1 = cw(a1[0]) + 1.25, H = r.kind === 'n' ? 5.6 : 1.4;
          for (const px of [x0, x1]) { box(0.9, H, 0.9, archM, px, H / 2, z, s); box(1.1, 0.3, 1.1, capM, px, H + 0.15, z, s); }
          if (r.kind === 'n') { box(x1 - x0 + 1, 0.7, 0.9, archM, (x0 + x1) / 2, H + 0.5, z, s); box(0.6, 0.5, 0.95, capM, (x0 + x1) / 2, H + 0.5, z, s); } }
        else { const xx = cw(a0[0]) + (r.kind === 'w' ? 0.9 : -0.9), z0 = cw(a0[1]) - 1.25, z1 = cw(a1[1]) + 1.25, H = 3.4;
          box(0.9, H, 0.9, archM, xx, H / 2, z0, s); box(0.9, 1.2, 0.9, archM, xx, 0.6, z1, s); box(0.9, 0.6, z1 - z0 + 0.9, archM, xx, H + 0.3, (z0 + z1) / 2 - 0.0, s).scale.z = 0.55; }
      }
    });
  }
  syncFlag(W, t) {
    const F = this.flagG; if (!F) return; const f = W.fl; if (!f) { F.g.visible = false; return; }
    const E = f[2] && this.ents.get('p' + f[2]);
    if (E) { F.g.visible = true; F.g.position.set(E.x - Math.cos(E.a) * 0.55, 0.4, E.z - Math.sin(E.a) * 0.55); F.g.rotation.y = 0; F.g.scale.setScalar(0.85); F.cloth.rotation.x = Math.sin(t * 6) * 0.08; F.cloth.rotation.z = Math.sin(t * 3.1) * 0.06; F.L.intensity = 3; }
    else { const k2 = MAP.flag[2], sh = k2 === 'd' || (k2 === 'p' ? !!(W.pz[MAP.flag[3]] || {}).d : !!this.secOn[MAP.flag[3]]), moved = f[0] !== cw(MAP.flag[0]) || f[1] !== cw(MAP.flag[1]); F.g.visible = sh || moved; if (k2 === 'p' && sh && !F.up) { F.up = 1; this.column(f[0], f[1], 0xffd36b, 0.9); this.burst(f[0], 1, f[1], 0xffd36b, 22, 6, 0.8, 0.16); } F.g.position.set(f[0], 0, f[1]); F.g.rotation.y = 0; F.g.scale.setScalar(1); F.cloth.rotation.x = Math.sin(t * 1.4) * 0.06; F.L.intensity = (k2 === 'd' && !moved ? 0.15 : 1) * (5 + Math.sin(t * 3) * 2 + (f[3] || 0) * 6); }
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
      if (!E) { const m = makeHero(p.role, p.cos); s.add(m); E = { m, x: p.x, z: p.z, a: p.a, ph: 0 }; this.ents.set(key, E); E.ring = ringMesh(s, ROLES[p.role].color); E.ward = sph(1.3, 12, 10, M(0x9af0e0, { e: 0x6ad0c0, ei: 0.5, op: 0.08, uniq: true }), 0, 1.5, 0, m); E.ward.castShadow = false; }
      const k = exact || p.id === me ? 1 : Math.min(1, dt * 12);
      E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k; E.a = lerpA(E.a, p.a, Math.min(1, dt * 18));
      animHero(E, p, dt, t); E.hy = hy(E, exact ? 1 : dt); E.m.position.y += E.hy; E.ring.position.set(E.x, 0.12 + E.hy, E.z); E.ring.visible = !p.dd;
      E.ward.visible = p.sh > 0; E.m.visible = !p.dd;
    }
    // 적
    for (const e of S.en) {
      const key = 'e' + e.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { const m = e.k === 'boss' ? makeBossOf(CH.boss.ai) : makeFoe(e.k); if (e.mb) m.scale.multiplyScalar(1.3); s.add(m); E = { m, x: e.x, z: e.z, a: e.a, ph: R() * 6, base: m.scale.x }; this.ents.set(key, E); }
      const k = exact ? 1 : Math.min(1, dt * 12); E.x += (e.x - E.x) * k; E.z += (e.z - E.z) * k; E.a = lerpA(E.a, e.a, Math.min(1, dt * 14));
      animEnemy(E, e, dt, t, this); E.hy = hy(E, exact ? 1 : dt); E.m.position.y += E.hy;
    }
    // 투사체
    for (const p of S.pr) {
      const key = 'r' + p.id; seen.add(key); let E = this.ents.get(key);
      if (!E) { E = { m: projMesh(p.k), x: p.x, z: p.z }; if (p.bg) E.m.scale.setScalar(2.2); s.add(E.m); this.ents.set(key, E); }
      const k = exact ? 1 : Math.min(1, dt * 18); E.x += (p.x - E.x) * k; E.z += (p.z - E.z) * k;
      E.m.position.set(E.x, (p.k === 'potion' ? p.y : 0) + 1.6, E.z); E.m.rotation.y = -p.a; if (p.k === 'potion') E.m.rotation.z += dt * 12;
      const TC = { pierce: 0xffe08a, orb: 0x9af0d0, eorb: 0x6ab0ff, ember: 0xff7a20, arrow: 0xe8e0c8, bolt: 0xff8a5a, spear: 0xffb060, earrow: 0xff5a4a, vorb: 0xb06aff }[p.k]; if (TC && (E.tr = (E.tr || 0) - dt) <= 0) { E.tr = 0.03; const big = p.k !== 'arrow' && p.k !== 'earrow'; this.burst(E.x, 1.6, E.z, TC, big ? 3 : 1, 1.2, big ? 0.45 : 0.25, big ? 0.12 : 0.08); }
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
      this.chests.forEach((C, k) => { if (C.mim) { C.g.visible = !W.ch[k]; C.lid.rotation.x = -(Math.max(0, Math.sin(t * 1.3 + 1)) ** 8) * 0.18; return; } C.lid.rotation.x += ((W.ch[k] ? -1.6 : 0) - C.lid.rotation.x) * Math.min(1, dt * 6); });
      this.syncPuzzles(W, dt, t); this.syncCuts(W, dt, t); this.syncFlag(W, t);
      if (W.fk && this.forks) this.forks.forEach((A, k) => { const u = W.fk[0] >= 0; A.c.position.y = 3.1 + Math.sin(t * 1.6 + k) * 0.12; A.c.rotation.y = t * 0.8 + k; const lit = !u || W.fk[0] === k; if (u !== A.used) { A.used = u; A.c.material.emissiveIntensity = lit ? 3 : 0.2; A.L.intensity = lit ? 16 : 0; } });
      this.altars.forEach((A, k) => { const u = !!W.al[k]; A.c.position.y = 2.3 + Math.sin(t * 1.6 + k) * 0.12; A.c.rotation.y = t * 0.8; if (u !== A.used) { A.used = u; A.c.material.emissiveIntensity = u ? 0.2 : 3; A.L.intensity = u ? 0 : 18; } });
      this.fires.forEach((F, k) => { const lit = !!W.fi[k]; if (lit !== F.lit) { F.lit = lit; F.g.visible = lit; F.ring.visible = lit; F.L.intensity = lit ? 70 : 0; if (lit) this.flick.push({ L: F.L, b: 70, ph: k }); } if (lit) F.g.children.forEach((c, i) => { c.scale.y = 0.85 + Math.sin(t * 4 + i * 1.7) * 0.12; }); });
    }
    this.syncDark(S, dt, t);
    // 무너지는 성: 출구 빛, 떨어지는 먼지, 계속 흔들림
    const es = W && W.es; if (es && !this.escOn && this.exitG) { this.escOn = true; this.exitG.children.forEach(c => c.visible = true); this.exitL.intensity = 40; }
    if (!es && this.escOn) { this.escOn = false; if (this.exitG) { this.exitG.children.forEach(c => { if (!c.isLight) c.visible = false; }); this.exitL.intensity = 0; } }
    if (this.escOn) { this.exitG.rotation.y += dt; this.exitM.opacity = 0.22 + Math.sin(t * 5) * 0.08; this.shake = Math.max(this.shake, 0.18); if ((this.dustT = (this.dustT || 0) - dt) <= 0) { this.dustT = 0.08; this.burst(this.camT.x + (Math.random() - .5) * 34, 9 + Math.random() * 4, this.camT.z + (Math.random() - .5) * 20, [0x8a7a6a, 0x6a5e54, 0xa09080][Math.random() * 3 | 0], 2, 1, 1.2, 0.16); } }
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
  syncPuzzles(W, dt, t) {
    if (!this.puzR || !W.pz) return;
    this.puzR.forEach((P, k) => {
      const z = W.pz[k]; if (!z) return; const done = !!z.d, ease = Math.min(1, dt * 3);
      P.gate.position.y += ((done ? 5.2 : 0) - P.gate.position.y) * ease; P.gate.visible = P.gate.position.y < 5.1;
      if (P.k === 'plates') P.items.forEach((it, i) => { const on = z.o[i] === '1'; it.top.position.y += ((on || done ? 0.12 : 0.22) - it.top.position.y) * Math.min(1, dt * 10); const c = done ? 0x9af0a8 : on ? 0xffd36b : 0x8a8494; it.rm.color.setHex(c); it.rm.emissive.setHex(c); it.rm.emissiveIntensity = done || on ? 3 : 1.0 + Math.sin(t * 2 + i) * 0.4; });
      else if (P.k === 'braziers') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.fg.visible = on; it.Lt.intensity = on ? 30 : 0; if (on) it.fg.children.forEach((c, n) => c.scale.y = 0.85 + Math.sin(t * 5 + n * 1.7) * 0.15); it.gem.rotation.y = t; });
      else if (P.k === 'oath') P.items.forEach((it, i) => { const on = done || z.l[i] === '1', c = on ? 0xffd36b : 0x3f6fd0; it.m.emissive.setHex(c); it.m.emissiveIntensity = on ? 2.6 : 0.5 + Math.sin(t * 2 + i) * 0.3; it.Lt.intensity = on ? 22 : 0; });
      else if (P.k === 'targets') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.ar.visible = on; it.mr.color.setHex(on ? 0x4cc06a : 0xc0392b); it.mr.emissive.setHex(on ? 0x2a8a3a : 0x601010); it.mr.emissiveIntensity = on ? 1.6 : 0.3 + Math.max(0, Math.sin(t * 3 + i)) * 0.4; });
      else if (P.k === 'basins') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.m.color.setHex(on ? 0xcffff6 : 0x4a4652); it.m.emissiveIntensity = on ? 2.4 + Math.sin(t * 3 + i) * 0.3 : 0; it.Lt.intensity = on ? 26 : 0; });
      else if (P.k === 'vines') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; if (on) it.burn = Math.min(1.6, it.burn + dt); const b = it.burn; it.fg.visible = b > 0 && b < 1.5; it.fg.children.forEach((c, n) => c.scale.y = 0.8 + Math.sin(t * 9 + n) * 0.25); const sc = Math.max(0, 1 - Math.max(0, b - 0.5)); it.g.scale.set(1, Math.max(0.01, sc), 1); it.g.visible = sc > 0.02 || it.fg.visible; });
      else if (P.k === 'levers') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.lm.emissiveIntensity = on ? 3 : 0; it.lm.color.setHex(on ? 0xffe0a0 : 0x4a4652); it.Lt.intensity = on ? 22 : 0; it.h.rotation.x += ((on ? 0.7 : -0.7) - it.h.rotation.x) * Math.min(1, dt * 10); });
      else if (P.k === 'sigils') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.m.emissiveIntensity = on ? 2.2 : 0.25 + Math.sin(t * 2 + i) * 0.1; it.m.color.setHex(on ? 0xbfefff : 0x5a7a94); });
      else if (P.k === 'crystals' || P.k === 'icecrys') { const cs = (z.c || '').split(','); P.items.forEach((it, i) => { const on = done || z.l[i] === '1';
        if (P.k === 'icecrys') { it.g.scale.y += ((on ? 0.01 : 1) - it.g.scale.y) * Math.min(1, dt * 12); it.g.visible = it.g.scale.y > 0.03; it.Lt.intensity = on ? 0 : 6; return; }
        const left = +cs[i] || 0, blink = !done && on && left <= 3 ? (Math.sin(t * 14) > 0 ? 1 : 0.35) : 1; it.m.emissiveIntensity = on ? 3 * blink : 0.2; it.Lt.intensity = on ? 24 * blink : 0; it.g.rotation.y += dt * (on ? 1.5 : 0.2); }); }
      else if (P.k === 'mirrors') { let ok = true; P.items.forEach((it, i) => { const r = +z.r[i], want = it.ok + r * Math.PI / 4; it.cur += (want - it.cur) * Math.min(1, dt * 8); it.g.rotation.y = it.cur; }); P.beams.forEach((b2, n) => { b2.visible = ok; if (n < P.items.length) ok = ok && (done || z.r[n] === '0'); }); }
      else if (P.k === 'embers') P.items.forEach((it, i) => { if (!i) return; const on = done || z.l[i] === '1'; it.fg.visible = on; it.Lt.intensity = on ? 22 : 0; if (on) it.fg.children.forEach((c, n) => c.scale.y = 0.85 + Math.sin(t * 6 + n) * 0.15); });
      else if (P.k === 'lanterns') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.lm.emissiveIntensity = on ? 3 : 0; it.lm.color.setHex(on ? 0xffe0a0 : 0x4a4652); it.Lt.intensity = on ? 22 : 0; });
      else if (P.k === 'vigil') P.items.forEach((it, i) => { const on = done || z.l[i] === '1', v = on ? 1 : (+(z.v || '')[i] || 0) / 10; it.fill.scale.setScalar(Math.max(0.01, v)); it.rm.emissiveIntensity = on ? 3 : 0.6 + Math.sin(t * 2 + i) * 0.3; it.Lt.intensity = on ? 20 : v * 10; });
      else if (P.k === 'blackfire') P.items.forEach((it, i) => { const on = done || z.l[i] === '1'; it.fg.visible = !on; it.Lt.intensity = on ? 0 : 18; if (!on) it.fg.children.forEach((c, n) => c.scale.y = 0.8 + Math.sin(t * 7 + n) * 0.25); });
      else { P.items.forEach((it, i) => { const r = +z.r[i], want = -r * Math.PI / 2; let d = want - it.cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; it.cur += d * Math.min(1, dt * 8); it.g.rotation.y = it.cur; const ok = r === i; it.eye.emissiveIntensity = ok ? 4 : 0; });
        const m = P.ring.material, c = done ? 0x9af0a8 : 0x8a8494; m.color.setHex(c); m.emissive.setHex(c); m.emissiveIntensity = done ? 2.4 : 0.5; }
    });
  }
  // 어둠의 방: 동료마다 작은 빛, 횃불을 든 동료는 큰 빛
  syncDark(S, dt, t) {
    // 불씨 제단: 불씨를 든 동료는 머리 위에 불씨가 떠 있어요
    for (const p of S.pl) { const E = this.ents.get('p' + p.id); if (!E) continue; if (p.em && !E.embG) { const g = new THREE.Group(); sph(0.35, 8, 6, M(0xffb060, { e: 0xff8a20, ei: 4 }), 0, 0, 0, g); cone(0.25, 0.7, 6, M(0xff7a2a, { e: 0xff5a10, ei: 3 }), 0, 0.35, 0, g); this.scene.add(g); E.embG = g; } if (E.embG) { E.embG.visible = !!p.em; if (p.em) E.embG.position.set(E.x, 4.6 + Math.sin(t * 4) * 0.15, E.z); } }
    if (!this.darkR) return; const { H, SH } = this.darkH, carriers = [];
    const ls = []; for (const p of S.pl) { if (p.dd) continue; const E = this.ents.get('p' + p.id); if (!E) continue; if (p.tc) carriers.push({ E, p }); ls.push([E.x, E.z + SH * (H - 1.2), p.tc ? 11 + Math.sin(t * 7 + E.x) * 0.4 : 2.6]); }
    this.darkR.forEach((D, k) => {
      D.L.forEach((v, i) => { const l = ls[i]; if (l) v.set(l[0], l[1], l[2]); else v.set(0, 0, 0); });
      const used = S.pl.filter(p => p.tc === k + 1).length; D.tor.forEach((g, i) => g.visible = i >= used); D.sl.intensity = used >= 2 ? 0 : 8;
    });
    // 횃불: 왼손에 든 횃불과 빛
    for (const [key, E] of this.ents) if (key[0] === 'p' && E.torchG && !carriers.some(c => c.E === E)) { E.torchG.visible = false; }
    this.torchL.forEach(L => L.intensity = 0);
    carriers.forEach(({ E }, i) => {
      if (!E.torchG) { const tg = new THREE.Group(); tg.position.set(0, -0.95, 0.15); E.m.userData.armL.add(tg); tg.rotation.x = 0.5; cyl(0.08, 0.1, 1.3, 6, leather(), 0, 0.4, 0, tg); cone(0.24, 0.7, 6, M(0xffa040, { e: 0xff7a20, ei: 3 }), 0, 1.3, 0, tg); cone(0.14, 0.45, 6, M(0xffe08a, { e: 0xfff0b0, ei: 4 }), 0, 1.25, 0, tg); E.torchG = tg; }
      E.torchG.visible = true; const L = this.torchL[i]; if (L) { L.position.set(E.x, 3.2, E.z + 0.6); L.intensity = 38 + Math.sin(t * 9) * 4; }
    });
  }
  tick(dt, t) {
    for (const f of this.flick || []) f.L.intensity = f.b * (0.9 + Math.sin(t * 2.2 + f.ph) * 0.04 + Math.sin(t * 3.7 + f.ph * 2) * 0.02);
    if (this.fireG) { this.fireG.children.forEach((c, i) => { c.scale.y = 0.85 + Math.sin(t * 4 + i * 1.7) * 0.12; }); }
    // 금 간 벽: 가끔 부스러기가 떨어져요
    if (this.mode === 'map') for (const cg of this.crackG || []) { const d = cg.userData.dust; if (!cg.visible || !d || (d.t -= dt) > 0) continue; d.t = 0.9 + Math.random() * 0.8; this.burst(d.x, 2.6, d.z + (Math.random() - .5) * 2, 0x9a8e84, 3, 1.2, 0.7, 0.1); }
    if (this.mode === 'lobby') { for (const f of this.flagGlow || []) { const w = Math.sin(t * 2 + f.ph); f.fm.emissiveIntensity = 1.0 + 0.6 * w; f.gm.emissiveIntensity = 2 + 1.5 * w; } for (const d of this.flagDust || []) { d.t += dt; const u = (d.t % 2.5) / 2.5; d.m.position.set(d.f.x + Math.sin(d.t * 3 + d.m.id) * 0.5, 3.1 + u * 2.8, -10.8); d.m.scale.setScalar(1 - u * 0.7); } }
    if (this.mode === 'intro') this.tickIntro(dt, t);
    else for (const e of this.embers || []) {
      e.t += dt; if (this.mode === 'lobby') { const u = (e.t % 3) / 3; e.m.position.set(Math.sin(e.t * 2 + e.m.id) * 1.2 * u, 1.5 + u * 7, 2 + Math.cos(e.t * 1.3 + e.m.id) * 1.2 * u); }
      else if (e.fly) { e.m.position.set(this.camT.x + e.x + Math.sin(e.t * 0.4 + e.ph) * 2.5, e.h + Math.sin(e.t * 0.9 + e.ph) * 0.6, this.camT.z + e.z + Math.cos(e.t * 0.3 + e.ph) * 2); e.m.material.emissiveIntensity = 2 + 5 * Math.max(0, Math.sin(e.t * 1.7 + e.ph)); }
      else { const u = (e.t % 6) / 6; e.m.position.set(this.camT.x + e.x + Math.sin(e.t) * 0.5, u * 8, this.camT.z + e.z); }
    }
    // 맵 디테일 움직임
    for (const f of this.floaters || []) { f.m.position.y = f.y + Math.sin(t * 1.3 + f.ph) * 0.35; if (f.spin) f.m.rotation.y += dt * 0.4; else f.m.rotation.y += dt * 1.2; }
    for (const q of this.motes || []) { q.t += dt * q.sp; const u = q.t % 1; q.m.position.set(q.x + 1.4 * u * 0.9 + Math.sin(q.t * 7 + q.x) * 0.5, 0.6 + u * 6, q.z - 2.4 * u + Math.cos(q.t * 5) * 0.4); }
    for (const v of this.vines || []) v.g.rotation.z = Math.sin(t * 1.2 + v.ph) * 0.12;
    if (this.grass && this.grass.length) {
      const ps = []; for (const [k, E] of this.ents) if (k[0] === 'p') ps.push(E);
      for (const g of this.grass) {
        let tx = Math.sin(t * 1.6 + g.ph) * 0.08, tz = 0;
        for (const E of ps) { const dx = g.x - E.x, dz = g.z - E.z, d = Math.hypot(dx, dz); if (d < 1.8) { const k = (1.8 - d) / 1.8 * 0.9; tx += dx / (d || 1) * k; tz += dz / (d || 1) * k; } }
        g.bx += (tx - g.bx) * Math.min(1, dt * 8); g.bz += (tz - g.bz) * Math.min(1, dt * 8); g.g.rotation.set(g.bz * 0.8, 0, -g.bx * 0.8);
      }
    }
    for (const d of this.drips || []) { d.t += dt; const u = d.t / d.T; if (u >= 1) { d.t = 0; this.ring(d.x, d.z, 1.1, 0x9ad0ff, 0.7); } d.m.position.y = u < 0.55 ? 8 : 8 - Math.pow((u - 0.55) / 0.45, 2) * 8; d.m.visible = u > 0.4; }
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
    if (this.low) n = Math.ceil(n / 2);
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
  // 맞은 적: 뒤로 휘청 / 휘두르기 시작 / 보스 포효
  react(id, big) { const E = this.ents.get('e' + id); if (!E) return; E.kb = Math.max(E.kb || 0, big ? 0.45 : 0.28); if (!(E.pop > 0)) E.pop = big ? 0.14 : 0.08; if (E.base == null) E.base = E.m.scale.x; }
  trip(id, high) { const E = this.ents.get('e' + id); if (!E) return; E.tripD = E.tripT = high ? 0.9 : 0.5; E.tripH = high ? 3.2 : 1.1; }
  eAct(id) { const E = this.ents.get('e' + id); if (E) E.swT = 0.42; }
  roar() { for (const [k, E] of this.ents) if (k[0] === 'e' && E.m.userData.kind === 'boss') E.roarT = 1.1; }
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
  refreshHeroes() {
    if (!this.lobbyHeroes) return;
    this.lobbyHeroes = this.lobbyHeroes.map(o => { const n = makeHero(o.userData.role, this.cos); n.position.copy(o.position); n.rotation.copy(o.rotation); o.parent.add(n); o.parent.remove(o); return n; });
  }
  portrait(role, face) {
    const key = role + (face ? ':f' : ''); this._pt = this._pt || {}; if (this._pt[key]) return this._pt[key];
    const W = face ? 30 : 42, H = face ? 30 : 54, rt = new THREE.WebGLRenderTarget(W, H), sc = new THREE.Scene();
    sc.add(new THREE.AmbientLight(0x8a8ab0, 1.5)); const d = new THREE.DirectionalLight(0xffe0c0, 2.6); d.position.set(4, 6, 7); sc.add(d); const d2 = new THREE.DirectionalLight(0x7a88d0, 1.2); d2.position.set(-5, 3, -3); sc.add(d2);
    const m = makeHero(role, this.cos); m.rotation.y = face ? 0.3 : 0.55; sc.add(m); const u = m.userData; u.armR.rotation.x = -0.7; u.armL.rotation.x = -0.5;
    // 얼굴만: 머리 둘레를 크게 담아요 (대사 상자용)
    const cam = face ? new THREE.OrthographicCamera(-0.85, 0.85, 0.85, -0.85, 0.1, 50) : new THREE.OrthographicCamera(-1.75, 1.75, 2.25, -2.25, 0.1, 50), cy = face ? 2.85 : 1.85; cam.position.set(0, cy, 10); cam.lookAt(0, cy, 0);
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
    g.putImageData(img, 0, 0); return (this._pt[key] = c.toDataURL());
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
  else if (k === 'vorb') { sph(0.34, 8, 6, M(0xd8b0ff, { e: 0x8a3ae0, ei: 4 }), 0, 0, 0, g); }
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
  else if (z.k === 'rock') { const f = mesh(geo('zc', () => new THREE.CircleGeometry(1, 32)), M(0xff2a2a, { e: 0xff1a1a, ei: 1.5, op: 0.25, uniq: true }), 0, 0, 0, g, false); f.rotation.x = -Math.PI / 2; f.scale.setScalar(z.r); g.userData.fill = f; const r = mesh(geo('rock', () => new THREE.DodecahedronGeometry(0.8)), M(0x6a625a), 0, 12, 0, g); r.scale.setScalar(1.5); g.userData.rock = r; }
  else if (z.k === 'ptrap') { box(1.2, 0.12, 1.2, dmetal(), 0, 0.05, 0, g); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const t = cone(0.1, 0.4, 4, metal(), Math.cos(a) * 0.5, 0.25, Math.sin(a) * 0.5, g); t.rotation.z = Math.cos(a) * 0.5; t.rotation.x = -Math.sin(a) * 0.5; } }
  // 보스 바닥 경고는 다른 효과보다 늘 위에 그려요
  if (z.k === 'tcircle' || z.k === 'tcone' || z.k === 'tline' || z.k === 'rock') g.traverse(o => { if (o.material && o !== g.userData.rock) { o.material.depthTest = false; o.renderOrder = 20; } });
  return g;
}
function zoneAnim(E, z, t) {
  const f = E.m.userData.fill;
  if (f && z.T) { const u = 1 - z.t / z.T; f.material.opacity = 0.24 + u * 0.4; if (z.k === 'tcircle' || z.k === 'rock') f.scale.setScalar(z.r * (0.2 + 0.8 * u)); }
  if (z.k === 'rock') { const r = E.m.userData.rock, u = Math.max(0, z.t / z.T); r.position.y = 0.6 + 12 * u * u; r.rotation.x += 0.1; r.rotation.z += 0.07; }
  if (z.k === 'fire') { E.m.visible = !z.dl; E.m.children.forEach((c, i) => { if (c.geometry.type === 'ConeGeometry') c.scale.y = 0.8 + Math.sin(t * 4 + i) * 0.15; }); }
  if (z.k === 'rain') E.m.userData.drops.forEach((d, i) => { d.position.y = 4 - ((t * 9 + i * 0.37) % 1) * 4; });
}
// 위층·계단·승강기 위에 서 있으면 그만큼 올려 그려요 (부드럽게 따라가요)
function hy(E, dt) { const h = hAt(E.x, E.z); return E.hy == null || dt >= 1 ? h : E.hy + (h - E.hy) * Math.min(1, dt * 14); }
function lerpA(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }
function clampN(v, a, b) { return v < a ? a : v > b ? b : v; }
// 활 시위 당기기: pull 0(쉼) ~ 0.75(가득)
function setPull(B, pull, n = 1) {
  if (B.ex) B.ex.forEach((e, k) => { const on = n >= 2 + k; e.g.visible = on; });
  const ny = -0.65 + pull;
  for (const [m, tz] of [[B.sa, 0.93], [B.sb, -0.93]]) { const L = Math.hypot(pull, tz); m.position.set(0.12, -0.65 + pull / 2, tz / 2); m.rotation.set(Math.atan2(-pull, -tz), 0, 0); m.scale.z = L; }
  B.ar.position.set(0.12, ny - 0.62, 0); B.ar.visible = pull > 0.18 || n > 1;
}
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const seg = (u, a, b) => ease((u - a) / (b - a));
// 역할마다 공격·기술 동작. 몸 전체(허리 비틀기, 내딛기, 뛰어오르기)가 같이 움직여요
const ANIM_T = { atk: 0.32, hv: 0.95, big: 0.6, skill: 0.8 };
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
function animHero(E, p, dt, t) {
  const m = E.m, u = m.userData, role = FAM[p.role] || p.role; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  E.ph += dt * (p.mv ? 11 : 0); E.sw = (E.sw || 0) + ((p.mv ? Math.sin(E.ph) * 0.95 : 0) - (E.sw || 0)) * Math.min(1, dt * 14); const sw = E.sw;
  // 걷기 세기 (멈추면 부드럽게 0으로)
  E.wk = (E.wk || 0) + ((p.mv ? 1 : 0) - (E.wk || 0)) * Math.min(1, dt * 10); const wk = E.wk, sn = Math.sin(E.ph);
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  // 동작 시작: 동작 번호가 바뀌면 처음부터
  // 앞 동작이 아직 남아 있으면 그 자세에서 이어서 시작해요 (blT 동안 천천히 따라가요)
  if (p.aN !== E.aN) { E.aN = p.aN; if (E.aN != null && p.ak) { if (E.ak || E.kh) E.blT = 0.1; E.ak = p.ak; E.aT = 0; E.kc = (p.ac | 0) % 2; E.kh = null; } }
  const kind = E.ak ? (E.ak === 'atk' || E.ak === 'hv' || E.ak === 'big' ? E.ak : 'skill') : '', D = kind === 'big' && role === 'priest' ? 0.9 : ANIM_T[kind] || 0.5;
  // 기사 베기가 끝나면 끝 자세를 잠깐 들고 있다가 (연타가 이어질 수 있는 동안) 천천히 돌아와요
  if (E.ak) { E.aT += dt; if (E.aT > D) { if ((role === 'knight' || CHAIN[role]) && E.ak === 'atk') E.kh = { c: E.kc, t: 0 }; E.ak = null; } }
  if (E.kh && (E.kh.t += dt) > KH_T) E.kh = null;
  if (E.blT > 0) E.blT -= dt;
  const v = E.ak ? E.aT / D : 1, side = (E.aN || 0) % 2 ? 1 : -1;
  const base = { knight: [-0.7, -0.6], archer: [-1.45, -1.55], priest: [-1.2, -0.4], squire: [-1.3, -0.6] }[role];
  // 기본 자세 (달릴 때는 앞으로 기울고 팔을 크게 흔들어요)
  // jy: 몸 전체가 뛰어오르는 높이, sq: 찌그러짐(+는 납작, -는 길쭉), lg: 다리 벌리기
  // 걷기: 팔을 반대로 크게 흔들고, 허리를 비틀고, 좌우로 뒤뚱, 고개는 반대로 살짝
  const T = { rx: base[0] - sw * 0.7, rz: 0, ry: 0, lx: base[1] + sw * 0.7, lz: 0, bx: 0.18 * wk, by: 0, bz: 0, bry: -sn * 0.22 * wk, brz: sn * 0.09 * wk, hx: 0, hy: sn * 0.15 * wk, hz: 0, rpz: 0, pull: 0.35, jy: 0, sq: 0, lg: 0, spin: 0 };
  // 가만히 있으면: 숨 쉬고, 가끔 고개와 몸을 돌려 두리번거려요
  if (!p.mv && !E.ak && !E.kh && !p.dn) {
    E.idle = (E.idle || 0) + dt;
    if (E.idle > 0.8 && (E.lkT = (E.lkT || 0) - dt) <= 0) { const r = Math.random(); E.lkT = 1.2 + Math.random() * 1.8; E.lk = r < 0.25 ? 0 : (r < 0.62 ? -1 : 1) * (0.8 + Math.random() * 0.5); E.lkU = Math.random() < 0.3 ? -0.25 : Math.random() * 0.15; }
    const lk = E.idle > 0.8 ? (E.lk || 0) : 0; E.lkS = (E.lkS || 0) + (lk - (E.lkS || 0)) * Math.min(1, dt * 5);
    T.hy = E.lkS; T.bry = E.lkS * 0.45; T.hz = -E.lkS * 0.12; T.hx = E.idle > 0.8 ? (E.lkU || 0) : 0; T.sq = Math.sin(t * 2.2 + E.ph) * 0.025; T.lz = -Math.abs(E.lkS) * 0.1; T.rz = Math.abs(E.lkS) * 0.08;
  } else E.idle = 0;
  if (role === 'archer') { T.rx = -1.5; T.rz = -0.25; T.lx = -1.55; T.lz = 0.12; T.rpz = -0.3; T.pull = 0.35; }
  // 궁수 모아 쏘기: 시위를 끝까지 당기며 몸을 뒤로 젖히고, 오래 모을수록 웅크려요
  if (role === 'archer' && p.cg > 0 && !E.ak) { const a = Math.min(1, p.cg / 0.8), b = Math.min(1, p.cg / 2); T.pull = 0.35 + 0.4 * a; T.rpz = -0.3 - 0.5 * a; T.bx = -0.12 * a - 0.1 * b; T.bry = 0.35 * a; T.sq = 0.12 * b + (p.cg >= 2 ? Math.sin(t * 40) * 0.02 : 0); T.lg = 0.6 * b; T.lx = -1.55 - 0.15 * a; }
  // 뛰어올랐다 내려오기: a~b 사이에 h만큼 포물선
  const hop = (a, b, h) => { const q = (v - a) / (b - a); return q > 0 && q < 1 ? Math.sin(q * Math.PI) * h : 0; };
  // 착지 충격: 내려앉는 순간 납작해졌다가 돌아와요
  const land = (a, n) => { const q = (v - a) / 0.25; return q >= 0 && q < 1 ? (1 - q) * (1 - q) * n : 0; };
  if (E.ak) {
    const a = E.ak;
    if (a === 'big') { // 세 번째 큰 공격
      const cr = seg(v, 0, 0.18), go = seg(v, 0.18, 0.5), rc = seg(v, 0.7, 1), x = 1 - rc, pc = cr * (1 - go);
      if (role === 'squire') { // 종자: 웅크렸다가 뛰어오르며 한 바퀴 빙글 돌려 베기
        T.spin = -Math.PI * 2 * go; T.rx = -1.5 * x + base[0] * rc; T.rz = (1.2 * pc - 1.6 * go) * x; T.bx = 0.45 * pc - 0.2 * go * x; T.jy = hop(0.16, 0.55, 1.6); T.sq = 0.5 * pc - 0.3 * go * x * (1 - seg(v, 0.45, 0.55)) + land(0.55, 0.6); T.lg = 0.9 * pc + 0.7 * go * x; T.lx = -1.2 * go * x + base[1];
      } else { // 사제: 지팡이를 두 손으로 머리 위로 들고 웅크려 빛을 모았다가 (0~0.5, 점점 떨려요) 앞으로 내질러 큰 빛을 쏴요
        const ch = seg(v, 0, 0.2), fi = seg(v, 0.48, 0.56), rc2 = seg(v, 0.72, 1), x2 = 1 - rc2, sh = v < 0.5 ? Math.sin(t * 60) * 0.05 * seg(v, 0.15, 0.5) : 0, hc = ch * (1 - fi);
        T.rx = (-3.1 * hc + (-1.5) * fi) * x2 + base[0] * rc2 + sh; T.lx = (-2.9 * hc - 1.4 * fi) * x2 + base[1] * rc2 - sh; T.lz = 0.4 * hc * x2; T.rz = -0.3 * hc * x2;
        T.bx = (-0.35 * hc + 0.75 * fi) * x2; T.hx = (-0.45 * hc + 0.15 * fi) * x2; T.bz = (-0.2 * hc + 0.7 * fi) * x2; T.by = -0.25 * hc * x2;
        T.sq = (0.35 * hc + land(0.48, 0.4)) ; T.lg = (0.7 * hc + 1.0 * fi) * x2; T.jy = hop(0.2, 0.46, 0.35);
      }
    } else if (a === 'atk' || a === 'hv') {
      if (a === 'hv') { // 강타: 웅크려 칼을 등 뒤까지 젖히고, 높이 뛰어올라 몸을 던지듯 내려찍어요
        const L1 = 0.379; // 땅에 닿는 순간 (sim의 HV_DELAY 0.36 / 0.95)
        const cr = seg(v, 0, 0.08), up = seg(v, 0.06, 0.18), dn = seg(v, 0.26, L1), rc = seg(v, 0.68, 1), x = 1 - rc, two = role !== 'knight' && role !== 'squire';
        T.rx = (-1.2 * cr - 2.6 * up + 2.9 * dn) * x + base[0] * rc; T.lx = (-0.6 * cr - 2.6 * up + (two ? 2.9 : 2.6) * dn) * x + base[1] * rc;
        T.rz = (0.35 * cr - 0.35 * dn) * x; T.lz = two ? 0.3 * x : -0.5 * up * (1 - dn) * x;
        T.bx = (0.35 * cr - 0.85 * up + 1.45 * dn) * x; T.hx = (-0.25 * up + 0.45 * dn) * x;
        T.jy = hop(0.07, L1, 3.8); T.bz = 0.3 * dn * x; T.bry = 0.5 * cr * (1 - dn) * x;
        T.sq = 0.5 * cr * (1 - up) - 0.4 * up * (1 - dn) + land(L1, 0.75); T.by = (-0.35 * cr * (1 - up) - 0.45 * dn) * x; T.lg = (0.6 * cr * (1 - up) + 0.9 * dn) * x;
        if (role === 'archer') { T.pull = 0.75 * up * (1 - dn); T.rpz = -0.4 * up * (1 - dn); }
      } else if (role === 'knight') { // 기사 1타: (화면에서 볼 때) 오른쪽 위에서 왼쪽 아래로 비스듬히 / 2타: 왼쪽 아래에서 오른쪽 아래로 낮게 가로 베기
        // 팔을 앞으로 들고(rx) 좌우로 휘두르며(rz) 칼날을 팔 축으로 돌려(ry) 눕혀요. 허리 비틀기(bry)로 더 크게
        kApply(T, kPose(E.kc, v, base), 1);
      } else { // 궁수·사제·종자도 기사처럼 1타 끝 자세에서 2타가 이어져요 (궁수: 쏘고 반동 → 화살통에서 뽑아 반대로 비틀며 쏘기, 사제: 지팡이 내지르기 → 머리 위로 돌려 반대로 휘두르기, 종자: 가로 베기 → 되돌려 올려 베기)
        kApply(T, cPose(role, E.kc, v, base), 1);
      }
    } else { // 기술: 모두 예비 동작(0~0.2) → 크게 터뜨리기 → 버티기 → 돌아오기
      const pre = seg(v, 0, 0.2), go = seg(v, 0.2, 0.34), hold = 1 - seg(v, 0.72, 1), pk = go * hold, cr = pre * (1 - go);
      switch (a) {
        case 'block': // 방패를 땅에 쾅 박으며 버텨요
          T.lx = (-0.4 * cr - 1.75 * go) * hold + base[1] * (1 - hold); T.lz = 0.35 * pk; T.rx = -0.3 * pk + base[0] * (1 - pk); T.bx = -0.25 * cr + 0.35 * pk; T.jy = hop(0.06, 0.3, 0.6); T.sq = land(0.3, 0.5) + 0.12 * pk; T.by = -0.35 * pk; T.lg = 0.8 * pk; T.bz = 0.4 * pk; break;
        case 'dash': // 칼을 뒤로 빼고 몸을 쭉 뻗어 날아가요
          T.rx = (0.6 * cr - 1.5 * go) * hold + base[0] * (1 - hold); T.bx = -0.15 * cr + 0.5 * pk; T.bz = 0.45 * pk; T.lx = 0.35 * pk + base[1] * (1 - pk); T.sq = 0.1 * cr - 0.1 * pk; T.jy = hop(0.2, 0.6, 0.15); T.lg = 0.6 * pk; T.bry = 0.25 * cr; break;
        case 'taunt': // 웅크렸다가 뛰어올라 두 팔을 활짝 펴고 하늘을 향해 외쳐요
          T.rx = (-0.3 * cr - 2.9 * go) * hold; T.rz = 1.3 * pk; T.lx = (-0.3 * cr - 2.9 * go) * hold; T.lz = -1.3 * pk; T.hx = -0.9 * pk; T.bx = 0.4 * cr - 0.6 * pk; T.jy = hop(0.2, 0.5, 1.1); T.sq = 0.4 * cr - 0.3 * go * (1 - seg(v, 0.4, 0.5)) + land(0.5, 0.4); T.lg = 0.9 * pk; break;
        case 'pierce': { // 몸을 한껏 젖혀 끝까지 당겼다가 쏘고, 반동으로 뒤로 튕겨요
          const rl = seg(v, 0.42, 0.5); T.pull = 0.75 * seg(v, 0, 0.4) * (1 - rl); T.rpz = -0.8 * seg(v, 0, 0.4) * (1 - rl); T.bx = (-0.3 * seg(v, 0, 0.4) - 0.5 * rl) * hold; T.bry = 0.5 * seg(v, 0, 0.4) * (1 - rl); T.lx = -1.55 - 0.7 * rl * hold; T.bz = -0.8 * rl * hold; T.jy = hop(0.42, 0.75, 0.6); T.sq = 0.25 * seg(v, 0, 0.4) * (1 - rl) + land(0.75, 0.3); T.lg = 0.7 * pk; break; }
        case 'rain': // 높이 뛰어올라 하늘로 쏘아 올려요
          T.lx = -1.55 - 1.5 * pk; T.rx = -1.5 - 1.4 * pk; T.bx = 0.3 * cr - 0.75 * pk; T.hx = -0.6 * pk; T.jy = hop(0.18, 0.62, 1.7); T.pull = 0.75 * seg(v, 0, 0.3) * (1 - seg(v, 0.38, 0.44)); T.sq = 0.4 * cr + land(0.62, 0.45); T.lg = -0.5 * pk; break;
        case 'mark': // 몸을 홱 비틀며 손가락으로 적을 콕 집어요
          T.lx = -1.75; T.lz = 0.5 * pk; T.rx = -0.4 * pk + base[0] * (1 - pk); T.rz = 0.9 * pk; T.bry = 0.5 * cr - 0.9 * pk; T.bx = 0.45 * pk; T.bz = 0.6 * pk; T.hx = 0.2 * pk; T.sq = 0.2 * cr - 0.15 * pk; T.lg = 0.9 * pk; break;
        case 'heal': case 'raise': case 'smite': { // 지팡이를 하늘 높이 들고 떠오르듯 솟아요 (부활은 더 높이)
          const big = a === 'raise' ? 1.6 : 1;
          T.rx = -3.0 * pk + base[0] * (1 - pk); T.rz = 0.45 * pk; T.lx = -2.8 * pk; T.lz = -1.1 * pk; T.hx = -0.7 * pk; T.bx = 0.35 * cr - 0.25 * pk; T.jy = hop(0.2, 0.95, 0.8 * big); T.sq = 0.35 * cr - 0.2 * pk; T.by = -0.3 * cr; break; }
        case 'ward': case 'curse': case 'quake': // 지팡이를 머리 위로 들었다가 땅에 쾅 내리꽂아요
          T.rx = (-3.0 * cr + 2.2 * go) * hold + base[0] * (1 - hold); T.lx = (-2.2 * cr - 1.1 * go) * hold; T.bx = -0.4 * cr + 0.7 * pk; T.by = -0.45 * pk; T.jy = hop(0.04, 0.32, 0.8); T.sq = land(0.32, 0.55) + 0.1 * pk; T.lg = 0.9 * pk; break;
        case 'potion': { // 크게 뒤로 젖혔다가 온몸으로 던져요
          const th = seg(v, 0.18, 0.36); T.rx = -3.3 * (1 - th) * hold - 0.6 * th * hold + base[0] * (1 - hold); T.rz = 0.6 * (1 - th) * hold; T.bx = (-0.55 * (1 - th) + 0.8 * th) * hold; T.bry = (0.8 - 1.6 * th) * hold; T.bz = 0.6 * th * hold; T.lx = -1.2 * th * hold; T.lg = 1.0 * pk; T.sq = -0.15 * (1 - th) * pre; break; }
        case 'trap': // 바닥에 납작 엎드려 덫을 쾅 박아요
          T.by = -0.8 * pk - 0.2 * cr; T.bx = 0.95 * pk; T.rx = -0.3 * pk + base[0] * (1 - pk); T.lx = -0.3 * pk; T.sq = 0.25 * pk + land(0.34, 0.35); T.jy = hop(0.0, 0.2, 0.4); T.lg = 1.0 * pk; break;
        case 'whirl': // 웅크렸다가 뛰어오르며 제자리에서 한 바퀴 빙글 돌려 베어요
          T.spin = -Math.PI * 2 * go; T.rx = -1.5 * hold + base[0] * (1 - hold); T.rz = (1.2 * cr - 1.6 * go) * hold; T.bx = 0.45 * cr - 0.2 * go * hold; T.jy = hop(0.16, 0.6, 1.4); T.sq = 0.5 * cr + land(0.6, 0.5); T.lg = 0.7 * pk; break;
        case 'rally': // 높이 뛰어올라 칼을 하늘로 치켜들고 외쳐요
          T.rx = -3.15 * pk + base[0] * (1 - pk); T.lx = -2.6 * pk; T.lz = -0.8 * pk; T.hx = -0.7 * pk; T.bx = 0.4 * cr - 0.3 * pk; T.jy = hop(0.2, 0.6, 1.5); T.sq = 0.45 * cr - 0.25 * go * (1 - seg(v, 0.45, 0.55)) + land(0.6, 0.45); T.lg = -0.6 * pk + 0.8 * seg(v, 0.6, 0.7) * hold; break;
        default: T.rx = -2.8 * hold;
      }
    }
  }
  // 베기 끝 자세 들고 있기: 처음엔 그대로, 연타가 끊길 즈음 기본 자세로
  if (!E.ak && E.kh) kApply(T, role === 'knight' ? kPose(E.kh.c, 1, base) : cPose(role, E.kh.c, 1, base), 1 - seg(E.kh.t, 0.18, KH_T));
  if ((E.ak && E.ak !== 'hv') || E.kh) { // 모든 동작을 훨씬 크게: 기본 자세에서 벗어난 만큼을 키워요 (기사 말고 셋은 더 크게)
    const ex = role !== 'knight' && !(E.ak === 'atk' || (!E.ak && E.kh)), big = E.ak === 'big', X = big ? 1.3 : ex ? 1.85 : 1.4, A = big ? 1.15 : ex ? 1.5 : 1.25;
    for (const k of ['rz', 'lz', 'bx', 'by', 'bz', 'bry', 'hx']) T[k] *= X;
    T.rx = base[0] + (T.rx - base[0]) * A; T.lx = base[1] + (T.lx - base[1]) * A; T.jy *= big ? 1.35 : ex ? 2.5 : 1.9; T.sq = clampN(T.sq * (ex ? 1.8 : 1.5), -0.55, 0.75); T.lg *= ex ? 1.6 : 1.3;
  }
  if (p.bk && E.ak !== 'block') { T.lx = -1.6; }
  const k = Math.min(1, dt * (E.blT > 0 ? 14 : 30)), L = (o, kk, v2) => { E[kk] = E[kk] == null ? v2 : E[kk] + (v2 - E[kk]) * k; return E[kk]; };
  u.armR.rotation.order = 'XZY'; u.armR.rotation.set(L(0, 'ar', T.rx), L(0, 'ary', T.ry), L(0, 'arz', T.rz)); u.armL.rotation.set(L(0, 'al', T.lx), 0, L(0, 'alz', T.lz));
  u.armR.position.z = L(0, 'rpz', T.rpz); u.head.rotation.set(L(0, 'hx', T.hx), L(0, 'hy', T.hy), L(0, 'hz', T.hz));
  if (u.bowS) setPull(u.bowS, L(0, 'pl', T.pull), p.cg >= 2 ? 3 : p.cg >= 0.8 ? 2 : 1);
  const bob = Math.abs(sn) * 0.16 * wk;
  u.body.rotation.set(L(0, 'bx', T.bx), L(0, 'bry', T.bry) + T.spin, L(0, 'brz', T.brz)); u.body.position.set(0, bob + L(0, 'by', T.by), L(0, 'bz', T.bz));
  m.position.y = L(0, 'jy', T.jy); const sq = L(0, 'sq', T.sq); u.body.scale.set(1 + sq * 0.5, 1 - sq * 0.6, 1 + sq * 0.5);
  const lg = L(0, 'lg', T.lg); if (E.ak) { u.legL.rotation.x = sw - lg * 0.6; u.legR.rotation.x = -sw + lg * 0.6; }
  // 구르기: 몸 가운데를 축으로 앞으로 한 바퀴 (발끝 축으로 돌면 머리가 바닥에 파묻혀요). 다리와 팔은 웅크려요
  if (p.ro && p.role === 'squire') { // 종자: 발부터 미끄러져 들어가며 다리 걸기
    u.body.rotation.set(-1.0, 0, 0.15); u.body.position.set(0, 0.55, 0.3); u.legL.rotation.x = -1.5; u.legR.rotation.x = -0.4; u.armL.rotation.x = 1.2; u.armR.rotation.x = -2.6; u.body.scale.set(1, 1, 1); E.rollA = 0;
  } else if (p.ro) { // 구르기: 몸을 공처럼 웅크려 앞으로 한 바퀴. 처음엔 숙이며 들어가고 끝엔 쪼그려 앉았다 일어나요
    const q = E.rollQ = Math.min(1, (E.rollQ || 0) + dt / 0.35), tk = Math.min(1, q / 0.18, (1 - q) / 0.18 + 0.25), a = Math.PI * 2 * ease(q), c = 0.95;
    u.body.rotation.set(a, 0, 0); u.body.position.set(0, c - c * Math.cos(a) - 0.2 * tk, -c * Math.sin(a));
    u.legL.rotation.x = u.legR.rotation.x = -1.9 * tk; u.armL.rotation.x = u.armR.rotation.x = -1.4 * tk; u.armL.rotation.z = 0.35 * tk; u.armR.rotation.z = -0.35 * tk; u.head.rotation.x = 0.5 * tk;
    u.body.scale.set(1, 1 - 0.22 * tk, 1);
  } else E.rollQ = 0;
  if (p.dn) { u.body.rotation.set(-Math.PI / 2 + 0.2, 0, 0); u.body.position.set(0, 0.4, -1); }
  floorGuard(m, u);
  if (u.light) u.light.intensity = (p.dn ? 3 : 15);
}
// 보스 동작: 보스마다 걸음걸이가 다르고, 공격마다 준비(웅크리기·팔 벌리기)와 터뜨리는 동작이 달라요
const sm01 = (u, a, b) => ease((u - a) / (b - a));
function bossPose(E, e, T, t, dt, ak, go, wind, view) {
  const pat = CH.boss.pat || CH.boss.ai, kind = ak.replace('!', ''), w = Math.min(1, (E.wT || 0) / 0.5), ph = e.ph || 1, col = CH.boss.col || 0xff7a3a;
  // 공격이 터진 직후(공격 이름이 사라진 순간)에도 잠깐 터뜨리는 자세를 취해요
  if (E.pk && !ak) { E.hitK = E.pk; E.hitT = 0.55; } E.pk = ak && !go ? kind : ''; if (E.hitT > 0) E.hitT -= dt; const hk = E.hitT > 0 ? E.hitK : '', hv = E.hitT > 0 ? 1 - E.hitT / 0.55 : 1, hp = E.hitT > 0 ? Math.sin(Math.min(1, hv / 0.25) * Math.PI / 2) * (1 - sm01(hv, 0.45, 1)) : 0;
  // 걸음걸이와 숨쉬기: 보스마다 달라요
  const walk = e.mv;
  if (!ak && !hk && !e.sn) {
    if (pat === 'giant') { T.sq = walk ? Math.sin(E.ph) * 0.1 : Math.sin(t * 1.4) * 0.07; T.bx = walk ? 0.3 : 0.12; T.jy = walk ? Math.abs(Math.sin(E.ph * 0.5)) * 0.12 : 0; T.brz = walk ? Math.sin(E.ph * 0.5) * 0.14 : Math.sin(t * 0.7) * 0.03; T.ar = -0.1 + Math.sin(E.ph * 0.5) * 0.45; T.al = -0.1 - Math.sin(E.ph * 0.5) * 0.45; T.arz = 0.25; T.alz = -0.25; if (walk && (E.stp = (E.stp || 0) - dt) <= 0 && Math.abs(Math.sin(E.ph * 0.5)) < 0.12) { E.stp = 0.6; view.burst(E.x, 0.3, E.z, 0x8a8068, 4, 3, 0.4, 0.14); view.shake = Math.max(view.shake, 0.12); } }
    else if (pat === 'prophet' || pat === 'bishop') { T.brz = Math.sin(t * 1.3) * 0.1; T.bx = walk ? 0.12 : 0; T.sq = Math.sin(t * 1.6) * 0.04; T.ar = -0.6 + Math.sin(t * 1.5) * 0.25; T.al = -0.6 - Math.sin(t * 1.5) * 0.25; T.arz = 0.55; T.alz = -0.55; T.hx = -0.15; T.jy = 0; }
    else if (pat === 'frost') { T.bx = walk ? 0.06 : 0; T.jy = 0; T.sq = Math.sin(t * 1.1) * 0.03; T.ar = -0.3 + (walk ? Math.sin(E.ph) * 0.25 : 0); T.al = -0.3 - (walk ? Math.sin(E.ph) * 0.25 : 0); T.arz = 0.2; T.alz = -0.2; T.hx = -0.12; T.brz = walk ? Math.sin(E.ph) * 0.04 : 0; }
    else if (pat === 'flame') { T.jy = 0.5 + Math.sin(t * 1.8) * 0.3; T.bx = walk ? 0.2 : 0; T.sq = Math.sin(t * 3) * 0.05; T.ar = -0.8 + Math.sin(t * 2) * 0.3; T.al = -0.8 - Math.sin(t * 2) * 0.3; T.arz = 0.9; T.alz = -0.9; T.hx = -0.2; T.brz = Math.sin(t * 1.4) * 0.08; }
    else if (CH.boss.ai === 'hunter') { T.bx = walk ? 0.4 : 0.2; T.brz = walk ? Math.sin(E.ph) * 0.12 : Math.sin(t * 2) * 0.04; T.ar = -0.4 + (walk ? Math.sin(E.ph) * 0.9 : 0); T.al = -0.4 - (walk ? Math.sin(E.ph) * 0.9 : 0); }
    else { T.bx = walk ? 0.16 : 0.04; T.arz = 0.15; T.alz = -0.15; }
  }
  if (ph >= 3 && !e.sn) T.brz = (T.brz || 0) + Math.sin(t * 31) * (ph >= 4 ? 0.035 : 0.018);
  if (ph >= 4 && (E.auT = (E.auT || 0) - dt) <= 0) { E.auT = 0.09; view.burst(E.x + (Math.random() - .5) * 3, 0.5, E.z + (Math.random() - .5) * 3, col, 1, 4, 0.7, 0.14); }
  // 공격 준비 (wind): 종류마다 다른 자세
  const sh = Math.sin(t * 40) * 0.05 * w;
  if (wind && !go && ak) {
    switch (kind) {
      case 'slam': case 'boulder': case 'stomp': case 'leap': T.sq = 0.3 * sm01(w, 0, 0.5) - 0.2 * sm01(w, 0.75, 1); T.bx = -0.5 * sm01(w, 0, 0.6) + 0.1 * sm01(w, 0.8, 1); T.ar = T.al = -3.2 * w; T.arz = 0.25 * w; T.alz = -0.25 * w; T.jy = (kind === 'leap' ? 1.6 : 0.9) * sm01(w, 0.6, 1); T.hx = -0.5 * w; T.brz = sh; break;
      case 'ring': T.sq = 0.25 * w; T.ar = T.al = -1.4 * w; T.arz = 1.5 * w; T.alz = -1.5 * w; T.jy = 0.6 * sm01(w, 0.5, 1); T.hx = -0.6 * w; T.brz = sh; break;
      case 'sweep': T.bry = 1.15 * w; T.ar = -1.6 * w; T.arz = 1.4 * w; T.al = -0.4 * w; T.alz = -0.5 * w; T.bx = -0.2 * w; T.sq = 0.15 * w; break;
      case 'volley': T.ar = T.al = -1.55 * w; T.arz = 0.35 * w; T.alz = -0.35 * w; T.bx = -0.3 * w; T.hx = -0.15 * w; T.sq = 0.1 * w; break;
      case 'nova': case 'spiral': T.ar = T.al = -2.3 * w; T.arz = 1.1 * w; T.alz = -1.1 * w; T.jy = 0.7 * w; T.hx = -0.55 * w; T.sq = -0.12 * w; T.brz = sh; if (kind === 'spiral') T.spin = (E.spA = (E.spA || 0) + dt * (4 + 10 * w)); break;
      case 'pillars': case 'wait': T.ar = T.al = -3.1 * w; T.arz = 0.6 * w; T.alz = -0.6 * w; T.jy = 0.9 * w + Math.sin(t * 3) * 0.1 * w; T.hx = -0.8 * w; T.sq = -0.15 * w; T.brz = sh * 0.6; break;
      case 'blink': T.sq = 0.55 * w; T.ar = T.al = -0.8 * w; T.arz = -0.6 * w; T.alz = 0.6 * w; T.jy = -0.1 * w; break;
      case 'charge': case 'roll': T.bx = (kind === 'roll' ? 1.0 : -0.55) * w; T.sq = 0.35 * w; T.ar = T.al = (kind === 'roll' ? -1.6 : -2.0) * w; T.arz = 0.5 * w; T.alz = -0.5 * w; T.brz = sh; E.stp2 = (E.stp2 || 0) + dt; break;
    }
  }
  // 터뜨린 뒤: 힘껏 내려치고 천천히 풀어요
  if (hk && !wind) {
    switch (hk) {
      case 'slam': case 'boulder': case 'stomp': case 'leap': T.sq = -0.15 * hp + 0.4 * Math.max(0, 1 - hv * 4); T.bx = 0.85 * hp; T.ar = T.al = 1.0 * hp; T.jy = 0; T.hx = 0.4 * hp; break;
      case 'ring': T.sq = 0.45 * Math.max(0, 1 - hv * 3); T.bx = 0.5 * hp; T.ar = T.al = 0.9 * hp; T.arz = 1.2 * hp; T.alz = -1.2 * hp; break;
      case 'sweep': T.bry = -1.3 * hp; T.ar = -1.2 * hp; T.arz = -0.2 * hp; T.al = -0.6 * hp; T.bx = 0.3 * hp; T.sq = -0.1 * hp; break;
      case 'volley': T.bx = -0.5 * hp; T.ar = T.al = -1.8 * hp; T.arz = 0.9 * hp; T.alz = -0.9 * hp; T.sq = -0.1 * hp; break;
      case 'nova': case 'spiral': T.ar = T.al = -1.2 * hp; T.arz = 1.6 * hp; T.alz = -1.6 * hp; T.sq = -0.22 * hp; T.jy = 0.5 * (1 - hv); T.hx = -0.5 * hp; break;
      case 'pillars': case 'wait': T.ar = T.al = -1.0 * hp; T.arz = 0.3 * hp; T.alz = -0.3 * hp; T.bx = 0.4 * hp; T.hx = 0.3 * hp; T.jy = 0.6 * (1 - hv); break;
      case 'blink': T.sq = -0.25 * hp; T.ar = T.al = -2.4 * hp; T.arz = 0.8 * hp; T.alz = -0.8 * hp; break;
    }
  }
  // 돌진·구르기: 구르기는 몸을 공처럼 말고 굴러요
  if (ak === 'rollgo!') { T.rollA = (E.rollA = (E.rollA || 0) + dt * 15); T.bx = 0; T.sq = 0; }
  else { E.rollA = 0; if (ak === 'charge!') { T.bx = 0.9; T.sq = -0.3; T.ar = 0.9; T.al = 0.9; T.arz = 0.3; T.alz = -0.3; T.jy = Math.abs(Math.sin(t * 20)) * 0.25; T.brz = Math.sin(t * 20) * 0.1; } }
  if (go && ak !== 'charge!' && ak !== 'rollgo!') { T.sq = 0; }
}
function animEnemy(E, e, dt, t, view) {
  const m = E.m, u = m.userData, boss = e.k === 'boss', wolf = u.kind === 'wolf', mim = u.kind === 'mimic', dead = e.hp <= 0; m.position.set(E.x, 0, E.z); m.rotation.y = Math.PI / 2 - E.a;
  E.ph += dt * (e.mv ? (e.sl ? 4.5 : 9) : 0); E.sw = (E.sw || 0) + ((e.mv ? Math.sin(E.ph) * 0.6 : 0) - (E.sw || 0)) * Math.min(1, dt * 14); const sw = E.sw;
  u.legL.rotation.x = sw * (e.mv ? 1.5 : 1); u.legR.rotation.x = -sw * (e.mv ? 1.5 : 1);
  // 과장된 동작: 걸을 때 통통 튀고, 공격 전에는 크게 웅크려 젖혔다가, 휘두를 때 몸을 던지듯 앞으로 쏠려요. 맞으면 뒤로 휘청, 기절하면 비틀비틀
  const ak = e.ak || '', go = ak.endsWith('!'), wind = e.st === 'wind' || e.st === 'wind2' || boss && ak && !go;
  E.wT = wind ? (E.wT || 0) + dt : 0; if (E.swT > 0) E.swT -= dt; if (E.kb > 0) E.kb = Math.max(0, E.kb - dt * 3.5); if (E.roarT > 0) E.roarT -= dt;
  const T = { bx: 0, bry: 0, brz: 0, sq: 0, jy: 0, ar: -0.9 - sw * 0.3, al: -0.9 + sw * 0.3, hx: 0, hz: 0 };
  if (e.mv && !dead) { const b = Math.abs(Math.sin(E.ph)); T.jy = b * (boss ? 0.18 : 0.32); T.sq = (0.5 - b) * 0.12; T.bx = boss ? 0.12 : 0.22; T.brz = Math.sin(E.ph) * (boss ? 0.08 : 0.14); T.ar = -0.5 - sw * 1.1; T.al = -0.5 + sw * 1.1; T.hz = -T.brz * 0.6; }
  else { T.sq = Math.sin(t * 2.4 + E.ph) * 0.04; T.hz = Math.sin(t * 1.3 + E.ph) * 0.1; }
  if (wind) {
    const w = Math.min(1, E.wT / (boss ? 0.45 : 0.3)), sh = Math.sin(t * 42) * 0.07 * w;
    T.sq = (boss ? 0.32 : 0.28) * w; T.bx = -0.45 * w; T.bry = 0.75 * w; T.ar = -3.1 * w + T.ar * (1 - w) + sh; T.al = (boss ? -3.0 : -1.4) * w + T.al * (1 - w) - sh; T.hx = -0.35 * w; T.brz = sh; T.jy = 0;
    if (e.k === 'archer') { T.ar = -1.7 + sh; T.al = -1.6; T.bry = 0.55 * w; T.bx = -0.3 * w; T.sq = 0.15 * w; }
  }
  if (e.st === 'charge' || ak === 'charge!' || ak === 'rollgo!') { T.bx = 0.85; T.sq = -0.25; T.ar = 0.7; T.al = 0.7; T.jy = Math.abs(Math.sin(t * 22)) * 0.35; T.brz = Math.sin(t * 22) * 0.12; }
  else if (boss && go) { const q = Math.min(1, (E.goT = (E.goT || 0) + dt) / 0.15); T.bx = 0.6 * q; T.sq = -0.3 * q + (ak === 'slam!' || ak === 'stomp!' ? 0.4 * Math.max(0, q - 0.8) * 5 : 0); T.ar = -3.1 + 3.9 * q; T.al = -3.0 + 3.8 * q; T.bry = -0.6 * q; }
  if (!go) E.goT = 0;
  if (E.swT > 0) {
    const v = 1 - E.swT / 0.42, hit = Math.min(1, v / 0.22), rc = Math.max(0, (v - 0.45) / 0.55), k = 1 - rc;
    T.bx = 0.8 * hit * k; T.sq = -0.28 * hit * k + 0.2 * Math.max(0, 1 - Math.abs(v - 0.28) * 7); T.ar = (-3.1 + 3.9 * hit) * k + T.ar * rc; T.al = -0.3 * k + T.al * rc; T.bry = -0.85 * hit * k; T.jy = Math.sin(Math.min(1, v / 0.32) * Math.PI) * 0.55; T.hx = 0.25 * hit * k;
  }
  if (E.roarT > 0) { const r = Math.min(1, E.roarT / 0.3); T.ar = -2.7 * r; T.al = -2.7 * r; T.hx = -0.8 * r; T.bx = -0.4 * r; T.sq = -0.28 * r + Math.sin(t * 55) * 0.06 * r; T.jy = 0.3 * r; T.brz = Math.sin(t * 55) * 0.05; }
  if (E.kb > 0) { T.bx -= E.kb * 0.9; T.hx -= E.kb * 1.2; T.sq += E.kb * 0.5; T.ar -= E.kb * 1.2; T.al -= E.kb * 1.2; }
  if (e.sn && !dead) { T.brz = Math.sin(t * 9) * 0.32; T.bx = Math.sin(t * 5.3) * 0.18; T.ar = -0.2 + Math.sin(t * 9) * 0.4; T.al = -0.2 - Math.sin(t * 9) * 0.4; T.sq = 0.05; if ((E.stT = (E.stT || 0) - dt) <= 0) { E.stT = 0.22; const a = t * 6; view.burst(E.x + Math.cos(a) * 0.8, (boss ? 7 : 3.6), E.z + Math.sin(a) * 0.8, 0xffe060, 1, 0.6, 0.5, 0.16); } }
  if (e.st === 'sleep' || e.st === 'home' && !e.mv) { const zz = 1; T.hx = 0.6 * zz; T.bx = 0.22 * zz; T.ar = -0.4; T.al = -0.4; }
  if (boss && !dead && !mim) bossPose(E, e, T, t, dt, ak, go, wind, view);
  const f = wolf ? 0.35 : 1, sk = (n, v) => { E[n] = E[n] == null ? v : E[n] + (v - E[n]) * Math.min(1, dt * 22); return E[n]; };
  const bx = sk('_bx', T.bx * f), bry = sk('_bry', T.bry * f), brz = sk('_brz', T.brz * f), sq = sk('_sq', T.sq), jy = sk('_jy', T.jy);
  if (!mim) { u.body.rotation.set(bx, bry + (T.spin || 0), brz); u.body.scale.set(1 + sq * 0.5, 1 - sq * 0.6, 1 + sq * 0.5); u.head.rotation.x = sk('_hx', T.hx); u.head.rotation.z = T.hz; }
  if (!wolf && !mim) { u.armR.rotation.x = sk('_ar', T.ar); u.armR.rotation.z = sk('_arz', T.arz || 0); if (u.armL) { u.armL.rotation.x = sk('_al', T.al); u.armL.rotation.z = sk('_alz', T.alz || 0); } }
  if (T.rollA != null) { const c = 1.6; u.body.rotation.set(T.rollA, bry, brz); u.body.position.set(0, c - c * Math.cos(T.rollA), -c * Math.sin(T.rollA)); u.legL.rotation.x = u.legR.rotation.x = -1.9; } else if (boss) u.body.position.set(0, 0, 0);
  if (boss) {
    if (u.light) u.light.intensity = 18 + Math.sin(t * 1.5) * 2 + (e.ph === 3 ? 10 : 0) + (wind ? 8 * Math.abs(Math.sin(t * 20)) : 0);
    if (u.crack) { const on = e.ph === 3; u.crack.visible = on; u.cape.visible = !on; const pl = 0.5 + 0.5 * Math.sin(t * 6); u.ckM.emissiveIntensity = on ? 4 + pl * 5 : 0; u.ckL.intensity = on ? 10 + pl * 14 : 0; if (on && (E.ckT = (E.ckT || 0) - dt) <= 0) { E.ckT = 0.12; const bk = -E.a + Math.PI / 2, bx2 = E.x - Math.sin(bk) * 1.3, bz2 = E.z - Math.cos(bk) * 1.3; view.burst(bx2, 4 + Math.random(), bz2, 0xff7a20, 2, 2, 0.5, 0.12); } }
    // 공격을 모으는 동안 몸에서 불똥이 튀어요
    if (wind && (E.wfT = (E.wfT || 0) - dt) <= 0) { E.wfT = 0.06; view.burst(E.x + (Math.random() - .5) * 2.4, 1 + Math.random() * 4, E.z + (Math.random() - .5) * 2.4, CH.boss.col || 0xff7a3a, 1, 2.5, 0.4, 0.12); }
  }
  // 강타로 느려진 적: 파란 서리 알갱이가 몸에서 피어올라요
  if (e.sl && (E.slT = (E.slT || 0) - dt) <= 0) { E.slT = 0.1; const sz = boss ? 2.4 : 1; view.burst(E.x + (Math.random() - .5) * sz, 0.6 + Math.random() * 1.8 * sz, E.z + (Math.random() - .5) * sz, 0x7ac8ff, 2, 1.2, 0.6, 0.11); }
  m.position.y = (boss && CH.boss.ai === 'bishop' ? 0.6 + Math.sin(t * 1.6) * 0.25 : 0) + jy;
  if (e.st === 'rise') m.position.y = -1.5;
  // 종자에게 다리가 걸리면 뒤로 한 바퀴, 덫에 걸리면 높이 튕겨 올라요
  if (E.tripT > 0) { E.tripT -= dt; const q = 1 - Math.max(0, E.tripT) / E.tripD; m.position.y += Math.sin(q * Math.PI) * E.tripH; if (!wolf && !mim) u.body.rotation.x -= q * Math.PI * 2 * (E.tripH > 2 ? 2 : 1); }
  // 쓰러질 때: 보통 적은 위로 튕겨 빙글 돌다가 부서져요. 보스는 천천히 가라앉아요
  if (dead) {
    E.dieT = (E.dieT || 0) + dt; const d = E.dieT;
    if (boss) { // 비틀거리며 무릎 꿇고, 몸을 떨다가 앞으로 쓰러지며 부서져 가라앉아요
      const kn = Math.min(1, d / 0.8), fall = Math.max(0, d - 1.1);
      u.body.rotation.set(-0.4 * kn * (1 - Math.min(1, fall * 2)) + Math.min(1.45, fall * 2.6), 0, Math.sin(d * 38) * 0.07 * (1 - kn) + (d < 1.1 ? Math.sin(d * 14) * 0.1 * kn : 0));
      u.body.scale.set(1 + 0.12 * kn, 1 - 0.3 * kn, 1 + 0.12 * kn); u.armR.rotation.x = u.armL.rotation.x = 0.3 * kn - fall; u.armR.rotation.z = 0.3 * kn; u.armL.rotation.z = -0.3 * kn; u.head.rotation.x = 0.5 * kn; u.legL.rotation.x = u.legR.rotation.x = -0.9 * kn;
      m.position.y = fall > 0 ? -fall * 1.6 : 0;
      if (d < 1.1 && (E.dsT = (E.dsT || 0) - dt) <= 0) { E.dsT = 0.1; view.burst(E.x + (Math.random() - .5) * 2.4, 1 + Math.random() * 4, E.z + (Math.random() - .5) * 2.4, CH.boss.col || 0xff7a3a, 2, 3, 0.5, 0.14); }
      if (!E.shat && d > 1.1) { E.shat = 1; view.shatter(E.x, E.z, [CH.boss.col || 0xff7a3a, 0xffd36b, 0x2a2228], 40, true); view.shock(E.x, E.z, 9, CH.boss.col || 0xff7a3a, 0.7); }
      if (fall > 2.2) m.visible = false;
    }
    else {
      m.position.y = d < 0.45 ? Math.sin(d / 0.45 * Math.PI) * 2.2 : -(d - 0.45) * 4; u.body.rotation.set(-d * 9, 0, d * 5); u.body.scale.set(1, 1, 1);
      if (!E.shat && d > 0.42) { E.shat = 1; view.shatter(E.x, E.z, u.kind === 'wolf' ? [0x5a5048, 0x3a3430, 0x8a7a6a] : [0xe8e0c8, 0xb8b0a0, 0x4a4450], 12); }
      m.visible = d < 0.7;
    }
  }
  // 맞으면 잠깐 부풀었다 돌아와요
  if (E.pop > 0) { E.pop = Math.max(0, E.pop - dt); const q = 1 + E.pop * 2.2; m.scale.set(E.base * q, E.base * (2 - q), E.base * q); } else m.scale.setScalar((E.base || 1) * (e.ht ? 1.08 : 1));
  if (e.sn) u.head.rotation.y = t * 6; else u.head.rotation.y = 0;
  // 미믹: 뚜껑으로 덥석덥석, 걸을 때는 통통 튀어요
  if (u.kind === 'mimic') {
    const op = e.st === 'wind' ? -1.35 : e.st === 'sleep' || e.st === 'home' ? 0 : -0.25 - 0.4 * Math.abs(Math.sin(t * 9 + E.ph));
    E.lid = E.lid == null ? op : E.lid + (op - E.lid) * Math.min(1, dt * 20); u.lid.rotation.x = E.lid;
    if (e.mv && e.hp > 0) m.position.y = Math.abs(Math.sin(E.ph * 0.9)) * 0.7; u.body.rotation.z = e.mv ? Math.sin(E.ph * 0.9) * 0.12 : 0;
  }
}

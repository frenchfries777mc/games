// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 지도: 벽 칸, 충돌, 시야, 길찾기 (규칙·화면·게스트 이동이 같이 써요)
import { MAP } from './data.js';

export const CS = MAP.cs, MW = MAP.w, MH = MAP.h;
export const WX = MW * CS, WZ = MH * CS; // 지도 전체 크기 (m)
// 칸 좌표 → 세계 좌표 (칸 가운데)
export const cw = c => (c + 0.5) * CS;

// 0 = 벽, 1 = 바닥
export const GRID = new Uint8Array(MW * MH);
for (const [x, y, w, h] of MAP.floors) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) GRID[j * MW + i] = 1;
export const WATER = new Uint8Array(MW * MH);
for (const [x, y, w, h] of MAP.water) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) WATER[j * MW + i] = 1;

export const PILLARS = MAP.pillars.map(([x, y]) => ({ x: cw(x), z: cw(y), r: 1.1 }));

export function floorCell(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH && GRID[j * MW + i] === 1; }
export function isWall(x, z) { return !floorCell(Math.floor(x / CS), Math.floor(z / CS)); }

// 원(위치 o, 반지름 r)을 벽과 기둥 밖으로 밀어내요
export function collide(o, r) {
  for (let pass = 0; pass < 2; pass++) {
    const i0 = Math.floor((o.x - r) / CS), i1 = Math.floor((o.x + r) / CS), j0 = Math.floor((o.z - r) / CS), j1 = Math.floor((o.z + r) / CS);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (floorCell(i, j)) continue;
      const nx = Math.max(i * CS, Math.min(o.x, (i + 1) * CS)), nz = Math.max(j * CS, Math.min(o.z, (j + 1) * CS));
      const dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
      if (d < r) {
        if (d > 1e-5) { o.x = nx + dx / d * r; o.z = nz + dz / d * r; }
        else { o.x = (i + 0.5) * CS + (o.x < (i + 0.5) * CS ? -1 : 1) * (CS / 2 + r); }
      }
    }
  }
  for (const p of PILLARS) { const d = Math.hypot(o.x - p.x, o.z - p.z), m = p.r + r; if (d < m && d > 1e-4) { o.x = p.x + (o.x - p.x) / d * m; o.z = p.z + (o.z - p.z) / d * m; } }
}

// 두 점 사이가 벽에 막히지 않았는지 (기둥은 무시해요)
export function lineClear(ax, az, bx, bz) {
  const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.6);
  for (let k = 1; k < n; k++) { const u = k / n; if (isWall(ax + (bx - ax) * u, az + (bz - az) * u)) return false; }
  return true;
}

// 길찾기: 목표 칸에서 퍼져 나가는 거리 지도를 만들어 두고 재사용해요
const FIELDS = new Map();
function field(ti, tj, now) {
  const key = ti + ',' + tj; const f = FIELDS.get(key);
  if (f && now - f.t < 0.5) return f.d;
  const d = new Float32Array(MW * MH).fill(1e9); const q = new Int32Array(MW * MH); let h = 0, t = 0;
  if (!floorCell(ti, tj)) return d;
  d[tj * MW + ti] = 0; q[t++] = tj * MW + ti;
  while (h < t) {
    const c = q[h++], i = c % MW, j = (c / MW) | 0, cd = d[c];
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (!floorCell(ni, nj)) continue;
      if (di && dj && (!floorCell(i + di, j) || !floorCell(i, j + dj))) continue;
      const nc = nj * MW + ni, nd = cd + (di && dj ? 1.414 : 1);
      if (nd < d[nc]) { d[nc] = nd; q[t++] = nc; }
    }
  }
  if (FIELDS.size > 40) FIELDS.clear();
  FIELDS.set(key, { t: now, d }); return d;
}
// from에서 to로 가려면 어느 방향으로 걸어야 하는지 (각도), 못 가면 null
export function navDir(fx, fz, tx, tz, now) {
  if (lineClear(fx, fz, tx, tz)) return Math.atan2(tz - fz, tx - fx);
  const ti = Math.floor(tx / CS), tj = Math.floor(tz / CS), fi = Math.floor(fx / CS), fj = Math.floor(fz / CS);
  const d = field(ti, tj, now); let best = d[fj * MW + fi], bi = -1, bj = -1;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    if (!di && !dj) continue; const ni = fi + di, nj = fj + dj; if (!floorCell(ni, nj)) continue;
    if (di && dj && (!floorCell(fi + di, fj) || !floorCell(fi, fj + dj))) continue;
    const v = d[nj * MW + ni]; if (v < best) { best = v; bi = ni; bj = nj; }
  }
  if (bi < 0) return null;
  return Math.atan2(cw(bj) - fz, cw(bi) - fx);
}
// 길로 잰 거리 (칸 수 × 칸 크기)
export function pathDist(fx, fz, tx, tz, now) {
  const d = field(Math.floor(tx / CS), Math.floor(tz / CS), now)[Math.floor(fz / CS) * MW + Math.floor(fx / CS)];
  return d * CS;
}

// 그 위치가 어느 구역인지 (없으면 -1)
export function areaAt(x, z) {
  const i = x / CS, j = z / CS;
  for (let a = 0; a < MAP.areas.length; a++) for (const [rx, ry, rw, rh] of MAP.areas[a].r) if (i >= rx && i < rx + rw && j >= ry && j < ry + rh) return a;
  return -1;
}

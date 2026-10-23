// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 지도: 벽 칸, 충돌, 시야, 길찾기 (규칙·화면·게스트 이동이 같이 써요)
import { MAP, CHAPTERS, CH, setChapterData, DEEP_I } from './data.js';

const FIELDS = new Map();
export let CS = 2, MW = 0, MH = 0, WX = 0, WZ = 0; // 지도 전체 크기 (m)
// 칸 좌표 → 세계 좌표 (칸 가운데)
export const cw = c => (c + 0.5) * CS;

// GRID: 0 = 벽, 1 = 바닥
export let GRID = new Uint8Array(0), WATER = new Uint8Array(0), PILLARS = [];
// 비밀 방: SEC 칸 값 = 비밀 방 번호 + 1 (방 안), -(번호 + 1) (금 간 벽 통로). SOPEN = 열렸는지
export let SEC = new Int8Array(0); export const SOPEN = [];
let CUR = -1;
// 장을 바꾸면 지도를 새로 만들어요 (끝없는 심연은 층마다 새로: force)
export function useChapter(i, force) {
  i = i === DEEP_I ? DEEP_I : Math.max(0, Math.min(CHAPTERS.length - 1, i | 0));
  if (i === CUR && !force) return CH; CUR = i; setChapterData(i);
  CS = MAP.cs; MW = MAP.w; MH = MAP.h; WX = MW * CS; WZ = MH * CS;
  GRID = new Uint8Array(MW * MH); WATER = new Uint8Array(MW * MH);
  for (const [x, y, w, h] of MAP.floors) for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) if (k >= 0 && j >= 0 && k < MW && j < MH) GRID[j * MW + k] = 1;
  for (const [x, y, w, h] of MAP.water) for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) if (k >= 0 && j >= 0 && k < MW && j < MH) WATER[j * MW + k] = 1;
  PILLARS = MAP.pillars.map(([x, y]) => ({ x: cw(x), z: cw(y), r: 1.1 }));
  SEC = new Int8Array(MW * MH);
  MAP.secrets.forEach((q, k) => {
    const fill = ([x, y, w, h], v, g) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { SEC[j * MW + i] = v; GRID[j * MW + i] = g; } };
    fill(q.room, k + 1, 1); fill(q.pass, -(k + 1), 0);
  });
  resetSecrets();
  return CH;
}
// 새 원정마다 비밀 방을 다시 막아요
export function resetSecrets() {
  SOPEN.length = 0; FIELDS.clear();
  MAP.secrets.forEach(q => { const [x, y, w, h] = q.pass; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) GRID[j * MW + i] = 0; });
}
export function openSecret(k) {
  if (SOPEN[k] || !MAP.secrets[k]) return; SOPEN[k] = 1; FIELDS.clear();
  const [x, y, w, h] = MAP.secrets[k].pass; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) GRID[j * MW + i] = 1;
}
// 아직 열리지 않은 비밀 방 칸인지 (작은 지도에 안 보이게)
export function hiddenCell(i, j) { const v = SEC[j * MW + i]; return v !== 0 && !SOPEN[Math.abs(v) - 1]; }
// 금 간 벽 가운데 (세계 좌표)
export function secretFace(k) { const [x, y, w, h] = MAP.secrets[k].face; return { x: (x + w / 2) * CS, z: (y + h / 2) * CS }; }
export function chapterIndex() { return CUR; }

export function floorCell(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH && GRID[j * MW + i] === 1; }
export function isWall(x, z) { return !floorCell(Math.floor(x / CS), Math.floor(z / CS)); }

// 원(위치 o, 반지름 r)을 벽과 기둥 밖으로 밀어내요
export function collide(o, r) {
  // 벽 안에 들어가 버렸으면 가장 가까운 바닥 칸으로 꺼내요
  const ci = Math.floor(o.x / CS), cj = Math.floor(o.z / CS);
  if (!floorCell(ci, cj)) {
    let best = null, bd = 1e9;
    for (let dj = -4; dj <= 4; dj++) for (let di = -4; di <= 4; di++) {
      if (!floorCell(ci + di, cj + dj)) continue;
      const nx = Math.max((ci + di) * CS + r, Math.min(o.x, (ci + di + 1) * CS - r)), nz = Math.max((cj + dj) * CS + r, Math.min(o.z, (cj + dj + 1) * CS - r)), d = Math.hypot(nx - o.x, nz - o.z);
      if (d < bd) { bd = d; best = [nx, nz]; }
    }
    if (best) { o.x = best[0]; o.z = best[1]; }
  }
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
function field(ti, tj, now) {
  const key = ti + ',' + tj; const f = FIELDS.get(key);
  if (f && now - f.t < 0.5) return f.d;
  // 대각선 때문에 같은 칸이 여러 번 들어올 수 있어서 큐는 늘어나는 배열로 둬요
  const d = new Float32Array(MW * MH).fill(1e9); const q = []; let h = 0;
  if (!floorCell(ti, tj)) return d;
  d[tj * MW + ti] = 0; q.push(tj * MW + ti);
  while (h < q.length) {
    const c = q[h++], i = c % MW, j = (c / MW) | 0, cd = d[c];
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (!floorCell(ni, nj)) continue;
      if (di && dj && (!floorCell(i + di, j) || !floorCell(i, j + dj))) continue;
      const nc = nj * MW + ni, nd = cd + (di && dj ? 1.414 : 1);
      if (nd < d[nc]) { d[nc] = nd; q.push(nc); }
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

useChapter(0);

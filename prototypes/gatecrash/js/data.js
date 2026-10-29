/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   데이터: 상수, 무기, 맵 */
'use strict';
const VERSION = '0.1', BUILD = 5;
const TS = 16;                                   // 타일 한 칸 (px)
const PH = { RUN: 120, ACC: 1500, AIR: 1000, G: 1500, JUMP: 410, CUT: 150, MAXF: 560, W: 10, H: 22, COY: 0.08, BUF: 0.12, BELT: 70 };
const MAX_HP = 100, RACERS = 4;
const COLORS = ['#e8483b', '#3b8de8', '#3fbf5a', '#f2b632', '#a65be0', '#f07ab8', '#2cc4c4', '#f0f0f0'];

/* 무기: 클릭으로 써요. uses = 쓸 수 있는 횟수 */
const WEAPONS = {
  bat:     { name: '야구 방망이', kind: 'melee',  dmg: 20, kb: 300, up: 170, cd: 0.55, uses: 12, range: 24, stun: 0.35 },
  pan:     { name: '프라이팬',   kind: 'melee',  dmg: 14, kb: 170, up: 120, cd: 0.45, uses: 14, range: 20, stun: 0.9 },
  pistol:  { name: '고무탄 권총', kind: 'shot',   dmg: 10, kb: 190, up: 90,  cd: 0.32, uses: 10, speed: 430, life: 0.8, stun: 0.25, reach: 220 },
  ext:     { name: '소화기',     kind: 'spray',  dmg: 3,  kb: 110, up: 40,  cd: 0.12, uses: 30, speed: 260, life: 0.32, stun: 0.15, recoil: 45, reach: 80 },
  bazooka: { name: '바주카',     kind: 'rocket', dmg: 28, kb: 380, up: 240, cd: 1.1,  uses: 3,  speed: 280, life: 2.5, radius: 44, stun: 0.5, reach: 230 }
};
const WEP_IDS = Object.keys(WEAPONS);

/* ---------- 맵 만들기 도구 ----------
   칸: '.' 빈칸, '#' 벽·바닥, 'x' 가구(단단함), '=' 아래에서 뚫고 올라가는 발판, '>' '<' 무빙워크 */
function Builder(w, h) {
  const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill('.'));
  const b = { w, h, g, objs: [], spawns: [], starts: [], rooms: [], finish: null };
  b.fill = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = c; };
  // 가구: bottom = 바닥 바로 위 줄
  b.obj = (t, x, bottom, ww, hh, solid = true) => { b.objs.push({ t, x, y: bottom - hh + 1, w: ww, h: hh, solid }); if (solid) b.fill(x, bottom - hh + 1, x + ww - 1, bottom, 'x'); };
  b.deco = (t, x, bottom, ww, hh) => b.obj(t, x, bottom, ww, hh, false);
  b.spawn = (x, bottom) => b.spawns.push({ x: x * TS + TS / 2, y: (bottom + 1) * TS - 6 });
  b.room = (x0, y0, x1, y1, theme) => b.rooms.push({ x0, y0, x1, y1, theme });
  return b;
}

/* 오피스 빌딩: 1층 로비에서 시작해 층마다 지그재그로 올라가 옥상 헬기장에 먼저 닿으면 이겨요 */
function mapOffice() {
  const b = Builder(64, 36);
  [11, 17, 23, 29, 35].forEach(s => b.fill(0, s, 63, s, '#'));
  b.fill(0, 12, 0, 35, '#'); b.fill(63, 12, 63, 35, '#');
  b.room(1, 30, 62, 34, 'lobby'); b.room(1, 24, 62, 28, 'office'); b.room(1, 18, 62, 22, 'cafe'); b.room(1, 12, 62, 16, 'server');
  // 계단실 (오른쪽: 1→2층, 3→4층 / 왼쪽: 2→3층, 4층→옥상)
  const stairR = (slab) => { b.fill(54, slab, 59, slab, '.'); b.fill(57, slab + 4, 59, slab + 4, '='); b.fill(54, slab + 2, 56, slab + 2, '='); b.deco('stairwell', 54, slab + 5, 6, 6); };
  const stairL = (slab) => { b.fill(4, slab, 9, slab, '.'); b.fill(4, slab + 4, 6, slab + 4, '='); b.fill(7, slab + 2, 9, slab + 2, '='); b.deco('stairwell', 4, slab + 5, 6, 6); };
  stairR(29); stairL(23); stairR(17); stairL(11);
  // 1층 로비 → 오른쪽
  b.deco('door', 1, 34, 2, 4);
  b.obj('counter', 12, 34, 4, 2); b.obj('plant', 20, 34, 1, 1); b.obj('sofa', 24, 34, 3, 1);
  b.obj('gate', 31, 34, 1, 2); b.obj('bench', 37, 34, 3, 1); b.obj('plant', 44, 34, 1, 2); b.obj('boxes', 48, 34, 2, 1); b.obj('boxes', 49, 33, 1, 1);
  b.spawn(8, 34); b.spawn(34, 34); b.spawn(52, 34);
  // 2층 사무실 → 왼쪽
  b.obj('desk', 46, 28, 3, 1); b.obj('copier', 40, 28, 2, 2); b.obj('cooler', 35, 28, 1, 2); b.obj('desk', 27, 28, 3, 1);
  b.obj('chair', 30, 28, 1, 1); b.obj('cabinet', 21, 28, 2, 2); b.obj('desk', 15, 28, 3, 1); b.obj('plant', 12, 28, 1, 1);
  b.deco('whiteboard', 30, 26, 4, 2);
  b.spawn(51, 28); b.spawn(32, 28); b.spawn(19, 28);
  // 3층 식당 → 오른쪽
  b.obj('trash', 14, 22, 1, 1); b.obj('table', 18, 22, 3, 1); b.obj('table', 25, 22, 3, 1); b.obj('vending', 31, 22, 2, 2);
  b.obj('table', 37, 22, 3, 1); b.obj('foodbar', 43, 22, 4, 2); b.obj('trash', 50, 22, 1, 1);
  b.spawn(12, 22); b.spawn(28, 22); b.spawn(48, 22);
  // 4층 서버실 → 왼쪽
  b.obj('rack', 48, 16, 1, 2); b.obj('rack', 44, 16, 1, 2); b.obj('rack', 40, 16, 1, 2); b.obj('meeting', 26, 16, 5, 1);
  b.obj('chair', 24, 16, 1, 1); b.obj('rack', 16, 16, 1, 2); b.obj('boxes', 12, 16, 2, 1);
  b.spawn(51, 16); b.spawn(33, 16); b.spawn(20, 16);
  // 옥상 → 헬기장
  b.obj('ac', 15, 10, 3, 2); b.obj('vent', 22, 10, 1, 1); b.obj('ac', 28, 10, 2, 2); b.obj('tank', 35, 10, 3, 2);
  b.deco('antenna', 40, 10, 1, 5); b.obj('vent', 43, 10, 1, 1); b.obj('ac', 47, 10, 2, 2);
  b.deco('helipad', 54, 10, 9, 1);
  b.spawn(25, 10); b.spawn(45, 10);
  b.finish = { x0: 55, y0: 6, x1: 62, y1: 10 };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i) * TS + 3, y: 35 * TS - PH.H });
  return b;
}

/* 공항: 출국장 입구 → 체크인 카운터 → 보안 검색 → 에스컬레이터 → 무빙워크 → 탑승구 → 탑승교 → 비행기 문 */
function mapAirport() {
  const W = 140, b = Builder(W, 22);
  b.fill(0, 0, 120, 2, '#');                      // 지붕
  b.fill(0, 20, W - 1, 21, '#');                  // 1층 바닥
  b.fill(69, 12, W - 1, 19, '#');                 // 2층 (출발층)
  b.fill(0, 3, 0, 19, '#');
  b.fill(120, 3, 120, 8, '#');                    // 터미널 바깥벽 (탑승교 위)
  b.fill(121, 8, 133, 8, '#');                    // 탑승교 지붕
  b.room(1, 3, 68, 19, 'terminal'); b.room(69, 3, 119, 11, 'gates'); b.room(121, 9, 133, 11, 'bridge');
  // 1층 홀
  b.deco('door', 1, 19, 3, 4);
  b.obj('luggage', 9, 19, 2, 1); b.obj('barrier', 13, 19, 1, 1); b.obj('barrier', 17, 19, 1, 1);
  b.obj('checkin', 21, 19, 3, 2); b.obj('checkin', 27, 19, 3, 2); b.obj('checkin', 33, 19, 3, 2);
  b.fill(21, 16, 35, 16, '=');                    // 카운터 위 중2층 발판
  b.deco('board', 22, 13, 12, 2);                 // 출발 안내판
  b.obj('barrier', 40, 19, 1, 1); b.obj('barrier', 43, 19, 1, 1);
  b.obj('xray', 47, 19, 3, 2); b.deco('detector', 51, 19, 1, 3); b.obj('bins', 53, 19, 3, 1); b.obj('plant', 57, 19, 1, 1);
  // 에스컬레이터 (2칸씩 오르는 계단)
  b.fill(60, 18, 62, 19, '#'); b.fill(63, 16, 65, 19, '#'); b.fill(66, 14, 68, 19, '#');
  b.deco('escalator', 60, 19, 10, 8);
  b.spawn(10, 19); b.spawn(28, 15); b.spawn(44, 19); b.spawn(67, 13);
  // 2층 탑승구
  b.fill(73, 12, 88, 12, '>'); b.obj('cart', 79, 11, 2, 1);
  b.obj('shelf', 92, 11, 2, 2); b.obj('shelf', 97, 11, 2, 2);
  b.fill(101, 12, 107, 12, '>');
  b.obj('seats', 109, 11, 3, 1); b.obj('seats', 113, 11, 3, 1); b.obj('gatedesk', 117, 11, 2, 1);
  b.spawn(90, 11); b.spawn(108, 11);
  // 탑승교
  b.obj('luggage', 125, 11, 1, 1); b.obj('cone', 129, 11, 1, 1);
  b.deco('plane', 133, 14, 7, 12);
  b.finish = { x0: 134, y0: 9, x1: 138, y1: 11 };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (4 + i) * TS + 3, y: 20 * TS - PH.H });
  return b;
}

/* 층 구조 건물 만들기: floors = 아래 층부터 [{ theme, objs: [[종류, x, 너비, 높이], ...], belt: 0|1|-1 }], roof = 옥상 가구 */
function floorsMap(F, roof, decor) {
  const n = F.length, H = 6 * n + 6, b = Builder(64, H), S = k => H - 1 - 6 * k;
  for (let k = 0; k <= n; k++) b.fill(0, S(k), 63, S(k), '#');
  b.fill(0, S(n), 0, H - 1, '#'); b.fill(63, S(n), 63, H - 1, '#');
  F.forEach((f, i) => {
    const slab = S(i + 1), bottom = S(i) - 1, right = i % 2 === 0;
    b.room(1, slab + 1, 62, bottom, f.theme);
    if (f.belt) b.fill(12, S(i), 50, S(i), f.belt > 0 ? '>' : '<');
  });
  F.forEach((f, i) => {
    const slab = S(i + 1), bottom = S(i) - 1, right = i % 2 === 0;
    if (right) { b.fill(54, slab, 59, slab, '.'); b.fill(57, slab + 4, 59, slab + 4, '='); b.fill(54, slab + 2, 56, slab + 2, '='); b.deco('stairwell', 54, slab + 5, 6, 6); }
    else { b.fill(4, slab, 9, slab, '.'); b.fill(4, slab + 4, 6, slab + 4, '='); b.fill(7, slab + 2, 9, slab + 2, '='); b.deco('stairwell', 4, slab + 5, 6, 6); }
    for (const o of f.objs) { if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], bottom, o[2], o[3]); else b.obj(o[0], o[1], bottom, o[2], o[3]); }
    [14, 31, 48].forEach(x => b.spawn(x, bottom));
  });
  b.deco('door', 1, S(0) - 1, 2, 4);
  const rb = S(n) - 1;
  for (const o of roof) { if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], rb, o[2], o[3]); else b.obj(o[0], o[1], rb, o[2], o[3]); }
  const arriveRight = (n - 1) % 2 === 0;
  b.spawn(arriveRight ? 45 : 18, rb);
  if (arriveRight) { b.deco('helipad', 1, rb, 9, 1); b.finish = { x0: 1, y0: rb - 4, x1: 8, y1: rb }; } else { b.deco('helipad', 54, rb, 9, 1); b.finish = { x0: 55, y0: rb - 4, x1: 62, y1: rb }; }
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i) * TS + 3, y: (H - 1) * TS - PH.H });
  return b;
}
const ob = (t, x, w, h) => [t, x, w, h];
function mapSubway() {
  return floorsMap([
    { theme: 'subwayB', objs: [ob('bench', 12, 3, 1), ob('trash', 18, 1, 1), ob('turnstile', 22, 1, 2), ob('turnstile', 25, 1, 2), ob('luggage', 31, 2, 1), ob('bench', 37, 3, 1), ob('pillar', 44, 2, 3), ob('boxes', 49, 2, 1), ['~train', 12, 40, 3]] },
    { theme: 'subway', objs: [ob('ticket', 14, 3, 2), ob('plant', 21, 1, 1), ob('kiosk', 26, 3, 2), ob('luggage', 33, 2, 1), ob('bench', 38, 3, 1), ob('ticket', 44, 3, 2)] },
    { theme: 'subwayS', objs: [ob('cart', 13, 2, 1), ob('barrier', 19, 1, 1), ob('news', 24, 2, 2), ob('bench', 31, 3, 1), ob('barrier', 38, 1, 1), ob('plant', 44, 1, 2), ob('boxes', 48, 2, 1)] }
  ], [ob('ac', 15, 3, 2), ob('vent', 24, 1, 1), ob('tank', 31, 3, 2), ob('ac', 40, 2, 2)]);
}
function mapMall() {
  return floorsMap([
    { theme: 'mall', objs: [ob('fountain', 14, 5, 1), ob('plant', 22, 1, 2), ob('bench', 26, 3, 1), ob('cart', 33, 2, 1), ob('kiosk', 39, 3, 2), ob('plant', 46, 1, 1)] },
    { theme: 'mallF', objs: [ob('mannequin', 14, 1, 3), ob('rackc', 19, 3, 2), ob('mannequin', 26, 1, 3), ob('rackc', 31, 4, 2), ob('boxes', 39, 2, 1), ob('rackc', 44, 3, 2)] },
    { theme: 'mall', objs: [ob('shoes', 13, 4, 1), ob('bench', 21, 3, 1), ob('shoes', 27, 4, 2), ob('cart', 35, 2, 1), ob('mannequin', 41, 1, 3), ob('plant', 47, 1, 1)] },
    { theme: 'food', objs: [ob('table', 14, 3, 1), ob('table', 21, 3, 1), ob('foodbar', 28, 5, 2), ob('table', 36, 3, 1), ob('trash', 43, 1, 1), ob('table', 47, 3, 1)] },
    { theme: 'mallF', objs: [ob('rackc', 14, 3, 2), ob('boxes', 21, 2, 2), ob('rackc', 27, 4, 2), ob('mannequin', 35, 1, 3), ob('rackc', 40, 3, 2), ob('boxes', 47, 2, 1)] }
  ], [ob('ac', 14, 3, 2), ob('tank', 22, 3, 2), ob('vent', 30, 1, 1), ob('ac', 36, 2, 2), ob('vent', 44, 1, 1)]);
}
function mapHospital() {
  return floorsMap([
    { theme: 'hospital', objs: [ob('reception', 12, 5, 2), ob('chair', 20, 3, 1), ob('plant', 25, 1, 2), ob('wheelchair', 30, 2, 1), ob('chair', 36, 3, 1), ob('vending', 42, 2, 2), ob('plant', 48, 1, 1)] },
    { theme: 'ward', objs: [ob('bed', 13, 4, 1), ob('drip', 19, 1, 2), ob('bed', 24, 4, 1), ob('cabinet', 31, 2, 2), ob('bed', 36, 4, 1), ob('drip', 42, 1, 2), ob('wheelchair', 46, 2, 1)] },
    { theme: 'lab', objs: [ob('labtable', 14, 5, 2), ob('scanner', 23, 4, 3), ob('cart', 31, 2, 1), ob('labtable', 36, 4, 2), ob('boxes', 43, 2, 1), ob('cabinet', 47, 2, 2)] },
    { theme: 'ward', objs: [ob('bed', 14, 4, 1), ob('cart', 21, 2, 1), ob('bed', 26, 4, 1), ob('drip', 33, 1, 2), ob('wheelchair', 37, 2, 1), ob('bed', 42, 4, 1)] }
  ], [ob('ac', 14, 3, 2), ob('tank', 22, 3, 2), ob('vent', 31, 1, 1), ob('ac', 38, 2, 2), ob('vent', 46, 1, 1)]);
}
function mapSchool() {
  return floorsMap([
    { theme: 'hall', objs: [ob('locker', 12, 4, 2), ob('bench', 19, 3, 1), ob('trophy', 25, 2, 2), ob('locker', 31, 4, 2), ob('bin', 38, 1, 1), ob('bench', 41, 3, 1), ob('plant', 47, 1, 1)] },
    { theme: 'class', objs: [ob('sdesk', 13, 2, 1), ob('sdesk', 17, 2, 1), ob('teacher', 24, 4, 2), ob('sdesk', 31, 2, 1), ob('sdesk', 35, 2, 1), ob('sdesk', 39, 2, 1), ob('bin', 46, 1, 1)] },
    { theme: 'music', objs: [ob('piano', 13, 4, 2), ob('stool', 19, 1, 1), ob('drums', 24, 3, 2), ob('chair', 30, 2, 1), ob('piano', 35, 4, 2), ob('boxes', 42, 2, 1), ob('chair', 47, 2, 1)] },
    { theme: 'gym', objs: [ob('mat', 13, 4, 1), ob('hoop', 20, 1, 3), ob('horse', 26, 3, 2), ob('ball', 33, 1, 1), ob('mat', 37, 4, 1), ob('horse', 44, 3, 2)] }
  ], [ob('ac', 15, 3, 2), ob('tank', 24, 3, 2), ob('vent', 33, 1, 1), ob('ac', 40, 2, 2)]);
}
function mapFactory() {
  return floorsMap([
    { theme: 'factory', belt: 1, objs: [ob('crate', 14, 2, 2), ob('barrel', 20, 1, 1), ob('crate', 26, 2, 1), ob('machine', 32, 4, 3), ob('crate', 40, 2, 2), ob('barrel', 46, 1, 1)] },
    { theme: 'factoryB', belt: -1, objs: [ob('machine', 13, 3, 2), ob('barrel', 20, 1, 1), ob('crate', 25, 2, 2), ob('barrel', 31, 1, 1), ob('machine', 36, 4, 3), ob('crate', 44, 2, 1)] },
    { theme: 'factory', belt: 1, objs: [ob('crate', 15, 2, 1), ob('machine', 21, 3, 2), ob('barrel', 28, 1, 2), ob('crate', 33, 3, 2), ob('barrel', 40, 1, 1), ob('machine', 44, 3, 2)] },
    { theme: 'factoryB', belt: -1, objs: [ob('barrel', 14, 1, 1), ob('machine', 19, 4, 3), ob('crate', 28, 2, 1), ob('barrel', 33, 1, 2), ob('crate', 38, 2, 2), ob('machine', 44, 3, 2)] }
  ], [ob('tank', 15, 3, 2), ob('vent', 24, 1, 1), ob('tank', 30, 3, 2), ob('ac', 40, 2, 2)]);
}

const MAPS = {
  office:  { name: '오피스 빌딩', desc: '층마다 책상과 가구를 넘어 옥상 헬기장까지', make: mapOffice, sky: ['#7fb6e8', '#c9e4f5'] },
  airport: { name: '공항',       desc: '체크인, 보안 검색, 무빙워크를 지나 비행기 문까지', make: mapAirport, sky: ['#f2a65a', '#ffd9a0'] },
  subway:  { name: '지하철역',   desc: '승강장에서 개찰구를 지나 출구 옥상까지', make: mapSubway, sky: ['#5a6a9a', '#a0b0d8'] },
  mall:    { name: '백화점',     desc: '다섯 층 매장과 푸드코트를 가로질러 옥상까지', make: mapMall, sky: ['#f08aa8', '#ffd6e0'] },
  hospital:{ name: '병원',       desc: '로비, 병동, 검사실의 침대와 휠체어를 넘어 옥상까지', make: mapHospital, sky: ['#7fd0c8', '#d8f5f0'] },
  school:  { name: '학교',       desc: '복도, 교실, 음악실, 체육관을 올라 옥상까지', make: mapSchool, sky: ['#7fb6e8', '#e8f3ff'] },
  factory: { name: '공장',       desc: '반대로 움직이는 컨베이어 벨트를 넘어 옥상까지', make: mapFactory, sky: ['#8a7a6a', '#d0b898'] }
};
const MAP_IDS = Object.keys(MAPS);

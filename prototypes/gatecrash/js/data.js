/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   데이터: 상수, 무기, 맵 */
'use strict';
const VERSION = '0.1', BUILD = 15;
const TS = 16;                                   // 타일 한 칸 (px)
const PH = { RUN: 120, ACC: 1500, AIR: 1000, G: 1500, JUMP: 410, CUT: 150, MAXF: 560, W: 10, H: 22, COY: 0.08, BUF: 0.12, BELT: 70, ICE: 180, LIFT: 200 };
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

/* 같은 맵은 언제나 같은 모양이어야 해서 시드 난수를 써요 */
function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* 층 구조 건물: F = 아래 층부터 [{ theme, objs, belt, conn: 'lift', g: ['ice','gap','mezz'] }]
   기믹: ice 미끄러운 바닥, gap 바닥 구멍(떨어지면 아래층), mezz 가구 위 선반, belt 컨베이어. conn 'lift' = 엘리베이터로 올라가요 */
const FW = 96;
function floorsMap(F, roof, seed) {
  const R = rng(seed), n = F.length, H = 6 * n + 6, b = Builder(FW, H), S = k => H - 1 - 6 * k;
  for (let k = 0; k <= n; k++) b.fill(0, S(k), FW - 1, S(k), '#');
  b.fill(0, S(n), 0, H - 1, '#'); b.fill(FW - 1, S(n), FW - 1, H - 1, '#');
  const place = (list, from, to, bottom, res, out) => {
    const pool = list.filter(o => o[0][0] !== '~'); if (!pool.length) return;
    let x = from + (R() * 3 | 0), bag = [];
    while (x < to) {
      if (!bag.length) { bag = pool.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = R() * (i + 1) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; } }
      const o = bag.pop(), w = o[2], hit = res.find(r => x + w + 1 >= r[0] && x - 1 <= r[1]);
      if (hit) { x = hit[1] + 2; continue; }
      if (x + w > to) break;
      b.obj(o[0], x, bottom, w, o[3]); out.push({ x, w, h: o[3] });
      x += w + 4 + (R() * 4 | 0);
    }
  };
  const free = (tx, row) => !isSolidC(b.g[row][tx]) && !isSolidC(b.g[row - 1][tx]) && b.g[row + 1][tx] === '#';
  F.forEach((f, i) => {
    const slab = S(i + 1), bottom = S(i) - 1, right = i % 2 === 0;
    b.room(1, slab + 1, FW - 2, bottom, f.theme);
    if (f.belt) b.fill(14, S(i), FW - 14, S(i), f.belt > 0 ? '>' : '<');
    const res = [], g = f.g || [];
    // 위층으로 가는 길
    if (f.conn === 'lift') {
      const hx = right ? FW - 9 : 5;
      b.fill(hx, slab, hx + 2, slab, '.');
      for (let y = slab - 2; y <= slab + 5; y++) b.fill(hx, y, hx + 2, y, 'U');
      b.deco('liftshaft', hx, slab + 5, 3, 8);
    } else if (right) { b.fill(FW - 10, slab, FW - 5, slab, '.'); b.fill(FW - 7, slab + 4, FW - 5, slab + 4, '='); b.fill(FW - 10, slab + 2, FW - 8, slab + 2, '='); b.deco('stairwell', FW - 10, slab + 5, 6, 6); }
    else { b.fill(4, slab, 9, slab, '.'); b.fill(4, slab + 4, 6, slab + 4, '='); b.fill(7, slab + 2, 9, slab + 2, '='); b.deco('stairwell', 4, slab + 5, 6, 6); }
    // 기믹 자리
    g.forEach((k, gi) => {
      const z0 = 20 + gi * 26, x0 = z0 + (R() * 8 | 0);
      if (k === 'ice') { b.fill(x0, S(i), x0 + 11, S(i), 'I'); res.push([x0 - 1, x0 + 12]); b.deco('cone', x0 - 1, bottom, 1, 1); }
      else if (k === 'gap' && i >= 1) { b.fill(x0, S(i), x0 + 2, S(i), '.'); res.push([x0 - 2, x0 + 5]); }
    });
    for (const o of f.objs) if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], bottom, o[2], o[3]);
    const placed = []; place(f.objs, 14, FW - 14, bottom, res, placed);
    if (g.includes('mezz')) {
      const c = placed.filter(o => o.h <= 2 && o.w <= 4);
      for (let k = 0, step = Math.max(1, c.length >> 1); k < c.length && k < 2 * step; k += step) {
        const o = c[k], row = bottom - 2; b.fill(o.x - 2, row, o.x + o.w + 1, row, '='); b.spawn(o.x + (o.w >> 1), row - 1);
      }
    }
    // 무기 자리: 바닥이 비어 있는 곳으로
    [0.2, 0.42, 0.62, 0.8].forEach(t => { let tx = Math.round(FW * t); for (let d = 0; d < 12; d++) { const hit = [tx - d, tx + d].find(q => q > 12 && q < FW - 12 && free(q, bottom)); if (hit !== undefined) { b.spawn(hit, bottom); break; } } });
  });
  b.deco('door', 1, S(0) - 1, 2, 4);
  const rb = S(n) - 1, rp = []; place(roof, 14, FW - 14, rb, [], rp); for (const o of roof) if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], rb, o[2], o[3]);
  const arriveRight = (n - 1) % 2 === 0;
  b.spawn(arriveRight ? FW - 24 : 24, rb); b.spawn(FW >> 1, rb);
  if (arriveRight) { b.deco('helipad', 1, rb, 9, 1); b.finish = { x0: 1, y0: rb - 4, x1: 8, y1: rb }; } else { b.deco('helipad', FW - 10, rb, 9, 1); b.finish = { x0: FW - 9, y0: rb - 4, x1: FW - 2, y1: rb }; }
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i) * TS + 3, y: (H - 1) * TS - PH.H });
  return b;
}
function isSolidC(c) { return c === '#' || c === 'x' || c === '>' || c === '<' || c === 'I'; }
const ob = (t, x, w, h) => [t, x, w, h];

function mapOffice() {
  return floorsMap([
    { theme: 'lobby', g: ['mezz'], objs: [ob('counter', 0, 4, 2), ob('plant', 0, 1, 1), ob('sofa', 0, 3, 1), ob('gate', 0, 1, 2), ob('bench', 0, 3, 1), ob('boxes', 0, 2, 1), ob('plant', 0, 1, 2)] },
    { theme: 'office', conn: 'lift', g: ['gap'], objs: [ob('desk', 0, 3, 1), ob('copier', 0, 2, 2), ob('cooler', 0, 1, 2), ob('chair', 0, 1, 1), ob('cabinet', 0, 2, 2), ob('desk', 0, 3, 1), ['~whiteboard', 40, 4, 2]] },
    { theme: 'cafe', g: ['ice', 'mezz'], objs: [ob('trash', 0, 1, 1), ob('table', 0, 3, 1), ob('vending', 0, 2, 2), ob('foodbar', 0, 4, 2), ob('table', 0, 3, 1)] },
    { theme: 'server', conn: 'lift', g: ['gap', 'mezz'], objs: [ob('rack', 0, 1, 2), ob('meeting', 0, 5, 1), ob('chair', 0, 1, 1), ob('boxes', 0, 2, 1), ob('rack', 0, 1, 2)] }
  ], [ob('ac', 0, 3, 2), ob('vent', 0, 1, 1), ob('tank', 0, 3, 2), ob('ac', 0, 2, 2), ['~antenna', 60, 1, 5]], 11);
}

/* 공항: 출국장 입구 → 체크인 카운터 → 보안 검색 → 면세점(미끄러운 바닥) → 에스컬레이터 → 무빙워크 → 탑승구 → 탑승교 → 비행기 문 */
function mapAirport() {
  const E1 = 22, E2 = 22, A = x => x + E1, B = x => x < 100 ? x + E1 : x + E1 + E2, W = B(140);
  const b = Builder(W, 22);
  b.fill(0, 0, B(120), 2, '#'); b.fill(0, 20, W - 1, 21, '#'); b.fill(A(69), 12, W - 1, 19, '#'); b.fill(0, 3, 0, 19, '#');
  b.fill(B(120), 3, B(120), 8, '#'); b.fill(B(121), 8, B(133), 8, '#');
  b.room(1, 3, A(68), 19, 'terminal'); b.room(A(69), 3, B(119), 11, 'gates'); b.room(B(121), 9, B(133), 11, 'bridge');
  b.deco('door', 1, 19, 3, 4);
  b.obj('luggage', 9, 19, 2, 1); b.obj('barrier', 13, 19, 1, 1); b.obj('barrier', 17, 19, 1, 1);
  b.obj('checkin', 21, 19, 3, 2); b.obj('checkin', 27, 19, 3, 2); b.obj('checkin', 33, 19, 3, 2);
  b.fill(21, 16, 35, 16, '='); b.deco('board', 22, 13, 12, 2);
  b.obj('barrier', 40, 19, 1, 1); b.obj('barrier', 43, 19, 1, 1);
  b.obj('xray', 47, 19, 3, 2); b.deco('detector', 51, 19, 1, 3); b.obj('bins', 53, 19, 3, 1); b.obj('plant', 57, 19, 1, 1);
  // 면세점 구간: 미끄러운 바닥과 진열대
  b.obj('shelf', 61, 19, 2, 2); b.obj('luggage', 66, 19, 2, 1); b.fill(70, 20, 81, 20, 'I'); b.deco('cone', 69, 19, 1, 1); b.obj('cart', 75, 19, 2, 1); b.obj('plant', 85, 19, 1, 2);
  b.fill(A(60), 18, A(62), 19, '#'); b.fill(A(63), 16, A(65), 19, '#'); b.fill(A(66), 14, A(68), 19, '#');
  b.deco('escalator', A(60), 19, 10, 8);
  b.spawn(10, 19); b.spawn(28, 15); b.spawn(44, 19); b.spawn(64, 19); b.spawn(86, 19); b.spawn(A(67), 13);
  // 2층 탑승구
  b.fill(A(73), 12, A(88), 12, '>'); b.obj('cart', A(79), 11, 2, 1);
  b.obj('shelf', A(92), 11, 2, 2); b.obj('shelf', A(97), 11, 2, 2);
  b.fill(A(101), 12, A(110), 12, 'I'); b.deco('cone', A(100), 11, 1, 1); b.obj('seats', A(104), 11, 3, 1); b.obj('plant', A(112), 11, 1, 1);
  b.fill(B(101), 12, B(107), 12, '>');
  b.obj('seats', B(109), 11, 3, 1); b.obj('seats', B(113), 11, 3, 1); b.obj('gatedesk', B(117), 11, 2, 1);
  b.spawn(A(90), 11); b.spawn(A(108), 11); b.spawn(B(108), 11);
  b.obj('luggage', B(125), 11, 1, 1); b.obj('cone', B(129), 11, 1, 1);
  b.deco('plane', B(133), 14, 7, 12);
  b.finish = { x0: B(134), y0: 9, x1: B(138), y1: 11 };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (4 + i) * TS + 3, y: 20 * TS - PH.H });
  return b;
}

function mapSubway() {
  return floorsMap([
    { theme: 'subwayB', conn: 'lift', g: ['ice'], objs: [ob('bench', 0, 3, 1), ob('trash', 0, 1, 1), ob('turnstile', 0, 1, 2), ob('turnstile', 0, 1, 2), ob('luggage', 0, 2, 1), ob('pillar', 0, 2, 3), ob('boxes', 0, 2, 1), ['~train', 14, 60, 3]] },
    { theme: 'subway', g: ['gap', 'mezz'], objs: [ob('ticket', 0, 3, 2), ob('plant', 0, 1, 1), ob('kiosk', 0, 3, 2), ob('luggage', 0, 2, 1), ob('bench', 0, 3, 1)] },
    { theme: 'subwayS', g: ['mezz'], objs: [ob('cart', 0, 2, 1), ob('barrier', 0, 1, 1), ob('news', 0, 2, 2), ob('bench', 0, 3, 1), ob('plant', 0, 1, 2), ob('boxes', 0, 2, 1)] }
  ], [ob('ac', 0, 3, 2), ob('vent', 0, 1, 1), ob('tank', 0, 3, 2), ob('ac', 0, 2, 2)], 23);
}
function mapMall() {
  return floorsMap([
    { theme: 'mall', conn: 'lift', g: ['mezz'], objs: [ob('fountain', 0, 5, 1), ob('plant', 0, 1, 2), ob('bench', 0, 3, 1), ob('cart', 0, 2, 1), ob('kiosk', 0, 3, 2)] },
    { theme: 'mallF', g: ['gap'], objs: [ob('mannequin', 0, 1, 3), ob('rackc', 0, 3, 2), ob('rackc', 0, 4, 2), ob('boxes', 0, 2, 1)] },
    { theme: 'mall', g: ['ice'], objs: [ob('shoes', 0, 4, 1), ob('bench', 0, 3, 1), ob('shoes', 0, 4, 2), ob('cart', 0, 2, 1), ob('mannequin', 0, 1, 3)] },
    { theme: 'food', conn: 'lift', g: ['mezz', 'gap'], objs: [ob('table', 0, 3, 1), ob('foodbar', 0, 5, 2), ob('trash', 0, 1, 1), ob('table', 0, 3, 1)] },
    { theme: 'mallF', g: ['ice'], objs: [ob('rackc', 0, 3, 2), ob('boxes', 0, 2, 2), ob('rackc', 0, 4, 2), ob('mannequin', 0, 1, 3)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ob('ac', 0, 2, 2)], 37);
}
function mapHospital() {
  return floorsMap([
    { theme: 'hospital', conn: 'lift', g: ['mezz'], objs: [ob('reception', 0, 5, 2), ob('chair', 0, 3, 1), ob('plant', 0, 1, 2), ob('wheelchair', 0, 2, 1), ob('vending', 0, 2, 2)] },
    { theme: 'ward', g: ['gap'], objs: [ob('bed', 0, 4, 1), ob('drip', 0, 1, 2), ob('cabinet', 0, 2, 2), ob('wheelchair', 0, 2, 1)] },
    { theme: 'lab', conn: 'lift', g: ['ice'], objs: [ob('labtable', 0, 5, 2), ob('scanner', 0, 4, 3), ob('cart', 0, 2, 1), ob('boxes', 0, 2, 1), ob('cabinet', 0, 2, 2)] },
    { theme: 'ward', g: ['mezz'], objs: [ob('bed', 0, 4, 1), ob('cart', 0, 2, 1), ob('drip', 0, 1, 2), ob('wheelchair', 0, 2, 1)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ob('ac', 0, 2, 2)], 41);
}
function mapSchool() {
  return floorsMap([
    { theme: 'hall', g: ['ice'], objs: [ob('locker', 0, 4, 2), ob('bench', 0, 3, 1), ob('trophy', 0, 2, 2), ob('bin', 0, 1, 1), ob('plant', 0, 1, 1)] },
    { theme: 'class', conn: 'lift', g: ['mezz', 'gap'], objs: [ob('sdesk', 0, 2, 1), ob('sdesk', 0, 2, 1), ob('teacher', 0, 4, 2), ob('sdesk', 0, 2, 1), ob('bin', 0, 1, 1)] },
    { theme: 'music', g: ['mezz'], objs: [ob('piano', 0, 4, 2), ob('stool', 0, 1, 1), ob('drums', 0, 3, 2), ob('chair', 0, 2, 1), ob('boxes', 0, 2, 1)] },
    { theme: 'gym', g: ['ice'], objs: [ob('mat', 0, 4, 1), ob('hoop', 0, 1, 3), ob('horse', 0, 3, 2), ob('ball', 0, 1, 1)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ob('ac', 0, 2, 2)], 53);
}
function mapFactory() {
  return floorsMap([
    { theme: 'factory', belt: 1, g: ['gap'], objs: [ob('crate', 0, 2, 2), ob('barrel', 0, 1, 1), ob('crate', 0, 2, 1), ob('machine', 0, 4, 3)] },
    { theme: 'factoryB', belt: -1, conn: 'lift', g: ['mezz'], objs: [ob('machine', 0, 3, 2), ob('barrel', 0, 1, 1), ob('crate', 0, 2, 2), ob('machine', 0, 4, 3)] },
    { theme: 'factory', belt: 1, g: ['gap'], objs: [ob('crate', 0, 2, 1), ob('machine', 0, 3, 2), ob('barrel', 0, 1, 2), ob('crate', 0, 3, 2)] },
    { theme: 'factoryB', belt: -1, g: ['mezz'], objs: [ob('barrel', 0, 1, 1), ob('machine', 0, 4, 3), ob('crate', 0, 2, 1), ob('barrel', 0, 1, 2)] }
  ], [ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ob('tank', 0, 3, 2), ob('ac', 0, 2, 2)], 67);
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

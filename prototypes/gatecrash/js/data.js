/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   데이터: 상수, 무기, 맵 */
'use strict';
const VERSION = '0.1', BUILD = 26;
const TS = 16;                                   // 타일 한 칸 (px)
const PH = { RUN: 120, ACC: 1500, AIR: 1000, G: 1500, JUMP: 440, CUT: 300, MAXF: 560, W: 10, H: 22, COY: 0.08, BUF: 0.12, BELT: 70, ICE: 180, LIFT: 130 };
const MAX_HP = 100, RACERS = 4;
const COLORS = ['#e8483b', '#3b8de8', '#3fbf5a', '#f2b632', '#a65be0', '#f07ab8', '#2cc4c4', '#f0f0f0'];

/* 무기: 클릭으로 써요. uses = 쓸 수 있는 횟수 */
const WEAPONS = {
  bat:     { name: '야구 방망이', kind: 'melee',  dmg: 20, kb: 300, up: 170, cd: 0.55, uses: 12, range: 24, stun: 0.35 },
  pan:     { name: '프라이팬',   kind: 'melee',  dmg: 14, kb: 170, up: 120, cd: 0.45, uses: 14, range: 20, stun: 0.9 },
  pistol:  { name: '고무탄 권총', kind: 'shot',   dmg: 10, kb: 190, up: 90,  cd: 0.32, uses: 10, speed: 430, life: 0.8, stun: 0.25, reach: 220 },
  ext:     { name: '소화기',     kind: 'spray',  dmg: 3,  kb: 110, up: 40,  cd: 0.12, uses: 30, speed: 260, life: 0.32, stun: 0.15, recoil: 45, reach: 80 },
  bazooka: { name: '바주카',     kind: 'rocket', dmg: 28, kb: 380, up: 240, cd: 1.1,  uses: 3,  speed: 280, life: 2.5, radius: 44, stun: 0.5, reach: 230 },
  hammer:  { name: '해머',       kind: 'melee',  dmg: 30, kb: 430, up: 210, cd: 0.95, uses: 8,  range: 22, stun: 0.6 },
  mop:     { name: '대걸레',     kind: 'melee',  dmg: 8,  kb: 150, up: 100, cd: 0.32, uses: 18, range: 34, stun: 0.7 },
  sling:   { name: '새총',       kind: 'shot',   dmg: 6,  kb: 120, up: 60,  cd: 0.17, uses: 26, speed: 540, life: 0.7, stun: 0.15, reach: 210 },
  hose:    { name: '소방 호스',   kind: 'spray',  dmg: 2,  kb: 230, up: 30,  cd: 0.08, uses: 40, speed: 300, life: 0.3, stun: 0.1, recoil: 90, reach: 90 },
  banana:  { name: '바나나 껍질', kind: 'trap',   dmg: 0,  kb: 0,   up: 0,   cd: 0.5,  uses: 3,  stun: 1.0 },
  shotgun: { name: '산탄총',     kind: 'shot',   dmg: 7,  kb: 150, up: 80,  cd: 0.9,  uses: 8,  speed: 400, life: 0.35, stun: 0.3, reach: 130, n: 5, spread: 0.5 },
  bow:     { name: '장난감 활',   kind: 'shot',   dmg: 17, kb: 230, up: 110, cd: 0.8,  uses: 9,  speed: 360, life: 1.1, stun: 0.4, reach: 260 },
  minigun: { name: '장난감 기관총', kind: 'shot',  dmg: 3,  kb: 70,  up: 30,  cd: 0.07, uses: 45, speed: 480, life: 0.55, stun: 0.1, reach: 190, spread: 0.12 },
  firework:{ name: '폭죽 발사기', kind: 'rocket', dmg: 16, kb: 300, up: 200, cd: 0.7,  uses: 6,  speed: 340, life: 1.6, radius: 30, stun: 0.4, reach: 200 }
};
const WEP_IDS = Object.keys(WEAPONS);

/* 스킨: 능력치는 그대로, gC로 사서 입어요 */
const SKINS = {
  ears:   { name: '고양이 귀', cost: 300 },
  bunny:  { name: '토끼 귀',   cost: 350 },
  shades: { name: '선글라스',   cost: 200 },
  helm:   { name: '안전모',     cost: 400 },
  ninja:  { name: '닌자 복면',   cost: 500 },
  cape:   { name: '붉은 망토',   cost: 600 },
  halo:   { name: '천사 링',     cost: 700 },
  crown:  { name: '왕관',       cost: 800 },
  gold:   { name: '황금 옷',     cost: 1500 }
};
const GC_PRIZE = [40, 25, 15, 10];               // 1등부터 받는 gC (봇과 연습은 절반)

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
const FW = 172;
/* 가구를 일정한 간격으로 늘어놓아요 (res 안쪽은 비워 둬요) */
function placeRun(b, R, list, from, to, bottom, res, out) {
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
}
function mezzOn(b, placed, bottom, every) {
  const c = placed.filter(o => o.h <= 2 && o.w <= 4);
  for (let k = 0; k < c.length; k += every) { const o = c[k], row = bottom - 2; b.fill(o.x - 2, row, o.x + o.w + 1, row, '='); b.spawn(o.x + (o.w >> 1), row - 1); }
}
function freeSpot(b, tx, row) { return !isSolidC(b.g[row][tx]) && !isSolidC(b.g[row - 1][tx]) && b.g[row + 1][tx] === '#'; }
function itemSpots(b, from, to, bottom, n) {
  for (let k = 0; k < n; k++) { const t = from + (to - from) * (k + 0.5) / n | 0; for (let d = 0; d < 12; d++) { const hit = [t - d, t + d].find(q => q > from && q < to && freeSpot(b, q, bottom)); if (hit !== undefined) { b.spawn(hit, bottom); break; } } }
}

/* 층 구조 건물: F = 아래 층부터 [{ theme, objs, belt, conn: 'lift', g: ['ice','gap','mezz'] }]
   층마다 위로 가는 길의 위치가 달라요 (왼쪽 끝, 가운데, 오른쪽 끝). 어떤 층은 길이 둘이라 골라서 갈 수 있어요.
   기믹: ice 미끄러운 바닥, gap 바닥 구멍(떨어지면 아래층), mezz 가구 위 선반, belt 컨베이어 */
function floorsMap(F, roof, seed) {
  const R = rng(seed), n = F.length, H = 6 * n + 6, b = Builder(FW, H), S = k => H - 1 - 6 * k;
  for (let k = 0; k <= n; k++) b.fill(0, S(k), FW - 1, S(k), '#');
  b.fill(0, S(n), 0, H - 1, '#'); b.fill(FW - 1, S(n), FW - 1, H - 1, '#');
  F.forEach((f, i) => { if (f.belt) b.fill(14, S(i), FW - 14, S(i), f.belt > 0 ? '>' : '<'); });   // 길(구멍)을 나중에 뚫어야 해서 무빙워크를 먼저 깔아요
  // 위로 가는 길 위치: 앞 층에서 올라온 자리에서 멀리 떨어뜨려요
  const POS = [10, FW * .28 | 0, FW * .5 | 0, FW * .72 | 0, FW - 18]; let prev = [8]; const conn = [];
  F.forEach((f, i) => {
    const far = (x, m) => prev.every(p => Math.abs(p - x) >= (m || 40)), cand = POS.filter(x => far(x)), x1 = cand.length ? cand[R() * cand.length | 0] : POS.slice().sort((a, c) => Math.min(...prev.map(p => Math.abs(c - p))) - Math.min(...prev.map(p => Math.abs(a - p))))[0];
    const list = [{ x: x1, kind: f.conn === 'lift' ? 'lift' : 'stairs', mir: R() < .5 }];
    if (R() < .45) { const c2 = POS.filter(x => far(x) && Math.abs(x - x1) >= 28); if (c2.length) list.push({ x: c2[R() * c2.length | 0], kind: f.conn === 'lift' ? 'stairs' : 'lift', mir: R() < .5 }); }
    conn.push(list); prev = list.map(c => c.x);
  });
  F.forEach((f, i) => {
    const slab = S(i + 1), bottom = S(i) - 1, res = [], g = (f.g || []).slice();
    b.room(1, slab + 1, FW - 2, bottom, f.theme);
    const arrive = i ? conn[i - 1].map(c => c.x) : [];
    for (const x of arrive) res.push([x - 2, x + 9]);
    for (const c of conn[i]) {
      const x = c.x; res.push([x - 2, x + 9]);
      if (c.kind === 'lift') {
        b.fill(x, slab, x + 2, slab, '=');
        for (let y = slab - 4; y <= slab + 5; y++) b.fill(x, y, x + 2, y, 'U');
        b.deco('liftshaft', x, slab + 5, 3, 10);
      } else {
        b.fill(x, slab, x + 5, slab, '=');
        if (x < FW / 2) { b.fill(x, slab + 4, x + 2, slab + 4, '='); b.fill(x + 3, slab + 2, x + 5, slab + 2, '='); }
        else { b.fill(x + 3, slab + 4, x + 5, slab + 4, '='); b.fill(x, slab + 2, x + 2, slab + 2, '='); }
        b.deco('stairwell', x, slab + 5, 6, 6);
      }
    }
    const GA = ['ice', 'gap', 'mezz'];
    for (let q = 0; g.length < 3 && q < 3; q++) { const k = GA[(i + seed + q) % 3]; if (!g.includes(k)) g.push(k); }
    for (const k of g) {
      const pit = k === 'gap' && (i + seed) % 2 === 0, len = k === 'ice' ? 12 : pit ? 9 : 3;
      if (k === 'mezz' || (k === 'gap' && i < 1)) continue;
      for (let t = 0; t < 14; t++) {
        const x0 = 18 + (R() * (FW - 36 - len) | 0);
        if (res.some(r => x0 + len + 2 >= r[0] && x0 - 2 <= r[1])) continue;
        if (k === 'ice') { b.fill(x0, S(i), x0 + 11, S(i), 'I'); res.push([x0 - 1, x0 + 12]); b.deco('cone', x0 - 1, bottom, 1, 1); }
        else if (pit) { b.fill(x0, S(i), x0 + 8, S(i), '.'); b.fill(x0 + 2, S(i) - 1, x0 + 3, S(i) - 1, '='); b.fill(x0 + 5, S(i) - 1, x0 + 6, S(i) - 1, '='); res.push([x0 - 2, x0 + 11]); }   // 파쿠르: 징검다리 구덩이
        else { b.fill(x0, S(i), x0 + 2, S(i), '.'); res.push([x0 - 2, x0 + 5]); }
        break;
      }
    }
    for (const o of f.objs) if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], bottom, o[2], o[3]);
    const placed = []; placeRun(b, R, f.objs, 14, FW - 14, bottom, res, placed);
    if (g.includes('mezz')) mezzOn(b, placed, bottom, Math.max(1, placed.length >> 1));
    itemSpots(b, 12, FW - 12, bottom, 4);
  });
  b.deco('door', 1, S(0) - 1, 2, 4);
  const rb = S(n) - 1, rp = [], last = conn[n - 1].map(c => c.x), lres = last.map(x => [x - 2, x + 9]);
  placeRun(b, R, roof, 14, FW - 14, rb, lres, rp); for (const o of roof) if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], rb, o[2], o[3]);
  const goalLeft = Math.min(...last) > FW / 2;
  b.spawn(goalLeft ? FW - 24 : 24, rb); b.spawn(FW >> 1, rb);
  if (goalLeft) { b.deco('helipad', 1, rb, 9, 1); b.finish = { x0: 1, y0: rb - 4, x1: 8, y1: rb }; } else { b.deco('helipad', FW - 10, rb, 9, 1); b.finish = { x0: FW - 9, y0: rb - 4, x1: FW - 2, y1: rb }; }
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i) * TS + 3, y: (H - 1) * TS - PH.H });
  return b;
}

/* 가로로 긴 맵: 낮은 길과 높은 길(단상)을 오르내리며 달려요
   segs: { k:'run', lvl:0|1, len, theme, objs, g:['ice','belt','mezz'] }, { k:'up', how:'steps'|'lift' }, { k:'down' } */
function longMap(segs, goal, seed) {
  const R = rng(seed), H = 22;
  let W = 16; for (const s of segs) W += s.k === 'run' ? s.len : s.k === 'up' ? (s.how === 'lift' ? 8 : 10) : 2; W += 12;
  const b = Builder(W, H);
  b.fill(0, 0, W - 1, 2, '#'); b.fill(0, 20, W - 1, 21, '#'); b.fill(0, 3, 0, 19, '#'); b.fill(W - 1, 3, W - 1, 19, '#');
  b.deco('door', 1, 19, 3, 4);
  let x = 14, lvl = 0, firstTheme = segs[0].theme;
  b.room(1, 3, 13, 19, firstTheme);
  segs.forEach(s => {
    if (s.k === 'up') {
      if (s.how === 'lift') {
        for (let y = 8; y <= 19; y++) b.fill(x, y, x + 2, y, 'U'); b.deco('liftshaft', x, 19, 3, 12); b.fill(x + 3, 12, x + 7, 19, '#'); x += 8;
      } else { b.fill(x, 18, x + 2, 19, '#'); b.fill(x + 3, 16, x + 5, 19, '#'); b.fill(x + 6, 14, x + 8, 19, '#'); b.fill(x + 9, 12, x + 9, 19, '#'); b.deco('stairwell', x, 19, 10, 8); x += 10; }
      b.room(x - (s.how === 'lift' ? 8 : 10), 3, x - 1, 11, s.theme || segs[0].theme); lvl = 1; return;
    }
    if (s.k === 'down') { b.room(x, 3, x + 1, 19, s.theme || segs[0].theme); x += 2; lvl = 0; return; }
    const x1 = x + s.len - 1, bottom = lvl ? 11 : 19, top = lvl ? 12 : 20, res = [];
    if (lvl) b.fill(x, 12, x1, 19, '#');
    b.room(x, 3, x1, bottom, s.theme);
    const g = s.g || [];
    if (g.includes('belt')) { const bx = x + 14 + (R() * Math.max(1, s.len - 44) | 0); b.fill(bx, top, bx + 14, top, R() < .5 ? '>' : '<'); res.push([bx - 1, bx + 15]); }
    if (g.includes('ice')) { const ix = x + 18 + (R() * Math.max(1, s.len - 50) | 0); if (!res.some(r => ix + 14 >= r[0] && ix - 2 <= r[1])) { b.fill(ix, top, ix + 11, top, 'I'); res.push([ix - 1, ix + 12]); b.deco('cone', ix - 1, bottom, 1, 1); } }
    for (const o of s.objs) if (o[0][0] === '~') b.deco(o[0].slice(1), x + o[1], bottom, o[2], o[3]);
    if (s.len >= 70) { const hx = x + 20 + (R() * (s.len - 56) | 0); if (!res.some(r => hx + 24 >= r[0] && hx <= r[1])) { [1, 2, 3, 2, 1].forEach((hh, n) => b.obj('boxes', hx + n * 5, bottom, 2, hh)); res.push([hx - 2, hx + 24]); } }   // 파쿠르: 점점 높아지는 상자 넘기
    const placed = []; placeRun(b, R, s.objs, x + 5, x1 - 4, bottom, res, placed);
    if (g.includes('mezz')) mezzOn(b, placed, bottom, Math.max(1, placed.length >> 2));
    itemSpots(b, x + 3, x1 - 3, bottom, Math.max(2, s.len / 22 | 0));
    x += s.len;
  });
  if (lvl) b.fill(x, 12, W - 2, 19, '#');
  b.room(x, 3, W - 2, lvl ? 11 : 19, segs[segs.length - 1].theme);
  b.deco(goal || 'door', W - 5, lvl ? 11 : 19, 3, 4);
  b.finish = lvl ? { x0: W - 8, y0: 9, x1: W - 2, y1: 11 } : { x0: W - 8, y0: 17, x1: W - 2, y1: 19 };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i) * TS + 3, y: 20 * TS - PH.H });
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
  const E1 = 100, E2 = 90, A = x => x + E1, B = x => x < 100 ? x + E1 : x + E1 + E2, W = B(140), R = rng(97);
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
  // 면세점 거리: 진열대, 미끄러운 바닥, 바닥 구멍은 없고 선반 위 지름길만
  const run = (list, from, to, bottom, res, out) => { let x = from, bag = []; while (x < to) { if (!bag.length) { bag = list.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = R() * (i + 1) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; } } const o = bag.pop(), hit = res.find(r => x + o[1] + 1 >= r[0] && x - 1 <= r[1]); if (hit) { x = hit[1] + 2; continue; } if (x + o[1] > to) break; b.obj(o[0], x, bottom, o[1], o[2]); out.push({ x, w: o[1], h: o[2] }); x += o[1] + 4 + (R() * 4 | 0); } };
  const shop = [['shelf', 2, 2], ['luggage', 2, 1], ['cart', 2, 1], ['plant', 1, 2], ['barrier', 1, 1], ['bins', 3, 1], ['seats', 3, 1]];
  const res1 = []; b.fill(78, 20, 89, 20, 'I'); res1.push([77, 90]); b.deco('cone', 76, 19, 1, 1); b.fill(128, 20, 141, 20, 'I'); res1.push([127, 142]); b.deco('cone', 126, 19, 1, 1);
  const p1 = []; run(shop, 60, A(58), 19, res1, p1);
  for (let k = 0, c = p1.filter(o => o.h <= 2 && o.w <= 3); k < c.length; k += 4) { const o = c[k], row = 17; b.fill(o.x - 2, row, o.x + o.w + 1, row, '='); b.spawn(o.x + (o.w >> 1), row - 1); }
  b.fill(A(60), 18, A(62), 19, '#'); b.fill(A(63), 16, A(65), 19, '#'); b.fill(A(66), 14, A(68), 19, '#');
  b.deco('escalator', A(60), 19, 10, 8);
  [10, 28, 44, 70, 100, 125, 150].forEach(x => b.spawn(x, x === 28 ? 15 : 19)); b.spawn(A(67), 13);
  // 2층 탑승구
  b.fill(A(73), 12, A(88), 12, '>'); b.obj('cart', A(79), 11, 2, 1);
  b.obj('shelf', A(92), 11, 2, 2); b.obj('shelf', A(97), 11, 2, 2);
  const gate = [['seats', 3, 1], ['cart', 2, 1], ['plant', 1, 1], ['shelf', 2, 2], ['luggage', 2, 1], ['barrier', 1, 1]];
  const res2 = []; b.fill(A(112), 12, A(123), 12, 'I'); res2.push([A(111), A(124)]); b.deco('cone', A(110), 11, 1, 1);
  b.fill(A(140), 12, A(152), 12, '>'); res2.push([A(139), A(153)]);
  b.fill(A(168), 12, A(180), 12, 'I'); res2.push([A(167), A(181)]);
  const p2 = []; run(gate, A(101), A(100) + E2 - 4, 11, res2, p2);
  for (let k = 0, c = p2.filter(o => o.h <= 2 && o.w <= 3); k < c.length; k += 3) { const o = c[k], row = 9; b.fill(o.x - 2, row, o.x + o.w + 1, row, '='); b.spawn(o.x + (o.w >> 1), row - 1); }
  b.fill(B(101), 12, B(107), 12, '>');
  b.obj('seats', B(109), 11, 3, 1); b.obj('seats', B(113), 11, 3, 1); b.obj('gatedesk', B(117), 11, 2, 1);
  b.spawn(A(90), 11); b.spawn(A(108), 11); b.spawn(B(108), 11); b.spawn(A(150), 11);
  b.obj('luggage', B(125), 11, 1, 1); b.obj('cone', B(129), 11, 1, 1);
  b.deco('plane', B(133), 14, 7, 12);
  b.finish = { x0: B(134), y0: 9, x1: B(138), y1: 11 };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (4 + i) * TS + 3, y: 20 * TS - PH.H });
  return b;
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

function mapHotel() {
  return floorsMap([
    { theme: 'hotelL', conn: 'lift', objs: [ob('reception', 0, 5, 2), ob('luggage', 0, 2, 1), ob('sofa', 0, 3, 1), ob('plant', 0, 1, 2), ob('trolley', 0, 3, 2), ob('pillar', 0, 2, 3)] },
    { theme: 'hotelR', g: ['gap'], objs: [ob('bed', 0, 4, 1), ob('minibar', 0, 2, 2), ob('sofa', 0, 3, 1), ob('luggage', 0, 2, 1), ob('plant', 0, 1, 2)] },
    { theme: 'ballroom', conn: 'lift', g: ['ice'], objs: [ob('piano', 0, 4, 2), ob('table', 0, 3, 1), ob('cake', 0, 3, 2), ob('table', 0, 3, 1), ob('plant', 0, 1, 2)] },
    { theme: 'pool', g: ['mezz'], objs: [ob('chaise', 0, 3, 1), ob('parasol', 0, 1, 3), ob('chaise', 0, 3, 1), ob('towels', 0, 2, 1), ob('cooler', 0, 1, 2)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ['~antenna', 70, 1, 5]], 71);
}
function mapLibrary() {
  return floorsMap([
    { theme: 'lib', g: ['mezz'], objs: [ob('shelfb', 0, 3, 3), ob('desk', 0, 3, 1), ob('globe', 0, 1, 2), ob('shelfb', 0, 4, 3), ob('chair', 0, 1, 1)] },
    { theme: 'libR', conn: 'lift', g: ['gap'], objs: [ob('desk', 0, 3, 1), ob('lamp', 0, 1, 3), ob('desk', 0, 3, 1), ob('shelfb', 0, 3, 3), ob('boxes', 0, 2, 1)] },
    { theme: 'archive', g: ['ice'], objs: [ob('cabinet', 0, 2, 2), ob('cart', 0, 2, 1), ob('shelfb', 0, 4, 3), ob('boxes', 0, 2, 2), ob('scroll', 0, 2, 1)] },
    { theme: 'lib', conn: 'lift', g: ['mezz', 'gap'], objs: [ob('shelfb', 0, 3, 3), ob('globe', 0, 1, 2), ob('desk', 0, 3, 1), ob('lamp', 0, 1, 3), ob('shelfb', 0, 4, 3)] }
  ], [ob('ac', 0, 3, 2), ob('vent', 0, 1, 1), ob('tank', 0, 3, 2), ob('ac', 0, 2, 2)], 83);
}
function mapStudio() {
  return floorsMap([
    { theme: 'studio', objs: [ob('camera', 0, 2, 3), ob('spot', 0, 1, 3), ob('desk', 0, 3, 1), ob('sofa', 0, 3, 1), ob('cable', 0, 2, 1)] },
    { theme: 'control', conn: 'lift', g: ['gap'], objs: [ob('mixer', 0, 4, 2), ob('rack', 0, 1, 2), ob('chair', 0, 1, 1), ob('mixer', 0, 3, 2), ob('boxes', 0, 2, 1)] },
    { theme: 'makeup', g: ['ice', 'mezz'], objs: [ob('mirror', 0, 3, 2), ob('chair', 0, 1, 1), ob('rackc', 0, 3, 2), ob('mirror', 0, 3, 2), ob('plant', 0, 1, 2)] },
    { theme: 'studio', conn: 'lift', g: ['gap'], objs: [ob('spot', 0, 1, 3), ob('cable', 0, 2, 1), ob('camera', 0, 2, 3), ob('desk', 0, 3, 1), ob('cooler', 0, 1, 2)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ['~antenna', 60, 1, 5]], 113);
}

function mapSubway() {
  return longMap([
    { k: 'run', lvl: 0, len: 90, theme: 'subwayB', g: ['ice'], objs: [ob('bench', 0, 3, 1), ob('trash', 0, 1, 1), ob('luggage', 0, 2, 1), ob('pillar', 0, 2, 3), ob('boxes', 0, 2, 1), ob('turnstile', 0, 1, 2), ['~train', 10, 60, 3]] },
    { k: 'up', how: 'steps', theme: 'subway' },
    { k: 'run', lvl: 1, len: 100, theme: 'subway', g: ['belt', 'mezz'], objs: [ob('ticket', 0, 3, 2), ob('plant', 0, 1, 1), ob('kiosk', 0, 3, 2), ob('luggage', 0, 2, 1), ob('bench', 0, 3, 1), ob('news', 0, 2, 2)] },
    { k: 'down', theme: 'subwayS' },
    { k: 'run', lvl: 0, len: 80, theme: 'subwayS', g: ['ice', 'mezz'], objs: [ob('cart', 0, 2, 1), ob('barrier', 0, 1, 1), ob('pillar', 0, 2, 3), ob('boxes', 0, 2, 2), ob('bench', 0, 3, 1)] },
    { k: 'up', how: 'lift', theme: 'subway' },
    { k: 'run', lvl: 1, len: 70, theme: 'subway', g: ['belt'], objs: [ob('kiosk', 0, 3, 2), ob('plant', 0, 1, 2), ob('ticket', 0, 3, 2), ob('bench', 0, 3, 1)] }
  ], 'stairwell', 23);
}
function mapMuseum() {
  return longMap([
    { k: 'run', lvl: 0, len: 80, theme: 'muse', objs: [ob('statue', 0, 2, 3), ob('bench', 0, 3, 1), ob('vitrine', 0, 3, 2), ob('plant', 0, 1, 2), ob('statue', 0, 2, 3)] },
    { k: 'up', how: 'steps', theme: 'museD' },
    { k: 'run', lvl: 1, len: 110, theme: 'museD', g: ['mezz', 'belt'], objs: [ob('bones', 0, 6, 3), ob('rope', 0, 1, 1), ob('vitrine', 0, 3, 2), ob('rock', 0, 2, 1), ob('rope', 0, 1, 1)] },
    { k: 'down', theme: 'museA' },
    { k: 'run', lvl: 0, len: 90, theme: 'museA', g: ['ice', 'mezz'], objs: [ob('easel', 0, 2, 3), ob('bench', 0, 3, 1), ob('vitrine', 0, 3, 2), ob('easel', 0, 2, 3), ob('plant', 0, 1, 1)] },
    { k: 'up', how: 'lift', theme: 'museS' },
    { k: 'run', lvl: 1, len: 80, theme: 'museS', g: ['mezz'], objs: [ob('rocket', 0, 2, 3), ob('moon', 0, 3, 1), ob('vitrine', 0, 3, 2), ob('globe', 0, 1, 2), ob('bench', 0, 3, 1)] }
  ], 'door', 97);
}
function mapStadium() {
  return longMap([
    { k: 'run', lvl: 0, len: 90, theme: 'arena', g: ['ice'], objs: [ob('turnstile', 0, 1, 2), ob('hotdog', 0, 3, 2), ob('bench', 0, 3, 1), ob('banner', 0, 1, 3), ob('trash', 0, 1, 1)] },
    { k: 'up', how: 'lift', theme: 'press' },
    { k: 'run', lvl: 1, len: 110, theme: 'press', g: ['belt', 'mezz'], objs: [ob('desk', 0, 3, 1), ob('camera', 0, 2, 3), ob('cooler', 0, 1, 2), ob('chair', 0, 1, 1), ob('banner', 0, 1, 3)] },
    { k: 'down', theme: 'lockerR' },
    { k: 'run', lvl: 0, len: 80, theme: 'lockerR', g: ['ice', 'mezz'], objs: [ob('locker', 0, 4, 2), ob('bench', 0, 3, 1), ob('ball', 0, 1, 1), ob('locker', 0, 3, 2), ob('boxes', 0, 2, 1)] },
    { k: 'up', how: 'steps', theme: 'vip' },
    { k: 'run', lvl: 1, len: 70, theme: 'vip', g: ['mezz'], objs: [ob('sofa', 0, 3, 1), ob('trophy', 0, 2, 2), ob('table', 0, 3, 1), ob('plant', 0, 1, 2)] }
  ], 'door', 103);
}

const MAPS = {
  office:  { name: '오피스 빌딩', desc: '층마다 책상과 가구를 넘어 옥상 헬기장까지', make: mapOffice, sky: ['#7fb6e8', '#c9e4f5'] },
  airport: { name: '공항',       desc: '체크인, 보안 검색, 무빙워크를 지나 비행기 문까지', make: mapAirport, sky: ['#f2a65a', '#ffd9a0'] },
  subway:  { name: '지하철역',   desc: '승강장에서 개찰구를 지나 출구 옥상까지', make: mapSubway, sky: ['#5a6a9a', '#a0b0d8'] },
  mall:    { name: '백화점',     desc: '다섯 층 매장과 푸드코트를 가로질러 옥상까지', make: mapMall, sky: ['#f08aa8', '#ffd6e0'] },
  hospital:{ name: '병원',       desc: '로비, 병동, 검사실의 침대와 휠체어를 넘어 옥상까지', make: mapHospital, sky: ['#7fd0c8', '#d8f5f0'] },
  school:  { name: '학교',       desc: '복도, 교실, 음악실, 체육관을 올라 옥상까지', make: mapSchool, sky: ['#7fb6e8', '#e8f3ff'] },
  hotel:   { name: '호텔',       desc: '로비, 객실, 연회장, 수영장 옥상까지', make: mapHotel, sky: ['#6aa0e0', '#f4d8b0'] },
  library: { name: '도서관',     desc: '높은 책장과 서고를 지나 옥상 서재까지', make: mapLibrary, sky: ['#b09ad8', '#f0e0c8'] },
  museum:  { name: '박물관',     desc: '조각상, 공룡 뼈, 우주관을 지나 옥상까지', make: mapMuseum, sky: ['#88a8c8', '#e8e0d0'] },
  stadium: { name: '경기장',     desc: '매표소, 라커룸, 중계석을 올라 귀빈석까지', make: mapStadium, sky: ['#4a78c0', '#a8d0f0'] },
  studio:  { name: '방송국',     desc: '스튜디오와 조정실을 지나 송신탑까지', make: mapStudio, sky: ['#3a3a6a', '#8a7ab0'] },
  factory: { name: '공장',       desc: '반대로 움직이는 컨베이어 벨트를 넘어 옥상까지', make: mapFactory, sky: ['#8a7a6a', '#d0b898'] }
};
const MAP_IDS = Object.keys(MAPS);

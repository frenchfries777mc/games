/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   데이터: 상수, 무기, 맵 */
'use strict';
const VERSION = '0.1', BUILD = 41;
const TS = 16;                                   // 타일 한 칸 (px)
const PH = { RUN: 120, ACC: 1500, AIR: 1000, G: 1500, JUMP: 440, CUT: 400, MAXF: 560, W: 10, H: 22, COY: 0.08, BUF: 0.12, BELT: 70, ICE: 180, LIFT: 130, PAD: 600 };
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
  tack:    { name: '압정',       kind: 'trap',   dmg: 8,  kb: 140, up: 170, cd: 0.5,  uses: 3,  stun: 0.55 },
  glue:    { name: '끈끈이',     kind: 'trap',   dmg: 0,  kb: 0,   up: 0,   cd: 0.5,  uses: 2,  stun: 0, slow: 2.0 },
  boots:   { name: '로켓 신발',   kind: 'boost',  dmg: 0,  kb: 0,   up: 0,   cd: 0.3,  uses: 1,  stun: 0, dur: 3 },
  shotgun: { name: '산탄총',     kind: 'shot',   dmg: 7,  kb: 150, up: 80,  cd: 0.9,  uses: 8,  speed: 400, life: 0.35, stun: 0.3, reach: 130, n: 5, spread: 0.5 },
  bow:     { name: '장난감 활',   kind: 'shot',   dmg: 17, kb: 230, up: 110, cd: 0.8,  uses: 9,  speed: 360, life: 1.1, stun: 0.4, reach: 260 },
  minigun: { name: '장난감 기관총', kind: 'shot',  dmg: 3,  kb: 70,  up: 30,  cd: 0.07, uses: 45, speed: 480, life: 0.55, stun: 0.1, reach: 190, spread: 0.12 },
  firework:{ name: '폭죽 발사기', kind: 'rocket', dmg: 16, kb: 300, up: 200, cd: 0.7,  uses: 6,  speed: 340, life: 1.6, radius: 30, stun: 0.4, reach: 200 }
};
const WEP_IDS = Object.keys(WEAPONS).filter(k => k !== 'boots');      // 로켓 신발은 꼴찌일 때만 나와요

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
  const b = { w, h, g, objs: [], spawns: [], starts: [], rooms: [], pads: [], finish: null };
  b.fill = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = c; };
  // 가구: bottom = 바닥 바로 위 줄
  b.obj = (t, x, bottom, ww, hh, solid = true) => { b.objs.push({ t, x, y: bottom - hh + 1, w: ww, h: hh, solid }); if (solid) b.fill(x, bottom - hh + 1, x + ww - 1, bottom, 'x'); };
  b.deco = (t, x, bottom, ww, hh) => b.obj(t, x, bottom, ww, hh, false);
  b.spawn = (x, bottom) => b.spawns.push({ x: x * TS + TS / 2, y: (bottom + 1) * TS - 6 });
  b.pad = (x, bottom, ww) => b.pads.push({ x: x * TS, y: (bottom + 1) * TS, w: ww * TS });
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

/* 파쿠르: 점점 높아지는 상자 넘기 / 떠 있는 발판 길 (둘 다 새 조작 없이 점프만으로 지나가요) */
function hurdles(b, R, from, to, bottom, res, hs) {
  const w = hs.length * 5 + 3;
  for (let t = 0; t < 12; t++) {
    const hx = from + (R() * Math.max(1, to - from - w) | 0);
    if (res.some(r => hx + w + 2 >= r[0] && hx - 2 <= r[1])) continue;
    hs.forEach((hh, n) => b.obj('boxes', hx + n * 5, bottom, 2, hh)); res.push([hx - 2, hx + w + 2]); return hx;
  }
  return -1;
}
/* 점프대: 밟으면 높이 튀어 올라 상자 위의 높은 길로 질러가요 (안 밟고 아래로 가도 돼요) */
function springRoute(b, R, from, to, bottom, res) {
  const w = 22;
  for (let t = 0; t < 12; t++) {
    const hx = from + (R() * Math.max(1, to - from - w) | 0);
    if (res.some(r => hx + w + 2 >= r[0] && hx - 2 <= r[1])) continue;
    b.pad(hx, bottom, 2); b.fill(hx + 4, bottom - 6, hx + 21, bottom - 6, '=');
    for (let n = 0; n < 3; n++) b.obj('boxes', hx + 8 + n * 5, bottom, 2, 3);
    b.spawn(hx + 18, bottom - 7); res.push([hx - 2, hx + w + 2]); return hx;
  }
  return -1;
}
function skyRoute(b, R, from, to, bottom, res, rows) {
  const w = rows.length * 6 + 4;
  for (let t = 0; t < 12; t++) {
    const hx = from + (R() * Math.max(1, to - from - w) | 0);
    if (res.some(r => hx + w + 2 >= r[0] && hx - 2 <= r[1])) continue;
    rows.forEach((up, n) => b.fill(hx + n * 6, bottom - up, hx + n * 6 + 3, bottom - up, '='));
    const last = rows.length - 1; b.spawn(hx + last * 6 + 2, bottom - rows[last] - 1);
    res.push([hx - 2, hx + w + 2]); return hx;
  }
  return -1;
}
/* 층 구조 건물: F = 아래 층부터 [{ theme, objs, belt, conn: 'lift', g: ['ice','gap','mezz'] }]
   층마다 위로 가는 길의 위치가 달라요 (왼쪽 끝, 가운데, 오른쪽 끝). 어떤 층은 길이 둘이라 골라서 갈 수 있어요.
   기믹: ice 미끄러운 바닥, gap 바닥 구멍(떨어지면 아래층), mezz 가구 위 선반, belt 컨베이어 */
function floorsMap(F, roof, seed, fw) {
  const FW = fw || 172, R = rng(seed), n = F.length, H = 6 * n + 6, b = Builder(FW, H), S = k => H - 1 - 6 * k;
  for (let k = 0; k <= n; k++) b.fill(0, S(k), FW - 1, S(k), '#');
  b.fill(0, S(n), 0, H - 1, '#'); b.fill(FW - 1, S(n), FW - 1, H - 1, '#');
  F.forEach((f, i) => { if (f.belt) b.fill(14, S(i), FW - 14, S(i), f.belt > 0 ? '>' : '<'); });   // 길(구멍)을 나중에 뚫어야 해서 무빙워크를 먼저 깔아요
  // 위로 가는 길 위치: 앞 층에서 올라온 자리에서 멀리 떨어뜨려요
  const POS = [10, FW * .28 | 0, FW * .5 | 0, FW * .72 | 0, FW - 18]; let prev = [8]; const conn = [];
  F.forEach((f, i) => {
    const far = (x, m) => prev.every(p => Math.abs(p - x) >= (m || FW * .23)), cand = POS.filter(x => far(x)), x1 = cand.length ? cand[R() * cand.length | 0] : POS.slice().sort((a, c) => Math.min(...prev.map(p => Math.abs(c - p))) - Math.min(...prev.map(p => Math.abs(a - p))))[0];
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
    // 파쿠르는 올라온 곳과 올라갈 곳 사이(실제로 지나가는 길)에 둬요
    const xs = arrive.concat(conn[i].map(c => c.x)).concat(i ? [] : [8]); let lo = Math.max(16, Math.min(...xs) + 8), hi = Math.min(FW - 16, Math.max(...xs) - 4); if (hi - lo < 26) { lo = 16; hi = FW - 16; }
    const GA = ['ice', 'gap', 'mezz'];
    for (let q = 0; g.length < 3 && q < 3; q++) { const k = GA[(i + seed + q) % 3]; if (!g.includes(k)) g.push(k); }
    for (const k of g) {
      const pit = k === 'gap', len = k === 'ice' ? 12 : pit ? 20 : 3;
      if (k === 'mezz' || (k === 'gap' && i < 1)) continue;
      for (let t = 0; t < 14; t++) {
        const x0 = Math.max(18, lo) + (R() * Math.max(1, Math.min(hi, FW - 18) - Math.max(18, lo) - len) | 0);
        if (res.some(r => x0 + len + 2 >= r[0] && x0 - (pit ? 8 : 2) <= r[1])) continue;
        if (k === 'ice') { b.fill(x0, S(i), x0 + 11, S(i), 'I'); res.push([x0 - 1, x0 + 12]); b.deco('cone', x0 - 1, bottom, 1, 1); }
        else if (pit) {
          // 위험한 지름길: 징검다리(실패하면 아래층으로). 안전한 긴 길: 위쪽 컨베이어 다리 (가는 방향과 반대로 돌아서 느려요)
          const dep = conn[i].reduce((a, c) => a + c.x, 0) / conn[i].length, arr = i ? conn[i - 1].reduce((a, c) => a + c.x, 0) / conn[i - 1].length : 8, right = dep > arr;
          b.fill(x0, S(i), x0 + 10, S(i), '.'); b.fill(x0 + 3, S(i), x0 + 3, S(i), '='); b.fill(x0 + 7, S(i), x0 + 7, S(i), '=');
          b.fill(x0 - 3, S(i) - 3, x0 + 13, S(i) - 3, right ? '<' : '>');
          b.fill(x0 - 6, S(i) - 1, x0 - 5, S(i) - 1, '='); b.fill(x0 + 14, S(i) - 1, x0 + 15, S(i) - 1, '=');
          res.push([x0 - 8, x0 + 17]);
        }   // 파쿠르: 징검다리 구덩이
        else { b.fill(x0, S(i), x0 + 2, S(i), '.'); res.push([x0 - 2, x0 + 5]); }
        break;
      }
    }
    for (const o of f.objs) if (o[0][0] === '~') b.deco(o[0].slice(1), o[1], bottom, o[2], o[3]);
    hurdles(b, R, 16, FW - 16, bottom, res, [1, 2, 1]); if (i % 2 === 0) hurdles(b, R, 16, FW - 16, bottom, res, [2, 1, 2]);
    skyRoute(b, R, 16, FW - 16, bottom, res, [2, 2, 2, 2]);
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
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i * 2) * TS + 3, y: (H - 1) * TS - PH.H });
  return b;
}

function isSolidC(c) { return c === '#' || c === 'x' || c === '>' || c === '<' || c === 'I'; }
const ob = (t, x, w, h) => [t, x, w, h];

const MAPS = {
  office:  { name: '오피스 빌딩', desc: '좁고 높은 탑을 일곱 층 올라 옥상 헬기장까지', make: () => mapOffice(), sky: ['#7fb6e8', '#c9e4f5'] },
  airport: { name: '공항',       desc: '체크인, 보안 검사, 면세점, 탑승구를 지나 활주로의 비행기까지', make: () => mapAirport(), sky: ['#f2a65a', '#ffd9a0'] },
  subway:  { name: '지하철역',   desc: '개찰구를 내려가 선로 위 열차 지붕을 건너 지상 출구까지', make: () => mapSubway(), sky: ['#5a6a9a', '#a0b0d8'] },
  mall:    { name: '백화점',     desc: '여섯 층 매장을 가로질러 에스컬레이터로 옥상까지', make: () => mapMall(), sky: ['#f08aa8', '#ffd6e0'] },
  hospital:{ name: '병원',       desc: '접수, 병동, 검사실, 수술실을 승강기로 올라 옥상 헬기장까지', make: () => mapHospital(), sky: ['#7fd0c8', '#d8f5f0'] },
  school:  { name: '학교',       desc: '현관, 교실, 음악실, 체육관 트램펄린을 지나 옥상 운동장까지', make: () => mapSchool(), sky: ['#7fb6e8', '#e8f3ff'] },
  hotel:   { name: '호텔',       desc: '로비 대계단, 객실, 연회장, 옥상 수영장을 지나 펜트하우스까지', make: () => mapHotel(), sky: ['#6aa0e0', '#f4d8b0'] },
  library: { name: '도서관',     desc: '서가 사이 떠 있는 사다리를 번갈아 밟으며 옥상 서재까지', make: () => mapLibrary(), sky: ['#b09ad8', '#f0e0c8'] },
  museum:  { name: '박물관',     desc: '공룡 뼈 위 지름길과 발굴 구덩이를 지나 우주관까지', make: () => mapMuseum(), sky: ['#88a8c8', '#e8e0d0'] },
  stadium: { name: '경기장',     desc: '터널과 라커룸, 객석 계단, 경기장 위 구름다리를 지나 귀빈석까지', make: () => mapStadium(), sky: ['#4a78c0', '#a8d0f0'] },
  studio:  { name: '방송국',     desc: '뉴스 세트와 조명 구름다리를 지나 송신탑 꼭대기까지', make: () => mapStudio(), sky: ['#3a3a6a', '#8a7ab0'] },
  factory: { name: '공장',       desc: '번갈아 도는 컨베이어와 쇳물 구덩이를 지나 출하장까지', make: () => mapFactory(), sky: ['#8a7a6a', '#d0b898'] }
};
const MAP_IDS = Object.keys(MAPS);

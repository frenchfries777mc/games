/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   맵 12개. 맵마다 모양이 달라요: 세로로 쌓은 건물(오피스, 백화점)과, 오르막·구덩이·승강기·사다리가 이어지는 가로 맵 */
'use strict';

/* 가로 맵 만들기: 조각(parts)을 왼쪽에서 오른쪽으로 이어 붙여요. lv = 바닥 높이(칸)
   flat   { len, theme, f:[기믹], objs, items }         평평한 길. 기믹은 아래 참고
   rise   { n, sw, sh, theme }                         계단 위로 (n계단, 폭 sw, 높이 sh<=2)
   fall   { n, sw, sh, theme }                         계단 아래로
   lift   { h, land, theme }                           엘리베이터로 h칸 올라가요
   ladder { h, w, theme }                              떠 있는 발판을 번갈아 밟으며 h칸(3의 배수) 올라가요
   trench { len, d, mode, theme }                      구덩이(깊이 d). 떨어지면 바닥에서 계단으로 올라와요. mode: plain | cars | stones | belt
   flat 기믹: ['ice',off,len] ['belt',off,len,dir] ['hurdle',off,[높이..]] ['sky',off,[높이..]] ['spring',off] ['block',off,종류,w,h] ['mezz',off,len,up] ['deco',off,종류,w,h] */
function stripMap(parts, seed, goal) {
  const R = rng(seed);
  let x = 1, lv = 0, lo = 0, hi = 0; const L = [];
  for (const p of parts) {
    const s = Object.assign({ x0: x, lv0: lv, w: 0 }, p);
    if (p.k === 'flat') s.w = p.len;
    else if (p.k === 'rise') { s.w = p.n * p.sw; lv += p.n * p.sh; }
    else if (p.k === 'fall') { s.w = p.n * p.sw; lv -= p.n * p.sh; }
    else if (p.k === 'lift') { s.w = 3 + (p.land || 8); lv += p.h; }
    else if (p.k === 'ladder') { s.w = p.w || 12; lv += p.h; }
    else if (p.k === 'trench') s.w = p.len;
    s.lv1 = lv; x += s.w; lo = Math.min(lo, lv, lv - (p.d || 0), s.lv0 - (p.d || 0)); hi = Math.max(hi, lv);
    L.push(s);
  }
  const W = x + 1, H = hi - lo + 19, row = l => H - 3 - (l - lo), b = Builder(W, H);
  b.fill(0, 0, W - 1, 1, '#'); b.fill(0, 0, 0, H - 1, '#'); b.fill(W - 1, 0, W - 1, H - 1, '#');
  const ground = (x0, x1, l) => b.fill(x0, row(l), x1, H - 1, '#');
  b.deco('door', 1, row(0) - 1, 3, 4);
  L.forEach((s, si) => {
    const x0 = s.x0, x1 = s.x0 + s.w - 1, th = s.theme || (L[si - 1] && L[si - 1].theme) || 'office', top = Math.max(s.lv0, s.lv1), bot = Math.min(s.lv0, s.lv1);
    const y0 = Math.max(2, row(top) - 14);
    b.room(si ? x0 : 1, y0, x1, H - 1, th);      // 바닥 아래까지 한 방으로 (바닥 색이 방 색을 따르게)
    if (s.k === 'flat') {
      const l = s.lv0, bottom = row(l) - 1, res = [], placed = [];
      ground(x0, x1, l);
      for (const f of s.f || []) {
        const t = f[0], o = x0 + f[1];
        if (t === 'ice') { b.fill(o, row(l), o + f[2] - 1, row(l), 'I'); res.push([o - 1, o + f[2]]); b.deco('cone', o - 1, bottom, 1, 1); }
        else if (t === 'belt') { b.fill(o, row(l), o + f[2] - 1, row(l), f[3] > 0 ? '>' : '<'); res.push([o - 1, o + f[2]]); }
        else if (t === 'hurdle') { f[2].forEach((hh, n) => b.obj(s.hb || 'boxes', o + n * 5, bottom, 2, hh)); res.push([o - 2, o + f[2].length * 5 + 1]); }
        else if (t === 'sky') { f[2].forEach((up, n) => b.fill(o + n * 6, bottom - up, o + n * 6 + 3, bottom - up, '=')); const n = f[2].length - 1; b.spawn(o + n * 6 + 2, bottom - f[2][n] - 1); res.push([o - 2, o + f[2].length * 6 + 1]); }
        else if (t === 'spring') { b.pad(o, bottom, 2); b.fill(o + 4, bottom - 6, o + 21, bottom - 6, '='); for (let n = 0; n < 3; n++) b.obj('boxes', o + 8 + n * 5, bottom, 2, 3); b.spawn(o + 18, bottom - 7); res.push([o - 2, o + 24]); }
        else if (t === 'block') { b.obj(f[2], o, bottom, f[3], f[4]); res.push([o - 1, o + f[3]]); }
        else if (t === 'mezz') { b.fill(o, bottom - f[3], o + f[2] - 1, bottom - f[3], '='); b.spawn(o + (f[2] >> 1), bottom - f[3] - 1); }
        else if (t === 'deco') b.deco(f[2], o, bottom, f[3], f[4]);
      }
      if (s.objs) placeRun(b, R, s.objs, x0 + 4, x1 - 3, bottom, res, placed);
      itemSpots(b, x0 + 3, x1 - 3, bottom, s.items != null ? s.items : Math.max(1, s.len / 24 | 0));
    } else if (s.k === 'rise' || s.k === 'fall') {
      const sg = s.k === 'rise' ? 1 : -1;
      for (let i = 0; i < s.n; i++) ground(x0 + i * s.sw, x0 + (i + 1) * s.sw - 1, s.lv0 + sg * (i + 1) * s.sh);
      b.deco(s.k === 'rise' ? 'stairwell' : 'stairwell', x0, row(bot) - 1, Math.min(s.w, 10), 6);
      if (s.seats) for (let i = 0; i < s.n; i++) b.deco('seats', x0 + i * s.sw, row(s.lv0 + sg * (i + 1) * s.sh) - 1, Math.min(s.sw, 4), 1);
      b.spawn(x0 + s.w - 2, row(s.lv1) - 1);
    } else if (s.k === 'lift') {
      ground(x0, x0 + 2, s.lv0); ground(x0 + 3, x1, s.lv1);
      b.fill(x0, row(s.lv1), x0 + 2, row(s.lv1), '=');
      for (let y = row(s.lv1) - 4; y <= row(s.lv0) - 1; y++) b.fill(x0, y, x0 + 2, y, 'U');
      b.deco('liftshaft', x0, row(s.lv0) - 1, 3, s.h + 4);
      b.spawn(x0 + 6, row(s.lv1) - 1);
    } else if (s.k === 'ladder') {
      const n = s.h / 3, w = s.w || 12; ground(x0, x0 + w - 1, s.lv0);
      for (let k = 1; k <= n; k++) {
        const right = (n - k) % 2 === 0, a = right ? x1 - 4 : x0, r = row(s.lv0 + 3 * k);
        b.fill(a, r, a + 4, r, '='); if (k > 1) b.spawn(a + 2, r - 1);
      }
      if (s.deco) for (let a = x0 + 5; a < x1 - 4; a += 9) b.deco(s.deco, a, row(s.lv0) - 1, 3, Math.min(s.h, 12));
      ground(x1 + 1, x1 + 1, s.lv1);
    } else if (s.k === 'trench') {
      const l = s.lv0, d = s.d, mode = s.mode || 'plain', ns = Math.ceil(d / 2), sx = x1 - 3 * ns + 1, bed = l - d;
      ground(x0, x1, bed);
      for (let j = 1; j <= ns; j++) ground(sx + 3 * (j - 1), sx + 3 * j - 1, Math.min(l, bed + 2 * j));
      const a0 = x0 + 2, a1 = sx - 3;
      if (mode === 'cars') for (let a = a0; a + 12 <= a1 + 1; a += 15) { b.obj(s.car || 'traincar', a, row(bed) - 1, 12, d); }
      else if (mode === 'stones') for (let a = a0, k = 0; a + 3 <= a1 + 1; a += 6, k++) b.fill(a, row(l + (k % 3 === 1 ? 2 : 0)), a + 2, row(l + (k % 3 === 1 ? 2 : 0)), '=');
      else if (mode === 'belt') b.fill(a0, row(l), a1, row(l), s.dir > 0 ? '>' : '<');
      b.spawn(a0 + 4, row(bed) - 1);
    }
  });
  // 도착: 마지막 조각은 평평한 길이에요
  const last = L[L.length - 1], lb = row(last.lv1) - 1;
  b.deco(goal || 'door', x - 6, lb, 3, 4);
  b.finish = { x0: x - 9, y0: lb - 2, x1: x - 2, y1: lb };
  for (let i = 0; i < RACERS; i++) b.starts.push({ x: (2 + i * 2) * TS + 3, y: row(0) * TS - PH.H });
  return b;
}

/* ---------- 오피스 빌딩: 좁고 높은 탑. 층마다 엘리베이터와 계단이 번갈아 있어요 ---------- */
function mapOffice() {
  return floorsMap([
    { theme: 'lobby', g: ['mezz'], objs: [ob('turnstile', 0, 1, 2), ob('counter', 0, 4, 2), ob('plant', 0, 1, 2), ob('sofa', 0, 3, 1), ob('turnstile', 0, 1, 2), ob('bench', 0, 3, 1)] },
    { theme: 'office', conn: 'lift', g: ['gap'], objs: [ob('desk', 0, 3, 1), ob('chair', 0, 1, 1), ob('desk', 0, 3, 1), ob('cabinet', 0, 2, 2), ob('desk', 0, 3, 1), ob('copier', 0, 2, 2), ['~whiteboard', 30, 4, 2]] },
    { theme: 'office', g: ['ice', 'mezz'], objs: [ob('meeting', 0, 6, 1), ob('chair', 0, 1, 1), ob('chair', 0, 1, 1), ob('meeting', 0, 5, 1), ob('plant', 0, 1, 2)] },
    { theme: 'server', conn: 'lift', g: ['gap', 'mezz'], objs: [ob('rack', 0, 1, 3), ob('rack', 0, 1, 3), ob('boxes', 0, 2, 1), ob('rack', 0, 1, 2), ob('cart', 0, 2, 1), ob('rack', 0, 1, 3)] },
    { theme: 'cafe', g: ['ice'], objs: [ob('table', 0, 3, 1), ob('vending', 0, 2, 2), ob('foodbar', 0, 4, 2), ob('trash', 0, 1, 1), ob('table', 0, 3, 1)] },
    { theme: 'office', conn: 'lift', g: ['ice', 'gap'], objs: [ob('desk', 0, 3, 1), ob('copier', 0, 2, 2), ob('cabinet', 0, 2, 2), ob('desk', 0, 3, 1), ob('cooler', 0, 1, 2)] },
    { theme: 'lobby', g: ['mezz', 'gap'], objs: [ob('desk', 0, 4, 2), ob('plant', 0, 1, 2), ob('sofa', 0, 3, 1), ob('trophy', 0, 2, 2), ob('plant', 0, 1, 2)] }
  ], [ob('ac', 0, 3, 2), ob('vent', 0, 1, 1), ob('tank', 0, 3, 2), ob('ac', 0, 2, 2), ['~antenna', 40, 1, 5]], 11, 100);
}

/* ---------- 공항: 체크인 → 보안 검사 → 면세점 → 에스컬레이터 → 탑승구 → 수하물 구역 → 탑승교 → 활주로 → 비행기 ---------- */
function mapAirport() {
  return stripMap([
    { k: 'flat', len: 56, theme: 'terminal', f: [['block', 16, 'checkin', 3, 2], ['block', 23, 'checkin', 3, 2], ['block', 30, 'checkin', 3, 2], ['mezz', 14, 22, 4], ['deco', 15, 'board', 12, 2], ['hurdle', 40, [1, 2, 1]]], objs: [ob('luggage', 0, 2, 1), ob('barrier', 0, 1, 1), ob('plant', 0, 1, 2)] },
    { k: 'flat', len: 44, theme: 'terminal', f: [['belt', 4, 12, 1], ['block', 18, 'xray', 3, 2], ['deco', 22, 'detector', 1, 3], ['belt', 26, 14, 1]], objs: [ob('bins', 0, 3, 1), ob('barrier', 0, 1, 1)] },
    { k: 'flat', len: 64, theme: 'gates', f: [['ice', 6, 14], ['mezz', 24, 18, 3], ['ice', 44, 14], ['hurdle', 24, [1, 2, 3, 2, 1]]], objs: [ob('shelf', 0, 2, 2), ob('cart', 0, 2, 1), ob('plant', 0, 1, 2)] },
    { k: 'rise', n: 5, sw: 3, sh: 2, theme: 'gates' },
    { k: 'flat', len: 64, theme: 'gates', f: [['belt', 4, 24, 1], ['belt', 34, 20, -1], ['hurdle', 28, [1, 2, 1]]], objs: [ob('seats', 0, 3, 1), ob('cart', 0, 2, 1), ob('gatedesk', 0, 2, 1)] },
    { k: 'flat', len: 60, theme: 'terminal', f: [['belt', 4, 14, 1], ['block', 22, 'luggage', 2, 2], ['belt', 30, 14, -1], ['hurdle', 46, [1, 2, 3, 2, 1]]], objs: [ob('luggage', 0, 2, 1), ob('cart', 0, 2, 1), ob('bins', 0, 3, 1)] },
    { k: 'trench', len: 40, d: 4, mode: 'stones', theme: 'terminal' },
    { k: 'flat', len: 36, theme: 'bridge', f: [['spring', 6], ['block', 30, 'luggage', 1, 1]], items: 2 },
    { k: 'fall', n: 3, sw: 3, sh: 2, theme: 'tarmac' },
    { k: 'flat', len: 70, theme: 'tarmac', f: [['hurdle', 10, [1, 2, 3, 2, 1]], ['ice', 42, 12]], objs: [ob('cart', 0, 2, 1), ob('luggage', 0, 2, 1), ob('cone', 0, 1, 1)] },
    { k: 'trench', len: 46, d: 4, mode: 'cars', car: 'baggagecart', theme: 'tarmac' },
    { k: 'flat', len: 56, theme: 'tarmac', f: [['spring', 6], ['ice', 34, 14]], objs: [ob('cone', 0, 1, 1), ob('luggage', 0, 2, 1)] },
    { k: 'rise', n: 4, sw: 3, sh: 2, theme: 'tarmac' },
    { k: 'flat', len: 30, theme: 'tarmac', f: [['deco', 14, 'plane', 7, 12]], items: 1 }
  ], 97, 'door');
}

/* ---------- 지하철역: 개찰구 → 계단 → 승강장 → 선로 위 열차 지붕 건너기 → 반대편 승강장 → 환승 통로 → 지상 출구 ---------- */
function mapSubway() {
  return stripMap([
    { k: 'flat', len: 46, theme: 'subway', f: [['block', 16, 'turnstile', 1, 2], ['block', 20, 'turnstile', 1, 2], ['block', 24, 'ticket', 3, 2], ['hurdle', 32, [1, 2, 1]]], objs: [ob('kiosk', 0, 3, 2), ob('plant', 0, 1, 1), ob('news', 0, 2, 2)] },
    { k: 'fall', n: 3, sw: 4, sh: 2, theme: 'subwayB' },
    { k: 'flat', len: 58, theme: 'subwayB', f: [['ice', 6, 10], ['block', 22, 'pillar', 2, 3], ['block', 36, 'pillar', 2, 3], ['mezz', 24, 12, 3]], objs: [ob('bench', 0, 3, 1), ob('trash', 0, 1, 1), ob('luggage', 0, 2, 1)] },
    { k: 'flat', len: 52, theme: 'subwayB', f: [['belt', 4, 14, -1], ['block', 24, 'pillar', 2, 3], ['hurdle', 32, [1, 2, 3, 2, 1]]], objs: [ob('bench', 0, 3, 1), ob('cart', 0, 2, 1)] },
    { k: 'trench', len: 66, d: 4, mode: 'cars', theme: 'subwayB' },
    { k: 'flat', len: 46, theme: 'subwayB', f: [['belt', 4, 26, 1], ['hurdle', 34, [1, 2, 1]]], objs: [ob('bench', 0, 3, 1), ob('barrier', 0, 1, 1)] },
    { k: 'rise', n: 3, sw: 4, sh: 2, theme: 'subway' },
    { k: 'flat', len: 64, theme: 'subway', f: [['belt', 4, 22, -1], ['belt', 30, 22, 1], ['mezz', 8, 14, 3]], objs: [ob('kiosk', 0, 3, 2), ob('plant', 0, 1, 2), ob('ticket', 0, 3, 2)] },
    { k: 'flat', len: 58, theme: 'subway', f: [['ice', 6, 14], ['block', 26, 'ticket', 3, 2], ['spring', 34]], objs: [ob('news', 0, 2, 2), ob('kiosk', 0, 3, 2)] },
    { k: 'lift', h: 6, land: 8, theme: 'subwayS' },
    { k: 'flat', len: 64, theme: 'subwayS', f: [['hurdle', 8, [1, 2, 3, 2, 1]], ['spring', 30], ['ice', 54, 8]], objs: [ob('cart', 0, 2, 1), ob('plant', 0, 1, 2)] }
  ], 23, 'stairwell');
}

/* ---------- 백화점: 다섯 층 매장. 넓고 낮은 층을 가로질러 에스컬레이터로 올라가요 ---------- */
function mapMall() {
  return floorsMap([
    { theme: 'mCos', conn: 'lift', g: ['mezz'], objs: [ob('cosm', 0, 5, 2), ob('perfume', 0, 3, 2), ob('plant', 0, 1, 2), ob('mirror', 0, 2, 2), ob('fountain', 0, 5, 1), ob('cosm', 0, 5, 2)] },
    { theme: 'mCloth', g: ['gap'], objs: [ob('mannequin', 0, 1, 3), ob('rackc', 0, 4, 2), ob('shoes', 0, 4, 1), ob('mannequin', 0, 1, 3), ob('rackc', 0, 3, 2), ob('mirror', 0, 2, 2)] },
    { theme: 'mFurn', g: ['ice'], objs: [ob('sofaL', 0, 5, 1), ob('wardrobe', 0, 3, 3), ob('bedL', 0, 5, 1), ob('tableL', 0, 4, 1), ob('lamp', 0, 1, 3)] },
    { theme: 'mFood', conn: 'lift', g: ['mezz', 'gap'], objs: [ob('fruit', 0, 4, 2), ob('deli', 0, 5, 2), ob('fridge', 0, 2, 3), ob('cake', 0, 2, 1), ob('fruit', 0, 4, 2)] },
    { theme: 'mTech', conn: 'lift', g: ['ice'], objs: [ob('tv', 0, 4, 2), ob('washer', 0, 2, 2), ob('fridge', 0, 2, 3), ob('tv', 0, 5, 2), ob('kiosk', 0, 3, 2)] },
    { theme: 'food', g: ['mezz', 'gap'], objs: [ob('table', 0, 3, 1), ob('foodbar', 0, 4, 2), ob('table', 0, 3, 1), ob('vending', 0, 2, 2), ob('cake', 0, 2, 1)] }
  ], [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2), ob('vent', 0, 1, 1), ob('ac', 0, 2, 2)], 37, 136);
}

/* ---------- 병원: 접수 → 복도(침대와 휠체어) → 승강기 → 검사실 → 승강기 → 수술실 → 옥상 헬기장 ---------- */
function mapHospital() {
  return stripMap([
    { k: 'flat', len: 44, theme: 'hospital', f: [['block', 14, 'reception', 5, 2], ['mezz', 14, 12, 3], ['hurdle', 30, [1, 2, 1]]], objs: [ob('chair', 0, 3, 1), ob('plant', 0, 1, 2), ob('vending', 0, 2, 2)], hb: 'wheelchair' },
    { k: 'flat', len: 70, theme: 'ward', f: [['block', 8, 'bed', 4, 1], ['block', 20, 'bed', 4, 1], ['block', 32, 'bed', 4, 1], ['ice', 42, 12], ['hurdle', 56, [1, 2, 1]]], objs: [ob('drip', 0, 1, 2), ob('cabinet', 0, 2, 2), ob('wheelchair', 0, 2, 1)] },
    { k: 'flat', len: 56, theme: 'hospital', f: [['block', 8, 'bed', 4, 1], ['belt', 18, 14, 1], ['block', 36, 'wheelchair', 2, 1], ['hurdle', 42, [1, 2, 1]]], objs: [ob('drip', 0, 1, 2), ob('cart', 0, 2, 1)] },
    { k: 'lift', h: 6, land: 8, theme: 'lab' },
    { k: 'flat', len: 62, theme: 'lab', f: [['block', 10, 'scanner', 4, 3], ['block', 26, 'labtable', 5, 2], ['spring', 36]], objs: [ob('cart', 0, 2, 1), ob('cabinet', 0, 2, 2)] },
    { k: 'flat', len: 56, theme: 'lab', f: [['ice', 6, 14], ['hurdle', 28, [1, 2, 3, 2, 1]], ['block', 50, 'cabinet', 2, 2]], objs: [ob('labtable', 0, 5, 2), ob('boxes', 0, 2, 1)] },
    { k: 'lift', h: 6, land: 8, theme: 'ward' },
    { k: 'flat', len: 54, theme: 'ward', f: [['belt', 4, 16, 1], ['hurdle', 26, [2, 3, 2]], ['mezz', 40, 10, 3]], objs: [ob('bed', 0, 4, 1), ob('drip', 0, 1, 2)] },
    { k: 'flat', len: 52, theme: 'lab', f: [['spring', 6], ['block', 34, 'scanner', 4, 3], ['belt', 40, 10, -1]], objs: [ob('cart', 0, 2, 1), ob('drip', 0, 1, 2)] },
    { k: 'rise', n: 3, sw: 4, sh: 2, theme: 'roofH' },
    { k: 'flat', len: 36, theme: 'roofH', f: [['deco', 14, 'helipad', 9, 1]], objs: [ob('ac', 0, 3, 2), ob('tank', 0, 3, 2)], items: 1 }
  ], 41, 'flag');
}

/* ---------- 학교: 현관 → 복도 → 계단 → 교실 → 음악실 → 체육관(트램펄린) → 옥상 운동장 ---------- */
function mapSchool() {
  return stripMap([
    { k: 'flat', len: 44, theme: 'hall', f: [['block', 12, 'locker', 4, 2], ['block', 20, 'trophy', 2, 2], ['ice', 28, 10]], objs: [ob('bench', 0, 3, 1), ob('bin', 0, 1, 1)] },
    { k: 'rise', n: 4, sw: 4, sh: 2, theme: 'class' },
    { k: 'flat', len: 70, theme: 'class', f: [['block', 8, 'sdesk', 2, 1], ['block', 14, 'sdesk', 2, 1], ['block', 20, 'sdesk', 2, 1], ['block', 26, 'teacher', 4, 2], ['hurdle', 40, [1, 2, 1]], ['mezz', 54, 12, 3]], objs: [ob('sdesk', 0, 2, 1), ob('bin', 0, 1, 1)] },
    { k: 'flat', len: 56, theme: 'lab', f: [['ice', 6, 14], ['block', 24, 'labtable', 5, 2], ['hurdle', 36, [1, 2, 3, 2, 1]]], objs: [ob('cart', 0, 2, 1), ob('boxes', 0, 2, 1)] },
    { k: 'flat', len: 52, theme: 'music', f: [['block', 10, 'piano', 4, 2], ['block', 22, 'drums', 3, 2], ['sky', 30, [2, 3, 2]]], objs: [ob('stool', 0, 1, 1), ob('chair', 0, 2, 1)] },
    { k: 'flat', len: 78, theme: 'gym', f: [['spring', 8], ['block', 36, 'hoop', 1, 3], ['spring', 44], ['ice', 66, 8]], objs: [ob('mat', 0, 4, 1), ob('horse', 0, 3, 2), ob('ball', 0, 1, 1)] },
    { k: 'flat', len: 46, theme: 'cafe', f: [['block', 8, 'foodbar', 4, 2], ['block', 20, 'vending', 2, 2], ['mezz', 24, 14, 3]], objs: [ob('table', 0, 3, 1), ob('trash', 0, 1, 1)] },
    { k: 'lift', h: 6, land: 8, theme: 'track' },
    { k: 'flat', len: 70, theme: 'track', f: [['hurdle', 8, [1, 1, 1, 1]], ['spring', 30], ['hurdle', 56, [2, 2, 2]]], objs: [ob('cone', 0, 1, 1), ob('ball', 0, 1, 1)], hb: 'hurdleBar' }
  ], 53, 'flag');
}

/* ---------- 호텔: 로비 대계단 → 객실 복도 → 승강기 → 연회장(미끄러운 댄스 플로어) → 옥상 수영장 → 펜트하우스 ---------- */
function mapHotel() {
  return stripMap([
    { k: 'flat', len: 40, theme: 'hotelL', f: [['block', 12, 'reception', 5, 2], ['block', 24, 'pillar', 2, 3]], objs: [ob('luggage', 0, 2, 1), ob('plant', 0, 1, 2), ob('trolley', 0, 3, 2)] },
    { k: 'rise', n: 3, sw: 5, sh: 2, theme: 'hotelL' },
    { k: 'flat', len: 50, theme: 'hotelR', f: [['block', 8, 'trolley', 3, 2], ['belt', 20, 14, 1], ['hurdle', 36, [1, 2, 1]]], objs: [ob('plant', 0, 1, 2), ob('luggage', 0, 2, 1)] },
    { k: 'flat', len: 70, theme: 'hotelR', f: [['block', 8, 'bed', 4, 1], ['hurdle', 18, [1, 2, 1]], ['block', 34, 'minibar', 2, 2], ['mezz', 40, 14, 3], ['hurdle', 56, [2, 3, 2]]], objs: [ob('luggage', 0, 2, 1), ob('trolley', 0, 3, 2), ob('plant', 0, 1, 2)], hb: 'trolley' },
    { k: 'flat', len: 44, theme: 'hotelR', f: [['spring', 6], ['block', 34, 'minibar', 2, 2]], objs: [ob('plant', 0, 1, 2), ob('luggage', 0, 2, 1)] },
    { k: 'lift', h: 9, land: 8, theme: 'ballroom' },
    { k: 'flat', len: 62, theme: 'ballroom', f: [['ice', 6, 20], ['block', 30, 'piano', 4, 2], ['ice', 38, 20]], objs: [ob('table', 0, 3, 1), ob('cake', 0, 3, 2), ob('plant', 0, 1, 2)] },
    { k: 'flat', len: 56, theme: 'ballroom', f: [['block', 10, 'cake', 3, 2], ['hurdle', 24, [1, 2, 1]], ['mezz', 40, 12, 3]], objs: [ob('table', 0, 3, 1), ob('plant', 0, 1, 2)] },
    { k: 'ladder', h: 9, w: 12, theme: 'hotelL', deco: 'pillar' },
    { k: 'flat', len: 24, theme: 'pool', f: [['mezz', 6, 10, 3]], objs: [ob('chaise', 0, 3, 1)] },
    { k: 'trench', len: 46, d: 4, mode: 'stones', theme: 'pool' },
    { k: 'flat', len: 40, theme: 'pool', f: [['ice', 4, 14], ['hurdle', 24, [1, 2, 1]]], objs: [ob('chaise', 0, 3, 1), ob('parasol', 0, 1, 3), ob('towels', 0, 2, 1)] }
  ], 71, 'door');
}

/* ---------- 도서관: 열람실 → 서가 사이 사다리(떠 있는 발판) 오르기 → 중2층 → 서가 → 옥상 서재 ---------- */
function mapLibrary() {
  return stripMap([
    { k: 'flat', len: 40, theme: 'lib', f: [['block', 12, 'shelfb', 3, 3], ['block', 22, 'desk', 3, 1], ['mezz', 26, 10, 3]], objs: [ob('globe', 0, 1, 2), ob('chair', 0, 1, 1)] },
    { k: 'ladder', h: 12, w: 12, theme: 'lib', deco: 'shelfb' },
    { k: 'flat', len: 60, theme: 'libR', f: [['block', 8, 'desk', 3, 1], ['spring', 22], ['block', 50, 'lamp', 1, 3]], objs: [ob('desk', 0, 3, 1), ob('lamp', 0, 1, 3)] },
    { k: 'ladder', h: 12, w: 12, theme: 'archive', deco: 'cabinet' },
    { k: 'flat', len: 50, theme: 'archive', f: [['ice', 6, 12], ['block', 24, 'cabinet', 2, 2], ['hurdle', 30, [2, 3, 2]]], objs: [ob('cart', 0, 2, 1), ob('scroll', 0, 2, 1), ob('boxes', 0, 2, 1)] },
    { k: 'ladder', h: 9, w: 12, theme: 'lib', deco: 'shelfb' },
    { k: 'flat', len: 56, theme: 'lib', f: [['block', 8, 'shelfb', 3, 3], ['ice', 20, 12], ['hurdle', 36, [1, 2, 3, 2, 1]]], objs: [ob('desk', 0, 3, 1), ob('globe', 0, 1, 2)] },
    { k: 'ladder', h: 12, w: 12, theme: 'libR', deco: 'lamp' },
    { k: 'flat', len: 50, theme: 'archive', f: [['block', 8, 'cabinet', 2, 2], ['belt', 16, 14, 1], ['spring', 34]], objs: [ob('scroll', 0, 2, 1), ob('cart', 0, 2, 1)] },
    { k: 'flat', len: 40, theme: 'libR', f: [['mezz', 8, 12, 3], ['block', 24, 'globe', 1, 2]], objs: [ob('desk', 0, 3, 1), ob('lamp', 0, 1, 3)] }
  ], 83, 'door');
}

/* ---------- 박물관: 홀(조각상) → 공룡관(뼈 위 지름길, 발굴 구덩이) → 미술관 → 우주관(점프대) → 옥상 ---------- */
function mapMuseum() {
  return stripMap([
    { k: 'flat', len: 48, theme: 'muse', f: [['block', 14, 'statue', 2, 3], ['block', 26, 'statue', 2, 3], ['hurdle', 34, [1, 2, 1]]], objs: [ob('bench', 0, 3, 1), ob('vitrine', 0, 3, 2), ob('plant', 0, 1, 2)] },
    { k: 'flat', len: 80, theme: 'museD', f: [['deco', 10, 'bones', 6, 3], ['sky', 14, [3, 6, 3, 6]], ['block', 44, 'rock', 2, 1], ['hurdle', 52, [2, 3, 2]]], objs: [ob('rope', 0, 1, 1), ob('vitrine', 0, 3, 2)] },
    { k: 'trench', len: 44, d: 4, mode: 'stones', theme: 'museD' },
    { k: 'flat', len: 60, theme: 'museD', f: [['ice', 6, 16], ['block', 30, 'statue', 2, 3], ['hurdle', 38, [1, 2, 3, 2, 1]]], objs: [ob('rope', 0, 1, 1), ob('rock', 0, 2, 1), ob('vitrine', 0, 3, 2)] },
    { k: 'flat', len: 62, theme: 'museA', f: [['block', 10, 'easel', 2, 3], ['block', 20, 'easel', 2, 3], ['ice', 30, 14], ['mezz', 48, 12, 3]], objs: [ob('bench', 0, 3, 1), ob('vitrine', 0, 3, 2)] },
    { k: 'flat', len: 50, theme: 'museA', f: [['sky', 8, [3, 6, 3, 6]], ['block', 40, 'easel', 2, 3]], objs: [ob('bench', 0, 3, 1), ob('vitrine', 0, 3, 2)] },
    { k: 'lift', h: 6, land: 8, theme: 'museS' },
    { k: 'flat', len: 66, theme: 'museS', f: [['spring', 6], ['spring', 36], ['block', 60, 'rocket', 2, 3]], objs: [ob('moon', 0, 3, 1), ob('globe', 0, 1, 2)] }
  ], 97, 'door');
}

/* ---------- 경기장: 매표소 → 선수 터널 → 라커룸 → 객석 계단 → 중계석 → 경기장 위 구름다리 → 귀빈석 ---------- */
function mapStadium() {
  return stripMap([
    { k: 'flat', len: 46, theme: 'arena', f: [['block', 12, 'turnstile', 1, 2], ['block', 18, 'hotdog', 3, 2], ['hurdle', 30, [1, 2, 1]]], objs: [ob('banner', 0, 1, 3), ob('bench', 0, 3, 1)] },
    { k: 'flat', len: 40, theme: 'arena', f: [['belt', 4, 12, 1], ['spring', 18]], objs: [ob('banner', 0, 1, 3), ob('hotdog', 0, 3, 2)] },
    { k: 'flat', len: 50, theme: 'lockerR', f: [['belt', 4, 14, 1], ['block', 22, 'locker', 4, 2], ['block', 32, 'locker', 3, 2], ['mezz', 24, 12, 4]], objs: [ob('bench', 0, 3, 1), ob('ball', 0, 1, 1)] },
    { k: 'flat', len: 54, theme: 'arena', f: [['ice', 6, 12], ['block', 24, 'hotdog', 3, 2], ['hurdle', 34, [1, 2, 3, 2, 1]]], objs: [ob('banner', 0, 1, 3), ob('trash', 0, 1, 1)] },
    { k: 'rise', n: 7, sw: 5, sh: 2, theme: 'arenaO', seats: true },
    { k: 'flat', len: 56, theme: 'press', f: [['block', 8, 'camera', 2, 3], ['hurdle', 18, [1, 2, 1]], ['block', 36, 'desk', 3, 1]], objs: [ob('chair', 0, 1, 1), ob('cooler', 0, 1, 2)] },
    { k: 'trench', len: 62, d: 6, mode: 'stones', theme: 'field' },
    { k: 'flat', len: 56, theme: 'press', f: [['spring', 6], ['block', 30, 'camera', 2, 3], ['hurdle', 40, [1, 2, 1]]], objs: [ob('desk', 0, 3, 1), ob('chair', 0, 1, 1)] },
    { k: 'rise', n: 3, sw: 5, sh: 2, theme: 'vip', seats: true },
    { k: 'flat', len: 40, theme: 'vip', f: [['mezz', 8, 12, 3], ['block', 26, 'trophy', 2, 2]], objs: [ob('sofa', 0, 3, 1), ob('plant', 0, 1, 2)] }
  ], 103, 'door');
}

/* ---------- 방송국: 대기실 → 뉴스 스튜디오 → 게임쇼 세트(점프대) → 조명 구름다리 → 조정실 → 송신탑 오르기 ---------- */
function mapStudio() {
  return stripMap([
    { k: 'flat', len: 44, theme: 'makeup', f: [['block', 12, 'mirror', 3, 2], ['block', 20, 'rackc', 3, 2], ['hurdle', 30, [1, 2, 1]]], objs: [ob('chair', 0, 1, 1), ob('plant', 0, 1, 2)] },
    { k: 'flat', len: 62, theme: 'studio', f: [['block', 10, 'desk', 4, 1], ['block', 20, 'camera', 2, 3], ['mezz', 24, 16, 3], ['ice', 44, 10]], objs: [ob('spot', 0, 1, 3), ob('cable', 0, 2, 1), ob('sofa', 0, 3, 1)] },
    { k: 'flat', len: 70, theme: 'studio', f: [['spring', 6], ['block', 38, 'spot', 1, 3], ['spring', 44]], objs: [ob('cable', 0, 2, 1), ob('camera', 0, 2, 3)] },
    { k: 'flat', len: 56, theme: 'studio', f: [['block', 8, 'desk', 4, 1], ['block', 18, 'camera', 2, 3], ['ice', 30, 14], ['hurdle', 44, [1, 2, 1]]], objs: [ob('spot', 0, 1, 3), ob('sofa', 0, 3, 1)] },
    { k: 'trench', len: 48, d: 4, mode: 'stones', theme: 'studio' },
    { k: 'flat', len: 50, theme: 'control', f: [['belt', 4, 14, 1], ['block', 22, 'mixer', 4, 2], ['hurdle', 34, [1, 2, 1]]], objs: [ob('rack', 0, 1, 2), ob('chair', 0, 1, 1)] },
    { k: 'flat', len: 50, theme: 'control', f: [['spring', 6], ['block', 34, 'rack', 1, 3]], objs: [ob('mixer', 0, 3, 2), ob('chair', 0, 1, 1)] },
    { k: 'ladder', h: 15, w: 12, theme: 'tower', deco: 'rack' },
    { k: 'flat', len: 28, theme: 'tower', f: [['deco', 12, 'antenna', 1, 5]], objs: [ob('ac', 0, 3, 2)], items: 1 }
  ], 113, 'flag');
}

/* ---------- 공장: 입고 → 컨베이어 라인(방향이 번갈아) → 쇳물 구덩이 철판 → 승강기 → 상층 통로 → 출하장 ---------- */
function mapFactory() {
  return stripMap([
    { k: 'flat', len: 50, theme: 'factory', f: [['belt', 4, 16, 1], ['belt', 24, 14, -1], ['block', 42, 'crate', 2, 2]], objs: [ob('crate', 0, 2, 1), ob('barrel', 0, 1, 1)] },
    { k: 'flat', len: 60, theme: 'factoryB', f: [['belt', 4, 12, -1], ['belt', 18, 12, 1], ['belt', 32, 12, -1], ['block', 48, 'machine', 4, 3]], objs: [ob('barrel', 0, 1, 1), ob('crate', 0, 2, 2)] },
    { k: 'trench', len: 52, d: 4, mode: 'stones', theme: 'factory' },
    { k: 'flat', len: 54, theme: 'factory', f: [['block', 8, 'machine', 4, 3], ['belt', 18, 14, 1], ['hurdle', 36, [1, 2, 3, 2, 1]]], objs: [ob('crate', 0, 2, 2), ob('barrel', 0, 1, 1)] },
    { k: 'lift', h: 6, land: 8, theme: 'factoryB' },
    { k: 'flat', len: 70, theme: 'factoryB', f: [['block', 8, 'machine', 4, 3], ['belt', 18, 24, 1], ['hurdle', 46, [2, 3, 2]], ['mezz', 56, 10, 3]], objs: [ob('barrel', 0, 1, 2), ob('crate', 0, 3, 2)] },
    { k: 'trench', len: 46, d: 4, mode: 'belt', dir: -1, theme: 'factory' },
    { k: 'flat', len: 50, theme: 'factoryB', f: [['spring', 6], ['belt', 34, 12, 1]], objs: [ob('machine', 0, 4, 3), ob('crate', 0, 2, 2)] },
    { k: 'rise', n: 3, sw: 4, sh: 2, theme: 'yard' },
    { k: 'flat', len: 44, theme: 'yard', f: [['hurdle', 8, [1, 2, 1]], ['block', 30, 'crate', 3, 3]], objs: [ob('crate', 0, 2, 2), ob('barrel', 0, 1, 1)] }
  ], 67, 'flag');
}

/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   그리기: 낮은 해상도 캔버스에 픽셀로 그린 뒤 정수 배율로 키워요 */
'use strict';
const VH = 270;                                  // 화면 세로 (논리 px)
const THEMES = {
  lobby:  { wall: '#d9d2c2', trim: '#b5ab96', floor: '#6f7787', top: '#8f98aa', glass: true },
  office: { wall: '#cfd8e4', trim: '#a8b4c6', floor: '#6a7384', top: '#8a93a4' },
  cafe:   { wall: '#e6d2b0', trim: '#c4a978', floor: '#7b6a58', top: '#9b8a76' },
  server: { wall: '#2c3a52', trim: '#1d2740', floor: '#46526a', top: '#65718a' },
  terminal: { wall: '#e8ecf2', trim: '#bcc6d6', floor: '#8a93a5', top: '#a6afc0', glass: true },
  gates:  { wall: '#dfe6ef', trim: '#b4c0d2', floor: '#78839a', top: '#98a3ba', glass: true },
  bridge: { wall: '#bcc6d6', trim: '#8f9db4', floor: '#6b778e', top: '#8b97ae' },
  subwayB: { wall: '#3a4a5a', trim: '#2a3846', floor: '#5a6572', top: '#e8c040', wain: '#2a3a4c' },
  subway: { wall: '#d6dde2', trim: '#aab6be', floor: '#6a7480', top: '#8a94a0', wain: '#4a8a9a' },
  subwayS: { wall: '#c8d0d8', trim: '#9aa6b2', floor: '#707a86', top: '#909aa6', wain: '#7a8a9a', glass: true },
  mall: { wall: '#f4e6ea', trim: '#d6b8c2', floor: '#8a7480', top: '#b09aa6', wain: '#e8c4d0', glass: true },
  mallF: { wall: '#ece0f4', trim: '#c4b0d6', floor: '#7a6a8a', top: '#9c8cb0', wain: '#d8c4e8' },
  food: { wall: '#f6e2c0', trim: '#d6b078', floor: '#8a6a48', top: '#aa8a66', wain: '#e8a85a' },
  hospital: { wall: '#eef6f6', trim: '#bcd4d6', floor: '#7a9a9c', top: '#9cbcbe', wain: '#cfe8e8', glass: true },
  ward: { wall: '#e4eef6', trim: '#b4c6d8', floor: '#7a8ea4', top: '#9aaec4', wain: '#bcd2e6' },
  lab: { wall: '#dcecf0', trim: '#a8c6cc', floor: '#6c8c94', top: '#8cacb4', wain: '#9cc4cc' },
  hall: { wall: '#f0e2b8', trim: '#c8b078', floor: '#8a7a56', top: '#aa9a74', wain: '#b8a060' },
  class: { wall: '#e6efe0', trim: '#b0c4a4', floor: '#7a8a6e', top: '#9aaa8e', wain: '#c8a672' },
  music: { wall: '#e8dcf0', trim: '#b8a4cc', floor: '#7e6c92', top: '#9e8cb2', wain: '#8a6aa6' },
  gym: { wall: '#f2d8b8', trim: '#d0a468', floor: '#a47a3e', top: '#c49a5e', wain: '#d4864a' },
  factory: { wall: '#9aa0a8', trim: '#6e757e', floor: '#555c66', top: '#7a828c', wain: '#7a6a3a' },
  hotelL: { wall: '#f0e4cc', trim: '#c8a868', floor: '#7a5a3a', top: '#a88a5a', wain: '#8a2a3a', glass: true },
  hotelR: { wall: '#e8d8e0', trim: '#c0a0b4', floor: '#6a5a6a', top: '#8a7a8a', wain: '#a86a8a' },
  ballroom: { wall: '#f6ecd0', trim: '#d8b858', floor: '#a88a4a', top: '#c8aa6a', wain: '#7a2a2a', glass: true },
  pool: { wall: '#d8f0f4', trim: '#8ac8d8', floor: '#4a8aa8', top: '#7ac0d8', wain: '#5ab0d0', glass: true },
  lib: { wall: '#d8c4a0', trim: '#8a6a3a', floor: '#5a4028', top: '#7a5a38', wain: '#5a3a22' },
  libR: { wall: '#cdb890', trim: '#7a5a30', floor: '#54382a', top: '#74543a', wain: '#4a3020', glass: true },
  archive: { wall: '#b8a888', trim: '#7a6a4a', floor: '#4a4234', top: '#6a6250', wain: '#5a5040' },
  muse: { wall: '#ece8e0', trim: '#c0b8a8', floor: '#8a8478', top: '#aaa498', wain: '#bab2a2', glass: true },
  museD: { wall: '#d8d0b8', trim: '#a89a78', floor: '#7a7058', top: '#9a9078', wain: '#8a7a58' },
  museA: { wall: '#f0e8f0', trim: '#c4b0c8', floor: '#8a7a8e', top: '#aa9aae', wain: '#d8c0d8' },
  museS: { wall: '#202a48', trim: '#10182e', floor: '#3a4468', top: '#5a6488', wain: '#101830' },
  arena: { wall: '#c8d4e4', trim: '#8a9ab4', floor: '#5a6678', top: '#7a8698', wain: '#3a5a9a' },
  lockerR: { wall: '#9ab0c0', trim: '#6a8498', floor: '#4a5c6a', top: '#6a7c8a', wain: '#2a4a6a' },
  press: { wall: '#2c3448', trim: '#1c2438', floor: '#44506a', top: '#64708a', wain: '#1c2a4a', glass: true },
  vip: { wall: '#4a2a34', trim: '#2a1620', floor: '#6a4a3a', top: '#8a6a5a', wain: '#2a1018', glass: true },
  studio: { wall: '#1e2038', trim: '#12142a', floor: '#3a3a58', top: '#5a5a78', wain: '#c0306a' },
  control: { wall: '#2a3040', trim: '#181e2c', floor: '#444c60', top: '#646c80', wain: '#2a6a8a' },
  makeup: { wall: '#f4dce8', trim: '#d0a8bc', floor: '#8a6a7a', top: '#aa8a9a', wain: '#e090b8' },
  factoryB: { wall: '#8e8a84', trim: '#66625c', floor: '#52504c', top: '#76726c', wain: '#8a4a2a' }
};
const OBJC = {
  counter: ['#8a5a30', '#c48a50'], plant: ['#2f8a4a', '#6fcf86'], sofa: ['#a8473f', '#d9776d'], gate: ['#566, #aab'], bench: ['#7a5a3a', '#b08a5a'], boxes: ['#b88a50', '#e0b878'],
  desk: ['#7a5a3a', '#c9a06a'], copier: ['#9aa2b2', '#d8deea'], cooler: ['#4a8ad0', '#bfe0ff'], chair: ['#3a4a6a', '#6a7ea8'], cabinet: ['#7d8798', '#aab4c6'],
  trash: ['#4a5a4a', '#8a9a8a'], table: ['#8a6a48', '#d0aa78'], vending: ['#c0392b', '#ff8a7a'], foodbar: ['#8a8a96', '#d0d0dc'],
  rack: ['#222a38', '#4a8aff'], meeting: ['#5a4a3a', '#a08868'], ac: ['#8a929e', '#c8d0dc'], vent: ['#7a828e', '#b4bcc8'], tank: ['#6a7a8a', '#a8bccc'],
  luggage: ['#a8433a', '#e0786a'], barrier: ['#c9a227', '#ffe070'], checkin: ['#3a5a8a', '#7aa8e0'], xray: ['#3a3f4a', '#8a92a2'], bins: ['#5a6a7a', '#a0b0c0'],
  cart: ['#6a7480', '#b0bac6'], turnstile: ['#6a7480', '#e8c040'], pillar: ['#8a94a0', '#c4ccd6'], ticket: ['#3a6a8a', '#8ac4e8'], kiosk: ['#c0852a', '#ffd070'], news: ['#a8483a', '#f0a090'],
  fountain: ['#4a8ac8', '#a8e0ff'], mannequin: ['#d8d0c8', '#f4eee8'], rackc: ['#b0488a', '#f09ad0'], shoes: ['#6a4a8a', '#c8a0e8'], reception: ['#3a8a8a', '#8adcdc'], wheelchair: ['#5a6a7a', '#a8b8c8'],
  bed: ['#e8eef4', '#8ac0e8'], drip: ['#aab4be', '#e0f0ff'], labtable: ['#6a8a96', '#d0e8f0'], scanner: ['#c8d4dc', '#8ab8d8'], locker: ['#4a6a9a', '#8aa8d8'], trophy: ['#c8a028', '#ffe070'], sdesk: ['#9a7a4a', '#d8b878'],
  teacher: ['#5a7a4a', '#9aca7a'], piano: ['#1a1a22', '#f0f0f0'], stool: ['#8a5a3a', '#c8885a'], drums: ['#b83a3a', '#f0c860'], mat: ['#3a8a5a', '#7adca0'], hoop: ['#e8662a', '#ffffff'], horse: ['#8a5a30', '#c0885a'], ball: ['#e8662a', '#ffa860'], bin: ['#5a6a5a', '#9aaa9a'],
  trolley: ['#c8a028', '#f0d870'], minibar: ['#4a4a58', '#8a8a9a'], cake: ['#f0b8c8', '#fff0f4'], chaise: ['#f0f4f8', '#6ac0e8'], parasol: ['#e8483b', '#ffd070'], towels: ['#6ac0e8', '#e8f8ff'],
  shelfb: ['#5a3a22', '#c8a060'], globe: ['#4a8ac8', '#8ad060'], lamp: ['#e8c040', '#fff0a0'], scroll: ['#d8c898', '#f4ecd0'], statue: ['#b8b8c0', '#e8e8f0'], vitrine: ['#8ac8e0', '#d8f4ff'],
  bones: ['#e8e0c8', '#fffaf0'], rope: ['#8a2a3a', '#e8c040'], rock: ['#7a6a58', '#a89878'], easel: ['#8a5a30', '#f0e0c0'], rocket: ['#e8e8f0', '#e8483b'], moon: ['#c0c0c8', '#f0f0f8'],
  hotdog: ['#c0852a', '#ffd070'], banner: ['#3a5aa8', '#f0f0f0'], camera: ['#2a2f3a', '#8a92a2'], spot: ['#2a2f3a', '#fff0a0'], cable: ['#2a2a34', '#e8c040'], mixer: ['#3a4054', '#6aa8e8'], mirror: ['#8ac8e0', '#f4fbff'],
  crate: ['#9a6a30', '#d0a060'], barrel: ['#3a5a8a', '#7aa0d8'], machine: ['#5a6068', '#e8b030'], shelf: ['#7a6a5a', '#c8b098'], seats: ['#3a4a7a', '#7a8ec8'], gatedesk: ['#4a6a4a', '#8ac08a'], cone: ['#e8662a', '#ffb070']
};
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a | 0, b | 0, w | 0, h | 0); };

/* 맵 배경을 한 장으로 미리 그려 두어요 */
function bakeWorld(W) {
  const [c, x] = mkCanvas(W.pw, W.ph);
  for (const rm of W.rooms) {
    const T = THEMES[rm.theme], X = rm.x0 * TS, Y = rm.y0 * TS, w = (rm.x1 - rm.x0 + 1) * TS, h = (rm.y1 - rm.y0 + 1) * TS;
    R(x, T.wall, X, Y, w, h);
    const v = rm.theme === 'server' ? 0 : ((rm.y0 / 6 | 0) * 5 + rm.x0) % 4;      // 층마다 벽 모양이 달라요: 0 기본, 1 넓은 창, 2 창 없는 벽(패널), 3 촘촘한 창
    R(x, ['rgba(0,0,0,0)', 'rgba(120,170,255,.09)', 'rgba(255,190,110,.09)', 'rgba(140,230,160,.08)'][v], X, Y, w, h);
    // 벽 아래쪽 띠와 바닥 가까운 무늬
    const wain = T.wain || { lobby: '#c2b8a0', office: '#b4c0d2', cafe: '#a8793a', server: '#222c42', terminal: '#d2d9e4', gates: '#c6d0de', bridge: '#9fabc2' }[rm.theme];
    R(x, wain, X, Y + h - 30, w, 30); R(x, 'rgba(0,0,0,.12)', X, Y + h - 30, w, 2);
    if (rm.theme === 'cafe') for (let a = X; a < X + w; a += 16) for (let b2 = 0; b2 < 2; b2++) R(x, (a / 16 + b2) % 2 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.1)', a, Y + h - 30 + b2 * 16, 16, 16);
    if (rm.theme === 'lobby' || rm.theme === 'terminal') for (let a = X; a < X + w; a += 64) R(x, 'rgba(255,255,255,.2)', a + 2, Y + h - 28, 28, 26);
    if (rm.theme === 'server') for (let a = X + 6; a < X + w; a += 40) { R(x, '#3a7aff', a, Y + h - 14, 18, 2); R(x, '#6fe08a', a + 22, Y + h - 14, 4, 2); }
    for (let a = X; a < X + w; a += 48) R(x, T.trim, a, Y, 2, h - 30);
    // 창문: 바깥 도시가 보여요
    const wh = h > 150 ? h - 80 : h > 100 ? 44 : 30, step = rm.theme === 'server' ? 160 : [96, 150, 96, 72][v];
    if (v === 2) { for (let a = X + 10; a < X + w - 20; a += 40) { R(x, 'rgba(0,0,0,.1)', a, Y + 10, 30, h - 44); R(x, 'rgba(255,255,255,.12)', a, Y + 10, 30, 2); R(x, T.trim, a + 31, Y + 10, 2, h - 44); } }
    for (let a = X + 22 + (v === 3 ? 30 : 0); a < X + w - 50; a += step) {
      if (v === 2) break;
      if (rm.theme === 'server') { R(x, '#10182a', a, Y + 14, 60, wh); for (let k = 0; k < 6; k++) R(x, '#2a3b66', a + 4 + k * 9, Y + 18 + (k * 7) % 16, 6, 6); continue; }
      drawView(x, W, a, Y + 14, 56, wh, rm);
      R(x, T.trim, a - 2, Y + 12, 60, 2); R(x, T.trim, a - 2, Y + 14 + wh, 60, 3); R(x, T.trim, a + 27, Y + 14, 2, wh);
    }
    // 천장 조명
    if (v === 1) for (let a = X + 30; a < X + w - 20; a += 90) { R(x, '#444', a + 17, Y, 2, 8); R(x, '#f4f0e0', a + 6, Y + 8, 24, 5); R(x, '#fffbe8', a + 9, Y + 11, 18, 2); }
    else for (let a = X + 40 + v * 20; a < X + w - 20; a += v === 3 ? 80 : 120) { R(x, '#f4f0e0', a, Y, 36, 4); R(x, '#fffbe8', a + 4, Y + 4, 28, 2); }
    // 벽 장식 (그림, 시계, 비상구)
    for (let a = X + 70 + v * 31, k = v; a < X + w - 60; a += v === 2 ? 110 : 150, k++) {
      if (rm.theme === 'server') continue;
      if (k % 3 === 0) { R(x, '#5a4630', a, Y + 18, 22, 16); R(x, ['#e8a05a', '#6fb0e8', '#9ad07a'][(a / 150 | 0) % 3], a + 2, Y + 20, 18, 12); R(x, 'rgba(255,255,255,.5)', a + 3, Y + 21, 6, 2); }
      else if (k % 3 === 1) { x.fillStyle = '#f8f8f8'; x.beginPath(); x.arc(a + 8, Y + 24, 7, 0, 7); x.fill(); R(x, '#222', a + 8, Y + 19, 1, 6); R(x, '#222', a + 8, Y + 24, 4, 1); }
      else { R(x, '#1a8a4a', a, Y + 20, 22, 9); R(x, '#fff', a + 3, Y + 23, 16, 2); }
    }
    R(x, 'rgba(0,0,0,.06)', X, Y, w, 5);
  }
  for (const o of W.objs) if (!o.solid) drawObj(x, W, o);
  for (const rm of W.rooms) R(x, 'rgba(30,40,70,.13)', rm.x0 * TS, rm.y0 * TS, (rm.x1 - rm.x0 + 1) * TS, (rm.y1 - rm.y0 + 1) * TS);
  for (let ty = 0; ty < W.h; ty++) for (let tx = 0; tx < W.w; tx++) {
    const c2 = W.g[ty][tx]; if (c2 === '.') continue;
    const rm = W.rooms.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 - 1 && ty <= r.y1 + 1), T = THEMES[rm ? rm.theme : 'office'];
    const X = tx * TS, Y = ty * TS;
    if (c2 === '#') { R(x, T.floor, X, Y, TS, TS); if (tileAt(W, tx, ty - 1) !== '#') R(x, T.top, X, Y, TS, 3); if ((tx + ty) % 2) R(x, 'rgba(0,0,0,.08)', X, Y + 3, TS, TS - 3); }
    else if (c2 === '=') { R(x, '#6b4a2a', X, Y, TS, 4); R(x, '#c89a5a', X, Y, TS, 2); }
    else if (c2 === 'I') { R(x, '#9ad4ee', X, Y, TS, TS); R(x, '#d8f4ff', X, Y, TS, 3); R(x, 'rgba(255,255,255,.7)', X + 3 + (tx * 5 % 7), Y + 6, 5, 1); R(x, 'rgba(255,255,255,.5)', X + 8, Y + 10, 4, 1); }
    else if (c2 === '>' || c2 === '<') { R(x, '#3a3f4a', X, Y, TS, TS); R(x, '#f2b632', X, Y, TS, 2); for (let k = 0; k < TS; k += 8) R(x, '#222', X + k + 3, Y + 5, 2, 8); }
  }
  for (const o of W.objs) if (o.solid) {
    drawObj(x, W, o); const X = o.x * TS, Y = o.y * TS, w = o.w * TS, h = o.h * TS;
    R(x, 'rgba(0,0,0,.28)', X, Y + h, w, 2); R(x, 'rgba(255,255,255,.4)', X + 1, Y, w - 2, 2);
    x.strokeStyle = 'rgba(8,12,28,.95)'; x.lineWidth = 1.5; x.strokeRect(X + .75, Y + .75, w - 1.5, h - 1.5);
  }
  // 출발·도착
  const F = W.finish; R(x, 'rgba(255,255,255,.18)', F.x0 * TS, F.y0 * TS, (F.x1 - F.x0 + 1) * TS, (F.y1 - F.y0 + 1) * TS);
  for (let i = 0; i < (F.x1 - F.x0 + 1) * 2; i++) for (let j = 0; j < 2; j++) R(x, (i + j) % 2 ? '#111' : '#fff', F.x0 * TS + i * 8, F.y0 * TS + j * 8, 8, 8);
  x.fillStyle = '#fff'; x.font = 'bold 12px monospace'; x.fillText('GOAL', F.x0 * TS + 4, F.y0 * TS - 4);
  return c;
}
function drawObj(x, W, o) {
  const X = o.x * TS, Y = o.y * TS, w = o.w * TS, h = o.h * TS, col = OBJC[o.t] || ['#777', '#aaa'];
  switch (o.t) {
    case 'door': R(x, '#4a3a2a', X, Y, w, h); R(x, '#7a5a3a', X + 3, Y + 3, w - 6, h - 3); R(x, '#ffd36b', X + w - 8, Y + h / 2, 3, 3); break;
    case 'liftshaft': R(x, 'rgba(20,30,50,.55)', X, Y, w, h); R(x, 'rgba(140,220,255,.22)', X + 2, Y, w - 4, h); R(x, '#2a3a52', X, Y, 3, h); R(x, '#2a3a52', X + w - 3, Y, 3, h); for (let i = 0; i < h / 20; i++) { const yy = Y + h - 12 - i * 20, cx = X + w / 2; R(x, 'rgba(180,240,255,.8)', cx - 1, yy, 2, 6); R(x, 'rgba(180,240,255,.8)', cx - 3, yy + 2, 2, 2); R(x, 'rgba(180,240,255,.8)', cx + 1, yy + 2, 2, 2); } R(x, '#f2b632', X, Y + h - 3, w, 3); break;
    case 'stairwell': R(x, 'rgba(40,50,70,.28)', X, Y, w, h); for (let i = 0; i < 4; i++) R(x, 'rgba(255,255,255,.25)', X + 4, Y + 8 + i * 22, w - 8, 2); break;
    case 'whiteboard': R(x, '#aaa', X, Y, w, h); R(x, '#f4f6fa', X + 2, Y + 2, w - 4, h - 4); R(x, '#4a8ad0', X + 8, Y + 8, w / 2, 3); R(x, '#d04a4a', X + 8, Y + 16, w / 3, 3); break;
    case 'board': R(x, '#10182a', X, Y, w, h); for (let i = 0; i < 5; i++) { R(x, '#ffcf7a', X + 6, Y + 5 + i * 5, 26, 2); R(x, '#8fd0ff', X + 40, Y + 5 + i * 5, 30, 2); R(x, i === 2 ? '#ff6a5a' : '#6fe08a', X + w - 30, Y + 5 + i * 5, 20, 2); } break;
    case 'helipad': R(x, '#4a5260', X, Y, w, h); R(x, '#f2b632', X + w / 2 - 14, Y - 40, 28, 3); R(x, '#f2b632', X + w / 2 - 14, Y - 40, 3, 20); R(x, '#f2b632', X + w / 2 + 11, Y - 40, 3, 20); R(x, '#f2b632', X + w / 2 - 14, Y - 30, 28, 3); break;
    case 'antenna': R(x, '#555', X + 6, Y, 3, h); R(x, '#f44', X + 4, Y, 7, 3); break;
    case 'detector': R(x, '#555d6a', X, Y, 3, h); R(x, '#555d6a', X + 12, Y, 3, h); R(x, '#555d6a', X, Y, 15, 3); break;
    case 'escalator': R(x, 'rgba(30,40,60,.35)', X, Y, w, h); for (let i = 0; i < 12; i++) R(x, 'rgba(255,255,255,.3)', X + i * 14, Y + h - i * 8 - 4, 12, 2); break;
    case 'plane': R(x, '#eef2f8', X, Y, w, h); R(x, '#4a78c8', X, Y + h * 0.5, w, 6); for (let i = 0; i < 3; i++) R(x, '#7ab0e8', X + 14 + i * 28, Y + 20, 14, 16); R(x, '#cfd6e2', X, Y, 6, h); break;
    case 'gate': R(x, '#566074', X, Y, w, h); R(x, '#8fd0ff', X + 3, Y + 4, w - 6, 5); break;
    case 'plant': R(x, '#7a4a2a', X + 3, Y + h - 8, w - 6, 8); R(x, col[0], X, Y, w, h - 8); R(x, col[1], X + 3, Y + 3, w - 8, h - 14); break;
    case 'rack': R(x, col[0], X, Y, w, h); for (let i = 0; i < 5; i++) { R(x, '#10141c', X + 2, Y + 4 + i * 6, w - 4, 4); R(x, i % 2 ? '#6fe08a' : col[1], X + 4, Y + 5 + i * 6, 3, 2); } break;
    case 'checkin': R(x, col[0], X, Y, w, h); R(x, col[1], X, Y, w, 4); R(x, '#10182a', X + 6, Y + 10, w - 12, 10); R(x, '#fff', X + 8, Y + 12, 14, 2); break;
    case 'vending': R(x, col[0], X, Y, w, h); R(x, '#fff3', X + 3, Y + 4, w - 12, h - 10); for (let i = 0; i < 3; i++) R(x, col[1], X + 5, Y + 7 + i * 7, w - 16, 3); break;
    case 'table': case 'desk': case 'bench': case 'meeting': case 'counter': case 'foodbar': R(x, col[1], X, Y, w, 5); R(x, col[0], X + 2, Y + 5, 3, h - 5); R(x, col[0], X + w - 5, Y + 5, 3, h - 5); if (h > 20) R(x, col[0], X, Y + 5, w, h - 5); break;
    case 'train': R(x, '#d0d6de', X, Y, w, h); R(x, '#2a6ac8', X, Y + h - 10, w, 6); for (let i = 0; i < 6; i++) { R(x, '#10182a', X + 8 + i * 60, Y + 6, 42, 18); R(x, '#8ac0f0', X + 10 + i * 60, Y + 8, 38, 14); } break;
    case 'bed': R(x, '#8a949e', X, Y + h - 4, w, 4); R(x, col[0], X + 2, Y + 3, w - 4, h - 7); R(x, col[1], X + w - 22, Y + 3, 20, h - 7); R(x, '#fff', X + 4, Y + 1, 14, 5); break;
    case 'piano': R(x, col[0], X, Y, w, h); R(x, col[1], X + 3, Y + 5, w - 6, 6); for (let i = 0; i < w - 6; i += 4) R(x, '#111', X + 5 + i, Y + 5, 1, 4); break;
    case 'hoop': R(x, '#aaa', X + 6, Y, 3, h); R(x, '#fff', X, Y, 16, 12); R(x, col[0], X + 4, Y + 6, 10, 2); break;
    case 'machine': R(x, col[0], X, Y, w, h); R(x, col[1], X + 3, Y + 3, w - 6, 5); for (let i = 0; i < 3; i++) R(x, '#222', X + 4 + i * 12, Y + 12, 8, 8); R(x, '#ff5a3a', X + w - 8, Y + 4, 3, 3); break;
    case 'fountain': R(x, col[0], X, Y + h - 8, w, 8); R(x, col[1], X + 3, Y + h - 6, w - 6, 3); R(x, col[1], X + w / 2 - 2, Y, 4, h - 8); break;
    case 'mannequin': R(x, col[1], X + 4, Y, 8, 8); R(x, col[0], X + 3, Y + 9, 10, 20); R(x, '#444', X + 6, Y + 29, 4, h - 29); break;
    case 'locker': for (let i = 0; i < o.w; i++) { R(x, col[0], X + i * TS + 1, Y, 14, h); R(x, col[1], X + i * TS + 3, Y + 3, 10, 3); R(x, '#222', X + i * TS + 11, Y + h / 2, 2, 4); } break;
    case 'crate': R(x, col[0], X, Y, w, h); R(x, col[1], X + 2, Y + 2, w - 4, 3); R(x, 'rgba(0,0,0,.25)', X + w / 2 - 1, Y, 2, h); break;
    case 'drip': R(x, '#9aa4ae', X + 6, Y, 2, h); R(x, col[1], X + 3, Y + 2, 8, 10); break;
    case 'seats': for (let i = 0; i < o.w; i++) { R(x, col[0], X + i * TS + 1, Y + 4, 14, 12); R(x, col[1], X + i * TS + 1, Y, 14, 6); } break;
    case 'sofa': R(x, col[0], X, Y + 4, w, h - 4); R(x, col[1], X + 2, Y, w - 4, 7); break;
    case 'luggage': R(x, col[0], X + 1, Y + 2, w - 2, h - 2); R(x, col[1], X + 3, Y + 4, w - 6, 2); R(x, '#222', X + w / 2 - 2, Y - 2, 4, 3); break;
    case 'cone': R(x, col[0], X + 3, Y + 2, 10, 14); R(x, '#fff', X + 4, Y + 7, 8, 3); break;
    default: R(x, col[0], X, Y, w, h); R(x, col[1], X + 1, Y + 1, w - 2, 3); R(x, 'rgba(0,0,0,.18)', X, Y + h - 3, w, 3);
  }
}

/* 사람 */
function drawRacer(x, r, t, me) {
  const px = Math.round(r.x - 3), py = Math.round(r.y - 0), f = r.face, walk = Math.abs(r.vx) > 20 && r.ground, ph = walk ? Math.floor(r.anim / 7) % 2 : 0;
  if (r.inv > 0 && Math.floor(t * 14) % 2) return;
  R(x, 'rgba(0,0,0,.22)', px + 1, r.y + PH.H - 1, 14, 2);
  x.save(); x.translate(px + 8, py);
  if (f < 0) x.scale(-1, 1); x.translate(-8, 0);
  const dead = r.stun > 0, flash = r.flash > 0;
  const bc = r.skin === 'gold' ? '#e8b830' : r.col, body = flash ? '#fff' : bc, dark = flash ? '#fff' : shade(bc, -50);
  const hair = flash ? '#fff' : ['#2a2430', '#6a3a1a', '#d8b050', '#8a2a2a'][(r.slot | 0) % 4]; R(x, '#e8c39a', 5, 0, 8, 7); R(x, hair, 4, -1, 10, 3); R(x, hair, 4, 2, 2, 3); R(x, '#111', 10, 3, 2, 2);          // 머리
  R(x, body, 4, 7, 10, 8);                                                                                       // 몸통
  R(x, dark, 4, 15, 10, 2); R(x, shade(r.col, 40), 4, 7, 10, 1); R(x, dark, 8, 8, 2, 6);
  if (!r.ground) { R(x, '#2a3350', 5, 17, 3, 4); R(x, '#2a3350', 10, 15, 3, 4); }
  else if (walk) { R(x, '#2a3350', ph ? 4 : 7, 17, 3, 5); R(x, '#2a3350', ph ? 10 : 8, 17, 3, 5); }
  else { R(x, '#2a3350', 5, 17, 3, 5); R(x, '#2a3350', 10, 17, 3, 5); }
  R(x, '#e8c39a', dead ? 2 : 12, dead ? 8 : 9, 3, 3);                                                              // 팔
  if (r.skin && !flash) drawSkin(x, r.skin);
  x.restore();
  if (r.wep) {
    const w = WEAPONS[r.wep.k], sw = r.swing > 0 ? (1 - r.swing / 0.18) : 0;
    let a = (Math.cos(r.aim) * f >= 0) ? r.aim : (f > 0 ? 0 : Math.PI);      // 몸이 보는 쪽과 조준이 어긋나면 몸 방향
    if (w.kind === 'melee' && r.swing > 0) a += (sw - 0.5) * 2.2 * f;
    x.save(); x.translate(r.x + 5, r.y + 10); x.rotate(a); if (Math.cos(a) < 0) x.scale(1, -1);
    drawWep(x, r.wep.k); x.restore();
  }
}
function drawSkin(x, k) {
  switch (k) {
    case 'ears': R(x, '#2a2430', 4, -4, 3, 3); R(x, '#2a2430', 11, -4, 3, 3); R(x, '#f09ab8', 5, -3, 1, 1); R(x, '#f09ab8', 12, -3, 1, 1); break;
    case 'bunny': R(x, '#f4f4f4', 5, -10, 3, 9); R(x, '#f4f4f4', 10, -10, 3, 9); R(x, '#f09ab8', 6, -8, 1, 6); R(x, '#f09ab8', 11, -8, 1, 6); break;
    case 'shades': R(x, '#111', 5, 2, 9, 3); R(x, '#6ac0e8', 6, 3, 3, 1); R(x, '#6ac0e8', 10, 3, 3, 1); break;
    case 'helm': R(x, '#f2b632', 3, -4, 12, 5); R(x, '#c8901a', 3, 0, 12, 1); R(x, '#fff3a0', 8, -5, 3, 1); break;
    case 'ninja': R(x, '#1a1a22', 4, -1, 10, 3); R(x, '#e8483b', 13, 0, 4, 1); R(x, '#1a1a22', 5, 4, 8, 3); break;
    case 'cape': R(x, '#c0302a', 1, 8, 4, 11); R(x, '#8a1a1a', 1, 8, 1, 11); R(x, '#e8c040', 4, 8, 1, 2); break;
    case 'halo': R(x, '#fff3a0', 5, -7, 8, 1); R(x, '#fff3a0', 4, -6, 1, 1); R(x, '#fff3a0', 13, -6, 1, 1); R(x, '#fff3a0', 5, -5, 8, 1); break;
    case 'crown': R(x, '#ffd36b', 4, -5, 10, 4); R(x, '#ffd36b', 4, -7, 2, 2); R(x, '#ffd36b', 8, -8, 2, 3); R(x, '#ffd36b', 12, -7, 2, 2); R(x, '#e8483b', 8, -4, 2, 2); break;
    case 'gold': R(x, '#fff3a0', 4, 7, 10, 1); R(x, '#fff3a0', 8, 9, 2, 2); break;
  }
}
function drawWep(x, k) {
  switch (k) {
    case 'bat': R(x, '#c89a5a', 2, -1, 18, 3); R(x, '#8a5a30', 16, -2, 5, 5); break;
    case 'pan': R(x, '#555', 2, -1, 8, 2); R(x, '#222', 10, -4, 9, 8); R(x, '#666', 11, -3, 7, 6); break;
    case 'pistol': R(x, '#2a2f3a', 2, -2, 10, 4); R(x, '#2a2f3a', 2, 1, 4, 5); R(x, '#8a92a2', 11, -2, 3, 2); break;
    case 'ext': R(x, '#c0392b', 2, -3, 8, 8); R(x, '#222', 9, -2, 5, 2); R(x, '#eee', 2, -1, 8, 2); break;
    case 'bazooka': R(x, '#4a5a3a', -2, -3, 20, 6); R(x, '#2a3320', 16, -4, 4, 8); R(x, '#888', 4, 3, 3, 4); break;
    case 'hammer': R(x, '#8a5a30', 2, -1, 14, 3); R(x, '#6a7480', 13, -5, 8, 11); R(x, '#b0bac6', 13, -5, 8, 2); break;
    case 'mop': R(x, '#c89a5a', 2, -1, 20, 2); R(x, '#e8e4d8', 20, -4, 7, 8); R(x, '#bdb8a8', 20, 2, 7, 2); break;
    case 'sling': R(x, '#8a5a30', 3, -1, 8, 3); R(x, '#8a5a30', 9, -6, 2, 6); R(x, '#8a5a30', 13, -6, 2, 6); R(x, '#e8c39a', 9, -7, 6, 1); break;
    case 'hose': R(x, '#c0392b', 0, -3, 9, 8); R(x, '#222', 8, -2, 7, 4); R(x, '#4a8ad0', 14, -2, 4, 4); R(x, '#e8c040', 0, 4, 9, 2); break;
    case 'banana': R(x, '#f2d040', 2, -2, 12, 4); R(x, '#f2d040', 12, -4, 3, 3); R(x, '#c8a020', 2, 1, 12, 1); R(x, '#6a4a20', 2, -3, 2, 2); break;
    case 'shotgun': R(x, '#5a3a20', 0, -1, 7, 4); R(x, '#2a2f3a', 6, -2, 13, 3); R(x, '#2a2f3a', 6, 1, 11, 1); break;
    case 'bow': R(x, '#8a5a30', 6, -7, 2, 14); R(x, '#8a5a30', 8, -7, 3, 2); R(x, '#8a5a30', 8, 5, 3, 2); R(x, '#e8e4d8', 5, -6, 1, 12); R(x, '#c8c8c8', 6, -1, 10, 1); break;
    case 'minigun': R(x, '#3a4350', 0, -3, 9, 7); R(x, '#222', 8, -3, 11, 2); R(x, '#222', 8, 0, 11, 2); R(x, '#c0392b', 2, 4, 5, 3); break;
    case 'firework': R(x, '#a8473f', -1, -3, 18, 6); R(x, '#f2b632', 2, -3, 3, 6); R(x, '#f2b632', 9, -3, 3, 6); R(x, '#ffe070', 17, -2, 3, 4); break;
  }
}
function shade(h, d) { const n = parseInt(h.slice(1), 16), c = v => Math.max(0, Math.min(255, v + d)); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => c(v).toString(16).padStart(2, '0')).join(''); }

function drawItems(x, G, t) {
  for (const it of G.items) {
    if (!it.on) continue;
    const bob = Math.sin(t * 3 + it.id) * 2;
    x.save(); x.translate(it.x - 6, it.y - 8 + bob);
    R(x, 'rgba(255,240,150,.35)', -6, -6, 28, 20);
    x.rotate(-0.4); drawWep(x, it.k); x.restore();
  }
}
function drawShots(x, G) {
  for (const s of G.shots) {
    if (s.k === 'ext') { R(x, 'rgba(255,255,255,.8)', s.x - 2, s.y - 2, 4, 4); }
    else if (s.k === 'hose') { R(x, 'rgba(120,200,255,.85)', s.x - 2, s.y - 2, 5, 5); }
    else if (s.k === 'bazooka') { R(x, '#444', s.x - 5, s.y - 2, 10, 4); R(x, '#ff7a2a', s.x - (s.vx > 0 ? 9 : -5), s.y - 1, 4, 2); }
    else if (s.k === 'firework') { R(x, '#e8483b', s.x - 3, s.y - 2, 7, 3); R(x, ['#ffe070', '#ff7ad0', '#7affd0'][(s.x / 6 | 0) % 3], s.x - (s.vx > 0 ? 7 : -4), s.y - 2, 3, 3); }
    else if (s.k === 'shotgun') { R(x, '#d8d0b0', s.x - 1, s.y - 1, 3, 3); }
    else if (s.k === 'bow') { R(x, '#c8c8c8', s.x - 4, s.y - 1, 9, 1); R(x, '#8a5a30', s.x - (s.vx > 0 ? 5 : -4), s.y - 2, 2, 3); }
    else if (s.k === 'minigun') { R(x, '#ffb040', s.x - 2, s.y - 1, 4, 2); }
    else if (s.k === 'sling') { R(x, '#b0bac6', s.x - 1, s.y - 1, 3, 3); }
    else R(x, '#ffe070', s.x - 2, s.y - 1, 5, 3);
  }
}
function drawFx(x, fx) {
  for (const f of fx) {
    const k = f.age / f.life;
    if (f.t === 'hit') { for (let i = 0; i < 6; i++) { const a = i * 1.05 + f.s; R(x, '#fff', f.x + Math.cos(a) * 14 * k, f.y + Math.sin(a) * 14 * k, 3, 3); } }
    else if (f.t === 'boom') { x.fillStyle = k < .4 ? '#ffe070' : '#ff7a2a'; x.beginPath(); x.arc(f.x, f.y, 10 + 40 * k, 0, 7); x.globalAlpha = 1 - k; x.fill(); x.globalAlpha = 1; }
    else if (f.t === 'dust') R(x, 'rgba(255,255,255,' + (0.6 * (1 - k)) + ')', f.x + f.dx * k * 8, f.y - k * 6, 3, 3);
    else if (f.t === 'ko') { for (let i = 0; i < 10; i++) { const a = i * .63; R(x, i % 2 ? '#ffd36b' : '#ff6a5a', f.x + Math.cos(a) * 30 * k, f.y + Math.sin(a) * 30 * k - 8 * k, 4, 4); } }
  }
}

/* 건물 밖 풍경 (카메라보다 천천히 움직여요) */
function drawBackdrop(x, W, t, cx, cy, vw) {
  const sk = MAPS[W.id].sky, g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]); x.fillStyle = g; x.fillRect(0, 0, vw + 2, VH + 2);
  if (W.id === 'airport') { x.fillStyle = '#ffe8b0'; x.beginPath(); x.arc(vw * .78, 52 - cy * .02, 22, 0, 7); x.fill(); }
  for (let i = 0; i < 7; i++) { const px = ((i * 173 - cx * .08 - t * (3 + i)) % (vw + 160) + vw + 160) % (vw + 160) - 80; R(x, 'rgba(255,255,255,.7)', px, 26 + (i * 41) % 70, 46 + (i * 13) % 30, 7); R(x, 'rgba(255,255,255,.5)', px + 10, 20 + (i * 41) % 70, 28, 6); }
  const base = VH - cy * .3 + 40;
  for (let layer = 0; layer < 2; layer++) {
    const f = .12 + layer * .18, col = layer ? '#5e7aa6' : '#8da6c8';
    for (let i = -2; i < vw / 26 + 8; i++) {
      const wx = i * 34 + (-(cx * f) % 34), seed = Math.floor((i * 34 + cx * f) / 34), bh = 50 + ((seed * 53) % 70) + layer * 20;
      R(x, col, wx, base - bh - layer * 20, 30, bh + 80);
      for (let k = 0; k < 6; k++) R(x, 'rgba(255,240,190,.35)', wx + 4 + (k % 2) * 13, base - bh - layer * 20 + 6 + ((k / 2) | 0) * 12, 6, 6);
    }
  }
  if (W.id === 'airport') {   // 관제탑과 비행기
    const tx = vw * .3 - cx * .25; R(x, '#9aa8c0', tx, VH - 130 - cy * .2, 10, 90); R(x, '#6a7a98', tx - 10, VH - 150 - cy * .2, 30, 20); R(x, '#aee4ff', tx - 8, VH - 146 - cy * .2, 26, 8);
    const px = ((t * 26) % (vw + 200)) - 100, py = 74 - cy * .05; R(x, '#fff', px, py, 36, 6); R(x, '#fff', px + 10, py - 8, 8, 8); R(x, '#4a78c8', px + 28, py - 8, 6, 8); R(x, '#cfd6e2', px + 6, py + 4, 20, 3);
  }
}
/* 은은한 조명과 가장자리 어둡힘 */
function drawShade(x, W, cx, cy, vw) {
  x.save(); x.translate(-Math.round(cx), -Math.round(cy));
  for (const rm of W.rooms) { const X = rm.x0 * TS, Y = rm.y0 * TS, w = (rm.x1 - rm.x0 + 1) * TS, h = (rm.y1 - rm.y0 + 1) * TS;
    for (let a = X + 58; a < X + w - 20; a += 120) { if (a < cx - 80 || a > cx + vw + 80) continue; const g = x.createRadialGradient(a, Y + 4, 2, a, Y + 4, 70); g.addColorStop(0, 'rgba(255,248,210,.28)'); g.addColorStop(1, 'rgba(255,248,210,0)'); x.fillStyle = g; x.fillRect(a - 70, Y, 140, Math.min(h, 100)); } }
  x.restore();
  const g = x.createRadialGradient(vw / 2, VH / 2, VH * .45, vw / 2, VH / 2, VH * 1.05); g.addColorStop(0, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,.35)'); x.fillStyle = g; x.fillRect(0, 0, vw + 2, VH + 2);
}

/* ---------- 창밖 풍경: 맵마다 다르고, 창이 이어져서 하나의 파노라마처럼 보여요 ---------- */
const hs = n => { n = Math.imul(n | 0, 2654435761) >>> 0; n = Math.imul(n ^ (n >>> 15), 2246822519) >>> 0; return ((n ^ (n >>> 13)) >>> 8) / 16777216; };
function drawView(x, W, a, y, w, h, rm) {
  const sk = MAPS[W.id].sky, low = rm.y0 / W.h, hy = y + h * (1.15 - 0.75 * low);     // 아래층일수록 땅이 보여요
  x.save(); x.beginPath(); x.rect(a, y, w, h); x.clip();
  const g = x.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]); x.fillStyle = g; x.fillRect(a, y, w, h);
  const id = W.id, X0 = a - 40, X1 = a + w + 40;
  // 구름
  for (let k = Math.floor(X0 / 90); k <= X1 / 90; k++) if (hs(k * 7 + 1) > .45) R(x, 'rgba(255,255,255,.55)', k * 90 + hs(k) * 40, y + 3 + hs(k * 3) * h * .35, 26 + hs(k * 5) * 26, 5);
  const cell = (step, seed, fn) => { for (let k = Math.floor(X0 / step) - 1; k <= X1 / step + 1; k++) fn(k * step + hs(k * 3 + seed) * step * .4, k, hs(k * 11 + seed)); };
  if (id === 'office') {
    cell(26, 5, (px, k, r) => { const bh = 14 + r * 28; R(x, '#8fa4c4', px, hy - bh, 20, bh + 40); });
    cell(34, 9, (px, k, r) => { const bh = 24 + r * 46, bw = 18 + hs(k) * 14; R(x, '#5f7aa8', px, hy - bh, bw, bh + 40); R(x, '#4a6490', px, hy - bh, bw, 2); for (let q = 0; q < bh; q += 6) for (let c = 0; c < bw - 3; c += 6) if (hs(k * 97 + q * 13 + c) > .45) R(x, 'rgba(255,236,170,.7)', px + 2 + c, hy - bh + 3 + q, 3, 3); if (r > .7) { R(x, '#6a7a96', px + bw / 2, hy - bh - 9, 1, 9); R(x, '#ff5a4a', px + bw / 2 - 1, hy - bh - 10, 3, 2); } if (r < .2) { R(x, '#223', px + 2, hy - bh - 7, bw - 4, 7); R(x, '#ffcf6a', px + 4, hy - bh - 5, bw - 8, 3); } });
    cell(110, 3, (px, k, r) => { if (r > .5) { R(x, '#223', px, y + 8 + r * 20, 2, 1); R(x, '#223', px + 3, y + 7 + r * 20, 2, 1); } });
    R(x, '#38445c', X0, hy + 14, X1 - X0, 40); cell(48, 2, (px, k, r) => R(x, ['#e8483b', '#f2b632', '#fff', '#3b8de8'][k & 3], px, hy + 18, 9, 4));
  } else if (id === 'airport') {
    cell(40, 4, (px, k, r) => { if (r > .6) { R(x, '#9aa8c0', px, hy - 22 - r * 8, 3, 22 + r * 8); R(x, '#6a7a98', px - 5, hy - 30 - r * 8, 14, 8); R(x, '#aee4ff', px - 4, hy - 28 - r * 8, 12, 4); } else { R(x, '#8a96ae', px, hy - 10 - r * 8, 26, 12 + r * 8); R(x, '#6a7a98', px, hy - 10 - r * 8, 26, 2); } });
    R(x, '#59606c', X0, hy, X1 - X0, 50); for (let px = Math.floor(X0 / 16) * 16; px < X1; px += 16) R(x, '#e8e8f0', px, hy + 14, 9, 2);
    cell(140, 8, (px, k, r) => { const py = hy - 4 + (k % 2) * 12; R(x, '#fff', px, py - 5, 40, 6); R(x, '#fff', px + 34, py - 11, 6, 7); R(x, '#c63a3a', px + 36, py - 11, 4, 3); R(x, '#4a78c8', px + 8, py - 3, 24, 1); R(x, '#cfd6e2', px + 14, py + 1, 14, 3); for (let q = 0; q < 6; q++) R(x, '#6a98d8', px + 8 + q * 4, py - 4, 2, 1); });
  } else if (id === 'subway') {
    cell(60, 6, (px, k, r) => { const bh = 36 + r * 26; R(x, ['#b6785a', '#8a6a7a', '#7a8aa0', '#c0a070'][k & 3], px, hy - bh, 54, bh + 40); for (let q = 4; q < bh - 8; q += 9) for (let c = 4; c < 48; c += 11) R(x, hs(k * 31 + q + c) > .4 ? '#ffe9a0' : '#3a4a68', px + c, hy - bh + q, 6, 5); R(x, ['#e8483b', '#2a9a6a', '#f2b632'][k % 3], px + 4, hy - 8, 46, 8); });
    R(x, '#444c58', X0, hy + 8, X1 - X0, 40); R(x, '#8a929e', X0, hy + 6, X1 - X0, 3);
    cell(70, 2, (px, k, r) => { if (k % 2) { R(x, '#e8c040', px, hy + 14, 34, 9); R(x, '#fff', px + 3, hy + 15, 6, 4); R(x, '#fff', px + 12, hy + 15, 6, 4); R(x, '#fff', px + 21, hy + 15, 6, 4); } else { R(x, '#3b8de8', px, hy + 17, 20, 6); R(x, '#aee4ff', px + 12, hy + 15, 6, 3); } R(x, '#111', px + 4, hy + 22, 4, 2); R(x, '#111', px + 14, hy + 22, 4, 2); });
    cell(50, 12, (px, k, r) => { R(x, '#5a6270', px, hy - 20, 2, 28); R(x, '#ffe9a0', px - 3, hy - 22, 8, 3); });
  } else if (id === 'mall') {
    cell(70, 7, (px, k, r) => { const bh = 30 + r * 36; R(x, ['#e8a0b8', '#c8a0e0', '#f0c8a0'][k % 3], px, hy - bh, 62, bh + 40); R(x, 'rgba(255,255,255,.4)', px, hy - bh, 62, 3); for (let q = 6; q < bh - 6; q += 10) for (let c = 5; c < 56; c += 12) R(x, '#9ad0f0', px + c, hy - bh + q, 7, 6); });
    cell(36, 5, (px, k, r) => { R(x, '#6a4a2a', px + 4, hy - 8, 3, 12); x.fillStyle = r > .5 ? '#3a9a5a' : '#58b86e'; x.beginPath(); x.arc(px + 5.5, hy - 12, 8, 0, 7); x.fill(); });
    R(x, '#b49aa6', X0, hy + 6, X1 - X0, 40); cell(30, 9, (px, k, r) => { R(x, ['#ff6a8a', '#ffd36b', '#6ad0ff', '#9ae06a'][k & 3], px, hy - 24 + Math.sin(k) * 2, 6, 5); R(x, '#fff8', px, hy - 30, 1, 30); });
  } else if (id === 'hospital') {
    R(x, '#8ec88a', X0, hy - 6, X1 - X0, 60); cell(80, 3, (px, k, r) => { x.fillStyle = r > .5 ? '#7ab87a' : '#9ad49a'; x.beginPath(); x.ellipse(px + 30, hy - 4, 44, 14 + r * 12, 0, Math.PI, 0); x.fill(); });
    cell(150, 8, (px, k, r) => { if (k % 3 === 0) { R(x, '#f4f8fb', px, hy - 46, 48, 52); for (let q = 6; q < 40; q += 10) for (let c = 5; c < 42; c += 11) R(x, '#8ac0e0', px + c, hy - 42 + q, 6, 6); R(x, '#e8483b', px + 20, hy - 54, 8, 3); R(x, '#e8483b', px + 22, hy - 56, 4, 7); } });
    cell(30, 5, (px, k, r) => { R(x, '#6a4a2a', px + 5, hy - 6, 3, 14); x.fillStyle = ['#2f8a4a', '#4aa85a', '#d89a3a'][k % 3]; x.beginPath(); x.arc(px + 6.5, hy - 10, 9 + r * 3, 0, 7); x.fill(); });
    R(x, '#7ac0e8', X0 + 20, hy + 12, 50, 12); R(x, '#cfd6c8', X0, hy + 26, X1 - X0, 20);
  } else if (id === 'school') {
    R(x, '#78b858', X0, hy, X1 - X0, 60); R(x, 'rgba(255,255,255,.25)', X0, hy + 22, X1 - X0, 2);
    cell(160, 4, (px, k, r) => { R(x, '#a8503a', px, hy - 36, 70, 40); R(x, '#8a3e2e', px - 3, hy - 40, 76, 5); for (let q = 6; q < 30; q += 12) for (let c = 6; c < 64; c += 14) R(x, '#bfe2f4', px + c, hy - 34 + q, 8, 7); R(x, '#6a3a22', px + 30, hy - 14, 10, 18); });
    cell(60, 6, (px, k, r) => { if (k % 3 === 1) { R(x, '#fff', px, hy + 6, 2, 12); R(x, '#fff', px + 22, hy + 6, 2, 12); R(x, '#fff', px, hy + 6, 24, 2); R(x, 'rgba(255,255,255,.35)', px + 2, hy + 8, 20, 10); } else if (k % 3 === 2) { R(x, '#6a4a2a', px + 5, hy - 8, 3, 14); x.fillStyle = '#3a9a4a'; x.beginPath(); x.arc(px + 6.5, hy - 12, 9, 0, 7); x.fill(); } });
    cell(220, 2, (px, k, r) => { R(x, '#ccc', px, hy - 44, 2, 48); R(x, '#e8483b', px + 2, hy - 44, 12, 7); R(x, '#fff', px + 2, hy - 41, 12, 2); });
  } else if (id === 'hotel') {
    R(x, '#5aa8d8', X0, hy - 4, X1 - X0, 60); cell(40, 3, (px, k, r) => { R(x, 'rgba(255,255,255,.35)', px, hy + 2 + r * 8, 28, 2); });
    cell(90, 7, (px, k, r) => { const bh = 30 + r * 40; R(x, ['#e8d8b8', '#d8b8a0', '#b8c8d8'][k % 3], px, hy - bh, 40, bh + 20); for (let q = 4; q < bh - 4; q += 8) for (let c = 4; c < 34; c += 9) R(x, '#6a8ab0', px + c, hy - bh + q, 5, 4); });
    cell(34, 5, (px, k, r) => { R(x, '#7a5a3a', px + 4, hy - 8, 3, 10); x.fillStyle = '#3a9a5a'; x.beginPath(); x.arc(px + 5.5, hy - 12, 8, 0, 7); x.fill(); });
    R(x, '#e8d8b0', X0, hy + 20, X1 - X0, 20);
  } else if (id === 'library') {
    R(x, '#6a8a5a', X0, hy - 2, X1 - X0, 60); cell(60, 4, (px, k, r) => { R(x, '#6a4a2a', px + 10, hy - 22 - r * 8, 5, 26); x.fillStyle = ['#c8683a', '#e8a83a', '#a84a2a'][k % 3]; x.beginPath(); x.arc(px + 12.5, hy - 26 - r * 8, 13, 0, 7); x.fill(); });
    cell(170, 8, (px, k, r) => { R(x, '#8a7a68', px, hy - 40, 60, 46); R(x, '#6a5a48', px - 3, hy - 44, 66, 6); for (let c = 6; c < 56; c += 12) R(x, '#d8c88a', px + c, hy - 34, 6, 22); });
    R(x, '#a89870', X0, hy + 16, X1 - X0, 20);
  } else if (id === 'museum') {
    cell(90, 5, (px, k, r) => { R(x, '#d8d4c8', px, hy - 26, 70, 32); R(x, '#b8b0a0', px - 3, hy - 32, 76, 7); for (let c = 6; c < 66; c += 12) R(x, '#e8e4d8', px + c, hy - 24, 6, 26); });
    cell(50, 2, (px, k, r) => { R(x, '#6a4a2a', px + 5, hy - 6, 3, 12); x.fillStyle = '#4a9a5a'; x.beginPath(); x.arc(px + 6.5, hy - 10, 7, 0, 7); x.fill(); });
    R(x, '#c8c0b0', X0, hy + 10, X1 - X0, 30); cell(32, 9, (px, k, r) => R(x, '#a8a090', px, hy + 14, 20, 2));
  } else if (id === 'stadium') {
    R(x, '#58a858', X0, hy, X1 - X0, 60); cell(34, 3, (px, k, r) => R(x, k % 2 ? '#4c9a4c' : '#62b462', px, hy, 34, 60));
    cell(100, 6, (px, k, r) => { R(x, '#8a909c', px, hy - 40, 6, 44); R(x, '#fff8c0', px - 6, hy - 46, 18, 7); for (let c = 0; c < 18; c += 6) R(x, '#fff', px - 5 + c, hy - 45, 4, 5); });
    cell(60, 9, (px, k, r) => { R(x, ['#e8483b', '#3b8de8', '#f2b632'][k % 3], px, hy - 14 - r * 6, 40, 16 + r * 6); R(x, 'rgba(255,255,255,.25)', px, hy - 14 - r * 6, 40, 2); });
    R(x, '#f0f0f0', X0, hy + 22, X1 - X0, 2);
  } else if (id === 'studio') {
    cell(44, 4, (px, k, r) => { const bh = 20 + r * 50; R(x, ['#3a3a6a', '#5a3a6a', '#2a4a7a'][k % 3], px, hy - bh, 36, bh + 40); for (let q = 4; q < bh - 4; q += 7) for (let c = 4; c < 30; c += 8) if (hs(k * 13 + q * 3 + c) > .35) R(x, '#ffd36b', px + c, hy - bh + q, 4, 3); });
    cell(160, 8, (px, k, r) => { R(x, '#c0c8d8', px + 6, hy - 60, 2, 66); R(x, '#e8483b', px + 2, hy - 60, 10, 3); R(x, '#e8483b', px + 4, hy - 40, 6, 2); R(x, '#fff', px + 6, hy - 64, 2, 4); });
    R(x, '#22223a', X0, hy + 10, X1 - X0, 40); cell(30, 2, (px, k, r) => R(x, k % 2 ? '#e8483b' : '#ffd36b', px, hy + 14, 4, 2));
  } else {    // factory
    cell(46, 5, (px, k, r) => { R(x, '#6a6460', px, hy - 14 - r * 10, 40, 30 + r * 10); for (let c = 0; c < 40; c += 10) { R(x, '#6a6460', px + c, hy - 20 - r * 10, 8, 6); } });
    cell(90, 8, (px, k, r) => { const bh = 34 + r * 22; R(x, '#4a423c', px, hy - bh, 9, bh + 20); R(x, '#d04a2a', px, hy - bh, 9, 3); R(x, '#d04a2a', px, hy - bh + 8, 9, 3); for (let q = 0; q < 4; q++) { x.fillStyle = 'rgba(190,182,170,' + (.55 - q * .12) + ')'; x.beginPath(); x.arc(px + 4 + q * 5 + Math.sin(k) * 3, hy - bh - 4 - q * 8, 5 + q * 2.5, 0, 7); x.fill(); } });
    cell(130, 11, (px, k, r) => { if (k % 2) { R(x, '#7a8a96', px, hy - 22, 26, 28); x.fillStyle = '#7a8a96'; x.beginPath(); x.ellipse(px + 13, hy - 22, 13, 6, 0, Math.PI, 0); x.fill(); R(x, 'rgba(255,255,255,.3)', px + 4, hy - 20, 3, 24); } });
    R(x, '#3a3632', X0, hy + 10, X1 - X0, 40); R(x, '#d8a02a', X0, hy + 10, X1 - X0, 2); cell(56, 4, (px, k, r) => R(x, '#8a8c92', px, hy + 5, 40, 3));
  }
  // 유리 반사와 모서리 어둡힘
  R(x, 'rgba(255,255,255,.12)', a, y, w, 5); const gg = x.createLinearGradient(a, y, a + w, y + h); gg.addColorStop(0, 'rgba(255,255,255,.22)'); gg.addColorStop(.35, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(a, y, w, h);
  x.restore();
}

/* ---------- 바나나, 물청소, 점검, 이모티콘 ---------- */
function drawTraps(x, list) { for (const t of list) { const X = Math.round(t.x), Y = Math.round(t.y); R(x, 'rgba(0,0,0,.25)', X - 5, Y - 1, 10, 2); R(x, '#f2d040', X - 5, Y - 4, 10, 3); R(x, '#f2d040', X - 3, Y - 6, 3, 2); R(x, '#c8a020', X - 5, Y - 2, 10, 1); R(x, '#6a4a20', X + 4, Y - 5, 2, 2); } }
function drawWet(x, W, cx, cy, vw) {
  const t0 = Math.max(0, Math.floor(cx / TS) - 1), t1 = Math.min(W.w - 1, Math.ceil((cx + vw) / TS) + 1), y0 = Math.max(1, Math.floor(cy / TS)), y1 = Math.min(W.h - 1, Math.ceil((cy + VH) / TS));
  x.fillStyle = 'rgba(150,215,255,.45)';
  for (let ty = y0; ty <= y1; ty++) for (let tx = t0; tx <= t1; tx++) { const c = W.g[ty][tx]; if ((c === '#' || c === '>' || c === '<' || c === 'I') && !isSolid(W.g[ty - 1][tx])) x.fillRect(tx * TS, ty * TS, TS, 3); }
}
function drawLiftOff(x, o) {
  const X = o.x * TS, Y = o.y * TS, w = o.w * TS, h = o.h * TS; R(x, 'rgba(10,14,24,.6)', X, Y, w, h);
  for (let i = 0; i < h; i += 12) R(x, i % 24 ? 'rgba(232,72,59,.8)' : 'rgba(255,230,120,.8)', X + 2, Y + i, w - 4, 5);
}
/* 이벤트 3초 전: 천장에 경고등이 깜빡여요 (엘리베이터는 승강로 위에도) */
function drawWarn(x, W, t) {
  const on = Math.floor(t * 4) % 2 === 0, col = { lift: '#e8483b', wet: '#4aa8ff', flip: '#f2b632' }[W.soonK] || '#fff';
  const lamp = (X, Y) => { R(x, '#333', X - 3, Y - 1, 7, 3); R(x, on ? col : '#5a4a4a', X - 2, Y + 2, 5, 4); if (on) R(x, col + '55', X - 6, Y + 6, 13, 6); };
  for (const rm of W.rooms) for (let tx = rm.x0 + 6; tx < rm.x1; tx += 24) lamp(tx * TS, rm.y0 * TS + 1);
  if (W.soonK === 'lift') for (const o of W.objs) if (o.t === 'liftshaft') lamp((o.x + o.w / 2) * TS, o.y * TS - 4);
}
const EMO_NAMES = ['', '웃음', '화남', '울음', '하트'];
const EMO_PIX = [null,
  ['..yyyyy..', '.yyyyyyy.', 'yyKyyyKyy', 'yyyyyyyyy', 'yKyyyyyKy', 'yyKKKKKyy', '.yyyyyyy.', '..yyyyy..'],
  ['..rrrrr..', '.rrrrrrr.', 'rKKrrrKKr', 'rrKrrrKrr', 'rrrrrrrrr', 'rrKKKKKrr', 'rKrrrrrKr', '..rrrrr..'],
  ['..bbbbb..', '.bbbbbbb.', 'bbKbbbKbb', 'bbbbbbbbb', 'bbbbbbbbb', 'bbKKKKKbb', 'bKbbbbbKb', '..bbbbb..'],
  ['.rr...rr.', 'rrrr.rrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....']];
function drawEmoPix(x, id) { const p = EMO_PIX[id]; if (!p) return; const C = { y: '#ffd36b', r: '#ff5a4a', b: '#6ab8ff', K: '#222' }; x.imageSmoothingEnabled = false; for (let j = 0; j < p.length; j++) for (let i = 0; i < 9; i++) { const c = p[j][i]; if (c !== '.') { x.fillStyle = C[c]; x.fillRect(i + 1, j + 1, 1, 1); } } }
function drawEmo(x, id, px, py) {
  R(x, 'rgba(0,0,0,.5)', px - 9, py - 8, 19, 17); R(x, '#fff', px - 8, py - 9, 17, 16); R(x, '#fff', px - 1, py + 6, 3, 3);
  x.save(); x.translate(px - 7, py - 8); const p = EMO_PIX[id], C = { y: '#ffd36b', r: '#ff5a4a', b: '#6ab8ff', K: '#222' };
  if (p) for (let j = 0; j < p.length; j++) for (let i = 0; i < 9; i++) { const c = p[j][i]; if (c !== '.') { x.fillStyle = C[c]; x.fillRect(i * 1.5 + 0.5, j * 1.5 + 1, 1.6, 1.6); } }
  x.restore();
}

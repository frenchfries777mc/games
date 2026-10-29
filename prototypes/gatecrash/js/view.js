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
  bridge: { wall: '#bcc6d6', trim: '#8f9db4', floor: '#6b778e', top: '#8b97ae' }
};
const OBJC = {
  counter: ['#8a5a30', '#c48a50'], plant: ['#2f8a4a', '#6fcf86'], sofa: ['#a8473f', '#d9776d'], gate: ['#566, #aab'], bench: ['#7a5a3a', '#b08a5a'], boxes: ['#b88a50', '#e0b878'],
  desk: ['#7a5a3a', '#c9a06a'], copier: ['#9aa2b2', '#d8deea'], cooler: ['#4a8ad0', '#bfe0ff'], chair: ['#3a4a6a', '#6a7ea8'], cabinet: ['#7d8798', '#aab4c6'],
  trash: ['#4a5a4a', '#8a9a8a'], table: ['#8a6a48', '#d0aa78'], vending: ['#c0392b', '#ff8a7a'], foodbar: ['#8a8a96', '#d0d0dc'],
  rack: ['#222a38', '#4a8aff'], meeting: ['#5a4a3a', '#a08868'], ac: ['#8a929e', '#c8d0dc'], vent: ['#7a828e', '#b4bcc8'], tank: ['#6a7a8a', '#a8bccc'],
  luggage: ['#a8433a', '#e0786a'], barrier: ['#c9a227', '#ffe070'], checkin: ['#3a5a8a', '#7aa8e0'], xray: ['#3a3f4a', '#8a92a2'], bins: ['#5a6a7a', '#a0b0c0'],
  cart: ['#6a7480', '#b0bac6'], shelf: ['#7a6a5a', '#c8b098'], seats: ['#3a4a7a', '#7a8ec8'], gatedesk: ['#4a6a4a', '#8ac08a'], cone: ['#e8662a', '#ffb070']
};
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a | 0, b | 0, w | 0, h | 0); };

/* 맵 배경을 한 장으로 미리 그려 두어요 */
function bakeWorld(W) {
  const [c, x] = mkCanvas(W.pw, W.ph);
  const sky = MAPS[W.id].sky, gr = x.createLinearGradient(0, 0, 0, W.ph); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); x.fillStyle = gr; x.fillRect(0, 0, W.pw, W.ph);
  // 먼 구름·건물
  for (let i = 0; i < 14; i++) R(x, 'rgba(255,255,255,.55)', (i * 211 + 40) % W.pw, 20 + (i * 53) % 100, 40 + (i * 17) % 40, 8);
  for (const rm of W.rooms) {
    const T = THEMES[rm.theme], X = rm.x0 * TS, Y = rm.y0 * TS, w = (rm.x1 - rm.x0 + 1) * TS, h = (rm.y1 - rm.y0 + 1) * TS;
    R(x, T.wall, X, Y, w, h);
    for (let a = X; a < X + w; a += 48) R(x, T.trim, a, Y, 2, h);
    R(x, T.trim, X, Y + h - 22, w, 2);
    if (T.glass) for (let a = X + 20; a < X + w - 40; a += 96) { R(x, 'rgba(120,180,230,.55)', a, Y + 14, 56, h > 100 ? 40 : 26); R(x, 'rgba(255,255,255,.4)', a + 4, Y + 16, 8, h > 100 ? 36 : 22); }
    else for (let a = X + 30; a < X + w - 40; a += 110) { R(x, 'rgba(120,180,230,.5)', a, Y + 12, 40, 26); R(x, T.trim, a + 19, Y + 12, 2, 26); }
  }
  for (const o of W.objs) if (!o.solid) drawObj(x, W, o);
  for (let ty = 0; ty < W.h; ty++) for (let tx = 0; tx < W.w; tx++) {
    const c2 = W.g[ty][tx]; if (c2 === '.') continue;
    const rm = W.rooms.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 - 1 && ty <= r.y1 + 1), T = THEMES[rm ? rm.theme : 'office'];
    const X = tx * TS, Y = ty * TS;
    if (c2 === '#') { R(x, T.floor, X, Y, TS, TS); if (tileAt(W, tx, ty - 1) !== '#') R(x, T.top, X, Y, TS, 3); if ((tx + ty) % 2) R(x, 'rgba(0,0,0,.08)', X, Y + 3, TS, TS - 3); }
    else if (c2 === '=') { R(x, '#6b4a2a', X, Y, TS, 4); R(x, '#c89a5a', X, Y, TS, 2); }
    else if (c2 === '>' || c2 === '<') { R(x, '#3a3f4a', X, Y, TS, TS); R(x, '#f2b632', X, Y, TS, 2); for (let k = 0; k < TS; k += 8) R(x, '#222', X + k + 3, Y + 5, 2, 8); }
  }
  for (const o of W.objs) if (o.solid) drawObj(x, W, o);
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
  x.save(); x.translate(px + 8, py);
  if (f < 0) x.scale(-1, 1); x.translate(-8, 0);
  const dead = r.stun > 0, flash = r.flash > 0;
  const body = flash ? '#fff' : r.col, dark = flash ? '#fff' : shade(r.col, -50);
  R(x, '#e8c39a', 5, 0, 8, 7); R(x, flash ? '#fff' : '#2a2430', 5, 0, 8, 2); R(x, '#111', 10, 3, 2, 2);          // 머리
  R(x, body, 4, 7, 10, 8);                                                                                       // 몸통
  R(x, dark, 4, 15, 10, 2);
  if (!r.ground) { R(x, '#2a3350', 5, 17, 3, 4); R(x, '#2a3350', 10, 15, 3, 4); }
  else if (walk) { R(x, '#2a3350', ph ? 4 : 7, 17, 3, 5); R(x, '#2a3350', ph ? 10 : 8, 17, 3, 5); }
  else { R(x, '#2a3350', 5, 17, 3, 5); R(x, '#2a3350', 10, 17, 3, 5); }
  R(x, '#e8c39a', dead ? 2 : 12, dead ? 8 : 9, 3, 3);                                                              // 팔
  x.restore();
  if (r.wep) {
    const w = WEAPONS[r.wep.k], a = r.swing > 0 ? r.aim : (f > 0 ? 0 : Math.PI), sw = r.swing > 0 ? (1 - r.swing / 0.18) : 0;
    x.save(); x.translate(r.x + 5, r.y + 10); x.rotate(w.kind === 'melee' && r.swing > 0 ? a + (sw - 0.5) * 2.2 * f : r.swing > 0 ? a : (f > 0 ? 0.15 : Math.PI - 0.15));
    drawWep(x, r.wep.k); x.restore();
  }
}
function drawWep(x, k) {
  switch (k) {
    case 'bat': R(x, '#c89a5a', 2, -1, 18, 3); R(x, '#8a5a30', 16, -2, 5, 5); break;
    case 'pan': R(x, '#555', 2, -1, 8, 2); R(x, '#222', 10, -4, 9, 8); R(x, '#666', 11, -3, 7, 6); break;
    case 'pistol': R(x, '#2a2f3a', 2, -2, 10, 4); R(x, '#2a2f3a', 2, 1, 4, 5); R(x, '#8a92a2', 11, -2, 3, 2); break;
    case 'ext': R(x, '#c0392b', 2, -3, 8, 8); R(x, '#222', 9, -2, 5, 2); R(x, '#eee', 2, -1, 8, 2); break;
    case 'bazooka': R(x, '#4a5a3a', -2, -3, 20, 6); R(x, '#2a3320', 16, -4, 4, 8); R(x, '#888', 4, 3, 3, 4); break;
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
    else if (s.k === 'bazooka') { R(x, '#444', s.x - 5, s.y - 2, 10, 4); R(x, '#ff7a2a', s.x - (s.vx > 0 ? 9 : -5), s.y - 1, 4, 2); }
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

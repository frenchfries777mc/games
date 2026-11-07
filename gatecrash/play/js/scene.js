/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   인트로와 로비가 같이 쓰는 배경: 네 명이 달리고 부딪치는 공항 장면 */
'use strict';
(function () {
  const FAKE = { id: 'airport' }, HIT = 2.4; let x = null;
  const cols = ['#e8483b', '#3b8de8', '#3fbf5a', '#f2b632'];
  const R = [0, 1, 2, 3].map(i => ({ id: 'i' + i, slot: i, col: cols[i], x: 0, y: 0, vx: 0, face: 1, ground: true, anim: 0, inv: 0, stun: 0, flash: 0, wep: null, swing: 0, aim: 0, name: '', hp: 100 }));
  const OBST = [];     // 지나가는 가구
  for (let i = 0; i < 14; i++) OBST.push({ x: 260 + i * 170 + (i * 37) % 60, t: ['crate', 'desk', 'cart', 'barrier'][i % 4], w: 2 + (i % 2), h: 1 + (i % 3 === 0 ? 1 : 0) });
  const fxs = [];
  function R_(a, b, c, d, col) { x.fillStyle = col; x.fillRect(a | 0, b | 0, c | 0, d | 0); }
  function drawObjLite(sx, gy, o) {
    const w = o.w * TS, h = o.h * TS, col = { crate: ['#9a6a30', '#d0a060'], desk: ['#7a5a3a', '#c9a06a'], cart: ['#6a7480', '#b0bac6'], barrier: ['#c9a227', '#ffe070'] }[o.t];
    R_(sx, gy - h, w, h, col[0]); R_(sx + 1, gy - h + 1, w - 2, 3, col[1]); R_(sx, gy - 3, w, 3, 'rgba(0,0,0,.2)');
  }
  function ez(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  window.GCScene = function (ctx, vw, t, camx) {
    x = ctx; const floorY = VH - 56;
    if (t < HIT) { fxs.boom = 0; fxs.length = 0; }
    drawBackdrop(x, FAKE, t, camx, 60, vw);
    // 바닥
    for (let i = 0; i < vw / 16 + 2; i++) { const px = i * 16 - (camx % 16); R_(px, floorY + 22, 16, 40, '#6a7384'); R_(px, floorY + 22, 16, 3, '#98a3ba'); if ((i + Math.floor(camx / 16)) % 2) R_(px, floorY + 25, 16, 37, 'rgba(0,0,0,.08)'); }
    R_(0, floorY + 20, vw, 2, '#2a3350');
    // 장애물
    for (const o of OBST) { const sx = o.x - camx; if (sx < -60 || sx > vw + 40) continue; drawObjLite(sx, floorY + 22, o); }
    // 선수 위치: 앞서거니 뒤서거니
    const lead = vw * 0.5;
    R.forEach((r, i) => {
      const k = t < HIT ? 1 : 0.6, wob = Math.sin(t * (1.1 + i * .27) + i * 1.7) * 46 * k;
      let tx = lead + (i - 1.5) * 52 + wob, gy = floorY;
      if (t > HIT + .1) tx += (i - 1.5) * 30 * ez((t - HIT) / 1.5);
      r.vx = (tx - r.x) * 4 || 120; r.x += (tx - r.x) * Math.min(1, .05 + 1 / 60); r.face = 1; r.anim += 150 * 0.016 * 1.3;
      // 점프: 장애물 앞에서
      let jy = 0; for (const o of OBST) { const sx = o.x - camx - (r.x + 20 * (i - 1.5)); const d = (o.x - camx) - (r.x + 5); if (d > -30 && d < 70) { const u = (d + 30) / 100; jy = Math.max(jy, Math.sin(Math.PI * u) * 30); } }
      r.ground = jy < 1; r.y = gy - jy;
      r.stun = 0; r.flash = 0; r.wep = null; r.swing = 0; r.inv = 0;
    });
    // 3초대에서 서로 부딪치는 연출: 파랑이 방망이로 빨강을 날려 버려요
    if (t > 1.0 && t < HIT) { const a = R[1], b = R[0]; a.wep = { k: 'bat', u: 1 }; const s = (t - 1.0) / 1.4; a.swing = (s > .55 && s < .7) ? .1 : 0; a.aim = 0; if (s > .6) { b.x -= 14 * (s - .6) * 2; b.y -= 10 * Math.sin((s - .6) * 8); b.stun = .1; b.flash = (s < .75) ? .1 : 0; b.ground = false; } if (s > .6 && !fxs.hit) { fxs.hit = 1; fxs.push({ t: 'hit', x: b.x + 5, y: b.y + 8, age: 0, life: .35, s: 1 }); } }
    if (t > 1.6 && t < HIT) { R[2].wep = { k: 'bazooka', u: 1 }; R[2].aim = 0; }
    if (t > HIT && !fxs.boom) { fxs.boom = 1; fxs.push({ t: 'boom', x: R[3].x + 70, y: floorY, age: 0, life: .5 }); }
    for (const r of R) drawRacer(x, r, t, false);
    for (const f of fxs) f.age += 1 / 60; drawFx(x, fxs.filter(f => f.age < f.life));
    // 필름 띠 + 어둡게
    const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, 'rgba(8,12,28,.55)'); g.addColorStop(.35, 'rgba(8,12,28,0)'); g.addColorStop(.7, 'rgba(8,12,28,0)'); g.addColorStop(1, 'rgba(8,12,28,.6)'); x.fillStyle = g; x.fillRect(0, 0, vw + 2, VH + 2);
    // 속도선
    x.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 18; i++) { const sy = (i * 47) % VH, sx = ((i * 131 - t * 900) % (vw + 200) + vw + 200) % (vw + 200) - 100; if (sy < floorY) x.fillRect(sx, sy, 40 + (i % 3) * 20, 1); }
  };
})();

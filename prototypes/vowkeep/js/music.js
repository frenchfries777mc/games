// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 배경음악: 파일은 게임 옆에 따로 있어요. 못 불러오면 사이트 주소로, 그래도 안 되면 조용히 넘어가요
const FILES = { lobby: 'vowkeep-lobby.mp3', dungeon: 'vowkeep-dungeon.mp3', boss: 'vowkeep-boss.mp3' };
const ALT = 'https://frenchfries777mc.github.io/games/prototypes/vowkeep/';
const T = {}; let vol = 0.7, tryAt = 0;
function mk(k) {
  const el = new Audio(FILES[k]); el.loop = true; el.preload = 'auto'; el.volume = 0;
  let alt = false; el.onerror = () => { if (!alt) { alt = true; el.src = ALT + FILES[k]; el.load(); } };
  return T[k] = { el, lvl: 0 };
}
export function setVol(v) { vol = v; }
export function kick() { tryAt = 0; }
// iPad·폰: 곡마다 처음 한 번은 화면을 누른 순간에 틀어야 해서, 누른 김에 세 곡을 소리 없이 틀었다 멈춰 둬요
export function unlock() {
  try { for (const k of Object.keys(FILES)) { const t = T[k] || mk(k), el = t.el, v = el.volume; el.volume = 0; const q = el.play(); if (q && q.then) q.then(() => { if (t.lvl === 0) el.pause(); }).catch(() => { }); } } catch (e) { }
}
// want: 'lobby' | 'dungeon' | 'boss' | null. 곡이 바뀌면 1초쯤 걸쳐 서로 바꿔 틀어요
export function tick(want, dt, now) {
  try {
    for (const k of Object.keys(FILES)) {
      const t = T[k] || (want === k ? mk(k) : null); if (!t) continue;
      const goal = k === want && vol > 0 ? 1 : 0;
      t.lvl += Math.max(-1, Math.min(1, goal - t.lvl)) * Math.min(1, dt / 1.0);
      if (Math.abs(goal - t.lvl) < 0.02) t.lvl = goal;
      t.el.volume = Math.max(0, Math.min(1, t.lvl * vol));
      if (t.lvl > 0 && t.el.paused && now >= tryAt) { tryAt = now + 600; const q = t.el.play(); if (q && q.catch) q.catch(() => { }); }
      else if (t.lvl === 0 && !t.el.paused) t.el.pause();
    }
  } catch (e) { }
}

// 인트로 곡(스틱세움 인트로 곡, 5초): 인트로와 함께 시작하고, 끝나면 로비 곡이 이어져요. 컴퓨터 브라우저가 소리를 막으면 setHold(true)로 인트로를 멈춰 두고, 화면을 누르면 begin()으로 시작해요
export function sting(begin, setHold) {
  let started = false;
  const start = () => { if (!started) { started = true; begin(); } };
  const fin = () => { window.__introSongDone = 1; };
  if (!(vol > 0)) { fin(); start(); return; }
  try {
    const el = new Audio('vowkeep-intro.mp3'); let alt = false;
    el.volume = Math.min(1, vol * 0.8);
    el.onerror = () => { if (!alt) { alt = true; el.src = ALT + 'vowkeep-intro.mp3'; el.load(); const q = el.play(); if (q && q.catch) q.catch(() => { }); } else fin(); };
    el.addEventListener('ended', fin); el.addEventListener('playing', () => setTimeout(fin, 5300), { once: true });
    const p = el.play();
    const blocked = e => {
      if (!(e && e.name === 'NotAllowedError')) { start(); return; }
      setHold(true); let held = true;
      const evs = ['keydown', 'touchend', 'click'];
      const rel = () => { if (!held) return; held = false; evs.forEach(ev => removeEventListener(ev, go, true)); setHold(false); start(); };
      const go = () => { if (!held) return; unlock(); const r = el.play(); if (r && r.then) r.then(rel, () => { }); else rel(); };
      evs.forEach(ev => addEventListener(ev, go, true));
    };
    if (p && p.then) p.then(start, blocked); else start();
  } catch (e) { fin(); start(); }
}

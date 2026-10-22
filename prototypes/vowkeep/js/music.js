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

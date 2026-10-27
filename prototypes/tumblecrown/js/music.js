// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 인트로 곡은 Vowkeep 인트로 곡(5초)을 그대로 써요. 못 불러오면 사이트 주소로, 그래도 안 되면 조용히 넘어가요
const SRC = '../../vowkeep/play/vowkeep-intro.mp3', ALT = 'https://frenchfries777mc.github.io/games/vowkeep/play/';
let vol = 0.7;
export function setVol(v) { vol = v; }
// 배경음악: Velocity Run 한 곡이 로비, 방, 경기 중에 계속 이어져요 (제미나이가 만든 곡). 인트로 곡이 끝난 뒤부터 나와요
const BGM = 'velocity-run.mp3';
let bg = null, bgAlt = false, bgTry = 0;
function bgEl() {
  if (bg) return bg;
  bg = new Audio(BGM); bg.loop = true; bg.preload = 'auto';
  bg.onerror = () => { if (!bgAlt) { bgAlt = true; bg.src = ALT0 + BGM; bg.load(); } };
  return bg;
}
const ALT0 = 'https://frenchfries777mc.github.io/games/prototypes/tumblecrown/';
function bgPlay() { const e = bgEl(); e.volume = Math.min(1, vol * 0.8); if (e.paused) { const q = e.play(); if (q && q.catch) q.catch(() => { }); } }
export function kick() { if (window.__introSongDone && vol > 0) bgPlay(); }
export function tick(want, dt, now) {
  if (!want || !(vol > 0)) { if (bg && !bg.paused) bg.pause(); return; }
  const e = bgEl(); e.volume = Math.min(1, vol * 0.8);
  if (e.paused && now - bgTry > 1000) { bgTry = now; bgPlay(); }
}
// 인트로 곡(스틱세움 인트로 곡, 5초): 인트로와 함께 시작하고, 끝나면 로비 곡이 이어져요. 컴퓨터 브라우저가 소리를 막으면 setHold(true)로 인트로를 멈춰 두고, 화면을 누르면 begin()으로 시작해요
export function sting(begin, setHold) {
  let started = false;
  const start = () => { if (!started) { started = true; begin(); } };
  const fin = () => { window.__introSongDone = 1; };
  if (!(vol > 0)) { fin(); start(); return; }
  try {
    const el = new Audio(SRC); let alt = false;
    el.volume = Math.min(1, vol * 0.8);
    el.onerror = () => { if (!alt) { alt = true; el.src = ALT + 'vowkeep-intro.mp3'; el.load(); const q = el.play(); if (q && q.catch) q.catch(() => { }); } else fin(); };
    el.addEventListener('ended', fin); el.addEventListener('playing', () => setTimeout(fin, 5300), { once: true });
    const p = el.play();
    const blocked = e => {
      if (!(e && e.name === 'NotAllowedError')) { start(); return; }
      setHold(true);
      const evs = ['pointerdown', 'keydown', 'touchend', 'click'];
      const go = () => { evs.forEach(ev => removeEventListener(ev, go, true)); setHold(false); start(); const r = el.play(); if (r && r.catch) r.catch(() => { }); };
      evs.forEach(ev => addEventListener(ev, go, true));
    };
    if (p && p.then) p.then(start, blocked); else start();
  } catch (e) { fin(); start(); }
}

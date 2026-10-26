// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 인트로 곡은 Vowkeep 인트로 곡(5초)을 그대로 써요. 못 불러오면 사이트 주소로, 그래도 안 되면 조용히 넘어가요
const SRC = '../../vowkeep/play/vowkeep-intro.mp3', ALT = 'https://frenchfries777mc.github.io/games/vowkeep/play/';
let vol = 0.7;
export function setVol(v) { vol = v; }
export function kick() { }
export function tick() { }
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

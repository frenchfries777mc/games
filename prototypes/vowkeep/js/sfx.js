// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 효과음: 파일 없이 소리를 만들어요 (배경음악은 music.js)
let ac = null, master = null, vol = 0.7, noiseBuf = null;
function ctx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = vol; master.connect(ac.destination); const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } catch (e) { return null; } }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
export function setVol(v) { vol = v; if (master) master.gain.value = v; }
export function unlock() { ctx(); }
function tone(f0, f1, dur, type = 'square', g = 0.2, delay = 0) {
  const a = ctx(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, f, q = 1, g = 0.25, type = 'bandpass', delay = 0, f1) {
  const a = ctx(); if (!a) return; const t = a.currentTime + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
  s.buffer = noiseBuf; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
  gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl); fl.connect(gn); gn.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
let last = {};
export function play(k) {
  const now = performance.now(); if (last[k] && now - last[k] < 40) return; last[k] = now;
  switch (k) {
    case 'swing': noise(0.14, 2400, 1.5, 0.22, 'bandpass', 0, 700); break;
    case 'hit': noise(0.08, 900, 1, 0.3, 'lowpass'); tone(180, 70, 0.1, 'triangle', 0.25); break;
    case 'clang': tone(1400, 900, 0.18, 'square', 0.08); tone(2100, 1500, 0.15, 'triangle', 0.08); break;
    case 'arrow': noise(0.18, 3200, 3, 0.12, 'bandpass', 0, 1200); break;
    case 'orb': tone(900, 1400, 0.15, 'sine', 0.12); break;
    case 'heal': tone(660, 660, 0.16, 'sine', 0.12); tone(990, 990, 0.2, 'sine', 0.1, 0.08); break;
    case 'phit': noise(0.1, 600, 1, 0.3, 'lowpass'); tone(140, 60, 0.12, 'sawtooth', 0.12); break;
    case 'down': tone(300, 90, 0.5, 'sawtooth', 0.15); break;
    case 'revive': [523, 659, 784].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.12, i * 0.08)); break;
    case 'roll': noise(0.15, 500, 1, 0.15, 'lowpass'); break;
    case 'kill': noise(0.25, 1800, 0.8, 0.18, 'highpass'); tone(260, 120, 0.2, 'square', 0.06); break;
    case 'slam': noise(0.5, 200, 0.7, 0.5, 'lowpass'); tone(80, 35, 0.5, 'sine', 0.45); break;
    case 'roar': tone(110, 55, 1.2, 'sawtooth', 0.22); noise(1.0, 300, 0.6, 0.2, 'lowpass'); break;
    case 'warn': tone(440, 440, 0.08, 'square', 0.05); break;
    case 'door': noise(0.8, 160, 0.6, 0.3, 'lowpass'); tone(60, 50, 0.8, 'triangle', 0.2); break;
    case 'clear': [392, 523, 659, 784].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.11, i * 0.1)); break;
    case 'click': tone(700, 500, 0.05, 'square', 0.05); break;
    case 'bless': [659, 880].forEach((f, i) => tone(f, f, 0.2, 'sine', 0.12, i * 0.1)); break;
    case 'parry': tone(1800, 1200, 0.25, 'square', 0.12); tone(2600, 2000, 0.3, 'triangle', 0.1); break;
    case 'fire': noise(0.6, 800, 0.5, 0.2, 'bandpass', 0, 300); break;
    case 'spawn': noise(0.4, 400, 1, 0.12, 'bandpass', 0, 1200); break;
    case 'won': [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.4, 'triangle', 0.12, i * 0.16)); break;
    case 'wipe': [392, 330, 262].forEach((f, i) => tone(f, f * 0.98, 0.4, 'triangle', 0.12, i * 0.22)); break;
  }
}

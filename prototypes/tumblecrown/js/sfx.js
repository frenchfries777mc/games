// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 효과음: 파일 없이 소리를 바로 만들어요
let ctx = null, master = null, vol = 0.7;
export const SFX = {
  unlock() { if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; } try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination); } catch (e) { ctx = null; } },
  setVol(v) { vol = v; if (master) master.gain.value = v; },
  play(k, s = 1) {
    if (!ctx || vol <= 0) return; const t = ctx.currentTime;
    if (k === 'click') tone(660, 0.05, 'square', 0.12, t);
    else if (k === 'swing') noise(0.12, 900 + s * 900, 0.18, t, 'bandpass');
    else if (k === 'hit') { noise(0.08 + s * 0.006, 1400, 0.35 + Math.min(0.4, s * 0.02), t, 'lowpass'); sweep(180 + s * 4, 50, 0.16 + s * 0.006, 'sine', 0.5, t); }
    else if (k === 'dash') noise(0.14, 2200, 0.12, t, 'highpass');
    else if (k === 'slam') { sweep(120, 35, 0.4, 'sine', 0.7, t); noise(0.3, 500, 0.4, t, 'lowpass'); }
    else if (k === 'pick') { [784, 988, 1319].forEach((f, i) => tone(f, 0.12, 'triangle', 0.18, t + i * 0.07)); }
    else if (k === 'drop') sweep(700, 300, 0.2, 'triangle', 0.18, t);
    else if (k === 'fall') sweep(900, 120, 0.7, 'sine', 0.16, t);
    else if (k === 'ko') { tone(392, 0.1, 'square', 0.12, t); tone(523, 0.16, 'square', 0.12, t + 0.09); }
    else if (k === 'crack') noise(0.25, 300, 0.25, t, 'lowpass');
    else if (k === 'count') tone(523, 0.12, 'square', 0.14, t);
    else if (k === 'go') { tone(784, 0.25, 'square', 0.16, t); tone(1047, 0.3, 'square', 0.12, t + 0.05); }
    else if (k === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.2, t + i * 0.12)); }
  }
};
function env(g, a, d, t) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); }
function tone(f, d, type, a, t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; env(g, a, d, t); o.connect(g).connect(master); o.start(t); o.stop(t + d + 0.02); }
function sweep(f0, f1, d, type, a, t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); env(g, a, d, t); o.connect(g).connect(master); o.start(t); o.stop(t + d + 0.02); }
let NB = null;
function noise(d, f, a, t, type) {
  if (!NB) { NB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const c = NB.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NB; fl.type = type; fl.frequency.value = f; env(g, a, d, t); s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + d + 0.02);
}

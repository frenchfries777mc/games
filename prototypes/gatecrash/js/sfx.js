/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   효과음: 파일 없이 Web Audio로 만들어요 */
'use strict';
let ac = null, master = null, noiseBuf = null;
function actx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } catch (e) { return null; } }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(f0, f1, dur, type, vol, delay) {
  const a = actx(); if (!a) return; const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, f0, f1, delay) {
  const a = actx(); if (!a) return; const t = a.currentTime + (delay || 0), s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
}
const SFX = {
  unlock() { actx(); },
  jump() { tone(260, 520, .12, 'square', .08); },
  land() { noise(.06, .08, 900, 200); },
  swing() { noise(.14, .12, 3000, 500); },
  hitm() { noise(.12, .25, 1800, 120); tone(150, 50, .14, 'sawtooth', .18); },
  hit() { noise(.1, .2, 1500, 150); tone(180, 60, .1, 'square', .12); },
  pistol() { noise(.08, .2, 4000, 400); tone(700, 120, .09, 'square', .1); },
  spray() { noise(.1, .1, 5000, 2000); },
  rocket() { noise(.35, .2, 1500, 300); tone(160, 60, .3, 'sawtooth', .1); },
  boom() { noise(.7, .5, 1200, 60); tone(120, 30, .6, 'sawtooth', .3); },
  pick() { tone(520, 780, .08, 'square', .09); tone(780, 1040, .1, 'square', .09, .07); },
  brk() { noise(.15, .15, 2500, 300); tone(300, 80, .15, 'square', .1); },
  ko() { tone(440, 90, .45, 'sawtooth', .16); noise(.3, .15, 2000, 200); },
  beep() { tone(660, 660, .12, 'square', .1); },
  go() { tone(990, 990, .35, 'square', .12); tone(1320, 1320, .3, 'square', .08, .05); },
  fin() { [660, 880, 1100, 1320].forEach((f, i) => tone(f, f, .16, 'square', .1, i * .09)); },
  win() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, f, .2, 'triangle', .16, i * .12)); }
};
function GCSfx(e) {
  if (e.t === 'jump') SFX.jump();
  else if (e.t === 'swing') SFX.swing();
  else if (e.t === 'hit') SFX.hit();
  else if (e.t === 'boom') SFX.boom();
  else if (e.t === 'ko') SFX.ko();
  else if (e.t === 'pick') SFX.pick();
  else if (e.t === 'break') SFX.brk();
  else if (e.t === 'go') SFX.go();
  else if (e.t === 'fin') SFX.fin();
  else if (e.t === 'fire') { if (e.k === 'bazooka') SFX.rocket(); else if (e.k === 'pistol') SFX.pistol(); }
}

/* 배경음악: Pixel Sprint (파일 자체를 -20 LUFS로 맞춰 두었어요. iPad는 audio.volume을 무시해서 Web Audio 게인으로 조절해요) */
const BGM = {
  el: null, g: null,
  start() {
    const a = actx(); if (!a) return;
    if (!this.el) {
      const el = new Audio('pixel-sprint.mp3?v=' + BUILD); el.loop = true; el.preload = 'auto'; this.el = el;
      try { const src = a.createMediaElementSource(el); this.g = a.createGain(); this.g.gain.value = 0; src.connect(this.g); this.g.connect(master); } catch (e) { this.g = null; el.volume = 0.5; }
    }
    try { this.el.play().catch(() => { }); } catch (e) { }
    if (this.g) { const t = a.currentTime; this.g.gain.cancelScheduledValues(t); this.g.gain.setValueAtTime(this.g.gain.value, t); this.g.gain.linearRampToValueAtTime(1.0, t + 1.2); }
  },
  duck(v) { if (this.g) { const t = ac.currentTime; this.g.gain.cancelScheduledValues(t); this.g.gain.setValueAtTime(this.g.gain.value, t); this.g.gain.linearRampToValueAtTime(v, t + .4); } },
  stop() {
    if (!this.el) return;
    if (this.g) { const t = ac.currentTime; this.g.gain.cancelScheduledValues(t); this.g.gain.setValueAtTime(this.g.gain.value, t); this.g.gain.linearRampToValueAtTime(0, t + .6); const el = this.el; setTimeout(() => { if (this.g && this.g.gain.value < .05) el.pause(); }, 800); }
    else this.el.pause();
  }
};

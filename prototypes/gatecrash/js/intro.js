/* Gatecrash · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
   인트로: 네 명이 달리고 부딪치는 장면 위에 제목이 나와요 (건너뛸 수 없어요) */
'use strict';
(function () {
  const cv = document.getElementById('intro'); if (!cv) return;
  const x = cv.getContext('2d'), DUR = 6.0;
  let t0 = 0, done = false, snd = null, started = false, hold = false;
  const logo = new Image(); logo.src = 'claude.png';
  // 다른 게임과 같은 방식: 소리가 바로 나오면 그대로 시작하고, 브라우저가 소리를 막으면 인트로를 멈춰 두었다가 화면을 누르면 시작해요
  function begin() { if (started) return; started = true; t0 = performance.now(); hold = false; }
  function sound() {
    try {
      snd = new Audio('intro.mp3?v=' + BUILD); snd.preload = 'auto'; const p = snd.play();
      const blocked = e => {
        if (!(e && e.name === 'NotAllowedError')) { begin(); return; }
        hold = true; const evs = ['pointerdown', 'keydown', 'touchend', 'click'];
        const go = () => { evs.forEach(ev => removeEventListener(ev, go, true)); begin(); try { snd.currentTime = 0; snd.play().catch(() => { }); } catch (e2) { } };
        evs.forEach(ev => addEventListener(ev, go, true));
      };
      if (p && p.then) p.then(begin, blocked); else begin();
    } catch (e) { begin(); }
  }
  function ez(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function frame(now) {
    if (done) return;
    const t = started ? (performance.now() - t0) / 1000 : 0, dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const sc = h / VH, vw = w / sc, camx = t * 150;
    x.setTransform(sc, 0, 0, sc, 0, 0); x.imageSmoothingEnabled = false;
    GCScene(x, vw, t, camx);
    // 글자 (화면 좌표)
    x.setTransform(1, 0, 0, 1, 0, 0); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const sa = k => { k = Math.max(0, Math.min(1, k)); return k < .33 ? k / .33 : k < .66 ? 1 : 1 - (k - .66) / .34; };      // 다른 게임 인트로와 같은 나타남/사라짐
    const sm = Math.round(Math.max(16, Math.min(26, w * .032 / dpr)) * dpr), bgf = Math.round(Math.max(40, Math.min(100, w * .09 / dpr)) * dpr);
    const scene = (k, small, big, withLogo) => {
      x.globalAlpha = sa(k); x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 24 * dpr;
      x.font = '600 ' + sm + 'px system-ui, sans-serif'; x.fillStyle = '#cfe0f4'; try { x.letterSpacing = (sm * .2) + 'px'; } catch (e) { } x.fillText(small, w / 2, h * .34 + sm); try { x.letterSpacing = '0px'; } catch (e) { }
      x.font = '900 ' + bgf + 'px system-ui, sans-serif'; x.fillStyle = '#fff8ea';
      if (withLogo && logo.complete && logo.naturalWidth) { const lh = bgf * 1.15, lw = lh * logo.naturalWidth / logo.naturalHeight, tw = x.measureText(big).width, gap = bgf * .25, x0 = w / 2 - (lw + gap + tw) / 2; x.imageSmoothingEnabled = true; x.drawImage(logo, x0, h * .34 + sm + bgf * .12 - lh * .2, lw, lh); x.textAlign = 'left'; x.fillText(big, x0 + lw + gap, h * .34 + sm + bgf * 1.05); x.textAlign = 'center'; x.imageSmoothingEnabled = false; }
      else x.fillText(big, w / 2, h * .34 + sm + bgf * 1.05);
      x.shadowBlur = 0; x.globalAlpha = 1;
    };
    scene(t / 3, 'Made by', 'Frenchfries777', false); scene((t - 3) / 3, 'With', 'Claude AI', true);
    if (hold) { x.globalAlpha = .55 + .45 * Math.sin(now / 220); x.fillStyle = '#fff8ea'; x.font = '700 ' + Math.round(Math.max(16, Math.min(22, w * .026 / dpr)) * dpr) + 'px system-ui, sans-serif'; x.fillText('화면을 누르면 시작해요', w / 2, h * .86); x.globalAlpha = 1; }
    const fade = t > DUR - .8 ? ez((t - (DUR - .8)) / .8) : 0, fi = 0;
    x.fillStyle = 'rgba(8,12,24,' + Math.max(fade, fi) + ')'; x.fillRect(0, 0, w, h);
    if (started && t >= DUR) { finish(); return; }
    requestAnimationFrame(frame);
  }
  function finish() { done = true; cv.remove(); try { if (snd) { snd.pause(); } } catch (e) { } document.documentElement.classList.add('gcReady'); if (window.GCIntroDone) window.GCIntroDone(); }
  sound(); requestAnimationFrame(frame);
})();

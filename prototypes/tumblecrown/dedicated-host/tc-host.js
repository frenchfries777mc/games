/* Tumblecrown 전용 방장
   오라클 서버에서 화면 없는 브라우저로 Tumblecrown을 열어, 온라인 대전 공개 방(q1)을 하나 대신 열어 둬요.
   서버는 사람이 아니라 경기에서 봇 한 자리로 서 있고, 그래서 사람 아홉 명이 모이면 시작해요.
   경기가 끝나거나 오류가 나면 스스로 새 방을 다시 열어요 (그때 새 빌드도 받아요). 기다리는 방에 사람이 없을 때 새 빌드가 올라와도 스스로 다시 열어요.
   설정(환경변수):  TC_URL  게임 주소 (기본: 공개 사이트의 최신 빌드)  TC_ROOMS  동시에 열어 둘 방 수 (기본 1) */
const { chromium } = require('playwright');
const URL = process.env.TC_URL || 'https://frenchfries777mc.github.io/games/prototypes/tumblecrown/index.html?dedicated=1';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BJ = URL.replace(/index\.html.*$/, 'build.json');
const getBuild = async () => { try { const r = await fetch(BJ + '?t=' + Date.now(), { cache: 'no-store' }); return (await r.json()).build | 0; } catch (e) { return 0; } };
let browser = null, stopping = false;

async function runRoom(i) {
  const ctx = await browser.newContext({ viewport: { width: 480, height: 320 } });
  const page = await ctx.newPage(); let startedAt = 0, endedAt = 0, ok = false;
  const close = async why => { log('방 닫음', why || ''); try { await ctx.close(); } catch (e) { } };
  page.on('pageerror', e => { const m = String(e && e.message || e); if (!/ResizeObserver|Script error/.test(m)) log('page error', m.slice(0, 160)); });
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.__ffd && typeof window.Peer === 'function', null, { timeout: 60000 });
    await page.evaluate(n => window.__ffd.open(n), i + 1);
    const t0 = Date.now(); let st = null;
    while (Date.now() - t0 < 20000) { await sleep(500); st = await page.evaluate(() => window.__ffd.status()); if (st.live || st.err) break; }
    if (!st || !st.live) { await close('방 열기 실패 ' + (st && st.err)); return false; }
    log('방 열림'); ok = true; const b0 = await getBuild(); let chk = Date.now();
    while (!stopping) {
      await sleep(1000); st = await page.evaluate(() => window.__ffd.status());
      if (st.err) { await close('오류 ' + st.err); break; }
      // 새 빌드가 올라오면, 기다리는 방에 아무도 없을 때 스스로 닫고 새 빌드로 다시 열어요
      if (!st.started && !st.humans && Date.now() - chk > 30000) { chk = Date.now(); const b1 = await getBuild(); if (b0 && b1 && b1 !== b0) { log('새 빌드 b' + b1); await close('새 빌드로 다시 열기'); break; } }
      if (st.started && !startedAt) { startedAt = Date.now(); log('경기 시작'); }
      if (st.ended) { if (!endedAt) { endedAt = Date.now(); log('경기 끝'); } if (Date.now() - endedAt > 15000) { await close('경기 끝남'); break; } }
      if (startedAt && Date.now() - startedAt > 30 * 60 * 1000) { await close('너무 오래 진행됨'); break; }
    }
  } catch (e) { log('오류', String(e && e.message || e).slice(0, 200)); await close('오류'); }
  return ok;
}
async function slot(i) {
  let fails = 0;
  while (!stopping) { const ok = await runRoom(i); fails = ok ? 0 : fails + 1; await sleep(ok ? 2000 + i * 3000 : Math.min(60000, 5000 * fails)); }
}
async function main() {
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  browser.on('disconnected', () => { if (!stopping) { log('브라우저가 꺼졌어요, 다시 시작해요'); process.exit(1); } });
  log('Tumblecrown 전용 방장 시작', URL);
  const n = Math.max(1, Math.min(3, +process.env.TC_ROOMS || 1)); await Promise.all(Array.from({ length: n }, (_, i) => slot(i)));
}
process.on('SIGTERM', () => { stopping = true; process.exit(0); });
process.on('SIGINT', () => { stopping = true; process.exit(0); });
main().catch(e => { console.error(e); process.exit(1); });

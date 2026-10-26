/* Stickseum 전용 방장 (dedicated host)
   서버에서 화면 없는 브라우저로 Stickseum을 열고, 랭크전 방을 대신 열어 계산해요. 사람이 아니라서 경기에는 나오지 않아요.
   설정은 환경변수로 받아요 (install.sh 가 /etc/ff-host.env 에 적어 둬요):
     FF_USER, FF_PASS   심판 계정 (랭크 결과를 서버에 알리는 계정)
     FF_WAITING=3       기다리는 빈 방 수
     FF_MAX=10          한꺼번에 열어 둘 방 수(진행 중인 경기 포함)
     FF_URL             게임 주소 (기본: 공개 사이트의 최신 빌드)
     FF_RESTART_H=6     이만큼 지나면 진행 중인 경기가 없을 때 스스로 다시 시작해 새 빌드를 받아요 (systemd 가 다시 켜 줘요) */
const { chromium } = require('playwright');
const USER=process.env.FF_USER||'', PASS=process.env.FF_PASS||'';
const WAITING=Math.max(1, +process.env.FF_WAITING||3), MAXR=Math.max(WAITING, +process.env.FF_MAX||10), RESTART_H=+process.env.FF_RESTART_H||6;
const URL=process.env.FF_URL||'https://frenchfries777mc.github.io/games/stickseum/Stickseum-latest.html?dedicated=1';
const T0=Date.now();
const log=(...a)=>console.log(new Date().toISOString().slice(11,19), ...a);
if(!USER || !PASS){ console.error('FF_USER / FF_PASS 가 없어요 (/etc/ff-host.env 를 확인하세요)'); process.exit(2); }

let browser=null, stopping=false, mapList=[], loginOk=false;
const rooms=new Set();          // 열려 있는 방 (맵:자리)
const blocked=new Map();        // 열려다 실패한 방 (남이 쓰고 있는 이름): 1분 동안 건너뛰어요
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function openRoom(){
  const ctx=await browser.newContext({viewport:{width:480,height:320}});
  if(process.env.FF_TEST) await require(process.env.FF_TEST)(ctx);          // (only for tests: a file that routes the page's requests)
  const page=await ctx.newPage();
  let key=null, closed=false;
  const close=async why=>{ if(closed) return; closed=true; if(key) rooms.delete(key); log('방 닫음', key||'-', why||''); try{ await ctx.close(); }catch(e){} };
  try{
    page.on('pageerror', e=>{ const m=String(e&&e.message||e); if(!/ResizeObserver|Script error/.test(m)) log('page error', m.slice(0,160)); });
    await page.goto(URL, {waitUntil:'domcontentloaded', timeout:60000});
    await page.waitForFunction(()=>window.__ffd && typeof window.Peer==='function', null, {timeout:60000});
    let r=await page.evaluate(([u,p])=>window.__ffd.login(u,p), [USER,PASS]);
    if(r!=='ok'){ log('로그인 실패, 계정 만들기 시도:', r); const s=await page.evaluate(([u,p])=>window.__ffd.signup(u,p), [USER,PASS]); log('계정 만들기:', s); r=await page.evaluate(([u,p])=>window.__ffd.login(u,p), [USER,PASS]); }
    if(r!=='ok'){ loginOk=false; await close('로그인 실패: '+r); return null; }
    if(!loginOk){ loginOk=true; log('심판 계정 로그인 성공:', USER); }
    if(!mapList.length) mapList=await page.evaluate(()=>window.__ffd.maps());
    const free=[]; for(const slot of [1,2]) for(const m of mapList) if(!rooms.has(m+':'+slot) && !(blocked.get(m+':'+slot)>Date.now()-60000)) free.push([m,slot]);
    if(!free.length){ await close('빈 자리 없음'); return null; }
    for(const [m,slot] of free){
      key=m+':'+slot; rooms.add(key);
      await page.evaluate(([a,b])=>window.__ffd.open(a,b), [m,slot]);
      const t0=Date.now(); let st=null;
      while(Date.now()-t0<20000){ await sleep(500); st=await page.evaluate(()=>window.__ffd.status()); if(st.live || st.err) break; }
      if(st && st.live){ log('방 열림', key); break; }
      log('방 열기 실패', key, st&&st.err); blocked.set(key, Date.now()); rooms.delete(key); key=null;
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>window.__ffd, null, {timeout:60000});
      const l=await page.evaluate(([u,p])=>window.__ffd.login(u,p), [USER,PASS]); if(l!=='ok'){ await close('다시 로그인 실패'); return null; }
    }
    if(!key){ await close('열 수 있는 방이 없음'); return null; }
    return {page, close, get key(){ return key; }};
  }catch(e){ log('방 열기 오류', String(e&&e.message||e).slice(0,200)); await close('오류'); return null; }
}

const live=[];        // {page, close, key, started, endedAt}
async function watch(h){
  let startedAt=0, lastHumans=0;
  try{
    h.page.on('crash', ()=>h.close('탭 충돌'));
    while(!stopping){
      await sleep(1000);
      let st; try{ st=await h.page.evaluate(()=>window.__ffd.status()); }catch(e){ await h.close('상태 읽기 실패'); break; }
      if(st.err){ await h.close('오류 '+st.err); break; }
      if(st.started && !startedAt){ startedAt=Date.now(); h.started=true; log('경기 시작', h.key); }
      if(st.ended){ if(!h.endedAt){ h.endedAt=Date.now(); log('경기 끝', h.key); } if(Date.now()-h.endedAt>15000){ await h.close('경기 끝남'); break; } }
      if(startedAt && Date.now()-startedAt>25*60*1000){ await h.close('너무 오래 진행됨'); break; }
      lastHumans=st.humans;
    }
  }finally{ const i=live.indexOf(h); if(i>=0) live.splice(i,1); }
}

async function main(){
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-features=WebRtcHideLocalIpsWithMdns']});
  log('전용 방장 시작', URL);
  browser.on('disconnected', ()=>{ if(!stopping){ log('브라우저가 꺼졌어요, 다시 시작해요'); process.exit(1); } });
  let fails=0;
  while(!stopping){
    const waiting=live.filter(h=>!h.started).length;
    if(waiting<WAITING && live.length<MAXR){
      const h=await openRoom();
      if(h){ fails=0; live.push(h); watch(h); } else { fails++; await sleep(Math.min(30000, 2000*fails)); }
      continue;
    }
    if(RESTART_H>0 && Date.now()-T0>RESTART_H*3600*1000 && live.every(h=>!h.started)){ log('새 빌드를 받으러 다시 시작해요'); break; }
    await sleep(1500);
  }
  stopping=true; try{ await browser.close(); }catch(e){}
  process.exit(0);
}
process.on('SIGTERM', ()=>{ stopping=true; process.exit(0); });
process.on('SIGINT', ()=>{ stopping=true; process.exit(0); });
main().catch(e=>{ console.error(e); process.exit(1); });

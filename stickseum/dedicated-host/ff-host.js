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
const os=require('os');
const MAX_BY_MEM=Math.max(2, Math.floor(os.totalmem()/1048576/250));            // (한 방에 램 약 250MB: 램 1GB 서버면 최대 4방)
const MAXR=Math.max(1, Math.min(+process.env.FF_MAX||10, MAX_BY_MEM)), WAITING=Math.max(1, Math.min(+process.env.FF_WAITING||3, Math.max(1, Math.floor(MAXR/4)))), RESTART_H=+process.env.FF_RESTART_H||6;
const BUSY_LOAD=+process.env.FF_BUSY_LOAD||(os.cpus().length*2.5);              // (이보다 바쁘면 새 방 부탁을 거절해요: 그 사람이 직접 방장이 돼요)
const URL=process.env.FF_URL||'https://frenchfries777mc.github.io/games/stickseum/Stickseum-latest.html?dedicated=1';
const T0=Date.now();
const log=(...a)=>console.log(new Date().toISOString().slice(11,19), ...a);
if(!USER || !PASS){ console.error('FF_USER / FF_PASS 가 없어요 (/etc/ff-host.env 를 확인하세요)'); process.exit(2); }

let browser=null, stopping=false, mapList=[], loginOk=false;
const rooms=new Set();          // 열려 있는 방 (맵:자리)
const blocked=new Map();        // 열려다 실패한 방 (남이 쓰고 있는 이름): 1분 동안 건너뛰어요
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function openRoom(spec){
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
    const free=[];
    if(spec){ free.push([spec.mapId, spec.slot]); }
    else for(const slot of [1,2]) for(const m of mapList) if(!rooms.has(m+':'+slot) && !(blocked.get(m+':'+slot)>Date.now()-60000)) free.push([m,slot]);
    if(!free.length){ await close('빈 자리 없음'); return null; }
    for(const [m,slot] of free){
      key=spec ? spec.roomId : m+':'+slot; rooms.add(key);
      await page.evaluate(([a,b,c,d,e])=>window.__ffd.open(a,b,c,d,e), spec ? [m,slot,spec.mode,spec.evt,spec.ranked] : [m,slot]);
      const t0=Date.now(); let st=null;
      while(Date.now()-t0<20000){ await sleep(500); st=await page.evaluate(()=>window.__ffd.status()); if(st.live || st.err) break; }
      if(st && st.live){ log('방 열림', key); break; }
      log('방 열기 실패', key, st&&st.err); if(spec){ rooms.delete(key); key=null; await close('이름이 이미 쓰이는 중'); return null; } blocked.set(key, Date.now()); rooms.delete(key); key=null;
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

/* 모든 온라인 경기를 서버가 여는 길: 'ff-dispatch' 라는 이름으로 기다리다가 {t:'want'} 가 오면 그 방을 열어 방 이름을 돌려줘요.
   (이미 열려 있으면 그 방을 그대로 알려 줘요. 자리가 없거나 서버가 바쁘면 null → 부탁한 사람이 직접 방장이 돼요.) */
const pending=new Map();       // 방 이름 → 열고 있는 중인 약속
function busyNow(){ return live.length+pending.size>=MAXR || os.loadavg()[0]>BUSY_LOAD || os.freemem()<130*1048576; }
async function want(d, dpage){
  const mode=String(d.mode||'ffa'), mapId=String(d.mapId||''), slot=+d.slot||1, evt=!!d.evt, ranked=!!d.ranked&&mode==='duel';
  if(!mapId || !/^[a-z0-9_-]+$/i.test(mode+mapId)) return null;
  const roomId=await dpage.evaluate(([a,b,c,e,r])=>window.__ffd.roomName(a,b,c,e,r), [mapId,slot,mode,evt,ranked]);
  if(pending.has(roomId)) return pending.get(roomId);
  const ex=live.find(h=>h.key===roomId);
  if(ex) return ex.started ? null : roomId;
  if(busyNow()){ log('서버가 바빠서 거절', roomId, 'rooms', live.length, 'load', os.loadavg()[0].toFixed(2)); return null; }
  const pr=(async()=>{
    const h=await openRoom({mapId, slot, mode, evt, ranked, roomId});
    if(!h) return null;
    live.push(h); watch(h); log('부탁받은 방 열림', roomId); return roomId;
  })().finally(()=>setTimeout(()=>pending.delete(roomId), 1500));
  pending.set(roomId, pr);
  return pr;
}
async function startDispatcher(){
  const ctx=await browser.newContext({viewport:{width:320,height:240}});
  if(process.env.FF_TEST) await require(process.env.FF_TEST)(ctx);
  const page=await ctx.newPage();
  page.on('pageerror', ()=>{});
  await page.exposeFunction('__ffdWant', d=>want(d, page));
  await page.goto(URL, {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForFunction(()=>window.__ffd && typeof window.Peer==='function', null, {timeout:60000});
  await page.evaluate(()=>window.__ffd.dispatch());
  log('방 부탁 받는 중 (최대', MAXR, '방)');
  setInterval(async()=>{ try{ const s=await page.evaluate(()=>window.__ffd.dispState()); if(!s.open && !stopping){ if(++dispBad>=5){ log('부탁 창구가 닫혀서 다시 시작해요', s.err); process.exit(1); } } else dispBad=0; }catch(e){ log('창구 확인 실패, 다시 시작해요'); process.exit(1); } }, 10000);
}
let dispBad=0;
async function main(){
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-features=WebRtcHideLocalIpsWithMdns']});
  log('전용 방장 시작', URL);
  browser.on('disconnected', ()=>{ if(!stopping){ log('브라우저가 꺼졌어요, 다시 시작해요'); process.exit(1); } });
  await startDispatcher();
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

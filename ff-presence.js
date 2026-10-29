/* Frenchfries777: 접속 신호. 지금 누가 어디(허브 / 어떤 게임)에 있는지 알려서 허브 "지금 N명 접속 중"과 친구 목록 🟢 에 나타나요.
   ff-lang.js 가 모든 페이지에서 이 파일을 불러와요. 게임 화면이면 그 게임으로, 그 밖의 페이지면 '허브'로 쳐요. 페이지는 따로 할 일이 없어요.
   - 로그인한 사람: ff_ping(game) / ff_hub_ping() (supabase-ff-hub.sql)
   - 로그인 안 한 손님: ff_guest_ping(gid, place) (supabase-presence-v2.sql). 손님은 이 브라우저에 저장한 임의 번호(ff_gid) 하나로 한 명으로 세요.
   다른 탭에 가 있어도 신호를 보내고, 로그인이 이 탭에 따로 저장된 게임(Isleport)이나 만료된 로그인은 로그인 창구(FFAuthClient)에서 새 정보를 받아 써요. */
(function(){
'use strict';
if(window.FFPresence) return;
var URL_='https://kebsbuvuutilitwlvxzv.supabase.co', KEY='', SKEY='sb-kebsbuvuutilitwlvxzv-auth-token';
KEY='sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf';
/* which game is this page? only the game files themselves, not the game sites */
function which(){
  var p=decodeURIComponent(location.pathname||''), f=p.split('/').pop()||'';
  if(/\/stickseum\//i.test(p) && /^(Stickseum|ArenaClash|StickmanRumble)[^/]*\.html$/i.test(f)) return 'stickseum';
  if(/\/crownenvoy\//i.test(p) && /^CrownEnvoy[^/]*\.html$/i.test(f)) return 'crownenvoy';
  if(/\/beaconfall\//i.test(p) && /^(BEACONFALL|lobby)[^/]*\.html$/i.test(f)) return 'beaconfall';
  if(/\/isleport\//i.test(p) && /^IslandTrade[^/]*\.html$/i.test(f)) return 'isleport';
  if(/\/(prototypes\/dummyparty|dummyparty\/play)\//i.test(p)) return 'dummyparty';
  if(/\/(prototypes\/vowkeep|vowkeep\/play)\//i.test(p)) return 'vowkeep';
  if(/\/prototypes\/tumblecrown\//i.test(p)) return 'tumblecrown';
  if(/\/prototypes\/gatecrash\//i.test(p)) return 'gatecrash';
  return null;
}
/* 게임이 아닌 사이트(Educations, Tools)는 '사이트'로 따로 세요 (허브 인원과 섞이지 않아요) */
function siteOf(){
  var p=decodeURIComponent(location.pathname||'');
  if(/^\/(games\/)?educations(\/|$)/i.test(p)||/\/educations\//i.test(p)) return 'educations';
  if(/\/tools(\/|$)/i.test(p)) return 'tools';
  return null;
}
var game=which(), site=game?null:siteOf(), place=game||site||'hub';
window.FFPresence={game:game};
if(!window.fetch) return;
/* 방 서버(ff-host)의 화면 없는 브라우저는 사람이 아니라서 접속 신호를 보내지 않아요 (주소의 dedicated=1, 자동화 브라우저 표시) */
if(/[?&]dedicated=1(&|$)/.test(location.search||'')||navigator.webdriver) return;
function okTok(raw){ try{ var s=JSON.parse(raw||'null'); if(s&&s.access_token&&(!s.expires_at||s.expires_at*1000>Date.now()+5000)) return s; }catch(e){} return null; }
/* 공용 로그인(localStorage)이 만료됐거나 비어 있어도, 이 탭의 게임이 따로 들고 있는 로그인(sessionStorage 의 sb-... 키, 예: Isleport)이 살아 있으면 그걸 써요 */
function token(){ var best=null; try{ best=okTok(localStorage.getItem(SKEY)); }catch(e){} try{ for(var i=0;i<sessionStorage.length;i++){ var k=sessionStorage.key(i); if(/^sb-/.test(k)){ var t=okTok(sessionStorage.getItem(k)); if(t&&(!best||(t.expires_at||0)>(best.expires_at||0))) best=t; } } }catch(e){} return best?best.access_token:null; }
/* 저장된 로그인이 만료됐으면, 이 페이지의 로그인 창구가 새로 받아 둔 것을 물어봐요 */
function freshToken(){
  var t=token(); if(t) return Promise.resolve(t);
  var c=window.FFAuthClient||window.sb; if(!c||!c.auth||!c.auth.getSession) return Promise.resolve(null);
  try{ return Promise.resolve(c.auth.getSession()).then(function(r){ var s=r&&r.data&&r.data.session; return s&&s.access_token||null; },function(){ return null; }); }catch(e){ return Promise.resolve(null); } }
function gid(){ var g=null; try{ g=localStorage.getItem('ff_gid'); }catch(e){}
  if(!g||!/^[0-9a-f-]{36}$/.test(g)){ try{ g=(crypto.randomUUID&&crypto.randomUUID())||null; }catch(e){}
    if(!g){ g='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ var r=Math.random()*16|0; return (c==='x'?r:(r&3|8)).toString(16); }); }
    try{ localStorage.setItem('ff_gid',g); }catch(e){} }
  return g; }
function rpc(name,body,tok,keep){ return fetch(URL_+'/rest/v1/rpc/'+name,{method:'POST',keepalive:!!keep,headers:{'apikey':KEY,'Authorization':'Bearer '+(tok||KEY),'Content-Type':'application/json'},body:JSON.stringify(body||{})}).catch(function(){}); }
var last=0, wasGuest=false, busy=false, noSite=false;
function ping(force){
  if(busy||(!force&&Date.now()-last<40000)) return; busy=true;
  freshToken().then(function(t){
    last=Date.now();
    if(t){ wasGuest=false;
      if(game) return rpc('ff_ping',{p_game:game},t);
      if(site&&!noSite) return rpc('ff_site_ping',{p_site:site},t).then(function(r){ if(r&&r.status===404){ noSite=true; return rpc('ff_hub_ping',{},t); } });   /* supabase-presence-v5.sql 전이면 옛 방식(허브로 합산) */
      return rpc('ff_hub_ping',{},t); }
    wasGuest=true; return rpc('ff_guest_ping',{p_gid:gid(),p_place:place});
  }).then(function(){ busy=false; },function(){ busy=false; });
}
/* 창을 닫거나 다른 페이지로 가면 바로 접속 표시에서 빠져요 (로그인한 사람만) */
function leave(){ var t=token(); if(!t) return; last=0; rpc('ff_leave',{},t,true); }
window.addEventListener('pagehide', leave);
setTimeout(ping, 1500);
setInterval(ping, 45000);
/* 같은 탭에서 방금 로그인했거나(손님이었다가) 다른 탭에서 로그인한 걸 빨리 알아채요 */
setInterval(function(){ if(wasGuest&&token()) ping(true); }, 5000);
window.addEventListener('storage', function(e){ if(e.key===SKEY) ping(true); });
document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='visible') ping(); });
window.addEventListener('pageshow', function(e){ if(e.persisted) ping(true); });
window.addEventListener('focus', function(){ ping(); });
window.addEventListener('online', function(){ ping(true); });
})();

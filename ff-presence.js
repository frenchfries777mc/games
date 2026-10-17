/* Frenchfries777: "지금 이 게임을 하고 있어요"를 친구에게 알려요 (친구 목록에 🟢 표시)
   게임 파일이 ff-lang.js 를 불러오면 ff-lang.js 가 이 파일도 불러요. 게임은 따로 할 일이 없어요.
   로그인한 상태로 게임 화면이 보이는 동안 1분마다 Supabase 의 ff_ping(game) 을 불러요 (supabase-ff-hub.sql). */
(function(){
'use strict';
if(window.FFPresence) return;
var URL_='https://kebsbuvuutilitwlvxzv.supabase.co', KEY='sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf', SKEY='sb-kebsbuvuutilitwlvxzv-auth-token';
/* which game is this page? only the game files themselves, not the game sites */
function which(){
  var p=decodeURIComponent(location.pathname||''), f=p.split('/').pop()||'';
  if(/\/stickseum\//i.test(p) && /^(Stickseum|ArenaClash|StickmanRumble)[^/]*\.html$/i.test(f)) return 'stickseum';
  if(/\/crownenvoy\//i.test(p) && /^CrownEnvoy[^/]*\.html$/i.test(f)) return 'crownenvoy';
  if(/\/beaconfall\//i.test(p) && /^(BEACONFALL|lobby)[^/]*\.html$/i.test(f)) return 'beaconfall';
  return null;
}
var game=which();
window.FFPresence={game:game};
if(!game||!window.fetch) return;
function token(){ try{ var s=JSON.parse(localStorage.getItem(SKEY)||'null'); if(s&&s.access_token&&(!s.expires_at||s.expires_at*1000>Date.now())) return s.access_token; }catch(e){} return null; }
var last=0;
function ping(){
  if(document.visibilityState==='hidden') return;
  var t=token(); if(!t||Date.now()-last<50000) return; last=Date.now();
  fetch(URL_+'/rest/v1/rpc/ff_ping',{method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({p_game:game}),keepalive:true}).catch(function(){});
}
/* 창을 닫거나 다른 페이지로 가면 바로 접속 표시에서 빠져요 */
function leave(){ var t=token(); if(!t) return; last=0;
  fetch(URL_+'/rest/v1/rpc/ff_leave',{method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json'},body:'{}',keepalive:true}).catch(function(){}); }
window.addEventListener('pagehide', leave);
setTimeout(ping, 4000);
setInterval(ping, 60000);
document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='visible') ping(); });
window.addEventListener('pageshow', function(e){ if(e.persisted) ping(); });
})();

/* 자주 하는 게임 오프라인 저장 (최대 3개)
   게임 화면을 2번 이상 연 게임 중 많이 연 순서대로 3개를 서비스 워커(/sw.js)가 저장해 둬요. 온라인이면 늘 최신을 받고, 연결이 없을 때만 저장본을 열어요.
   설정 화면에서 끄거나 지울 수 있어요: FFOffline.setOn(false) / FFOffline.clear() / FFOffline.state(함수) */
(function(){
  if(window.FFOffline) return;
  var K='ffoff', GRE=/^\/games\/((?:prototypes\/)?(stickseum|crownenvoy|beaconfall|isleport|vowkeep|tumblecrown|dummyparty|gatecrash)\/)/;
  var host=location.hostname, ok=('serviceWorker' in navigator)&&('caches' in window)&&(host==='frenchfries777.com'||host==='www.frenchfries777.com');
  function rd(){ var o={}; try{ o=JSON.parse(localStorage.getItem(K)||'{}')||{}; }catch(e){} o.on=o.on!==false; o.v=o.v||{}; o.u=o.u||{}; o.pf=o.pf||{}; return o; }
  function wr(o){ try{ localStorage.setItem(K,JSON.stringify(o)); }catch(e){} }
  function send(msg){ return navigator.serviceWorker.ready.then(function(r){ var w=r.active||navigator.serviceWorker.controller; if(w) w.postMessage(msg); }).catch(function(){}); }
  function top(o){ return Object.keys(o.v).filter(function(g){ return o.v[g].n>=2; }).sort(function(a,b){ return o.v[b].n-o.v[a].n||o.v[b].t-o.v[a].t; }).slice(0,3); }
  function cheap(){ var c=navigator.connection; return !(c&&(c.saveData||c.type==='cellular'||/^(slow-2g|2g)$/.test(c.effectiveType||''))); }
  function sync(o){ var l=o.on?top(o):[]; send({ffoff:'games',list:l}); return l; }
  function prefetch(o,l){ if(!navigator.onLine||!cheap()) return;
    l.forEach(function(g){ if(Date.now()-(o.pf[g]||0)<6048e5||!o.u[g]) return; send({ffoff:'prefetch',game:g,url:'/games/'+o.u[g]}); }); }
  navigator.serviceWorker&&navigator.serviceWorker.addEventListener&&navigator.serviceWorker.addEventListener('message',function(e){ var d=e.data; if(d&&d.ffoff==='done'){ var o=rd(); o.pf[d.game]=Date.now(); wr(o); } });
  window.FFOffline={ok:ok,
    setOn:function(b){ var o=rd(); o.on=!!b; wr(o); if(ok){ var l=sync(o); if(b) prefetch(o,l); } },
    clear:function(){ var o=rd(); o.v={}; o.pf={}; wr(o); if(ok) send({ffoff:'clear'}); },
    state:function(cb){ var o=rd(); if(!ok){ cb({ok:false,on:o.on,list:[]}); return; } var done=false, h=function(e){ var d=e.data; if(d&&d.ffoff==='status'&&!done){ done=true; navigator.serviceWorker.removeEventListener('message',h); cb({ok:true,on:o.on,list:d.list}); } };
      navigator.serviceWorker.addEventListener('message',h); send({ffoff:'status'}); setTimeout(function(){ if(!done){ done=true; cb({ok:true,on:o.on,list:[]}); } },2500); } };
  if(!ok) return;
  var m=GRE.exec(location.pathname); var o=rd();
  if(m){ var g=m[2]; try{ if(!sessionStorage.getItem('ffoffV_'+g)){ sessionStorage.setItem('ffoffV_'+g,'1'); var r=o.v[g]||{n:0,t:0}; r.n++; r.t=Date.now(); o.v[g]=r; } }catch(e){} o.u[g]=m[1]; wr(o); }
  var l=sync(o);
  if(m&&o.on) setTimeout(function(){ prefetch(rd(),l); },20000);
})();

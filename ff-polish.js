/* © 2026 Frenchfries777. CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
   모든 페이지 공통 다듬기 (ff-lang.js 가 불러와요). 페이지는 따로 할 일이 없어요.
   - 스크롤바 숨김, 숫자 자리 맞춤(tabular-nums), 큰 제목 줄바꿈 균형, 움직임 줄이기(허브 타일 포함)
   - 페이지 이동 부드러운 전환 + 링크 미리 받기
   - 콘솔에 한 줄
   - 뒤로가기: 열린 팝업·창만 닫기 (window.FFBack)
   - 사진 크게 보기 (위키 사진, 채팅 사진 등)
   - 언어에 맞는 날짜·숫자 형식 (window.FFFmt)
   - 짧은 진동 (window.FFHaptic.hit(), 모바일에서만)
   - 화면 꺼짐 방지: 교육 프로그램 / 게임 (+ 게임 전체화면 버튼) */
(function(){
'use strict';
if(window.__ffPolish) return; window.__ffPolish=1;
var P=decodeURIComponent(location.pathname||''), F=P.split('/').pop()||'';
function isGame(){
  if(/\/stickseum\//i.test(P)&&/^(Stickseum|ArenaClash|StickmanRumble)[^/]*\.html$/i.test(F)) return 1;
  if(/\/crownenvoy\//i.test(P)&&/^CrownEnvoy[^/]*\.html$/i.test(F)) return 1;
  if(/\/beaconfall\//i.test(P)&&/^(BEACONFALL|lobby)[^/]*\.html$/i.test(F)) return 1;
  if(/\/isleport\//i.test(P)&&/^IslandTrade[^/]*\.html$/i.test(F)) return 1;
  if(/\/(prototypes\/dummyparty|dummyparty\/play|prototypes\/vowkeep|vowkeep\/play|prototypes\/gatecrash|gatecrash\/play|prototypes\/tumblecrown|prototypes\/kitchendefense)\//i.test(P)) return 1;
  return 0; }
var GAME=isGame(), EDU=/\/educations\/[^\/]+\/?/i.test(P)&&!/\/educations\/(index\.html)?$/i.test(P);
/* ---- 콘솔 한 줄 ---- */
try{ console.log('%cCreated by Frenchfries777','color:#ffd54a;font:700 14px system-ui,sans-serif'); }catch(e){}
/* ---- 스타일 ---- */
var css='*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0;display:none}'+
  'h1,h2,h3{text-wrap:balance}';
if(!GAME){
  css+='html{font-variant-numeric:tabular-nums}'+
    '@view-transition{navigation:auto}::view-transition-old(root),::view-transition-new(root){animation-duration:.18s}'+
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}@view-transition{navigation:none}}';
}
css+='#ffLb{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:12px}'+
  '#ffLb img{max-width:96vw;max-height:92vh;object-fit:contain;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.6)}'+
  '#ffLb button{position:absolute;top:12px;right:14px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:20px;cursor:pointer}'+
  '#ffFs{position:fixed;right:10px;bottom:10px;z-index:2147482000;width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.45);color:#fff;font-size:18px;line-height:1;cursor:pointer;opacity:.7}#ffFs:hover{opacity:1}';
try{ var st=document.createElement('style'); st.id='ffPolish'; st.textContent=css; (document.head||document.documentElement).appendChild(st); }catch(e){}
/* ---- 뒤로가기: 열린 팝업만 닫기 ---- */
var stack=[], skip=0, seq=0;
window.FFBack={
  push:function(close){ var id=++seq; try{ history.pushState({ffb:id},''); }catch(e){ return 0; } stack.push({id:id,close:close}); return id; },
  done:function(id){ var i=-1; for(var k=0;k<stack.length;k++) if(stack[k].id===id) i=k; if(i<0) return;
    var top=(i===stack.length-1); stack.splice(i,1);
    if(top&&history.state&&history.state.ffb===id){ skip++; try{ history.back(); }catch(e){ skip--; } } }
};
window.addEventListener('popstate',function(){
  if(skip>0){ skip--; return; }
  if(!stack.length) return;
  var t=stack.pop(); try{ t.close(); }catch(e){} });
var WATCH=/^(ffaModal|ffaSetup|ffaFriends|ffaDM|ffaRep|ffaAcct|ffpAch|ffaNotes|ffaPick)$/;
function isPopup(n){ return n&&n.nodeType===1&&(n.classList.contains('modal')||WATCH.test(n.id||'')); }
var track=typeof WeakMap==='function'?new WeakMap():null;
function adopt(n){
  if(!track||track.has(n)||n.id==='ffaAcct'&&n.classList.contains('inl')) return;
  var id=FFBack.push(function(){ track.set(n,0); var x=n.querySelector&&n.querySelector('.x'); if(x&&n.id){ try{ x.click(); }catch(e){} } if(n.parentNode) n.remove(); });
  if(id) track.set(n,id); }
function release(n){ var id=track&&track.get(n); if(id){ track.set(n,0); FFBack.done(id); } }
function startWatch(){
  var mo=new MutationObserver(function(ms){ ms.forEach(function(m){
    [].forEach.call(m.addedNodes,function(n){ if(isPopup(n)) adopt(n); });
    [].forEach.call(m.removedNodes,function(n){ if(isPopup(n)) release(n); }); }); });
  mo.observe(document.body,{childList:true}); }
if(!GAME){ if(document.body) startWatch(); else document.addEventListener('DOMContentLoaded',startWatch); }
/* ---- 사진 크게 보기 ---- */
var ZSEL='img.chi,.ibi img,#msgs a[target=_blank]>img,img[data-zoom],img.zoomable';
function lightbox(src){
  if(document.getElementById('ffLb')) return;
  var lb=document.createElement('div'); lb.id='ffLb'; var im=document.createElement('img'); im.src=src; im.alt=''; lb.appendChild(im);
  var x=document.createElement('button'); x.type='button'; x.setAttribute('aria-label','close'); x.textContent='✕'; lb.appendChild(x);
  var id=0, closed=0;
  function close(){ if(closed) return; closed=1; document.removeEventListener('keydown',kd,true); lb.remove(); if(id) FFBack.done(id); }
  function kd(e){ if(e.key==='Escape'){ e.stopPropagation(); close(); } }
  lb.onclick=close; document.addEventListener('keydown',kd,true); document.body.appendChild(lb);
  id=FFBack.push(function(){ closed=1; document.removeEventListener('keydown',kd,true); lb.remove(); id=0; }); }
document.addEventListener('click',function(e){
  var t=e.target; if(!t||t.tagName!=='IMG'||!t.matches||!t.matches(ZSEL)) return;
  var src=t.currentSrc||t.src; if(!src) return; e.preventDefault(); e.stopPropagation(); lightbox(src); },true);
/* ---- 링크 미리 받기 ---- */
(function(){
  if(GAME) return; try{ var cn=navigator.connection; if(cn&&(cn.saveData||/(^|-)2g$/.test(cn.effectiveType||''))) return; }catch(e){}
  var done={}, n=0;
  function pf(e){ var a=e.target&&e.target.closest&&e.target.closest('a[href]'); if(!a||n>=16) return;
    var u; try{ u=new URL(a.href,location.href); }catch(x){ return; }
    if(u.origin!==location.origin||a.target==='_blank'||a.hasAttribute('download')||u.pathname===location.pathname&&u.search===location.search||done[u.href]) return;
    if(/\.(zip|pdf|mp3|mp4|webm|exe|dmg|apk)$/i.test(u.pathname)||/^\/(log-in|oauth)/i.test(u.pathname)) return;
    done[u.href]=1; n++; var l=document.createElement('link'); l.rel='prefetch'; l.href=u.href; document.head.appendChild(l); }
  document.addEventListener('pointerover',function(e){ if(e.pointerType==='mouse') pf(e); },{passive:true});
  document.addEventListener('touchstart',pf,{passive:true});
})();
/* ---- 언어에 맞는 날짜·숫자 ---- */
function curLang(){ var l=''; try{ l=(window.FFLang&&FFLang.pick&&FFLang.pick())||localStorage.getItem('arenaClashLang')||''; }catch(e){}
  if(!l) l=(navigator.language||'en').slice(0,2); return ({nw:'en',gk:'ko'})[l]||l; }
window.FFFmt={ lang:curLang,
  num:function(v,o){ try{ return new Intl.NumberFormat(curLang(),o).format(+v); }catch(e){ return String(v); } },
  date:function(d,o){ try{ return new Intl.DateTimeFormat(curLang(),o||{year:'numeric',month:'long',day:'numeric'}).format(new Date(d)); }catch(e){ return String(d); } },
  time:function(d,o){ try{ return new Intl.DateTimeFormat(curLang(),o||{hour:'numeric',minute:'2-digit'}).format(new Date(d)); }catch(e){ return String(d); } } };
/* ---- 짧은 진동: 맞거나 때릴 때 (모바일에서만, 게임이 FFHaptic.hit() 을 불러요) ---- */
(function(){
  var last=0;
  function on(){ try{ if(!navigator.vibrate) return false; if(localStorage.getItem('ff_haptic')==='0') return false;
    var dv=localStorage.getItem('ff_device'); if(dv) return dv==='mobile';
    return !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches); }catch(e){ return false; } }
  window.FFHaptic={ hit:function(ms){ var t=Date.now(); if(t-last<90||!on()) return; last=t; try{ navigator.vibrate(ms||22); }catch(e){} },
    big:function(){ var t=Date.now(); if(t-last<90||!on()) return; last=t; try{ navigator.vibrate([30,30,45]); }catch(e){} } };
})();
/* ---- 화면 꺼짐 방지 ---- */
var wl=null;
function hold(){ try{ if(wl||!navigator.wakeLock||document.visibilityState!=='visible') return; navigator.wakeLock.request('screen').then(function(s){ wl=s; s.addEventListener('release',function(){ wl=null; }); }).catch(function(){}); }catch(e){} }
/* 슬라이드 발표 중(#present.on)에도 화면이 꺼지지 않게 */
if(/\/tools\/slides\//i.test(P)){ var pw=function(){ var el=document.getElementById('present'); if(!el){ setTimeout(pw,800); return; }
    var chk=function(){ if(el.classList.contains('on')) hold(); else if(wl){ try{ wl.release(); }catch(e){} wl=null; } };
    new MutationObserver(chk).observe(el,{attributes:true,attributeFilter:['class']}); document.addEventListener('visibilitychange',function(){ if(el.classList.contains('on')) hold(); }); chk(); };
  pw(); }
if(GAME||EDU){ hold(); document.addEventListener('visibilitychange',hold); ['pointerdown','keydown'].forEach(function(ev){ document.addEventListener(ev,hold,{passive:true}); }); }
/* ---- 게임 전체화면 버튼 ---- */
if(GAME){ document.addEventListener('DOMContentLoaded',function(){
  var de=document.documentElement; if(!de.requestFullscreen&&!de.webkitRequestFullscreen) return; if(document.getElementById('ffFs')) return;
  var b=document.createElement('button'); b.id='ffFs'; b.type='button'; b.title='Fullscreen'; b.setAttribute('aria-label','Fullscreen'); b.textContent='⛶';
  b.onclick=function(){ try{ if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } else { (de.requestFullscreen||de.webkitRequestFullscreen).call(de); } }catch(e){} };
  document.body.appendChild(b); }); }
})();

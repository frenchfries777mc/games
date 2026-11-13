/* 설치 버튼: 사이트를 앱처럼 설치해요. 설치한 앱도 사이트를 그대로 열어서 업데이트가 같이 따라와요. */
(function(){
  if(window.FFInstall) return;
  var host=location.hostname; if(host!=='frenchfries777.com'&&host!=='www.frenchfries777.com') return;
  var standalone=false; try{ standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true; }catch(e){}
  /* 프로그램 페이지는 그 프로그램만의 앱으로 설치돼요 (games/pwa/이름.webmanifest). 그 밖의 페이지는 사이트 전체 앱 */
  var pm=/^\/games\/(?:prototypes\/)?(stickseum|crownenvoy|beaconfall|isleport|vowkeep|tumblecrown|dummyparty|gatecrash)\//.exec(location.pathname)||/^\/educations\/(planetsearch|speedcode|timeline|munjang|balance|proverb)\//.exec(location.pathname)||/^\/tools\/(code|blocks|sheet|docs|slides|lab|draw|score|video)\//.exec(location.pathname);
  var ml=document.querySelector('link[rel=manifest]');
  if(pm){ if(!ml){ ml=document.createElement('link'); ml.rel='manifest'; document.head.appendChild(ml); } ml.href='/games/pwa/'+pm[1]+'.webmanifest'; }
  else if(!ml){ var l=document.createElement('link'); l.rel='manifest'; l.href='https://frenchfries777.com/manifest.webmanifest'; document.head.appendChild(l); }
  if('serviceWorker' in navigator && !/^\/tools\//.test(location.pathname)){ try{ navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){}); }catch(e){} }
  window.FFInstall={};
  if(standalone) return;
  var ev=null, btn=null;
  var ko=!/^(en|es|fr|de|ja)/.test((document.documentElement.lang||'ko'));
  var T=({ko:'설치',en:'Install',es:'Instalar',fr:'Installer',de:'Installieren',ja:'インストール'});
  var lg=(document.documentElement.lang||'ko').slice(0,2); var label=T[lg]||T.ko;
  /* 설치 버튼은 허브 첫 화면의 로그인/회원가입 자리(#heroAuth)에서, 로그인한 사람에게만 보여요 */
  function loggedIn(){ try{ return !!(window.FFAuth&&FFAuth.user()); }catch(e){ return false; } }
  function paint(){
    var ha=document.getElementById('heroAuth'); if(!ha) return;
    if(!loggedIn()){ if(btn){ btn.remove(); btn=null; } return; }
    if(btn) return;
    btn=document.createElement('div'); btn.className='auth'; btn.id='heroInstall';
    var b=document.createElement('button'); b.type='button'; b.setAttribute('data-notr',''); b.textContent='⬇ '+label;
    b.onclick=function(){
      var e=ev;
      if(e){ ev=null; e.prompt(); e.userChoice.then(function(){ paint(); }); return; }
      var m=document.getElementById('heroInstallMsg');
      if(!m){ m=document.createElement('div'); m.id='heroInstallMsg'; m.setAttribute('data-notr',''); m.style.cssText='margin-top:10px;font-size:14px;opacity:.85'; btn.appendChild(m); }
      var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
      m.textContent=ios?'공유 버튼 → 홈 화면에 추가를 눌러 주세요.':'브라우저 메뉴(⋮) → 앱 설치(또는 홈 화면에 추가)를 눌러 주세요. 이미 설치했다면 앱으로 열어 보세요.';
    };
    btn.appendChild(b); ha.parentNode.insertBefore(btn,ha.nextSibling);
  }
  function wire(){ if(!window.FFAuth) return setTimeout(wire,300); FFAuth.ready.then(function(){ paint(); FFAuth.onChange(paint); },paint); }
  function show(){ paint(); wire(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show();
  addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); ev=e; });
  addEventListener('appinstalled',function(){ ev=null; paint(); var x=document.getElementById('ffInstBar'); if(x) x.remove(); });
  /* 앱 스토어의 "설치"로 들어왔을 때(?ffinstall=1)만 화면 아래에 설치 줄을 보여요 */
  if(pm&&/[?&]ffinstall=1(&|$)/.test(location.search)){
    try{ history.replaceState(null,'',location.pathname+location.search.replace(/([?&])ffinstall=1(&|$)/,function(m,a,b){ return b?a:''; })+location.hash); }catch(e){}
    var bar=function(){ if(document.getElementById('ffInstBar')) return;
      var d=document.createElement('div'); d.id='ffInstBar'; d.setAttribute('data-notr',''); d.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);padding:8px 10px 8px 14px;border-radius:999px;background:#171717;color:#ece6d8;border:1px solid #d9b45f;font:500 14px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45)';
      var t=document.createElement('span'), b=document.createElement('button'), x=document.createElement('button');
      b.type=x.type='button'; b.textContent='⬇ '+label; x.textContent='✕'; x.setAttribute('aria-label','close');
      b.style.cssText='border:0;border-radius:999px;padding:7px 16px;background:#d9b45f;color:#111;font:700 14px system-ui,sans-serif;cursor:pointer'; x.style.cssText='border:0;background:none;color:#a39c8c;font-size:16px;cursor:pointer;padding:4px 6px';
      b.onclick=function(){ var e=ev; if(e){ ev=null; e.prompt(); e.userChoice.then(function(c){ if(c&&c.outcome==='accepted') d.remove(); }); return; }
        t.textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)?'공유 버튼 → 홈 화면에 추가':'브라우저 메뉴(⋮) → 앱 설치'; };
      x.onclick=function(){ d.remove(); };
      d.appendChild(t); d.appendChild(b); d.appendChild(x); (document.body||document.documentElement).appendChild(d); };
    if(document.body) bar(); else document.addEventListener('DOMContentLoaded',bar);
  }
})();

/* 설치 버튼: 사이트를 앱처럼 설치해요. 설치한 앱도 사이트를 그대로 열어서 업데이트가 같이 따라와요. */
(function(){
  if(window.FFInstall) return;
  var host=location.hostname; if(host!=='frenchfries777.com'&&host!=='www.frenchfries777.com') return;
  var standalone=false; try{ standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true; }catch(e){}
  if(!document.querySelector('link[rel=manifest]')){ var l=document.createElement('link'); l.rel='manifest'; l.href='https://frenchfries777.com/manifest.webmanifest'; document.head.appendChild(l); }
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
    if(!ev||!loggedIn()){ if(btn){ btn.remove(); btn=null; } return; }
    if(btn) return;
    btn=document.createElement('div'); btn.className='auth'; btn.id='heroInstall';
    var b=document.createElement('button'); b.type='button'; b.setAttribute('data-notr',''); b.textContent='⬇ '+label;
    b.onclick=function(){ var e=ev; ev=null; e.prompt(); e.userChoice.then(function(){ paint(); }); };
    btn.appendChild(b); ha.parentNode.insertBefore(btn,ha.nextSibling);
  }
  function wire(){ if(!window.FFAuth) return setTimeout(wire,300); FFAuth.ready.then(function(){ paint(); FFAuth.onChange(paint); },paint); }
  function show(){ paint(); wire(); }
  addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); ev=e; if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show(); });
  addEventListener('appinstalled',function(){ ev=null; paint(); });
})();

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
  function show(){
    if(btn||!ev) return;
    var host=document.querySelector('header .right')||document.querySelector('.ffhb-r,.ffhb');
    if(!host) return;
    btn=document.createElement('button'); btn.type='button'; btn.setAttribute('data-notr',''); btn.textContent='⬇ '+label; btn.title='Frenchfries777';
    btn.style.cssText='font:inherit;font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px;border:1px solid var(--fry,#d9b45f);background:transparent;color:var(--fry,#d9b45f);cursor:pointer;margin-right:8px;white-space:nowrap';
    btn.onclick=function(){ var e=ev; ev=null; e.prompt(); e.userChoice.then(function(){ if(btn){ btn.remove(); btn=null; } }); };
    host.insertBefore(btn,host.firstChild);
  }
  addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); ev=e; if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show(); });
  addEventListener('appinstalled',function(){ if(btn){ btn.remove(); btn=null; } });
})();

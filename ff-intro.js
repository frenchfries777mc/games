/* © 2026 Frenchfries777 · CC BY-NC-ND 4.0 — 게임별 소개 영상: 게임 소개 페이지 위쪽에 영상 칸, 허브 카드는 마우스를 올리면 재생 */
(function(){
  var KEYS=['stickseum','crownenvoy','tumblecrown','beaconfall','gatecrash','vowkeep','isleport','dummyparty'];
  var me=document.currentScript, BASE=(me&&me.src?me.src.replace(/ff-intro\.js.*$/,''):'https://frenchfries777.com/games/')+'intro/';
  function slugOf(s){ for(var i=0;i<KEYS.length;i++) if(s.indexOf('/'+KEYS[i]+'/')>=0||s.indexOf('/'+KEYS[i]+'.html')>=0) return KEYS[i]; return null; }
  function css(t){ var s=document.createElement('style'); s.textContent=t; document.head.appendChild(s); }
  function ready(f){ if(document.readyState!=='loading') f(); else document.addEventListener('DOMContentLoaded',f); }
  ready(function(){
    var here=slugOf(location.pathname), cards=[].slice.call(document.querySelectorAll('a.shot'));
    /* 허브: 카드 사진 위에서 영상 재생 */
    if(cards.length&&window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
      css('a.shot .ffPv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .35s;pointer-events:none;background:#000}a.shot .ffPv.on{opacity:1}');
      cards.forEach(function(a){
        var k=slugOf(a.getAttribute('href')||''); if(!k) return; var v=null;
        a.addEventListener('pointerenter',function(){
          if(!v){ v=document.createElement('video'); v.className='ffPv'; v.muted=true; v.defaultMuted=true; v.loop=true; v.playsInline=true; v.preload='auto'; v.setAttribute('aria-hidden','true'); v.src=BASE+k+'.mp4'; a.insertBefore(v,a.firstChild.nextSibling||null); }
          v.currentTime=0; var p=v.play(); if(p&&p.catch) p.catch(function(){}); v.classList.add('on');
        });
        a.addEventListener('pointerleave',function(){ if(v){ v.classList.remove('on'); v.pause(); } });
      });
    }
    /* 게임 소개 페이지: 위쪽에 소개 영상 칸 */
    if(here&&!cards.length){
      var at=document.querySelector('header.hero')||document.querySelector('.hero')||document.querySelector('header');
      var mn=!at&&document.querySelector('main');
      if(!at&&!mn) return;
      css('.ffIntro{max-width:980px;margin:28px auto;padding:0 16px;box-sizing:border-box;position:relative;z-index:3}.ffIntro video{display:block;width:100%;aspect-ratio:16/9;border-radius:12px;background:#000;box-shadow:0 10px 36px rgba(0,0,0,.45)}');
      var s=document.createElement('section'); s.className='ffIntro';
      s.innerHTML='<video controls playsinline preload="none" poster="'+BASE+here+'.jpg" src="'+BASE+here+'.mp4"></video>';
      if(at) at.parentNode.insertBefore(s,at.nextSibling); else mn.insertBefore(s,mn.firstChild);
    }
  });
})();

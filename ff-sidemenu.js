/* Left menu look for the hub-side pages: icon + label, gold pill for the current page, pure black menu.
   The pages keep their own markup; this adds the style and swaps the little squares for icons. */
(function(){
  if(window.__ffSideMenu)return; window.__ffSideMenu=1;
  /* a picture that fails to load is fetched again as plain data (not as an <img> request), then from the github mirror */
  if(!window.__ffImgRetry){ window.__ffImgRetry=1; var MIR='https://frenchfries777mc.github.io', MD=/^\/(games|educations|tools|prototypes|seumarena)\//;
    var viaFetch=function(u){ return fetch(u,{cache:'reload',credentials:'omit'}).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){ if(!/^image\//.test(b.type)) throw 0; return URL.createObjectURL(b); }); };
    var fixImg=function(i){ if(!i||i.tagName!=='IMG'||i.__ffr||!i.src||/^(data|blob):/.test(i.src)) return; i.__ffr=1; var s=i.src, u; try{ u=new URL(s); }catch(x){ return; }
      var mir=/(^|\.)frenchfries777\.com$/.test(u.hostname)?MIR+(MD.test(u.pathname)?'':'/hub')+u.pathname+u.search:null;
      viaFetch(s).catch(function(){ if(!mir) throw 0; return viaFetch(mir); }).then(function(b){ i.src=b; }).catch(function(){}); };
    document.addEventListener('error',function(e){ fixImg(e.target); },true);
    var sweep=function(){ [].forEach.call(document.images,function(i){ if(i.complete&&i.naturalWidth===0&&i.src) fixImg(i); }); };
    sweep(); document.addEventListener('DOMContentLoaded',sweep); window.addEventListener('load',function(){ sweep(); setTimeout(sweep,1500); }); }
  var IC={'/':'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>','/games/':'<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5M16 11.5h.01M18.5 13.5h.01"/>','/educations/':'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>','/tools/':'<path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-3 3-2.5-2.5z"/>','/wiki/':'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>','/community/':'<path d="M4 5h16v11H9l-5 4z"/>','/lounge/':'<path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 12a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 4 0v4H1v-4a2 2 0 0 1 2-2zM5 20v1.5M19 20v1.5"/>','/prototypes/':'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7.5 15h9"/>','/settings/':'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>'};
  var css='aside[style*="flex:0 0 232px"]{background:#000!important;border-right-color:#262626!important;gap:4px!important}'+
  'aside[style*="flex:0 0 232px"]>a:first-child{color:#fff}'+
  'aside[style*="flex:0 0 232px"]>a:first-child span:nth-child(3){color:#ffd54a!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm{border-radius:999px!important;padding:10px 16px!important;gap:11px!important;color:#9a9a9a!important;background:transparent!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm:hover{background:#0d0d0d!important;color:#fff!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm.on,aside[style*="flex:0 0 232px"] a.ffsm.on:hover{background:#ffd54a!important;color:#000!important;font-weight:700!important}'+
  /* the light theme flips the whole page with a filter, so these colours are what comes out as amber with dark text */
  'html[data-ff-theme=light] aside[style*="flex:0 0 232px"] a.ffsm.on,html[data-ff-theme=light] aside[style*="flex:0 0 232px"] a.ffsm.on:hover{background:#965a00!important;color:#fff!important}'+
  'html[data-ff-theme=light] aside[style*="flex:0 0 232px"]>a:first-child span:nth-child(3){color:#965a00!important}'+
  'a.ffsm svg{width:18px;height:18px;flex:none;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
  '#onlineBar .on-dot{flex:0 0 9px;width:9px;height:9px;border-radius:50%;background:#3fe0c5}html[data-ff-theme=light] #onlineBar .on-dot{background:#0f9e88}'+
  /* touch: bigger tap area for the small logo and footer links (no layout change) */
  '@media(pointer:coarse){.ffx-root>aside>a:first-child,.ffx-foot a{position:relative}.ffx-root>aside>a:first-child::after{content:"";position:absolute;inset:-12px -6px}.ffx-foot a::after{content:"";position:absolute;inset:-10px -4px}}';
  function ffScrollHint(sc,sel){
    function hz(){ return sc.scrollWidth>sc.clientWidth+4&&getComputedStyle(sc).overflowX!=='visible'; }
    function fade(){ var m=''; if(hz()){ var r=sc.scrollLeft+sc.clientWidth<sc.scrollWidth-4;
        m='linear-gradient(90deg,'+'#000 0,#000 28px'+','+(r?'#000 calc(100% - 28px),transparent 100%':'#000 calc(100% - 28px),#000 100%')+')'; }
      sc.style.webkitMaskImage=m; sc.style.maskImage=m; }
    function center(){ var on=sc.querySelector(sel); if(on&&hz()) sc.scrollLeft+=on.getBoundingClientRect().left-sc.getBoundingClientRect().left-(sc.clientWidth-on.offsetWidth)/2; fade(); }
    sc.addEventListener('scroll',fade,{passive:true}); addEventListener('resize',fade); center(); addEventListener('load',center);
  }
  /* body font, footer links and the online bar: the same on every hub-side page */
  var css2=
  'html body{font-family:"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;font-weight:400}'+
  'html body #onlineBar{margin:0!important;font-size:14px!important;color:#fff!important}'+      /* ff-online.js (educations, tools) uses a bigger font, a margin and a dim colour */
  'html body #onlineBar .on-n,html body #onlineBar .on-c,html body #onlineBar .on-c>span,html body #onlineBar .on-c b{color:#fff!important;font-size:14px!important}'+
  'html body #onlineBar .on-c{padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;height:auto!important}'+
  '.ffx-foot nav{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px}'+
  '#onlineBar .on-p{display:inline-flex;align-items:baseline;gap:5px}#onlineBar .on-p small{margin-left:4px}';
  /* the four menu names that are written in Korean in every page */
  var LB={'위키':{en:'Wiki',es:'Wiki',fr:'Wiki',de:'Wiki',ja:'Wiki',zh:'Wiki',pt:'Wiki',ru:'Wiki',tr:'Wiki',it:'Wiki',pl:'Wiki',ar:'Wiki',nw:'Truthbook'},
    '커뮤니티':{en:'Community',es:'Comunidad',fr:'Communauté',de:'Community',ja:'コミュニティ',zh:'社区',pt:'Comunidade',ru:'Сообщество',tr:'Topluluk',it:'Community',pl:'Społeczność',ar:'المجتمع',nw:'Comradehall'},
    '라운지':{en:'Lounge',es:'Sala',fr:'Salon',de:'Lounge',ja:'ラウンジ',zh:'休息室',pt:'Lounge',ru:'Лаунж',tr:'Dinlenme salonu',it:'Lounge',pl:'Strefa relaksu',ar:'الاستراحة',nw:'Joycamp'},
    '설정':{en:'Settings',es:'Ajustes',fr:'Réglages',de:'Einstellungen',ja:'設定',zh:'设置',pt:'Configurações',ru:'Настройки',tr:'Ayarlar',it:'Impostazioni',pl:'Ustawienia',ar:'الإعدادات',nw:'Rules'}};
  function names(side){
    var l=''; try{ if(window.FFLang&&FFLang.get) l=FFLang.get()||''; }catch(e){}
    if(!l) l=String(navigator.language||'ko').slice(0,2).toLowerCase();      /* nothing saved: the browser language, like the pages' own translators */
    if(!LB['위키'][l])return;
    var as=side.querySelectorAll('a');
    for(var i=0;i<as.length;i++){ var n=as[i].lastChild; if(!n||n.nodeType!==3)continue; var k=n.nodeValue.trim(), t=LB[k]&&LB[k][l]; if(t)n.nodeValue=t; }
  }
  function run(){
    var fresh=document.body&&document.body.hasAttribute('data-fftop');      /* the new-style pages keep their own online bar look */
    if(!fresh){ var st2=document.createElement('style'); st2.textContent=css2; document.head.appendChild(st2); }
    var rail=document.querySelector('nav.rail'); if(rail)names(rail);      /* prototypes page */
    if(document.body&&document.body.hasAttribute('data-fftop')){ topBar(null); return; }      /* pages built without the old left menu (games, educations, tools, prototypes) */
    var side=document.querySelector('aside[style*="flex:0 0 232px"]'); if(!side||side.__ffsm)return; side.__ffsm=1;
    topBar(side);
  }
  /* 2026-11-26: the left menu is replaced by a top bar (logo + text menu, search / online count / login at the right). The page's own #ffTop (search, online bar, account)
     is MOVED into the bar, so everything that already hooks into those elements keeps working. */
  var TOP=[['Hub','/'],['Games','/games/'],['Educations','/educations/'],['Tools','/tools/'],['Wiki','/wiki/'],['Community','/community/'],['Lounge','/lounge/'],['Prototypes','/prototypes/'],['Settings','/settings/']];
  var TCSS='.ffx-root>aside[style*="flex:0 0 232px"],nav.rail{display:none!important}'+
  '#ffnTop{display:flex;align-items:center;gap:20px;height:64px;padding:0 clamp(16px,3vw,40px);background:rgba(0,0,0,.92);border-bottom:1px solid rgba(255,213,74,.4);color:#fff;position:relative;z-index:60;box-sizing:border-box;width:100%;font-family:"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif}'+
  '#ffnTop *{box-sizing:border-box}'+
  '#ffnTop .fn-logo{flex:none;display:flex;align-items:center;gap:9px;font-family:Oswald,sans-serif;font-weight:600;font-size:19px;letter-spacing:.04em;color:#fff;text-decoration:none}#ffnTop .fn-logo img{width:30px;height:30px;border-radius:8px}#ffnTop .fn-logo b{color:#ffd54a;font-weight:600}'+
  '#ffnTop .fn-nw{position:relative;flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:4px}'+
  '#ffnTop .fn-nav{display:flex;gap:26px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;white-space:nowrap;cursor:grab;flex:1 1 auto;min-width:0;padding:0 2px}#ffnTop .fn-nav::-webkit-scrollbar{display:none}'+
  '#ffnTop .fn-nav a{flex:none;color:#a9a9a9;font-size:15px;font-weight:500;text-decoration:none;padding:7px 0;border-bottom:2px solid transparent;-webkit-user-drag:none;background:none}#ffnTop .fn-nav a:hover{color:#fff}#ffnTop .fn-nav a.on{color:#ffd54a;border-bottom-color:#ffd54a;font-weight:700}'+
  '#ffnTop .fn-ar{flex:none;width:26px;height:30px;border:0;background:none;color:#ffd54a;font-size:22px;line-height:1;cursor:pointer;padding:0;visibility:hidden}#ffnTop .fn-ar.show{visibility:visible}'+
  '#ffnTop .fn-rt{flex:none;display:flex;align-items:center;gap:10px;margin-left:auto}'+
  '#ffnTop #ffTop{display:flex!important;flex-wrap:nowrap!important;align-items:center;justify-content:flex-end;gap:10px!important;padding:0!important;height:auto!important;margin:0!important}'+
  '#onlineBar .on-p{display:inline-flex;align-items:baseline;gap:5px}#onlineBar .on-p small{margin-left:4px}'+
  '@media(max-width:1500px){#ffnTop #onlineBar .on-f{display:none!important}}'+
  '#ffnTop #ffTop .tb{flex:none;display:flex;align-items:center;width:auto!important;min-width:0}#ffnTop #ffTop .srx-btn{background:rgba(14,14,14,.6);border:1px solid #262626;color:#fff;border-radius:10px;cursor:pointer;padding:0}'+
  '#ffnTop #onlineBar .on-c{display:none!important}#ffnTop #ffTop .srx-btn{width:40px;height:40px}#ffnTop #ffTop .tb{margin:0}'+
  '#ffnTop [data-ff-account] .ffa-btn{width:auto;min-width:84px;height:40px;padding:0 18px;border-radius:99px;background:#ffd54a;color:#1c1405;font-size:14px;font-weight:700;gap:0}#ffnTop [data-ff-account] .ffa-btn .ffa-ic{display:none}'+
  '@media(max-width:760px){#ffnTop{gap:10px}#ffnTop #onlineBar{display:none!important}#ffnTop .fn-nav{gap:18px}}'+
  '@media(max-width:520px){#ffnTop .fn-logo span{display:none}}';
  function topBar(side){
    if(document.getElementById('ffnTop'))return;
    var st=document.createElement('style'); st.id='ffnCss'; st.textContent=TCSS; document.head.appendChild(st);
    var SUBH={games:'/games/',tools:'/tools/',educations:'/educations/',edu:'/educations/',prototypes:'/prototypes/',proto:'/prototypes/',wiki:'/wiki/',lounge:'/lounge/',community:'/community/',comm:'/community/',setting:'/settings/',settings:'/settings/'}, SUBTO={'/games/':'games','/tools/':'tools','/educations/':'educations','/prototypes/':'prototypes','/wiki/':'wiki','/lounge/':'lounge','/community/':'community','/settings/':'settings'};
    var hm=/^([a-z]+)\.frenchfries777\.com$/.exec(location.hostname||''), subWant=hm&&SUBH[hm[1]]||null;
    var want=subWant||(function(){ var p=(location.pathname||'/').replace(/^\/hub(?=\/)/,''); var m=/^\/(games|educations|tools|prototypes|lounge|community|wiki|settings)(\/|$)/.exec(p); if(m) return '/'+m[1]+'/'; if(/^\/(music|gallery)(\/|$)/.test(p)) return '/lounge/'; if(/^\/(patchnotes)?\/?$/.test(p)) return '/'; return null; })();
    var h=document.createElement('div'); h.id='ffnTop'; h.setAttribute('role','banner');      /* a div, not <header>: the new-style pages style every <header> of their own */
    var links=TOP.map(function(i){ var href=i[1]; if(subWant){ if(href==='/') href='https://frenchfries777.com/'; else if(SUBTO[href]) href='https://'+SUBTO[href]+'.frenchfries777.com/'; }
      return '<a href="'+href+'"'+(i[1]===want?' class="on"':'')+'>'+i[0]+'</a>'; }).join('');
    h.innerHTML='<a class="fn-logo" href="'+(subWant?'https://frenchfries777.com/':'/')+'"><img src="https://frenchfries777.com/logo.svg" alt=""><span>FRENCHFRIES<b>777</b></span></a>'+
      '<div class="fn-nw"><button type="button" class="fn-ar l" aria-label="‹">‹</button><nav class="fn-nav">'+links+'</nav><button type="button" class="fn-ar r" aria-label="›">›</button></div><div class="fn-rt"></div>';
    var rt=h.querySelector('.fn-rt'), top=document.getElementById('ffTop');
    if(!top){ /* pages without their own #ffTop (wiki): search button + the page's login button */
      top=document.createElement('div'); top.id='ffTop';
      var sb=document.createElement('button'); sb.type='button'; sb.className='srx-btn'; sb.id='srxBtn'; sb.setAttribute('aria-label','검색'); sb.title='검색'; sb.textContent='🔍';
      sb.style.cssText='flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(14,14,14,.6);border:1px solid #262626;color:#fff;font-size:16px;cursor:pointer;padding:0';
      top.appendChild(sb);
      sb.addEventListener('click',function f(e){ if(sb.onclick) return; sb.removeEventListener('click',f); e.stopImmediatePropagation(); e.preventDefault(); var sc=document.createElement('script'); sc.src='https://frenchfries777.com/games/hub.js?v=20261126a'; sc.onload=function(){ setTimeout(function(){ if(sb.onclick) sb.click(); },500); }; document.head.appendChild(sc); },true);
      var ac=document.querySelector('[data-ff-account]'); if(ac){ var tb=document.createElement('div'); tb.className='tb'; tb.appendChild(ac); top.appendChild(tb); }
    }
    rt.appendChild(top);
    var root=side&&side.parentNode; if(root) root.parentNode.insertBefore(h,root); else document.body.insertBefore(h,document.body.firstChild);
    var nav=h.querySelector('.fn-nav'), L=h.querySelector('.fn-ar.l'), R=h.querySelector('.fn-ar.r');
    function upd(){ var o=nav.scrollWidth>nav.clientWidth+1; L.classList.toggle('show',o&&nav.scrollLeft>2); R.classList.toggle('show',o&&nav.scrollLeft<nav.scrollWidth-nav.clientWidth-2); }
    L.onclick=function(){ nav.scrollBy({left:-160,behavior:'smooth'}); }; R.onclick=function(){ nav.scrollBy({left:160,behavior:'smooth'}); };
    nav.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd);
    var d=null, moved=false; nav.addEventListener('pointerdown',function(e){ d={x:e.clientX,s:nav.scrollLeft}; moved=false; }); window.addEventListener('pointermove',function(e){ if(d){ if(Math.abs(e.clientX-d.x)>4) moved=true; nav.scrollLeft=d.s-(e.clientX-d.x); } }); window.addEventListener('pointerup',function(){ d=null; });
    nav.addEventListener('click',function(e){ if(moved){ e.preventDefault(); moved=false; } },true);
    var act=nav.querySelector('a.on'); function center(){ if(act) nav.scrollLeft=Math.max(0,act.offsetLeft-nav.clientWidth/2+act.offsetWidth/2); upd(); } center(); setTimeout(center,120); window.addEventListener('load',center);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();

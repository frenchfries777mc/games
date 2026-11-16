/* Hub buttons for the game sites: the same top buttons the Games front page has (Hub | Games | Educations | Tools switch, search,
   wiki / community / lounge / settings, coin + account box), fixed at the very top of the page (same place on every page); the page's own login box moves into it.
   Add to a game site page:  <script src="https://frenchfries777.com/games/ff-hubbar.js?v=1" defer></script>
   The page needs the usual <span data-ff-account></span> in its top bar (the box is built around it). Styles: ff-hubbar.css. */
(function(){
'use strict';
var B='https://frenchfries777.com/';
var LB={ko:['위키','커뮤니티','라운지','설정','검색'],en:['Wiki','Community','Lounge','Settings','Search'],ja:['Wiki','コミュニティ','ラウンジ','設定','検索'],
  es:['Wiki','Comunidad','Salón','Ajustes','Buscar'],fr:['Wiki','Communauté','Salon','Réglages','Recherche'],de:['Wiki','Community','Lounge','Einstellungen','Suche']};
function lang(){ try{ var l=(window.FFLang&&FFLang.get&&FFLang.get())||document.documentElement.lang||'ko'; return String(l).slice(0,2).toLowerCase(); }catch(e){ return 'ko'; } }
function ffScrollHint(sc,sel){
  function hz(){ return sc.scrollWidth>sc.clientWidth+4&&getComputedStyle(sc).overflowX!=='visible'; }
  function fade(){ var m=''; if(hz()){ var r=sc.scrollLeft+sc.clientWidth<sc.scrollWidth-4;
      m='linear-gradient(90deg,'+'#000 0,#000 28px'+','+(r?'#000 calc(100% - 28px),transparent 100%':'#000 calc(100% - 28px),#000 100%')+')'; }
    sc.style.webkitMaskImage=m; sc.style.maskImage=m; }
  function center(){ var on=sc.querySelector(sel); if(on&&hz()) sc.scrollLeft+=on.getBoundingClientRect().left-sc.getBoundingClientRect().left-(sc.clientWidth-on.offsetWidth)/2; fade(); }
  sc.addEventListener('scroll',fade,{passive:true}); addEventListener('resize',fade); center(); addEventListener('load',center);
}
function build(){
  if(document.querySelector('.ffhb-strip')) return;
  var acc=document.querySelector('[data-ff-account]'); if(!acc||!acc.parentNode) return;
  if(!document.getElementById('ffhbCss')){ var l=document.createElement('link'); l.id='ffhbCss'; l.rel='stylesheet'; l.href=B+'games/ff-hubbar.css?v=8'; document.head.appendChild(l); }
  var t=LB[lang()]||LB.en;
  var bar=document.createElement('div'); bar.className='ffhb-strip'; bar.setAttribute('data-notr','');
  bar.innerHTML='<div class="ffhb-in"><a class="ffhb-logo" href="'+B+'games/"><i>🍟</i><span>FRENCHFRIES<b>777</b></span></a>'+
    '<span class="swr"><span class="sw" data-notr><a href="'+B+'">Hub</a><a class="on" href="'+B+'games/" aria-current="page">Games</a><a href="'+B+'educations/">Educations</a><a href="'+B+'tools/">Tools</a></span>'+
    '<button type="button" class="srx-btn" id="srxBtn" aria-label="'+t[4]+'" title="'+t[4]+'">🔍</button></span><span class="ffhb-sp"></span>'+
    '<nav class="ffhb-nav"><a href="'+B+'wiki/">'+t[0]+'</a><a href="'+B+'community/">'+t[1]+'</a><a href="'+B+'lounge/">'+t[2]+'</a><a href="'+B+'settings/">'+t[3]+'</a></nav>'+
    '<div id="onlineBar" data-notr></div><span class="tb"></span></div>';
  /* left menu (the same menu as the hub); on narrow screens the same links scroll inside the top bar */
  var IC={hub:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',games:'<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5M16 11.5h.01M18.5 13.5h.01"/>',edu:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',tools:'<path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-3 3-2.5-2.5z"/>',wiki:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',com:'<path d="M4 5h16v11H9l-5 4z"/>',lounge:'<path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 12a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 4 0v4H1v-4a2 2 0 0 1 2-2zM5 20v1.5M19 20v1.5"/>',proto:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7.5 15h9"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>'};
  var ML=[['Hub',B,0,'hub'],['Games',B+'games/',1,'games'],['Educations',B+'educations/',0,'edu'],['Tools',B+'tools/',0,'tools'],[t[0],B+'wiki/',0,'wiki'],[t[1],B+'community/',0,'com'],[t[2],B+'lounge/',0,'lounge'],['Prototypes',B+'prototypes/',0,'proto'],[t[3],B+'settings/',0,'set']];
  var mh=ML.map(function(m){ return '<a class="ffhb-m'+(m[2]?' on':'')+'" href="'+m[1]+'"'+(m[2]?' aria-current="page"':'')+'><i><svg viewBox="0 0 24 24">'+IC[m[3]]+'</svg></i>'+m[0]+'</a>'; }).join('');
  var side=document.createElement('aside'); side.className='ffhb-side'; side.setAttribute('data-notr','');
  side.innerHTML='<a class="ffhb-slogo" href="'+B+'"><span>FRENCH</span><span>FRIES</span><span>777</span></a>'+mh;
  document.body.insertBefore(side,document.body.firstChild);
  var mm=document.createElement('nav'); mm.className='ffhb-mmenu'; mm.innerHTML=mh; bar.querySelector('.ffhb-in').insertBefore(mm,bar.querySelector('.ffhb-sp'));
  document.body.insertBefore(bar,document.body.firstChild); document.documentElement.classList.add('ffhb-on');
  bar.querySelector('.tb').appendChild(acc);
  ffScrollHint(mm,'.ffhb-m.on');
  /* the hub script drives the online chip and the search box */
  if(!window.__ffHubJs&&!document.querySelector('script[src*="/hub.js"]')){ window.__ffHubJs=1; var s=document.createElement('script'); s.src=B+'games/hub.js?v=20261116a'; document.body.appendChild(s); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();

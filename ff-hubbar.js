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
function build(){
  if(document.querySelector('.ffhb-strip')) return;
  var acc=document.querySelector('[data-ff-account]'); if(!acc||!acc.parentNode) return;
  if(!document.getElementById('ffhbCss')){ var l=document.createElement('link'); l.id='ffhbCss'; l.rel='stylesheet'; l.href=B+'games/ff-hubbar.css?v=2'; document.head.appendChild(l); }
  var t=LB[lang()]||LB.en;
  var bar=document.createElement('div'); bar.className='ffhb-strip'; bar.setAttribute('data-notr','');
  bar.innerHTML='<div class="ffhb-in"><a class="ffhb-logo" href="'+B+'games/"><i>🍟</i><span>FRENCHFRIES<b>777</b></span></a>'+
    '<span class="swr"><span class="sw" data-notr><a href="'+B+'">Hub</a><a class="on" href="'+B+'games/" aria-current="page">Games</a><a href="'+B+'educations/">Educations</a><a href="'+B+'tools/">Tools</a></span>'+
    '<button type="button" class="srx-btn" id="srxBtn" aria-label="'+t[4]+'" title="'+t[4]+'">🔍</button></span><span class="ffhb-sp"></span>'+
    '<nav class="ffhb-nav"><a href="'+B+'wiki/">'+t[0]+'</a><a href="'+B+'community/">'+t[1]+'</a><a href="'+B+'lounge/">'+t[2]+'</a><a href="'+B+'settings/">'+t[3]+'</a></nav>'+
    '<span class="tb"><span class="cchip"><button type="button" class="cc-b" id="coinChip" title="Hub Coin" aria-haspopup="true"><img class="hci" src="'+B+'games/hubicons/coin.svg?v=20261103a" alt="" width="20" height="20" draggable="false"><b id="coinChipN" data-notr>0</b></button>'+
    '<div class="cc-dd" id="coinDd" hidden><div class="coinbar" id="coinBar"></div></div></span></span></div>';
  document.body.insertBefore(bar,document.body.firstChild); document.documentElement.classList.add('ffhb-on');
  bar.querySelector('.tb').appendChild(acc);
  /* the hub script drives the coin chip and the search box */
  if(!window.__ffHubJs&&!document.querySelector('script[src*="/hub.js"]')){ window.__ffHubJs=1; var s=document.createElement('script'); s.src=B+'games/hub.js?v=20261104c'; document.body.appendChild(s); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();

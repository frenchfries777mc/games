/* Frenchfries777 공용 언어 설정 (허브 · 게임 사이트 · 게임)
   허브와 게임들은 모두 frenchfries777mc.github.io 아래라 브라우저 저장소를 같이 쓰지만, 언어를 저장하는 이름이 게임마다 달라요.
   이 스크립트는 그 이름들을 한 묶음으로 맞춰요: 어느 한 곳에서 언어를 바꾸면, 이 스크립트가 있는 페이지가 열릴 때 나머지도 같은 언어가 돼요.
   쓰는 법: 언어를 읽는 다른 스크립트보다 먼저, <head> 안에
     <script src="https://frenchfries777mc.github.io/games/ff-lang.js"></script>
   스크립트로: FFLang.get(), FFLang.set('en'), FFTheme.get(), FFTheme.set('light','l') */
(function(){
'use strict';
if(window.FFLang) return;
var SNAP='ffLangSnap';
var KEYS=[
  {k:'arenaClashLang'},                         // Stickseum 게임 · Stickseum 사이트 · 허브
  {k:'ce_lang'},                                // Crown Envoy 사이트
  {k:'cq_lang'},                                // Crown Envoy 게임
  {k:'beaconfallSiteLang'},                     // Beaconfall 사이트
  {k:'stranded.lobby.v1', json:'lang'}          // Beaconfall 게임 (설정 묶음 안의 lang)
];
function ok(l){ return typeof l==='string' && /^[a-z]{2}$/.test(l); }
function read(e){ try{ var v=localStorage.getItem(e.k); if(v==null) return null; if(e.json){ var o=JSON.parse(v); return o&&ok(o[e.json])?o[e.json]:null; } return ok(v)?v:null; }catch(x){ return null; } }
function write(e, l){ try{ if(e.json){ var o={}; try{ o=JSON.parse(localStorage.getItem(e.k)||'{}')||{}; }catch(x){ o={}; } if(typeof o!=='object'||Array.isArray(o)) o={}; if(o[e.json]===l) return; o[e.json]=l; localStorage.setItem(e.k, JSON.stringify(o)); }
  else if(localStorage.getItem(e.k)!==l) localStorage.setItem(e.k, l); }catch(x){} }
function snapshot(l){ var s={lang:l}; KEYS.forEach(function(e){ s[e.k]=read(e); }); try{ localStorage.setItem(SNAP, JSON.stringify(s)); }catch(x){} }
/* Aurebesh (au) and Standard Galactic (sg) are not languages of their own: they are English drawn in other letters. Picking one stores English everywhere plus a flag. */
var AU='ff.script', SCR={au:'FF Aurebesh',sg:'FF Galactic',em:'Emoji'};      // em = 이모지어: English turned into emoji by ff-emoji.js
function scr(){ try{ var v=localStorage.getItem(AU); return SCR[v]?v:''; }catch(x){ return ''; } }
function auOn(){ return !!scr(); }
function put(l){ if(!ok(l)) return; KEYS.forEach(function(e){ write(e,l); }); snapshot(l); }
function set(l){ if(SCR[l]){ try{ localStorage.setItem(AU,l); }catch(x){} l='en'; } else if(ok(l)){ try{ localStorage.removeItem(AU); }catch(x){} }      // a person's own choice in a picker
  put(l); }
function sync(){
  var snap=null; try{ snap=JSON.parse(localStorage.getItem(SNAP)||'null'); }catch(x){}
  var cur=KEYS.map(function(e){ return read(e); }), lang=null;
  if(snap&&ok(snap.lang)){
    for(var i=0;i<KEYS.length;i++) if(cur[i] && cur[i]!==snap[KEYS[i].k]){ lang=cur[i]; break; }     // a page changed its language since the last sync: that one wins
    if(!lang) lang=snap.lang;
  } else { for(var j=0;j<cur.length;j++) if(cur[j]){ lang=cur[j]; break; } }                        // first time: the first language found (Stickseum/hub first)
  if(SCR[lang]){ try{ localStorage.setItem(AU,lang); }catch(x){} lang='en'; }      // a picker that stored au/sg before calling FFLang.set
  if(lang) put(lang);
  return lang;
}
var now=sync(); if(SCR[now]) now='en';
if(now&&now!=='en'&&auOn()){ try{ localStorage.removeItem(AU); }catch(x){} }      // a game picked another language: Aurebesh/Galactic is off
/* 게임 화면이면 친구에게 "지금 하는 게임"을 알리는 ff-presence.js 도 불러요 */
try{ var me=document.currentScript, base=(me&&me.src)?me.src.replace(/[^\/]*$/,''):'https://frenchfries777mc.github.io/games/';
  if(!window.FFPresence && /\.html$/i.test(location.pathname) && /\/(stickseum|crownenvoy|beaconfall)\/[^\/]*\.html$/i.test(location.pathname)){ var ps=document.createElement('script'); ps.src=base+'ff-presence.js'; ps.async=true; (document.head||document.documentElement).appendChild(ps); } }catch(e){}
/* 테마(다크 · 라이트)와 글자 크기: 허브나 게임 사이트의 ⚙️ 에서 고르면 모두 같이 바뀌어요.
   <html> 에 data-ff-theme="dark|light" 와 data-ff-size="s|m|l|xl" 를 붙이고, 허브와 게임 사이트(게임 화면은 빼고)는 크기만큼 확대해요.
   라이트 색은 각 페이지 CSS 가 html[data-ff-theme=light] 로 정해요. */
var TK='ff.theme', SK='ff.size', THEMES=['dark','light','yellow','red','blue'], ZOOM={s:0.9,m:1,l:1.12,xl:1.25};
/* game site pages that get a light look here (their own CSS only has the dark one): 'site' or 'site/page' */
function sitePage(){ var m=/\/(stickseum|crownenvoy|beaconfall)\/(?:(index|codex|ranking|balance)\.html)?$/i.exec(location.pathname||''); return m?m[1].toLowerCase()+'/'+(m[2]||'index').toLowerCase():''; }
function isSite(){ var p=location.pathname||''; return !/\.html$/i.test(p) || /\/index\.html$/i.test(p) || !!sitePage(); }
var L='html[data-ff-theme=light]', LIGHT={
  stickseum: L+'{--bg:#f4f5f9;--bg2:#eceff5;--panel:#fff;--panel-2:#f0f2f7;--line:#d8dde7;--text:#151922;--text-dim:#5b6476;--red:#e23446;--teal:#0e9f88;--gold:#a87b00;color-scheme:light}'+
    L+' .wordmark,'+L+' .hero h1{color:#fff}'+L+' .btn.play,'+L+' .chip.on{color:#fff}'+L+' .tag,'+L+' .ab .k{color:#fff}'+L+' .bar .mid{background:rgba(0,0,0,.25)}',
  crownenvoy: L+'{--ink:#f6f1e4;--panel:#fffaf0;--panel2:#efe6d0;--line:#d8c9a4;--text:#2a2216;--muted:#6b604c;--gold:#a37b1c;--gold2:#8a6514;--blue:#2350b8;color-scheme:light}'+
    L+' .hero,'+L+' .top .mark{color:#ece5d2}'+L+' .top .mark b{color:#d4af4f}'+L+' .btn{color:#ece5d2}'+L+' .btn.dl:hover{background:#14264a}'+L+' .hero .meta b{color:#f2dc94}'+
    L+' .mapbox{color:#ece5d2}'+L+' .mapbox .tpl b{color:#d4af4f}'+L+' .tag{color:#fff}'+L+' .err{color:#b4412f}',
  beaconfall: L+'{--ink:#efe9d6;--cream:#2a2414;--gold:#80611a;--sky:#16719e;--btn:rgba(255,251,238,.92);--panel:rgba(255,251,238,.93);color-scheme:light}'+
    L+' #bgshade{background:linear-gradient(180deg,rgba(250,246,232,.4),rgba(250,246,232,.74) 50%,rgba(250,246,232,.9))}'+
    L+' .pb{box-shadow:4px 4px 0 rgba(60,45,10,.28)}'+L+' .top .pb{box-shadow:3px 3px 0 rgba(60,45,10,.28)}'+L+' .pb:hover,'+L+' .pb.on,'+L+' .pb.big:hover,'+L+' .tabs .pb.on{color:#fff}'+
    L+' h1,'+L+' h2,'+L+' .hero p,'+L+' .hero .meta,'+L+' .note,'+L+' .ft,'+L+' .vtxt,'+L+' .nl ul,'+L+' details p,'+L+' ol.st,'+L+' footer,'+L+' .sub,'+L+' .cnt,'+L+' .grp{text-shadow:2px 2px 0 rgba(255,255,255,.7)}'+
    L+' .hero h1{text-shadow:4px 4px 0 rgba(255,255,255,.75),0 0 30px rgba(255,255,255,.6)}'+L+' #shot{box-shadow:5px 5px 0 rgba(60,45,10,.28)}'+L+' .err{color:#b4412f}',
  'beaconfall/codex': L+' body{background:linear-gradient(180deg,rgba(250,246,232,.78),rgba(250,246,232,.94)),url(shot-camp.png) center/cover fixed}'+
    L+' input.q,'+L+' .cats .pb{box-shadow:2px 2px 0 rgba(60,45,10,.28)}'+L+' .card{border-color:rgba(128,97,26,.4)}'+L+' .rc{border-color:rgba(128,97,26,.3)}'+L+' .sl{background:rgba(128,97,26,.12)}'+
    L+' .rn{color:#5a5040}'+L+' .wh.bk{border-color:#c0407a;color:#c0407a}'+L+' #det .box{background:#fffbee;box-shadow:6px 6px 0 rgba(60,45,10,.3)}'+L+' .dh img{background:rgba(128,97,26,.1)}'+L+' .src{background:rgba(0,0,0,.05)}'
};
/* background-colour themes on the game site pages (yellow rides on the light rules above, red and blue on the dark ones); same palettes as the hub */
var A='html[data-ff-accent=', ACC={
  stickseum: A+'yellow]{--bg:#efe2ad;--bg2:#e6d79b;--panel:#faf3d2;--panel-2:#f3e8b8;--line:#d6c780;--text:#2b2410;--text-dim:#6b6240}'+
    A+'red]{--bg:#3f1a20;--bg2:#36161b;--panel:#2f1317;--panel-2:#3a181e;--line:#6a2f38;--text:#f8ecec;--text-dim:#c9a3a8}'+
    A+'blue]{--bg:#2d4b78;--bg2:#27426b;--panel:#243f67;--panel-2:#2b4a78;--line:#4b6b9d;--text:#eef3fb;--text-dim:#b8c7de}'+
    A+'red] .heroBg::after{background:linear-gradient(90deg,rgba(63,26,32,.82),rgba(63,26,32,.56) 55%,rgba(63,26,32,.34))}'+
    A+'blue] .heroBg::after{background:linear-gradient(90deg,rgba(45,75,120,.82),rgba(45,75,120,.56) 55%,rgba(45,75,120,.34))}',
  crownenvoy: A+'yellow]{--ink:#efe2ad;--panel:#faf3d2;--panel2:#f1e4b0;--line:#d6c780;--text:#2b2410;--muted:#6b6240}'+
    A+'red]{--ink:#3f1a20;--panel:#2f1317;--panel2:#3a181e;--line:#6a2f38;--text:#f8ecec;--muted:#c9a3a8}'+
    A+'blue]{--ink:#2d4b78;--panel:#243f67;--panel2:#2b4a78;--line:#4b6b9d;--text:#eef3fb;--muted:#b8c7de}'+
    A+'red] .hero{background-color:#3f1a20}'+A+'red] .hero::after{background:linear-gradient(180deg,#3f1a2099 0%,#3f1a2033 35%,#3f1a20ee 88%,#3f1a20 100%)}'+
    A+'blue] .hero{background-color:#2d4b78}'+A+'blue] .hero::after{background:linear-gradient(180deg,#2d4b7899 0%,#2d4b7833 35%,#2d4b78ee 88%,#2d4b78 100%)}',
  beaconfall: A+'yellow]{--ink:#efe2ad;--panel:rgba(250,243,210,.93);--btn:rgba(250,243,210,.92)}'+A+'yellow] #bgshade{background:linear-gradient(180deg,rgba(239,226,173,.4),rgba(239,226,173,.74) 50%,rgba(239,226,173,.9))}'+
    A+'red]{--ink:#3f1a20;--panel:rgba(47,19,23,.9);--btn:rgba(47,19,23,.82)}'+A+'red] #bgshade{background:linear-gradient(180deg,rgba(63,26,32,.45),rgba(63,26,32,.78) 50%,rgba(63,26,32,.92))}'+
    A+'blue]{--ink:#2d4b78;--panel:rgba(36,63,103,.9);--btn:rgba(36,63,103,.82)}'+A+'blue] #bgshade{background:linear-gradient(180deg,rgba(45,75,120,.45),rgba(45,75,120,.78) 50%,rgba(45,75,120,.92))}'
};
/* top bar: the same places on every site. The language, hub, bell and account buttons stay in ONE row at the right edge whatever the width, login state, nickname or language is;
   menu links that do not fit are hidden (or scroll in their own row), never pushed the buttons to a second line. Written as 'html body ...' so a page's own rules lose ties. */
function siteName(){ var m=/\/(stickseum|crownenvoy|beaconfall|isleport|educations|tools)\//i.exec(location.pathname||''); return m?m[1].toLowerCase():'hub'; }
var B='html body ', BAR={
  all: B+'[data-ff-account]{flex:none}',
  stickseum: B+'.topbar{flex-wrap:nowrap;align-items:flex-start}'+B+'.topbar .right{flex:none;margin-left:auto}'+B+'.topbar .wordmark{min-width:0;white-space:nowrap}'+
    '@media(max-width:620px){'+B+'.topbar{align-items:center}'+B+'.topbar .wordmark{font-size:20px}'+B+'.topbar .right{flex-wrap:nowrap}}',
  crownenvoy: B+'.top .wrap{flex-wrap:nowrap}'+B+'.top .mark{white-space:nowrap}'+B+'.top nav{display:flex;align-items:center;flex:none;white-space:nowrap}'+
    '@media(max-width:1000px){'+B+'.top nav a{display:none}}'+
    '@media(max-width:620px){'+B+'.top .mark{font-size:18px}'+B+'.lang{max-width:84px;margin-inline-start:0}'+B+'.top nav [data-ff-account]{margin-left:8px!important}'+B+'.ffa-wrap{margin-left:0}}',
  beaconfall: B+'.top .wrap{flex-wrap:nowrap;align-items:center}'+B+'.top .nav{flex:1 1 auto;min-width:0;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}'+B+'.top .nav::-webkit-scrollbar{display:none}'+B+'.top .nav .pb{flex:none;white-space:nowrap}'+
    B+'.top .lg{flex:none;flex-wrap:nowrap}'+B+'.top .lg .pb{white-space:nowrap}'+
    '@media(max-width:620px){'+B+'.top .wrap{flex-wrap:wrap;row-gap:8px}'+B+'.top .nav{order:3;flex:1 0 100%}'+B+'.top .lg{flex:1 1 0;min-width:0;overflow-x:auto;scrollbar-width:none}'+B+'.top .lg::-webkit-scrollbar{display:none}'+B+'.top .lg .pb{flex:none}}',
  isleport: B+'.top .wrap{flex-wrap:nowrap;align-items:center}'+B+'.top .logo{flex:none}'+B+'.top .nav{flex:1 1 auto;min-width:0;display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}'+B+'.top .nav::-webkit-scrollbar{display:none}'+B+'.top .nav a{flex:none;white-space:nowrap}'+
    B+'.top .lang{flex:none}'+
    '@media(max-width:620px){'+B+'.top .wrap{flex-wrap:wrap;row-gap:0}'+B+'.top .logo{margin-right:auto}'+B+'.top .nav{order:3;flex:1 0 100%}}',
  hub: B+'header .right nav a{margin-left:14px;font-size:15px;font-weight:400;color:var(--dim)}'+B+'header .right nav a:hover{color:var(--text)}'+'@media(max-width:1100px){'+B+'header .right nav a{margin-left:9px;font-size:14px}}@media(max-width:1000px) and (min-width:521px){'+B+'header .right nav{display:none}}'+B+'header{flex-wrap:nowrap}'+B+'header .right{flex:none}'+B+'header .right nav{white-space:nowrap}'+
    '@media(max-width:960px){'+B+'header nav{display:none}}'+
    '@media(max-width:700px){'+B+'header{flex-wrap:wrap;row-gap:0}'+B+'.swr{order:3;flex:1 0 100%;margin:14px 0 0}}'
};
BAR.educations=BAR.tools=BAR.hub;
function barCss(){ if(document.getElementById('ff-bar')) return; var n=siteName(); try{ document.documentElement.setAttribute('data-ff-site',n); }catch(e){}
  var css=(BAR.all||'')+(BAR[n]||''); var st=document.createElement('style'); st.id='ff-bar'; st.textContent=css; (document.head||document.documentElement).appendChild(st); }
function lightCss(){ var k=sitePage(); if(!k||document.getElementById('ff-light')) return; var css=(LIGHT[k.split('/')[0]]||'')+(LIGHT[k]||'')+(ACC[k.split('/')[0]]||''); if(!css) return;
  var st=document.createElement('style'); st.id='ff-light'; st.textContent=css; (document.head||document.documentElement).appendChild(st); }      // a page's own html[data-ff-theme=light] rules can still override these
function tget(){ var t='dark', z='m'; try{ var tv=localStorage.getItem(TK); if(THEMES.indexOf(tv)>=0) t=tv; var v=localStorage.getItem(SK); if(ZOOM[v]) z=v; }catch(e){} return {theme:t, size:z}; }
function tapply(){ var st=tget(), h=document.documentElement; h.setAttribute('data-ff-theme',(st.theme==='light'||st.theme==='yellow')?'light':'dark'); if(st.theme==='yellow'||st.theme==='red'||st.theme==='blue') h.setAttribute('data-ff-accent',st.theme); else h.removeAttribute('data-ff-accent'); h.setAttribute('data-ff-size',st.size); if(isSite()) h.style.zoom=ZOOM[st.size]===1?'':String(ZOOM[st.size]); }
tapply(); try{ lightCss(); }catch(e){} try{ barCss(); }catch(e){}
window.addEventListener('storage',function(e){ if(e.key===TK||e.key===SK){ tapply(); try{ window.dispatchEvent(new Event('fftheme')); }catch(x){} } });
window.FFTheme={ get:tget, sizes:Object.keys(ZOOM), set:function(t,z){ try{ if(THEMES.indexOf(t)>=0) localStorage.setItem(TK,t); if(ZOOM[z]) localStorage.setItem(SK,z); }catch(e){} tapply(); try{ window.dispatchEvent(new Event('fftheme')); }catch(e){} } };
/* 최적화 설정: 모든 사이트와 게임이 같은 값을 읽어요. 키 ff_perf = {low:bool, fx:'high'|'mid'|'low', fps:0|30|60}.
   FFPerf.get() 값 읽기, FFPerf.set({...}) 저장, 바뀌면 window 'ffperf' 이벤트. <html>에 class ff-low, data-ffx, data-ffps가 붙어요. */
(function(){ var K='ff_perf', FX=['high','mid','low'];
  function get(){ var o={}; try{ o=JSON.parse(localStorage.getItem(K)||'{}')||{}; }catch(e){}
    var low=o.low===true; var fx=FX.indexOf(o.fx)>=0?o.fx:(low?'low':'high'); var fps=(o.fps===30||o.fps===60)?o.fps:(low?30:0);
    return {low:low,fx:fx,fps:fps}; }
  function apply(){ var p=get(), h=document.documentElement; h.classList.toggle('ff-low',p.low); h.setAttribute('data-ffx',p.fx); h.setAttribute('data-ffps',String(p.fps)); }
  function set(v){ var p=get(); for(var k in v) p[k]=v[k]; try{ localStorage.setItem(K,JSON.stringify(p)); }catch(e){} apply(); try{ window.dispatchEvent(new Event('ffperf')); }catch(e){} }
  window.FFPerf={get:get,set:set,key:K}; apply(); window.addEventListener('storage',function(e){ if(e.key===K){ apply(); try{ window.dispatchEvent(new Event('ffperf')); }catch(_){} } });
})();
/* Newspeak (nw): the joke language from Orwell's 1984. A party slogan sits above the copyright line, the hub number strip gets "2 + 2 = 5",
   and the community page is closed by the telescreen. Everything else is plain translation. */
var SLOGANS=['WAR IS PEACE','FREEDOM IS SLAVERY','IGNORANCE IS STRENGTH'];
function slogan(){ return SLOGANS[Math.floor(Math.random()*SLOGANS.length)]; }
function ingsoc(){
  if(now!=='nw'||document.getElementById('ff-nw')) return;
  var st=document.createElement('style'); st.id='ff-nw';
  st.textContent='.ff-ingsoc{display:block;margin:0 0 8px;font-weight:800;letter-spacing:.14em;font-size:13px;color:#e0443e}'+
    '.ff-party{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 28px;margin:18px 0 0;padding:9px 12px;border-top:2px solid #b4231f;border-bottom:2px solid #b4231f;background:rgba(180,35,31,.12);font-family:Oswald,Impact,sans-serif;font-weight:700;font-size:15px;letter-spacing:.16em;color:#f2ede2}'+
    '.ff-party span:nth-child(2){color:#e0443e}'+
    '.ff-party-h{margin:14px 0 4px;font-family:Oswald,Impact,sans-serif;font-weight:700;font-size:clamp(20px,3.2vw,30px);line-height:1.18;letter-spacing:.08em;color:#f2ede2}.ff-party-h span{display:block}.ff-party-h span:nth-child(2){color:#e0443e}'+
    '.ff-tele{max-width:560px;margin:40px auto;padding:36px 22px;text-align:center;border:2px solid #b4231f;border-radius:16px;background:rgba(180,35,31,.08)}'+
    '.ff-tele .eye{font-size:56px;line-height:1}.ff-tele b{display:block;margin:14px 0 6px;font-size:22px;letter-spacing:.06em;color:#e0443e}.ff-tele small{display:block;opacity:.7;letter-spacing:.1em}'+
    '.ff-2p2{text-align:center;margin:-8px 0 18px;font-size:13px;letter-spacing:.2em;opacity:.65}';
  (document.head||document.documentElement).appendChild(st);
  var ALL=SLOGANS.join(' · ');
  var cps=document.querySelectorAll('.ff-copy');
  if(cps.length){ for(var i=0;i<cps.length;i++){ var d=document.createElement('span'); d.className='ff-ingsoc'; d.setAttribute('data-notr',''); d.textContent=ALL; cps[i].parentNode.insertBefore(d,cps[i]); } }
  else { var f=document.querySelector('footer'); if(f){ var e=document.createElement('div'); e.className='ff-ingsoc'; e.setAttribute('data-notr',''); e.textContent=ALL; f.insertBefore(e,f.firstChild); } }
  /* the three party slogans under the site bar on every page that has one, and stacked big in the hub hero */
  var hd=document.querySelector('.wrap>header, body>header');
  if(hd&&!document.querySelector('.ff-party')){ var b=document.createElement('div'); b.className='ff-party'; b.setAttribute('data-notr',''); b.innerHTML='<span>'+SLOGANS.join('</span><span>')+'</span>'; hd.parentNode.insertBefore(b,hd.nextSibling); }
  var ht=document.querySelector('.hero-t h1');
  if(ht&&!document.querySelector('.ff-party-h')){ var hp=document.createElement('div'); hp.className='ff-party-h'; hp.setAttribute('data-notr',''); hp.innerHTML='<span>'+SLOGANS.join('</span><span>')+'</span>'; ht.parentNode.insertBefore(hp,ht.nextSibling); }
  /* the site logo becomes a Big Brother poster (one shared /games/bigbrother.svg, so Educations and Tools show it too) */
  var lg=document.querySelectorAll('img[src*="logo.svg"],link[rel~="icon"][href*="logo.svg"]');
  for(var k=0;k<lg.length;k++){ var a=lg[k].tagName==='LINK'?'href':'src'; lg[k].setAttribute(a,'/games/bigbrother.svg'); if(a==='src'){ lg[k].alt='BIG BROTHER IS WATCHING YOU'; lg[k].style.borderRadius='10px'; } }
  var hs=document.getElementById('heroStats'); if(hs&&!document.querySelector('.ff-2p2')){ var t=document.createElement('p'); t.className='ff-2p2'; t.setAttribute('data-notr',''); t.textContent='2 + 2 = 5'; hs.parentNode.insertBefore(t,hs.nextSibling); }
  if(/\/games\/community\/(index\.html)?$/.test(location.pathname)){ var cm=document.getElementById('community');
    if(cm) cm.innerHTML='<div class="ff-tele" data-notr><div class="eye">👁️</div><b>THE TELESCREEN IS WATCHING YOU.</b><small>BIG BROTHER IS WATCHING YOU</small></div>'; }
}
/* Turkish: CSS uppercase turns i into İ under lang=tr, which breaks Latin brand names (FRENCHFRİES). ASCII-only uppercased text keeps the English rule. */
function trCaps(){ var a=document.body?document.body.querySelectorAll('*'):[]; for(var i=0;i<a.length;i++){ var e=a[i]; if(e.hasAttribute('lang')||!/i/.test(e.textContent)||/[^\x00-\x7f]/.test(e.textContent)) continue;
  try{ if(getComputedStyle(e).textTransform==='uppercase') e.setAttribute('lang','en'); }catch(x){} } }
if(now==='tr'){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ trCaps(); setTimeout(trCaps,1500); }); else trCaps(); }
/* Arabic: pages keep their left-to-right layout, but each line of text is ordered right to left (so punctuation and numbers land where an Arabic reader expects) */
if(now==='ar'){ try{ var h0=document.documentElement; h0.classList.add('ff-ar'); var sa=document.createElement('style'); sa.textContent='html.ff-ar body *:not(svg):not(canvas):not(input):not(textarea){unicode-bidi:plaintext}'; (document.head||h0).appendChild(sa); }catch(e){} }
if(now==='nw'){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ingsoc); else ingsoc(); }
/* Aurebesh and Standard Galactic: our own letter drawings (fonts/ff-aurebesh.woff2, fonts/ff-galactic.woff2) over every text on the page; language pickers stay readable */
/* The "Aurebesh" and "Standard Galactic" entries in every language picker are always written in their own letters, so the font faces are declared on every page */
function aurebesh(){ if(document.getElementById('ff-au')) return; var base='https://frenchfries777mc.github.io/games/'; try{ var me=document.currentScript; if(me&&me.src) base=me.src.replace(/[^\/]*$/,''); }catch(x){}
  var h=document.documentElement, on=scr(), FILE={au:'ff-aurebesh.woff2?v=2',sg:'ff-galactic.woff2?v=1'}, css=''; if(on) h.classList.add('ff-'+on); var st=document.createElement('style'); st.id='ff-au';
  for(var k in SCR) if(FILE[k]) css+="@font-face{font-family:'"+SCR[k]+"';src:url('"+base+"fonts/"+FILE[k]+"') format('woff2');font-display:"+(on===k?'block':'swap')+"}"+
    "[data-lg="+k+"],[data-l="+k+"],option[value="+k+"],[data-lang="+k+"]{font-family:'"+SCR[k]+"',system-ui,sans-serif!important}";
  if(on&&FILE[on]) css+="html.ff-"+on+" body,html.ff-"+on+" body *:not(select):not(option):not(optgroup):not([data-lg]):not([data-l]):not([data-lang]):not(.ff-au-keep){font-family:'"+SCR[on]+"',system-ui,sans-serif!important}";
  st.textContent=css; (document.head||h).appendChild(st); }
try{ aurebesh(); }catch(e){}
/* 이모지어: the page waits hidden (at most 2.5 s) until ff-emoji.js has turned its English into emoji */
function emoji(){ var h=document.documentElement, base='https://frenchfries777mc.github.io/games/'; try{ var me=document.currentScript; if(me&&me.src) base=me.src.replace(/[^\/]*$/,''); }catch(x){}
  var st=document.createElement('style'); st.textContent='html.ff-em:not(.ff-em-ready) body{visibility:hidden}'; (document.head||h).appendChild(st);
  setTimeout(function(){ h.classList.add('ff-em-ready'); },2500);
  var s=document.createElement('script'); s.src=base+'ff-emoji.js?v=1'; s.onerror=function(){ h.classList.add('ff-em-ready'); }; (document.head||h).appendChild(s); }
if(scr()==='em'){ try{ emoji(); }catch(e){} }
/* ===== 게임 목록 한 곳: 새 게임이 생기면 FF_REG에 한 줄만 넣으면 돼요. hub.js(글쓰기·필터·소식·소식 받기 등), 허브 패치노트 페이지, 위키 목록이 여기서 읽어요.
   notes = 패치노트 파일 주소(site 기준), 없으면 tpl = 게임 페이지 안의 <template id="patchnotes"> 에서 읽어요. ===== */
(function(){
var B='https://frenchfries777mc.github.io/games/';
var REG=[
 {id:'hub',name:'허브',cls:'g0',c:'--g0',site:B,notes:'patchnotes.json',hub:true},
 {id:'stickseum',name:'Stickseum',cls:'g1',c:'--g1',site:B+'stickseum/',notes:'patchnotes.json'},
 {id:'crownenvoy',name:'Crown Envoy',cls:'g2',c:'--g2',site:B+'crownenvoy/',notes:'patchnotes.json'},
 {id:'beaconfall',name:'Beaconfall',cls:'g3',c:'--g3',site:B+'beaconfall/',notes:'patchnotes.json'},
 {id:'isleport',name:'Isleport',cls:'g3',c:'--g3',site:B+'isleport/',notes:'patchnotes.json'},
 {id:'vowkeep',name:'Vowkeep',cls:'',c:'--g4',site:B+'vowkeep/',notes:'patchnotes.json'},
 {id:'dummyparty',name:'Dummy Party',cls:'',c:'--g0',site:B+'dummyparty/',tpl:'play/'}
];
function tplNotes(html){
  var d=new DOMParser().parseFromString(html,'text/html'), t=d.querySelector('template#patchnotes'); if(!t) return [];
  var root=t.content||t, out=[], cur=null;
  [].forEach.call(root.querySelectorAll('details > b, details > ul'),function(el){
    if(el.tagName==='B'){ var a=el.textContent.split(' · '); cur={date:a[0]||'',build:/^b\d+/.test(a[2]||'')?a[2]:'',title:a.slice(/^b\d+/.test(a[2]||'')?3:2).join(' · ')||a[1]||'',items:[]}; out.push(cur); }
    else if(cur){ [].forEach.call(el.children,function(li){ cur.items.push(li.textContent.trim()); }); }
  });
  return out;
}
function notes(e){
  var f=e.notes?fetch(e.site+e.notes,{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ return d&&d.notes||null; })
         :fetch(e.site+e.tpl,{cache:'no-cache'}).then(function(r){ return r.ok?r.text():null; }).then(function(t){ return t?tplNotes(t):null; });
  return f.catch(function(){ return null; });
}
window.FF_REG=REG; window.FF_REG_NOTES=notes;
/* 게임이 아닌 사이트: 접속 표시(ff_online)에서 인원 칸으로만 써요 */
window.FF_SITES=[{id:'educations',name:'Educations'},{id:'tools',name:'Tools'}];
})();
window.FFLang={ get:function(){ return now; }, script:function(){ return scr(); }, pick:function(){ return scr()||now; }, slogan:slogan, set:function(l){ set(l); now=SCR[l]?'en':l; }, sync:function(){ now=sync()||now; if(SCR[now]) now='en'; return now; } };
})();

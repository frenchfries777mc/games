/* Frenchfries777 공용 언어 설정 (허브 · 게임 사이트 · 게임)
   허브와 게임들은 모두 frenchfries777mc.github.io 아래라 브라우저 저장소를 같이 쓰지만, 언어를 저장하는 이름이 게임마다 달라요.
   이 스크립트는 그 이름들을 한 묶음으로 맞춰요: 어느 한 곳에서 언어를 바꾸면, 이 스크립트가 있는 페이지가 열릴 때 나머지도 같은 언어가 돼요.
   쓰는 법: 언어를 읽는 다른 스크립트보다 먼저, <head> 안에
     <script src="https://frenchfries777mc.github.io/games/ff-lang.js"></script>
   스크립트로: FFLang.get(), FFLang.set('en') */
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
function set(l){ if(!ok(l)) return; KEYS.forEach(function(e){ write(e,l); }); snapshot(l); }
function sync(){
  var snap=null; try{ snap=JSON.parse(localStorage.getItem(SNAP)||'null'); }catch(x){}
  var cur=KEYS.map(function(e){ return read(e); }), lang=null;
  if(snap&&ok(snap.lang)){
    for(var i=0;i<KEYS.length;i++) if(cur[i] && cur[i]!==snap[KEYS[i].k]){ lang=cur[i]; break; }     // a page changed its language since the last sync: that one wins
    if(!lang) lang=snap.lang;
  } else { for(var j=0;j<cur.length;j++) if(cur[j]){ lang=cur[j]; break; } }                        // first time: the first language found (Stickseum/hub first)
  if(lang) set(lang);
  return lang;
}
var now=sync();
window.FFLang={ get:function(){ return now; }, set:function(l){ set(l); now=l; }, sync:function(){ now=sync()||now; return now; } };
})();

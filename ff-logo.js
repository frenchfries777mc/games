/* Frenchfries777 허브 로고 이모지: 화면 글자 속 이모지를 비콘폴·허브 이모지 그림(hubicons/emoji/*.svg)으로 바꿔 보여 줘요.
   hub.js 가 불러요 (이모지어용 ff-emoji.js 와는 다른 파일이에요) (허브와 games 첫 화면). 사람이 쓴 글(게시글, 댓글, 채팅, 쪽지, 신고)과 반응 이모트는 그대로 둬요.
   그림이 없는 이모지는 원래 글자 그대로 보여요. 복사하면 원래 이모지로 붙어요(alt). */
(function(){
'use strict';
if(window.FFLogo) return;
if(/\/patchnotes\//.test(location.pathname)) return;      /* 패치노트와 공지는 원래 이모지 그대로 */
var BASE='https://frenchfries777mc.github.io/games/hubicons/emoji/';
var MAP={'🏠':'house','🏘':'houses','🎣':'fishing','🚀':'rocket','👻':'ghost','📕':'redbook','📷':'camera','⛵':'sailboat','🐣':'chick','🏹':'bow','🚚':'truck','🥇':'gold','🥈':'silver','🥉':'bronze','🐾':'paw','🙋':'raisehand','⚪':'whitedot','🕘':'clock','🍟':'fries','📮':'postbox','🔔':'bell','📝':'memo',
  '🏷':'tag','📋':'list','✏':'pencil','💬':'chat','🏆':'trophy','🪙':'coin','👥':'group','🔍':'search','🎉':'party','💡':'bulb','🗑':'trash','🎁':'gift','🎮':'gamepad','🚪':'door','📅':'calendar','📊':'graph','📢':'megaphone','✅':'okcheck','🔥':'fire','⭐':'star','👤':'person','⚖':'scale','📌':'pin','⏸':'pause','📖':'book','🗡':'dagger','💀':'skull','👁':'eye','👋':'wave','🎭':'mask','💎':'gem',
  '🪪':'idcard','⚙':'gear','👑':'crown','🛠':'tools','🟢':'greendot','🔴':'reddot','🌙':'moon','☀':'sun','🚫':'ban','🚩':'flag','🖼':'picture','🐞':'bug','🔁':'repeat','⬜':'sq_white','⚔':'swords','🛡':'shield','🏃':'runner','🎨':'palette','🔗':'link','🏅':'medal','🔒':'lock','⚡':'bolt'};
/* 반응 이모트(😂 😮 😢 ❤ 👏 👍)와 😀 는 일부러 넣지 않았어요 */
var keys=Object.keys(MAP), RX=new RegExp('('+keys.join('|')+')\\uFE0F?','g');
var SKIP='.ann,#annBar,#newsList,#hubNotes,script,style,textarea,input,select,option,noscript,title,svg,.rx,.cm-chat,.cm-txt,.cm-cms,[data-notr],[data-noemo],#ffaDM,#ffaRep';
var css=document.createElement('style');
css.textContent='img.ffe{width:1.2em;height:1.2em;vertical-align:-.25em;display:inline-block;margin:0 .06em;-webkit-user-drag:none;user-select:none}';
(document.head||document.documentElement).appendChild(css);
function skip(n){ var p=n.parentNode; return !p||!p.closest||!!p.closest(SKIP); }
function fix(n){
  var t=n.nodeValue; if(!t||!RX.test(t)){ RX.lastIndex=0; return; } RX.lastIndex=0;
  if(skip(n)) return;
  var f=document.createDocumentFragment(), last=0, m;
  while((m=RX.exec(t))){ if(m.index>last) f.appendChild(document.createTextNode(t.slice(last,m.index)));
    var i=document.createElement('img'); i.className='ffe'; i.alt=m[1]; i.src=BASE+MAP[m[1]]+'.svg'; i.draggable=false; i.decoding='async'; f.appendChild(i); last=m.index+m[0].length; }
  RX.lastIndex=0;
  if(last<t.length) f.appendChild(document.createTextNode(t.slice(last)));
  n.parentNode.replaceChild(f,n);
}
function walk(root){
  if(!root) return;
  if(root.nodeType===3){ fix(root); return; }
  if(root.nodeType!==1||(root.closest&&root.closest(SKIP))) return;
  var w=document.createTreeWalker(root,4,null), a=[], n;
  while((n=w.nextNode())) a.push(n);
  for(var k=0;k<a.length;k++) fix(a[k]);
}
var q=[], raf=0;
function flush(){ raf=0; var l=q; q=[]; for(var i=0;i<l.length;i++) if(l[i].isConnected!==false) walk(l[i]); }
function add(n){ q.push(n); if(!raf) raf=requestAnimationFrame(flush); }
function start(){
  walk(document.body);
  try{ new MutationObserver(function(ms){ for(var i=0;i<ms.length;i++){ var m=ms[i];
      if(m.type==='characterData') add(m.target);
      else for(var j=0;j<m.addedNodes.length;j++) add(m.addedNodes[j]); } })
    .observe(document.body,{childList:true,subtree:true,characterData:true}); }catch(e){}
}
window.FFLogo={walk:walk};
if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
})();

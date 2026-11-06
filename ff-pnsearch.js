/* © 2026 Frenchfries777. CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
   패치노트 검색: 빌드 번호(371, b371, v371, build 371, 빌드 371)나 범위(300~320, 300-320), 내용으로 찾기. 찾은 낱말은 <mark>로 표시.
   목록 페이지: FFPN.mount('notesBox', 다시그리기) 뒤에 FFPN.filter(notes)로 거르기.
   글로 적힌 페이지: FFPN.mountDom('notes', '.note') 로 요소를 숨기고 보이기. */
(function(){
'use strict';
var Q='', MSG={ph:'빌드 번호나 내용으로 검색', hit:'{0}개 찾음', none:'찾는 패치노트가 없어요.'};
/* 다른 언어: ph, hit, none 순서. 언어는 ff-lang.js(없으면 저장된 언어, 브라우저 언어)를 따르고, 표에 없으면 영어 */
var ML={en:['Search by build number or text','{0} found','No matching patch notes.'],
 es:['Busca por número de build o texto','{0} encontradas','No hay notas que coincidan.'],
 fr:['Rechercher par numéro de build ou texte','{0} trouvée(s)','Aucune note correspondante.'],
 de:['Nach Build-Nummer oder Text suchen','{0} gefunden','Keine passenden Patchnotes.'],
 ja:['ビルド番号や内容で検索','{0}件見つかりました','該当するパッチノートはありません。'],
 zh:['按版本号或内容搜索','找到 {0} 条','没有符合的补丁说明。'],
 pt:['Busque por número da build ou texto','{0} encontradas','Nenhuma nota encontrada.'],
 ru:['Поиск по номеру сборки или тексту','Найдено: {0}','Подходящих патчноутов нет.'],
 tr:['Sürüm numarası veya metinle ara','{0} bulundu','Eşleşen yama notu yok.'],
 it:['Cerca per numero di build o testo','{0} trovate','Nessuna nota corrispondente.'],
 pl:['Szukaj po numerze buildu lub treści','Znaleziono: {0}','Brak pasujących aktualizacji.'],
 ar:['ابحث برقم الإصدار أو النص','تم العثور على {0}','لا توجد ملاحظات تحديث مطابقة.'],
 nw:['Seek by build number or truthword','{0} found, comrade','No Minitrue corrections found. They never existed.'],
 gk:['찾다 에 의해 짓다 숫자 또는 글자','{0} 찾았다','아니요 어울리는 반창고 쪽지들.']};
function lg(){ var l=''; try{ if(window.FFLang&&FFLang.get) l=FFLang.get(); }catch(e){} if(!l){ try{ l=localStorage.getItem('arenaClashLang')||''; }catch(e){} } if(!l){ try{ l=String(navigator.language||'').toLowerCase().split('-')[0]; }catch(e){} } return l||'en'; }
function L(k){ try{ if(window.FFT&&FFT.T) return FFT.T(MSG[k]); }catch(e){} var l=lg(); if(l==='ko') return MSG[k]; var r=ML[l]||ML.en; return r[{ph:0,hit:1,none:2}[k]]; }
function css(){
  if(document.getElementById('ffpnCss')) return;
  var s=document.createElement('style'); s.id='ffpnCss';
  s.textContent='.ffpn{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px}'+
    '.ffpn input{flex:1 1 240px;max-width:440px;min-width:0;box-sizing:border-box;background:rgba(0,0,0,.32);color:inherit;border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:8px 12px;font:inherit;font-size:15px}'+
    '.ffpn input:focus{outline:none;border-color:rgba(255,255,255,.6)}'+
    'html[data-ff-theme=light] .ffpn input{background:#fff;color:#111;border-color:rgba(0,0,0,.28)}html[data-ff-theme=light] .ffpn input:focus{border-color:#a67c00}html[data-ff-theme=light] mark.ffpn-mark{background:#f0d88a;color:#111}'+
    '.ffpn input::placeholder{color:inherit;opacity:.55}'+
    '.ffpn span{font-size:13.5px;opacity:.7}'+
    '.ffpn-none{opacity:.7;padding:8px 0}'+
    'mark.ffpn-mark{background:#d9b45f;color:#1a1206;border-radius:3px;padding:0 2px}';
  document.head.appendChild(s);
}
function words(v,out){
  if(v==null) return out;
  if(typeof v==='string'||typeof v==='number'){ out.push(String(v)); return out; }
  if(Array.isArray(v)){ v.forEach(function(x){ words(x,out); }); return out; }
  if(typeof v==='object') for(var k in v) if(Object.prototype.hasOwnProperty.call(v,k)) words(v[k],out);
  return out;
}
function buildNum(b){ var m=String(b||'').match(/\d+/g); return m?+m[m.length-1]:null; }
/* 300~320, 300-320, 300 - 320 은 빌드 범위 (2026-10처럼 연도로 시작하는 날짜는 제외) */
function terms(q){
  q=q.toLowerCase().replace(/(^|\s)(?:build|빌드)\s*(?=\d)/g,'$1b')
   .replace(/(^|\s)([bv]?\d+)\s*[~–-]\s*([bv]?\d+)(?=\s|$)/g,function(m,a,x,y){ return /^20\d\d$/.test(x)?m:a+x+'~'+y; });
  return q.split(/\s+/).filter(Boolean);
}
function isRange(t){ return /^[bv]?\d+~[bv]?\d+$/.test(t); }
/* 한 낱말: 범위면 그 안의 빌드, b45·v45처럼 빌드를 적으면 그 빌드만, 그냥 글이면 글 안에 들어 있으면 맞음 */
function hit(text,num,t){
  var r=t.match(/^[bv]?(\d+)~[bv]?(\d+)$/);
  if(r){ var lo=Math.min(+r[1],+r[2]), hi=Math.max(+r[1],+r[2]); return num!=null&&num>=lo&&num<=hi; }
  var m=t.match(/^[bv](\d+)$/);
  if(m) return (num!=null&&+m[1]===num)||new RegExp('(^|[^0-9a-z])'+t+'(?![0-9])').test(text);
  if(/^\d+$/.test(t)&&num!=null&&+t===num) return true;
  return text.indexOf(t)>=0;
}
function matchNote(n,q){
  var ts=terms(q==null?Q:q); if(!ts.length) return true;
  var text=words(n,[]).join(' ').toLowerCase(), num=buildNum(n&&n.build);
  return ts.every(function(t){ return hit(text,num,t); });
}
/* 찾은 낱말 표시: 낱말(범위·b45 제외)을 글 조각에서 찾아 <mark>로 감쌈. 다시 그릴 때마다 먼저 걷어 냄 */
function unmark(el){
  Array.prototype.forEach.call(el.querySelectorAll('mark.ffpn-mark'),function(m){ m.replaceWith(document.createTextNode(m.textContent)); });
  el.normalize();
}
function highlight(el,q){
  if(!el) return; unmark(el);
  var ts=terms(q==null?Q:q).filter(function(t){ return !isRange(t)&&!/^[bv]\d+$/.test(t); });
  if(!ts.length) return;
  var re=new RegExp(ts.map(function(t){ return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }).join('|'),'gi');
  var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    var pn=n.parentNode, p=pn&&pn.nodeName; return /^(SCRIPT|STYLE|INPUT|TEXTAREA|MARK)$/.test(p)||(pn.closest&&pn.closest('.ffpn,.ffpn-none'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT; }}), nodes=[], n;
  while((n=w.nextNode())) if(re.test(n.nodeValue)){ nodes.push(n); } re.lastIndex=0;
  nodes.forEach(function(n){
    var txt=n.nodeValue, frag=document.createDocumentFragment(), last=0, m; re.lastIndex=0;
    while((m=re.exec(txt))){ if(!m[0]){ re.lastIndex++; continue; }
      if(m.index>last) frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
      var k=document.createElement('mark'); k.className='ffpn-mark'; k.textContent=m[0]; frag.appendChild(k); last=m.index+m[0].length; }
    if(last<txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    n.parentNode.replaceChild(frag,n); });
}
function bar(before,onInput){
  css();
  var w=document.createElement('div'); w.className='ffpn';
  w.innerHTML='<input type="search" autocomplete="off" spellcheck="false"><span></span>';
  var inp=w.firstChild; inp.placeholder=L('ph'); inp.setAttribute('aria-label',L('ph'));
  var t=0; inp.addEventListener('input',function(){ clearTimeout(t); t=setTimeout(function(){ Q=inp.value.trim(); onInput(); },120); });
  before.parentNode.insertBefore(w,before);
  return w;
}
var FFPN={
  q:function(){ return Q; },
  match:matchNote,
  highlight:highlight,
  filter:function(list){ list=list||[]; return Q?list.filter(function(n){ return matchNote(n); }):list; },
  /* 찾은 개수 표시 */
  count:function(found){ var s=document.querySelector('.ffpn span'); if(s) s.textContent=Q&&found?L('hit').replace('{0}',found):''; },
  none:function(){ return '<div class="ffpn-none">'+L('none')+'</div>'; },
  mount:function(boxId,redraw){
    var box=document.getElementById(boxId); if(!box||box.previousElementSibling&&box.previousElementSibling.className==='ffpn') return;
    bar(box,redraw);
    var busy=false, mo=new MutationObserver(function(){ if(busy) return; busy=true; mo.disconnect(); highlight(box); mo.observe(box,{childList:true}); busy=false; });
    mo.observe(box,{childList:true});
  },
  mountDom:function(sectionId,sel){
    var sec=document.getElementById(sectionId); if(!sec) return;
    var els=sec.querySelectorAll(sel); if(!els.length) return;
    var none=document.createElement('div'); none.className='ffpn-none'; none.textContent=L('none'); none.style.display='none';
    var w=bar(els[0],function(){
      var c=0; Array.prototype.forEach.call(els,function(el){
        var ok=!Q||matchNote({build:(el.textContent.match(/\bb(\d+)\b/)||[])[1],t:el.textContent},Q);
        el.style.display=ok?'':'none'; if(ok){ c++; if(Q&&el.tagName==='DETAILS') el.open=true; } });
      none.style.display=Q&&!c?'':'none'; FFPN.count(c); highlight(sec);
    });
    w.parentNode.insertBefore(none,els[0]);
  }
};
window.FFPN=FFPN;
})();

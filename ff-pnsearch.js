/* © 2026 Frenchfries777. CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
   패치노트 검색: 빌드 번호(371, b371, v371, build 371, 빌드 371)나 내용으로 찾기.
   목록 페이지: FFPN.mount('notesBox', 다시그리기) 뒤에 FFPN.filter(notes)로 거르기.
   글로 적힌 페이지: FFPN.mountDom('notes', '.note') 로 요소를 숨기고 보이기. */
(function(){
'use strict';
var Q='', MSG={ph:'빌드 번호나 내용으로 검색', hit:'{0}개 찾음', none:'찾는 패치노트가 없어요.'};
function L(k){ try{ if(window.FFT&&FFT.T) return FFT.T(MSG[k]); }catch(e){} return MSG[k]; }
function css(){
  if(document.getElementById('ffpnCss')) return;
  var s=document.createElement('style'); s.id='ffpnCss';
  s.textContent='.ffpn{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px}'+
    '.ffpn input{flex:1 1 240px;max-width:440px;min-width:0;box-sizing:border-box;background:rgba(0,0,0,.32);color:inherit;border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:8px 12px;font:inherit;font-size:15px}'+
    '.ffpn input:focus{outline:none;border-color:rgba(255,255,255,.6)}'+
    '.ffpn input::placeholder{color:inherit;opacity:.55}'+
    '.ffpn span{font-size:13.5px;opacity:.7}'+
    '.ffpn-none{opacity:.7;padding:8px 0}';
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
function terms(q){ return q.toLowerCase().replace(/(^|\s)(?:build|빌드)\s*(?=\d)/g,'$1b').split(/\s+/).filter(Boolean); }
/* 한 낱말: b45·v45처럼 빌드를 적으면 그 빌드만, 그냥 글이면 글 안에 들어 있으면 맞음 */
function hit(text,num,t){
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
  filter:function(list){ list=list||[]; return Q?list.filter(function(n){ return matchNote(n); }):list; },
  /* 찾은 개수 표시 */
  count:function(found){ var s=document.querySelector('.ffpn span'); if(s) s.textContent=Q&&found?L('hit').replace('{0}',found):''; },
  none:function(){ return '<div class="ffpn-none">'+L('none')+'</div>'; },
  mount:function(boxId,redraw){
    var box=document.getElementById(boxId); if(!box||box.previousElementSibling&&box.previousElementSibling.className==='ffpn') return;
    bar(box,redraw);
  },
  mountDom:function(sectionId,sel){
    var sec=document.getElementById(sectionId); if(!sec) return;
    var els=sec.querySelectorAll(sel); if(!els.length) return;
    var none=document.createElement('div'); none.className='ffpn-none'; none.textContent=L('none'); none.style.display='none';
    var w=bar(els[0],function(){
      var c=0; Array.prototype.forEach.call(els,function(el){
        var ok=!Q||matchNote({build:(el.textContent.match(/\bb(\d+)\b/)||[])[1],t:el.textContent},Q);
        el.style.display=ok?'':'none'; if(ok){ c++; if(Q&&el.tagName==='DETAILS') el.open=true; } });
      none.style.display=Q&&!c?'':'none'; FFPN.count(c);
    });
    w.parentNode.insertBefore(none,els[0]);
  }
};
window.FFPN=FFPN;
})();

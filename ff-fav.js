/* 즐겨찾기: 게임·도구·교육 카드에 ★ 를 달아서 누른 카드를 맨 위로 올려요. 이 브라우저에만 저장돼요. */
(function(){
  if(window.FFFav) return; window.FFFav=true;
  var K='ff.fav.v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(K)||'[]'); }catch(e){ return []; } }
  function save(a){ try{ localStorage.setItem(K,JSON.stringify(a)); }catch(e){} }
  function run(){
    var sec=document.querySelector('section.games'); if(!sec) return;
    var cards=[].slice.call(sec.querySelectorAll('article.game')); if(!cards.length) return;
    var order=cards.slice();                       // 원래 순서
    var css=document.createElement('style');
    css.textContent='article.game{position:relative}.ffav{position:absolute;top:14px;right:72px;z-index:3;width:38px;height:38px;border-radius:50%;border:1px solid var(--fry,#d9b45f);background:rgba(14,14,14,.72);color:var(--fry,#d9b45f);font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.ffav.on{background:var(--fry,#d9b45f);color:#1c1405}';
    document.head.appendChild(css);
    function key(c){ var a=c.querySelector('a.play,a.shot'); return a?a.href:''; }
    function paint(){
      var fav=load(), top=[], rest=[];
      order.forEach(function(c){ (fav.indexOf(key(c))>=0?top:rest).push(c); });
      top.concat(rest).forEach(function(c){ sec.appendChild(c); var b=c.querySelector('.ffav'); if(b){ var on=fav.indexOf(key(c))>=0; b.classList.toggle('on',on); b.textContent=on?'★':'☆'; b.setAttribute('aria-pressed',on); b.title=on?'즐겨찾기 해제':'즐겨찾기'; } });
    }
    cards.forEach(function(c){
      var b=document.createElement('button'); b.type='button'; b.className='ffav'; b.setAttribute('data-notr','');
      b.onclick=function(e){ e.preventDefault(); e.stopPropagation(); var f=load(), k=key(c), i=f.indexOf(k); if(i>=0) f.splice(i,1); else f.push(k); save(f); paint(); };
      c.appendChild(b);
    });
    paint();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

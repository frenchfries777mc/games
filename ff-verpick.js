/* Folds a site's list of past versions into one dropdown: pick a version and only that one is shown. */
(function(){
  var TXT={ko:'다른 버전 고르기',en:'Pick a version'};
  window.FFVerPick=function(box){
    try{
      if(!box) return;
      var rows=[].filter.call(box.children,function(e){ return e.matches('.vrow')||e.querySelector('.vrow'); });
      if(rows.length<2) return;
      var lang=(document.documentElement.lang||'ko').slice(0,2), tx=TXT[lang]||TXT.en;
      var sel=document.createElement('select'); sel.className='ff-verpick'; sel.setAttribute('aria-label',tx);
      sel.style.cssText='width:100%;max-width:420px;margin:6px 0 12px;padding:10px 12px;border-radius:8px;border:1px solid var(--line,rgba(127,127,127,.4));background:var(--panel-2,rgba(127,127,127,.12));color:inherit;font:inherit;font-weight:700;cursor:pointer';
      rows.forEach(function(r,i){
        var v=r.querySelector('.v,.pb'), d=r.querySelector('.d'), o=document.createElement('option');
        var vt=(v?v.textContent:'').trim(), dt=d?d.textContent.trim().split(' · ')[0]:'';
        o.value=i; o.textContent=(vt||('#'+(i+1)))+(dt?'  ·  '+dt:''); sel.appendChild(o);
        r.style.display=i?'none':'';
      });
      sel.onchange=function(){ rows.forEach(function(r,i){ r.style.display=String(i)===sel.value?'':'none'; }); };
      var old=box.querySelector('.ff-verpick'); if(old) old.remove();
      box.insertBefore(sel,box.firstChild);
    }catch(e){}
  };
})();

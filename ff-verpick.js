/* Folds a site's list of past versions into one dropdown: pick a version and only that one is shown. */
(function(){
  var TXT={ko:'다른 버전 고르기',en:'Pick a version'}, OLD={ko:'이전 버전 고르기',en:'Older versions'};
  window.FFVerPick=function(box,opt){
    try{
      if(!box) return;
      if(opt&&opt.keep){ keepMode(box,opt); return; }
      var rows=[].filter.call(box.children,function(e){ return e.matches('.vrow')||e.querySelector('.vrow'); });
      if(rows.length<2) return;
      var lang=(document.documentElement.lang||'ko').slice(0,2), tx=TXT[lang]||TXT.en;
      var sel=document.createElement('select'); sel.className='ff-verpick'; sel.setAttribute('aria-label',tx);
      sel.style.cssText='width:100%;max-width:420px;margin:6px 0 12px;padding:10px 12px;border-radius:99px;border:1px solid var(--fry,#d9b45f);background:var(--bg,transparent);color:var(--text,inherit);font:inherit;font-weight:700;cursor:pointer';
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
  /* keep the newest row(s) open; fold the older ones behind a closed dropdown */
  function keepMode(box,opt){
    var all=[].slice.call(box.querySelectorAll(opt.sel||'.tv')), rest=all.slice(opt.keep);
    var old=box.querySelector('.ff-verpick'); if(old) old.remove();
    if(!rest.length) return;
    var lang=(document.documentElement.lang||'ko').slice(0,2), tx=OLD[lang]||OLD.en;
    var sel=document.createElement('select'); sel.className='ff-verpick'; sel.setAttribute('aria-label',tx);
    sel.style.cssText='width:100%;max-width:420px;margin:8px 0 4px;padding:10px 12px;border-radius:99px;border:1px solid var(--fry,#d9b45f);background:var(--bg,transparent);color:var(--text,inherit);font:inherit;font-weight:700;cursor:pointer;align-self:flex-start';
    var o0=document.createElement('option'); o0.value=''; o0.textContent=tx+' ▾'; sel.appendChild(o0);
    rest.forEach(function(r,i){
      var v=r.querySelector('.v'), d=r.querySelector('small'), o=document.createElement('option');
      var vt=(v?v.textContent:'').trim(), dt=d?d.textContent.trim().split(' · ').pop():'';
      o.value=i; o.textContent=(vt||('#'+(i+2)))+(dt?'  ·  '+dt:''); sel.appendChild(o); r.style.display='none';
    });
    sel.onchange=function(){ rest.forEach(function(r,i){ r.style.display=String(i)===sel.value?'':'none'; }); };
    box.appendChild(sel);
  }
})();

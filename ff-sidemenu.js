/* Left menu look for the hub-side pages: icon + label, gold pill for the current page, pure black menu.
   The pages keep their own markup; this adds the style and swaps the little squares for icons. */
(function(){
  if(window.__ffSideMenu)return; window.__ffSideMenu=1;
  var IC={'/':'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>','/games/':'<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5M16 11.5h.01M18.5 13.5h.01"/>','/educations/':'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>','/tools/':'<path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-3 3-2.5-2.5z"/>','/wiki/':'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>','/community/':'<path d="M4 5h16v11H9l-5 4z"/>','/lounge/':'<path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 12a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 4 0v4H1v-4a2 2 0 0 1 2-2zM5 20v1.5M19 20v1.5"/>','/prototypes/':'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7.5 15h9"/>','/settings/':'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>'};
  var css='aside[style*="flex:0 0 232px"]{background:#000!important;border-right-color:#262626!important;gap:4px!important}'+
  'aside[style*="flex:0 0 232px"]>a:first-child{color:#fff}'+
  'aside[style*="flex:0 0 232px"]>a:first-child span:nth-child(3){color:#ffd54a!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm{border-radius:999px!important;padding:10px 16px!important;gap:11px!important;color:#9a9a9a!important;background:transparent!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm:hover{background:#0d0d0d!important;color:#fff!important}'+
  'aside[style*="flex:0 0 232px"] a.ffsm.on,aside[style*="flex:0 0 232px"] a.ffsm.on:hover{background:#ffd54a!important;color:#000!important;font-weight:700!important}'+
  /* the light theme flips the whole page with a filter, so these colours are what comes out as amber with dark text */
  'html[data-ff-theme=light] aside[style*="flex:0 0 232px"] a.ffsm.on,html[data-ff-theme=light] aside[style*="flex:0 0 232px"] a.ffsm.on:hover{background:#965a00!important;color:#fff!important}'+
  'html[data-ff-theme=light] aside[style*="flex:0 0 232px"]>a:first-child span:nth-child(3){color:#965a00!important}'+
  'a.ffsm svg{width:18px;height:18px;flex:none;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}';
  function run(){
    var side=document.querySelector('aside[style*="flex:0 0 232px"]'); if(!side||side.__ffsm)return; side.__ffsm=1;
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var as=side.querySelectorAll(':scope>a');
    for(var i=0;i<as.length;i++){
      var a=as[i], sp=a.querySelector(':scope>span[style*="width:8px"]'); if(!sp)continue;
      var h=(a.getAttribute('href')||'').replace(/^https?:\/\/[^\/]+/,''); var k=IC[h]; if(!k)continue;
      var on=/#26221a/i.test(a.getAttribute('style')||'');
      a.classList.add('ffsm'); if(on)a.classList.add('on');
      var s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('viewBox','0 0 24 24'); s.innerHTML=k;
      a.replaceChild(s,sp);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();

/* 옛 주소(frenchfries777mc.github.io) → frenchfries777.com 자동 이동. 내 기기 저장값도 같이 옮겨요. */
(function(){'use strict';
var OLD='frenchfries777mc.github.io',NEW='https://frenchfries777.com';
if(location.hostname!==OLD||window.__ffRedir)return;window.__ffRedir=1;
if(/[?&]noredirect=1(&|$)/.test(location.search))return;
var p=location.pathname;if(p==='/hub'||p.indexOf('/hub/')===0)p=p.slice(4)||'/';
var h=location.hash,mig='';
try{var d={},n=0,k,v,i;
for(i=0;i<localStorage.length;i++){k=localStorage.key(i);v=localStorage.getItem(k);if(v!==null){d[k]=v;n+=k.length+v.length}}
var ks=Object.keys(d).sort(function(a,b){return d[b].length-d[a].length});
for(i=0;n>600000&&i<ks.length;i++){n-=ks[i].length+d[ks[i]].length;delete d[ks[i]]}
if(Object.keys(d).length)mig='#ffmig='+btoa(unescape(encodeURIComponent(JSON.stringify({d:d,h:h})))).replace(/\+/g,'-').replace(/\//g,'_');
}catch(e){mig=''}
location.replace(NEW+p+location.search+(mig||h));
})();

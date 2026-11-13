/* frenchfries777mc.github.io 에서는 github.io 안에서만 이동해요: frenchfries777.com 으로 가는 링크와 이동을 같은 주소의 같은 페이지로 바꿔요.
   (예전에는 여기서 frenchfries777.com 으로 자동 이동했어요.) 로그인 페이지(frenchfries777.com/log-in/)만 다녀와요. */
(function(){'use strict';
var OLD='frenchfries777mc.github.io';
if(location.hostname!==OLD||window.__ffRedir)return;window.__ffRedir=1;
var SAME=['games','educations','tools','seumarena'],SUB={'chat.frenchfries777.com':'/hub/chat','apps.frenchfries777.com':'/app'};
function map(href){try{var u=new URL(href,location.href),h=u.hostname.replace(/^www\./,''),p=u.pathname,s=p.split('/')[1],np=null;
if(!/^https?:$/.test(u.protocol))return null;
if(h==='frenchfries777.com'){if(/^\/log-in(\/|$)/.test(p))return null;np=SAME.indexOf(s)>-1?p:'/hub'+p}
else if(SUB[h])np=SUB[h]+p;
else if(h===OLD&&SAME.indexOf(s)<0&&s!=='hub'&&s!=='app'&&s!=='')np='/hub'+p;
return np===null?null:'https://'+OLD+np+u.search+u.hash}catch(e){return null}}
window.__ffStay=map;
function onClick(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var n=map(a.getAttribute('href'));if(n)a.href=n}
document.addEventListener('click',onClick,true);document.addEventListener('auxclick',onClick,true);
try{var wo=window.open;window.open=function(u){var a=[].slice.call(arguments);if(typeof u==='string'){var n=map(u);if(n)a[0]=n}return wo.apply(window,a)}}catch(e){}
try{if(window.navigation&&navigation.addEventListener)navigation.addEventListener('navigate',function(e){if(!e.cancelable||e.hashChange||e.downloadRequest!==null||e.formData)return;var n=map(e.destination.url);if(n&&n!==e.destination.url){e.preventDefault();location.href=n}})}catch(e){}
})();

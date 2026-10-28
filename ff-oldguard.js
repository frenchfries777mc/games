/* 옛 고정 버전 페이지용 안전장치: 옛 버전으로 레벨·마스터리·점수·코인·업적을 쉽게 올리는 꼼수를 막아요.
   옛 버전 html 맨 위(<head> 바로 아래, supabase 라이브러리보다 먼저)에 이 파일을 불러오게 해 둬요. 현재 버전에는 넣지 마세요.
   막는 것: 기록을 올리는 서버 함수(rpc), 프로필 통계(profiles.stats) 쓰기, 계정에 저장하는 진행도(클라우드 저장, auth.updateUser data).
   읽기·로그인·친구·채팅은 그대로 돼요. 옛 버전의 내 기기 저장(localStorage)도 그대로예요. */
(function(){
'use strict';
if(window.__ffOldGuard) return; window.__ffOldGuard=1;
var BLOCK=/^(ff_(set|sync|mark|coin|ach|rank|survival|add|claim|exp)|ce_|dp_(coin|buy|wallet))/i;
var ERR={data:null,error:{message:'old-version'}};
function wrap(c){
  if(!c||c.__ffo) return c; c.__ffo=1;
  try{ var r0=c.rpc&&c.rpc.bind(c); if(r0) c.rpc=function(n,a,o){ if(BLOCK.test(String(n))) return Promise.resolve(ERR); return r0(n,a,o); }; }catch(e){}
  try{ var f0=c.from&&c.from.bind(c); if(f0) c.from=function(t){ var q=f0(t);
    if(t==='profiles'&&q&&q.update){ var u=q.update.bind(q); q.update=function(p){ if(p&&typeof p==='object'&&'stats' in p) return Promise.resolve(ERR); return u.apply(null,arguments); }; }
    return q; }; }catch(e){}
  try{ var a=c.auth; if(a&&a.updateUser){ var uu=a.updateUser.bind(a); a.updateUser=function(p){ if(p&&p.data&&typeof p.data==='object'&&Object.keys(p.data).length) return Promise.resolve(ERR); return uu.apply(null,arguments); }; } }catch(e){}
  return c;
}
function hook(lib){ if(!lib||!lib.createClient||lib.__ffo) return; lib.__ffo=1; var cc=lib.createClient; lib.createClient=function(){ return wrap(cc.apply(this,arguments)); }; }
if(window.supabase) hook(window.supabase);
else { try{ var v; Object.defineProperty(window,'supabase',{configurable:true,enumerable:true,get:function(){ return v; },set:function(x){ v=x; hook(x); }}); }catch(e){} }
function note(){
  if(!document.body||document.getElementById('ffOldVer')) return;
  var d=document.createElement('div'); d.id='ffOldVer';
  d.style.cssText='position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99999;max-width:92vw;padding:8px 12px;border-radius:10px;background:rgba(20,22,28,.92);color:#f2e7c0;font:12px/1.4 sans-serif;text-align:center;pointer-events:none';
  d.textContent='이전 버전이라 업적·랭킹·코인·진행도 기록이 계정에 저장되지 않아요. 최신 버전에서 이어서 해 주세요.';
  document.body.appendChild(d);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',note); else note();
})();

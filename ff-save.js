/* SPDX-License-Identifier: CC-BY-NC-ND-4.0
   © 2026 Frenchfries777. CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
   게임 저장을 계정에 올려 주는 공용 스크립트예요 (테이블 ff_game_saves, 키 하나가 한 줄).
   - 로그인했을 때만 일해요. 로그인하지 않으면 지금처럼 이 브라우저에만 저장해요.
   - 처음 로그인하면 이 브라우저에 있던 저장이 계정으로 올라가고, 계정에 이미 있는 저장은 이 브라우저로 내려와요.
   - 주소가 달라도(github.io · .com · 서브도메인) 같은 계정이면 같은 저장이 보여요.
   쓰는 법: FFSave.init({game:'이름', match:/^키접두사/ 또는 함수, ...})  (게임이 저장소를 읽기 전에 불러오세요)
   옵션: client()/uid() 게임이 따로 로그인 클라이언트를 쓸 때 · omit {키:['경로']} 기기마다 다른 값은 올리지 않기 ·
         merge {키:'json'|함수} 두 쪽이 다 바뀌었을 때 합치기 · logical/physical 키 이름 바꾸기 · reload:false 면 내려받은 뒤 새로고침 안 함 */
(function(){
'use strict';
if(window.FFSave) return;
var TB='ff_game_saves', MAXV=5500000, ST=Storage.prototype;

function fnv(s){ var h=0x811c9dc5; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36)+'.'+s.length; }
function jparse(s){ try{ return JSON.parse(s); }catch(e){ return undefined; } }
function getPath(o,p){ for(var i=0;i<p.length;i++){ if(!o||typeof o!=='object') return undefined; o=o[p[i]]; } return o; }
function setPath(o,p,v){ for(var i=0;i<p.length-1;i++){ if(!o[p[i]]||typeof o[p[i]]!=='object') o[p[i]]={}; o=o[p[i]]; } if(v===undefined) delete o[p[p.length-1]]; else o[p[p.length-1]]=v; }

/* JSON 합치기: 숫자는 큰 쪽, 참/거짓은 하나라도 참이면 참, 목록은 합집합(id가 있으면 id 기준), 글자는 이 기기 것 */
function mergeJson(a,b){
  if(a===undefined) return b; if(b===undefined) return a;
  if(typeof a==='number'&&typeof b==='number') return Math.max(a,b);
  if(typeof a==='boolean'&&typeof b==='boolean') return a||b;
  if(Array.isArray(a)&&Array.isArray(b)){
    var out=a.slice(), has=function(x){ for(var i=0;i<out.length;i++){ var y=out[i]; if(x&&y&&typeof x==='object'&&typeof y==='object'&&x.id!==undefined&&x.id===y.id) return i; if(JSON.stringify(y)===JSON.stringify(x)) return i; } return -1; };
    b.forEach(function(x){ var i=has(x); if(i<0) out.push(x); else if(x&&typeof x==='object'&&x.id!==undefined) out[i]=mergeJson(out[i],x); });
    return out;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
    var o={}, k; for(k in a) o[k]=a[k]; for(k in b) o[k]=(k in a)?mergeJson(a[k],b[k]):b[k]; return o;
  }
  return a;
}

function init(opt){
  if(!opt||!opt.game) return null;
  var game=String(opt.game), match=opt.match, omit=opt.omit||{}, mergeCfg=opt.merge||{};
  var logical=opt.logical||function(k){ return k; }, physical=opt.physical||function(k){ return k; }, enumKey=opt.enumKey||logical;
  /* init 시점의 저장소 함수(게임이 키 이름을 바꿔 쓰는 처리가 있으면 그것까지 포함)를 그대로 써요 */
  var RAWS=ST.setItem, RAWG=ST.getItem, RAWR=ST.removeItem;
  var isMatch=typeof match==='function'?match:(match instanceof RegExp?function(k){ return match.test(k); }:function(k){ return match.indexOf(k)>=0; });
  function ok(k){ try{ return k&&k.indexOf('bak~')!==0&&k.indexOf('ffsave.')!==0&&isMatch(k); }catch(e){ return false; } }
  var S={game:game, uid:null, sb:null, ready:false, busy:false, frozen:false, dirty:{}, lt:{}, meta:{}, timer:0, fails:0, last:0, state:'off', supp:0};
  var MK=function(){ return 'ffsave.'+game+'.'+S.uid; };

  function raw(k){ try{ return RAWG.call(localStorage,k); }catch(e){ return null; } }
  function loadMeta(){ var m=jparse(raw(MK())||''); S.meta=(m&&typeof m==='object')?m:{}; }
  function saveMeta(){ try{ RAWS.call(localStorage,MK(),JSON.stringify(S.meta)); }catch(e){} }
  function allKeys(){ var o=[]; try{ for(var i=0;i<localStorage.length;i++){ var pk=localStorage.key(i), lk=enumKey(pk); if(lk&&ok(lk)) o.push(lk); } }catch(e){} return o; }
  function lget(k){ try{ return RAWG.call(localStorage,physical(k)); }catch(e){ return null; } }
  function lset(k,v){ S.supp++; try{ if(v===null) RAWR.call(localStorage,physical(k)); else RAWS.call(localStorage,physical(k),v); }catch(e){} S.supp--; }
  /* 기기마다 다른 값은 빼고 올려요 */
  function view(k,s){
    var om=omit[k]; if(!om||s===null) return s;
    var o=jparse(s); if(!o||typeof o!=='object') return s;
    om.forEach(function(p){ setPath(o,p.split('.'),undefined); });
    return JSON.stringify(o);
  }
  function applyView(k,localRaw,server){
    var om=omit[k]; if(!om) return server;
    var so=jparse(server); if(!so||typeof so!=='object') return server;
    var lo=jparse(localRaw||'');
    om.forEach(function(p){ var pa=p.split('.'), v=lo&&typeof lo==='object'?getPath(lo,pa):undefined; if(v!==undefined) setPath(so,pa,v); else setPath(so,pa,undefined); });
    return JSON.stringify(so);
  }
  function mergeVals(k,a,b){
    var cfg=mergeCfg[k]; if(!cfg){ for(var r in mergeCfg){ if(r.charAt(0)==='/'&&new RegExp(r.slice(1,r.lastIndexOf('/'))).test(k)){ cfg=mergeCfg[r]; break; } } }
    if(!cfg) return null;
    if(typeof cfg==='function'){ try{ return cfg(a,b); }catch(e){ return null; } }
    var ja=jparse(a), jb=jparse(b); if(ja===undefined||jb===undefined) return null;
    return JSON.stringify(mergeJson(ja,jb));
  }

  async function fetchMeta(){
    var out={}, from=0, step=1000;
    for(;;){
      var r=await S.sb.from(TB).select('k,t').eq('user_id',S.uid).eq('game',game).range(from,from+step-1);
      if(r.error) throw r.error;
      (r.data||[]).forEach(function(x){ out[x.k]=x.t; });
      if(!r.data||r.data.length<step) break; from+=step;
    }
    return out;
  }
  async function fetchVal(k){
    var r=await S.sb.from(TB).select('v,t').eq('user_id',S.uid).eq('game',game).eq('k',k).maybeSingle();
    if(r.error) throw r.error; return r.data;
  }
  async function putRows(rows){
    var i=0;
    while(i<rows.length){
      var chunk=[], size=0;
      while(i<rows.length&&(chunk.length===0||size+rows[i].v.length<3000000)&&chunk.length<20){ chunk.push(rows[i]); size+=rows[i].v.length; i++; }
      var r=await S.sb.from(TB).upsert(chunk.map(function(x){ return {user_id:S.uid,game:game,k:x.k,v:x.v}; }),{onConflict:'user_id,game,k'}).select('k,t');
      if(r.error) throw r.error;
      (r.data||[]).forEach(function(x){ var row=null; chunk.forEach(function(c){ if(c.k===x.k) row=c; }); if(row){ S.meta[x.k]={t:x.t,h:row.h}; } });
    }
  }
  async function delRows(keys){
    for(var i=0;i<keys.length;i+=50){
      var r=await S.sb.from(TB).delete().eq('user_id',S.uid).eq('game',game).in('k',keys.slice(i,i+50));
      if(r.error) throw r.error;
      keys.slice(i,i+50).forEach(function(k){ delete S.meta[k]; });
    }
  }

  /* 한 번에 맞추기: 로그인 직후 한 번, 그 뒤엔 바뀐 키만 올려요 */
  async function reconcile(){
    var srv=await fetchMeta(), keys={}, pushes=[], dels=[], pulls=[], baks=[];
    allKeys().forEach(function(k){ keys[k]=1; }); Object.keys(srv).forEach(function(k){ if(ok(k)) keys[k]=1; }); Object.keys(S.meta).forEach(function(k){ if(ok(k)) keys[k]=1; });
    for(var k in keys){
      var Lraw=lget(k), L=Lraw===null?null:view(k,Lraw), M=S.meta[k], lh=L===null?null:fnv(L), St=srv[k];
      var lc=L!==null?(!M||M.h!==lh):!!(M&&M.h!=null);
      var sc=St!==undefined?(!M||M.t!==St):!!(M&&M.t);
      if(!lc&&!sc) continue;
      if(lc&&!sc){ if(L===null) dels.push(k); else if(L.length<=MAXV) pushes.push({k:k,v:L,h:lh}); continue; }
      if(!lc&&sc){ pulls.push({k:k,del:St===undefined}); continue; }
      /* 둘 다 바뀜 */
      if(L===null){ pulls.push({k:k}); continue; }
      if(St===undefined){ if(L.length<=MAXV) pushes.push({k:k,v:L,h:lh}); continue; }
      var sv=await fetchVal(k); if(!sv) continue;
      if(sv.v===L){ S.meta[k]={t:sv.t,h:lh}; continue; }
      var mg=mergeVals(k,L,sv.v), pickServer;
      if(mg!==null){ lset(k,applyView(k,Lraw,mg)); S.changed=(S.changed||0)+1; pushes.push({k:k,v:view(k,lget(k)),h:fnv(view(k,lget(k)))}); continue; }
      var lt=S.lt[k];
      if(M&&lt) pickServer=(Date.parse(sv.t)||0)>=lt;
      else pickServer=!(L.length>=sv.v.length*1.25);
      if(pickServer){ if(L.length>2&&L.length<=MAXV) baks.push({k:'bak~'+k,v:L,h:fnv(L)}); pulls.push({k:k,val:sv.v,t:sv.t}); }
      else { if(sv.v.length>2&&sv.v.length<=MAXV) baks.push({k:'bak~'+k,v:sv.v,h:fnv(sv.v)}); pushes.push({k:k,v:L,h:lh}); }
    }
    /* 내려받기 */
    var restored=0;
    for(var i=0;i<pulls.length;i++){
      var p=pulls[i];
      if(p.del){ lset(p.k,null); delete S.meta[p.k]; restored++; continue; }
      var v=p.val, t=p.t;
      if(v===undefined){ var d=await fetchVal(p.k); if(!d) continue; v=d.v; t=d.t; }
      var cur=lget(p.k), nv=applyView(p.k,cur,v);
      if(cur!==nv){ lset(p.k,nv); restored++; }
      S.meta[p.k]={t:t,h:fnv(view(p.k,nv))};
    }
    if(restored||S.changed){ S.restored=(S.restored||0)+restored; }
    if(baks.length) try{ await putRows(baks); }catch(e){}
    if(pushes.length) await putRows(pushes);
    if(dels.length) await delRows(dels);
    saveMeta();
    return restored+(S.changed||0);
  }
  async function pushDirty(){
    var ks=Object.keys(S.dirty); S.dirty={};
    var rows=[], dels=[];
    ks.forEach(function(k){
      var Lraw=lget(k), L=Lraw===null?null:view(k,Lraw), M=S.meta[k];
      if(L===null){ if(M) dels.push(k); return; }
      if(M&&M.h===fnv(L)) return;
      if(L.length>MAXV) return;
      rows.push({k:k,v:L,h:fnv(L)});
    });
    try{ if(rows.length) await putRows(rows); if(dels.length) await delRows(dels); saveMeta(); S.last=Date.now(); S.fails=0; S.state='on'; }
    catch(e){ ks.forEach(function(k){ S.dirty[k]=1; }); S.fails++; S.state='err'; }
  }
  function schedule(ms){ if(S.timer||!S.ready) return; S.timer=setTimeout(async function(){ S.timer=0; if(S.busy||S.frozen) return; S.busy=true; try{ await pushDirty(); }finally{ S.busy=false; } if(Object.keys(S.dirty).length&&S.fails<6) schedule(Math.min(60000,8000*(S.fails+1))); },ms==null?6000:ms); }
  function flush(){ if(!S.ready||S.frozen||S.busy) return; if(S.timer){ clearTimeout(S.timer); S.timer=0; } if(!Object.keys(S.dirty).length) return; S.busy=true; pushDirty().then(function(){ S.busy=false; },function(){ S.busy=false; }); }

  /* 저장소에 쓰는 순간을 지켜봐요 */
  ST.setItem=function(k,v){
    if(this===localStorage){
      var lk=logical(String(k));
      if(lk&&ok(lk)){
        if(S.frozen&&!S.supp) return;
        var r=RAWS.apply(this,arguments);
        if(!S.supp&&S.uid){ S.dirty[lk]=1; if(S.ready) S.lt[lk]=Date.now(); schedule(); }
        return r;
      }
    }
    return RAWS.apply(this,arguments);
  };
  ST.removeItem=function(k){
    if(this===localStorage){
      var lk=logical(String(k));
      if(lk&&ok(lk)){
        if(S.frozen&&!S.supp) return;
        var r=RAWR.apply(this,arguments);
        if(!S.supp&&S.uid){ S.dirty[lk]=1; if(S.ready) S.lt[lk]=Date.now(); schedule(); }
        return r;
      }
    }
    return RAWR.apply(this,arguments);
  };

  /* 같은 브라우저에서 다른 계정으로 바꿔 로그인하면, 앞 계정의 저장은 따로 보관하고 새 계정의 것으로 바꿔요 (계정끼리 섞이지 않게) */
  function switchOwner(oldU,newU){
    var OKY='ffsave.owner.'+game, ks=allKeys(), o={};
    ks.forEach(function(k){ var v=lget(k); if(v!==null) o[k]=v; });
    try{ if(Object.keys(o).length) RAWS.call(localStorage,'ffsave.stash.'+game+'.'+oldU,JSON.stringify(o)); }catch(e){}
    ks.forEach(function(k){ lset(k,null); });
    var st=jparse(raw('ffsave.stash.'+game+'.'+newU)||'');
    if(st&&typeof st==='object'){ for(var k in st){ if(typeof st[k]==='string') lset(k,st[k]); } try{ RAWR.call(localStorage,'ffsave.stash.'+game+'.'+newU); }catch(e){} }
    S.changed=(S.changed||0)+1;
  }
  async function start(uid,sb){
    S.uid=uid; S.sb=sb; S.ready=false; S.state='sync'; S.changed=0; S.restored=0; loadMeta();
    try{
      if(!opt.scoped){ var OKY='ffsave.owner.'+game, ow=raw(OKY); if(ow&&ow!==uid) switchOwner(ow,uid); if(ow!==uid){ try{ RAWS.call(localStorage,OKY,uid); }catch(e){} } }

      var n=await reconcile();
      if(S.uid!==uid) return;
      S.ready=true; S.state='on'; S.last=Date.now(); S.fails=0;
      if(n>0&&opt.reload!==false){
        var fk='ffsave.rl.'+game, t0=0; try{ t0=+sessionStorage.getItem(fk)||0; }catch(e){}
        if(Date.now()-t0>20000){ try{ sessionStorage.setItem(fk,String(Date.now())); }catch(e){} S.frozen=true; (typeof opt.onRestore==='function')?opt.onRestore(n):location.reload(); return; }
      }
      if(Object.keys(S.dirty).length) schedule(1500);
    }catch(e){ S.state='err'; S.fails++; setTimeout(function(){ if(S.uid===uid&&!S.ready) start(uid,sb); },Math.min(120000,10000*S.fails)); }
  }
  function tick(){
    var uid=null, sb=null;
    try{ uid=opt.uid?opt.uid():(window.FFAuth&&FFAuth.user()&&FFAuth.user().id); sb=opt.client?opt.client():(window.FFAuth&&FFAuth.client&&FFAuth.client()); }catch(e){}
    if(uid&&sb){ if(uid!==S.uid||sb!==S.sb) start(uid,sb); }
    else if(S.uid&&!uid){ S.uid=null; S.sb=null; S.ready=false; S.state='off'; S.dirty={}; }
  }
  setInterval(tick,2000); setTimeout(tick,300);
  try{ if(window.FFAuth&&FFAuth.ready) FFAuth.ready.then(function(){ setTimeout(tick,50); }); if(window.FFAuth&&FFAuth.onChange) FFAuth.onChange(function(){ setTimeout(tick,50); }); }catch(e){}
  document.addEventListener('visibilitychange',function(){ if(document.hidden) flush(); });
  window.addEventListener('pagehide',flush);
  setInterval(function(){ if(S.ready&&!S.busy&&!S.frozen&&Object.keys(S.dirty).length) flush(); },30000);
  var api={game:game, state:function(){ return S.state; }, last:function(){ return S.last; }, flush:flush, sync:function(){ if(S.uid&&S.sb) return start(S.uid,S.sb); }, touch:function(k){ if(S.uid){ S.dirty[k]=1; schedule(); } }};
  (window.FFSaves=window.FFSaves||{})[game]=api;
  return api;
}
window.FFSave={init:init, mergeJson:mergeJson, ver:1};
})();

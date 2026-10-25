/* "지금 N명 접속 중" 표시줄: 허브와 같은 모양을 Educations·Tools 같은 다른 사이트에서도 쓰려고 만든 공용 스크립트예요(보여 주기만 하고 접속 신호는 보내지 않아요).
   쓰는 법: 페이지에 <div class="onl" id="onlineBar"></div> 를 두고 ff-auth.js 다음에 이 파일을 불러오면 돼요. 게임 이름은 ff-lang.js 의 FF_REG 에서 가져와요. */
(function(){
'use strict';
var bar=document.getElementById('onlineBar'); if(!bar||!window.FFAuth) return;
if(!document.getElementById('ff-online-css')){
  var st=document.createElement('style'); st.id='ff-online-css';
  st.textContent='#onlineBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:18px;font-size:14.5px;color:var(--dim,#8a93a6);} #onlineBar:empty{display:none;} #onlineBar>b{color:var(--text,#eef0f5);}'
   +'.on-dot{width:9px;height:9px;border-radius:50%;background:#3fe0c5;box-shadow:0 0 0 0 rgba(63,224,197,.6);animation:onp 2s infinite;} @keyframes onp{70%{box-shadow:0 0 0 8px rgba(63,224,197,0);}100%{box-shadow:0 0 0 0 rgba(63,224,197,0);}}'
   +'.on-c{padding:3px 10px;border-radius:99px;border:1px solid var(--line,#222837);background:var(--panel,#10131b);} .on-c b{color:var(--text,#eef0f5);} .on-f{display:flex;flex-wrap:wrap;align-items:center;gap:6px;}'
   +'.on-p{display:inline-flex;align-items:baseline;gap:5px;padding:3px 10px;border-radius:99px;background:rgba(63,224,197,.1);border:1px solid rgba(63,224,197,.3);color:var(--text,#eef0f5);text-decoration:none;} .on-p small{color:var(--dim,#8a93a6);font-size:11.5px;}';
  document.head.appendChild(st);
}
var names={}, sb=null, T=null;
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function gname(id){ var l=window.FF_REG||[]; for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i].name; return id==='hub'?'허브':id; }
async function loadNames(ids){
  ids=ids.filter(function(id,i){ return id&&!names[id]&&ids.indexOf(id)===i; }); if(!ids.length) return;
  try{ var r=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((r&&r.data)||[]).forEach(function(p){ names[p.id]=(p.display_name&&String(p.display_name).trim())||p.username||'???'; }); }catch(e){}
}
async function paint(){
  var r=await sb.rpc('ff_online'); if(r.error){ bar.innerHTML=''; return; }
  var c={}; (r.data||[]).forEach(function(x){ c[x.place]=x.people; });
  var html='<span class="on-dot"></span><b>지금 '+(c.all||0)+'명 접속 중</b>';
  (window.FF_REG||[]).map(function(e){ return e.id; }).sort(function(a,b){ return a==='hub'?-1:b==='hub'?1:0; }).forEach(function(g){ if(c[g]) html+='<span class="on-c"><span>'+esc(gname(g))+'</span> <b>'+c[g]+'</b></span>'; });
  var u=FFAuth.user&&FFAuth.user();
  if(u){ var f=await sb.rpc('ff_online_friends'), rows=((f&&!f.error&&f.data)||[]).filter(function(x){ return !(FFAuth.isBlocked&&FFAuth.isBlocked(x.user_id)); });
    if(rows.length){ await loadNames(rows.map(function(x){ return x.user_id; }));
      html+='<span class="on-f"><span>친구</span> '+rows.slice(0,8).map(function(x){ return '<span class="on-p">'+esc(names[x.user_id]||'???')+'<small>'+esc(gname(x.place))+'</small></span>'; }).join('')+(rows.length>8?'<span>+'+(rows.length-8)+'</span>':'')+'</span>'; } }
  bar.innerHTML=html;
}
function start(){ sb=FFAuth.client&&FFAuth.client(); if(!sb) return; paint(); setInterval(function(){ if(document.visibilityState==='visible') paint(); },20000);
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') paint(); }); }
Promise.resolve(FFAuth.ready).then(start,start);
})();

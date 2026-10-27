/* Frenchfries777 개발 일지 (개발자 전용): games 첫 화면에, 개발자(ff_devs)로 로그인했을 때만 나와요.
   글은 ff_devlog 테이블에 있고 개발자만 읽고 쓸 수 있어요 (supabase-ff-devlog.sql). 다른 사람에게는 이 구역이 아예 안 보여요. */
(function(){
'use strict';
var sec=document.getElementById('devlog'); if(!sec||!window.FFAuth) return;
var TAGS=[['progress','진행','#4fe0c8'],['decision','결정','#ffc93c'],['issue','문제','#ff6b6b'],['memo','메모','#9aa4bd']];
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function tag(id){ for(var i=0;i<TAGS.length;i++) if(TAGS[i][0]===id) return TAGS[i]; return TAGS[3]; }
var css=document.createElement('style'); css.textContent=
'#devlog{max-width:1180px;margin:22px auto 0;padding:0 18px}#devlog .dl{border:1px solid #3a4a6a;background:linear-gradient(180deg,#121a2b,#0e121b);border-radius:18px;padding:18px 20px}'+
'#devlog h2{margin:0 0 4px;font-size:20px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}#devlog h2 small{font-size:12px;font-weight:800;color:#0b0f18;background:#ffc93c;border-radius:99px;padding:2px 9px}'+
'#devlog .dsub{color:#8a93a6;font-size:13px;margin:0 0 12px}#devlog .top{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}'+
'#devlog button,#devlog select,#devlog input,#devlog textarea{font:inherit;color:#eef0f5;background:#0b0f18;border:1px solid #2a3350;border-radius:10px;padding:8px 11px}#devlog button{cursor:pointer;font-weight:800}#devlog button.go{background:#ffc93c;color:#1a1204;border-color:#ffc93c}#devlog button:disabled{opacity:.5}'+
'#devlog .f{display:none;gap:8px;flex-direction:column;margin:0 0 14px}#devlog .f.on{display:flex}#devlog .f .r{display:flex;gap:8px}#devlog .f input{flex:1;min-width:0}#devlog textarea{min-height:110px;resize:vertical}'+
'#devlog .it{border-top:1px solid #222837;padding:12px 2px}#devlog .it:first-child{border-top:0}#devlog .hd{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#devlog .tg{font-size:12px;font-weight:900;border-radius:99px;padding:2px 9px;color:#0b0f18}'+
'#devlog .tt{font-weight:900;font-size:16px}#devlog .mt{color:#8a93a6;font-size:12px;margin-left:auto}#devlog .bd{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;color:#d5d9e6;font-size:14px;line-height:1.6}'+
'#devlog .dx{color:#ff9a9a;border-color:#4a2a30;font-size:12px;padding:4px 9px}#devlog .e{color:#8a93a6;padding:10px 0;font-size:14px}';
document.head.appendChild(css);
var me=null, sb=null, busy=false;
function fmt(t){ var d=new Date(t); return (d.getMonth()+1)+'월 '+d.getDate()+'일 '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
async function load(){
  var L=sec.querySelector('.ls'); if(!L) return;
  var r=await sb.from('ff_devlog').select('id,user_id,tag,title,body,created_at').order('created_at',{ascending:false}).limit(60);
  if(r.error){ L.innerHTML='<div class="e">개발 일지 창고가 아직 준비되지 않았어요. supabase-ff-devlog.sql을 실행하면 열려요.</div>'; return; }
  var rows=r.data||[]; if(!rows.length){ L.innerHTML='<div class="e">아직 쓴 글이 없어요. 위의 “새 글”로 첫 일지를 남겨 보세요.</div>'; return; }
  var ids={}; rows.forEach(function(x){ ids[x.user_id]=1; }); var names={};
  try{ var p=await sb.from('profiles').select('id,display_name,username').in('id',Object.keys(ids)); ((p&&p.data)||[]).forEach(function(x){ names[x.id]=x.display_name||x.username||'???'; }); }catch(e){}
  var owner=FFAuth.devRole(me.id)==='owner';
  L.innerHTML=rows.map(function(x){ var t=tag(x.tag), mine=x.user_id===me.id;
    return '<div class="it" data-id="'+x.id+'"><div class="hd"><span class="tg" style="background:'+t[2]+'">'+t[1]+'</span><span class="tt">'+esc(x.title)+'</span><span class="mt">'+esc(names[x.user_id]||'???')+' · '+fmt(x.created_at)+'</span>'+((mine||owner)?'<button type="button" class="dx" data-del="'+x.id+'">지우기</button>':'')+'</div><div class="bd">'+esc(x.body)+'</div></div>'; }).join('');
  [].forEach.call(L.querySelectorAll('[data-del]'),function(b){ b.onclick=async function(){
    if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='한 번 더 누르면 지워요'; setTimeout(function(){ if(b.isConnected){ b.dataset.arm=''; b.textContent='지우기'; } },3500); return; }
    b.disabled=true; await sb.from('ff_devlog').delete().eq('id',+b.dataset.del); load(); }; });
}
function build(){
  sec.innerHTML='<div class="dl" data-notr><h2>🛠️ 개발 일지 <small>개발자 전용</small></h2><p class="dsub">개발자 계정으로 로그인한 사람에게만 보여요. 진행 상황, 결정한 것, 막힌 점을 적어 두세요.</p>'+
   '<div class="top"><button type="button" class="go" data-new>＋ 새 글</button></div>'+
   '<div class="f"><div class="r"><select data-tag>'+TAGS.map(function(t){ return '<option value="'+t[0]+'">'+t[1]+'</option>'; }).join('')+'</select><input data-title maxlength="80" placeholder="제목"></div><textarea data-body maxlength="4000" placeholder="내용 (4000자까지)"></textarea><div class="r"><button type="button" class="go" data-save>올리기</button><button type="button" data-cancel>취소</button><span class="e" data-msg></span></div></div>'+
   '<div class="ls"><div class="e">불러오는 중…</div></div></div>';
  var f=sec.querySelector('.f'), msg=sec.querySelector('[data-msg]');
  sec.querySelector('[data-new]').onclick=function(){ f.classList.toggle('on'); };
  sec.querySelector('[data-cancel]').onclick=function(){ f.classList.remove('on'); msg.textContent=''; };
  sec.querySelector('[data-save]').onclick=async function(){
    var t=sec.querySelector('[data-title]').value.trim(), b=sec.querySelector('[data-body]').value.trim(); if(!t||!b){ msg.textContent='제목과 내용을 적어 주세요.'; return; }
    if(busy) return; busy=true; this.disabled=true; var r=await sb.from('ff_devlog').insert({user_id:me.id,tag:sec.querySelector('[data-tag]').value,title:t,body:b}); busy=false; this.disabled=false;
    if(r.error){ msg.textContent='올리지 못했어요. 개발자 계정인지 확인해 주세요.'; return; }
    sec.querySelector('[data-title]').value=''; sec.querySelector('[data-body]').value=''; msg.textContent=''; f.classList.remove('on'); load(); };
  load();
}
var lastId=null;
async function check(){
  try{ sb=await FFAuth.ready; me=FFAuth.user(); if(me) await FFAuth.loadDevs(); }catch(e){ me=null; }
  var dev=!!(me&&FFAuth.devRole(me.id));
  if(!dev){ sec.hidden=true; sec.innerHTML=''; lastId=null; return; }
  sec.hidden=false; if(lastId!==me.id){ lastId=me.id; build(); }
}
check(); if(FFAuth.onChange) FFAuth.onChange(function(){ check(); });
})();

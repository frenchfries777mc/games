/* Frenchfries777 허브: 커뮤니티(게시판 · 채팅 · 피드백/버그 신고)와 아래쪽 뉴스(세 게임의 패치노트)
   글자는 한국어로 쓰고, 허브의 번역 스크립트(<script id="i18n">)가 다른 언어로 바꿔요. 사람들이 쓴 글은 data-notr 로 번역하지 않아요.
   필요한 SQL: supabase-ff-hub.sql */
(function(){
'use strict';
var SI=window.SI18N||{lang:'ko',F:function(t){ var a=arguments; return String(t).replace(/\{(\d)\}/g,function(_,n){ return a[+n+1]; }); }};
var LANG=SI.lang||'ko', F=SI.F;
var GAMES={stickseum:{name:'Stickseum',cls:'g1',site:'../stickseum/'},crownenvoy:{name:'Crown Envoy',cls:'g2',site:'../crownenvoy/'},beaconfall:{name:'Beaconfall',cls:'g3',site:'../beaconfall/'}};
function $(s,r){ return (r||document).querySelector(s); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function ago(iso){ var t=Date.parse(iso); if(!t) return ''; var m=Math.round((Date.now()-t)/60000);
  if(m<1) return '방금'; if(m<60) return F('{0}분 전',m); if(m<1440) return F('{0}시간 전',Math.round(m/60)); if(m<1440*7) return F('{0}일 전',Math.round(m/1440));
  return new Date(t).toISOString().slice(0,10); }

/* ===================== 뉴스: 세 게임의 패치노트를 모아서 최신순으로 ===================== */
var NEWS_STEP=6, news=[], newsShown=NEWS_STEP;
function trNote(n, N){
  if(LANG==='ko') return {title:n.title, items:n.items||[]};
  if(n.tr&&n.tr[LANG]) return {title:n.tr[LANG].title||n.title, items:n.tr[LANG].items||n.items||[]};
  if(N){ var b=String(n.build||''), k=[b, b.replace(/^v/,''), 'v'+b.replace(/^v/,'')], e=null; for(var i=0;i<k.length&&!e;i++) e=N[k[i]];
    if(e) return {title:(e.title&&e.title[LANG])||n.title, items:(n.items||[]).map(function(x,j){ var it=e.items&&e.items[j]; return (it&&it[LANG])||x; })}; }
  return {title:n.title, items:n.items||[]};
}
function siteDict(g){ return fetch(GAMES[g].site+'i18n.js',{cache:'no-cache'}).then(function(r){ return r.ok?r.text():''; }).then(function(t){
  if(!t) return null; try{ var w={}; new Function('window',t)(w); return (w.I18N&&w.I18N.N)||null; }catch(e){ return null; } },function(){ return null; }); }
function loadNews(){
  var box=$('#newsList'); if(!box) return;
  Promise.all(Object.keys(GAMES).map(function(g){
    return Promise.all([fetch(GAMES[g].site+'patchnotes.json',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; },function(){ return null; }), LANG==='ko'||g==='stickseum'?null:siteDict(g)])
      .then(function(x){ var d=x[0]; return ((d&&d.notes)||[]).map(function(n,i){ var t=trNote(n,x[1]); return {g:g, i:i, date:n.date||'', build:n.build||'', title:t.title, items:t.items}; }); });
  })).then(function(all){ news=[].concat.apply([],all).sort(function(a,b){ return (b.date>a.date?1:b.date<a.date?-1:0)||(a.i-b.i); }); paintNews(); });
}
function paintNews(){
  var box=$('#newsList'), more=$('#newsMore'); if(!box) return;
  if(!news.length){ box.innerHTML='<div class="cm-e">아직 소식이 없어요.</div>'; more.style.display='none'; return; }
  box.innerHTML=news.slice(0,newsShown).map(function(n){ var G=GAMES[n.g], it=n.items.slice(0,4);
    return '<article class="nw '+G.cls+'"><div class="nh"><span class="ng">'+esc(G.name)+'</span><span class="nd" data-notr>'+esc(n.date)+(n.build?' · '+esc(n.build):'')+'</span></div>'+
      '<h3 data-notr>'+esc(n.title)+'</h3><ul data-notr>'+it.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'+
      (n.items.length>4?'<div class="nmore">'+esc(F('외 {0}개',n.items.length-4))+'</div>':'')+
      '<a class="nl" href="'+G.site+'#notes">패치노트 전체 보기 →</a></article>'; }).join('');
  more.style.display=news.length>newsShown?'':'none';
}

/* ===================== 커뮤니티 ===================== */
var sb=null, me=null, admin=false, names={}, tab='board';
function client(){ return window.FFAuth&&FFAuth.client&&FFAuth.client(); }
function login(){ if(window.FFAuth) FFAuth.openLogin(); }
function errText(e){ var m=String((e&&(e.message||e.details))||e||'');
  if(/too many|slow down/i.test(m)) return '너무 빨리 쓰고 있어요. 잠시 뒤에 다시 해 주세요.';
  if(/does not exist|schema cache|PGRST20|42P01/i.test(m+' '+(e&&e.code))) return '아직 준비 중이에요. (관리자가 Supabase에 SQL을 실행하면 열려요)';
  return '처리하지 못했어요. 잠시 뒤 다시 해 주세요.'; }
async function loadNames(ids){
  ids=ids.filter(function(id,i){ return id&&!names[id]&&ids.indexOf(id)===i; }); if(!ids.length||!sb) return;
  try{ var r=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((r&&r.data)||[]).forEach(function(p){ names[p.id]=(p.display_name&&String(p.display_name).trim())||p.username||'???'; }); }catch(e){}
}
function who(id){ return '<a class="who" data-uid="'+esc(id)+'" data-notr>'+esc(names[id]||'???')+'</a>'; }
document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a.who[data-uid]'); if(a&&window.FFAuth){ e.preventDefault(); FFAuth.openProfile(a.getAttribute('data-uid')); } });
function hubSync(){ try{ if(window.FFAuth&&FFAuth.syncHub) FFAuth.syncHub(); }catch(e){} }
function setTab(t){ tab=t; var bs=document.querySelectorAll('.cm-tabs button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-t')===t);
  var ps=document.querySelectorAll('.cm-p'); for(var j=0;j<ps.length;j++) ps[j].style.display=ps[j].getAttribute('data-p')===t?'':'none';
  if(t==='board') board(); else if(t==='chat') chat(); else feedback(); }

/* ---- 게시판 ---- */
var bFilter='all', bLimit=20, bOpen=null, bWriting=false;
var GOPT='<option value="free">자유</option><option value="stickseum">Stickseum</option><option value="crownenvoy">Crown Envoy</option><option value="beaconfall">Beaconfall</option>';
function gameTag(g){ return g==='free'?'<span class="tag">자유</span>':(GAMES[g]?'<span class="tag '+GAMES[g].cls+'">'+esc(GAMES[g].name)+'</span>':''); }
async function board(){
  var p=$('.cm-p[data-p=board]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-bar"><div class="cm-f"><button data-f="all" class="on">전체</button><button data-f="free">자유</button><button data-f="stickseum">Stickseum</button><button data-f="crownenvoy">Crown Envoy</button><button data-f="beaconfall">Beaconfall</button></div><button class="cm-btn cm-new">✏️ 글쓰기</button></div>'+
      '<form class="cm-w" style="display:none"><select name="g">'+GOPT+'</select><input name="t" maxlength="80" placeholder="제목" required><textarea name="b" maxlength="4000" rows="6" placeholder="내용" required></textarea><div class="cm-m"></div><div class="cm-acts"><button type="button" class="cm-btn2 cm-cancel">취소</button><button class="cm-btn">올리기</button></div></form>'+
      '<div class="cm-list"></div><button class="cm-btn2 cm-more" style="display:none">더 보기</button>';
    p.querySelector('.cm-f').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; bFilter=b.getAttribute('data-f'); bLimit=20; [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); listPosts(); };
    p.querySelector('.cm-new').onclick=function(){ if(!me) return login(); var w=p.querySelector('.cm-w'); w.style.display=w.style.display==='none'?'':'none'; if(w.style.display==='') w.t.focus(); };
    p.querySelector('.cm-cancel').onclick=function(){ p.querySelector('.cm-w').style.display='none'; };
    p.querySelector('.cm-more').onclick=function(){ bLimit+=20; listPosts(); };
    p.querySelector('.cm-w').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'); if(!me) return login(); if(bWriting) return;
      var t=f.t.value.trim(), b=f.b.value.trim(); if(!t||!b) return; bWriting=true; m.textContent='';
      var r=await sb.from('ff_posts').insert({title:t, body:b, game:f.g.value}); bWriting=false;
      if(r.error){ m.textContent=errText(r.error); return; } f.reset(); f.style.display='none'; hubSync(); listPosts(); };
  }
  listPosts();
}
async function listPosts(){
  var p=$('.cm-p[data-p=board]'), L=p&&p.querySelector('.cm-list'); if(!L||!sb) return;
  var q=sb.from('ff_posts').select('id,user_id,game,title,body,created_at').order('created_at',{ascending:false}).range(0,bLimit);
  if(bFilter!=='all') q=q.eq('game',bFilter);
  var r=await q; if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=r.data||[], more=rows.length>bLimit; rows=rows.slice(0,bLimit);
  var cnt={}; if(rows.length){ var c=await sb.from('ff_comments').select('post_id').in('post_id',rows.map(function(x){ return x.id; })).limit(2000); ((c&&c.data)||[]).forEach(function(x){ cnt[x.post_id]=(cnt[x.post_id]||0)+1; }); }
  await loadNames(rows.map(function(x){ return x.user_id; }));
  L.innerHTML=rows.length?'':'<div class="cm-e">아직 글이 없어요. 첫 글을 써 보세요!</div>';
  rows.forEach(function(x){ var d=document.createElement('div'); d.className='cm-post'+(bOpen===x.id?' open':''); d.dataset.id=x.id;
    d.innerHTML='<div class="cm-ph">'+gameTag(x.game)+'<b class="cm-t" data-notr>'+esc(x.title)+'</b>'+(cnt[x.id]?'<span class="cm-c">💬 '+cnt[x.id]+'</span>':'')+'</div>'+
      '<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div><div class="cm-body"></div>';
    d.querySelector('.cm-ph').onclick=function(){ bOpen=bOpen===x.id?null:x.id; d.classList.toggle('open',bOpen===x.id); if(bOpen===x.id) openPost(d,x); };
    L.appendChild(d); if(bOpen===x.id) openPost(d,x); });
  p.querySelector('.cm-more').style.display=more?'':'none';
}
async function openPost(d, x){
  var B=d.querySelector('.cm-body'); B.innerHTML='<div class="cm-txt" data-notr></div><div class="cm-acts2"></div><div class="cm-cms"></div><form class="cm-cf"><input maxlength="1000" placeholder="댓글 달기"><button class="cm-btn">등록</button></form><div class="cm-m"></div>';
  B.querySelector('.cm-txt').textContent=x.body;
  if(me&&(me.id===x.user_id||admin)){ var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='글 삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } var r=await sb.from('ff_posts').delete().eq('id',x.id); if(r.error) B.querySelector('.cm-m').textContent=errText(r.error); else { bOpen=null; listPosts(); } }; B.querySelector('.cm-acts2').appendChild(del); }
  var cf=B.querySelector('.cm-cf'); cf.onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var v=cf.querySelector('input').value.trim(); if(!v) return;
    var r=await sb.from('ff_comments').insert({post_id:x.id, body:v}); if(r.error){ B.querySelector('.cm-m').textContent=errText(r.error); return; } cf.reset(); hubSync(); comments(B,x); };
  comments(B,x);
}
async function comments(B, x){
  var C=B.querySelector('.cm-cms'), r=await sb.from('ff_comments').select('id,user_id,body,created_at').eq('post_id',x.id).order('created_at').limit(300);
  var rows=(r&&r.data)||[]; await loadNames(rows.map(function(c){ return c.user_id; })); C.innerHTML='';
  rows.forEach(function(c){ var e=document.createElement('div'); e.className='cm-cm'; e.innerHTML='<div class="cm-meta">'+who(c.user_id)+' · <span>'+esc(ago(c.created_at))+'</span></div><div class="cm-ct" data-notr></div>'; e.querySelector('.cm-ct').textContent=c.body;
    if(me&&(me.id===c.user_id||admin)){ var x2=document.createElement('button'); x2.className='cm-x'; x2.title='삭제'; x2.textContent='×'; x2.onclick=async function(){ await sb.from('ff_comments').delete().eq('id',c.id); comments(B,x); }; e.appendChild(x2); }
    C.appendChild(e); });
}

/* ---- 채팅 (모두가 보는 방 하나, 새 메시지는 바로 보여요) ---- */
var chatRows=[], chatChan=null, chatPoll=null, chatLive=false;
async function chat(){
  var p=$('.cm-p[data-p=chat]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-chat"></div><form class="cm-cf cm-send"><input maxlength="300" placeholder="메시지 보내기" autocomplete="off"><button class="cm-btn">보내기</button></form><div class="cm-m"></div>';
    p.querySelector('.cm-send').onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var i=this.querySelector('input'), v=i.value.trim(); if(!v) return; i.value='';
      var r=await sb.from('ff_chat').insert({body:v}); var m=p.querySelector('.cm-m'); m.textContent=r.error?errText(r.error):''; if(r.error){ i.value=v; return; } hubSync(); if(!chatLive) pullChat(); };
  }
  paintSend(); await pullChat(); watchChat();
}
function paintSend(){ var p=$('.cm-p[data-p=chat]'); if(!p) return; var i=p.querySelector('.cm-send input'); if(i) i.placeholder=me?'메시지 보내기':'로그인하면 채팅할 수 있어요'; }
async function pullChat(){
  if(!sb) return; var r=await sb.from('ff_chat').select('id,user_id,body,created_at').order('created_at',{ascending:false}).limit(60);
  var p=$('.cm-p[data-p=chat]'); if(r.error){ p.querySelector('.cm-chat').innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  chatRows=(r.data||[]).reverse(); await loadNames(chatRows.map(function(x){ return x.user_id; })); paintChat();
}
function paintChat(){
  var box=$('.cm-p[data-p=chat] .cm-chat'); if(!box) return; var stick=box.scrollHeight-box.scrollTop-box.clientHeight<60;
  box.innerHTML=chatRows.length?'':'<div class="cm-e">아직 메시지가 없어요. 먼저 인사해 보세요!</div>';
  chatRows.forEach(function(x){ var d=document.createElement('div'); d.className='cm-msg'+(me&&x.user_id===me.id?' mine':'');
    d.innerHTML='<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div><div class="cm-bub" data-notr></div>'; d.querySelector('.cm-bub').textContent=x.body;
    if(me&&(me.id===x.user_id||admin)){ var b=document.createElement('button'); b.className='cm-x'; b.title='삭제'; b.textContent='×'; b.onclick=async function(){ await sb.from('ff_chat').delete().eq('id',x.id); chatRows=chatRows.filter(function(y){ return y.id!==x.id; }); paintChat(); }; d.appendChild(b); }
    box.appendChild(d); });
  if(stick||!box.dataset.once){ box.dataset.once=1; box.scrollTop=box.scrollHeight; }
}
function watchChat(){
  if(chatChan||!sb) return;
  try{ chatChan=sb.channel('ff-hub-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'ff_chat'},async function(pl){ var x=pl&&pl.new; if(!x||chatRows.some(function(y){ return y.id===x.id; })) return; await loadNames([x.user_id]); chatRows.push(x); if(chatRows.length>200) chatRows.shift(); paintChat(); })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'ff_chat'},function(pl){ var id=pl&&pl.old&&pl.old.id; if(id){ chatRows=chatRows.filter(function(y){ return y.id!==id; }); paintChat(); } })
      .subscribe(function(st){ chatLive=st==='SUBSCRIBED'; }); }catch(e){}
  chatPoll=setInterval(function(){ if(tab==='chat'&&!chatLive&&document.visibilityState!=='hidden') pullChat(); }, 8000);     // if live updates are not available
}

/* ---- 피드백 · 버그 신고 ---- */
var KIND={bug:'🐞 버그',idea:'💡 아이디어',other:'💬 기타'}, GN={hub:'허브',stickseum:'Stickseum',crownenvoy:'Crown Envoy',beaconfall:'Beaconfall'};
async function feedback(){
  var p=$('.cm-p[data-p=fb]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<p class="cm-note">고쳤으면 하는 점, 버그, 새 아이디어를 보내 주세요. 보낸 내용은 나와 관리자만 볼 수 있어요.</p>'+
      '<form class="cm-w cm-fb"><div class="cm-row"><select name="k"><option value="bug">🐞 버그</option><option value="idea">💡 아이디어</option><option value="other">💬 기타</option></select>'+
      '<select name="g"><option value="hub">허브</option><option value="stickseum">Stickseum</option><option value="crownenvoy">Crown Envoy</option><option value="beaconfall">Beaconfall</option></select></div>'+
      '<textarea name="b" maxlength="2000" rows="5" placeholder="무엇이 어떻게 됐는지 자세히 적어 주세요. (버그라면 어떤 기기에서, 무엇을 하다가 생겼는지)" required></textarea><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">보내기</button></div></form>'+
      '<div class="cm-mine"></div><div class="cm-admin"></div>';
    p.querySelector('.cm-fb').onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var f=this, m=f.querySelector('.cm-m'), b=f.b.value.trim(); if(!b) return;
      var r=await sb.from('ff_feedback').insert({kind:f.k.value, game:f.g.value, body:b, page:String(location.href).slice(0,300), ua:String(navigator.userAgent).slice(0,300)});
      if(r.error){ m.textContent=errText(r.error); return; } f.b.value=''; m.textContent='보냈어요. 고마워요!'; hubSync(); fbLists(); };
  }
  fbLists();
}
function fbRow(x, adm){
  var d=document.createElement('div'); d.className='cm-fbi'+(x.done?' done':'');
  d.innerHTML='<div class="cm-meta"><b>'+esc(KIND[x.kind]||x.kind)+'</b> · '+esc(GN[x.game]||x.game)+' · <span>'+esc(ago(x.created_at))+'</span>'+(adm?' · '+who(x.user_id):'')+(x.done?' · <span class="ok">✅ 확인됨</span>':'')+'</div><div class="cm-ct" data-notr></div>';
  d.querySelector('.cm-ct').textContent=x.body;
  if(adm){ var a=document.createElement('div'); a.className='cm-acts2';
    var t=document.createElement('button'); t.className='cm-btn2'; t.textContent=x.done?'확인 취소':'확인함'; t.onclick=async function(){ await sb.from('ff_feedback').update({done:!x.done}).eq('id',x.id); fbLists(); };
    var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } await sb.from('ff_feedback').delete().eq('id',x.id); fbLists(); };
    if(x.page) { var pg=document.createElement('div'); pg.className='cm-meta'; pg.setAttribute('data-notr',''); pg.textContent=x.page+' · '+(x.ua||''); d.appendChild(pg); }
    a.appendChild(t); a.appendChild(del); d.appendChild(a); }
  return d;
}
async function fbLists(){
  var p=$('.cm-p[data-p=fb]'); if(!p||!sb) return; var M=p.querySelector('.cm-mine'), A=p.querySelector('.cm-admin'); M.innerHTML=''; A.innerHTML='';
  if(!me){ M.innerHTML='<div class="cm-e">로그인하면 피드백을 보낼 수 있어요.</div>'; return; }
  var r=await sb.from('ff_feedback').select('*').eq('user_id',me.id).order('created_at',{ascending:false}).limit(30);
  var rows=(r&&r.data)||[]; if(rows.length){ M.innerHTML='<h4>내가 보낸 피드백</h4>'; rows.forEach(function(x){ M.appendChild(fbRow(x,false)); }); }
  if(admin){ var a=await sb.from('ff_feedback').select('*').order('done').order('created_at',{ascending:false}).limit(200); var all=(a&&a.data)||[];
    await loadNames(all.map(function(x){ return x.user_id; }));
    A.innerHTML='<h4>받은 피드백 (관리자) · '+all.filter(function(x){ return !x.done; }).length+'</h4>'; if(!all.length) A.innerHTML+='<div class="cm-e">아직 없어요.</div>'; all.forEach(function(x){ A.appendChild(fbRow(x,true)); }); }
}

/* ---- 시작 ---- */
async function refreshUser(){
  me=window.FFAuth&&FFAuth.user&&FFAuth.user(); admin=false;
  if(me&&sb){ try{ var r=await sb.rpc('ff_is_admin'); admin=!!(r&&r.data===true); }catch(e){} }
  paintSend(); setTab(tab);
}
function start(){
  loadNews(); var mb=$('#newsMore'); if(mb) mb.onclick=function(){ newsShown+=NEWS_STEP; paintNews(); };
  var tabs=$('.cm-tabs'); if(tabs) tabs.onclick=function(e){ var b=e.target.closest('button'); if(b) setTab(b.getAttribute('data-t')); };
  var go=function(){ if(!window.FFAuth){ setTimeout(go,200); return; } FFAuth.ready.then(function(){ sb=client(); refreshUser(); FFAuth.onChange(function(){ setTimeout(refreshUser,50); }); }); };
  go();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

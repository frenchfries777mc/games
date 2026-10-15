/* Frenchfries777 허브: 커뮤니티(게시판 · 채팅 · 피드백/버그 신고)와 아래쪽 뉴스(세 게임의 패치노트)
   글자는 한국어로 쓰고, 허브의 번역 스크립트(<script id="i18n">)가 다른 언어로 바꿔요. 사람들이 쓴 글은 data-notr 로 번역하지 않아요.
   필요한 SQL: supabase-ff-hub.sql, supabase-ff-images.sql, supabase-ff-social.sql, supabase-ff-extra.sql, supabase-ff-more.sql (+ crownenvoy/supabase-ff-rank.sql) */
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

/* ===================== 뉴스: 세 게임과 허브의 패치노트 중 가장 최근 6개 ===================== */
var NEWS_N=6, news=[], hubNotes=[];
var NSRC={hub:{name:'허브',cls:'g0',site:'./'},stickseum:GAMES.stickseum,crownenvoy:GAMES.crownenvoy,beaconfall:GAMES.beaconfall};
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
  var box=$('#newsList'); if(!box) return Promise.resolve();
  return Promise.all(Object.keys(NSRC).map(function(g){
    return Promise.all([fetch(NSRC[g].site+'patchnotes.json',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; },function(){ return null; }), LANG==='ko'||g==='stickseum'||g==='hub'?null:siteDict(g)])
      .then(function(x){ var d=x[0]; return ((d&&d.notes)||[]).map(function(n,i){ var t=trNote(n,x[1]); return {g:g, i:i, date:n.date||'', build:n.build||'', title:t.title, items:t.items}; }); });
  })).then(function(all){ hubNotes=all[0]; news=[].concat.apply([],all).sort(function(a,b){ return (b.date>a.date?1:b.date<a.date?-1:0)||(a.i-b.i); }); paintNews(); });
}
function paintNews(){
  var box=$('#newsList'); if(!box) return;
  if(!news.length){ box.innerHTML='<div class="cm-e">아직 소식이 없어요.</div>'; return; }
  box.innerHTML=news.slice(0,NEWS_N).map(function(n){ var G=NSRC[n.g], it=n.items.slice(0,4);
    return '<article class="nw '+G.cls+'"><div class="nh"><span class="ng">'+esc(G.name)+'</span><span class="nd" data-notr>'+esc(n.date)+(n.build?' · '+esc(n.build):'')+'</span></div>'+
      '<h3 data-notr>'+esc(n.title)+'</h3><ul data-notr>'+it.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'+
      (n.items.length>4?'<div class="nmore">'+esc(F('외 {0}개',n.items.length-4))+'</div>':'')+
      (n.g==='hub'?'<a class="nl" href="#hubnotes">패치노트 전체 보기 →</a>':'<a class="nl" href="'+G.site+'#notes">패치노트 전체 보기 →</a>')+'</article>'; }).join('');
}
/* 허브 패치노트 전체 목록 (뉴스의 '허브 패치노트' 버튼, 또는 주소 끝 #hubnotes) */
function openHubNotes(){
  var el=$('#hubNotes'); if(!el){ el=document.createElement('div'); el.id='hubNotes'; el.className='hn-bg'; document.body.appendChild(el);
    el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')) closeHubNotes(); }); }
  el.innerHTML='<div class="hn-b"><div class="hn-h"><b>🍟 허브 패치노트</b><button type="button" class="hn-x" aria-label="닫기">×</button></div>'+
    (hubNotes.length?hubNotes.map(function(n){ return '<div class="hn-n"><div class="nd" data-notr>'+esc(n.date)+'</div><h3 data-notr>'+esc(n.title)+'</h3><ul data-notr>'+n.items.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>'; }).join(''):'<div class="cm-e">아직 소식이 없어요.</div>')+'</div>';
  el.style.display='flex';
}
function closeHubNotes(){ var el=$('#hubNotes'); if(el) el.style.display='none'; if(location.hash==='#hubnotes') try{ history.replaceState(null,'',location.pathname+location.search+'#news'); }catch(e){} }
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeHubNotes(); });

/* ===================== 공지 · 이벤트 배너 (관리자만 올리고, 닫으면 그 공지는 다시 안 보여요) ===================== */
var ANN_KEY='ff.annHide', anns=[];
function annHidden(){ try{ return JSON.parse(localStorage.getItem(ANN_KEY)||'[]'); }catch(e){ return []; } }
async function loadAnn(){
  if(!sb) return; var r=await sb.from('ff_announce').select('*').order('created_at',{ascending:false}).limit(50); if(r.error){ anns=[]; paintAnn(); return; }
  anns=r.data||[]; paintAnn(); if(admin) annAdmin();
}
function annLive(a){ return a.active&&(!a.ends_at||Date.parse(a.ends_at)>Date.now()); }
function paintAnn(){
  var box=$('#annBar'); if(!box) return; var hid=annHidden();
  var live=anns.filter(function(a){ return annLive(a)&&hid.indexOf(a.id)<0; }).slice(0,3);
  box.innerHTML=live.map(function(a){ return '<div class="ann '+(a.kind==='event'?'ev':'nt')+'"><span class="ak">'+(a.kind==='event'?'🎉 이벤트':'📢 공지')+'</span><span class="ab" data-notr>'+esc(a.body)+'</span>'+
    (a.link?'<a class="al" href="'+esc(a.link)+'" target="_blank" rel="noopener">자세히 →</a>':'')+(a.ends_at?'<span class="ae">'+esc(F('{0}까지',String(a.ends_at).slice(5,10).replace('-','/')))+'</span>':'')+
    '<button type="button" class="ax" data-id="'+a.id+'" aria-label="닫기">×</button></div>'; }).join('');
  [].forEach.call(box.querySelectorAll('.ax'),function(b){ b.onclick=function(){ var h=annHidden(); h.push(+b.getAttribute('data-id')); try{ localStorage.setItem(ANN_KEY,JSON.stringify(h.slice(-50))); }catch(e){} paintAnn(); }; });
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
  if(CARDS) try{ var c=await sb.from('ff_card').select('user_id,title').in('user_id',ids); if(c.error) CARDS=false; ((c&&c.data)||[]).forEach(function(x){ if(TNAME[x.title]) titles[x.user_id]=x.title; }); }catch(e){}
}
/* 칭호 (ff-profile.js 의 TITLES 와 같은 id, supabase-ff-more.sql) */
var titles={}, CARDS=true, TNAME={newbie:'새내기',traveler:'여행자',explorer:'탐험가',friendly:'다정한 친구',popular:'인기쟁이',writer:'글쟁이',commenter:'댓글러',chatter:'수다쟁이',helper:'도우미',allround:'만능',collector:'수집가',master:'달인',legend:'전설'};
function who(id){ var t=titles[id]; return '<a class="who" data-uid="'+esc(id)+'" data-notr>'+esc(names[id]||'???')+'</a>'+(t?' <span class="ttl">🏷️ <span>'+esc(TNAME[t])+'</span></span>':''); }
document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a.who[data-uid]'); if(a&&window.FFAuth){ e.preventDefault(); FFAuth.openProfile(a.getAttribute('data-uid')); } });
function blocked(id){ try{ return !!(window.FFAuth&&FFAuth.isBlocked&&FFAuth.isBlocked(id)); }catch(e){ return false; } }
function report(o){ if(!me) return login(); if(window.FFAuth&&FFAuth.openReport) FFAuth.openReport(o); }
window.addEventListener('ffblocks',function(){ if(tab==='board') listPosts(); else if(tab==='chat') paintChat(); });
function hubSync(){ try{ if(window.FFAuth&&FFAuth.syncHub) FFAuth.syncHub(); }catch(e){} }
function setTab(t){ tab=t; var bs=document.querySelectorAll('.cm-tabs button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-t')===t);
  var ps=document.querySelectorAll('.cm-p'); for(var j=0;j<ps.length;j++) ps[j].style.display=ps[j].getAttribute('data-p')===t?'':'none';
  if(t==='board') board(); else if(t==='chat') chat(); else if(t==='lfg') lfg(); else if(t==='gal') gallery(); else if(t==='poll') polls(); else feedback(); }
function scrollToCm(){ var c=$('#community'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }

/* ---- 사진: 줄여서(긴 쪽 1600px) Supabase 저장소 'ff-images/<내 id>/' 에 올리고, 글 · 채팅에는 주소만 저장 (supabase-ff-images.sql) ---- */
var PUB='https://kebsbuvuutilitwlvxzv.supabase.co/storage/v1/object/public/ff-images/', IMG=true;     // IMG=false: the images column is not there yet
function okImg(u){ return typeof u==='string'&&u.indexOf(PUB)===0&&/^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,80}$/.test(u.slice(PUB.length)); }
function imgsHtml(a, cls){ a=(a||[]).filter(okImg); if(!a.length) return ''; return '<div class="'+cls+' n'+Math.min(a.length,4)+'">'+a.map(function(u){ return '<a href="'+esc(u)+'" target="_blank" rel="noopener"><img src="'+esc(u)+'" alt="" loading="lazy"></a>'; }).join('')+'</div>'; }
function shrink(file){ return new Promise(function(res,rej){
  if(!file||!/^image\//.test(file.type)) return rej('type');
  if(file.type==='image/gif'){ return file.size<=3145728?res(file):rej('big'); }                     // keep GIFs moving
  var u=URL.createObjectURL(file), im=new Image();
  im.onload=function(){ var k=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(im.naturalWidth*k)); c.height=Math.max(1,Math.round(im.naturalHeight*k));
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u);
    c.toBlob(function(b){ if(b&&b.type==='image/webp'&&b.size<=3145728) return res(b); c.toBlob(function(j){ j&&j.size<=3145728?res(j):rej('big'); },'image/jpeg',0.85); },'image/webp',0.85); };
  im.onerror=function(){ URL.revokeObjectURL(u); rej('type'); }; im.src=u; }); }
async function upload(file){
  var b=await shrink(file), ext={'image/webp':'webp','image/jpeg':'jpg','image/png':'png','image/gif':'gif'}[b.type]||'jpg';
  var name=me.id+'/'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
  var r=await sb.storage.from('ff-images').upload(name, b, {contentType:b.type, cacheControl:'31536000', upsert:false});
  if(r.error) throw r.error; return PUB+name;
}
function imgErr(e){ return e==='big'?'사진이 너무 커요. (3MB까지)':(e==='type'?'사진 파일만 올릴 수 있어요.':(/bucket|not found|row-level|policy/i.test(String((e&&e.message)||e))?'아직 준비 중이에요. (관리자가 Supabase에 SQL을 실행하면 열려요)':errText(e))); }
function filesOf(ev){ var out=[], it=(ev.clipboardData&&ev.clipboardData.files)||[]; for(var i=0;i<it.length;i++) if(/^image\//.test(it[i].type)) out.push(it[i]); return out; }
/* select with the images column, or without it before supabase-ff-images.sql is run */
async function sel(table, cols, build){ var r=await build(sb.from(table).select(IMG?cols+',images':cols)); if(r.error&&IMG&&/images/.test(String(r.error.message||''))){ IMG=false; r=await build(sb.from(table).select(cols)); } return r; }

/* ---- 게시판 ---- */
var bFilter='all', bLimit=20, bOpen=null, bWriting=false, bScroll=false, likes={}, myLikes={}, LIKES=true;
var GOPT='<option value="free">자유</option><option value="stickseum">Stickseum</option><option value="crownenvoy">Crown Envoy</option><option value="beaconfall">Beaconfall</option>';
function gameTag(g){ return g==='free'?'<span class="tag">자유</span>':(GAMES[g]?'<span class="tag '+GAMES[g].cls+'">'+esc(GAMES[g].name)+'</span>':''); }
async function board(){
  var p=$('.cm-p[data-p=board]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-bar"><div class="cm-f"><button data-f="all" class="on">전체</button><button data-f="hot">🔥 인기</button><button data-f="free">자유</button><button data-f="stickseum">Stickseum</button><button data-f="crownenvoy">Crown Envoy</button><button data-f="beaconfall">Beaconfall</button></div><button class="cm-btn cm-new">✏️ 글쓰기</button></div>'+
      '<form class="cm-w" style="display:none"><select name="g">'+GOPT+'</select><input name="t" maxlength="80" placeholder="제목" required><textarea name="b" maxlength="4000" rows="6" placeholder="내용"></textarea><div class="cm-pv"></div><div class="cm-m"></div><div class="cm-acts"><label class="cm-btn2 cm-pick">🖼️ 사진<input type="file" accept="image/*" multiple hidden></label><span class="cm-sp"></span><button type="button" class="cm-btn2 cm-cancel">취소</button><button class="cm-btn">올리기</button></div></form>'+
      '<div class="cm-list"></div><button class="cm-btn2 cm-more" style="display:none">더 보기</button>';
    p.querySelector('.cm-f').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; bFilter=b.getAttribute('data-f'); bLimit=20; [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); listPosts(); };
    p.querySelector('.cm-new').onclick=function(){ if(!me) return login(); var w=p.querySelector('.cm-w'); w.style.display=w.style.display==='none'?'':'none'; if(w.style.display==='') w.t.focus(); };
    p.querySelector('.cm-cancel').onclick=function(){ p.querySelector('.cm-w').style.display='none'; pend=[]; paintPend(); };
    var pick=p.querySelector('.cm-pick input'); pick.onchange=function(){ addPend([].slice.call(this.files||[])); this.value=''; };
    p.querySelector('.cm-w textarea').addEventListener('paste',function(e){ var fs=filesOf(e); if(fs.length){ e.preventDefault(); addPend(fs); } });
    p.querySelector('.cm-more').onclick=function(){ bLimit+=20; listPosts(); };
    p.querySelector('.cm-w').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'); if(!me) return login(); if(bWriting) return;
      var t=f.t.value.trim(), b=f.b.value.trim(); if(!t){ f.t.focus(); return; } if(!b&&!pend.length){ f.b.focus(); return; } bWriting=true; m.textContent='';
      var urls=[]; if(pend.length){ m.textContent='사진 올리는 중...'; try{ for(var i=0;i<pend.length;i++) urls.push(await upload(pend[i].f)); }catch(x){ bWriting=false; m.textContent=imgErr(x); return; } }
      var row={title:t, body:b, game:f.g.value}; if(urls.length) row.images=urls;
      var r=await sb.from('ff_posts').insert(row); bWriting=false;
      if(r.error){ m.textContent=errText(r.error); return; } m.textContent=''; f.reset(); pend=[]; paintPend(); f.style.display='none'; hubSync(); listPosts(); };
  }
  listPosts();
}
var pend=[];
function addPend(fs){ var m=$('.cm-p[data-p=board] .cm-w .cm-m'); fs.forEach(function(f){ if(pend.length>=4){ if(m) m.textContent='사진은 4장까지 넣을 수 있어요.'; return; } if(!/^image\//.test(f.type)) return; pend.push({f:f, u:URL.createObjectURL(f)}); }); paintPend(); }
function paintPend(){ var v=$('.cm-p[data-p=board] .cm-pv'); if(!v) return; v.innerHTML='';
  pend.forEach(function(x,i){ var d=document.createElement('div'); d.className='cm-pi'; d.innerHTML='<img alt=""><button type="button" title="빼기">×</button>'; d.querySelector('img').src=x.u;
    d.querySelector('button').onclick=function(){ URL.revokeObjectURL(x.u); pend.splice(i,1); paintPend(); }; v.appendChild(d); }); }
var PCOLS='id,user_id,game,title,body,created_at';
async function listPosts(){
  var p=$('.cm-p[data-p=board]'), L=p&&p.querySelector('.cm-list'); if(!L||!sb) return;
  var r, more=false, rows, hot=null;
  if(bFilter==='hot'){
    var pr=await sb.rpc('ff_popular',{p_limit:20}); if(pr.error){ L.innerHTML='<div class="cm-e">'+esc(errText(pr.error))+'</div>'; p.querySelector('.cm-more').style.display='none'; return; }
    hot=(pr.data||[]).map(function(x){ return x.post_id; });
    r=hot.length?await sel('ff_posts',PCOLS,function(q){ return q.in('id',hot); }):{data:[]};
    if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
    rows=(r.data||[]).sort(function(a,b){ return hot.indexOf(a.id)-hot.indexOf(b.id); });
  } else {
    r=await sel('ff_posts',PCOLS,function(q){ q=q.order('created_at',{ascending:false}).range(0,bLimit); return bFilter!=='all'?q.eq('game',bFilter):q; }); if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
    rows=r.data||[]; more=rows.length>bLimit; rows=rows.slice(0,bLimit);
  }
  if(bOpen&&!rows.some(function(x){ return x.id===bOpen; })){ var one=await sel('ff_posts',PCOLS,function(q){ return q.eq('id',bOpen).limit(1); }); if(one.data&&one.data[0]) rows.unshift(one.data[0]); }
  rows=rows.filter(function(x){ return !blocked(x.user_id); });
  await loadLikes(rows.map(function(x){ return x.id; }));
  var cnt={}; if(rows.length){ var c=await sb.from('ff_comments').select('post_id').in('post_id',rows.map(function(x){ return x.id; })).limit(2000); ((c&&c.data)||[]).forEach(function(x){ cnt[x.post_id]=(cnt[x.post_id]||0)+1; }); }
  await loadNames(rows.map(function(x){ return x.user_id; }));
  L.innerHTML=rows.length?'':'<div class="cm-e">'+(bFilter==='hot'?'아직 좋아요를 받은 글이 없어요.':'아직 글이 없어요. 첫 글을 써 보세요!')+'</div>';
  rows.forEach(function(x){ var d=document.createElement('div'); d.className='cm-post'+(bOpen===x.id?' open':''); d.dataset.id=x.id;
    d.innerHTML='<div class="cm-ph">'+gameTag(x.game)+'<b class="cm-t" data-notr>'+esc(x.title)+'</b>'+((x.images||[]).length?'<span class="cm-c">🖼️ '+x.images.length+'</span>':'')+(cnt[x.id]?'<span class="cm-c">💬 '+cnt[x.id]+'</span>':'')+(likes[x.id]?'<span class="cm-c cm-lc">👍 '+likes[x.id]+'</span>':'')+'</div>'+
      '<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div><div class="cm-body"></div>';
    d.querySelector('.cm-ph').onclick=function(){ bOpen=bOpen===x.id?null:x.id; d.classList.toggle('open',bOpen===x.id); if(bOpen===x.id) openPost(d,x); };
    L.appendChild(d); if(bOpen===x.id){ openPost(d,x); if(bScroll){ bScroll=false; setTimeout(function(){ d.scrollIntoView({behavior:'smooth',block:'center'}); },60); } } });
  p.querySelector('.cm-more').style.display=more?'':'none';
}
/* ---- 좋아요 (supabase-ff-social.sql) ---- */
async function loadLikes(ids){
  likes={}; myLikes={}; if(!LIKES||!ids.length) return;
  var r=await sb.from('ff_likes').select('post_id,user_id').in('post_id',ids).limit(5000);
  if(r.error){ if(/does not exist|schema cache|PGRST20|42P01/i.test(String(r.error.message||'')+' '+r.error.code)) LIKES=false; return; }
  (r.data||[]).forEach(function(x){ likes[x.post_id]=(likes[x.post_id]||0)+1; if(me&&x.user_id===me.id) myLikes[x.post_id]=1; });
}
function likeBtn(d, x, B){
  var b=document.createElement('button'); b.className='cm-btn2 cm-like'+(myLikes[x.id]?' on':''); b.innerHTML='👍 <span data-notr>'+(likes[x.id]||0)+'</span>';
  b.onclick=async function(){ if(!me) return login(); if(b.disabled) return; b.disabled=true; var on=!myLikes[x.id];
    var r=on?await sb.from('ff_likes').insert({post_id:x.id}):await sb.from('ff_likes').delete().eq('post_id',x.id).eq('user_id',me.id); b.disabled=false;
    if(r.error&&!/duplicate|23505/i.test(String(r.error.message||'')+' '+r.error.code)){ B.querySelector('.cm-m').textContent=errText(r.error); return; }
    if(on){ myLikes[x.id]=1; likes[x.id]=(likes[x.id]||0)+1; hubSync(); } else { delete myLikes[x.id]; likes[x.id]=Math.max(0,(likes[x.id]||1)-1); }
    b.classList.toggle('on',on); b.querySelector('span').textContent=likes[x.id];
    var lc=d.querySelector('.cm-lc'); if(likes[x.id]){ if(!lc){ lc=document.createElement('span'); lc.className='cm-c cm-lc'; d.querySelector('.cm-ph').appendChild(lc); } lc.textContent='👍 '+likes[x.id]; } else if(lc) lc.remove(); };
  return b;
}
function reportBtn(o, cls){ var b=document.createElement('button'); b.className=cls||'cm-btn2'; b.title='신고'; b.textContent=cls?'🚩':'🚩 신고'; b.onclick=function(e){ e.stopPropagation(); report(o); }; return b; }
async function openPost(d, x){
  var B=d.querySelector('.cm-body'); B.innerHTML='<div class="cm-txt" data-notr></div>'+imgsHtml(x.images,'cm-gal')+'<div class="cm-acts2"></div><div class="cm-cms"></div><form class="cm-cf"><input maxlength="1000" placeholder="댓글 달기"><button class="cm-btn">등록</button></form><div class="cm-m"></div>';
  B.querySelector('.cm-txt').textContent=x.body; if(!x.body) B.querySelector('.cm-txt').style.display='none';
  if(LIKES) B.querySelector('.cm-acts2').appendChild(likeBtn(d,x,B));
  if(!me||me.id!==x.user_id) B.querySelector('.cm-acts2').appendChild(reportBtn({kind:'post', id:x.id, user:x.user_id, text:x.title+' / '+x.body}));
  if(me&&(me.id===x.user_id||admin)){ var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='글 삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } var r=await sb.from('ff_posts').delete().eq('id',x.id); if(r.error) B.querySelector('.cm-m').textContent=errText(r.error); else { bOpen=null; listPosts(); } }; B.querySelector('.cm-acts2').appendChild(del); }
  var cf=B.querySelector('.cm-cf'); cf.onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var v=cf.querySelector('input').value.trim(); if(!v) return;
    var r=await sb.from('ff_comments').insert({post_id:x.id, body:v}); if(r.error){ B.querySelector('.cm-m').textContent=errText(r.error); return; } cf.reset(); hubSync(); comments(B,x); };
  comments(B,x);
}
async function comments(B, x){
  var C=B.querySelector('.cm-cms'), r=await sb.from('ff_comments').select('id,user_id,body,created_at').eq('post_id',x.id).order('created_at').limit(300);
  var rows=((r&&r.data)||[]).filter(function(c){ return !blocked(c.user_id); }); await loadNames(rows.map(function(c){ return c.user_id; })); C.innerHTML='';
  rows.forEach(function(c){ var e=document.createElement('div'); e.className='cm-cm'; e.innerHTML='<div class="cm-meta">'+who(c.user_id)+' · <span>'+esc(ago(c.created_at))+'</span></div><div class="cm-ct" data-notr></div>'; e.querySelector('.cm-ct').textContent=c.body;
    if(me&&(me.id===c.user_id||admin)){ var x2=document.createElement('button'); x2.className='cm-x'; x2.title='삭제'; x2.textContent='×'; x2.onclick=async function(){ await sb.from('ff_comments').delete().eq('id',c.id); comments(B,x); }; e.appendChild(x2); }
    else if(me) e.appendChild(reportBtn({kind:'comment', id:c.id, user:c.user_id, text:c.body}, 'cm-x cm-rp'));
    C.appendChild(e); });
}

/* ---- 채팅 (모두가 보는 방 하나, 새 메시지는 바로 보여요) ---- */
var chatRows=[], chatChan=null, chatPoll=null, chatLive=false;
async function chat(){
  var p=$('.cm-p[data-p=chat]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-chat"></div><form class="cm-cf cm-send"><label class="cm-btn2 cm-pick" title="사진 보내기">🖼️<input type="file" accept="image/*" hidden></label><input maxlength="300" placeholder="메시지 보내기" autocomplete="off"><button class="cm-btn">보내기</button></form><div class="cm-m"></div>';
    p.querySelector('.cm-send').onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var i=this.querySelector('input:not([type=file])'), v=i.value.trim(); if(!v) return; i.value='';
      var r=await sb.from('ff_chat').insert({body:v}); var m=p.querySelector('.cm-m'); m.textContent=r.error?errText(r.error):''; if(r.error){ i.value=v; return; } hubSync(); if(!chatLive) pullChat(); };
    var sendImg=async function(file){ if(!me) return login(); var m=p.querySelector('.cm-m'), i=p.querySelector('.cm-send input:not([type=file])'), v=i.value.trim(); m.textContent='사진 올리는 중...';
      var u; try{ u=await upload(file); }catch(x){ m.textContent=imgErr(x); return; }
      var r=await sb.from('ff_chat').insert({body:v, images:[u]}); m.textContent=r.error?errText(r.error):''; if(r.error) return; i.value=''; hubSync(); if(!chatLive) pullChat(); };
    p.querySelector('.cm-send .cm-pick input').onchange=function(){ var f=this.files&&this.files[0]; this.value=''; if(f) sendImg(f); };
    p.querySelector('.cm-send input:not([type=file])').addEventListener('paste',function(e){ var fs=filesOf(e); if(fs.length){ e.preventDefault(); sendImg(fs[0]); } });
  }
  paintSend(); await pullChat(); watchChat();
}
function paintSend(){ var p=$('.cm-p[data-p=chat]'); if(!p) return; var i=p.querySelector('.cm-send input:not([type=file])'); if(i) i.placeholder=me?'메시지 보내기':'로그인하면 채팅할 수 있어요'; }
async function pullChat(){
  if(!sb) return; var r=await sel('ff_chat','id,user_id,body,created_at',function(q){ return q.order('created_at',{ascending:false}).limit(60); });
  var p=$('.cm-p[data-p=chat]'); if(r.error){ p.querySelector('.cm-chat').innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  chatRows=(r.data||[]).reverse(); await loadNames(chatRows.map(function(x){ return x.user_id; })); paintChat();
}
function paintChat(){
  var box=$('.cm-p[data-p=chat] .cm-chat'); if(!box) return; var stick=box.scrollHeight-box.scrollTop-box.clientHeight<60;
  var vis=chatRows.filter(function(x){ return !blocked(x.user_id); });
  box.innerHTML=vis.length?'':'<div class="cm-e">아직 메시지가 없어요. 먼저 인사해 보세요!</div>';
  vis.forEach(function(x){ var d=document.createElement('div'); d.className='cm-msg'+(me&&x.user_id===me.id?' mine':'');
    d.innerHTML='<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div><div class="cm-bub" data-notr></div>'; var bub=d.querySelector('.cm-bub'); bub.textContent=x.body;
    var ih=imgsHtml(x.images,'cm-cimg'); if(ih){ bub.insertAdjacentHTML('beforeend',ih); if(!x.body) bub.classList.add('only'); [].forEach.call(bub.querySelectorAll('img'),function(im){ im.onload=function(){ if(box.dataset.stick==='1') box.scrollTop=box.scrollHeight; }; }); }
    if(me&&(me.id===x.user_id||admin)){ var b=document.createElement('button'); b.className='cm-x'; b.title='삭제'; b.textContent='×'; b.onclick=async function(){ await sb.from('ff_chat').delete().eq('id',x.id); chatRows=chatRows.filter(function(y){ return y.id!==x.id; }); paintChat(); }; d.appendChild(b); }
    else if(me) d.appendChild(reportBtn({kind:'chat', id:x.id, user:x.user_id, text:x.body}, 'cm-x cm-rp'));
    box.appendChild(d); });
  if(stick||!box.dataset.once){ box.dataset.once=1; box.scrollTop=box.scrollHeight; }
  box.dataset.stick=(stick||box.scrollHeight-box.scrollTop-box.clientHeight<60)?'1':'0';
  if(!box.dataset.sl){ box.dataset.sl=1; box.addEventListener('scroll',function(){ box.dataset.stick=box.scrollHeight-box.scrollTop-box.clientHeight<60?'1':'0'; }); }
}
function watchChat(){
  if(chatChan||!sb) return;
  try{ chatChan=sb.channel('ff-hub-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'ff_chat'},async function(pl){ var x=pl&&pl.new; if(!x||chatRows.some(function(y){ return y.id===x.id; })) return; await loadNames([x.user_id]); chatRows.push(x); if(chatRows.length>200) chatRows.shift(); paintChat(); })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'ff_chat'},function(pl){ var id=pl&&pl.old&&pl.old.id; if(id){ chatRows=chatRows.filter(function(y){ return y.id!==id; }); paintChat(); } })
      .subscribe(function(st){ chatLive=st==='SUBSCRIBED'; }); }catch(e){}
  chatPoll=setInterval(function(){ if(tab==='chat'&&!chatLive&&document.visibilityState!=='hidden') pullChat(); }, 8000);     // if live updates are not available
}

/* ===================== 랭킹: 이번 주 인기 게임 (ff_week_games) · 게임별 점수 순위 (ff_rank) ===================== */
var rkGame='crownenvoy';
async function weekGames(){
  var box=$('#weekList'); if(!box||!sb) return;
  var r=await sb.rpc('ff_week_games'); if(r.error){ box.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=(r.data||[]).filter(function(x){ return GAMES[x.game]; }).sort(function(a,b){ return (b.players-a.players)||(b.last_week-a.last_week); });
  var top=Math.max(1,Math.max.apply(null,rows.map(function(x){ return x.players; }).concat([0])));
  box.innerHTML=rows.map(function(x,i){ var G=GAMES[x.game], diff=x.players-(x.last_week||0);
    return '<div class="wk '+G.cls+'"><span class="no">'+(i+1)+'</span><span class="gn">'+esc(G.name)+'</span><span class="pc">'+esc(F('{0}명',x.players))+
      (diff?'<small class="'+(diff>0?'up':'dn')+'">'+(diff>0?'▲ ':'▼ ')+Math.abs(diff)+'</small>':'<small>–</small>')+'</span><span class="bar"><u style="width:'+(100*x.players/top).toFixed(1)+'%"></u></span></div>'; }).join('')||'<div class="cm-e">아직 기록이 없어요.</div>';
}
async function ranking(){
  var box=$('#rankList'); if(!box||!sb) return; var g=rkGame;
  var r=await sb.from('ff_rank').select('user_id,points,wins,games').eq('game',g).order('points',{ascending:false}).order('wins',{ascending:false}).limit(20);
  if(g!==rkGame) return;
  if(r.error){ box.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=r.data||[]; await loadNames(rows.map(function(x){ return x.user_id; }));
  if(!rows.length){ box.innerHTML='<div class="cm-e">'+(g==='crownenvoy'?'아직 순위가 없어요. 게임을 끝내면 점수가 쌓여요.':'이 게임은 아직 랭킹에 점수를 보내지 않아요.')+'</div>'; return; }
  var h='<table class="rkt"><tr><th></th><th>닉네임</th><th>점수</th><th>승리</th><th>판</th></tr>';
  rows.forEach(function(x,i){ h+='<tr class="'+(i<3?'t'+(i+1):'')+(me&&x.user_id===me.id?' me':'')+'"><td>'+(i<3?['🥇','🥈','🥉'][i]:i+1)+'</td><td>'+who(x.user_id)+'</td><td class="pt" data-notr>'+x.points+'</td><td data-notr>'+x.wins+'</td><td data-notr>'+x.games+'</td></tr>'; });
  h+='</table>';
  if(me&&!rows.some(function(x){ return x.user_id===me.id; })){
    var mine=await sb.from('ff_rank').select('points').eq('game',g).eq('user_id',me.id).limit(1), mp=mine&&mine.data&&mine.data[0];
    if(mp){ var above=await sb.from('ff_rank').select('user_id',{count:'exact',head:true}).eq('game',g).gt('points',mp.points); if(above&&above.count!=null) h+='<div class="rk-me">'+esc(F('내 순위: {0}위 · {1}점',above.count+1,mp.points))+'</div>'; }
  }
  box.innerHTML=h;
}

/* ---- 스크린샷 갤러리: 게임 글에 올라온 사진만 모아서 (누르면 그 글이 열려요) ---- */
var gFilter='all';
async function gallery(){
  var p=$('.cm-p[data-p=gal]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-bar"><div class="cm-f"><button data-f="all" class="on">전체</button><button data-f="stickseum">Stickseum</button><button data-f="crownenvoy">Crown Envoy</button><button data-f="beaconfall">Beaconfall</button></div></div><p class="cm-note">게임 글에 올라온 사진만 모았어요. 사진을 누르면 그 글이 열려요.</p><div class="gl"></div>';
    p.querySelector('.cm-f').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; gFilter=b.getAttribute('data-f'); [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); gallery(); };
  }
  var G=p.querySelector('.gl'); if(!sb) return;
  if(!IMG){ G.innerHTML='<div class="cm-e">'+esc(errText({message:'does not exist'}))+'</div>'; return; }
  var q=sb.from('ff_posts').select('id,user_id,game,title,images,created_at').neq('images','{}'), gf=gFilter;
  q=gf==='all'?q.neq('game','free'):q.eq('game',gf); var r=await q.order('created_at',{ascending:false}).limit(60); if(gf!==gFilter) return;
  if(r.error){ G.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var tiles=[]; (r.data||[]).filter(function(x){ return !blocked(x.user_id); }).forEach(function(x){ (x.images||[]).filter(okImg).forEach(function(u){ tiles.push({x:x,u:u}); }); });
  G.innerHTML=tiles.length?'':'<div class="cm-e">아직 올라온 게임 사진이 없어요. 게시판에 게임 사진을 올려 보세요!</div>';
  tiles.slice(0,120).forEach(function(t){ var a=document.createElement('a'); a.innerHTML='<img alt="" loading="lazy"><span class="cap">'+gameTag(t.x.game)+'<b data-notr></b></span>'; a.querySelector('img').src=t.u; a.querySelector('b').textContent=t.x.title;
    a.onclick=function(e){ e.preventDefault(); openPostById(t.x.id); scrollToCm(); }; G.appendChild(a); });
}

/* ---- 투표 (관리자가 올리고, 한 사람 한 표. 다시 누르면 바꿀 수 있어요) ---- */
async function polls(){
  var p=$('.cm-p[data-p=poll]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1'; p.innerHTML='<div class="pls"></div><div class="cm-pa"></div>'; }
  var Lst=p.querySelector('.pls'), A=p.querySelector('.cm-pa'); if(!sb) return;
  var r=await sb.from('ff_polls').select('*').order('created_at',{ascending:false}).limit(admin?30:10);
  if(r.error){ Lst.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; A.innerHTML=''; return; }
  var rows=(r.data||[]).filter(function(x){ return admin||x.active; }), ids=rows.map(function(x){ return x.id; }), cnt={}, mine={};
  if(ids.length){ var c=await sb.rpc('ff_poll_counts',{p_ids:ids}); ((c&&c.data)||[]).forEach(function(x){ (cnt[x.poll_id]=cnt[x.poll_id]||{})[x.choice]=x.votes; });
    if(me){ var v=await sb.from('ff_votes').select('poll_id,choice').eq('user_id',me.id).in('poll_id',ids); ((v&&v.data)||[]).forEach(function(x){ mine[x.poll_id]=x.choice; }); } }
  Lst.innerHTML=rows.length?'':'<div class="cm-e">지금 진행 중인 투표가 없어요.</div>';
  rows.forEach(function(x){ var C=cnt[x.id]||{}, tot=0, open=x.active&&(!x.ends_at||Date.parse(x.ends_at)>Date.now()), my=mine.hasOwnProperty(x.id)?mine[x.id]:null, show=my!=null||!open||admin;
    x.options.forEach(function(o,i){ tot+=C[i]||0; });
    var d=document.createElement('div'); d.className='pl'+(open?'':' closed');
    d.innerHTML='<h4 data-notr></h4><div class="cm-meta">'+esc(F('{0}명 참여',tot))+(x.ends_at?' · <span>'+esc(open?F('{0}까지',String(x.ends_at).slice(5,10).replace('-','/')):'마감')+'</span>':(open?'':' · <span>마감</span>'))+(my==null&&open?' · <span>눌러서 투표하세요</span>':'')+'</div>';
    d.querySelector('h4').textContent=x.question;
    x.options.forEach(function(o,i){ var n=C[i]||0, pc=tot?Math.round(100*n/tot):0, b=document.createElement('button'); b.type='button'; b.className='po'+(my===i?' mine':''); b.disabled=!open;
      b.innerHTML=(show?'<i class="fill" style="width:'+pc+'%"></i>':'')+'<span data-notr></span>'+(show?'<span class="pv" data-notr>'+pc+'% · '+n+'</span>':''); b.querySelector('span').textContent=(my===i?'✓ ':'')+o;
      b.onclick=async function(){ if(!me) return login(); if(my===i) return; b.disabled=true; var q=await sb.rpc('ff_vote',{p_poll:x.id, p_choice:i}); if(q.error){ b.disabled=false; d.querySelector('.cm-meta').textContent=errText(q.error); return; } hubSync(); polls(); };
      d.appendChild(b); });
    if(admin){ var ac=document.createElement('div'); ac.className='cm-acts2';
      var t=document.createElement('button'); t.className='cm-btn2'; t.textContent=x.active?'마감하기':'다시 열기'; t.onclick=async function(){ await sb.from('ff_polls').update({active:!x.active}).eq('id',x.id); polls(); };
      var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } await sb.from('ff_polls').delete().eq('id',x.id); polls(); };
      ac.appendChild(t); ac.appendChild(del); d.appendChild(ac); }
    Lst.appendChild(d); });
  if(!admin){ A.innerHTML=''; return; }
  if(!A.dataset.ready){ A.dataset.ready='1';
    A.innerHTML='<h4 class="cm-ph4">📊 투표 올리기 (관리자)</h4><form class="cm-w"><input name="q" maxlength="200" placeholder="질문" required><textarea name="o" rows="4" placeholder="보기를 한 줄에 하나씩 (2~6개)"></textarea><input name="e" type="date" title="끝나는 날 (비우면 계속)"><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">올리기</button></div></form>';
    A.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'), q=f.q.value.trim(), o=f.o.value.split('\n').map(function(x){ return x.trim().slice(0,80); }).filter(Boolean);
      if(!q) return; if(o.length<2||o.length>6){ m.textContent='보기는 2~6개로 적어 주세요.'; return; }
      var r2=await sb.from('ff_polls').insert({question:q, options:o, ends_at:f.e.value?new Date(f.e.value+'T23:59:59').toISOString():null}); if(r2.error){ m.textContent=errText(r2.error); return; }
      f.reset(); m.textContent='올렸어요.'; polls(); };
  }
}

/* ---- 방 모집: "지금 같이 할 사람" (2시간 동안 보여요, supabase-ff-more.sql) ---- */
var lfgChan=null, lfgTimer=null;
async function lfg(){
  var p=$('.cm-p[data-p=lfg]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<p class="cm-note">같이 할 사람을 찾아요. 방 링크를 붙이면 누르는 사람이 바로 그 방으로 들어가요. 2시간이 지나면 사라져요.</p>'+
      '<form class="cm-w lf-w"><div class="cm-row"><select name="g"><option value="stickseum">Stickseum</option><option value="crownenvoy">Crown Envoy</option><option value="beaconfall">Beaconfall</option></select></div>'+
      '<input name="n" maxlength="100" placeholder="예: 팀전 2명 더 구해요!" required><input name="l" maxlength="300" placeholder="방 링크 (https://..., 선택)"><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">🎮 모집 올리기</button></div></form><div class="lf-list"></div>';
    p.querySelector('.lf-w').onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var f=this, m=f.querySelector('.cm-m'), n=f.n.value.trim(), l=f.l.value.trim(); if(!n) return;
      if(l&&!/^https:\/\//.test(l)){ m.textContent='링크는 https:// 로 시작해야 해요.'; return; }
      var r=await sb.from('ff_lfg').insert({game:f.g.value, note:n, link:l||null}); if(r.error){ m.textContent=errText(r.error); return; } f.n.value=''; f.l.value=''; m.textContent=''; hubSync(); lfgList(); };
    if(sb&&!lfgChan) try{ lfgChan=sb.channel('ff-hub-lfg').on('postgres_changes',{event:'*',schema:'public',table:'ff_lfg'},function(){ if(tab==='lfg') lfgList(); }).subscribe(); }catch(e){}
    lfgTimer=setInterval(function(){ if(tab==='lfg'&&document.visibilityState!=='hidden') lfgList(); }, 60000);
  }
  lfgList();
}
async function lfgList(){
  var L=$('.cm-p[data-p=lfg] .lf-list'); if(!L||!sb) return;
  var r=await sb.from('ff_lfg').select('*').gt('created_at',new Date(Date.now()-2*3600e3).toISOString()).order('created_at',{ascending:false}).limit(50);
  if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=(r.data||[]).filter(function(x){ return !blocked(x.user_id); }); await loadNames(rows.map(function(x){ return x.user_id; }));
  L.innerHTML=rows.length?'':'<div class="cm-e">지금 모집 중인 방이 없어요. 먼저 올려 보세요!</div>';
  rows.forEach(function(x){ var G=GAMES[x.game], d=document.createElement('div'); d.className='lf';
    d.innerHTML='<div class="lf-h">'+gameTag(x.game)+'<span class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></span></div><div class="lf-n" data-notr></div><div class="cm-acts2"></div>';
    d.querySelector('.lf-n').textContent=x.note;
    var a=document.createElement('a'); a.className='cm-btn lf-go'; a.target='_blank'; a.rel='noopener'; a.href=x.link&&/^https:\/\//.test(x.link)?x.link:(G?G.site:'#'); a.textContent=x.link?'🚪 참가하기':'🎮 게임 열기'; d.querySelector('.cm-acts2').appendChild(a);
    if(me&&(me.id===x.user_id||admin)){ var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='내리기'; del.onclick=async function(){ await sb.from('ff_lfg').delete().eq('id',x.id); lfgList(); }; d.querySelector('.cm-acts2').appendChild(del); }
    else if(me) d.querySelector('.cm-acts2').appendChild(reportBtn({kind:'user', user:x.user_id, text:x.note}));
    L.appendChild(d); });
}

/* ===================== 게임 평점 · 한줄평 (게임 소개 칸의 ★ 버튼, supabase-ff-more.sql) ===================== */
var RCLS={stickseum:'st',crownenvoy:'ce',beaconfall:'bf'}, rsum={};
function stars(n){ var f=Math.round(n||0), o=''; for(var i=1;i<=5;i++) o+=i<=f?'★':'☆'; return o; }
async function ratings(){
  Object.keys(RCLS).forEach(function(g){ var acts=document.querySelector('.game.'+RCLS[g]+' .acts'); if(!acts||acts.querySelector('.rate')) return;
    var b=document.createElement('button'); b.type='button'; b.className='sub rate'; b.innerHTML='<span class="rs">☆☆☆☆☆</span> <span class="rn" data-notr></span>'; b.onclick=function(){ openRate(g); }; acts.appendChild(b); });
  if(!sb) return; var r=await sb.rpc('ff_rating_summary'); rsum={}; ((r&&!r.error&&r.data)||[]).forEach(function(x){ rsum[x.game]=x; });
  Object.keys(RCLS).forEach(function(g){ var b=document.querySelector('.game.'+RCLS[g]+' .rate'); if(!b) return; var x=rsum[g];
    b.querySelector('.rs').textContent=x?stars(x.avg):'☆☆☆☆☆'; b.querySelector('.rn').textContent=x?(Number(x.avg).toFixed(1)+' ('+x.votes+')'):''; b.title=r&&r.error?errText(r.error):''; });
}
async function openRate(g){
  var el=$('#rateBox'); if(!el){ el=document.createElement('div'); el.id='rateBox'; el.className='hn-bg'; document.body.appendChild(el); el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')) el.style.display='none'; }); }
  var G=GAMES[g], x=rsum[g];
  el.innerHTML='<div class="hn-b"><div class="hn-h"><b data-notr>'+esc(G.name)+'</b><button type="button" class="hn-x" aria-label="닫기">×</button></div>'+
    '<div class="rt-sum"><span class="rt-big" data-notr>'+(x?Number(x.avg).toFixed(1):'–')+'</span><span class="rt-st" data-notr>'+stars(x&&x.avg)+'</span><span class="cm-meta">'+esc(F('{0}명이 평가했어요',x?x.votes:0))+'</span></div>'+
    '<form class="cm-w rt-w"><div class="rt-pick">'+[1,2,3,4,5].map(function(n){ return '<button type="button" data-s="'+n+'">☆</button>'; }).join('')+'</div><input name="v" maxlength="100" placeholder="한줄평 (100자까지, 선택)"><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">평가 남기기</button></div></form><div class="rt-list"></div></div>';
  el.style.display='flex';
  var pick=0, f=el.querySelector('.rt-w'), bs=f.querySelectorAll('[data-s]');
  function paint(){ [].forEach.call(bs,function(b){ var n=+b.getAttribute('data-s'); b.textContent=n<=pick?'★':'☆'; b.classList.toggle('on',n<=pick); }); }
  [].forEach.call(bs,function(b){ b.onclick=function(){ pick=+b.getAttribute('data-s'); paint(); }; });
  if(me){ var mine=await sb.from('ff_ratings').select('stars,review').eq('game',g).eq('user_id',me.id).limit(1); var m0=mine&&mine.data&&mine.data[0]; if(m0){ pick=m0.stars; f.v.value=m0.review||''; paint(); } }
  f.onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var m=f.querySelector('.cm-m'); if(!pick){ m.textContent='별을 눌러 점수를 골라 주세요.'; return; }
    var r=await sb.from('ff_ratings').upsert({game:g, user_id:me.id, stars:pick, review:f.v.value.trim().slice(0,100), updated_at:new Date().toISOString()});
    if(r.error){ m.textContent=errText(r.error); return; } m.textContent='고마워요!'; hubSync(); await ratings(); openRate(g); };
  var L=el.querySelector('.rt-list'), r=await sb.from('ff_ratings').select('user_id,stars,review,updated_at').eq('game',g).order('updated_at',{ascending:false}).limit(30);
  if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=(r.data||[]).filter(function(y){ return !blocked(y.user_id); }); await loadNames(rows.map(function(y){ return y.user_id; }));
  L.innerHTML=rows.length?'':'<div class="cm-e">아직 평가가 없어요. 첫 평가를 남겨 보세요!</div>';
  rows.forEach(function(y){ var d=document.createElement('div'); d.className='cm-cm'; d.innerHTML='<div class="cm-meta"><span class="rt-st" data-notr>'+stars(y.stars)+'</span> '+who(y.user_id)+' · <span>'+esc(ago(y.updated_at))+'</span></div><div class="cm-ct" data-notr></div>'; d.querySelector('.cm-ct').textContent=y.review||''; if(!y.review) d.querySelector('.cm-ct').remove();
    if(admin&&(!me||me.id!==y.user_id)){ var x2=document.createElement('button'); x2.className='cm-x'; x2.title='삭제'; x2.textContent='×'; x2.onclick=async function(){ await sb.from('ff_ratings').delete().eq('game',g).eq('user_id',y.user_id); await ratings(); openRate(g); }; d.appendChild(x2); }
    L.appendChild(d); });
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
      '<div class="cm-mine"></div><div class="cm-admin"></div><div class="cm-reps"></div><div class="cm-ann"></div>';
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
  repList(); annAdmin();
}
/* ---- 신고 목록 (관리자) ---- */
var RK={post:'글',comment:'댓글',chat:'채팅',user:'사람'};
async function repList(){
  var P=$('.cm-p[data-p=fb] .cm-reps'); if(!P) return; P.innerHTML=''; if(!admin) return;
  var r=await sb.from('ff_reports').select('*').order('done').order('created_at',{ascending:false}).limit(200); if(r.error){ P.innerHTML='<h4>받은 신고 (관리자)</h4><div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var all=r.data||[]; await loadNames([].concat(all.map(function(x){ return x.user_id; }),all.map(function(x){ return x.target_user; })));
  P.innerHTML='<h4>받은 신고 (관리자) · '+all.filter(function(x){ return !x.done; }).length+'</h4>'+(all.length?'':'<div class="cm-e">아직 없어요.</div>');
  all.forEach(function(x){ var d=document.createElement('div'); d.className='cm-fbi'+(x.done?' done':'');
    d.innerHTML='<div class="cm-meta"><b>🚩 '+esc(RK[x.kind]||x.kind)+'</b> · <span>'+esc(ago(x.created_at))+'</span> · '+who(x.user_id)+' → '+(x.target_user?who(x.target_user):'?')+(x.done?' · <span class="ok">✅ 처리함</span>':'')+'</div><div class="cm-ct" data-notr></div><div class="cm-meta" data-notr></div>';
    d.querySelector('.cm-ct').textContent=x.reason; d.querySelectorAll('.cm-meta')[1].textContent=x.snapshot||'';
    var a=document.createElement('div'); a.className='cm-acts2';
    var t=document.createElement('button'); t.className='cm-btn2'; t.textContent=x.done?'처리 취소':'처리함'; t.onclick=async function(){ await sb.from('ff_reports').update({done:!x.done}).eq('id',x.id); repList(); };
    a.appendChild(t);
    var tbl={post:'ff_posts',comment:'ff_comments',chat:'ff_chat'}[x.kind];
    if(tbl&&x.target_id){ var dl=document.createElement('button'); dl.className='cm-btn2'; dl.textContent=RK[x.kind]+' 지우기'; dl.onclick=async function(){ if(!dl.dataset.s){ dl.dataset.s=1; dl.textContent='정말 지울까요?'; return; } var q=await sb.from(tbl).delete().eq('id',x.target_id); dl.textContent=q.error?errText(q.error):'지웠어요'; dl.disabled=true; }; a.appendChild(dl); }
    var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } await sb.from('ff_reports').delete().eq('id',x.id); repList(); };
    a.appendChild(del); d.appendChild(a); P.appendChild(d); });
}
/* ---- 공지 · 이벤트 올리기 (관리자) ---- */
function annAdmin(){
  var P=$('.cm-p[data-p=fb] .cm-ann'); if(!P) return; if(!admin){ P.innerHTML=''; return; }
  if(!P.dataset.ready){ P.dataset.ready='1';
    P.innerHTML='<h4>📢 공지 · 이벤트 올리기 (관리자)</h4><form class="cm-w"><div class="cm-row"><select name="k"><option value="notice">📢 공지</option><option value="event">🎉 이벤트</option></select><input name="e" type="date" title="끝나는 날 (비우면 계속)"></div>'+
      '<input name="b" maxlength="300" placeholder="허브 맨 위에 보일 내용" required><input name="l" maxlength="300" placeholder="링크 (https://..., 선택)"><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">올리기</button></div></form><div class="cm-al"></div>';
    P.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'), b=f.b.value.trim(), l=f.l.value.trim(); if(!b) return;
      if(l&&!/^https:\/\//.test(l)){ m.textContent='링크는 https:// 로 시작해야 해요.'; return; }
      var row={kind:f.k.value, body:b, link:l||null, ends_at:f.e.value?new Date(f.e.value+'T23:59:59').toISOString():null};
      var r=await sb.from('ff_announce').insert(row); if(r.error){ m.textContent=errText(r.error); return; } f.reset(); m.textContent='올렸어요.'; loadAnn(); };
  }
  var Lst=P.querySelector('.cm-al'); Lst.innerHTML='';
  anns.forEach(function(a){ var d=document.createElement('div'); d.className='cm-fbi'+(annLive(a)?'':' done');
    d.innerHTML='<div class="cm-meta"><b>'+(a.kind==='event'?'🎉 이벤트':'📢 공지')+'</b> · <span>'+esc(ago(a.created_at))+'</span>'+(a.ends_at?' · <span data-notr>~'+esc(String(a.ends_at).slice(0,10))+'</span>':'')+(annLive(a)?' · <span class="ok">보이는 중</span>':'')+'</div><div class="cm-ct" data-notr></div>';
    d.querySelector('.cm-ct').textContent=a.body+(a.link?'  '+a.link:'');
    var ac=document.createElement('div'); ac.className='cm-acts2';
    var t=document.createElement('button'); t.className='cm-btn2'; t.textContent=a.active?'내리기':'다시 올리기'; t.onclick=async function(){ await sb.from('ff_announce').update({active:!a.active}).eq('id',a.id); loadAnn(); };
    var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } await sb.from('ff_announce').delete().eq('id',a.id); loadAnn(); };
    ac.appendChild(t); ac.appendChild(del); d.appendChild(ac); Lst.appendChild(d); });
}

/* ---- 시작 ---- */
async function refreshUser(){
  me=window.FFAuth&&FFAuth.user&&FFAuth.user(); admin=false;
  if(me&&sb){ try{ var r=await sb.rpc('ff_is_admin'); admin=!!(r&&r.data===true); }catch(e){} }
  paintSend(); setTab(tab); loadAnn(); weekGames(); ranking(); ratings();
}
/* 다른 페이지 · 알림에서 열기: ?post=글번호 , #feedback , #hubnotes */
function openPostById(id){ id=+id; if(!id) return; bOpen=id; bScroll=true; if(tab!=='board') setTab('board'); else listPosts(); }
window.FFHub={ openPost:function(id){ openPostById(id); scrollToCm(); }, tab:function(t){ setTab(t); scrollToCm(); } };
function fromUrl(){
  var m=/[?&]post=(\d+)/.exec(location.search); if(m){ bOpen=+m[1]; bScroll=true; tab='board'; try{ history.replaceState(null,'',location.pathname+'#community'); }catch(e){} }
  if(location.hash==='#feedback') tab='fb'; else if(location.hash==='#lfg') tab='lfg'; else if(location.hash==='#gallery') tab='gal'; else if(location.hash==='#poll') tab='poll';
}
window.addEventListener('hashchange',function(){ if(location.hash==='#hubnotes') openHubNotes(); else if(location.hash==='#feedback'){ setTab('fb'); scrollToCm(); } });
function start(){
  fromUrl(); loadNews().then(function(){ if(location.hash==='#hubnotes') openHubNotes(); });
  if(tab==='fb'){ setTimeout(scrollToCm,300); } var hb=$('#hubNotesBtn'); if(hb) hb.onclick=function(e){ e.preventDefault(); openHubNotes(); };
  var rf=$('.rk-f'); if(rf) rf.onclick=function(e){ var b=e.target.closest('button'); if(!b) return; rkGame=b.getAttribute('data-g'); [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); ranking(); };
  var tabs=$('.cm-tabs'); if(tabs) tabs.onclick=function(e){ var b=e.target.closest('button'); if(b) setTab(b.getAttribute('data-t')); };
  var go=function(){ if(!window.FFAuth){ setTimeout(go,200); return; } FFAuth.ready.then(function(){ sb=client(); refreshUser(); FFAuth.onChange(function(){ setTimeout(refreshUser,50); }); }); };
  go();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

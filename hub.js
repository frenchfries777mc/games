/* Frenchfries777 허브: 커뮤니티(게시판 · 채팅 · 피드백/버그 신고)와 아래쪽 뉴스(세 게임의 패치노트)
   글자는 한국어로 쓰고, 허브의 번역 스크립트(<script id="i18n">)가 다른 언어로 바꿔요. 사람들이 쓴 글은 data-notr 로 번역하지 않아요.
   필요한 SQL: supabase-ff-hub.sql, supabase-ff-images.sql, supabase-ff-social.sql, supabase-ff-extra.sql, supabase-ff-more.sql, supabase-ff-react.sql, supabase-ff-coin.sql, supabase-ff-wiki.sql, supabase-ff-follow.sql (+ crownenvoy/supabase-ff-rank.sql) */
(function(){
'use strict';
var SI=window.SI18N||{lang:'ko',F:function(t){ var a=arguments; return String(t).replace(/\{(\d)\}/g,function(_,n){ return a[+n+1]; }); }};
var LANG=SI.lang||'ko', F=SI.F;
var GAMES={stickseum:{name:'Stickseum',cls:'g1',site:'https://frenchfries777mc.github.io/games/stickseum/'},crownenvoy:{name:'Crown Envoy',cls:'g2',site:'https://frenchfries777mc.github.io/games/crownenvoy/'},beaconfall:{name:'Beaconfall',cls:'g3',site:'https://frenchfries777mc.github.io/games/beaconfall/'},dummyparty:{name:'Dummy Party',cls:'',site:'https://frenchfries777mc.github.io/games/prototypes/dummyparty/'}};
function $(s,r){ return (r||document).querySelector(s); }
/* 허브 첫 페이지와 커뮤니티 페이지(community/)가 같은 파일을 써요. ROOT = 허브 맨 위 경로 */
var CMP=!!document.getElementById('community'), ROOT=document.body.getAttribute('data-root')||'', CMURL=CMP?'':ROOT+'community/';
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function ago(iso){ var t=Date.parse(iso); if(!t) return ''; var m=Math.round((Date.now()-t)/60000);
  if(m<1) return '방금'; if(m<60) return F('{0}분 전',m); if(m<1440) return F('{0}시간 전',Math.round(m/60)); if(m<1440*7) return F('{0}일 전',Math.round(m/1440));
  return new Date(t).toISOString().slice(0,10); }

/* ===================== 뉴스: 세 게임과 허브의 패치노트 중 가장 최근 6개 ===================== */
var NEWS_N=6, news=[], hubNotes=[], notesBy={};
var NSRC={hub:{name:'허브',cls:'g0',site:'./'},stickseum:GAMES.stickseum,crownenvoy:GAMES.crownenvoy,beaconfall:GAMES.beaconfall};
var NEWL=['zh','pt','ru','tr','nw'].indexOf(LANG)>=0;   /* the newer languages fall back to English, not Korean */
function trNote(n, N){
  if(LANG==='ko') return {title:n.title, items:n.items||[]};
  if(NEWL&&n.tr&&!n.tr[LANG]&&n.tr.en) return {title:n.tr.en.title||n.title, items:n.tr.en.items||n.items||[]};
  if(n.tr&&n.tr[LANG]) return {title:n.tr[LANG].title||n.title, items:n.tr[LANG].items||n.items||[]};
  if(N){ var b=String(n.build||''), k=[b, b.replace(/^v/,''), 'v'+b.replace(/^v/,'')], e=null; for(var i=0;i<k.length&&!e;i++) e=N[k[i]];
    if(e) return {title:(e.title&&(e.title[LANG]||NEWL&&e.title.en))||n.title, items:(n.items||[]).map(function(x,j){ var it=e.items&&e.items[j]; return (it&&(it[LANG]||NEWL&&it.en))||x; })}; }
  return {title:n.title, items:n.items||[]};
}
function siteDict(g){ return fetch(GAMES[g].site+'i18n.js',{cache:'no-cache'}).then(function(r){ return r.ok?r.text():''; }).then(function(t){
  if(!t) return null; try{ var w={}; new Function('window',t)(w); return (w.I18N&&w.I18N.N)||null; }catch(e){ return null; } },function(){ return null; }); }
function loadNews(){
  var box=$('#newsList'); if(!box) return Promise.resolve();
  return Promise.all(Object.keys(NSRC).map(function(g){
    return Promise.all([fetch(NSRC[g].site+'patchnotes.json',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; },function(){ return null; }), LANG==='ko'||!GAMES[g]||g==='stickseum'?null:siteDict(g)])
      .then(function(x){ var d=x[0]; return ((d&&d.notes)||[]).map(function(n,i){ var t=trNote(n,x[1]); return {g:g, i:i, date:n.date||'', build:n.build||'', title:t.title, items:t.items, key:(n.date||'')+'|'+(n.build||'')+'|'+(n.title||'')}; }); });
  })).then(function(all){ hubNotes=all[0]; all.forEach(function(l){ if(l[0]) notesBy[l[0].g]=l.map(function(n){ return n.key; }); }); news=[].concat.apply([],all).sort(function(a,b){ return (b.date>a.date?1:b.date<a.date?-1:0)||(a.i-b.i); }); paintNews(); paintFollow(); });
}
function paintNews(){
  var box=$('#newsList'); if(!box) return;
  if(!news.length){ box.innerHTML='<div class="cm-e">아직 소식이 없어요.</div>'; return; }
  box.innerHTML=news.slice(0,NEWS_N).map(function(n){ var G=NSRC[n.g], it=n.items.slice(0,4);
    return '<article class="nw '+G.cls+'"><div class="nh"><span class="ng">'+esc(G.name)+'</span>'+(isNew(n)?'<span class="nnew">'+esc(F('새 패치노트'))+'</span>':'')+'<span class="nd" data-notr>'+esc(n.date)+(n.build?' · '+esc(n.build):'')+'</span></div>'+
      '<h3 data-notr>'+esc(n.title)+'</h3><ul data-notr>'+it.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'+
      (n.items.length>4?'<div class="nmore">'+esc(F('외 {0}개',n.items.length-4))+'</div>':'')+
      (n.g==='hub'?'<a class="nl" href="#hubnotes">패치노트 전체 보기 →</a>':'<a class="nl" href="'+G.site+'#notes">패치노트 전체 보기 →</a>')+'</article>'; }).join('');
}

/* ---- 게임별 소식 받기: 구독한 게임에 새 패치노트가 올라오면 뉴스에 표시 (supabase-ff-follow.sql) ---- */
var FOLLOW_G=['stickseum','crownenvoy','beaconfall'], follows={}, followOK=true;
function unseenN(g){ if(follows[g]===undefined||!follows[g]) return 0; var l=notesBy[g]||[]; for(var i=0;i<l.length;i++) if(l[i]===follows[g]) return i; return 0; }
function isNew(n){ return follows[n.g]!==undefined&&n.i<unseenN(n.g); }
async function loadFollows(){
  follows={}; followOK=true;
  if(me&&sb){ try{ var r=await sb.from('ff_follow').select('game,seen'); if(r.error) followOK=false; else (r.data||[]).forEach(function(x){ follows[x.game]=x.seen||''; }); }catch(e){ followOK=false; } }
  paintFollow(); paintNews();
}
function paintFollow(){
  var box=$('#followBar'); if(!box) return;
  if(!followOK){ box.innerHTML=''; return; }
  if(!me){ box.innerHTML='<span>'+esc(F('로그인하면 게임별로 새 패치노트를 알려 줘요.'))+'</span>'; return; }
  var total=0;
  box.innerHTML=FOLLOW_G.map(function(g){ var G=GAMES[g], on=follows[g]!==undefined, n=on?unseenN(g):0; total+=n;
    return '<button type="button" class="fchip'+(on?' on':'')+'" data-g="'+g+'">'+esc(G.name)+' 🔔 '+esc(F(on?'받는 중':'소식 받기'))+(n?'<i class="fnb">'+n+'</i>':'')+'</button>'; }).join('')+
    (total?'<div class="fmsg">'+esc(F('구독한 게임에 새 소식 {0}개가 있어요.',total))+'<a data-a="seen">'+esc(F('읽음으로 표시'))+'</a></div>':'');
  [].forEach.call(box.querySelectorAll('.fchip'),function(b){ b.onclick=function(){ toggleFollow(b.getAttribute('data-g')); }; });
  var s=box.querySelector('[data-a=seen]'); if(s) s.onclick=markSeen;
}
async function toggleFollow(g){
  if(!me) return login();
  try{
    if(follows[g]!==undefined){ var d=await sb.from('ff_follow').delete().eq('game',g); if(d.error) return; delete follows[g]; }
    else { var k=(notesBy[g]||[])[0]||'', u=await sb.from('ff_follow').upsert({user_id:me.id,game:g,seen:k},{onConflict:'user_id,game'}); if(u.error) return; follows[g]=k; }
  }catch(e){ return; }
  paintFollow(); paintNews();
}
async function markSeen(){
  var rows=[]; Object.keys(follows).forEach(function(g){ var k=(notesBy[g]||[])[0]; if(k&&unseenN(g)){ rows.push({user_id:me.id,game:g,seen:k}); } });
  if(!rows.length) return;
  try{ var r=await sb.from('ff_follow').upsert(rows,{onConflict:'user_id,game'}); if(r.error) return; }catch(e){ return; }
  rows.forEach(function(x){ follows[x.game]=x.seen; }); paintFollow(); paintNews();
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
function annKey(){ return window.FFAuth&&FFAuth.userKey?FFAuth.userKey(ANN_KEY):ANN_KEY; }
function annHidden(){ try{ return JSON.parse(localStorage.getItem(annKey())||'[]'); }catch(e){ return []; } }
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
  [].forEach.call(box.querySelectorAll('.ax'),function(b){ b.onclick=function(){ var h=annHidden(); h.push(+b.getAttribute('data-id')); try{ localStorage.setItem(annKey(),JSON.stringify(h.slice(-50))); }catch(e){} paintAnn(); }; });
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
  if(window.FFAuth&&FFAuth.loadDevs) await FFAuth.loadDevs();
  ids=ids.filter(function(id,i){ return id&&!names[id]&&ids.indexOf(id)===i; }); if(!ids.length||!sb) return;
  try{ var r=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((r&&r.data)||[]).forEach(function(p){ names[p.id]=(p.display_name&&String(p.display_name).trim())||p.username||'???'; }); }catch(e){}
  if(CARDS) try{ var c=await sb.from('ff_card').select('user_id,title').in('user_id',ids); if(c.error) CARDS=false; ((c&&c.data)||[]).forEach(function(x){ if(TNAME[x.title]) titles[x.user_id]=x.title; }); }catch(e){}
}
/* 칭호 (ff-profile.js 의 TITLES 와 같은 id, supabase-ff-more.sql) */
var titles={}, CARDS=true, TNAME={newbie:'새내기',traveler:'여행자',explorer:'탐험가',friendly:'다정한 친구',popular:'인기쟁이',writer:'글쟁이',commenter:'댓글러',chatter:'수다쟁이',helper:'도우미',allround:'만능',collector:'수집가',master:'달인',legend:'전설'};
function who(id){ var t=titles[id]; return '<a class="who" data-uid="'+esc(id)+'" data-notr>'+esc(names[id]||'???')+'</a>'+(window.FFAuth&&FFAuth.devBadge?FFAuth.devBadge(id):'')+(t?' <span class="ttl">🏷️ <span>'+esc(TNAME[t])+'</span></span>':''); }
document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a.who[data-uid]'); if(a&&window.FFAuth){ e.preventDefault(); FFAuth.openProfile(a.getAttribute('data-uid')); } });
function blocked(id){ try{ return !!(window.FFAuth&&FFAuth.isBlocked&&FFAuth.isBlocked(id)); }catch(e){ return false; } }
function report(o){ if(!me) return login(); if(window.FFAuth&&FFAuth.openReport) FFAuth.openReport(o); }
window.addEventListener('ffblocks',function(){ if(tab==='board') listPosts(); else if(tab==='chat') paintChat(); });
function hubSync(){ try{ if(window.FFAuth&&FFAuth.syncHub) FFAuth.syncHub(); }catch(e){} }
function setTab(t){ tab=t; var bs=document.querySelectorAll('.cm-tabs button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-t')===t);
  var ps=document.querySelectorAll('.cm-p'); for(var j=0;j<ps.length;j++) ps[j].style.display=ps[j].getAttribute('data-p')===t?'':'none';
  if(t==='board') board(); else if(t==='chat') chat(); else if(t==='lfg') lfg(); else if(t==='gal') gallery(); else if(t==='poll'){ tab='board'; openPolls(); return board(); } else if(t==='feed') feed(); else feedback(); }
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
var bFilter='all', bQuery='', bLimit=20, bOpen=null, bWriting=false, bScroll=false, likes={}, myLikes={}, LIKES=true;
var GOPT='<option value="free">자유</option><option value="stickseum">Stickseum</option><option value="crownenvoy">Crown Envoy</option><option value="beaconfall">Beaconfall</option>';
function gameTag(g){ if(g==='devlog') return '<span class="tag">🛠️ 개발자 일지</span>'; return g==='free'?'<span class="tag">자유</span>':(GAMES[g]?'<span class="tag '+GAMES[g].cls+'">'+esc(GAMES[g].name)+'</span>':''); }
async function devOpt(){
  try{ if(!me||!window.FFAuth||!FFAuth.loadDevs) return; await FFAuth.loadDevs(); var s=document.querySelector('.cm-p[data-p=board] form.cm-w select[name=g]'); if(s&&FFAuth.devRole(me.id)&&!s.querySelector('option[value=devlog]')){ var o=document.createElement('option'); o.value='devlog'; o.textContent='🛠️ 개발자 일지'; s.appendChild(o); } }catch(e){}
}
async function board(){
  var p=$('.cm-p[data-p=board]'); if(!p) return;
  devOpt();
  if(!p.dataset.ready){ p.dataset.ready='1';
    p.innerHTML='<div class="cm-bar"><div class="cm-f"><button data-f="all" class="on">전체</button><button data-f="hot">🔥 인기</button><button data-f="free">자유</button><button data-f="stickseum">Stickseum</button><button data-f="crownenvoy">Crown Envoy</button><button data-f="beaconfall">Beaconfall</button><button data-f="devlog">🛠️ 개발자 일지</button></div><button class="cm-btn cm-new">✏️ 글쓰기</button></div>'+
      '<form class="cm-q" role="search"><input type="search" maxlength="40" placeholder="🔍 제목 · 내용으로 글 찾기" autocomplete="off"></form>'+
      '<form class="cm-w" style="display:none"><select name="g">'+GOPT+'</select><input name="t" maxlength="80" placeholder="제목" required><textarea name="b" maxlength="4000" rows="6" placeholder="내용"></textarea><div class="cm-pv"></div><div class="cm-m"></div><div class="cm-acts"><label class="cm-btn2 cm-pick">🖼️ 사진<input type="file" accept="image/*" multiple hidden></label><span class="cm-sp"></span><button type="button" class="cm-btn2 cm-cancel">취소</button><button class="cm-btn">올리기</button></div></form>'+
      '<div class="cm-list"></div><button class="cm-btn2 cm-more" style="display:none">더 보기</button>';
    p.querySelector('.cm-f').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; bFilter=b.getAttribute('data-f'); bLimit=20; [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); listPosts(); };
    p.querySelector('.cm-new').onclick=function(){ if(!me) return login(); var w=p.querySelector('.cm-w'); w.style.display=w.style.display==='none'?'':'none'; if(w.style.display==='') w.t.focus(); };
    p.querySelector('.cm-cancel').onclick=function(){ p.querySelector('.cm-w').style.display='none'; pend=[]; paintPend(); };
    var pick=p.querySelector('.cm-pick input'); pick.onchange=function(){ addPend([].slice.call(this.files||[])); this.value=''; };
    p.querySelector('.cm-w textarea').addEventListener('paste',function(e){ var fs=filesOf(e); if(fs.length){ e.preventDefault(); addPend(fs); } });
    p.querySelector('.cm-more').onclick=function(){ bLimit+=20; listPosts(); };
    var qi=p.querySelector('.cm-q input'), qt=null; p.querySelector('.cm-q').onsubmit=function(e){ e.preventDefault(); clearTimeout(qt); bQuery=qi.value.trim(); bLimit=20; listPosts(); };
    qi.oninput=function(){ clearTimeout(qt); qt=setTimeout(function(){ var v=qi.value.trim(); if(v===bQuery) return; bQuery=v; bLimit=20; listPosts(); },350); };
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
/* search word for a PostgREST or=(...) filter: characters that would break the filter are dropped */
function qWord(v){ return String(v||'').replace(/[,()*%\\"'.:]/g,' ').replace(/\s+/g,' ').trim().slice(0,40); }
function mark(t){ var w=qWord(bQuery); if(!w) return esc(t); var re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'); return String(t).split(re).map(function(x,k){ return k%2?'<mark>'+esc(x)+'</mark>':esc(x); }).join(''); }
async function listPosts(){
  var p=$('.cm-p[data-p=board]'), L=p&&p.querySelector('.cm-list'); if(!L||!sb) return;
  var r, more=false, rows, hot=null;
  if(bFilter==='hot'){
    var pr=await sb.rpc('ff_popular',{p_limit:20}); if(pr.error){ L.innerHTML='<div class="cm-e">'+esc(errText(pr.error))+'</div>'; p.querySelector('.cm-more').style.display='none'; return; }
    hot=(pr.data||[]).map(function(x){ return x.post_id; });
    r=hot.length?await sel('ff_posts',PCOLS,function(q){ return q.in('id',hot); }):{data:[]};
    if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
    rows=(r.data||[]).sort(function(a,b){ return hot.indexOf(a.id)-hot.indexOf(b.id); });
    if(bQuery){ var lq=bQuery.toLowerCase(); rows=rows.filter(function(x){ return (x.title+' '+(x.body||'')).toLowerCase().indexOf(lq)>=0; }); }
  } else {
    r=await sel('ff_posts',PCOLS,function(q){ q=q.order('created_at',{ascending:false}).range(0,bLimit); q=bFilter!=='all'?q.eq('game',bFilter):q; var w=qWord(bQuery); return w?q.or('title.ilike.*'+w+'*,body.ilike.*'+w+'*'):q; }); if(r.error){ L.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
    rows=r.data||[]; more=rows.length>bLimit; rows=rows.slice(0,bLimit);
  }
  if(bOpen&&!bQuery&&!rows.some(function(x){ return x.id===bOpen; })){ var one=await sel('ff_posts',PCOLS,function(q){ return q.eq('id',bOpen).limit(1); }); if(one.data&&one.data[0]) rows.unshift(one.data[0]); }
  rows=rows.filter(function(x){ return !blocked(x.user_id); });
  await loadLikes(rows.map(function(x){ return x.id; }));
  var cnt={}; if(rows.length){ var c=await sb.from('ff_comments').select('post_id').in('post_id',rows.map(function(x){ return x.id; })).limit(2000); ((c&&c.data)||[]).forEach(function(x){ cnt[x.post_id]=(cnt[x.post_id]||0)+1; }); }
  await loadNames(rows.map(function(x){ return x.user_id; }));
  L.innerHTML=rows.length?'':'<div class="cm-e">'+(bQuery?'검색 결과가 없어요.':(bFilter==='hot'?'아직 좋아요를 받은 글이 없어요.':'아직 글이 없어요. 첫 글을 써 보세요!'))+'</div>';
  rows.forEach(function(x){ var d=document.createElement('div'); d.className='cm-post'+(bOpen===x.id?' open':''); d.dataset.id=x.id; d.dataset.g=x.game||'';
    d.innerHTML='<div class="cm-ph">'+gameTag(x.game)+'<b class="cm-t" data-notr>'+mark(x.title)+'</b>'+((x.images||[]).length?'<span class="cm-pic">📷 '+F('사진 {0}장',x.images.length)+'</span>':'')+(cnt[x.id]?'<span class="cm-c">💬 '+cnt[x.id]+'</span>':'')+(likes[x.id]?'<span class="cm-c cm-lc">👍 '+likes[x.id]+'</span>':'')+'</div>'+
      '<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div>'+((x.body||'').trim()?'<div class="cm-ex">'+esc(String(x.body).replace(/\s+/g,' ').trim().slice(0,90))+'</div>':'')+'<div class="cm-body"></div>';
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
  setMn(B.querySelector('.cm-txt'),x.body); if(!x.body) B.querySelector('.cm-txt').style.display='none';
  if(LIKES) B.querySelector('.cm-acts2').appendChild(likeBtn(d,x,B));
  if(RX) loadRx('post',[x.id]).then(function(){ var bar=rxBar('post',x.id); if(bar) B.querySelector('.cm-acts2').insertBefore(bar, B.querySelector('.cm-acts2').children[1]||null); });
  if(!me||me.id!==x.user_id) B.querySelector('.cm-acts2').appendChild(reportBtn({kind:'post', id:x.id, user:x.user_id, text:x.title+' / '+x.body}));
  if(me&&(me.id===x.user_id||admin)){ var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='글 삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } var r=await sb.from('ff_posts').delete().eq('id',x.id); if(r.error) B.querySelector('.cm-m').textContent=errText(r.error); else { bOpen=null; listPosts(); } }; B.querySelector('.cm-acts2').appendChild(del); }
  var cf=B.querySelector('.cm-cf'); cf.onsubmit=async function(e){ e.preventDefault(); if(!me) return login(); var v=cf.querySelector('input').value.trim(); if(!v) return;
    var r=await sb.from('ff_comments').insert({post_id:x.id, body:v}); if(r.error){ B.querySelector('.cm-m').textContent=errText(r.error); return; } cf.reset(); hubSync(); comments(B,x); };
  comments(B,x);
}
async function comments(B, x){
  var C=B.querySelector('.cm-cms'), r=await sb.from('ff_comments').select('id,user_id,body,created_at').eq('post_id',x.id).order('created_at').limit(300);
  var rows=((r&&r.data)||[]).filter(function(c){ return !blocked(c.user_id); }); await loadNames(rows.map(function(c){ return c.user_id; })); await loadRx('comment',rows.map(function(c){ return c.id; })); C.innerHTML='';
  rows.forEach(function(c){ var e=document.createElement('div'); e.className='cm-cm'; e.innerHTML='<div class="cm-meta">'+who(c.user_id)+' · <span>'+esc(ago(c.created_at))+'</span></div><div class="cm-ct" data-notr></div>'; setMn(e.querySelector('.cm-ct'),c.body);
    if(me&&(me.id===c.user_id||admin)){ var x2=document.createElement('button'); x2.className='cm-x'; x2.title='삭제'; x2.textContent='×'; x2.onclick=async function(){ await sb.from('ff_comments').delete().eq('id',c.id); comments(B,x); }; e.appendChild(x2); }
    else if(me) e.appendChild(reportBtn({kind:'comment', id:c.id, user:c.user_id, text:c.body}, 'cm-x cm-rp'));
    var rb=rxBar('comment',c.id); if(rb) e.appendChild(rb);
    C.appendChild(e); });
}

/* ---- 이모지 반응: 글 · 댓글 · 채팅 (supabase-ff-react.sql) ---- */
var EMO=['😂','😮','😢','🔥','❤️','👏'], RX=true, rx={}, rxT=null;      // rx['post:12'] = {'😂':{n:2, me:true}}
async function loadRx(kind, ids){
  if(!RX||!sb||!ids.length) return;
  var r=await sb.from('ff_reacts').select('target,user_id,emoji').eq('kind',kind).in('target',ids).limit(5000);
  if(r.error){ if(/does not exist|schema cache|PGRST20|42P01/i.test(String(r.error.message||'')+' '+r.error.code)) RX=false; return; }
  ids.forEach(function(id){ delete rx[kind+':'+id]; });
  (r.data||[]).forEach(function(x){ if(blocked(x.user_id)) return; var o=rx[kind+':'+x.target]||(rx[kind+':'+x.target]={}), e=o[x.emoji]||(o[x.emoji]={n:0,me:false}); e.n++; if(me&&x.user_id===me.id) e.me=true; });
}
function rxBar(kind, id){ if(!RX) return null; var bar=document.createElement('div'); bar.className='rx'; paintRx(bar,kind,id); return bar; }
function paintRx(bar, kind, id){
  var o=rx[kind+':'+id]||{}, h='';
  EMO.forEach(function(e){ var v=o[e]; if(v&&v.n) h+='<button type="button" class="rx-c'+(v.me?' on':'')+'" data-e="'+e+'">'+e+'<span data-notr>'+v.n+'</span></button>'; });
  bar.innerHTML=h+'<span class="rx-w"><button type="button" class="rx-add" title="반응 달기" aria-label="반응 달기">☺︎+</button><span class="rx-p" hidden>'+EMO.map(function(e){ return '<button type="button" data-e="'+e+'">'+e+'</button>'; }).join('')+'</span></span>';
  bar.onclick=async function(ev){ ev.stopPropagation(); var b=ev.target.closest('button'); if(!b) return;
    if(b.classList.contains('rx-add')){ var pk=bar.querySelector('.rx-p'), was=pk.hidden; closeRx(); pk.hidden=!was; if(was){ pk.style.transform=''; var rc=pk.getBoundingClientRect(), dx=Math.min(0,innerWidth-8-rc.right)+Math.max(0,8-rc.left); if(dx) pk.style.transform='translateX('+dx+'px)'; } return; }
    var e=b.getAttribute('data-e'); if(!e) return; if(!me) return login(); if(bar.dataset.busy) return; bar.dataset.busy=1;
    await toggleRx(kind,id,e); delete bar.dataset.busy; paintRx(bar,kind,id); };
}
function closeRx(){ [].forEach.call(document.querySelectorAll('.rx-p'),function(x){ x.hidden=true; }); }
document.addEventListener('click',function(e){ if(!(e.target.closest&&e.target.closest('.rx-w'))) closeRx(); });
async function toggleRx(kind, id, e){
  var o=rx[kind+':'+id]||(rx[kind+':'+id]={}), v=o[e]||(o[e]={n:0,me:false}), on=!v.me;
  var r=on?await sb.from('ff_reacts').insert({kind:kind, target:id, emoji:e}):await sb.from('ff_reacts').delete().eq('kind',kind).eq('target',id).eq('user_id',me.id).eq('emoji',e);
  if(r.error&&!/duplicate|23505/i.test(String(r.error.message||'')+' '+r.error.code)) return;
  v.me=on; v.n=Math.max(0,v.n+(on?1:-1));
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
  chatRows=(r.data||[]).reverse(); await loadNames(chatRows.map(function(x){ return x.user_id; })); await loadRx('chat',chatRows.map(function(x){ return x.id; })); paintChat();
}
function paintChat(){
  var box=$('.cm-p[data-p=chat] .cm-chat'); if(!box) return; var stick=box.scrollHeight-box.scrollTop-box.clientHeight<60;
  var vis=chatRows.filter(function(x){ return !blocked(x.user_id); });
  box.innerHTML=vis.length?'':'<div class="cm-e">아직 메시지가 없어요. 먼저 인사해 보세요!</div>';
  vis.forEach(function(x){ var d=document.createElement('div'); d.className='cm-msg'+(me&&x.user_id===me.id?' mine':'');
    d.innerHTML='<div class="cm-meta">'+who(x.user_id)+' · <span>'+esc(ago(x.created_at))+'</span></div><div class="cm-bub" data-notr></div>'; var bub=d.querySelector('.cm-bub'); setMn(bub,x.body);
    var ih=imgsHtml(x.images,'cm-cimg'); if(ih){ bub.insertAdjacentHTML('beforeend',ih); if(!x.body) bub.classList.add('only'); [].forEach.call(bub.querySelectorAll('img'),function(im){ im.onload=function(){ if(box.dataset.stick==='1') box.scrollTop=box.scrollHeight; }; }); }
    if(me&&(me.id===x.user_id||admin)){ var b=document.createElement('button'); b.className='cm-x'; b.title='삭제'; b.textContent='×'; b.onclick=async function(){ await sb.from('ff_chat').delete().eq('id',x.id); chatRows=chatRows.filter(function(y){ return y.id!==x.id; }); paintChat(); }; d.appendChild(b); }
    else if(me) d.appendChild(reportBtn({kind:'chat', id:x.id, user:x.user_id, text:x.body}, 'cm-x cm-rp'));
    var rb=rxBar('chat',x.id); if(rb) d.appendChild(rb);
    box.appendChild(d); });
  if(stick||!box.dataset.once){ box.dataset.once=1; box.scrollTop=box.scrollHeight; }
  box.dataset.stick=(stick||box.scrollHeight-box.scrollTop-box.clientHeight<60)?'1':'0';
  if(!box.dataset.sl){ box.dataset.sl=1; box.addEventListener('scroll',function(){ box.dataset.stick=box.scrollHeight-box.scrollTop-box.clientHeight<60?'1':'0'; }); }
}
function watchChat(){
  if(chatChan||!sb) return;
  try{ chatChan=sb.channel('ff-hub-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'ff_chat'},async function(pl){ var x=pl&&pl.new; if(!x||chatRows.some(function(y){ return y.id===x.id; })) return; await loadNames([x.user_id]); chatRows.push(x); if(chatRows.length>200) chatRows.shift(); paintChat(); })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'ff_chat'},function(pl){ var id=pl&&pl.old&&pl.old.id; if(id){ chatRows=chatRows.filter(function(y){ return y.id!==id; }); paintChat(); } })
      .on('postgres_changes',{event:'*',schema:'public',table:'ff_reacts'},function(pl){ var k=(pl&&(pl.new&&pl.new.kind||pl.old&&pl.old.kind)); if(k&&k!=='chat') return; clearTimeout(rxT); rxT=setTimeout(function(){ loadRx('chat',chatRows.map(function(y){ return y.id; })).then(paintChat); },400); })
      .subscribe(function(st){ chatLive=st==='SUBSCRIBED'; }); }catch(e){}
  chatPoll=setInterval(function(){ if(tab==='chat'&&!chatLive&&document.visibilityState!=='hidden') pullChat(); }, 8000);     // if live updates are not available
}

/* ---- 친구 소식: 친구가 최근 2주 동안 달성한 도전과제 · 처음 시작한 게임 · 쓴 글 ---- */
var achCat={};
function achMap(g){ if(!achCat[g]) achCat[g]=fetch(ROOT+'ach/'+g+'.json').then(function(r){ return r.ok?r.json():null; }).then(function(j){ var m={}; ((j&&j.list)||[]).forEach(function(a){ m[a.id]=a; }); return m; }).catch(function(){ return {}; }); return achCat[g]; }
function feedTag(g){ return g==='hub'?'<span class="tag">허브</span>':gameTag(g); }
async function feed(){
  var p=$('.cm-p[data-p=feed]'); if(!p||!sb) return;
  if(!me){ p.innerHTML='<div class="cm-e">로그인하면 친구 소식을 볼 수 있어요.</div>'; return; }
  if(!p.innerHTML) p.innerHTML='<div class="cm-e">불러오는 중...</div>';
  var fr=await sb.from('friendships').select('requester_id,addressee_id,status').or('requester_id.eq.'+me.id+',addressee_id.eq.'+me.id);
  var ids=((fr&&fr.data)||[]).filter(function(x){ return x.status==='accepted'; }).map(function(x){ return x.requester_id===me.id?x.addressee_id:x.requester_id; }).filter(function(id){ return !blocked(id); });
  if(!ids.length){ p.innerHTML='<div class="cm-e">아직 친구가 없어요. 위쪽 계정 메뉴의 친구 목록에서 친구를 추가해 보세요.</div>'; return; }
  var since=new Date(Date.now()-14*864e5).toISOString();
  var R=await Promise.all([
    sb.from('ff_ach').select('user_id,game,ach_id,at').in('user_id',ids).gt('at',since).order('at',{ascending:false}).limit(400),
    sb.from('ff_played').select('user_id,game,first_at').in('user_id',ids).gt('first_at',since).limit(100),
    sel('ff_posts',PCOLS,function(q){ return q.in('user_id',ids).gt('created_at',since).order('created_at',{ascending:false}).limit(30); }) ]);
  var ev=[], grp={};
  ((R[0]&&R[0].data)||[]).forEach(function(x){ var t=Date.parse(x.at)||0, k=x.user_id+'|'+x.game+'|'+Math.floor(t/(3*3600e3)), g=grp[k];      // achievements unlocked close together become one line
    if(!g){ g=grp[k]={t:t, uid:x.user_id, kind:'ach', game:x.game, ids:[]}; ev.push(g); } g.ids.push(x.ach_id); if(t>g.t) g.t=t; });
  ((R[1]&&R[1].data)||[]).forEach(function(x){ ev.push({t:Date.parse(x.first_at)||0, uid:x.user_id, kind:'play', game:x.game}); });
  ((R[2]&&R[2].data)||[]).forEach(function(x){ ev.push({t:Date.parse(x.created_at)||0, uid:x.user_id, kind:'post', post:x}); });
  ev.sort(function(a,b){ return b.t-a.t; }); ev=ev.slice(0,40);
  await loadNames(ev.map(function(x){ return x.uid; }));
  var cats={}; await Promise.all(ev.filter(function(x){ return x.kind==='ach'; }).map(function(x){ return achMap(x.game).then(function(m){ cats[x.game]=m; }); }));
  if(!ev.length){ p.innerHTML='<div class="cm-e">최근 2주 동안 친구 소식이 없어요.</div>'; return; }
  p.innerHTML='<div class="fd-list"></div>'; var L=p.querySelector('.fd-list');
  ev.forEach(function(x){ var d=document.createElement('div'); d.className='fd'; var ic, body;
    if(x.kind==='ach'){ var a=(cats[x.game]||{})[x.ids[0]], nm=a?((a.n&&(a.n[LANG]||(NEWL?a.n.en:a.n.ko)))||a.id):x.ids[0]; ic=a&&a.icon||'🏆';
      body=feedTag(x.game)+' <span>도전과제 달성</span> <b data-notr>'+esc(nm)+'</b>'+(x.ids.length>1?' <span class="fd-n">'+esc(F('외 {0}개',x.ids.length-1))+'</span>':''); }
    else if(x.kind==='play'){ ic='🎮'; body=feedTag(x.game)+' <span>처음 시작했어요</span>'; }
    else { ic='📝'; body='<span>새 글</span> '+feedTag(x.post.game)+' <a class="fd-p" href="?post='+x.post.id+'" data-notr>'+esc(x.post.title)+'</a>'; }
    d.innerHTML='<span class="fd-i">'+esc(ic)+'</span><div class="fd-m"><div class="cm-meta">'+who(x.uid)+' · <span>'+esc(ago(new Date(x.t).toISOString()))+'</span></div><div class="fd-b">'+body+'</div></div>';
    var pa=d.querySelector('.fd-p'); if(pa) pa.onclick=function(e){ e.preventDefault(); openPostById(x.post.id); };
    L.appendChild(d); });
}

/* ===================== 랭킹: 게임별 점수 순위 (ff_rank) ===================== */
var rkGame='crownenvoy';
async function ranking(){
  var box=$('#rankList'); if(!box||!sb) return; var g=rkGame;
  if(g==='stickseum'||g==='isleport') return rankingBy(g,box);
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

/* 게임마다 순위 기준이 달라요: Stickseum = 이번 시즌(한국 달력 월) 랭크 점수(ranked_ratings), Isleport = 재산(ff_wealth, supabase-ff-wealth.sql) */
async function rankingBy(g,box){
  var st=g==='stickseum', tb=st?'ranked_ratings':'ff_wealth', col=st?'rating':'wealth', season=new Date(Date.now()+9*36e5).toISOString().slice(0,7);
  var q=sb.from(tb).select(st?'user_id,rating,wins,losses':'user_id,wealth');
  if(st) q=q.eq('season',season).order('rating',{ascending:false}).order('wins',{ascending:false}); else q=q.order('wealth',{ascending:false});
  var r=await q.limit(20);
  if(g!==rkGame) return;
  if(r.error){ box.innerHTML='<div class="cm-e">'+esc(st?errText(r.error):'재산 순위는 서버 준비 중이에요.')+'</div>'; return; }
  var rows=r.data||[]; await loadNames(rows.map(function(x){ return x.user_id; }));
  if(!rows.length){ box.innerHTML='<div class="cm-e">'+(st?'이번 시즌 랭크전 기록이 아직 없어요.':'아직 재산을 보낸 사람이 없어요.')+'</div>'; return; }
  var n=function(v){ try{ return Number(v).toLocaleString(); }catch(e){ return v; } };
  var h='<table class="rkt"><tr><th></th><th>닉네임</th><th>'+(st?'랭크 점수':'재산')+'</th>'+(st?'<th>승</th><th>패</th>':'')+'</tr>';
  rows.forEach(function(x,i){ h+='<tr class="'+(i<3?'t'+(i+1):'')+(me&&x.user_id===me.id?' me':'')+'"><td>'+(i<3?['🥇','🥈','🥉'][i]:i+1)+'</td><td>'+who(x.user_id)+'</td><td class="pt" data-notr>'+n(x[col])+'</td>'+(st?'<td data-notr>'+x.wins+'</td><td data-notr>'+x.losses+'</td>':'')+'</tr>'; });
  h+='</table>';
  if(st) h+='<div class="rk-n">'+esc(F('{0} 시즌 · 매달 새로 시작해요',season))+'</div>';
  if(me&&!rows.some(function(x){ return x.user_id===me.id; })){
    var q2=sb.from(tb).select(col).eq('user_id',me.id); if(st) q2=q2.eq('season',season);
    var mine=await q2.limit(1), mp=mine&&mine.data&&mine.data[0];
    if(mp){ var c=sb.from(tb).select('user_id',{count:'exact',head:true}); if(st) c=c.eq('season',season); var above=await c.gt(col,mp[col]);
      if(above&&above.count!=null) h+='<div class="rk-me">'+esc(F(st?'내 순위: {0}위 · {1}점':'내 순위: {0}위 · 재산 {1}',above.count+1,n(mp[col])))+'</div>'; }
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

/* ---- 투표 (관리자가 올리고, 한 사람 한 표. 다시 누르면 바꿀 수 있어요) ----
   커뮤니티 탭이 아니라 따로 창으로 열려요. 열 투표가 있을 때만 계정 버튼 왼쪽에 📊 버튼이 떠요 (ff-auth.js) */
function openPolls(){
  var el=$('#pollBox'); if(!el){ el=document.createElement('div'); el.id='pollBox'; el.className='hn-bg'; document.body.appendChild(el);
    el.innerHTML='<div class="hn-b pol-b"><div class="hn-h"><b>📊 투표</b><button type="button" class="hn-x" aria-label="닫기">×</button></div><div class="cm-p" data-p="poll"></div></div>';
    el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')){ el.style.display='none'; if(location.hash==='#poll') try{ history.replaceState(null,'',location.pathname); }catch(_){} } }); }
  el.style.display='flex'; polls();
}
function pollCheck(){ try{ if(window.FFAuth&&FFAuth.pollCheck) FFAuth.pollCheck(); }catch(e){} }
async function polls(){
  var p=$('.cm-p[data-p=poll]'); if(!p) return;
  if(!p.dataset.ready){ p.dataset.ready='1'; p.innerHTML='<div class="pls"></div><div class="cm-pa"></div>'; }
  var Lst=p.querySelector('.pls'), A=p.querySelector('.cm-pa'); if(!sb) return;
  var r=await sb.from('ff_polls').select('*').order('created_at',{ascending:false}).limit(admin?30:10);
  if(r.error){ Lst.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; A.innerHTML=''; return; }
  var isDev=!!(me&&window.FFAuth&&FFAuth.devRole&&FFAuth.devRole(me.id)), rows=(r.data||[]).filter(function(x){ return admin||x.active||(me&&x.created_by===me.id); }), ids=rows.map(function(x){ return x.id; }), cnt={}, mine={};
  if(ids.length){ var c=await sb.rpc('ff_poll_counts',{p_ids:ids}); ((c&&c.data)||[]).forEach(function(x){ (cnt[x.poll_id]=cnt[x.poll_id]||{})[x.choice]=x.votes; });
    if(me){ var v=await sb.from('ff_votes').select('poll_id,choice').eq('user_id',me.id).in('poll_id',ids); ((v&&v.data)||[]).forEach(function(x){ mine[x.poll_id]=x.choice; }); } }
  Lst.innerHTML=rows.length?'':'<div class="cm-e">지금 진행 중인 투표가 없어요.</div>';
  rows.forEach(function(x){ var C=cnt[x.id]||{}, tot=0, open=x.active&&(!x.ends_at||Date.parse(x.ends_at)>Date.now()), my=mine.hasOwnProperty(x.id)?mine[x.id]:null, show=my!=null||!open||admin;
    x.options.forEach(function(o,i){ tot+=C[i]||0; });
    var d=document.createElement('div'); d.className='pl'+(open?'':' closed');
    d.innerHTML=(x.kind==='update'?'<div class="cm-meta"><span>🛠️ 다음 업데이트 투표</span></div>':'')+'<h4 data-notr></h4><div class="cm-meta">'+esc(F('{0}명 참여',tot))+(x.ends_at?' · <span>'+esc(open?F('{0}까지',String(x.ends_at).slice(5,10).replace('-','/')):'마감')+'</span>':(open?'':' · <span>마감</span>'))+(my==null&&open?' · <span>눌러서 투표하세요</span>':'')+'</div>';
    d.querySelector('h4').textContent=x.question;
    x.options.forEach(function(o,i){ var n=C[i]||0, pc=tot?Math.round(100*n/tot):0, b=document.createElement('button'); b.type='button'; b.className='po'+(my===i?' mine':''); b.disabled=!open;
      b.innerHTML=(show?'<i class="fill" style="width:'+pc+'%"></i>':'')+'<span data-notr></span>'+(show?'<span class="pv" data-notr>'+pc+'% · '+n+'</span>':''); b.querySelector('span').textContent=(my===i?'✓ ':'')+o;
      b.onclick=async function(){ if(!me) return login(); if(my===i) return; b.disabled=true; var q=await sb.rpc('ff_vote',{p_poll:x.id, p_choice:i}); if(q.error){ b.disabled=false; d.querySelector('.cm-meta').textContent=errText(q.error); return; } hubSync(); polls(); pollCheck(); };
      d.appendChild(b); });
    if(admin||(me&&x.kind==='update'&&x.created_by===me.id&&isDev)){ var ac=document.createElement('div'); ac.className='cm-acts2';
      var t=document.createElement('button'); t.className='cm-btn2'; t.textContent=x.active?'마감하기':'다시 열기'; t.onclick=async function(){ await sb.from('ff_polls').update({active:!x.active}).eq('id',x.id); polls(); pollCheck(); };
      var del=document.createElement('button'); del.className='cm-btn2'; del.textContent='삭제'; del.onclick=async function(){ if(!del.dataset.s){ del.dataset.s=1; del.textContent='정말 삭제할까요?'; return; } await sb.from('ff_polls').delete().eq('id',x.id); polls(); pollCheck(); };
      ac.appendChild(t); ac.appendChild(del); d.appendChild(ac); }
    Lst.appendChild(d); });
  if(!admin&&!isDev){ A.innerHTML=''; return; }
  if(!A.dataset.ready){ A.dataset.ready='1';
    A.innerHTML='<h4 class="cm-ph4">'+(admin?'📊 투표 올리기 (관리자)':'🛠️ 다음 업데이트 투표 올리기')+'</h4><form class="cm-w"><input name="q" maxlength="200" placeholder="질문" required><textarea name="o" rows="4" placeholder="보기를 한 줄에 하나씩 (2~6개)"></textarea>'+(admin?'<select name="k" title="종류"><option value="poll">종류: 일반 투표</option><option value="update">종류: 다음 업데이트 투표</option></select>':'')+'<select name="e" title="끝나는 때"><option value="">끝나는 때: 계속 열어 두기</option><option value="1">1일 뒤에 끝나요</option><option value="7">1주 뒤에 끝나요</option></select><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">올리기</button></div></form>';
    A.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'), q=f.q.value.trim(), o=f.o.value.split('\n').map(function(x){ return x.trim().slice(0,80); }).filter(Boolean);
      if(!q) return; if(o.length<2||o.length>6){ m.textContent='보기는 2~6개로 적어 주세요.'; return; }
      var r2=await sb.from('ff_polls').insert({question:q, options:o, kind:(admin?(f.k&&f.k.value==='update'?'update':'poll'):'update'), ends_at:f.e.value?new Date(Date.now()+f.e.value*864e5).toISOString():null}); if(r2.error){ m.textContent=errText(r2.error); return; }
      f.reset(); m.textContent='올렸어요.'; polls(); pollCheck(); };
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

/* ===================== Hub Coin: 매일 출석 +10 · 게임 재화로 환전 (supabase-ff-coin.sql) ===================== */
var coin={n:null, streak:0, today:false, err:''}, UNIT={gold:'골드',coin:'코인',coins:'코인'};
function unitName(u){ var k=UNIT[u]||u; return SI.T?SI.T(k):k; }
function coinPop(n){ var el=document.createElement('div'); el.className='coin-pop'; el.innerHTML='🪙 <b data-notr>+'+n+'</b> Hub Coin'+(n>10?' <span class="cp-b">🔥 7일 연속 보너스!</span>':''); document.body.appendChild(el); setTimeout(function(){ el.classList.add('go'); },30); setTimeout(function(){ el.remove(); },2600); }
async function coinDaily(){
  coin={n:null, streak:0, today:false, err:''}; paintCoin(); if(!me||!sb) return;
  var r=await sb.rpc('ff_coin_daily');
  if(r.error){ coin.err=errText(r.error); paintCoin(); return; }
  var x=(r.data||[])[0]||{}; coin.n=x.coins||0; coin.streak=x.streak||0; coin.today=true; paintCoin();
  if(x.got>0){ coinPop(x.got); hubSync(); }
  coinDay=kstNow();
}
/* 페이지를 켜 둔 채 날짜(한국 시간)가 바뀌면 출석 코인을 자동으로 받아요 */
var coinDay='';
function kstNow(){ return new Date(Date.now()+9*3600e3).toISOString().slice(0,10); }
function coinWatch(){ var chk=function(){ if(me&&sb&&coinDay&&coinDay!==kstNow()) coinDaily(); }; setInterval(chk,30000); document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') chk(); }); }
function coinChip(){
  var c=$('#coinChip'), d=$('#coinDd'); if(!c||!d) return;
  c.onclick=function(e){ e.stopPropagation(); var o=d.hidden; d.hidden=!o; c.setAttribute('aria-expanded',o?'true':'false'); };
  document.addEventListener('click',function(e){ if(!d.hidden&&!d.contains(e.target)&&!c.contains(e.target)){ d.hidden=true; c.setAttribute('aria-expanded','false'); } });
}
function paintCoin(){
  var cn=$('#coinChipN'); if(cn) cn.textContent=(me&&coin.n!=null)?coin.n:(me?'…':'0');
  var b=$('#coinBar'); if(!b) return;
  if(!me){ b.innerHTML='<span class="cb-i">🪙</span><span class="cb-t"><b>Hub Coin</b><span class="cb-s">로그인하면 매일 10 Hub Coin을 받아요</span></span><button type="button" class="cm-btn cb-go">로그인</button>'; b.querySelector('.cb-go').onclick=login; return; }
  if(coin.err){ b.innerHTML='<span class="cb-i">🪙</span><span class="cb-t"><b>Hub Coin</b><span class="cb-s">'+esc(coin.err)+'</span></span>'; return; }
  b.innerHTML='<span class="cb-i">🪙</span><span class="cb-t"><b>Hub Coin <span class="cb-n" data-notr>'+(coin.n==null?'…':coin.n)+'</span></b>'+
    '<span class="cb-s">'+(coin.today?'<span>✓ 오늘 출석 완료</span>':'')+(coin.streak>1?' · <span>'+esc(F('{0}일 연속',coin.streak))+'</span>':'')+'</span></span><button type="button" class="cm-btn2 cb-cal">📅 달력</button><button type="button" class="cm-btn cb-go">환전하기</button>';
  b.querySelector('.cb-go').onclick=openCoin; b.querySelector('.cb-cal').onclick=function(){ openCal(); };
}
var coinTab='ex', coinGame='';
var QN={play:'게임 1판 하기',board:'게시판에 글이나 댓글 쓰기',chat:'채팅에 한마디 하기',vote:'투표 참여하기'};
async function questBox(el){
  var Q=el.querySelector('.cx-q'); if(!Q||!sb) return;
  var r=await sb.rpc('ff_quest_status');
  if(r.error){ Q.innerHTML='<div class="cm-e">'+esc(errText(r.error))+'</div>'; return; }
  var rows=r.data||[], n=rows.filter(function(x){ return x.claimed; }).length, dot=el.querySelector('.cx-dot'); if(dot) dot.hidden=!rows.some(function(x){ return x.done&&!x.claimed; });
  Q.innerHTML='<div class="cm-note">하나 끝낼 때마다 5코인, 3개를 모두 받으면 5코인을 더 받아요. (한국 시간 기준으로 매일 바뀌어요)</div>';
  rows.forEach(function(x){ var d=document.createElement('div'); d.className='cx-l';
    var b=x.claimed?'<span class="cx-d up">✓ 받음</span>':(x.done?'<button type="button" class="cm-btn2">5코인 받기</button>':'<small>아직이에요</small>');
    d.innerHTML='<span>'+(x.done?'✅ ':'⬜ ')+esc(QN[x.qid]||x.qid)+'</span>'+b;
    var bt=d.querySelector('button'); if(bt) bt.onclick=async function(){ bt.disabled=true; var c=await sb.rpc('ff_quest_claim',{p_qid:x.qid});
      if(c.error){ bt.disabled=false; bt.textContent='다시 눌러 주세요'; return; }
      var y=(c.data||[])[0]||{}; if(y.coins!=null){ coin.n=y.coins; paintCoin(); } if(y.got>0) coinPop(y.got); hubSync(); openCoin(); };
    Q.appendChild(d); });
  if(n>=rows.length&&rows.length) Q.insertAdjacentHTML('beforeend','<div class="cx-ok">🎉 오늘 퀘스트를 모두 끝냈어요!</div>');
}
async function openCoin(){
  if(!me) return login();
  var el=$('#coinBox'); if(!el){ el=document.createElement('div'); el.id='coinBox'; el.className='hn-bg'; document.body.appendChild(el); el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')) el.style.display='none'; }); }
  el.innerHTML='<div class="hn-b"><div class="hn-h"><b>🪙 Hub Coin 환전</b><button type="button" class="hn-x" aria-label="닫기">×</button></div>'+
    '<div class="cx-have">갖고 있는 코인 <b data-notr>'+(coin.n||0)+'</b></div>'+
    '<div class="cx-tabs"><button type="button" data-t="ex">환전</button><button type="button" data-t="gift">🎁 선물</button><button type="button" data-t="q">📋 퀘스트<i class="cx-dot" hidden></i></button><button type="button" data-t="log">기록</button></div>'+
    '<div class="cx-pane" data-p="ex"><div class="cx-games"></div><div class="cx-list"><div class="cm-e">불러오는 중…</div></div><div class="cx-wait"></div></div>'+
    '<div class="cx-pane" data-p="gift"></div>'+
    '<div class="cx-pane" data-p="q"><div class="cx-q"><div class="cm-e">불러오는 중…</div></div></div>'+
    '<div class="cx-pane" data-p="log"><div class="cx-log"></div></div></div>';
  var tabs=el.querySelector('.cx-tabs');
  function setTab(t){ coinTab=t; tabs.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-t')===t); }); el.querySelectorAll('.cx-pane').forEach(function(pn){ pn.hidden=pn.getAttribute('data-p')!==t; }); }
  tabs.onclick=function(e){ var b=e.target.closest('button[data-t]'); if(b) setTab(b.getAttribute('data-t')); };
  setTab(coinTab);
  el.style.display='flex'; questBox(el);
  var L=el.querySelector('.cx-list'), rr=await sb.from('ff_coin_rates').select('game,unit,per_coin').eq('active',true);
  if(rr.error){ L.innerHTML='<div class="cm-e">'+esc(errText(rr.error))+'</div>'; return; }
  var rates=(rr.data||[]); L.innerHTML=rates.length?'':'<div class="cm-e">아직 바꿀 수 있는 게임이 없어요.</div>';
  if(!rates.some(function(x){ return x.game===coinGame; })) coinGame=rates.length?rates[0].game:'';
  var GC=el.querySelector('.cx-games'); GC.innerHTML=rates.length>1?rates.map(function(x){ return '<button type="button" data-g="'+esc(x.game)+'" data-notr>'+esc((GAMES[x.game]||{name:x.game}).name)+'</button>'; }).join(''):'';
  function pickGame(g){ coinGame=g; GC.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-g')===g); }); L.querySelectorAll('form[data-g]').forEach(function(f){ f.hidden=f.getAttribute('data-g')!==g; }); }
  GC.onclick=function(e){ var b=e.target.closest('button[data-g]'); if(b) pickGame(b.getAttribute('data-g')); };
  rates.forEach(function(x){ var G=GAMES[x.game]||{name:x.game,cls:''}, d=document.createElement('form'); d.className='cx-r '+(G.cls||''); d.setAttribute('data-g',x.game);
    d.innerHTML='<div class="cx-g"><b data-notr>'+esc(G.name)+'</b><span class="cx-rt">'+esc(F('코인 1개 = {0} {1}',x.per_coin,unitName(x.unit)))+'</span></div>'+
      '<div class="cx-in"><button type="button" class="cm-btn2" data-a="-1">−</button><input type="number" inputmode="numeric" min="1" step="1" value="'+Math.min(10,Math.max(1,coin.n||1))+'"><button type="button" class="cm-btn2" data-a="1">+</button>'+
      '<button type="button" class="cm-btn2" data-v="10">10</button><button type="button" class="cm-btn2" data-v="all">전부</button></div>'+
      '<div class="cx-go"><span class="cx-pv"></span><button class="cm-btn">환전</button></div><div class="cm-m"></div>';
    var inp=d.querySelector('input'), pv=d.querySelector('.cx-pv');
    function val(){ return Math.max(0,Math.floor(+inp.value||0)); }
    function show(){ pv.textContent=F('→ {0} {1}',val()*x.per_coin,unitName(x.unit)); }
    d.addEventListener('click',function(e){ var b=e.target.closest('button[data-a],button[data-v]'); if(!b) return; var v=b.getAttribute('data-v');
      inp.value=v==='all'?(coin.n||0):v?Math.min(+v,coin.n||0):Math.max(1,val()+(+b.getAttribute('data-a'))); show(); });
    inp.oninput=show; show();
    d.onsubmit=async function(e){ e.preventDefault(); var m=d.querySelector('.cm-m'), n=val();
      if(n<1){ m.textContent='바꿀 코인 수를 적어 주세요.'; return; } if(n>(coin.n||0)){ m.textContent='코인이 모자라요.'; return; }
      var r=await sb.rpc('ff_coin_exchange',{p_game:x.game, p_coins:n});
      if(r.error){ m.textContent=/not enough/i.test(r.error.message||'')?'코인이 모자라요.':errText(r.error); return; }
      var y=(r.data||[])[0]||{}; coin.n=y.coins; paintCoin(); openCoin().then(function(){ var m2=$('#coinBox .cx-wait'); if(m2) m2.insertAdjacentHTML('afterbegin','<div class="cx-ok">'+esc(F('{0}에 들어가면 받아요: {1} {2}',G.name,y.amount,unitName(x.unit)))+'</div>'); }); };
    L.appendChild(d); });
  pickGame(coinGame);
  el.querySelector('[data-p=gift]').appendChild(giftForm());
  var w=await sb.from('ff_coin_out').select('game,amount').eq('claimed',false), W=el.querySelector('.cx-wait'), sum={};
  ((w&&w.data)||[]).forEach(function(z){ sum[z.game]=(sum[z.game]||0)+z.amount; });
  W.innerHTML=Object.keys(sum).map(function(g){ var u=(rates.filter(function(x){ return x.game===g; })[0]||{}).unit||''; return '<div class="cx-pend">'+esc(F('{0} 접속하면 받을 {1}: {2}',(GAMES[g]||{name:g}).name,unitName(u),sum[g]))+'</div>'; }).join('');
  var lg=await sb.from('ff_coin_log').select('delta,reason,game,other_id,created_at').order('created_at',{ascending:false}).limit(12), LG=el.querySelector('.cx-log');
  var rows=(lg&&lg.data)||[]; await loadNames(rows.map(function(z){ return z.other_id; }).filter(Boolean)); LG.innerHTML=rows.length?rows.map(function(z){ return '<div class="cx-l"><span>'+(z.reason==='daily'?'📅 출석':z.reason==='quest'?'📋 퀘스트':z.reason==='streak'?'🔥 7일 연속 보너스':z.reason==='gift_in'?'🎁 '+esc(F('{0}님에게 받음',names[z.other_id]||'???')):z.reason==='gift_out'?'🎁 '+esc(F('{0}님에게 보냄',names[z.other_id]||'???')):z.reason==='exchange'?'🔁 '+esc(F('{0} 환전',(GAMES[z.game]||{name:z.game}).name)):'🎁 관리자')+'</span><span class="cx-d '+(z.delta>0?'up':'dn')+'" data-notr>'+(z.delta>0?'+':'')+z.delta+'</span><small>'+esc(ago(z.created_at))+'</small></div>'; }).join(''):'<div class="cm-e">아직 기록이 없어요.</div>';
}

/* ===================== 출석 달력 (ff_coin_log 의 daily 기록, 7일 연속마다 +20) ===================== */
var calM=null;
function kstDay(t){ return new Date(Date.parse(t)+9*3600e3).toISOString().slice(0,10); }
async function openCal(off){
  if(!me) return login();
  var now=new Date(Date.now()+9*3600e3); if(calM==null||off==null) calM={y:now.getUTCFullYear(), m:now.getUTCMonth()}; else { calM.m+=off; if(calM.m<0){ calM.m=11; calM.y--; } if(calM.m>11){ calM.m=0; calM.y++; } }
  var el=$('#calBox'); if(!el){ el=document.createElement('div'); el.id='calBox'; el.className='hn-bg'; document.body.appendChild(el); el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')) el.style.display='none'; var b=e.target.closest('[data-cm]'); if(b) openCal(+b.getAttribute('data-cm')); }); }
  var y=calM.y, m=calM.m, first=new Date(Date.UTC(y,m,1)), days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  var from=new Date(Date.UTC(y,m,1)-9*3600e3).toISOString(), to=new Date(Date.UTC(y,m+1,1)-9*3600e3).toISOString();
  el.style.display='flex';
  el.innerHTML='<div class="hn-b cal-b"><div class="hn-h"><b>📅 출석 달력</b><button type="button" class="hn-x" aria-label="닫기">×</button></div><div class="cm-e">불러오는 중…</div></div>';
  var r=await sb.from('ff_coin_log').select('reason,created_at').in('reason',['daily','streak']).gte('created_at',from).lt('created_at',to).limit(100);
  var got={}, bon={}; ((r&&r.data)||[]).forEach(function(z){ var d=+kstDay(z.created_at).slice(8,10); if(z.reason==='daily') got[d]=1; else bon[d]=1; });
  var today=(now.getUTCFullYear()===y&&now.getUTCMonth()===m)?now.getUTCDate():0, cells='', n=Object.keys(got).length;
  for(var i=0;i<first.getUTCDay();i++) cells+='<span class="cal-d e"></span>';
  for(var d=1;d<=days;d++) cells+='<span class="cal-d'+(got[d]?' ok':'')+(d===today?' td':'')+(bon[d]?' bn':'')+'" data-notr><i>'+d+'</i>'+(bon[d]?'🔥':got[d]?'🪙':'')+'</span>';
  var left=7-((coin.streak||0)%7);
  el.querySelector('.hn-b').innerHTML='<div class="hn-h"><b>📅 출석 달력</b><button type="button" class="hn-x" aria-label="닫기">×</button></div>'+
    '<div class="cal-nav"><button type="button" class="cm-btn2" data-cm="-1">‹</button><b data-notr>'+y+'. '+(m+1)+'</b><button type="button" class="cm-btn2" data-cm="1">›</button></div>'+
    '<div class="cal-g">'+['일','월','화','수','목','금','토'].map(function(w){ return '<span class="cal-w">'+w+'</span>'; }).join('')+cells+'</div>'+
    '<div class="cal-s"><span>'+esc(F('이번 달 출석 {0}일',n))+'</span><span>'+esc(F('{0}일 연속',coin.streak||0))+'</span></div>'+
    '<div class="cal-tip">'+esc(F('7일 연속 출석하면 보너스 +20! (다음 보너스까지 {0}일)',left))+'</div>';
}

/* ===================== Hub Coin 선물 (supabase-ff-wiki.sql 의 ff_coin_gift) ===================== */
function giftForm(){
  var fr=[]; try{ fr=((window.FFAuth&&FFAuth.friends&&FFAuth.friends())||[]).filter(function(f){ return f.status==='accepted'; }); }catch(e){}
  var d=document.createElement('form'); d.className='cx-r cx-gift';
  d.innerHTML='<div class="cx-g"><b>🎁 친구에게 보내기</b><span class="cx-rt">하루 100개까지</span></div>'+
    (fr.length?'<div class="cx-in"><select class="cx-fr">'+fr.map(function(f){ return '<option value="'+esc(f.otherId)+'" data-notr>'+esc(f.name)+'</option>'; }).join('')+'</select><input type="number" inputmode="numeric" min="1" max="100" step="1" value="10"></div><div class="cx-go"><span></span><button class="cm-btn">보내기</button></div><div class="cm-m"></div>'
      :'<div class="cm-e">친구를 추가하면 코인을 보낼 수 있어요.</div>');
  d.onsubmit=async function(e){ e.preventDefault(); var m=d.querySelector('.cm-m'), to=d.querySelector('.cx-fr').value, n=Math.floor(+d.querySelector('input').value||0);
    if(n<1||n>100){ m.textContent='1~100개 사이로 적어 주세요.'; return; } if(n>(coin.n||0)){ m.textContent='코인이 모자라요.'; return; }
    var r=await sb.rpc('ff_coin_gift',{p_to:to, p_coins:n});
    if(r.error){ var t=r.error.message||''; m.textContent=/daily gift/i.test(t)?'오늘은 더 보낼 수 없어요. (하루 100개까지)':/not enough/i.test(t)?'코인이 모자라요.':/not friends/i.test(t)?'친구에게만 보낼 수 있어요.':errText(r.error); return; }
    coin.n=r.data; paintCoin(); var nm=d.querySelector('.cx-fr').selectedOptions[0].textContent;
    openCoin().then(function(){ var w=$('#coinBox .cx-wait'); if(w) w.insertAdjacentHTML('afterbegin','<div class="cx-ok">'+esc(F('{0}님에게 {1}개를 보냈어요.',nm,n))+'</div>'); }); };
  return d;
}

/* ===================== 지금 접속 중 (ff_online · ff_online_friends · ff_hub_ping) ===================== */
var onlT=null, PLACE={hub:'허브'};
async function online(){
  var b=$('#onlineBar'); if(!b||!sb) return;
  if(me&&document.visibilityState==='visible'){ try{ await sb.rpc('ff_hub_ping'); }catch(e){} }
  var r=await sb.rpc('ff_online'); if(r.error){ b.innerHTML=''; return; }
  var c={}; (r.data||[]).forEach(function(x){ c[x.place]=x.people; });
  var html='<span class="on-dot"></span><b>'+esc(F('지금 {0}명 접속 중',c.all||0))+'</b>';
  ['stickseum','crownenvoy','beaconfall','hub'].forEach(function(g){ if(c[g]) html+='<span class="on-c">'+(g==='hub'?'<span>허브</span>':'<span data-notr>'+esc(GAMES[g].name)+'</span>')+' <b data-notr>'+c[g]+'</b></span>'; });
  if(me){ var f=await sb.rpc('ff_online_friends'), rows=((f&&!f.error&&f.data)||[]).filter(function(x){ return !blocked(x.user_id); });
    if(rows.length){ await loadNames(rows.map(function(x){ return x.user_id; }));
      html+='<span class="on-f"><span>친구</span> '+rows.slice(0,8).map(function(x){ var g=GAMES[x.place]; return '<a class="who on-p" data-uid="'+esc(x.user_id)+'" data-notr title="'+esc(g?g.name:'Hub')+'">'+esc(names[x.user_id]||'???')+'<small>'+esc(g?g.name:'Hub')+'</small></a>'; }).join('')+(rows.length>8?'<span>+'+(rows.length-8)+'</span>':'')+'</span>'; } }
  b.innerHTML=html;
}
function onlineLoop(){ clearInterval(onlT); online(); onlT=setInterval(function(){ if(document.visibilityState==='visible') online(); },20000); }
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') online(); });
/* 허브를 닫으면 바로 접속 표시에서 빠져요 (ff_leave) */
window.addEventListener('pagehide',function(){ try{ var t=JSON.parse(localStorage.getItem('sb-kebsbuvuutilitwlvxzv-auth-token')||'null'); if(t&&t.access_token) fetch('https://kebsbuvuutilitwlvxzv.supabase.co/rest/v1/rpc/ff_leave',{method:'POST',headers:{'apikey':'sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf','Authorization':'Bearer '+t.access_token,'Content-Type':'application/json'},body:'{}',keepalive:true}).catch(function(){}); }catch(e){} });

/* ===================== @멘션: 자동완성 · 강조 (알림은 supabase-ff-coin.sql 의 트리거) ===================== */
function mnHtml(t){ return esc(t).replace(/(^|[\s(])(@[^\s@<>&]{1,24})/g,'$1<b class="mn">$2</b>'); }
function setMn(el, t){ if(!el) return; if(/@/.test(t||'')) el.innerHTML=mnHtml(t); else el.textContent=t; }
var MN_SEL='.cm-p[data-p=board] textarea[name=b], .cm-cf input, .cm-send input:not([type=file])', mnBox=null, mnFor=null, mnItems=[], mnAt=0;
function mnNames(){ var o={}, out=[]; try{ ((window.FFAuth&&FFAuth.friends&&FFAuth.friends())||[]).forEach(function(f){ if(f.status==='accepted'&&f.name&&f.name!=='???') o[f.name]=1; }); }catch(e){}
  Object.keys(names).forEach(function(id){ var n=names[id]; if(n&&n!=='???'&&(!me||id!==me.id)) o[n]=o[n]||2; });
  Object.keys(o).forEach(function(n){ out.push({n:n, f:o[n]===1}); }); return out; }
function mnTok(inp){ var p=inp.selectionStart||0, s=inp.value.slice(0,p), m=/(^|[\s(])@([^\s@]{0,24})$/.exec(s); return m?{q:m[2], from:p-m[2].length-1, to:p}:null; }
function mnHide(){ if(mnBox) mnBox.style.display='none'; mnFor=null; mnItems=[]; }
function mnShow(inp){ var t=mnTok(inp); if(!t){ mnHide(); return; } var q=t.q.toLowerCase();
  mnItems=mnNames().filter(function(x){ return !q||x.n.toLowerCase().indexOf(q)===0||x.n.toLowerCase().indexOf(q)>0&&q.length>1; }).sort(function(a,b){ return (b.f-a.f)||a.n.localeCompare(b.n); }).slice(0,6);
  if(!mnItems.length){ mnHide(); return; }
  if(!mnBox){ mnBox=document.createElement('div'); mnBox.className='mn-box'; document.body.appendChild(mnBox);
    mnBox.addEventListener('mousedown',function(e){ e.preventDefault(); }); mnBox.addEventListener('click',function(e){ var b=e.target.closest('[data-i]'); if(b) mnPick(+b.getAttribute('data-i')); }); }
  mnFor=inp; mnAt=Math.min(mnAt,mnItems.length-1);
  mnBox.innerHTML=mnItems.map(function(x,i){ return '<button type="button" data-i="'+i+'" class="'+(i===mnAt?'on':'')+'"><span data-notr>@'+esc(x.n)+'</span>'+(x.f?'<small>친구</small>':'')+'</button>'; }).join('');
  var r=inp.getBoundingClientRect(), w=Math.min(260, window.innerWidth-16); mnBox.style.width=w+'px'; mnBox.style.display='block';
  var top=r.bottom+window.scrollY+4, h=mnBox.offsetHeight; if(r.bottom+h+8>window.innerHeight&&r.top>h+8) top=r.top+window.scrollY-h-4;
  mnBox.style.top=top+'px'; mnBox.style.left=Math.max(8,Math.min(r.left+window.scrollX, window.scrollX+window.innerWidth-w-8))+'px'; }
function mnPick(i){ var inp=mnFor, x=mnItems[i]; if(!inp||!x) return; var t=mnTok(inp); if(!t) return mnHide();
  var ins='@'+x.n+' '; inp.value=inp.value.slice(0,t.from)+ins+inp.value.slice(t.to); var p=t.from+ins.length; inp.focus(); try{ inp.setSelectionRange(p,p); }catch(e){} mnHide(); }
document.addEventListener('input',function(e){ var t=e.target; if(t&&t.matches&&t.matches(MN_SEL)){ mnAt=0; mnShow(t); } });
document.addEventListener('keydown',function(e){ if(!mnFor||e.target!==mnFor||!mnBox||mnBox.style.display==='none') return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); mnAt=(mnAt+(e.key==='ArrowDown'?1:-1)+mnItems.length)%mnItems.length; mnShow(mnFor); }
  else if(e.key==='Enter'||e.key==='Tab'){ if(e.isComposing) return; e.preventDefault(); e.stopPropagation(); mnPick(mnAt); }
  else if(e.key==='Escape'){ mnHide(); } },true);
document.addEventListener('focusout',function(e){ if(e.target===mnFor) setTimeout(function(){ if(document.activeElement!==mnFor) mnHide(); },150); });
window.addEventListener('scroll',function(){ if(mnFor) mnShow(mnFor); },{passive:true});

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
    P.innerHTML='<h4>📢 공지 · 이벤트 올리기 (관리자)</h4><form class="cm-w"><div class="cm-row"><select name="k"><option value="notice">📢 공지</option><option value="event">🎉 이벤트</option></select><select name="e" title="끝나는 때"><option value="">끝나는 때: 계속 열어 두기</option><option value="1">1일 뒤에 끝나요</option><option value="7">1주 뒤에 끝나요</option></select></div>'+
      '<input name="b" maxlength="300" placeholder="허브 맨 위에 보일 내용" required><input name="l" maxlength="300" placeholder="링크 (https://..., 선택)"><div class="cm-m"></div><div class="cm-acts"><button class="cm-btn">올리기</button></div></form><div class="cm-al"></div>';
    P.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.cm-m'), b=f.b.value.trim(), l=f.l.value.trim(); if(!b) return;
      if(l&&!/^https:\/\//.test(l)){ m.textContent='링크는 https:// 로 시작해야 해요.'; return; }
      var row={kind:f.k.value, body:b, link:l||null, ends_at:f.e.value?new Date(Date.now()+f.e.value*864e5).toISOString():null};
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
  if(CMP){ paintSend(); setTab(tab); } loadAnn(); loadFollows(); ranking(); coinDaily(); onlineLoop(); if(location.hash==='#coin') setTimeout(openCoin,400);
}
/* 다른 페이지 · 알림에서 열기: ?post=글번호 , #feedback , #hubnotes */
function openPostById(id){ id=+id; if(!id) return; bOpen=id; bScroll=true; if(tab!=='board') setTab('board'); else listPosts(); }
var CMH={chat:'#chat',fb:'#feedback',lfg:'#lfg',gal:'#gallery',feed:'#friends'};
window.FFHub={ openPost:function(id){ if(!CMP){ location.href=CMURL+'?post='+encodeURIComponent(id); return; } openPostById(id); scrollToCm(); }, tab:function(t){ if(!CMP){ location.href=CMURL+(CMH[t]||''); return; } setTab(t); scrollToCm(); }, coin:function(){ openCoin(); }, polls:function(){ openPolls(); } };
function fromUrl(){
  var m=/[?&]post=(\d+)/.exec(location.search); if(m){ bOpen=+m[1]; bScroll=true; tab='board'; try{ history.replaceState(null,'',location.pathname+'#community'); }catch(e){} }
  if(location.hash==='#feedback') tab='fb'; else if(location.hash==='#lfg') tab='lfg'; else if(location.hash==='#gallery') tab='gal'; else if(location.hash==='#friends') tab='feed'; else if(location.hash==='#chat') tab='chat';
}
window.addEventListener('hashchange',function(){ if(location.hash==='#poll') openPolls(); else if(location.hash==='#hubnotes') openHubNotes(); else if(location.hash==='#feedback'){ setTab('fb'); scrollToCm(); } });
/* ===== 게임 배너 슬라이드 + 게임별 분위기 (body[data-g] 로 배경 색이 바뀜) ===== */
function banner(){
  var B=$('#bnr'); if(!B) return; var S=B.querySelectorAll('.sl'), D=B.querySelectorAll('.dots button'), cur=0, timer=null, hoverG=null;
  function amb(){ document.body.setAttribute('data-g',hoverG||S[cur].getAttribute('data-g')); }
  function show(i){ cur=(i+S.length)%S.length; for(var k=0;k<S.length;k++){ S[k].classList.toggle('on',k===cur); D[k].classList.toggle('on',k===cur); }
    var im=S[cur].querySelector('img'); if(im&&im.loading==='lazy') im.loading='eager'; amb(); }
  function play(){ clearInterval(timer); if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; timer=setInterval(function(){ if(!document.hidden) show(cur+1); },6000); }
  B.querySelector('.pv').onclick=function(){ show(cur-1); play(); }; B.querySelector('.nx').onclick=function(){ show(cur+1); play(); };
  [].forEach.call(D,function(d,i){ d.onclick=function(){ show(i); play(); }; });
  B.addEventListener('mouseenter',function(){ clearInterval(timer); }); B.addEventListener('mouseleave',play);
  var x0=null; B.addEventListener('touchstart',function(e){ x0=e.touches[0].clientX; clearInterval(timer); },{passive:true});
  B.addEventListener('touchend',function(e){ if(x0==null) return; var dx=e.changedTouches[0].clientX-x0; x0=null; if(Math.abs(dx)>40) show(cur+(dx<0?1:-1)); play(); },{passive:true});
  var CG={st:'stickseum',ce:'crownenvoy',bf:'beaconfall'};
  [].forEach.call(document.querySelectorAll('.games .game'),function(a){ var g=null; for(var c in CG) if(a.classList.contains(c)) g=CG[c]; if(!g) return;
    a.addEventListener('mouseenter',function(){ hoverG=g; amb(); }); a.addEventListener('mouseleave',function(){ hoverG=null; amb(); }); });
  show(0); play();
}

/* ===== 통합 검색: 게임 · 위키 · 게시판 ===== */
var WIKIX={tools:{name:'Tools',cls:'g4'},educations:{name:'Educations',cls:'g5'}};
var SX={wiki:null, tr:null, seq:0, sel:-1};
var SGAMES=[['stickseum','Stickseum','g1','https://frenchfries777mc.github.io/games/stickseum/','친구들과 실시간으로 붙는 스틱맨 난투','스틱맨 난투 액션 stickman brawl'],
  ['crownenvoy','Crown Envoy','g2','https://frenchfries777mc.github.io/games/crownenvoy/','외교와 전쟁으로 제국을 키우는 턴제 전략','외교 전쟁 전략 diplomacy war strategy'],
  ['beaconfall','Beaconfall','g3','https://frenchfries777mc.github.io/games/beaconfall/','외계 행성에서 살아남아 탈출하는 생존 제작','생존 제작 픽셀 survival crafting pixel'],
  ['isleport','Isleport','g3','https://frenchfries777mc.github.io/games/isleport/','섬을 가꾸고 배로 교역하는 섬 경영','섬 경영 교역 타이쿤 픽셀 tycoon trade island pixel']];
function sfnv(s){ var h=0x811c9dc5; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return ('0000000'+h.toString(16)).slice(-8); }
function smark(t,q){ var e=esc(t); if(!q) return e; var r=esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); try{ return e.replace(new RegExp(r,'gi'),function(x){ return '<mark>'+x+'</mark>'; }); }catch(_){ return e; } }
function splain(b){ return String(b||'').replace(/^::.*$/gm,'').replace(/\*\*/g,'').replace(/^#{2,3}\s+|^\s*[-•]\s+|^\s*\d+[.)]\s+/gm,'').replace(/\s+/g,' ').trim(); }
function ssnip(b,q){ var p=splain(b), i=p.toLowerCase().indexOf(q.toLowerCase()); if(i<0) return smark(p.slice(0,90),''); var a=Math.max(0,i-30); return (a?'…':'')+smark(p.slice(a,i+q.length+60),q); }
async function sxLoad(){
  if(SX.wiki||!sb) return;
  var trP=LANG==='ko'?Promise.resolve({}):fetch(ROOT+'wiki/tr/'+(NEWL?'en':LANG)+'.json').then(function(r){ return r.ok?r.json():{}; }).catch(function(){ return {}; });
  var r=await sb.from('ff_wiki').select('game,slug,title,body').limit(500); SX.tr=await trP;
  SX.wiki=((r&&r.data)||[]).map(function(p){ var x=SX.tr[p.game+'/'+p.slug], ok=x&&x.t&&x.h===sfnv(p.title+'\n'+p.body); return {game:p.game, slug:p.slug, title:ok?x.t:p.title, body:ok?x.b:p.body, ko:p.title+'\n'+p.body}; });
}
function openSearch(){
  var el=$('#srxBox'); if(!el){ el=document.createElement('div'); el.id='srxBox'; el.className='hn-bg srx'; document.body.appendChild(el);
    el.innerHTML='<div class="hn-b"><div class="hn-h"><b>🔍 '+esc(F('검색'))+'</b><button type="button" class="hn-x" aria-label="'+esc(F('닫기'))+'">×</button></div><input type="search" autocomplete="off" placeholder="'+esc(F('게임, 위키, 게시판 글 검색'))+'"><div class="srs"></div></div>';
    el.addEventListener('click',function(e){ if(e.target===el||e.target.closest('.hn-x')) closeSearch(); var a=e.target.closest('[data-post]'); if(a){ e.preventDefault(); closeSearch(); if(window.FFHub) FFHub.openPost(+a.getAttribute('data-post')); } });
    var inp=el.querySelector('input'), qt=null;
    inp.addEventListener('input',function(){ clearTimeout(qt); qt=setTimeout(function(){ runSearch(inp.value); },180); });
    inp.addEventListener('keydown',function(e){ var rs=el.querySelectorAll('.sr'); if(!rs.length) return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); SX.sel=(SX.sel+(e.key==='ArrowDown'?1:-1)+rs.length)%rs.length; [].forEach.call(rs,function(r,i){ r.classList.toggle('sel',i===SX.sel); }); rs[SX.sel].scrollIntoView({block:'nearest'}); }
      else if(e.key==='Enter'){ e.preventDefault(); (rs[SX.sel<0?0:SX.sel]).click(); } }); }
  el.style.display='flex'; var i=el.querySelector('input'); i.focus(); i.select(); sxLoad().then(function(){ if(i.value) runSearch(i.value); });
}
function closeSearch(){ var el=$('#srxBox'); if(el&&el.style.display!=='none'){ el.style.display='none'; var i=el.querySelector('input'); if(i) i.blur(); } }
async function runSearch(v){
  var el=$('#srxBox'), R=el&&el.querySelector('.srs'); if(!R) return; var q=String(v||'').trim(), my=++SX.seq; SX.sel=-1;
  if(!q){ R.innerHTML=''; return; } var ql=q.toLowerCase(), h='';
  var gs=SGAMES.filter(function(g){ return (g[1]+' '+F(g[4])+' '+g[4]+' '+g[5]).toLowerCase().indexOf(ql)>=0; });
  if(gs.length) h+='<div class="sg"><h4>'+esc(F('게임'))+'</h4>'+gs.map(function(g){ return '<a class="sr" href="'+g[3]+'"><b class="'+g[2]+'">'+smark(g[1],q)+'</b><small>'+esc(F(g[4]))+'</small></a>'; }).join('')+'</div>';
  var ws=(SX.wiki||[]).map(function(p){ var sc=0; if(p.title.toLowerCase().indexOf(ql)>=0) sc+=10; if(p.body.toLowerCase().indexOf(ql)>=0) sc+=2; if(!sc&&p.ko.toLowerCase().indexOf(ql)>=0) sc+=1; return {p:p,sc:sc}; })
    .filter(function(x){ return x.sc; }).sort(function(a,b){ return b.sc-a.sc; }).slice(0,8);
  if(ws.length) h+='<div class="sg"><h4>'+esc(F('위키'))+'</h4>'+ws.map(function(x){ var g=GAMES[x.p.game]||WIKIX[x.p.game]||{name:x.p.game,cls:''}; return '<a class="sr" href="'+ROOT+'wiki/#'+x.p.game+'/'+encodeURIComponent(x.p.slug)+'"><span class="gt '+g.cls+'">'+esc(g.name)+'</span><b>'+smark(x.p.title,q)+'</b><small>'+ssnip(x.p.body,q)+'</small></a>'; }).join('')+'</div>';
  R.innerHTML=h||'<div class="se">…</div>';
  var ps=[]; if(sb){ var w=q.replace(/[,()%*\\"]/g,' ').trim(); if(w){ try{ var r=await sb.from('ff_posts').select('id,game,title,body,created_at').or('title.ilike.%'+w+'%,body.ilike.%'+w+'%').order('created_at',{ascending:false}).limit(6); ps=(r&&r.data)||[]; }catch(e){} } }
  if(my!==SX.seq) return;
  if(ps.length) h+='<div class="sg"><h4>'+esc(F('게시판'))+'</h4>'+ps.map(function(x){ var g=GAMES[x.game]; return '<a class="sr" href="'+CMURL+'?post='+x.id+'" data-post="'+x.id+'" data-notr>'+(g?'<span class="gt '+g.cls+'">'+esc(g.name)+'</span>':'')+'<b>'+smark(x.title,q)+'</b><small>'+ssnip(x.body,q)+'</small></a>'; }).join('')+'</div>';
  R.innerHTML=h||'<div class="se">'+esc(F('검색 결과가 없어요.'))+'</div>';
}
function searchInit(){
  var b=$('#srxBtn'); if(b) b.onclick=openSearch;
  document.addEventListener('keydown',function(e){ var t=e.target, typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
    if((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); openSearch(); }
    else if(e.key==='/'&&!typing){ e.preventDefault(); openSearch(); }
    else if(e.key==='Escape'){ closeSearch(); } });
}

function start(){
  if(!CMP&&(/[?&]post=\d+/.test(location.search)||/^#(feedback|lfg|gallery|friends|chat|community)$/.test(location.hash))){ location.replace(CMURL+location.search+(location.hash==='#community'?'':location.hash)); return; }
  coinChip(); coinWatch(); banner(); searchInit();
  fromUrl(); loadNews().then(function(){ if(location.hash==='#hubnotes') openHubNotes(); });
  if(location.hash==='#poll') setTimeout(openPolls,400);
  if(tab==='fb'){ setTimeout(scrollToCm,300); } var hb=$('#hubNotesBtn'); if(hb) hb.onclick=function(e){ e.preventDefault(); openHubNotes(); };
  var rf=$('.rk-f'); if(rf) rf.onclick=function(e){ var b=e.target.closest('button'); if(!b) return; rkGame=b.getAttribute('data-g'); [].forEach.call(this.children,function(x){ x.classList.toggle('on',x===b); }); ranking(); };
  var tabs=$('.cm-tabs'); if(tabs) tabs.onclick=function(e){ var b=e.target.closest('button'); if(b) setTab(b.getAttribute('data-t')); };
  var go=function(){ if(!window.FFAuth){ setTimeout(go,200); return; } FFAuth.ready.then(function(){ sb=client(); refreshUser(); FFAuth.onChange(function(){ setTimeout(refreshUser,50); }); }); };
  go();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

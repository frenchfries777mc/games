/* 프로필 카드 아래 버튼 묶음 (친구 요청, 메시지, Hub Coin 선물, 링크 복사, 이미지 저장, 신고, 차단)
   FFPfAct.mount(box,{sb,me,uid,un,own,save,link,card})  — 허브 프로필 페이지와 카드 창이 같이 써요. */
(function(){
  if(window.FFPfAct) return;
  var css=document.createElement('style'); css.id='ffpfactCss';
  css.textContent='.pfa{display:flex;flex-direction:column;gap:10px;width:100%;font-family:"Noto Sans KR","Apple SD Gothic Neo",system-ui,sans-serif}'+
   '.pfa button{font-family:inherit;cursor:pointer;box-sizing:border-box;text-transform:none;letter-spacing:0}'+
   '.pfa .pfa-pri{text-align:center;padding:13px 14px;border-radius:10px;background:#d9b45f;color:#0e0e0e;font-weight:700;font-size:15px;border:0}'+
   '.pfa .pfa-pri[disabled]{opacity:.55;cursor:default}'+
   '.pfa .pfa-row{display:flex;gap:10px}'+
   '.pfa .pfa-row button{flex:1;text-align:center;padding:12px 14px;border-radius:10px;border:1px solid #3a3530;background:none;color:#ece6d8;font-size:14px;font-weight:500}'+
   '.pfa .pfa-row.s button{padding:10px 14px;border:1px solid #2e2b25;font-size:13px;color:#a39c8c;font-weight:400}'+
   '.pfa .pfa-ft{display:flex;gap:16px;justify-content:center}'+
   '.pfa .pfa-ft button{border:0;background:none;padding:2px 4px;font-size:13px;color:#8d877a;font-weight:400}'+
   '.pfa .pfa-gift{display:none;gap:10px}.pfa .pfa-gift.on{display:flex}'+
   '.pfa .pfa-gift input{flex:1;min-width:0;padding:10px 12px;border-radius:10px;border:1px solid #3a3530;background:transparent;color:#ece6d8;font:inherit;font-size:14px}'+
   '.pfa .pfa-gift button{padding:10px 16px;border-radius:10px;border:1px solid #d9b45f;background:none;color:#f0cf7e;font-size:14px;font-weight:500}'+
   '.pfa .pfa-msg{min-height:0;text-align:center;font-size:13px;color:#a39c8c}.pfa .pfa-msg:empty{display:none}'+
   '#ffpModal .pfa-h{width:100%}#ffpModal.pfa-on .r .s,#ffpModal.pfa-on .r .k{display:none!important}';
  document.head.appendChild(css);
  function A(){ return window.FFAuth; }
  function frOf(uid){ try{ return (A().friends()||[]).filter(function(f){ return f.otherId===uid; })[0]||null; }catch(e){ return null; } }
  function mount(box,o){
    o=o||{}; var uid=o.uid, sb=o.sb||(A()&&A().client&&A().client()), me=o.me||(A()&&A().user&&A().user());
    var h='';
    if(o.own){
      h='<button type="button" class="pfa-pri" data-a="card">내 프로필 카드 보기</button><div class="pfa-row s"><button type="button" data-a="link">링크 복사</button><button type="button" data-a="img">이미지 저장</button></div>';
    } else {
      h='<button type="button" class="pfa-pri" data-a="fr">친구 요청</button>'+
        '<div class="pfa-row"><button type="button" data-a="dm">메시지 보내기</button><button type="button" data-a="gift">Hub Coin 선물</button></div>'+
        '<div class="pfa-gift"><input type="number" min="1" max="100" inputmode="numeric" placeholder="개수 (1~100)" aria-label="선물할 Hub Coin 개수"><button type="button" data-a="giftgo">보내기</button></div>'+
        '<div class="pfa-row s"><button type="button" data-a="link">링크 복사</button><button type="button" data-a="img">이미지 저장</button></div>'+
        '<div class="pfa-ft"><button type="button" data-a="rep">신고</button><button type="button" data-a="blk">차단</button></div>';
    }
    box.innerHTML='<div class="pfa">'+h+'<div class="pfa-msg" role="status"></div></div>';
    var root=box.firstChild, msg=root.querySelector('.pfa-msg'), say=function(t){ msg.textContent=t||''; };
    var q=function(a){ return root.querySelector('[data-a="'+a+'"]'); };
    var needLogin=function(){ if(!me){ try{ A().openLogin(); }catch(e){} return true; } return false; };
    function paintFr(){ var b=q('fr'); if(!b) return; var f=frOf(uid); b.disabled=false; b.textContent='친구 요청';
      if(f&&f.status==='accepted'){ b.textContent='친구예요'; b.disabled=true; }
      else if(f&&f.outgoing){ b.textContent='요청 보냄'; b.disabled=true; }
      else if(f&&f.incoming){ b.textContent='친구 요청 수락'; } }
    function paintBlk(){ var b=q('blk'); if(!b) return; try{ b.textContent=A().isBlocked(uid)?'차단 풀기':'차단'; }catch(e){} }
    paintFr(); paintBlk();
    var blkArm=0;
    root.onclick=async function(e){ var b=e.target.closest&&e.target.closest('button[data-a]'); if(!b||b.disabled) return; var a=b.getAttribute('data-a'); say('');
      if(a==='card'){ try{ A().openProfile(uid); }catch(e2){} return; }
      if(a==='link'){ if(o.link) return o.link();
        var u=o.un?'https://frenchfries777.com/profile/?u='+encodeURIComponent(o.un):'', old=b.textContent; if(!u) return;
        try{ await navigator.clipboard.writeText(u); b.textContent='✓ 복사했어요'; setTimeout(function(){ b.textContent=old; },1600); }catch(e2){ say(u); } return; }
      if(a==='img'){ if(o.save) return o.save(); return saveCard(uid); }
      if(needLogin()) return;
      if(a==='fr'){ var f=frOf(uid);
        try{ var r;
          if(f&&f.incoming) r=await sb.from('friendships').update({status:'accepted'}).eq('id',f.rowId);
          else r=await sb.from('friendships').insert({requester_id:me.id,addressee_id:uid});
          if(r&&r.error) throw r.error; say(f&&f.incoming?'친구가 됐어요':'친구 요청을 보냈어요'); b.disabled=true; b.textContent=f&&f.incoming?'친구예요':'요청 보냄'; }
        catch(e2){ say('지금은 보낼 수 없어요. 이미 요청했거나 잠시 뒤에 다시 해 주세요.'); } return; }
      if(a==='dm'){ var f2=frOf(uid); if(!f2||f2.status!=='accepted'){ say('친구끼리만 메시지를 보낼 수 있어요.'); return; } try{ A().openDM(uid); }catch(e2){} return; }
      if(a==='gift'){ var g=root.querySelector('.pfa-gift'); g.classList.toggle('on'); if(g.classList.contains('on')) g.querySelector('input').focus(); return; }
      if(a==='giftgo'){ var inp=root.querySelector('.pfa-gift input'), n=parseInt(inp.value,10);
        if(!(n>=1&&n<=100)){ say('개수는 1에서 100 사이로 적어 주세요.'); return; }
        b.disabled=true; say('…');
        try{ var r2=await sb.rpc('ff_coin_gift',{p_to:uid,p_coins:n}); b.disabled=false;
          if(r2&&r2.error){ var m=String(r2.error.message||''); say(/not friends/.test(m)?'친구에게만 선물할 수 있어요.':/daily/.test(m)?'하루에 100 Hub Coin까지 선물할 수 있어요.':/not enough/.test(m)?'Hub Coin이 모자라요.':'지금은 보낼 수 없어요.'); return; }
          inp.value=''; say(n+' Hub Coin을 보냈어요.'); }catch(e2){ b.disabled=false; say('지금은 보낼 수 없어요.'); } return; }
      if(a==='rep'){ try{ A().openReport({kind:'user',id:uid,user:uid,text:''}); }catch(e2){} return; }
      if(a==='blk'){ var on=false; try{ on=A().isBlocked(uid); }catch(e2){}
        if(!on&&!blkArm){ blkArm=1; b.textContent='정말 차단할까요?'; setTimeout(function(){ blkArm=0; paintBlk(); },3500); return; }
        blkArm=0; try{ var r3=await A().block(uid,!on); if(r3&&r3.error) throw r3.error; say(on?'차단을 풀었어요.':'차단했어요. 이 사람의 글과 채팅은 보이지 않아요.'); }catch(e2){ say('처리하지 못했어요. 잠시 뒤 다시 해 주세요.'); } paintBlk(); return; }
    };
    return {refresh:function(){ paintFr(); paintBlk(); }};
  }
  /* 카드 창을 잠깐 열어 그림 파일로 저장해요 */
  function saveCard(uid){ try{ A().openProfile(uid); }catch(e){ return; } var n=0, t=setInterval(function(){ var m=document.getElementById('ffpModal'), cv=m&&m.querySelector('canvas');
    if(cv&&m.style.display==='flex'&&cv.style.display!=='none'){ clearInterval(t); var s=m.querySelector('.s'); if(s) s.click(); setTimeout(function(){ m.style.display='none'; },500); }
    else if(++n>80) clearInterval(t); },150); }
  window.FFPfAct={mount:mount, saveCard:saveCard};
})();

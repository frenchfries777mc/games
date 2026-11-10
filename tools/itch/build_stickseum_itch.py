#!/usr/bin/env python3
"""Stickseum itch edition builder. Usage: build_stickseum_itch.py <games/stickseum dir> <out dir>
Copies the latest game into a standalone folder and patches only the copy:
 - login gate: Google (popup) + guest only (no ID/password form)
 - no ff-auth.js (no hub button / account menu / GitHub login), no 'back to site' button
"""
import sys, re, shutil, os, json
src, out = sys.argv[1], sys.argv[2]
ver = json.load(open(os.path.join(src, 'versions.json')))
game = [v for v in ver['versions'] if v.get('latest')][0]['file']
if os.path.exists(out): shutil.rmtree(out)
os.makedirs(out)
html = open(os.path.join(src, game), encoding='utf-8').read()

# 1. login gate -> Google + guest
a = html.index('function renderAuthGateForm(){')
b = html.index('initAuthGate();', a)
new_gate = r'''function renderAuthGateForm(){
  const box=document.getElementById('authGateBox');
  box.innerHTML=
    '<button class="btn-primary btn-full" id="gateGoogleBtn">Google</button>'+
    '<div id="gateAuthMsg" class="hint" style="margin:8px 0;"></div>'+
    '<button class="btn-secondary btn-full" id="gateGuestBtn" style="margin-top:10px;">게스트 모드로 하기</button>'+
    '<div class="hint" style="margin-top:6px;">계정 없이 온라인 게임은 할 수 있어요. 랭크·친구·클랜·파티 같은 계정 기능은 쓸 수 없어요.</div>';
  document.getElementById('gateGuestBtn').onclick=()=>{ sb=null; sbUser=null; myName='게스트'+String(Math.floor(Math.random()*1000000)).padStart(6,'0'); myNameSet=true; showScreen('menuScreen'); };
  document.getElementById('gateGoogleBtn').onclick=()=>{
    const msg=document.getElementById('gateAuthMsg');
    const code=Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
    const w=window.open('https://frenchfries777.com/games/itch-login/?go=google&c='+code,'ffitch','width=480,height=680');
    if(!w){ msg.textContent='로그인 창이 막혔어요. 이 페이지의 팝업을 허용해 주세요.'; return; }
    msg.textContent='열린 창에서 Google 로그인을 마쳐 주세요.';
    const t0=Date.now();
    const poll=setInterval(async ()=>{
      if(Date.now()-t0>300000){ clearInterval(poll); msg.textContent='시간이 지났어요. 다시 눌러 주세요.'; return; }
      try{
        const r=await sb.rpc('ff_itch_take',{p_code:code});
        const row=r && r.data && r.data[0];
        if(row){ clearInterval(poll); msg.textContent='로그인 중...'; const s=await sb.auth.setSession({access_token:row.access_token, refresh_token:row.refresh_token}); if(s.error) throw s.error; await initAuthGate(); }
      }catch(x){ clearInterval(poll); msg.textContent='로그인하지 못했어요. 다시 해 주세요.'; }
    }, 1500);
  };
}
'''
html = html[:a] + new_gate + html[b:]

# 2. no hub account script, no 'back to site' button
tag = '<script src="https://frenchfries777.com/games/ff-auth.js"></script>'
assert tag in html
html = html.replace(tag, '<style>#settingsToSiteBtn{display:none!important}#ffItchTag{position:fixed;left:6px;bottom:4px;z-index:2147483000;font:600 10px/1 system-ui,sans-serif;color:#fff;opacity:.45;pointer-events:none;text-shadow:0 0 3px #000}</style><div id="ffItchTag">ItchEdition</div>')

open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)

# 3. assets the game loads by relative path
for f in os.listdir(src):
    if re.match(r'music-.*\.mp3$', f) or f in ('hero-lobby.jpg', 'chars.json'):
        shutil.copy(os.path.join(src, f), out)
for d in ('characters', 'currency', 'emoji', 'modes'):
    shutil.copytree(os.path.join(src, d), os.path.join(out, d))
print('built from', game, '->', out)

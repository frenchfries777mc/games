#!/usr/bin/env python3
"""Crown Envoy / Beaconfall itch edition builder.
Usage: build_itch_other.py <crownenvoy|beaconfall> <games/<game> dir> <out dir>
Patches only the copy: Google (popup + one-time handoff) + guest login, no hub account script,
exit button opens the site in a new tab, small 'ItchEdition' tag bottom-left."""
import sys, re, shutil, os, json
game, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
ver = json.load(open(os.path.join(src, 'versions.json')))
fn = [v for v in ver['versions'] if v.get('latest')][0]['file']
html = open(os.path.join(src, fn), encoding='utf-8').read()

def rep(old, new, count=1):
    global html
    assert html.count(old) >= 1, 'not found: ' + old[:70]
    html = html.replace(old, new, count)

START = r"""const code=Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
    const w=window.open('https://frenchfries777.com/games/itch-login/?go=google&c='+code,'ffitch','width=480,height=680');"""
SITE_OPEN = "window.open('https://frenchfries777.com/games/','_blank');"

if game == 'crownenvoy':
    # login modal: Google button only
    a = html.index("  else{o.innerHTML='<div class=\"ab\"><h2>Frenchfries777 계정</h2><div class=\"as\">계정으로")
    b = html.index("o.querySelector('.am').textContent=msg;if(keepId)$('#aEm').value=keepId;}", a) + len("o.querySelector('.am').textContent=msg;if(keepId)$('#aEm').value=keepId;}")
    html = html[:a] + """  else{o.innerHTML='<div class="ab"><h2>Frenchfries777 계정</h2><div class="as">계정으로 로그인하면 닉네임이 게임에 그대로 쓰여요.</div><div class="am'+(ok?' ok':'')+'"></div><div class="ar"><button class="btn" data-a="close">닫기</button><button class="btn primary" data-a="go">Google</button></div></div>';
    o.querySelector('.am').textContent=msg;}""" + html[b:]
    a = html.index("async function go(){if(busy)return;")
    b = html.index("async function out(){", a)
    html = html[:a] + """async function go(){if(busy)return;busy=true;
  %s
  if(!w){busy=false;msg='로그인 창이 막혔어요. 이 페이지의 팝업을 허용해 주세요.';ok=false;draw();return;}
  msg='열린 창에서 Google 로그인을 마쳐 주세요.';ok=true;draw();
  try{const c=await ensureSb();const t0=Date.now();
    while(Date.now()-t0<300000){await new Promise(r=>setTimeout(r,1500));
      const r=await c.rpc('ff_itch_take',{p_code:code});const row=r&&r.data&&r.data[0];
      if(row){const s=await c.auth.setSession({access_token:row.access_token,refresh_token:row.refresh_token});if(s.error)throw s.error;onSession(s.data.session);await loadProf();paint();close();mark();busy=false;return;}}
    msg='시간이 지났어요. 다시 눌러 주세요.';ok=false;
  }catch(e){msg=errKo(e);ok=false;}
  busy=false;draw();}
""" % START + html[b:]
    rep("location.href='https://frenchfries777.com/games/?r='+Date.now();", SITE_OPEN)
    rep('<script src="https://frenchfries777.com/games/ff-auth.js"></script>', '')
else:  # beaconfall
    rep('<button class="main" id="alogin">로그인</button>', '<button class="main" id="alogin">Google</button>')
    rep('<input id="auser"', '<input id="auser" style="display:none"')
    rep('<input id="apass"', '<input id="apass" style="display:none"')
    rep('<button id="asign">', '<button id="asign" style="display:none">')
    rep("bl.onclick=login;bs.onclick=sign;", """function ffItchLogin(){
  if(!sb)return say('서버에 연결하지 못했어요. 인터넷을 확인하고 다시 시도해 주세요.');
  %s
  if(!w)return say('로그인 창이 막혔어요. 이 페이지의 팝업을 허용해 주세요.');
  say('열린 창에서 Google 로그인을 마쳐 주세요.',true);
  const t0=Date.now();
  const poll=setInterval(async()=>{
    if(Date.now()-t0>300000){clearInterval(poll);say('시간이 지났어요. 다시 눌러 주세요.');return;}
    try{
      const r=await sb.rpc('ff_itch_take',{p_code:code});const row=r&&r.data&&r.data[0];
      if(row){clearInterval(poll);say('로그인 중…',true);
        const s=await sb.auth.setSession({access_token:row.access_token,refresh_token:row.refresh_token});if(s.error)throw s.error;
        const us=(s.data.session&&s.data.session.user)||s.data.user;let name=(us.email||'').split('@')[0];
        try{const q=await sb.from('profiles').select('username').eq('id',us.id).single();if(q.data&&q.data.username)name=q.data.username;}catch(e){}
        say('');enter(name,us.id);}
    }catch(e){clearInterval(poll);say('로그인하지 못했어요. 다시 해 주세요.');}
  },1500);
}
bl.onclick=ffItchLogin;bs.onclick=sign;""" % START)
    rep("if(e.key==='Enter')login();", "if(e.key==='Enter')ffItchLogin();")
    rep('<button class="btn sm" data-gosite>사이트로 이동</button>', '<button class="btn sm" data-gosite>사이트 열기</button>')
    rep("location.href='https://frenchfries777.com/games/?r='+Date.now();", SITE_OPEN)

# small ItchEdition tag
tag = '<style>#ffItchTag{position:fixed;left:6px;bottom:4px;z-index:2147483000;font:600 10px/1 system-ui,sans-serif;color:#fff;opacity:.45;pointer-events:none;text-shadow:0 0 3px #000}</style><div id="ffItchTag">ItchEdition</div>'
rep('</body>', tag + '</body>')

if os.path.exists(out): shutil.rmtree(out)
os.makedirs(out)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
for f in os.listdir(src):
    p = os.path.join(src, f)
    if os.path.isfile(p) and re.search(r'\.(mp3|png|jpg|webp|svg|woff2|json)$', f) and f not in ('versions.json', 'patchnotes.json') and f in html:
        shutil.copy(p, out)
for d in ('emoji', 'ach-icons'):
    if os.path.isdir(os.path.join(src, d)) and (d + '/') in html:
        shutil.copytree(os.path.join(src, d), os.path.join(out, d))
print('built', game, 'from', fn, '->', out)

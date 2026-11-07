#!/usr/bin/env python3
"""Vowkeep 이전 버전(v0.1) 폴더를 파일 하나짜리 HTML로 묶어요. 사용: python3 scripts/build-vowkeep-old.py
결과: vowkeep/Vowkeep-v0.1.html (3D 라이브러리는 인터넷에서 불러와요)"""
import base64,re,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','vowkeep','v0.1')
b64=lambda b:base64.b64encode(b).decode()
rd=lambda p,m='r':open(os.path.join(R,p),m,**({'encoding':'utf-8'} if m=='r' else {})).read()
html=rd('index.html')
mods={}
for n in ['data','map','sim','sfx','music','render']:
    s=rd(f'js/{n}.js')
    if n=='music':
        s=s.replace("new Audio(FILES[k])","new Audio(window.VKA[FILES[k]]||FILES[k])").replace("new Audio('vowkeep-intro.mp3')","new Audio(window.VKA['vowkeep-intro.mp3'])")
    mods[n]=s
fix=lambda s:re.sub(r"from '\./(\w+)\.js'",r"from 'vk/\1.js'",s)
imap={"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}
for n,s in mods.items(): imap[f'vk/{n}.js']='data:text/javascript;base64,'+b64(fix(s).encode())
main=fix(rd('js/main.js'))
aud={f:'data:audio/mpeg;base64,'+b64(open(os.path.join(R,f),'rb').read()) for f in ['vowkeep-lobby.mp3','vowkeep-dungeon.mp3','vowkeep-boss.mp3','vowkeep-intro.mp3']}
import json
# 인터넷 서버(로그인·피어)와 이어지는 스크립트는 빼요
html=re.sub(r'<script src="https://[^"]*(ff-lang|ff-auth)\.js"></script>\n?','',html)
html=re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/peerjs[^"]*"></script>\n?','',html)
html=re.sub(r'<script type="importmap">.*?</script>','<script>window.VKA='+json.dumps(aud)+';</script>\n<script type="importmap">'+json.dumps({"imports":imap})+'</script>',html,count=1,flags=re.S)
html=re.sub(r'<script type="module" src="js/main\.js[^"]*"></script>',lambda m:'<script type="module">\n'+main+'\n</script>',html,count=1)
for f,t in [('logo.svg','image/svg+xml'),('claude.png','image/png')]:
    html=html.replace(f'"{f}"','"data:%s;base64,%s"'%(t,b64(open(os.path.join(R,f),'rb').read())))
html=html.replace('url(../../isleport/Galmuri11.woff2)','url(https://frenchfries777.com/games/isleport/Galmuri11.woff2)').replace('url(../../isleport/Galmuri11-Bold.woff2)','url(https://frenchfries777.com/games/isleport/Galmuri11-Bold.woff2)')
out=os.path.join(R,'..','Vowkeep-v0.1.html');open(out,'w',encoding='utf-8').write(html);print(out,len(html)//1024,'KB')

#!/usr/bin/env python3
"""Crown Envoy / Beaconfall itch edition builder.
Usage: build_itch_other.py <crownenvoy|beaconfall> <games/<game> dir> <out dir>
Patches only the copy: original login stays as is, no hub account script,
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
    # login modal stays as is (ID/password)
    rep("location.href='https://frenchfries777.com/games/?r='+Date.now();", SITE_OPEN)
    rep('<script src="https://frenchfries777.com/games/ff-auth.js"></script>', '')
else:  # beaconfall
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

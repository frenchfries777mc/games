#!/usr/bin/env python3
"""Stickseum itch edition builder. Usage: build_stickseum_itch.py <games/stickseum dir> <out dir>
Copies the latest game into a standalone folder and patches only the copy:
 - login: the original ID/password login and guest mode stay as is
 - no ff-auth.js (no hub button / account menu / GitHub login), no 'back to site' button
"""
import sys, re, shutil, os, json
src, out = sys.argv[1], sys.argv[2]
ver = json.load(open(os.path.join(src, 'versions.json')))
game = [v for v in ver['versions'] if v.get('latest')][0]['file']
if os.path.exists(out): shutil.rmtree(out)
os.makedirs(out)
html = open(os.path.join(src, game), encoding='utf-8').read()

# 1. login gate: the original ID/password form stays as is
a = html.index('function renderAuthGateForm(){')
b = html.index('initAuthGate();', a)
fn = html[a:b]
end = fn.rindex('\n}')
# (Google login removed: original ID/password form stays as is)


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

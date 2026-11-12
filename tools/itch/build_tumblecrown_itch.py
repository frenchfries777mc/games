#!/usr/bin/env python3
"""Tumble Crown itch edition. Usage: build_tumblecrown_itch.py <games/prototypes/tumblecrown dir> <out dir>
Copies the game folder (without the Oracle dedicated-host files), removes the hub account script,
makes the site-exit button open the site in a new tab, adds a small 'ItchEdition' tag."""
import sys, shutil, os, re
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns('dedicated-host', 'patchnotes.json'))
p = os.path.join(out, 'index.html'); h = open(p, encoding='utf-8').read()
h, n = re.subn(r'<script src="https://frenchfries777\.com/games/ff-auth\.js[^"]*"></script>', '', h); assert n == 1
tag = '<style>#ffItchTag{position:fixed;left:6px;bottom:4px;z-index:2147483000;font:600 10px/1 system-ui,sans-serif;color:#fff;opacity:.45;pointer-events:none;text-shadow:0 0 3px #000}</style><div id="ffItchTag">ItchEdition</div>'
assert '</body>' in h; h = h.replace('</body>', tag + '</body>', 1)
# Galmuri font (OFL): the game reads it from ../../isleport/ on the site; ship it inside the package
iso = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(src))), 'isleport')
for f in ('Galmuri11.woff2', 'Galmuri11-Bold.woff2', 'OFL.txt'):
    shutil.copy(os.path.join(iso, f), os.path.join(out, f))
h = h.replace('url(../../isleport/Galmuri11.woff2)', 'url(Galmuri11.woff2)').replace('url(../../isleport/Galmuri11-Bold.woff2)', 'url(Galmuri11-Bold.woff2)')
open(p, 'w', encoding='utf-8').write(h)
m = os.path.join(out, 'js', 'main.js'); s = open(m, encoding='utf-8').read()
old = "setTimeout(() => { location.href = '../../'; }, 250);"
assert old in s
open(m, 'w', encoding='utf-8').write(s.replace(old, "window.open('https://frenchfries777.com/games/', '_blank');"))
print('built tumblecrown ->', out)

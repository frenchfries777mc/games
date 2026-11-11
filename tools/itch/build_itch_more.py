#!/usr/bin/env python3
"""Dummy Party / Gatecrash / Isleport itch edition builder.
Usage: build_itch_more.py <dummyparty|gatecrash|isleport> <games dir> <out dir>
Patches only the copy: login stays the original ID/password one (no Google/GitHub buttons),
exit buttons open the site in a new tab, and a small 'ItchEdition' tag shows bottom-left."""
import sys, re, shutil, os, json
game, root, out = sys.argv[1], sys.argv[2], sys.argv[3]
if os.path.exists(out):
    shutil.rmtree(out)

TAG = ('<style>#ffItchTag{position:fixed;left:6px;bottom:4px;z-index:2147483000;font:600 10px/1 system-ui,sans-serif;'
       'color:#fff;opacity:.45;pointer-events:none;text-shadow:0 0 3px #000}</style><div id="ffItchTag">ItchEdition</div>')
# hub login popup: keep ID/password, hide social buttons and the hub shortcut (they do not work inside an itch frame)
NOSOCIAL = ('<style>#ffaModal .or,#ffaModal .oas,#ffaModal .b>p,.ffa-oa,.ffa-hub{display:none!important}</style>')
SITE_OPEN = "window.open('https://frenchfries777.com/games/','_blank');"
HUB = 'https://frenchfries777.com/games/'


def rep(html, old, new, count=1):
    assert html.count(old) >= 1, 'not found: ' + old[:80]
    return html.replace(old, new, count)


def add_tag(html, extra=''):
    assert '</body>' in html
    return html.replace('</body>', extra + TAG + '</body>', 1)


def copy(src, names):
    for n in names:
        s = os.path.join(src, n)
        d = os.path.join(out, n)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy(s, d)


if game == 'dummyparty':
    src = os.path.join(root, 'dummyparty', 'play')
    os.makedirs(out)
    copy(src, ['claude.png', 'logo.svg', 'chairs-a.mp3', 'chairs-b.mp3', 'party-home.mp3', 'party-intro.mp3', 'party-main.mp3'])
    html = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
    html = rep(html, "location.href = 'https://frenchfries777.com/games/dummyparty/';", "window.open('https://frenchfries777.com/games/dummyparty/', '_blank');")
    html = rep(html, '<a href="../">← Dummy Party 사이트로</a>', '<a href="https://frenchfries777.com/games/dummyparty/" target="_blank" rel="noopener">← Dummy Party 사이트</a>')
    html = add_tag(html, NOSOCIAL)

elif game == 'gatecrash':
    src = os.path.join(root, 'gatecrash', 'play')
    shutil.copytree(src, out, ignore=shutil.ignore_patterns('patchnotes.json'))
    html = open(os.path.join(out, 'index.html'), encoding='utf-8').read()
    html = rep(html, '"../../ff-presence.js"', '"' + HUB + 'ff-presence.js"')
    html = rep(html, '"../../ff-pnsearch.js"', '"' + HUB + 'ff-pnsearch.js"')
    iso = os.path.join(root, 'isleport')
    for f in ('Galmuri11.woff2', 'Galmuri11-Bold.woff2', 'OFL.txt'):
        shutil.copy(os.path.join(iso, f), os.path.join(out, f))
    html = html.replace('url(../../isleport/Galmuri11.woff2)', 'url(Galmuri11.woff2)').replace('url(../../isleport/Galmuri11-Bold.woff2)', 'url(Galmuri11-Bold.woff2)')
    html = add_tag(html, NOSOCIAL)

elif game == 'isleport':
    src = os.path.join(root, 'isleport')
    ver = json.load(open(os.path.join(src, 'versions.json')))
    fn = ver['latestFile']
    os.makedirs(out)
    names = [f for f in os.listdir(src) if f.startswith('isleport-') and f.endswith('.mp3')]
    names += ['Galmuri11.woff2', 'Galmuri11-Bold.woff2', 'OFL.txt']
    copy(src, names)
    html = open(os.path.join(src, fn), encoding='utf-8').read()
    html = rep(html, "location.href='https://frenchfries777.com/games/'", SITE_OPEN.rstrip(';'))
    html = add_tag(html)
else:
    sys.exit('unknown game')

open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
print('built', game, '->', out)

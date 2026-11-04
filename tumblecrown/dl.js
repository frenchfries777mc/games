/* Tumble Crown 다운로드: 여러 파일(index.html + js 모듈)을 html 하나로 묶어요.
   모듈은 data: 주소로 넣고, 그림·글꼴은 사이트 주소(base)에서 불러와요. 인터넷 연결은 필요해요. */
(function (root) {
  var NAMES = ['data', 'main', 'map', 'music', 'render', 'sfx', 'sim', 'tr'];
  var BASE = 'https://frenchfries777.com/games/prototypes/tumblecrown/';
  function b64(s) {
    if (typeof Buffer !== 'undefined') return Buffer.from(s, 'utf8').toString('base64');
    var bytes = new TextEncoder().encode(s), bin = '', i, CH = 0x8000;
    for (i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }
  function make(indexHtml, files) {
    var imports = { 'three': 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', 'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/' };
    NAMES.forEach(function (n) {
      var src = files[n].replace(/(\bfrom\s*|\bimport\s*)(['"])\.\/([\w-]+)\.js\2/g, '$1$2tc-$3$2');
      imports['tc-' + n] = 'data:text/javascript;base64,' + b64(src);
    });
    return indexHtml
      .replace(/<script type="importmap">[\s\S]*?<\/script>/, function () { return '<script type="importmap">' + JSON.stringify({ imports: imports }) + '</script>'; })
      .replace(/<script type="module" src="js\/main\.js[^"]*"><\/script>/, '<script type="module">import "tc-main";</script>')
      .replace(/<script>\(function\(\)\{var B=\d+;try\{fetch\('build\.json[\s\S]*?<\/script>/, '')
      .replace('<head>', '<head><base href="' + BASE + '">');
  }
  function fetchAll() {
    var P = '../prototypes/tumblecrown/', out = {};
    return Promise.all([fetch(P + 'index.html', { cache: 'no-store' }).then(function (r) { return r.text(); })].concat(NAMES.map(function (n) {
      return fetch(P + 'js/' + n + '.js', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) { out[n] = t; });
    }))).then(function (a) { return make(a[0], out); });
  }
  root.tcDownload = function (name) {
    return fetchAll().then(function (html) {
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    });
  };
  root.tcMakeHtml = make;
  if (typeof module !== 'undefined') module.exports = make;
})(typeof window !== 'undefined' ? window : globalThis);

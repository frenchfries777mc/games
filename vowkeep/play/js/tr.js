// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 번역: 게임 글은 한국어가 원문이에요. 다른 언어는 lang/xx.js 표에서 한국어 문장을 그대로 찾아 바꿔요
// 언어는 사이트 공용 언어(ff-lang.js의 FFLang)를 따르고, 없으면 브라우저 언어, 표에 없는 언어면 영어예요
// 새 문구를 넣을 때: 코드에서 T('한국어 문장') 또는 T('vC {0}', 값)처럼 쓰고, lang/ 아래 모든 언어 표에 같은 한국어 키로 번역을 넣어요
export const LANGS = ['ko', 'en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ru', 'tr', 'it', 'pl', 'ar', 'nw', 'gk'];
const LV = 64;   // lang/ 표를 바꾸면 BUILD와 같게 올려요
function pickLang() {
  let l = null;
  try { l = window.FFLang && FFLang.get(); } catch (e) { }
  if (!l) { try { for (const x of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'ko'])) { const b = String(x).toLowerCase().split('-')[0]; if (LANGS.includes(b)) { l = b; break; } } } catch (e) { } }
  if (!l) return 'ko';
  return LANGS.includes(l) ? l : 'en';
}
export const LANG = pickLang();
const load = l => import('./lang/' + l + '.js?v=' + LV).then(m => m.default || {}, () => ({}));
let D = {}, EN = {};
if (LANG !== 'ko') [D, EN] = await Promise.all([load(LANG), LANG === 'en' ? Promise.resolve({}) : load('en')]);
// T('한국어', 값0, 값1): 번역을 찾고 {0} {1} 자리에 값을 넣어요. 표에 없으면 영어, 그것도 없으면 한국어 그대로
export function T(s, ...a) {
  let r = s;
  if (LANG !== 'ko' && s != null) { const v = D[s]; r = v != null && v !== '' ? v : (EN[s] != null && EN[s] !== '' ? EN[s] : s); }
  if (a.length) r = String(r).replace(/\{(\d)\}/g, (m, i) => a[i] != null ? a[i] : m);
  return r;
}
// 페이지에 박힌 글(index.html)을 한 번 바꿔요: 글 조각, alt·title·aria-label, 설명 메타
export function trDom(root) {
  if (LANG === 'ko') return;
  try { document.documentElement.lang = LANG; } catch (e) { }
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT), list = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) list.push(n);
  for (const n of list) {
    const raw = n.nodeValue, k = raw.trim(); if (!k || !/[가-힣]/.test(k)) continue;
    const t = T(k); if (t !== k) n.nodeValue = raw.replace(k, t);
  }
  (root || document).querySelectorAll('[alt],[title],[aria-label]').forEach(e => { for (const at of ['alt', 'title', 'aria-label']) { const v = e.getAttribute(at); if (v && /[가-힣]/.test(v)) e.setAttribute(at, T(v)); } });
  const m = document.querySelector('meta[name=description]'); if (m) m.content = T(m.content);
}

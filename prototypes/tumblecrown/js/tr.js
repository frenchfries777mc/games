// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 문구는 한국어만 써요 (다른 언어는 번역 전담이 나중에 처리해요)
export const LANGS = ['ko'], LANG = 'ko';
export function T(s, ...a) {
  let r = s;
  if (a.length) r = String(r).replace(/\{(\d)\}/g, (m, i) => a[i] != null ? a[i] : m);
  return r;
}
export function trDom() { }

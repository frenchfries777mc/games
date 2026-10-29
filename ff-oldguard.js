/* 옛 고정 버전 페이지용 안전장치: 옛 버전으로 레벨·마스터리·점수·코인·업적을 쉽게 올리는 꼼수를 막아요.
   옛 버전 html 맨 위(<head> 바로 아래, supabase 라이브러리보다 먼저)에 이 파일을 불러오게 해 둬요. 현재 버전에는 넣지 마세요.
   막는 것: 기록을 올리는 서버 함수(rpc), 프로필 통계(profiles.stats) 쓰기, 계정에 저장하는 진행도(클라우드 저장, auth.updateUser data).
   읽기·로그인·친구·채팅은 그대로 돼요. 옛 버전의 내 기기 저장(localStorage)도 그대로예요. */
(function(){
'use strict';
if(window.__ffOldGuard) return; window.__ffOldGuard=1;
var BLOCK=/^(ff_(set|sync|mark|coin|ach|rank|survival|add|claim|exp)|ce_|dp_(coin|buy|wallet))/i;
var ERR={data:null,error:{message:'old-version'}};
function wrap(c){
  if(!c||c.__ffo) return c; c.__ffo=1;
  try{ var r0=c.rpc&&c.rpc.bind(c); if(r0) c.rpc=function(n,a,o){ if(BLOCK.test(String(n))) return Promise.resolve(ERR); return r0(n,a,o); }; }catch(e){}
  try{ var f0=c.from&&c.from.bind(c); if(f0) c.from=function(t){ var q=f0(t);
    if(t==='profiles'&&q&&q.update){ var u=q.update.bind(q); q.update=function(p){ if(p&&typeof p==='object'&&'stats' in p) return Promise.resolve(ERR); return u.apply(null,arguments); }; }
    return q; }; }catch(e){}
  try{ var a=c.auth; if(a&&a.updateUser){ var uu=a.updateUser.bind(a); a.updateUser=function(p){ if(p&&p.data&&typeof p.data==='object'&&Object.keys(p.data).length) return Promise.resolve(ERR); return uu.apply(null,arguments); }; } }catch(e){}
  return c;
}
function hook(lib){ if(!lib||!lib.createClient||lib.__ffo) return; lib.__ffo=1; var cc=lib.createClient; lib.createClient=function(){ return wrap(cc.apply(this,arguments)); }; }
if(window.supabase) hook(window.supabase);
else { try{ var v; Object.defineProperty(window,'supabase',{configurable:true,enumerable:true,get:function(){ return v; },set:function(x){ v=x; hook(x); }}); }catch(e){} }
/* 안내 띠 문구 (언어별). 고르는 법은 ff-profile.js 와 같아요: 게임이 정한 언어(arenaClashLang) → 브라우저 언어 → 영어 */
var BANNER={ko:"이전 버전이라 업적·랭킹·코인·진행도 기록이 계정에 저장되지 않아요. 최신 버전에서 이어서 해 주세요.",
 en:"This is an older version, so achievements, rankings, coins and progress are not saved to your account. Please keep playing in the latest version.",
 es:"Esta es una versión anterior, así que los logros, las clasificaciones, las monedas y el progreso no se guardan en tu cuenta. Sigue jugando en la última versión.",
 fr:"Ceci est une ancienne version : les succès, classements, pièces et progrès ne sont pas enregistrés sur ton compte. Continue dans la dernière version.",
 de:"Dies ist eine ältere Version, daher werden Erfolge, Ranglisten, Münzen und Fortschritt nicht auf deinem Konto gespeichert. Bitte in der neuesten Version weiterspielen.",
 ja:"旧バージョンのため、実績・ランキング・コイン・進行度はアカウントに保存されません。最新バージョンで続けてください。",
 zh:"这是旧版本，成就、排名、金币和进度不会保存到账号。请在最新版本中继续。",
 pt:"Esta é uma versão antiga, por isso conquistas, rankings, moedas e progresso não são salvos na sua conta. Continue na versão mais recente.",
 ru:"Это старая версия, поэтому достижения, рейтинги, монеты и прогресс не сохраняются в вашем аккаунте. Продолжайте в последней версии.",
 tr:"Bu eski bir sürüm; başarımlar, sıralamalar, jetonlar ve ilerleme hesabınıza kaydedilmiyor. Lütfen en son sürümde devam edin.",
 it:"Questa è una versione precedente, quindi obiettivi, classifiche, monete e progressi non vengono salvati sul tuo account. Continua nell’ultima versione.",
 pl:"To starsza wersja, więc osiągnięcia, rankingi, monety i postęp nie są zapisywane na koncie. Graj dalej w najnowszej wersji.",
 ar:"هذه نسخة قديمة، لذلك لا تُحفظ الإنجازات والترتيب والعملات والتقدم في حسابك. يُرجى المتابعة في أحدث نسخة.",
 nw:"Old version: plusdoings, rankings, coins and progress not truekept to your account. Continue in latest version.",
 gk:"이전 버전 이다 업적들·랭킹·코인·진행 기록 계정 에 구하다 아니다! 최신 버전 안 에서 이어서 놀다 해 주세요."};
function bannerLang(){ var c=[]; try{ var s=localStorage.getItem('arenaClashLang'); if(s) c.push(s); }catch(e){} try{ c=c.concat(navigator.languages||[navigator.language||'']); }catch(e){} for(var i=0;i<c.length;i++){ var b=String(c[i]||'').toLowerCase().split('-')[0]; if(BANNER[b]) return b; } return 'en'; }
function note(){
  if(!document.body||document.getElementById('ffOldVer')) return;
  var d=document.createElement('div'); d.id='ffOldVer';
  d.style.cssText='position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99999;max-width:92vw;padding:8px 12px;border-radius:10px;background:rgba(20,22,28,.92);color:#f2e7c0;font:12px/1.4 sans-serif;text-align:center;pointer-events:none';
  d.textContent=BANNER[bannerLang()]||BANNER.en;
  document.body.appendChild(d);
}
/* 사이트(http/https)에서 연 옛 버전은 플레이할 수 없어요: 화면을 덮고 다운로드 버튼만 보여 줘요. 내려받은 파일(file://)은 그대로 열려요. */
var BLOCKED={"ko":{"t":"이전 버전은 사이트에서 플레이할 수 없어요","b":"다운로드","s":"이 버전은 파일로 내려받아서만 할 수 있어요. 최신 버전은 사이트에서 바로 플레이할 수 있어요."},"en":{"t":"Older versions can't be played on the site","b":"Download","s":"This version can only be played as a downloaded file. The latest version can be played right on the site."},"es":{"t":"Las versiones anteriores no se pueden jugar en el sitio","b":"Descargar","s":"Esta versión solo se puede jugar como archivo descargado. La última versión se juega directamente en el sitio."},"fr":{"t":"Les anciennes versions ne se jouent pas sur le site","b":"Télécharger","s":"Cette version ne se joue qu'en fichier téléchargé. La dernière version se joue directement sur le site."},"de":{"t":"Ältere Versionen sind auf der Seite nicht spielbar","b":"Herunterladen","s":"Diese Version ist nur als heruntergeladene Datei spielbar. Die neueste Version läuft direkt auf der Seite."},"ja":{"t":"旧バージョンはサイトではプレイできません","b":"ダウンロード","s":"このバージョンはダウンロードしたファイルでのみ遊べます。最新バージョンはサイトでそのまま遊べます。"},"zh":{"t":"旧版本不能在网站上游玩","b":"下载","s":"该版本只能下载文件后游玩。最新版本可以直接在网站上游玩。"},"pt":{"t":"Versões antigas não podem ser jogadas no site","b":"Baixar","s":"Esta versão só pode ser jogada como arquivo baixado. A versão mais recente pode ser jogada direto no site."},"ru":{"t":"Старые версии нельзя играть на сайте","b":"Скачать","s":"Эту версию можно играть только скачав файл. Последнюю версию можно сразу играть на сайте."},"tr":{"t":"Eski sürümler sitede oynanamaz","b":"İndir","s":"Bu sürüm yalnızca indirilen dosya olarak oynanabilir. En son sürüm doğrudan sitede oynanabilir."},"it":{"t":"Le versioni precedenti non si possono giocare sul sito","b":"Scarica","s":"Questa versione si può giocare solo come file scaricato. L'ultima versione si gioca direttamente sul sito."},"pl":{"t":"Starszych wersji nie można grać na stronie","b":"Pobierz","s":"Tę wersję można grać tylko jako pobrany plik. Najnowszą wersję można grać bezpośrednio na stronie."},"ar":{"t":"لا يمكن تشغيل الإصدارات القديمة على الموقع","b":"تنزيل","s":"لا يمكن تشغيل هذا الإصدار إلا كملف محمّل. يمكن تشغيل أحدث إصدار مباشرةً على الموقع."}};
function blockPlay(){
  if(!/^https?:$/.test(location.protocol)||document.getElementById('ffOldBlock')) return;
  if(!document.body){ document.addEventListener('DOMContentLoaded',blockPlay); return; }
  var T=BLOCKED[bannerLang()]||BLOCKED.en, f=decodeURIComponent((location.pathname||'').split('/').pop()||'game.html');
  var d=document.createElement('div'); d.id='ffOldBlock';
  d.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;background:#0d0f14;color:#f2e7c0;font:16px/1.6 sans-serif;text-align:center';
  var h=document.createElement('div'); h.style.cssText='font-size:22px;font-weight:800'; h.textContent=T.t;
  var p=document.createElement('div'); p.style.cssText='max-width:30em;opacity:.85'; p.textContent=T.s;
  var a=document.createElement('a'); a.href=f; a.setAttribute('download',f); a.textContent='⬇ '+T.b; a.style.cssText='padding:12px 26px;border-radius:12px;background:#d4af4f;color:#2a1c0a;font-weight:800;text-decoration:none';
  d.appendChild(h); d.appendChild(p); d.appendChild(a); document.body.appendChild(d);
  document.documentElement.style.overflow='hidden';
  try{ var q=document.querySelectorAll('audio,video'); for(var i=0;i<q.length;i++){ q[i].pause(); q[i].muted=true; } }catch(e){}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',note); else note();
blockPlay();
})();

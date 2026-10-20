/* Frenchfries777 계정 로그인 (허브 · 게임 사이트 공용)
   쓰는 법 (사이트 HTML에):
     <span data-ff-account></span>                         ← 로그인 버튼 / 닉네임이 들어갈 자리 (여러 개 가능)
     <script src="https://frenchfries777mc.github.io/games/ff-auth.js"></script>
   - frenchfries777mc.github.io 아래의 모든 페이지는 로그인 정보를 같이 써요. 여기서 로그인하면 Stickseum · Beaconfall 게임은
     따로 할 것 없이 로그인된 채로 열려요 (supabase-js 기본 저장 위치 sb-<프로젝트>-auth-token 을 그대로 쓰기 때문).
   - 닉네임을 누르면 공용 프로필 카드(ff-profile.js)와 로그아웃이 나와요.
   - 스크립트로 쓰고 싶으면: FFAuth.ready.then(sb=>...), FFAuth.user(), FFAuth.onChange(fn), FFAuth.openLogin(), FFAuth.openProfile(), FFAuth.signOut()
   - 페이지에 이미 같은 프로젝트의 supabase 클라이언트가 있으면 이 스크립트보다 먼저 window.FFAuthClient = sb; 로 넘겨 주세요. */
(function(){
'use strict';
if(window.FFAuth) return;
var SB_URL='https://kebsbuvuutilitwlvxzv.supabase.co', SB_KEY='sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf';
var SB_LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
var me=document.currentScript, BASE=(me&&me.src)?me.src.replace(/[^\/]*$/,''):'https://frenchfries777mc.github.io/games/';

var L={
 ko:{login:'로그인',signup:'계정 만들기',logout:'로그아웃',card:'🪪 프로필 카드',id:'아이디 (영문/숫자, 3~16자)',pw:'비밀번호 (6자 이상)',busy:'처리 중...',
     title:'Frenchfries777 계정',sub:'Stickseum, Crown Envoy, Beaconfall 모두 같은 계정이에요. 여기서 로그인하면 게임에서도 로그인된 채로 시작해요.',
     badId:'아이디는 영문/숫자/밑줄 3~16자로 해주세요.',badPw:'비밀번호는 6자 이상으로 해주세요.',taken:'이미 있는 아이디예요.',cred:'아이디 또는 비밀번호가 틀렸어요.',
     rate:'로그인을 너무 많이 시도했어요. 몇 분 뒤에 다시 해 주세요.',net:'서버에 연결하지 못했어요. 인터넷을 확인해 주세요.',fail:'로그인하지 못했어요.',
     noAcc:'계정이 없나요?',hasAcc:'이미 계정이 있나요?',close:'닫기',hi:'{0}님',hub:'허브',hubT:'Frenchfries777 허브로 돌아가기'},
 en:{login:'Log in',signup:'Create account',logout:'Log out',card:'🪪 Profile card',id:'Username (letters/numbers, 3–16)',pw:'Password (6+ characters)',busy:'Working...',
     title:'Frenchfries777 account',sub:'Stickseum, Crown Envoy and Beaconfall share one account. Log in here and the games start logged in too.',
     badId:'Use 3–16 letters, numbers or underscores.',badPw:'Use at least 6 characters.',taken:'That username is taken.',cred:'Wrong username or password.',
     rate:'Too many tries. Please wait a few minutes.',net:'Could not reach the server. Check your connection.',fail:'Could not log in.',
     noAcc:'No account yet?',hasAcc:'Already have an account?',close:'Close',hi:'{0}',hub:'Hub',hubT:'Back to the Frenchfries777 hub'},
 es:{login:'Iniciar sesión',signup:'Crear cuenta',logout:'Cerrar sesión',card:'🪪 Tarjeta de perfil',id:'Usuario (letras/números, 3–16)',pw:'Contraseña (6+ caracteres)',busy:'Procesando...',
     title:'Cuenta Frenchfries777',sub:'Stickseum, Crown Envoy y Beaconfall comparten una cuenta. Inicia sesión aquí y los juegos empiezan con la sesión iniciada.',
     badId:'Usa de 3 a 16 letras, números o guiones bajos.',badPw:'Usa al menos 6 caracteres.',taken:'Ese usuario ya existe.',cred:'Usuario o contraseña incorrectos.',
     rate:'Demasiados intentos. Espera unos minutos.',net:'No se pudo conectar con el servidor.',fail:'No se pudo iniciar sesión.',
     noAcc:'¿No tienes cuenta?',hasAcc:'¿Ya tienes cuenta?',close:'Cerrar',hi:'{0}',hub:'Inicio',hubT:'Volver al inicio de Frenchfries777'},
 fr:{login:'Se connecter',signup:'Créer un compte',logout:'Se déconnecter',card:'🪪 Carte de profil',id:'Identifiant (lettres/chiffres, 3–16)',pw:'Mot de passe (6+ caractères)',busy:'Traitement...',
     title:'Compte Frenchfries777',sub:'Stickseum, Crown Envoy et Beaconfall partagent un seul compte. Connecte-toi ici et les jeux démarrent déjà connectés.',
     badId:'Utilise 3 à 16 lettres, chiffres ou tirets bas.',badPw:'Au moins 6 caractères.',taken:'Cet identifiant est déjà pris.',cred:'Identifiant ou mot de passe incorrect.',
     rate:'Trop de tentatives. Réessaie dans quelques minutes.',net:'Impossible de joindre le serveur.',fail:'Connexion impossible.',
     noAcc:'Pas encore de compte ?',hasAcc:'Déjà un compte ?',close:'Fermer',hi:'{0}',hub:'Accueil',hubT:'Retour à l’accueil Frenchfries777'},
 de:{login:'Anmelden',signup:'Konto erstellen',logout:'Abmelden',card:'🪪 Profilkarte',id:'Benutzername (Buchstaben/Zahlen, 3–16)',pw:'Passwort (mind. 6 Zeichen)',busy:'Wird bearbeitet...',
     title:'Frenchfries777-Konto',sub:'Stickseum, Crown Envoy und Beaconfall nutzen ein Konto. Hier anmelden und die Spiele starten schon angemeldet.',
     badId:'3–16 Buchstaben, Zahlen oder Unterstriche.',badPw:'Mindestens 6 Zeichen.',taken:'Dieser Name ist vergeben.',cred:'Benutzername oder Passwort falsch.',
     rate:'Zu viele Versuche. Bitte ein paar Minuten warten.',net:'Server nicht erreichbar.',fail:'Anmeldung fehlgeschlagen.',
     noAcc:'Noch kein Konto?',hasAcc:'Schon ein Konto?',close:'Schließen',hi:'{0}',hub:'Start',hubT:'Zurück zur Frenchfries777-Startseite'},
 ja:{login:'ログイン',signup:'アカウント作成',logout:'ログアウト',card:'🪪 プロフィールカード',id:'ID（英数字、3〜16文字）',pw:'パスワード（6文字以上）',busy:'処理中...',
     title:'Frenchfries777アカウント',sub:'Stickseum、Crown Envoy、Beaconfallは同じアカウントです。ここでログインすると、ゲームもログインした状態で始まります。',
     badId:'IDは英数字とアンダーバーで3〜16文字にしてください。',badPw:'パスワードは6文字以上にしてください。',taken:'そのIDはすでに使われています。',cred:'IDまたはパスワードが違います。',
     rate:'試行回数が多すぎます。数分後にもう一度お試しください。',net:'サーバーに接続できませんでした。',fail:'ログインできませんでした。',
     noAcc:'アカウントがありませんか？',hasAcc:'すでにアカウントがありますか？',close:'閉じる',hi:'{0}さん',hub:'ハブ',hubT:'Frenchfries777 ハブに戻る'}
};
function lang(){ var c=[]; try{ var s=localStorage.getItem('arenaClashLang'); if(s) c.push(s); }catch(e){} try{ c=c.concat(navigator.languages||[navigator.language||'']); }catch(e){}
  for(var i=0;i<c.length;i++){ var b=String(c[i]||'').toLowerCase().split('-')[0]; if(L[b]) return b; } return 'en'; }
var T=L[lang()];
/* the shared language setting (ff-lang.js): pages that load only this script still keep the games' language keys in step */
if(!window.FFLang){ try{ var ls=document.createElement('script'); ls.src=BASE+'ff-lang.js'; document.head.appendChild(ls); }catch(e){} }
function fmt(s,a){ return String(s).replace('{0}',a); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function loadScript(src, test){ return new Promise(function(res){ if(test()) return res(true); var s=document.createElement('script'); s.src=src; s.onload=function(){ res(test()); }; s.onerror=function(){ res(false); }; document.head.appendChild(s); }); }

var sb=null, user=null, prof=null, subs=[];
var ready=(async function(){
  try{
    if(window.FFAuthClient) sb=window.FFAuthClient;
    else if(await loadScript(SB_LIB, function(){ return !!(window.supabase&&window.supabase.createClient); })) sb=window.supabase.createClient(SB_URL, SB_KEY);
  }catch(e){ sb=null; }
  if(!sb){ paint(); return null; }
  try{ var r=await sb.auth.getSession(); await setUser(r&&r.data&&r.data.session&&r.data.session.user); }catch(e){ await setUser(null); }
  sb.auth.onAuthStateChange(function(ev, session){ var u=session&&session.user; if((u&&u.id)!==(user&&user.id)) setTimeout(function(){ setUser(u); },0); });   // never await Supabase calls inside this callback (it can lock up)
  return sb;
})();

async function setUser(u){
  user=u||null; prof=null;
  if(user){ try{ var r=await sb.from('profiles').select('username,display_name').eq('id',user.id).single(); prof=(r&&r.data)||null; }catch(e){} }
  paint(); subs.forEach(function(f){ try{ f(user, prof); }catch(e){} });
  if(user&&!prof&&!isIdAcct(user)) setTimeout(openSetup,0);
}
function nick(){ return (prof&&(prof.display_name||prof.username)) || (user&&String(user.email||'').split('@')[0]) || ''; }

/* ---- the same login rules as the games (id -> internal e-mail, typo-tolerant password) ---- */
/* ID accounts are stored as <id>@<domain>. The domain is moving arenaclash.local -> frenchfries777.com (DB converted): sign-in still accepts both;
   ID_DOM is the one domain new/renamed accounts use. */
var ID_DOM='frenchfries777.com', ID_DOM_OLD=['arenaclash.local','frenchfries777.com'];
function idLocal(u){ return String(u).toLowerCase().replace(/[^a-z0-9_]/g,''); }
function emailFor(u){ return idLocal(u)+'@'+ID_DOM; }
function emailsFor(u){ var l=idLocal(u), out=[emailFor(u)]; ID_DOM_OLD.forEach(function(d){ var e=l+'@'+d; if(out.indexOf(e)<0) out.push(e); }); return out; }
function pwVariants(p){
  p=String(p==null?'':p); var out=[p]; function add(x){ if(x&&out.indexOf(x)<0) out.push(x); }
  var clean=p.replace(/[\u200B-\u200D\uFEFF\u00A0]/g,''), trimmed=clean.trim(), nfkc=trimmed.normalize('NFKC');
  add(clean); add(trimmed); add(nfkc);
  function swap(x){ return x.replace(/[\u20A9\u005C]/g,function(c){ return c==='\u20A9'?'\u005C':'\u20A9'; }); }
  if(/[\u20A9\u005C]/.test(p)){ add(swap(p)); add(swap(trimmed)); add(swap(nfkc)); }
  return out.slice(0,6);
}
function errText(e){ var m=String((e&&e.message)||''), c=String((e&&(e.code||e.error_code))||''), s=(e&&e.status)||0;
  if(c==='invalid_credentials'||/invalid login credentials/i.test(m)) return T.cred;
  if(s===429||/rate limit|too many/i.test(m)) return T.rate;
  if(!s||/fetch|network|timeout|failed to|load failed/i.test(m)) return T.net;
  return T.fail; }
async function signIn(id, pw){
  var emails=emailsFor(String(id||'').trim()), err=null, vs=pwVariants(pw);
  for(var j=0;j<emails.length;j++){
    for(var i=0;i<vs.length;i++){ var r; try{ r=await sb.auth.signInWithPassword({email:emails[j], password:vs[i]}); }catch(e){ r={error:{message:String(e&&e.message||e)}}; }
      if(!r.error){ pwSave(id,vs[i]); await setUser(r.data.user); return {ok:true}; }
      err=r.error; if(errText(err)!==T.cred) return {error:errText(err)}; } }
  return {error:errText(err)};
}
async function signUp(id, pw){
  id=String(id||'').trim();
  if(!/^[a-zA-Z0-9_]{3,16}$/.test(id)) return {error:T.badId};
  if(!pw||pw.length<6) return {error:T.badPw};
  var r=await sb.auth.signUp({email:emailFor(id), password:pw});
  if(r.error) return {error:/already|registered/i.test(r.error.message)?T.taken:errText(r.error)};
  var p=await sb.from('profiles').insert({id:r.data.user.id, username:id, display_name:id.slice(0,12)});
  if(p.error) return {error:T.taken};
  pwSave(id,pw); await setUser(r.data.user); return {ok:true};
}
/* ---- GitHub / Google login (Supabase OAuth). Providers must be turned on in the Supabase dashboard; a social account
   gets its own login ID + nickname the first time (profiles row), and an old ID account can link them in My account ---- */
var OAL={
 ko:{or:'또는',gh:'GitHub로 계속하기',gg:'Google로 계속하기',off:'아직 이 로그인 방법이 켜져 있지 않아요.',
     setT:'아이디 정하기',setP:'처음 오셨네요. 게임과 친구 찾기에 쓸 아이디를 정해 주세요. 닉네임은 처음에 아이디로 정해져요(내 계정에서 바꿀 수 있어요).',nick:'닉네임 (최대 12자)',go:'시작하기',later:'취소하고 로그아웃',
     linkT:'연결된 로그인',linkP:'연결해 두면 아이디·비밀번호 대신 이 버튼으로도 같은 계정에 로그인해요.',link:'연결',linked:'✓ 연결됨',pwSoc:'이 계정은 GitHub나 Google 버튼으로 로그인해요.',linkErr:'연결하지 못했어요. 이미 다른 계정에 연결된 것일 수 있어요.'},
 en:{or:'or',gh:'Continue with GitHub',gg:'Continue with Google',off:'This login method is not turned on yet.',
     setT:'Pick a username',setP:'Welcome! Pick the username you will use in the games and for friends. Your nickname starts as your username (change it in My account).',nick:'Nickname (up to 12)',go:'Start',later:'Cancel and log out',
     linkT:'Linked logins',linkP:'Once linked, this button logs you into the same account instead of your username and password.',link:'Link',linked:'✓ Linked',pwSoc:'This account logs in with the GitHub or Google button.',linkErr:'Could not link. It may already belong to another account.'},
 es:{or:'o',gh:'Continuar con GitHub',gg:'Continuar con Google',off:'Este método de inicio aún no está activado.',
     setT:'Elige un usuario',setP:'¡Bienvenido! Elige el usuario para los juegos y los amigos. El apodo empieza igual que el usuario (cámbialo en Mi cuenta).',nick:'Apodo (máx. 12)',go:'Empezar',later:'Cancelar y cerrar sesión',
     linkT:'Inicios vinculados',linkP:'Al vincularlo, este botón entra en la misma cuenta sin usuario ni contraseña.',link:'Vincular',linked:'✓ Vinculado',pwSoc:'Esta cuenta entra con el botón de GitHub o Google.',linkErr:'No se pudo vincular. Puede que ya pertenezca a otra cuenta.'},
 fr:{or:'ou',gh:'Continuer avec GitHub',gg:'Continuer avec Google',off:'Ce mode de connexion n’est pas encore activé.',
     setT:'Choisis un identifiant',setP:'Bienvenue ! Choisis l’identifiant pour les jeux et les amis. Le pseudo commence comme l’identifiant (modifiable dans Mon compte).',nick:'Pseudo (12 max)',go:'Commencer',later:'Annuler et se déconnecter',
     linkT:'Connexions liées',linkP:'Une fois lié, ce bouton ouvre le même compte sans identifiant ni mot de passe.',link:'Lier',linked:'✓ Lié',pwSoc:'Ce compte se connecte avec le bouton GitHub ou Google.',linkErr:'Liaison impossible. Il appartient peut-être déjà à un autre compte.'},
 de:{or:'oder',gh:'Weiter mit GitHub',gg:'Weiter mit Google',off:'Diese Anmeldeart ist noch nicht eingeschaltet.',
     setT:'Benutzernamen wählen',setP:'Willkommen! Wähle den Benutzernamen für die Spiele und Freunde. Der Spitzname startet als Benutzername (änderbar in Mein Konto).',nick:'Spitzname (max. 12)',go:'Los geht’s',later:'Abbrechen und abmelden',
     linkT:'Verknüpfte Anmeldungen',linkP:'Verknüpft meldet dich dieser Knopf ohne Benutzername und Passwort im selben Konto an.',link:'Verknüpfen',linked:'✓ Verknüpft',pwSoc:'Dieses Konto meldet sich mit dem GitHub- oder Google-Knopf an.',linkErr:'Verknüpfen fehlgeschlagen. Es gehört vielleicht schon zu einem anderen Konto.'},
 ja:{or:'または',gh:'GitHubで続ける',gg:'Googleで続ける',off:'このログイン方法はまだ有効になっていません。',
     setT:'IDを決める',setP:'はじめまして。ゲームとフレンド検索で使うIDを決めてください。ニックネームは最初はIDになります(マイアカウントで変更できます)。',nick:'ニックネーム(12文字まで)',go:'はじめる',later:'やめてログアウト',
     linkT:'連携したログイン',linkP:'連携すると、IDとパスワードの代わりにこのボタンで同じアカウントにログインできます。',link:'連携',linked:'✓ 連携済み',pwSoc:'このアカウントはGitHubかGoogleのボタンでログインします。',linkErr:'連携できませんでした。別のアカウントに連携済みかもしれません。'}
};
function OA(){ return OAL[lang()]||OAL.en; }
var OAP=[['github','gh','<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0z"/></svg>'],
 ['google','gg','<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>']];
function backUrl(){ return location.origin+location.pathname+location.search; }   // no #hash: Supabase puts its tokens there
function isIdAcct(u){ return /@(arenaclash\.local|frenchfries777\.com)$/i.test(String((u&&u.email)||'')); }
function oaBtns(){ return OAP.map(function(x){ return '<button type="button" class="ffa-oa" data-p="'+x[0]+'">'+x[2]+'<span>'+esc(OA()[x[1]])+'</span></button>'; }).join(''); }
function oaErr(e){ return /not enabled|unsupported provider|provider is not/i.test(String((e&&e.message)||''))?OA().off:errText(e); }
async function oauth(p, m){
  if(!sb){ if(m) m.textContent=T.net; return; }
  if(m) m.textContent=T.busy;
  try{ var r=await sb.auth.signInWithOAuth({provider:p, options:{redirectTo:backUrl()}}); if(r&&r.error&&m) m.textContent=oaErr(r.error); }   // on success the page leaves for GitHub/Google
  catch(e){ if(m) m.textContent=oaErr(e); }
}
/* the first visit after a GitHub/Google login: no profiles row yet, so ask for a login ID (unique, like the ID accounts) and a nickname */
function suggestId(u){ var md=(u&&u.user_metadata)||{}, s=String(md.user_name||md.preferred_username||String(u.email||'').split('@')[0]||'').replace(/[^a-zA-Z0-9_]/g,'').slice(0,16); return s.length>=3?s:''; }
function openSetup(){
  if(!user||prof||isIdAcct(user)) return; css();
  var O=OA(), el=document.getElementById('ffaSetup'); if(el) el.remove();
  el=document.createElement('div'); el.id='ffaSetup'; el.setAttribute('data-notr','');
  el.innerHTML='<form class="b"><h3>'+esc(O.setT)+'</h3><p>'+esc(O.setP)+'</p>'+
    '<input name="u" autocapitalize="off" spellcheck="false" maxlength="16" placeholder="'+esc(T.id)+'">'+
    '<div class="m"></div>'+
    '<button type="submit" class="ffa-btn go">'+esc(O.go)+'</button><div class="sw"><a>'+esc(O.later)+'</a></div></form>';
  document.body.appendChild(el);
  var f=el.querySelector('form'), m=el.querySelector('.m'); f.u.value=suggestId(user);
  el.querySelector('.sw a').onclick=function(){ el.remove(); signOut(); };
  f.onsubmit=async function(e){ e.preventDefault(); var id=f.u.value.trim(), go=el.querySelector('.go');
    if(!/^[a-zA-Z0-9_]{3,16}$/.test(id)){ m.textContent=T.badId; return; }
    go.disabled=true; m.textContent=T.busy;
    try{ var d=await sb.from('profiles').select('id').ilike('username',likeEsc(id)).limit(1);
      if(d&&d.data&&d.data.length){ m.textContent=T.taken; return; }
      var r=await sb.from('profiles').insert({id:user.id, username:id, display_name:id.slice(0,12)});
      if(r.error){ m.textContent=/duplicate|unique|23505/i.test(JSON.stringify(r.error))?T.taken:T.fail; return; }
      el.remove(); await setUser(user);
    }catch(x){ m.textContent=T.fail; } finally{ go.disabled=false; } };
}
async function signOut(){ pwClear(); try{ if(sb) await sb.auth.signOut({scope:'local'}); }catch(e){} await setUser(null); }   // 'local': only this browser, other devices stay logged in

/* ---- UI ---- */
var CSS='.ffa-btn{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d));color:#1a1206;border:0;border-radius:9px;padding:7px 13px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}'+
 '[data-ff-account] .ffa-btn{width:124px;justify-content:center;box-sizing:border-box;padding-left:0;padding-right:0}.ffa-btn:hover{filter:brightness(1.06)}.ffa-wrap{position:relative;display:inline-flex;align-items:center;flex-wrap:nowrap;margin-left:16px}[data-ff-account]{display:inline-flex;align-items:center;flex:none;flex-wrap:nowrap;white-space:nowrap;vertical-align:middle}'+
 '.ffa-hub{display:inline-flex!important;align-items:center;gap:5px;margin-left:16px;background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 11px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;vertical-align:middle}'+
 '.ffa-hub:hover{border-color:var(--fry,#ffc93c);color:var(--fry,#ffc93c)}.ffa-hub+.ffa-wrap{margin-left:8px}'+
 '@media(max-width:620px){.ffa-hub{position:fixed;left:12px;bottom:12px;z-index:2147481000;margin:0;padding:9px 14px;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.45)}.ffa-hub+.ffa-wrap{margin-left:16px}}'+
 '.ffa-chip{display:inline-flex;align-items:center;gap:7px;background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 11px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;width:124px;max-width:124px;box-sizing:border-box}'+
 '.ffa-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ffa-chip:hover{border-color:var(--fry,#ffc93c)}'+
 '.ffa-menu{position:absolute;right:0;top:calc(100% + 6px);background:#10131b;border:1px solid #2b3245;border-radius:10px;padding:6px;min-width:170px;z-index:2147482000;box-shadow:0 12px 30px rgba(0,0,0,.45);display:none}'+
 '.ffa-menu button{display:block;width:100%;text-align:left;background:none;border:0;color:#eef0f5;font:inherit;font-size:14px;padding:9px 10px;border-radius:7px;cursor:pointer}.ffa-menu button:hover{background:#1b2030}'+
 '#ffaModal{position:fixed;inset:0;z-index:2147482500;background:rgba(5,6,10,.72);display:none;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '#ffaModal .b{width:100%;max-width:360px;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:22px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5)}'+
 '#ffaModal h3{margin:0 0 6px;font-size:19px}#ffaModal p{margin:0 0 16px;color:#8a93a6;font-size:13px;line-height:1.5}'+
 '#ffaModal input{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}'+
 '#ffaModal input:focus{outline:none;border-color:var(--fry,#ffc93c)}#ffaModal .ffa-btn{width:100%;justify-content:center;padding:11px;font-size:15px}'+
 '#ffaModal .m{min-height:18px;font-size:13px;color:#ff9b7a;margin:0 0 10px}#ffaModal .sw{margin-top:14px;text-align:center;font-size:13px;color:#8a93a6}'+
 '#ffaModal .pwr,#ffaAcct .pwr{position:relative}#ffaModal .pwr input,#ffaAcct .pwr input{padding-right:44px}#ffaModal .eye,#ffaAcct .eye{position:absolute;right:4px;top:3px;width:38px;height:38px;background:none;border:0;font-size:18px;cursor:pointer;opacity:.7}'+
 '#ffaModal .or,#ffaSetup .or{display:flex;align-items:center;gap:10px;margin:14px 0 10px;color:#8a93a6;font-size:12px}#ffaModal .or:before,#ffaModal .or:after{content:"";flex:1;height:1px;background:#2b3245}'+
 '.ffa-oa{display:flex;width:100%;align-items:center;justify-content:center;gap:9px;margin:0 0 8px;padding:10px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}.ffa-oa:hover{border-color:var(--fry,#ffc93c)}'+
 '#ffaSetup{position:fixed;inset:0;z-index:2147482600;background:rgba(5,6,10,.8);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '#ffaSetup .b{width:100%;max-width:360px;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:22px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5)}#ffaSetup h3{margin:0 0 6px;font-size:19px}#ffaSetup p{margin:0 0 16px;color:#8a93a6;font-size:13px;line-height:1.5}'+
 '#ffaSetup input{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}#ffaSetup input:focus{outline:none;border-color:var(--fry,#ffc93c)}'+
 '#ffaSetup .ffa-btn{width:100%;justify-content:center;padding:11px;font-size:15px}#ffaSetup .m{min-height:18px;font-size:13px;color:#ff9b7a;margin:0 0 10px}#ffaSetup .sw{margin-top:14px;text-align:center;font-size:13px}#ffaSetup .sw a{color:#8a93a6;cursor:pointer;text-decoration:underline}'+
 '#ffaModal .ffa-in .ffa-oa span{display:none}#ffaModal .ffa-in .ffa-oa{display:inline-flex;width:44px;height:40px;padding:0;margin:0 4px}#ffaModal .ffa-in .oas{text-align:center}#ffaModal .ffa-in .or{margin:12px 0 8px}'+
 '.ffa-menu .ffa-ph{display:none}@media(min-width:621px){.ffa-nbc{display:none!important}}@media(max-width:620px){.ffa-menu .ffa-ph{display:block}.ffa-bell,.ffa-vote{display:none!important}.ffa-menu .ffa-ph .ffa-badge{position:static;margin-left:6px}.ffa-nbc{position:absolute;top:-4px;right:-4px;margin:0;min-width:8px;width:8px;height:8px;padding:0;font-size:0;border-radius:50%}}'+
 '.ffa-lk{display:flex;align-items:center;gap:9px;margin:0 0 8px;padding:8px 10px;border:1px solid #2b3245;border-radius:9px;background:#08090d}.ffa-lk span{flex:1;font-weight:700;font-size:14px}.ffa-lk b{color:#7ddc8a;font-size:13px}.ffa-lk .ffa-btn{padding:6px 12px;font-size:13px}'+
 '#ffaModal .sw a{color:var(--fry,#ffc93c);cursor:pointer;margin-left:4px}#ffaModal .x{float:right;background:none;border:0;color:#8a93a6;font-size:20px;cursor:pointer;line-height:1}'+
 '#ffaModal,#ffaSetup,#ffaFriends,#ffaDM,#ffaRep{-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}'+
 '#ffaModal .b,#ffaSetup .b,#ffaFriends .b,#ffaDM .b,#ffaRep .b{animation:ffaPop .18s ease-out;position:relative;overflow:hidden}'+
 '#ffaModal .b:before,#ffaSetup .b:before,#ffaFriends .b:before,#ffaDM .b:before,#ffaRep .b:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d))}'+
 '@keyframes ffaPop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}'+
 '#ffaModal h3,#ffaSetup h3{font-weight:800;letter-spacing:-.01em}#ffaModal .m,#ffaSetup .m{min-height:8px}'+
 '#ffaModal .x{width:30px;height:30px;border-radius:50%;margin:-6px -6px 0 0;transition:background .15s,color .15s}#ffaModal .x:hover{background:rgba(255,255,255,.1);color:#fff}'+
 '#ffaModal .sw,#ffaSetup .sw{display:block;border:0;background:none;box-shadow:none;border-radius:0;padding:0;height:auto;width:auto;min-width:0;margin:14px 0 0;text-align:center;font-size:13px;color:#8a93a6}'+
 '#ffaModal .sw a{font-weight:800}#ffaModal .ffa-oa{transition:border-color .15s,transform .15s}#ffaModal .ffa-oa:hover{transform:translateY(-1px)}'+
 '@media(prefers-reduced-motion:reduce){#ffaModal .b,#ffaSetup .b,#ffaFriends .b,#ffaDM .b,#ffaRep .b{animation:none}}'+
 '@media(max-width:620px){[data-ff-account] .ffa-btn,.ffa-chip{width:104px;max-width:104px}}';
function css(){ if(document.getElementById('ffaCss')) return; var s=document.createElement('style'); s.id='ffaCss'; s.textContent=CSS; document.head.appendChild(s); }

var mode='in';
function modal(){
  css(); var el=document.getElementById('ffaModal'); if(el) return el;
  el=document.createElement('div'); el.id='ffaModal'; el.setAttribute('data-notr','');
  el.innerHTML='<form class="b" autocomplete="on"><button type="button" class="x" aria-label="'+esc(T.close)+'">×</button><h3></h3><p>'+esc(T.sub)+'</p>'+
    '<input name="username" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="16" placeholder="'+esc(T.id)+'">'+
    '<div class="pwr"><input name="password" type="password" placeholder="'+esc(T.pw)+'"><button type="button" class="eye" aria-label="'+esc(AL().show)+'">👁</button></div>'+
    '<div class="m"></div><button type="submit" class="ffa-btn go"></button><div class="or">'+esc(OA().or)+'</div>'+'<div class="oas">'+oaBtns()+'</div><div class="sw"><span></span><a></a></div></form>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ if(e.target===el) close(); });
  el.querySelector('.x').onclick=close;
  el.querySelector('.eye').onclick=function(){ var i=el.querySelector('input[name=password]'); i.type=i.type==='password'?'text':'password'; };
  el.querySelector('.sw a').onclick=function(){ mode=mode==='in'?'up':'in'; fill(); };
  el.querySelectorAll('.ffa-oa').forEach(function(b){ b.onclick=function(){ oauth(b.getAttribute('data-p'), el.querySelector('.m')); }; });
  el.querySelector('form').onsubmit=async function(e){
    e.preventDefault(); var f=e.target, m=el.querySelector('.m'), go=el.querySelector('.go');
    if(!sb){ m.textContent=T.net; return; }
    m.textContent=T.busy; go.disabled=true;
    var r=mode==='in'?await signIn(f.username.value, f.password.value):await signUp(f.username.value, f.password.value);
    go.disabled=false;
    if(r.error){ m.textContent=r.error; return; }
    f.password.value=''; close();
  };
  return el;
}
function fill(){ var el=modal(); el.querySelector('h3').textContent=mode==='in'?T.title:T.signup; el.querySelector('.go').textContent=mode==='in'?T.login:T.signup;
  el.querySelector('.sw span').textContent=mode==='in'?T.noAcc:T.hasAcc; el.querySelector('.sw a').textContent=mode==='in'?T.signup:T.login;
  el.querySelector('input[name=password]').setAttribute('autocomplete',mode==='in'?'current-password':'new-password'); el.querySelector('.m').textContent='';
  el.querySelector('form').classList.toggle('ffa-in',mode==='in'); }
function openLogin(m){ mode=m==='up'?'up':'in'; fill(); var el=modal(); el.style.display='flex'; setTimeout(function(){ try{ el.querySelector('input').focus(); }catch(e){} },30); }
function close(){ var el=document.getElementById('ffaModal'); if(el) el.style.display='none'; }

function profileLib(){ return loadScript(BASE+'ff-profile.js?v=20261017d', function(){ return !!window.FFProfile; }); }
async function openProfile(uid){ if(!sb) return; if(!uid&&!user) return openLogin(); if(await profileLib()) window.FFProfile.open(sb, uid||user.id); }

/* 게임 사이트(허브가 아닌 페이지)에는 계정 버튼 옆에 '← 허브' 버튼을 붙여요. 빼고 싶으면 자리에 data-ff-nohub */
var HUB=BASE, onHub=location.href.indexOf(HUB)===0 && !/\/(stickseum|crownenvoy|beaconfall|isleport|educations|tools)\//i.test(location.pathname||''), SETURL=HUB+'settings/';
function hubLink(s){ return (onHub||s.hasAttribute('data-ff-nohub'))?'':'<a class="ffa-hub" href="'+esc(HUB)+'" title="'+esc(T.hubT)+'" aria-label="'+esc(T.hubT)+'">\u2190<span class="t">'+esc(T.hub)+'</span></a>'; }
function paint(){
  css(); var slots=document.querySelectorAll('[data-ff-account]');
  for(var i=0;i<slots.length;i++){
    var s=slots[i]; s.setAttribute('data-notr','');
    if(!user){ s.innerHTML=hubLink(s)+'<span class="ffa-wrap"><button type="button" class="ffa-btn">🍟 '+esc(T.login)+'</button></span>'; s.querySelector('button').onclick=function(){ openLogin(); }; continue; }
    s.innerHTML=hubLink(s)+'<span class="ffa-wrap"><button type="button" class="ffa-chip" aria-haspopup="true">🍟 <span>'+esc(fmt(T.hi,nick()))+'</span><i class="ffa-badge" style="display:none;font-style:normal"></i><i class="ffa-badge ffa-nb ffa-nbc" style="display:none;font-style:normal"></i> ▾</button>'+
      '<span class="ffa-menu" role="menu"><button type="button" data-a="friends">'+esc(F.friends)+'<span class="ffa-badge" style="display:none"></span></button><button type="button" data-a="card">'+esc(T.card)+'</button><button type="button" data-a="acct">'+esc(AL().menu)+'</button><button type="button" data-a="notes" class="ffa-ph">🔔 '+esc(N.bell)+'<span class="ffa-badge ffa-nb" style="display:none"></span></button><button type="button" data-a="set" class="ffa-ph">'+esc('⚙️ '+S_.set)+'</button><button type="button" data-a="out">'+esc(T.logout)+'</button></span></span>';
    (function(s){ var menu=s.querySelector('.ffa-menu');
      s.querySelector('.ffa-chip').onclick=function(e){ e.stopPropagation(); var open=menu.style.display==='block'; closeMenus(); menu.style.display=open?'none':'block'; };
      menu.querySelector('[data-a=friends]').onclick=function(){ closeMenus(); openFriends(); };
      menu.querySelector('[data-a=card]').onclick=function(){ closeMenus(); openProfile(); };
      menu.querySelector('[data-a=acct]').onclick=function(){ closeMenus(); location.href=SETURL+'#account'; };
      menu.querySelector('[data-a=set]').onclick=function(){ closeMenus(); location.href=SETURL; };
      menu.querySelector('[data-a=notes]').onclick=function(e){ e.stopPropagation(); closeMenus(); var w=s.querySelector('.ffa-wrap'), pn=w&&w.querySelector('.ffa-notes'); if(!pn) return; pn.style.display='block'; paintNotes(pn); markRead(); };
      menu.querySelector('[data-a=out]').onclick=function(){ closeMenus(); signOut(); };
    })(s);
  }
  if(typeof badge==='function') try{ badge(); }catch(e){}
  if(typeof socialPaint==='function') try{ socialPaint(); }catch(e){}
  try{ setPaint(); }catch(e){}
  try{ votePaint(); }catch(e){}
}
function closeMenus(){ var ms=document.querySelectorAll('.ffa-menu,.ffa-notes'); for(var i=0;i<ms.length;i++) ms[i].style.display='none'; }
document.addEventListener('click', closeMenus);
document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenus(); close(); closeAcct(); } });

/* ---- my account: nickname, login ID, password (same stored-password option as the games: localStorage arenaClashPw / arenaClashPwOpt) ---- */
var ALT={
 ko:{menu:'👤 내 계정',title:'내 계정',show:'비밀번호 보기',nick:'닉네임 (최대 12자)',id:'아이디 (영문/숫자, 3~16자)',save:'저장',saved:'저장했어요.',same:'바뀐 게 없어요.',
     pwT:'비밀번호',pwNone:'이 기기에는 저장된 비밀번호가 없어요. 다시 로그인하면 저장돼요.',view:'보기',hide:'숨기기',copy:'복사',copied:'복사했어요.',
     newPw:'새 비밀번호 (6~72자)',chg:'비밀번호 변경',keep:'이 기기에 비밀번호 기억하기',keepN:'서버에는 비밀번호가 저장되지 않아요(볼 수 없음). 이 기기의 브라우저에만 저장돼요.',
     badNick:'닉네임을 입력해 주세요.',badPw:'비밀번호는 6~72자로 해주세요.',idDone:'아이디를 바꿨어요. 다음부터 새 아이디로 로그인해요.',pwDone:'비밀번호를 바꿨어요.',err:'처리하지 못했어요. 잠시 뒤 다시 해 주세요.',idNote:'아이디를 바꾸면 모든 게임에서 새 아이디로 로그인해요.'},
 en:{menu:'👤 My account',title:'My account',show:'Show password',nick:'Nickname (up to 12)',id:'Username (letters/numbers, 3–16)',save:'Save',saved:'Saved.',same:'Nothing changed.',
     pwT:'Password',pwNone:'No password is stored on this device. Log in again to store it.',view:'Show',hide:'Hide',copy:'Copy',copied:'Copied.',
     newPw:'New password (6–72)',chg:'Change password',keep:'Remember my password on this device',keepN:'The server never stores a readable password. It is kept only in this browser.',
     badNick:'Type a nickname.',badPw:'Password must be 6–72 characters.',idDone:'Username changed. Use the new one next time.',pwDone:'Password changed.',err:'Something went wrong. Try again soon.',idNote:'The new username works in every game.'},
 es:{menu:'👤 Mi cuenta',title:'Mi cuenta',show:'Mostrar contraseña',nick:'Apodo (máx. 12)',id:'Usuario (letras/números, 3–16)',save:'Guardar',saved:'Guardado.',same:'Sin cambios.',
     pwT:'Contraseña',pwNone:'No hay contraseña guardada en este dispositivo. Inicia sesión de nuevo para guardarla.',view:'Ver',hide:'Ocultar',copy:'Copiar',copied:'Copiado.',
     newPw:'Nueva contraseña (6–72)',chg:'Cambiar contraseña',keep:'Recordar mi contraseña en este dispositivo',keepN:'El servidor nunca guarda una contraseña legible. Solo se guarda en este navegador.',
     badNick:'Escribe un apodo.',badPw:'La contraseña debe tener 6–72 caracteres.',idDone:'Usuario cambiado. Usa el nuevo la próxima vez.',pwDone:'Contraseña cambiada.',err:'Algo salió mal. Inténtalo de nuevo.',idNote:'El nuevo usuario sirve en todos los juegos.'},
 fr:{menu:'👤 Mon compte',title:'Mon compte',show:'Afficher le mot de passe',nick:'Pseudo (12 max)',id:'Identifiant (lettres/chiffres, 3–16)',save:'Enregistrer',saved:'Enregistré.',same:'Rien n\'a changé.',
     pwT:'Mot de passe',pwNone:'Aucun mot de passe enregistré sur cet appareil. Reconnectez-vous pour l\'enregistrer.',view:'Voir',hide:'Masquer',copy:'Copier',copied:'Copié.',
     newPw:'Nouveau mot de passe (6–72)',chg:'Changer le mot de passe',keep:'Retenir mon mot de passe sur cet appareil',keepN:'Le serveur ne garde jamais de mot de passe lisible. Il reste seulement dans ce navigateur.',
     badNick:'Saisissez un pseudo.',badPw:'Le mot de passe doit faire 6–72 caractères.',idDone:'Identifiant changé. Utilisez le nouveau la prochaine fois.',pwDone:'Mot de passe changé.',err:'Une erreur est survenue. Réessayez.',idNote:'Le nouvel identifiant fonctionne dans tous les jeux.'},
 de:{menu:'👤 Mein Konto',title:'Mein Konto',show:'Passwort anzeigen',nick:'Spitzname (max. 12)',id:'Benutzername (Buchstaben/Zahlen, 3–16)',save:'Speichern',saved:'Gespeichert.',same:'Nichts geändert.',
     pwT:'Passwort',pwNone:'Auf diesem Gerät ist kein Passwort gespeichert. Melde dich neu an, um es zu speichern.',view:'Anzeigen',hide:'Verbergen',copy:'Kopieren',copied:'Kopiert.',
     newPw:'Neues Passwort (6–72)',chg:'Passwort ändern',keep:'Passwort auf diesem Gerät merken',keepN:'Der Server speichert nie ein lesbares Passwort. Es bleibt nur in diesem Browser.',
     badNick:'Gib einen Spitznamen ein.',badPw:'Das Passwort braucht 6–72 Zeichen.',idDone:'Benutzername geändert. Nutze beim nächsten Mal den neuen.',pwDone:'Passwort geändert.',err:'Etwas ist schiefgelaufen. Versuch es gleich nochmal.',idNote:'Der neue Benutzername gilt in allen Spielen.'},
 ja:{menu:'👤 マイアカウント',title:'マイアカウント',show:'パスワードを表示',nick:'ニックネーム(12文字まで)',id:'ユーザーID(英数字、3〜16文字)',save:'保存',saved:'保存しました。',same:'変更はありません。',
     pwT:'パスワード',pwNone:'この端末には保存されたパスワードがありません。もう一度ログインすると保存されます。',view:'表示',hide:'隠す',copy:'コピー',copied:'コピーしました。',
     newPw:'新しいパスワード(6〜72文字)',chg:'パスワードを変更',keep:'この端末にパスワードを記憶する',keepN:'サーバーは読めるパスワードを保存しません。このブラウザにだけ保存されます。',
     badNick:'ニックネームを入力してください。',badPw:'パスワードは6〜72文字にしてください。',idDone:'IDを変更しました。次回から新しいIDでログインします。',pwDone:'パスワードを変更しました。',err:'失敗しました。しばらくしてからもう一度お試しください。',idNote:'新しいIDはすべてのゲームで使えます。'}
};
function AL(){ var t=(typeof ALT!=='undefined'&&ALT)||null; return t?(t[lang()]||t.en):{menu:'⚙️',show:''}; }
function pwOn(){ try{ return localStorage.getItem('arenaClashPwOpt')!=='0'; }catch(e){ return true; } }
function pwGet(){ try{ var o=JSON.parse(localStorage.getItem('arenaClashPw')||'null'); return o&&o.p?o:null; }catch(e){ return null; } }
function pwSave(id,p){ if(!pwOn()) return; try{ localStorage.setItem('arenaClashPw',JSON.stringify({u:String(id||'').trim().toLowerCase(),p:p})); }catch(e){} }
function pwClear(){ try{ localStorage.removeItem('arenaClashPw'); }catch(e){} }
/* per-account local settings: stored as <name>:<user id> so two accounts on one browser never share them. Logged out = the old plain <name> key. The first account to log in after this change adopts the old shared value (nothing is deleted). */
function userKey(base){
  if(!user) return base;
  var k=base+':'+user.id;
  try{ if(localStorage.getItem(k)==null){ var old=localStorage.getItem(base), flag=base+'.adopted'; if(old!=null&&!localStorage.getItem(flag)){ localStorage.setItem(k,old); localStorage.setItem(flag,user.id); } } }catch(e){}
  return k;
}
/* ---- developers: ff_devs (supabase-ff-dev.sql). 'owner' designates 'dev' accounts; both get a title badge ---- */
var DEVL={ko:{o:'총괄 개발자',d:'개발자',h:'개발자 지정',ph:'아이디 입력',add:'지정',del:'해제',none:'지정된 개발자가 없어요.',ok:'지정했어요.',rm:'해제했어요.',nouser:'그 아이디를 찾지 못했어요.',own:'이미 총괄 개발자예요.',err:'처리하지 못했어요. (SQL을 실행했는지 확인해 주세요)',note:'지정된 개발자는 다른 사람을 지정할 수 없어요.'},
 en:{o:'Lead Developer',d:'Developer',h:'Designate developers',ph:'Username',add:'Add',del:'Remove',none:'No developers yet.',ok:'Added.',rm:'Removed.',nouser:'No such username.',own:'Already the lead developer.',err:'Failed. (Was the SQL run?)',note:'Designated developers cannot designate others.'},
 es:{o:'Desarrollador jefe',d:'Desarrollador',h:'Designar desarrolladores',ph:'Usuario',add:'Añadir',del:'Quitar',none:'Aún no hay desarrolladores.',ok:'Añadido.',rm:'Quitado.',nouser:'Usuario no encontrado.',own:'Ya es el desarrollador jefe.',err:'Error. (¿Se ejecutó el SQL?)',note:'Los desarrolladores designados no pueden designar a otros.'},
 fr:{o:'Développeur en chef',d:'Développeur',h:'Désigner des développeurs',ph:'Identifiant',add:'Ajouter',del:'Retirer',none:'Aucun développeur.',ok:'Ajouté.',rm:'Retiré.',nouser:'Identifiant introuvable.',own:'Déjà développeur en chef.',err:'Échec. (Le SQL a-t-il été exécuté ?)',note:'Les développeurs désignés ne peuvent pas en désigner d’autres.'},
 de:{o:'Chefentwickler',d:'Entwickler',h:'Entwickler ernennen',ph:'Benutzername',add:'Hinzufügen',del:'Entfernen',none:'Noch keine Entwickler.',ok:'Hinzugefügt.',rm:'Entfernt.',nouser:'Benutzername nicht gefunden.',own:'Bereits Chefentwickler.',err:'Fehlgeschlagen. (SQL ausgeführt?)',note:'Ernannte Entwickler können keine weiteren ernennen.'},
 ja:{o:'総括開発者',d:'開発者',h:'開発者の指定',ph:'ユーザー名',add:'指定',del:'解除',none:'指定された開発者はいません。',ok:'指定しました。',rm:'解除しました。',nouser:'そのIDが見つかりません。',own:'すでに総括開発者です。',err:'失敗しました。(SQLを実行しましたか?)',note:'指定された開発者は他の人を指定できません。'}};
var devMap=null;
function DL(){ return DEVL[lang()]||DEVL.en; }
async function loadDevs(force){ if(devMap&&!force) return devMap; devMap={}; if(!sb) return devMap;
  try{ var r=await sb.from('ff_devs').select('user_id,role'); ((r&&r.data)||[]).forEach(function(x){ devMap[x.user_id]=x.role; }); }catch(e){} return devMap; }
function devRole(id){ return (devMap&&devMap[id])||null; }
function devBadge(id){ var r=devRole(id); if(!r) return ''; var L=DL();
  return ' <span class="ffdev" data-notr style="font-size:11.5px;font-weight:700;color:'+(r==='owner'?'#ffe08a':'#9fd0ff')+';background:'+(r==='owner'?'rgba(255,196,61,.16)':'rgba(90,160,255,.16)')+';border:1px solid '+(r==='owner'?'rgba(255,196,61,.5)':'rgba(90,160,255,.45)')+';border-radius:99px;padding:1px 7px;white-space:nowrap">'+(r==='owner'?'👑 '+esc(L.o):'🛠️ '+esc(L.d))+'</span>'; }
async function devPanel(el,say){ var L=DL(), box=el.querySelector('#aDevBox'); if(!box) return; await loadDevs(true);
  if(devRole(user.id)!=='owner') { box.innerHTML=''; return; }
  var ids=Object.keys(devMap).filter(function(i){ return devMap[i]==='dev'; }), nm={};
  if(ids.length){ try{ var r=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((r&&r.data)||[]).forEach(function(p){ nm[p.id]=p.username; }); }catch(e){} }
  box.innerHTML='<h4>'+esc(L.h)+'</h4><input type="text" id="aDevId" maxlength="16" autocapitalize="off" spellcheck="false" placeholder="'+esc(L.ph)+'"><button type="button" class="ffa-btn" id="aDevGo">'+esc(L.add)+'</button><div class="m" id="aDevM"></div><p>'+esc(L.note)+'</p>'+
   '<div id="aDevList">'+(ids.length?ids.map(function(i){ return '<div class="row" style="align-items:center;margin-bottom:6px"><span style="flex:1;font-size:14px">🛠️ '+esc(nm[i]||'???')+'</span><button type="button" class="ffa-btn" data-u="'+esc(nm[i]||'')+'" style="flex:0 0 auto">'+esc(L.del)+'</button></div>'; }).join(''):'<p>'+esc(L.none)+'</p>')+'</div>';
  async function run(u,on){ if(!u) return; var r=await sb.rpc('ff_dev_set',{p_username:u,p_on:on}), v=r&&r.data;
    if(r.error||(v!=='ok'&&v!=='nouser'&&v!=='owner')) return say('aDevM',L.err);
    if(v==='nouser') return say('aDevM',L.nouser); if(v==='owner') return say('aDevM',L.own);
    await devPanel(el,say); say('aDevM',on?L.ok:L.rm,true); }
  box.querySelector('#aDevGo').onclick=function(){ run(box.querySelector('#aDevId').value.trim(),true); };
  box.querySelectorAll('[data-u]').forEach(function(b){ b.onclick=function(){ run(b.dataset.u,false); }; });
}

function closeAcct(){ var el=document.getElementById('ffaAcct'); if(el) el.style.display='none'; }
function openAcct(host){
  if(!user) return openLogin(); if(!sb) return;
  css(); var A=AL(), el=document.getElementById('ffaAcct'); if(el) el.remove();
  el=document.createElement('div'); el.id='ffaAcct'; el.setAttribute('data-notr',''); if(host) el.className='inl';
  el.style.cssText=host?'font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif':'position:fixed;inset:0;z-index:2147482500;background:rgba(5,6,10,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;overflow:auto';
  el.innerHTML='<style>#ffaAcct .b{width:100%;max-width:380px;max-height:100%;overflow:auto;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:22px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5)}'+
   '#ffaAcct h3{margin:0 0 12px;font-size:19px}#ffaAcct h4{margin:16px 0 8px;font-size:14px;color:var(--fry,#ffc93c)}#ffaAcct p{margin:0 0 8px;color:#8a93a6;font-size:12.5px;line-height:1.5}'+
   '#ffaAcct input[type=text],#ffaAcct input[type=password]{display:block;width:100%;box-sizing:border-box;margin:0 0 8px;padding:10px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}'+
   '#ffaAcct input:focus{outline:none;border-color:var(--fry,#ffc93c)}#ffaAcct .row{display:flex;gap:6px}#ffaAcct .row .ffa-btn{flex:1;justify-content:center;padding:9px}'+
   '#ffaAcct .m{min-height:18px;font-size:13px;color:#ff9b7a;margin:8px 0 0}#ffaAcct .m.ok{color:#7ddc8a}#ffaAcct .x{float:right;background:none;border:0;color:#8a93a6;font-size:20px;cursor:pointer;line-height:1}'+
   '#ffaAcct.inl .b{max-width:none;max-height:none;overflow:visible;background:none;border:0;box-shadow:none;padding:0;color:inherit}#ffaAcct.inl .x,#ffaAcct.inl h3{display:none}#ffaAcct.inl h4:first-of-type{margin-top:0}'+
   '#ffaAcct .pv{font-family:ui-monospace,monospace;background:#08090d;border:1px solid #2b3245;border-radius:9px;padding:10px 12px;margin-bottom:8px;word-break:break-all;font-size:15px}'+
   '#ffaAcct label.k{display:flex;gap:8px;align-items:center;font-size:13.5px;margin:10px 0 4px}</style>'+
   '<div class="b"><button type="button" class="x" aria-label="'+esc(T.close)+'">×</button><h3>'+esc(A.title)+'</h3>'+
   '<h4>'+esc(A.nick.replace(/\s*\(.*$/,''))+'</h4><input type="text" id="aNick" maxlength="12" placeholder="'+esc(A.nick)+'"><button type="button" class="ffa-btn" id="aNickGo">'+esc(A.save)+'</button><div class="m" id="aNickM"></div>'+
   '<h4>'+esc(A.id.replace(/\s*\(.*$/,''))+'</h4><input type="text" id="aId" maxlength="16" autocapitalize="off" spellcheck="false" placeholder="'+esc(A.id)+'"><p>'+esc(A.idNote)+'</p><button type="button" class="ffa-btn" id="aIdGo">'+esc(A.save)+'</button><div class="m" id="aIdM"></div>'+
   '<h4>'+esc(A.pwT)+'</h4><div id="aPwBox"></div>'+
   '<div class="pwr"><input type="password" id="aNew" autocomplete="new-password" placeholder="'+esc(A.newPw)+'"><button type="button" class="eye" aria-label="'+esc(A.show)+'">👁</button></div><button type="button" class="ffa-btn" id="aPwGo">'+esc(A.chg)+'</button><div class="m" id="aPwM"></div>'+
   '<label class="k"><input type="checkbox" id="aKeep"> '+esc(A.keep)+'</label><p>'+esc(A.keepN)+'</p><div id="aDevBox"></div></div>';
  (host||document.body).appendChild(el);
  var $=function(i){ return el.querySelector('#'+i); }, curId=(prof&&prof.username)||String(user.email||'').split('@')[0];
  function say(i,t,ok){ var m=$(i); m.textContent=t; m.className='m'+(ok?' ok':''); }
  $('aNick').value=(prof&&prof.display_name)||''; $('aId').value=curId; $('aKeep').checked=pwOn();
  if(!host) el.addEventListener('click',function(e){ if(e.target===el) closeAcct(); }); el.querySelector('.x').onclick=closeAcct;
  el.querySelector('.eye').onclick=function(){ var i=$('aNew'); i.type=i.type==='password'?'text':'password'; };
  function pwBox(){ var o=pwGet(), b=$('aPwBox'), shown=false;
    if(!o){ b.innerHTML='<p>'+esc(A.pwNone)+'</p>'; return; }
    b.innerHTML='<div class="pv"></div><div class="row"><button type="button" class="ffa-btn" data-k="v"></button><button type="button" class="ffa-btn" data-k="c">'+esc(A.copy)+'</button></div>';
    var pv=b.querySelector('.pv'), vb=b.querySelector('[data-k=v]');
    function draw(){ pv.textContent=shown?o.p:'•'.repeat(Math.min(o.p.length,16)); vb.textContent=shown?A.hide:A.view; }
    vb.onclick=function(){ shown=!shown; draw(); };
    b.querySelector('[data-k=c]').onclick=function(){ var done=function(){ say('aPwM',A.copied,true); };
      try{ navigator.clipboard.writeText(o.p).then(done,function(){ shown=true; draw(); }); }catch(e){ shown=true; draw(); } };
    draw(); }
  pwBox(); devPanel(el,say);
  if(!isIdAcct(user)){ var pb=$('aPwBox'); pb.innerHTML='<p>'+esc(OA().pwSoc)+'</p>'; ['aNew','aPwGo','aPwM','aKeep'].forEach(function(i){ var x=$(i); x=i==='aNew'?x.parentNode:(i==='aKeep'?x.parentNode:x); x.style.display='none'; var nx=x.nextElementSibling; if(i==='aKeep'&&nx) nx.style.display='none'; }); }
  $('aKeep').onchange=function(){ try{ localStorage.setItem('arenaClashPwOpt',this.checked?'1':'0'); }catch(e){} if(!this.checked){ pwClear(); pwBox(); } };
  $('aNickGo').onclick=async function(){ var n=$('aNick').value.trim().slice(0,12); if(!n) return say('aNickM',A.badNick);
    if(n===((prof&&prof.display_name)||'')) return say('aNickM',A.same,true);
    var r=await setNick(n); say('aNickM',r&&r.ok?A.saved:A.err,r&&r.ok); };
  $('aIdGo').onclick=async function(){ var id=$('aId').value.trim(), m='aIdM';
    if(!/^[a-zA-Z0-9_]{3,16}$/.test(id)) return say(m,T.badId);
    if(id.toLowerCase()===String(curId).toLowerCase() && id===curId) return say(m,A.same,true);
    this.disabled=true;
    try{
      var up=await sb.from('profiles').update({username:id}).eq('id',user.id);
      if(up.error) return say(m,/duplicate|unique|23505/i.test(JSON.stringify(up.error))?T.taken:A.err);
      var ch=isIdAcct(user)?await sb.auth.updateUser({email:emailFor(id)}):{};   // GitHub/Google accounts keep their real e-mail
      if(ch&&ch.error){ await sb.from('profiles').update({username:curId}).eq('id',user.id);
        return say(m,/already|registered|exists/i.test(ch.error.message||'')?T.taken:A.err); }
      var o=pwGet(); if(o) pwSave(id,o.p);
      prof=Object.assign({},prof||{},{username:id}); curId=id; paint(); say(m,A.idDone,true);
    }catch(e){ say(m,A.err); } finally{ this.disabled=false; } };
  $('aPwGo').onclick=async function(){ var p=$('aNew').value;
    if(!p||p.length<6||p.length>72) return say('aPwM',A.badPw);
    this.disabled=true;
    try{ var r=await sb.auth.updateUser({password:p});
      if(r.error) return say('aPwM',A.err);
      pwSave(curId,p); $('aNew').value=''; pwBox(); say('aPwM',A.pwDone,true);
    }catch(e){ say('aPwM',A.err); } finally{ this.disabled=false; } };
}

/* ---- friends: the same friendships table as the games, so a friend made here is a friend inside every game ----
   (requests nobody answered within 3 hours run out, like in Stickseum: expire_requests() in supabase-request-expiry.sql) */
var FL={
 ko:{friends:'👥 친구',ftitle:'친구',fnote:'여기서 맺은 친구는 게임 안에서도 친구예요.',search:'닉네임으로 친구 찾기',add:'친구 요청',sent:'요청 보냄',isFriend:'친구',
     accept:'수락',decline:'거절',cancel:'취소',remove:'삭제',sure:'정말 삭제?',inc:'받은 요청',out:'보낸 요청',list:'친구 목록',
     empty:'아직 친구가 없어요. 닉네임으로 찾아보세요.',none:'그 닉네임을 가진 사람이 없어요.',short:'두 글자 이상 입력해 주세요.',
     needNick:'친구가 나를 찾을 수 있게 닉네임을 정해 주세요.',nickPh:'닉네임 (최대 12자)',save:'저장',err:'처리하지 못했어요. 잠시 뒤 다시 해 주세요.',
     toast:'{0}님이 친구 요청을 보냈어요',view:'보기',card:'프로필',playing:'🟢 {0} 하는 중',ago:'{0} · {1} 전',mn:'{0}분',hr:'{0}시간',dy:'{0}일',now:'방금'},
 en:{friends:'👥 Friends',ftitle:'Friends',fnote:'Friends you make here are friends in every game too.',search:'Find friends by nickname',add:'Add friend',sent:'Request sent',isFriend:'Friend',
     accept:'Accept',decline:'Decline',cancel:'Cancel',remove:'Remove',sure:'Remove?',inc:'Requests for you',out:'Sent requests',list:'Friends',
     empty:'No friends yet. Search by nickname.',none:'Nobody has that nickname.',short:'Type at least two characters.',
     needNick:'Pick a nickname so friends can find you.',nickPh:'Nickname (up to 12)',save:'Save',err:'Something went wrong. Try again soon.',
     toast:'{0} sent you a friend request',view:'View',card:'Profile',playing:'🟢 Playing {0}',ago:'{0} · {1} ago',mn:'{0}m',hr:'{0}h',dy:'{0}d',now:'just now'},
 es:{friends:'👥 Amigos',ftitle:'Amigos',fnote:'Los amigos que hagas aquí también son amigos en todos los juegos.',search:'Buscar amigos por apodo',add:'Agregar',sent:'Solicitud enviada',isFriend:'Amigo',
     accept:'Aceptar',decline:'Rechazar',cancel:'Cancelar',remove:'Eliminar',sure:'¿Eliminar?',inc:'Solicitudes recibidas',out:'Solicitudes enviadas',list:'Amigos',
     empty:'Aún no tienes amigos. Busca por apodo.',none:'Nadie tiene ese apodo.',short:'Escribe al menos dos caracteres.',
     needNick:'Elige un apodo para que tus amigos te encuentren.',nickPh:'Apodo (hasta 12)',save:'Guardar',err:'Algo salió mal. Inténtalo de nuevo.',
     toast:'{0} te envió una solicitud de amistad',view:'Ver',card:'Perfil',playing:'🟢 Jugando a {0}',ago:'{0} · hace {1}',mn:'{0} min',hr:'{0} h',dy:'{0} d',now:'ahora'},
 fr:{friends:'👥 Amis',ftitle:'Amis',fnote:'Les amis ajoutés ici sont aussi tes amis dans chaque jeu.',search:'Chercher un ami par pseudo',add:'Ajouter',sent:'Demande envoyée',isFriend:'Ami',
     accept:'Accepter',decline:'Refuser',cancel:'Annuler',remove:'Retirer',sure:'Retirer ?',inc:'Demandes reçues',out:'Demandes envoyées',list:'Amis',
     empty:'Pas encore d’amis. Cherche par pseudo.',none:'Personne n’a ce pseudo.',short:'Tape au moins deux caractères.',
     needNick:'Choisis un pseudo pour que tes amis te trouvent.',nickPh:'Pseudo (12 max.)',save:'Enregistrer',err:'Un problème est survenu. Réessaie bientôt.',
     toast:'{0} t’a envoyé une demande d’ami',view:'Voir',card:'Profil',playing:'🟢 Joue à {0}',ago:'{0} · il y a {1}',mn:'{0} min',hr:'{0} h',dy:'{0} j',now:'à l’instant'},
 de:{friends:'👥 Freunde',ftitle:'Freunde',fnote:'Freunde von hier sind auch in jedem Spiel deine Freunde.',search:'Freunde per Nickname suchen',add:'Anfragen',sent:'Anfrage gesendet',isFriend:'Freund',
     accept:'Annehmen',decline:'Ablehnen',cancel:'Zurückziehen',remove:'Entfernen',sure:'Entfernen?',inc:'Erhaltene Anfragen',out:'Gesendete Anfragen',list:'Freunde',
     empty:'Noch keine Freunde. Such per Nickname.',none:'Niemand hat diesen Nickname.',short:'Mindestens zwei Zeichen eingeben.',
     needNick:'Wähle einen Nickname, damit Freunde dich finden.',nickPh:'Nickname (max. 12)',save:'Speichern',err:'Das hat nicht geklappt. Bitte gleich nochmal.',
     toast:'{0} hat dir eine Freundschaftsanfrage geschickt',view:'Ansehen',card:'Profil',playing:'🟢 Spielt {0}',ago:'{0} · vor {1}',mn:'{0} Min.',hr:'{0} Std.',dy:'{0} T.',now:'gerade'},
 ja:{friends:'👥 フレンド',ftitle:'フレンド',fnote:'ここでなったフレンドは、ゲームの中でもフレンドです。',search:'ニックネームでフレンドを探す',add:'フレンド申請',sent:'申請済み',isFriend:'フレンド',
     accept:'承認',decline:'拒否',cancel:'取り消し',remove:'削除',sure:'本当に削除？',inc:'届いた申請',out:'送った申請',list:'フレンド一覧',
     empty:'まだフレンドがいません。ニックネームで探してみましょう。',none:'そのニックネームの人はいません。',short:'2文字以上入力してください。',
     needNick:'フレンドが見つけられるようにニックネームを決めてください。',nickPh:'ニックネーム（12文字まで）',save:'保存',err:'処理できませんでした。少し後でもう一度お試しください。',
     toast:'{0}さんからフレンド申請が届きました',view:'見る',card:'プロフィール',playing:'🟢 {0} をプレイ中',ago:'{0} · {1}前',mn:'{0}分',hr:'{0}時間',dy:'{0}日',now:'たった今'}
};
var F=FL[lang()]||FL.en;
var TTL=3*60*60*1000, friends=[], frChan=null, frExpireAt=0;
function nickOf(p){ var n=p&&typeof p.display_name==='string'?p.display_name.trim():''; return n||(p&&p.username)||'???'; }
function likeEsc(s){ return String(s).replace(/[\\%_]/g,function(m){ return '\\'+m; }); }
function expired(r){ var t=r&&r.created_at?Date.parse(r.created_at):NaN; return isFinite(t)&&Date.now()-t>TTL; }
async function expireReq(force){ if(!sb||!user||(!force&&Date.now()-frExpireAt<60000)) return; frExpireAt=Date.now(); try{ await sb.rpc('expire_requests'); }catch(e){} }
async function loadFriends(){
  if(!sb||!user){ friends=[]; return friends; }
  await expireReq();
  var me=user.id, r=await sb.from('friendships').select('*').or('requester_id.eq.'+me+',addressee_id.eq.'+me);
  var rows=((r&&r.data)||[]).filter(function(x){ return !(x.status==='pending'&&expired(x)); });
  var ids=[]; rows.forEach(function(x){ var o=x.requester_id===me?x.addressee_id:x.requester_id; if(ids.indexOf(o)<0) ids.push(o); });
  var names={}; if(ids.length){ var p=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((p&&p.data)||[]).forEach(function(x){ names[x.id]=nickOf(x); }); }
  var acc=rows.filter(function(x){ return x.status==='accepted'; }).map(function(x){ return x.requester_id===me?x.addressee_id:x.requester_id; }), pres={};
  if(acc.length){ try{ var pr=await sb.from('ff_presence').select('user_id,game,at').in('user_id',acc); ((pr&&!pr.error&&pr.data)||[]).forEach(function(x){ pres[x.user_id]=x; }); }catch(e){} }   // (empty before supabase-ff-hub.sql is run)
  friends=rows.map(function(x){ var o=x.requester_id===me?x.addressee_id:x.requester_id;
    return {rowId:x.id, status:x.status, otherId:o, name:names[o]||'???', incoming:x.addressee_id===me&&x.status==='pending', outgoing:x.requester_id===me&&x.status==='pending', pres:pres[o]||null}; });
  badge(); return friends;
}
/* what a friend is playing: "🟢 Stickseum 하는 중" while the game is open (it pings every minute), else the last game and how long ago */
var GNAME={stickseum:'Stickseum',crownenvoy:'Crown Envoy',beaconfall:'Beaconfall'};
function online(f){ var t=f&&f.pres&&Date.parse(f.pres.at); return !!(t&&Date.now()-t<100000); }
function presText(f){ var p=f&&f.pres; if(!p) return ''; var g=GNAME[p.game]||p.game, t=Date.parse(p.at); if(!t) return '';
  var m=Math.max(0,Math.round((Date.now()-t)/60000)); if(online(f)) return fmt(F.playing,g);
  var a=m<1?F.now:(m<60?fmt(F.mn,m):(m<60*24?fmt(F.hr,Math.round(m/60)):fmt(F.dy,Math.round(m/1440)))); return m<1?g+' · '+a:fmt(F.ago,g).replace('{1}',a); }
function incomingCount(){ return friends.filter(function(f){ return f.incoming; }).length; }
function badge(){ var n=incomingCount(), bs=document.querySelectorAll('.ffa-chip>.ffa-badge:not(.ffa-nb),.ffa-menu [data-a=friends]>.ffa-badge'); for(var i=0;i<bs.length;i++){ bs[i].textContent=n>9?'9+':String(n); bs[i].style.display=n?'':'none'; } }
function watchFriends(){
  if(frChan){ try{ sb.removeChannel(frChan); }catch(e){} frChan=null; }
  if(!sb||!user) return;
  try{
    frChan=sb.channel('ffa-friendreq-'+user.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'friendships',filter:'addressee_id=eq.'+user.id},function(pl){ loadFriends().then(function(){ var f=friends.filter(function(x){ return pl&&pl.new&&x.rowId===pl.new.id; })[0]; if(f) toast(fmt(F.toast,f.name)); fpaint(); }); })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'friendships'},function(){ loadFriends().then(fpaint); })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'friendships'},function(){ loadFriends().then(fpaint); })
      .subscribe();
  }catch(e){}
}
async function searchUsers(q){
  q=String(q||'').trim(); if(q.length<2||!sb||!user) return [];
  var r=await sb.from('profiles').select('id,username,display_name').ilike('display_name','%'+likeEsc(q)+'%').neq('id',user.id).limit(30);
  var lq=q.toLowerCase(), rows=((r&&r.data)||[]).filter(function(u){ return u&&u.display_name; });
  function rank(u){ var n=u.display_name.toLowerCase(); return n===lq?0:(n.indexOf(lq)===0?1:2); }
  return rows.sort(function(a,b){ return rank(a)-rank(b)||String(a.display_name).localeCompare(String(b.display_name),'ko'); }).slice(0,8);
}
async function request(id){ await expireReq(true); var r=await sb.from('friendships').insert({requester_id:user.id, addressee_id:id}); await loadFriends(); return r; }
async function respond(rowId, ok){ var r=ok?await sb.from('friendships').update({status:'accepted'}).eq('id',rowId):await sb.from('friendships').delete().eq('id',rowId); await loadFriends(); return r; }
async function removeRow(rowId){ var r=await sb.from('friendships').delete().eq('id',rowId); await loadFriends(); return r; }
async function setNick(n){ n=String(n||'').trim().slice(0,12); if(!n) return {error:true}; var r=await sb.from('profiles').update({display_name:n}).eq('id',user.id); if(r&&r.error) return {error:true}; prof=Object.assign({},prof||{},{display_name:n}); paint(); return {ok:true}; }

var FCSS='.ffa-badge{display:inline-block;min-width:18px;height:18px;line-height:18px;border-radius:9px;background:#ff5a4f;color:#fff;font-size:11px;font-weight:800;text-align:center;padding:0 5px;margin-left:6px;box-sizing:border-box}'+
 '#ffaFriends{position:fixed;inset:0;z-index:2147482400;background:rgba(5,6,10,.72);display:none;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '#ffaFriends .b{width:100%;max-width:400px;max-height:calc(100vh - 32px);overflow:auto;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:20px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5);box-sizing:border-box}'+
 '#ffaFriends h3{margin:0 0 4px;font-size:19px}#ffaFriends .n{margin:0 0 14px;color:#8a93a6;font-size:13px}#ffaFriends h4{margin:16px 0 6px;font-size:13px;color:#8a93a6;font-weight:700}'+
 '#ffaFriends input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}#ffaFriends input:focus{outline:none;border-color:var(--fry,#ffc93c)}'+
 '#ffaFriends .row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:9px;background:#151a25;margin-top:6px}#ffaFriends .row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:14px;cursor:pointer}'+
 '#ffaFriends .row button,#ffaFriends .nk button{border:0;border-radius:7px;padding:6px 10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;background:#232a3a;color:#eef0f5;white-space:nowrap}'+
 '#ffaFriends .row button.p,#ffaFriends .nk button{background:linear-gradient(135deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d));color:#1a1206}#ffaFriends .row button:disabled{opacity:.6;cursor:default}#ffaFriends .row .tg{font-size:12px;color:#8a93a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}#ffaFriends .row.on .tg{color:#7dff9b;font-weight:700}'+
 '#ffaFriends .e{color:#8a93a6;font-size:13px;padding:8px 2px}#ffaFriends .nk{display:flex;gap:8px;margin:0 0 6px}#ffaFriends .nk input{flex:1}#ffaFriends .x{float:right;background:none;border:0;color:#8a93a6;font-size:20px;cursor:pointer;line-height:1}'+
 '#ffaToast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147482600;background:#10131b;border:1px solid var(--fry,#ffc93c);color:#eef0f5;border-radius:12px;padding:10px 14px;font:600 14px system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center;max-width:calc(100vw - 32px)}'+
 '#ffaToast button{border:0;border-radius:7px;padding:5px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d));color:#1a1206}';
function fcss(){ if(document.getElementById('ffaFCss')) return; var s=document.createElement('style'); s.id='ffaFCss'; s.textContent=FCSS; document.head.appendChild(s); }
function toast(text){
  fcss(); var old=document.getElementById('ffaToast'); if(old) old.remove();
  var t=document.createElement('div'); t.id='ffaToast'; t.setAttribute('data-notr',''); t.innerHTML='<span>👋 '+esc(text)+'</span><button type="button">'+esc(F.view)+'</button>';
  t.querySelector('button').onclick=function(){ t.remove(); openFriends(); };
  document.body.appendChild(t); setTimeout(function(){ if(t.parentNode) t.remove(); },8000);
}
var fq='', fres=null, fbusy=false;
function fmodal(){
  fcss(); var el=document.getElementById('ffaFriends'); if(el) return el;
  el=document.createElement('div'); el.id='ffaFriends'; el.setAttribute('data-notr','');
  el.innerHTML='<div class="b"><button type="button" class="x" aria-label="'+esc(T.close)+'">×</button><h3>'+esc(F.ftitle)+'</h3><div class="n">'+esc(F.fnote)+'</div><div class="nkBox"></div>'+
    '<input class="q" type="search" autocomplete="off" spellcheck="false" maxlength="16" placeholder="'+esc(F.search)+'"><div class="res"></div><div class="lists"></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ if(e.target===el) el.style.display='none'; });
  el.querySelector('.x').onclick=function(){ el.style.display='none'; };
  var timer=null; el.querySelector('.q').oninput=function(){ fq=this.value; clearTimeout(timer); timer=setTimeout(runSearch,300); };
  return el;
}
async function runSearch(){ var q=fq.trim(); if(!q){ fres=null; return fpaint(); } if(q.length<2){ fres='short'; return fpaint(); } var mine=q; var r=await searchUsers(q); if(fq.trim()===mine){ fres=r; fpaint(); } }
function relation(id){ for(var i=0;i<friends.length;i++) if(friends[i].otherId===id) return friends[i]; return null; }
function act(btn, fn){ btn.onclick=async function(e){ e.stopPropagation(); if(fbusy) return; fbusy=true; btn.disabled=true; var r; try{ r=await fn(); }catch(x){ r={error:x}; } fbusy=false; if(r&&r.error) toastErr(); fpaint(); }; }
function toastErr(){ var el=document.getElementById('ffaFriends'); var m=el&&el.querySelector('.res'); if(m){ var d=document.createElement('div'); d.className='e'; d.textContent=F.err; m.prepend(d); } }
function row(name, id, btns, tag){
  var d=document.createElement('div'); d.className='row';
  d.innerHTML='<span class="nm"></span>'+(tag?'<span class="tg"></span>':''); d.querySelector('.nm').textContent=name; if(tag) d.querySelector('.tg').textContent=tag;
  d.querySelector('.nm').onclick=function(){ openProfile(id); };
  (btns||[]).forEach(function(b){ var x=document.createElement('button'); x.type='button'; x.textContent=b[0]; if(b[2]) x.className=b[2]; if(b[1]) act(x,b[1]); else x.disabled=true; d.appendChild(x); });
  return d;
}
function fpaint(){
  var el=document.getElementById('ffaFriends'); if(!el||el.style.display==='none') return;
  if(!user){ el.style.display='none'; return; }
  var nk=el.querySelector('.nkBox'); nk.innerHTML='';
  if(!(prof&&prof.display_name&&String(prof.display_name).trim())){
    nk.innerHTML='<div class="n">'+esc(F.needNick)+'</div><div class="nk"><input maxlength="12" placeholder="'+esc(F.nickPh)+'"><button type="button">'+esc(F.save)+'</button></div>';
    var inp=nk.querySelector('input'); act(nk.querySelector('button'), function(){ return setNick(inp.value); });
  }
  var res=el.querySelector('.res'); res.innerHTML='';
  if(fres==='short'){ res.innerHTML='<div class="e">'+esc(F.short)+'</div>'; }
  else if(Array.isArray(fres)){
    if(!fres.length) res.innerHTML='<div class="e">'+esc(F.none)+'</div>';
    fres.forEach(function(u){ var r=relation(u.id), name=nickOf(u);
      if(!r) res.appendChild(row(name,u.id,[[F.add,function(){ return request(u.id); },'p']]));
      else if(r.status==='accepted') res.appendChild(row(name,u.id,[],F.isFriend));
      else if(r.incoming) res.appendChild(row(name,u.id,[[F.accept,function(){ return respond(r.rowId,true); },'p'],[F.decline,function(){ return respond(r.rowId,false); }]]));
      else res.appendChild(row(name,u.id,[],F.sent)); });
  }
  var ls=el.querySelector('.lists'); ls.innerHTML='';
  function section(title, items, mk){ if(!items.length) return; var h=document.createElement('h4'); h.textContent=title+' ('+items.length+')'; ls.appendChild(h); items.forEach(function(f){ ls.appendChild(mk(f)); }); }
  section(F.inc, friends.filter(function(f){ return f.incoming; }), function(f){ return row(f.name,f.otherId,[[F.accept,function(){ return respond(f.rowId,true); },'p'],[F.decline,function(){ return respond(f.rowId,false); }]]); });
  var acc=friends.filter(function(f){ return f.status==='accepted'; }).sort(function(a,b){ return (online(b)-online(a))||a.name.localeCompare(b.name,'ko'); });
  if(acc.length) section(F.list, acc, function(f){ var d=row(f.name,f.otherId,[[F.card,function(){ openProfile(f.otherId); return null; }]],presText(f));
      var dm=document.createElement('button'); dm.type='button'; dm.className='dmb'; dm.textContent='💬'; dm.title=N.msg; dm.setAttribute('aria-label',N.msg); var un=dmUnread[f.otherId]||0; if(un){ var bg=document.createElement('span'); bg.className='ffa-badge'; bg.textContent=un>9?'9+':String(un); dm.appendChild(bg); } dm.onclick=function(e){ e.stopPropagation(); openDM(f.otherId); }; d.appendChild(dm);
      if(online(f)) d.classList.add('on');
      var rm=document.createElement('button'); rm.type='button'; rm.textContent=F.remove;
      rm.onclick=async function(e){ e.stopPropagation(); if(fbusy) return; if(!rm.dataset.sure){ rm.dataset.sure='1'; rm.textContent=F.sure; setTimeout(function(){ if(rm.isConnected&&!fbusy){ delete rm.dataset.sure; rm.textContent=F.remove; } },3000); return; } fbusy=true; rm.disabled=true; var r; try{ r=await removeRow(f.rowId); }catch(x){ r={error:x}; } fbusy=false; if(r&&r.error) toastErr(); fpaint(); };
      d.appendChild(rm); return d; });
  else { var h=document.createElement('h4'); h.textContent=F.list; ls.appendChild(h); var e=document.createElement('div'); e.className='e'; e.textContent=F.empty; ls.appendChild(e); }
  section(F.out, friends.filter(function(f){ return f.outgoing; }), function(f){ return row(f.name,f.otherId,[[F.cancel,function(){ return respond(f.rowId,false); }]],F.sent); });
  section(N.blist, Object.keys(blocks), function(id){ return row(noteNames[id]||'???',id,[[N.unblock,function(){ return block(id,false); }]]); });
}
async function openFriends(){ if(!sb) return; if(!user) return openLogin(); closeMenus(); var el=fmodal(); el.style.display='flex'; fpaint(); await loadFriends(); fpaint(); }
subs.push(function(u){ friends=[]; badge(); watchFriends(); if(u) loadFriends().then(function(){ fpaint(); var n=incomingCount(); if(n){ var f=friends.filter(function(x){ return x.incoming; })[0]; toast(n>1?fmt(F.toast,f.name)+' (+'+(n-1)+')':fmt(F.toast,f.name)); } }); else { var el=document.getElementById('ffaFriends'); if(el) el.style.display='none'; } });
setInterval(function(){ if(user) loadFriends().then(fpaint).catch(function(){}); }, 10*60*1000);
setInterval(function(){ var el=document.getElementById('ffaFriends'); if(user&&el&&el.style.display!=='none') loadFriends().then(fpaint).catch(function(){}); }, 60*1000);

/* hub achievements: worked out from this account's games, friends and posts, then saved so others see them on the card (ff-profile.js) */
var hubT=null;
function syncHub(){ clearTimeout(hubT); hubT=setTimeout(function(){ if(!sb||!user) return; profileLib().then(function(ok){ if(ok&&window.FFProfile.syncHub) window.FFProfile.syncHub(sb, user.id); }); }, 1500); }
subs.push(function(u){ if(u) syncHub(); });

/* a shared card link: <hub>/?card=<login id> opens that person's profile card */
(function(){ var m=/[?&]card=([^&#]+)/.exec(location.search); if(!m) return; var id=decodeURIComponent(m[1]).slice(0,32);
  ready.then(async function(){ if(!sb) return; try{ var r=await sb.from('profiles').select('id').ilike('username', likeEsc(id)).limit(1); var row=r&&r.data&&r.data[0]; if(row) openProfile(row.id); }catch(e){} }); })();

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', paint); else paint();

/* ---- 🔔 notifications, 1:1 messages, block and report (supabase-ff-social.sql) ----
   The bell sits next to the nickname on the hub and every game site; a message window opens from the friends list. */
/* ---- ⚙️ settings: theme and text size (FFTheme in ff-lang.js), the same on the hub and every game site ---- */
var SL={
 ko:{lang:'언어',set:'설정',theme:'테마',dark:'🌙 다크',light:'☀️ 라이트',yellow:'🟡 노랑',red:'🔴 빨강',blue:'🔵 파랑',size:'글자 크기',s:'작게',m:'보통',l:'크게',xl:'아주 크게',note:'허브와 게임 사이트에 같이 적용돼요.'},
 en:{lang:'Language',set:'Settings',theme:'Theme',dark:'🌙 Dark',light:'☀️ Light',yellow:'🟡 Yellow',red:'🔴 Red',blue:'🔵 Blue',size:'Text size',s:'Small',m:'Normal',l:'Large',xl:'Extra large',note:'Applies to the hub and the game sites.'},
 es:{lang:'Idioma',set:'Ajustes',theme:'Tema',dark:'🌙 Oscuro',light:'☀️ Claro',yellow:'🟡 Amarillo',red:'🔴 Rojo',blue:'🔵 Azul',size:'Tamaño del texto',s:'Pequeño',m:'Normal',l:'Grande',xl:'Muy grande',note:'Se aplica al inicio y a las webs de los juegos.'},
 fr:{lang:'Langue',set:'Réglages',theme:'Thème',dark:'🌙 Sombre',light:'☀️ Clair',yellow:'🟡 Jaune',red:'🔴 Rouge',blue:'🔵 Bleu',size:'Taille du texte',s:'Petit',m:'Normal',l:'Grand',xl:'Très grand',note:'S’applique à l’accueil et aux sites des jeux.'},
 de:{lang:'Sprache',set:'Einstellungen',theme:'Design',dark:'🌙 Dunkel',light:'☀️ Hell',yellow:'🟡 Gelb',red:'🔴 Rot',blue:'🔵 Blau',size:'Textgröße',s:'Klein',m:'Normal',l:'Groß',xl:'Sehr groß',note:'Gilt für die Startseite und die Spielseiten.'},
 ja:{lang:'言語',set:'設定',theme:'テーマ',dark:'🌙 ダーク',light:'☀️ ライト',yellow:'🟡 黄',red:'🔴 赤',blue:'🔵 青',size:'文字の大きさ',s:'小',m:'標準',l:'大',xl:'特大',note:'ハブとゲームサイトに一緒に適用されます。'}
};
var S_=SL[lang()]||SL.en;
var LANGS=[['ko','한국어'],['en','English'],['es','Español'],['fr','Français'],['de','Deutsch'],['ja','日本語']];
var SCSS='.ffa-set{background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 9px;font-size:15px;cursor:pointer;margin-right:6px;line-height:1.2;vertical-align:middle}.ffa-set:hover{border-color:var(--fry,#ffc93c)}'+
 '.ffa-setp{position:absolute;right:0;top:calc(100% + 6px);width:min(280px,calc(100vw - 24px));background:#10131b;border:1px solid #2b3245;border-radius:12px;padding:10px 12px;z-index:2147482000;box-shadow:0 12px 30px rgba(0,0,0,.45);display:none;text-align:left;color:#eef0f5;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;white-space:normal}'+
 '.ffa-setp b{display:block;font-size:13px;color:#8a93a6;margin:6px 0 6px}.ffa-setp .g{display:flex;flex-wrap:wrap;gap:6px}.ffa-setp .g button{flex:1;background:#1b2030;color:#eef0f5;border:1px solid #2b3245;border-radius:8px;padding:7px 8px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap}'+
 '.ffa-setp .ffa-lg button{flex:1 1 30%}.ffa-setp .g button.on{background:linear-gradient(135deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d));color:#1a1206;border-color:transparent}.ffa-setp small{display:block;color:#8a93a6;font-size:12px;margin-top:8px}';
function setPaint(){
  return; /* ⚙️ button replaced by the 설정 text link and /settings/ */
  if(!window.FFTheme) return; if(!document.getElementById('ffaSCss')){ var st=document.createElement('style'); st.id='ffaSCss'; st.textContent=SCSS; document.head.appendChild(st); }
  var ws=document.querySelectorAll('[data-ff-account] .ffa-wrap'); for(var i=0;i<ws.length;i++){ var w=ws[i]; if(w.querySelector('.ffa-set')) continue;
    var b=document.createElement('button'); b.type='button'; b.className='ffa-set'; b.textContent='⚙️'; b.title=S_.set; b.setAttribute('aria-label',S_.set);
    var p=document.createElement('span'); p.className='ffa-setp ffa-menu'; w.insertBefore(p, w.firstChild); w.insertBefore(b, w.firstChild);
    (function(b,p){ b.onclick=function(e){ e.stopPropagation(); var open=p.style.display==='block'; closeMenus(); if(open) return; setFill(p); p.style.display='block'; }; p.onclick=function(e){ e.stopPropagation(); }; })(b,p); }
}
function setFill(p){
  var cur=FFTheme.get();
  p.innerHTML='<b>'+esc(S_.theme)+'</b><div class="g">'+['dark','yellow','red','blue','light'].map(function(k){ return '<button type="button" data-th="'+k+'">'+esc(S_[k])+'</button>'; }).join('')+'</div>'+
    '<b>'+esc(S_.size)+'</b><div class="g">'+FFTheme.sizes.map(function(z){ return '<button type="button" data-sz="'+z+'">'+esc(S_[z])+'</button>'; }).join('')+'</div>'+
    '<b>'+esc(S_.lang)+'</b><div class="g ffa-lg">'+LANGS.map(function(x){ return '<button type="button" data-lg="'+x[0]+'">'+esc(x[1])+'</button>'; }).join('')+'</div><small>'+esc(S_.note)+'</small>';
  [].forEach.call(p.querySelectorAll('[data-lg]'),function(x){ var l=x.getAttribute('data-lg'); x.classList.toggle('on',l===lang()); x.onclick=function(){ if(l===lang()) return; try{ localStorage.setItem('arenaClashLang',l); }catch(e){} try{ if(window.FFLang) FFLang.set(l); }catch(e){} location.reload(); }; });
  [].forEach.call(p.querySelectorAll('[data-th]'),function(x){ x.classList.toggle('on',x.getAttribute('data-th')===cur.theme); x.onclick=function(){ FFTheme.set(x.getAttribute('data-th')); setFill(p); }; });
  [].forEach.call(p.querySelectorAll('[data-sz]'),function(x){ x.classList.toggle('on',x.getAttribute('data-sz')===cur.size); x.onclick=function(){ FFTheme.set(null,x.getAttribute('data-sz')); setFill(p); }; });
}

var NL={
 ko:{blist:'차단한 사람',bell:'알림',none:'새 알림이 없어요.',mention:'{0}님이 나를 언급했어요',mentionc:'{0}님이 채팅에서 나를 불렀어요',coin:'{0}님이 Hub Coin을 보냈어요 🎁',comment:'{0}님이 내 글에 댓글을 남겼어요',like:'{0}님이 내 글을 좋아해요',friend:'{0}님이 친구 요청을 보냈어요',dm:'{0}님이 메시지를 보냈어요',
     feedback:'보낸 피드백을 관리자가 확인했어요',report:'보낸 신고를 관리자가 처리했어요',clear:'모두 지우기',msg:'💬 메시지',dmPh:'메시지 보내기',send:'보내기',dmEmpty:'아직 나눈 메시지가 없어요.',
     dmOnly:'친구끼리만 메시지를 보낼 수 있어요.',block:'🚫 차단',unblock:'차단 풀기',blocked:'차단한 사람이에요. 이 사람의 글과 채팅은 보이지 않아요.',report_:'🚩 신고',
     rTitle:'신고하기',rWhy:'이유',r1:'스팸 · 광고',r2:'욕설 · 괴롭힘',r3:'부적절한 사진',r4:'기타',rMore:'자세히 (선택)',rBlock:'이 사람도 차단하기',rSend:'신고 보내기',rDone:'신고했어요. 관리자가 확인할게요.',
     sureBlock:'정말 차단할까요?',blockedT:'차단했어요',err:'처리하지 못했어요. 잠시 뒤 다시 해 주세요.',notReady:'아직 준비 중이에요.'},
 en:{blist:'Blocked',bell:'Notifications',none:'No new notifications.',mention:'{0} mentioned you',mentionc:'{0} mentioned you in chat',coin:'{0} sent you Hub Coin 🎁',comment:'{0} commented on your post',like:'{0} liked your post',friend:'{0} sent you a friend request',dm:'{0} sent you a message',
     feedback:'The admin has seen your feedback',report:'The admin has handled your report',clear:'Clear all',msg:'💬 Message',dmPh:'Send a message',send:'Send',dmEmpty:'No messages yet.',
     dmOnly:'Only friends can message each other.',block:'🚫 Block',unblock:'Unblock',blocked:'You blocked this person. Their posts and chat are hidden.',report_:'🚩 Report',
     rTitle:'Report',rWhy:'Reason',r1:'Spam · ads',r2:'Abuse · harassment',r3:'Inappropriate photo',r4:'Other',rMore:'Details (optional)',rBlock:'Also block this person',rSend:'Send report',rDone:'Reported. The admin will take a look.',
     sureBlock:'Block for sure?',blockedT:'Blocked',err:'Something went wrong. Try again soon.',notReady:'Not ready yet.'},
 es:{blist:'Bloqueados',bell:'Avisos',none:'No hay avisos nuevos.',mention:'{0} te mencionó',mentionc:'{0} te mencionó en el chat',coin:'{0} te envió Hub Coin 🎁',comment:'{0} comentó tu publicación',like:'A {0} le gustó tu publicación',friend:'{0} te envió una solicitud de amistad',dm:'{0} te envió un mensaje',
     feedback:'El administrador vio tus comentarios',report:'El administrador revisó tu denuncia',clear:'Borrar todo',msg:'💬 Mensaje',dmPh:'Envía un mensaje',send:'Enviar',dmEmpty:'Aún no hay mensajes.',
     dmOnly:'Solo los amigos pueden enviarse mensajes.',block:'🚫 Bloquear',unblock:'Desbloquear',blocked:'Bloqueaste a esta persona. Sus publicaciones y su chat están ocultos.',report_:'🚩 Denunciar',
     rTitle:'Denunciar',rWhy:'Motivo',r1:'Spam · anuncios',r2:'Insultos · acoso',r3:'Foto inapropiada',r4:'Otro',rMore:'Detalles (opcional)',rBlock:'Bloquear también a esta persona',rSend:'Enviar denuncia',rDone:'Denuncia enviada. El administrador la revisará.',
     sureBlock:'¿Bloquear de verdad?',blockedT:'Bloqueado',err:'Algo salió mal. Inténtalo de nuevo.',notReady:'Aún no está listo.'},
 fr:{blist:'Bloqués',bell:'Notifications',none:'Aucune nouvelle notification.',mention:'{0} t’a mentionné',mentionc:'{0} t’a mentionné dans le chat',coin:'{0} t’a envoyé des Hub Coin 🎁',comment:'{0} a commenté ton message',like:'{0} aime ton message',friend:'{0} t’a envoyé une demande d’ami',dm:'{0} t’a envoyé un message',
     feedback:'L’admin a vu ton avis',report:'L’admin a traité ton signalement',clear:'Tout effacer',msg:'💬 Message',dmPh:'Envoyer un message',send:'Envoyer',dmEmpty:'Pas encore de messages.',
     dmOnly:'Seuls les amis peuvent s’écrire.',block:'🚫 Bloquer',unblock:'Débloquer',blocked:'Tu as bloqué cette personne. Ses messages et son chat sont masqués.',report_:'🚩 Signaler',
     rTitle:'Signaler',rWhy:'Raison',r1:'Spam · pub',r2:'Insultes · harcèlement',r3:'Photo inappropriée',r4:'Autre',rMore:'Détails (facultatif)',rBlock:'Bloquer aussi cette personne',rSend:'Envoyer',rDone:'Signalé. L’admin va vérifier.',
     sureBlock:'Vraiment bloquer ?',blockedT:'Bloqué',err:'Un problème est survenu. Réessaie bientôt.',notReady:'Pas encore prêt.'},
 de:{blist:'Blockiert',bell:'Benachrichtigungen',none:'Keine neuen Benachrichtigungen.',mention:'{0} hat dich erwähnt',mentionc:'{0} hat dich im Chat erwähnt',coin:'{0} hat dir Hub Coin geschickt 🎁',comment:'{0} hat deinen Beitrag kommentiert',like:'{0} gefällt dein Beitrag',friend:'{0} hat dir eine Freundschaftsanfrage geschickt',dm:'{0} hat dir eine Nachricht geschickt',
     feedback:'Der Admin hat dein Feedback gesehen',report:'Der Admin hat deine Meldung bearbeitet',clear:'Alle löschen',msg:'💬 Nachricht',dmPh:'Nachricht senden',send:'Senden',dmEmpty:'Noch keine Nachrichten.',
     dmOnly:'Nur Freunde können sich schreiben.',block:'🚫 Blockieren',unblock:'Entblocken',blocked:'Du hast diese Person blockiert. Ihre Beiträge und ihr Chat sind ausgeblendet.',report_:'🚩 Melden',
     rTitle:'Melden',rWhy:'Grund',r1:'Spam · Werbung',r2:'Beleidigung · Belästigung',r3:'Unangemessenes Foto',r4:'Sonstiges',rMore:'Details (optional)',rBlock:'Diese Person auch blockieren',rSend:'Meldung senden',rDone:'Gemeldet. Der Admin schaut es sich an.',
     sureBlock:'Wirklich blockieren?',blockedT:'Blockiert',err:'Das hat nicht geklappt. Bitte gleich nochmal.',notReady:'Noch nicht bereit.'},
 ja:{blist:'ブロック中',bell:'お知らせ',none:'新しいお知らせはありません。',mention:'{0}さんがあなたをメンションしました',mentionc:'{0}さんがチャットであなたを呼びました',coin:'{0}さんがHub Coinを送りました 🎁',comment:'{0}さんがあなたの投稿にコメントしました',like:'{0}さんがあなたの投稿にいいねしました',friend:'{0}さんからフレンド申請が届きました',dm:'{0}さんからメッセージが届きました',
     feedback:'送ったフィードバックを管理者が確認しました',report:'送った通報を管理者が処理しました',clear:'すべて消す',msg:'💬 メッセージ',dmPh:'メッセージを送る',send:'送信',dmEmpty:'まだメッセージはありません。',
     dmOnly:'フレンド同士だけメッセージを送れます。',block:'🚫 ブロック',unblock:'ブロック解除',blocked:'ブロックした人です。この人の投稿とチャットは表示されません。',report_:'🚩 通報',
     rTitle:'通報する',rWhy:'理由',r1:'スパム・宣伝',r2:'暴言・嫌がらせ',r3:'不適切な写真',r4:'その他',rMore:'詳しく（任意）',rBlock:'この人もブロックする',rSend:'通報を送る',rDone:'通報しました。管理者が確認します。',
     sureBlock:'本当にブロックしますか？',blockedT:'ブロックしました',err:'処理できませんでした。少し後でもう一度お試しください。',notReady:'まだ準備中です。'}
};
var N=NL[lang()]||NL.en, notes=[], noteNames={}, noteChan=null, blocks={}, dmUnread={}, dmWith=null, dmRows=[], dmPoll=null;
var NCSS='[data-ff-account] .ffa-wrap{white-space:nowrap}.ffa-bell{position:relative;background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 9px;font-size:15px;cursor:pointer;margin-right:6px;line-height:1.2;vertical-align:middle}.ffa-bell:hover{border-color:var(--fry,#ffc93c)}'+
 '.ffa-bell .ffa-nb{position:absolute;top:-6px;right:-6px;margin:0}'+
 '.ffa-notes{position:absolute;right:0;top:calc(100% + 6px);width:min(340px,calc(100vw - 24px));max-height:min(420px,70vh);overflow:auto;background:#10131b;border:1px solid #2b3245;border-radius:12px;padding:6px;z-index:2147482000;box-shadow:0 12px 30px rgba(0,0,0,.45);display:none;text-align:left;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '.ffa-notes h5{margin:4px 8px 6px;font-size:13px;color:#8a93a6;display:flex;justify-content:space-between}.ffa-notes h5 a{color:#8a93a6;cursor:pointer;font-weight:600}'+
 '.ffa-notes .nt{display:block;width:100%;text-align:left;background:none;border:0;color:#eef0f5;font:inherit;font-size:13.5px;padding:9px 10px;border-radius:8px;cursor:pointer;line-height:1.4}.ffa-notes .nt:hover{background:#1b2030}.ffa-notes .nt.new{background:rgba(255,196,61,.10)}'+
 '.ffa-notes .nt small{display:block;color:#8a93a6;font-size:11.5px;margin-top:2px}.ffa-notes .e{color:#8a93a6;font-size:13px;padding:12px 10px}'+
 '#ffaDM,#ffaRep{position:fixed;inset:0;z-index:2147482450;background:rgba(5,6,10,.72);display:none;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '#ffaDM .b,#ffaRep .b{width:100%;max-width:420px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:16px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5);box-sizing:border-box}'+
 '#ffaDM .hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}#ffaDM .hd b{flex:1;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}'+
 '#ffaDM .hd button,#ffaRep button.x{background:none;border:0;color:#8a93a6;font-size:13px;cursor:pointer;padding:4px 6px;border-radius:6px}#ffaDM .hd button:hover{color:#eef0f5;background:#1b2030}#ffaDM .hd .x,#ffaRep .x{font-size:20px;line-height:1}'+
 '#ffaDM .ms{flex:1;min-height:240px;height:50vh;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding:4px 2px;overscroll-behavior:contain}'+
 '#ffaDM .m{max-width:80%;align-self:flex-start;background:#1a2030;border:1px solid #2b3245;border-radius:12px;padding:7px 11px;font-size:14.5px;white-space:pre-wrap;word-break:break-word}#ffaDM .m.me{align-self:flex-end;background:rgba(255,196,61,.16);border-color:rgba(255,196,61,.35)}'+
 '#ffaDM .m small{display:block;color:#8a93a6;font-size:11px;margin-top:2px}#ffaDM .e,#ffaRep .e{color:#8a93a6;font-size:13px;padding:8px 2px}#ffaDM .w{color:#ff9b7a;font-size:13px;min-height:0}'+
 '#ffaDM form{display:flex;gap:8px;margin-top:8px}#ffaDM input,#ffaRep textarea,#ffaRep select{flex:1;width:100%;box-sizing:border-box;padding:10px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}'+
 '#ffaDM form button,#ffaRep .go{border:0;border-radius:9px;padding:9px 14px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,var(--fry,#ffc93c),var(--fry2,#ff8a3d));color:#1a1206;white-space:nowrap}'+
 '#ffaRep h3{margin:0 0 10px;font-size:18px;display:flex;justify-content:space-between}#ffaRep label{display:block;font-size:13px;color:#8a93a6;margin:8px 0 4px}#ffaRep .ck{display:flex;gap:8px;align-items:center;color:#eef0f5;font-size:14px;margin:10px 0}#ffaRep .ck input{width:auto}#ffaRep .go{margin-top:8px}#ffaRep .m{color:#ffd36b;font-size:13.5px;min-height:0;margin-top:8px}'+
 '#ffaFriends .row .nm{min-width:64px}#ffaFriends .row .tg{flex-shrink:1;min-width:0}#ffaFriends .row .dmb{position:relative}#ffaFriends .row .dmb .ffa-badge{position:absolute;top:-7px;right:-7px;margin:0}';
function ncss(){ fcss(); if(document.getElementById('ffaNCss')) return; var s=document.createElement('style'); s.id='ffaNCss'; s.textContent=NCSS; document.head.appendChild(s); }
function ago2(iso){ var t=Date.parse(iso), m=Math.max(0,Math.round((Date.now()-t)/60000)); return m<1?F.now:(m<60?fmt(F.mn,m):(m<1440?fmt(F.hr,Math.round(m/60)):fmt(F.dy,Math.round(m/1440)))); }
function noteText(n){ var nm=noteNames[n.actor_id]||'???', t=N[n.kind]||''; return fmt(t,nm); }
async function loadNotes(){
  if(!sb||!user){ notes=[]; return; }
  try{ var r=await sb.from('ff_notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(40); if(r.error) return; notes=(r.data||[]).filter(function(n){ return npOn(n.kind); }); }catch(e){ return; }
  var ids=notes.map(function(n){ return n.actor_id; }).filter(function(x,i,a){ return x&&!noteNames[x]&&a.indexOf(x)===i; });
  if(ids.length){ var p=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((p&&p.data)||[]).forEach(function(x){ noteNames[x.id]=nickOf(x); }); }
  bellBadge();
}
async function loadBlocks(){ blocks={}; if(!sb||!user) return; try{ var r=await sb.from('ff_blocks').select('blocked_id').eq('user_id',user.id); ((r&&!r.error&&r.data)||[]).forEach(function(x){ blocks[x.blocked_id]=1; }); }catch(e){}
  var ids=Object.keys(blocks).filter(function(x){ return !noteNames[x]; }); if(ids.length) try{ var p=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((p&&p.data)||[]).forEach(function(x){ noteNames[x.id]=nickOf(x); }); }catch(e){}
  blocksChanged(); fpaint(); }
async function loadDmUnread(){ dmUnread={}; if(!sb||!user) return; try{ var r=await sb.from('ff_dm').select('sender_id').eq('recipient_id',user.id).is('read_at',null).limit(500); ((r&&!r.error&&r.data)||[]).forEach(function(x){ dmUnread[x.sender_id]=(dmUnread[x.sender_id]||0)+1; }); }catch(e){} }
var NGRP={mentionc:'mention',feedback:'admin',report:'admin'};
function npGet(){ try{ return JSON.parse(localStorage.getItem(userKey('ffNotePrefs'))||'{}')||{}; }catch(e){ return {}; } }
function npSet(k,on){ var p=npGet(); if(on) delete p[k]; else p[k]=false; try{ localStorage.setItem(userKey('ffNotePrefs'),JSON.stringify(p)); }catch(e){} }
function npOn(kind){ return npGet()[NGRP[kind]||kind]!==false; }
function unreadNotes(){ return notes.filter(function(n){ return !n.read; }).length; }
function bellBadge(){ var n=unreadNotes(), bs=document.querySelectorAll('.ffa-nb'); for(var i=0;i<bs.length;i++){ bs[i].textContent=n>9?'9+':String(n); bs[i].style.display=n?'':'none'; } }
function socialPaint(){
  if(!user) return; ncss();
  var ws=document.querySelectorAll('[data-ff-account] .ffa-wrap'); for(var i=0;i<ws.length;i++){ var w=ws[i]; if(w.querySelector('.ffa-bell')) continue;
    var b=document.createElement('button'); b.type='button'; b.className='ffa-bell'; b.title=N.bell; b.setAttribute('aria-label',N.bell); b.innerHTML='🔔<i class="ffa-badge ffa-nb" style="display:none;font-style:normal"></i>';
    var panel=document.createElement('span'); panel.className='ffa-notes'; w.insertBefore(panel, w.firstChild); w.insertBefore(b, w.firstChild);
    (function(b,panel){ b.onclick=function(e){ e.stopPropagation(); var open=panel.style.display==='block'; closeMenus(); if(open) return; panel.style.display='block'; paintNotes(panel); markRead(); }; panel.onclick=function(e){ e.stopPropagation(); }; })(b,panel); }
  bellBadge();
}
function paintNotes(panel){
  panel.innerHTML='<h5><span>🔔 '+esc(N.bell)+'</span>'+(notes.length?'<a data-a="clear">'+esc(N.clear)+'</a>':'')+'</h5>';
  if(!notes.length){ panel.insertAdjacentHTML('beforeend','<div class="e">'+esc(N.none)+'</div>'); }
  notes.forEach(function(n){ var b=document.createElement('button'); b.type='button'; b.className='nt'+(n.read?'':' new'); b.innerHTML=esc(noteText(n))+'<small>'+esc(ago2(n.created_at))+'</small>'; b.onclick=function(){ closeMenus(); goNote(n); }; panel.appendChild(b); });
  var c=panel.querySelector('[data-a=clear]'); if(c) c.onclick=async function(){ try{ await sb.from('ff_notes').delete().eq('user_id',user.id); }catch(e){} notes=[]; bellBadge(); paintNotes(panel); };
}
async function markRead(){ if(!unreadNotes()) return; var ids=notes.filter(function(n){ return !n.read; }).map(function(n){ return n.id; }); notes.forEach(function(n){ n.read=true; }); bellBadge(); try{ await sb.from('ff_notes').update({read:true}).in('id',ids); }catch(e){} }
function goNote(n){
  var hubUrl=HUB;
  if(n.kind==='friend') return openFriends();
  if(n.kind==='dm') return openDM(n.actor_id);
  if(n.kind==='coin'){ if(onHub&&window.FFHub&&FFHub.coin) return FFHub.coin(); location.href=hubUrl+'#coin'; return; }
  if(n.kind==='mentionc'){ if(onHub&&window.FFHub) return FFHub.tab('chat'); location.href=hubUrl+'#chat'; return; }
  if(n.kind==='comment'||n.kind==='like'||n.kind==='mention'){ if(onHub&&window.FFHub) return FFHub.openPost(n.ref); location.href=hubUrl+'?post='+encodeURIComponent(n.ref)+'#community'; return; }
  if(onHub&&window.FFHub) return FFHub.tab('fb'); location.href=hubUrl+'#feedback';
}
function watchNotes(){
  if(noteChan){ try{ sb.removeChannel(noteChan); }catch(e){} noteChan=null; }
  if(!sb||!user) return;
  try{ noteChan=sb.channel('ffa-notes-'+user.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'ff_notes',filter:'user_id=eq.'+user.id},function(pl){ loadNotes().then(function(){ var n=pl&&pl.new; if(n&&n.kind!=='friend'&&npOn(n.kind)&&npGet().toast!==false){ toast(noteText(n)); var tt=document.getElementById('ffaToast'); if(tt) tt.querySelector('button').onclick=function(){ tt.remove(); goNote(n); }; } }); })
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'ff_dm',filter:'recipient_id=eq.'+user.id},function(pl){ var m=pl&&pl.new; if(!m) return; if(dmWith===m.sender_id){ if(!dmRows.some(function(x){ return x.id===m.id; })) dmRows.push(m); paintDM(); seenDM(); } else { dmUnread[m.sender_id]=(dmUnread[m.sender_id]||0)+1; fpaint(); } })
    .subscribe(); }catch(e){}
}
/* block / report */
function isBlocked(id){ return !!blocks[id]; }
function blocksChanged(){ try{ window.dispatchEvent(new Event('ffblocks')); }catch(e){} }
async function block(id, on){ if(!sb||!user||!id||id===user.id) return {error:true}; var r=on===false?await sb.from('ff_blocks').delete().eq('user_id',user.id).eq('blocked_id',id):await sb.from('ff_blocks').insert({blocked_id:id});
  if(!r.error){ if(on===false) delete blocks[id]; else blocks[id]=1; blocksChanged(); } return r; }
function openReport(o){ /* o: {kind:'post'|'comment'|'chat'|'user', id, user, text} */
  if(!sb) return; if(!user) return openLogin(); ncss();
  var el=document.getElementById('ffaRep'); if(!el){ el=document.createElement('div'); el.id='ffaRep'; el.setAttribute('data-notr',''); document.body.appendChild(el); el.addEventListener('click',function(e){ if(e.target===el) el.style.display='none'; }); }
  el.innerHTML='<form class="b"><h3><span>'+esc(N.rTitle)+'</span><button type="button" class="x">×</button></h3><label>'+esc(N.rWhy)+'</label><select name="w"><option>'+esc(N.r1)+'</option><option>'+esc(N.r2)+'</option><option>'+esc(N.r3)+'</option><option>'+esc(N.r4)+'</option></select>'+
    '<label>'+esc(N.rMore)+'</label><textarea name="d" rows="3" maxlength="400"></textarea>'+(o.user&&o.user!==user.id?'<label class="ck"><input type="checkbox" name="b"> '+esc(N.rBlock)+'</label>':'')+'<button class="go">'+esc(N.rSend)+'</button><div class="m"></div></form>';
  el.style.display='flex'; el.querySelector('.x').onclick=function(){ el.style.display='none'; };
  el.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var f=this, m=f.querySelector('.m'), go=f.querySelector('.go'); go.disabled=true;
    var reason=f.w.value+(f.d.value.trim()?' - '+f.d.value.trim():'');
    var r=await sb.from('ff_reports').insert({kind:o.kind, target_id:o.id||null, target_user:o.user||null, reason:reason.slice(0,500), snapshot:String(o.text||'').slice(0,600)});
    if(r.error){ go.disabled=false; m.textContent=/does not exist|schema cache|PGRST20/i.test(String(r.error.message||'')+' '+r.error.code)?N.notReady:(/too many/i.test(String(r.error.message))?N.err:N.err); return; }
    if(f.b&&f.b.checked) await block(o.user);
    m.textContent=N.rDone; setTimeout(function(){ el.style.display='none'; },1400); };
}
/* 1:1 messages (friends only) */
function dmModal(){
  ncss(); var el=document.getElementById('ffaDM'); if(el) return el;
  el=document.createElement('div'); el.id='ffaDM'; el.setAttribute('data-notr','');
  el.innerHTML='<div class="b"><div class="hd"><b></b><button type="button" class="rp"></button><button type="button" class="bk"></button><button type="button" class="x" aria-label="'+esc(T.close)+'">×</button></div><div class="ms"></div><div class="w"></div><form><input maxlength="1000" autocomplete="off"><button></button></form></div>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ if(e.target===el) closeDM(); }); el.querySelector('.x').onclick=closeDM;
  el.querySelector('.hd b').onclick=function(){ if(dmWith) openProfile(dmWith); };
  el.querySelector('form').onsubmit=async function(e){ e.preventDefault(); var i=this.querySelector('input'), v=i.value.trim(); if(!v||!dmWith) return; i.value='';
    var r=await sb.from('ff_dm').insert({recipient_id:dmWith, body:v}).select().single(); var w=el.querySelector('.w');
    if(r.error){ i.value=v; w.textContent=/row-level|policy/i.test(String(r.error.message||''))?N.dmOnly:(/does not exist|schema cache|PGRST20/i.test(String(r.error.message||'')+' '+r.error.code)?N.notReady:N.err); return; }
    w.textContent=''; if(r.data&&!dmRows.some(function(x){ return x.id===r.data.id; })) dmRows.push(r.data); paintDM(); };
  return el;
}
function closeDM(){ var el=document.getElementById('ffaDM'); if(el) el.style.display='none'; dmWith=null; clearInterval(dmPoll); dmPoll=null; }
async function openDM(id){
  if(!sb) return; if(!user) return openLogin(); closeMenus(); var el=dmModal(); dmWith=id; dmRows=[];
  var nm=noteNames[id]; var f=friends.filter(function(x){ return x.otherId===id; })[0]; if(f) nm=f.name;
  if(!nm){ try{ var p=await sb.from('profiles').select('id,username,display_name').eq('id',id).single(); nm=p&&p.data?nickOf(p.data):'???'; }catch(e){ nm='???'; } }
  el.querySelector('.hd b').textContent=nm; el.querySelector('input').placeholder=N.dmPh; el.querySelector('form button').textContent=N.send;
  var rp=el.querySelector('.rp'), bk=el.querySelector('.bk'); rp.textContent=N.report_; bk.textContent=isBlocked(id)?N.unblock:N.block;
  rp.onclick=function(){ openReport({kind:'user', user:id, text:dmRows.filter(function(x){ return x.sender_id===id; }).slice(-3).map(function(x){ return x.body; }).join(' / ')}); };
  bk.onclick=async function(){ if(isBlocked(id)){ await block(id,false); bk.textContent=N.block; paintDM(); return; } if(!bk.dataset.s){ bk.dataset.s=1; bk.textContent=N.sureBlock; setTimeout(function(){ delete bk.dataset.s; if(!isBlocked(id)) bk.textContent=N.block; },3000); return; } delete bk.dataset.s; await block(id); bk.textContent=N.unblock; paintDM(); };
  el.querySelector('.w').textContent=''; el.style.display='flex'; paintDM(); await pullDM(); seenDM();
  clearInterval(dmPoll); dmPoll=setInterval(function(){ if(dmWith&&document.visibilityState!=='hidden') pullDM().then(seenDM); }, 6000);
  setTimeout(function(){ try{ el.querySelector('input').focus(); }catch(e){} },30);
}
async function pullDM(){
  if(!dmWith) return; var me=user.id, o=dmWith;
  var r=await sb.from('ff_dm').select('*').or('and(sender_id.eq.'+me+',recipient_id.eq.'+o+'),and(sender_id.eq.'+o+',recipient_id.eq.'+me+')').order('created_at',{ascending:false}).limit(100);
  if(r.error){ var el=document.getElementById('ffaDM'); if(el) el.querySelector('.w').textContent=/does not exist|schema cache|PGRST20/i.test(String(r.error.message||'')+' '+r.error.code)?N.notReady:''; return; }
  if(dmWith!==o) return; dmRows=(r.data||[]).reverse(); paintDM();
}
async function seenDM(){ if(!dmWith) return; var o=dmWith; delete dmUnread[o]; fpaint(); try{ await sb.from('ff_dm').update({read_at:new Date().toISOString()}).eq('recipient_id',user.id).eq('sender_id',o).is('read_at',null); }catch(e){} }
function paintDM(){
  var el=document.getElementById('ffaDM'); if(!el||!dmWith) return; var box=el.querySelector('.ms'), stick=box.scrollHeight-box.scrollTop-box.clientHeight<60||!box.dataset.once; box.innerHTML='';
  if(isBlocked(dmWith)){ box.innerHTML='<div class="e">'+esc(N.blocked)+'</div>'; return; }
  if(!dmRows.length) box.innerHTML='<div class="e">'+esc(N.dmEmpty)+'</div>';
  dmRows.forEach(function(m){ var d=document.createElement('div'); d.className='m'+(m.sender_id===user.id?' me':''); d.textContent=m.body; var s=document.createElement('small'); s.textContent=ago2(m.created_at); d.appendChild(s); box.appendChild(d); });
  if(stick){ box.dataset.once=1; box.scrollTop=box.scrollHeight; }
}
subs.push(function(u){ notes=[]; blocks={}; dmUnread={}; bellBadge(); watchNotes(); if(u){ loadBlocks(); loadDmUnread().then(fpaint); loadNotes().then(function(){ socialPaint(); }); } else closeDM(); });
setInterval(function(){ if(user) loadNotes().catch(function(){}); }, 5*60*1000);

/* ---- 📊 투표 버튼: 열린 투표가 있을 때만 계정 버튼 왼쪽에 떠요 (관리자는 투표를 올릴 수 있게 늘 보여요).
   아직 안 한 투표가 있으면 빨간 숫자. 누르면 허브의 투표 창 (다른 사이트에서는 허브로 이동) ---- */
var VT={ko:'투표',en:'Vote',es:'Votar',fr:'Vote',de:'Umfrage',ja:'投票'}, vState={show:false, todo:0};
async function pollCheck(){
  if(!sb) return; var st={show:false, todo:0};
  try{
    var r=await sb.from('ff_polls').select('id,ends_at').eq('active',true).limit(30), now=Date.now();
    var open=((r&&!r.error&&r.data)||[]).filter(function(x){ return !x.ends_at||Date.parse(x.ends_at)>now; }).map(function(x){ return x.id; });
    st.show=open.length>0;
    if(user){
      if(open.length){ var v=await sb.from('ff_votes').select('poll_id').eq('user_id',user.id).in('poll_id',open); var done={}; ((v&&!v.error&&v.data)||[]).forEach(function(x){ done[x.poll_id]=1; }); st.todo=open.filter(function(id){ return !done[id]; }).length; }
      if(!st.show){ var a=await sb.rpc('ff_is_admin'); if(a&&a.data===true) st.show=true; }
    }
  }catch(e){}
  vState=st; votePaint();
}
function votePaint(){
  if(!document.getElementById('ffa-vcss')){ var c=document.createElement('style'); c.id='ffa-vcss';
    c.textContent='.ffa-vote{position:relative;background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 9px;font-size:15px;cursor:pointer;margin-right:6px;line-height:1.2;vertical-align:middle;font-family:inherit}.ffa-vote:hover{border-color:var(--fry,#ffc93c)}.ffa-vote .t{font-size:13px;font-weight:700;margin-left:4px}.ffa-vote .ffa-vb{position:absolute;top:-6px;right:-6px;margin:0;display:inline-block;min-width:18px;height:18px;line-height:18px;border-radius:9px;background:#ff5a4f;color:#fff;font-size:11px;font-weight:800;text-align:center;padding:0 5px;box-sizing:border-box}@media(max-width:560px){.ffa-vote .t{display:none}}html[data-ff-theme=light] .ffa-vote{background:#fff;color:#1d2130;border-color:#d8d2c4}';
    document.head.appendChild(c); }
  var ws=document.querySelectorAll('[data-ff-account] .ffa-wrap');
  for(var i=0;i<ws.length;i++){ var w=ws[i], b=w.querySelector('.ffa-vote');
    if(!vState.show){ if(b) b.remove(); continue; }
    if(!b){ b=document.createElement('button'); b.type='button'; b.className='ffa-vote';
      b.onclick=function(e){ e.stopPropagation(); closeMenus(); if(onHub&&window.FFHub&&FFHub.polls) return FFHub.polls(); location.href=HUB+'#poll'; };
      var me=w.querySelector('.ffa-chip,.ffa-btn'); w.insertBefore(b, me||null); }
    var t=VT[lang()]||VT.en; b.title=t; b.setAttribute('aria-label',t);
    b.innerHTML='📊<span class="t">'+esc(t)+'</span>'+(vState.todo?'<i class="ffa-vb" style="font-style:normal">'+(vState.todo>9?'9+':vState.todo)+'</i>':''); }
}
subs.push(function(){ pollCheck(); });
setInterval(function(){ if(document.visibilityState!=='hidden') pollCheck(); }, 5*60*1000);
document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='visible') pollCheck(); });

window.FFAuth={ ready:ready, pollCheck:pollCheck, client:function(){ return sb; }, user:function(){ return user; }, profile:function(){ return prof; }, nickname:nick,
  onChange:function(f){ if(typeof f==='function') subs.push(f); }, openLogin:openLogin, openProfile:openProfile, openFriends:openFriends, friends:function(){ return friends.slice(); }, signOut:signOut, refresh:paint, syncHub:syncHub,
  openDM:openDM, openReport:openReport, openAcct:openAcct, notePrefs:{get:npGet,set:npSet}, userKey:userKey, lang:lang, loadDevs:loadDevs, devRole:devRole, devBadge:devBadge, block:block, isBlocked:isBlocked, blocked:function(){ return Object.assign({},blocks); } };
})();

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
     noAcc:'계정이 없나요?',hasAcc:'이미 계정이 있나요?',close:'닫기',hi:'{0}님'},
 en:{login:'Log in',signup:'Create account',logout:'Log out',card:'🪪 Profile card',id:'Username (letters/numbers, 3–16)',pw:'Password (6+ characters)',busy:'Working...',
     title:'Frenchfries777 account',sub:'Stickseum, Crown Envoy and Beaconfall share one account. Log in here and the games start logged in too.',
     badId:'Use 3–16 letters, numbers or underscores.',badPw:'Use at least 6 characters.',taken:'That username is taken.',cred:'Wrong username or password.',
     rate:'Too many tries. Please wait a few minutes.',net:'Could not reach the server. Check your connection.',fail:'Could not log in.',
     noAcc:'No account yet?',hasAcc:'Already have an account?',close:'Close',hi:'{0}'},
 es:{login:'Iniciar sesión',signup:'Crear cuenta',logout:'Cerrar sesión',card:'🪪 Tarjeta de perfil',id:'Usuario (letras/números, 3–16)',pw:'Contraseña (6+ caracteres)',busy:'Procesando...',
     title:'Cuenta Frenchfries777',sub:'Stickseum, Crown Envoy y Beaconfall comparten una cuenta. Inicia sesión aquí y los juegos empiezan con la sesión iniciada.',
     badId:'Usa de 3 a 16 letras, números o guiones bajos.',badPw:'Usa al menos 6 caracteres.',taken:'Ese usuario ya existe.',cred:'Usuario o contraseña incorrectos.',
     rate:'Demasiados intentos. Espera unos minutos.',net:'No se pudo conectar con el servidor.',fail:'No se pudo iniciar sesión.',
     noAcc:'¿No tienes cuenta?',hasAcc:'¿Ya tienes cuenta?',close:'Cerrar',hi:'{0}'},
 fr:{login:'Se connecter',signup:'Créer un compte',logout:'Se déconnecter',card:'🪪 Carte de profil',id:'Identifiant (lettres/chiffres, 3–16)',pw:'Mot de passe (6+ caractères)',busy:'Traitement...',
     title:'Compte Frenchfries777',sub:'Stickseum, Crown Envoy et Beaconfall partagent un seul compte. Connecte-toi ici et les jeux démarrent déjà connectés.',
     badId:'Utilise 3 à 16 lettres, chiffres ou tirets bas.',badPw:'Au moins 6 caractères.',taken:'Cet identifiant est déjà pris.',cred:'Identifiant ou mot de passe incorrect.',
     rate:'Trop de tentatives. Réessaie dans quelques minutes.',net:'Impossible de joindre le serveur.',fail:'Connexion impossible.',
     noAcc:'Pas encore de compte ?',hasAcc:'Déjà un compte ?',close:'Fermer',hi:'{0}'},
 de:{login:'Anmelden',signup:'Konto erstellen',logout:'Abmelden',card:'🪪 Profilkarte',id:'Benutzername (Buchstaben/Zahlen, 3–16)',pw:'Passwort (mind. 6 Zeichen)',busy:'Wird bearbeitet...',
     title:'Frenchfries777-Konto',sub:'Stickseum, Crown Envoy und Beaconfall nutzen ein Konto. Hier anmelden und die Spiele starten schon angemeldet.',
     badId:'3–16 Buchstaben, Zahlen oder Unterstriche.',badPw:'Mindestens 6 Zeichen.',taken:'Dieser Name ist vergeben.',cred:'Benutzername oder Passwort falsch.',
     rate:'Zu viele Versuche. Bitte ein paar Minuten warten.',net:'Server nicht erreichbar.',fail:'Anmeldung fehlgeschlagen.',
     noAcc:'Noch kein Konto?',hasAcc:'Schon ein Konto?',close:'Schließen',hi:'{0}'},
 ja:{login:'ログイン',signup:'アカウント作成',logout:'ログアウト',card:'🪪 プロフィールカード',id:'ID（英数字、3〜16文字）',pw:'パスワード（6文字以上）',busy:'処理中...',
     title:'Frenchfries777アカウント',sub:'Stickseum、Crown Envoy、Beaconfallは同じアカウントです。ここでログインすると、ゲームもログインした状態で始まります。',
     badId:'IDは英数字とアンダーバーで3〜16文字にしてください。',badPw:'パスワードは6文字以上にしてください。',taken:'そのIDはすでに使われています。',cred:'IDまたはパスワードが違います。',
     rate:'試行回数が多すぎます。数分後にもう一度お試しください。',net:'サーバーに接続できませんでした。',fail:'ログインできませんでした。',
     noAcc:'アカウントがありませんか？',hasAcc:'すでにアカウントがありますか？',close:'閉じる',hi:'{0}さん'}
};
function lang(){ var c=[]; try{ var s=localStorage.getItem('arenaClashLang'); if(s) c.push(s); }catch(e){} try{ c=c.concat(navigator.languages||[navigator.language||'']); }catch(e){}
  for(var i=0;i<c.length;i++){ var b=String(c[i]||'').toLowerCase().split('-')[0]; if(L[b]) return b; } return 'en'; }
var T=L[lang()];
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
}
function nick(){ return (prof&&(prof.display_name||prof.username)) || (user&&String(user.email||'').split('@')[0]) || ''; }

/* ---- the same login rules as the games (id -> internal e-mail, typo-tolerant password) ---- */
function emailFor(u){ return String(u).toLowerCase().replace(/[^a-z0-9_]/g,'')+'@arenaclash.local'; }
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
  var email=emailFor(String(id||'').trim()), err=null, vs=pwVariants(pw);
  for(var i=0;i<vs.length;i++){ var r; try{ r=await sb.auth.signInWithPassword({email:email, password:vs[i]}); }catch(e){ r={error:{message:String(e&&e.message||e)}}; }
    if(!r.error){ await setUser(r.data.user); return {ok:true}; }
    err=r.error; if(errText(err)!==T.cred) break; }
  return {error:errText(err)};
}
async function signUp(id, pw){
  id=String(id||'').trim();
  if(!/^[a-zA-Z0-9_]{3,16}$/.test(id)) return {error:T.badId};
  if(!pw||pw.length<6) return {error:T.badPw};
  var r=await sb.auth.signUp({email:emailFor(id), password:pw});
  if(r.error) return {error:/already|registered/i.test(r.error.message)?T.taken:errText(r.error)};
  var p=await sb.from('profiles').insert({id:r.data.user.id, username:id});
  if(p.error) return {error:T.taken};
  await setUser(r.data.user); return {ok:true};
}
async function signOut(){ try{ if(sb) await sb.auth.signOut({scope:'local'}); }catch(e){} await setUser(null); }   // 'local': only this browser, other devices stay logged in

/* ---- UI ---- */
var CSS='.ffa-btn{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ffc93c,#ff8a3d);color:#1a1206;border:0;border-radius:9px;padding:7px 13px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}'+
 '.ffa-btn:hover{filter:brightness(1.06)}.ffa-wrap{position:relative;display:inline-block;margin-left:16px}'+
 '.ffa-chip{display:inline-flex;align-items:center;gap:7px;background:#10131b;color:#eef0f5;border:1px solid #2b3245;border-radius:9px;padding:6px 11px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;max-width:180px}'+
 '.ffa-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ffa-chip:hover{border-color:#ffc93c}'+
 '.ffa-menu{position:absolute;right:0;top:calc(100% + 6px);background:#10131b;border:1px solid #2b3245;border-radius:10px;padding:6px;min-width:170px;z-index:2147482000;box-shadow:0 12px 30px rgba(0,0,0,.45);display:none}'+
 '.ffa-menu button{display:block;width:100%;text-align:left;background:none;border:0;color:#eef0f5;font:inherit;font-size:14px;padding:9px 10px;border-radius:7px;cursor:pointer}.ffa-menu button:hover{background:#1b2030}'+
 '#ffaModal{position:fixed;inset:0;z-index:2147482500;background:rgba(5,6,10,.72);display:none;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}'+
 '#ffaModal .b{width:100%;max-width:360px;background:#10131b;border:1px solid #2b3245;border-radius:16px;padding:22px;color:#eef0f5;box-shadow:0 20px 50px rgba(0,0,0,.5)}'+
 '#ffaModal h3{margin:0 0 6px;font-size:19px}#ffaModal p{margin:0 0 16px;color:#8a93a6;font-size:13px;line-height:1.5}'+
 '#ffaModal input{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}'+
 '#ffaModal input:focus{outline:none;border-color:#ffc93c}#ffaModal .ffa-btn{width:100%;justify-content:center;padding:11px;font-size:15px}'+
 '#ffaModal .m{min-height:18px;font-size:13px;color:#ff9b7a;margin:0 0 10px}#ffaModal .sw{margin-top:14px;text-align:center;font-size:13px;color:#8a93a6}'+
 '#ffaModal .sw a{color:#ffc93c;cursor:pointer;margin-left:4px}#ffaModal .x{float:right;background:none;border:0;color:#8a93a6;font-size:20px;cursor:pointer;line-height:1}';
function css(){ if(document.getElementById('ffaCss')) return; var s=document.createElement('style'); s.id='ffaCss'; s.textContent=CSS; document.head.appendChild(s); }

var mode='in';
function modal(){
  css(); var el=document.getElementById('ffaModal'); if(el) return el;
  el=document.createElement('div'); el.id='ffaModal'; el.setAttribute('data-notr','');
  el.innerHTML='<form class="b" autocomplete="on"><button type="button" class="x" aria-label="'+esc(T.close)+'">×</button><h3></h3><p>'+esc(T.sub)+'</p>'+
    '<input name="username" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="16" placeholder="'+esc(T.id)+'">'+
    '<input name="password" type="password" placeholder="'+esc(T.pw)+'">'+
    '<div class="m"></div><button type="submit" class="ffa-btn go"></button><div class="sw"><span></span><a></a></div></form>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ if(e.target===el) close(); });
  el.querySelector('.x').onclick=close;
  el.querySelector('.sw a').onclick=function(){ mode=mode==='in'?'up':'in'; fill(); };
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
  el.querySelector('input[name=password]').setAttribute('autocomplete',mode==='in'?'current-password':'new-password'); el.querySelector('.m').textContent=''; }
function openLogin(m){ mode=m==='up'?'up':'in'; fill(); var el=modal(); el.style.display='flex'; setTimeout(function(){ try{ el.querySelector('input').focus(); }catch(e){} },30); }
function close(){ var el=document.getElementById('ffaModal'); if(el) el.style.display='none'; }

function profileLib(){ return loadScript(BASE+'ff-profile.js', function(){ return !!window.FFProfile; }); }
async function openProfile(uid){ if(!sb) return; if(!uid&&!user) return openLogin(); if(await profileLib()) window.FFProfile.open(sb, uid||user.id); }

function paint(){
  css(); var slots=document.querySelectorAll('[data-ff-account]');
  for(var i=0;i<slots.length;i++){
    var s=slots[i]; s.setAttribute('data-notr','');
    if(!user){ s.innerHTML='<span class="ffa-wrap"><button type="button" class="ffa-btn">🍟 '+esc(T.login)+'</button></span>'; s.querySelector('button').onclick=function(){ openLogin(); }; continue; }
    s.innerHTML='<span class="ffa-wrap"><button type="button" class="ffa-chip" aria-haspopup="true">🍟 <span>'+esc(fmt(T.hi,nick()))+'</span> ▾</button>'+
      '<span class="ffa-menu" role="menu"><button type="button" data-a="card">'+esc(T.card)+'</button><button type="button" data-a="out">'+esc(T.logout)+'</button></span></span>';
    (function(s){ var menu=s.querySelector('.ffa-menu');
      s.querySelector('.ffa-chip').onclick=function(e){ e.stopPropagation(); var open=menu.style.display==='block'; closeMenus(); menu.style.display=open?'none':'block'; };
      menu.querySelector('[data-a=card]').onclick=function(){ closeMenus(); openProfile(); };
      menu.querySelector('[data-a=out]').onclick=function(){ closeMenus(); signOut(); };
    })(s);
  }
}
function closeMenus(){ var ms=document.querySelectorAll('.ffa-menu'); for(var i=0;i<ms.length;i++) ms[i].style.display='none'; }
document.addEventListener('click', closeMenus);
document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenus(); close(); } });
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', paint); else paint();

window.FFAuth={ ready:ready, client:function(){ return sb; }, user:function(){ return user; }, profile:function(){ return prof; }, nickname:nick,
  onChange:function(f){ if(typeof f==='function') subs.push(f); }, openLogin:openLogin, openProfile:openProfile, signOut:signOut, refresh:paint };
})();

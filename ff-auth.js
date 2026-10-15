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
    s.innerHTML='<span class="ffa-wrap"><button type="button" class="ffa-chip" aria-haspopup="true">🍟 <span>'+esc(fmt(T.hi,nick()))+'</span><i class="ffa-badge" style="display:none;font-style:normal"></i> ▾</button>'+
      '<span class="ffa-menu" role="menu"><button type="button" data-a="friends">'+esc(F.friends)+'<span class="ffa-badge" style="display:none"></span></button><button type="button" data-a="card">'+esc(T.card)+'</button><button type="button" data-a="out">'+esc(T.logout)+'</button></span></span>';
    (function(s){ var menu=s.querySelector('.ffa-menu');
      s.querySelector('.ffa-chip').onclick=function(e){ e.stopPropagation(); var open=menu.style.display==='block'; closeMenus(); menu.style.display=open?'none':'block'; };
      menu.querySelector('[data-a=friends]').onclick=function(){ closeMenus(); openFriends(); };
      menu.querySelector('[data-a=card]').onclick=function(){ closeMenus(); openProfile(); };
      menu.querySelector('[data-a=out]').onclick=function(){ closeMenus(); signOut(); };
    })(s);
  }
  if(typeof badge==='function') try{ badge(); }catch(e){}
}
function closeMenus(){ var ms=document.querySelectorAll('.ffa-menu'); for(var i=0;i<ms.length;i++) ms[i].style.display='none'; }
document.addEventListener('click', closeMenus);
document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenus(); close(); } });

/* ---- friends: the same friendships table as the games, so a friend made here is a friend inside every game ----
   (requests nobody answered within 3 hours run out, like in Stickseum: expire_requests() in supabase-request-expiry.sql) */
var FL={
 ko:{friends:'👥 친구',ftitle:'친구',fnote:'여기서 맺은 친구는 게임 안에서도 친구예요.',search:'닉네임으로 친구 찾기',add:'친구 요청',sent:'요청 보냄',isFriend:'친구',
     accept:'수락',decline:'거절',cancel:'취소',remove:'삭제',sure:'정말 삭제?',inc:'받은 요청',out:'보낸 요청',list:'친구 목록',
     empty:'아직 친구가 없어요. 닉네임으로 찾아보세요.',none:'그 닉네임을 가진 사람이 없어요.',short:'두 글자 이상 입력해 주세요.',
     needNick:'친구가 나를 찾을 수 있게 닉네임을 정해 주세요.',nickPh:'닉네임 (최대 12자)',save:'저장',err:'처리하지 못했어요. 잠시 뒤 다시 해 주세요.',
     toast:'{0}님이 친구 요청을 보냈어요',view:'보기',card:'프로필'},
 en:{friends:'👥 Friends',ftitle:'Friends',fnote:'Friends you make here are friends in every game too.',search:'Find friends by nickname',add:'Add friend',sent:'Request sent',isFriend:'Friend',
     accept:'Accept',decline:'Decline',cancel:'Cancel',remove:'Remove',sure:'Remove?',inc:'Requests for you',out:'Sent requests',list:'Friends',
     empty:'No friends yet. Search by nickname.',none:'Nobody has that nickname.',short:'Type at least two characters.',
     needNick:'Pick a nickname so friends can find you.',nickPh:'Nickname (up to 12)',save:'Save',err:'Something went wrong. Try again soon.',
     toast:'{0} sent you a friend request',view:'View',card:'Profile'},
 es:{friends:'👥 Amigos',ftitle:'Amigos',fnote:'Los amigos que hagas aquí también son amigos en todos los juegos.',search:'Buscar amigos por apodo',add:'Agregar',sent:'Solicitud enviada',isFriend:'Amigo',
     accept:'Aceptar',decline:'Rechazar',cancel:'Cancelar',remove:'Eliminar',sure:'¿Eliminar?',inc:'Solicitudes recibidas',out:'Solicitudes enviadas',list:'Amigos',
     empty:'Aún no tienes amigos. Busca por apodo.',none:'Nadie tiene ese apodo.',short:'Escribe al menos dos caracteres.',
     needNick:'Elige un apodo para que tus amigos te encuentren.',nickPh:'Apodo (hasta 12)',save:'Guardar',err:'Algo salió mal. Inténtalo de nuevo.',
     toast:'{0} te envió una solicitud de amistad',view:'Ver',card:'Perfil'},
 fr:{friends:'👥 Amis',ftitle:'Amis',fnote:'Les amis ajoutés ici sont aussi tes amis dans chaque jeu.',search:'Chercher un ami par pseudo',add:'Ajouter',sent:'Demande envoyée',isFriend:'Ami',
     accept:'Accepter',decline:'Refuser',cancel:'Annuler',remove:'Retirer',sure:'Retirer ?',inc:'Demandes reçues',out:'Demandes envoyées',list:'Amis',
     empty:'Pas encore d’amis. Cherche par pseudo.',none:'Personne n’a ce pseudo.',short:'Tape au moins deux caractères.',
     needNick:'Choisis un pseudo pour que tes amis te trouvent.',nickPh:'Pseudo (12 max.)',save:'Enregistrer',err:'Un problème est survenu. Réessaie bientôt.',
     toast:'{0} t’a envoyé une demande d’ami',view:'Voir',card:'Profil'},
 de:{friends:'👥 Freunde',ftitle:'Freunde',fnote:'Freunde von hier sind auch in jedem Spiel deine Freunde.',search:'Freunde per Nickname suchen',add:'Anfragen',sent:'Anfrage gesendet',isFriend:'Freund',
     accept:'Annehmen',decline:'Ablehnen',cancel:'Zurückziehen',remove:'Entfernen',sure:'Entfernen?',inc:'Erhaltene Anfragen',out:'Gesendete Anfragen',list:'Freunde',
     empty:'Noch keine Freunde. Such per Nickname.',none:'Niemand hat diesen Nickname.',short:'Mindestens zwei Zeichen eingeben.',
     needNick:'Wähle einen Nickname, damit Freunde dich finden.',nickPh:'Nickname (max. 12)',save:'Speichern',err:'Das hat nicht geklappt. Bitte gleich nochmal.',
     toast:'{0} hat dir eine Freundschaftsanfrage geschickt',view:'Ansehen',card:'Profil'},
 ja:{friends:'👥 フレンド',ftitle:'フレンド',fnote:'ここでなったフレンドは、ゲームの中でもフレンドです。',search:'ニックネームでフレンドを探す',add:'フレンド申請',sent:'申請済み',isFriend:'フレンド',
     accept:'承認',decline:'拒否',cancel:'取り消し',remove:'削除',sure:'本当に削除？',inc:'届いた申請',out:'送った申請',list:'フレンド一覧',
     empty:'まだフレンドがいません。ニックネームで探してみましょう。',none:'そのニックネームの人はいません。',short:'2文字以上入力してください。',
     needNick:'フレンドが見つけられるようにニックネームを決めてください。',nickPh:'ニックネーム（12文字まで）',save:'保存',err:'処理できませんでした。少し後でもう一度お試しください。',
     toast:'{0}さんからフレンド申請が届きました',view:'見る',card:'プロフィール'}
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
  friends=rows.map(function(x){ var o=x.requester_id===me?x.addressee_id:x.requester_id;
    return {rowId:x.id, status:x.status, otherId:o, name:names[o]||'???', incoming:x.addressee_id===me&&x.status==='pending', outgoing:x.requester_id===me&&x.status==='pending'}; });
  badge(); return friends;
}
function incomingCount(){ return friends.filter(function(f){ return f.incoming; }).length; }
function badge(){ var n=incomingCount(), bs=document.querySelectorAll('.ffa-badge'); for(var i=0;i<bs.length;i++){ bs[i].textContent=n>9?'9+':String(n); bs[i].style.display=n?'':'none'; } }
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
 '#ffaFriends input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:9px;border:1px solid #2b3245;background:#08090d;color:#eef0f5;font:inherit;font-size:16px}#ffaFriends input:focus{outline:none;border-color:#ffc93c}'+
 '#ffaFriends .row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:9px;background:#151a25;margin-top:6px}#ffaFriends .row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:14px;cursor:pointer}'+
 '#ffaFriends .row button,#ffaFriends .nk button{border:0;border-radius:7px;padding:6px 10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;background:#232a3a;color:#eef0f5;white-space:nowrap}'+
 '#ffaFriends .row button.p,#ffaFriends .nk button{background:linear-gradient(135deg,#ffc93c,#ff8a3d);color:#1a1206}#ffaFriends .row button:disabled{opacity:.6;cursor:default}#ffaFriends .row .tg{font-size:12px;color:#8a93a6;white-space:nowrap}'+
 '#ffaFriends .e{color:#8a93a6;font-size:13px;padding:8px 2px}#ffaFriends .nk{display:flex;gap:8px;margin:0 0 6px}#ffaFriends .nk input{flex:1}#ffaFriends .x{float:right;background:none;border:0;color:#8a93a6;font-size:20px;cursor:pointer;line-height:1}'+
 '#ffaToast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147482600;background:#10131b;border:1px solid #ffc93c;color:#eef0f5;border-radius:12px;padding:10px 14px;font:600 14px system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center;max-width:calc(100vw - 32px)}'+
 '#ffaToast button{border:0;border-radius:7px;padding:5px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#ffc93c,#ff8a3d);color:#1a1206}';
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
  var acc=friends.filter(function(f){ return f.status==='accepted'; }).sort(function(a,b){ return a.name.localeCompare(b.name,'ko'); });
  if(acc.length) section(F.list, acc, function(f){ var d=row(f.name,f.otherId,[[F.card,function(){ openProfile(f.otherId); return null; }]]);
      var rm=document.createElement('button'); rm.type='button'; rm.textContent=F.remove;
      rm.onclick=async function(e){ e.stopPropagation(); if(fbusy) return; if(!rm.dataset.sure){ rm.dataset.sure='1'; rm.textContent=F.sure; setTimeout(function(){ if(rm.isConnected&&!fbusy){ delete rm.dataset.sure; rm.textContent=F.remove; } },3000); return; } fbusy=true; rm.disabled=true; var r; try{ r=await removeRow(f.rowId); }catch(x){ r={error:x}; } fbusy=false; if(r&&r.error) toastErr(); fpaint(); };
      d.appendChild(rm); return d; });
  else { var h=document.createElement('h4'); h.textContent=F.list; ls.appendChild(h); var e=document.createElement('div'); e.className='e'; e.textContent=F.empty; ls.appendChild(e); }
  section(F.out, friends.filter(function(f){ return f.outgoing; }), function(f){ return row(f.name,f.otherId,[[F.cancel,function(){ return respond(f.rowId,false); }]],F.sent); });
}
async function openFriends(){ if(!sb) return; if(!user) return openLogin(); closeMenus(); var el=fmodal(); el.style.display='flex'; fpaint(); await loadFriends(); fpaint(); }
subs.push(function(u){ friends=[]; badge(); watchFriends(); if(u) loadFriends().then(function(){ fpaint(); var n=incomingCount(); if(n){ var f=friends.filter(function(x){ return x.incoming; })[0]; toast(n>1?fmt(F.toast,f.name)+' (+'+(n-1)+')':fmt(F.toast,f.name)); } }); else { var el=document.getElementById('ffaFriends'); if(el) el.style.display='none'; } });
setInterval(function(){ if(user) loadFriends().then(fpaint).catch(function(){}); }, 10*60*1000);

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', paint); else paint();

window.FFAuth={ ready:ready, client:function(){ return sb; }, user:function(){ return user; }, profile:function(){ return prof; }, nickname:nick,
  onChange:function(f){ if(typeof f==='function') subs.push(f); }, openLogin:openLogin, openProfile:openProfile, openFriends:openFriends, friends:function(){ return friends.slice(); }, signOut:signOut, refresh:paint };
})();

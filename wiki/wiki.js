/* Frenchfries777 Wiki — Stickseum · Crown Envoy · Beaconfall 공략 위키
   글은 Supabase ff_wiki (원문 = 한국어), 고친 기록은 ff_wiki_hist, 저장은 ff_wiki_save (supabase-ff-wiki.sql).
   번역은 tr/<언어>.json 에 있어요: { "게임/slug": { h: 원문 해시, t: 제목, b: 본문 } }.
   원문이 고쳐져서 해시가 달라지면 번역 대신 한국어 원문을 보여 줘요. 번역을 다시 만들면 h 를 새 원문으로 계산해요 (fnv 아래). */
(function(){
var LANGS=['ko','en','es','fr','de','ja'], NAMES={ko:'한국어',en:'English',es:'Español',fr:'Français',de:'Deutsch',ja:'日本語'};
var GAMES=[['stickseum','Stickseum'],['crownenvoy','Crown Envoy'],['beaconfall','Beaconfall']];
var U={
 ko:{hub:'허브',sub:'누구나 읽을 수 있고, 로그인하면 고치거나 새 글을 쓸 수 있어요.',search:'위키 검색',loading:'불러오는 중…',pages:'글 목록',toc:'목차',newp:'＋ 새 글',
  edit:'✏️ 고치기',hist:'🕘 기록',del:'삭제',delSure:'정말 삭제할까요?',empty:'아직 글이 없어요. 첫 글을 써 보세요!',nf:'글을 찾지 못했어요.',edited:'{0} 수정',seed:'처음 쓴 글',
  trNote:'번역본이에요.',orig:'한국어 원문 보기',showTr:'번역 보기',koOnly:'이 글은 최근에 고쳐져서 지금은 한국어 원문으로만 볼 수 있어요.',editKo:'고치기는 한국어 원문으로 해요.',
  title:'제목',body:'내용',help:'## 소제목 · - 목록 · 1. 순서 목록 · **굵게**',prev:'미리보기',write:'쓰기',cancel:'취소',save:'저장',needT:'제목을 적어 주세요.',
  histT:'🕘 고친 기록',back:'← 글로 돌아가기',noHist:'아직 기록이 없어요.',cur:'지금 버전',view:'보기',restore:'이 버전으로 되돌리기',
  res:'"{0}" 검색 결과 {1}개',noRes:'검색 결과가 없어요.',pv:'이전 글',nx:'다음 글',fast:'너무 빨리 쓰고 있어요. 잠시 뒤에 다시 해 주세요.',err:'처리하지 못했어요. 잠시 뒤 다시 해 주세요.',
  justNow:'방금',min:'{0}분 전',hr:'{0}시간 전',day:'{0}일 전',lang:'언어',
  nav:'둘러보기',main:'대문',recent:'최근 바뀜',random:'임의 문서',doc:'문서',special:'특수 문서',read:'읽기',edit:'고치기',hist:'기록 보기',idx:'문서 목록',newp:'＋ 새 글',newT:'새 글 쓰기',mainT:'Frenchfries777 위키',mainIntro:'Stickseum · Crown Envoy · Beaconfall 공략 위키예요. 누구나 읽을 수 있고, 로그인하면 고치거나 새 글을 쓸 수 있어요.',colP:'문서',colD:'설명',hatG:'이 문서는 {0} 공략이에요. 다른 게임 문서는 왼쪽 메뉴에 있어요.',recentIntro:'가장 최근에 고쳐진 문서부터 보여 줘요.',count:'문서 {0}개',searchT:'검색'},
 en:{hub:'Hub',sub:'Anyone can read it. Log in to fix a page or write a new one.',search:'Search the wiki',loading:'Loading…',pages:'Pages',toc:'Contents',newp:'＋ New page',
  edit:'✏️ Edit',hist:'🕘 History',del:'Delete',delSure:'Really delete?',empty:'No pages yet. Write the first one!',nf:'Page not found.',edited:'Edited {0}',seed:'Original page',
  trNote:'This is a translation.',orig:'Show the Korean original',showTr:'Show translation',koOnly:'This page was edited recently, so for now it is only available in the Korean original.',editKo:'Edits are made to the Korean original.',
  title:'Title',body:'Text',help:'## heading · - list · 1. numbered list · **bold**',prev:'Preview',write:'Write',cancel:'Cancel',save:'Save',needT:'Please enter a title.',
  histT:'🕘 Edit history',back:'← Back to the page',noHist:'No history yet.',cur:'current version',view:'View',restore:'Restore this version',
  res:'{1} results for "{0}"',noRes:'No results.',pv:'Previous',nx:'Next',fast:'You are editing too fast. Please try again in a moment.',err:'Something went wrong. Please try again soon.',
  justNow:'just now',min:'{0} min ago',hr:'{0} h ago',day:'{0} days ago',lang:'Language',
  nav:'Navigation',main:'Main page',recent:'Recent changes',random:'Random page',doc:'Page',special:'Special page',read:'Read',edit:'Edit',hist:'View history',idx:'All pages',newp:'＋ New page',newT:'Write a new page',mainT:'Frenchfries777 Wiki',mainIntro:'A guide wiki for Stickseum, Crown Envoy and Beaconfall. Anyone can read it. Log in to fix a page or write a new one.',colP:'Page',colD:'Description',hatG:'This page is a {0} guide. Pages for the other games are in the left menu.',recentIntro:'The most recently edited pages come first.',count:'{0} pages',searchT:'Search'},
 es:{hub:'Hub',sub:'Cualquiera puede leerla. Inicia sesión para corregir una página o escribir una nueva.',search:'Buscar en la wiki',loading:'Cargando…',pages:'Páginas',toc:'Contenido',newp:'＋ Página nueva',
  edit:'✏️ Editar',hist:'🕘 Historial',del:'Eliminar',delSure:'¿Eliminar de verdad?',empty:'Aún no hay páginas. ¡Escribe la primera!',nf:'No se encontró la página.',edited:'Editada {0}',seed:'Página original',
  trNote:'Esto es una traducción.',orig:'Ver el original en coreano',showTr:'Ver traducción',koOnly:'Esta página se editó hace poco, así que por ahora solo está en el original coreano.',editKo:'Las ediciones se hacen en el original coreano.',
  title:'Título',body:'Texto',help:'## subtítulo · - lista · 1. lista numerada · **negrita**',prev:'Vista previa',write:'Escribir',cancel:'Cancelar',save:'Guardar',needT:'Escribe un título.',
  histT:'🕘 Historial de cambios',back:'← Volver a la página',noHist:'Aún no hay historial.',cur:'versión actual',view:'Ver',restore:'Restaurar esta versión',
  res:'{1} resultados para "{0}"',noRes:'Sin resultados.',pv:'Anterior',nx:'Siguiente',fast:'Estás editando demasiado rápido. Inténtalo de nuevo en un momento.',err:'Algo salió mal. Inténtalo de nuevo pronto.',
  justNow:'ahora mismo',min:'hace {0} min',hr:'hace {0} h',day:'hace {0} días',lang:'Idioma',
  nav:'Navegación',main:'Portada',recent:'Cambios recientes',random:'Página aleatoria',doc:'Página',special:'Página especial',read:'Leer',edit:'Editar',hist:'Ver historial',idx:'Todas las páginas',newp:'＋ Página nueva',newT:'Escribir una página nueva',mainT:'Wiki de Frenchfries777',mainIntro:'Una wiki de guías para Stickseum, Crown Envoy y Beaconfall. Cualquiera puede leerla. Inicia sesión para corregir una página o escribir una nueva.',colP:'Página',colD:'Descripción',hatG:'Esta página es una guía de {0}. Las páginas de los otros juegos están en el menú de la izquierda.',recentIntro:'Primero aparecen las páginas editadas más recientemente.',count:'{0} páginas',searchT:'Buscar'},
 fr:{hub:'Hub',sub:'Tout le monde peut la lire. Connecte-toi pour corriger une page ou en écrire une nouvelle.',search:'Rechercher dans le wiki',loading:'Chargement…',pages:'Pages',toc:'Sommaire',newp:'＋ Nouvelle page',
  edit:'✏️ Modifier',hist:'🕘 Historique',del:'Supprimer',delSure:'Vraiment supprimer ?',empty:'Pas encore de page. Écris la première !',nf:'Page introuvable.',edited:'Modifiée {0}',seed:'Page d’origine',
  trNote:'Ceci est une traduction.',orig:'Voir l’original coréen',showTr:'Voir la traduction',koOnly:'Cette page a été modifiée récemment, elle n’est donc disponible pour l’instant qu’en coréen.',editKo:'Les modifications se font sur l’original coréen.',
  title:'Titre',body:'Texte',help:'## sous-titre · - liste · 1. liste numérotée · **gras**',prev:'Aperçu',write:'Écrire',cancel:'Annuler',save:'Enregistrer',needT:'Indique un titre.',
  histT:'🕘 Historique des modifications',back:'← Retour à la page',noHist:'Pas encore d’historique.',cur:'version actuelle',view:'Voir',restore:'Restaurer cette version',
  res:'{1} résultats pour « {0} »',noRes:'Aucun résultat.',pv:'Précédente',nx:'Suivante',fast:'Tu modifies trop vite. Réessaie dans un instant.',err:'Une erreur est survenue. Réessaie bientôt.',
  justNow:'à l’instant',min:'il y a {0} min',hr:'il y a {0} h',day:'il y a {0} jours',lang:'Langue',
  nav:'Navigation',main:'Accueil',recent:'Modifications récentes',random:'Page au hasard',doc:'Page',special:'Page spéciale',read:'Lire',edit:'Modifier',hist:'Voir l’historique',idx:'Toutes les pages',newp:'＋ Nouvelle page',newT:'Écrire une nouvelle page',mainT:'Wiki Frenchfries777',mainIntro:'Un wiki de guides pour Stickseum, Crown Envoy et Beaconfall. Tout le monde peut le lire. Connecte-toi pour corriger une page ou en écrire une nouvelle.',colP:'Page',colD:'Description',hatG:'Cette page est un guide de {0}. Les pages des autres jeux sont dans le menu de gauche.',recentIntro:'Les pages modifiées le plus récemment apparaissent en premier.',count:'{0} pages',searchT:'Recherche'},
 de:{hub:'Hub',sub:'Alle können es lesen. Melde dich an, um eine Seite zu verbessern oder eine neue zu schreiben.',search:'Wiki durchsuchen',loading:'Lädt…',pages:'Seiten',toc:'Inhalt',newp:'＋ Neue Seite',
  edit:'✏️ Bearbeiten',hist:'🕘 Verlauf',del:'Löschen',delSure:'Wirklich löschen?',empty:'Noch keine Seiten. Schreib die erste!',nf:'Seite nicht gefunden.',edited:'Bearbeitet {0}',seed:'Ursprüngliche Seite',
  trNote:'Dies ist eine Übersetzung.',orig:'Koreanisches Original anzeigen',showTr:'Übersetzung anzeigen',koOnly:'Diese Seite wurde kürzlich bearbeitet und ist daher vorerst nur im koreanischen Original verfügbar.',editKo:'Bearbeitet wird das koreanische Original.',
  title:'Titel',body:'Text',help:'## Überschrift · - Liste · 1. nummerierte Liste · **fett**',prev:'Vorschau',write:'Schreiben',cancel:'Abbrechen',save:'Speichern',needT:'Bitte gib einen Titel ein.',
  histT:'🕘 Bearbeitungsverlauf',back:'← Zurück zur Seite',noHist:'Noch kein Verlauf.',cur:'aktuelle Version',view:'Ansehen',restore:'Diese Version wiederherstellen',
  res:'{1} Ergebnisse für „{0}“',noRes:'Keine Ergebnisse.',pv:'Zurück',nx:'Weiter',fast:'Du bearbeitest zu schnell. Versuch es gleich noch einmal.',err:'Etwas ist schiefgelaufen. Versuch es bald noch einmal.',
  justNow:'gerade eben',min:'vor {0} Min.',hr:'vor {0} Std.',day:'vor {0} Tagen',lang:'Sprache',
  nav:'Navigation',main:'Hauptseite',recent:'Letzte Änderungen',random:'Zufällige Seite',doc:'Seite',special:'Spezialseite',read:'Lesen',edit:'Bearbeiten',hist:'Versionsgeschichte',idx:'Alle Seiten',newp:'＋ Neue Seite',newT:'Neue Seite schreiben',mainT:'Frenchfries777-Wiki',mainIntro:'Ein Guide-Wiki für Stickseum, Crown Envoy und Beaconfall. Alle können es lesen. Melde dich an, um eine Seite zu verbessern oder eine neue zu schreiben.',colP:'Seite',colD:'Beschreibung',hatG:'Diese Seite ist ein {0}-Guide. Seiten zu den anderen Spielen findest du im Menü links.',recentIntro:'Die zuletzt bearbeiteten Seiten stehen oben.',count:'{0} Seiten',searchT:'Suche'},
 ja:{hub:'ハブ',sub:'誰でも読めます。ログインすると記事を直したり、新しく書いたりできます。',search:'Wikiを検索',loading:'読み込み中…',pages:'記事一覧',toc:'目次',newp:'＋ 新しい記事',
  edit:'✏️ 編集',hist:'🕘 履歴',del:'削除',delSure:'本当に削除しますか？',empty:'まだ記事がありません。最初の記事を書いてみましょう！',nf:'記事が見つかりません。',edited:'{0}に編集',seed:'最初の記事',
  trNote:'翻訳版です。',orig:'韓国語の原文を見る',showTr:'翻訳を見る',koOnly:'この記事は最近編集されたため、今は韓国語の原文でのみ読めます。',editKo:'編集は韓国語の原文に対して行います。',
  title:'タイトル',body:'本文',help:'## 見出し · - リスト · 1. 番号付きリスト · **太字**',prev:'プレビュー',write:'書く',cancel:'キャンセル',save:'保存',needT:'タイトルを入力してください。',
  histT:'🕘 編集履歴',back:'← 記事に戻る',noHist:'まだ履歴がありません。',cur:'現在の版',view:'見る',restore:'この版に戻す',
  res:'「{0}」の検索結果 {1}件',noRes:'検索結果がありません。',pv:'前の記事',nx:'次の記事',fast:'編集が速すぎます。少し待ってからもう一度お試しください。',err:'処理できませんでした。しばらくしてからもう一度お試しください。',
  justNow:'たった今',min:'{0}分前',hr:'{0}時間前',day:'{0}日前',lang:'言語',
  nav:'案内',main:'メインページ',recent:'最近の更新',random:'おまかせ表示',doc:'記事',special:'特別ページ',read:'閲覧',edit:'編集',hist:'履歴表示',idx:'記事一覧',newp:'＋ 新しい記事',newT:'新しい記事を書く',mainT:'Frenchfries777 Wiki',mainIntro:'Stickseum・Crown Envoy・Beaconfall の攻略Wikiです。誰でも読めます。ログインすると記事を直したり、新しく書いたりできます。',colP:'記事',colD:'説明',hatG:'この記事は {0} の攻略です。ほかのゲームの記事は左のメニューにあります。',recentIntro:'最近編集された記事から順に表示します。',count:'{0}件の記事',searchT:'検索'}
};
function detect(){ var p=null; try{ if(window.FFLang) p=FFLang.sync&&FFLang.sync(); }catch(e){} try{ p=p||localStorage.getItem('arenaClashLang'); }catch(e){} if(LANGS.indexOf(p)>=0) return p;
  var c=[]; try{ c=navigator.languages||[navigator.language||'']; }catch(e){} for(var i=0;i<c.length;i++){ var b=String(c[i]||'').toLowerCase().split('-')[0]; if(LANGS.indexOf(b)>=0) return b; } return 'en'; }
var lang=detect(), L=U[lang]||U.en;
function t(k){ var s=L[k]!=null?L[k]:U.ko[k], a=arguments; return String(s).replace(/\{(\d)\}/g,function(_,n){ var v=a[+n+1]; return v==null?'':String(v); }); }
function $(s){ return document.querySelector(s); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
/* 원문 해시 (FNV-1a 32bit, UTF-16 단위) — 번역 파일의 h 와 같은 방식 */
function fnv(s){ var h=0x811c9dc5; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return ('0000000'+h.toString(16)).slice(-8); }


/* 화면 상태: sp = 'main' | 'recent' | null(게임 문서) · view = 'read' | 'edit' | 'hist' */
var sb=null, me=null, admin=false, all=[], TR={}, names={}, game='stickseum', slug=null, sp='main', view='read', showOrig=false, query='', langSel=null, opened={};

/* ---- 아주 작은 글 형식: ## 소제목, - 목록, 1. 순서 목록, **굵게** ---- */
function inl(s,hl){ s=esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>'); return hl?mark(s,hl):s; }
function mark(html,q){ if(!q) return html; var e=esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); try{ return html.replace(new RegExp('(^|>)([^<]*)','g'),function(_,a,b){ return a+b.replace(new RegExp(e,'gi'),function(x){ return '<mark>'+x+'</mark>'; }); }); }catch(err){ return html; } }
function render(text,hl){ var out='', list=null, para=[], heads=[];
  function fp(){ if(para.length){ out+='<p>'+para.join('<br>')+'</p>'; para=[]; } }
  function fl(){ if(list){ out+='</'+list+'>'; list=null; } }
  String(text||'').replace(/\r/g,'').split('\n').forEach(function(raw){ var l=raw.replace(/\s+$/,''), m;
    if(/^#{2,3}\s+/.test(l)){ fp(); fl(); var h=l.replace(/^#{2,3}\s+/,''), id='h'+heads.length; heads.push([id,h.replace(/\*\*/g,'')]); out+='<h3 id="'+id+'"><span>'+inl(h,hl)+'</span></h3>'; }
    else if((m=/^\s*[-•]\s+(.*)$/.exec(l))){ fp(); if(list!=='ul'){ fl(); out+='<ul>'; list='ul'; } out+='<li>'+inl(m[1],hl)+'</li>'; }
    else if((m=/^\s*\d+[.)]\s+(.*)$/.exec(l))){ fp(); if(list!=='ol'){ fl(); out+='<ol>'; list='ol'; } out+='<li>'+inl(m[1],hl)+'</li>'; }
    else if(!l.trim()){ fp(); fl(); }
    else { fl(); para.push(inl(l,hl)); } });
  fp(); fl(); return {html:out, heads:heads}; }

/* ---- 보이는 글 (번역이 원문과 맞으면 번역) ---- */
function trOf(p){ if(lang==='ko') return null; var x=TR[p.game+'/'+p.slug]; if(!x||!x.t) return null; return x.h===fnv(p.title+'\n'+p.body)?x:'stale'; }
function shown(p){ var x=trOf(p); if(x&&x!=='stale'&&!showOrig) return {title:x.t, body:x.b, tr:true}; return {title:p.title, body:p.body, tr:false, stale:x==='stale'}; }
function titleOf(p){ var x=trOf(p); return (x&&x!=='stale')?x.t:p.title; }
function pagesOf(g){ return all.filter(function(p){ return p.game===g; }).sort(function(a,b){ return (a.sort-b.sort)||String(a.title).localeCompare(String(b.title)); }); }
function descOf(p){ var x=trOf(p), b=(x&&x!=='stale')?x.b:p.body, ls=String(b).replace(/\r/g,'').split('\n');
  for(var i=0;i<ls.length;i++){ var l=ls[i].trim(); if(!l||/^#{2,3}\s/.test(l)) continue; l=l.replace(/\*\*/g,'').replace(/^[-•]\s+|^\d+[.)]\s+/,''); return l.length>90?l.slice(0,88)+'…':l; } return ''; }

function ago(ts){ var d=(Date.now()-Date.parse(ts))/1000; if(!(d>=0)) return ''; if(d<60) return t('justNow'); if(d<3600) return t('min',Math.floor(d/60)); if(d<86400) return t('hr',Math.floor(d/3600)); if(d<8*86400) return t('day',Math.floor(d/86400));
  try{ return new Date(ts).toLocaleDateString(lang); }catch(e){ return String(ts).slice(0,10); } }
function errText(e){ var m=String((e&&(e.message||e.details))||e||''); return /too many|slow down/i.test(m)?t('fast'):t('err'); }
async function loadNames(ids){ ids=ids.filter(function(id,i){ return id&&!names[id]&&ids.indexOf(id)===i; }); if(!ids.length||!sb) return;
  try{ var r=await sb.from('profiles').select('id,username,display_name').in('id',ids); ((r&&r.data)||[]).forEach(function(p){ names[p.id]=(p.display_name&&String(p.display_name).trim())||p.username||'???'; }); }catch(e){} }
function who(id){ return id?(names[id]||'???'):t('seed'); }
function login(){ try{ FFAuth.openLogin(); }catch(e){} }
function gameName(g){ for(var i=0;i<GAMES.length;i++) if(GAMES[i][0]===g) return GAMES[i][1]; return g; }
function curPage(){ return slug?all.filter(function(x){ return x.game===game&&x.slug===slug; })[0]||null:null; }

/* ---- 주소: #main · #recent · #게임 · #게임/slug ---- */
function hashNow(){ return '#'+(sp||(game+(slug?'/'+slug:''))); }
function setHash(){ var h=hashNow(); if(location.hash!==h) try{ history.replaceState(null,'',h); }catch(e){ location.hash=h; } }
function fromHash(){ var h=location.hash||'';
  if(h==='#recent'){ sp='recent'; return; }
  var m=/^#([a-z0-9_]+)(?:\/([a-z0-9-]+))?/.exec(h);
  if(m&&GAMES.some(function(g){ return g[0]===m[1]; })){ sp=null; game=m[1]; slug=m[2]||null; return; }
  sp='main'; }

/* ---- 왼쪽 메뉴 ---- */
function paintSide(){
  var S=$('#side'), logo=S.querySelector('.logo');
  var h='<div class="box"><h4>'+esc(t('nav'))+'</h4><a href="#main"'+(sp==='main'&&!query?' class="on"':'')+'>'+esc(t('main'))+'</a><a href="#recent"'+(sp==='recent'&&!query?' class="on"':'')+'>'+esc(t('recent'))+'</a><button type="button" data-rand="1">'+esc(t('random'))+'</button><a href="../">← '+esc(t('hub'))+'</a></div>';
  h+='<div class="box"><h4>'+esc(t('doc'))+'</h4>'+GAMES.map(function(g){ var ps=pagesOf(g[0]), op=opened[g[0]]!=null?opened[g[0]]:(!sp&&g[0]===game);
    return '<details class="g-'+g[0]+'" data-g="'+g[0]+'"'+(op?' open':'')+'><summary>'+esc(g[1])+'<span class="n">'+ps.length+'</span></summary><div class="sub">'+
      '<a class="idx'+(!sp&&!slug&&g[0]===game&&!query?' on':'')+'" href="#'+g[0]+'">'+esc(t('idx'))+'</a>'+
      ps.map(function(p){ return '<a href="#'+g[0]+'/'+esc(p.slug)+'"'+(!sp&&g[0]===game&&p.slug===slug&&!query?' class="on"':'')+'>'+esc(titleOf(p))+'</a>'; }).join('')+
      '<button type="button" class="new" data-new="'+g[0]+'">'+esc(t('newp'))+'</button></div></details>'; }).join('')+'</div>';
  S.innerHTML=''; S.appendChild(logo); S.insertAdjacentHTML('beforeend',h);
  S.querySelectorAll('details').forEach(function(d){ d.addEventListener('toggle',function(){ opened[d.getAttribute('data-g')]=d.open; }); });
}
/* ---- 위 탭: 왼쪽 문서 / 오른쪽 읽기 · 고치기 · 기록 보기 ---- */
function paintTabs(kind){
  var L='', R='';
  if(kind==='page'){ L='<a class="on" href="'+hashNow()+'">'+esc(t('doc'))+'</a>';
    R='<button type="button" data-v="read"'+(view==='read'?' class="on"':'')+'>'+esc(t('read'))+'</button><button type="button" data-v="edit"'+(view==='edit'?' class="on"':'')+'>'+esc(t('edit'))+'</button><button type="button" data-v="hist"'+(view==='hist'?' class="on"':'')+'>'+esc(t('hist'))+'</button>'+(admin?'<button type="button" class="dl" data-v="del">'+esc(t('del'))+'</button>':''); }
  else if(kind==='new') L='<a class="on" href="'+hashNow()+'">'+esc(t('newT'))+'</a>';
  else if(kind==='game'){ L='<a class="on" href="#'+game+'">'+esc(t('idx'))+'</a>'; R='<button type="button" data-new="'+game+'">'+esc(t('newp'))+'</button>'; }
  else L='<a class="on" href="'+(query?'#':hashNow())+'">'+esc(kind==='main'?t('main'):t('special'))+'</a>';
  $('#tabsL').innerHTML=L; $('#tabsR').innerHTML=R;
}
function head(title,cls){ return '<div class="ph"><h1>'+esc(title)+'</h1><span class="lg"></span></div>'; }
function putLang(){ var s=$('#page .lg'); if(s&&langSel) s.appendChild(langSel); }
function table(ps){ return '<table class="wt"><tr><th>'+esc(t('colP'))+'</th><th>'+esc(t('colD'))+'</th></tr>'+ps.map(function(p){ return '<tr><td><a href="#'+p.game+'/'+esc(p.slug)+'">'+esc(titleOf(p))+'</a></td><td>'+esc(descOf(p))+'</td></tr>'; }).join('')+'</table>'; }

/* ---- 화면 ---- */
async function paint(){
  paintSide(); document.body.classList.remove('navOpen'); var A=$('#page');
  if(query) return paintSearch();
  if(sp==='main') return paintMain();
  if(sp==='recent') return paintRecent();
  var ps=pagesOf(game); if(slug&&!ps.some(function(p){ return p.slug===slug; })) slug=null;
  setHash();
  if(!slug) return paintGame();
  var p=curPage();
  if(view==='edit') return edit(p);
  if(view==='hist') return hist(p);
  var i=ps.indexOf(p), s=shown(p), r=render(s.body);
  if(p.updated_by) await loadNames([p.updated_by]);
  paintTabs('page');
  var note='';
  if(s.tr) note='<div class="note">'+esc(t('trNote'))+'<button type="button" data-orig="1">'+esc(t('orig'))+'</button></div>';
  else if(lang!=='ko'&&showOrig&&trOf(p)&&trOf(p)!=='stale') note='<div class="note"><button type="button" data-orig="0" style="margin:0">'+esc(t('showTr'))+'</button></div>';
  else if(s.stale) note='<div class="note">'+esc(t('koOnly'))+'</div>';
  var body=r.html.replace(/<\/span><\/h3>/g,'</span><span class="se">[<button type="button" data-v="edit">'+esc(t('edit'))+'</button>]</span></h3>');
  if(r.heads.length>1){ var toc='<div class="toc"><h4>'+esc(t('toc'))+'</h4><ol>'+r.heads.map(function(h){ return '<li><a href="#" data-h="'+h[0]+'">'+esc(h[1])+'</a></li>'; }).join('')+'</ol></div>', k=body.indexOf('<h3');
    body=k<0?body+toc:body.slice(0,k)+toc+body.slice(k); }
  A.className='page g-'+game;
  A.innerHTML=head(s.title)+'<div class="hat">'+t('hatG','<b>'+esc(gameName(game))+'</b>')+'</div>'+note+
    '<div class="txt">'+body+'</div><div class="meta"><span>'+esc(who(p.updated_by))+' · '+esc(t('edited',ago(p.updated_at)))+'</span></div>'+
    '<div class="pn">'+(i>0?'<a href="#'+game+'/'+esc(ps[i-1].slug)+'"><small>← '+esc(t('pv'))+'</small>'+esc(titleOf(ps[i-1]))+'</a>':'')+(i<ps.length-1?'<a class="nx" href="#'+game+'/'+esc(ps[i+1].slug)+'"><small>'+esc(t('nx'))+' →</small>'+esc(titleOf(ps[i+1]))+'</a>':'')+'</div>';
  putLang();
}
function paintMain(){
  var A=$('#page'); setHash(); paintTabs('main'); A.className='page';
  A.innerHTML=head(t('mainT'))+'<div class="txt"><p>'+esc(t('mainIntro'))+'</p>'+
    GAMES.map(function(g){ var ps=pagesOf(g[0]); return '<h3 class="g-'+g[0]+'"><span><a href="#'+g[0]+'" style="color:var(--g);text-decoration:none">'+esc(g[1])+'</a></span><span class="se">'+esc(t('count',ps.length))+'</span></h3>'+(ps.length?table(ps):'<div class="e">'+esc(t('empty'))+'</div>'); }).join('')+'</div>';
  putLang();
}
function paintGame(){
  var A=$('#page'), ps=pagesOf(game); paintTabs('game'); A.className='page g-'+game;
  A.innerHTML=head(gameName(game))+'<div class="hat">'+esc(t('count',ps.length))+'</div><div class="txt">'+(ps.length?table(ps):'<div class="e">'+esc(t('empty'))+'</div>')+'</div>';
  putLang();
}
async function paintRecent(){
  var A=$('#page'); setHash(); paintTabs('recent'); A.className='page';
  var rows=all.slice().sort(function(a,b){ return Date.parse(b.updated_at)-Date.parse(a.updated_at); }).slice(0,50);
  await loadNames(rows.map(function(x){ return x.updated_by; }));
  var html='', day='';
  rows.forEach(function(p){ var d=new Date(p.updated_at), ds; try{ ds=d.toLocaleDateString(lang,{year:'numeric',month:'long',day:'numeric'}); }catch(e){ ds=String(p.updated_at).slice(0,10); }
    if(ds!==day){ if(day) html+='</ul>'; html+='<h3><span>'+esc(ds)+'</span></h3><ul class="rc">'; day=ds; }
    var tm=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    html+='<li class="g-'+p.game+'"><span class="tm">'+tm+'</span><span class="rg">'+esc(gameName(p.game))+'</span><a href="#'+p.game+'/'+esc(p.slug)+'">'+esc(titleOf(p))+'</a> <span class="who">· '+esc(who(p.updated_by))+'</span></li>'; });
  if(day) html+='</ul>';
  A.innerHTML=head(t('recent'))+'<div class="hat">'+esc(t('recentIntro'))+'</div><div class="txt">'+(html||'<div class="e">'+esc(t('noHist'))+'</div>')+'</div>';
  putLang();
}
function edit(p){
  if(!me){ view='read'; login(); return p?paint():null; }
  var A=$('#page'); view='edit'; paintTabs(p?'page':'new'); A.className='page g-'+game;
  A.innerHTML=head(p?titleOf(p):t('newT'))+'<div class="hat"><b>'+esc(gameName(game))+'</b></div>'+(lang!=='ko'?'<div class="note">'+esc(t('editKo'))+'</div>':'')+
    '<form class="w"><input name="t" maxlength="60" required><textarea name="b" rows="18" maxlength="20000"></textarea><div class="prev txt" style="display:none"></div>'+
    '<div class="help">'+esc(t('help'))+'</div><div class="m"></div><div class="row"><button type="button" class="btn2 pvb">'+esc(t('prev'))+'</button><div class="acts"><button type="button" class="btn2 cn">'+esc(t('cancel'))+'</button><button class="btn">'+esc(t('save'))+'</button></div></div></form>';
  putLang();
  var f=A.querySelector('form'); f.t.placeholder=t('title'); f.b.placeholder=t('body'); f.t.value=p?p.title:''; f.b.value=p?p.body:'';
  var pv=f.querySelector('.prev'), pb=f.querySelector('.pvb');
  pb.onclick=function(){ var on=pv.style.display==='none'; pv.style.display=on?'':'none'; f.b.style.display=on?'none':''; pb.textContent=on?t('write'):t('prev'); if(on) pv.innerHTML=render(f.b.value).html; };
  f.querySelector('.cn').onclick=function(){ view='read'; paint(); };
  f.onsubmit=async function(e){ e.preventDefault(); var m=f.querySelector('.m'), ti=f.t.value.trim(); if(!ti){ m.textContent=t('needT'); return; }
    var s=p?p.slug:('p'+Date.now().toString(36)); var bt=f.querySelector('.btn'); bt.disabled=true;
    var r=await sb.rpc('ff_wiki_save',{p_game:game, p_slug:s, p_title:ti, p_body:f.b.value}); bt.disabled=false;
    if(r.error){ m.textContent=errText(r.error); return; } sp=null; slug=s; view='read'; showOrig=false; try{ if(FFAuth.syncHub) FFAuth.syncHub(); }catch(x){} await load(); window.scrollTo(0,0); };
  f.t.focus();
}
async function hist(p){
  var A=$('#page'); view='hist'; paintTabs('page'); A.className='page g-'+game; A.innerHTML='<div class="e">'+esc(t('loading'))+'</div>';
  var r=await sb.from('ff_wiki_hist').select('id,title,body,user_id,created_at').eq('game',p.game).eq('slug',p.slug).order('created_at',{ascending:false}).limit(30);
  var rows=(r&&r.data)||[]; await loadNames(rows.map(function(x){ return x.user_id; }));
  if(view!=='hist') return;
  A.innerHTML=head(titleOf(p))+'<div class="hat">'+esc(t('histT'))+'</div><div class="hl"></div>';
  putLang();
  var H=A.querySelector('.hl'); if(!rows.length){ H.innerHTML='<div class="e">'+esc(t('noHist'))+'</div>'; return; }
  rows.forEach(function(x,i){ var d=document.createElement('div'); d.className='hr';
    d.innerHTML='<div class="hm">'+esc(who(x.user_id))+' · '+esc(ago(x.created_at))+(i===0?' · <b>'+esc(t('cur'))+'</b>':'')+'</div><div class="acts"><button type="button" class="btn2 v">'+esc(t('view'))+'</button>'+(i&&me?'<button type="button" class="btn2 rs">'+esc(t('restore'))+'</button>':'')+'</div><div class="txt" style="display:none"></div>';
    d.querySelector('.v').onclick=function(){ var tx=d.querySelector('.txt'); if(tx.style.display==='none'){ tx.innerHTML='<p><b>'+esc(x.title)+'</b></p>'+render(x.body).html; tx.style.display=''; } else tx.style.display='none'; };
    var rb=d.querySelector('.rs'); if(rb) rb.onclick=async function(){ rb.disabled=true; var q=await sb.rpc('ff_wiki_save',{p_game:p.game, p_slug:p.slug, p_title:x.title, p_body:x.body}); if(q.error){ rb.disabled=false; rb.textContent=errText(q.error); return; } view='read'; await load(); };
    H.appendChild(d); });
}
async function del(p,b){ if(!b.dataset.s){ b.dataset.s=1; b.textContent=t('delSure'); return; } var q=await sb.from('ff_wiki').delete().eq('game',p.game).eq('slug',p.slug); if(q.error){ b.textContent=errText(q.error); return; } slug=null; view='read'; await load(); }
function snippet(text,q){ var plain=String(text).replace(/\*\*/g,'').replace(/^#{2,3}\s+|^\s*[-•]\s+|^\s*\d+[.)]\s+/gm,'').replace(/\s+/g,' '), i=plain.toLowerCase().indexOf(q.toLowerCase());
  if(i<0) return esc(plain.slice(0,110))+(plain.length>110?'…':''); var a=Math.max(0,i-45), s=plain.slice(a,i+q.length+75);
  return (a?'…':'')+mark(esc(s),q)+(i+q.length+75<plain.length?'…':''); }
function paintSearch(){
  var A=$('#page'), q=query.trim(), ql=q.toLowerCase(), hits=[]; A.className='page'; paintTabs('search');
  all.forEach(function(p){ var s=shown(p), sc=0; if(s.title.toLowerCase().indexOf(ql)>=0) sc+=10; if(s.body.toLowerCase().indexOf(ql)>=0) sc+=1;
    if(!sc&&s.tr){ if(p.title.toLowerCase().indexOf(ql)>=0) sc+=5; if(p.body.toLowerCase().indexOf(ql)>=0) sc+=1; }
    if(sc) hits.push({p:p,s:s,sc:sc}); });
  hits.sort(function(a,b){ return b.sc-a.sc||(a.p.sort-b.p.sort); });
  A.innerHTML=head(t('searchT'))+'<div class="hat">'+esc(t('res',q,hits.length))+'</div><div class="res">'+(hits.length?'':'<div class="e">'+esc(t('noRes'))+'</div>')+
    hits.slice(0,60).map(function(h){ return '<a class="g-'+h.p.game+'" href="#'+h.p.game+'/'+esc(h.p.slug)+'"><span class="rg">'+esc(gameName(h.p.game))+'</span><span class="rt">'+mark(esc(h.s.title),q)+'</span><span class="rs">'+snippet(h.s.body,q)+'</span></a>'; }).join('')+'</div>';
  putLang();
}

/* ---- 이벤트 ---- */
function clearQ(){ query=''; $('#q').value=''; }
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-v]'); if(b){ var v=b.getAttribute('data-v'), p=curPage(); if(!p) return;
    if(v==='del') return del(p,b); if(v==='edit'&&!me) return login(); view=v; paint(); window.scrollTo(0,0); return; }
  b=e.target.closest('[data-new]'); if(b){ clearQ(); if(!me) return login(); sp=null; game=b.getAttribute('data-new'); slug=null; setHash(); paintSide(); document.body.classList.remove('navOpen'); edit(null); window.scrollTo(0,0); return; }
  b=e.target.closest('[data-rand]'); if(b){ if(!all.length) return; var p=all[Math.floor(Math.random()*all.length)]; clearQ(); location.hash='#'+p.game+'/'+p.slug; return; }
  b=e.target.closest('[data-orig]'); if(b){ showOrig=b.getAttribute('data-orig')==='1'; paint(); return; }
  b=e.target.closest('.toc a[data-h]'); if(b){ e.preventDefault(); var h=document.getElementById(b.getAttribute('data-h')); if(h) h.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  b=e.target.closest('a[href^="#"]'); if(b&&b.getAttribute('href')===location.hash&&(query||view!=='read')){ e.preventDefault(); clearQ(); view='read'; paint(); }
});
$('#menuBtn').onclick=function(){ document.body.classList.toggle('navOpen'); };
var qt=null; $('#q').addEventListener('input',function(){ var v=this.value; clearTimeout(qt); qt=setTimeout(function(){ query=v.trim().length>=1?v:''; paint(); },200); });
window.addEventListener('hashchange',function(){ fromHash(); clearQ(); view='read'; showOrig=false; paint(); window.scrollTo(0,0); });

/* ---- 시작 ---- */
function statics(){
  document.documentElement.lang=lang;
  var els=document.querySelectorAll('[data-u]'); for(var i=0;i<els.length;i++) els[i].textContent=t(els[i].getAttribute('data-u'));
  var q=$('#q'); q.placeholder=t('search'); q.setAttribute('aria-label',t('search')); $('#menuBtn').setAttribute('aria-label',t('nav'));
  var sel=document.createElement('select'); sel.className='langSel'; sel.setAttribute('aria-label',t('lang'));
  LANGS.forEach(function(l){ var o=document.createElement('option'); o.value=l; o.textContent='🌐 '+NAMES[l]; if(l===lang) o.selected=true; sel.appendChild(o); });
  sel.onchange=function(){ try{ localStorage.setItem('arenaClashLang',this.value); }catch(e){} try{ if(window.FFLang) FFLang.set(this.value); }catch(e){} location.reload(); };
  langSel=sel;
}
async function load(){
  if(!sb){ $('#page').innerHTML='<div class="e">'+esc(t('err'))+'</div>'; return; }
  var r=await sb.from('ff_wiki').select('game,slug,title,sort,body,updated_by,updated_at').order('sort').limit(500);
  if(r.error){ $('#page').innerHTML='<div class="e">'+esc(errText(r.error))+'</div>'; return; }
  all=r.data||[]; await paint();
}
async function checkAdmin(){ admin=false; if(!sb||!me) return; try{ var a=await sb.rpc('ff_is_admin'); admin=!!(a&&a.data===true); }catch(e){} }
async function start(){
  statics(); fromHash();
  var trP=lang==='ko'?Promise.resolve():fetch('tr/'+lang+'.json',{cache:'no-cache'}).then(function(x){ return x.ok?x.json():{}; }).then(function(j){ TR=j||{}; }).catch(function(){});
  try{ sb=await FFAuth.ready; me=FFAuth.user(); }catch(e){}
  await Promise.all([trP, checkAdmin()]);
  await load();
  try{ FFAuth.onChange(async function(u){ me=u||null; await checkAdmin(); if(view!=='edit') paint(); }); }catch(e){}
}
start();
})();

/* 스플래시 문구: 허브 세 사이트(games, educations, tools)의 큰 제목 첫 줄 끝에 30도 기울어진 노란 문구를 한 줄 띄워요.
   들어올 때마다 무작위로 하나. 사이트 언어(FFLang)에 맞는 문구만 고르고, 한국어 전용 문구는 한국어일 때만 나와요.
   각 사이트가 <script src="https://frenchfries777mc.github.io/games/ff-splash.js" defer></script> 로 불러요. */
(function(){
var L=['ko','en','es','fr','de','ja','zh','pt','ru','tr','it','pl','ar','nw','gk'];
/* 번역기 한국어 (gk): the Korean lines in stiff machine-translation style */
var GK={"혼자 만듬!":"만든 독주!","한 인간과 한 AI가 만듬!":"만든 옆에 하나 인간 그리고 하나 AI!","안녕하세요!":"안녕!","숙제는 하셨나요?":"했다 당신 하다 당신의 숙제?","피아노를 던지면 어떻게 피아노?":"Threw 하나의 피아노? 저것 fell 아파트!","차이나에서 고백하면 차이나?":"차이나에서 고백하면 차이나?","그거 아세요? 저도 몰라요!":"했다 당신 알다? 나를 어느 쪽도!","와! 샌즈!":"와! 샌즈!","조선천지에 777% 일어날 일!":"조선천지에 777% 일어날 일!","옛날 옛적에, 호랑이가 클라우드에 자아를 백업하는 시절에...":"옛날 옛적에, 호랑이가 클라우드에 자아를 백업하는 시절에...","로딩중... 로딩중학교 1학년 6반 16번!":"적재중... 적재중학교 1학년 6반 16번!","애덤 스미siu의 보이지 않는 텍스트!":"애덤 스미siu의 보이지 않는 텍스트!","그대들은 총게임을 원하는가?":"이다 당신 준비된 위하여 그 궁극적인 사냥감?","당신은 이 문구를 보았습니다!":"당신 가지다 보인 이것 본문!","사과해요! 난 키위할테니...":"사과합니다! 난 키위할테니...","나쁜사람만 보이는 글씨!":"오직 나쁜 사람들 깡통 보다 이것 본문!"};
/* Newspeak (nw): only these lines from Orwell's 1984, nothing else */
var NW=['BIG BROTHER IS WATCHING YOU!','WAR IS PEACE','FREEDOM IS SLAVERY','IGNORANCE IS STRENGTH','2 + 2 = 5','You have been sent to Room 101.','This post never existed.','Vaporized!','Unperson!','Report to Thinkpol!','Ministry of Truth: Corrections','The telescreen is watching you.',
 'We have always been at war with Eurasia!',{t:'Down with Big Brother!',swap:'Thoughtcrime detected.'},'Down with Emmanuel Goldstein!'];
/* [ko, en, es, fr, de, ja, zh, pt, ru, tr, it, pl, ar] (missing languages show the English line) — 문자열 하나면 모든 언어에서 그대로, ko만 있으면 한국어 전용 */
var P=[
 ['혼자 만듬!','Made solo!','¡Hecho en solitario!','Fait en solo !','Allein gemacht!','ひとりで作った！','一个人做的！','Feito sozinho!','Сделано в одиночку!','Tek başıma yaptım!',"Fatto da solo!","Zrobione w pojedynkę!","صُنع بمفرده!"],
 {t:'A whole new world arabic version!',href:'https://www.youtube.com/watch?v=-bWqcKzbQBY'},
 ['한 인간과 한 AI가 만듬!','Made by one human and one AI!','¡Hecho por un humano y una IA!','Fait par un humain et une IA !','Von einem Menschen und einer KI gemacht!','人間ひとりとAIひとりで作った！','由一个人类和一个 AI 制作！','Feito por um humano e uma IA!','Сделано одним человеком и одним ИИ!','Bir insan ve bir yapay zekâ yaptı!',"Fatto da un umano e un'IA!","Zrobione przez jednego człowieka i jedną SI!","صنعه إنسان واحد وذكاء اصطناعي واحد!"],
 'Claude AI by Anthropic!',
 ['안녕하세요!','Hello!','¡Hola!','Bonjour !','Hallo!','こんにちは！','你好！','Olá!','Привет!','Merhaba!',"Ciao!","Cześć!","مرحبًا!"],
 'Reduce... Reuse...  ecyc e...',
 '67!',
 '169.9!',
 ['숙제는 하셨나요?','Did you do your homework?','¿Hiciste la tarea?','Tu as fait tes devoirs ?','Hast du deine Hausaufgaben gemacht?','宿題はやった？','作业写完了吗？','Fez a lição de casa?','Домашку сделал?','Ödevini yaptın mı?',"Hai fatto i compiti?","Odrobiłeś lekcje?","هل أنهيت واجبك؟"],
 ['피아노를 던지면 어떻게 피아노?','Threw a piano? That fell flat!','¿Un piano volando? ¡No tiene ni pies ni teclas!','Lancer un piano ? Faut avoir du doigté !','Ein Klavier werfen? Dafür braucht man Flügel!','ピアノを投げたら…おっと！音（おと）！','钢琴扔出去？那可真是“弹”出去了！','Jogou um piano? Que nota baixa!','Бросил рояль? Ну это уже не в ту тональность!','Piyano mu fırlattın? Notası düştü!',"Hai lanciato un pianoforte? Che nota stonata!","Rzuciłeś pianinem? Ale fałszywa nuta!","رميت بيانو؟ يا لها من نغمة نشاز!"],
 ['차이나에서 고백하면 차이나?','Confess your love in Chile? Expect a chilly answer!','¿Te declaras en Perú? Te dicen: ¡Pe-rú no!','Se déclarer au Népal ? « Népal possible ! »','Liebeserklärung in Norwegen? Antwort: Nein-wegen!','チャイナで告白したら、ふられちゃいな？','在冰岛表白？等来的回答冷冰冰！','Declarar amor no Peru? Vai ouvir: Peru, não!','Признался в любви в Чили? Ответ будет прохладным — чилл!','Mısır’da aşkını mı ilan ettin? Cevap: Patlamış mısır!',"Dichiarazione d'amore in Cile? Risposta glaciale!","Wyznanie miłości w Chile? Chłodna odpowiedź!","اعترفت بحبك في تشيلي؟ توقّع ردًا باردًا!"],
 ['그거 아세요? 저도 몰라요!','Did you know? Me neither!','¿Sabías qué? ¡Yo tampoco!','Tu savais ? Moi non plus !','Wusstest du schon? Ich auch nicht!','知ってました？私も知りません！','你知道吗？我也不知道！','Sabia? Eu também não!','А вы знали? Я тоже нет!','Biliyor muydun? Ben de bilmiyordum!',"Lo sapevi? Neanch'io!","Wiedziałeś? Ja też nie!","هل كنت تعلم؟ ولا أنا!"],
 ['와! 샌즈!'],
 ['조선천지에 777% 일어날 일!'],
 ['옛날 옛적에, 호랑이가 클라우드에 자아를 백업하는 시절에...'],
 ['로딩중... 로딩중학교 1학년 6반 16번!'],
 ['애덤 스미siu의 보이지 않는 텍스트!'],
 ['그대들은 총게임을 원하는가?','Are you ready for the ultimate game?','¿Estáis listos para el juego definitivo?','Êtes-vous prêts pour le jeu ultime ?','Seid ihr bereit für das ultimative Spiel?','究極のゲームを望むか？','你们渴望终极游戏吗？','Vocês estão prontos para o jogo definitivo?','Готовы ли вы к главной игре?','Nihai oyuna hazır mısınız?',"Siete pronti per il gioco definitivo?","Czy jesteście gotowi na grę ostateczną?","هل أنتم مستعدون للعبة المطلقة؟"],
 ['당신은 이 문구를 보았습니다!','You have seen this text!','¡Has visto este texto!','Vous avez vu ce texte !','Du hast diesen Text gesehen!','あなたはこの文を見ました！','你看到了这句话！','Você viu este texto!','Вы увидели эту надпись!','Bu yazıyı gördün!',"Hai visto questo testo!","Widziałeś ten tekst!","لقد رأيت هذا النص!"],
 ['사과해요! 난 키위할테니...'],
 ['나쁜사람만 보이는 글씨!','Only bad people can see this text!','¡Solo la gente mala puede ver este texto!','Seules les mauvaises personnes voient ce texte !','Nur böse Menschen können diesen Text sehen!','悪い人にしか見えない文字！','只有坏人才能看到的文字！','Só gente má consegue ver este texto!','Этот текст видят только плохие люди!','Bu yazıyı sadece kötü insanlar görebilir!',"Solo le persone cattive possono vedere questo testo!","Tylko źli ludzie widzą ten tekst!","لا يرى هذا النص إلا الأشرار!"]
];
function lang(){ var l='ko'; try{ l=(window.FFLang&&FFLang.get())||document.documentElement.lang||'ko'; }catch(e){} l=String(l).slice(0,2); return L.indexOf(l)<0?'en':l; }
function pick(l){
  if(l==='nw'){ var w=NW[Math.floor(Math.random()*NW.length)]; return typeof w==='string'?{t:w}:w; }
  var i=L.indexOf(l), out=[];
  P.forEach(function(p){
    if(typeof p==='string') out.push({t:p});
    else if(p.t) out.push(p);
    else if(l==='gk') out.push({t:GK[p[0]]||p[0]});
    else if(p.length===1){ if(l==='ko') out.push({t:p[0]}); }
    else out.push({t:p[i]||p[1]});
  });
  return out[Math.floor(Math.random()*out.length)];
}
function css(){
  var st=document.createElement('style');
  st.textContent='.ffs{position:absolute; z-index:5; left:0; top:0; color:#ffe14d; font-family:"Noto Sans KR",sans-serif; font-weight:900; line-height:1.15; text-align:center; white-space:normal; word-break:keep-all; width:max-content; max-width:210px; text-shadow:2px 2px 0 #3d2e00; text-decoration:none; pointer-events:none; transform-origin:50% 50%;}'+
   '.ffs i{display:block; font-style:normal; animation:ffsP .5s ease-in-out infinite alternate;}'+
   'a.ffs{pointer-events:auto; cursor:pointer;} a.ffs:hover i{color:#fff2a0;}'+
   '@keyframes ffsP{from{transform:scale(1)}to{transform:scale(1.08)}}'+
   '@media (prefers-reduced-motion:reduce){.ffs i{animation:none}}'+
   'html[data-ff-theme=light] .ffs{color:#e6a400; text-shadow:2px 2px 0 rgba(90,60,0,.35);}';
  document.head.appendChild(st);
}
function run(){
  var h=document.querySelector('.hero h1'); if(!h) return;
  var tn=null; for(var k=0;k<h.childNodes.length;k++){ if(h.childNodes[k].nodeType===3&&h.childNodes[k].textContent.trim()){ tn=h.childNodes[k]; break; } }
  var p=pick(lang()); if(!p) return; css();
  var el=document.createElement(p.href?'a':'span'); el.className='ffs'; el.setAttribute('data-notr',''); el.setAttribute('aria-hidden','true');
  if(p.href){ el.href=p.href; el.target='_blank'; el.rel='noopener'; el.removeAttribute('aria-hidden'); }
  if(p.swap){ el.style.pointerEvents='auto'; el.style.cursor='pointer'; el.onclick=function(){ var x=el.querySelector('i'); if(x) x.textContent=p.swap; el.style.color='#ff5a4e'; el.onclick=null; }; }
  var i=document.createElement('i'); i.textContent=p.t; el.appendChild(i);
  var n=p.t.length; el.style.fontSize=Math.max(14,Math.min(22,25-n*0.3))+'px';
  var box=h.parentNode; if(getComputedStyle(box).position==='static') box.style.position='relative';
  box.appendChild(el);
  function place(){
    var b=box.getBoundingClientRect(), r;
    if(tn){ var rg=document.createRange(); rg.selectNodeContents(tn); r=rg.getBoundingClientRect(); } else r=h.getBoundingClientRect();
    var w=el.offsetWidth, hh=el.offsetHeight, hw=(w*0.866+hh*0.5)/2;
    var cx=r.right-b.left+8, cy=r.bottom-b.top-r.height*0.12;
    var maxX=document.documentElement.clientWidth-b.left-hw-6; if(cx>maxX) cx=maxX;
    var x=cx-w/2, y=cy-hh/2;
    el.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px) rotate(-30deg)';
  }
  place(); addEventListener('resize',place);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(place);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

/* Profile borders (테두리): bought in each game, worn on the profile card and the account chip.
   Owned/equipped rows live in ff_user_borders / ff_border_equipped (supabase-profile-borders-2026-11-03.sql).
   A game grants a border after its shop sale:  FFBorders.grant(sb, 'st_pistol', 'stickseum')  */
(function(){
var G={stickseum:'Stickseum',crownenvoy:'Crown Envoy',beaconfall:'Beaconfall',isleport:'Isleport',tumblecrown:'Tumble Crown',vowkeep:'Vowkeep',dummyparty:'Dummy Party'};
var RAW=[
["st_pistol", "stickseum", "제임스", "Pistol", "#ffd23f", "#b8860b"],
["st_rifle", "stickseum", "군인", "Rifle", "#6fbf5a", "#2e6b2a"],
["st_smg", "stickseum", "특수요원", "SMG", "#35e0ff", "#1b6fa8"],
["st_magiccard", "stickseum", "마술사", "Magic Card", "#d46bff", "#6a1fa8"],
["st_shuriken", "stickseum", "닌자", "Shuriken", "#b8c4d6", "#566074"],
["st_bat", "stickseum", "종업원", "Bat", "#c98a4b", "#6b4220"],
["st_dagger", "stickseum", "암살자", "Assassin", "#7a7fa8", "#2c2f55"],
["st_dracula", "stickseum", "드라큘라", "Dracula", "#c0143c", "#3a0a1a"],
["st_gambler", "stickseum", "도박사", "Gambler", "#ff4d6d", "#ffd23f"],
["st_wizard", "stickseum", "마법사", "Wizard", "#7b6bff", "#2b1d8a"],
["st_sword", "stickseum", "기사", "Swordsman", "#e8eef7", "#7a8aa3"],
["st_horemheb", "stickseum", "호렘헵", "Horemheb", "#ffc43d", "#1e7fa3"],
["st_lightsaber", "stickseum", "자다이", "Lightsaber", "#4dd2ff", "#ff4d4d"],
["st_bazooka", "stickseum", "중화기병", "Bazooka", "#ff8a2b", "#7a3a10"],
["st_bow", "stickseum", "궁수", "Archer", "#8bd45a", "#4a7a2a"],
["st_boomerang", "stickseum", "사냥꾼", "Boomerang", "#ffb347", "#e0662b"],
["st_shotgun", "stickseum", "보안관", "Shotgun", "#ff6a3d", "#8a2a10"],
["st_gloves", "stickseum", "복서", "Gloves", "#ff5f5f", "#a01c1c"],
["st_grenade", "stickseum", "폭발광", "Grenade", "#7aa84a", "#2f4a1a"],
["st_flamethrower", "stickseum", "학살자", "Flamethrower", "#ff6a1f", "#ffd23f"],
["st_portalgun", "stickseum", "차원여행자", "Portal Gun", "#4da6ff", "#ff9a2b"],
["st_pirate", "stickseum", "해적", "Pirate", "#e0b050", "#3a2a14"],
["st_samurai", "stickseum", "사무라이", "Samurai", "#e8e8f0", "#c0143c"],
["st_vacuum", "stickseum", "청소부", "Vacuum", "#9fb5c9", "#4a6075"],
["st_kurus", "stickseum", "쿠루스", "Kurus", "#ffe27a", "#c07a10"],
["bf_stone", "beaconfall", "돌", "Stone", "#aab0b8", "#5a6068"],
["bf_copper", "beaconfall", "구리", "Copper", "#e08a4b", "#7a3a18"],
["bf_iron", "beaconfall", "철", "Iron", "#d8dee9", "#6a7585"],
["bf_gold", "beaconfall", "금", "Gold", "#ffd23f", "#a8741a"],
["bf_coal", "beaconfall", "석탄", "Coal", "#4a4f58", "#14161a"],
["bf_crystal", "beaconfall", "수정", "Crystal", "#8fe7ff", "#6a4bff"],
["bf_obsidian", "beaconfall", "흑요석", "Obsidian", "#7a4bd1", "#14091f"],
["ip_wheat", "isleport", "밀", "Wheat", "#f2d06b", "#a8801f"],
["ip_rice", "isleport", "쌀", "Rice", "#f4f0dc", "#a8a27a"],
["ip_tea", "isleport", "차", "Tea", "#7fc96b", "#2f6b2a"],
["ip_corn", "isleport", "옥수수", "Corn", "#ffd84a", "#8fbf3a"],
["ip_carrot", "isleport", "당근", "Carrot", "#ff8a2b", "#4a9a3a"],
["ip_potato", "isleport", "감자", "Potato", "#c9a15b", "#6b4a20"],
["ip_tomato", "isleport", "토마토", "Tomato", "#ff4d3d", "#3a8a2a"],
["ip_pumpkin", "isleport", "호박", "Pumpkin", "#ff9a2b", "#7a4a10"],
["ip_cabbage", "isleport", "양배추", "Cabbage", "#a8e08a", "#4a8a3a"],
["ip_onion", "isleport", "양파", "Onion", "#e0b0d0", "#8a4a7a"],
["ip_grape", "isleport", "포도", "Grape", "#9b5bd1", "#3a1a6a"],
["ip_pepper", "isleport", "고추", "Pepper", "#e0322b", "#7a1010"],
["ip_cotton", "isleport", "목화", "Cotton", "#f4f7fb", "#a8b4c4"],
["ip_sugar", "isleport", "사탕수수", "Sugarcane", "#b8e07a", "#5a8a2a"],
["ip_coffee", "isleport", "커피", "Coffee", "#8a5a3a", "#2a160a"],
["ip_cacao", "isleport", "카카오", "Cacao", "#6b3a1f", "#2a1208"],
["ip_apple", "isleport", "사과", "Apple", "#ff5f5f", "#4a8a2a"],
["ip_berry", "isleport", "딸기", "Strawberry", "#ff4d7d", "#4a9a3a"],
["ip_melon", "isleport", "수박", "Melon", "#5fcf6f", "#e0324d"],
["ip_flax", "isleport", "아마", "Flax", "#8fb8ff", "#4a6aa8"],
["ip_lavender", "isleport", "라벤더", "Lavender", "#b48cff", "#5a3aa8"],
["ip_sunflower", "isleport", "해바라기", "Sunflower", "#ffd23f", "#6b4a10"],
["tc_archer", "tumblecrown", "궁수", "Archer", "#8bd45a", "#3a6a1f"],
["tc_assassin", "tumblecrown", "암살자", "Assassin", "#7a7fa8", "#2c2f55"],
["tc_bard", "tumblecrown", "음유시인", "Bard", "#ff9ad1", "#8a2a6a"],
["tc_bomber", "tumblecrown", "폭탄병", "Bomber", "#ff8a2b", "#5a2a10"],
["tc_crossbow", "tumblecrown", "석궁병", "Crossbow", "#c9a15b", "#5a3a18"],
["tc_knight", "tumblecrown", "기사", "Knight", "#e8eef7", "#5a6a8a"],
["tc_mamluk", "tumblecrown", "맘루크", "Mamluk", "#ffc43d", "#1e5fa3"],
["tc_necro", "tumblecrown", "강령술사", "Necromancer", "#6bff9a", "#1a3a2a"],
["tc_priest", "tumblecrown", "사제", "Priest", "#fff1a8", "#c0a030"],
["tc_spearman", "tumblecrown", "창병", "Spearman", "#9fc0e0", "#3a5a7a"],
["tc_streltsy", "tumblecrown", "스트렐치", "Streltsy", "#e0322b", "#3a1010"],
["tc_telaris", "tumblecrown", "텔라리스", "Telaris", "#4dd2ff", "#1a3a8a"],
["tc_viking", "tumblecrown", "바이킹", "Viking", "#d8a050", "#4a6a8a"],
["tc_warden", "tumblecrown", "수호자", "Warden", "#6fd0c0", "#1a4a40"],
["tc_witch", "tumblecrown", "마녀", "Witch", "#c06bff", "#3a1a5a"],
["ce_bronze", "crownenvoy", "청동 왕관", "Bronze Crown", "#cd7f32", "#6b3a10"],
["ce_silver", "crownenvoy", "은 왕관", "Silver Crown", "#e0e6ef", "#7a8599"],
["ce_gold", "crownenvoy", "금 왕관", "Gold Crown", "#ffd23f", "#a8741a"],
["ce_ruby", "crownenvoy", "루비 왕관", "Ruby Crown", "#ff4d6d", "#7a1030"],
["ce_emerald", "crownenvoy", "에메랄드 왕관", "Emerald Crown", "#3ee08f", "#0f5a35"],
["ce_royal", "crownenvoy", "왕의 왕관", "Royal Crown", "#7b6bff", "#ffd23f"],
["vk_keep", "vowkeep", "맹세의 성", "Vow Keep", "#c9d6ff", "#3a4a8a"],
["dp_party", "dummyparty", "파티", "Party", "rainbow", "rainbow"],
["st_kan", "stickseum", "칸", "Kan", "#3ee08f", "#c0143c"],
["st_pizarro", "stickseum", "피사로", "Pizarro", "#b8c4d6", "#7a4a20"],
["st_puppeteer", "stickseum", "인형술사", "Puppeteer", "#ff9ad1", "#7b6bff"],
["st_cleon", "stickseum", "크레온 1세", "Emperor", "#ffd23f", "#7a1030"],
["st_pel", "stickseum", "드론 조종사", "Pilot", "#4dd2ff", "#1a3a6a"],
["st_tionis", "stickseum", "연극배우", "Actor", "#e8d8ff", "#6a3aa8"],
];
var LIST=RAW.map(function(r){ return {id:r[0],game:r[1],ko:r[2],en:r[3],a:r[4],b:r[5]}; }), BY={};
LIST.forEach(function(b){ BY[b.id]=b; });
function get(id){ return BY[id]||null; }
function name(id,lang){ var b=BY[id]; return b?(lang==='ko'?b.ko:b.en):''; }
function crown(b){ return b.game==='crownenvoy'; }
function css(id){          /* for an HTML avatar: border + glow */
  var b=BY[id]; if(!b) return '';
  if(b.a==='rainbow') return 'border:3px solid #ff5f5f;box-shadow:0 0 0 2px #ffd23f,0 0 0 4px #35e0ff,0 0 12px #b46bff99';
  return 'border:3px solid '+b.a+';box-shadow:0 0 0 2px '+b.b+',0 0 12px '+b.a+'99';
}
var RB=['#ff5f5f','#ffd23f','#3ee08f','#35e0ff','#b46bff'];
var FAM={st_pistol:'bullet',st_rifle:'bullet',st_smg:'bullet',st_shotgun:'bullet',st_streltsy:'bullet',st_magiccard:'star',st_wizard:'star',st_shuriken:'blade',st_dagger:'blade',st_samurai:'blade',st_sword:'blade',st_lightsaber:'blade',st_bat:'rivet',st_gloves:'rivet',st_pirate:'rivet',st_dracula:'bat',st_gambler:'card',st_horemheb:'ankh',st_bazooka:'burst',st_grenade:'burst',st_bow:'arrow',st_boomerang:'arrow',st_flamethrower:'flame',st_kurus:'flame',st_portalgun:'ring',st_vacuum:'ring',
 tc_archer:'arrow',tc_assassin:'blade',tc_bard:'star',tc_bomber:'burst',tc_crossbow:'arrow',tc_knight:'shield',tc_mamluk:'blade',tc_necro:'flame',tc_priest:'cross',tc_spearman:'blade',tc_streltsy:'bullet',tc_telaris:'shield',tc_viking:'rivet',tc_warden:'shield',tc_witch:'star'};
var FRUIT={tomato:'round',apple:'round',berry:'round',onion:'round',grape:'round',pumpkin:'round',melon:'round',cabbage:'round',cacao:'round',potato:'round',carrot:'long',corn:'long',pepper:'long',sugar:'long',flax:'long',wheat:'grain',rice:'grain',tea:'grain',coffee:'grain',cotton:'grain',lavender:'grain',sunflower:'flower'};
var CROWN={bronze:3,silver:3,gold:5,ruby:5,emerald:5,royal:7};
function P(c,pts,fill,stroke){ c.beginPath(); pts.forEach(function(p,i){ i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]); }); c.closePath(); if(fill){ c.fillStyle=fill; c.fill(); } if(stroke){ c.strokeStyle=stroke; c.lineWidth=1.5; c.stroke(); } }
function star(c,x,y,r,n,fill){ var p=[]; for(var i=0;i<n*2;i++){ var a=-Math.PI/2+i*Math.PI/n, q=i%2?r*.42:r; p.push([x+Math.cos(a)*q,y+Math.sin(a)*q]); } P(c,p,fill,'rgba(0,0,0,.45)'); }
function rot(c,x,y,a,fn){ c.save(); c.translate(x,y); c.rotate(a); fn(); c.restore(); }
function motif(c,fam,x,y,s,a1,a2,ang){      /* one ornament centred on x,y, size s, turned by ang */
  rot(c,x,y,ang||0,function(){
    var g=c.createLinearGradient(-s,-s,s,s); g.addColorStop(0,a1); g.addColorStop(1,a2);
    if(fam==='bullet'){ c.fillStyle=g; c.beginPath(); c.moveTo(-s*.4,s); c.lineTo(-s*.4,-s*.2); c.quadraticCurveTo(0,-s*1.25,s*.4,-s*.2); c.lineTo(s*.4,s); c.closePath(); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(-s*.25,-s*.1,s*.12,s*.9); c.fillStyle=a2; c.fillRect(-s*.4,s*.55,s*.8,s*.18); }
    else if(fam==='blade'){ P(c,[[0,-s*1.2],[s*.34,s*.2],[0,s*.05],[-s*.34,s*.2]],g,'rgba(0,0,0,.5)'); c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(-1,-s*.9,2,s*.9); c.fillStyle=a2; c.fillRect(-s*.6,s*.2,s*1.2,s*.2); c.fillRect(-s*.12,s*.4,s*.24,s*.6); }
    else if(fam==='star'){ star(c,0,0,s*1.05,5,g); star(c,0,0,s*.45,4,'rgba(255,255,255,.7)'); }
    else if(fam==='rivet'){ c.fillStyle=g; c.beginPath(); c.arc(0,0,s*.8,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=2; c.stroke(); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.arc(-s*.25,-s*.25,s*.25,0,7); c.fill(); c.strokeStyle=a2; c.lineWidth=2; c.beginPath(); c.moveTo(-s*.4,s*.1); c.lineTo(s*.4,s*.1); c.stroke(); }
    else if(fam==='bat'){ c.fillStyle=g; c.beginPath(); c.moveTo(0,-s*.4); c.quadraticCurveTo(s*.7,-s*1.1,s*1.3,-s*.2); c.quadraticCurveTo(s*.9,0,s*.8,s*.35); c.quadraticCurveTo(s*.45,s*.1,s*.25,s*.45); c.lineTo(0,s*.2); c.lineTo(-s*.25,s*.45); c.quadraticCurveTo(-s*.45,s*.1,-s*.8,s*.35); c.quadraticCurveTo(-s*.9,0,-s*1.3,-s*.2); c.quadraticCurveTo(-s*.7,-s*1.1,0,-s*.4); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.5; c.stroke(); }
    else if(fam==='card'){ c.fillStyle='#fff'; c.fillRect(-s*.62,-s*.9,s*1.24,s*1.8); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.5; c.strokeRect(-s*.62,-s*.9,s*1.24,s*1.8); c.fillStyle=a1; c.beginPath(); c.moveTo(0,-s*.5); c.lineTo(s*.4,0); c.lineTo(0,s*.5); c.lineTo(-s*.4,0); c.closePath(); c.fill(); }
    else if(fam==='ankh'){ c.strokeStyle=a1; c.lineWidth=s*.34; c.lineCap='round'; c.beginPath(); c.ellipse(0,-s*.55,s*.4,s*.5,0,0,7); c.moveTo(0,-s*.05); c.lineTo(0,s*1.0); c.moveTo(-s*.6,s*.25); c.lineTo(s*.6,s*.25); c.stroke(); }
    else if(fam==='burst'){ var p=[]; for(var i=0;i<16;i++){ var a=i*Math.PI/8, q=i%2?s*.5:s*1.15; p.push([Math.cos(a)*q,Math.sin(a)*q]); } P(c,p,g,'rgba(0,0,0,.45)'); c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.arc(0,0,s*.3,0,7); c.fill(); }
    else if(fam==='arrow'){ c.strokeStyle=a2; c.lineWidth=s*.16; c.beginPath(); c.moveTo(0,s*1.1); c.lineTo(0,-s*.7); c.stroke(); P(c,[[0,-s*1.25],[s*.4,-s*.55],[-s*.4,-s*.55]],g,'rgba(0,0,0,.5)'); P(c,[[0,s*1.1],[s*.4,s*.5],[0,s*.65],[-s*.4,s*.5]],a1,null); }
    else if(fam==='flame'){ c.fillStyle=g; c.beginPath(); c.moveTo(0,-s*1.3); c.bezierCurveTo(s*.4,-s*.6,s*.95,-s*.2,s*.7,s*.5); c.bezierCurveTo(s*.55,s*1.0,-s*.55,s*1.0,-s*.7,s*.5); c.bezierCurveTo(-s*.95,-s*.2,-s*.2,-s*.6,0,-s*1.3); c.fill(); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='rgba(255,255,255,.65)'; c.beginPath(); c.ellipse(0,s*.4,s*.28,s*.45,0,0,7); c.fill(); }
    else if(fam==='ring'){ c.strokeStyle=g; c.lineWidth=s*.4; c.beginPath(); c.ellipse(0,0,s*.8,s*1.05,0,0,7); c.stroke(); c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=2; c.beginPath(); c.ellipse(0,0,s*.55,s*.8,0,0,7); c.stroke(); }
    else if(fam==='shield'){ c.fillStyle=g; c.beginPath(); c.moveTo(-s*.85,-s*.9); c.lineTo(s*.85,-s*.9); c.lineTo(s*.85,0); c.quadraticCurveTo(s*.85,s*.8,0,s*1.25); c.quadraticCurveTo(-s*.85,s*.8,-s*.85,0); c.closePath(); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(-s*.1,-s*.7,s*.2,s*1.4); c.fillRect(-s*.5,-s*.25,s,s*.2); }
    else if(fam==='cross'){ c.fillStyle=g; c.fillRect(-s*.3,-s*1.05,s*.6,s*2.1); c.fillRect(-s*.95,-s*.35,s*1.9,s*.6); c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.5; c.strokeRect(-s*.3,-s*1.05,s*.6,s*2.1); c.fillStyle='rgba(255,255,255,.6)'; c.fillRect(-s*.12,-s*.8,s*.24,s*.35); }
    else if(fam==='gem'){ P(c,[[0,-s*1.05],[s*.85,-s*.2],[s*.5,s*.95],[-s*.5,s*.95],[-s*.85,-s*.2]],g,'rgba(0,0,0,.55)'); P(c,[[0,-s*1.05],[s*.85,-s*.2],[0,-s*.05]],'rgba(255,255,255,.4)',null); P(c,[[0,-s*.05],[s*.5,s*.95],[-s*.5,s*.95]],'rgba(0,0,0,.22)',null); }
    else if(fam==='rock'){ P(c,[[-s*.9,s*.2],[-s*.55,-s*.7],[s*.2,-s*.95],[s*.9,-s*.3],[s*.75,s*.7],[-s*.3,s*.9]],g,'rgba(0,0,0,.55)'); P(c,[[-s*.55,-s*.7],[s*.2,-s*.95],[s*.1,-s*.2]],'rgba(255,255,255,.28)',null); c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.arc(s*.3,s*.35,s*.18,0,7); c.fill(); }
    else if(fam==='leaf'){ c.fillStyle=g; c.beginPath(); c.moveTo(0,s*1.0); c.bezierCurveTo(-s*1.0,s*.1,-s*.5,-s*1.0,0,-s*1.1); c.bezierCurveTo(s*.5,-s*1.0,s*1.0,s*.1,0,s*1.0); c.fill(); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.5; c.stroke(); c.strokeStyle='rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(0,s*.9); c.lineTo(0,-s*.8); c.stroke(); }
    else if(fam==='confetti'){ c.fillStyle=a1; c.fillRect(-s*.5,-s*.18,s,s*.36); c.fillStyle=a2; c.beginPath(); c.arc(s*.5,s*.5,s*.22,0,7); c.fill(); }
  });
}
function fruit(c,kind,x,y,s,col,col2){      /* a crop in its own colour, for the Isleport borders */
  if(kind==='round'){ c.fillStyle=col; c.beginPath(); c.arc(x,y,s*.8,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x-s*.28,y-s*.28,s*.18,s*.1,-.6,0,7); c.fill(); c.fillStyle=col2; c.fillRect(x-1.5,y-s*1.05,3,s*.3); }
  else if(kind==='long'){ rot(c,x,y,.5,function(){ P(c,[[0,s*1.2],[s*.5,-s*.5],[0,-s*.95],[-s*.5,-s*.5]],col,'rgba(0,0,0,.45)'); c.fillStyle=col2; c.fillRect(-s*.35,-s*1.15,s*.7,s*.3); c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(-s*.18,-s*.3,s*.1,s*.8); }); }
  else if(kind==='flower'){ for(var i=0;i<10;i++){ var a=i*Math.PI/5; rot(c,x+Math.cos(a)*s*.75,y+Math.sin(a)*s*.75,a+Math.PI/2,function(){ c.fillStyle=col; c.beginPath(); c.ellipse(0,0,s*.22,s*.42,0,0,7); c.fill(); }); } c.fillStyle=col2; c.beginPath(); c.arc(x,y,s*.5,0,7); c.fill(); }
  else { for(var k=-1;k<=1;k++){ rot(c,x+k*s*.55,y+Math.abs(k)*s*.15,k*.4,function(){ c.fillStyle=col; c.beginPath(); c.ellipse(0,0,s*.22,s*.62,0,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.2; c.stroke(); }); } c.strokeStyle=col2; c.lineWidth=2; c.beginPath(); c.moveTo(x,y+s*1.1); c.lineTo(x,y); c.stroke(); }
}
function crownShape(c,x,y,s,n,a,b,gem){
  var g=c.createLinearGradient(x,y-s,x,y+s*.6); g.addColorStop(0,a); g.addColorStop(1,b); var w=s*1.5, pts=[[x-w,y+s*.5]], i;
  for(i=0;i<n;i++){ var px=x-w+(2*w)*(i/(n-1)); pts.push([px-(i? w/(n-1)*.5:0),y-s*.15]); pts.push([px,y-s*(i%2?.75:1.05)]); }
  pts.push([x+w,y-s*.15]); pts.push([x+w,y+s*.5]); P(c,pts,g,'rgba(0,0,0,.6)');
  c.fillStyle=b; c.fillRect(x-w,y+s*.28,w*2,s*.28); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.2; c.strokeRect(x-w,y+s*.28,w*2,s*.28);
  for(i=0;i<n;i++){ var px2=x-w+(2*w)*(i/(n-1)); c.fillStyle=gem; c.beginPath(); c.arc(px2,y-s*(i%2?.75:1.05)-s*.08,s*.13,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.stroke(); }
  c.fillStyle=gem; c.beginPath(); c.arc(x,y+s*.42,s*.14,0,7); c.fill(); c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(x-w+s*.1,y+s*.3,w*2-s*.2,s*.05);
}
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function base(c,b,x,y,w,h,r,lw){
  var g; if(b.a==='rainbow'){ g=c.createLinearGradient(x,y,x+w,y+h); RB.forEach(function(col,i){ g.addColorStop(i/4,col); }); } else { g=c.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,b.a); g.addColorStop(.5,b.b); g.addColorStop(1,b.a); }
  var o=lw/2+1; c.lineJoin='round';
  c.lineWidth=lw+4; c.strokeStyle='rgba(0,0,0,.6)'; rr(c,x-o,y-o,w+o*2,h+o*2,r+o); c.stroke();
  c.lineWidth=lw; c.strokeStyle=g; rr(c,x-o,y-o,w+o*2,h+o*2,r+o); c.stroke();
  c.lineWidth=1.6; c.strokeStyle='rgba(255,255,255,.55)'; rr(c,x-o-lw/2+1.5,y-o-lw/2+1.5,w+o*2+lw-3,h+o*2+lw-3,r+o+lw/2-1.5); c.stroke();
}
/* ---- Stickseum: the character's weapon (top right corner) and what they wear (bottom left corner) ---- */
function gun(c,s,len,th,col,ex){ c.fillStyle=col; c.fillRect(-s*len,-s*th/2,s*len*2,s*th); c.fillRect(-s*len*.7,0,s*.42,s*.95); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-s*len,-s*th/2,s*len*2,s*th*.3); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.3; c.strokeRect(-s*len,-s*th/2,s*len*2,s*th); if(ex==='mag'){ c.fillStyle=col; c.fillRect(-s*.1,s*th/2,s*.4,s*.8); } if(ex==='tube'){ c.fillStyle='#3a3f4a'; c.fillRect(-s*len*1.15,-s*th*.8,s*len*2.3,s*th*.55); } if(ex==='tank'){ c.fillStyle='#ff6a1f'; c.beginPath(); c.arc(-s*len*.55,s*.55,s*.55,0,7); c.fill(); c.fillStyle='#ffd23f'; c.beginPath(); c.arc(s*len+s*.15,0,s*.28,0,7); c.fill(); } if(ex==='portal'){ c.fillStyle='#4da6ff'; c.beginPath(); c.arc(s*len,0,s*.42,0,7); c.fill(); c.fillStyle='#ff9a2b'; c.beginPath(); c.arc(s*len,0,s*.22,0,7); c.fill(); } }
var WP={
 pistol:function(c,s){ gun(c,s,.8,.55,'#9aa3b2'); }, smg:function(c,s){ gun(c,s,.95,.55,'#7c8596','mag'); }, rifle:function(c,s){ gun(c,s,1.25,.45,'#6a7a4a','mag'); }, shotgun:function(c,s){ gun(c,s,1.3,.5,'#8a5a30'); c.fillStyle='#444'; c.fillRect(-s*1.3,-s*.12,s*1.5,s*.14); },
 bazooka:function(c,s){ gun(c,s,1.3,.6,'#5a6a4a','tube'); }, flamethrower:function(c,s){ gun(c,s,1.0,.4,'#9a9a9a','tank'); }, portalgun:function(c,s){ gun(c,s,.8,.6,'#e8eef7','portal'); },
 sword:function(c,s){ P(c,[[0,-s*1.35],[s*.28,s*.3],[-s*.28,s*.3]],'#e8eef7','rgba(0,0,0,.55)'); c.fillStyle='#c9a15b'; c.fillRect(-s*.6,s*.3,s*1.2,s*.22); c.fillRect(-s*.12,s*.5,s*.24,s*.7); },
 dagger:function(c,s){ P(c,[[0,-s*1.1],[s*.2,s*.2],[-s*.2,s*.2]],'#c8d0e0','rgba(0,0,0,.55)'); c.fillStyle='#4a2a6a'; c.fillRect(-s*.4,s*.2,s*.8,s*.18); c.fillRect(-s*.1,s*.38,s*.2,s*.7); },
 samurai:function(c,s){ c.strokeStyle='#e8eef7'; c.lineWidth=s*.22; c.beginPath(); c.moveTo(-s*.2,s*.8); c.quadraticCurveTo(s*.1,-s*.2,s*.5,-s*1.3); c.stroke(); c.fillStyle='#c0143c'; c.fillRect(-s*.45,s*.55,s*.5,s*.2); c.fillStyle='#222'; c.fillRect(-s*.35,s*.7,s*.3,s*.55); },
 lightsaber:function(c,s){ c.shadowColor='#4dd2ff'; c.shadowBlur=10; c.fillStyle='#bff0ff'; c.fillRect(-s*.14,-s*1.4,s*.28,s*1.8); c.shadowBlur=0; c.fillStyle='#8a93a6'; c.fillRect(-s*.2,s*.4,s*.4,s*.8); },
 shuriken:function(c,s){ var p=[]; for(var i=0;i<8;i++){ var an=i*Math.PI/4-Math.PI/2, q=i%2?s*.3:s*1.1; p.push([Math.cos(an)*q,Math.sin(an)*q]); } P(c,p,'#b8c4d6','rgba(0,0,0,.55)'); c.fillStyle='#2a2f3a'; c.beginPath(); c.arc(0,0,s*.18,0,7); c.fill(); },
 boomerang:function(c,s){ c.strokeStyle='#e0a050'; c.lineWidth=s*.4; c.lineCap='round'; c.beginPath(); c.moveTo(-s*.9,-s*.7); c.quadraticCurveTo(s*.8,-s*.4,s*.8,s*.9); c.stroke(); c.strokeStyle='#b0702a'; c.lineWidth=s*.12; c.stroke(); },
 pizarro:function(c,s){ c.fillStyle='#8a5a30'; c.fillRect(-s*.07,-s*.6,s*.14,s*1.9); P(c,[[0,-s*1.45],[s*.28,-s*.55],[-s*.28,-s*.55]],'#c8d0e0','rgba(0,0,0,.55)'); },
 guard:function(c,s){ c.fillStyle='#6fa8ff'; c.fillRect(-s*.09,-s*.6,s*.18,s*1.9); c.shadowColor='#6fa8ff'; c.shadowBlur=8; P(c,[[0,-s*1.45],[s*.3,-s*.55],[-s*.3,-s*.55]],'#cfe3ff',null); c.shadowBlur=0; },
 horemheb:function(c,s){ c.fillStyle='#8a5a30'; c.fillRect(-s*.07,-s*.3,s*.14,s*1.6); c.strokeStyle='#ffc43d'; c.lineWidth=s*.16; c.beginPath(); c.moveTo(-s*.5,-s*1.2); c.lineTo(-s*.5,-s*.3); c.lineTo(s*.5,-s*.3); c.lineTo(s*.5,-s*1.2); c.moveTo(0,-s*1.35); c.lineTo(0,-s*.3); c.stroke(); },
 bow:function(c,s){ c.strokeStyle='#8a5a30'; c.lineWidth=s*.22; c.beginPath(); c.arc(-s*.5,0,s*1.15,-1.1,1.1); c.stroke(); c.strokeStyle='#eee'; c.lineWidth=1.3; c.beginPath(); c.moveTo(s*.1,-s*1.0); c.lineTo(s*.1,s*1.0); c.stroke(); },
 bat:function(c,s){ c.fillStyle='#c98a4b'; c.beginPath(); c.moveTo(-s*.12,s*1.3); c.lineTo(s*.12,s*1.3); c.lineTo(s*.34,-s*.9); c.quadraticCurveTo(0,-s*1.5,-s*.34,-s*.9); c.closePath(); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.3; c.stroke(); },
 gloves:function(c,s){ c.fillStyle='#d62839'; c.beginPath(); c.arc(0,-s*.1,s*.85,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillRect(-s*.5,s*.6,s,s*.55); c.fillStyle='rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-s*.3,-s*.4,s*.25,s*.15,-.6,0,7); c.fill(); },
 grenade:function(c,s){ c.fillStyle='#5a7a3a'; c.beginPath(); c.ellipse(0,s*.2,s*.8,s*.95,0,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#999'; c.fillRect(-s*.25,-s*.9,s*.5,s*.3); c.strokeStyle='#ddd'; c.beginPath(); c.arc(s*.4,-s*.9,s*.3,0,7); c.stroke(); },
 dracula:function(c,s){ P(c,[[-s*.8,-s*.6],[-s*.2,-s*.6],[-s*.5,s*.9]],'#fff','rgba(0,0,0,.55)'); P(c,[[s*.2,-s*.6],[s*.8,-s*.6],[s*.5,s*.9]],'#fff','rgba(0,0,0,.55)'); c.fillStyle='#c0143c'; c.fillRect(-s*.9,-s*.75,s*1.8,s*.25); },
 gambler:function(c,s){ c.fillStyle='#fff'; rr(c,-s*.8,-s*.8,s*1.6,s*1.6,s*.25); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#d62839'; [[-.38,-.38],[.38,-.38],[0,0],[-.38,.38],[.38,.38]].forEach(function(p){ c.beginPath(); c.arc(p[0]*s,p[1]*s,s*.14,0,7); c.fill(); }); },
 wizard:function(c,s){ c.fillStyle='#6b4a2a'; c.fillRect(-s*.08,-s*.6,s*.16,s*1.9); c.shadowColor='#7b6bff'; c.shadowBlur=8; star(c,0,-s*.8,s*.6,5,'#d9d2ff'); c.shadowBlur=0; },
 magiccard:function(c,s){ [[-.55,-s*.55,'#d62839',0],[0,0,'#17181f',1],[.55,s*.55,'#d62839',2]].forEach(function(k){ c.save(); c.translate(k[1],k[1]*.0); c.rotate(k[0]); c.fillStyle='#fff'; c.fillRect(-s*.5,-s*.9,s,s*1.75); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.strokeRect(-s*.5,-s*.9,s,s*1.75); c.fillStyle=k[2]; c.beginPath(); if(k[3]===0){ c.moveTo(0,-s*.45); c.lineTo(s*.28,-s*.05); c.lineTo(0,s*.35); c.lineTo(-s*.28,-s*.05); } else if(k[3]===1){ c.arc(0,-s*.1,s*.26,0,7); } else { c.moveTo(0,s*.3); c.bezierCurveTo(-s*.5,-s*.1,-s*.2,-s*.5,0,-s*.2); c.bezierCurveTo(s*.2,-s*.5,s*.5,-s*.1,0,s*.3); } c.closePath(); c.fill(); c.restore(); }); },
 kan:function(c,s){ c.fillStyle='#6a8a3a'; c.fillRect(-s*1.1,-s*.14,s*2.2,s*.28); c.fillStyle='#c0143c'; c.fillRect(s*.6,-s*.14,s*.3,s*.28); c.fillStyle='#ffd23f'; c.fillRect(-s*1.1,-s*.14,s*.18,s*.28); },
 puppeteer:function(c,s){ P(c,[[0,-s*1.4],[s*.1,s*.9],[-s*.1,s*.9]],'#c8d0e0',null); c.strokeStyle='#ff9ad1'; c.lineWidth=2; c.beginPath(); c.moveTo(0,s*.9); c.bezierCurveTo(s*.9,s*.7,-s*.6,s*.2,s*.5,-s*.4); c.stroke(); },
 vacuum:function(c,s){ c.fillStyle='#9fb5c9'; rr(c,-s*.9,-s*.2,s*1.3,s*.9,s*.3); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#5a6a7a'; c.fillRect(s*.4,-s*.1,s*.7,s*.28); c.strokeStyle='#5a6a7a'; c.lineWidth=s*.14; c.beginPath(); c.moveTo(-s*.5,-s*.2); c.lineTo(-s*.5,-s*1.3); c.stroke(); },
 pirate:function(c,s){ c.strokeStyle='#cfd6e0'; c.lineWidth=s*.3; c.lineCap='round'; c.beginPath(); c.moveTo(-s*.4,s*1.1); c.lineTo(-s*.4,-s*.5); c.arc(s*.1,-s*.5,s*.5,Math.PI,Math.PI*2.1); c.lineTo(s*.6,-s*.1); c.stroke(); },
 kurus:function(c,s){ c.fillStyle='#b46bff'; c.beginPath(); c.arc(0,s*.35,s*.8,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#ddd'; c.fillRect(-s*.25,-s*.9,s*.5,s*.6); c.fillStyle='#8a5a30'; c.fillRect(-s*.3,-s*1.05,s*.6,s*.2); c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.arc(-s*.3,s*.15,s*.18,0,7); c.fill(); },
 cleon:function(c,s){ c.fillStyle='#8a5a30'; c.fillRect(-s*.07,-s*.2,s*.14,s*1.5); c.fillStyle='#ffd23f'; c.beginPath(); c.arc(0,-s*.55,s*.55,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#d62839'; c.beginPath(); c.arc(0,-s*.55,s*.22,0,7); c.fill(); },
 pel:function(c,s){ c.fillStyle='#4dd2ff'; c.beginPath(); c.arc(0,0,s*.6,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.arc(0,0,s*.25,0,7); c.fill(); c.strokeStyle='#aaa'; c.lineWidth=2; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){ c.beginPath(); c.moveTo(p[0]*s*.5,p[1]*s*.5); c.lineTo(p[0]*s,p[1]*s); c.stroke(); c.beginPath(); c.arc(p[0]*s,p[1]*s,s*.22,0,7); c.stroke(); }); },
 tionis:function(c,s){ c.fillStyle='#f4eefc'; c.beginPath(); c.moveTo(-s*.9,-s*.7); c.quadraticCurveTo(0,-s*1.1,s*.9,-s*.7); c.quadraticCurveTo(s*.9,s*.7,0,s); c.quadraticCurveTo(-s*.9,s*.7,-s*.9,-s*.7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#222'; c.beginPath(); c.ellipse(-s*.3,-s*.2,s*.2,s*.12,.3,0,7); c.ellipse(s*.3,-s*.2,s*.2,s*.12,-.3,0,7); c.fill(); c.strokeStyle='#d62839'; c.lineWidth=2; c.beginPath(); c.arc(0,s*.3,s*.3,.2,Math.PI-.2); c.stroke(); },
 syringe:function(c,s){ c.save(); c.rotate(.6); c.fillStyle='#eaf6ff'; c.fillRect(-s*.28,-s*.6,s*.56,s*1.2); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.strokeRect(-s*.28,-s*.6,s*.56,s*1.2); c.fillStyle='#7fffd4'; c.fillRect(-s*.2,-s*.1,s*.4,s*.6); c.fillStyle='#8a93a6'; c.fillRect(-s*.5,-s*.72,s,s*.14); c.fillRect(-s*.05,s*.6,s*.1,s*.7); c.fillRect(-s*.05,-s*1.2,s*.1,s*.5); c.restore(); }
};
function hatShape(c,s,kind,p1,p2){      /* what the character wears: small head gear in its own colours */
  var K={
   tophat:function(){ c.fillStyle='#17181f'; c.fillRect(-s*1.1,s*.35,s*2.2,s*.28); c.fillRect(-s*.65,-s*.95,s*1.3,s*1.35); c.fillStyle='#d62839'; c.fillRect(-s*.65,s*.05,s*1.3,s*.22); },
   cap:function(){ c.fillStyle='#fff'; c.beginPath(); c.arc(0,s*.3,s*.85,Math.PI,0); c.fill(); c.fillStyle='#d62839'; c.fillRect(-s*.85,s*.18,s*1.7,s*.2); c.fillStyle='#fff'; c.fillRect(0,s*.28,s*1.15,s*.2); },
   cowboy:function(){ c.fillStyle='#8a5a30'; c.beginPath(); c.ellipse(0,s*.45,s*1.35,s*.32,0,0,7); c.fill(); c.fillRect(-s*.6,-s*.5,s*1.2,s); c.beginPath(); c.arc(0,-s*.5,s*.6,Math.PI,0); c.fill(); c.fillStyle='#ffd23f'; c.fillRect(-s*.6,s*.15,s*1.2,s*.16); },
   helmet:function(col){ c.fillStyle=col||'#9aa3b2'; c.beginPath(); c.arc(0,s*.35,s*.95,Math.PI,0); c.fill(); c.fillRect(-s*.95,s*.3,s*1.9,s*.22); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.beginPath(); c.arc(0,s*.35,s*.95,Math.PI,0); c.stroke(); },
   morion:function(){ c.fillStyle='#aab3c2'; c.beginPath(); c.arc(0,s*.4,s*.85,Math.PI,0); c.fill(); c.fillRect(-s*.1,-s*.95,s*.2,s*.5); P(c,[[-s*1.2,s*.3],[-s*.85,s*.25],[-s*.85,s*.5]],'#aab3c2',null); P(c,[[s*1.2,s*.3],[s*.85,s*.25],[s*.85,s*.5]],'#aab3c2',null); },
   glasses:function(col){ c.fillStyle=col||'#111'; c.beginPath(); c.ellipse(-s*.5,0,s*.5,s*.36,0,0,7); c.ellipse(s*.5,0,s*.5,s*.36,0,0,7); c.fill(); c.strokeStyle=col||'#111'; c.lineWidth=2; c.beginPath(); c.moveTo(-s*.1,0); c.lineTo(s*.1,0); c.stroke(); c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(-s*.75,-s*.2,s*.3,s*.1); },
   goggles:function(col){ c.strokeStyle='#333'; c.lineWidth=s*.22; c.beginPath(); c.moveTo(-s*1.05,0); c.lineTo(s*1.05,0); c.stroke(); c.fillStyle=col||'#7fe0ff'; c.strokeStyle='#333'; c.lineWidth=2; [-1,1].forEach(function(d){ c.beginPath(); c.arc(d*s*.5,0,s*.45,0,7); c.fill(); c.stroke(); }); },
   mask:function(){ c.fillStyle='#4a5a4a'; c.beginPath(); c.ellipse(0,0,s*.8,s*.95,0,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#222'; c.beginPath(); c.arc(-s*.35,-s*.25,s*.25,0,7); c.arc(s*.35,-s*.25,s*.25,0,7); c.fill(); c.fillStyle='#777'; c.beginPath(); c.arc(0,s*.5,s*.3,0,7); c.fill(); },
   hood:function(col,eye){ c.fillStyle=col; c.beginPath(); c.moveTo(-s,s*.9); c.quadraticCurveTo(-s*1.1,-s*.9,0,-s*1.05); c.quadraticCurveTo(s*1.1,-s*.9,s,s*.9); c.lineTo(s*.5,s*.4); c.quadraticCurveTo(0,s*.05,-s*.5,s*.4); c.closePath(); c.fill(); c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.5; c.stroke(); if(eye){ c.fillStyle=eye; c.beginPath(); c.arc(-s*.22,s*.38,s*.1,0,7); c.arc(s*.22,s*.38,s*.1,0,7); c.fill(); } },
   straw:function(){ P(c,[[-s*1.35,s*.55],[0,-s*.9],[s*1.35,s*.55]],'#d8b060','rgba(0,0,0,.5)'); c.strokeStyle='#8a6a30'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-s*.7,s*.1); c.lineTo(s*.7,s*.1); c.stroke(); },
   bandana:function(col){ c.fillStyle=col; c.beginPath(); c.arc(0,s*.2,s*.9,Math.PI,0); c.fill(); c.fillRect(-s*.9,s*.1,s*1.8,s*.28); P(c,[[s*.8,s*.25],[s*1.4,s*.7],[s*1.2,s*.05]],col,null); },
   tricorn:function(){ P(c,[[-s*1.35,s*.5],[-s*.5,-s*.7],[s*.5,-s*.7],[s*1.35,s*.5],[0,s*.2]],'#1c1c22','rgba(255,255,255,.35)'); c.fillStyle='#fff'; c.beginPath(); c.arc(0,-s*.2,s*.2,0,7); c.fill(); },
   wiz:function(){ P(c,[[-s*1.2,s*.55],[-s*.55,s*.45],[-s*.1,-s*.5],[s*.5,-s*1.1],[s*.5,-s*.4],[s*.55,s*.45],[s*1.2,s*.55],[0,s*.8]],'#d62839','rgba(0,0,0,.5)'); c.fillStyle='#ffd23f'; c.fillRect(-s*.6,s*.2,s*1.2,s*.2); },
   jester:function(){ P(c,[[-s*.2,s*.5],[-s*1.2,-s*.8],[-s*.5,s*.1],[0,-s*1.1],[s*.5,s*.1],[s*1.2,-s*.8],[s*.2,s*.5]],'#ff5f8f','rgba(0,0,0,.5)'); c.fillStyle='#7b6bff'; c.fillRect(-s*.6,s*.35,s*1.2,s*.25); c.fillStyle='#ffd23f'; c.beginPath(); c.arc(-s*1.2,-s*.8,s*.18,0,7); c.arc(s*1.2,-s*.8,s*.18,0,7); c.arc(0,-s*1.1,s*.18,0,7); c.fill(); },
   feathers:function(){ c.fillStyle='#ffd23f'; c.fillRect(-s*.9,s*.35,s*1.8,s*.25); for(var i=-2;i<=2;i++){ c.save(); c.translate(i*s*.4,s*.35); c.rotate(i*.28); c.fillStyle='#2bbf6a'; c.beginPath(); c.ellipse(0,-s*.55,s*.2,s*.75,0,0,7); c.fill(); c.fillStyle='#d62839'; c.beginPath(); c.ellipse(0,-s*1.1,s*.16,s*.22,0,0,7); c.fill(); c.restore(); } },
   nemes:function(){ P(c,[[-s,s*.9],[-s*.8,-s*.7],[0,-s*.95],[s*.8,-s*.7],[s,s*.9],[s*.5,s*.5],[-s*.5,s*.5]],'#3a6ad0','rgba(0,0,0,.5)'); c.fillStyle='#ffc43d'; for(var i=-2;i<=2;i++) c.fillRect(i*s*.35-s*.07,-s*.7,s*.14,s*1.2); },
   fang:function(){ c.fillStyle='#d62839'; c.beginPath(); c.arc(0,-s*.1,s*.7,0,Math.PI); c.fill(); P(c,[[-s*.5,-s*.05],[-s*.2,-s*.05],[-s*.35,s*.55]],'#fff',null); P(c,[[s*.2,-s*.05],[s*.5,-s*.05],[s*.35,s*.55]],'#fff',null); },
   crown:function(){ crownShape(c,0,0,s*.85,5,'#ffd23f','#a8741a','#d62839'); },
   headset:function(){ c.strokeStyle='#333'; c.lineWidth=s*.22; c.beginPath(); c.arc(0,s*.2,s*.95,Math.PI,0); c.stroke(); c.fillStyle='#4dd2ff'; c.fillRect(-s*1.1,s*.1,s*.38,s*.7); c.fillRect(s*.72,s*.1,s*.38,s*.7); c.strokeStyle='#4dd2ff'; c.lineWidth=2; c.beginPath(); c.moveTo(-s*.9,s*.8); c.quadraticCurveTo(-s*.5,s*1.2,-s*.1,s*.95); c.stroke(); },
   nurse:function(){ P(c,[[-s*.95,s*.5],[-s*.7,-s*.6],[s*.7,-s*.6],[s*.95,s*.5]],'#fff','rgba(0,0,0,.5)'); c.fillStyle='#d62839'; c.fillRect(-s*.1,-s*.45,s*.2,s*.6); c.fillRect(-s*.3,-s*.25,s*.6,s*.2); },
   eyeshade:function(){ c.fillStyle='#2e9d5a'; c.beginPath(); c.moveTo(-s*1.1,s*.4); c.lineTo(s*1.1,s*.4); c.lineTo(s*.8,-s*.4); c.lineTo(-s*.8,-s*.4); c.closePath(); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1.5; c.stroke(); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-s*.6,-s*.3,s*.5,s*.12); },
   topknot:function(){ c.fillStyle='#222'; c.beginPath(); c.arc(0,-s*.55,s*.36,0,7); c.fill(); c.fillStyle='#d62839'; c.fillRect(-s*.9,s*.1,s*1.8,s*.3); P(c,[[s*.8,s*.25],[s*1.4,s*.8],[s*1.2,s*.1]],'#d62839',null); },
   bush:function(){ c.fillStyle='#8a9a4a'; c.beginPath(); c.ellipse(0,s*.4,s*1.3,s*.3,0,0,7); c.fill(); c.beginPath(); c.arc(0,s*.3,s*.8,Math.PI,0); c.fill(); c.fillStyle='#5a6a2a'; c.fillRect(-s*.8,s*.1,s*1.6,s*.18); },
   boxer:function(){ c.fillStyle='#d62839'; c.beginPath(); c.arc(0,s*.35,s*.95,Math.PI,0); c.fill(); c.fillRect(-s*.95,s*.3,s*.35,s*.7); c.fillRect(s*.6,s*.3,s*.35,s*.7); c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(-s*.3,-s*.4,s*.6,s*.14); },
   moon:function(){ c.fillStyle='#ffe27a'; c.beginPath(); c.arc(0,0,s*.9,0,7); c.fill(); c.fillStyle='#1b1030'; c.beginPath(); c.arc(s*.4,-s*.1,s*.78,0,7); c.fill(); }
  };
  (K[kind]||K.cap)(p1,p2);
}
var WEAR={pistol:'glasses',smg:'goggles',bow:'hood:#2e9d5a',sword:'helmet',kan:'feathers',pizarro:'morion',horemheb:'nemes',lightsaber:'hood:#7a5a3a',bat:'cap',boomerang:'bush',shuriken:'hood:#22252e',shotgun:'cowboy',rifle:'helmet:#5a6a4a',gloves:'boxer',grenade:'goggles:#ffb347',bazooka:'mask',dagger:'straw',magiccard:'tophat',dracula:'fang',puppeteer:'jester',gambler:'eyeshade',kurus:'hood:#2a1148:#b46bff',samurai:'topknot',pirate:'tricorn',vacuum:'bandana:#3a8fd0',portalgun:'goggles:#b46bff',flamethrower:'mask',wizard:'wiz',cleon:'crown',pel:'headset',tionis:'moon',syringe:'nurse',guard:'helmet:#4a6aa8'};
var HORIZ={pistol:1,smg:1,rifle:1,shotgun:1,bazooka:1,flamethrower:1,portalgun:1,kan:1,vacuum:1};
function stIcons(c,key,x,y,w,h,o){      /* weapon on the top right corner, worn gear on the bottom left corner */
  var s=w*.23, wr=(WEAR[key]||'cap').split(':');
  c.save(); c.translate(x+w+o-s*.2,y-o+s*.2); c.rotate(HORIZ[key]?Math.PI*.75:-Math.PI*.75); (WP[key]||WP.pistol)(c,s); c.restore();
  c.save(); c.translate(x-o+s*.2,y+h+o-s*.2); c.rotate(Math.PI/4); c.shadowColor='rgba(0,0,0,.6)'; c.shadowBlur=4; hatShape(c,s*.95,wr[0],wr[1],wr[2]); c.restore();
}
function draw(c,id,x,y,w,h,r){      /* canvas: paints a themed border around the rect x,y,w,h */
  var b=BY[id]; if(!b) return; r=r||20; c.save();
  var s=w*.17, a1=b.a==='rainbow'?'#ffd23f':b.a, a2=b.a==='rainbow'?'#ff5f5f':b.b, key=id.slice(id.indexOf('_')+1), o=8;
  c.shadowColor=a1; c.shadowBlur=8; base(c,b,x,y,w,h,r,7); c.shadowBlur=0;
  var cs=[[x-o,y-o,-.78+Math.PI],[x+w+o,y-o,.78+Math.PI],[x-o,y+h+o,-2.36+Math.PI],[x+w+o,y+h+o,2.36+Math.PI]], i;   /* every corner ornament faces the middle */
  if(b.game==='crownenvoy'){ crownShape(c,x+w/2,y-o-s*.5,s*1.5,CROWN[key]||5,a1,a2,key==='ruby'?'#ff2d55':key==='emerald'?'#2bff9a':key==='royal'?'#7b6bff':'#fff7c0'); cs.forEach(function(p,k){ rot(c,p[0],p[1],p[2],function(){ P(c,[[0,-s*.9],[s*.5,0],[0,s*.9],[-s*.5,0]],a1,'rgba(0,0,0,.5)'); }); }); }
  else if(b.game==='beaconfall'){ var fam=(key==='stone'||key==='coal')?'rock':'gem'; cs.forEach(function(p,k){ motif(c,fam,p[0],p[1],s*1.15,a1,a2,k%2?.25:-.25); }); motif(c,fam,x+w/2,y-o,s*.9,a1,a2,0); motif(c,fam,x+w/2,y+h+o,s*.9,a1,a2,0); }
  else if(b.game==='isleport'){ var fk=FRUIT[key]||'round', lv='#3fae4a'; c.strokeStyle='#2f8f3a'; c.lineWidth=2; c.beginPath(); for(i=0;i<=24;i++){ var t=i/24, vx=x+w*t, vy=y-o+Math.sin(t*20)*3; i?c.lineTo(vx,vy):c.moveTo(vx,vy); } c.stroke(); c.beginPath(); for(i=0;i<=24;i++){ var t2=i/24, vx2=x+w*t2, vy2=y+h+o+Math.sin(t2*20)*3; i?c.lineTo(vx2,vy2):c.moveTo(vx2,vy2); } c.stroke();
    cs.forEach(function(p,k){ motif(c,'leaf',p[0]+(k%2?6:-6),p[1],s*.95,'#4fc45a','#2a7a35',p[2]+Math.PI*.5); motif(c,'leaf',p[0],p[1]+(k<2?-6:6),s*.8,'#6fd873','#2a7a35',p[2]); });
    fruit(c,fk,x+w/2,y-o-s*.3,s*1.2,a1,a2); fruit(c,fk,x+w*.2,y+h+o+2,s*.8,a1,a2); fruit(c,fk,x+w*.8,y+h+o+2,s*.8,a1,a2); }
  else if(b.game==='vowkeep'){ var n=7, bw=w/(n*2-1); c.fillStyle=a1; c.strokeStyle='rgba(0,0,0,.6)'; c.lineWidth=1.5; for(i=0;i<n;i++){ c.fillRect(x+i*bw*2,y-o-s*.85,bw,s*.8); c.strokeRect(x+i*bw*2,y-o-s*.85,bw,s*.8); } cs.forEach(function(p){ c.fillStyle=a2; c.fillRect(p[0]-s*.5,p[1]-s*.5,s,s); c.strokeRect(p[0]-s*.5,p[1]-s*.5,s,s); c.fillStyle=a1; c.fillRect(p[0]-s*.2,p[1]-s*.2,s*.4,s*.4); }); }
  else if(b.game==='dummyparty'){ for(i=0;i<26;i++){ var t3=i/26, px,py; if(i<7){ px=x+w*(i/6); py=y-o; } else if(i<13){ px=x+w+o; py=y+h*((i-7)/5); } else if(i<20){ px=x+w*(1-(i-13)/6); py=y+h+o; } else { px=x-o; py=y+h*(1-(i-20)/5); } var q=c.createLinearGradient(0,0,0,1); motif(c,'confetti',px,py,s*.6,RB[i%5],RB[(i+2)%5],i*.9); } }
  else if(b.game==='stickseum'){ stIcons(c,key,x,y,w,h,o); }
  else { var fm=FAM[id]||'star', pal=b.game==='tumblecrown'?[a1,a2]:[a1,a2]; cs.forEach(function(p,k){ motif(c,fm,p[0],p[1],s*.95,pal[0],pal[1],fm==='arrow'||fm==='blade'||fm==='bullet'?p[2]+(k<2?0:0):0); }); motif(c,fm,x+w/2,y-o,s*1.05,pal[0],pal[1],0); }
  c.restore();
}
function preview(id,size,img){      /* a small picture of the border on a plain tile, for lists; img = a loaded profile-photo image shown in the tile */
  var cv=document.createElement('canvas'), k=size||84; cv.width=cv.height=k; var c=cv.getContext('2d'), p=k*.27, w=k-p*2, y0=k*.32;
  c.fillStyle='#1b2030'; rr(c,p,y0,w,w,w*.2); c.fill(); if(img&&img.naturalWidth){ c.save(); rr(c,p,y0,w,w,w*.2); c.clip(); c.drawImage(img,p,y0,w,w); c.restore(); } else { c.fillStyle='rgba(255,255,255,.12)'; c.beginPath(); c.arc(k/2,y0+w*.38,w*.2,0,7); c.fill(); c.fillRect(k/2-w*.3,y0+w*.62,w*.6,w*.3); }
  if(id) draw(c,id,p,y0,w,w,w*.2); return cv.toDataURL('image/png'); }
async function mine(sb){ try{ var r=await sb.rpc('ff_border_owned'); return (r&&!r.error&&r.data||[]).map(function(o){ return o.border_id; }); }catch(e){ return []; } }
async function equipped(sb,uid){ try{ var r=await sb.from('ff_border_equipped').select('border_id').eq('user_id',uid).limit(1); return r&&!r.error&&r.data&&r.data[0]?r.data[0].border_id:''; }catch(e){ return ''; } }
async function of(sb,uids){ var m={}; if(!uids||!uids.length) return m; try{ var r=await sb.from('ff_border_equipped').select('user_id,border_id').in('user_id',uids); ((r&&!r.error&&r.data)||[]).forEach(function(o){ m[o.user_id]=o.border_id; }); }catch(e){} return m; }
async function equip(sb,id){ var r=await sb.rpc('ff_border_equip',{p_border:id||''}); if(r.error) throw r.error; return r.data; }
async function grant(sb,id,game){ if(!BY[id]) return false; try{ var r=await sb.rpc('ff_border_own',{p_border:id,p_game:game||BY[id].game}); return !(r&&r.error); }catch(e){ return false; } }
window.FFBorders={LIST:LIST,GAMES:G,get:get,name:name,css:css,draw:draw,preview:preview,mine:mine,equipped:equipped,of:of,equip:equip,grant:grant};
})();

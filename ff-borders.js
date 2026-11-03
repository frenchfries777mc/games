/* Profile borders (테두리): bought in each game, worn on the profile card and the account chip.
   Owned/equipped rows live in ff_user_borders / ff_border_equipped (supabase-profile-borders-2026-11-03.sql).
   A game grants a border after its shop sale:  FFBorders.grant(sb, 'st_pistol', 'stickseum')  */
(function(){
var G={stickseum:'Stickseum',crownenvoy:'Crown Envoy',beaconfall:'Beaconfall',isleport:'Isleport',tumblecrown:'Tumble Crown',vowkeep:'Vowkeep',dummyparty:'Dummy Party'};
var RAW=[
["st_pistol", "stickseum", "권총", "Pistol", "#ffd23f", "#b8860b"],
["st_rifle", "stickseum", "소총", "Rifle", "#6fbf5a", "#2e6b2a"],
["st_smg", "stickseum", "기관단총", "SMG", "#35e0ff", "#1b6fa8"],
["st_magiccard", "stickseum", "마법 카드", "Magic Card", "#d46bff", "#6a1fa8"],
["st_shuriken", "stickseum", "수리검", "Shuriken", "#b8c4d6", "#566074"],
["st_bat", "stickseum", "야구 방망이", "Bat", "#c98a4b", "#6b4220"],
["st_dagger", "stickseum", "암살자", "Assassin", "#7a7fa8", "#2c2f55"],
["st_dracula", "stickseum", "드라큘라", "Dracula", "#c0143c", "#3a0a1a"],
["st_gambler", "stickseum", "도박꾼", "Gambler", "#ff4d6d", "#ffd23f"],
["st_wizard", "stickseum", "마법사", "Wizard", "#7b6bff", "#2b1d8a"],
["st_sword", "stickseum", "검사", "Swordsman", "#e8eef7", "#7a8aa3"],
["st_horemheb", "stickseum", "호렘헤브", "Horemheb", "#ffc43d", "#1e7fa3"],
["st_lightsaber", "stickseum", "광선검", "Lightsaber", "#4dd2ff", "#ff4d4d"],
["st_bazooka", "stickseum", "바주카", "Bazooka", "#ff8a2b", "#7a3a10"],
["st_bow", "stickseum", "궁수", "Archer", "#8bd45a", "#4a7a2a"],
["st_boomerang", "stickseum", "부메랑", "Boomerang", "#ffb347", "#e0662b"],
["st_shotgun", "stickseum", "샷건", "Shotgun", "#ff6a3d", "#8a2a10"],
["st_gloves", "stickseum", "권투 장갑", "Gloves", "#ff5f5f", "#a01c1c"],
["st_grenade", "stickseum", "수류탄", "Grenade", "#7aa84a", "#2f4a1a"],
["st_flamethrower", "stickseum", "화염방사기", "Flamethrower", "#ff6a1f", "#ffd23f"],
["st_portalgun", "stickseum", "포털건", "Portal Gun", "#4da6ff", "#ff9a2b"],
["st_pirate", "stickseum", "해적", "Pirate", "#e0b050", "#3a2a14"],
["st_samurai", "stickseum", "사무라이", "Samurai", "#e8e8f0", "#c0143c"],
["st_vacuum", "stickseum", "청소기", "Vacuum", "#9fb5c9", "#4a6075"],
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
["ip_tobacco", "isleport", "담배", "Tobacco", "#a88a4a", "#4a3a14"],
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
["dp_party", "dummyparty", "파티", "Party", "rainbow", "rainbow"]
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
var FRUIT={tomato:'round',apple:'round',berry:'round',onion:'round',grape:'round',pumpkin:'round',melon:'round',cabbage:'round',cacao:'round',potato:'round',carrot:'long',corn:'long',pepper:'long',sugar:'long',flax:'long',wheat:'grain',rice:'grain',tea:'grain',coffee:'grain',cotton:'grain',lavender:'grain',sunflower:'flower',tobacco:'grain'};
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
function draw(c,id,x,y,w,h,r){      /* canvas: paints a themed border around the rect x,y,w,h */
  var b=BY[id]; if(!b) return; r=r||20; c.save();
  var s=w*.17, a1=b.a==='rainbow'?'#ffd23f':b.a, a2=b.a==='rainbow'?'#ff5f5f':b.b, key=id.slice(id.indexOf('_')+1), o=8;
  c.shadowColor=a1; c.shadowBlur=8; base(c,b,x,y,w,h,r,7); c.shadowBlur=0;
  var cs=[[x-o,y-o,-.78],[x+w+o,y-o,.78],[x-o,y+h+o,-2.36],[x+w+o,y+h+o,2.36]], i;
  if(b.game==='crownenvoy'){ crownShape(c,x+w/2,y-o-s*.5,s*1.5,CROWN[key]||5,a1,a2,key==='ruby'?'#ff2d55':key==='emerald'?'#2bff9a':key==='royal'?'#7b6bff':'#fff7c0'); cs.forEach(function(p,k){ rot(c,p[0],p[1],p[2],function(){ P(c,[[0,-s*.9],[s*.5,0],[0,s*.9],[-s*.5,0]],a1,'rgba(0,0,0,.5)'); }); }); }
  else if(b.game==='beaconfall'){ var fam=(key==='stone'||key==='coal')?'rock':'gem'; cs.forEach(function(p,k){ motif(c,fam,p[0],p[1],s*1.15,a1,a2,k%2?.25:-.25); }); motif(c,fam,x+w/2,y-o,s*.9,a1,a2,0); motif(c,fam,x+w/2,y+h+o,s*.9,a1,a2,0); }
  else if(b.game==='isleport'){ var fk=FRUIT[key]||'round', lv='#3fae4a'; c.strokeStyle='#2f8f3a'; c.lineWidth=2; c.beginPath(); for(i=0;i<=24;i++){ var t=i/24, vx=x+w*t, vy=y-o+Math.sin(t*20)*3; i?c.lineTo(vx,vy):c.moveTo(vx,vy); } c.stroke(); c.beginPath(); for(i=0;i<=24;i++){ var t2=i/24, vx2=x+w*t2, vy2=y+h+o+Math.sin(t2*20)*3; i?c.lineTo(vx2,vy2):c.moveTo(vx2,vy2); } c.stroke();
    cs.forEach(function(p,k){ motif(c,'leaf',p[0]+(k%2?6:-6),p[1],s*.95,'#4fc45a','#2a7a35',p[2]+Math.PI*.5); motif(c,'leaf',p[0],p[1]+(k<2?-6:6),s*.8,'#6fd873','#2a7a35',p[2]); });
    fruit(c,fk,x+w/2,y-o-s*.3,s*1.2,a1,a2); fruit(c,fk,x+w*.2,y+h+o+2,s*.8,a1,a2); fruit(c,fk,x+w*.8,y+h+o+2,s*.8,a1,a2); }
  else if(b.game==='vowkeep'){ var n=7, bw=w/(n*2-1); c.fillStyle=a1; c.strokeStyle='rgba(0,0,0,.6)'; c.lineWidth=1.5; for(i=0;i<n;i++){ c.fillRect(x+i*bw*2,y-o-s*.85,bw,s*.8); c.strokeRect(x+i*bw*2,y-o-s*.85,bw,s*.8); } cs.forEach(function(p){ c.fillStyle=a2; c.fillRect(p[0]-s*.5,p[1]-s*.5,s,s); c.strokeRect(p[0]-s*.5,p[1]-s*.5,s,s); c.fillStyle=a1; c.fillRect(p[0]-s*.2,p[1]-s*.2,s*.4,s*.4); }); }
  else if(b.game==='dummyparty'){ for(i=0;i<26;i++){ var t3=i/26, px,py; if(i<7){ px=x+w*(i/6); py=y-o; } else if(i<13){ px=x+w+o; py=y+h*((i-7)/5); } else if(i<20){ px=x+w*(1-(i-13)/6); py=y+h+o; } else { px=x-o; py=y+h*(1-(i-20)/5); } var q=c.createLinearGradient(0,0,0,1); motif(c,'confetti',px,py,s*.6,RB[i%5],RB[(i+2)%5],i*.9); } }
  else { var fm=FAM[id]||'star', pal=b.game==='tumblecrown'?[a1,a2]:[a1,a2]; cs.forEach(function(p,k){ motif(c,fm,p[0],p[1],s*.95,pal[0],pal[1],fm==='arrow'||fm==='blade'||fm==='bullet'?p[2]+(k<2?0:0):0); }); motif(c,fm,x+w/2,y-o,s*1.05,pal[0],pal[1],0); }
  c.restore();
}
function preview(id,size){      /* a small picture of the border on a plain tile, for lists */
  var cv=document.createElement('canvas'), k=size||84; cv.width=cv.height=k; var c=cv.getContext('2d'), p=k*.22, w=k-p*2, y0=k*.29;
  c.fillStyle='#1b2030'; rr(c,p,y0,w,w,w*.2); c.fill(); c.fillStyle='rgba(255,255,255,.12)'; c.beginPath(); c.arc(k/2,y0+w*.38,w*.2,0,7); c.fill(); c.fillRect(k/2-w*.3,y0+w*.62,w*.6,w*.3);
  if(id) draw(c,id,p,y0,w,w,w*.2); return cv.toDataURL('image/png'); }
async function mine(sb){ try{ var r=await sb.rpc('ff_border_owned'); return (r&&!r.error&&r.data||[]).map(function(o){ return o.border_id; }); }catch(e){ return []; } }
async function equipped(sb,uid){ try{ var r=await sb.from('ff_border_equipped').select('border_id').eq('user_id',uid).limit(1); return r&&!r.error&&r.data&&r.data[0]?r.data[0].border_id:''; }catch(e){ return ''; } }
async function of(sb,uids){ var m={}; if(!uids||!uids.length) return m; try{ var r=await sb.from('ff_border_equipped').select('user_id,border_id').in('user_id',uids); ((r&&!r.error&&r.data)||[]).forEach(function(o){ m[o.user_id]=o.border_id; }); }catch(e){} return m; }
async function equip(sb,id){ var r=await sb.rpc('ff_border_equip',{p_border:id||''}); if(r.error) throw r.error; return r.data; }
async function grant(sb,id,game){ if(!BY[id]) return false; try{ var r=await sb.rpc('ff_border_own',{p_border:id,p_game:game||BY[id].game}); return !(r&&r.error); }catch(e){ return false; } }
window.FFBorders={LIST:LIST,GAMES:G,get:get,name:name,css:css,draw:draw,preview:preview,mine:mine,equipped:equipped,of:of,equip:equip,grant:grant};
})();

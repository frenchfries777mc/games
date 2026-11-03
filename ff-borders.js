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
function ring(c,b,x,y,w,h,r,lw,inset){
  var g;
  if(b.a==='rainbow'){ g=c.createLinearGradient(x,y,x+w,y+h); ['#ff5f5f','#ffd23f','#3ee08f','#35e0ff','#b46bff'].forEach(function(col,i){ g.addColorStop(i/4,col); }); }
  else g=b.a;
  c.lineWidth=lw; c.strokeStyle=g; rr(c,x-inset,y-inset,w+inset*2,h+inset*2,r+inset); c.stroke();
}
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function draw(c,id,x,y,w,h,r){      /* canvas: paints the border around the rect x,y,w,h */
  var b=BY[id]; if(!b) return; c.save();
  c.shadowColor=b.a==='rainbow'?'rgba(255,255,255,.7)':b.a; c.shadowBlur=16;
  ring(c,b,x,y,w,h,r||20,6,3); c.shadowBlur=0;
  if(b.a!=='rainbow'){ c.lineWidth=3; c.strokeStyle=b.b; rr(c,x-8,y-8,w+16,h+16,(r||20)+8); c.stroke(); }
  if(crown(b)){ c.font=Math.round(w*.26)+'px serif'; c.textAlign='center'; c.textBaseline='middle'; c.shadowColor=b.a; c.shadowBlur=8; c.fillText('\ud83d\udc51',x+w/2,y-8); }
  c.restore();
}
async function mine(sb){ try{ var r=await sb.rpc('ff_border_owned'); return (r&&!r.error&&r.data||[]).map(function(o){ return o.border_id; }); }catch(e){ return []; } }
async function equipped(sb,uid){ try{ var r=await sb.from('ff_border_equipped').select('border_id').eq('user_id',uid).limit(1); return r&&!r.error&&r.data&&r.data[0]?r.data[0].border_id:''; }catch(e){ return ''; } }
async function of(sb,uids){ var m={}; if(!uids||!uids.length) return m; try{ var r=await sb.from('ff_border_equipped').select('user_id,border_id').in('user_id',uids); ((r&&!r.error&&r.data)||[]).forEach(function(o){ m[o.user_id]=o.border_id; }); }catch(e){} return m; }
async function equip(sb,id){ var r=await sb.rpc('ff_border_equip',{p_border:id||''}); if(r.error) throw r.error; return r.data; }
async function grant(sb,id,game){ if(!BY[id]) return false; try{ var r=await sb.rpc('ff_border_own',{p_border:id,p_game:game||BY[id].game}); return !(r&&r.error); }catch(e){ return false; } }
window.FFBorders={LIST:LIST,GAMES:G,get:get,name:name,css:css,draw:draw,mine:mine,equipped:equipped,of:of,equip:equip,grant:grant};
})();

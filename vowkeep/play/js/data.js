// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 데이터: 역할, 적, 축복, 1장 지도

import { T } from './tr.js';

export const VERSION = 'v0.2', BUILD = 53;

export const ROLES = {
  knight: {
    name: T('기사'), color: '#3f6fd0', hp: 170, speed: 6.0,
    atk: { kind: 'melee', range: 2.5, arc: 1.9, dmg: 18, cd: 0.45 },
    skills: [
      { id: 'block', name: T('막기'), key: 'Q', cd: 5, desc: T('1.2초 동안 방패를 들어 앞에서 오는 피해를 70% 줄여요. 처음 0.4초 안에 보스 돌진을 받으면 보스가 기절해요.') },
      { id: 'dash', name: T('돌진'), key: 'E', cd: 6, desc: T('앞으로 돌진하며 부딪힌 적에게 30 피해를 주고 밀쳐 내요.') },
      { id: 'taunt', name: T('외침'), key: 'R', cd: 12, desc: T('주변 적이 4초 동안 나만 노리고, 그동안 받는 피해가 30% 줄어요.') }
    ],
    role: T('앞에서 적을 끌어모으고 막아요.')
  },
  archer: {
    name: T('궁수'), color: '#5a9a4e', hp: 105, speed: 6.4,
    atk: { kind: 'arrow', dmg: 13, cd: 0.36, speed: 26 },
    skills: [
      { id: 'pierce', name: T('관통 화살'), key: 'Q', cd: 5, desc: T('적을 꿰뚫고 날아가는 강한 화살이에요. 45 피해.') },
      { id: 'rain', name: T('화살비'), key: 'E', cd: 9, desc: T('조준한 곳에 1.5초 동안 화살비를 내려요.') },
      { id: 'mark', name: T('약점 표시'), key: 'R', cd: 12, desc: T('조준한 적에게 6초 동안 표시를 남겨 모두의 피해가 50% 늘어요.') }
    ],
    role: T('멀리서 약점을 쏴요. 공격을 꾹 누르면 0.8초에 두 발, 2초에 세 발을 한 번에 쏴요.')
  },
  priest: {
    name: T('사제'), color: '#e8e4ef', hp: 115, speed: 6.0,
    atk: { kind: 'orb', dmg: 11, cd: 0.5, speed: 16 },
    skills: [
      { id: 'heal', name: T('치유'), key: 'Q', cd: 7, desc: T('나와 주변 동료의 체력을 35 회복해요.') },
      { id: 'ward', name: T('보호막'), key: 'E', cd: 14, desc: T('주변 동료에게 5초 동안 피해 25를 막는 보호막을 씌워요.') },
      { id: 'raise', name: T('부활의 빛'), key: 'R', cd: 50, desc: T('가까이 쓰러진 동료를 체력 25%로 일으켜요. 1초 동안 빛을 모은 뒤 일어나요.') }
    ],
    role: T('회복과 보호막으로 동료를 지켜요.')
  },
  squire: {
    name: T('종자'), color: '#d0543a', hp: 150, speed: 7.0,
    atk: { kind: 'melee', range: 2.3, arc: 1.7, dmg: 15, cd: 0.38, burn: true },
    skills: [
      { id: 'potion', name: T('물약 던지기'), key: 'Q', cd: 7, desc: T('조준한 곳에 물약을 던져 그 자리 동료의 체력을 40 회복해요.') },
      { id: 'trap', name: T('덫 놓기'), key: 'E', cd: 7, desc: T('발밑에 덫을 놓아요. 밟은 적은 공중으로 튕겨 2.5초 묶이고 40 피해를 받아요. 덫이 터지며 불길이 번져 둘레 적도 불타요.') },
      { id: 'rally', name: T('함성'), key: 'R', cd: 15, desc: T('주변 동료의 공격력과 속도를 7초 동안 30% 올려요. 그동안 종자의 횃불 공격은 불똥이 튀어 옆의 적도 태워요.') }
    ],
    role: T('물약과 덫으로 돕고, 바닥 함정을 밟아도 다치지 않고 해체해요. 구르기 대신 미끄러지며 적의 다리를 걸어 넘어뜨려요.')
  }
};
export const ROLE_IDS = ['knight', 'archer', 'priest', 'squire'];

export const ENEMIES = {
  skel: { name: T('해골 병사'), hp: 130, speed: 4.4, r: 0.6, dmg: 32, range: 1.8, windup: 0.42, cd: 0.9, honor: 1 },
  archer: { name: T('해골 궁수'), hp: 85, speed: 3.9, r: 0.6, dmg: 25, range: 12, windup: 0.55, cd: 1.6, keep: 7.5, honor: 1 },
  shield: { name: T('방패 해골'), hp: 230, speed: 3.5, r: 0.7, dmg: 36, range: 1.9, windup: 0.5, cd: 1.3, front: 0.3, honor: 2 },
  elite: { name: T('해골 근위대장'), hp: 900, speed: 4.2, r: 0.9, dmg: 52, range: 2.5, windup: 0.55, cd: 1.3, charge: true, honor: 6 },
  mimic: { name: T('미믹'), hp: 760, speed: 5.4, r: 0.9, dmg: 40, range: 2.1, windup: 0.4, cd: 1.0, honor: 8 },
  boss: { name: T('몰락한 기사단장'), hp: 16000, speed: 3.9, r: 1.4, dmg: 55, honor: 0 }
};

export const BLESSINGS = [
  { id: 'blade', name: T('날카로운 칼날'), desc: T('공격 피해 +15%') },
  { id: 'feet', name: T('가벼운 발'), desc: T('이동 속도 +12%') },
  { id: 'armor', name: T('단단한 갑옷'), desc: T('최대 체력 +25') },
  { id: 'hands', name: T('빠른 손'), desc: T('기본 공격 간격 -15%') },
  { id: 'focus', name: T('기술 숙련'), desc: T('기술 대기 시간 -15%') },
  { id: 'leech', name: T('피의 서약'), desc: T('적을 맞힐 때마다 체력 1 회복') },
  { id: 'roll', name: T('구르기 달인'), desc: T('구르기 대기 시간 -40%') },
  { id: 'fire', name: T('불꽃 무기'), desc: T('기본 공격이 적을 태워요') },
  { id: 'thorn', name: T('가시 갑옷'), desc: T('맞으면 때린 적에게 8 피해') },
  { id: 'bond', name: T('전우애'), desc: T('동료를 두 배 빨리 일으켜요') },
  { id: 'last', name: T('마지막 버팀'), desc: T('체력이 30% 아래면 받는 피해 -25%') },
  { id: 'honor', name: T('vC의 길'), desc: T('이번 원정에서 받는 vC +25%') }
];

// 장마다 적의 이름·모습·능력치가 달라요 (규칙은 해골 병사·궁수·방패·근위대장 네 가지를 같이 써요)
// skin: 화면에 그릴 모습, proj: 원거리 적이 쏘는 것
export const FOES = [
  { skel: { name: T('해골 병사'), skin: 'skel' }, archer: { name: T('해골 궁수'), skin: 'skel' }, shield: { name: T('방패 해골'), skin: 'skel' }, elite: { name: T('해골 근위대장'), skin: 'skel' } },
  { skel: { name: T('잿빛 늑대'), skin: 'wolf', hp: 0.8, speed: 1.3, r: 0.75 }, archer: { name: T('재 사냥꾼'), skin: 'hunter', proj: 'spear' }, shield: { name: T('껍질 거인'), skin: 'treant', hp: 1.2, speed: 0.85, r: 0.9 }, elite: { name: T('늑대 우두머리'), skin: 'wolf', speed: 1.15 } },
  { skel: { name: T('익사한 수도사'), skin: 'monk', hp: 1.15, speed: 0.9 }, archer: { name: T('물의 시종'), skin: 'acolyte', proj: 'eorb', psp: 12 }, shield: { name: T('종지기'), skin: 'bellman' }, elite: { name: T('수도원 파수꾼'), skin: 'monkw' } },
  { skel: { name: T('재의 기사'), skin: 'ashknight', hp: 1.1 }, archer: { name: T('재 석궁병'), skin: 'xbow', proj: 'bolt', psp: 22 }, shield: { name: T('탑 방패병'), skin: 'ashshield' }, elite: { name: T('왕의 근위 기사'), skin: 'royal' } },
  { skel: { name: T('얼어붙은 형제'), skin: 'frostk', hp: 1.1 }, archer: { name: T('서리 궁수'), skin: 'frostb', proj: 'eorb', psp: 15 }, shield: { name: T('얼음 방패병'), skin: 'frosts' }, elite: { name: T('서리 형제단장'), skin: 'frostl' } },
  { skel: { name: T('해골 광부'), skin: 'skel', hp: 1.05 }, archer: { name: T('곡괭이 투척꾼'), skin: 'miner', proj: 'spear', psp: 16 }, shield: { name: T('바위 거인'), skin: 'golem', hp: 1.25, speed: 0.85, r: 0.9 }, elite: { name: T('광산 감독'), skin: 'golemk' } },
  { skel: { name: T('불꽃 신도'), skin: 'zealot', speed: 1.1 }, archer: { name: T('재 사제'), skin: 'pyro', proj: 'ember', psp: 13 }, shield: { name: T('향로지기'), skin: 'censer' }, elite: { name: T('사원 수호기사'), skin: 'templar' } },
  { skel: { name: T('깨진 서약의 기사'), skin: 'voidk', hp: 1.15 }, archer: { name: T('심연 석궁병'), skin: 'voidb', proj: 'vorb', psp: 18 }, shield: { name: T('심연 방패병'), skin: 'voids' }, elite: { name: T('심연의 맹세자'), skin: 'voidl' } }
];

// 큰 지도 만들기: 방 12개를 네 줄로 지그재그 이어 붙여요. 같은 씨앗이면 늘 같은 지도예요
// 방 종류: foes(적), rest(모닥불), boss, puz(수수께끼 방: plates·braziers·statues), dark(어둠의 방)
function genMap(seed, rooms, opt = {}) {
  let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // 양옆에 10칸씩 여유를 둬서 바깥쪽 방 옆에 비밀 방을 붙여요
  // 장마다 다른 지도 짜임 (st): cols 열 수, cw 통로 너비, jit 방 위치 흔들기, zig 꺾인 통로, round 방 모서리 깎기
  const st = opt.st || rooms.st || {}, cols = st.cols || 3, cwd = st.cw || 4, gw = Math.max(4, cwd + (cwd % 2)), jit = st.jit || 0,
    sc = st.sc || 1, SW = Math.max(26, Math.round(30 * sc)), SH = Math.max(24, Math.round(26 * sc)), X0 = 10, rowsN = Math.ceil(rooms.length / cols), w = SW * cols + X0 * 2, h = SH * rowsN + 2;
  const m = { w, h, cs: 2, floors: [], water: [], areas: [], spawns: [], pillars: [], traps: [], fires: [], altars: [], chests: [], route: [], secrets: [], puzzles: [], darks: [], pits: [], lifts: [], mimic: -1 };
  const R = rooms.map((r, i) => {
    const row = Math.floor(i / cols), c0 = row % 2 ? cols - 1 - (i % cols) : i % cols, col = opt.flip ? cols - 1 - c0 : c0, sy = (rowsN - 1 - row) * SH + 1;
    const rw = r.boss ? Math.min(26, SW - 2) : r.w ? r.w + 3 : Math.min(SW - 4, Math.round((15 + Math.floor(rnd() * 8)) * sc)), rh = r.boss ? Math.min(22, SH - 2) : r.h ? r.h + 2 : Math.min(SH - 4, Math.round((13 + Math.floor(rnd() * 7)) * sc));
    const jx = Math.max(0, Math.min(jit, Math.floor((SW - rw) / 2) - 2)), jy = Math.max(0, Math.min(jit, Math.floor((SH - rh) / 2) - 2));
    const x = X0 + col * SW + Math.floor((SW - rw) / 2) + (jx ? Math.round((rnd() * 2 - 1) * jx) : 0), y = sy + Math.floor((SH - rh) / 2) + (jy ? Math.round((rnd() * 2 - 1) * jy) : 0);
    return Object.assign({ x, y, rw, rh, col, row, cx: x + Math.floor(rw / 2), cy: y + Math.floor(rh / 2) }, r);
  });
  const chestRooms = [];
  R.forEach((r, i) => {
    const rd = st.round && !r.boss && !r.cut ? st.round : 0, rr = rd ? [[r.x + rd, r.y, r.rw - rd * 2, r.rh], [r.x, r.y + rd, r.rw, r.rh - rd * 2]] : [[r.x, r.y, r.rw, r.rh]];
    m.floors.push(...rr);
    if (r.water) m.water.push([r.x, r.y, r.rw, r.rh]);
    if (r.pool) m.water.push([r.x + 1, r.y + r.rh - 5, 4, 4]);
    m.areas.push({ name: r.name, line: r.line, r: rr, rest: r.rest ? 1 : undefined, boss: r.boss ? 1 : undefined, t: r.t != null ? r.t : i, puz: r.puz, dark: r.dark ? 1 : undefined, cut: r.cut });
    // 통로: 같은 줄이면 가로로, 다음 줄이면 세로로 나가요. zig면 가운데에서 한 번 꺾여요
    if (i < R.length - 1) {
      const n = R[i + 1], hw = Math.floor(cwd / 2), pts = [[r.cx, r.cy]];
      if (n.row === r.row) { if (st.zig || n.cy !== r.cy) { const mx = Math.round((r.cx + n.cx) / 2 + (st.zig ? (rnd() - 0.5) * 4 : 0)); pts.push([mx, r.cy], [mx, n.cy]); } }
      else { const my = Math.round((r.cy + n.cy) / 2 + (st.zig ? (rnd() - 0.5) * 3 : 0)); if (n.cx !== r.cx) pts.push([r.cx, my], [n.cx, my]); }
      pts.push([n.cx, n.cy]); r.mid = pts.slice(1, -1);
      for (let k = 0; k < pts.length - 1; k++) { const [ax, ay] = pts[k], [bx, by] = pts[k + 1], rc = [Math.min(ax, bx) - hw, Math.min(ay, by) - hw, Math.abs(bx - ax) + cwd, Math.abs(by - ay) + cwd]; m.floors.push(rc); if (r.water && n.water) m.water.push(rc); }
      // 회랑: 넓은 통로 양옆에 기둥
      if (st.colon) for (let k = 0; k < pts.length - 1; k++) { const [ax, ay] = pts[k], [bx, by] = pts[k + 1], L = Math.abs(bx - ax) + Math.abs(by - ay); if (L < 10) continue; for (let d = 4; d < L - 3; d += 5) { const t2 = d / L, px = Math.round(ax + (bx - ax) * t2), py = Math.round(ay + (by - ay) * t2); const inRoom = R.some(o => px >= o.x - 1 && px <= o.x + o.rw && py >= o.y - 1 && py <= o.y + o.rh); if (inRoom) continue; if (ax === bx) m.pillars.push([px - hw + 0.5, py], [px + hw - 1.5, py]); else m.pillars.push([px, py - hw + 0.5], [px, py + hw - 1.5]); } }
    }
    // 기둥
    if (r.pil || r.boss) for (const [u, v] of [[0.22, 0.28], [0.78, 0.28], [0.22, 0.72], [0.78, 0.72]]) m.pillars.push([r.x + Math.round(r.rw * u), r.y + Math.round(r.rh * v)]);
    const free = (px, py) => !m.pillars.some(([a, b]) => Math.abs(a - px) < 2 && Math.abs(b - py) < 2) && Math.abs(px - r.cx) + Math.abs(py - r.cy) > 1.5;
    const spot = (pad = 2) => { for (let k = 0; k < 40; k++) { const px = r.x + pad + Math.floor(rnd() * (r.rw - pad * 2)), py = r.y + pad + Math.floor(rnd() * (r.rh - pad * 2)); if (free(px, py)) return [px, py]; } return [r.cx + 2, r.cy]; };
    for (const [k, n0] of Object.entries(r.foes || {})) for (let q = 0, n = k === 'elite' ? n0 : Math.round(n0 * 1.5); q < n; q++) { const [px, py] = spot(); m.spawns.push([k, px, py]); }
    for (let q = 0; q < (r.traps || 0); q++) m.traps.push(spot(3));
    if (r.rest) m.fires.push([r.cx, r.cy]);
    if (r.altar) m.altars.push([r.x + 2.5, r.y + 2]);
    if (r.chest) { chestRooms.push(m.chests.length); m.chests.push([r.x + r.rw - 3, r.y + 2]); }
    if (r.boss) { m.boss = [r.cx, r.y + Math.round(r.rh * 0.35)]; m.bossTrig = [r.x + 2, r.y + 2, r.rw - 4, r.rh - 4]; }
    if (i === 0) m.start = [r.cx, r.y + r.rh - 3];
    // 수수께끼 방: 나가는 길목에 창살문이 내려와 있어요. 풀면 올라가요
    if (r.puz && i < R.length - 1) {
      const n = R[i + 1], gate = n.row === r.row ? [n.cx > r.cx ? r.x + r.rw : r.x - 1, r.cy - gw / 2, 1, gw] : [r.cx - gw / 2, r.y - 1, gw, 1];
      const c4 = [[r.x + 3, r.y + 3], [r.x + r.rw - 4, r.y + 3], [r.x + r.rw - 4, r.y + r.rh - 4], [r.x + 3, r.y + r.rh - 4]];
      const q = { k: r.puz, area: i, gate, c: [r.cx, r.cy] };
      if (r.puz === 'plates') q.items = c4;
      else if (r.puz === 'braziers') { q.items = c4; const o = [0, 1, 2, 3]; for (let k = 3; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; } q.order = o; }
      else if (r.puz === 'oath') q.items = [[r.cx - 4, r.cy], [r.cx, r.cy], [r.cx + 4, r.cy]];
      else if (r.puz === 'targets') q.items = [[r.x + 2, r.y], [r.x + 4, r.y], [r.x + r.rw - 3, r.y]];
      else if (r.puz === 'basins') q.items = c4;
      else if (r.puz === 'vines') q.items = [[r.x + 3, r.cy], [r.cx, r.y + 3], [r.x + r.rw - 4, r.cy]];
      else if (r.puz === 'levers') { q.items = [-6, -2, 2, 6].map(d => [r.cx + d, r.cy + 2]); const o = [1, 0, 0, 0].map((_, k) => rnd() < 0.5 ? 1 : 0); if (o.every(v => v) || o.every(v => !v)) o[1] = 1 - o[0]; q.lit0 = o; }
      else if (r.puz === 'sigils') { q.items = []; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) q.items.push([r.cx + a * 3, r.cy + b * 3]); }
      else if (r.puz === 'crystals') q.items = [[r.cx - 4, r.cy - 3], [r.cx + 4, r.cy - 3], [r.cx + 4, r.cy + 3], [r.cx - 4, r.cy + 3]];
      else if (r.puz === 'mirrors') { q.items = [[r.x + 3, r.cy + 3], [r.cx, r.cy - 3], [r.x + r.rw - 4, r.cy + 3]]; q.src = [r.x + 1, r.y + r.rh - 3]; q.ok = [0, 0, 0]; q.rot0 = q.items.map(() => 1 + Math.floor(rnd() * 3)); }
      else if (r.puz === 'embers') q.items = [[r.cx, r.cy], [r.x + 3, r.y + 3], [r.x + r.rw - 4, r.y + 3], [r.cx, r.y + r.rh - 3]];
      else if (r.puz === 'icecrys') q.items = [[r.cx - 5, r.cy], [r.cx, r.cy - 3], [r.cx + 5, r.cy]];
      else if (r.puz === 'lanterns') q.items = [[r.cx - 3, r.cy - 2], [r.cx, r.cy - 2], [r.cx + 3, r.cy - 2]];
      else if (r.puz === 'vigil') q.items = [[r.x + 3, r.cy], [r.cx, r.y + 3], [r.x + r.rw - 4, r.cy]];
      else if (r.puz === 'blackfire') q.items = [[r.x + 3, r.y + 3], [r.cx, r.cy], [r.x + r.rw - 4, r.y + 3]];
      else { q.items = [[r.cx, r.cy - 4], [r.cx + 5, r.cy], [r.cx, r.cy + 4], [r.cx - 5, r.cy]]; q.rot0 = q.items.map((_, k) => (k + 1 + Math.floor(rnd() * 3)) % 4); }
      m.puzzles.push(q);
    }
    // 어둠의 방: 들어오는 쪽에 횃불 걸이가 있어요
    if (r.dark && i > 0) {
      const p = R[i - 1], st = p.row === r.row ? [p.cx > r.cx ? r.x + r.rw - 2 : r.x + 1, r.cy + 3] : [r.cx + 4, r.y + r.rh - 2];
      m.darks.push({ area: i, room: [r.x, r.y, r.rw, r.rh], stand: st });
    }
    // 끊어진 길(pit)·도르래 승강기(lift): 방을 가로지르는 세 칸 너비 띠가 들어오는 쪽(가까운 쪽)과 나가는 쪽(먼 쪽)을 갈라요
    // 띠가 가로(h)면 먼 쪽은 늘 위(북쪽), 세로(v)면 나가는 쪽(far = 1 오른쪽, -1 왼쪽)
    if (r.cut && i > 0 && i < R.length - 1) {
      const p = R[i - 1], n = R[i + 1], out = n.row !== r.row ? 'T' : n.cx > r.cx ? 'R' : 'L', inB = p.row !== r.row;
      let ax, far, band;
      if (out === 'T') { ax = 'h'; far = -1; band = [r.x, r.y + 3, r.rw, 3]; }
      else if (inB) { ax = 'h'; far = -1; band = [r.x, r.cy + 3, r.rw, 3]; }
      else { ax = 'v'; far = out === 'R' ? 1 : -1; band = [out === 'R' ? r.cx + 2 : r.cx - 4, r.y, 3, r.rh]; }
      const [bx, by] = band, c = ax === 'h' ? r.cx : r.cy;
      // 가까운 쪽·먼 쪽으로 d칸 떨어진 곳 (띠에서), 옆으로 l번째 칸
      const nearAt = (d, l) => ax === 'h' ? [l, by + 2 + d] : far > 0 ? [bx - d, l] : [bx + 2 + d, l];
      const farAt = (d, l) => ax === 'h' ? [l, by - d] : far > 0 ? [bx + 2 + d, l] : [bx - d, l];
      const o = { area: i, band, ax, far };
      if (r.cut === 'pit') {
        // 금 간 기둥: 가까운 쪽 띠 앞에 서 있다가 쓰러지면 띠를 가로지르는 두 칸 너비 다리가 돼요
        const q = nearAt(2, c + 4); o.pil = ax === 'h' ? [c + 5, q[1] + 0.5] : [q[0] + 0.5, c + 5];
        o.bridge = ax === 'h' ? [c + 4, by, 2, 3] : [bx, c + 4, 3, 2];
        m.pits.push(o);
      } else {
        // 승강기: 띠 안 3×3 칸이 오르내리는 발판, 손잡이는 아래(가까운 쪽)와 위(먼 쪽)에 하나씩
        o.plat = ax === 'h' ? [c - 1, by, 3, 3] : [bx, c - 1, 3, 3];
        o.cb = nearAt(2, c + 3); o.ct = farAt(2, c + 3);
        o.ledge = ax === 'h' ? [r.x, r.y, r.rw, by - r.y] : far > 0 ? [bx + 3, r.y, r.x + r.rw - bx - 3, r.rh] : [r.x, r.y, bx - r.x, r.rh];
        // 위층에서 다음 방으로 내려가는 계단 두 칸
        const g2 = gw / 2; o.stairs = out === 'T' ? [[r.cx - g2, r.y - 1, gw, 1, 2 / 3], [r.cx - g2, r.y - 2, gw, 1, 1 / 3]] : out === 'R' ? [[r.x + r.rw, r.cy - g2, 1, gw, 2 / 3], [r.x + r.rw + 1, r.cy - g2, 1, gw, 1 / 3]] : [[r.x - 1, r.cy - g2, 1, gw, 2 / 3], [r.x - 2, r.cy - g2, 1, gw, 1 / 3]];
        m.lifts.push(o);
      }
    }
    // 봇이 따라갈 길: 방 가운데 → 꺾이는 곳
    m.route.push([r.cx, r.cy]); if (r.mid) m.route.push(...r.mid);
  });
  m.route.push(m.boss);
  // 미믹: 모닥불 방 상자 하나는 상자인 척하는 괴물이에요
  if (!opt.noMimic && chestRooms.length) m.mimic = chestRooms[seed % chestRooms.length];
  // 무너지는 성: 보스를 쓰러뜨리면 세 방 앞 출구까지 달려요
  const ex = R[Math.max(0, R.length - 4)]; m.exit = [ex.cx, ex.cy]; m.exitA = Math.max(0, R.length - 4);
  // 비밀 방 두 곳: 앞쪽 절반과 뒤쪽 절반에서 하나씩 (바깥쪽 벽 너머, 수수께끼·어둠의 방은 빼고)
  if (!opt.noSecret) for (const [a, b] of [[1, 5], [6, 10]]) {
    const cand = R.filter((r, i) => i >= a && i <= b && !r.boss && !r.puz && !r.dark && !r.cut && (r.col === 0 || r.col === cols - 1)); if (!cand.length) continue;
    const r = cand[(seed >> (a === 1 ? 1 : 2)) % cand.length];
    const left = r.col === 0, py = r.cy - 1, px = left ? r.x - 3 : r.x + r.rw, rx = left ? r.x - 10 : r.x + r.rw + 3, ry = r.cy - 3;
    m.secrets.push({ pass: [px, py, 3, 2], room: [rx, ry, 7, 7], face: [left ? r.x - 1 : r.x + r.rw, py, 1, 2], chest: [rx + (left ? 1 : 5), ry + 1], lore: [rx + 3, ry + 4], flag: [rx + (left ? 1 : 5), ry + 5] });
  }
  // 깃발을 숨길 작은 벽감: 어둠의 방 뒤쪽 구석(횃불 없이는 안 보여요)과 마지막 수수께끼 방 뒤쪽 구석(풀면 깃발이 솟아요)
  // 벽감은 통로나 다른 방에 닿지 않는 구석을 골라요 (닿으면 창살문을 돌아가는 샛길이 생겨요)
  const touch = (a, b) => a[0] - 1 < b[0] + b[2] && b[0] < a[0] + a[2] + 1 && a[1] - 1 < b[1] + b[3] && b[1] < a[1] + a[3] + 1;
  const nich = (i, right) => {
    const r = R[i], rd = st.round && !r.boss && !r.cut ? st.round : 0, own = m.areas[i].r.slice(), xs = right ? [r.x + r.rw - rd - 4, r.x + rd + 1] : [r.x + rd + 1, r.x + r.rw - rd - 4];
    for (const [x0, y0, fy] of [[xs[0], r.y - 2, r.y - 1], [xs[1], r.y - 2, r.y - 1], [xs[0], r.y + r.rh, r.y + r.rh], [xs[1], r.y + r.rh, r.y + r.rh]]) {
      const rc = [x0, y0, 3, 2]; if (m.floors.some(f => !own.some(o => o === f || (o[0] === f[0] && o[1] === f[1] && o[2] === f[2] && o[3] === f[3])) && touch(rc, f))) continue;
      m.floors.push(rc); m.areas[i].r.push(rc); return [x0 + 1, fy];
    }
    return null;
  };
  const di = R.findIndex(r => r.dark), pis = R.map((r, i) => r.puz ? i : -1).filter(i => i >= 0), pi = pis[pis.length - 1];
  // 갈림길: 가운데쯤 싸움 방 하나에 비석 둘이 서 있어요. 하나를 골라 꾹 누르면 그 길의 중간 보스가 나와요
  m.fork = null;
  if (!opt.noSecret) {
    const cand = R.map((r, i) => i).filter(i => { const r = R[i]; return i >= 4 && i <= R.length - 6 && !r.boss && !r.puz && !r.dark && !r.cut && !r.rest && r.rw >= 9 && r.rh >= 9; });
    if (cand.length) { const i = cand[(seed >> 3) % cand.length], r = R[i]; m.fork = { area: i, a: [r.x + 3, r.cy], b: [r.x + r.rw - 4, r.cy], c: [r.cx, r.cy] }; }
  }
  m.niches = {}; if (!opt.noSecret) { if (di >= 0) m.niches.d = nich(di, false); const np = pi != null && nich(pi, true); if (np) m.niches.p = [...np, m.puzzles.findIndex(q => q.area === pi)]; }
  return m;
}
// 장마다 수수께끼 방 둘과 어둠의 방 하나를 끼워 넣어요 (원래 방 번호는 대사 번호로 남겨요)
// 장마다 끊어진 길과 도르래 승강기도 하나씩 있어요 (방 14개)
const CUTS = [[T('무너진 다리목'), T('우물 도르래')], [T('끊어진 협곡'), T('사냥꾼 망루 도르래')], [T('무너진 회랑'), T('종탑 도르래')], [T('끊어진 탑 복도'), T('탑 승강기')], [T('얼음 틈'), T('성벽 도르래')], [T('꺼진 갱도'), T('광산 승강기')], [T('무너진 순례길'), T('사원 도르래')], [T('끊어진 심연 다리'), T('불씨 승강기')]];
const PIT_LINE = T('천장이 무너져 길이 끊겼어요. 금 간 기둥을 강타로 쓰러뜨리면 다리가 돼요.'), LIFT_LINE = T('위층으로 가는 길은 도르래 승강기뿐이에요. 한 명이 손잡이를 돌리는 동안 나머지가 올라가요.');
// 역할 전용 수수께끼: 장마다 두 번째 수수께끼 방은 한 역할만 풀 수 있어요 (1장 기사, 2장 궁수, 3장 사제, 4장 종자, 5장부터 다시)
export const ROLE_PUZ = {
  oath: { role: 'knight', name: T('방패 맹세의 방'), line: T('기사만 풀 수 있어요. 방패 석판 셋 위에서 각각 막기(Q)를 쓰면 창살문이 열려요.') },
  targets: { role: 'archer', name: T('높은 과녁의 방'), line: T('궁수만 풀 수 있어요. 벽 높이 걸린 과녁 셋을 10초 안에 모두 화살로 맞혀요.') },
  basins: { role: 'priest', name: T('성수반의 방'), line: T('사제만 풀 수 있어요. 빛 구슬이나 치유로 성수반 넷에 모두 빛을 채워요.') },
  vines: { role: 'squire', name: T('가시덩굴 방'), line: T('종자만 풀 수 있어요. 횃불 든 공격으로 가시덩굴 셋을 모두 태워요.') }
};
// 5장부터는 역할 수수께끼도 새것이에요
Object.assign(ROLE_PUZ, {
  icecrys: { role: 'knight', name: T('얼음 수정 방'), line: T('기사만 풀 수 있어요. 강타(공격·공격·강타)로 얼음 수정 셋을 깨요.') },
  lanterns: { role: 'archer', name: T('일렬 등불 갱도'), line: T('궁수만 풀 수 있어요. 한 줄로 선 등불 셋을 관통 화살(Q) 한 발로 모두 켜요.') },
  vigil: { role: 'priest', name: T('기도의 원'), line: T('사제만 풀 수 있어요. 빛의 원 셋에 각각 2초씩 서서 기도해요.') },
  blackfire: { role: 'squire', name: T('검은 불꽃 제단'), line: T('종자만 풀 수 있어요. 물약(Q)을 던져 검은 불꽃 셋을 꺼요.') }
});
const RP_ORDER = ['oath', 'targets', 'basins', 'vines', 'icecrys', 'lanterns', 'vigil', 'blackfire'];
// 장마다 다른 일반 수수께끼 (1~3장은 원래 방 그대로, 4장부터 새것)
export const GEN_PUZ = {
  levers: { name: T('탑 지렛대 방'), line: T('지렛대를 당기면 그 등불과 양옆 등불이 함께 켜지거나 꺼져요. 등불 넷을 모두 켜요.') },
  sigils: { name: T('얼음 문양 바닥'), line: T('얼음 문양 아홉 칸을 이어서 한 번씩만 밟아 모두 빛나게 해요. 빛나는 칸을 다시 밟으면 처음부터예요.') },
  crystals: { name: T('빛 수정 갱도'), line: T('수정 넷을 공격해 빛을 켜요. 빛은 8초 뒤 꺼지니 넷이 함께 빛나게 해요.') },
  mirrors: { name: T('거울 회랑'), line: T('거울 셋을 돌려(F) 햇빛이 창살문까지 닿게 해요.') },
  embers: { name: T('불씨 제단'), line: T('가운데 불씨 더미에서 불씨를 들어(F) 제단 셋에 하나씩 올려요(F).') }
};
// 장마다 다른 지도 짜임: 1 지하 미로(3열, 곧은 통로) 2 숲(구불구불한 오솔길) 3 수도원(2열, 기둥 늘어선 넓은 회랑) 4 탑(1열로 곧게 올라가는 둥근 방)
// 5 얼음 국경(4열, 둥근 동굴) 6 광산(4열, 좁고 꺾인 갱도) 7 사원(2열, 넓은 회랑과 둥근 성소) 8 심연(좁은 다리로 이어진 흩어진 방)
// sc 방 크기 배율, ex 덧붙는 통로 방 수 (장마다 지도 크기와 방 수가 달라져요)
export const MAP_ST = [{ sc: 0.8 }, { zig: 1, jit: 4, cw: 3, sc: 1.05, ex: 2 }, { cols: 2, cw: 6, colon: 1, ex: 1 }, { cols: 1, round: 3, sc: 0.85 }, { cols: 4, round: 2, jit: 2, zig: 1, sc: 1.25, ex: 3 }, { cols: 4, cw: 2, zig: 1, jit: 3, sc: 0.75, ex: 1 }, { cols: 2, cw: 6, round: 3, colon: 1, sc: 1.15, ex: 2 }, { cw: 2, zig: 1, jit: 4, sc: 1.1, ex: 4 }];
// 덧붙는 통로 방: 장마다 이름과 한 줄
const EXTRA = [
  [[T('무너진 복도'), T('천장에서 돌가루가 떨어져요. 해골 몇이 서성여요.')]],
  [[T('잿빛 오솔길'), T('나뭇가지 사이로 눈이 번뜩여요.')], [T('쓰러진 고목'), T('고목 뒤에 무언가 숨어 있어요.')]],
  [[T('수도사 회랑'), T('긴 회랑에 발소리가 울려요.')]],
  [],
  [[T('얼어붙은 다리'), T('발밑 얼음이 갈라지는 소리가 나요.')], [T('눈보라 골짜기'), T('눈보라 속에서 그림자가 다가와요.')], [T('얼음 동굴'), T('고드름 사이로 숨소리가 들려요.')]],
  [[T('버려진 갱도'), T('광부들이 남긴 수레가 뒤집혀 있어요.')]],
  [[T('순례자의 길'), T('무너진 석상이 길을 지켜요.')], [T('향 피우던 방'), T('꺼진 향로에서 아직 연기가 나요.')]],
  [[T('떠도는 바위섬'), T('발밑이 끝없는 어둠이에요.')], [T('불씨 다리'), T('다리 아래에서 불씨가 솟아요.')], [T('잿빛 돌기둥'), T('돌기둥 사이에 그림자가 숨어요.')], [T('마지막 길목'), T('불꽃의 숨결이 바로 앞이에요.')]]
];
const GEN_ORDER = [null, null, null, 'levers', 'sigils', 'crystals', 'mirrors', 'embers'];
function grow(ci, rooms, [p1, dk, p2]) {
  { const k = RP_ORDER[ci % 8]; p2 = Object.assign({}, p2, { puz: k, name: ROLE_PUZ[k].name, line: ROLE_PUZ[k].line }); }
  { const k = GEN_ORDER[ci]; if (k) p1 = Object.assign({}, p1, { puz: k, name: GEN_PUZ[k].name, line: GEN_PUZ[k].line }); }
  const r = rooms.map((o, i) => Object.assign({ t: i }, o)), [pn, ln] = CUTS[ci];
  const pit = { name: pn, line: PIT_LINE, cut: 'pit', t: 'pit', w: 20, h: 17 }, lift = { name: ln, line: LIFT_LINE, cut: 'lift', t: 'lift', w: 20, h: 17 };
  const out = [r[0], r[1], Object.assign({ t: 'puz' }, p1), r[2], pit, r[3], r[4], Object.assign({ t: 'dark' }, dk), r[5], lift, Object.assign({ t: 'puz' }, p2), r[6], r[7], r[8]];
  // 통로 방은 전투 방 뒤에 끼워요 (뒤에서부터 넣어 자리가 밀리지 않게)
  const ex = EXTRA[ci].slice(0, MAP_ST[ci].ex || 0), at = [12, 8, 6, 3];
  ex.map((e, k) => ({ name: e[0], line: e[1], t: 'ex', foes: { skel: 2 + (ci >> 2), archer: 1 + (k % 2) }, traps: k % 2 ? 2 : 0, at: at[k] })).sort((a, b) => b.at - a.at).forEach(o => { const a = o.at; delete o.at; out.splice(a, 0, o); });
  out.st = MAP_ST[ci]; return out;
}

// 장: 이야기, 지도, 보스, 색
export const CHAPTERS = [
  {
    id: 1, title: T('1장 · 무너진 성 지하'), place: T('무너진 성 지하'), diff: 1,
    intro: [
      T('왕국을 지키던 서약의 기사단이 있었다.'),
      T('어느 밤 단장이 검은 불꽃에 손을 댔고, 성은 무너지고 기사단은 흩어졌다.'),
      T('살아남은 네 기사는 마지막 서약 하나를 지키기로 했다.'),
      T('무너진 성 지하로 내려가, 타락한 단장을 멈추겠다는 서약이었다.')
    ],
    outro: [
      T('단장의 검이 바닥에 떨어졌다.'),
      T('단장은 숨을 몰아쉬며 말했다. "먼저 서약을 깬 건... 왕이었다."'),
      T('진실을 찾아, 네 사람은 성 밖 잿빛 숲으로 향했다.')
    ],
  boss: { name: T('몰락한 기사단장'), ai: 'warden', hp: 12000, speed: 3.9, r: 1.4, dmg: 55, p2: [T('단장이 해골 병사를 불러내요'), T('돌진할 때 기사가 막기로 받아치면 기절해요')], p3: [T('단장의 갑옷이 갈라졌어요'), T('검은 불꽃을 피하며 등의 붉은 균열을 노려요. 두 배 피해예요')], ph: [T('해골 소환'), T('갑옷 균열')] },
    theme: 'dungeon'
  },
  {
    id: 2, title: T('2장 · 잿빛 숲'), place: T('잿빛 숲'), diff: 1.12,
    intro: [
      T('성을 빠져나오자 재가 눈처럼 내려앉은 숲이 펼쳐졌다.'),
      T('숲은 왕의 사냥터였고, 사냥꾼 기사 베른이 길을 막고 있었다.'),
      T('재에 물든 늑대들이 그의 뿔피리 소리를 따라 움직였다.'),
      T('왕이 무엇을 숨기고 있는지, 베른은 알고 있을 터였다.')
    ],
    outro: [
      T('베른의 뿔피리가 둘로 갈라졌다.'),
      T('베른은 털어놓았다. 왕이 죽지 않는 불꽃을 얻으려고 기사단을 제물로 바쳤다고.'),
      T('그 불꽃은 숲 너머 수도원, 검은 물 아래에 잠겨 있다고 했다.')
    ],
    boss: { name: T('가시관의 사냥꾼 베른'), ai: 'hunter', hp: 15000, speed: 4.6, r: 1.3, dmg: 50, p2: [T('베른이 뿔피리로 늑대를 불러요'), T('늑대부터 쓰러뜨리고 도약을 굴러서 피해요')], p3: [T('가시덤불이 사냥터를 뒤덮어요'), T('가시 고리 안쪽으로 파고들어요')], ph: [T('늑대 무리'), T('가시 고리')] },
    theme: 'forest'
  },
  {
    id: 3, title: T('3장 · 가라앉은 수도원'), place: T('가라앉은 수도원'), diff: 1.25,
    intro: [
      T('기사단이 처음 서약을 맺었던 수도원은 검은 물에 잠겨 있었다.'),
      T('대주교 오드릭은 왕의 편에 서서 서약의 불꽃을 물속에 가뒀다.'),
      T('물에 빠진 수도사들은 지금도 기도를 멈추지 않았다.'),
      T('불꽃을 되찾아야 왕과 맞설 수 있었다.')
    ],
    outro: [
      T('검은 물이 빠지자, 제단 위에 작은 불꽃 하나가 남아 있었다.'),
      T('불꽃은 네 사람의 서약에 답하듯 다시 타올랐다.'),
      T('이제 왕이 기다리는 서약의 탑으로 올라갈 차례였다.')
    ],
    boss: { name: T('익사한 대주교 오드릭'), ai: 'bishop', hp: 14000, speed: 3.2, r: 1.3, dmg: 48, p2: [T('대주교가 물에 잠긴 수도사를 깨워요'), T('순간이동한 자리를 놓치지 말아요')], p3: [T('검은 물이 차오르기 시작해요'), T('물웅덩이를 피하며 끝까지 버텨요')], ph: [T('수도사 소환'), T('검은 물')] },
    theme: 'abbey'
  },
  {
    id: 4, title: T('4장 · 서약의 탑'), place: T('서약의 탑'), diff: 1.22,
    intro: [
      T('서약의 탑은 왕국 한가운데에서 잿빛 구름을 뚫고 서 있었다.'),
      T('왕은 기사단의 서약을 불꽃에 바쳐 죽지 않는 몸을 얻었다.'),
      T('탑을 지키는 재의 기사들은 한때 네 사람과 함께 싸우던 동료들이었다.'),
      T('꼭대기 왕좌에서 잿빛 왕이 기다리고 있었다.')
    ],
    outro: [
      T('잿빛 왕관이 깨지고, 왕은 재가 되어 무너졌다.'),
      T('왕은 마지막으로 속삭였다. "불꽃이... 나를 골랐을 뿐이다. 다음은 너희다."'),
      T('그런데 불꽃은 꺼지지 않았다. 북쪽 국경 너머에서 같은 불꽃이 피어오르고 있었다.')
    ],
    boss: { name: T('잿빛 왕'), ai: 'king', hp: 14000, speed: 4.0, r: 1.5, dmg: 50, p2: [T('왕이 재의 기사들을 불러내요'), T('돌진은 기사가 막기로 받아칠 수 있어요')], p3: [T('왕관에서 재의 불꽃이 타올라요'), T('불길을 피하고 마지막 일격을 노려요')], ph: [T('재의 기사 소환'), T('재의 불꽃')] },
    theme: 'tower'
  },
  {
    id: 5, title: T('5장 · 얼어붙은 국경'), place: T('얼어붙은 국경'), diff: 1.3,
    intro: [
      T('네 사람은 불꽃을 쫓아 북쪽 국경으로 떠났다.'),
      T('국경 요새는 기사단의 형제단이 지키던 곳이었지만, 이제는 얼음에 갇혀 있었다.'),
      T('요새를 다스리는 하랄드는 추위를 이기려고 불꽃과 서약을 맺었다고 했다.'),
      T('얼어붙은 형제들을 지나, 하랄드에게 불꽃이 어디서 왔는지 물어야 했다.')
    ],
    outro: [
      T('하랄드의 얼음 갑옷이 산산이 부서졌다.'),
      T('하랄드가 떨리는 손으로 남쪽 산을 가리켰다. "불꽃은... 잊힌 광산에서 캐낸 돌이다."'),
      T('네 사람은 눈보라를 뚫고 광산으로 향했다.')
    ],
    boss: { name: T('서리 맹세의 하랄드'), ai: 'king', pat: 'frost', hp: 15000, speed: 4.0, r: 1.5, dmg: 50, col: 0x6ad0ff, fig: { body: 0x4a5a6a, helmC: 0x9ab0c8, eye: 0x6ad0ff, great: 0xb8d8f0, greatE: 0x6ad0ff, cape: 0x2a4a6a, crown: 0, mantle: 0xe8eef4, icecrown: 1, scale: 2.3 }, p2: [T('하랄드가 얼어붙은 형제들을 깨워요'), T('얼음 창 세 줄 사이로 비켜서요. 맞으면 몸이 얼어 느려져요')], p3: [T('요새 천장에서 고드름이 떨어져요'), T('발밑 그림자를 보고 계속 움직여요')], ph: [T('형제 소환'), T('얼음 불꽃')] },
    theme: 'frost'
  },
  {
    id: 6, title: T('6장 · 잊힌 광산'), place: T('잊힌 광산'), diff: 1.36,
    intro: [
      T('산속 깊은 곳에 오래전에 버려진 광산이 있었다.'),
      T('사람들은 이곳에서 검게 빛나는 돌을 캐냈고, 그 돌이 처음으로 불꽃을 피웠다.'),
      T('광산을 감독하던 그롬은 돌을 먹고 거인이 되어, 지금도 갱도를 지키고 있었다.'),
      T('불꽃의 돌이 처음 나온 곳까지 내려가야 했다.')
    ],
    outro: [
      T('거인이 쓰러지자 갱도 끝에서 붉은 빛이 새어 나왔다.'),
      T('벽에는 불꽃을 섬기는 사원의 문장이 새겨져 있었다.'),
      T('누군가 이 돌을 사원으로 실어 날랐던 것이다.')
    ],
    boss: { name: T('돌을 삼킨 거인 그롬'), ai: 'hunter', pat: 'giant', hp: 21000, speed: 4.4, r: 1.5, dmg: 52, col: 0xffb060, fig: { body: 0x5a5448, leg: 0x4a443a, arm: 0x5a5448, hood: 0, antler: 0, spear: 0, cape: 0, belt: 0, skinC: 0x6a6458, eye: 0xffb060, wide: 1.45, fists: 0x6a6256, rocks: 1, crystal: 0xffb060, maul: 0xffb060, scale: 2.4 }, p2: [T('그롬이 몸을 말아 굴러다녀요'), T('벽에 튕겨 세 번까지 굴러요. 길목에서 비켜서요')], p3: [T('무너지는 돌이 갱도에 쏟아져요'), T('발 구르기는 멀리, 바위는 옆으로 피해요')], ph: [T('갱도 짐승'), T('무너지는 돌'), T('땅 울림')], p4: [T('그롬이 온 힘으로 땅을 내리쳐요'), T('세 번 울리는 땅울림 원 밖으로 피해요')] },
    theme: 'mine'
  },
  {
    id: 7, title: T('7장 · 불꽃의 사원'), place: T('불꽃의 사원'), diff: 1.42,
    intro: [
      T('사막 한가운데, 모래 언덕 사이에 붉은 사원이 서 있었다.'),
      T('사원의 사제들은 불꽃을 신으로 섬기며, 왕과 하랄드에게 불꽃을 나눠 주었다.'),
      T('예언자 세라핀은 불꽃이 온 세상을 태워야 새 왕국이 온다고 믿고 있었다.'),
      T('세라핀을 멈추고, 불꽃이 어디로 이어지는지 알아내야 했다.')
    ],
    outro: [
      T('세라핀의 지팡이가 꺾이고, 사원의 불이 하나둘 꺼졌다.'),
      T('세라핀은 웃으며 말했다. "불꽃은 심연에서 올라온다. 너희가 닿기 전에 모든 것이 탈 것이다."'),
      T('사원 제단 아래로, 끝이 보이지 않는 계단이 열렸다.')
    ],
    boss: { name: T('불꽃의 예언자 세라핀'), ai: 'bishop', pat: 'prophet', hp: 20000, speed: 3.3, r: 1.3, dmg: 50, col: 0xff8a30, fig: { body: 0xe8d8b8, leg: 0xb09060, arm: 0xe8d8b8, skinC: 0xe0c0a0, eye: 0xffb040, staffC: 0xff8a30, cape: 0, mitre: 0, halo: 0xffb040, wings: 0xff8a30 }, p2: [T('세라핀이 불꽃 신도들을 불러요'), T('십자 불기둥은 선과 선 사이로 피해요')], p3: [T('세라핀 둘레로 불기둥이 돌아가요'), T('돌아가는 불기둥을 따라 함께 돌아요')], ph: [T('신도 소환'), T('솟는 불길'), T('태양의 심판')], p4: [T('세라핀이 태양의 심판을 내려요'), T('여덟 줄 불기둥이 두 번 갈라져요. 줄 사이로 비켜서요')] },
    theme: 'temple'
  },
  {
    id: 8, title: T('8장 · 재의 심연'), place: T('재의 심연'), diff: 1.5,
    intro: [
      T('사원 아래 계단은 땅속 깊은 곳, 재의 심연까지 이어져 있었다.'),
      T('그곳에는 처음부터 꺼지지 않은 불꽃이 살아 있었다. 왕도, 하랄드도, 세라핀도 그 불꽃에 서약했다.'),
      T('불꽃은 서약을 먹고 자랐다. 지키지 못한 서약일수록 더 크게 타올랐다.'),
      T('네 사람은 마지막 서약을 품고 심연 바닥으로 내려갔다.')
    ],
    outro: [
      T('꺼지지 않던 불꽃이 처음으로 흔들리더니, 작은 불씨가 되어 사그라들었다.'),
      T('네 사람은 그 불씨를 서약의 탑으로 가져가 모두를 지키는 등불로 바꾸었다.'),
      T('사람들은 끝까지 서약을 지킨 네 사람을 Vowkeep, 서약을 지킨 자들이라 불렀다.')
    ],
    boss: { name: T('꺼지지 않는 불꽃'), ai: 'king', pat: 'flame', hp: 26000, speed: 4.2, r: 1.6, dmg: 52, col: 0xb06aff, fig: { body: 0x1a1420, leg: 0x1a1420, arm: 0x2a2234, helm: 0, crown: 0, skinC: 0x2a1a3a, eye: 0xd08aff, great: 0x4a3a5a, greatE: 0xb06aff, cape: 0x3a1a5a, flamehead: 0xb06aff, core: 0xd08aff, spikes: 1, horns: 1, scale: 2.6 }, p2: [T('불꽃이 깨진 서약의 기사들을 불러내요'), T('소용돌이 불꽃은 세 번 이어서 퍼져요')], p3: [T('심연 하늘에서 불덩이가 쏟아져요'), T('불덩이 그림자를 피하고 마지막 일격을 노려요')], ph: [T('깨진 서약 소환'), T('심연의 불꽃'), T('꺼지지 않는 불')], p4: [T('불꽃이 마지막 힘을 다해 타올라요'), T('다섯 겹 소용돌이와 불덩이 비를 함께 피해요')] },
    theme: 'abyss'
  }
];
// 게임 중 대사: 장마다 구역에 처음 들어가면(숫자는 구역 순서), boss는 보스가 나타날 때
// 기사는 하오체, 궁수는 반말, 사제는 존댓말, 종자는 밝은 해요체로 말해요
export const TALK = [
  {
    0: [['knight', T('여긴 너무 어두운 것 같소. 모두 내 뒤를 따르시오.')], ['squire', T('횃불은 제가 들게요! 발밑 조심하세요.')], ['archer', T('뼈 굴러가는 소리... 우리만 있는 게 아니네.')]],
    1: [['priest', T('저들도 한때는 우리와 같은 기사였습니다.')], ['knight', T('그렇다면 편히 잠들게 해 주는 것이 예의겠소.')]],
    2: [['squire', T('무기가 이렇게 많은데 전부 녹슬었어요.')], ['archer', T('제단 쪽을 봐. 아직 빛이 남아 있어.')]],
    3: [['priest', T('불을 피우고 잠시 쉬어 가지요. 상처를 돌봐 드리겠습니다.')], ['knight', T('고맙소. 이 불이 꺼지지 않게 지켜 주시오.')]],
    4: [['archer', T('물길에 방패병이야. 정면으로는 안 뚫려.')], ['knight', T('내가 앞을 막겠소. 그대들은 옆으로 돌아 노리시오.')]],
    5: [['priest', T('성물이 아직 남아 있다니... 단장님도 이것만은 버리지 못하셨군요.')]],
    6: [['squire', T('근위대장님은 예전에 저한테 칼 쥐는 법을 가르쳐 주셨어요.')], ['knight', T('그분의 몫까지 우리가 서약을 지키겠소.')]],
    7: [['archer', T('이 열기, 그냥 불이 아니야.')], ['priest', T('검은 불꽃입니다. 마음을 단단히 먹으세요.')]],
    boss: [['knight', T('단장님, 우리가 함께한 서약을 기억하시오!')], ['squire', T('모두 힘내요!')]]
  },
  {
    0: [['squire', T('하늘에서 재가 눈처럼 내려요.')], ['archer', T('숲은 내 구역이야. 이번엔 내가 앞장설게.')], ['knight', T('좋소. 등 뒤는 내가 맡겠소.')]],
    1: [['archer', T('쉿. 늑대 굴이야. 하나가 깨면 전부 깨.')], ['squire', T('그럼... 살금살금 지나가면 안 될까요?')]],
    2: [['knight', T('왕의 사냥꾼들이 어찌 우리 길을 막는단 말이오.')], ['priest', T('명령을 따를 뿐이겠지요. 그래서 더 안타깝습니다.')]],
    3: [['archer', T('썩은 나무 사이에 덫이 있어. 내가 밟은 데만 밟아.')]],
    4: [['squire', T('오두막이다! 불은 제가 피울게요!')], ['priest', T('다들 조금만 쉬어요. 숲은 아직 깁니다.')]],
    5: [['knight', T('저 거대한 것은 나무요, 짐승이오?')], ['archer', T('둘 다야. 껍질부터 벗겨야 해.')]],
    6: [['priest', T('우두머리가 쓰러지면 무리도 흩어질 겁니다.')]],
    7: [['archer', T('이 샘물만은 재에 물들지 않았네.')], ['knight', T('잠시 숨을 고르시오. 베른이 가까이 있소.')]],
    boss: [['knight', T('베른, 길을 비키시오!')], ['archer', T('같은 사냥꾼끼리 이러고 싶진 않았는데.')]]
  },
  {
    0: [['priest', T('여기가... 우리가 처음 서약을 맺었던 곳입니다.')], ['squire', T('물속에서 종소리가 들려요.')]],
    1: [['knight', T('저들은 아직도 기도하고 있소.')], ['priest', T('기도가 끝나지 않으면 쉴 수도 없지요. 보내 드립시다.')]],
    2: [['archer', T('물빛 구슬 조심해. 맞으면 꽤 아파.')]],
    3: [['squire', T('책이 전부 젖었어요...')], ['priest', T('서약의 기록입니다. 글자는 번져도 뜻은 남아 있어요.')]],
    4: [['knight', T('여기서 불을 피웁시다. 몸이 얼어붙을 지경이오.')]],
    5: [['archer', T('종을 방패로 쓰다니, 여긴 정말 이상한 곳이야.')], ['squire', T('종소리 때문에 귀가 멍해요!')]],
    6: [['priest', T('파수꾼이 납골당을 지키고 있습니다. 조심하세요.')]],
    7: [['knight', T('대주교가 이 너머에 있소. 모두 준비되었소?')], ['squire', T('네! 언제든지요!')]],
    boss: [['priest', T('오드릭 대주교님, 불꽃을 돌려주십시오.')], ['archer', T('말로 될 상대 같지는 않은데.')]]
  },
  {
    0: [['knight', T('서약의 탑... 기사단의 깃발이 걸려 있던 곳이오.')], ['squire', T('지금은 전부 잿빛이에요.')]],
    1: [['squire', T('저 갑옷... 우리 기사단 거예요.')], ['knight', T('알고 있소. 그래도 멈출 수는 없소.')]],
    2: [['archer', T('다리 위에서 석궁이 겨누고 있어. 멈추지 말고 달려.')]],
    3: [['priest', T('저 방패병들도 우리 형제였습니다. 부디 빨리 끝내 드려요.')]],
    4: [['knight', T('맹세의 방이오. 처음 기사가 되던 날 여기서 무릎을 꿇었소.')], ['squire', T('저도 언젠가 여기서 서약할 수 있을까요?')], ['priest', T('이미 하고 있잖아요. 우리와 함께.')]],
    5: [['archer', T('바닥이 달아올랐어. 오래 서 있지 마.')]],
    6: [['knight', T('왕의 근위 기사들이오. 둘 다 만만치 않소.')]],
    7: [['squire', T('이 계단 끝에 왕이 있는 거죠?')], ['knight', T('그렇소. 모두 내 곁을 지키시오.')]],
    boss: [['knight', T('왕이여, 기사단의 서약을 돌려받으러 왔소!')], ['priest', T('불꽃이 왕을 삼키고 있어요. 조심하세요!')]]
  },
  {
    0: [['squire', T('으으, 손가락이 얼 것 같아요.')], ['knight', T('북쪽 형제단이 지키던 요새요. 이리 조용할 리가 없소.')]],
    1: [['archer', T('얼음 속에 사람이 있어. 눈이 움직였어.')], ['priest', T('불꽃이 저들을 얼음 속에 묶어 두었군요.')]],
    2: [['knight', T('성벽 위의 궁수부터 떨어뜨리시오.')], ['archer', T('맡겨 둬. 눈보라 속이라도 안 빗나가.')]],
    3: [['squire', T('망루가 반쯤 무너졌어요. 누가 여기서 싸웠던 걸까요?')]],
    4: [['priest', T('모닥불을 피웁시다. 다들 입술이 파래요.')], ['squire', T('형제단 식당이라니, 따뜻한 수프라도 남아 있으면 좋겠어요.')]],
    5: [['archer', T('바닥 미끄러워. 넘어지면 덫 위야.')]],
    6: [['knight', T('형제단장... 북쪽에서 가장 용맹하던 분이오.')], ['priest', T('그분도 지금은 불꽃의 사슬에 묶여 있어요.')]],
    7: [['squire', T('얼음 속인데도 촛불이 안 꺼져요.')], ['knight', T('누군가 서약을 지키려 했던 흔적이오. 하랄드가 가까이 있소.')]],
    boss: [['knight', T('하랄드, 불꽃이 어디서 왔는지 말하시오!')], ['archer', T('대답 대신 도끼부터 드는구나.')]]
  },
  {
    0: [['archer', T('사람 발자국이 하나도 없어. 오래 버려진 곳이야.')], ['squire', T('어두워요... 횃불 꼭 붙잡고 있을게요.')]],
    1: [['knight', T('죽어서도 곡괭이를 놓지 못했구려.')], ['priest', T('불꽃의 돌이 저들을 놓아주지 않는 거예요.')]],
    2: [['squire', T('곡괭이가 날아와요! 고개 숙여요!')]],
    3: [['archer', T('저 바위 덩어리가 움직였어.')], ['knight', T('거인이오. 다리부터 노리시오.')]],
    4: [['priest', T('광부들도 여기서 쉬었겠지요. 우리도 잠시 쉬어 가요.')]],
    5: [['squire', T('물이 차가워서 발이 저려요.')], ['archer', T('물소리 때문에 발소리가 안 들려. 조심해.')]],
    6: [['knight', T('감독이 장부를 들고 있소. 무엇을 그리 세었던 것이오?')], ['priest', T('캐낸 돌, 그리고 쓰러진 광부들이겠지요.')]],
    7: [['archer', T('이 검은 돌... 왕관에서 본 불꽃이랑 똑같이 빛나.')], ['knight', T('불꽃이 여기서 시작되었소. 그롬은 이 아래에 있소.')]],
    boss: [['knight', T('그롬, 그 돌을 내려놓으시오!')], ['squire', T('저렇게 큰 사람은 처음 봐요!')]]
  },
  {
    0: [['archer', T('모래 때문에 눈을 못 뜨겠어.')], ['priest', T('이 사원이 불꽃을 왕에게 보냈다니... 같은 사제로서 부끄럽습니다.')]],
    1: [['squire', T('저 사람들 맨발이에요! 안 뜨거운가?')], ['knight', T('불꽃에 홀리면 아픔도 잊는 법이오.')]],
    2: [['priest', T('저들의 기도에는 이름이 없습니다. 불꽃만 부르고 있어요.')]],
    3: [['archer', T('연기 때문에 앞이 안 보여. 향로부터 치워.')]],
    4: [['knight', T('여기서 쉬어 가오. 세라핀과 맞서려면 힘이 필요하오.')], ['squire', T('제가 물 떠 올게요!')]],
    5: [['squire', T('벽에서 불이 튀어나와요!')], ['archer', T('불 나오는 틈을 보고 지나가. 박자가 있어.')]],
    6: [['knight', T('수호기사의 갑옷에도 기사단 문장이 있소.')], ['priest', T('그들도 서약했던 거예요. 다른 것에게요.')]],
    7: [['squire', T('아, 시원하다! 여기서 조금만 더 있고 싶어요.')], ['priest', T('이 우물만은 불꽃이 닿지 않았군요.')]],
    boss: [['priest', T('세라핀, 불꽃은 신이 아닙니다!')], ['knight', T('세상을 태워 얻는 왕국 따위는 필요 없소.')]]
  },
  {
    0: [['squire', T('계단이 끝이 없어요...')], ['knight', T('내려가는 수밖에 없소. 서로 손을 놓지 마시오.')]],
    1: [['priest', T('서약을 어긴 기사들이에요. 불꽃이 저들의 후회를 먹고 있어요.')], ['archer', T('저렇게는 되고 싶지 않네.')]],
    2: [['archer', T('다리가 떠 있어. 떨어지면 끝이야.')], ['squire', T('아래 보지 마요, 아래 보지 마요...')]],
    3: [['knight', T('재가 된 숲이라니. 불꽃이 무엇까지 삼켰단 말이오.')]],
    4: [['priest', T('마지막 쉼터예요. 불을 피우고 서로의 서약을 다시 말해 봐요.')], ['squire', T('저는 끝까지 여러분 곁에 있을게요!')], ['knight', T('나도 그 서약을 지키겠소.')]],
    5: [['archer', T('바닥 아래가 전부 불이야. 덫 밟지 마.')]],
    6: [['knight', T('맹세자가 둘이오. 한 명씩 떼어 놓으시오.')], ['priest', T('제가 뒤에서 버티게 해 드릴게요.')]],
    7: [['squire', T('심장 뛰는 소리... 불꽃이 살아 있는 거예요?')], ['archer', T('살아 있든 말든, 여기서 끝낼 거야.')]],
    boss: [['knight', T('우리는 서약을 지키는 자들이오. 너에게 바칠 서약은 없소!')], ['priest', T('모두, 마지막입니다!')]]
  }
];
// 수수께끼 방, 어둠의 방, 무너지는 성: 장과 상관없이 같은 대사
export const TALK_X = {
  plates: [['knight', T('발판이 넷이오. 모두 하나씩 올라서시오.')], ['squire', T('저는 이쪽 발판이요!')]],
  braziers: [['priest', T('비석에 불 붙일 순서가 그려져 있어요.')], ['archer', T('틀리면 전부 꺼진대. 천천히 하자.')]],
  statues: [['archer', T('석상들이 딴 데를 보고 있어.')], ['knight', T('모두 가운데 문양을 바라보게 돌려 보시오.')]],
  dark: [['squire', T('아무것도 안 보여요! 횃불, 횃불 어디 있어요?')], ['priest', T('입구에 횃불 걸이가 있어요. 누가 들지 정해요.')]],
  esc: [['knight', T('성이 무너지오! 모두 출구로 달리시오!')], ['squire', T('천장이 떨어져요!')]],
  mimic: [['archer', T('상자에 이빨이 있었어!')], ['knight', T('물러서시오, 내가 막겠소!')]],
  pit: [['squire', T('길이 뚝 끊겼어요! 바닥이 안 보여요.')], ['knight', T('저 금 간 기둥을 쓰러뜨리면 다리가 되겠소. 내가 내려찍겠소.')]],
  lift: [['archer', T('저 위로 가야 하는데, 손잡이를 누가 돌리지?')], ['priest', T('한 분이 돌리고, 위에 간 분이 다시 내려 주면 돼요.')]],
  oath: [['knight', T('방패 문양이오. 이건 기사의 서약이 있어야 열리오.')], ['squire', T('기사님, 방패를 들어 주세요!')]],
  targets: [['archer', T('저 높은 과녁은 화살 말고는 못 닿아. 내가 맞힐게.')], ['knight', T('빠르게 셋 다 맞혀야 하는 듯하오.')]],
  basins: [['priest', T('성수반이 말라 있어요. 제 빛으로 채울게요.')], ['archer', T('빛 구슬이 아니면 안 되는 모양이야.')]],
  vines: [['squire', T('가시덩굴이에요! 제 횃불로 태워 버릴게요.')], ['priest', T('칼로는 안 베어져요. 불이 필요해요.')]]
};
CHAPTERS[0].map = genMap(1103, grow(0, [
  { name: T('무너진 계단'), line: T('계단 아래에서 뼈 부딪히는 소리가 들려요.'), w: 12, h: 12 },
  { name: T('해골 병영'), line: T('기사단 병사였던 해골들이 잠들어 있어요. 가까이 가면 깨어나요.'), foes: { skel: 6, archer: 2, shield: 1 }, pil: 1 },
  { name: T('무기고'), line: T('녹슨 무기 사이에 오래된 제단이 있어요.'), foes: { skel: 2, archer: 3, shield: 1 }, altar: 1 },
  { name: T('버려진 예배당'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('물에 잠긴 회랑'), line: T('방패를 든 해골들이 물길을 지켜요. 바닥 함정을 조심해요.'), foes: { skel: 4, archer: 4, shield: 2 }, water: 1, traps: 4 },
  { name: T('성물실'), line: T('기사단의 성물이 아직 남아 있어요.'), foes: { skel: 2, archer: 2, shield: 1 }, altar: 1 },
  { name: T('근위대 무덤'), line: T('단장의 근위대장이 아직 무덤을 지키고 있어요.'), foes: { elite: 1, skel: 4, archer: 2, shield: 1 }, altar: 1, pil: 1 },
  { name: T('단장의 길'), line: T('검은 불꽃의 열기가 느껴져요. 모닥불에서 숨을 고르고 가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('기사단장의 방'), line: T('"서약은 깨졌다. 너희도 여기서 무릎 꿇어라."'), boss: 1 }
], [{ name: T('발판의 방'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }, { name: T('불 꺼진 감옥'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('화로의 방'), line: T('비석에 그려진 순서대로 화로에 불을 붙여요. 틀리면 모두 꺼져요.'), puz: 'braziers', w: 16, h: 13 }]));
CHAPTERS[1].map = genMap(4242, grow(1, [
  { name: T('숲 어귀'), line: T('잿빛 나뭇잎이 눈처럼 내려요. 늑대 울음이 멀리서 들려요.'), w: 12, h: 12 },
  { name: T('늑대 굴'), line: T('잠든 늑대 무리예요. 하나가 깨면 모두 깨어나요.'), foes: { skel: 6, archer: 1 } },
  { name: T('사냥꾼 야영지'), line: T('재 사냥꾼들이 창을 들고 야영지를 지켜요.'), foes: { skel: 3, archer: 4, shield: 1 }, altar: 1, pil: 1 },
  { name: T('쓰러진 나무 다리'), line: T('썩은 나무 사이로 덫이 숨어 있어요.'), foes: { skel: 4, shield: 2 }, traps: 3 },
  { name: T('숲속 오두막'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('가시덤불 길'), line: T('껍질 거인이 길목을 막고 있어요.'), foes: { skel: 5, archer: 3, shield: 1 }, traps: 3 },
  { name: T('우두머리의 언덕'), line: T('거대한 늑대 우두머리가 언덕을 지켜요.'), foes: { elite: 1, skel: 4, archer: 2 }, altar: 1, pil: 1 },
  { name: T('잿빛 샘'), line: T('맑은 샘물 곁에서 숨을 고르고 가요.'), rest: 1, chest: 1, pool: 1, w: 12, h: 11 },
  { name: T('사냥터의 심장'), line: T('"왕의 명령이다. 이 숲을 지나간 자는 아무도 없다."'), boss: 1 }
], [{ name: T('사냥꾼의 석상 터'), line: T('석상 넷이 모두 가운데 문양을 바라보게 돌려요.'), puz: 'statues', w: 16, h: 13 }, { name: T('빛이 닿지 않는 덤불'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('돌 발판 숲길'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }]));
CHAPTERS[2].map = genMap(9137, grow(2, [
  { name: T('물에 잠긴 정문'), line: T('종소리가 물속에서 울려요.'), w: 12, h: 12, water: 1 },
  { name: T('세례당'), line: T('물에 빠진 수도사들이 아직 기도하고 있어요.'), foes: { skel: 5, archer: 2 }, water: 1 },
  { name: T('무너진 회랑'), line: T('물의 시종들이 물빛 구슬을 던져요.'), foes: { skel: 4, archer: 3, shield: 1 }, traps: 3, pil: 1 },
  { name: T('젖은 도서관'), line: T('서약의 기록이 물에 번져 있어요.'), foes: { skel: 3, archer: 3, shield: 2 }, altar: 1 },
  { name: T('수도사 숙소'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('종탑 아래'), line: T('종지기들이 커다란 종을 방패처럼 들고 있어요.'), foes: { skel: 4, shield: 3, archer: 1 }, water: 1, traps: 2 },
  { name: T('납골당'), line: T('수도원 파수꾼이 납골당 문을 지켜요.'), foes: { elite: 1, skel: 4, archer: 2 }, altar: 1, pil: 1 },
  { name: T('성가대석'), line: T('젖은 의자 사이에서 숨을 고르고 가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('잠긴 대성당'), line: T('"서약은 물에 씻겨 사라졌다. 너희 기도도 마찬가지다."'), boss: 1, water: 1 }
], [{ name: T('촛대 성가실'), line: T('비석에 그려진 순서대로 화로에 불을 붙여요. 틀리면 모두 꺼져요.'), puz: 'braziers', w: 16, h: 13 }, { name: T('물 밑 지하실'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('성인 석상 회랑'), line: T('석상 넷이 모두 가운데 문양을 바라보게 돌려요.'), puz: 'statues', w: 16, h: 13 }]), { flip: 1 });
CHAPTERS[3].map = genMap(5521, grow(3, [
  { name: T('탑 아래 성문'), line: T('잿빛 구름 아래, 탑의 문이 열려 있어요.'), w: 12, h: 12 },
  { name: T('무너진 병영'), line: T('한때 함께 싸우던 동료들이 재의 기사가 되어 서 있어요.'), foes: { skel: 6, archer: 2 } },
  { name: T('사슬 다리'), line: T('석궁병들이 다리 위를 겨누고 있어요.'), foes: { skel: 4, archer: 3, shield: 1 }, traps: 4 },
  { name: T('무기 창고'), line: T('탑 방패병이 창고를 지켜요.'), foes: { skel: 3, archer: 2, shield: 2 }, altar: 1, pil: 1 },
  { name: T('맹세의 방'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('불타는 회랑'), line: T('바닥이 뜨거워요. 덫을 조심해요.'), foes: { skel: 5, archer: 3, shield: 2 }, traps: 3 },
  { name: T('근위대 대기실'), line: T('왕의 근위 기사 두 명이 문 앞에 서 있어요.'), foes: { elite: 2, skel: 3, archer: 2 }, altar: 1, pil: 1 },
  { name: T('왕좌 앞 계단'), line: T('마지막 모닥불이에요. 숨을 고르고 올라가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('왕좌의 방'), line: T('"서약이란 지키는 자를 묶는 사슬일 뿐이다."'), boss: 1 }
], [{ name: T('맹세의 발판'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }, { name: T('그림자 계단'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('왕의 석상 홀'), line: T('석상 넷이 모두 가운데 문양을 바라보게 돌려요.'), puz: 'statues', w: 16, h: 13 }]));
CHAPTERS[4].map = genMap(7717, grow(4, [
  { name: T('눈 덮인 관문'), line: T('눈보라 너머로 얼어붙은 요새가 보여요.'), w: 12, h: 12 },
  { name: T('얼어붙은 연병장'), line: T('형제단 기사들이 얼음 속에서 깨어나요.'), foes: { skel: 6, archer: 2 } },
  { name: T('얼음 성벽'), line: T('서리 궁수들이 성벽 위에서 겨누고 있어요.'), foes: { skel: 4, archer: 4, shield: 1 }, traps: 3 },
  { name: T('무너진 망루'), line: T('얼음 방패병이 망루 아래를 막고 있어요.'), foes: { skel: 3, archer: 2, shield: 3 }, altar: 1, pil: 1 },
  { name: T('형제단 식당'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('서리 회랑'), line: T('바닥이 미끄럽고 얼음 덫이 숨어 있어요.'), foes: { skel: 5, archer: 3, shield: 2 }, traps: 4 },
  { name: T('형제단장의 방'), line: T('서리 형제단장이 마지막 문을 지켜요.'), foes: { elite: 1, skel: 4, archer: 2, shield: 1 }, altar: 1, pil: 1 },
  { name: T('얼어붙은 예배실'), line: T('얼음 속에서도 꺼지지 않는 촛불이 있어요. 숨을 고르고 가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('얼음 왕좌'), line: T('"추위보다 차가운 것은 지키지 못한 서약이다."'), boss: 1 }
], [{ name: T('얼어붙은 화로'), line: T('비석에 그려진 순서대로 화로에 불을 붙여요. 틀리면 모두 꺼져요.'), puz: 'braziers', w: 16, h: 13 }, { name: T('눈 덮인 지하 창고'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('얼음 발판'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }]));
CHAPTERS[5].map = genMap(3089, grow(5, [
  { name: T('광산 입구'), line: T('녹슨 수레가 입구를 막고 있어요.'), w: 12, h: 12 },
  { name: T('첫 번째 갱도'), line: T('해골 광부들이 아직도 곡괭이를 휘둘러요.'), foes: { skel: 6, archer: 2 } },
  { name: T('수레 선로'), line: T('곡괭이를 던지는 광부들이 선로 위에 있어요.'), foes: { skel: 4, archer: 4, shield: 1 }, traps: 3 },
  { name: T('무너진 채굴장'), line: T('바위 거인이 무너진 돌 사이에서 일어나요.'), foes: { skel: 3, archer: 2, shield: 3 }, altar: 1, pil: 1 },
  { name: T('광부 쉼터'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('지하 물웅덩이'), line: T('갱도에 물이 고여 있어요. 덫을 조심해요.'), foes: { skel: 5, archer: 3, shield: 2 }, traps: 3, water: 1 },
  { name: T('감독관실'), line: T('광산 감독이 장부를 든 채 문을 지켜요.'), foes: { elite: 1, skel: 4, archer: 2, shield: 1 }, altar: 1, pil: 1 },
  { name: T('검은 돌 창고'), line: T('검은 돌이 희미하게 빛나요. 숨을 고르고 가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('가장 깊은 갱도'), line: T('"돌은 배고프다. 너희 서약도 먹어 치우겠다."'), boss: 1 }
], [{ name: T('광부 석상 갱도'), line: T('석상 넷이 모두 가운데 문양을 바라보게 돌려요.'), puz: 'statues', w: 16, h: 13 }, { name: T('불 꺼진 갱도'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('용광로 화로'), line: T('비석에 그려진 순서대로 화로에 불을 붙여요. 틀리면 모두 꺼져요.'), puz: 'braziers', w: 16, h: 13 }]), { flip: 1 });
CHAPTERS[6].map = genMap(6151, grow(6, [
  { name: T('모래 계단'), line: T('뜨거운 모래바람 사이로 붉은 사원이 보여요.'), w: 12, h: 12 },
  { name: T('순례자의 뜰'), line: T('불꽃 신도들이 맨발로 달려들어요.'), foes: { skel: 6, archer: 2 } },
  { name: T('불꽃 기도실'), line: T('재 사제들이 불덩이를 던져요.'), foes: { skel: 4, archer: 4, shield: 1 }, traps: 3, pil: 1 },
  { name: T('향로의 방'), line: T('향로지기들이 연기 속에 숨어 있어요.'), foes: { skel: 3, archer: 2, shield: 3 }, altar: 1 },
  { name: T('사제 숙소'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('타오르는 회랑'), line: T('벽 틈에서 불이 새어 나와요. 덫을 조심해요.'), foes: { skel: 5, archer: 3, shield: 2 }, traps: 4 },
  { name: T('수호기사의 문'), line: T('사원 수호기사가 성소 앞을 막아요.'), foes: { elite: 1, skel: 4, archer: 2, shield: 1 }, altar: 1, pil: 1 },
  { name: T('그늘진 우물'), line: T('사원에서 유일하게 시원한 곳이에요. 숨을 고르고 가요.'), rest: 1, chest: 1, pool: 1, w: 12, h: 11 },
  { name: T('불꽃의 성소'), line: T('"불은 거짓말하지 않는다. 모든 것을 똑같이 태울 뿐."'), boss: 1 }
], [{ name: T('순례자의 발판'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }, { name: T('연기 가득한 지하 사당'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('불꽃 화로 제단'), line: T('비석에 그려진 순서대로 화로에 불을 붙여요. 틀리면 모두 꺼져요.'), puz: 'braziers', w: 16, h: 13 }]));
CHAPTERS[7].map = genMap(8263, grow(7, [
  { name: T('끝없는 계단'), line: T('아래에서 보랏빛 바람이 올라와요.'), w: 12, h: 12 },
  { name: T('깨진 서약의 무덤'), line: T('서약을 어긴 기사들이 심연에 묶여 있어요.'), foes: { skel: 6, archer: 2 } },
  { name: T('떠 있는 다리'), line: T('심연 석궁병들이 다리 끝을 겨누고 있어요.'), foes: { skel: 4, archer: 4, shield: 1 }, traps: 4 },
  { name: T('재의 숲'), line: T('타 버린 나무 사이로 심연 방패병이 서 있어요.'), foes: { skel: 3, archer: 3, shield: 3 }, altar: 1, pil: 1 },
  { name: T('마지막 쉼터'), line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('불타는 강'), line: T('바닥 아래로 불의 강이 흘러요. 덫을 조심해요.'), foes: { skel: 5, archer: 3, shield: 2 }, traps: 4 },
  { name: T('맹세자의 제단'), line: T('심연의 맹세자 둘이 제단을 지켜요.'), foes: { elite: 2, skel: 3, archer: 2 }, altar: 1, pil: 1 },
  { name: T('불씨의 문'), line: T('문 너머에서 심장 뛰는 소리가 들려요. 숨을 고르고 가요.'), rest: 1, chest: 1, w: 12, h: 11 },
  { name: T('심연의 바닥'), line: T('"서약하라. 그러면 영원히 타오르게 해 주마."'), boss: 1 }
], [{ name: T('깨진 서약 석상'), line: T('석상 넷이 모두 가운데 문양을 바라보게 돌려요.'), puz: 'statues', w: 16, h: 13 }, { name: T('빛을 삼키는 구덩이'), line: T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), dark: 1, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 }, { name: T('심연의 발판'), line: T('바닥에 발판 네 개가 있어요. 모두 하나씩 올라서면 창살문이 열려요.'), puz: 'plates', w: 16, h: 13 }]), { flip: 1 });
export const CHAPTER1 = CHAPTERS[0];

// 비밀 방의 옛 기록: 장마다 두 개, 하나에 두 줄
export const LORE = [
  [[T('기사단을 세운 첫 단장은 서약을 돌에 새기지 않았다.'), T('"서약은 지키는 사람의 가슴에 새기는 것이다."')], [T('단장의 일기 마지막 장: "왕이 불꽃을 보여 주었다. 거절하지 못했다."'), T('일기 끝에는 지워진 이름 네 개가 적혀 있었다.')]],
  [[T('사냥꾼들의 규칙: 새끼를 밴 짐승은 쏘지 않는다.'), T('베른은 왕의 명령으로 그 규칙을 처음 어겼다고 적었다.')], [T('나무 밑동에 새겨진 글: "숲은 기억한다. 재가 되어도."'), T('그 옆에 작은 늑대 발자국이 찍혀 있었다.')]],
  [[T('수도원의 첫 기도문: "불꽃은 빌리는 것이지 갖는 것이 아니다."'), T('대주교의 손으로 그 문장에 줄이 그어져 있었다.')], [T('젖은 장부에 적힌 이름들은 모두 이 수도원에서 서약한 기사들이었다.'), T('맨 아래 줄에 네 사람의 이름도 있었다.')]],
  [[T('왕의 어린 시절 초상화가 벽을 보고 뒤집혀 있었다.'), T('뒷면에는 "두려움을 이기는 왕이 되겠다"라고 적혀 있었다.')], [T('근위 기사의 편지: "왕은 밤마다 불꽃에게 말을 건다."'), T('"불꽃이 대답한다고 했다. 북쪽에서 왔다고."')]],
  [[T('형제단의 맹세판: "추위가 와도 불을 나누어 쓴다."'), T('하랄드는 그 불을 혼자 품었다.')], [T('얼음 속에 갇힌 편지: "형님, 불꽃이 따뜻하지 않아요."'), T('편지를 쓴 사람의 이름은 얼어서 읽을 수 없었다.')]],
  [[T('광부들의 노래: "검은 돌은 캐지 마라, 깨어나면 배고프다."'), T('그 아래 감독의 글씨로 "생산량 두 배"라고 적혀 있었다.')], [T('그롬의 작업 일지: "돌을 삼키면 힘이 난다. 배는 고프지 않다."'), T('마지막 장은 이빨 자국으로 찢겨 있었다.')]],
  [[T('사원 벽화: 불꽃 앞에 무릎 꿇은 왕, 하랄드, 그리고 세라핀.'), T('네 번째 자리는 비어 있었다. 누구를 기다리는 자리였을까.')], [T('세라핀의 어린 시절 기도: "모두가 따뜻하게 해 주세요."'), T('기도는 언젠가부터 "모두 태워 주세요"로 바뀌어 있었다.')]],
  [[T('심연의 벽에 새겨진 수천 개의 서약. 모두 반쯤 지워져 있었다.'), T('지키지 못한 서약은 이렇게 불꽃의 먹이가 되었다.')], [T('가장 오래된 서약 하나만 또렷하게 남아 있었다.'), T('"끝까지 서로를 지킨다." 기사단 첫 단장의 글씨였다.')]]
];

// 합동기: 두 동료가 1초 안에 짝이 맞는 기술을 같이 쓰면 터져요
export const COMBOS = [
  { id: 'lightdash', name: T('빛의 돌진'), a: 'dash', b: 'ward', desc: T('기사 돌진 + 사제 보호막: 지나간 길에 빛이 터지고 기사에게 큰 보호막') },
  { id: 'sanct', name: T('성역의 외침'), a: 'taunt', b: 'heal', desc: T('기사 외침 + 사제 치유: 주변 동료를 더 치유하고 적에게 빛 피해') },
  { id: 'wall', name: T('방패진'), a: 'block', b: 'rally', desc: T('기사 막기 + 종자 함성: 주변 동료 모두에게 큰 보호막') },
  { id: 'firerain', name: T('불화살비'), a: 'rain', b: 'potion', desc: T('궁수 화살비 + 종자 물약: 화살비가 불타며 두 배로 아파요') },
  { id: 'net', name: T('사냥꾼의 그물'), a: 'mark', b: 'trap', desc: T('궁수 약점 표시 + 종자 덫: 표시한 적 둘레를 모두 묶어요') }
];

// 끝없는 심연: 8장을 깨면 열려요. 층마다 무작위 구역과 저주가 하나씩 쌓여요
export const CURSES = [
  { id: 'hp', name: T('두꺼운 뼈'), desc: T('적 체력 +20%') },
  { id: 'dmg', name: T('날 선 무기'), desc: T('적 공격 +15%') },
  { id: 'spd', name: T('서두르는 발'), desc: T('적 이동 속도 +10%') },
  { id: 'heal', name: T('마른 샘'), desc: T('받는 회복 -25%') },
  { id: 'cd', name: T('무거운 손'), desc: T('기술 대기 시간 +15%') },
  { id: 'elite', name: T('대장의 귀환'), desc: T('층마다 적 대장 한 명 더') },
  { id: 'boss', name: T('질긴 수호자'), desc: T('층 수호자 체력 +30%') }
];
export const DEEP = { floor: 1, seed: 1, curses: [] };
const DEEP_NAMES = [[T('무너진 계단'), T('뼈의 방'), T('녹슨 제단'), T('꺼진 화로'), T('함정 회랑'), T('수호자의 방')], [T('잿빛 오솔길'), T('늑대 굴'), T('사냥꾼 야영지'), T('버려진 오두막'), T('가시밭'), T('수호자의 숲')], [T('물에 잠긴 문'), T('기도실'), T('종탑 아래'), T('젖은 서고'), T('납골당'), T('수호자의 성당')], [T('탑 계단'), T('병영'), T('무기 창고'), T('맹세의 방'), T('불타는 복도'), T('수호자의 왕좌')], [T('눈 덮인 문'), T('얼음 연병장'), T('서리 성벽'), T('얼음 식당'), T('서리 회랑'), T('수호자의 얼음 방')], [T('광산 입구'), T('갱도'), T('수레 선로'), T('광부 쉼터'), T('무너진 채굴장'), T('수호자의 갱도')], [T('모래 계단'), T('순례자의 뜰'), T('향로의 방'), T('사제 숙소'), T('타오르는 회랑'), T('수호자의 성소')], [T('끝없는 계단'), T('서약의 무덤'), T('떠 있는 다리'), T('불씨 쉼터'), T('불타는 강'), T('수호자의 바닥')]];
// 층 하나 만들기: 모양은 층마다 바뀌는 장(1~8장)을 빌려 와요. 같은 층·씨앗이면 늘 같은 지도예요
// 끝없는 심연만의 지도 짜임: 둥근 방이 구불구불한 좁은 다리로 이어져요
const DEEP_ST = { cols: 3, cw: 3, round: 3, jit: 3, zig: 1, sc: 1.05 };
export function makeDeep(d) {
  Object.assign(DEEP, d); const f = DEEP.floor, src = (f - 1 + (DEEP.seed % 8)) % 8, C = CHAPTERS[src], n = c => DEEP.curses.filter(x => x === c).length, N = DEEP_NAMES[src];
  const line = T('심연 {0}층 · 저주 {1}개', f, DEEP.curses.length);
  const map = genMap(DEEP.seed * 31 + f * 977, [
    { name: N[0], line, w: 12, h: 12 },
    { name: N[1], line, foes: { skel: 5, archer: 2 } },
    { name: N[6] || T('떠도는 돌길'), line, foes: { skel: 4, archer: 2, shield: 1 }, traps: 2 },
    { name: N[2], line: f % 2 ? line : T('불빛 하나 없는 방이에요. 입구의 횃불을 들어야 앞이 보여요.'), foes: { skel: 4, archer: 3, shield: 2 }, altar: 1, pil: 1, dark: f % 2 ? 0 : 1, t: f % 2 ? undefined : 'dark' },
    { name: N[3], line: T('꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.'), rest: 1, chest: 1, w: 12, h: 11 },
    { name: N[4], line, foes: { elite: 1 + n('elite'), skel: 4, archer: 2, shield: 2 }, traps: 3 },
    { name: N[5], line: T('"더 내려가고 싶다면, 나를 넘어라."'), boss: 1 }
  ], { noSecret: 1, flip: f % 2, st: DEEP_ST });
  const B = C.boss;
  return {
    id: 9, deep: 1, src, title: T('끝없는 심연 · {0}층', f), place: T('끝없는 심연'), diff: 1.2 + 0.06 * (f - 1), introT: 7,
    intro: [f === 1 ? T('불씨가 꺼진 심연 아래로, 아무도 끝을 본 적 없는 계단이 이어져 있었다.') : T('네 사람은 더 깊이 내려갔다.'), T('심연 {0}층. 쌓인 저주: {1}', f, DEEP.curses.length ? DEEP.curses.map(c => CURSES.find(x => x.id === c).name).join(', ') : T('없음'))],
    outro: [T('{0}층을 지났다.', f), T('아래에서 더 차가운 바람이 올라왔다.')],
    boss: Object.assign({}, B, { name: T('심연의 {0}', B.name), hp: Math.round(B.hp * 0.45 * (1 + 0.1 * (f - 1)) * (1 + 0.3 * n('boss'))) }),
    curse: { hp: 1 + 0.2 * n('hp'), dmg: 1 + 0.15 * n('dmg'), spd: 1 + 0.1 * n('spd'), heal: Math.pow(0.75, n('heal')), cd: 1 + 0.15 * n('cd') },
    theme: 'deep', map
  };
}
export const DEEP_I = 8;
// 주간 원정: 이번 주(한국 시간 기준 월요일 시작) 모두 같은 장, 같은 저주 둘로 달려요. 끝까지 걸린 시간을 겨뤄요
export const WEEKLY = { on: false, id: '', curses: [] };
export function cursesObj(ids) { const n = c => ids.filter(x => x === c).length; return { hp: 1 + 0.2 * n('hp'), dmg: 1 + 0.15 * n('dmg'), spd: 1 + 0.1 * n('spd'), heal: Math.pow(0.75, n('heal')), cd: 1 + 0.15 * n('cd') }; }
export function weekInfo(now = Date.now()) {
  const k = new Date(now + 9 * 3600e3), day = (k.getUTCDay() + 6) % 7, mon = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() - day), th = new Date(mon + 3 * 86400e3), y = th.getUTCFullYear();
  const w1 = new Date(Date.UTC(y, 0, 4)), n = 1 + Math.round((th - w1 + ((w1.getUTCDay() + 6) % 7 - 3) * 86400e3) / (7 * 86400e3)), seed = y * 100 + n;
  const pool = ['hp', 'dmg', 'spd', 'heal', 'cd'], a = seed % 5, b = (a + 1 + Math.floor(seed / 5) % 4) % 5;
  return { id: y + '년 ' + n + '주', ch: seed % 8, curses: [pool[a], pool[b]], end: mon + 7 * 86400e3 - 9 * 3600e3 };
}
// 깃발이 드러났는지: 비밀 방이 열렸거나, 수수께끼를 풀었거나, 어둠의 방이면 늘 (sc = 비밀 방 열림 목록, pd = 수수께끼 풀림 목록)
export function flagShown(sc, pd) { const F = MAP.flag; if (!F) return false; return F[2] === 'd' ? true : F[2] === 'p' ? !!pd[F[3]] : !!sc[F[3]]; }

// 지금 고른 장의 지도. map.js의 useChapter로 바꿔요
export const MAP = {};
export let CH = CHAPTERS[0];
export function setChapterData(i) {
  if (i === DEEP_I) { CH = makeDeep({}); FOES[DEEP_I] = FOES[CH.src]; TALK[DEEP_I] = {}; }
  else if (WEEKLY.on) { const C0 = CHAPTERS[i] || CHAPTERS[0]; CH = Object.assign({}, C0, { title: T('주간 원정 · {0}', C0.title), curse: cursesObj(WEEKLY.curses) }); }
  else CH = CHAPTERS[i] || CHAPTERS[0];
  for (const k of Object.keys(MAP)) delete MAP[k];
  Object.assign(MAP, CH.map);
  // 비밀 방 상자는 상자 목록 끝에 붙여요 (세 번째 값 = 비밀 방 번호 + 1), 옛 기록 돌
  MAP.secrets = MAP.secrets || [];
  MAP.chests = MAP.chests.concat(MAP.secrets.map((q, k) => [q.chest[0], q.chest[1], k + 1]));
  MAP.lores = MAP.secrets.map((q, k) => [q.lore[0], q.lore[1], k]);
  // 기사단 깃발 (심연에는 없어요). 장마다 숨은 곳이 달라요: 금 간 벽 뒤 비밀 방 / 수수께끼를 풀면 솟는 벽감 / 어둠의 방 구석 벽감
  // [x, y, 종류, 번호] 종류 's' = 비밀 방 번호, 'p' = 수수께끼 번호, 'd' = 어둠의 방 (늘 열려 있어요)
  const fq = !CH.deep && MAP.secrets.length > 1 && MAP.secrets[MAP.secrets.length - 1], NI = MAP.niches || {}, fk = ['s', 'p', 'd'][i % 3];
  MAP.flag = CH.deep ? null : fk === 'p' && NI.p && NI.p[2] >= 0 ? [NI.p[0], NI.p[1], 'p', NI.p[2]] : fk === 'd' && NI.d ? [NI.d[0], NI.d[1], 'd', 0] : fq && fq.flag ? [fq.flag[0], fq.flag[1], 's', MAP.secrets.length - 1] : null;
  return CH;
}
setChapterData(0);

export const ACHIEVEMENTS = [
  { id: 'first', name: T('첫 원정'), desc: T('원정을 처음 시작해요.') },
  { id: 'room1', name: T('첫 승리'), desc: T('처음으로 적을 쓰러뜨려요.') },
  { id: 'rest', name: T('모닥불 곁에서'), desc: T('모닥불에 처음 불을 붙여요.') },
  { id: 'elite', name: T('대장 격파'), desc: T('장마다 있는 적 대장을 쓰러뜨려요.') },
  { id: 'boss', name: T('서약을 지킨 자'), desc: T('몰락한 기사단장을 쓰러뜨려요.') },
  { id: 'parry', name: T('완벽한 막기'), desc: T('기사로 보스 돌진을 받아쳐 기절시켜요.') },
  { id: 'pdodge', name: T('종이 한 장 차이'), desc: T('공격이 닿기 직전에 굴러서 피해요.') },
  { id: 'revive', name: T('일으켜 세우기'), desc: T('쓰러진 동료를 일으켜요.') },
  { id: 'friends', name: T('함께하는 원정'), desc: T('친구와 같은 방에서 원정을 떠나요.') },
  { id: 'ch2', name: T('잿빛 숲을 지나'), desc: T('2장에서 가시관의 사냥꾼 베른을 쓰러뜨려요.') },
  { id: 'ch3', name: T('불꽃을 되찾다'), desc: T('3장에서 익사한 대주교 오드릭을 쓰러뜨려요.') },
  { id: 'ch4', name: T('왕관을 깨다'), desc: T('4장에서 잿빛 왕을 쓰러뜨려요.') },
  { id: 'ch5', name: T('얼음을 녹이다'), desc: T('5장에서 서리 맹세의 하랄드를 쓰러뜨려요.') },
  { id: 'ch6', name: T('돌의 근원'), desc: T('6장에서 돌을 삼킨 거인 그롬을 쓰러뜨려요.') },
  { id: 'ch7', name: T('거짓 예언'), desc: T('7장에서 불꽃의 예언자 세라핀을 쓰러뜨려요.') },
  { id: 'ch8', name: T('서약을 지킨 자들'), desc: T('8장에서 꺼지지 않는 불꽃을 꺼뜨려요.') },
  { id: 'secret', name: T('무너진 벽 너머'), desc: T('금 간 벽을 부수고 비밀 방을 찾아요.') },
  { id: 'lore', name: T('옛 기록을 모은 자'), desc: T('비밀 방의 옛 기록 16개를 모두 읽어요.') },
  { id: 'flag1', name: T('깃발을 지킨 자'), desc: T('기사단 깃발을 든 채 장을 끝내요.') },
  { id: 'flags', name: T('기사단의 벽'), desc: T('여덟 장의 기사단 깃발을 모두 로비 벽에 걸어요.') },
  { id: 'combo', name: T('함께 쓰는 기술'), desc: T('동료와 합동기를 처음 써요.') },
  { id: 'combo5', name: T('다섯 가지 합동기'), desc: T('합동기 다섯 가지를 모두 써 봐요.') },
  { id: 'deep5', name: T('심연 5층'), desc: T('끝없는 심연에서 5층까지 내려가요.') },
  { id: 'deep10', name: T('심연 10층'), desc: T('끝없는 심연에서 10층까지 내려가요.') },
  { id: 'mimic', name: T('이빨 달린 상자'), desc: T('상자인 척하던 미믹을 쓰러뜨려요.') },
  { id: 'puzzle', name: T('첫 수수께끼'), desc: T('수수께끼 방의 창살문을 처음 열어요.') },
  { id: 'puzzle10', name: T('수수께끼 장인'), desc: T('수수께끼를 10개 풀어요.') },
  { id: 'torch', name: T('어둠 속 횃불'), desc: T('어둠의 방에서 횃불을 들어요.') },
  { id: 'escape', name: T('빠른 보스 사냥'), desc: T('보스 방에 들어간 뒤 3분 안에 보스를 쓰러뜨려요.') },
  { id: 'bridge', name: T('기둥 다리'), desc: T('금 간 기둥을 쓰러뜨려 끊어진 길을 이어요.') },
  { id: 'lift', name: T('도르래 일꾼'), desc: T('모두 함께 승강기로 위층에 올라가요.') },
  { id: 'nodown', name: T('한 번도 안 쓰러짐'), desc: T('한 번도 쓰러지지 않고 한 장을 깨요.') },
  { id: 'all4', name: T('네 가지 서약'), desc: T('네 역할로 모두 한 장 이상 깨요.') }
];

// 갈림길 중간 보스 (장마다 이름이 달라요): 첫째는 돌격형, 둘째는 부하를 부르는 소환형
export const MIDB = [
  [T('무덤 파수꾼'), T('뼈 소환사')], [T('분노한 늑대왕'), T('숲의 주술사')], [T('종탑 집행자'), T('물의 사제')], [T('철갑 문지기'), T('탑의 연금술사')],
  [T('서리 창기병'), T('눈보라 마녀')], [T('광산 감독관'), T('갱도 주술사')], [T('성소 수호기사'), T('향로의 사제')], [T('심연의 사냥개'), T('그림자 소환자')]
];
export const GEAR_TIERS = ['낡은', '쓸만한', '명장의'];
export const GEAR_COST = [0, 120, 320];
// 겉모습 꾸미기: 능력치는 그대로, vC로 사서 모든 역할에 입혀요
export const COSMETICS = {
  cape: { name: T('망토 색'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'crimson', name: T('진홍'), cost: 240, col: 0xa02030 }, { id: 'forest', name: T('숲 녹색'), cost: 240, col: 0x2f6a3a }, { id: 'violet', name: T('보랏빛'), cost: 360, col: 0x6a3a9a }, { id: 'dawn', name: T('새벽 금빛'), cost: 640, col: 0xd4a63a }] },
  helm: { name: T('투구 장식'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'plume', name: T('붉은 깃털'), cost: 320 }, { id: 'horns', name: T('뼈 뿔'), cost: 400 }, { id: 'wreath', name: T('월계관'), cost: 480 }, { id: 'crown', name: T('작은 왕관'), cost: 880 }] },
  emblem: { name: T('방패 문장'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'cross', name: T('십자'), cost: 280 }, { id: 'star', name: T('별'), cost: 360 }, { id: 'flame', name: T('불꽃'), cost: 440 }, { id: 'moon', name: T('달'), cost: 560 }] },
  skin: { name: T('갑옷 스킨'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'dark', name: T('흑철'), cost: 800, col: 0x2a2e3a, shield: 0x1a1c24 }, { id: 'snow', name: T('설원'), cost: 800, col: 0xdfe8f4, shield: 0x9ab4d8 }, { id: 'ruby', name: T('진홍 갑주'), cost: 1000, col: 0xa8242c, shield: 0x701820 }, { id: 'gold', name: T('황금 갑주'), cost: 2400, col: 0xe0b840, shield: 0xb08820 }] },
  aura: { name: T('움직이는 오라'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'ember', name: T('떠도는 불씨'), cost: 1200 }, { id: 'frost', name: T('서리 결정'), cost: 1500 }, { id: 'spirit', name: T('푸른 영혼불'), cost: 1800 }, { id: 'moon', name: T('달빛 후광'), cost: 2200 }] },
  wings: { name: T('움직이는 날개'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'angel', name: T('천사 날개'), cost: 3000 }, { id: 'flame', name: T('불꽃 날개'), cost: 3400 }, { id: 'shadow', name: T('그림자 날개'), cost: 3600 }] }
};
export const GEAR_BONUS = { weapon: [0, 0.1, 0.22], armor: [0, 15, 35] };
export function roleLevel(xp) { return Math.min(10, 1 + Math.floor(Math.sqrt((xp || 0) / 25))); }

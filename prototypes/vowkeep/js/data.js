// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 데이터: 역할, 적, 축복, 1장 지도

export const VERSION = 'v0.1', BUILD = 15;

export const ROLES = {
  knight: {
    name: '기사', color: '#3f6fd0', hp: 170, speed: 6.0,
    atk: { kind: 'melee', range: 2.5, arc: 1.9, dmg: 18, cd: 0.45 },
    skills: [
      { id: 'block', name: '막기', key: 'Q', cd: 5, desc: '1.2초 동안 방패를 들어 앞에서 오는 피해를 70% 줄여요. 처음 0.4초 안에 보스 돌진을 받으면 보스가 기절해요.' },
      { id: 'dash', name: '돌진', key: 'E', cd: 6, desc: '앞으로 돌진하며 부딪힌 적에게 30 피해를 주고 밀쳐 내요.' },
      { id: 'taunt', name: '외침', key: 'R', cd: 12, desc: '주변 적이 4초 동안 나만 노리고, 그동안 받는 피해가 30% 줄어요.' }
    ],
    role: '앞에서 적을 끌어모으고 막아요.'
  },
  archer: {
    name: '궁수', color: '#5a9a4e', hp: 105, speed: 6.4,
    atk: { kind: 'arrow', dmg: 13, cd: 0.36, speed: 26 },
    skills: [
      { id: 'pierce', name: '관통 화살', key: 'Q', cd: 5, desc: '적을 꿰뚫고 날아가는 강한 화살이에요. 45 피해.' },
      { id: 'rain', name: '화살비', key: 'E', cd: 9, desc: '조준한 곳에 1.5초 동안 화살비를 내려요.' },
      { id: 'mark', name: '약점 표시', key: 'R', cd: 12, desc: '조준한 적에게 6초 동안 표시를 남겨 모두의 피해가 50% 늘어요.' }
    ],
    role: '멀리서 약점을 쏴요.'
  },
  priest: {
    name: '사제', color: '#e8e4ef', hp: 115, speed: 6.0,
    atk: { kind: 'orb', dmg: 11, cd: 0.5, speed: 16 },
    skills: [
      { id: 'heal', name: '치유', key: 'Q', cd: 7, desc: '나와 주변 동료의 체력을 35 회복해요.' },
      { id: 'ward', name: '보호막', key: 'E', cd: 14, desc: '주변 동료에게 5초 동안 피해 25를 막는 보호막을 씌워요.' },
      { id: 'raise', name: '부활의 빛', key: 'R', cd: 30, desc: '주변에 쓰러진 동료를 체력 40%로 바로 일으켜요.' }
    ],
    role: '회복과 보호막으로 동료를 지켜요.'
  },
  squire: {
    name: '종자', color: '#d0543a', hp: 125, speed: 6.8,
    atk: { kind: 'melee', range: 2.1, arc: 1.6, dmg: 12, cd: 0.4, burn: true },
    skills: [
      { id: 'potion', name: '물약 던지기', key: 'Q', cd: 8, desc: '조준한 곳에 물약을 던져 그 자리 동료의 체력을 30 회복해요.' },
      { id: 'trap', name: '덫 놓기', key: 'E', cd: 8, desc: '발밑에 덫을 놓아 밟은 적을 2초 묶고 25 피해를 줘요.' },
      { id: 'rally', name: '함성', key: 'R', cd: 18, desc: '주변 동료의 공격력과 속도를 6초 동안 30% 올려요.' }
    ],
    role: '물약과 덫으로 돕고, 바닥 함정을 밟아도 다치지 않고 해체해요.'
  }
};
export const ROLE_IDS = ['knight', 'archer', 'priest', 'squire'];

export const ENEMIES = {
  skel: { name: '해골 병사', hp: 130, speed: 4.4, r: 0.6, dmg: 32, range: 1.8, windup: 0.42, cd: 0.9, honor: 1 },
  archer: { name: '해골 궁수', hp: 85, speed: 3.9, r: 0.6, dmg: 25, range: 12, windup: 0.55, cd: 1.6, keep: 7.5, honor: 1 },
  shield: { name: '방패 해골', hp: 230, speed: 3.5, r: 0.7, dmg: 36, range: 1.9, windup: 0.5, cd: 1.3, front: 0.3, honor: 2 },
  elite: { name: '해골 근위대장', hp: 900, speed: 4.2, r: 0.9, dmg: 52, range: 2.5, windup: 0.55, cd: 1.3, charge: true, honor: 6 },
  boss: { name: '몰락한 기사단장', hp: 16000, speed: 3.9, r: 1.4, dmg: 55, honor: 0 }
};

export const BLESSINGS = [
  { id: 'blade', name: '날카로운 칼날', desc: '공격 피해 +15%' },
  { id: 'feet', name: '가벼운 발', desc: '이동 속도 +12%' },
  { id: 'armor', name: '단단한 갑옷', desc: '최대 체력 +25' },
  { id: 'hands', name: '빠른 손', desc: '기본 공격 간격 -15%' },
  { id: 'focus', name: '기술 숙련', desc: '기술 대기 시간 -15%' },
  { id: 'leech', name: '피의 서약', desc: '적을 맞힐 때마다 체력 1 회복' },
  { id: 'roll', name: '구르기 달인', desc: '구르기 대기 시간 -40%' },
  { id: 'fire', name: '불꽃 무기', desc: '기본 공격이 적을 태워요' },
  { id: 'thorn', name: '가시 갑옷', desc: '맞으면 때린 적에게 8 피해' },
  { id: 'bond', name: '전우애', desc: '동료를 두 배 빨리 일으켜요' },
  { id: 'last', name: '마지막 버팀', desc: '체력이 30% 아래면 받는 피해 -25%' },
  { id: 'honor', name: '명예의 길', desc: '이번 원정에서 받는 명예 +25%' }
];

const MAP1 = {
  w: 72, h: 76, cs: 2,
  // 바닥 (x, y, 너비, 높이)
  floors: [
    [30, 66, 12, 8], [34, 58, 4, 8], [24, 44, 24, 14], [14, 49, 10, 3], [4, 45, 10, 11], [48, 49, 8, 3], [56, 44, 12, 12],
    [60, 32, 4, 12], [22, 26, 44, 6], [57, 24, 4, 2], [54, 17, 10, 7], [18, 27, 4, 3], [4, 24, 14, 14], [9, 10, 4, 14], [13, 10, 13, 4], [26, 2, 24, 20]
  ],
  water: [[22, 26, 44, 6]],
  areas: [
    { name: '무너진 계단', line: '계단 아래에서 뼈 부딪히는 소리가 들려요.', r: [[30, 66, 12, 8], [34, 58, 4, 8]] },
    { name: '해골 병영', line: '기사단 병사였던 해골들이 잠들어 있어요. 가까이 가면 깨어나요.', r: [[24, 44, 24, 14], [48, 49, 8, 3]] },
    { name: '무기고', line: '녹슨 무기 사이에 오래된 제단이 있어요.', r: [[4, 45, 10, 11], [14, 49, 10, 3]] },
    { name: '버려진 예배당', line: '꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.', r: [[56, 44, 12, 12]], rest: 1 },
    { name: '물에 잠긴 회랑', line: '방패를 든 해골들이 물길을 지켜요. 바닥 함정을 조심해요.', r: [[22, 26, 44, 6], [60, 32, 4, 12]] },
    { name: '성물실', line: '기사단의 성물이 아직 남아 있어요.', r: [[54, 17, 10, 7], [57, 24, 4, 2]] },
    { name: '근위대 무덤', line: '단장의 근위대장이 아직 무덤을 지키고 있어요.', r: [[4, 24, 14, 14], [18, 27, 4, 3]] },
    { name: '단장의 길', line: '검은 불꽃의 열기가 느껴져요. 모닥불에서 숨을 고르고 가요.', r: [[9, 10, 4, 14], [13, 10, 13, 4]] },
    { name: '기사단장의 방', line: '"서약은 깨졌다. 너희도 여기서 무릎 꿇어라."', r: [[26, 2, 24, 20]], boss: 1 }
  ],
  start: [36, 70],
  spawns: [
    ['skel', 33, 54], ['skel', 38, 54], ['skel', 31, 49], ['skel', 35, 48], ['archer', 36, 45], ['shield', 41, 50], ['skel', 44, 51], ['skel', 39, 47], ['archer', 46, 45],
    ['archer', 6, 47], ['archer', 11, 47], ['shield', 8, 52], ['skel', 6, 54], ['skel', 11, 54],
    ['skel', 61, 37], ['skel', 62, 39],
    ['shield', 56, 29], ['archer', 51, 27], ['archer', 47, 31], ['skel', 44, 29], ['skel', 40, 28], ['archer', 34, 27], ['archer', 33, 31], ['shield', 28, 29], ['skel', 26, 28], ['skel', 25, 30],
    ['shield', 58, 21], ['archer', 56, 19], ['archer', 62, 19],
    ['elite', 10, 30], ['skel', 7, 27], ['skel', 14, 27], ['skel', 7, 34], ['skel', 14, 34], ['archer', 10, 36], ['shield', 12, 26],
    ['skel', 11, 18], ['archer', 20, 12], ['skel', 22, 11],
    // 더 어렵게: 무리를 늘리고 길목마다 매복을 둬요
    ['skel', 34, 51], ['archer', 31, 45], ['shield', 37, 51], ['skel', 49, 50], ['archer', 50, 51],
    ['skel', 8, 49], ['shield', 9, 55], ['skel', 60, 42], ['archer', 63, 33], ['skel', 52, 30], ['shield', 38, 29], ['archer', 29, 27],
    ['skel', 60, 20], ['shield', 9, 28], ['archer', 13, 37], ['skel', 11, 23], ['elite', 27, 12], ['archer', 25, 10], ['skel', 31, 13]
  ],
  boss: [38, 8], bossTrig: [27.5, 2, 22.5, 20],
  pillars: [[28, 47], [43, 47], [28, 54], [43, 54], [58, 54], [66, 54], [7, 30.5], [14, 30.5], [30, 5], [46, 5], [30, 18], [46, 18]],
  traps: [[54, 28], [48, 30], [42, 27], [36, 29], [30, 28], [45, 28.5], [36, 61], [11, 15]],
  fires: [[61, 50], [11, 12]],
  altars: [[8.5, 46], [58, 46], [59, 18], [5, 36]],
  chests: [[66, 46], [62, 22]],
  // 봇이 앞장설 때 따라가는 길
  route: [[36, 62], [36, 51], [52, 50.5], [61, 48], [62, 36], [62, 29], [44, 29], [24, 29], [20, 28.5], [11, 31], [11, 20], [11, 12], [22, 12], [32, 12], [38, 10]]
};

// 장마다 적의 이름·모습·능력치가 달라요 (규칙은 해골 병사·궁수·방패·근위대장 네 가지를 같이 써요)
// skin: 화면에 그릴 모습, proj: 원거리 적이 쏘는 것
export const FOES = [
  { skel: { name: '해골 병사', skin: 'skel' }, archer: { name: '해골 궁수', skin: 'skel' }, shield: { name: '방패 해골', skin: 'skel' }, elite: { name: '해골 근위대장', skin: 'skel' } },
  { skel: { name: '잿빛 늑대', skin: 'wolf', hp: 0.8, speed: 1.3, r: 0.75 }, archer: { name: '재 사냥꾼', skin: 'hunter', proj: 'spear' }, shield: { name: '껍질 거인', skin: 'treant', hp: 1.2, speed: 0.85, r: 0.9 }, elite: { name: '늑대 우두머리', skin: 'wolf', speed: 1.15 } },
  { skel: { name: '익사한 수도사', skin: 'monk', hp: 1.15, speed: 0.9 }, archer: { name: '물의 시종', skin: 'acolyte', proj: 'eorb', psp: 12 }, shield: { name: '종지기', skin: 'bellman' }, elite: { name: '수도원 파수꾼', skin: 'monkw' } },
  { skel: { name: '재의 기사', skin: 'ashknight', hp: 1.1 }, archer: { name: '재 석궁병', skin: 'xbow', proj: 'bolt', psp: 22 }, shield: { name: '탑 방패병', skin: 'ashshield' }, elite: { name: '왕의 근위 기사', skin: 'royal' } }
];

// 큰 지도 만들기: 방 9개를 세 줄로 지그재그 이어 붙여요. 같은 씨앗이면 늘 같은 지도예요
function genMap(seed, rooms, opt = {}) {
  let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const SW = 24, SH = 22, cols = 3, rowsN = Math.ceil(rooms.length / cols), w = SW * cols, h = SH * rowsN + 2;
  const m = { w, h, cs: 2, floors: [], water: [], areas: [], spawns: [], pillars: [], traps: [], fires: [], altars: [], chests: [], route: [] };
  const R = rooms.map((r, i) => {
    const row = Math.floor(i / cols), c0 = row % 2 ? cols - 1 - (i % cols) : i % cols, col = opt.flip ? cols - 1 - c0 : c0, sy = (rowsN - 1 - row) * SH + 1;
    const rw = r.boss ? 22 : r.w || 12 + Math.floor(rnd() * 7), rh = r.boss ? 20 : r.h || 10 + Math.floor(rnd() * 7);
    const x = col * SW + Math.floor((SW - rw) / 2), y = sy + Math.floor((SH - rh) / 2);
    return Object.assign({ x, y, rw, rh, cx: x + Math.floor(rw / 2), cy: y + Math.floor(rh / 2) }, r);
  });
  R.forEach((r, i) => {
    m.floors.push([r.x, r.y, r.rw, r.rh]);
    if (r.water) m.water.push([r.x, r.y, r.rw, r.rh]);
    if (r.pool) m.water.push([r.x + 1, r.y + r.rh - 5, 4, 4]);
    m.areas.push({ name: r.name, line: r.line, r: [[r.x, r.y, r.rw, r.rh]], rest: r.rest ? 1 : undefined, boss: r.boss ? 1 : undefined });
    if (i < R.length - 1) {
      const n = R[i + 1], x0 = Math.min(r.cx, n.cx), x1 = Math.max(r.cx, n.cx), y0 = Math.min(r.cy, n.cy), y1 = Math.max(r.cy, n.cy);
      m.floors.push([x0 - 2, r.cy - 2, x1 - x0 + 4, 4], [n.cx - 2, y0 - 2, 4, y1 - y0 + 4]);
      if (r.water && n.water) m.water.push([x0 - 2, r.cy - 2, x1 - x0 + 4, 4]);
    }
    // 기둥
    if (r.pil || r.boss) for (const [u, v] of [[0.22, 0.28], [0.78, 0.28], [0.22, 0.72], [0.78, 0.72]]) m.pillars.push([r.x + Math.round(r.rw * u), r.y + Math.round(r.rh * v)]);
    const free = (px, py) => !m.pillars.some(([a, b]) => Math.abs(a - px) < 2 && Math.abs(b - py) < 2) && Math.abs(px - r.cx) + Math.abs(py - r.cy) > 1.5;
    const spot = (pad = 2) => { for (let k = 0; k < 40; k++) { const px = r.x + pad + Math.floor(rnd() * (r.rw - pad * 2)), py = r.y + pad + Math.floor(rnd() * (r.rh - pad * 2)); if (free(px, py)) return [px, py]; } return [r.cx + 2, r.cy]; };
    for (const [k, n0] of Object.entries(r.foes || {})) for (let q = 0, n = k === 'elite' ? n0 : Math.round(n0 * 1.5); q < n; q++) { const [px, py] = spot(); m.spawns.push([k, px, py]); }
    for (let q = 0; q < (r.traps || 0); q++) m.traps.push(spot(3));
    if (r.rest) m.fires.push([r.cx, r.cy]);
    if (r.altar) m.altars.push([r.x + 2.5, r.y + 2]);
    if (r.chest) m.chests.push([r.x + r.rw - 3, r.y + 2]);
    if (r.boss) { m.boss = [r.cx, r.y + Math.round(r.rh * 0.35)]; m.bossTrig = [r.x + 2, r.y + 2, r.rw - 4, r.rh - 4]; }
    if (i === 0) m.start = [r.cx, r.y + r.rh - 3];
    // 봇이 따라갈 길: 방 가운데 → 꺾이는 곳
    m.route.push([r.cx, r.cy]); if (i < R.length - 1) m.route.push([R[i + 1].cx, r.cy]);
  });
  m.route.push(m.boss);
  return m;
}

// 장: 이야기, 지도, 보스, 색
export const CHAPTERS = [
  {
    id: 1, title: '1장 · 무너진 성 지하', place: '무너진 성 지하', diff: 1,
    intro: [
      '한때 왕국을 지키던 기사단이 있었어요.',
      '단장이 검은 서약을 맺던 밤, 성은 무너지고 기사단은 흩어졌어요.',
      '살아남은 네 사람은 남은 서약 하나를 지키기로 했어요.',
      '무너진 성 지하로 내려가, 몰락한 단장을 멈추는 것.'
    ],
    outro: [
      '단장의 검이 바닥에 떨어졌어요.',
      '쓰러진 단장이 마지막으로 속삭였어요. "왕이... 먼저 서약을 깼다."',
      '네 사람은 성 밖, 잿빛 숲으로 향했어요.'
    ],
    boss: { name: '몰락한 기사단장', ai: 'warden', hp: 12000, speed: 3.9, r: 1.4, dmg: 55, p2: ['단장이 해골 병사를 불러내요', '돌진할 때 기사가 막기로 받아치면 기절해요'], p3: ['단장의 갑옷이 갈라졌어요', '검은 불꽃을 피하며 등의 붉은 균열을 노려요. 두 배 피해예요'], ph: ['해골 소환', '갑옷 균열'] },
    theme: 'dungeon'
  },
  {
    id: 2, title: '2장 · 잿빛 숲', place: '잿빛 숲', diff: 1.12,
    intro: [
      '성을 빠져나온 네 사람 앞에 잿빛 숲이 펼쳐졌어요.',
      '단장의 마지막 말이 귓가에 남아 있었어요. "왕이 먼저 서약을 깼다."',
      '숲을 지키던 사냥꾼 기사 베른이 왕의 명령으로 길을 막고 있어요.',
      '재에 물든 늑대들이 그의 뿔피리를 따라 움직여요.'
    ],
    outro: [
      '베른의 뿔피리가 둘로 갈라졌어요.',
      '그는 왕이 재의 불꽃을 얻으려고 기사단을 제물로 바쳤다고 털어놓았어요.',
      '불꽃을 지키던 수도원은 이미 검은 물에 잠겼다고 해요.'
    ],
    boss: { name: '가시관의 사냥꾼 베른', ai: 'hunter', hp: 15000, speed: 4.6, r: 1.3, dmg: 50, p2: ['베른이 뿔피리로 늑대를 불러요', '늑대부터 쓰러뜨리고 도약을 굴러서 피해요'], p3: ['가시덤불이 사냥터를 뒤덮어요', '가시 고리 안쪽으로 파고들어요'], ph: ['늑대 무리', '가시 고리'] },
    theme: 'forest'
  },
  {
    id: 3, title: '3장 · 가라앉은 수도원', place: '가라앉은 수도원', diff: 1.25,
    intro: [
      '숲 너머, 기사단이 서약을 맺던 수도원은 검은 물에 잠겨 있었어요.',
      '대주교 오드릭은 왕의 편에 서서 서약의 불꽃을 물속에 가뒀어요.',
      '물에 빠진 수도사들은 아직도 기도를 멈추지 않아요.',
      '불꽃을 되찾아야 왕의 탑으로 가는 문이 열려요.'
    ],
    outro: [
      '물이 빠지고, 제단 위에 작은 불꽃 하나가 남았어요.',
      '불꽃은 네 사람의 서약에 답하듯 다시 타올랐어요.',
      '이제 서약의 탑만 남았어요.'
    ],
    boss: { name: '익사한 대주교 오드릭', ai: 'bishop', hp: 14000, speed: 3.2, r: 1.3, dmg: 48, p2: ['대주교가 물에 잠긴 수도사를 깨워요', '순간이동한 자리를 놓치지 말아요'], p3: ['검은 물이 차오르기 시작해요', '물웅덩이를 피하며 끝까지 버텨요'], ph: ['수도사 소환', '검은 물'] },
    theme: 'abbey'
  },
  {
    id: 4, title: '4장 · 서약의 탑', place: '서약의 탑', diff: 1.22,
    intro: [
      '왕국 한가운데 서약의 탑이 잿빛 구름을 뚫고 서 있어요.',
      '왕은 기사단의 서약을 불꽃에 바치고 죽지 않는 몸을 얻었어요.',
      '탑을 지키는 재의 기사들은 한때 네 사람의 동료였어요.',
      '꼭대기에서 잿빛 왕이 기다리고 있어요.'
    ],
    outro: [
      '잿빛 왕관이 재가 되어 흩어졌어요.',
      '되찾은 불꽃이 탑 꼭대기에서 왕국을 다시 밝혔어요.',
      '네 사람의 서약은 끝까지 지켜졌어요. 사람들은 그들을 Vowkeep, 서약을 지킨 자들이라 불렀어요.'
    ],
    boss: { name: '잿빛 왕', ai: 'king', hp: 14000, speed: 4.0, r: 1.5, dmg: 50, p2: ['왕이 재의 기사들을 불러내요', '돌진은 기사가 막기로 받아칠 수 있어요'], p3: ['왕관에서 재의 불꽃이 타올라요', '불길을 피하고 마지막 일격을 노려요'], ph: ['재의 기사 소환', '재의 불꽃'] },
    theme: 'tower'
  }
];
CHAPTERS[0].map = MAP1;
CHAPTERS[1].map = genMap(4242, [
  { name: '숲 어귀', line: '잿빛 나뭇잎이 눈처럼 내려요. 늑대 울음이 멀리서 들려요.', w: 12, h: 12 },
  { name: '늑대 굴', line: '잠든 늑대 무리예요. 하나가 깨면 모두 깨어나요.', foes: { skel: 6, archer: 1 } },
  { name: '사냥꾼 야영지', line: '왕의 사냥꾼들이 창을 들고 지키고 있어요.', foes: { skel: 3, archer: 4, shield: 1 }, altar: 1, pil: 1 },
  { name: '쓰러진 나무 다리', line: '썩은 나무 사이로 덫이 숨어 있어요.', foes: { skel: 4, shield: 2 }, traps: 3 },
  { name: '숲속 오두막', line: '꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.', rest: 1, chest: 1, w: 12, h: 11 },
  { name: '가시덤불 길', line: '껍질 거인이 길목을 막고 있어요.', foes: { skel: 5, archer: 3, shield: 1 }, traps: 3 },
  { name: '우두머리의 언덕', line: '거대한 늑대 우두머리가 언덕을 지켜요.', foes: { elite: 1, skel: 4, archer: 2 }, altar: 1, pil: 1 },
  { name: '잿빛 샘', line: '맑은 샘물 곁에서 숨을 고르고 가요.', rest: 1, chest: 1, pool: 1, w: 12, h: 11 },
  { name: '사냥터의 심장', line: '"왕의 명령이다. 이 숲을 지나간 자는 아무도 없다."', boss: 1 }
]);
CHAPTERS[2].map = genMap(9137, [
  { name: '물에 잠긴 정문', line: '종소리가 물속에서 울려요.', w: 12, h: 12, water: 1 },
  { name: '세례당', line: '물에 빠진 수도사들이 아직 기도하고 있어요.', foes: { skel: 5, archer: 2 }, water: 1 },
  { name: '무너진 회랑', line: '물의 시종들이 물빛 구슬을 던져요.', foes: { skel: 4, archer: 3, shield: 1 }, traps: 3, pil: 1 },
  { name: '젖은 도서관', line: '서약의 기록이 물에 번져 있어요.', foes: { skel: 3, archer: 3, shield: 2 }, altar: 1 },
  { name: '수도사 숙소', line: '꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.', rest: 1, chest: 1, w: 12, h: 11 },
  { name: '종탑 아래', line: '종지기들이 커다란 종을 방패처럼 들고 있어요.', foes: { skel: 4, shield: 3, archer: 1 }, water: 1, traps: 2 },
  { name: '납골당', line: '수도원 파수꾼이 납골당 문을 지켜요.', foes: { elite: 1, skel: 4, archer: 2 }, altar: 1, pil: 1 },
  { name: '성가대석', line: '젖은 의자 사이에서 숨을 고르고 가요.', rest: 1, chest: 1, w: 12, h: 11 },
  { name: '잠긴 대성당', line: '"서약은 물에 씻겨 사라졌다. 너희 기도도 마찬가지다."', boss: 1, water: 1 }
], { flip: 1 });
CHAPTERS[3].map = genMap(5521, [
  { name: '탑 아래 성문', line: '잿빛 구름 아래, 탑의 문이 열려 있어요.', w: 12, h: 12 },
  { name: '무너진 병영', line: '한때 동료였던 재의 기사들이에요.', foes: { skel: 6, archer: 2 } },
  { name: '사슬 다리', line: '석궁병들이 다리 위를 겨누고 있어요.', foes: { skel: 4, archer: 3, shield: 1 }, traps: 4 },
  { name: '무기 창고', line: '탑 방패병이 창고를 지켜요.', foes: { skel: 3, archer: 2, shield: 2 }, altar: 1, pil: 1 },
  { name: '맹세의 방', line: '꺼진 모닥불이 있어요. 불을 붙이면 쓰러졌을 때 여기서 다시 시작해요.', rest: 1, chest: 1, w: 12, h: 11 },
  { name: '불타는 회랑', line: '바닥이 뜨거워요. 덫을 조심해요.', foes: { skel: 5, archer: 3, shield: 2 }, traps: 3 },
  { name: '근위대 대기실', line: '왕의 근위 기사 두 명이 문 앞에 서 있어요.', foes: { elite: 2, skel: 3, archer: 2 }, altar: 1, pil: 1 },
  { name: '왕좌 앞 계단', line: '마지막 모닥불이에요. 숨을 고르고 올라가요.', rest: 1, chest: 1, w: 12, h: 11 },
  { name: '왕좌의 방', line: '"서약이란 지키는 자를 묶는 사슬일 뿐이다."', boss: 1 }
]);
export const CHAPTER1 = CHAPTERS[0];

// 지금 고른 장의 지도. map.js의 useChapter로 바꿔요
export const MAP = {};
export let CH = CHAPTERS[0];
export function setChapterData(i) {
  CH = CHAPTERS[i] || CHAPTERS[0];
  for (const k of Object.keys(MAP)) delete MAP[k];
  Object.assign(MAP, CH.map);
  return CH;
}
setChapterData(0);

export const ACHIEVEMENTS = [
  { id: 'first', name: '첫 원정', desc: '원정을 처음 시작해요.' },
  { id: 'room1', name: '첫 승리', desc: '처음으로 적을 쓰러뜨려요.' },
  { id: 'rest', name: '모닥불 곁에서', desc: '모닥불에 처음 불을 붙여요.' },
  { id: 'elite', name: '대장 격파', desc: '장마다 있는 적 대장을 쓰러뜨려요.' },
  { id: 'boss', name: '서약을 지킨 자', desc: '몰락한 기사단장을 쓰러뜨려요.' },
  { id: 'parry', name: '완벽한 막기', desc: '기사로 보스 돌진을 받아쳐 기절시켜요.' },
  { id: 'pdodge', name: '종이 한 장 차이', desc: '공격이 닿기 직전에 굴러서 피해요.' },
  { id: 'revive', name: '일으켜 세우기', desc: '쓰러진 동료를 일으켜요.' },
  { id: 'friends', name: '함께하는 원정', desc: '친구와 같은 방에서 원정을 떠나요.' },
  { id: 'ch2', name: '잿빛 숲을 지나', desc: '2장에서 가시관의 사냥꾼 베른을 쓰러뜨려요.' },
  { id: 'ch3', name: '불꽃을 되찾다', desc: '3장에서 익사한 대주교 오드릭을 쓰러뜨려요.' },
  { id: 'ch4', name: '서약을 지킨 자들', desc: '4장에서 잿빛 왕을 쓰러뜨려요.' },
  { id: 'nodown', name: '한 번도 안 쓰러짐', desc: '한 번도 쓰러지지 않고 한 장을 깨요.' },
  { id: 'all4', name: '네 가지 서약', desc: '네 역할로 모두 한 장 이상 깨요.' }
];

export const GEAR_TIERS = ['낡은', '쓸만한', '명장의'];
export const GEAR_COST = [0, 120, 320];
export const GEAR_BONUS = { weapon: [0, 0.1, 0.22], armor: [0, 15, 35] };
export function roleLevel(xp) { return Math.min(10, 1 + Math.floor(Math.sqrt((xp || 0) / 25))); }

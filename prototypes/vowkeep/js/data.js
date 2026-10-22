// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 데이터: 역할, 적, 축복, 1장 지도

export const VERSION = 'v0.1', BUILD = 5;

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

// 1장: 무너진 성 지하. 하나로 이어진 큰 지하 맵이에요. 좌표는 칸 단위 (한 칸 = 2m)
export const CHAPTER1 = {
  title: '1장 · 무너진 성 지하',
  intro: [
    '한때 왕국을 지키던 기사단이 있었어요.',
    '단장이 검은 서약을 맺던 밤, 성은 무너지고 기사단은 흩어졌어요.',
    '살아남은 네 사람은 남은 서약 하나를 지키기로 했어요.',
    '무너진 성 지하로 내려가, 몰락한 단장을 멈추는 것.'
  ],
  outro: [
    '단장의 검이 바닥에 떨어졌어요.',
    '검은 불꽃은 꺼졌지만, 그가 맺은 서약의 흔적은 더 깊은 곳으로 이어져 있었어요.',
    '기사단의 원정은 이제 막 시작됐어요.'
  ]
};

export const MAP = {
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
  boss: [38, 8],
  pillars: [[28, 47], [43, 47], [28, 54], [43, 54], [58, 54], [66, 54], [7, 30.5], [14, 30.5], [30, 5], [46, 5], [30, 18], [46, 18]],
  traps: [[54, 28], [48, 30], [42, 27], [36, 29], [30, 28], [45, 28.5], [36, 61], [11, 15]],
  fires: [[61, 50], [11, 12]],
  altars: [[8.5, 46], [58, 46], [59, 18], [5, 36]],
  chests: [[66, 46], [62, 22]],
  // 봇이 앞장설 때 따라가는 길
  route: [[36, 62], [36, 51], [52, 50.5], [61, 48], [62, 36], [62, 29], [44, 29], [24, 29], [20, 28.5], [11, 31], [11, 20], [11, 12], [22, 12], [32, 12], [38, 10]]
};

export const ACHIEVEMENTS = [
  { id: 'first', name: '첫 원정', desc: '원정을 처음 시작해요.' },
  { id: 'room1', name: '첫 승리', desc: '처음으로 적을 쓰러뜨려요.' },
  { id: 'rest', name: '모닥불 곁에서', desc: '모닥불에 처음 불을 붙여요.' },
  { id: 'elite', name: '근위대장 격파', desc: '해골 근위대장을 쓰러뜨려요.' },
  { id: 'boss', name: '서약을 지킨 자', desc: '몰락한 기사단장을 쓰러뜨려요.' },
  { id: 'parry', name: '완벽한 막기', desc: '기사로 보스 돌진을 받아쳐 기절시켜요.' },
  { id: 'revive', name: '일으켜 세우기', desc: '쓰러진 동료를 일으켜요.' },
  { id: 'friends', name: '함께하는 원정', desc: '친구와 같은 방에서 원정을 떠나요.' },
  { id: 'nodown', name: '한 번도 안 쓰러짐', desc: '한 번도 쓰러지지 않고 1장을 깨요.' },
  { id: 'all4', name: '네 가지 서약', desc: '네 역할로 모두 1장을 깨요.' }
];

export const GEAR_TIERS = ['낡은', '쓸만한', '명장의'];
export const GEAR_COST = [0, 120, 320];
export const GEAR_BONUS = { weapon: [0, 0.1, 0.22], armor: [0, 15, 35] };
export function roleLevel(xp) { return Math.min(10, 1 + Math.floor(Math.sqrt((xp || 0) / 25))); }

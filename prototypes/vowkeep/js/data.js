// Vowkeep · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 데이터: 역할, 적, 축복, 1장 방 구성

export const VERSION = 'v0.1', BUILD = 1;

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
  skel: { name: '해골 병사', hp: 90, speed: 3.8, r: 0.6, dmg: 16, range: 1.7, windup: 0.5, cd: 1.1, honor: 1 },
  archer: { name: '해골 궁수', hp: 60, speed: 3.4, r: 0.6, dmg: 13, range: 10, windup: 0.7, cd: 2.2, keep: 7.5, honor: 1 },
  shield: { name: '방패 해골', hp: 150, speed: 3.0, r: 0.7, dmg: 18, range: 1.8, windup: 0.6, cd: 1.6, front: 0.3, honor: 2 },
  elite: { name: '해골 근위대장', hp: 560, speed: 3.7, r: 0.9, dmg: 28, range: 2.4, windup: 0.7, cd: 1.6, charge: true, honor: 6 },
  boss: { name: '몰락한 기사단장', hp: 11000, speed: 3.4, r: 1.4, dmg: 30, honor: 0 }
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

// 1장: 무너진 성 지하. 전투 방 4개, 쉼터 1개, 보스 방 1개
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
  ],
  rooms: [
    { kind: 'fight', name: '무너진 계단', line: '계단 아래에서 뼈 부딪히는 소리가 들려요.', waves: [['skel', 'skel', 'skel'], ['skel', 'skel', 'archer', 'archer'], ['skel', 'skel', 'skel', 'skel']], traps: 2, pillars: 2 },
    { kind: 'fight', name: '해골 병영', line: '기사단 병사들이었던 것들이 일어나요.', waves: [['skel', 'shield', 'skel', 'archer'], ['skel', 'skel', 'skel', 'archer', 'archer'], ['shield', 'shield', 'skel', 'skel', 'archer']], traps: 3, pillars: 4 },
    { kind: 'rest', name: '버려진 예배당', line: '아직 꺼지지 않은 모닥불이 있어요. 잠시 쉬어 가요.' },
    { kind: 'fight', name: '물에 잠긴 회랑', line: '방패를 든 해골들이 길을 막아요.', waves: [['shield', 'shield', 'archer', 'archer'], ['skel', 'skel', 'skel', 'shield', 'archer'], ['skel', 'skel', 'skel', 'skel', 'archer', 'archer']], traps: 4, pillars: 4 },
    { kind: 'fight', name: '근위대 무덤', line: '단장의 근위대장이 아직 문을 지키고 있어요.', waves: [['skel', 'skel', 'archer', 'shield'], ['elite', 'skel', 'skel'], ['archer', 'archer', 'shield', 'skel', 'skel']], traps: 3, pillars: 2 },
    { kind: 'boss', name: '기사단장의 방', line: '"서약은 깨졌다. 너희도 여기서 무릎 꿇어라."' }
  ]
};

export const ACHIEVEMENTS = [
  { id: 'first', name: '첫 원정', desc: '원정을 처음 시작해요.' },
  { id: 'room1', name: '첫 승리', desc: '전투 방을 처음 깨요.' },
  { id: 'rest', name: '모닥불 곁에서', desc: '쉼터에 도착해요.' },
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

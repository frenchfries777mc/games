// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 데이터: 역할, 적, 축복, 1장 지도

import { T } from './tr.js';

export const VERSION = 'v0.1', BUILD = 109;

export const ROLES = {
  knight: {
    name: T('기사'), type: T('근접 딜러'), color: '#3f6fd0', hp: 345, speed: 6.0,
    atk: { kind: 'melee', range: 2.5, arc: 1.9, dmg: 21, cd: 0.45 },
    skills: [
      { id: 'block', name: T('막기'), key: 'Q', cd: 5, desc: T('1.2초 동안 방패를 들어 앞에서 오는 피해를 70% 줄여요.') },
      { id: 'dash', name: T('돌진'), key: 'E', cd: 5, desc: T('앞으로 돌진하며 부딪힌 상대에게 30 피해를 주고 1.5초 동안 느리게 해요.') },
      { id: 'shieldbash', name: T('방패 강타'), key: 'R', cd: 10, desc: T('방패를 앞세워 짧게 파고들며 28 피해를 주고 상대를 1.1초 기절시켜요.') }
    ],
    st: [3, 3, 2, 1], atkTxt: T('칼 베기 (이어 치면 세 번째에 내려찍는 강타)'),
    role: T('튼튼하게 버티며 공격·공격·강타로 몰아붙여요.')
  },
  priest: {
    name: T('사제'), type: T('서포터'), color: '#e8e4ef', hp: 150, speed: 6.0,
    atk: { kind: 'orb', dmg: 10, cd: 0.5, speed: 16 },
    skills: [
      { id: 'heal', name: T('치유'), key: 'Q', cd: 9, desc: T('내 체력을 18 회복해요.') },
      { id: 'ward', name: T('보호막'), key: 'E', cd: 14, desc: T('5초 동안 피해 24를 막는 보호막을 씌워요.') },
      { id: 'smite', name: T('천벌'), key: 'R', cd: 12, desc: T('조준한 곳에 빛기둥을 세워요. 잠시 뒤 안에 있는 상대가 큰 피해를 받아요.') }
    ],
    st: [2, 3, 4, 2], atkTxt: T('빛 구슬 (세 번째는 꿰뚫는 큰 빛)'),
    role: T('빛 구슬로 따라붙고, 세 번째 공격은 큰 빛을 꿰뚫어 쏴요.')
  },
  archer: {
    name: T('사냥꾼'), type: T('원거리 딜러'), color: '#5a9a4e', hp: 205, speed: 6.4,
    atk: { kind: 'arrow', dmg: 13, cd: 0.36, speed: 26 },
    skills: [
      { id: 'pierce', name: T('관통 화살'), key: 'Q', cd: 5, desc: T('상대를 꿰뚫고 날아가는 강한 화살이에요. 45 피해.') },
      { id: 'rain', name: T('화살비'), key: 'E', cd: 9, desc: T('조준한 곳에 1.5초 동안 화살비를 내려요.') },
      { id: 'mark', name: T('약점 표시'), key: 'R', cd: 12, desc: T('조준한 상대에게 6초 동안 표시를 남겨 그 상대가 받는 피해가 50% 늘어요.') }
    ],
    st: [2, 4, 5, 3], atkTxt: T('화살 (꾹 누르면 여러 발)'),
    role: T('멀리서 쏴요. 공격을 꾹 누르면 0.8초에 두 발, 2초에 세 발을 한 번에 쏴요.')
  },
  viking: {
    name: T('바이킹'), type: T('근접 딜러'), color: '#c8873a', hp: 314, speed: 5.6,
    atk: { kind: 'melee', range: 2.6, arc: 2.0, dmg: 22, cd: 0.55 },
    skills: [
      { id: 'leap', name: T('도약 강타'), key: 'Q', cd: 5, desc: T('앞으로 크게 뛰어올라 내려앉으며 둘레 상대에게 36 피해를 주고 1.5초 동안 느리게 해요.') },
      { id: 'bloodlust', name: T('피의 갈증'), key: 'E', cd: 12, desc: T('5초 동안 공격이 30% 빨라지고, 준 피해의 일부를 체력으로 되찾아요.') },
      { id: 'quake', name: T('지진'), key: 'R', cd: 12, desc: T('앞으로 11칸 길게 땅을 갈라 그 길 위 모두에게 42 피해를 주고 느려지게 해요.') }
    ],
    st: [5, 2, 2, 2], atkTxt: T('도끼 내리치기'),
    role: T('느리지만 도끼 한 방이 무거운 가장 튼튼한 전사예요.')
  },
  mamluk: {
    name: T('맘루크'), type: T('근접 딜러'), color: '#d0443a', hp: 316, speed: 7.2,
    atk: { kind: 'melee', range: 2.2, arc: 1.8, dmg: 18, cd: 0.3 },
    skills: [
      { id: 'flurry', name: T('연속 베기'), key: 'Q', cd: 4, desc: T('앞으로 파고들며 다섯 번 번갈아 베어 9씩 피해를 줘요.') },
      { id: 'whirl', name: T('회전 베기'), key: 'E', cd: 8, desc: T('제자리에서 두 바퀴 돌며 둘레 모두를 세 번 베어 12씩 피해를 줘요.') },
      { id: 'blink', name: T('순간 베기'), key: 'R', cd: 10, desc: T('가장 가까운 상대 뒤로 순간이동해 베어 34 피해를 줘요.') }
    ],
    st: [2, 5, 2, 3], atkTxt: T('굽은 칼 연속 베기'),
    role: T('굽은 칼로 빠르게 베고 파고드는 날랜 전사예요.')
  },
  witch: {
    name: T('마녀'), type: T('원거리 딜러'), color: '#a56ad8', hp: 163, speed: 6.2,
    atk: { kind: 'orb', dmg: 11, cd: 0.45, speed: 16 },
    skills: [
      { id: 'potion', name: T('독 물약'), key: 'Q', cd: 7, desc: T('조준한 곳에 물약을 던져 터진 자리 둘레 상대에게 30 피해를 주고 불태워요.') },
      { id: 'curse', name: T('저주'), key: 'E', cd: 10, desc: T('조준한 곳에 저주를 터뜨려 잠시 뒤 40 피해를 주고 3초 동안 느리게 해요.') },
      { id: 'frost', name: T('서리 폭발'), key: 'R', cd: 12, desc: T('조준한 곳에 서리를 터뜨려 둘레 상대에게 22 피해를 주고 0.6초 얼리고 3초 동안 느리게 해요.') }
    ],
    st: [3, 3, 4, 4], atkTxt: T('마법 구슬'),
    role: T('마법 구슬과 저주로 멀리서 괴롭혀요.')
  },
  skeleton: {
    name: T('스켈레톤'), type: T('근접 딜러'), color: '#cfc8b0', hp: 292, speed: 7.0,
    atk: { kind: 'melee', range: 2.0, arc: 2.0, dmg: 16, cd: 0.32 },
    skills: [
      { id: 'scatter', name: T('뼈 흩어지기'), key: 'Q', cd: 6, desc: T('뒤로 빠지며 몸이 흩어져 뼛조각 여덟 개가 사방으로 튀어요. 하나에 12 피해.') },
      { id: 'fan', name: T('뼈 창 다섯 갈래'), key: 'E', cd: 6, desc: T('뼈 창 다섯 대를 부채꼴로 던져요. 하나에 15 피해.') },
      { id: 'bonestorm', name: T('뼈 폭풍'), key: 'R', cd: 14, desc: T('1.4초 동안 몸을 돌리며 둘레를 계속 쳐 13씩 피해를 줘요.') }
    ],
    st: [2, 5, 1, 4], atkTxt: T('뼈 몽둥이'),
    role: T('가볍고 빠른 뼈다귀예요. 몸이 약하니 파고들었다 빠져요.')
  },
  warden: {
    name: T('성벽지기'), type: T('유틸리티'), color: '#9a8f78', hp: 430, speed: 5.6,
    atk: { kind: 'melee', range: 2.4, arc: 1.9, dmg: 24, cd: 0.5 },
    skills: [
      { id: 'wall', name: T('방벽 세우기'), key: 'Q', cd: 9, desc: T('앞에 돌 방벽을 4초 동안 세워요. 방벽에 닿는 화살과 구슬은 사라져요.') },
      { id: 'vow', name: T('수호 맹세'), key: 'E', cd: 14, desc: T('가까운 아군에게 6초 동안 맹세를 걸어 그 아군이 받는 피해의 40%를 대신 맞아요. 아군이 없으면 나에게 걸어 6초 동안 받는 피해가 25% 줄어요.') },
      { id: 'bastion', name: T('철벽'), key: 'R', cd: 16, desc: T('3초 동안 어느 쪽에서 맞아도 피해를 60% 덜 받고, 가까운 아군에게 보호막을 씌우고, 둘레 상대를 느리게 해요.') }
    ],
    st: [3, 1, 1, 2], atkTxt: T('무거운 방패 내려치기'),
    role: T('길목을 막고 아군을 지켜요. 느리고 공격은 약하지만 가장 오래 버텨요.')
  },
  assassin: {
    name: T('자객'), type: T('근접 딜러'), color: '#3a5a66', hp: 280, speed: 7.8,
    atk: { kind: 'melee', range: 2.1, arc: 1.6, dmg: 24, cd: 0.3 },
    skills: [
      { id: 'vanish', name: T('그림자 걸음'), key: 'Q', cd: 10, desc: T('3.5초 동안 멀리 있는 상대 눈에 보이지 않고 25% 빨라져요. 숨은 채 처음 때리는 한 번은 피해가 1.8배예요.') },
      { id: 'venom', name: T('독 단검'), key: 'E', cd: 9, desc: T('다음 공격 네 번이 상대를 불태워요.') },
      { id: 'execute', name: T('처형'), key: 'R', cd: 11, desc: T('체력이 가장 낮은 상대 뒤로 순간이동해 베요. 상대 체력이 35% 아래면 피해가 두 배예요.') }
    ],
    st: [4, 5, 1, 5], atkTxt: T('짧은 칼 연속 찌르기'),
    role: T('몰래 파고들어 약한 한 명을 끊어요. 몸이 약해 들키면 위험해요.')
  },
  bomber: {
    name: T('폭파병'), type: T('원거리 딜러'), color: '#c8643a', hp: 290, speed: 6.3,
    atk: { kind: 'bomb', dmg: 42, cd: 1.3, speed: 0, range: 13, r: 2.4 },
    skills: [
      { id: 'bigbomb', name: T('큰 폭탄'), key: 'Q', cd: 8, desc: T('조준한 곳에 큰 폭탄을 던져요. 1.1초 뒤 넓게 터져 60 피해를 줘요.') },
      { id: 'sticky', name: T('끈끈이 폭탄'), key: 'E', cd: 11, desc: T('터진 자리에 있던 상대를 3초 동안 크게 느리게 만들어요. 15 피해.') },
      { id: 'barrage', name: T('폭격'), key: 'R', cd: 18, desc: T('앞쪽으로 줄지어 폭탄 다섯 발을 떨어뜨려요. 한 발마다 38 피해.') }
    ],
    st: [4, 2, 3, 4], atkTxt: T('포물선으로 폭탄을 던져요 (닿은 자리에서 0.75초 뒤 터져요)'),
    role: T('벽 너머 깃발 위를 폭탄으로 때려 점령을 방해해요. 터지기 전에 움직이는 상대에겐 잘 안 맞아요.')
  },
  streltsy: {
    name: T('스트렐치'), type: T('원거리 딜러'), color: '#6a7a8a', hp: 175, speed: 5.6,
    atk: { kind: 'musket', dmg: 52, cd: 1.7, speed: 52, life: 1.2, hr: 0.5 },
    skills: [
      { id: 'rapidfire', name: T('연사'), key: 'Q', cd: 9, desc: T('같은 방향으로 총알 세 발을 잇달아 쏴요. 한 발에 26 피해.') },
      { id: 'bigshot', name: T('거대 총알'), key: 'E', cd: 11, desc: T('크고 느린 총알을 한 발 쏴요. 88 피해.') },
      { id: 'axeswing', name: T('도끼 휘두르기'), key: 'R', cd: 14, desc: T('다른 손의 러시아 도끼를 앞쪽 부채꼴로 크게 휘둘러요. 주변 상대에게 90 피해를 주고 강하게 밀쳐 내요.') }
    ],
    st: [5, 2, 5, 3], atkTxt: T('총 한 발 (가장 멀리 날아가지만 맞추기 어렵고 다시 쏘기까지 오래 걸려요)'),
    role: T('아주 멀리서 한 발씩 강하게 쏘고, 엄폐물 뒤에서 더 세져요.')
  },
  crossbow: {
    name: T('석궁병'), type: T('원거리 딜러'), color: '#8a6a3a', hp: 190, speed: 5.8,
    atk: { kind: 'xbolt', dmg: 23, cd: 0.8, speed: 32 },
    skills: [
      { id: 'rootbolt', name: T('속박 볼트'), key: 'Q', cd: 8, desc: T('맞은 상대를 2.5초 동안 크게 느리게 하는 볼트를 쏴요. 18 피해.') },
      { id: 'backstep', name: T('뒤로 물러나기'), key: 'E', cd: 8, desc: T('뒤로 크게 물러나고, 3초 동안 공격 피해가 1.5배가 돼요.') },
      { id: 'snipe', name: T('저격'), key: 'R', cd: 14, desc: T('1.2초 동안 느리게 걸으며 조준을 모았다가, 벽을 뚫고 끝까지 날아가는 한 발을 쏴요. 110 피해.') }
    ],
    st: [4, 2, 5, 4], atkTxt: T('석궁 한 발 (꾹 눌러도 한 발씩)'),
    role: T('느리게 움직이며 멀리서 한 발씩 정확히 쏘고, 저격으로 마무리해요.')
  },
  bard: {
    name: T('음유시인'), type: T('서포터'), color: '#c05a7a', hp: 175, speed: 6.2,
    atk: { kind: 'orb', dmg: 9, cd: 0.5, speed: 16 },
    skills: [
      { id: 'march', name: T('행진곡'), key: 'Q', cd: 12, desc: T('가까운 아군(나 포함)이 6초 동안 30% 빨라지고, 체력을 8 되찾아요.') },
      { id: 'lullaby', name: T('자장가'), key: 'E', cd: 11, desc: T('둘레 상대가 3초 동안 크게 느려지고 12 피해를 받아요.') },
      { id: 'chorus', name: T('합창'), key: 'R', cd: 16, desc: T('가까운 아군(나 포함)의 체력을 30 되찾아 주고 4초 동안 피해 18을 막는 보호막을 씌워요.') }
    ],
    st: [1, 3, 5, 3], atkTxt: T('음표 구슬'),
    role: T('노래로 아군을 빠르게 하고 치유해요. 자장가로 다가오는 상대를 늦춰 시간을 벌어요.')
  },
  spearman: {
    name: T('창병'), type: T('근접 딜러'), color: '#6a7a8c', hp: 378, speed: 6.0,
    atk: { kind: 'melee', range: 3.9, arc: 0.5, dmg: 47, cd: 0.6 },
    skills: [
      { id: 'lunge', name: T('돌진 찌르기'), key: 'Q', cd: 6, desc: T('앞으로 크게 돌진하며 지나가는 상대를 꿰뚫어요. 40 피해를 주고 1.5초 동안 느리게 해요.') },
      { id: 'spearthrow', name: T('창 던지기'), key: 'E', cd: 10, desc: T('창을 멀리 던져요. 맞은 상대는 1.5초 동안 느려지고 42 피해를 받아요.') },
      { id: 'sweep', name: T('휩쓸기'), key: 'R', cd: 14, desc: T('창을 크게 휘둘러 둘레 상대에게 36 피해를 주고 밀어내며 1.5초 동안 느리게 해요.') }
    ],
    st: [3, 3, 3, 3], atkTxt: T('앞으로 길게 찌르기'),
    role: T('긴 창으로 멀리서 찌르고, 다가오는 상대를 돌진과 휩쓸기로 밀어내요.')
  },
  court: {
    name: T('궁정 마법사'), type: T('유틸리티'), color: '#7a4ab8', hp: 165, speed: 6.0,
    atk: { kind: 'orb', dmg: 10, cd: 0.55, speed: 17 },
    skills: [
      { id: 'courtswap', name: T('소환 교환'), key: 'Q', cd: 12, desc: T('가까운 아군과 자리를 맞바꿔요. 위험한 아군을 빼내거나 먼저 깃발로 가요.') },
      { id: 'runetrap', name: T('룬 족쇄'), key: 'E', cd: 14, desc: T('바닥에 룬 원을 3초 동안 놓아요. 안의 상대는 느려지고, 룬 표식이 붙은 상대는 가운데로 끌려와요.') },
      { id: 'courtshift', name: T('궁정 전환'), key: 'R', cd: 22, desc: T('룬 표식이 붙은 상대와 자리를 맞바꾸고 1초 동안 멈추게 해요.') }
    ],
    st: [1, 2, 5, 3], atkTxt: T('룬 구슬'),
    role: T('룬 구슬로 상대에게 표식을 남겨요. 자리를 맞바꿔 아군을 구하고 상대를 우리 쪽으로 끌어와요.')
  },
  necro: {
    name: T('네크로멘서'), type: T('서포터'), color: '#8a5ac8', hp: 190, speed: 5.8,
    atk: { kind: 'melee', range: 6, w: 2.8, arc: 2.7, dmg: 16, cd: 0.7 },
    skills: [
      { id: 'necroheal', name: T('생명 흡수'), key: 'Q', cd: 12, desc: T('둘레 아군(나 포함)의 체력을 22 되찾아 줘요.') },
      { id: 'necroraise', name: T('해골 소환'), key: 'E', cd: 16, desc: T('둘레에 약한 해골 네 마리를 불러요. 해골은 18초 동안 우리 편으로 싸워요.') },
      { id: 'necrodoom', name: T('죽음의 영역'), key: 'R', cd: 24, desc: T('넓은 원 안의 상대를 1초 기절시키고 피해를 준 뒤 3초 동안 이동 속도를 50% 느리게 해요.') }
    ],
    st: [2, 3, 5, 3], atkTxt: T('넓은 직사각형으로 휘두르기'),
    role: T('넓게 휘두르는 공격으로 멀리서 싸워요. 아군을 치유하고 해골을 불러 전선을 만들어요.')
  }
};
export const COLORS = [
  { id: 'red', name: T('빨강'), c: 0xd9483b },
  { id: 'blue', name: T('파랑'), c: 0x3b78d9 },
  { id: 'green', name: T('초록'), c: 0x48a84a },
  { id: 'yellow', name: T('노랑'), c: 0xe0b52e },
  { id: 'purple', name: T('보라'), c: 0x8a52c8 },
  { id: 'orange', name: T('주황'), c: 0xe57a2a }
];
export const BOT_NAMES = ['데굴이', '휘청이', '꽈당이', '비틀이', '아슬이', '쿵쾅이', '덜렁이', '허둥이', '깜빡이', '뒤뚱이'];
export const MAX_PLAYERS = 10;
export const ROLE_IDS = ['knight', 'priest', 'archer', 'viking', 'mamluk', 'witch', 'skeleton', 'warden', 'assassin', 'crossbow', 'bomber', 'bard', 'spearman', 'court', 'necro', 'streltsy'];

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
  { id: 'honor', name: T('명예의 길'), desc: T('이번 원정에서 받는 명예 +25%') }
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
// 투기장: 보우킵 보스 방을 크게 키운 한 방 (적도 이야기도 없이 마지막 한 명이 남을 때까지)
// 5대5 깃발 점령전 지도: 아주 넓은 벌판에 돌담과 기둥이 흩어져 있어요 (180도 돌려도 똑같아서 두 팀이 공평해요)
export const PUSH_N = 5, PUSH_T = 5;   // 깃발을 이만큼 가진 팀이 몰아붙이면 상대 부활이 이만큼(초) 늘어요
export const DOOR_OPEN_T = 14, DOOR_SHUT_T = 16, STORM_CALM_T = 30, STORM_T = 12;   // 사막 신전: 문이 열려 있는 시간·닫혀 있는 시간, 모래폭풍이 잠잠한 시간·부는 시간(초)
export const TEAM_N = 5, FLAG_T = 7, FLAG_R = 6.5, RESP_T = 15, SPAWN_INV = 2, TEAM_HP = 1.5, RECALL_CD = 25, RECALL_T = 3;
export const TEAMS = [{ name: T('푸른 군단'), c: 0x4a8cff }, { name: T('붉은 군단'), c: 0xff5a4a }];
// 전략이 있는 지도 네 개 (모두 180도 돌려도 똑같아서 공평해요). 담은 [x,y,너비,높이] 칸 단위로 한쪽 반만 적고 반대쪽은 돌려서 만들어요.
// A = 푸른 팀 (왼쪽 아래 진지), 기둥은 [x,y]. fl = 푸른 팀 쪽 깃발 둘 / mid = 가운데 깃발 (첫째는 한가운데, 둘째와 그 맞은편은 자동)
const ARENAS = [
  { name: '세 갈래 길', line: '위·가운데·아래 세 갈래 길이 긴 담으로 나뉘어 있어요. 담 끝과 한가운데 틈으로만 길을 바꿀 수 있어요.', theme: 'dungeon',
    walls: [[6, 22, 44, 3], [24, 8, 3, 8], [40, 10, 3, 8], [22, 32, 3, 6]],
    fl: [[10, 40], [36, 60]], mid: [[56, 36], [32, 14]], pil: [[16, 12], [46, 16], [14, 34], [38, 34]] },
  { name: '중앙 요새', line: '한가운데 요새 안에 깃발 셋이 있어요. 요새 문은 네 곳이에요.', theme: 'abyss',
    walls: [[36, 24, 14, 3], [36, 24, 3, 8], [14, 26, 10, 3], [20, 8, 3, 10], [8, 8, 8, 3]],
    fl: [[10, 40], [36, 60]], mid: [[56, 36], [46, 32]], pil: [[48, 14], [28, 32], [10, 20], [32, 16]] },
  { name: '십자 광장', line: '네 덩어리 건물 사이로 넓은 십자 길이 나 있어요. 광장 한가운데를 쥐면 이겨요.', theme: 'temple',
    walls: [[8, 6, 38, 18]],
    fl: [[12, 36], [56, 62]], mid: [[56, 36], [24, 36]], pil: [[56, 14], [30, 30], [52, 28], [4, 4]] },
  { name: '돌담 마을', line: '집들이 돌담 골목으로 이어진 마을이에요. 골목으로 돌아가 뒤를 쳐요.', theme: 'forest',
    walls: [[8, 6, 16, 10], [32, 6, 12, 10], [20, 22, 12, 8], [46, 18, 3, 14], [4, 28, 3, 6], [38, 26, 10, 3]],
    fl: [[10, 40], [50, 60]], mid: [[56, 36], [34, 36]], pil: [[28, 20], [52, 8], [10, 24], [26, 34]] },
  { name: '얼음 호수', line: '가운데에 커다란 얼음 호수가 얼어 있고, 가운데 섬으로 얼음 다리 네 개가 이어요. 호수를 빙 돌아도 되고 얼음 다리로 가로질러도 돼요.', theme: 'frost',
    walls: [[8, 30, 10, 3], [44, 4, 3, 8]],
    wallIf: (i, j, W, H) => { const dx = i + 0.5 - W / 2, dy = j + 0.5 - H / 2; return (dx / 62) ** 2 + (dy / 42) ** 2 < 1 && dx * dx + dy * dy >= 144 && !(Math.abs(dy) < 4 && Math.abs(dx) < 70) && !(Math.abs(dx) < 4 && Math.abs(dy) < 46); },
    fl: [[10, 42], [30, 62]], mid: [[56, 36], [38, 20]], pil: [[14, 12], [30, 36], [50, 10], [6, 24]] },
  { name: '심연 다리', line: '왼쪽과 오른쪽 두 섬을 좁고 긴 중앙 다리 하나가 이어요. 다리 길목을 쥐는 쪽이 유리해요.', theme: 'deep',
    walls: [[40, 0, 16, 33], [8, 24, 16, 3], [18, 6, 10, 8], [26, 20, 3, 8], [6, 8, 3, 8]],
    fl: [[12, 44], [30, 48]], mid: [[56, 36], [34, 36]], pil: [[20, 20], [14, 30], [34, 16], [47, 35]] },
  { name: '해적 항구', line: '위와 아래에서 바다가 반달 모양으로 파고들고, 부두가 바다 한가운데로 길게 뻗어 있어요. 배와 창고 사이 좁은 틈을 노려요.', theme: 'harbor',
    walls: [[12, 18, 22, 5], [14, 26, 8, 4], [44, 24, 6, 8]],
    wallIf: (i, j, W, H) => { const dx = i + 0.5 - W / 2; if (Math.abs(dx) < 5) return false; const t = (dx / 54) ** 2; return t + ((j + 0.5) / 46) ** 2 < 1 || t + ((H - j - 0.5) / 46) ** 2 < 1; },
    fl: [[10, 42], [30, 56]], mid: [[56, 36], [32, 12]], pil: [[14, 16], [50, 8], [48, 28], [8, 36]] },
  { name: '시계탑', line: '가운데 깃발을 둥근 톱니바퀴 벽이 에워싸고, 문 네 곳만 열려 있어요. 바퀴 둘레의 톱니 돌기둥 사이로 돌아 들어가요.', theme: 'tower',
    walls: [[10, 28, 16, 3], [48, 6, 8, 3]],
    wallIf: (i, j, W, H) => { const dx = i + 0.5 - W / 2, dy = j + 0.5 - H / 2, r = Math.hypot(dx, dy); if (r >= 38 && r < 42 && Math.abs(dx) >= 9 && Math.abs(dy) >= 9) return true; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (Math.abs(dx - 58 * Math.cos(a)) < 5 && Math.abs(dy - 58 * Math.sin(a)) < 5) return true; } return false; },
    fl: [[10, 40], [30, 56]], mid: [[56, 36], [32, 24]], pil: [[14, 14], [30, 18], [50, 20], [8, 20]] },
  { name: '지하 수로', line: '가로로 길게 흐르는 두 물길이 지하를 세 줄 길로 나누고, 좁은 다리 여섯 곳으로만 건너요. 물길 끝을 돌아가도 돼요.', theme: 'sewer',
    walls: [[50, 6, 6, 3]],
    wallIf: (i, j, W, H) => { const adx = Math.abs(i + 0.5 - W / 2), ady = Math.abs(j + 0.5 - H / 2); return ady >= 30 && ady < 42 && adx < 125 && !(adx < 14 || (adx >= 70 && adx < 84) || (adx >= 118 && adx < 125)); },
    fl: [[10, 42], [30, 56]], mid: [[56, 36], [24, 12]], pil: [[22, 8], [44, 14], [8, 24], [32, 34]] },
  { name: '불타는 성벽', line: '양쪽 진지가 불타는 성벽으로 둘러싸여 있고, 성문은 세 곳뿐이에요. 성문 앞을 쥐는 쪽이 유리해요.', theme: 'temple',
    walls: [[20, 6, 12, 3]],
    wallIf: (i, j, W, H) => { const f = (x, y) => { if (x >= 52 && x < 55 && y >= H - 72) return !((y >= H - 56 && y < H - 46) || (y >= H - 30 && y < H - 20)); if (y >= H - 72 && y < H - 69 && x < 55) return !(x >= 18 && x < 30); return false; }; return f(i, j) || f(W - 1 - i, H - 1 - j); },
    fl: [[8, 64], [26, 40]], mid: [[56, 36], [30, 18]], pil: [[14, 14], [44, 22], [34, 30]] },
  { name: '무너진 대성당', line: '무너진 대성당의 기둥 숲 사이로 시야가 막히고, 한가운데 제단에는 문이 두 곳뿐이에요. 기둥 뒤에 숨어 다가가요.', theme: 'abyss',
    walls: [[8, 6, 14, 3]],
    wallIf: (i, j, W, H) => { const ax = Math.abs(i + 0.5 - W / 2), ay = Math.abs(j + 0.5 - H / 2); if (ax < 22 && ay < 14) return (ax >= 19 && !(ay < 6)) || (ay >= 11 && ax < 22); return false; },
    colIf: (i, j, W, H) => { const ax = Math.abs(i + 0.5 - W / 2), ay = Math.abs(j + 0.5 - H / 2); if (ax < 24 && ay < 16) return false; return ax < 66 && ay < 48 && Math.abs(ax % 20 - 10.5) < 1.5 && Math.abs(ay % 18 - 9.5) < 1.5; },   // 흩어진 장애물은 벽이 아니라 둥근 기둥이에요
    fl: [[8, 60], [26, 48]], mid: [[56, 36], [30, 20]], pil: [[20, 10], [40, 26]] },
  { name: '사막 신전', line: '가운데 신전 안에 깃발이 있어요. 신전 문은 닫혀 있다가 주기적으로 열리고, 문이 열려 있을 때만 그 깃발을 차지할 수 있어요. 가끔 모래폭풍이 불어 멀리가 안 보여요.', theme: 'desert',
    walls: [[45, 28, 6, 3], [45, 28, 3, 5], [14, 12, 12, 3], [22, 5, 3, 9], [8, 25, 8, 3]],
    gates: [['h', 0], ['v', 1]],
    fl: [[10, 42], [30, 60]], mid: [[56, 36], [30, 17]], pil: [[14, 6], [44, 10], [22, 22], [6, 30], [38, 18]] },
  // 왕의 길: 왼쪽 아래(푸른)와 오른쪽 위(붉은) 진지 사이에 위쪽 길·가운데 길·아래쪽 길이 있고, 길 사이 숲 속에 빈터가 있어요 (180도 돌려도 똑같아요)
  { name: '왕의 길', line: '두 진지 사이에 위쪽 길, 가운데 대각선 길, 아래쪽 길이 있어요. 길 사이 숲 속 빈터에도 깃발이 있어서 샛길로 돌아 들어갈 수 있어요.', theme: 'forest',
    walls: [],
    wallIf: (i, j, W, H) => {
      const o = (u, v) => u < 0.085 || v < 0.085 || Math.abs(u + v - 1) < 0.06 || (u < 0.2 && v > 0.8)   // 위쪽 길(왼쪽 가장자리+위쪽 가장자리), 가운데 대각선 길, 진지 방
        || Math.hypot((u - 0.27) * W, (v - 0.25) * H) < 15 || (Math.abs(u - 0.27) * W < 4 && v < 0.25) || (Math.abs(v - 0.25) * H < 4 && u < 0.27)   // 숲 빈터와 위·왼쪽 길로 나가는 샛길
        || (u > 0.27 && u < 0.5 && Math.abs((u - 0.27) - (v - 0.25)) < 0.022);   // 빈터에서 가운데 길로 이어지는 샛길
      const u = (i + 0.5) / W, v = (j + 0.5) / H;
      return !(o(u, v) || o(1 - u, 1 - v));
    },
    fl: [[8, 63], [6, 40]], mid: [[56, 36], [30, 18]], pil: [[20, 6], [40, 6], [6, 20], [16, 52], [28, 66], [30, 30], [46, 30]] }
];
function arenaMap(def) {
  const m = genMap(777, [{ name: T('전장'), line: T(def.line), boss: 1 }], { noSecret: 1, noMimic: 1, st: { cols: 1 } });
  // 아래 도면은 112×72칸 기준이고, 가로세로 2.5배로 키워서 깃발 사이를 멀리 벌려요 (담 두께는 그대로)
  const AW = 280, AH = 182, ox = 6, oy = 6, SX = AW / 112, SY = AH / 72;
  m.w = AW + ox * 2; m.h = AH + oy * 2;
  m.areas[0].r = [[ox, oy, AW, AH]];
  const sc = ([x, y]) => [Math.round(x * SX), Math.round(y * SY)], wallSc = ([x, y, w, h]) => { const [a, b] = sc([x, y]); return [a, b, w > 4 ? Math.round(w * SX) : w, h > 4 ? Math.round(h * SY) : h]; };
  def = Object.assign({}, def, { walls: def.walls.map(wallSc), fl: def.fl.map(sc), mid: def.mid.map(sc), pil: def.pil.map(sc) });
  const mr = ([x, y]) => [AW - 1 - x, AH - 1 - y], sp = [[11, AH - 11], [AW - 12, 10]];
  const fl = [...def.fl.map(([x, y]) => [x, y, 0]), ...def.fl.map(p => [...mr(p), 1]), [...def.mid[0], -1], [...def.mid[1], -1], [...mr(def.mid[1]), -1]];
  // 왼쪽 위 사분면만 적어 두면 좌우·위아래로 뒤집어 네 쪽 모두 똑같이 만들어요
  const walls = []; for (const [x, y, w, h] of def.walls) walls.push([x, y, w, h], [AW - x - w, y, w, h], [x, AH - y - h, w, h], [AW - x - w, AH - y - h, w, h]);
  const g = new Uint8Array(AW * AH).fill(1);
  for (const [x, y, w, h] of walls) for (let j = Math.max(0, y); j < Math.min(AH, y + h); j++) for (let i = Math.max(0, x); i < Math.min(AW, x + w); i++) g[j * AW + i] = 0;
  if (def.wallIf) for (let j = 0; j < AH; j++) for (let i = 0; i < AW; i++) if (def.wallIf(i, j, AW, AH)) g[j * AW + i] = 0;   // 모양이 둥근 지도는 칸마다 벽인지 따져요 (180도 돌려도 같아야 해요)
  m.cols = [];   // 기둥: 칸 덩어리마다 가운데와 너비를 적어 둬요 (화면에서 벽돌 대신 둥근 기둥을 세워요)
  if (def.colIf) { const seen = new Set(); for (let j = 0; j < AH; j++) for (let i = 0; i < AW; i++) { if (!def.colIf(i, j, AW, AH) || seen.has(j * AW + i)) continue; const st = [[i, j]], cs = []; seen.add(j * AW + i); while (st.length) { const [a, b] = st.pop(); cs.push([a, b]); g[b * AW + a] = 0; for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = a + da, v = b + db; if (u >= 0 && v >= 0 && u < AW && v < AH && !seen.has(v * AW + u) && def.colIf(u, v, AW, AH)) { seen.add(v * AW + u); st.push([u, v]); } } } const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]); m.cols.push([ox + (Math.min(...xs) + Math.max(...xs) + 1) / 2, oy + (Math.min(...ys) + Math.max(...ys) + 1) / 2, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 1]); } }
  const floors = [];
  for (let j = 0; j < AH; j++) { let i = 0; while (i < AW) { if (!g[j * AW + i]) { i++; continue; } let k = i; while (k < AW && g[j * AW + k]) k++; const up = floors.find(f => f[1] + f[3] === j + oy && f[0] === i + ox && f[2] === k - i); if (up) up[3]++; else floors.push([i + ox, j + oy, k - i, 1]); i = k; } }
  m.floors = floors;
  const pil = []; for (const [x, y] of def.pil) pil.push([x, y], [AW - 1 - x, y], [x, AH - 1 - y], [AW - 1 - x, AH - 1 - y]);
  m.pillars = pil.filter(([x, y]) => g[Math.round(y) * AW + Math.round(x)]).map(([x, y]) => [ox + Math.round(x), oy + Math.round(y)]);
  m.tspawn = sp.map(([x, y]) => [ox + x, oy + y]);
  m.tflags = fl.map(([x, y, o]) => [ox + Math.round(x), oy + Math.round(y), o]);
  m.boss = [ox + (AW >> 1), oy + (AH >> 1)]; m.bossTrig = [0, 0, 0, 0]; m.start = m.tspawn[0]; m.route = [m.boss];
  m.doors = (def.gates || []).flatMap(([t, k]) => { const [x, y, w, h] = def.walls[k]; return t === 'h' ? [[x + w, y, AW - 2 * x - 2 * w, h], [x + w, AH - y - h, AW - 2 * x - 2 * w, h]] : [[x, y + h, w, AH - 2 * y - 2 * h], [AW - x - w, y + h, w, AH - 2 * y - 2 * h]]; }).map(([x, y, w, h]) => [ox + x, oy + y, w, h]);   // 신전 문: 닫히면 막히고 열리면 지나가요
  m.spawns = []; m.traps = []; m.fires = []; m.altars = []; m.chests = []; m.secrets = []; m.puzzles = []; m.darks = []; m.pits = []; m.lifts = []; m.fork = null; m.niches = {}; m.mimic = -1;
  return m;
}
export const CHAPTERS = ARENAS.map((d, i) => ({ id: i + 1, pvp: 1, title: T(d.name), place: T(d.name), diff: 1, introT: 3.5, boss: {}, theme: d.theme, map: arenaMap(d) }));
// 투기장 분위기: 판마다 고르거나 무작위 (바닥·벽·하늘 색이 달라져요)
export const ARENA_THEMES = [{ id: 'dungeon', name: T('지하 투기장') }, { id: 'forest', name: T('숲') }, { id: 'frost', name: T('얼음 성') }, { id: 'temple', name: T('불의 사원') }, { id: 'abyss', name: T('심연') }, { id: 'deep', name: T('끝없는 심연') }, { id: 'harbor', name: T('해적 항구') }, { id: 'tower', name: T('시계탑') }, { id: 'sewer', name: T('지하 수로') }, { id: 'desert', name: T('사막 신전') }];
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
export const DEEP_I = 20;
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
  { id: 'first', name: T('첫 대전'), desc: T('대전을 처음 시작해요.') },
  { id: 'win', name: T('마지막 한 명'), desc: T('마지막까지 살아남아 우승해요.') },
  { id: 'winall', name: T('일곱 직업의 왕관'), desc: T('일곱 직업으로 모두 한 번 이상 우승해요.') },
  { id: 'kill3', name: T('연속 탈락'), desc: T('한 판에 세 명 이상을 쓰러뜨려요.') },
  { id: 'pdodge', name: T('종이 한 장 차이'), desc: T('공격이 닿기 직전에 굴러서 피해요.') },
  { id: 'friends', name: T('함께하는 대전'), desc: T('친구와 같은 방에서 대전해요.') }
];

// 갈림길 중간 보스 (장마다 이름이 달라요): 첫째는 돌격형, 둘째는 부하를 부르는 소환형
export const MIDB = [
  [T('무덤 파수꾼'), T('뼈 소환사')], [T('분노한 늑대왕'), T('숲의 주술사')], [T('종탑 집행자'), T('물의 사제')], [T('철갑 문지기'), T('탑의 연금술사')],
  [T('서리 창기병'), T('눈보라 마녀')], [T('광산 감독관'), T('갱도 주술사')], [T('성소 수호기사'), T('향로의 사제')], [T('심연의 사냥개'), T('그림자 소환자')]
];
export const GEAR_TIERS = ['낡은', '쓸만한', '명장의'];
export const GEAR_COST = [0, 120, 320];
// 겉모습 꾸미기: 능력치는 그대로, 명예로 사서 모든 역할에 입혀요
export const COSMETICS = {
  cape: { name: T('망토 색'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'crimson', name: T('진홍'), cost: 60, col: 0xa02030 }, { id: 'forest', name: T('숲 녹색'), cost: 60, col: 0x2f6a3a }, { id: 'violet', name: T('보랏빛'), cost: 90, col: 0x6a3a9a }, { id: 'dawn', name: T('새벽 금빛'), cost: 160, col: 0xd4a63a }] },
  helm: { name: T('투구 장식'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'plume', name: T('붉은 깃털'), cost: 80 }, { id: 'horns', name: T('뼈 뿔'), cost: 100 }, { id: 'wreath', name: T('월계관'), cost: 120 }, { id: 'crown', name: T('작은 왕관'), cost: 220 }, { id: 'halo', name: T('빛 고리'), cost: 260 }, { id: 'antlers', name: T('사슴뿔'), cost: 140 }] },
  emblem: { name: T('방패 문장'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'cross', name: T('십자'), cost: 70 }, { id: 'star', name: T('별'), cost: 90 }, { id: 'flame', name: T('불꽃'), cost: 110 }, { id: 'moon', name: T('달'), cost: 140 }, { id: 'skull', name: T('해골'), cost: 120 }, { id: 'leaf', name: T('잎사귀'), cost: 90 }] },
  skin: { name: T('스킨'), items: [{ id: '', name: T('기본'), cost: 0 }, { id: 'shadow', name: T('칠흑'), cost: 240, b: 0x2c2a36, l: 0x1c1a24, c: 0x6a3a9a }, { id: 'snow', name: T('눈서리'), cost: 240, b: 0xdce6f2, l: 0x8a9ab0, c: 0x6ab0e8 }, { id: 'ember', name: T('불씨'), cost: 300, b: 0xb0381a, l: 0x4a1c12, c: 0xff8a2a }, { id: 'gilded', name: T('황금빛'), cost: 420, b: 0xc8a040, l: 0x6a5420, c: 0xfff0b0 }, { id: 'mint', name: T('박하빛'), cost: 200, b: 0x4ab89a, l: 0x2a5a52, c: 0xd8fff0 }] },
  back: { name: T('등 장식'), items: [{ id: '', name: T('없음'), cost: 0 }, { id: 'banner', name: T('등깃발'), cost: 150 }, { id: 'wings', name: T('작은 날개'), cost: 320 }, { id: 'lantern', name: T('등불'), cost: 180 }] }
};
export const GEAR_BONUS = { weapon: [0, 0.1, 0.22], armor: [0, 15, 35] };
export function roleLevel(xp) { return Math.min(10, 1 + Math.floor(Math.sqrt((xp || 0) / 25))); }

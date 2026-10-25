// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 숫자와 이름

export const BUILD = 1, VERSION = '0.1';

// 섬: 육각 타일, 가운데에서 RING칸까지
export const RING = 5, HEX = 1.5;
export const TARGET = 30;          // 왕관을 이만큼(초) 들고 있으면 승리
export const SHRINK_AT = 40, SHRINK_EVERY = 14, MIN_RING = 2; // 섬이 바깥부터 무너지는 시점과 간격
export const KO_PTS = 1;           // 남을 떨어뜨리면 받는 점수
export const MAX_PLAYERS = 6;
export const FALL_Y = -14, RESPAWN = 3;

// 무기: 기본 공격은 꾹 눌러 모았다가 놓으면 휘둘러요 (모을수록 멀리 날려요)
export const WEPS = {
  hammer: { name: '망치', desc: '느리지만 가장 멀리 날려요', range: 2.3, arc: 2.1, chg: 0.9, cd: 0.55, dmg: [7, 18], kb: [8, 19], swing: 0.32, spd: 5.6,
    sk: { name: '땅 울리기', desc: '앞을 내리쳐 주변을 날리고 바닥을 깨요 (잠시 뒤 다시 자라요)', cd: 7 } },
  spear: { name: '창', desc: '길게 찌르고, 돌진으로 파고들어요', range: 3.4, arc: 0.8, chg: 0.6, cd: 0.42, dmg: [5, 12], kb: [7, 15], swing: 0.25, spd: 6.0,
    sk: { name: '돌진 찌르기', desc: '앞으로 빠르게 뛰어들며 부딪힌 상대를 날려요', cd: 6 } },
  fist: { name: '주먹', desc: '빠르게 연타하고, 붙잡아 뒤로 던져요', range: 1.7, arc: 1.9, chg: 0.4, cd: 0.22, dmg: [4, 9], kb: [5, 12], swing: 0.16, spd: 6.6,
    sk: { name: '잡아 던지기', desc: '앞의 상대를 붙잡아 등 뒤로 던져요', cd: 6 } }
};
export const WEP_IDS = ['hammer', 'spear', 'fist'];
export const DASH = { spd: 19, t: 0.17, cd: 1.1 };

export const COLORS = [
  { id: 'red', name: '빨강', c: 0xd9483b },
  { id: 'blue', name: '파랑', c: 0x3b78d9 },
  { id: 'green', name: '초록', c: 0x48a84a },
  { id: 'yellow', name: '노랑', c: 0xe0b52e },
  { id: 'purple', name: '보라', c: 0x8a52c8 },
  { id: 'orange', name: '주황', c: 0xe57a2a }
];
export const BOT_NAMES = ['데굴이', '휘청이', '꽈당이', '비틀이', '아슬이', '쿵쾅이'];

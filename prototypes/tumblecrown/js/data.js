// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 게임 숫자와 이름

export const BUILD = 7, VERSION = '0.1';

// 방 바닥: 네모 칸. 바깥 고리부터 무너져요
export const RING = 7, CELL = 3, NX = 7, NZ = 6;   // 방 바닥: 가로 13칸 x 세로 11칸, 한 칸 3m (Vowkeep 1장 단장의 방을 넓힌 모양)
export const SHRINK_AT = 20, SHRINK_EVERY = 7, MIN_RING = -1; // 섬이 바깥부터 무너지는 시점과 간격
export const MAX_PLAYERS = 6;
export const FALL_Y = -14;

// 직업: 기본 공격은 꾹 눌러 모았다가 놓으면 나가요 (모을수록 멀리 날려요)
// proj: 화살·마법 구슬처럼 날아가는 공격 / sk.kind: 기술 종류 (sim.js)
// st: 선택 화면 막대 (힘, 속도, 사거리, 난이도) 1~5
export const CLS = {
  knight: { name: '기사', desc: '칼과 방패로 버티는 기본기 좋은 전사', range: 2.3, arc: 2.0, chg: 0.7, cd: 0.42, dmg: [6, 14], kb: [8, 16], swing: 0.26, spd: 5.6, st: [3, 3, 2, 1],
    atk: '칼 베기', sk: { kind: 'bash', name: '방패 돌진', desc: '방패를 앞세워 뛰어들어 부딪힌 상대를 날려요', cd: 6 } },
  priest: { name: '사제', desc: '빛으로 밀어내고 스스로 상처를 낫게 해요', range: 2.0, arc: 2.2, chg: 0.6, cd: 0.45, dmg: [5, 11], kb: [7, 13], swing: 0.26, spd: 5.6, st: [2, 3, 2, 2],
    atk: '지팡이 치기', sk: { kind: 'nova', name: '빛의 폭발', desc: '주변을 빛으로 밀어내고 내 %를 25 낮춰요', cd: 9 } },
  hunter: { name: '사냥꾼', desc: '멀리서 화살로 밀어 떨어뜨려요', range: 1.6, arc: 1.6, chg: 0.8, cd: 0.5, dmg: [4, 11], kb: [6, 14], swing: 0.22, spd: 6.0, st: [2, 4, 5, 3], proj: 'arrow',
    atk: '활 쏘기 (모을수록 빠르고 멀리)', sk: { kind: 'volley', name: '세 갈래 화살', desc: '화살 세 대를 부채꼴로 한꺼번에 쏴요', cd: 6 } },
  viking: { name: '바이킹', desc: '느리지만 도끼 한 방이 가장 무거워요', range: 2.4, arc: 2.2, chg: 1.0, cd: 0.6, dmg: [8, 19], kb: [9, 20], swing: 0.34, spd: 5.3, st: [5, 2, 3, 2],
    atk: '도끼 내리치기', sk: { kind: 'spin', name: '회오리 도끼', desc: '도끼를 휘두르며 한 바퀴 돌아 둘레를 모두 날려요', cd: 7 } },
  mamluk: { name: '맘루크', desc: '굽은 칼로 빠르게 베고 질주해 파고들어요', range: 2.0, arc: 1.8, chg: 0.4, cd: 0.24, dmg: [4, 9], kb: [5, 12], swing: 0.17, spd: 6.5, st: [2, 5, 2, 3],
    atk: '굽은 칼 연속 베기', sk: { kind: 'lunge', name: '질주 베기', desc: '앞으로 빠르게 질주하며 지나간 상대를 날려요', cd: 6 } },
  witch: { name: '마녀', desc: '터지는 마법 구슬과 바닥을 깨는 저주', range: 1.6, arc: 1.6, chg: 0.7, cd: 0.7, dmg: [6, 13], kb: [8, 15], swing: 0.24, spd: 5.5, st: [3, 2, 4, 4], proj: 'orb',
    atk: '마법 구슬 (닿으면 터져요)', sk: { kind: 'curse', name: '땅 저주', desc: '조준한 곳의 바닥을 깨뜨려 떨어뜨려요 (잠시 뒤 다시 생겨요)', cd: 8 } },
  skeleton: { name: '스켈레톤', desc: '가볍고 빠른 뼈다귀, 붙잡아 던져요', range: 1.8, arc: 2.0, chg: 0.4, cd: 0.22, dmg: [4, 9], kb: [5, 12], swing: 0.16, spd: 6.4, st: [2, 4, 1, 4],
    atk: '뼈 몽둥이', sk: { kind: 'grab', name: '잡아 던지기', desc: '앞의 상대를 붙잡아 등 뒤로 던져요', cd: 6 } }
};
// 캐릭터가 커진 만큼 무기 닿는 거리도 늘려요
for (const k in CLS) CLS[k].range *= 1.25;
export const CLS_IDS = ['knight', 'priest', 'hunter', 'viking', 'mamluk', 'witch', 'skeleton'];
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

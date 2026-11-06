// Tumblecrown · © 2026 Frenchfries777 · CC BY-NC-ND 4.0
// 리플레이: 한 판의 시작 조건(씨앗·지도·모드·참가자)과 사람들이 낸 입력만 저장했다가, 같은 규칙으로 다시 돌려서 보여 줘요.
// 규칙은 일정한 간격(1/30초)으로 정해진 대로만 움직이므로 같은 입력을 넣으면 똑같이 다시 일어나요 (봇도 같은 씨앗을 써요).
import { createGame, step, koPlayer, callBots, surVote, chooseBless } from './sim.js';
import { BUILD } from './data.js';

const MAX_KEEP = 6;
let R = null;   // 지금 녹화 중인 판

const q3 = v => typeof v === 'number' ? (isFinite(v) ? Math.round(v * 1000) / 1000 : 0) : v;

/* ---------- 녹화 ---------- */
export function recStart(G, slots, ch, meId, seed) {
  R = { v: 1, build: BUILD, seed, ch, mode: G.mode, me: meId || '', slots: JSON.parse(JSON.stringify(slots)), lite0: !!G.lite, ops: [], k: 0, last: {}, bot: {}, gone: {}, lite: !!G.lite, t: Date.now(), G };
  for (const p of G.players) R.bot[p.id] = !!p.bot;
}
export function recOn() { return !!R; }
// 규칙을 한 번 돌리기 직전에 불러요: 사람이 낸 입력을 소수 셋째 자리로 맞추고(화면에 보이는 판도 똑같이 맞춰져요), 바뀐 것만 적어요
export function recPre(G, rin) {
  if (!R || R.G !== G) return;
  const k = R.k++;
  if (G.lite !== R.lite) { R.lite = G.lite; R.ops.push([k, 'l', G.lite ? 1 : 0]); }
  for (const p of G.players) {
    if (!!p.bot !== R.bot[p.id]) { R.bot[p.id] = !!p.bot; R.ops.push([k, 'b', p.id, p.bot ? 1 : 0]); }
    if (p.gone && !R.gone[p.id]) { R.gone[p.id] = 1; R.ops.push([k, 'g', p.id]); }
    if (p.bot) continue;
    const r = rin[p.id]; if (!r) continue;
    for (const key in r) r[key] = q3(r[key]);
    const s = JSON.stringify(r);
    if (s !== R.last[p.id]) { R.last[p.id] = s; R.ops.push([k, 'i', p.id, JSON.parse(s)]); }
  }
}
// 입력이 아닌 방식으로 규칙에 닿는 일들 (봇 부르기 'c', 항복 투표 's', 축복 고르기 'z')
export function recOp(G, ...a) { if (R && R.G === G) R.ops.push([R.k, ...a]); }
export function recFinish(G, snap) {
  if (!R || R.G !== G) return null;
  const rep = R; R = null; delete rep.G; delete rep.last; delete rep.bot; delete rep.gone;
  rep.n = rep.k; rep.dur = Math.round(rep.k / 30); rep.wtm = snap && snap.wtm != null ? snap.wtm : -1;
  rep.id = 'r' + rep.t;
  return rep;
}
export function recDrop() { R = null; }

/* ---------- 보관 (브라우저 안, 최근 6판) ---------- */
function db() {
  return new Promise((ok, no) => {
    try {
      const rq = indexedDB.open('tc-replays', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('r', { keyPath: 'id' });
      rq.onsuccess = () => ok(rq.result); rq.onerror = () => no(rq.error);
    } catch (e) { no(e); }
  });
}
async function pack(rep) {
  const txt = JSON.stringify(rep);
  try {
    if (typeof CompressionStream === 'undefined') return { z: 0, d: txt };
    const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'));
    return { z: 1, d: await new Response(cs).blob() };
  } catch (e) { return { z: 0, d: txt }; }
}
async function unpack(row) {
  if (!row.z) return JSON.parse(row.d);
  const ds = row.d.stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(ds).text());
}
const meta = rep => ({ id: rep.id, t: rep.t, build: rep.build, mode: rep.mode, ch: rep.ch, me: rep.me, dur: rep.dur, wtm: rep.wtm, role: ((rep.slots.find(s => s.id === rep.me)) || {}).role || '', team: ((rep.slots.find(s => s.id === rep.me)) || {}).team });
export async function repSave(rep) {
  const d = await db(), row = Object.assign({ id: rep.id, m: meta(rep) }, await pack(rep));
  await new Promise((ok, no) => { const tx = d.transaction('r', 'readwrite'); tx.objectStore('r').put(row); tx.oncomplete = ok; tx.onerror = () => no(tx.error); });
  const all = await repList();
  for (const m of all.slice(MAX_KEEP)) await repDel(m.id);   // 오래된 것부터 지워요
  return rep.id;
}
export async function repList() {
  const d = await db();
  const rows = await new Promise((ok, no) => { const rq = d.transaction('r').objectStore('r').getAll(); rq.onsuccess = () => ok(rq.result); rq.onerror = () => no(rq.error); });
  return rows.map(r => r.m).sort((a, b) => b.t - a.t);
}
export async function repGet(id) {
  const d = await db();
  const row = await new Promise((ok, no) => { const rq = d.transaction('r').objectStore('r').get(id); rq.onsuccess = () => ok(rq.result); rq.onerror = () => no(rq.error); });
  return row ? unpack(row) : null;
}
export async function repDel(id) {
  const d = await db();
  await new Promise((ok, no) => { const tx = d.transaction('r', 'readwrite'); tx.objectStore('r').delete(id); tx.oncomplete = ok; tx.onerror = () => no(tx.error); });
}
// 파일로 내려받기·열기 (.tcr = 압축한 리플레이)
export async function repBlob(rep) { const p = await pack(rep); return p.z ? p.d : new Blob([p.d]); }
export async function repFromFile(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) return JSON.parse(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  return JSON.parse(new TextDecoder().decode(buf));
}

/* ---------- 재생 ---------- */
export function playStart(rep) {
  const G = createGame(rep.slots, rep.seed, rep.ch, rep.mode);
  G.lite = !!rep.lite0;
  return { rep, G, k: 0, i: 0, cur: {} };
}
// 규칙을 한 번 돌리기 직전에 불러요: 이 틱에 일어난 일을 적용하고, 사람의 입력을 만들어 줘요
export function playPre(P) {
  const { G, rep } = P, ops = rep.ops;
  while (P.i < ops.length && ops[P.i][0] <= P.k) {
    const o = ops[P.i++];
    if (o[1] === 'i') P.cur[o[2]] = o[3];
    else if (o[1] === 'l') G.lite = !!o[2];
    else if (o[1] === 'b') { const p = G.players.find(q => q.id === o[2]); if (p) { p.bot = !!o[3]; G.humans = G.players.filter(q => !q.bot).length; } }
    else if (o[1] === 'g') { const p = G.players.find(q => q.id === o[2]); if (p && !p.gone) { p.gone = true; if (!p.dead) koPlayer(G, p, null); p.respT = 1e9; } }
    else if (o[1] === 'c') callBots(G, o[2], o[3], o[4]);
    else if (o[1] === 's') { const p = G.players.find(q => q.id === o[2]); if (p) surVote(G, p); }
    else if (o[1] === 'z') chooseBless(G, o[2], o[3]);
  }
  P.k++;
  const inp = {};
  for (const id in P.cur) inp[id] = Object.assign({}, P.cur[id]);
  return inp;
}
// 규칙을 한 번 돌린 직후에 불러요: 한 번 누르는 입력은 쓰고 나면 지워요 (실제 판에서 하는 일과 같아야 봇의 판단도 똑같아요)
export function playPost(inp) { for (const id in inp) { const r = inp[id]; r.q = r.e = r.r = r.roll = r.skip = r.atkR = r.rcl = 0; } }
export function playDone(P) { return P.k >= P.rep.n; }
export { step };

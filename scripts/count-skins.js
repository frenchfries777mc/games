// 게임들의 스킨 수를 세어 skins.json 으로 저장해요. (node scripts/count-skins.js)
// Stickseum: 상점 스킨 + 새 스킨(NEW_SKINS) + 티어 전용(TIER_SKINS, 캐릭터당 2개) + 시즌 전용. Beaconfall: SKINS 배열.
// Crown Envoy·Isleport 는 캐릭터 스킨이 없어요 (국기·장식은 세지 않아요).
const fs=require('fs'), vm=require('vm'), path=require('path'), root=path.join(__dirname,'..');
function arr(src,name){ const a=src.indexOf('const '+name+'='); const e=src.indexOf('\n]',a)+2; const c={}; vm.createContext(c); vm.runInContext(src.slice(a,e)+';this.R='+name,c); return c.R; }
const st=fs.readFileSync(path.join(root,'stickseum/Stickseum-latest.html'),'utf8');
const a=st.indexOf('const COSMETICS={'), e=st.indexOf('\n};',a);
const shop=(st.slice(a,e).match(/cat:'skin'/g)||[]).length;
const season=(st.match(/COSMETICS\.skin_\w+=\{cat:'skin'/g)||[]).length;
const stickseum=shop+arr(st,'NEW_SKINS').length+season+arr(st,'TIER_SKINS').length*2;
const bf=fs.readFileSync(path.join(root,'beaconfall/BEACONFALL-v0.5.html'),'utf8');
const beaconfall=arr(bf,'SKINS').length;
const out={stickseum,beaconfall,crownenvoy:0,isleport:0,total:stickseum+beaconfall};
fs.writeFileSync(path.join(root,'skins.json'),JSON.stringify(out)+'\n'); console.log(out,{shop,season});

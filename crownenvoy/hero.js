/* 첫 화면 배경: 유럽 지도 위에서 두 나라가 영토를 뺏고 뺏기는 장면 (깃발·점령 효과) */
(function(){
const cv=document.getElementById('heroCv'),M=window.HERO_MAP;if(!cv||!M)return;
const ctx=cv.getContext('2d');
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const MW=1000,MH=700,A=M.A,B=M.B;
const COL=M.nat.map(n=>n[0]);const NEU='#8b8566';
const col=o=>o>=0?COL[o]:NEU;
const regs=M.regs.map((r,i)=>{const P=new Path2D();r.p.forEach(ring=>{P.moveTo(ring[0],ring[1]);for(let k=2;k<ring.length;k+=2)P.lineTo(ring[k],ring[k+1]);P.closePath();});
  return {P,x:r.c[0],y:r.c[1],o:r.o,from:r.o,t:1,adj:M.adj[i]};});
const base={[A]:regs.filter(r=>r.o===A).length,[B]:regs.filter(r=>r.o===B).length};
const F=M.f;
let W=0,H=0,dpr=1,sc=1,ox=0,oy=0;
function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth||innerWidth;H=cv.clientHeight||600;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  const wide=W>H*1.1;sc=Math.max(W/MW,H/MH)*(wide?1.9:2.3);
  const fx=wide?.7:.5,fy=wide?.36:.3;ox=W*fx-F[0]*sc;oy=H*fy-F[1]*sc;}
const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`;};
const mix=(h1,h2,t)=>{const a=parseInt(h1.slice(1),16),b=parseInt(h2.slice(1),16);const f=(s)=>Math.round(((a>>s)&255)*(1-t)+((b>>s)&255)*t);return `rgb(${f(16)},${f(8)},${f(0)})`;};
let FX=[],FL=[];
let tNext=1800,now=0,lastOwnerFlag=null;
const rnd=(a,b)=>a+Math.random()*(b-a);
function pickCapture(){
  const dA=regs.filter(r=>r.o===A).length-base[A];           // A가 늘었으면 B가 되찾을 차례가 되기 쉽다
  let pA=Math.min(.82,Math.max(.18,.5-dA*.17));if(lastOwnerFlag&&Math.random()<.28)pA=lastOwnerFlag===A?.9:.1;
  const att=Math.random()<pA?A:B,def=att===A?B:A;
  const cand=[];regs.forEach((r,i)=>{if(r.o!==def)return;if(!r.adj.some(j=>regs[j].o===att))return;const d=Math.hypot(r.x-F[0],r.y-F[1]);cand.push([i,1/(1+d/70)]);});
  if(!cand.length)return null;let s=cand.reduce((a,c)=>a+c[1],0),x=Math.random()*s,pick=cand[0][0];for(const c of cand){x-=c[1];if(x<=0){pick=c[0];break;}}
  return {i:pick,att};}
function capture(){const c=pickCapture();if(!c)return;const r=regs[c.i];r.from=r.o;r.o=c.att;r.t=0;lastOwnerFlag=c.att;
  const k=col(c.att);FX.push({k:'ring',x:r.x,y:r.y,t:0,c:k},{k:'ring',x:r.x,y:r.y,t:-.12,c:'#ffffff'});
  for(let n=0;n<26;n++){const a=Math.random()*6.283,v=rnd(.4,1.9);FX.push({k:'sp',x:r.x,y:r.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.5,t:0,l:rnd(.5,1.1),c:Math.random()<.5?k:'#ffe9a8'});}
  for(let n=0;n<7;n++)FX.push({k:'sm',x:r.x+rnd(-6,6),y:r.y+rnd(-4,4),vx:rnd(-.1,.1),vy:rnd(-.45,-.15),t:0,l:rnd(1.4,2.4),r:rnd(5,11)});
  FL=FL.filter(f=>f.i!==c.i);FL.push({i:c.i,x:r.x,y:r.y,c:k,t:0,ph:Math.random()*6});if(FL.length>7)FL.shift();}
function drawFlag(f,dt){f.t+=dt;const grow=Math.min(1,f.t/.55),fade=f.t>6.5?Math.max(0,1-(f.t-6.5)/1.2):1;if(fade<=0)return false;
  ctx.save();ctx.globalAlpha=fade;ctx.translate(f.x,f.y);const h=22*grow;
  ctx.strokeStyle='#3a2a1a';ctx.lineWidth=1.8/sc*1.25;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-h);ctx.stroke();
  if(grow>.5){const w=15,ph=now*4+f.ph;ctx.fillStyle=f.c;ctx.beginPath();ctx.moveTo(0,-h);
    for(let k=0;k<=6;k++){const u=k/6;ctx.lineTo(u*w,-h+Math.sin(ph+u*4)*1.6*u);}
    for(let k=6;k>=0;k--){const u=k/6;ctx.lineTo(u*w,-h+9+Math.sin(ph+u*4)*1.6*u);}
    ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9/sc*1.25;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(0,-h+3.6,w*.9,1.4);}
  ctx.fillStyle='#3a2a1a';ctx.beginPath();ctx.arc(0,0,1.6,0,6.3);ctx.fill();ctx.restore();return true;}
let last=0;
function frame(ts){requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min(.05,(ts-last)/1000||0);last=ts;now+=dt;
  if(!reduce){tNext-=dt*1000;if(tNext<=0){capture();tNext=rnd(2300,3900);}}
  draw(dt);}
function draw(dt){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#10315f');g.addColorStop(1,'#0a2147');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(ox,oy);ctx.scale(sc,sc);
  ctx.lineJoin='round';
  regs.forEach(r=>{if(r.t<1)r.t=Math.min(1,r.t+dt/.7);const c=r.t<1?mix(col(r.from).length===7?col(r.from):NEU,col(r.o).length===7?col(r.o):NEU,r.t):col(r.o);
    ctx.fillStyle=c;ctx.fill(r.P);});
  ctx.strokeStyle='rgba(8,16,32,.55)';ctx.lineWidth=.7/sc*1.25;regs.forEach(r=>ctx.stroke(r.P));
  // 두 나라 윤곽을 살짝 강조
  ctx.lineWidth=1.6/sc*1.25;regs.forEach(r=>{if(r.o===A||r.o===B){ctx.strokeStyle=hexA(col(r.o),.0);}});
  // 효과
  FX=FX.filter(f=>{f.t+=dt;
    if(f.k==='ring'){if(f.t<0)return true;const u=f.t/.9;if(u>=1)return false;ctx.strokeStyle=hexA(f.c.length===7?f.c:'#ffffff',(1-u)*.9);ctx.lineWidth=(3.2*(1-u)+.6)/sc*1.25;ctx.beginPath();ctx.arc(f.x,f.y,6+u*46,0,6.3);ctx.stroke();return true;}
    if(f.k==='sp'){if(f.t>f.l)return false;f.x+=f.vx*dt*60*.6;f.y+=f.vy*dt*60*.6;f.vy+=.03;const a=1-f.t/f.l;ctx.fillStyle=f.c.length===7?hexA(f.c,a):f.c;ctx.beginPath();ctx.arc(f.x,f.y,1.9*a+.5,0,6.3);ctx.fill();return true;}
    if(f.k==='sm'){if(f.t>f.l)return false;f.x+=f.vx;f.y+=f.vy*dt*60*.5;const u=f.t/f.l;ctx.fillStyle=`rgba(60,55,50,${.28*(1-u)})`;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.6+u),0,6.3);ctx.fill();return true;}
    return false;});
  FL=FL.filter(f=>drawFlag(f,dt));
  ctx.restore();
  // 바다 가장자리 어둡게
  const v=ctx.createRadialGradient(W*.55,H*.4,Math.min(W,H)*.25,W*.55,H*.4,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(4,10,24,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
size();addEventListener('resize',()=>{size();draw(0);});
try{new ResizeObserver(()=>{size();draw(0);}).observe(cv);}catch(e){}
draw(0);
if(!reduce){for(let i=0;i<2;i++)capture();}
requestAnimationFrame(frame);
})();

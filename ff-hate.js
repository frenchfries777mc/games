/* Newspeak (nw) hero background: the Two Minutes Hate from Orwell's 1984, drawn on a canvas instead of the game videos.
   Telescreen static → Goldstein's face bleating → Eurasian soldiers marching out of the screen → the crowd shouting → Big Brother and the Party slogans.
   Used by the hub pages that have a .hero-bg; does nothing in any other language. */
(function(){
'use strict';
var lang=''; try{ lang=window.FFLang?FFLang.get():''; }catch(e){}
if(lang!=='nw') return;
function start(){
  var bg=document.querySelector('.hero-bg'); if(!bg||bg.getAttribute('data-hate')) return;
  bg.setAttribute('data-hate','1'); bg.innerHTML='';
  var cv=document.createElement('canvas'); cv.className='ff-hate'; bg.appendChild(cv);
  var st=document.createElement('style');
  st.textContent='.hero-bg canvas.ff-hate{position:absolute;top:0;right:0;width:72%;height:100%;opacity:.85;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40%);mask-image:linear-gradient(90deg,transparent 0,#000 40%)}'+
    '@media(max-width:640px){.hero-bg canvas.ff-hate{width:100%;opacity:.5;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 25%);mask-image:linear-gradient(90deg,transparent 0,#000 25%)}}';
  document.head.appendChild(st);
  var g=cv.getContext('2d'), W=0, H=0, DPR=Math.min(window.devicePixelRatio||1,1.5);
  function size(){ var r=cv.getBoundingClientRect(); W=Math.max(1,r.width); H=Math.max(1,r.height); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); g.setTransform(DPR,0,0,DPR,0,0); }
  size(); addEventListener('resize',size);
  var LOOP=26, t0=performance.now(), still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function cl(x){ return x<0?0:x>1?1:x; }
  function fade(t,a,b,f){ f=f||0.8; return cl((t-a)/f)*cl((b-t)/f); }
  function ell(x,y,rx,ry,c){ g.fillStyle=c; g.beginPath(); g.ellipse(x,y,rx,ry,0,0,Math.PI*2); g.fill(); }
  function txt(s,x,y,px,c,al){ g.save(); g.globalAlpha=al; g.fillStyle=c; g.font='700 '+px+'px Oswald,Impact,"Arial Narrow",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(s,x,y); g.restore(); }
  /* Goldstein: white hair standing out, small goatee, spectacles, mouth bleating like a sheep */
  function goldstein(x,y,r,t){
    g.save(); g.translate(x,y);
    for(var i=0;i<11;i++){ var a=Math.PI*(0.95+i*0.11); ell(Math.cos(a)*r*0.82,Math.sin(a)*r*0.9-r*0.05,r*0.3,r*0.26,'#e9e9e9'); }
    ell(0,0,r*0.68,r*0.86,'#b9b9b9');
    ell(-r*0.7,r*0.02,r*0.12,r*0.2,'#a8a8a8'); ell(r*0.7,r*0.02,r*0.12,r*0.2,'#a8a8a8');
    g.strokeStyle='#1d1d1d'; g.lineWidth=r*0.05;
    g.beginPath(); g.arc(-r*0.27,-r*0.12,r*0.18,0,Math.PI*2); g.stroke(); g.beginPath(); g.arc(r*0.27,-r*0.12,r*0.18,0,Math.PI*2); g.stroke();
    g.beginPath(); g.moveTo(-r*0.09,-r*0.12); g.lineTo(r*0.09,-r*0.12); g.stroke();
    ell(-r*0.27,-r*0.1,r*0.05,r*0.05,'#111'); ell(r*0.27,-r*0.1,r*0.05,r*0.05,'#111');
    g.lineWidth=r*0.04; g.beginPath(); g.moveTo(-r*0.45,-r*0.42); g.lineTo(-r*0.12,-r*0.36); g.moveTo(r*0.45,-r*0.42); g.lineTo(r*0.12,-r*0.36); g.stroke();
    g.beginPath(); g.moveTo(0,-r*0.02); g.lineTo(-r*0.07,r*0.2); g.lineTo(r*0.04,r*0.22); g.stroke();
    var m=0.06+0.1*Math.abs(Math.sin(t*9));
    ell(0,r*0.42,r*0.17,r*m+0.01,'#2a0d0d');
    ell(-r*0.12,r*0.32,r*0.14,r*0.05,'#e3e3e3'); ell(r*0.12,r*0.32,r*0.14,r*0.05,'#e3e3e3');
    g.fillStyle='#ececec'; g.beginPath(); g.moveTo(-r*0.18,r*0.6); g.lineTo(r*0.18,r*0.6); g.lineTo(0,r*1.08); g.closePath(); g.fill();
    g.restore();
  }
  /* Big Brother: black hair, heavy black moustache, calm eyes looking straight out */
  function bigBrother(x,y,r){
    g.save(); g.translate(x,y);
    ell(0,r*0.15,r*0.95,r*0.55,'#1b1b1b');
    ell(0,0,r*0.7,r*0.88,'#c9c1b3');
    g.fillStyle='#141414'; g.beginPath(); g.ellipse(0,-r*0.55,r*0.74,r*0.42,0,Math.PI,0); g.fill(); g.fillRect(-r*0.74,-r*0.58,r*0.16,r*0.4); g.fillRect(r*0.58,-r*0.58,r*0.16,r*0.4);
    ell(-r*0.7,0,r*0.12,r*0.2,'#b9b1a3'); ell(r*0.7,0,r*0.12,r*0.2,'#b9b1a3');
    g.fillStyle='#161616'; g.fillRect(-r*0.46,-r*0.32,r*0.34,r*0.08); g.fillRect(r*0.12,-r*0.32,r*0.34,r*0.08);
    ell(-r*0.28,-r*0.14,r*0.09,r*0.07,'#f2efe8'); ell(r*0.28,-r*0.14,r*0.09,r*0.07,'#f2efe8');
    ell(-r*0.28,-r*0.14,r*0.045,r*0.05,'#0c0c0c'); ell(r*0.28,-r*0.14,r*0.045,r*0.05,'#0c0c0c');
    g.strokeStyle='#5d564c'; g.lineWidth=r*0.04; g.beginPath(); g.moveTo(0,-r*0.08); g.lineTo(-r*0.08,r*0.18); g.lineTo(r*0.06,r*0.2); g.stroke();
    g.fillStyle='#101010'; g.beginPath(); g.moveTo(-r*0.42,r*0.42); g.quadraticCurveTo(0,r*0.18,r*0.42,r*0.42); g.quadraticCurveTo(r*0.2,r*0.36,0,r*0.4); g.quadraticCurveTo(-r*0.2,r*0.36,-r*0.42,r*0.42); g.fill();
    g.fillRect(-r*0.36,r*0.3,r*0.72,r*0.1);
    g.fillStyle='#6b5d50'; g.fillRect(-r*0.16,r*0.53,r*0.32,r*0.035);
    g.restore();
  }
  /* a Eurasian soldier: helmet, greatcoat, a sub-machine gun held across the chest, boots marching */
  function soldier(x,y,s,ph){
    g.save(); g.translate(x,y); g.scale(s,s); g.fillStyle='#0d0d0d'; g.strokeStyle='#0d0d0d'; g.lineCap='round';
    var k=Math.sin(ph)*12;
    g.lineWidth=11; g.beginPath(); g.moveTo(-7,-8); g.lineTo(-7+k,40); g.moveTo(7,-8); g.lineTo(7-k,40); g.stroke();
    g.fillRect(-11+k,36,16,8); g.fillRect(-5-k,36,16,8);
    g.beginPath(); g.moveTo(-17,-62); g.lineTo(17,-62); g.lineTo(21,-2); g.lineTo(-21,-2); g.closePath(); g.fill();
    ell(0,-74,11,12,'#0d0d0d');
    g.beginPath(); g.ellipse(0,-80,17,11,0,Math.PI,0); g.fill(); g.fillRect(-19,-81,38,4);
    g.fillStyle='#262626'; g.fillRect(-30,-44,56,8); g.fillRect(-12,-37,7,16); g.fillRect(16,-42,22,4);
    g.fillStyle='#0d0d0d'; g.lineWidth=8; g.beginPath(); g.moveTo(-15,-56); g.lineTo(-20,-38); g.moveTo(15,-56); g.lineTo(10,-38); g.stroke();
    g.restore();
  }
  function frame(now){
    var T=((now-t0)/1000)%LOOP, wide=W>520, cx=wide?W*0.4:W*0.62, cy=H*0.47, R=Math.min(H*0.21,W*0.26);
    g.fillStyle='#0b0c0e'; g.fillRect(0,0,W,H);
    var gl=g.createRadialGradient(cx,cy,R*0.2,cx,cy,R*2.6); gl.addColorStop(0,'#55585e'); gl.addColorStop(0.55,'#2a2c30'); gl.addColorStop(1,'rgba(11,12,14,0)'); g.fillStyle=gl; g.fillRect(0,0,W,H);      /* the telescreen's glow */
    var hate=cl((T-8)/10)*cl((25.5-T)/2);
    /* static at the start and between scenes */
    var noise=fade(T,0,2.2,0.4)+fade(T,7.6,8.6,0.3)*0.7+fade(T,18.8,19.8,0.3)*0.7;
    if(noise>0){ for(var n=0;n<140;n++){ g.fillStyle='rgba(200,200,200,'+(Math.random()*0.35*noise)+')'; g.fillRect(Math.random()*W,Math.random()*H,Math.random()*60+4,2); } }
    var a1=fade(T,1.6,9.2,0.9);
    if(a1>0){ g.save(); g.globalAlpha=a1; var sh=Math.sin(T*23)*2; goldstein(cx+sh,cy-R*0.08,R,T); g.restore(); txt('GOLDSTEIN',cx,cy+R*1.18,Math.max(14,R*0.22),'#e0443e',a1); }
    var a2=fade(T,8.4,19.5,0.8);
    if(a2>0){ g.save(); g.globalAlpha=a2;
      g.fillStyle='#1d1f22'; g.fillRect(0,H*0.82,W,H*0.18);
      for(var z=0;z<5;z++){ var d=((T*0.32+z/5)%1), s=(0.35+d*d*1.9)*(R/90), yy=cy-R*0.4+d*R*2.2, cols=3+Math.floor((1-d)*4);
        for(var c=0;c<cols;c++){ var xx=cx+(c-(cols-1)/2)*(70*s+18); soldier(xx,yy,s,T*7+c+z); } }
      var shake=Math.sin(T*28)*3*a2; g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,H*0.8+shake,W,4);
      g.restore(); }
    var a3=fade(T,13.5,20,0.6);
    if(a3>0){ g.save(); g.globalAlpha=a3; g.fillStyle='#050505';
      for(var p=0;p<26;p++){ var px=(p+0.5)*W/26, b=Math.abs(Math.sin(T*6+p*1.7))*H*0.05, py=H*0.95-b;
        ell(px,py-H*0.07,W/70+6,W/70+6,'#050505'); g.fillRect(px-W/60-6,py-H*0.05,W/30+12,H*0.12);
        if(p%2===0){ g.lineWidth=5; g.strokeStyle='#050505'; g.beginPath(); g.moveTo(px+8,py-H*0.05); g.lineTo(px+20,py-H*0.17-b*0.5); g.stroke(); } }
      g.restore();
      if(Math.floor(T*3)%2===0) txt('HATE! HATE! HATE!',cx,H*0.18,Math.max(16,R*0.26),'#ff3b30',a3); }
    var a4=fade(T,19.2,LOOP+1,1.2);
    if(a4>0){ g.save(); g.globalAlpha=a4; bigBrother(cx,cy-R*0.1,R*1.05); g.restore();
      var L=['WAR IS PEACE','FREEDOM IS SLAVERY','IGNORANCE IS STRENGTH'];
      for(var q=0;q<3;q++) txt(L[q],cx,cy+R*1.08+q*Math.max(16,R*0.2),Math.max(13,R*0.17),'#f1ece2',fade(T,20.5+q*1.1,LOOP+1,0.6)); }
    if(hate>0){ g.fillStyle='rgba(180,20,20,'+(0.22*hate*(0.7+0.3*Math.sin(T*8)))+')'; g.fillRect(0,0,W,H); }
    g.fillStyle='rgba(0,0,0,.22)'; for(var y=0;y<H;y+=3) g.fillRect(0,y,W,1);
  }
  if(still){ t0=performance.now()-21500; frame(performance.now()); return; }
  var run=true, vis=true, last=0;
  function loop(now){ if(!run) return; requestAnimationFrame(loop); if(now-last<33) return; last=now; frame(now); }
  function upd(){ var on=vis&&!document.hidden; if(on&&!run){ run=true; requestAnimationFrame(loop); } else if(!on) run=false; }
  try{ new IntersectionObserver(function(e){ vis=e[0].isIntersecting; upd(); }).observe(bg); }catch(e){}
  document.addEventListener('visibilitychange',upd);
  requestAnimationFrame(loop);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

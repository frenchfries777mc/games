/* © 2026 Frenchfries777. CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
   허브 배경 하늘: 지금 시각과 날짜에 맞는 하늘 색, 해·달 위치, 실제 달 위상을 480x270 도트로 그려요.
   FFSky.draw(ctx, date) : 하늘+해/달+별+구름+먼 언덕까지 그려요 (건물·바닥은 따로 겹치는 PNG)
   FFSky.make(K)         : K배 곱게(예: 4/3 → 640x360)로 같은 하늘을 그려요
   FFSky.info(date)      : 달 나이·위상 이름·밝은 비율·일출/일몰 시각 */
function build(K){
'use strict';
var r_=function(v){return Math.round(v*K)},W=r_(480),H=r_(270),HOR=r_(167),PW=r_(170);
var NIGHT=[[8,10,30],[14,18,48],[22,28,70],[34,40,92],[48,52,112],[60,62,126],[72,70,134]],
    DAWN=[[52,56,110],[110,86,150],[196,128,156],[246,176,152],[255,208,164],[255,232,192],[255,244,216]],
    DAY=[[78,138,220],[104,164,232],[136,190,242],[172,214,248],[204,230,252],[226,242,255],[240,249,255]],
    DUSK=[[22,18,52],[44,26,72],[92,38,88],[166,58,84],[228,104,76],[250,162,88],[255,214,128]];
var CL={night:[[44,52,100],[60,68,120]],dawn:[[236,150,150],[255,196,170]],day:[[246,248,255],[255,255,255]],dusk:[[236,150,120],[250,190,140]]};
var B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
var SYN=29.530588853, NEWMOON=Date.UTC(2000,0,6,18,14);
function mix(a,b,t){ return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
function mixPal(a,b,t){ var o=[]; for(var i=0;i<a.length;i++) o.push(mix(a[i],b[i],t)); return o; }
function sun(date){ /* 위도 약 37도, 한국 표준시 기준의 근사 일출·일몰 */
  var s=Date.UTC(date.getFullYear(),0,0), doy=Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-s)/864e5);
  var len=12+2.9*Math.sin(2*Math.PI*(doy-80)/365.25), noon=12.5;
  return {sr:noon-len/2, ss:noon+len/2, len:len}; }
function moonAge(date){ var a=((date.getTime()-NEWMOON)/864e5)%SYN; return a<0?a+SYN:a; }
function phaseName(age){ var p=age/SYN; if(p<.03||p>=.97) return '신월(그믐)'; if(p<.22) return '초승달'; if(p<.28) return '상현달'; if(p<.47) return '차오르는 달'; if(p<.53) return '보름달'; if(p<.72) return '기우는 달'; if(p<.78) return '하현달'; return '그믐달'; }
function sky(h,sr,ss){ /* 시각 -> 하늘 팔레트·구름색·밤 정도 */
  var st=[[sr-1.5,NIGHT,'night'],[sr,DAWN,'dawn'],[sr+1.5,DAY,'day'],[ss-1.5,DAY,'day'],[ss,DUSK,'dusk'],[ss+1.5,NIGHT,'night']];
  if(h<=st[0][0]||h>=st[5][0]) return {pal:NIGHT,c:CL.night,dark:1};
  for(var i=0;i<5;i++){ if(h>=st[i][0]&&h<st[i+1][0]){ var t=(h-st[i][0])/(st[i+1][0]-st[i][0]); t=t*t*(3-2*t);
      var dk=(st[i][2]==='night'?1-t:0)+(st[i+1][2]==='night'?t:0);
      return {pal:mixPal(st[i][1],st[i+1][1],t),c:[mix(CL[st[i][2]][0],CL[st[i+1][2]][0],t),mix(CL[st[i][2]][1],CL[st[i+1][2]][1],t)],dark:dk}; } }
  return {pal:DAY,c:CL.day,dark:0}; }
function rng(seed){ return function(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }
var STARS=(function(){ var r=rng(7),a=[]; for(var i=0;i<Math.round(170*K*K);i++) a.push([Math.floor(r()*W),Math.floor(r()*(HOR-r_(18))),r()]); return a; })();
function hillsH(seed,amp){ var r=rng(seed),h=amp,a=[]; for(var x=0;x<W;x+=HS){ h=Math.max(amp*.3,Math.min(amp,h+K*[-3,-2,0,2,3][Math.floor(r()*5)])); a.push(Math.floor(h)); } return a; }
var HS=r_(4),HILL1=hillsH(7,43*K),HILL2=hillsH(9,24*K);
function info(date){ date=date||new Date(); var s=sun(date),age=moonAge(date),k=Math.cos(2*Math.PI*age/SYN);
  return {sunrise:s.sr,sunset:s.ss,age:age,phase:phaseName(age),lit:(1-k)/2,waxing:age<SYN/2,moonrise:s.sr+age/SYN*24.84}; }
var CLOUDS=[[70,40,80],[215,26,64],[400,56,90],[130,95,60]].map(function(c){return [r_(c[0]),r_(c[1]),r_(c[2])]}), CB=r_(6), CH=r_(12);
function hourOf(date){ return date.getHours()+date.getMinutes()/60+date.getSeconds()/3600; }
function css(c){ return 'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')'; }
/* 구름만 따로: t초 동안 천천히 흘러가요 (투명 캔버스에 그려요) */
function clouds(ctx,date,t){ date=date||new Date(); var s=sun(date), S=sky(hourOf(date),s.sr,s.ss), i,k; ctx.clearRect(0,0,W,H);
  for(i=0;i<CLOUDS.length;i++){ var cl=CLOUDS[i], wd=cl[2], sp=1.2+i*.7, cx=((cl[0]+t*sp+wd)%(W+2*wd))-wd, bx=Math.round(cx-wd/2);
    for(k=0;k<wd;k+=CB){ var hh=r_(2)+Math.round(r_(3)*Math.sin(k/wd*Math.PI)); ctx.fillStyle=css(S.c[0]); ctx.fillRect(bx+k,cl[1]-hh,CB,hh*2); ctx.fillStyle=css(S.c[1]); ctx.fillRect(bx+k,cl[1]-hh,CB,K>1.2?2:1); } } }
/* 구름을 DOM 캔버스로: 화면 크기에 맞춰 부드럽게 흘러요. host(위치 잡힌 상자)에 넣어요 */
function cloudLayer(host,before){ var els=[],i; for(i=0;i<CLOUDS.length;i++){ var cl=CLOUDS[i], c=document.createElement('canvas'); c.width=cl[2]; c.height=CH; c.style.cssText='position:absolute;image-rendering:pixelated;pointer-events:none;width:'+(cl[2]/W*100)+'%;height:'+(CH/H*100)+'%;top:'+((cl[1]-CH/2)/H*100)+'%;left:-50%'; host.insertBefore(c,before||null); els.push(c); }
  return {
    paint:function(date){ date=date||new Date(); var s=sun(date), S=sky(hourOf(date),s.sr,s.ss), k,j; for(j=0;j<els.length;j++){ var cx=els[j].getContext('2d'), wd=CLOUDS[j][2]; cx.clearRect(0,0,wd,CH); for(k=0;k<wd;k+=CB){ var hh=r_(2)+Math.round(r_(3)*Math.sin(k/wd*Math.PI)); cx.fillStyle=css(S.c[0]); cx.fillRect(k,CH/2-hh,CB,hh*2); cx.fillStyle=css(S.c[1]); cx.fillRect(k,CH/2-hh,CB,K>1.2?2:1); } } },
    move:function(t){ for(var j=0;j<els.length;j++){ var cl=CLOUDS[j], wd=cl[2], sp=1.6+j*.9, cx=((cl[0]+t*sp+wd)%(W+2*wd))-wd; els[j].style.left=((cx-wd/2)/W*100)+'%'; } }
  }; }
/* 움직이는 바다: 하늘 색에서 바다 색을 따오고 물결이 흘러요 (y0~y1 줄) */
function sea(ctx,date,t,y0,y1){ date=date||new Date(); var s=sun(date), S=sky(hourOf(date),s.sr,s.ss), p=S.pal, top=mix(p[5],[52,132,160],.5), bot=mix(p[3],[22,74,104],.72), hi=mix(p[6],[255,255,255],.35), lo=mix(bot,[8,28,50],.4), st=Math.floor(t*3), y,x;
  for(y=y0;y<y1;y++){ var tt=(y-y0)/(y1-y0), c=mix(top,bot,tt); ctx.fillStyle=css(c); ctx.fillRect(0,y,W,1);
    if(y%9===0){ ctx.fillStyle=css(mix(c,hi,.35)); for(x=((y*17+Math.floor(t*2)*3)%61);x<W;x+=61){ ctx.fillRect(x,y,Math.round(6*K),1); } } } }
function draw(ctx,date,opt){
  date=date||new Date(); var h=date.getHours()+date.getMinutes()/60+date.getSeconds()/3600, s=sun(date), S=sky(h,s.sr,s.ss), pal=S.pal, n=pal.length-1;
  var im=ctx.createImageData(W,H), d=im.data, x, y, i, k;
  for(y=0;y<H;y++){ var t=Math.min(1,y/PW), row=B4[y&3];
    for(x=0;x<W;x++){ var v=Math.min(.999,t)*n+(row[x&3]/16-.5)*.9+.5, ix=Math.max(0,Math.min(n,Math.floor(v))), c=pal[ix], o=(y*W+x)*4; d[o]=c[0]; d[o+1]=c[1]; d[o+2]=c[2]; d[o+3]=255; } }
  function px(x,y,c){ x|=0; y|=0; if(x<0||y<0||x>=W||y>=H) return; var o=(y*W+x)*4; d[o]=c[0]; d[o+1]=c[1]; d[o+2]=c[2]; }
  function rect(x,y,w,hh,c){ for(var yy=0;yy<hh;yy++) for(var xx=0;xx<w;xx++) px(x+xx,y+yy,c); }
  function disc(cx,cy,r,c){ for(var yy=-r;yy<=r;yy++) for(var xx=-r;xx<=r;xx++) if(xx*xx+yy*yy<=r*r+r*.4) px(cx+xx,cy+yy,c); }
  /* 별 (밤일수록 많이) */
  if(S.dark>.25){ var cnt=Math.floor(STARS.length*Math.min(1,(S.dark-.25)/.7)); for(i=0;i<cnt;i++){ var st=STARS[i]; px(st[0],st[1],st[2]<.7?[255,244,220]:[190,200,255]); } }
  function arc(t,lo){ /* 뜰 때와 질 때는 건물 뒤에서 빨리 오르내리고, 낮엔 지붕 위 하늘에 머물러요 */ var u=Math.pow(Math.max(0,1-Math.sin(Math.PI*t)),3); if(t<0||t>1) u=1+Math.abs(t<0?t:t-1)*4; return [Math.round(r_(40)+t*(W-r_(80))), Math.round(r_(lo)+(HOR+r_(8)-r_(lo))*u)]; }
  /* 해 */
  var ts=(h-s.sr)/(s.ss-s.sr);
  if(ts>-.04&&ts<1.04){ var p=arc(ts,22), low=1-Math.min(1,Math.sin(Math.PI*Math.max(0,Math.min(1,ts)))*2.2), col=mix([255,250,214],[255,206,120],low);
    disc(p[0],p[1],r_(19),mix(pal[4],col,.18)); disc(p[0],p[1],r_(15),mix(pal[5],col,.5)); disc(p[0],p[1],r_(11),col); }
  /* 달 (달 나이에 맞는 위상, 뜨고 지는 시각도 위상에 맞춰 늦어져요) */
  var age=moonAge(date), mr=s.sr+age/SYN*24.84, tm=(((h-mr)%24)+24)%24/12;
  if(tm<=1.04){ var q=arc(tm,34), r=r_(10), kk=Math.cos(2*Math.PI*age/SYN), wax=age<SYN/2;
    for(var dy=-r;dy<=r;dy++) for(var dx=-r;dx<=r;dx++){ if(dx*dx+dy*dy>r*r+r*.3) continue; var xn=dx/r, yn=dy/r, w=Math.sqrt(Math.max(0,1-yn*yn)), lit=wax?(xn>kk*w):(xn<-kk*w);
      if(lit){ var cr=((dx*7+dy*13)%11===0)||(dx===-r_(3)&&dy===-r_(2))||(dx===r_(3)&&dy===r_(4))||(dx===r_(2)&&dy===-r_(5)); px(q[0]+dx,q[1]+dy,cr?[206,214,238]:[240,244,255]); }
      else if(S.dark>.5) px(q[0]+dx,q[1]+dy,[32,38,74]); } }
  /* 구름 (움직이는 배경에서는 따로 그려요) */
  if(!(opt&&opt.noClouds)){ var cc=S.c, CLD=CLOUDS;
  for(i=0;i<CLD.length;i++){ var cl=CLD[i], wd=cl[2], bx=Math.round(cl[0]-wd/2);
    for(k=0;k<wd;k+=CB){ var hh=r_(2)+Math.round(r_(3)*Math.sin(k/wd*Math.PI)); rect(bx+k,cl[1]-hh,CB,hh*2,cc[0]); rect(bx+k,cl[1]-hh,CB,K>1.2?2:1,cc[1]); } } }
  /* 먼 언덕 (하늘 아래쪽 색에서 따와요) */
  var hc1=mix(pal[5],[34,30,66],.62), hc2=mix(pal[5],[26,22,52],.78);
  for(i=0;i<HILL1.length;i++) rect(i*HS,HOR-HILL1[i],HS,HILL1[i]+r_(20),hc1);
  for(i=0;i<HILL2.length;i++) rect(i*HS,HOR+r_(2)-HILL2[i],HS,HILL2[i]+r_(20),hc2);
  ctx.putImageData(im,0,0);
}
return {draw:draw,clouds:clouds,cloudLayer:cloudLayer,sea:sea,info:info,W:W,H:H,K:K};
}
window.FFSky=build(1);window.FFSky.make=build;

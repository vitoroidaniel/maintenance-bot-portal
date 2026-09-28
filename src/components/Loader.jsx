import React,{useEffect,useRef} from 'react';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;

function drawTree(ctx,x,y,r,alpha=1){
  ctx.save(); ctx.translate(x,y); ctx.globalAlpha=alpha;
  // trunk seen from above
  ctx.fillStyle='#17130d'; ctx.beginPath(); ctx.ellipse(0,2,r*.10,r*.18,0,0,Math.PI*2);ctx.fill();
  const crowns=[[0,0,1],[-.42,-.1,.64],[.38,-.18,.7],[-.18,.38,.68],[.27,.34,.58],[0,-.42,.58]];
  crowns.forEach(([cx,cy,s],i)=>{const g=ctx.createRadialGradient(cx*r,cy*r,0,cx*r,cy*r,r*s);g.addColorStop(0,i%2?'#263527':'#314331');g.addColorStop(.58,'#172619');g.addColorStop(1,'rgba(5,10,6,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx*r,cy*r,r*s,0,Math.PI*2);ctx.fill()});
  ctx.restore();
}
function drawHuman(ctx,x,y,s,walk=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(.12);ctx.fillStyle='#070707';
  ctx.beginPath();ctx.arc(0,-15*s,6*s,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,1*s,8*s,17*s,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#070707';ctx.lineWidth=5*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-4*s,11*s);ctx.lineTo((-8+walk*3)*s,28*s);ctx.moveTo(4*s,11*s);ctx.lineTo((9-walk*3)*s,28*s);ctx.moveTo(-6*s,-2*s);ctx.lineTo(-13*s,10*s);ctx.moveTo(6*s,-2*s);ctx.lineTo(13*s,8*s);ctx.stroke();ctx.restore();
}
function drawRaven(ctx,x,y,s,flap,rot=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.fillStyle='#050505';
  // body/head/beak/tail
  ctx.beginPath();ctx.ellipse(0,0,30,12,-.08,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(25,-5,9,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(32,-7);ctx.lineTo(52,-3);ctx.lineTo(33,0);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-27,0);ctx.lineTo(-48,-12);ctx.lineTo(-40,1);ctx.lineTo(-52,12);ctx.closePath();ctx.fill();
  // wings
  const wy=18+flap*18;
  ctx.beginPath();ctx.moveTo(4,-2);ctx.quadraticCurveTo(-8,-wy,-54,-44-flap*16);ctx.quadraticCurveTo(-27,-10,-4,5);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(3,3);ctx.quadraticCurveTo(-8,wy,-49,43+flap*16);ctx.quadraticCurveTo(-24,12,-3,-4);ctx.closePath();ctx.fill();
  ctx.restore();
}
export default function Loader({onDone}){
 const canvas=useRef(null),root=useRef(null),progress=useRef(null);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){onDone();return}
  const c=canvas.current,ctx=c.getContext('2d');let raf,w,h,dpr;const duration=10.4,start=performance.now();
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  let trees=[];
  const resize=()=>{w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const seed=[];for(let i=0;i<105;i++){const side=i%2?-1:1;const lane=.23+Math.random()*.18;seed.push({x:w*(.5+side*(lane+Math.random()*.28)),y:Math.random()*h,r:28+Math.random()*58,a:.45+Math.random()*.55})}trees=seed};resize();addEventListener('resize',resize);
  function frame(now){const t=(now-start)/1000,p=clamp(t/duration);ctx.clearRect(0,0,w,h);
   // timeline: 0-3 flight, 3-5 fall, 5-7 catch/light, 7-8.8 walk, 8.8+ copy/fade
   const drop=clamp((t-3.0)/2.0),catchP=clamp((t-5.0)/1.4),walk=clamp((t-6.4)/2.2),ending=clamp((t-8.7)/1.5);
   const cam=smooth(drop)*.22+smooth(catchP)*.18; const cx=w*.5,cy=h*.52;
   ctx.save();ctx.translate(cx,cy);ctx.scale(1+cam,1+cam);ctx.translate(-cx,-cy);
   const bg=ctx.createRadialGradient(w*.5,h*.54,30,w*.5,h*.54,Math.max(w,h)*.72);bg.addColorStop(0,'#182015');bg.addColorStop(.45,'#070b07');bg.addColorStop(1,'#010201');ctx.fillStyle=bg;ctx.fillRect(-w,-h,w*3,h*3);
   // path
   ctx.fillStyle='rgba(40,34,24,.34)';ctx.beginPath();ctx.moveTo(w*.43,h*1.2);ctx.bezierCurveTo(w*.6,h*.78,w*.43,h*.48,w*.54,-h*.2);ctx.lineTo(w*.68,-h*.2);ctx.bezierCurveTo(w*.55,h*.5,w*.69,h*.82,w*.57,h*1.2);ctx.closePath();ctx.fill();
   trees.forEach(tr=>drawTree(ctx,tr.x,tr.y,tr.r,tr.a));
   // subtle fog
   ctx.fillStyle='rgba(160,175,155,.025)';for(let i=0;i<10;i++){ctx.beginPath();ctx.ellipse((i*197+t*8)%w,(i*113)%h,130,42,.2,0,Math.PI*2);ctx.fill()}
   const hx=lerp(w*.57,w*.54,smooth(walk)),hy=lerp(h*.67,h*.48,smooth(walk));
   // torch follows raven then falls
   const ravenP=clamp(t/3.8),rx=lerp(-120,w+150,smooth(ravenP)),ry=h*(.25+.045*Math.sin(ravenP*Math.PI));
   if(t<4.15) drawRaven(ctx,rx,ry,1.25+Math.min(w,1200)/5000,Math.sin(t*13)*.55,.03*Math.sin(t*2));
   let tx,ty;if(t<3){tx=rx-6;ty=ry+32}else{const q=smooth(drop);tx=lerp(w*.42,w*.57,q);ty=lerp(h*.31,h*.64,q)}
   if(t<6.4){const glow=ctx.createRadialGradient(tx,ty,3,tx,ty,55+catchP*120);glow.addColorStop(0,'rgba(255,221,143,.98)');glow.addColorStop(.12,'rgba(255,163,55,.7)');glow.addColorStop(1,'rgba(255,130,20,0)');ctx.fillStyle=glow;ctx.fillRect(tx-220,ty-220,440,440);ctx.strokeStyle='#3a2413';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(tx,ty-5);ctx.lineTo(tx-6,ty+28);ctx.stroke();ctx.fillStyle='#ffad42';ctx.beginPath();ctx.ellipse(tx+1,ty-9,7,13,.15,0,Math.PI*2);ctx.fill()}
   if(catchP>0){const R=80+smooth(catchP)*Math.max(w,h)*.44;const light=ctx.createRadialGradient(hx,hy,15,hx,hy,R);light.addColorStop(0,'rgba(255,184,80,.44)');light.addColorStop(.55,'rgba(175,96,31,.18)');light.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=light;ctx.fillRect(hx-R,hy-R,R*2,R*2)}
   drawHuman(ctx,hx,hy,1.15,Math.sin(walk*18));ctx.restore();
   if(progress.current)progress.current.style.transform=`scaleX(${p})`;
   if(root.current){root.current.style.setProperty('--copy',String(clamp((t-8.1)/.8)));root.current.style.opacity=ending>.72?String(1-(ending-.72)/.28):'1'}
   if(t<duration)raf=requestAnimationFrame(frame);else onDone();
  }raf=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);document.body.style.overflow=old}
 },[onDone]);
 return <div ref={root} className="intro-canvas" role="dialog" aria-modal="true" aria-label="REKKA introduction"><canvas ref={canvas}/><div className="intro-canvas-copy"><small>REKKA / SOFTWARE STUDIO</small><h1>Every idea starts<br/>in the dark.</h1><p>We help you find the way forward.</p></div><button className="intro-canvas-skip" onClick={onDone}>Skip intro</button><div className="intro-canvas-progress"><span ref={progress}/></div></div>
}

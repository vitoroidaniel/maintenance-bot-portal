import React,{useEffect,useRef}from'react';

export default function ParticleRaven(){
 const ref=useRef(null);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d',{alpha:true});
  let raf,parts=[],mouse={x:-9999,y:-9999,active:false},dpr=Math.min(devicePixelRatio||1,1.5);
  const build=()=>{
   const box=canvas.getBoundingClientRect(),w=Math.max(320,box.width),h=Math.max(260,box.height);
   canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
   const mask=document.createElement('canvas'),m=mask.getContext('2d');mask.width=w;mask.height=h;
   m.translate(w*.5,h*.51);m.scale(Math.min(w/820,h/520),Math.min(w/820,h/520));
   m.fillStyle='#fff';
   // Broad wings, body, head, tail and beak form a readable raven silhouette.
   m.beginPath();m.moveTo(-24,-38);m.bezierCurveTo(-120,-185,-292,-202,-390,-155);m.bezierCurveTo(-305,-130,-247,-74,-177,-20);m.bezierCurveTo(-277,-56,-337,-28,-366,15);m.bezierCurveTo(-245,11,-153,31,-69,73);m.bezierCurveTo(-34,91,2,75,16,35);m.closePath();m.fill();
   m.beginPath();m.moveTo(18,-34);m.bezierCurveTo(117,-180,285,-199,395,-145);m.bezierCurveTo(304,-125,243,-68,174,-14);m.bezierCurveTo(273,-48,338,-17,369,27);m.bezierCurveTo(251,20,154,39,66,77);m.bezierCurveTo(35,90,5,69,-3,31);m.closePath();m.fill();
   m.beginPath();m.ellipse(0,40,62,112,-.08,0,Math.PI*2);m.fill();
   m.beginPath();m.ellipse(35,-42,48,43,-.1,0,Math.PI*2);m.fill();
   m.beginPath();m.moveTo(67,-51);m.lineTo(135,-36);m.lineTo(69,-20);m.closePath();m.fill();
   m.beginPath();m.moveTo(-34,125);m.lineTo(-88,205);m.lineTo(-19,170);m.lineTo(2,216);m.lineTo(28,165);m.lineTo(83,199);m.lineTo(39,120);m.closePath();m.fill();
   const data=m.getImageData(0,0,w,h).data,step=w<600?5:4,next=[];
   for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){if(data[(y*w+x)*4+3]>90&&Math.random()>.17){const j=(Math.random()-.5)*2.4;next.push({x:x+j,y:y+j,tx:x,ty:y,vx:0,vy:0,s:.45+Math.random()*1.25,a:.28+Math.random()*.72})}}
   parts=next;
  };
  const pointer=e=>{const r=canvas.getBoundingClientRect(),p=e.touches?.[0]||e;mouse.x=p.clientX-r.left;mouse.y=p.clientY-r.top;mouse.active=true};
  const leave=()=>{mouse.active=false;mouse.x=-9999;mouse.y=-9999};
  const draw=()=>{
   const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
   const light=document.documentElement.dataset.theme==='light';ctx.fillStyle=light?'rgba(18,18,18,.8)':'rgba(238,238,235,.84)';
   for(const p of parts){
    let dx=p.x-mouse.x,dy=p.y-mouse.y,ds=dx*dx+dy*dy;
    if(mouse.active&&ds<8200){let d=Math.sqrt(ds)||1,f=(1-d/91)*2.9;p.vx+=dx/d*f;p.vy+=dy/d*f}
    p.vx+=(p.tx-p.x)*.022;p.vy+=(p.ty-p.y)*.022;p.vx*=.91;p.vy*=.91;p.x+=p.vx;p.y+=p.vy;
    ctx.globalAlpha=p.a;ctx.fillRect(p.x,p.y,p.s,p.s);
   }
   ctx.globalAlpha=1;raf=requestAnimationFrame(draw);
  };
  build();draw();addEventListener('resize',build);canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('touchmove',pointer,{passive:true});canvas.addEventListener('touchend',leave);
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',build);canvas.removeEventListener('pointermove',pointer);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('touchmove',pointer);canvas.removeEventListener('touchend',leave)};
 },[]);
 return <canvas ref={ref} className="particle-raven" aria-label="Interactive particle raven"/>;
}

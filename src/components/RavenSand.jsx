import React,{useEffect,useRef} from 'react';

export default function RavenSand(){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas.getContext('2d'); let raf=0, particles=[]; const pointer={x:-9999,y:-9999};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function ravenPath(c,w,h){
      c.save(); c.translate(w*.5,h*.55); const s=Math.min(w,h)/620; c.scale(s,s);
      c.beginPath();
      c.moveTo(-300,-70); c.bezierCurveTo(-230,-155,-145,-185,-55,-122); c.bezierCurveTo(-10,-92,15,-66,30,-30);
      c.bezierCurveTo(92,-126,180,-178,300,-150); c.bezierCurveTo(232,-98,176,-52,128,0);
      c.bezierCurveTo(174,18,225,48,266,98); c.bezierCurveTo(186,80,123,58,74,32);
      c.bezierCurveTo(58,80,72,132,112,178); c.bezierCurveTo(50,158,12,120,-10,72);
      c.bezierCurveTo(-52,112,-105,137,-180,145); c.bezierCurveTo(-132,104,-91,66,-58,22);
      c.bezierCurveTo(-126,4,-205,-22,-300,-70); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(-52,12,58,78,-.2,0,Math.PI*2); c.fill();
      c.beginPath(); c.moveTo(-90,-34); c.lineTo(-158,-4); c.lineTo(-92,5); c.closePath(); c.fill();
      c.restore();
    }
    function resize(){
      const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2); canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);
      const off=document.createElement('canvas');off.width=Math.max(1,Math.floor(r.width));off.height=Math.max(1,Math.floor(r.height));const o=off.getContext('2d');o.fillStyle='#fff';ravenPath(o,off.width,off.height);
      const img=o.getImageData(0,0,off.width,off.height).data; const step=reduced?8:(r.width<700?5:4); const targets=[];
      for(let y=0;y<off.height;y+=step) for(let x=0;x<off.width;x+=step) if(img[(y*off.width+x)*4+3]>100 && Math.random()>.16) targets.push({x,y});
      particles=targets.map((t,i)=>({x:t.x+(Math.random()-.5)*150,y:t.y+(Math.random()-.5)*120,tx:t.x,ty:t.y,vx:0,vy:0,a:.35+Math.random()*.65,s:.55+Math.random()*1.25,n:Math.random()*10}));
    }
    function move(e){const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top} function leave(){pointer.x=-9999;pointer.y=-9999}
    resize();addEventListener('resize',resize);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);
    let t=0; function frame(){t+=.014;const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
      const beam=ctx.createLinearGradient(w*.18,h*.82,w*.78,h*.16);beam.addColorStop(0,'rgba(255,255,255,0)');beam.addColorStop(.48,'rgba(255,255,255,.025)');beam.addColorStop(.58,'rgba(255,255,255,.11)');beam.addColorStop(.72,'rgba(255,255,255,.02)');beam.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=beam;ctx.fillRect(0,0,w,h);
      for(const p of particles){let dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.hypot(dx,dy);if(dist<90){let f=(90-dist)/90;p.vx+=(dx/(dist||1))*f*1.6;p.vy+=(dy/(dist||1))*f*1.6}p.vx+=(p.tx-p.x)*.018;p.vy+=(p.ty-p.y)*.018;p.vx*=.9;p.vy*=.9;p.x+=p.vx+Math.sin(t+p.n)*.02;p.y+=p.vy+Math.cos(t*.8+p.n)*.015;ctx.fillStyle=`rgba(244,244,241,${p.a})`;ctx.fillRect(p.x,p.y,p.s,p.s)}
      raf=requestAnimationFrame(frame)} frame();
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave)}
  },[]);
  return <canvas ref={ref} className="raven-sand" aria-label="Interactive particle raven"/>;
}

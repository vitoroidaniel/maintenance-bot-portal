import { Suspense, useEffect, useState } from 'react';
import Scene from '../experience/Scene';
export default function Loader({onDone}){
 const [p,setP]=useState(0); const [phase,setPhase]=useState('forest');
 useEffect(()=>{const start=performance.now(); let raf; const loop=n=>{const x=Math.min(1,(n-start)/7200);setP(x); if(x>.18)setPhase('raven'); if(x>.72)setPhase('message'); if(x<1)raf=requestAnimationFrame(loop); else setTimeout(()=>{setPhase('exit');setTimeout(onDone,850)},500)};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)},[onDone]);
 return <div className={`cinema-loader ${phase}`}>
   <div className="forest-depth forest-back"/><div className="forest-depth forest-mid"/><div className="forest-depth forest-front"/>
   <div className="mist m1"/><div className="mist m2"/><div className="wanderer"><span className="head"/><span className="body"/><i className="torch"/></div>
   <div className="raven-stage"><Suspense fallback={null}><Scene progress={Math.max(0,(p-.15)/.58)}/></Suspense></div>
   <div className="cinema-copy"><span>REKKA / 001</span><h1>EVERY IDEA<br/>STARTS IN <em>THE DARK.</em></h1><p>We can be the light that gets it moving.</p></div>
   <div className="intro-progress"><b style={{width:`${p*100}%`}}/><span>{String(Math.round(p*100)).padStart(2,'0')} / 100</span></div>
   <div className="light-wipe"/>
 </div>
}

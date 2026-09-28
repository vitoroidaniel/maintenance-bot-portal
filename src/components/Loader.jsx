import React,{useEffect,useRef,useState} from 'react';

export default function Loader({onDone}){
 const root=useRef(null); const [phase,setPhase]=useState('flight');
 useEffect(()=>{
   const timers=[
    setTimeout(()=>setPhase('drop'),1800),
    setTimeout(()=>setPhase('catch'),3500),
    setTimeout(()=>setPhase('walk'),4800),
    setTimeout(()=>setPhase('message'),6100),
    setTimeout(()=>{root.current?.classList.add('intro-out');setTimeout(onDone,850)},8200)
   ]; return()=>timers.forEach(clearTimeout)
 },[onDone]);
 return <div ref={root} className={`intro intro-${phase}`}>
   <div className="forest-camera">
    <div className="forest forest-far"/>
    <div className="forest forest-mid"/>
    <div className="forest forest-near"/>
    <div className="mist mist-a"/><div className="mist mist-b"/>
    <svg className="intro-human" viewBox="0 0 90 150" aria-hidden="true">
      <ellipse cx="45" cy="25" rx="16" ry="20" fill="currentColor"/>
      <path d="M28 47 Q45 37 62 47 L70 104 Q46 119 20 104Z" fill="currentColor"/>
      <path d="M28 102 18 145M61 103 72 145M26 57 8 92M62 58 81 89" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
    </svg>
    <svg className="intro-raven" viewBox="0 0 300 120" aria-hidden="true">
      <path d="M146 61c-24-17-48-37-77-48 15 19 27 34 33 48-35-17-63-20-92-17 37 15 65 32 91 50 17 12 38 17 56 8 16-8 26-20 36-31 21-24 51-39 97-48-40-6-74 2-105 22 7-15 18-30 32-45-29 11-51 29-71 61Z" fill="currentColor"/>
      <path d="M146 62c19-12 34-9 46 2-13 7-27 13-43 18-13-4-18-11-3-20Z" fill="currentColor"/>
      <circle cx="181" cy="61" r="2.8" fill="#fff"/>
    </svg>
    <div className="torch"><i/><b/></div>
    <div className="catch-light"/>
   </div>
   <div className="intro-copy"><small>REKKA / SOFTWARE STUDIO</small><h1>Every idea starts<br/>in the dark.</h1><p>We help you find the way forward.</p></div>
   <button className="skip" onClick={onDone}>Skip intro</button>
 </div>
}

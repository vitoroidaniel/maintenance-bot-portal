import React,{useEffect,useRef,useState}from'react';
import gsap from'gsap';

export default function Loader({onDone}){
 const root=useRef(null), raven=useRef(null), ember=useRef(null), person=useRef(null), light=useRef(null), copy=useRef(null);
 const [skip,setSkip]=useState(false);
 useEffect(()=>{if(skip){onDone?.();return}const ctx=gsap.context(()=>{
  const tl=gsap.timeline({onComplete:()=>{gsap.to(root.current,{opacity:0,duration:.7,onComplete:onDone})}});
  tl.fromTo('.intro-world',{scale:1.04},{scale:1,duration:1.4,ease:'power2.out'})
    .fromTo(raven.current,{x:'-32vw',y:'-8vh',rotation:-5,opacity:0},{x:'34vw',y:'5vh',rotation:3,opacity:1,duration:2.35,ease:'power1.inOut'},.35)
    .to('.wing-a',{rotation:-17,duration:.22,yoyo:true,repeat:8,ease:'sine.inOut'},.35)
    .to('.wing-b',{rotation:17,duration:.22,yoyo:true,repeat:8,ease:'sine.inOut'},.35)
    .set(ember.current,{opacity:1,x:'36vw',y:'31vh'},1.55)
    .to(ember.current,{x:'44vw',y:'69vh',rotation:130,duration:1.55,ease:'power2.in'},1.55)
    .to('.intro-world',{scale:1.38,x:'-5vw',y:'-10vh',duration:1.55,ease:'power2.inOut'},1.55)
    .to(raven.current,{x:'75vw',y:'-12vh',opacity:.2,duration:1.15},1.65)
    .to(ember.current,{opacity:0,duration:.15},3.05)
    .to(light.current,{scale:1,opacity:1,duration:1.15,ease:'power3.out'},3.0)
    .to(person.current,{filter:'brightness(1.5)',duration:.8},3.05)
    .to('.forest-near',{filter:'brightness(.68) saturate(.8)',duration:1.1},3.0)
    .to(person.current,{x:'10vw',y:'-5vh',scale:.88,duration:1.55,ease:'power1.inOut'},4.05)
    .to('.intro-world',{scale:1.18,x:'-2vw',y:'-4vh',duration:1.55},4.05)
    .to(copy.current,{opacity:1,y:0,duration:.9,ease:'power3.out'},4.65)
    .to({}, {duration:1.35})
    .to('.intro-curtain',{scaleY:1,duration:.65,ease:'power4.inOut'});
 },root);return()=>ctx.revert()},[skip,onDone]);
 return <div className="story-intro" ref={root}>
  <button className="skip-intro" onClick={()=>setSkip(true)}>Skip intro</button>
  <div className="intro-world">
   <div className="sky-haze"/><div className="forest forest-far"/><div className="forest forest-mid"/><div className="forest forest-near"/>
   <div className="path"/>
   <div className="person" ref={person}><i className="person-head"/><i className="person-body"/><i className="person-arm"/></div>
   <div className="catch-light" ref={light}/>
   <div className="raven2d" ref={raven} aria-hidden="true"><i className="wing wing-a"/><i className="wing wing-b"/><i className="bird-body"/><i className="bird-head"/><i className="bird-tail"/><i className="bird-beak"/><i className="carried-light"/></div>
   <div className="falling-light" ref={ember}><i/></div>
  </div>
  <div className="story-copy" ref={copy}><span>REKKA / 00 — FIND THE WAY</span><h1>Every idea starts<br/>in the <em>dark.</em></h1><p>We help you find the way forward.</p></div>
  <div className="intro-hint">A small light can change the whole path.</div><div className="intro-curtain"/>
 </div>
}

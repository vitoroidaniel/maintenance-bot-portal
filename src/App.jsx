import React,{useEffect}from'react';
import gsap from'gsap';
import{ScrollTrigger}from'gsap/ScrollTrigger';
import Loader from'./components/Loader';
import'./styles/site.css';
gsap.registerPlugin(ScrollTrigger);

const products=[
 ['01','DISPATCH / INTELLIGENCE','KURTEX','Fleet operations without the noise. Case ownership, alerts, reports, knowledge and AI assistance in one hard-working system.'],
 ['02','AUTOMATION / TELEGRAM','OPS BOT','Operational events become assignments, escalations and useful alerts instead of another dashboard nobody checks.'],
 ['03','WEB / PRODUCT','CUSTOM SYSTEMS','Purpose-built websites, internal tools and interfaces designed around the actual workflow — not a template.'],
 ['04','MONITORING / API','REKKA MONITOR','Watch the things that matter, surface changes fast, and keep teams moving with less manual checking.']
];
const services=[['01','PRODUCT STRATEGY','Turn a rough problem into a clear product direction and technical plan.'],['02','WEB EXPERIENCES','Editorial websites, product pages and interactive launches with strong art direction.'],['03','AUTOMATION','Bots, integrations and workflows that remove repetitive operational work.'],['04','INTERNAL SYSTEMS','Dashboards, CRMs, knowledge tools and focused software for real teams.']];

export default function App(){
 useEffect(()=>{
  const ctx=gsap.context(()=>{
   gsap.utils.toArray('[data-reveal]').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 86%'},y:55,opacity:0,duration:1,ease:'power3.out'}));
   gsap.to('.hero-raven',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1},yPercent:14,scale:1.08});
   gsap.to('.hero-title .line-a',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1},xPercent:-7});
   gsap.to('.hero-title .line-b',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1},xPercent:7});
   gsap.utils.toArray('.archive-card').forEach((el,i)=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 90%'},y:70+(i%2)*35,opacity:0,duration:1.1,ease:'power3.out'}));
  });
  return()=>ctx.revert();
 },[]);
 async function submit(e){e.preventDefault();const f=e.currentTarget,m=f.querySelector('.form-msg'),body=Object.fromEntries(new FormData(f));m.textContent='TRANSMITTING /';try{const r=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error();m.textContent='RECEIVED / I’LL GET BACK TO YOU.';f.reset()}catch{m.textContent='TRANSMISSION FAILED / TRY AGAIN.'}}
 return <><Loader/><div className="grain"/><header className="site-head"><a className="brand" href="#top"><b>REKKA.</b><small>SOFTWARE / STUDIO</small></a><nav><a href="#about">ABOUT</a><a href="#work">PRODUCTS</a><a href="#services">SERVICES</a><a href="#contact">CONTACT</a></nav><a className="head-cta" href="#contact">START A PROJECT ↗</a></header><main id="top">
 <section className="hero red-field">
  <div className="hero-raven" aria-hidden="true"/>
  <div className="cross c1">+</div><div className="cross c2">+</div>
  <div className="hero-meta left"><b>04+</b> products<br/><b>100%</b> independent<br/>Moldova → worldwide</div>
  <div className="hero-meta right">digital products<br/>automation<br/>interfaces / systems</div>
  <div className="hero-title"><span className="line-a">REKKA.</span><span className="line-b">SOFTWARE</span></div>
  <a className="outline-cta" href="#contact">GET IN TOUCH →</a>
  <a className="view-work" href="#work">VIEW PRODUCTS ↓</a>
  <div className="ticker"><span>BUILT TO WORK ↓ BUILT TO BE SEEN ↓ BUILT TO LAST ↓ REKKA SOFTWARE ↓ </span><span>BUILT TO WORK ↓ BUILT TO BE SEEN ↓ BUILT TO LAST ↓ REKKA SOFTWARE ↓ </span></div>
 </section>

 <section id="about" className="black editorial">
  <div className="eyebrow">// THE STUDIO</div><h2 data-reveal>BUILT TO<br/>BE <em>USED.</em><br/>BUILT TO<br/>BE <i>SEEN.</i></h2>
  <div className="editorial-copy" data-reveal><b>NO TRENDS. NO COPIES.</b><p>REKKA builds software with a point of view — direct interfaces, useful automation and products that solve real operational problems.</p><p>The visual layer gets attention. The system underneath earns trust.</p><a href="#contact">START YOUR PROJECT →</a></div>
  <div className="portrait raven-close"/><div className="metric m1"><strong>04+</strong><span>ACTIVE PRODUCT DIRECTIONS</span></div><div className="metric m2"><strong>24/7</strong><span>SYSTEMS THAT DON'T CLOCK OUT</span></div>
 </section>

 <section id="work" className="arsenal black"><div className="section-top"><span>PRODUCT / ARCHIVE</span><p>Not just one thing. A small arsenal of focused digital systems.</p></div><h2 data-reveal>THE<br/><i>ARSENAL</i></h2>{products.map((p,i)=><article className="archive-card" key={p[0]}><div className="num">{p[0]}</div><div className="archive-main"><small>{p[1]}</small><h3>{p[2]}</h3><p>{p[3]}</p></div><a href="#contact">OPEN BRIEF ↗</a><div className={'archive-art art-'+(i+1)}/></article>)}</section>

 <section className="amonra burgundy"><div className="micro top-left">MMXXVI<br/>independent software studio</div><div className="micro top-right">full context,<br/><b>always</b></div><div className="amonra-mark">REK<br/><span>KA</span></div><div className="sigil">R/</div><div className="amonra-copy" data-reveal><small>// WE ARE REKKA</small><p>we study <i>systems</i>, operational traces and digital behavior — then turn complexity into <b>clear software</b>.</p></div><div className="micro bottom-left">Ideas become interfaces.<br/>Interfaces become tools.<br/>Tools should earn their place.</div></section>

 <section id="services" className="services black"><div className="section-top"><span>SERVICES / DESKTOP + MOBILE</span><p>Need one of these, or the whole system?</p></div><h2 data-reveal>NOT JUST<br/><em>ONE</em> THING</h2><div className="service-grid">{services.map(s=><article data-reveal key={s[0]}><strong>{s[0]}</strong><div><h3>{s[1]}</h3><p>{s[2]}</p></div></article>)}</div><div className="service-image raven-flight"/></section>

 <section className="red-panel"><div className="panel-label">REKKA / METHOD</div><h2 data-reveal>THE GRID<br/><span>SYSTEM</span></h2><div className="grid-lines">{[1,2,3,4,5,6].map(n=><i key={n}/>)}</div><div className="ghost-raven"/><p>Flexible structure. Aggressive hierarchy. Clear navigation. Every element gets space for a reason, then breaks the grid only when breaking it makes the message stronger.</p></section>

 <section id="contact" className="contact black"><div className="contact-raven"/><div className="contact-copy"><small>THANKS FOR YOUR TIME</small><h2>MAKE<br/>SOMETHING<br/><i>WORTH SEEING.</i></h2><p>Tell me what needs to exist. I'll tell you how I'd approach it.</p></div><form onSubmit={submit}><label>NAME<input name="name" required/></label><label>EMAIL<input type="email" name="email" required/></label><label>PROJECT<select name="type"><option>Website / product</option><option>Automation / bot</option><option>Internal system</option><option>Existing project / fix</option></select></label><label>BRIEF<textarea name="message" required/></label><button>SEND PROJECT →</button><div className="form-msg"/></form></section>
 </main><footer><b>REKKA / SOFTWARE</b><span>MMXXVI / MOLDOVA → WORLDWIDE</span><a href="#top">BACK TO TOP ↑</a></footer></>
}

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 30), { passive:true });

// Reveal elements as they enter the viewport.
const reveal = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:.12 });
  reveal.forEach(el => observer.observe(el));
} else reveal.forEach(el => el.classList.add('visible'));

// Subtle magnetic movement on desktop.
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * .12;
    const y = (e.clientY - (r.top + r.height / 2)) * .12;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

// Tiny 3D tilt for cards; disabled on touch/reduced motion.
if (!window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

// Desktop custom cursor.
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
if (dot && ring && !window.matchMedia('(pointer: coarse)').matches) {
  let x=0,y=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => { x=e.clientX; y=e.clientY; dot.style.transform=`translate(${x}px,${y}px)`; });
  const loop=()=>{rx+=(x-rx)*.16;ry+=(y-ry)*.16;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)}; loop();
  document.querySelectorAll('a,button,input,textarea,select,.service-card,.project').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('active'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('active'));
  });
}

// Mobile menu.
const menuBtn=document.getElementById('menuBtn');
const links=document.querySelector('.nav-links');
menuBtn?.addEventListener('click',()=>{
  const isOpen=links?.classList.toggle('open');
  menuBtn.classList.toggle('open',!!isOpen);
  menuBtn.setAttribute('aria-expanded',String(!!isOpen));
  menuBtn.setAttribute('aria-label',isOpen?'Close menu':'Open menu');
  document.body.classList.toggle('menu-open',!!isOpen);
});
links?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');
  menuBtn?.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
  menuBtn?.setAttribute('aria-label','Open menu');
  document.body.classList.remove('menu-open');
}));
window.addEventListener('resize',()=>{
  if(window.innerWidth>950){
    links?.classList.remove('open'); menuBtn?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false'); menuBtn?.setAttribute('aria-label','Open menu');
    document.body.classList.remove('menu-open');
  }
});

function getDeviceInfo(){
  const ua=navigator.userAgent;
  let browser='Unknown';
  if(/Edg\//.test(ua))browser='Edge';else if(/OPR\//.test(ua))browser='Opera';else if(/Chrome\//.test(ua))browser='Chrome';else if(/Firefox\//.test(ua))browser='Firefox';else if(/Safari\//.test(ua))browser='Safari';
  let os='Unknown';
  if(/Windows/.test(ua))os='Windows';else if(/iPhone|iPad/.test(ua))os='iOS';else if(/Android/.test(ua))os='Android';else if(/Mac OS X/.test(ua))os='macOS';else if(/Linux/.test(ua))os='Linux';
  return {browser,os,screen:`${screen.width}x${screen.height} (${window.devicePixelRatio}x DPR)`,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,page:location.href,referrer:document.referrer||'Direct',isMobile:/Mobi|Android|iPhone|iPad/i.test(ua),touchDevice:navigator.maxTouchPoints>0};
}

const form=document.getElementById('contactForm');
form?.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=document.getElementById('submitBtn');const msg=document.getElementById('formMsg');
  btn.disabled=true;btn.innerHTML='Sending... <span>•</span>';msg.className='form-msg';msg.textContent='';
  try{
    const res=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('fname').value,email:document.getElementById('femail').value,type:document.getElementById('ftype').value,message:document.getElementById('fmessage').value,deviceInfo:getDeviceInfo()})});
    let data={};try{data=await res.json()}catch{}
    if(!res.ok||!data.success)throw new Error(data.error||'Something went wrong. Please try again.');
    msg.className='form-msg success';msg.textContent='Message sent ✦ I’ll get back to you soon.';form.reset();
  }catch(err){msg.className='form-msg error';msg.textContent='Couldn’t send it — '+err.message}
  finally{btn.disabled=false;btn.innerHTML='Send it <span>↗</span>'}
});


// Lucide UI icons
if (window.lucide) { window.lucide.createIcons(); }
else { window.addEventListener('load', () => window.lucide && window.lucide.createIcons()); }

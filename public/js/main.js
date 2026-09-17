/* Rekka Software portfolio — Daniel */
const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME'; // <- change this once
const GITHUB_LIMIT = 6;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function initIcons(){ if(window.lucide) lucide.createIcons({attrs:{'stroke-width':1.8}}); }

function initNav(){
  const nav = $('#nav'), btn = $('#menuBtn'), links = $('#navLinks');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');btn.setAttribute('aria-expanded','false')}));
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking)return; ticking=true;
    requestAnimationFrame(()=>{nav.classList.toggle('scrolled',window.scrollY>30); ticking=false;});
  },{passive:true});
}

function initReveal(){
  const items=$$('.reveal');
  if(!('IntersectionObserver' in window)){items.forEach(x=>x.classList.add('visible'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -45px'});
  items.forEach(x=>io.observe(x));
}

function initFilters(){
  const tabs=$$('.work-tabs button'), cards=$$('.project-card');
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));tab.classList.add('active');
    const filter=tab.dataset.filter;
    cards.forEach(card=>{
      const show=filter==='all'||card.dataset.category===filter;
      card.style.display=show?'':'none';
    });
  }));
}

function setGithubStats(repos){
  const count=$('#projectCount'), stars=$('#repoStars');
  if(count) count.textContent=repos.length;
  if(stars) stars.textContent=repos.reduce((n,r)=>n+(r.stargazers_count||0),0);
}

function repoCard(repo){
  const card=document.createElement('article'); card.className='repo-card';
  const description=repo.description||'A project by Daniel / Rekka Software.';
  card.innerHTML=`<div class="repo-top"><span class="repo-name">${escapeHtml(repo.name)}</span>${repo.language?`<span class="repo-lang">${escapeHtml(repo.language)}</span>`:''}</div><p>${escapeHtml(description.slice(0,140))}</p><div class="repo-bottom"><span><i data-lucide="star"></i>${repo.stargazers_count||0}</span><span><i data-lucide="git-fork"></i>${repo.forks_count||0}</span><span>${repo.private?'Private':'Public'}</span></div>`;
  card.addEventListener('click',()=>window.open(repo.html_url,'_blank','noopener'));
  card.style.cursor='pointer'; return card;
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function loadGithub(){
  const wrap=$('#githubRepos'), status=$('#githubStatus');
  if(!wrap||!status)return;
  if(!GITHUB_USERNAME||GITHUB_USERNAME==='YOUR_GITHUB_USERNAME'){
    status.textContent='Add your GitHub username'; wrap.innerHTML='<div class="repo-card"><div class="repo-top"><span class="repo-name">Connect GitHub</span><span class="repo-lang">SETUP</span></div><p>Open public/js/main.js and replace YOUR_GITHUB_USERNAME with your GitHub username.</p><div class="repo-bottom"><span><i data-lucide="github"></i> Live repos</span></div></div><div class="repo-card"><div class="repo-top"><span class="repo-name">Automatic cards</span><span class="repo-lang">LIVE</span></div><p>Your public repositories will appear here automatically with stars, forks, language and descriptions.</p><div class="repo-bottom"><span><i data-lucide="refresh-cw"></i> Auto updated</span></div></div><div class="repo-card"><div class="repo-top"><span class="repo-name">Your portfolio</span><span class="repo-lang">READY</span></div><p>Add screenshots above and use GitHub here as proof that the work is real and active.</p><div class="repo-bottom"><span><i data-lucide="image"></i> Add your work</span></div></div>';initIcons();return;}
  try{
    const res=await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&direction=desc&per_page=${GITHUB_LIMIT}`,{headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok)throw new Error('GitHub request failed');
    const repos=(await res.json()).filter(r=>!r.fork).slice(0,GITHUB_LIMIT);
    wrap.innerHTML=''; repos.forEach(r=>wrap.appendChild(repoCard(r))); setGithubStats(repos);
    status.textContent=`${repos.length} recent public repos`;
    initIcons();
  }catch(err){status.textContent='GitHub unavailable';wrap.innerHTML='<div class="repo-card"><div class="repo-name">Could not load repositories</div><p>Check the username in main.js or open GitHub directly.</p></div>';}
}

function initForm(){
  const form=$('#feedbackForm'), msg=$('#formMsg'), btn=$('#submitBtn'); if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault(); msg.textContent='Sending…'; btn.disabled=true;
    const data=Object.fromEntries(new FormData(form).entries());
    data.deviceInfo={os:navigator.platform,browser:navigator.userAgent,screen:`${innerWidth}x${innerHeight}`,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,page:location.href,referrer:document.referrer,isMobile:/Mobi|Android/i.test(navigator.userAgent),touchDevice:'ontouchstart' in window};
    try{const res=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.error||'Could not send');form.reset();msg.textContent='Thanks — your project brief is on its way.';}catch(err){msg.textContent=err.message||'Something went wrong. Please try again.';}finally{btn.disabled=false;}
  });
}


function initLiveMotion(){
  const beeLayer=document.querySelector('.bee-layer');
  if(!beeLayer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf=0;
  window.addEventListener('scroll',()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      const y=Math.min(window.scrollY,1600);
      beeLayer.style.transform=`translate3d(${Math.sin(y/260)*4}px,${Math.cos(y/330)*3}px,0)`;
      raf=0;
    });
  },{passive:true});
}

function initNavSpy(){
  const links=$$('#navLinks a');
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(!('IntersectionObserver' in window)) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      links.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+entry.target.id));
    });
  },{rootMargin:'-42% 0px -48% 0px',threshold:0});
  sections.forEach(s=>io.observe(s));
}

initNav(); initReveal(); initFilters(); initForm(); initIcons(); loadGithub(); initLiveMotion(); initNavSpy();


// Price CTA pre-fills the project type without adding friction.
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{const select=document.querySelector('#ftype'); if(select){const value=link.dataset.service.toLowerCase().includes('telegram')?'feature':link.dataset.service.toLowerCase().includes('landing')||link.dataset.service.toLowerCase().includes('website')?'other':'other'; select.value=value;}}));

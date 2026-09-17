(() => {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  // Mobile navigation
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      const icon = menuBtn.querySelector('svg');
      if (icon) icon.outerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
      if (window.lucide) lucide.createIcons();
    });
  }
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('open')));

  // Glass navigation state
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

  // Reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  // Active navigation based on visible section
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .2, .5] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Desktop cursor
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (cursor && ring && matchMedia('(pointer:fine)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cursor.style.left = `${x}px`; cursor.style.top = `${y}px`; });
    const loop = () => { rx += (x-rx)*.13; ry += (y-ry)*.13; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll('a,button,input,select,textarea,.feature-card,.dashboard-card').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.style.width='48px'; ring.style.height='48px'; ring.style.borderColor='rgba(86,125,148,.65)'; });
      el.addEventListener('mouseleave', () => { ring.style.width='34px'; ring.style.height='34px'; ring.style.borderColor='rgba(38,49,46,.42)'; });
    });
  }

  // Small magnetic lift for primary actions
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      if (!matchMedia('(pointer:fine)').matches) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2) * .08;
      const dy = (e.clientY - r.top - r.height/2) * .08;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // Device context included with feedback submissions
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (/Edg\//.test(ua)) browser = 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] || '');
    else if (/OPR\//.test(ua)) browser = 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] || '');
    else if (/Chrome\//.test(ua)) browser = 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '');
    else if (/Firefox\//.test(ua)) browser = 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] || '');
    else if (/Safari\//.test(ua)) browser = 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] || '');
    let os = 'Unknown';
    if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if (/iPhone OS ([\d_]+)/.test(ua)) os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g,'.');
    else if (/Android ([\d.]+)/.test(ua)) os = 'Android ' + ua.match(/Android ([\d.]+)/)[1];
    else if (/Mac OS X ([\d_]+)/.test(ua)) os = 'macOS ' + ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g,'.');
    else if (/Linux/.test(ua)) os = 'Linux';
    return { browser, os, screen:`${screen.width}x${screen.height} (${Math.round(devicePixelRatio*100)/100}x DPR)`, language:navigator.language, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone, page:location.href, referrer:document.referrer || 'Direct', isMobile:/Mobi|Android|iPhone|iPad/i.test(ua), touchDevice:navigator.maxTouchPoints > 0 };
  }

  // Contact form — keeps the existing /api/feedback backend intact
  const form = document.getElementById('contactForm');
  if (form) {
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('formMsg');
    const defaultLabel = 'Send message';
    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 'form-msg'; msg.style.display='none'; btn.disabled=true; btn.innerHTML='Sending…';
      try {
        const res = await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
          name:document.getElementById('fname').value, email:document.getElementById('femail').value, type:document.getElementById('ftype').value,
          message:document.getElementById('fmessage').value, deviceInfo:getDeviceInfo()
        })});
        let data={}; try { data=await res.json(); } catch {}
        if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong. Please try again.');
        msg.className='form-msg success'; msg.textContent='✓ Message sent. We’ll get back to you soon.'; msg.style.display='block'; form.reset();
      } catch(err) { msg.className='form-msg error'; msg.textContent='✕ '+(err.message || 'Something went wrong. Please try again.'); msg.style.display='block'; }
      finally { btn.disabled=false; btn.innerHTML=`${defaultLabel} <i data-lucide="arrow-up-right"></i>`; if(window.lucide) lucide.createIcons(); }
    });
  }

  // Icon pack enhancement; page remains usable if CDN is unavailable.
  const renderIcons = () => { if (window.lucide) lucide.createIcons({ attrs:{ 'stroke-width':1.8 } }); };
  if (window.lucide) renderIcons(); else window.addEventListener('load', renderIcons, { once:true });
})();

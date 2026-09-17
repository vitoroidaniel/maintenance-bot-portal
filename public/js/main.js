(() => {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lightweight navigation state — no continuous animation loop.
  const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  menuBtn?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
    if (window.lucide) lucide.createIcons();
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    if (menuBtn) menuBtn.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  }));

  // IntersectionObserver reveals elements only when needed.
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion) reveals.forEach(el => el.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    reveals.forEach(el => observer.observe(el));
  }

  // Subtle pointer tilt only on the main hero card; no cursor and no RAF loop.
  const heroCard = document.querySelector('.main-card');
  if (heroCard && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    heroCard.addEventListener('pointermove', e => {
      const r = heroCard.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      heroCard.style.transform = `rotateX(${y * -2.2}deg) rotateY(${x * 2.6}deg) translateY(-4px)`;
    });
    heroCard.addEventListener('pointerleave', () => { heroCard.style.transform = ''; });
  }

  // Active section indicator.
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav-links a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  const getDeviceInfo = () => ({
    os: navigator.platform || 'Unknown', browser: navigator.userAgent || 'Unknown',
    screen: `${screen.width}x${screen.height}`, language: navigator.language || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    page: location.href, referrer: document.referrer || '', isMobile: /Mobi|Android/i.test(navigator.userAgent),
    touchDevice: 'ontouchstart' in window
  });

  const form = document.getElementById('contactForm');
  if (form) {
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('formMsg');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      btn.disabled = true; btn.innerHTML = 'Sending…'; msg.className = 'form-msg'; msg.style.display = 'none';
      try {
        const res = await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
          name: document.getElementById('fname').value, email: document.getElementById('femail').value,
          type: document.getElementById('ftype').value, message: document.getElementById('fmessage').value, deviceInfo: getDeviceInfo()
        })});
        let data = {}; try { data = await res.json(); } catch {}
        if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong.');
        msg.className = 'form-msg success'; msg.textContent = '✓ Message sent. I’ll get back to you soon.'; msg.style.display = 'block'; form.reset();
      } catch (err) {
        msg.className = 'form-msg error'; msg.textContent = '✕ ' + (err.message || 'Something went wrong.'); msg.style.display = 'block';
      } finally {
        btn.disabled = false; btn.innerHTML = 'Send project brief <i data-lucide="arrow-up-right"></i>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  const renderIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.8 } });
  if (window.lucide) renderIcons(); else window.addEventListener('load', renderIcons, { once:true });
})();

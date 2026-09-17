// ── Custom cursor ────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

if (cursor && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx - 4 + 'px';
    cursor.style.top = my - 4 + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx - 16 + 'px';
    ring.style.top = ry - 16 + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
}

// ── Nav scroll state ─────────────────────────────────────────────────────────
const navEl = document.getElementById('nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Reveal-on-scroll ─────────────────────────────────────────────────────────
const revealTargets = document.querySelectorAll('.fade-up, .step, .feature-card');
if (revealTargets.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => obs.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('visible'));
}

// ── Lightweight device/browser info (helps triage bug reports) ──────────────
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
  else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, '.');
  else if (/iPad.*OS ([\d_]+)/.test(ua)) os = 'iPadOS ' + ua.match(/OS ([\d_]+)/)[1].replace(/_/g, '.');
  else if (/Android ([\d.]+)/.test(ua)) os = 'Android ' + ua.match(/Android ([\d.]+)/)[1];
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = 'macOS ' + ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.');
  else if (/Linux/.test(ua)) os = 'Linux';

  return {
    browser,
    os,
    screen: `${screen.width}x${screen.height} (${Math.round(window.devicePixelRatio * 100) / 100}x DPR)`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    page: window.location.href,
    referrer: document.referrer || 'Direct',
    isMobile: /Mobi|Android|iPhone|iPad/i.test(ua),
    touchDevice: navigator.maxTouchPoints > 0,
  };
}

// ── Contact form ──────────────────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMsg');
  const DEFAULT_LABEL = 'Send Message \u2192';

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    msg.className = 'form-msg';
    msg.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('fname').value,
          email: document.getElementById('femail').value,
          type: document.getElementById('ftype').value,
          message: document.getElementById('fmessage').value,
          deviceInfo: getDeviceInfo(),
        }),
      });

      let data = {};
      try { data = await res.json(); } catch { /* non-JSON error response */ }

      if (res.ok && data.success) {
        msg.className = 'form-msg success';
        msg.textContent = '\u2713 Message sent! You\u2019ll hear back by email soon.';
        contactForm.reset();
      } else {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      msg.className = 'form-msg error';
      msg.textContent = '\u2717 ' + (err.message || 'Something went wrong. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = DEFAULT_LABEL;
    }
  });
}

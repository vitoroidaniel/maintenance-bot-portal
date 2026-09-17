const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Rekka Software <onboarding@resend.dev>';

const FEEDBACK_TYPE_LABELS = {
  feedback: '💬 Feedback',
  bug: '🐛 Bug Report',
  feature: '✨ Feature Request',
  other: '📩 Other',
};
const MAX_NAME_LEN = 100;
const MAX_MESSAGE_LEN = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

// ── Mail client ───────────────────────────────────────────────────────────────
// Built lazily and defensively: a missing/invalid RESEND_API_KEY must never
// crash the process at boot. The site (and every static page) still has to
// load; only the one endpoint that needs mail degrades gracefully.
let resend = null;
if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
  } catch (err) {
    console.error('[mail] Failed to initialize Resend client:', err.message);
  }
} else {
  console.warn('[mail] RESEND_API_KEY not set — the contact form will accept submissions but cannot deliver email.');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendFeedbackEmail({ name, email, type, message, deviceInfo }) {
  if (!resend || !ADMIN_EMAIL) {
    const err = new Error('Email is not configured on this server.');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const label = FEEDBACK_TYPE_LABELS[type] || '📩 Message';
  const now = new Date().toUTCString();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const deviceBlock = deviceInfo ? `
    <div style="margin-top:16px;padding:16px;background:#0d1018;border-left:3px solid #374151">
      <div style="color:#6b7280;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px">Device Info</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
        <tr><td style="color:#6b7280;padding:4px 0;width:110px">OS</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.os) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Browser</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.browser) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Screen</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.screen) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Language</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.language) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Timezone</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.timezone) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Page</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.page) || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Referrer</td><td style="color:#f0f2f5">${escapeHtml(deviceInfo.referrer) || 'Direct'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Mobile</td><td style="color:#f0f2f5">${deviceInfo.isMobile ? 'Yes ✓' : 'No'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Touch</td><td style="color:#f0f2f5">${deviceInfo.touchDevice ? 'Yes ✓' : 'No'}</td></tr>
      </table>
    </div>` : '';

  const emailHtml = `
  <div style="font-family:monospace;background:#080a0e;color:#f0f2f5;padding:32px;max-width:620px">
    <div style="border-bottom:1px solid #1f2937;padding-bottom:16px;margin-bottom:24px">
      <span style="color:#e8ff47;font-size:1.2rem;font-weight:bold">REKKA SOFTWARE</span>
      <span style="color:#6b7280;font-size:0.8rem;margin-left:12px">Website Submission</span>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="color:#6b7280;padding:6px 0;width:100px;font-size:0.8rem">Type</td><td style="color:#f0f2f5;font-size:0.85rem">${label}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Name</td><td style="color:#f0f2f5;font-size:0.85rem">${safeName}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Email</td><td style="color:#f0f2f5;font-size:0.85rem">${safeEmail || '—'}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Time</td><td style="color:#f0f2f5;font-size:0.85rem">${now}</td></tr>
    </table>
    <div style="padding:16px;background:#0d1018;border-left:3px solid #e8ff47;margin-bottom:8px">
      <div style="color:#6b7280;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px">Message</div>
      <div style="line-height:1.8;font-size:0.875rem">${safeMessage}</div>
    </div>
    ${deviceBlock}
  </div>`;

  await resend.emails.send({
    from: RESEND_FROM,
    to: ADMIN_EMAIL,
    reply_to: email || undefined,
    subject: `[Rekka Software] ${label} from ${name}`,
    html: emailHtml,
  });
}

// ── Very small in-memory per-IP rate limiter for the feedback endpoint ───────
// Note: resets on redeploy/restart and isn't shared across instances — fine
// for a single small Railway service, not a substitute for a real rate
// limiter (e.g. Redis-backed) if this ever scales to multiple instances.
const submissionsByIp = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = submissionsByIp.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    submissionsByIp.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of submissionsByIp) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) submissionsByIp.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

// Railway (and most PaaS) sit behind a reverse proxy; this is required for
// req.ip / X-Forwarded-For to reflect the real client IP.
app.set('trust proxy', 1);

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.post('/api/feedback', async (req, res) => {
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again in a few minutes.' });
  }

  const { name, email, type, message, deviceInfo } = req.body || {};

  if (typeof name !== 'string' || typeof message !== 'string' || !name.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  if (name.trim().length > MAX_NAME_LEN || message.trim().length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: 'Name or message is too long.' });
  }
  if (email !== undefined && typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email.' });
  }

  const safeType = Object.prototype.hasOwnProperty.call(FEEDBACK_TYPE_LABELS, type) ? type : 'other';

  try {
    await sendFeedbackEmail({
      name: name.trim(),
      email: email ? email.trim() : '',
      type: safeType,
      message: message.trim(),
      deviceInfo: deviceInfo && typeof deviceInfo === 'object' ? deviceInfo : null,
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.code === 'EMAIL_NOT_CONFIGURED') {
      console.error('[mail] Feedback received but email is not configured — message was NOT delivered.', { name: name.trim(), type: safeType });
      return res.status(503).json({ error: 'The contact form is temporarily unavailable. Please try again later.' });
    }
    console.error('[mail] Failed to send feedback email:', err.message);
    return res.status(502).json({ error: 'Failed to send your message. Please try again.' });
  }
});

// SPA-style fallback for any non-API route.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rekka Software running on port ${PORT}`);
  if (!resend || !ADMIN_EMAIL) {
    console.warn('[mail] Contact form email delivery is disabled until RESEND_API_KEY and ADMIN_EMAIL are set.');
  }
});

const express    = require('express');
const fetch      = require('node-fetch');
const nodemailer = require('nodemailer');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN      = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID  = process.env.ADMIN_CHAT_ID;
const GMAIL_USER     = process.env.GMAIL_USER;
const GMAIL_PASS     = process.env.GMAIL_APP_PASSWORD;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;

// ── Mailer ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

async function sendMail({ to, subject, html }) {
  if (!GMAIL_USER || !GMAIL_PASS) return;
  try {
    await transporter.sendMail({
      from: `"Kurtex Alerts" <${GMAIL_USER}>`,
      to: to || ADMIN_EMAIL,
      subject,
      html,
    });
    console.log(`Mail sent: ${subject}`);
  } catch (err) {
    console.error('Mail error:', err.message);
  }
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(text) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Feedback form ─────────────────────────────────────────────────────────────
app.post('/api/feedback', async (req, res) => {
  const { name, email, type, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });

  const typeLabels = { feedback: '💬 Feedback', bug: '🐛 Bug Report', feature: '✨ Feature Request', other: '📩 Other' };
  const label = typeLabels[type] || '📩 Message';
  const now   = new Date().toUTCString();

  const tgText = [`${label} via Kurtex Website`, '', `👤 Name: ${name}`, email ? `📧 Email: ${email}` : null, `🕐 ${now}`, '', `📝 ${message}`].filter(Boolean).join('\n');

  const emailHtml = `<div style="font-family:monospace;background:#080a0e;color:#f0f2f5;padding:32px;max-width:600px">
    <div style="border-bottom:1px solid #1f2937;padding-bottom:16px;margin-bottom:24px">
      <span style="color:#e8ff47;font-size:1.2rem;font-weight:bold">KURTEX</span>
      <span style="color:#6b7280;font-size:0.8rem;margin-left:12px">Website Submission</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="color:#6b7280;padding:6px 0;width:100px">Type</td><td>${label}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Name</td><td>${name}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Email</td><td>${email || '—'}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Time</td><td>${now}</td></tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:#0d1018;border-left:3px solid #e8ff47">
      <div style="color:#6b7280;font-size:0.75rem;margin-bottom:8px">MESSAGE</div>
      <div style="line-height:1.7">${message.replace(/\n/g, '<br/>')}</div>
    </div>
  </div>`;

  try {
    await Promise.all([sendTelegram(tgText), sendMail({ subject: `[Kurtex] ${label} from ${name}`, html: emailHtml })]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send.' });
  }
});

// ── Bot crash alert endpoint ───────────────────────────────────────────────────
app.post('/api/alert', async (req, res) => {
  const { bot, error, logs, level } = req.body;
  if (req.headers['x-alert-secret'] !== process.env.ALERT_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const now   = new Date().toUTCString();
  const emoji = level === 'CRITICAL' ? '🔴' : '🟡';

  const tgText = [`${emoji} <b>${level || 'ERROR'} — ${bot}</b>`, '', `<b>Time:</b> ${now}`, `<b>Error:</b> ${error}`, logs ? `\n<b>Logs:</b>\n<pre>${logs.slice(0, 800)}</pre>` : ''].join('\n');

  const emailHtml = `<div style="font-family:monospace;background:#080a0e;color:#f0f2f5;padding:32px;max-width:600px">
    <div style="border-bottom:1px solid #1f2937;padding-bottom:16px;margin-bottom:24px">
      <span style="color:#ff5f57;font-size:1.2rem;font-weight:bold">${emoji} ${level || 'ERROR'} — ${bot}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="color:#6b7280;padding:6px 0;width:80px">Bot</td><td>${bot}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Time</td><td>${now}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Error</td><td style="color:#ff5f57">${error}</td></tr>
    </table>
    ${logs ? `<div style="margin-top:24px;padding:16px;background:#0d1018;border-left:3px solid #ff5f57">
      <div style="color:#6b7280;font-size:0.75rem;margin-bottom:8px">LOGS</div>
      <pre style="color:#f0f2f5;font-size:0.75rem;white-space:pre-wrap;margin:0">${logs.slice(0, 2000)}</pre>
    </div>` : ''}
  </div>`;

  await Promise.all([sendTelegram(tgText), sendMail({ subject: `[Kurtex ${level || 'ERROR'}] ${bot} — ${error.slice(0, 60)}`, html: emailHtml })]);
  res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Kurtex Web running on port ${PORT}`));
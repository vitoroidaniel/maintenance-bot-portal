const express    = require('express');
const fetch      = require('node-fetch');
const { Resend } = require('resend');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN      = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID  = process.env.ADMIN_CHAT_ID;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Mailer ────────────────────────────────────────────────────────────────────
async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Mail skipped: RESEND_API_KEY not set');
    return;
  }
  try {
    await resend.emails.send({
      from: 'Kurtex Alerts <onboarding@resend.dev>',
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
  const { name, email, type, message, deviceInfo } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });

  const typeLabels = { feedback: '💬 Feedback', bug: '🐛 Bug Report', feature: '✨ Feature Request', other: '📩 Other' };
  const label = typeLabels[type] || '📩 Message';
  const now   = new Date().toUTCString();

  // Telegram message
  const tgText = [
    `${label} via Kurtex Website`, '',
    `👤 Name: ${name}`,
    email ? `📧 Email: ${email}` : null,
    `🕐 ${now}`, '',
    `📝 ${message}`,
    deviceInfo ? [
      '', '─── Device ───',
      `🖥 OS: ${deviceInfo.os}`,
      `🌐 Browser: ${deviceInfo.browser}`,
      `📐 Screen: ${deviceInfo.screen}`,
      `🌍 Timezone: ${deviceInfo.timezone}`,
      `📱 Mobile: ${deviceInfo.isMobile ? 'Yes' : 'No'}`,
    ].join('\n') : null,
  ].filter(Boolean).join('\n');

  // Device info block for email
  const deviceBlock = deviceInfo ? `
    <div style="margin-top:16px;padding:16px;background:#0d1018;border-left:3px solid #374151">
      <div style="color:#6b7280;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px">Device Info</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
        <tr><td style="color:#6b7280;padding:4px 0;width:110px">OS</td><td style="color:#f0f2f5">${deviceInfo.os || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Browser</td><td style="color:#f0f2f5">${deviceInfo.browser || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Screen</td><td style="color:#f0f2f5">${deviceInfo.screen || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Language</td><td style="color:#f0f2f5">${deviceInfo.language || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Timezone</td><td style="color:#f0f2f5">${deviceInfo.timezone || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Page</td><td style="color:#f0f2f5">${deviceInfo.page || '—'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Referrer</td><td style="color:#f0f2f5">${deviceInfo.referrer || 'Direct'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Mobile</td><td style="color:#f0f2f5">${deviceInfo.isMobile ? 'Yes ✓' : 'No'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Touch</td><td style="color:#f0f2f5">${deviceInfo.touchDevice ? 'Yes ✓' : 'No'}</td></tr>
      </table>
    </div>` : '';

  const emailHtml = `
  <div style="font-family:monospace;background:#080a0e;color:#f0f2f5;padding:32px;max-width:620px">

    <div style="border-bottom:1px solid #1f2937;padding-bottom:16px;margin-bottom:24px">
      <span style="color:#e8ff47;font-size:1.2rem;font-weight:bold">KURTEX</span>
      <span style="color:#6b7280;font-size:0.8rem;margin-left:12px">Website Submission</span>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="color:#6b7280;padding:6px 0;width:100px;font-size:0.8rem">Type</td>
        <td style="color:#f0f2f5;font-size:0.85rem">${label}</td>
      </tr>
      <tr>
        <td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Name</td>
        <td style="color:#f0f2f5;font-size:0.85rem">${name}</td>
      </tr>
      <tr>
        <td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Email</td>
        <td style="color:#f0f2f5;font-size:0.85rem">${email || '—'}</td>
      </tr>
      <tr>
        <td style="color:#6b7280;padding:6px 0;font-size:0.8rem">Time</td>
        <td style="color:#f0f2f5;font-size:0.85rem">${now}</td>
      </tr>
    </table>

    <div style="padding:16px;background:#0d1018;border-left:3px solid #e8ff47;margin-bottom:8px">
      <div style="color:#6b7280;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px">Message</div>
      <div style="line-height:1.8;font-size:0.875rem">${message.replace(/\n/g, '<br/>')}</div>
    </div>

    ${deviceBlock}

  </div>`;

  try {
    await Promise.all([
      sendTelegram(tgText),
      sendMail({ subject: `[Kurtex] ${label} from ${name}`, html: emailHtml })
    ]);
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

  const tgText = [
    `${emoji} <b>${level || 'ERROR'} — ${bot}</b>`, '',
    `<b>Time:</b> ${now}`,
    `<b>Error:</b> ${error}`,
    logs ? `\n<b>Logs:</b>\n<pre>${logs.slice(0, 800)}</pre>` : ''
  ].join('\n');

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

  await Promise.all([
    sendTelegram(tgText),
    sendMail({ subject: `[Kurtex ${level || 'ERROR'}] ${bot} — ${error.slice(0, 60)}`, html: emailHtml })
  ]);
  res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Kurtex Web running on port ${PORT}`));

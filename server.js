const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN   = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // your Telegram ID

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/feedback', async (req, res) => {
  const { name, email, type, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  const typeLabels = {
    feedback: '💬 Feedback',
    bug:      '🐛 Bug Report',
    feature:  '✨ Feature Request',
    other:    '📩 Other',
  };

  const label = typeLabels[type] || '📩 Message';

  const text = [
    `${label} via Kurtex Website`,
    '',
    `👤 Name: ${name}`,
    email ? `📧 Email: ${email}` : null,
    '',
    `📝 Message:`,
    message,
  ].filter(l => l !== null).join('\n');

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    ADMIN_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.json({ success: true });
  } catch (err) {
    console.error('Telegram error:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kurtex Web running on port ${PORT}`);
});
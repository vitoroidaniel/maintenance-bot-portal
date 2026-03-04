const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Pull variables from Railway env
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const YOUR_CHAT_ID = process.env.YOUR_CHAT_ID;

// Serve static frontend
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Feedback form endpoint
app.post('/send-feedback', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('All fields are required!');
    }

    const text = `📝 Feedback / Issue Report\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: YOUR_CHAT_ID, text })
        });
        res.send('Feedback sent successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to send feedback.');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
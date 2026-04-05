const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode'); // חבילה חדשה להפיכת ה-QR לתמונה

const app = express();
app.use(express.json());
app.use(cors());

let qrImageData = ""; // משתנה שיחזיק את התמונה של הברקוד
let isReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// כשנוצר QR, נהפוך אותו ל-Data URL (תמונה שאפשר להציג ב-HTML)
client.on('qr', async (qr) => {
    console.log('New QR Received');
    qrImageData = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready!');
    qrImageData = ""; // מנקים את הברקוד
    isReady = true;
});

client.on('authenticated', () => console.log('👍 Authenticated'));

// נקודת קצה לבדיקת סטטוס וקבלת QR
app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady, 
        qr: qrImageData 
    });
});

// שליחת הודעה
app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    if (!isReady) return res.status(500).json({ error: "הבוט לא מחובר" });

    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    client.initialize();
});

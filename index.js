const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();

// הגדרת CORS פעם אחת בלבד בצורה נכונה
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let qrImageData = ""; 
let isReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || '/usr/bin/chromium',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote',
            '--disable-gpu'
        ],
    }
});

client.on('qr', async (qr) => {
    console.log('New QR Received');
    try {
        qrImageData = await qrcode.toDataURL(qr);
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready!');
    qrImageData = ""; 
    isReady = true;
});

client.on('authenticated', () => {
    console.log('👍 Authenticated');
    qrImageData = "";
});

client.on('auth_failure', msg => {
    console.error('❌ AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    isReady = false;
    client.initialize(); // ניסיון להתחבר מחדש
});

// לוג שגיאות גלובלי כדי לא להפיל את התהליך בשקט
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// דף בית ובריאות לשירות
app.get('/', (req, res) => {
    res.send('Remember bot service is up. See /status');
});

app.get('/healthz', (req, res) => res.send('ok'));

app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady, 
        qr: qrImageData 
    });
});

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

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  // התחל את לקוח הוואטסאפ אחרי שהשרת קם, כדי שהבריאות תענה גם אם יש תקלה ב-Puppeteer
  client.initialize().catch(err => {
    console.error('Failed to initialize WhatsApp client:', err);
  });
});

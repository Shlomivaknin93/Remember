const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
let Client, LocalAuth;

const app = express();

// הגדרות CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let qrImageData = ""; 
let isReady = false;
let client = null;

const SKIP_WA = (process.env.SKIP_WA || '').toLowerCase() === 'true' || process.env.SKIP_WA === '1';
const resolvedChromePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || '/usr/bin/google-chrome';

console.log('Chromium executable path resolved to:', resolvedChromePath);

function initWhatsApp() {
    try {
        ({ Client, LocalAuth } = require('whatsapp-web.js'));
    } catch (e) {
        console.error('Failed to require whatsapp-web.js:', e);
        return;
    }

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: resolvedChromePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                // User Agent קריטי למניעת שגיאת "לא ניתן לקשר מכשיר"
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
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
        isReady = false;
    });

    client.on('disconnected', (reason) => {
        console.log('Client was logged out', reason);
        isReady = false;
        qrImageData = "";
        // ניסיון התחברות מחדש לאחר 5 שניות למניעת לולאת קריסה
        setTimeout(() => client.initialize(), 5000);
    });

    client.initialize().catch(err => {
        console.error('Failed to initialize WhatsApp client:', err);
    });
}

// טיפול בשגיאות גלובליות
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

app.get('/', (req, res) => res.send('Remember bot service is up. See /status'));

app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady, 
        qr: qrImageData,
        waDisabled: SKIP_WA
    });
});

app.post('/send', async (req, res) => {
    let { number, message } = req.body;
    if (!isReady || !client) return res.status(500).json({ error: "הבוט לא מחובר" });

    try {
        // ניקוי המספר והפיכתו לפורמט ישראלי בינלאומי אם צריך
        let cleanedNumber = number.replace(/\D/g, ''); 
        if (cleanedNumber.startsWith('0')) {
            cleanedNumber = '972' + cleanedNumber.substring(1);
        }
        
        const chatId = cleanedNumber.includes('@c.us') ? cleanedNumber : `${cleanedNumber}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`Message sent to ${cleanedNumber}`);
        res.json({ success: true });
    } catch (e) {
        console.error('Send error:', e);
        res.status(500).json({ error: e.message });
    }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    if (!SKIP_WA) initWhatsApp();
});

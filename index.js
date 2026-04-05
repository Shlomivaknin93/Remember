const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// אתחול הלקוח עם LocalAuth כדי לשמור את נתוני ההתחברות מקומית
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// כשהמערכת דורשת סריקת ברקוד, נדפיס אותו לטרמינל
client.on('qr', (qr) => {
    console.log('סרוק את הברקוד הבא עם הוואטסאפ בטלפון שלך:');
    qrcode.generate(qr, { small: true });
});

// ברגע שהחיבור עבר בהצלחה
client.on('ready', () => {
    console.log('הבוט מחובר ומוכן לשלוח הודעות! 💚');
    
    // דוגמה לשליחת הודעה:
    // חובה להוסיף את הקידומת (ללא פלוס או אפסים) ואת הסיומת @c.us
    const phoneNumber = "972501234567"; // תחליף למספר האמיתי
    const message = "היי! זו הודעת ניסיון מהבוט האוטומטי שלנו 🤖";
    
    sendMessage(phoneNumber, message);
});

// פונקציית עזר לשליחת הודעות
async function sendMessage(number, text) {
    const chatId = `${number}@c.us`;
    try {
        await client.sendMessage(chatId, text);
        console.log(`הודעה נשלחה בהצלחה למספר ${number}`);
    } catch (err) {
        console.error('שגיאה בשליחת ההודעה:', err);
    }
}

client.initialize();

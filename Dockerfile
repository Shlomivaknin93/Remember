# משתמשים בתמונה שכוללת כבר את כל התלויות של Puppeteer (הדפדפן)
FROM ghcr.io/puppeteer/puppeteer:latest

# מעבר למשתמש root כדי להתקין דברים אם צריך
USER root

# הגדרת תיקיית העבודה
WORKDIR /app

# העתקת קבצי ההגדרות
COPY package*.json ./

# התקנת הספריות (כולל whatsapp-web.js ו-cors)
RUN npm install

# העתקת כל שאר הקבצים (כולל index.js)
COPY . .

# הגדרת משתנה סביבה שהדפדפן ידע איפה הוא רץ
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# חשיפת הפורט (Railway יזריק את הפורט שלו לפה)
EXPOSE 3000

# הפקודה להרצת השרת שלך
CMD ["node", "index.js"]

FROM node:18-slim

# התקנת כרום וספריות מערכת (זה רץ מהר)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# הגדרות כדי שלא ינסה להוריד כרום שוב
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# העתקת קבצי ההתקנה
COPY package.json ./
# השורה הבאה מונעת שגיאות אם אין לך קובץ lock
COPY package-lock.json* ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

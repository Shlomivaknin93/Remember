FROM node:18-slim

# התקנת ספריות מערכת בלבד (זה רץ מהר מאוד)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# הגדרה שמונעת מ-npm להוריד כרום בעצמו
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
# התקנה ללא הורדת דפדפן - זה אמור לקחת פחות מ-2 דקות
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

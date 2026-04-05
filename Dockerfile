FROM node:18-slim

# התקנה מהירה של תלויות הלינוקס
RUN apt-get update && apt-get install -y \
    chromium \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# הגדרות Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# קודם כל התקנת ספריות (כדי ש-Railway ישמור אותן בזיכרון)
COPY package.json ./
RUN npm install --production

# רק אז העתקת שאר הקוד
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

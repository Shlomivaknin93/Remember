FROM node:18-slim

# התקנת דפדפן קל ישירות למערכת
RUN apt-get update && apt-get install -y \
    chromium \
    libxss1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# הגדרת Puppeteer להשתמש בדפדפן שהתקנו
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

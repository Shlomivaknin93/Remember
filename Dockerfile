FROM ghcr.io/puppeteer/puppeteer:22.13.1

WORKDIR /app

# ודא ש-puppeteer לא מנסה להוריד כרום מחדש, ומשתמש בבינארי שמגיע עם התמונה
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

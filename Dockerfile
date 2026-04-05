FROM ghcr.io/puppeteer/puppeteer:22.13.1

WORKDIR /app

# ודא ש-puppeteer לא מנסה להוריד כרום מחדש, ומשתמש בבינארי שמגיע עם התמונה
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome \
    CHROME_PATH=/usr/bin/google-chrome

COPY package*.json ./
# אין lockfile בריפו, נשתמש ב-npm install במקום ci
RUN npm install --omit=dev
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

FROM ghcr.io/puppeteer/puppeteer:latest
USER root
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]

# שימוש בתמונה רשמית של Node (גרסה קלה)
FROM node:18-slim

# התקנת התלויות המינימליות שהדפדפן (Puppeteer) צריך כדי לרוץ בלינוקס
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# הגדרת תיקיית עבודה
WORKDIR /app

# העתקת קבצי החבילות בלבד קודם (בשביל Cache מהיר)
COPY package*.json ./

# התקנה מהירה של הספריות
RUN npm install --production

# העתקת שאר הקבצים
COPY . .

# הגדרת הפורט
EXPOSE 3000

# הרצה
CMD ["node", "index.js"]

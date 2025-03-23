FROM node:18

WORKDIR /app
COPY . .

# Instalar Chromium y dependencias necesarias para Puppeteer
RUN apt-get update && \
    apt-get install -y \
    wget \
    gnupg \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-glib-1-2 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Instalar Puppeteer permitiendo que descargue Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm install

CMD ["node", "bot.js"]

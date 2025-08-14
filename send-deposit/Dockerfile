FROM node:18-slim

WORKDIR /app

# Install system dependencies for Ledger support
RUN apt-get update && apt-get install -y \
    libudev-dev \
    libusb-1.0-0-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY stake.js .

# Script will expect deposit_data.json to be mounted
ENTRYPOINT ["node", "stake.js"]
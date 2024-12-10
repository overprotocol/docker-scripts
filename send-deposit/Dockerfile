FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY stake.js .

# Script will expect deposit_data.json to be mounted
ENTRYPOINT ["node", "stake.js"]
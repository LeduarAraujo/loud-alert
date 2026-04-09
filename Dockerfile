FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --registry=https://registry.npmjs.org

COPY src/ ./src/

USER node

CMD ["node", "src/index.js"]

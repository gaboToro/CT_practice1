FROM node:20-alpine

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Código
COPY backend ./backend
COPY database ./database

ENV PORT=3000
EXPOSE 3000

CMD ["node", "backend/server.js"]

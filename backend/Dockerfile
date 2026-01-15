FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create saves directory
RUN mkdir -p /app/saves

EXPOSE 8086

CMD ["node", "server.js"]

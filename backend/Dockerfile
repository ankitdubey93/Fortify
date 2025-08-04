FROM node:24.4.1

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
RUN npm run build

CMD ["npm", "run", "start"]

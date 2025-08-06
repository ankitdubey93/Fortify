# frontend/Dockerfile

FROM node:24.4.1 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
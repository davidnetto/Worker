FROM node:14.17.1-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ .

CMD ["node", "index.js"]
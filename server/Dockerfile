FROM node:latest

WORKDIR /usr/src/api

COPY package.json ./package.json
COPY .env.production ./.env

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:dev" ]
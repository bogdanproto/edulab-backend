FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json /usr/src/app

RUN npm ci

COPY . .

EXPOSE 5000

RUN npm run build

CMD ["npm", "start"]
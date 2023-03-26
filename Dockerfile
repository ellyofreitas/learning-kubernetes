FROM node:18-alpine as builder 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

FROM node:18-alpine

COPY --from=builder /usr/src/app .

EXPOSE 9090

CMD [ "node", "lib/server.js" ]
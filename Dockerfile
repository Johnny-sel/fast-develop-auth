FROM node:18.17.1-alpine3.18
RUN apk add --no-cache bash
WORKDIR /app
COPY package.json yarn.lock ./prisma wait-for-it.sh ./
RUN yarn install
COPY . .
EXPOSE 4000


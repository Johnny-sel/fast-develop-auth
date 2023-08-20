FROM node:18.17.1-alpine3.18
WORKDIR /app
COPY package.json yarn.lock ./prisma ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 4000


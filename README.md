# Auth service

## First steps

    npm install -g dotenv-cli @nestjs/cli

## Start PRODUCTION

### --- Start production via docker

    docker-compose --env-file .env.production --profile production -f docker-compose.prod.yml -f docker-compose.base.yml up --build

## Start Development

### --- Start development via local

    install postgres database in local machine with settings in .env.development
    dotenv -e .env.development -- npx prisma generate
    dotenv -e .env.development -- npx prisma migrate dev
    yarn start:dev
    go to http://localhost:4000/swagger

OR

### --- Start development via docker

    docker-compose --env-file .env.development -f docker-compose.dev.yml -f docker-compose.base.yml up --build
    dotenv -e .env.development -- npx prisma generate
    dotenv -e .env.development -- npx prisma migrate dev
    yarn start:dev
    go to http://localhost:4000/swagger

##TODO

    1. test

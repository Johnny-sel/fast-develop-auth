# Auth service
## First steps
    npm install -g dotenv-cli @nestjs/cli

## Start Local Development
### --- Start local development via local database

    install postgres database in local machine with settings in .env.local
    dotenv -e .env.local -- npx prisma generate
    dotenv -e .env.local -- npx prisma migrate dev
    yarn start:local
    go to http://localhost:4000/swagger
OR
### --- Start local development via docker database
    docker-compose --env-file .env.local -f docker-compose.base.yml -f docker-compose.local.yml up --build
    dotenv -e .env.local -- npx prisma generate
    dotenv -e .env.local -- npx prisma migrate dev
    yarn start:local
    go to http://localhost:4000/swagger

## Start testing
### --- Start local development via local database
    install postgres database in local machine with settings in .env.local
    dotenv -e .env.testing -- npx prisma generate
    dotenv -e .env.testing -- npx prisma migrate dev
    yarn test:e2e

OR
### --- Start testing via docker
    docker-compose --env-file .env.testing -f docker-compose.base.yml -f docker-compose.test.yml up --build
    dotenv -e .env.testing -- npx prisma generate
    dotenv -e .env.testing -- npx prisma migrate dev
    yarn test:e2e

## Start on PRODUCTION server
### --- Start production via docker
    docker-compose --env-file .env.production --profile production -f docker-compose.base.yml -f docker-compose.prod.yml  up --build

## Start on STAGING server
### --- Start staging via docker
    docker-compose --env-file .env.staging --profile staging -f docker-compose.base.yml -f docker-compose.stage.yml  up --build

## Start on DEVELOPMENT server
### --- Start staging via docker
    docker-compose --env-file .env.development --profile development -f docker-compose.base.yml -f docker-compose.dev.yml  up --build

##TODO

    1. e2e test
    2. other test

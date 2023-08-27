# Auth service

## First steps

    npm install -g dotenv-cli @nestjs/cli

## Start PRODUCTION

### --- Start production via docker

    docker-compose --env-file .env.production --profile production -f docker-compose.prod.yml -f docker-compose.base.yml up --build

## Start Development

### --- Start development via local

    1. install postgres database in local machine with settings in .env.development
    2. dotenv -e .env.development -- npx prisma generate
    3. dotenv -e .env.development -- npx prisma migrate dev
    4. yarn start:dev
    5. go to http://localhost:4000/swagger

OR

### --- Start development via docker

    1. docker-compose --env-file .env.development -f docker-compose.dev.yml -f docker-compose.base.yml up --build
    2. dotenv -e .env.development -- npx prisma generate
    3. dotenv -e .env.development -- npx prisma migrate dev
    4. yarn start:dev
    5. go to http://localhost:4000/swagger

##TODO

    1. test

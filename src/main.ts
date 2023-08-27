import {getEnvFilePath} from './utils/getEnvFilePath';
import {config} from 'dotenv';
config({path: getEnvFilePath()});

import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
import * as packageJson from '../package.json';

async function bootstrap() {
  console.log('[INFO] App env is:', process.env.APP_ENV);

  const app = await NestFactory.create(AppModule);
  const validationPipe = new ValidationPipe();

  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app
    .listen(process.env.APP_PORT!)
    .then(() => console.log('[INFO] Auth service is launched'));
}

bootstrap();

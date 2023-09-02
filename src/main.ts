import {getEnvFilePath} from './utils/getEnvFilePath';
import {config} from 'dotenv';

const envFilePath = getEnvFilePath();
config({path: envFilePath});

import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
import * as packageJson from '../package.json';

async function bootstrap() {
  if (!process.env.APP_PORT) {
    throw new Error('Define .env file please in root directory');
  }

  console.log(`[INFO] App mode: ${process.env.APP_ENV}`);
  console.log(`[INFO] Environment variables launch from: ${envFilePath}.`);

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
    .listen(process.env.APP_PORT)
    .then(() => console.log('[INFO] Auth application is launched'));
}

bootstrap();

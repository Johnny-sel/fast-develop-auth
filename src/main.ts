import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const validationPipe = new ValidationPipe();

  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);
  app.listen(4000);
}

bootstrap();

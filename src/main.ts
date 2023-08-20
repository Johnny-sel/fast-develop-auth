import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as packageJson from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const validationPipe = new ValidationPipe();

  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);

  const config = new DocumentBuilder()
    .setTitle('auth open api')
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.listen(4000);
}

bootstrap();

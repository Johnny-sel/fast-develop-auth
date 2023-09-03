import {config} from 'dotenv';
import {getEnvFilePath} from './../src/utils/getEnvFilePath';

const envFilePath = getEnvFilePath();
config({path: envFilePath});

import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';

import * as request from 'supertest';
import {PrismaService} from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // clear db
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany();
  });

  it('/auth/local/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/local/signup')
      .send({email: 'test@test.com', password: 'Test123#'})
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});

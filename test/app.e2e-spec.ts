import {getEnvFilePath} from '../src/utils/getEnvFilePath';
import {config} from 'dotenv';

const envFilePath = getEnvFilePath();
config({path: envFilePath});

import {Test, TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import {AppModule} from '../src/app.module';
import {PrismaService} from '../src/prisma/prisma.service';
import {createPromptModule} from 'inquirer';

import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';

// Функция для имитации ввода OTP-кода
const inputTOTPcode = async (secret2FA: String) => {
  const inquirer = createPromptModule();
  const answers = await inquirer([
    {
      type: 'input',
      name: 'TOTPcode',
      message: `
        Go to Google Authenticator app and enter secret2FA: ${secret2FA}
        Then enter TOTP code:`,
    },
  ]);

  return String(answers.otpCode);
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let moduleFixture: TestingModule;

  // start data
  const email = 'test@test.test';
  const password = 'Test123#';

  // init app
  beforeAll(async () => {
    const validationPipe = new ValidationPipe();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(validationPipe);

    await app.init();
  });

  // clear db
  beforeEach(async () => {
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany();
  });

  // Интеграционный тест
  it('should register, get user, logout, and then login', async () => {
    // Регистрация пользователя
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/local/signup')
      .send({email, password})
      .expect(HttpStatus.CREATED);

    // Проверка успешной регистрации
    expect(signupResponse.text).toBe('ok');

    // Получение данных пользователя
    const getUserResponse = await request(app.getHttpServer())
      .get('/auth/user')
      .set('Cookie', [signupResponse.header['set-cookie']])
      .expect(HttpStatus.OK);

    // Проверка успешного получения данных пользователя
    const userResponse = getUserResponse.body;
    expect(userResponse.email).toEqual('test@test.test'); // Замените на актуальные проверки

    // Выход пользователя
    const logoutResponse = await request(app.getHttpServer())
      .get('/auth/logout')
      .set('Cookie', [signupResponse.header['set-cookie']])
      .expect(HttpStatus.OK);

    // Проверка успешного выхода пользователя
    expect(logoutResponse.text).toBe('ok');

    // Вход после выхода
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/local/signin')
      .send({email, password})
      .expect(HttpStatus.OK);

    // Проверка успешного входа после выхода
    expect(loginResponse.text).toBe('ok');
  });

  it('should generate QR code and secret for 2FA and confirm otp', async () => {
    // Создание пользователя
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/local/signup')
      .send({email, password})
      .expect(HttpStatus.CREATED);

    // Проверка успешной регистрации
    expect(signupResponse.text).toBe('ok');

    // Генерация QR-кода и секрета 2FA
    const generateTotpResponse = await request(app.getHttpServer())
      .get('/auth/2fa/generate-totp')
      .set('Cookie', [signupResponse.header['set-cookie']])
      .expect(HttpStatus.OK);

    const qrCodeImage = generateTotpResponse.body.qrCodeImage;
    const secret2FA = generateTotpResponse.body.secret2FA;

    // Проверка успешной генерации QR-кода и секрета 2FA
    expect(qrCodeImage).toBeDefined();
    expect(secret2FA).toBeDefined();

    // Ввод OTP-кода
    const TOTPcode = await inputTOTPcode(secret2FA);

    // Подтверждение TOTP-кода
    const confirmTotpResponse = await request(app.getHttpServer())
      .post('/auth/2fa/confirm-totp')
      .send({TOTPcode, email, password})
      .expect(HttpStatus.OK);

    // Проверка успешного подтверждения TOTP и аутентификации с 2FA
    expect(confirmTotpResponse.text).toBe('ok');
  });

  afterAll(async () => {
    await app.close();
  });
});

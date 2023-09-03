import {$Enums} from '@prisma/client';
import {createId} from '@paralleldrive/cuid2';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from './../../src/prisma/prisma.service';
import {AuthDto, ConfirmTotpDto, SigninDto} from './auth.dto';
import {DecryptedDataToJwt, Tokens} from './auth.interface';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {ERRORS} from './auth.errors';

import * as argon from 'argon2';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  private async getJwTokens({userId, email, permissions}: DecryptedDataToJwt) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {sub: userId, email, permissions},
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        }
      ),
      this.jwtService.signAsync(
        {sub: userId, email, permissions},
        {
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
        }
      ),
    ]);

    return {accessToken, refreshToken};
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hashRefreshToken = await argon.hash(refreshToken);

    await this.prisma.user.update({
      where: {id: userId},
      data: {hashRefreshToken},
    });
  }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const userId = createId();
    const hashPassword = await argon.hash(dto.password);
    const tokens = await this.getJwTokens({
      email: dto.email,
      userId,
      permissions: [$Enums.PermissionsEnum.customer],
    });

    const hashRefreshToken = await argon.hash(tokens.refreshToken);

    await this.prisma.user.create({
      data: {id: userId, email: dto.email, hashPassword, hashRefreshToken},
    });

    return tokens;
  }

  async signinLocal(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({where: {email: dto.email}});

    if (!user) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    const isPasswordMatches = await argon.verify(
      user.hashPassword,
      dto.password
    );

    if (!isPasswordMatches) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    if (user.twoFactorIsEnable) {
      return {isTwoFactorEnable: true, tokens: null};
    }

    const tokens = await this.getJwTokens({
      userId: user.id,
      email: user.email,
      permissions: user.permissions,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {isTwoFactorEnable: false, tokens};
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {id: userId},
      data: {hashRefreshToken: null},
    });
    return true;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({where: {id: userId}});

    if (!user?.hashRefreshToken) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    const isRefreshTokenMatches = await argon.verify(
      user.hashRefreshToken,
      refreshToken
    );

    if (!isRefreshTokenMatches) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    const tokens = await this.getJwTokens({
      userId: user.id,
      email: user.email,
      permissions: user.permissions,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      select: {id: true, email: true, permissions: true},
    });

    if (!user?.id) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    return user;
  }

  async generateTotp(userId: string) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: this.config.get<string>('APP_NAME'),
    });

    if (!secret?.otpauth_url) {
      throw new ForbiddenException(ERRORS.INVALID_GENERATE_TOTP);
    }

    const qrCodeImage = await QRCode.toDataURL(secret.otpauth_url);

    await this.prisma.user.update({
      where: {id: userId},
      data: {twoFactorSecret: secret.ascii, twoFactorIsEnable: false},
    });

    return {qrCodeImage, secret2FA: secret.base32};
  }

  async confirmTotp(dto: ConfirmTotpDto) {
    const user = await this.prisma.user.findUnique({where: {email: dto.email}});

    if (!user?.twoFactorSecret) {
      throw new ForbiddenException(ERRORS.INVALID_CONFIRM_TOTP);
    }

    const isPasswordMatches = await argon.verify(
      user.hashPassword,
      dto.password
    );

    if (!isPasswordMatches) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    const isTOTPCodeVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'ascii',
      token: dto.TOTPcode,
    });

    if (!isTOTPCodeVerified) {
      return null;
    }

    const tokens = await this.getJwTokens({
      userId: user.id,
      email: user.email,
      permissions: user.permissions,
    });

    const hashRefreshToken = await argon.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: {id: user.id},
      data: {twoFactorIsEnable: true, hashRefreshToken},
    });

    return tokens;
  }
}

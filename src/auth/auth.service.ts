import * as argon from 'argon2';
import {createId} from '@paralleldrive/cuid2';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {AuthDto} from './auth.dto';
import {DecryptedData, Tokens} from './auth.types';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {ERRORS} from './auth.errors';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  private async getJwTokens({userId, email}: DecryptedData) {
    console.log(this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'));

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {sub: userId, email},
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        }
      ),
      this.jwtService.signAsync(
        {sub: userId, email},
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
    const tokens = await this.getJwTokens({email: dto.email, userId});
    const hashRefreshToken = await argon.hash(tokens.refreshToken);

    await this.prisma.user.create({
      data: {id: userId, email: dto.email, hashPassword, hashRefreshToken},
    });

    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
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

    const tokens = await this.getJwTokens({
      userId: user.id,
      email: user.email,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
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
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      select: {id: true, email: true},
    });

    if (!user?.id) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    return user;
  }
}

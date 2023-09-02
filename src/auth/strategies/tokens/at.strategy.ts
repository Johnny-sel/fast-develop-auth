import {BadRequestException, Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {JwtPayload} from 'src/auth/auth.interface';
import {ConfigService} from '@nestjs/config';
import {ERRORS} from 'src/auth/auth.errors';
import {Request} from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AccessTokenStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    return null;
  }

  validate(payload: JwtPayload | undefined) {
    if (!payload?.sub) {
      throw new BadRequestException(ERRORS.INVALID_JWT_TOKEN);
    }
    return {...payload, id: payload.sub};
  }
}

import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {Request} from 'express';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {JwtPayload} from 'src/auth/auth.interface';
import {ConfigService} from '@nestjs/config';
import {ERRORS} from 'src/auth/auth.errors';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  }

  validate(req: Request, payload: JwtPayload | undefined) {
    const refreshToken = req?.cookies['refreshToken'];

    if (!payload?.sub || !refreshToken) {
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    }

    return {...payload, id: payload.sub, refreshToken};
  }
}

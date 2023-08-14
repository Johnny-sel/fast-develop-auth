import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {AccessTokenStrategy} from './strategies/tokens/at.strategy';
import {RefreshTokenStrategy} from './strategies/tokens/rt.strategy';
import {JwtModule} from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}

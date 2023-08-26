import {Tokens, RequestUser} from './auth.types';
import {AuthDto} from './auth.dto';
import {AuthService} from './auth.service';
import {RefreshTokenGuard} from './guards/rt.guard';
import {AccessTokenGuard} from './guards/at.guard';
import {Request, Response, CookieOptions} from 'express';
import {Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import {Body, Controller, HttpCode, HttpStatus} from '@nestjs/common';
import {ApiCookieAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private cookieOptions: CookieOptions = {httpOnly: true, secure: false};
  constructor(private authService: AuthService) {}

  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(
    @Res({passthrough: true}) res: Response,
    @Body() dto: AuthDto
  ): Promise<Tokens> {
    const tokens = await this.authService.signupLocal(dto);

    res.cookie('accessToken', tokens.accessToken, this.cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, this.cookieOptions);

    res.send('ok');
    return tokens;
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Res({passthrough: true}) res: Response,
    @Body() dto: AuthDto
  ) {
    const tokens = await this.authService.signinLocal(dto);

    res.cookie('accessToken', tokens.accessToken, this.cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, this.cookieOptions);

    res.send('ok');
  }

  @ApiCookieAuth()
  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const user = req.user as RequestUser;
    await this.authService.logout(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send('ok');
  }

  @ApiCookieAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response
  ) {
    const user = req.user as RequestUser;
    const tokens = await this.authService.refreshTokens(
      user.id,
      user.refreshToken
    );

    res.cookie('accessToken', tokens.accessToken, this.cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, this.cookieOptions);

    res.send('ok');
  }

  @ApiCookieAuth()
  @UseGuards(AccessTokenGuard)
  @Get('/user')
  @HttpCode(HttpStatus.OK)
  async getUser(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const requestUser = req.user as RequestUser;
    const user = await this.authService.getUser(requestUser.id);
    res.send({user});
  }
}

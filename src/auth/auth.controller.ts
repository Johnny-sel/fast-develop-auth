import {DataFromCookie} from './auth.interface';
import {ConfirmTotpDto, SigninDto, SignupDto} from './auth.dto';
import {AuthService} from './auth.service';
import {RefreshTokenGuard} from './guards/rt.guard';
import {AccessTokenGuard} from './guards/at.guard';
import {Request, Response, CookieOptions} from 'express';
import {UseGuards} from '@nestjs/common';
import {Get, Post, Req, Res} from '@nestjs/common';
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
    @Body() dto: SignupDto
  ) {
    const tokens = await this.authService.signupLocal(dto);

    res
      .cookie('accessToken', tokens.accessToken, this.cookieOptions)
      .cookie('refreshToken', tokens.refreshToken, this.cookieOptions)
      .send('ok');
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Res({passthrough: true}) res: Response,
    @Body() dto: SigninDto
  ) {
    const {tokens, isTwoFactorEnable} = await this.authService.signinLocal(dto);

    if (isTwoFactorEnable) {
      res
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .send({isTwoFactorEnable}); // move client to input TOTP code
      return;
    }

    if (!tokens) {
      res.send('fail');
      return;
    }

    res
      .cookie('accessToken', tokens.accessToken, this.cookieOptions)
      .cookie('refreshToken', tokens.refreshToken, this.cookieOptions)
      .send('ok');
  }

  @ApiCookieAuth()
  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const dataFromCookie = req.user as DataFromCookie;
    await this.authService.logout(dataFromCookie.id);

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
    const dataFromCookie = req.user as DataFromCookie;
    const tokens = await this.authService.refreshTokens(
      dataFromCookie.id,
      dataFromCookie.refreshToken
    );

    res
      .cookie('accessToken', tokens.accessToken, this.cookieOptions)
      .cookie('refreshToken', tokens.refreshToken, this.cookieOptions)
      .send('ok');
  }

  @ApiCookieAuth()
  @UseGuards(AccessTokenGuard)
  @Get('/user')
  @HttpCode(HttpStatus.OK)
  async getUser(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const dataFromCookie = req.user as DataFromCookie;
    const userFromDatabase = await this.authService.getUser(dataFromCookie.id);
    res.send({...userFromDatabase});
  }

  @ApiCookieAuth()
  @UseGuards(AccessTokenGuard)
  @Get('2fa/generate-totp')
  @HttpCode(HttpStatus.OK)
  async generateTotp(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response
  ) {
    const dataFromCookie = req.user as DataFromCookie;
    const data = await this.authService.generateTotp(dataFromCookie.id);
    res.send({qrCodeImage: data.qrCodeImage, secret2FA: data.secret2FA});
  }

  @Post('2fa/confirm-totp')
  @HttpCode(HttpStatus.OK)
  async confirmTotp(
    @Res({passthrough: true}) res: Response,
    @Body() dto: ConfirmTotpDto
  ) {
    const tokens = await this.authService.confirmTotp(dto);

    if (!tokens) {
      res.status(401).send('fail');
      return;
    }

    res
      .cookie('accessToken', tokens.accessToken, this.cookieOptions)
      .cookie('refreshToken', tokens.refreshToken, this.cookieOptions)
      .send('ok');
  }
}

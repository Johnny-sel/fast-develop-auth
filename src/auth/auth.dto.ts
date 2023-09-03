import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsStrongPassword} from 'class-validator';
import {IsEmail, IsNotEmpty, Length} from 'class-validator';

export class AuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class SignupDto extends AuthDto {}
export class SigninDto extends AuthDto {}

export class ConfirmTotpDto extends AuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  TOTPcode: string;
}

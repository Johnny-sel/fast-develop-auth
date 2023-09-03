import {$Enums} from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface DecryptedDataToJwt {
  userId: string;
  email: string;
  permissions: $Enums.PermissionsEnum[];
}

export interface DataFromCookie {
  id: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken: string;
  accessToken?: string;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type DecryptedData = {
  userId: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};

export type RequestUser = {
  id: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken: string;
  accessToken?: string;
};

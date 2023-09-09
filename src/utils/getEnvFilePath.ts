import {ENV} from '../common/enums/env.enum';

export function getEnvFilePath() {
  switch (process.env.NODE_ENV) {
    case ENV.PRODUCTION:
      return '.env.production';
    case ENV.DEVELOPMENT:
      return '.env.development';
    case ENV.STAGING:
      return '.env.staging';
    case ENV.TESTING:
      return '.env.testing';
    case ENV.LOCAL:
      return '.env.local';
    default:
      return '.env.development';
  }
}

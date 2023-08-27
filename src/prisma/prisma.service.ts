import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const user = config.get<string>('POSTGRES_USER');
    const password = config.get<string>('POSTGRES_PASSWORD');
    const service = config.get<string>('POSTGRES_SERVICE');
    const port = config.get<string>('POSTGRES_PORT');
    const db = config.get<string>('POSTGRES_DB');

    const DATABASE_URL = `postgresql://${user}:${password}@${service}:${port}/${db}?schema=public`;

    super({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

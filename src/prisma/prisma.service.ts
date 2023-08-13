import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/generated';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    this.$use(this.softDeleteMiddleware);
  }

  async softDeleteMiddleware(params: Prisma.MiddlewareParams, next: any) {
    if (params.action == 'delete') {
      params.action = 'update';
      params.args['data'] = { isDeleted: true };
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['isDeleted'] = true;
      } else {
        params.args['data'] = { isDeleted: true };
      }
    }

    return next(params);
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

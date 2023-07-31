import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { PrismaModule } from '@src/prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { getRabbitMQOptions } from '@common/rabbitMQ/rabbitMQ-options';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'categories-service',
        ...getRabbitMQOptions('new_queue'),
      },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}

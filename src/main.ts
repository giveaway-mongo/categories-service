import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { MicroserviceOptions, RpcException } from '@nestjs/microservices';
import { getGrpcOptions } from '@common/grpc/grpc-options';
import { protobufConfigure } from '@common/grpc/protobuf-config';
import { getRabbitMQOptions } from '@common/rabbitMQ/rabbitMQ-options';
import { protoPath } from './constants/proto-path';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  RpcExceptionFilter,
  ServerExceptionFilter,
} from '@common/utils/rpc-exception.filter';
import { ERROR_CODES, ERROR_TYPES } from './common/constants/error';
import { getErrors } from './common/utils/error';
8;

protobufConfigure();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          location: [error.property],
          message: error.constraints[Object.keys(error.constraints)[0]],
          type: ERROR_TYPES.INVALID,
        }));

        const errorResponse = getErrors({
          fieldErrors: result,
          errorCode: ERROR_CODES.BAD_REQUEST,
        });
        return new RpcException(errorResponse);
      },
    }),
  );
  app.useGlobalFilters(new ServerExceptionFilter());
  app.useGlobalFilters(new RpcExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>(
    getGrpcOptions('category', protoPath),
    { inheritAppConfig: true },
  );

  app.connectMicroservice<MicroserviceOptions>(
    getRabbitMQOptions('new_queue'),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(3001);
}

bootstrap();

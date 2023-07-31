import {
  INestApplication,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { ERROR_CODES, ERROR_TYPES } from '../constants/error';
import { getErrors } from './error';
import { RpcException } from '@nestjs/microservices';

export function setUpValidationPipe(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
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
}

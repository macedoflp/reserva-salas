import { HttpException, HttpStatus } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';

interface AppHttpExceptionOptions {
  details?: Record<string, unknown>;
  error?: string;
  message: string;
  statusCode: HttpStatus;
}

export class AppHttpException extends HttpException {
  constructor(options: AppHttpExceptionOptions) {
    const error = options.error ?? STATUS_CODES[options.statusCode] ?? 'Error';

    super(
      {
        details: options.details,
        error,
        message: options.message,
        statusCode: options.statusCode,
      },
      options.statusCode,
    );
  }
}

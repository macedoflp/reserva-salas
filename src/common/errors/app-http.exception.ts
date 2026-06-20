import { HttpException, HttpStatus } from '@nestjs/common';

interface AppHttpExceptionOptions {
  details?: Record<string, unknown>;
  error?: string;
  message: string | string[];
  statusCode: HttpStatus;
}

export class AppHttpException extends HttpException {
  constructor(options: AppHttpExceptionOptions) {
    const error = options.error ?? String(HttpStatus[options.statusCode]);

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

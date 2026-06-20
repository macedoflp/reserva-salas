import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../responses';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const body: ApiErrorResponse = {
      statusCode,
      message: this.extractMessage(exceptionResponse, statusCode),
      error: this.extractError(exceptionResponse, statusCode),
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    };

    response.status(statusCode).json(body);
  }

  private extractError(
    exceptionResponse: string | object | null,
    statusCode: number,
  ): string {
    if (this.isRecord(exceptionResponse)) {
      const error = exceptionResponse.error;

      if (typeof error === 'string') {
        return error;
      }
    }

    return STATUS_CODES[statusCode] ?? 'Error';
  }

  private extractMessage(
    exceptionResponse: string | object | null,
    statusCode: number,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (this.isRecord(exceptionResponse)) {
      const message = exceptionResponse.message;

      if (typeof message === 'string' || this.isStringArray(message)) {
        return Array.isArray(message) ? message.join('; ') : message;
      }
    }

    return statusCode === 500
      ? 'Internal server error'
      : (STATUS_CODES[statusCode] ?? 'Error');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private isStringArray(value: unknown): value is string[] {
    return (
      Array.isArray(value) && value.every((item) => typeof item === 'string')
    );
  }
}

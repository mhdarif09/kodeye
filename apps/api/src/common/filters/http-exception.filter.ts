import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { redactSensitive, redactString } from '../security/redaction';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const requestId = (request as Request & { requestId?: string }).requestId;

    let message = 'Internal server error';
    let errors: string[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseBody = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(responseBody.message)) {
        message = 'Validation failed';
        errors = responseBody.message;
      } else {
        message = responseBody.message ?? responseBody.error ?? message;
      }
    }

    if (!isHttpException) {
      const errorMessage =
        exception instanceof Error
          ? redactString(exception.message)
          : 'Unknown error';
      this.logger.error(
        JSON.stringify(
          redactSensitive({
            error: errorMessage,
            method: request.method,
            path: request.url,
            requestId,
          }),
        ),
      );
    }

    response.status(status).json({
      success: false,
      message,
      errors,
      path: request.url,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}

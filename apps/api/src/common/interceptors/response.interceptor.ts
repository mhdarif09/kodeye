import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ResponsePayload<T> {
  message: string;
  data: T;
}

function isResponsePayload<T>(
  value: T | ResponsePayload<T>,
): value is ResponsePayload<T> {
  return Boolean(
    value && typeof value === 'object' && 'message' in value && 'data' in value,
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (isResponsePayload(response)) {
          return {
            success: true,
            message: response.message,
            data: response.data,
          };
        }

        return {
          success: true,
          message: 'Request successful',
          data: response,
        };
      }),
    );
  }
}

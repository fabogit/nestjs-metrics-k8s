import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name, {
    timestamp: true,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const correlationKey = uuidv4() as string;

    this.logger.log(
      `[${correlationKey}] REQUEST ${method} ${url} ${userAgent} ${ip}: ${context.getClass().name} ${context.getHandler().name}`,
    );

    return next.handle().pipe(
      tap(() => {
        const response: Response = context.switchToHttp().getResponse();
        const contentLength = response.get('content-length');
        this.logger.log(
          `[${correlationKey}] RESPONSE ${method} ${url} ${response.statusCode} ${contentLength}`,
        );
      }),
    );
  }
}

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

/**
 * @Injectable decorator marks this class as a provider that can be injected
 * into other classes or modules within the NestJS application.
 *
 * The `LoggingInterceptor` class implements the `NestInterceptor` interface,
 * allowing it to intercept and modify incoming and outgoing `Requests` & `Responses`
 * in the application's request pipeline.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * @private
   * @readonly
   * logger: Logger instance for logging messages within this interceptor.
   * It is initialized with the name of the `LoggingInterceptor` class and configured
   * to include timestamps in the log messages.
   */
  private readonly logger = new Logger(LoggingInterceptor.name, {
    timestamp: true,
  });

  /**
   * Intercepts incoming `Requests` and outgoing `Responses`.
   * This method is the core of the interceptor and is automatically called by NestJS
   * for each request that goes through the application's request pipeline and is
   * associated with this interceptor.
   *
   * @param {ExecutionContext} context - Provides access to the execution context of the request,
   *                                     including details about the controller, handler, and arguments.
   * @param {CallHandler} next -  Represents the next interceptor or the route handler itself in the chain.
   *                              Calling `next.handle()` proceeds with the request handling pipeline.
   * @returns {Observable<any>} Returns an Observable that represents the flow of the request/response
   *                             handling. The interceptor can modify this observable to tap into or
   *                             transform the data stream.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  /**
   * @private
   * Logs HTTP `Request` and `Response` details.
   * This method is called by the `intercept` method when the context type is 'http'.
   * It extracts relevant information from the `request` and `response` objects to log
   * details about the HTTP call, including request method, URL, user agent, IP address,
   * controller and handler names, correlation key, response status code, and content length.
   *
   * @param {ExecutionContext} context - The execution context providing access to HTTP request/response.
   * @param {CallHandler} next - The call handler to proceed with the request processing.
   * @returns {Observable<any>} Returns an Observable that represents the flow of the HTTP request/response
   *                             handling, allowing the interceptor to tap into the data stream for logging.
   */
  private logHttpCall(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent');
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

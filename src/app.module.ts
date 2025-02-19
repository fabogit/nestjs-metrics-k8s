import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  /**
   * Here, we are importing `PrometheusModule.register()` to enable Prometheus metrics
   * in this application module. `PrometheusModule.register()` configures
   * and sets up the Prometheus module to expose http://localhost:3000/metrics.
   *
   * By importing `PrometheusModule`, components within AppModule can utilize
   * services and functionalities provided by the Prometheus module for metrics exposition.
   */
  imports: [PrometheusModule.register()],
  controllers: [AppController],
  /**
   * providers: Array of providers that are instantiated by the NestJS injector
   * and are available for injection within this module. Providers can be services,
   * interceptors, guards, etc.
   *
   *
   * - `{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }`: This is a custom
   *   provider configuration.
   *     - `provide: APP_INTERCEPTOR`:  Specifies the token (key) for this provider.
   *       `APP_INTERCEPTOR` is a special token from `@nestjs/core` that tells NestJS
   *       to use this provider as a global interceptor for the application.
   *     - `useClass: LoggingInterceptor`:  Instructs NestJS to instantiate and use
   *       the `LoggingInterceptor` class as the provider for `APP_INTERCEPTOR`.
   *
   *   This configuration globally registers `LoggingInterceptor` as an
   *   application-wide interceptor, meaning it will be executed for every route handler
   *   in the application.
   */
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}

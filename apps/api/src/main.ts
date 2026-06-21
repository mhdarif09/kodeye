import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppSettingsService } from './settings/app-settings.service';
import { securityMiddleware } from './common/security/security.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const settings = app.get(AppSettingsService);
  const port = configService.get<number>('API_PORT', 3001);
  const frontendUrls = settings
    .getString(
      'CORS_ORIGIN',
      settings.getString('FRONTEND_URL', 'http://localhost:3000'),
    )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProduction = configService.get('NODE_ENV') === 'production';
  if (isProduction && (frontendUrls.length === 0 || frontendUrls.includes('*')))
    throw new Error('Production CORS_ORIGIN must contain explicit origins');

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.disable('x-powered-by');
  expressInstance.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.use(
    securityMiddleware(
      settings.getNumber('RATE_LIMIT_MAX', 30),
      settings.getNumber('RATE_LIMIT_WINDOW_MS', 60_000),
      isProduction && settings.getBoolean('REQUIRE_HTTPS', true),
      settings.getNumber('API_MAX_BODY_BYTES', 1024 * 1024),
      settings.getBoolean('RATE_LIMIT_ENABLED', true),
      frontendUrls,
    ),
  );
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || frontendUrls.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'), false);
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (!isProduction || settings.getBoolean('API_DOCS_ENABLED', false)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Kodeye API')
      .setDescription('Kodeye backend core API')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  await app.listen(port);
}

void bootstrap();

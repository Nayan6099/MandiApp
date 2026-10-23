import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import pg from 'pg';
import { AppModule } from './app.module.js';
import type { EnvVars } from './config/env.validation.js';
import { buildOpenApi } from './swagger.js';

// Postgres DATE → keep as plain "YYYY-MM-DD" text (no timezone shifting).
pg.types.setTypeParser(1082, (v) => v);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvVars, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: false })); // CSP off so Swagger UI works
  app.enableCors({
    origin: config
      .get('FRONTEND_URL', { infer: true })
      .split(',')
      .map((s) => s.trim()),
    methods: ['GET', 'POST'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();

  SwaggerModule.setup('docs', app, buildOpenApi(app), {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API      → http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger  → http://localhost:${port}/docs`, 'Bootstrap');
}

await bootstrap();

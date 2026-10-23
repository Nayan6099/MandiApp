/**
 * Writes openapi.json WITHOUT a database.
 * `preview: true` builds the module graph but never creates providers,
 * so no DB connection or cron job is started.
 * The frontend's Orval reads this file to generate typed API hooks.
 */
import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { buildOpenApi } from './swagger.js';

// Must be set BEFORE AppModule loads (its env validation runs on import).
process.env.DATABASE_URL ??= 'postgres://preview:preview@localhost:5432/preview';
const { AppModule } = await import('./app.module.js');

const app = await NestFactory.create(AppModule, { preview: true, logger: ['error'] });
const doc = buildOpenApi(app);
const out = resolve(process.cwd(), 'openapi.json');
writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
await app.close();
console.log(`✔ OpenAPI spec written to ${out}`);

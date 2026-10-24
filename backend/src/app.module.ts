import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryCacheModule } from './common/query-cache.js';
import { buildDbConnection, ensureSchema } from './config/database.js';
import { type EnvVars, validateEnv } from './config/env.validation.js';
import { HealthController } from './health.controller.js';
import { MandiPrice } from './prices/mandi-price.entity.js';
import { PricesModule } from './prices/prices.module.js';
import { SyncModule } from './sync/sync.module.js';
import { SyncLog } from './sync/sync-log.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<EnvVars, true>) => {
        const conn = buildDbConnection({
          DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
          DB_SSL: config.get('DB_SSL', { infer: true }),
          DB_SSL_CA: config.get('DB_SSL_CA', { infer: true }),
        });
        const schema = config.get('DB_SCHEMA', { infer: true });
        await ensureSchema(conn, schema);
        return {
          type: 'postgres' as const,
          url: conn.url,
          ssl: conn.ssl,
          schema,
          entities: [MandiPrice, SyncLog],
          // Creates/updates tables automatically. Fine for local dev.
          // In production set DB_SYNCHRONIZE=false and use migrations.
          synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
          // Hosted DBs (Supabase free tier) allow few connections; keep the pool small.
          extra: { max: conn.isLocal ? 10 : 5 },
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
    ScheduleModule.forRoot(),
    // Basic protection: max THROTTLE_LIMIT requests per minute per IP, per endpoint (default 120).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvVars, true>) => [
        { ttl: 60_000, limit: config.get('THROTTLE_LIMIT', { infer: true }) },
      ],
    }),
    QueryCacheModule,
    PricesModule,
    SyncModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
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
      useFactory: (config: ConfigService<EnvVars, true>) => {
        const url = config.get('DATABASE_URL', { infer: true });
        const requiresSsl =
          url.includes('supabase.com') ||
          url.includes('sslmode=require') ||
          url.includes('neon.tech') ||
          url.includes('render.com');

        return {
          type: 'postgres',
          url,
          ssl: requiresSsl ? { rejectUnauthorized: false } : false,
          entities: [MandiPrice, SyncLog],
          // Creates/updates tables automatically. Fine for local dev.
          // In production set DB_SYNCHRONIZE=false and use migrations.
          synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
    ScheduleModule.forRoot(),
    // Basic protection: max 120 requests per minute per IP.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PricesModule,
    SyncModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

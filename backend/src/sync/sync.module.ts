import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MandiPrice } from '../prices/mandi-price.entity.js';
import { DataGovClient } from './data-gov.client.js';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { SyncLog } from './sync-log.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MandiPrice, SyncLog])],
  controllers: [SyncController],
  providers: [DataGovClient, SyncService],
  exports: [SyncService],
})
export class SyncModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MandiPrice } from './mandi-price.entity.js';
import { MetaController, PricesController, StatsController } from './prices.controller.js';
import { PricesService } from './prices.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([MandiPrice])],
  controllers: [PricesController, MetaController, StatsController],
  providers: [PricesService],
})
export class PricesModule {}

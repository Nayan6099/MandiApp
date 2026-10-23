import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CompareQueryDto,
  CompareResultDto,
  LocationFilterDto,
  OverviewDto,
  PopularQueryDto,
  PopularResultDto,
  PricePageDto,
  PriceQueryDto,
  TrendQueryDto,
  TrendResultDto,
} from './prices.dto.js';
import { PricesService } from './prices.service.js';

/** Data changes a few times a day, so browsers/CDNs may cache answers for 5 minutes. */
const CACHE = 'public, max-age=300, stale-while-revalidate=600';

@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(private readonly prices: PricesService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'listPrices', summary: "Today's prices with filters" })
  @ApiOkResponse({ type: PricePageDto })
  list(@Query() q: PriceQueryDto) {
    return this.prices.list(q);
  }

  @Get('compare')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'comparePrices', summary: 'One commodity across many mandis' })
  @ApiOkResponse({ type: CompareResultDto })
  compare(@Query() q: CompareQueryDto) {
    return this.prices.compare(q);
  }

  @Get('trend')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getPriceTrend', summary: 'Daily price trend of a commodity' })
  @ApiOkResponse({ type: TrendResultDto })
  trend(@Query() q: TrendQueryDto) {
    return this.prices.trend(q);
  }
}

@ApiTags('meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly prices: PricesService) {}

  @Get('states')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getStates', summary: 'All states that have data' })
  @ApiOkResponse({ type: [String] })
  states() {
    return this.prices.distinct('state', {});
  }

  @Get('districts')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getDistricts', summary: 'Districts (optionally of a state)' })
  @ApiOkResponse({ type: [String] })
  districts(@Query() q: LocationFilterDto) {
    return this.prices.distinct('district', { state: q.state });
  }

  @Get('markets')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getMarkets', summary: 'Mandis (optionally of a state/district)' })
  @ApiOkResponse({ type: [String] })
  markets(@Query() q: LocationFilterDto) {
    return this.prices.distinct('market', { state: q.state, district: q.district });
  }

  @Get('commodities')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getCommodities', summary: 'Commodities (optionally by place)' })
  @ApiOkResponse({ type: [String] })
  commodities(@Query() q: LocationFilterDto) {
    return this.prices.distinct('commodity', q);
  }
}

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly prices: PricesService) {}

  @Get('overview')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getOverview', summary: 'Numbers for the home page' })
  @ApiOkResponse({ type: OverviewDto })
  overview() {
    return this.prices.overview();
  }

  @Get('popular')
  @Header('Cache-Control', CACHE)
  @ApiOperation({ operationId: 'getPopularCommodities', summary: 'Most traded commodities' })
  @ApiOkResponse({ type: PopularResultDto })
  popular(@Query() q: PopularQueryDto) {
    return this.prices.popular(q);
  }
}

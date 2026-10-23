import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

/* ---------- shared filters ---------- */

export class LocationFilterDto {
  @ApiPropertyOptional({ example: 'Uttar Pradesh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  state?: string;

  @ApiPropertyOptional({ example: 'Ghaziabad' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  district?: string;

  @ApiPropertyOptional({ example: 'Ghaziabad' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(trim)
  market?: string;
}

export const SORT_OPTIONS = ['commodity', 'market', 'price_low', 'price_high'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export class PriceQueryDto extends LocationFilterDto {
  @ApiPropertyOptional({ example: 'Onion' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(trim)
  commodity?: string;

  @ApiPropertyOptional({ description: 'Free text search in commodity / market', example: 'tom' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(trim)
  q?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD. Default: latest available date' })
  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string;

  @ApiPropertyOptional({ enum: SORT_OPTIONS, default: 'commodity' })
  @IsOptional()
  @IsIn(SORT_OPTIONS)
  sort?: SortOption = 'commodity';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class CompareQueryDto {
  @ApiProperty({ example: 'Tomato' })
  @IsString()
  @MaxLength(150)
  @Transform(trim)
  commodity: string;

  @ApiPropertyOptional({ example: 'Punjab' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  state?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD. Default: latest available date' })
  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string;
}

export class TrendQueryDto extends LocationFilterDto {
  @ApiProperty({ example: 'Wheat' })
  @IsString()
  @MaxLength(150)
  @Transform(trim)
  commodity: string;

  @ApiPropertyOptional({ default: 30, minimum: 7, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(7)
  @Max(180)
  days?: number = 30;
}

export class PopularQueryDto {
  @ApiPropertyOptional({ example: 'Gujarat' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  state?: string;

  @ApiPropertyOptional({ default: 8, minimum: 1, maximum: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number = 8;
}

/* ---------- responses ---------- */

export class PriceDto {
  @ApiProperty() id: string;
  @ApiProperty() state: string;
  @ApiProperty() district: string;
  @ApiProperty() market: string;
  @ApiProperty() commodity: string;
  @ApiProperty() variety: string;
  @ApiProperty() grade: string;
  @ApiProperty({ format: 'date', example: '2026-10-23' }) arrivalDate: string;
  @ApiProperty({ description: '₹ per quintal' }) minPrice: number;
  @ApiProperty({ description: '₹ per quintal' }) maxPrice: number;
  @ApiProperty({ description: '₹ per quintal (most common price)' }) modalPrice: number;
}

export class PricePageDto {
  @ApiProperty({ type: [PriceDto] }) items: PriceDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty({ type: String, nullable: true, format: 'date' }) date: string | null;
}

export class CompareStatsDto {
  @ApiProperty() marketCount: number;
  @ApiProperty() lowest: number;
  @ApiProperty() highest: number;
  @ApiProperty() average: number;
}

export class CompareResultDto {
  @ApiProperty() commodity: string;
  @ApiProperty({ type: String, nullable: true, format: 'date' }) date: string | null;
  @ApiProperty({ type: CompareStatsDto, nullable: true }) stats: CompareStatsDto | null;
  @ApiProperty({ type: [PriceDto], description: 'Sorted: cheapest first' }) items: PriceDto[];
}

export class TrendPointDto {
  @ApiProperty({ format: 'date' }) date: string;
  @ApiProperty({ description: 'Average modal price (₹/quintal)' }) modalPrice: number;
  @ApiProperty() minPrice: number;
  @ApiProperty() maxPrice: number;
  @ApiProperty({ description: 'Number of mandis that reported' }) markets: number;
}

export class TrendResultDto {
  @ApiProperty() commodity: string;
  @ApiProperty({ type: [TrendPointDto] }) points: TrendPointDto[];
  @ApiProperty({ type: Number, nullable: true, description: '% change first → last point' })
  changePercent: number | null;
}

export class PopularCommodityDto {
  @ApiProperty() commodity: string;
  @ApiProperty() markets: number;
  @ApiProperty() avgModalPrice: number;
  @ApiProperty() minModalPrice: number;
  @ApiProperty() maxModalPrice: number;
}

export class PopularResultDto {
  @ApiProperty({ type: String, nullable: true, format: 'date' }) date: string | null;
  @ApiProperty({ type: [PopularCommodityDto] }) items: PopularCommodityDto[];
}

export class OverviewDto {
  @ApiProperty({ type: String, nullable: true, format: 'date' }) latestDate: string | null;
  @ApiProperty() totalRecords: number;
  @ApiProperty() recordsOnLatestDate: number;
  @ApiProperty() states: number;
  @ApiProperty() markets: number;
  @ApiProperty() commodities: number;
}

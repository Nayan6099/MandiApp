import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

class HealthDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 'up' }) database: string;
}

/** Used by Docker / load balancers to check the app is alive. */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource) {}

  @Get()
  @ApiOperation({ operationId: 'getHealth', summary: 'Is the API and database up?' })
  @ApiOkResponse({ type: HealthDto })
  async check(): Promise<HealthDto> {
    try {
      await this.db.query('SELECT 1');
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
  }
}

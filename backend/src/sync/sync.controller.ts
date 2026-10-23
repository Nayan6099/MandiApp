import { timingSafeEqual } from 'node:crypto';
import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { EnvVars } from '../config/env.validation.js';
import { DataGovClient } from './data-gov.client.js';
import { SyncStatusDto } from './sync.dto.js';
import { SyncService } from './sync.service.js';

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(
    private readonly sync: SyncService,
    private readonly client: DataGovClient,
    private readonly config: ConfigService<EnvVars, true>,
  ) {}

  @Get('status')
  @ApiOperation({ operationId: 'getSyncStatus', summary: 'When was data last updated?' })
  @ApiOkResponse({ type: SyncStatusDto })
  async status(): Promise<SyncStatusDto> {
    const [last, latest] = await Promise.all([this.sync.lastSuccess(), this.sync.latest()]);
    return {
      apiKeyConfigured: this.client.isConfigured,
      running: this.sync.isRunning,
      lastSuccessAt: last?.finishedAt?.toISOString() ?? null,
      lastRunStatus: latest?.status ?? null,
      lastRunAt: latest?.startedAt?.toISOString() ?? null,
      lastRecordsSaved: last?.recordsSaved ?? null,
    };
  }

  @Post('run')
  @HttpCode(202)
  @ApiOperation({ operationId: 'runSync', summary: 'Start a sync now (admin only)' })
  @ApiHeader({ name: 'x-admin-token', required: true })
  @ApiOkResponse({ type: SyncStatusDto })
  async run(@Headers('x-admin-token') token?: string): Promise<SyncStatusDto> {
    const admin = this.config.get('ADMIN_TOKEN', { infer: true });
    if (!admin) throw new ForbiddenException('Manual sync is disabled (ADMIN_TOKEN not set)');
    if (!token || !safeEqual(token, admin)) throw new ForbiddenException('Invalid admin token');
    if (!this.client.isConfigured) {
      throw new ServiceUnavailableException('DATA_GOV_API_KEY is not set');
    }
    void this.sync.run('manual'); // runs in background
    return this.status();
  }
}

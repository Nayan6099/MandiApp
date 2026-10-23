import { ApiProperty } from '@nestjs/swagger';

export class SyncStatusDto {
  @ApiProperty()
  apiKeyConfigured: boolean;

  @ApiProperty()
  running: boolean;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  lastSuccessAt: string | null;

  @ApiProperty({ type: String, nullable: true, enum: ['running', 'success', 'failed'] })
  lastRunStatus: 'running' | 'success' | 'failed' | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  lastRunAt: string | null;

  @ApiProperty({ type: Number, nullable: true })
  lastRecordsSaved: number | null;
}

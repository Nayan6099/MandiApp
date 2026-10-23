import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const toBool = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);

/** All settings the API reads from .env. Wrong values stop the app at startup (fail fast). */
export class EnvVars {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  PORT = 4000;

  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  DB_SYNCHRONIZE = true;

  /** Our tables live in this schema (kept out of Supabase's public, auto-exposed schema). */
  @IsOptional()
  @Matches(/^[a-z_][a-z0-9_]*$/)
  DB_SCHEMA = 'mandi';

  /** auto = SSL for any non-local host (Supabase, RDS), off for localhost. */
  @IsOptional()
  @IsIn(['auto', 'true', 'false'])
  DB_SSL: 'auto' | 'true' | 'false' = 'auto';

  /** Optional path to the server's CA certificate (e.g. Supabase "SSL certificate"). If set, the certificate is verified. */
  @IsOptional()
  @IsString()
  DB_SSL_CA = '';

  @IsOptional()
  @IsString()
  FRONTEND_URL = 'http://localhost:3000';

  /** Your personal key from data.gov.in → My Account. Leave empty to run without syncing. */
  @IsOptional()
  @IsString()
  DATA_GOV_API_KEY = '';

  @IsOptional()
  @IsUrl({ require_tld: false })
  DATA_GOV_BASE_URL = 'https://api.data.gov.in';

  @IsOptional()
  @IsString()
  DATA_GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

  /** Records per API call. data.gov.in allows at most 1000. */
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(1000)
  @Transform(({ value }) => Number(value))
  DATA_GOV_PAGE_SIZE = 1000;

  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  SYNC_ON_STARTUP = true;

  /** Cron (Asia/Kolkata). Default: every 3 hours. */
  @IsOptional()
  @IsString()
  SYNC_CRON = '0 */3 * * *';

  /** Delete rows older than this many days, so the DB doesn't grow forever. */
  @IsOptional()
  @IsInt()
  @Min(7)
  @Transform(({ value }) => Number(value))
  KEEP_HISTORY_DAYS = 180;

  /** Protects POST /api/sync/run. Empty = manual sync endpoint is disabled. */
  @IsOptional()
  @IsString()
  ADMIN_TOKEN = '';
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const env = plainToInstance(EnvVars, config, { exposeDefaultValues: true });
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const msg = errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
    throw new Error(`Invalid environment variables:\n - ${msg.join('\n - ')}`);
  }
  return env;
}

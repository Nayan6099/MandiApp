import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { LessThan, type Repository } from 'typeorm';
import type { EnvVars } from '../config/env.validation.js';
import { MandiPrice } from '../prices/mandi-price.entity.js';
import { DataGovClient } from './data-gov.client.js';
import { type NormalizedPrice, normalizeRecord } from './normalize.js';
import { SyncLog } from './sync-log.entity.js';

const KEY_COLUMNS = ['state', 'district', 'market', 'commodity', 'variety', 'grade', 'arrivalDate'] as const;

/**
 * Copies data from data.gov.in into our own PostgreSQL.
 * Why? The govt API only gives "today", is slow, and is rate limited.
 * Our DB keeps history (for trend charts) and answers users instantly.
 */
@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SyncService.name);
  private running = false;

  constructor(
    private readonly client: DataGovClient,
    private readonly config: ConfigService<EnvVars, true>,
    private readonly scheduler: SchedulerRegistry,
    @InjectRepository(MandiPrice) private readonly prices: Repository<MandiPrice>,
    @InjectRepository(SyncLog) private readonly logs: Repository<SyncLog>,
  ) {}

  onApplicationBootstrap() {
    if (!this.client.isConfigured) {
      this.logger.warn('DATA_GOV_API_KEY is empty → automatic sync is OFF. Add it to .env.');
      return;
    }
    const expr = this.config.get('SYNC_CRON', { infer: true });
    const job = CronJob.from({
      cronTime: expr,
      timeZone: 'Asia/Kolkata',
      onTick: () => void this.run('cron'),
    });
    this.scheduler.addCronJob('mandi-sync', job);
    job.start();
    this.logger.log(`Sync scheduled with cron "${expr}" (Asia/Kolkata)`);

    if (this.config.get('SYNC_ON_STARTUP', { infer: true })) {
      setTimeout(() => void this.run('startup'), 2_000);
    }
  }

  get isRunning() {
    return this.running;
  }

  /** Runs one full sync. Safe to call many times: only one run happens at once. */
  async run(trigger: string): Promise<SyncLog | null> {
    if (!this.client.isConfigured) {
      throw new Error('DATA_GOV_API_KEY is not set');
    }
    if (this.running) {
      this.logger.warn(`Sync (${trigger}) skipped: another sync is already running`);
      return null;
    }
    this.running = true;
    const log = await this.logs.save(
      this.logs.create({ startedAt: new Date(), status: 'running', message: `trigger=${trigger}` }),
    );
    let fetched = 0;
    let saved = 0;

    try {
      for await (const page of this.client.fetchAll()) {
        fetched += page.length;
        const rows = this.dedupe(page.map(normalizeRecord).filter((r): r is NormalizedPrice => r !== null));
        for (let i = 0; i < rows.length; i += 500) {
          const chunk = rows.slice(i, i + 500);
          await this.prices.upsert(chunk, {
            conflictPaths: [...KEY_COLUMNS],
            skipUpdateIfNoValuesChanged: true,
          });
          saved += chunk.length;
        }
      }
      const removed = await this.cleanupOldRows();
      log.status = 'success';
      log.message = `trigger=${trigger}; removed_old=${removed}`;
      this.logger.log(`Sync done: fetched=${fetched}, saved=${saved}, removed_old=${removed}`);
    } catch (err) {
      log.status = 'failed';
      log.message = `trigger=${trigger}; ${err instanceof Error ? err.message : String(err)}`.slice(0, 2000);
      this.logger.error(`Sync failed: ${log.message}`);
    } finally {
      log.finishedAt = new Date();
      log.recordsFetched = fetched;
      log.recordsSaved = saved;
      await this.logs.save(log);
      this.running = false;
    }
    return log;
  }

  async lastSuccess(): Promise<SyncLog | null> {
    return this.logs.findOne({ where: { status: 'success' }, order: { finishedAt: 'DESC' } });
  }

  async latest(): Promise<SyncLog | null> {
    return this.logs.findOne({ where: {}, order: { startedAt: 'DESC' } });
  }

  /** Same row twice in one batch breaks Postgres ON CONFLICT, so keep only the last one. */
  private dedupe(rows: NormalizedPrice[]): NormalizedPrice[] {
    const map = new Map<string, NormalizedPrice>();
    for (const r of rows) map.set(KEY_COLUMNS.map((k) => r[k]).join('|'), r);
    return [...map.values()];
  }

  private async cleanupOldRows(): Promise<number> {
    const days = this.config.get('KEEP_HISTORY_DAYS', { infer: true });
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const res = await this.prices.delete({ arrivalDate: LessThan(cutoff) });
    return res.affected ?? 0;
  }
}

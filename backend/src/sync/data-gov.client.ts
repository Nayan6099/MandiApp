import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvVars } from '../config/env.validation.js';

/** Raw record as sent by data.gov.in (all fields arrive as strings or numbers). */
export interface DataGovRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
}

interface DataGovPage {
  total?: number | string;
  count?: number | string;
  records?: DataGovRecord[];
  error?: string;
  message?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Talks to the free Govt. API (OGD Platform India, data from AGMARKNET). */
@Injectable()
export class DataGovClient {
  private readonly logger = new Logger(DataGovClient.name);

  constructor(private readonly config: ConfigService<EnvVars, true>) {}

  get isConfigured(): boolean {
    return this.config.get('DATA_GOV_API_KEY', { infer: true }).trim().length > 0;
  }

  /** Fetches every page of today's data. Yields one page (array of records) at a time. */
  async *fetchAll(): AsyncGenerator<DataGovRecord[]> {
    const pageSize = this.config.get('DATA_GOV_PAGE_SIZE', { infer: true });
    let offset = 0;
    let total = Number.POSITIVE_INFINITY;

    while (offset < total) {
      const page = await this.fetchPage(offset, pageSize);
      const records = page.records ?? [];
      total = Number(page.total ?? 0);
      this.logger.log(`Fetched ${offset + records.length}/${total} records`);
      if (records.length === 0) break;
      yield records;
      offset += records.length;
      await sleep(300); // be polite to the govt server
    }
  }

  private async fetchPage(offset: number, limit: number, attempt = 1): Promise<DataGovPage> {
    const base = this.config.get('DATA_GOV_BASE_URL', { infer: true });
    const id = this.config.get('DATA_GOV_RESOURCE_ID', { infer: true });
    const url = new URL(`/resource/${id}`, base);
    url.searchParams.set('api-key', this.config.get('DATA_GOV_API_KEY', { infer: true }));
    url.searchParams.set('format', 'json');
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));

    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
      const body = (await res.json()) as DataGovPage;
      if (!res.ok || body.error) {
        throw new Error(`HTTP ${res.status}: ${body.error ?? body.message ?? 'unknown error'}`);
      }
      return body;
    } catch (err) {
      if (attempt >= 4) throw err;
      const wait = 2 ** attempt * 1000; // 2s, 4s, 8s (exponential backoff)
      this.logger.warn(`Page offset=${offset} failed (${String(err)}). Retry ${attempt} in ${wait}ms`);
      await sleep(wait);
      return this.fetchPage(offset, limit, attempt + 1);
    }
  }
}

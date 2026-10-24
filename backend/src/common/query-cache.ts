import { Global, Injectable, Module } from '@nestjs/common';

type Entry = { value: Promise<unknown>; expires: number };

/**
 * Small in-memory cache for read-only DB queries.
 *
 * Why: mandi data changes only when a sync runs (every few hours), but every
 * visitor used to hit PostgreSQL again. Some queries (dropdown lists, overview)
 * read the whole table. Caching them for a few minutes removes that load.
 *
 * - Identical requests running at the same time share ONE DB query.
 * - Failed queries are not cached.
 * - `clear()` is called after each successful sync, so new data shows at once.
 * - Size is capped so many different filters cannot fill the memory.
 */
@Injectable()
export class QueryCache {
  private readonly store = new Map<string, Entry>();

  constructor(
    private readonly ttlMs = 5 * 60_000,
    private readonly maxEntries = 2_000,
  ) {}

  wrap<T>(key: string, load: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.store.get(key);
    if (hit && hit.expires > now) return hit.value as Promise<T>;

    if (this.store.size >= this.maxEntries) {
      // Map keeps insertion order → the first key is the oldest.
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }

    const value = load();
    this.store.set(key, { value, expires: now + this.ttlMs });
    value.catch(() => {
      if (this.store.get(key)?.value === value) this.store.delete(key);
    });
    return value;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

@Global()
@Module({
  providers: [{ provide: QueryCache, useFactory: () => new QueryCache() }],
  exports: [QueryCache],
})
export class QueryCacheModule {}

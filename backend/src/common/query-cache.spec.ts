import { describe, expect, it, vi } from 'vitest';
import { QueryCache } from './query-cache.js';

describe('QueryCache', () => {
  it('runs the loader once for repeated and parallel calls', async () => {
    const cache = new QueryCache();
    const load = vi.fn(async () => 42);
    const [a, b] = await Promise.all([cache.wrap('k', load), cache.wrap('k', load)]);
    await cache.wrap('k', load);
    expect([a, b]).toEqual([42, 42]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reloads after the TTL expires', async () => {
    vi.useFakeTimers();
    const cache = new QueryCache(1_000);
    const load = vi.fn(async () => 1);
    await cache.wrap('k', load);
    vi.advanceTimersByTime(1_001);
    await cache.wrap('k', load);
    expect(load).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not keep failed results', async () => {
    const cache = new QueryCache();
    await expect(cache.wrap('k', async () => Promise.reject(new Error('db down')))).rejects.toThrow(
      'db down',
    );
    await expect(cache.wrap('k', async () => 'ok')).resolves.toBe('ok');
  });

  it('clear() empties the cache', async () => {
    const cache = new QueryCache();
    await cache.wrap('k', async () => 1);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('never grows past maxEntries', async () => {
    const cache = new QueryCache(60_000, 3);
    for (let i = 0; i < 10; i++) await cache.wrap(`k${i}`, async () => i);
    expect(cache.size).toBe(3);
  });
});

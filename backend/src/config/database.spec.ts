import { describe, expect, it } from 'vitest';
import { buildDbConnection } from './database.js';

const base = { DB_SSL: 'auto' as const, DB_SSL_CA: '' };

describe('buildDbConnection', () => {
  it('no SSL for localhost', () => {
    const c = buildDbConnection({ ...base, DATABASE_URL: 'postgres://u:p@localhost:5432/mandi_bhav' });
    expect(c.ssl).toBe(false);
    expect(c.isLocal).toBe(true);
  });

  it('SSL for Supabase pooler and strips sslmode', () => {
    const c = buildDbConnection({
      ...base,
      DATABASE_URL:
        'postgresql://postgres.abc:p%40ss@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    });
    expect(c.ssl).toEqual({ rejectUnauthorized: false });
    expect(c.url).not.toContain('sslmode');
    expect(c.url).toContain('p%40ss');
  });

  it('DB_SSL=false wins', () => {
    const c = buildDbConnection({
      ...base,
      DB_SSL: 'false',
      DATABASE_URL: 'postgres://u:p@db.example.com/x',
    });
    expect(c.ssl).toBe(false);
  });
});

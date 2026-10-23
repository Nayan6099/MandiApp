import { readFileSync } from 'node:fs';
import { Logger } from '@nestjs/common';
import pg from 'pg';
import type { EnvVars } from './env.validation.js';

type Ssl = false | { rejectUnauthorized: boolean; ca?: string };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db', 'postgres']);

/**
 * Turns .env settings into a pg connection config that works for both
 * local PostgreSQL and hosted ones (Supabase, AWS RDS).
 */
export function buildDbConnection(env: Pick<EnvVars, 'DATABASE_URL' | 'DB_SSL' | 'DB_SSL_CA'>) {
  const url = new URL(env.DATABASE_URL);
  // pg treats sslmode=require as "verify-full"; we control SSL below instead.
  for (const p of ['sslmode', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(p);

  const isLocal = LOCAL_HOSTS.has(url.hostname);
  const useSsl = env.DB_SSL === 'true' || (env.DB_SSL === 'auto' && !isLocal);

  let ssl: Ssl = false;
  if (useSsl) {
    ssl = env.DB_SSL_CA
      ? { rejectUnauthorized: true, ca: readFileSync(env.DB_SSL_CA, 'utf8') } // best practice
      : { rejectUnauthorized: false }; // encrypted, but server identity not checked
  }
  return { url: url.toString(), ssl, host: url.hostname, isLocal };
}

/** Creates our schema if missing. TypeORM's synchronize does not create schemas itself. */
export async function ensureSchema(conn: ReturnType<typeof buildDbConnection>, schema: string) {
  const client = new pg.Client({
    connectionString: conn.url,
    ssl: conn.ssl,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  } catch (err) {
    // Don't crash here: TypeORM will retry and print a clear connection error.
    Logger.warn(`Could not prepare schema "${schema}" on ${conn.host}: ${String(err)}`, 'Database');
  } finally {
    await client.end().catch(() => undefined);
  }
}

/**
 * Checks the database in backend/.env (DATABASE_URL) before the API starts.
 * - Local PostgreSQL: creates the database if it does not exist yet.
 * - Hosted (Supabase, RDS): only tests that we can log in (the database already exists).
 * Usage: node backend/scripts/ensure-db.mjs
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';

const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const getEnv = (key) => {
  const line = envText.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
};

const raw = getEnv('DATABASE_URL');
if (!raw) {
  console.error('DATABASE_URL is missing in backend/.env');
  process.exit(1);
}

const url = new URL(raw);
for (const p of ['sslmode', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(p);
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
const sslSetting = getEnv('DB_SSL') || 'auto';
const useSsl = sslSetting === 'true' || (sslSetting === 'auto' && !isLocal);
const ssl = useSsl ? { rejectUnauthorized: false } : false;
const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));

async function connect(target) {
  const client = new pg.Client({ connectionString: target.toString(), ssl, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    return client;
  } catch (err) {
    const code = err?.code ?? '';
    if (code === '28P01' || code === '28000') {
      console.error('Login failed: wrong username or password in DATABASE_URL (backend/.env).');
    } else if (code === 'ECONNREFUSED') {
      console.error(`Cannot reach ${url.hostname}:${url.port || 5432}. Is the database running?`);
    } else if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
      console.error(`Host "${url.hostname}" not found. Check DATABASE_URL and your internet connection.`);
    } else if (code === 'ENETUNREACH' || code === 'EHOSTUNREACH') {
      console.error(
        'Network unreachable. On Supabase, use the "Session pooler" connection string (works on IPv4).',
      );
    } else {
      console.error(`Could not connect to the database: ${err?.message ?? err}`);
    }
    process.exit(1);
  }
}

if (!isLocal) {
  const client = await connect(url);
  const { rows } = await client.query('select version()');
  console.log(`Connected to ${url.hostname} (${rows[0].version.split(',')[0]}).`);
  await client.end();
  process.exit(0);
}

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  console.error(`Database name "${dbName}" may only use letters, numbers and _`);
  process.exit(1);
}
const admin = new URL(url);
admin.pathname = '/postgres';
const client = await connect(admin);
const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
if (found.rowCount === 0) {
  await client.query(`CREATE DATABASE "${dbName}"`);
  console.log(`Database "${dbName}" created.`);
} else {
  console.log(`Database "${dbName}" already exists.`);
}
await client.end();

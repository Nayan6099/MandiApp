/**
 * Creates the database named in backend/.env (DATABASE_URL) if it does not exist yet.
 * It connects to the built-in "postgres" database on the same server to do this.
 * Usage: node backend/scripts/ensure-db.mjs
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';

const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const line = envText.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
if (!line) {
  console.error('DATABASE_URL is missing in backend/.env');
  process.exit(1);
}

const url = new URL(line.slice('DATABASE_URL='.length).trim());
const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));
if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  console.error(`Database name "${dbName}" may only use letters, numbers and _`);
  process.exit(1);
}
url.pathname = '/postgres';

const client = new pg.Client({ connectionString: url.toString(), connectionTimeoutMillis: 8000 });
try {
  await client.connect();
} catch (err) {
  const code = err?.code ?? '';
  if (code === '28P01') {
    console.error('PostgreSQL rejected the username or password. Fix DATABASE_URL in backend/.env.');
  } else if (code === 'ECONNREFUSED') {
    console.error('Cannot reach PostgreSQL on localhost:5432. Is the PostgreSQL service running?');
  } else {
    console.error(`Could not connect to PostgreSQL: ${err?.message ?? err}`);
  }
  process.exit(1);
}

const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
if (found.rowCount === 0) {
  await client.query(`CREATE DATABASE "${dbName}"`);
  console.log(`Database "${dbName}" created.`);
} else {
  console.log(`Database "${dbName}" already exists.`);
}
await client.end();

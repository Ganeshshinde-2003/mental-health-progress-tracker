import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const db = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export async function runMigrations() {
  await db.execute('PRAGMA foreign_keys = ON');

  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  // Additive column migrations for tables created before this column existed.
  // SQLite/libSQL has no "ADD COLUMN IF NOT EXISTS", so we probe and ignore duplicates.
  await addColumnIfMissing('users', 'consented_at', 'TEXT');
  await addColumnIfMissing('users', 'chat_count', 'INTEGER NOT NULL DEFAULT 0');
}

async function addColumnIfMissing(table, column, type) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
  }
}

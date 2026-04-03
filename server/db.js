const { Pool } = require('pg');

function createPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const isLocal =
    process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1');
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

const pool = createPool();

async function query(text, params = []) {
  if (!pool) throw new Error('DATABASE_URL non configuré');
  return pool.query(text, params);
}

module.exports = { pool, query };

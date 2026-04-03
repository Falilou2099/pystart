#!/usr/bin/env node
/**
 * Applique schema.sql avec pg (DATABASE_URL requis).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL manquant');
    process.exit(1);
  }
  const sqlPath = path.join(__dirname, '../../schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Migration OK : schema.sql appliqué.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

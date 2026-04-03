#!/usr/bin/env node
/**
 * Applique schema.sql sur Neon (DATABASE_URL dans .env).
 * Usage : depuis la racine du projet → npm run db:migrate
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

function normalizeConnectionString(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/^["']|["']$/g, '');
  try {
    const u = new URL(s.replace(/^postgresql:/i, 'postgres:'));
    u.searchParams.delete('channel_binding');
    let out = u.toString();
    if (/^postgres:\/\//i.test(out)) {
      out = 'postgresql://' + out.slice('postgres://'.length);
    }
    return out;
  } catch (_) {
    return s
      .replace(/[&?]channel_binding=[^&]*/gi, '')
      .replace(/\?&/g, '?')
      .replace(/&$/g, '')
      .replace(/\?$/, '');
  }
}

/** Découpe le SQL en instructions (pas de PL/pgSQL dans schema.sql). */
function splitStatements(sql) {
  const src = (sql.endsWith('\n') ? sql : sql + '\n').replace(/^\s*--[^\n]*/gm, '');
  return src
    .split(/;\s*[\r\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
  if (!connectionString) {
    console.error('DATABASE_URL manquant : crée un fichier .env à la racine avec ta chaîne Neon.');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '../../schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitStatements(sql);
  if (!statements.length) {
    console.error('Aucune instruction SQL dans schema.sql');
    process.exit(1);
  }

  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  const client = new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });

  await client.connect();
  try {
    for (let i = 0; i < statements.length; i++) {
      const st = statements[i];
      await client.query(st + (st.endsWith(';') ? '' : ';'));
      console.log(`OK (${i + 1}/${statements.length}) ${st.split('\n')[0].slice(0, 60)}…`);
    }
    console.log('\nMigration terminée : tables PyStart créées sur Neon.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('\nErreur migration :', e.message);
  if (e.code) console.error('Code :', e.code);
  process.exit(1);
});

const { Pool } = require('pg');

/**
 * Neon fournit parfois `channel_binding=require` : le client `pg` Node ne le gère
 * pas bien → erreurs à l’exécution (inscription, login). On retire ce paramètre.
 */
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

function createPool() {
  const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
  if (!connectionString) {
    return null;
  }
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');
  const isServerless =
    process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  return new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    // Vercel : une seule connexion par instance évite d’épuiser le pool Neon
    max: isServerless ? 1 : 10,
    idleTimeoutMillis: isServerless ? 5000 : 30000,
    connectionTimeoutMillis: 20000,
  });
}

const pool = createPool();

async function query(text, params = []) {
  if (!pool) throw new Error('DATABASE_URL non configuré');
  return pool.query(text, params);
}

module.exports = { pool, query, normalizeConnectionString };

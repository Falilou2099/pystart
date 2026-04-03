const Tokens = require('csrf');
const cookieParser = require('cookie-parser');

const tokens = new Tokens();

function getSecret() {
  const s = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('CSRF_SECRET ou JWT_SECRET (min. 16 caractères) requis');
  }
  return s;
}

/** Génère un jeton CSRF et pose un cookie non-httpOnly pour double-soumission. */
function issueCsrfToken(req, res) {
  const secret = getSecret();
  const token = tokens.create(secret);
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('csrf_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd && process.env.SESSION_COOKIE_SECURE !== 'false',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

function verifyCsrf(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  const secret = getSecret();
  const header = req.get('x-csrf-token') || req.body?._csrf;
  const cookieTok = req.cookies?.csrf_token;
  const candidate = header || cookieTok;
  if (!candidate || !tokens.verify(secret, candidate)) {
    return res.status(403).json({ error: 'Jeton CSRF invalide ou manquant' });
  }
  next();
}

module.exports = { issueCsrfToken, verifyCsrf, cookieParser: cookieParser() };

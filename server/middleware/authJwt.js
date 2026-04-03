const jwt = require('jsonwebtoken');
const { query } = require('../db');

function accessSecret() {
  return process.env.JWT_SECRET;
}

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
}

function signAccess(userId) {
  return jwt.sign({ sub: userId, typ: 'access' }, accessSecret(), { expiresIn: '7d' });
}

function signRefreshPayload(userId, sessionId) {
  return jwt.sign(
    { sub: userId, sid: sessionId, typ: 'refresh' },
    refreshSecret(),
    { expiresIn: '30d' }
  );
}

function verifyAccess(token) {
  const p = jwt.verify(token, accessSecret());
  if (p.typ !== 'access') throw new Error('wrong type');
  return p;
}

function verifyRefresh(token) {
  const p = jwt.verify(token, refreshSecret());
  if (p.typ !== 'refresh') throw new Error('wrong type');
  return p;
}

function cookieOptsBase() {
  const isProd = process.env.NODE_ENV === 'production';
  const secure =
    isProd && process.env.SESSION_COOKIE_SECURE !== 'false';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const base = cookieOptsBase();
  res.cookie('access_token', accessToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookies(res) {
  const base = cookieOptsBase();
  res.clearCookie('access_token', { ...base });
  res.clearCookie('refresh_token', { ...base });
}

async function requireUser(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ error: 'Non connecté' });
    }
    const payload = verifyAccess(token);
    const r = await query(
      'SELECT id, username, email, email_verified, xp, level, streak_days, last_activity, badges FROM users WHERE id = $1',
      [payload.sub]
    );
    if (!r.rows.length) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    req.user = r.rows[0];
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expirée ou invalide' });
  }
}

async function optionalUser(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return next();
    const payload = verifyAccess(token);
    const r = await query(
      'SELECT id, username, email, email_verified, xp, level, streak_days, last_activity, badges FROM users WHERE id = $1',
      [payload.sub]
    );
    if (r.rows.length) req.user = r.rows[0];
  } catch (_) {
    /* ignore */
  }
  next();
}

module.exports = {
  signAccess,
  signRefreshPayload,
  verifyAccess,
  verifyRefresh,
  setAuthCookies,
  clearAuthCookies,
  requireUser,
  optionalUser,
};

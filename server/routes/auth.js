const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const { normalizeEmail, normalizeUsername } = require('../utils/sanitize');
const {
  signAccess,
  setAuthCookies,
  clearAuthCookies,
  requireUser,
} = require('../middleware/authJwt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const BCRYPT_ROUNDS = 12;

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
}

function clientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    ''
  );
}

async function logAuth({ userId, ip, success, emailAttempt }) {
  try {
    await query(
      `INSERT INTO auth_logs (user_id, ip_address, success, email_attempt) VALUES ($1, $2, $3, $4)`,
      [userId || null, ip, success, emailAttempt || null]
    );
  } catch (e) {
    console.error('[auth_logs]', e.message);
  }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessaie dans 15 minutes.' },
  keyGenerator: (req) => clientIp(req) || req.ip || 'unknown',
});

function validationErrors(req, res) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    res.status(400).json({ errors: err.array() });
    return true;
  }
  return false;
}

/** POST /api/auth/register — compte actif immédiatement (pas d’email) */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().isLength({ max: 255 }),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 8, max: 128 }),
    body('passwordConfirm').custom((v, { req }) => v === req.body.password),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return;
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);
    const password = req.body.password;
    const ip = clientIp(req);

    try {
      const exists = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (exists.rows.length) {
        await logAuth({ ip, success: false, emailAttempt: email });
        return res.status(409).json({ error: 'Email ou pseudo déjà utilisé' });
      }

      const password_hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
      const ins = await query(
        `INSERT INTO users (username, email, password_hash, email_verified)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [username, email, password_hash]
      );
      const userId = ins.rows[0].id;

      await logAuth({ userId, ip, success: true, emailAttempt: email });

      return res.status(201).json({
        ok: true,
        message: 'Compte créé. Tu peux te connecter tout de suite.',
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/** POST /api/auth/login */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1, max: 128 }),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return;
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const ip = clientIp(req);

    try {
      const r = await query(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [email]
      );
      if (!r.rows.length) {
        await logAuth({ ip, success: false, emailAttempt: email });
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }
      const u = r.rows[0];
      const ok = bcrypt.compareSync(password, u.password_hash);
      if (!ok) {
        await logAuth({ userId: u.id, ip, success: false, emailAttempt: email });
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }

      const jti = crypto.randomBytes(48).toString('base64url');
      await query(
        `INSERT INTO sessions (user_id, token, ip_address, expires_at)
         VALUES ($1, $2, $3, now() + interval '30 days')`,
        [u.id, jti, ip]
      );

      const access = signAccess(u.id);
      const refreshJwt = jwt.sign(
        { sub: u.id, jti, typ: 'refresh' },
        refreshSecret(),
        { expiresIn: '30d' }
      );

      setAuthCookies(res, access, refreshJwt);

      await query('UPDATE users SET last_login = now() WHERE id = $1', [u.id]);
      await logAuth({ userId: u.id, ip, success: true, emailAttempt: email });

      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

router.post('/logout', async (req, res) => {
  try {
    const rt = req.cookies?.refresh_token;
    if (rt) {
      try {
        const p = jwt.verify(rt, refreshSecret());
        if (p.jti && p.sub) {
          await query('DELETE FROM sessions WHERE user_id = $1 AND token = $2', [
            p.sub,
            p.jti,
          ]);
        }
      } catch (_) {
        /* ignore */
      }
    }
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (e) {
    clearAuthCookies(res);
    res.json({ ok: true });
  }
});

router.post('/refresh', async (req, res) => {
  const rt = req.cookies?.refresh_token;
  if (!rt) return res.status(401).json({ error: 'Non connecté' });
  try {
    const p = jwt.verify(rt, refreshSecret());
    if (p.typ !== 'refresh' || !p.jti || !p.sub) throw new Error('bad');
    const s = await query(
      `SELECT id FROM sessions WHERE user_id = $1 AND token = $2 AND expires_at > now()`,
      [p.sub, p.jti]
    );
    if (!s.rows.length) throw new Error('revoked');
    const access = signAccess(p.sub);
    const isProd = process.env.NODE_ENV === 'production';
    const secure = isProd && process.env.SESSION_COOKIE_SECURE !== 'false';
    res.cookie('access_token', access, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ ok: true });
  } catch (e) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Session expirée' });
  }
});

router.get('/me', requireUser, async (req, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    username: u.username,
    email: u.email,
    emailVerified: u.email_verified,
    xp: u.xp,
    level: u.level,
    streakDays: u.streak_days,
    lastActivity: u.last_activity,
    badges: u.badges || [],
  });
});

module.exports = router;

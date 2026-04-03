const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const { requireUser } = require('../middleware/authJwt');

const router = express.Router();

/** Badges : fin de chaque module (dernier exercice du module) + premier pas */
const BADGE_RULES = [
  { id: 'first_step', exerciseId: 'm1-e001', name: 'Premier pas', emoji: '👣' },
  { id: 'mod1_done', exerciseId: 'm1-e034', name: 'Module 1 terminé', emoji: '👋' },
  { id: 'mod2_done', exerciseId: 'm2-e034', name: 'Module 2 terminé', emoji: '📦' },
  { id: 'mod3_done', exerciseId: 'm3-e034', name: 'Module 3 terminé', emoji: '🔀' },
  { id: 'mod4_done', exerciseId: 'm4-e033', name: 'Module 4 terminé', emoji: '🔄' },
  { id: 'mod5_done', exerciseId: 'm5-e033', name: 'Module 5 terminé', emoji: '📋' },
  { id: 'mod6_done', exerciseId: 'm6-e033', name: 'Module 6 terminé', emoji: '🧩' },
  { id: 'mod7_done', exerciseId: 'm7-e033', name: 'Module 7 terminé', emoji: '📖' },
  { id: 'mod8_done', exerciseId: 'm8-e033', name: 'Module 8 terminé', emoji: '📁' },
  { id: 'mod9_done', exerciseId: 'm9-e033', name: 'Parcours complet', emoji: '🚀' },
];

function xpForLevel(level) {
  return Math.floor(50 * level * level);
}

function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return Math.min(level, 99);
}

function todayUTC() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDaysISO(isoDate, days) {
  const d = new Date(isoDate + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDate(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

function nextStreak(lastActivity, currentStreak) {
  const t = todayUTC();
  const last = isoDate(lastActivity);
  if (!last) return { streak: 1, last: t };
  if (last === t) return { streak: currentStreak || 1, last: t };
  if (addDaysISO(last, 1) === t) {
    return { streak: (currentStreak || 0) + 1, last: t };
  }
  return { streak: 1, last: t };
}

function validationErrors(req, res) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    res.status(400).json({ errors: err.array() });
    return true;
  }
  return false;
}

/** GET /api/progress */
router.get('/', requireUser, async (req, res) => {
  try {
    const r = await query(
      `SELECT exercise_id, completed, score, attempts, completed_at, time_spent_seconds
       FROM progress WHERE user_id = $1 ORDER BY completed_at NULLS LAST`,
      [req.user.id]
    );
    res.json({ progress: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/** POST /api/progress/complete */
router.post(
  '/complete',
  requireUser,
  [
    body('exercise_id').trim().isLength({ min: 3, max: 50 }),
    body('score').isInt({ min: 0, max: 100 }),
    body('time_spent_seconds').optional().isInt({ min: 0, max: 86400 }),
    body('hints_used').optional().isBoolean(),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return;
    const { exercise_id, score, time_spent_seconds = 0, hints_used = false } = req.body;
    const uid = req.user.id;

    let baseXp = 10;
    if (hints_used) baseXp = Math.max(0, baseXp - 5);
    const speedBonus = score >= 80 && time_spent_seconds < 120 ? 5 : score >= 80 ? 2 : 0;
    const earnedXp = baseXp + speedBonus;

    try {
      const prev = await query(
        `SELECT completed, score FROM progress WHERE user_id = $1 AND exercise_id = $2`,
        [uid, exercise_id]
      );
      const wasCompleted = prev.rows[0]?.completed;

      await query(
        `INSERT INTO progress (user_id, exercise_id, completed, score, attempts, completed_at, time_spent_seconds)
         VALUES ($1, $2, true, $3, 1, now(), $4)
         ON CONFLICT (user_id, exercise_id) DO UPDATE SET
           completed = true,
           score = GREATEST(progress.score, EXCLUDED.score),
           attempts = progress.attempts + 1,
           completed_at = now(),
           time_spent_seconds = progress.time_spent_seconds + EXCLUDED.time_spent_seconds`,
        [uid, exercise_id, score, time_spent_seconds]
      );

      let xpGain = 0;
      if (!wasCompleted) xpGain = earnedXp;

      const u = await query(
        'SELECT xp, streak_days, last_activity, badges FROM users WHERE id = $1',
        [uid]
      );
      const row = u.rows[0];
      const { streak, last } = nextStreak(row.last_activity, row.streak_days);

      const newXp = (row.xp || 0) + xpGain;
      const newLevel = levelFromXp(newXp);

      const rawBadges = row.badges;
      const newBadges = Array.isArray(rawBadges) ? [...rawBadges] : [];
      for (const br of BADGE_RULES) {
        if (br.exerciseId === exercise_id && !newBadges.includes(br.id)) {
          newBadges.push(br.id);
        }
      }

      await query(
        `UPDATE users SET xp = $1, level = $2, streak_days = $3, last_activity = $4::date, badges = $5::jsonb WHERE id = $6`,
        [newXp, newLevel, streak, last, JSON.stringify(newBadges), uid]
      );

      res.json({
        ok: true,
        xpGained: xpGain,
        xpTotal: newXp,
        level: newLevel,
        streakDays: streak,
        badgesUnlocked: BADGE_RULES.filter(
          (b) => b.exerciseId === exercise_id && newBadges.includes(b.id)
        ).map((b) => ({ id: b.id, name: b.name, emoji: b.emoji })),
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;

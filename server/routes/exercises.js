const express = require('express');
const { EXERCISES, localizeExercise } = require('../data/exercises');

const router = express.Router();

function resolveLang(req) {
  const q = String(req.query.lang || '')
    .toLowerCase()
    .slice(0, 5);
  if (q === 'en') return 'en';
  const al = String(req.headers['accept-language'] || '').toLowerCase();
  if (al.startsWith('en')) return 'en';
  return 'fr';
}

/** Catalogue public */
router.get('/', (req, res) => {
  const lang = resolveLang(req);
  res.json({
    exercises: EXERCISES.map((e) => {
      const loc = localizeExercise(e, lang);
      return {
        id: loc.id,
        module: loc.module,
        order: loc.order,
        title: loc.title,
        kind: loc.kind,
        analogy: loc.analogy,
      };
    }),
  });
});

router.get('/:id', (req, res) => {
  const ex = EXERCISES.find((x) => x.id === req.params.id);
  if (!ex) return res.status(404).json({ error: 'Exercice introuvable' });
  const lang = resolveLang(req);
  res.json({ exercise: localizeExercise(ex, lang) });
});

module.exports = router;

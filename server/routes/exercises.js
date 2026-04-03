const express = require('express');
const { EXERCISES } = require('../data/exercises');

const router = express.Router();

/** Catalogue public (contenu pédagogique) */
router.get('/', (req, res) => {
  res.json({
    exercises: EXERCISES.map((e) => ({
      id: e.id,
      module: e.module,
      order: e.order,
      title: e.title,
      kind: e.kind,
      analogy: e.analogy,
    })),
  });
});

router.get('/:id', (req, res) => {
  const ex = EXERCISES.find((x) => x.id === req.params.id);
  if (!ex) return res.status(404).json({ error: 'Exercice introuvable' });
  res.json({ exercise: ex });
});

module.exports = router;

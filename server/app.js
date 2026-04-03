require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { verifyCsrf, cookieParser, issueCsrfToken } = require('./middleware/csrf');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const exercisesRoutes = require('./routes/exercises');

const app = express();
app.set('trust proxy', 1);

const corsOrigin = process.env.FRONTEND_URL || true;
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '120kb' }));
app.use(cookieParser);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/csrf-token', (req, res) => {
  try {
    const csrfToken = issueCsrfToken(req, res);
    res.json({ csrfToken });
  } catch (e) {
    res.status(500).json({ error: 'Configuration CSRF manquante' });
  }
});

app.use(verifyCsrf);

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exercisesRoutes);

const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return res.status(404).json({ error: 'Non trouvé' });
  }
  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

module.exports = app;

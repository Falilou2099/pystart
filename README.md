# PyStart

Application web d’apprentissage du **Python** pour débutants : **300 exercices** en **9 modules** (générés à partir de banques de questions), interface minimaliste, progression (XP, badges, série), authentification et persistance sur **Neon (PostgreSQL)**. **Aucun envoi d’email** : inscription immédiatement utilisable.

## Stack

- **Frontend** : HTML, CSS, JavaScript (sans framework)
- **Backend** : Node.js 18+, Express
- **Base** : PostgreSQL (Neon) via `pg` et `DATABASE_URL`
- **Auth** : bcrypt (coût 12), JWT accès 7 jours + refresh 30 jours (cookies httpOnly), CSRF sur les requêtes mutantes, rate limiting connexion (5 / IP / 15 min)
## Prérequis

- Node.js ≥ 18
- Un projet [Neon](https://neon.tech) avec une base PostgreSQL

## Installation

```bash
cd pystart
npm install
cp .env.example .env
```

Renseigne au minimum dans `.env` :

- `DATABASE_URL` — chaîne de connexion Neon (le serveur enlève `channel_binding=require` si présent : incompatible avec `pg` sur Vercel)
- `JWT_SECRET` — chaîne longue et aléatoire (≥ 32 caractères en production)
- `JWT_REFRESH_SECRET` — autre secret pour les refresh tokens
- `CSRF_SECRET` — secret pour les jetons CSRF (peut être identique à `JWT_SECRET` en dev)
- `FRONTEND_URL` — URL du front (ex. `http://localhost:3000`)

### Créer les tables sur Neon (obligatoire pour login / inscription)

Sans cette étape, les tables `users`, `sessions`, etc. n’existent pas : tu auras une **erreur serveur** à l’inscription ou à la connexion.

1. Vérifie que `.env` contient bien `DATABASE_URL` (chaîne **Connection string** du projet Neon, onglet *Dashboard*).
2. Depuis la racine du projet :

```bash
npm run db:migrate
```

Tu dois voir plusieurs lignes `OK (1/8) …` puis `Migration terminée`.

**Alternative** : dans la console **SQL Editor** de Neon, colle tout le fichier `schema.sql` et exécute (*Run*).

> Même opération à refaire si tu crées une **nouvelle** base Neon (nouvelle branche / projet).

## Démarrage local

```bash
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000) (ou le port défini par `PORT`).

1. Crée un compte (inscription) — pas de confirmation par email.
2. Connecte-toi : la progression et l’XP sont synchronisées avec la base.

**Invité** : tu peux parcourir les exercices sans compte ; l’XP est alors stockée **localement** (navigateur).

## Déploiement (Vercel)

- Le fichier `vercel.json` envoie le trafic vers la fonction serverless `api/index.js` (Express).
- Les fichiers statiques sous `public/` sont servis en priorité lorsque la plateforme les résout.
- Configure les **variables d’environnement** du projet Vercel comme dans `.env.example`.
- En production : `NODE_ENV=production`, `SESSION_COOKIE_SECURE=true`, `FRONTEND_URL=https://ton-domaine`.

## Structure du dépôt

```
pystart/
├── api/index.js          # Entrée Vercel
├── public/               # Frontend statique
├── server/
│   ├── app.js            # Application Express
│   ├── data/generateExercises.js # Génération des 300 exercices
│   ├── data/exercises.js         # Réexport
│   ├── routes/           # auth, progress, exercises
│   └── middleware/       # JWT, CSRF
├── schema.sql
├── .env.example
└── package.json
```

## Sécurité (résumé)

- Mots de passe hachés avec **bcrypt** (12 rounds).
- **JWT** en cookies **httpOnly**, `sameSite=lax`, `secure` en prod.
- **CSRF** : en-tête `X-CSRF-Token` + cookie (obtenu via `GET /api/csrf-token`).
- **Rate limit** sur `POST /api/auth/login`.
- Validation **express-validator** sur les entrées ; requêtes SQL **paramétrées** ; échappement HTML côté utilitaires pour limiter le XSS.
- Journalisation des connexions dans la table `auth_logs`.

## Licence

Projet éducatif — adapte la licence selon ton usage.

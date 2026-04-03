const escapeHtml = require('escape-html');
const validator = require('validator');

/** Texte affichable : trim + échappement HTML (anti-XSS côté sortie). */
function sanitizeText(input, maxLen = 5000) {
  if (input == null) return '';
  let s = String(input).trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return escapeHtml(s);
}

/** Username : alphanum + underscore, normalisé pour stockage. */
function normalizeUsername(raw) {
  if (raw == null) return '';
  return String(raw).trim().slice(0, 30);
}

/** Email normalisé (minuscules, trim). */
function normalizeEmail(raw) {
  if (raw == null) return '';
  return validator.normalizeEmail(String(raw).trim(), {
    gmail_remove_dots: false,
    all_lowercase: true,
  }) || String(raw).trim().toLowerCase();
}

module.exports = { sanitizeText, normalizeUsername, normalizeEmail, escapeHtml };

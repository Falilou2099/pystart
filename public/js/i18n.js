/**
 * PyStart — FR / EN (préférence dans localStorage : pystart_lang)
 */
(function () {
  const STORAGE_KEY = 'pystart_lang';
  const FALLBACK = 'fr';

  const MODULE_NAMES = {
    fr: [
      'Premier contact',
      'Variables & types',
      'Conditions',
      'Boucles',
      'Listes & tuples',
      'Fonctions',
      'Dictionnaires & ensembles',
      'Fichiers & modules',
      'Projets & synthèse',
    ],
    en: [
      'Getting started',
      'Variables & types',
      'Conditionals',
      'Loops',
      'Lists & tuples',
      'Functions',
      'Dictionaries & sets',
      'Files & modules',
      'Projects & recap',
    ],
  };

  const STR = {
    fr: {
      doc_title: 'PyStart — Python pour débutants',
      btn_login: 'Connexion',
      btn_logout: 'Déconnexion',
      btn_lang_to_en: 'English',
      btn_lang_to_fr: 'Français',
      lang_title: 'Passer en anglais',
      lang_title_en: 'Switch to French',
      xp_suffix: ' XP',
      days_suffix: ' jours',
      map_title: '🗺️ Parcours Python',
      map_subtitle: '9 modules · 300 exercices · QCM, vrai/faux, code et erreurs',
      revision_mode: 'Mode révision',
      back_map: '← Carte',
      back_list: '← Liste',
      mod_title_default: 'Module',
      ex_default: 'Exercice',
      login_title: 'Connexion',
      login_email: 'Email',
      login_password: 'Mot de passe',
      login_submit: 'Se connecter',
      link_register: 'Créer un compte',
      register_title: 'Inscription',
      register_username: 'Pseudo (3–30, lettres, chiffres, _)',
      register_password: 'Mot de passe (min. 8)',
      register_confirm: 'Confirmation',
      register_submit: "S'inscrire",
      link_has_account: 'Déjà un compte ?',
      dash_title: 'Tableau de bord',
      dash_xp_label: 'XP',
      dash_level_label: 'Niveau',
      dash_streak_label: 'Série',
      dash_days: 'jours',
      dash_badges: 'Badges',
      dash_continue: 'Continuer le parcours',
      module_word: 'Module',
      exercises_word: 'exercices',
      pick_exercise: 'Choisis un exercice',
      revision_subtitle: 'Révision : exercices déjà terminés',
      revision_empty: 'Aucun exercice à afficher en mode révision pour ce module.',
      analogy_label: 'Analogie :',
      anim_next: 'Étape suivante →',
      anim_done: 'Compris !',
      true_btn: 'Vrai',
      false_btn: 'Faux',
      ph_fill: 'Ta réponse pour le trou',
      ph_fix: 'Écris la ligne corrigée',
      validate: 'Valider',
      hint_btn: '💡 Indice (−5 XP)',
      back: '← Retour',
      hint_prefix: 'Indice : ',
      xp_local: ' (local)',
      error_generic: 'Erreur',
      ok_generic: 'OK',
      encourage_mcq: 'Presque !',
      encourage_tf: 'Belle tentative !',
      encourage_fill: 'Encore un effort !',
      encourage_find: 'Tu y es presque !',
      kind_mcq: 'QCM',
      kind_truefalse: 'Vrai / faux',
      kind_fill: 'À compléter',
      kind_finderror: "Trouver l'erreur",
      badge_first_step: 'Premier pas',
      badge_mod1: 'Module 1',
      badge_mod2: 'Module 2',
      badge_mod3: 'Module 3',
      badge_mod4: 'Module 4',
      badge_mod5: 'Module 5',
      badge_mod6: 'Module 6',
      badge_mod7: 'Module 7',
      badge_mod8: 'Module 8',
      badge_mod9: 'Parcours complet',
    },
    en: {
      doc_title: 'PyStart — Python for beginners',
      btn_login: 'Log in',
      btn_logout: 'Log out',
      btn_lang_to_en: 'English',
      btn_lang_to_fr: 'Français',
      lang_title: 'Switch to English',
      lang_title_en: 'Passer en français',
      xp_suffix: ' XP',
      days_suffix: ' days',
      map_title: '🗺️ Python learning path',
      map_subtitle: '9 modules · 300 exercises · quiz, true/false, code & bugs',
      revision_mode: 'Review mode',
      back_map: '← Map',
      back_list: '← List',
      mod_title_default: 'Module',
      ex_default: 'Exercise',
      login_title: 'Log in',
      login_email: 'Email',
      login_password: 'Password',
      login_submit: 'Sign in',
      link_register: 'Create an account',
      register_title: 'Sign up',
      register_username: 'Username (3–30, letters, digits, _)',
      register_password: 'Password (min. 8)',
      register_confirm: 'Confirm password',
      register_submit: 'Sign up',
      link_has_account: 'Already have an account?',
      dash_title: 'Dashboard',
      dash_xp_label: 'XP',
      dash_level_label: 'Level',
      dash_streak_label: 'Streak',
      dash_days: 'days',
      dash_badges: 'Badges',
      dash_continue: 'Continue learning',
      module_word: 'Module',
      exercises_word: 'exercises',
      pick_exercise: 'Pick an exercise',
      revision_subtitle: 'Review: completed exercises only',
      revision_empty: 'No exercises to show in review mode for this module.',
      analogy_label: 'Analogy:',
      anim_next: 'Next step →',
      anim_done: 'Got it!',
      true_btn: 'True',
      false_btn: 'False',
      ph_fill: 'Your answer for the blank',
      ph_fix: 'Type the corrected line',
      validate: 'Check',
      hint_btn: '💡 Hint (−5 XP)',
      back: '← Back',
      hint_prefix: 'Hint: ',
      xp_local: ' (local)',
      error_generic: 'Error',
      ok_generic: 'OK',
      encourage_mcq: 'Almost!',
      encourage_tf: 'Nice try!',
      encourage_fill: 'Keep going!',
      encourage_find: "You're close!",
      kind_mcq: 'MCQ',
      kind_truefalse: 'True / false',
      kind_fill: 'Fill in',
      kind_finderror: 'Find the bug',
      badge_first_step: 'First step',
      badge_mod1: 'Module 1',
      badge_mod2: 'Module 2',
      badge_mod3: 'Module 3',
      badge_mod4: 'Module 4',
      badge_mod5: 'Module 5',
      badge_mod6: 'Module 6',
      badge_mod7: 'Module 7',
      badge_mod8: 'Module 8',
      badge_mod9: 'Path complete',
    },
  };

  function getLang() {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' ? 'en' : 'fr';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang === 'en' ? 'en' : 'fr');
  }

  function toggleLang() {
    setLang(getLang() === 'fr' ? 'en' : 'fr');
  }

  function t(key) {
    const lang = getLang();
    const table = STR[lang] || STR[FALLBACK];
    return table[key] != null ? table[key] : STR[FALLBACK][key] != null ? STR[FALLBACK][key] : key;
  }

  function moduleName(indexZeroBased) {
    const lang = getLang();
    const arr = MODULE_NAMES[lang] || MODULE_NAMES.fr;
    return arr[indexZeroBased] || '';
  }

  function kindLabel(kind) {
    const k = 'kind_' + String(kind || '').toLowerCase();
    const label = t(k);
    return label !== k ? label : String(kind || '').toUpperCase();
  }

  function badgeName(id) {
    const map = {
      first_step: 'badge_first_step',
      mod1_done: 'badge_mod1',
      mod2_done: 'badge_mod2',
      mod3_done: 'badge_mod3',
      mod4_done: 'badge_mod4',
      mod5_done: 'badge_mod5',
      mod6_done: 'badge_mod6',
      mod7_done: 'badge_mod7',
      mod8_done: 'badge_mod8',
      mod9_done: 'badge_mod9',
    };
    const key = map[id];
    return key ? t(key) : id;
  }

  function applyDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      const key = node.getAttribute('data-i18n');
      if (key) node.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
      const key = node.getAttribute('data-i18n-placeholder');
      if (key && node.placeholder !== undefined) node.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (node) {
      const key = node.getAttribute('data-i18n-title');
      if (key) node.title = t(key);
    });
  }

  function updateLangButton(btn) {
    if (!btn) return;
    const lang = getLang();
    if (lang === 'fr') {
      btn.textContent = t('btn_lang_to_en');
      btn.setAttribute('data-i18n-title', 'lang_title');
      btn.title = t('lang_title');
    } else {
      btn.textContent = t('btn_lang_to_fr');
      btn.setAttribute('data-i18n-title', 'lang_title_en');
      btn.title = t('lang_title_en');
    }
  }

  function syncDocument() {
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'fr';
    document.title = t('doc_title');
  }

  window.I18n = {
    getLang,
    setLang,
    toggleLang,
    t,
    moduleName,
    kindLabel,
    badgeName,
    applyDom,
    updateLangButton,
    syncDocument,
  };
})();

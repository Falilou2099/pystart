/* global PyApi, I18n */
(function () {
  const TOTAL_EX = 300;
  const MODULE_EMOJI = ['👋', '📦', '🔀', '🔄', '📋', '🧩', '📖', '📁', '🚀'];

  function t(k) {
    return I18n.t(k);
  }

  function localizeApiError(msg) {
    if (!msg || I18n.getLang() !== 'en') return msg;
    const m = {
      'Compte créé. Tu peux te connecter tout de suite.':
        'Account created. You can sign in now.',
      Identifiants incorrects: 'Invalid email or password.',
      'Non connecté': 'Not signed in.',
      'Email ou pseudo déjà utilisé': 'Email or username already taken.',
      'Jeton CSRF invalide ou manquant': 'Invalid or missing CSRF token.',
      'Session expirée ou invalide': 'Session expired or invalid.',
    };
    return m[msg] || msg;
  }

  function exercisesLangQuery() {
    return '?lang=' + (I18n.getLang() === 'en' ? 'en' : 'fr');
  }

  async function onLanguageChanged() {
    I18n.applyDom();
    I18n.updateLangButton(el('btn-lang'));
    I18n.syncDocument();
    await loadExercises();
    updateTopbar();
    const av = document.querySelector('.main .view.active');
    if (!av) return;
    if (av.id === 'view-map') renderMap();
    else if (av.id === 'view-module') openModule(state.currentModule || 1);
    else if (av.id === 'view-exercise' && state.currentExId) await openExercise(state.currentExId);
    else if (av.id === 'view-exercise') renderExercise();
    else if (av.id === 'view-dashboard' && state.user) renderDashboard();
  }

  const state = {
    user: null,
    currentModule: 1,
    exercises: [],
    exerciseDetail: null,
    currentExId: null,
    progressById: {},
    revision: false,
    startedAt: null,
    hintsUsed: false,
    attemptCount: 0,
    revealed: false,
    animStep: 0,
    guest: loadGuest(),
  };

  function loadGuest() {
    try {
      return {
        xp: parseInt(localStorage.getItem('pystart_guest_xp') || '0', 10),
        completed: JSON.parse(localStorage.getItem('pystart_guest_done') || '[]'),
      };
    } catch (_) {
      return { xp: 0, completed: [] };
    }
  }

  function saveGuest() {
    localStorage.setItem('pystart_guest_xp', String(state.guest.xp));
    localStorage.setItem('pystart_guest_done', JSON.stringify(state.guest.completed));
  }

  function el(id) {
    return document.getElementById(id);
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const n = el('view-' + name);
    if (n) n.classList.add('active');
  }

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '') || '/';
    const q = raw.indexOf('?');
    let path = q >= 0 ? raw.slice(0, q) : raw;
    if (!path.startsWith('/')) path = '/' + path;
    const search = q >= 0 ? raw.slice(q + 1) : '';
    const params = new URLSearchParams(search);
    return { path, params };
  }

  async function refreshUser() {
    const r = await PyApi.api('/api/auth/me');
    if (r.ok) {
      state.user = await r.json();
      return true;
    }
    state.user = null;
    return false;
  }

  async function loadProgress() {
    if (!state.user) {
      state.progressById = {};
      return;
    }
    const r = await PyApi.api('/api/auth/me');
    if (!r.ok) return;
    const me = await r.json();
    state.user = me;
    const pr = await PyApi.api('/api/progress');
    if (!pr.ok) return;
    const j = await pr.json();
    state.progressById = {};
    (j.progress || []).forEach((p) => {
      state.progressById[p.exercise_id] = p;
    });
  }

  async function loadExercises() {
    const r = await fetch('/api/exercises' + exercisesLangQuery());
    const j = await r.json();
    state.exercises = j.exercises || [];
  }

  function xpDisplay() {
    if (state.user) return state.user.xp || 0;
    return state.guest.xp;
  }

  function streakDisplay() {
    if (state.user) return state.user.streakDays ?? state.user.streak_days ?? 0;
    return 0;
  }

  function completedCount() {
    if (state.user) {
      return Object.keys(state.progressById).filter(
        (id) => state.progressById[id].completed
      ).length;
    }
    return state.guest.completed.length;
  }

  function isDone(id) {
    if (state.user) return !!(state.progressById[id] && state.progressById[id].completed);
    return state.guest.completed.includes(id);
  }

  function moduleProgress(mod) {
    const ids = state.exercises.filter((e) => e.module === mod).map((e) => e.id);
    if (!ids.length) return 0;
    const done = ids.filter((id) => isDone(id)).length;
    return Math.round((done / ids.length) * 100);
  }

  function moduleLocked(mod) {
    if (mod <= 1) return false;
    const prev = mod - 1;
    return moduleProgress(prev) < 100;
  }

  function updateTopbar() {
    el('xp-display').textContent = xpDisplay() + t('xp_suffix');
    el('streak-display').textContent = streakDisplay() + t('days_suffix');
    el('progress-display').textContent = completedCount() + '/' + TOTAL_EX;
    const pct = (completedCount() / TOTAL_EX) * 100;
    el('global-bar').style.width = pct + '%';
    if (state.user) {
      el('user-chip').textContent = state.user.username;
      el('user-chip').style.display = '';
      el('user-chip').onclick = () => {
        location.hash = '#/dashboard';
        route();
      };
      el('btn-logout').style.display = '';
      el('btn-auth').style.display = 'none';
    } else {
      el('user-chip').style.display = 'none';
      el('user-chip').onclick = null;
      el('btn-logout').style.display = 'none';
      el('btn-auth').style.display = '';
    }
  }

  function renderMap() {
    const grid = el('islands-grid');
    grid.innerHTML = '';
    for (let mod = 1; mod <= 9; mod++) {
      const locked = moduleLocked(mod);
      const pct = moduleProgress(mod);
      const card = document.createElement('div');
      card.className = 'island-card' + (locked ? ' locked' : '') + (pct === 100 ? ' completed' : '');
      const emoji = MODULE_EMOJI[mod - 1];
      const nEx = state.exercises.filter((e) => e.module === mod).length;
      card.innerHTML =
        `<span class="island-emoji">${emoji}</span>` +
        `<div class="island-num">${t('module_word')} ${mod}</div>` +
        `<div class="island-name">${I18n.moduleName(mod - 1)}</div>` +
        `<div class="island-desc">${nEx || '—'} ${t('exercises_word')}</div>` +
        `<div class="island-progress"><div class="island-bar"><div class="island-bar-fill" style="width:${pct}%"></div></div><span class="island-pct">${pct}%</span></div>` +
        (locked ? '<span class="lock-icon">🔒</span>' : '');
      if (!locked) {
        card.onclick = () => openModule(mod);
      }
      grid.appendChild(card);
    }
    el('revision-toggle').classList.toggle('on', state.revision);
  }

  function openModule(mod) {
    state.currentModule = mod;
    const list = el('lessons-list');
    list.innerHTML = '';
    el('mod-title').textContent = t('module_word') + ' ' + mod + ' — ' + I18n.moduleName(mod - 1);
    el('mod-subtitle').textContent = state.revision ? t('revision_subtitle') : t('pick_exercise');
    const exs = state.exercises.filter((e) => e.module === mod);
    exs.forEach((e) => {
      const done = isDone(e.id);
      if (state.revision && !done) return;
      const row = document.createElement('div');
      row.className = 'lesson-card' + (done ? ' done' : '');
      row.innerHTML =
        `<span class="lesson-card-icon">${done ? '✅' : '📖'}</span>` +
        `<div class="lesson-card-info"><div class="lesson-card-title">${e.title}</div>` +
        `<div class="lesson-card-meta">${I18n.kindLabel(e.kind)}</div></div><span class="lesson-card-arrow">→</span>`;
      row.onclick = () => openExercise(e.id);
      list.appendChild(row);
    });
    if (!list.children.length) {
      list.innerHTML = '<p class="muted">' + t('revision_empty') + '</p>';
    }
    showView('module');
  }

  async function openExercise(id) {
    state.currentExId = id;
    state.startedAt = Date.now();
    state.hintsUsed = false;
    state.attemptCount = 0;
    state.revealed = false;
    state.animStep = 0;
    const r = await fetch('/api/exercises/' + encodeURIComponent(id) + exercisesLangQuery());
    if (!r.ok) return;
    const j = await r.json();
    state.exerciseDetail = j.exercise;
    renderExercise();
    showView('exercise');
  }

  function renderExercise() {
    const ex = state.exerciseDetail;
    if (!ex) return;
    el('ex-title').textContent = ex.title;
    el('ex-level').textContent =
      t('module_word') + ' ' + ex.module + ' · ' + I18n.kindLabel(ex.kind);
    el('ex-analogy').innerHTML =
      '<p><strong>💭 ' + escapeHtml(t('analogy_label')) + '</strong> ' + escapeHtml(ex.analogy) + '</p>';
    el('ex-prompt').innerHTML = '<p>' + escapeHtml(ex.prompt).replace(/\n/g, '<br>') + '</p>';

    const viz = el('ex-visual');
    viz.innerHTML = '';
    if (ex.visualEmoji) {
      const d = document.createElement('div');
      d.className = 'concept-visual';
      d.textContent = ex.visualEmoji;
      viz.appendChild(d);
    }

    const anim = el('ex-animation');
    anim.innerHTML = '';
    if (ex.animationSteps && ex.animationSteps.length) {
      const st = ex.animationSteps[state.animStep];
      anim.innerHTML =
        '<div class="code-block-wrap"><div class="code-display mono">' +
        escapeHtml(st.code).replace(/\n/g, '<br>') +
        '</div><p class="anim-cap">' +
        escapeHtml(st.caption) +
        '</p>' +
        (state.animStep < ex.animationSteps.length - 1
          ? '<button type="button" class="btn-secondary" id="anim-next">' +
            escapeHtml(t('anim_next')) +
            '</button>'
          : '<button type="button" class="btn-secondary" id="anim-done">' +
            escapeHtml(t('anim_done')) +
            '</button>') +
        '</div>';
      const nx = el('anim-next');
      if (nx)
        nx.onclick = () => {
          state.animStep++;
          renderExercise();
        };
      const dn = el('anim-done');
      if (dn)
        dn.onclick = () => {
          anim.innerHTML = '';
          renderExercise();
        };
      el('ex-interaction').innerHTML = '';
      el('ex-actions').innerHTML = '';
      el('ex-feedback').innerHTML = '';
      return;
    }

    const box = el('ex-interaction');
    box.innerHTML = '';
    el('ex-feedback').innerHTML = '';

    if (ex.kind === 'mcq') {
      ex.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opt';
        b.textContent = opt;
        b.onclick = () => answerMcq(i);
        box.appendChild(b);
      });
    } else if (ex.kind === 'truefalse') {
      [t('true_btn'), t('false_btn')].forEach((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opt';
        b.textContent = label;
        b.onclick = () => answerTf(i === 0);
        box.appendChild(b);
      });
    } else if (ex.kind === 'fill') {
      const pre = document.createElement('pre');
      pre.className = 'mono code-block';
      pre.textContent = ex.codeTemplate.replace('___', '______');
      box.appendChild(pre);
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'text-input';
      inp.id = 'fill-answer';
      inp.placeholder = t('ph_fill');
      box.appendChild(inp);
      const sub = document.createElement('button');
      sub.type = 'button';
      sub.className = 'next-btn';
      sub.textContent = t('validate');
      sub.onclick = () => answerFill();
      box.appendChild(sub);
    } else if (ex.kind === 'findError') {
      const pre = document.createElement('pre');
      pre.className = 'mono code-block';
      pre.textContent = ex.wrongCode;
      box.appendChild(pre);
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'text-input';
      inp.id = 'fix-answer';
      inp.placeholder = t('ph_fix');
      box.appendChild(inp);
      const sub = document.createElement('button');
      sub.type = 'button';
      sub.className = 'next-btn';
      sub.textContent = t('validate');
      sub.onclick = () => answerFind();
      box.appendChild(sub);
    }

    const actions = el('ex-actions');
    actions.innerHTML =
      '<button type="button" class="btn-hint" id="hint-btn">' +
      escapeHtml(t('hint_btn')) +
      '</button>' +
      '<button type="button" class="back-btn" id="back-mod">' +
      escapeHtml(t('back')) +
      '</button>';
    el('hint-btn').onclick = showHint;
    el('back-mod').onclick = () => {
      openModule(state.currentModule || 1);
    };
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function normalizeAns(s) {
    return String(s || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function showFeedback(ok, msg) {
    const f = el('ex-feedback');
    f.className = 'feedback-banner ' + (ok ? 'ok' : 'bad');
    f.textContent = msg;
  }

  function disableInteraction() {
    el('ex-interaction').querySelectorAll('button,.quiz-opt').forEach((b) => {
      b.disabled = true;
    });
  }

  function scoreFromAttempts() {
    return Math.max(55, 100 - Math.max(0, state.attemptCount - 1) * 15);
  }

  async function completeExercise(score) {
    const elapsed = Math.round((Date.now() - (state.startedAt || Date.now())) / 1000);
    const ex = state.exerciseDetail;
    if (state.user) {
      const r = await PyApi.api('/api/progress/complete', {
        method: 'POST',
        body: {
          exercise_id: ex.id,
          score: score,
          time_spent_seconds: elapsed,
          hints_used: state.hintsUsed,
        },
      });
      if (r.ok) {
        const j = await r.json();
        if (j.xpGained) showXPPopup('+' + j.xpGained + t('xp_suffix'));
        await loadProgress();
        await refreshUser();
      }
    } else {
      if (!state.guest.completed.includes(ex.id)) {
        state.guest.completed.push(ex.id);
        let add = 10;
        if (state.hintsUsed) add -= 5;
        if (score >= 80 && elapsed < 120) add += 5;
        state.guest.xp += add;
        saveGuest();
        showXPPopup('+' + add + t('xp_suffix') + t('xp_local'));
      }
    }
    updateTopbar();
    state.revealed = true;
  }

  function showXPPopup(t) {
    const p = document.createElement('div');
    p.className = 'xp-popup';
    p.textContent = t;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }

  async function answerMcq(i) {
    if (state.revealed) return;
    const ex = state.exerciseDetail;
    state.attemptCount++;
    const ok = i === ex.correctIndex;
    if (ok) {
      disableInteraction();
      showFeedback(true, '✅ ' + ex.explanation);
      await completeExercise(scoreFromAttempts());
    } else {
      showFeedback(
        false,
        '🌱 ' + (ex.encouragementWrong || t('encourage_mcq')) + ' — ' + ex.explanation
      );
    }
  }

  async function answerTf(v) {
    if (state.revealed) return;
    const ex = state.exerciseDetail;
    state.attemptCount++;
    const ok = v === ex.correctTrueFalse;
    if (ok) {
      disableInteraction();
      showFeedback(true, '✅ ' + ex.explanation);
      await completeExercise(scoreFromAttempts());
    } else {
      showFeedback(
        false,
        '🌱 ' + (ex.encouragementWrong || t('encourage_tf')) + ' — ' + ex.explanation
      );
    }
  }

  async function answerFill() {
    if (state.revealed) return;
    const ex = state.exerciseDetail;
    const raw = el('fill-answer').value;
    state.attemptCount++;
    const norm = normalizeAns(raw);
    const acc = (ex.acceptableAnswers || [ex.blankAnswer]).map(normalizeAns);
    const ok = acc.some((a) => a === norm);
    if (ok) {
      el('fill-answer').disabled = true;
      showFeedback(true, '✅ ' + ex.explanation);
      await completeExercise(scoreFromAttempts());
    } else {
      showFeedback(
        false,
        '🌱 ' + (ex.encouragementWrong || t('encourage_fill')) + ' — ' + ex.explanation
      );
    }
  }

  async function answerFind() {
    if (state.revealed) return;
    const ex = state.exerciseDetail;
    const raw = el('fix-answer').value;
    state.attemptCount++;
    const ok = normalizeAns(raw) === normalizeAns(ex.fixedLine);
    if (ok) {
      el('fix-answer').disabled = true;
      showFeedback(true, '✅ ' + ex.explanation);
      await completeExercise(scoreFromAttempts());
    } else {
      showFeedback(
        false,
        '🌱 ' + (ex.encouragementWrong || t('encourage_find')) + ' — ' + ex.explanation
      );
    }
  }

  function showHint() {
    const ex = state.exerciseDetail;
    if (!ex || !ex.hints || !ex.hints.length) return;
    state.hintsUsed = true;
    const h = ex.hints[Math.floor(Math.random() * ex.hints.length)];
    showFeedback(false, '💡 ' + t('hint_prefix') + h);
  }

  function bindAuth() {
    el('btn-auth').onclick = () => {
      location.hash = '#/login';
      route();
    };
    el('btn-logout').onclick = async () => {
      await PyApi.api('/api/auth/logout', { method: 'POST', body: {} });
      PyApi.resetCsrf();
      state.user = null;
      state.progressById = {};
      updateTopbar();
      location.hash = '#/';
      route();
    };

    el('form-login').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = { email: fd.get('email'), password: fd.get('password') };
      const r = await PyApi.api('/api/auth/login', { method: 'POST', body });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        el('auth-msg').textContent = localizeApiError(j.error) || t('error_generic');
        return;
      }
      await refreshUser();
      await loadProgress();
      updateTopbar();
      location.hash = '#/dashboard';
      route();
    };

    el('form-register').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        email: fd.get('email'),
        username: fd.get('username'),
        password: fd.get('password'),
        passwordConfirm: fd.get('passwordConfirm'),
      };
      const r = await PyApi.api('/api/auth/register', { method: 'POST', body });
      const j = await r.json().catch(() => ({}));
      el('auth-msg').textContent = r.ok
        ? localizeApiError(j.message) || t('ok_generic')
        : localizeApiError(j.error) ||
          (j.errors && j.errors[0] && j.errors[0].msg) ||
          t('error_generic');
      if (r.ok) {
        e.target.reset();
      }
    };

    el('link-register').onclick = (ev) => {
      ev.preventDefault();
      location.hash = '#/register';
      route();
    };
    el('link-login').onclick = (ev) => {
      ev.preventDefault();
      location.hash = '#/login';
      route();
    };
    document.querySelectorAll('.js-auth-login').forEach((a) => {
      a.onclick = (ev) => {
        ev.preventDefault();
        location.hash = '#/login';
        route();
      };
    });
    el('ex-back').onclick = () => openModule(state.currentModule || 1);
    el('dash-continue').onclick = () => {
      location.hash = '#/';
      route();
    };
    el('btn-lang').onclick = async () => {
      I18n.toggleLang();
      await onLanguageChanged();
    };
  }

  function renderDashboard() {
    if (!state.user) {
      location.hash = '#/login';
      route();
      return;
    }
    el('dash-user').textContent = state.user.username;
    el('dash-email').textContent = state.user.email;
    el('dash-xp').textContent = state.user.xp;
    el('dash-level').textContent = state.user.level;
    el('dash-streak').textContent = state.user.streakDays ?? state.user.streak_days;
    const badges = state.user.badges || [];
    const meta = {
      first_step: '👣',
      mod1_done: '👋',
      mod2_done: '📦',
      mod3_done: '🔀',
      mod4_done: '🔄',
      mod5_done: '📋',
      mod6_done: '🧩',
      mod7_done: '📖',
      mod8_done: '📁',
      mod9_done: '🚀',
    };
    el('dash-badges').innerHTML = Object.entries(meta)
      .map(([id, emoji]) => {
        const on = badges.includes(id);
        return (
          '<div class="badge-pill ' +
          (on ? '' : 'locked') +
          '">' +
          emoji +
          ' ' +
          I18n.badgeName(id) +
          '</div>'
        );
      })
      .join('');
  }

  async function route() {
    const { path } = parseHash();
    updateTopbar();
    if (path === '/login') {
      showView('auth');
      el('auth-panel-login').style.display = '';
      el('auth-panel-register').style.display = 'none';
      el('auth-msg').textContent = '';
      return;
    }
    if (path === '/register') {
      showView('auth');
      el('auth-panel-login').style.display = 'none';
      el('auth-panel-register').style.display = '';
      el('auth-msg').textContent = '';
      return;
    }
    if (path === '/dashboard') {
      await refreshUser();
      renderDashboard();
      showView('dashboard');
      return;
    }
    // Accueil : parcours seulement si connecté, sinon on renvoie vers la connexion
    if (path === '/' && !state.user) {
      location.replace('#/login');
      return;
    }
    showView('map');
    renderMap();
  }

  el('logo').onclick = () => {
    location.hash = state.user ? '#/' : '#/login';
    route();
  };
  el('revision-toggle').onclick = () => {
    state.revision = !state.revision;
    renderMap();
  };
  el('map-back').onclick = () => {
    location.hash = state.user ? '#/' : '#/login';
    route();
  };

  window.addEventListener('hashchange', route);

  async function boot() {
    try {
      await PyApi.ensureCsrf();
    } catch (_) {
      /* serveur indisponible */
    }
    await loadExercises();
    await refreshUser();
    if (state.user) await loadProgress();
    const h = location.hash;
    if (
      !state.user &&
      (h === '' || h === '#' || h === '#/' || h === '#/index.html')
    ) {
      location.replace('#/login');
    }
    bindAuth();
    I18n.applyDom();
    I18n.updateLangButton(el('btn-lang'));
    I18n.syncDocument();
    route();
  }

  boot();
})();

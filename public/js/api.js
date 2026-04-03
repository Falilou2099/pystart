/* global fetch */
(function () {
  let csrfToken = null;

  async function ensureCsrf() {
    if (csrfToken) return csrfToken;
    const r = await fetch('/api/csrf-token', { credentials: 'include' });
    if (!r.ok) throw new Error('CSRF');
    const j = await r.json();
    csrfToken = j.csrfToken;
    return csrfToken;
  }

  function resetCsrf() {
    csrfToken = null;
  }

  async function api(path, opts) {
    const o = opts || {};
    const method = (o.method || 'GET').toUpperCase();
    const headers = Object.assign({}, o.headers || {});
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const t = await ensureCsrf();
      headers['X-CSRF-Token'] = t;
    }
    if (o.body && typeof o.body === 'object' && !(o.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const body =
      o.body && typeof o.body === 'object' && !(o.body instanceof FormData)
        ? JSON.stringify(o.body)
        : o.body;
    return fetch(path, Object.assign({}, o, { headers, body, credentials: 'include' }));
  }

  window.PyApi = { ensureCsrf, api, resetCsrf };
})();

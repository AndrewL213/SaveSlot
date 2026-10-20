/* SaveSlot — núcleo: almacenamiento, sesión, layout, utilidades. */
(function () {
  const DATA = window.SS_DATA;

  // ---------- Utilidades ----------
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  const gameById = (id) => DATA.games.find((g) => g.id === id);
  const fmt = (n) => Number(n).toLocaleString('es-CO');

  // ---------- Almacenamiento (localStorage con respaldo en memoria) ----------
  const mem = {};
  const store = {
    get(k, def) {
      try { const v = localStorage.getItem('ss.' + k); return v == null ? (k in mem ? mem[k] : def) : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : def; }
    },
    set(k, v) { mem[k] = v; try { localStorage.setItem('ss.' + k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  // ---------- Sesión (demo: sin backend, se guarda en el navegador) ----------
  const auth = {
    user() { return store.get('session', null); },
    login(u) { store.set('session', u); },
    logout() { store.set('session', null); },
    require(actionText) {
      if (auth.user()) return true;
      modal({
        icon: 'user', title: 'Necesitas una cuenta',
        text: 'Para ' + (actionText || 'hacer esto') + ', crea tu cuenta gratis. Lo que escribiste se guarda.',
        actions: [
          { label: 'Crear cuenta gratis', href: 'registro.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search), primary: true },
          { label: 'Ya tengo cuenta', href: 'login.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) }
        ]
      });
      return false;
    }
  };

  // ---------- Perfil del usuario (XP, favoritos, diario, etc.) ----------
  const profile = {
    get() {
      return store.get('profile', {
        xp: 1240, level: 12, bio: 'Gamer casual. Aventura, RPG y algo de terror los fines de semana.',
        since: '2024-03-14', favorites: ['nier-automata', 'zelda-totk', 'hollow-knight', 'fnaf-into-the-pit'],
        wishlist: ['hades-ii', 'ghost-of-tsushima', 'elden-ring'], genres: ['Aventura', 'RPG', 'Terror'],
        accounts: { Steam: 'samluq_steam', PlayStation: null, Xbox: null, Nintendo: null },
        playing: 'zelda-totk', missionsDone: ['calificar', 'guia']
      });
    },
    save(p) { store.set('profile', p); },
    addXP(n) { const p = profile.get(); p.xp += n; while (p.xp >= 1500) { p.xp -= 1500; p.level += 1; } profile.save(p); return p; }
  };

  const diary = {
    all() { return store.get('diary', DATA.diarySeed.slice()); },
    add(e) { const d = diary.all(); d.unshift(e); d.sort((a, b) => b.date.localeCompare(a.date)); store.set('diary', d); }
  };

  // ---------- UI: toast y modal ----------
  let toastTimer;
  function toast(msg) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
  }

  const ICONS = {
    user: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    check: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4CC870" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    alert: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F0616D" stroke-width="2" stroke-linecap="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/></svg>',
    trophy: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/></svg>'
  };
  const ICON_BG = { user: '#1A3157', check: '#1D3A2B', alert: '#2A1E24', trophy: '#1A3157' };

  function modal(o) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<button class="close" aria-label="Cerrar">✕</button>' +
      (o.icon ? '<span class="icon" style="background:' + ICON_BG[o.icon] + '">' + ICONS[o.icon] + '</span>' : '') +
      '<h2 id="m-title" style="font-size:24px">' + esc(o.title) + '</h2>' +
      (o.text ? '<p class="soft">' + esc(o.text) + '</p>' : '') +
      (o.html || '') +
      '<div class="actions">' + (o.actions || []).map((a, i) =>
        a.href ? '<a class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" href="' + esc(a.href) + '">' + esc(a.label) + '</a>'
               : '<button class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" data-i="' + i + '">' + esc(a.label) + '</button>').join('') + '</div></div>';
    document.body.appendChild(wrap);
    const close = () => closeModal();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    $('.close', wrap).addEventListener('click', close);
    $$('[data-i]', wrap).forEach((b) => b.addEventListener('click', () => { const a = o.actions[b.dataset.i]; if (a.onClick) a.onClick(); if (!a.keepOpen) close(); }));
    document.addEventListener('keydown', escClose);
    const first = $('.actions .btn', wrap); if (first) first.focus();
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() { const m = $('.modal-backdrop'); if (m) m.remove(); document.removeEventListener('keydown', escClose); }

  // ---------- Componentes ----------
  function cover(g, opts) {
    opts = opts || {};
    const bg = g.image ? 'background-image:url(' + esc(g.image) + ');background-size:cover;background-position:center;' : '';
    if (opts.small) return '<span class="cover cover-sm" style="--c:' + g.color + ';' + bg + '" aria-hidden="true"></span>';
    return '<div class="cover" style="--c:' + g.color + ';' + bg + (opts.style || '') + '">' + (opts.rank ? '<span class="rank">#' + opts.rank + '</span>' : '') + (opts.noTitle ? '' : '<b>' + esc(g.short) + '</b>') + '</div>';
  }
  function gameTile(g, rank) {
    return '<a class="game-tile" href="juego.html?id=' + encodeURIComponent(g.id) + '">' + cover(g, { rank: rank }) +
      '<div class="meta"><span>' + esc(g.genres[0] || '') + '</span><span class="score">' + (g.rating ? String(g.rating).replace('.', ',') + ' ★' : '') + '</span></div></a>';
  }
  function skulls(n) { let s = '<div class="skulls" aria-label="Dificultad ' + n + ' de 10">'; for (let i = 1; i <= 10; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return s + '</div>'; }

  // ---------- Layout ----------
  const NAV = [
    ['index.html', 'Inicio', 'inicio'], ['buscar.html', 'Juegos', 'juegos'], ['juego.html?id=zelda-totk', 'Comunidad', 'comunidad'],
    ['eventos.html', 'Eventos', 'eventos'], ['matchplay.html', 'MatchPlay', 'matchplay']
  ];
  const LOGO = '<svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><rect x="1.5" y="1.5" width="25" height="17" rx="3" fill="none" stroke="#3DA9F5" stroke-width="3"/><rect x="6" y="12" width="16" height="3" fill="#3DA9F5"/></svg>';

  function renderLayout() {
    const section = document.body.dataset.section || '';
    const u = auth.user();
    const p = profile.get();
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="container">' +
      '<a class="logo" href="index.html">' + LOGO + 'SaveSlot</a>' +
      '<button class="icon-btn menu-toggle" aria-label="Abrir menú" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
      '<nav class="main-nav" aria-label="Principal">' + NAV.map((n) => '<a href="' + n[0] + '"' + (n[2] === section ? ' aria-current="page"' : '') + '>' + n[1] + '</a>').join('') + '</nav>' +
      '<form class="header-search" role="search" action="buscar.html"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA8B8" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<label class="sr-only" for="hq">Buscar juegos</label><input id="hq" name="q" type="search" placeholder="Buscar juegos, guías o usuarios" value="' + esc(section === 'juegos' ? (params.get('q') || '') : '') + '"></form>' +
      (u ? '<button class="icon-btn" id="notif" aria-label="Notificaciones, 2 nuevas"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg><span class="dot"></span></button>' +
           '<a class="user-pill" href="perfil.html"><span class="avatar">' + esc(u.initials) + '</span><span><b>' + esc(u.name.split(' ')[0]) + '</b><span>Nivel ' + p.level + '</span></span></a>'
         : '<a class="btn btn-secondary btn-sm" href="login.html">Iniciar sesión</a><a class="btn btn-primary btn-sm" href="registro.html">Crear cuenta</a>') +
      '</div>';
    document.body.prepend(header);
    if (window.SS_API && SS_API.usingDemo && !store.get('hideDemo', false)) {
      const bar = document.createElement('div');
      bar.className = 'demo-bar';
      bar.innerHTML = 'Prototipo académico: los datos de juegos son de ejemplo hasta conectar las APIs. <a href="error.html?tipo=demo">Más información</a>';
      header.after(bar);
    }
    const tgl = $('.menu-toggle', header);
    tgl.addEventListener('click', () => { const nav = $('.main-nav', header); nav.classList.toggle('open'); tgl.setAttribute('aria-expanded', nav.classList.contains('open')); });
    const nb = $('#notif', header);
    if (nb) nb.addEventListener('click', () => modal({ icon: 'trophy', title: 'Notificaciones', html: '<div class="stack" style="width:100%;text-align:left"><div class="card">Tu reseña de NieR: Automata recibió 12 votos de “útil”.</div><div class="card">La Copa SaveSlot 2v2 cierra inscripciones el viernes.</div></div>', actions: [{ label: 'Cerrar' }] }));

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="container">' +
      '<div style="display:flex;flex-direction:column;gap:10px;max-width:320px"><b style="font-size:20px">SaveSlot</b><span class="muted small">Tu solución gamer. Todos tus juegos y sus comunidades en un solo lugar.</span></div>' +
      '<nav aria-label="Pie de página">' +
      '<div><b>Explora</b><a href="buscar.html">Juegos</a><a href="random.html">Juego random</a><a href="eventos.html">Eventos</a></div>' +
      '<div><b>Cuenta</b><a href="perfil.html">Mi perfil</a><a href="diario.html">Diario</a><a href="logros.html">Logros</a>' + (u ? '<a href="#" id="logout">Cerrar sesión</a>' : '<a href="login.html">Iniciar sesión</a>') + '</div>' +
      '<div><b>Ayuda</b><a href="contacto.html">Contáctanos</a><a href="error.html?tipo=estado">Estado de servicios</a><a href="eventos.html#reglas">Reglas de eventos</a></div>' +
      '</nav>' +
      '<p class="credits">Proyecto académico sin fines comerciales · Creación Digital, Universidad El Bosque. Nombres de juegos y marcas pertenecen a sus dueños. Datos de juegos: ejemplo' + (window.SS_API && !SS_API.usingDemo ? ' y <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a>' : '') + '.</p>' +
      '</div>';
    document.body.appendChild(footer);
    const lo = $('#logout', footer);
    if (lo) lo.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); location.href = 'index.html'; });
  }

  // Simulación de fallos para probar la página de error: ?simular=limite|api|tiempo|mantenimiento|sin-conexion|credenciales
  function checkSimulation() {
    const s = params.get('simular');
    if (s && document.body.dataset.page !== 'error') { SS_API.fail(s, params.get('servicio') || 'API de prueba'); return true; }
    return false;
  }
  window.addEventListener('offline', () => toast('Sin conexión. Algunas funciones no estarán disponibles.'));

  window.SS = { $, $$, esc, params, store, auth, profile, diary, toast, modal, closeModal, cover, gameTile, skulls, gameById, fmt, DATA };

  document.addEventListener('DOMContentLoaded', () => {
    if (checkSimulation()) return;
    renderLayout();
    const page = document.body.dataset.page;
    const init = window.SS_PAGES && window.SS_PAGES[page];
    if (init) {
      Promise.resolve().then(init).catch((e) => { console.error(e); });
    }
  });
})();

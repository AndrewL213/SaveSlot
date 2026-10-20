/* SaveSlot — cuenta, perfil, diario, MatchPlay, contacto y página de error. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, toast, modal, cover, skulls, gameById, fmt, DATA } = window.SS;
  const API = window.SS_API;
  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const safeBack = (v) => (v && /^[a-z0-9\-]+\.html(\?[^<>"'\s]*)?$/i.test(v)) ? v : null;
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const initialsOf = (n) => n.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'S';

  function setError(input, errEl, msg) {
    input.setAttribute('aria-invalid', !!msg);
    errEl.textContent = msg || ''; errEl.hidden = !msg;
    return !msg;
  }

  // ---------- Login ----------
  P.login = function () {
    if (auth.user()) { location.replace(safeBack(params.get('volver')) || 'perfil.html'); return; }
    $('#to-signup').href = 'registro.html' + location.search;
    $('#toggle-pw').addEventListener('click', () => { const i = $('#pw'); i.type = i.type === 'password' ? 'text' : 'password'; $('#toggle-pw').setAttribute('aria-label', i.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña'); });
    $$('[data-oauth]').forEach((b) => b.addEventListener('click', () => API.fail('funcion', 'Inicio de sesión con ' + b.dataset.oauth)));
    $('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const em = $('#em'), pw = $('#pw');
      const a = setError(em, $('#em-err'), emailOk(em.value) ? '' : (em.value ? 'Al correo le falta algo. Ejemplo: samuel@correo.com' : 'Escribe tu correo.'));
      const b = setError(pw, $('#pw-err'), pw.value.length >= 8 ? '' : 'La contraseña tiene al menos 8 caracteres.');
      if (!a || !b) return;
      const accounts = store.get('accounts', {});
      const acc = accounts[em.value.toLowerCase()];
      if (!acc) { setError(em, $('#em-err'), 'No encontramos una cuenta con ese correo. ¿Quieres crearla?'); return; }
      auth.login({ name: acc.name, user: acc.user, initials: initialsOf(acc.name), email: em.value.toLowerCase() });
      location.href = safeBack(params.get('volver')) || 'perfil.html';
    });
    $('#demo').addEventListener('click', () => {
      auth.login({ name: 'Samuel D Luq', user: 'samluq', initials: 'SL', email: 'demo@saveslot' });
      location.href = safeBack(params.get('volver')) || 'perfil.html';
    });
  };

  // ---------- Registro ----------
  P.registro = function () {
    if (auth.user()) { location.replace('perfil.html'); return; }
    $('#to-login').href = 'login.html' + location.search;
    $$('[data-oauth]').forEach((b) => b.addEventListener('click', () => API.fail('funcion', 'Registro con ' + b.dataset.oauth)));
    const pw = $('#pw');
    pw.addEventListener('input', () => {
      const v = pw.value; let s = 0;
      if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      $$('#strength i').forEach((i, k) => { i.style.background = k < s ? (s >= 3 ? 'var(--good)' : '#E0A23B') : 'var(--line)'; });
      $('#strength-text').textContent = ['Escribe al menos 8 caracteres.', 'Débil. Agrega mayúsculas y números.', 'Regular. Agrega un número o símbolo.', 'Buena. Agrega un símbolo para hacerla fuerte.', 'Fuerte.'][s];
    });
    $('#us').addEventListener('input', (e) => { const ok = /^[a-z0-9_.]{3,20}$/i.test(e.target.value); $('#us-msg').className = ok ? 'ok-text' : 'error-text'; $('#us-msg').textContent = e.target.value ? (ok ? 'Disponible' : 'Usa de 3 a 20 letras, números, punto o guion bajo.') : ''; });
    $('#signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nm = $('#nm'), em = $('#em'), us = $('#us');
      const ok = [
        setError(nm, $('#nm-err'), nm.value.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
        setError(em, $('#em-err'), emailOk(em.value) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com'),
        setError(us, $('#us-msg'), /^[a-z0-9_.]{3,20}$/i.test(us.value) ? '' : 'Usa de 3 a 20 letras, números, punto o guion bajo.'),
        setError(pw, $('#pw-err'), pw.value.length >= 8 ? '' : 'La contraseña necesita al menos 8 caracteres.'),
        setError($('#terms'), $('#terms-err'), $('#terms').checked ? '' : 'Debes aceptar los términos para crear la cuenta.')
      ].every(Boolean);
      if (!ok) return;
      const accounts = store.get('accounts', {});
      if (accounts[em.value.toLowerCase()]) { setError(em, $('#em-err'), 'Ya existe una cuenta con ese correo. Inicia sesión.'); return; }
      // Prototipo: la contraseña NO se guarda. Una versión real usaría un backend con hash.
      accounts[em.value.toLowerCase()] = { name: nm.value.trim(), user: us.value.trim() };
      store.set('accounts', accounts);
      auth.login({ name: nm.value.trim(), user: us.value.trim(), initials: initialsOf(nm.value), email: em.value.toLowerCase() });
      const pr = profile.get(); pr.since = new Date().toISOString().slice(0, 10); profile.save(pr);
      location.href = 'editar-perfil.html?nuevo=1';
    });
  };

  // ---------- Perfil ----------
  P.perfil = function () {
    const u = auth.user();
    if (!u) { location.replace('login.html?volver=perfil.html'); return; }
    const p = profile.get();
    const d = diary.all();
    const since = new Date(p.since + 'T12:00:00');
    $('#avatar').textContent = u.initials;
    $('#name').textContent = u.name;
    $('#handle').textContent = '@' + u.user;
    $('#level').textContent = 'NIVEL ' + p.level;
    $('#bio').textContent = p.bio || 'Todavía no escribiste nada sobre ti.';
    $('#since').textContent = since.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#xp-bar').style.width = Math.round(p.xp / 1500 * 100) + '%';
    $('#xp-text').textContent = fmt(p.xp) + ' / 1.500 XP · nivel ' + (p.level + 1) + ' a ' + fmt(1500 - p.xp) + ' XP';

    const playing = p.playing ? gameById(p.playing) : null;
    $('#activity').innerHTML = playing
      ? '<a class="row card-link" style="flex-wrap:nowrap;background:var(--bg);border-radius:10px;padding:12px;color:var(--fg)" href="juego.html?id=' + playing.id + '">' + cover(playing, { small: true }) + '<span style="line-height:1.35"><span class="xs" style="color:var(--good);font-weight:700">● Jugando ahora</span><br><b>' + esc(playing.short) + '</b><br><span class="xs muted">Dato de Steam (demo)</span></span></a>'
      : '<span class="muted small">No está jugando nada en este momento.</span>';
    $('#status-dot').hidden = !playing;

    $('#connections').innerHTML = Object.keys(p.accounts).map((k) => '<div class="row between" style="background:var(--bg);border-radius:8px;padding:10px 12px"><span><b>' + k + '</b> <span class="muted small">' + esc(p.accounts[k] || '') + '</span></span>' +
      (p.accounts[k] ? '<span class="ok-text xs">Verificada</span>' : '<a class="xs link-strong" href="editar-perfil.html#cuentas">Vincular</a>') + '</div>').join('');

    const thisYear = d.filter((x) => x.date.slice(0, 4) === String(new Date().getFullYear()));
    const reviews = store.get('reviews', []).filter((r) => r.user === u.user);
    $('#stats').innerHTML = [['Juegos', d.length, 'diario.html'], ['Este año', thisYear.length, 'diario.html'], ['Reseñas', reviews.length + d.filter((x) => x.review).length, 'diario.html'], ['Logros', '1.912', 'logros.html'], ['Lista de deseos', p.wishlist.length, '#deseos']]
      .map((s) => '<a href="' + s[2] + '" class="stat card-link" style="text-align:center;border-radius:0;border:0;border-right:1px solid var(--line)"><b>' + s[1] + '</b><span>' + s[0] + '</span></a>').join('');

    $('#favorites').innerHTML = p.favorites.slice(0, 4).map((id) => { const g = gameById(id); return g ? '<a class="game-tile" href="juego.html?id=' + g.id + '">' + cover(g) + '</a>' : ''; }).join('') +
      Array.from({ length: Math.max(0, 4 - p.favorites.length) }, () => '<a class="empty" href="editar-perfil.html#favoritos" style="aspect-ratio:3/4">+ Elegir favorito</a>').join('');
    $('#fav-count').textContent = Math.min(4, p.favorites.length) + ' de 4';

    $('#recent').innerHTML = d.slice(0, 6).map((x) => { const g = gameById(x.game); if (!g) return ''; return '<a class="game-tile" href="juego.html?id=' + g.id + '">' + cover(g, { noTitle: true }) + '<span class="xs" style="font-weight:700;color:' + (x.state === 'Abandonado' ? 'var(--bad)' : 'var(--good)') + '">' + (x.state === 'Abandonado' ? 'Abandonado' : x.score + '/10') + (x.like ? ' <span style="color:var(--bad)">♥</span>' : '') + '</span></a>'; }).join('') || '<div class="empty">Aún no registras juegos. <a class="link-strong" href="buscar.html">Busca uno</a></div>';

    // Géneros más jugados: horas del diario por género
    const hours = {};
    d.forEach((x) => { const g = gameById(x.game); if (!g) return; g.genres.forEach((gen) => { hours[gen] = (hours[gen] || 0) + (x.hours || 0) / g.genres.length; }); });
    const total = Object.values(hours).reduce((a, b) => a + b, 0) || 1;
    const top = Object.entries(hours).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top.length ? top[0][1] : 1;
    $('#genres').innerHTML = top.map(([gen, h]) => '<span>' + esc(gen) + '</span><span class="meter" style="height:10px"><i style="width:' + Math.round(h / max * 100) + '%"></i></span><b style="text-align:right">' + Math.round(h / total * 100) + '%</b>').join('') || '<span class="muted small">Registra juegos para ver tus géneros.</span>';
    $('#fav-genres').textContent = 'Favoritos: ' + p.genres.join(', ');

    // Distribución de calificaciones (1–10)
    const counts = Array(10).fill(0); d.forEach((x) => { if (x.score) counts[x.score - 1]++; });
    const cmax = Math.max(1, ...counts); const n = d.filter((x) => x.score).length;
    const avg = n ? (d.reduce((a, x) => a + (x.score || 0), 0) / n) : 0;
    $('#hist').innerHTML = counts.map((c, i) => '<span title="' + (i + 1) + '/10: ' + c + ' juegos" style="height:' + Math.round(c / cmax * 80) + 'px;background:var(--good);border-radius:3px 3px 0 0"></span>').join('');
    $('#hist').setAttribute('aria-label', 'Distribución de tus calificaciones. Promedio ' + avg.toFixed(1));
    $('#avg').textContent = avg.toFixed(1).replace('.', ',') + ' · ' + n + ' juegos';

    $('#wishlist').innerHTML = p.wishlist.map((id) => { const g = gameById(id); return g ? '<div class="card" style="flex-direction:row;align-items:center;gap:12px">' + cover(g, { small: true }) + '<a class="grow" style="color:var(--fg)" href="juego.html?id=' + g.id + '"><b>' + esc(g.short) + '</b><br><span class="xs muted">' + esc(g.platforms.join(', ')) + '</span></a><button class="btn btn-ghost btn-sm" data-rm="' + g.id + '" aria-label="Quitar ' + esc(g.short) + ' de la lista">Quitar</button></div>' : ''; }).join('') || '<div class="empty">Tu lista de deseos está vacía. Agrega juegos desde su página.</div>';
    $('#wishlist').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (!b) return; const pr = profile.get(); pr.wishlist = pr.wishlist.filter((x) => x !== b.dataset.rm); profile.save(pr); b.closest('.card').remove(); toast('Quitado de tu lista de deseos'); });

    const joined = store.get('joined', []);
    $('#my-events').innerHTML = joined.length ? joined.map((id) => { const ev = DATA.events.find((x) => x.id === id); return ev ? '<a class="row between card card-link" style="flex-direction:row" href="evento.html?id=' + ev.id + '"><b>' + esc(ev.title) + '</b><span class="muted small">' + esc(ev.when) + '</span></a>' : ''; }).join('') : '<span class="muted small">No estás inscrito en eventos. <a class="link-strong" href="eventos.html">Ver eventos</a></span>';
    $('#share').addEventListener('click', () => { const url = location.href.split('?')[0]; if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Enlace del perfil copiado'), () => toast(url)); else toast(url); });
  };

  // ---------- Editar perfil ----------
  P.editar = function () {
    const u = auth.user();
    if (!u) { location.replace('login.html?volver=editar-perfil.html'); return; }
    let p = profile.get();
    if (params.get('nuevo')) $('#welcome').hidden = false;
    $('#nm').value = u.name; $('#us').value = u.user; $('#bio').value = p.bio || '';
    $('#avatar').textContent = u.initials;

    function renderFavs() {
      $('#favs').innerHTML = p.favorites.map((id) => { const g = gameById(id); return '<div style="position:relative">' + cover(g) + '<button type="button" class="btn btn-secondary btn-sm" data-unfav="' + id + '" aria-label="Quitar ' + esc(g.short) + '" style="position:absolute;top:6px;right:6px;min-height:36px;width:36px;padding:0;border-radius:50%;background:rgba(0,0,0,.65)">✕</button></div>'; }).join('') +
        Array.from({ length: 4 - p.favorites.length }, () => '<div class="empty" style="aspect-ratio:3/4">Espacio libre</div>').join('');
      $('#fav-hint').textContent = p.favorites.length >= 4 ? 'Ya tienes 4 favoritos. Quita uno para elegir otro.' : 'Puedes elegir ' + (4 - p.favorites.length) + ' más (máximo 4).';
      $('#fav-add').disabled = p.favorites.length >= 4;
      $('#fav-select').disabled = p.favorites.length >= 4;
      $('#fav-select').innerHTML = '<option value="">Elige un juego</option>' + DATA.games.filter((g) => !p.favorites.includes(g.id)).map((g) => '<option value="' + g.id + '">' + esc(g.short) + '</option>').join('');
    }
    $('#favs').addEventListener('click', (e) => { const b = e.target.closest('[data-unfav]'); if (!b) return; p.favorites = p.favorites.filter((x) => x !== b.dataset.unfav); renderFavs(); });
    $('#fav-add').addEventListener('click', () => { const v = $('#fav-select').value; if (!v) { toast('Elige un juego de la lista'); return; } if (p.favorites.length >= 4) return; p.favorites.push(v); renderFavs(); });
    renderFavs();

    const genres = Array.from(new Set(DATA.games.flatMap((g) => g.genres))).sort();
    $('#genre-chips').innerHTML = genres.map((g) => '<button type="button" class="chip accent" data-genre="' + esc(g) + '" aria-pressed="' + p.genres.includes(g) + '">' + esc(g) + '</button>').join('');
    $('#genre-chips').addEventListener('click', (e) => { const b = e.target.closest('[data-genre]'); if (!b) return; const g = b.dataset.genre; p.genres = p.genres.includes(g) ? p.genres.filter((x) => x !== g) : p.genres.concat(g); b.setAttribute('aria-pressed', p.genres.includes(g)); });

    $('#playing').innerHTML = '<option value="">Nada por ahora</option>' + DATA.games.map((g) => '<option value="' + g.id + '"' + (p.playing === g.id ? ' selected' : '') + '>' + esc(g.short) + '</option>').join('');

    const NOTES = { Steam: 'Steam OpenID', Xbox: 'OpenXBL (servicio de terceros)', PlayStation: 'Sin API pública', Nintendo: 'Sin API pública' };
    function renderAccounts() {
      $('#accounts').innerHTML = Object.keys(p.accounts).map((k) => '<div class="row" style="background:var(--surface-2);border-radius:10px;padding:14px;' + (p.accounts[k] ? '' : 'border:1px dashed var(--line)') + '"><span class="grow"><b>' + k + '</b><br><span class="xs muted">' + NOTES[k] + '</span></span>' +
        (p.accounts[k] ? '<span class="ok-text small">Vinculada · ' + esc(p.accounts[k]) + '</span><button type="button" class="btn btn-secondary btn-sm" data-unlink="' + k + '">Desvincular</button>'
                       : '<button type="button" class="btn btn-primary btn-sm" data-link="' + k + '">Vincular</button>') + '</div>').join('');
    }
    $('#accounts').addEventListener('click', async (e) => {
      const l = e.target.closest('[data-link]'), ul = e.target.closest('[data-unlink]');
      if (ul) { p.accounts[ul.dataset.unlink] = null; renderAccounts(); toast(ul.dataset.unlink + ' desvinculada'); return; }
      if (!l) return;
      l.disabled = true; l.textContent = 'Conectando…';
      try { await API.linkPlatform(l.dataset.link); p.accounts[l.dataset.link] = u.user + '_' + l.dataset.link.toLowerCase(); renderAccounts(); toast(l.dataset.link + ' vinculada (demo) · +100 XP'); profile.addXP(100); p.xp = profile.get().xp; p.level = profile.get().level; }
      catch (err) { /* api.js ya redirige a error.html */ }
    });
    renderAccounts();

    $('#edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nm = $('#nm');
      if (!setError(nm, $('#nm-err'), nm.value.trim().length >= 2 ? '' : 'Escribe tu nombre visible.')) return;
      p.bio = $('#bio').value.trim().slice(0, 190); p.playing = $('#playing').value || null;
      profile.save(p);
      auth.login(Object.assign({}, u, { name: nm.value.trim(), initials: initialsOf(nm.value) }));
      toast('Cambios guardados');
      setTimeout(() => { location.href = 'perfil.html'; }, 600);
    });
  };

  // ---------- Diario ----------
  P.diario = function () {
    if (!auth.user()) { location.replace('login.html?volver=diario.html'); return; }
    let state = 'Todos';
    const years = Array.from(new Set(diary.all().map((x) => x.date.slice(0, 4)))).sort().reverse();
    $('#yr').innerHTML = years.map((y) => '<option>' + y + '</option>').join('');
    const COL = { Terminado: 'var(--good)', Rejugado: 'var(--accent-text)', Abandonado: 'var(--bad)', 'En progreso': 'var(--muted)' };
    function render() {
      const y = $('#yr').value;
      const all = diary.all().filter((x) => x.date.slice(0, 4) === y);
      const list = all.filter((x) => state === 'Todos' || (state === 'Con reseña' ? x.review : x.state === state));
      const scored = all.filter((x) => x.score);
      $('#summary').innerHTML = [['Juegos registrados en ' + y, all.length], ['Horas jugadas', fmt(all.reduce((a, x) => a + (x.hours || 0), 0)) + ' h'], ['Terminados', all.filter((x) => x.state === 'Terminado').length], ['Calificación promedio', scored.length ? (scored.reduce((a, x) => a + x.score, 0) / scored.length).toFixed(1).replace('.', ',') : '—']]
        .map((s) => '<div class="stat"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>').join('');
      let prevMonth = '';
      $('#rows').innerHTML = list.map((x) => {
        const g = gameById(x.game); if (!g) return '';
        const m = MONTHS[Number(x.date.slice(5, 7)) - 1]; const show = m !== prevMonth; prevMonth = m;
        return '<tr><td style="width:90px">' + (show ? '<span style="display:inline-flex;flex-direction:column;align-items:center;background:var(--bg);border-radius:8px;padding:6px 10px;line-height:1.1"><b style="font-size:13px;letter-spacing:.06em">' + m + '</b><span class="xs muted">' + y + '</span></span>' : '') + '</td>' +
          '<td style="font-size:22px;font-weight:800;color:var(--muted);width:60px">' + x.date.slice(8, 10) + '</td>' +
          '<td><a class="row" style="flex-wrap:nowrap;color:var(--fg)" href="juego.html?id=' + g.id + '">' + cover(g, { small: true }) + '<span style="line-height:1.3"><b>' + esc(g.short) + '</b><br><span class="xs muted">' + esc(g.platforms[0]) + '</span></span></a></td>' +
          '<td><span style="font-size:13px;font-weight:700;border:1px solid ' + COL[x.state] + ';color:' + COL[x.state] + ';border-radius:999px;padding:3px 10px;white-space:nowrap">' + esc(x.state) + '</span></td>' +
          '<td class="soft">' + (x.hours || 0) + ' h</td><td class="score">' + (x.score ? x.score + '/10' : '—') + '</td>' +
          '<td style="text-align:center;font-size:18px;color:' + (x.like ? 'var(--bad)' : 'var(--line)') + '" aria-label="' + (x.like ? 'Te gustó' : 'Sin me gusta') + '">♥</td>' +
          '<td style="text-align:center">' + (x.review ? '<a href="juego.html?id=' + g.id + '" class="btn btn-secondary btn-sm" aria-label="Leer reseña" style="min-height:36px;padding:6px 10px">Leer</a>' : '') + '</td></tr>';
      }).join('') || '<tr><td colspan="8"><div class="empty">No hay registros con este filtro.</div></td></tr>';
    }
    $$('[data-state]').forEach((b) => b.addEventListener('click', () => { state = b.dataset.state; $$('[data-state]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); }));
    $('#yr').addEventListener('change', render);
    render();
  };

  // ---------- MatchPlay ----------
  P.matchplay = function () {
    let chats = store.get('chats', [
      { id: 'c1', when: Date.now() - 2 * 3600e3, title: 'Juegos parecidos a NieR', msgs: [{ r: 'u', text: 'Terminé NieR: Automata y quiero algo parecido. Tengo unas 30 horas este mes.' }, { r: 'b', text: 'Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades.' }] },
      { id: 'c2', when: Date.now() - 3 * 86400e3, title: 'Orden de regiones en TOTK', msgs: [{ r: 'u', text: '¿En qué orden hago las regiones de Zelda: TOTK?' }, { r: 'b', text: 'La comunidad recomienda: Rito, Zora, Goron y Gerudo. Antes de Gerudo conviene tener al menos 8 corazones.' }] },
      { id: 'c3', when: Date.now() - 12 * 86400e3, title: 'Terror corto para el finde', msgs: [{ r: 'u', text: 'Un juego de terror corto para el fin de semana.' }, { r: 'b', text: 'Inside (≈3 h) o FNAF: Into the Pit (≈6 h).' }] }
    ]);
    let active = null, busy = false;
    const save = () => store.set('chats', chats);
    const u = auth.user();
    $('#greet').textContent = 'Hola' + (u ? ', ' + u.name.split(' ')[0] : '') + '. ¿En qué te ayudo hoy?';
    $('#mode').textContent = API.usingDemo || !window.SS_CONFIG.AI_ENDPOINT ? 'Modo demo: respuestas de ejemplo hasta conectar la IA.' : 'Conectado a la IA.';

    function group(t) { const d = (Date.now() - t) / 86400e3; return d < 1 ? 'Hoy' : (d < 7 ? 'Últimos 7 días' : 'Últimos 30 días'); }
    function renderList() {
      const q = $('#chat-search').value.toLowerCase();
      const groups = {};
      chats.filter((c) => !q || c.title.toLowerCase().includes(q)).sort((a, b) => b.when - a.when).forEach((c) => { (groups[group(c.when)] = groups[group(c.when)] || []).push(c); });
      $('#chat-list').innerHTML = ['Hoy', 'Últimos 7 días', 'Últimos 30 días'].filter((g) => groups[g]).map((g) => '<span class="xs muted" style="font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:10px 6px 2px">' + g + '</span>' +
        groups[g].map((c) => '<div class="row" style="flex-wrap:nowrap;gap:2px"><button class="chat-item" data-open="' + c.id + '" aria-current="' + (c.id === active) + '">' + esc(c.title) + '</button><button class="chat-del" data-del="' + c.id + '" aria-label="Borrar chat ' + esc(c.title) + '">✕</button></div>').join('')).join('') || '<span class="muted small" style="padding:8px">Sin chats.</span>';
    }
    function renderChat() {
      const c = chats.find((x) => x.id === active);
      $('#empty-state').hidden = !!c; $('#thread').hidden = !c;
      if (!c) return;
      $('#thread').innerHTML = c.msgs.map((m) => m.r === 'u'
        ? '<div class="msg-row user"><div class="bubble user">' + esc(m.text) + '</div></div>'
        : '<div class="msg-row"><span class="ai-badge">IA</span><div class="bubble bot' + (m.error ? ' err' : '') + '">' + esc(m.text) + (m.error ? ' <a href="error.html?tipo=api&servicio=MatchPlay%20(IA)&volver=matchplay.html">Ver detalles</a>' : '') + '</div></div>').join('') +
        (busy ? '<div class="msg-row"><span class="ai-badge">IA</span><div class="bubble bot muted">Buscando en reseñas y guías…</div></div>' : '');
      $('#thread').lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
    async function ask(text) {
      text = text.trim(); if (!text || busy) return;
      let c = chats.find((x) => x.id === active);
      if (!c) { c = { id: 'n' + Date.now(), when: Date.now(), title: text.length > 34 ? text.slice(0, 34) + '…' : text, msgs: [] }; chats.unshift(c); active = c.id; }
      c.msgs.push({ r: 'u', text: text }); c.when = Date.now(); busy = true; save(); renderList(); renderChat();
      $('#msg').value = '';
      try { const reply = await API.askAI(c.msgs); c.msgs.push({ r: 'b', text: reply }); }
      catch (e) { c.msgs.push({ r: 'b', text: 'No pude responder ahora: el servicio de IA no está disponible.', error: true }); }
      busy = false; save(); renderChat();
    }
    $('#trending').innerHTML = DATA.trending.map((t, i) => '<button class="card card-link" data-t="' + i + '" style="text-align:left;cursor:pointer"><span class="xs" style="font-weight:700;color:var(--accent-text);text-transform:uppercase">' + esc(t.tag) + '</span><b style="font-size:16px;line-height:1.3">' + esc(t.q) + '</b><span class="xs muted">' + esc(t.meta) + '</span></button>').join('');
    $('#trending').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) ask(DATA.trending[b.dataset.t].q); });
    $('#chat-list').addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]'), d = e.target.closest('[data-del]');
      if (o) { active = o.dataset.open; renderList(); renderChat(); }
      if (d) { chats = chats.filter((x) => x.id !== d.dataset.del); if (active === d.dataset.del) active = null; save(); renderList(); renderChat(); toast('Chat borrado'); }
    });
    $('#new-chat').addEventListener('click', () => { active = null; renderList(); renderChat(); $('#msg').focus(); });
    $('#chat-search').addEventListener('input', renderList);
    $('#composer').addEventListener('submit', (e) => { e.preventDefault(); ask($('#msg').value); });
    renderList(); renderChat();
    if (params.get('q')) ask(params.get('q'));
  };

  // ---------- Contacto ----------
  P.contacto = function () {
    $('#contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = [
        setError($('#n'), $('#n-err'), $('#n').value.trim() ? '' : 'Escribe tu nombre.'),
        setError($('#e'), $('#e-err'), emailOk($('#e').value) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com'),
        setError($('#m'), $('#m-err'), $('#m').value.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).')
      ].every(Boolean);
      if (!ok) return;
      const box = store.get('outbox', []); box.push({ name: $('#n').value, email: $('#e').value, topic: $('#t').value, msg: $('#m').value, at: new Date().toISOString() }); store.set('outbox', box);
      e.target.reset();
      modal({ icon: 'check', title: 'Mensaje guardado', text: 'El prototipo todavía no tiene servidor de correo, así que tu mensaje quedó guardado en este navegador. Si es urgente, escríbenos al correo de contacto.', actions: [{ label: 'Volver al inicio', href: 'index.html', primary: true }, { label: 'Cerrar' }] });
    });
  };

  // ---------- Página de error (APIs y limitantes) ----------
  P.error = function () {
    const CFG = window.SS_CONFIG || {};
    const tipo = params.get('tipo') || 'api';
    const svc = (params.get('servicio') || '').slice(0, 60);
    const S = svc || 'Un servicio externo';
    const T = {
      api: { code: 'API-500', title: S + ' no está respondiendo', text: 'Intentamos traer la información pero el servicio externo no respondió como esperábamos. Suele ser algo temporal.', tips: ['Vuelve a intentarlo en unos segundos.', 'Si sigue fallando, revisa el estado de los servicios abajo.', 'Mientras tanto puedes usar la búsqueda con los datos guardados.'], retry: true },
      limite: { code: 'API-429', title: 'Llegamos al límite de consultas', text: 'Las APIs gratuitas que usa SaveSlot tienen un cupo de consultas por minuto, hora o día. ' + (svc ? svc + ' nos pidió esperar' : 'Nos pidieron esperar') + ' antes de seguir.', tips: ['Espera un momento: el botón “Reintentar” se activa solo.', 'Las páginas que ya visitaste se cargan más rápido.', 'Si pasa seguido, avísanos desde Contáctanos.'], retry: true, wait: 60 },
      tiempo: { code: 'API-408', title: 'La respuesta tardó demasiado', text: S + ' tardó más de ' + Math.round((CFG.TIMEOUT_MS || 8000) / 1000) + ' segundos en responder, así que dejamos de esperar.', tips: ['Revisa tu conexión.', 'Vuelve a intentarlo.'], retry: true },
      credenciales: { code: 'API-401', title: 'No pudimos conectarnos con ' + S, text: 'La clave de acceso de SaveSlot para este servicio no es válida o venció (por ejemplo, la clave de desarrollo de Riot expira cada 24 horas).', tips: ['No es un problema de tu cuenta.', 'El equipo debe renovar la clave del servicio.'], retry: false },
      mantenimiento: { code: 'API-503', title: S + ' está en mantenimiento', text: 'El servicio avisó que está en mantenimiento. Volverá a funcionar cuando termine.', tips: ['Intenta de nuevo más tarde.'], retry: true },
      'sin-conexion': { code: 'NET-0', title: 'No hay conexión a internet', text: 'Tu dispositivo está sin conexión, así que no podemos cargar información nueva.', tips: ['Revisa el wifi o los datos móviles.', 'Cuando vuelva la conexión, pulsa “Reintentar”.'], retry: true },
      plataforma: { code: 'LIM-PLAT', title: svc ? svc + ' todavía no se puede vincular' : 'Esta plataforma no se puede vincular', text: (svc || 'Esta plataforma') + ' no ofrece una API pública para que webs como SaveSlot lean tus juegos, logros o actividad. No vamos a usar métodos no oficiales que pidan tus credenciales.', tips: ['Registra tus juegos a mano en tu diario.', 'Vincula Steam o Xbox, que sí están disponibles.', 'Te avisaremos si la plataforma abre su API.'], retry: false, cta: ['Registrar en mi diario', 'buscar.html'] },
      pagos: { code: 'LIM-PAY', title: 'Los pagos aún no están disponibles', text: 'SaveSlot es un prototipo académico y no tiene una pasarela de pagos conectada. Ningún cobro se realizó.', tips: ['Usa la opción gratis con XP cuando el evento la tenga.', 'Revisa los eventos gratuitos en la pestaña “Gratis”.'], retry: false, cta: ['Ver eventos gratis', 'eventos.html'] },
      funcion: { code: 'LIM-FEAT', title: S + ' aún no está disponible', text: 'Esta función depende de una API que el equipo todavía está solicitando. Por ahora no la puedes usar.', tips: ['Usa la alternativa disponible (correo y contraseña, o subir texto).', 'Revisa el estado de los servicios abajo.'], retry: false },
      demo: { code: 'DEMO', title: 'Estás viendo el prototipo de SaveSlot', text: 'Mientras conectamos las APIs (catálogo de juegos, cuentas e IA), la web usa datos de ejemplo y guarda tu actividad solo en este navegador.', tips: ['Puedes crear una cuenta, reseñar, llenar tu diario y chatear con MatchPlay en modo demo.', 'Borrar los datos del navegador borra tu actividad.'], retry: false, cta: ['Explorar juegos', 'buscar.html'] },
      estado: { code: 'STATUS', title: 'Estado de los servicios', text: 'Qué partes de SaveSlot están conectadas a servicios reales y cuáles funcionan en modo demo.', tips: [], retry: false }
    };
    const t = T[tipo] || T.api;
    document.title = t.title + ' · SaveSlot';
    $('#code').textContent = 'Código ' + t.code;
    $('#title').textContent = t.title;
    $('#text').textContent = t.text;
    $('#tips').innerHTML = t.tips.map((x) => '<li>' + esc(x) + '</li>').join('');
    $('#tips-wrap').hidden = !t.tips.length;
    const detalle = params.get('detalle');
    if (detalle) { $('#detail').hidden = false; $('#detail').textContent = 'Detalle técnico: ' + detalle; }
    const back = safeBack(params.get('volver'));
    const retry = $('#retry');
    if (t.retry && back) {
      retry.hidden = false; retry.href = back.replace(/([?&])simular=[^&]*&?/, '$1').replace(/[?&]$/, '');
      if (t.wait) {
        let s = t.wait; retry.setAttribute('aria-disabled', 'true'); retry.style.pointerEvents = 'none'; retry.style.opacity = '.5';
        const tick = () => { retry.textContent = 'Reintentar en ' + s + ' s'; if (s-- <= 0) { retry.textContent = 'Reintentar'; retry.removeAttribute('aria-disabled'); retry.style.pointerEvents = ''; retry.style.opacity = ''; return; } setTimeout(tick, 1000); };
        tick();
      }
    }
    if (t.cta) { const c = $('#cta'); c.hidden = false; c.textContent = t.cta[0]; c.href = t.cta[1]; }
    const st = (label, kind) => '<span style="font-size:13px;font-weight:700;border-radius:999px;padding:3px 10px;white-space:nowrap;border:1px solid ' + ({ ok: 'var(--good)', demo: 'var(--ai)', pend: '#E0A23B', no: 'var(--bad)' }[kind]) + ';color:' + ({ ok: 'var(--good)', demo: 'var(--ai)', pend: '#E0A23B', no: 'var(--bad)' }[kind]) + '">' + label + '</span>';
    const rows = [
      ['Catálogo de juegos', 'RAWG / IGDB', CFG.RAWG_KEY ? st('Conectado', 'ok') : st('Modo demo', 'demo')],
      ['MatchPlay (IA)', 'Claude / Gemini', CFG.AI_ENDPOINT ? st('Conectado', 'ok') : st('Modo demo', 'demo')],
      ['Cuentas: Steam', 'Steam Web API + OpenID', st('Pendiente de clave', 'pend')],
      ['Cuentas: Xbox', 'OpenXBL (tercero)', st('Pendiente de clave', 'pend')],
      ['Cuentas: PlayStation', '—', st('Sin API pública', 'no')],
      ['Cuentas: Nintendo', '—', st('Sin API pública', 'no')],
      ['Inicio de sesión con Google / Discord', 'OAuth2', st('Pendiente', 'pend')],
      ['Clips y transmisiones', 'Twitch API', st('Pendiente de clave', 'pend')],
      ['Pagos de eventos', 'Pasarela de pagos', st('No disponible', 'no')],
      ['Cuentas y actividad del usuario', 'Navegador (local)', st('Modo demo', 'demo')]
    ];
    $('#status').innerHTML = rows.map((r) => '<tr' + (svc && (r[0].includes(svc) || r[1].includes(svc)) ? ' style="background:#202834"' : '') + '><td><b>' + esc(r[0]) + '</b></td><td class="muted">' + esc(r[1]) + '</td><td>' + r[2] + '</td></tr>').join('');
  };
})(window.SS_PAGES);

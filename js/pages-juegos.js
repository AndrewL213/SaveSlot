/* SaveSlot — páginas de juegos, búsqueda, eventos y reseñas. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, toast, modal, cover, gameTile, skulls, gameById, fmt, DATA } = window.SS;
  const API = window.SS_API;

  function skeletonTiles(n) { return Array.from({ length: n }, () => '<div class="skeleton" style="aspect-ratio:3/4"></div>').join(''); }
  function userReviews() { return store.get('reviews', []); }

  function reviewCard(r, opts) {
    const g = gameById(r.game);
    const head = '<div class="who"><span class="avatar">' + esc(r.initials) + '</span><div style="line-height:1.3"><b>' + esc(r.user) + '</b><br><span class="muted xs">' +
      (opts && opts.showGame && g ? 'sobre ' + esc(g.short) + ' · ' : '') + esc(r.hours) + ' h jugadas</span></div><span class="score" style="margin-left:auto;font-size:18px">' + esc(r.score) + '/10</span></div>';
    const body = r.spoiler
      ? '<div class="spoiler"><span class="muted">Esta reseña tiene spoilers.</span><button class="btn btn-secondary btn-sm" data-reveal>Mostrar de todas formas</button></div><p hidden>' + esc(r.text) + '</p>'
      : '<p>' + esc(r.text) + '</p>';
    return '<article class="review">' + head + body + '<div class="row small muted"><button class="btn btn-secondary btn-sm" data-useful>Útil · <span>' + fmt(r.useful || 0) + '</span></button><span>Dificultad que votó: ' + esc(r.diff) + '/10</span></div></article>';
  }
  function bindReviewActions(root) {
    $$('[data-reveal]', root).forEach((b) => b.addEventListener('click', () => { const box = b.closest('.spoiler'); box.nextElementSibling.hidden = false; box.remove(); }));
    $$('[data-useful]', root).forEach((b) => b.addEventListener('click', () => {
      if (!auth.require('votar reseñas')) return;
      if (b.dataset.done) return; b.dataset.done = '1'; const s = $('span', b); s.textContent = fmt(Number(s.textContent.replace(/\D/g, '')) + 1); b.style.borderColor = '#3DA9F5'; toast('Gracias por tu voto');
    }));
  }

  // ---------- Inicio ----------
  P.inicio = async function () {
    $('#top-games').innerHTML = skeletonTiles(6);
    const games = await API.searchGames({});
    const top = games.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
    $('#top-games').innerHTML = top.map((g, i) => gameTile(g, i + 1)).join('');
    const all = DATA.reviews.filter((r) => !r.spoiler).concat(userReviews());
    $('#reviews').innerHTML = all.slice(0, 3).map((r) => reviewCard(r, { showGame: true })).join('');
    bindReviewActions($('#reviews'));
    const feat = DATA.events.find((e) => e.featured);
    const raffle = DATA.events.find((e) => e.type === 'Sorteo');
    $('#events-home').innerHTML = eventFeature(feat) + eventCard(raffle);
    // Popup del evento del mes, una vez por sesión del navegador
    let seen = false; try { seen = sessionStorage.getItem('ss.popup') === '1'; sessionStorage.setItem('ss.popup', '1'); } catch (e) { seen = true; }
    if (!seen) setTimeout(() => modal({
      icon: 'trophy', title: feat.title, text: 'Evento del mes. Arma tu equipo y compite. ' + feat.when + ' · ' + feat.slots + ' de ' + feat.max + ' cupos ocupados.',
      actions: [{ label: 'Ver evento', href: 'evento.html?id=' + feat.id, primary: true }, { label: 'Ahora no' }]
    }), 900);
  };

  // ---------- Eventos ----------
  function eventFeature(e) {
    return '<a class="card card-link" href="evento.html?id=' + e.id + '" style="flex:2 1 520px;background:#1A3157;border-color:#3DA9F5;padding:28px;gap:12px">' +
      '<span class="row" style="gap:8px"><span class="badge badge-accent">' + e.type.toUpperCase() + '</span><span class="badge badge-outline" style="color:#E6EBF1;border-color:#9AD4FB">EVENTO DEL MES</span></span>' +
      '<b style="font-size:30px;line-height:1.1">' + esc(e.title) + '</b><span class="soft">' + esc(e.when) + ' · Organiza: ' + esc(e.org) + '</span>' +
      '<span class="row"><span class="btn btn-primary">Ver e inscribirme</span><span class="soft small">' + e.slots + ' de ' + e.max + ' cupos ocupados</span></span></a>';
  }
  function eventCard(e) {
    const g = e.game ? gameById(e.game) : null;
    const badge = e.type === 'Torneo' ? 'badge-accent' : 'badge-good';
    const slots = e.max ? e.slots + ' / ' + e.max : (e.slots ? fmt(e.slots) + ' participantes' : 'Sin límite');
    return '<a class="card card-link" href="evento.html?id=' + e.id + '" style="padding:0;overflow:hidden;gap:0;flex:1 1 300px">' +
      '<div style="height:110px;padding:12px;background:' + e.color + '"><span class="badge ' + badge + '">' + e.type.toUpperCase() + '</span></div>' +
      '<div style="padding:18px;display:flex;flex-direction:column;gap:6px;flex:1"><span class="muted xs">' + esc(g ? g.short : 'Cualquier tienda') + '</span><b style="font-size:19px;line-height:1.2">' + esc(e.title) + '</b>' +
      '<span class="soft small">' + esc(e.when) + '</span><span class="muted xs">' + esc(e.org) + '</span>' +
      '<div class="row between small" style="margin-top:auto;padding-top:10px;border-top:1px solid var(--line)"><span>' + slots + '</span><b style="color:var(--accent-text)">' + esc(e.cost) + '</b></div></div></a>';
  }

  P.eventos = function () {
    const feat = DATA.events.find((e) => e.featured);
    $('#featured').outerHTML = eventFeature(feat).replace('flex:2 1 520px;', '');
    let tab = 'Todos', org = 'Todos';
    function render() {
      const list = DATA.events.filter((e) => (tab === 'Todos' || (tab === 'Torneos' && e.type === 'Torneo') || (tab === 'Sorteos' && e.type === 'Sorteo') || (tab === 'Gratis' && e.free)) && (org === 'Todos' || e.orgType === org));
      $('#event-grid').innerHTML = list.length ? list.map(eventCard).join('') : '<div class="empty">No hay eventos con estos filtros. <button class="btn btn-secondary btn-sm" id="clear">Ver todos</button></div>';
      const c = $('#clear'); if (c) c.addEventListener('click', () => { tab = 'Todos'; org = 'Todos'; $('#org').value = 'Todos'; syncTabs(); render(); });
    }
    function syncTabs() { $$('#event-tabs .chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tab === tab)); }
    $$('#event-tabs .chip').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; syncTabs(); render(); }));
    $('#org').addEventListener('change', (e) => { org = e.target.value; render(); });
    syncTabs(); render();
  };

  P.evento = function () {
    const e = DATA.events.find((x) => x.id === params.get('id'));
    if (!e) { location.replace('404.html'); return; }
    document.title = e.title + ' · SaveSlot';
    const isT = e.type === 'Torneo';
    const g = e.game ? gameById(e.game) : null;
    const p = profile.get();
    const joined = store.get('joined', []);
    $('#band').style.setProperty('--band', isT ? '#1A3157' : '#1D3A2B');
    $('#crumb').textContent = e.type === 'Torneo' ? 'Torneos' : 'Sorteos';
    $('#crumb-title').textContent = e.title;
    $('#ev-badges').innerHTML = '<span class="badge ' + (isT ? 'badge-accent' : 'badge-good') + '">' + e.type.toUpperCase() + '</span>' + (g ? '<span class="badge badge-outline" style="color:#E6EBF1">' + esc(g.short.toUpperCase()) + '</span>' : '') + '<span class="badge badge-outline" style="color:#E6EBF1">ORGANIZA ' + esc(e.org.toUpperCase()) + '</span>';
    $('#ev-title').textContent = e.title;
    $('#ev-facts').innerHTML = [['Fecha', e.when], [isT ? 'Cupos' : 'Participantes', e.max ? e.slots + ' / ' + e.max : (e.slots ? fmt(e.slots) : 'Sin límite')], ['Costo', e.cost], ['Premio', isT ? '[PREMIO]' : 'El indicado']].map((f) => '<div class="glass"><span class="xs soft">' + f[0] + '</span><br><b>' + esc(f[1]) + '</b></div>').join('');
    $('#about').innerHTML = isT
      ? '<h2 style="font-size:24px">Sobre el torneo</h2><p class="soft">Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.</p>' +
        '<h2 style="font-size:24px">Cronograma</h2><ol class="stack" style="margin:0;padding-left:20px;gap:8px"><li><b>Inscripciones</b> <span class="muted">hasta el día anterior, 11:59 p. m.</span></li><li><b>Check-in</b> <span class="muted">30 minutos antes</span></li><li><b>Llaves</b> <span class="muted">a la hora del evento</span></li><li><b>Final transmitida</b> <span class="muted">en el canal del organizador</span></li></ol>'
      : '<h2 style="font-size:24px">Sobre el sorteo</h2><p class="soft">El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.</p>';
    $('#rules').innerHTML = '<li>' + (isT ? 'Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.' : 'Una participación gratis y una de pago por persona.') + '</li><li>' + (isT ? 'Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.' : 'Sin suscripción ni cargos recurrentes.') + '</li><li>El organizador puede cambiar la hora avisando con 24 h.</li>';

    const free = e.free;
    const paidOnly = !free;
    $('#join-form').innerHTML =
      '<h2 style="font-size:22px">' + (isT ? 'Inscribe a tu equipo' : 'Participa') + '</h2>' +
      (joined.includes(e.id) ? '<div class="card" style="border-color:var(--good)"><b class="ok-text">Ya estás inscrito en este evento.</b><a class="link-strong" href="perfil.html">Ver en mi perfil</a></div>' : '') +
      (isT ? '<div class="field"><label for="team">Nombre del equipo</label><input class="input" id="team" required maxlength="40" placeholder="Ej. Los Salvados"><span class="error-text" id="team-err" hidden>Escribe el nombre de tu equipo.</span></div>' +
             '<div class="field"><label for="mate">Compañero de equipo</label><input class="input" id="mate" maxlength="40" placeholder="Usuario de SaveSlot"><span class="hint">Le enviaremos una invitación para confirmar.</span></div>' : '') +
      '<fieldset style="border:0;margin:0;padding:0" class="stack"><legend class="label" style="margin-bottom:10px">Cómo participar</legend>' +
      (free ? '<label class="radio-card"><input type="radio" name="modo" value="xp" checked><span class="grow"><b>Gratis' + (isT ? '' : ' con 300 XP') + '</b><br><span class="small muted">' + (isT ? 'Sin costo de inscripción.' : 'Tienes ' + fmt(p.xp) + ' XP.') + '</span></span></label>' : '') +
      (isT && free ? '' : '<label class="radio-card"><input type="radio" name="modo" value="pago"' + (paidOnly ? ' checked' : '') + '><span class="grow"><b>' + (isT ? 'Pagar inscripción' : 'Participación de pago') + '</b><br><span class="small muted">Pago único. Sin cargos recurrentes.</span></span><b>[VALOR]</b></label>') +
      '</fieldset>' +
      '<label class="check"><input type="checkbox" id="terms"><span>Acepto el reglamento y la política de reembolsos.</span></label><span class="error-text" id="terms-err" hidden>Debes aceptar el reglamento para continuar.</span>' +
      '<button class="btn btn-primary btn-block" type="submit">' + (isT ? 'Inscribirme' : 'Confirmar participación') + '</button>';

    $('#join-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!auth.require('inscribirte en eventos')) return;
      let ok = true;
      const team = $('#team');
      if (team) { const bad = !team.value.trim(); team.setAttribute('aria-invalid', bad); $('#team-err').hidden = !bad; if (bad) ok = false; }
      const terms = $('#terms'); $('#terms-err').hidden = terms.checked; if (!terms.checked) ok = false;
      if (!ok) return;
      const modo = ($('input[name="modo"]:checked') || {}).value;
      if (modo === 'pago') { API.fail('pagos', 'Pasarela de pagos'); return; }
      if (!isT) {
        const pr = profile.get(); if (pr.xp < 300) { toast('No tienes XP suficiente. Completa misiones para ganar más.'); return; }
        pr.xp -= 300; profile.save(pr);
      } else { profile.addXP(100); }
      const j = store.get('joined', []); if (!j.includes(e.id)) j.push(e.id); store.set('joined', j);
      modal({ icon: 'check', title: isT ? '¡Estás inscrito!' : '¡Ya participas!', text: isT ? 'Tu equipo tiene cupo. Recibirás el recordatorio del check-in.' : 'Te avisaremos por correo si ganas.', actions: [{ label: 'Ver en mi perfil', href: 'perfil.html', primary: true }, { label: 'Seguir explorando', href: 'eventos.html' }] });
    });
  };

  // ---------- Búsqueda ----------
  P.buscar = async function () {
    const form = $('#filters');
    const q = $('#sq'); q.value = params.get('q') || '';
    const gsel = params.get('genero'); if (gsel) { const c = $('input[name="genre"][value="' + CSS.escape(gsel) + '"]'); if (c) c.checked = true; }
    let type = 'Todos', length = '';
    $$('[data-type]').forEach((b) => b.addEventListener('click', () => { type = b.dataset.type; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x === b)); run(); }));
    $$('[data-length]').forEach((b) => b.addEventListener('click', () => { length = length === b.dataset.length ? '' : b.dataset.length; $$('[data-length]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.length === length)); run(); }));
    form.addEventListener('change', run);
    $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); history.replaceState(null, '', '?q=' + encodeURIComponent(q.value)); run(); });
    $('#clear-all').addEventListener('click', () => { form.reset(); q.value = ''; type = 'Todos'; length = ''; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.type === 'Todos')); $$('[data-length]').forEach((x) => x.setAttribute('aria-pressed', false)); run(); });
    async function run() {
      const f = {
        q: q.value.trim(), genres: $$('input[name="genre"]:checked').map((i) => i.value), platforms: $$('input[name="plat"]:checked').map((i) => i.value),
        type: type, length: length, from: Number($('#y1').value) || null, to: Number($('#y2').value) || null
      };
      $('#results').innerHTML = '<div class="skeleton" style="height:120px"></div><div class="skeleton" style="height:120px"></div>';
      const list = await API.searchGames(f);
      $('#count').textContent = list.length + (list.length === 1 ? ' juego' : ' juegos') + (f.q ? ' para “' + f.q + '”' : '');
      $('#results').innerHTML = list.length ? list.map(resultRow).join('')
        : '<div class="empty"><b style="color:var(--fg)">No encontramos juegos con esos filtros.</b><span>Revisa la ortografía o quita algún filtro. También puedes preguntarle a MatchPlay.</span><a class="btn btn-secondary btn-sm" href="matchplay.html?q=' + encodeURIComponent(f.q || 'Recomiéndame un juego') + '">Preguntar a MatchPlay</a></div>';
    }
    function resultRow(g) {
      return '<a class="card card-link" href="juego.html?id=' + encodeURIComponent(g.id) + '" style="flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap;padding:14px">' +
        '<span class="cover cover-sm" style="--c:' + g.color + ';width:64px;height:86px"></span>' +
        '<span class="grow" style="display:flex;flex-direction:column;gap:4px;flex:1 1 240px"><b style="font-size:19px">' + esc(g.name) + '</b><span class="muted small">' + esc(g.genres.join(', ')) + ' · ' + (g.year || '') + ' · ' + esc(g.platforms.join(', ')) + '</span>' + (g.type ? '<span><span class="badge badge-outline">' + esc(g.type) + '</span></span>' : '') + '</span>' +
        '<span style="display:grid;grid-template-columns:repeat(3,auto);gap:2px 24px;font-size:13px;color:var(--muted);text-align:right"><span>Nota</span><span>Historia</span><span>Dificultad</span><b class="score" style="font-size:16px">' + (g.rating ? String(g.rating).replace('.', ',') : '—') + '</b><b style="font-size:16px;color:var(--fg)">' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</b><b style="font-size:16px;color:var(--fg)">' + (g.difficulty ? g.difficulty + '/10' : '—') + '</b></span></a>';
    }
    run();
  };

  // ---------- Juego random ----------
  P.random = function () {
    const genres = Array.from(new Set(DATA.games.flatMap((g) => g.genres))).sort();
    let genre = params.get('genero') || 'Aventura', idx = 0;
    const box = $('#genres');
    box.innerHTML = genres.map((n) => '<button class="chip accent" data-g="' + esc(n) + '">' + esc(n) + '</button>').join('');
    function render() {
      $$('[data-g]', box).forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === genre));
      const pool = DATA.games.filter((g) => g.genres.includes(genre));
      const g = pool[idx % pool.length];
      $('#pick').innerHTML = cover(g, { style: 'width:220px;max-width:100%;flex:none' }) +
        '<div class="stack grow" style="flex:999 1 340px;gap:12px"><span class="eyebrow">Tu juego random de ' + esc(genre.toLowerCase()) + '</span><h2 style="font-size:34px">' + esc(g.name) + '</h2><p class="soft">' + esc(g.desc) + '</p>' +
        '<div class="row"><span class="badge badge-outline" style="font-size:14px">Historia: ' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</span><span class="badge badge-outline" style="font-size:14px">Dificultad: ' + g.difficulty + '/10</span><span class="badge badge-outline" style="font-size:14px">Nota: ' + String(g.rating).replace('.', ',') + '</span></div>' +
        '<div class="row"><a class="btn btn-primary" href="juego.html?id=' + g.id + '">Ver juego</a><button class="btn btn-secondary" id="reroll"' + (pool.length < 2 ? ' disabled title="Solo hay un juego de este género por ahora"' : '') + '>Dame otro</button></div></div>';
      const r = $('#reroll'); if (r) r.addEventListener('click', () => { idx++; render(); });
    }
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; genre = b.dataset.g; idx = Math.floor(Math.random() * 3); render(); });
    render();
  };

  // ---------- Página de juego ----------
  P.juego = async function () {
    const id = params.get('id') || 'zelda-totk';
    const g = await API.getGame(id);
    if (!g) { location.replace('404.html'); return; }
    document.title = g.short + ' · SaveSlot';
    const p = profile.get();
    $('#band').style.setProperty('--band', 'color-mix(in srgb,' + g.color + ' 55%, #12161D)');
    $('#crumb-genre').textContent = g.genres[0] || 'Juegos';
    $('#crumb-genre').href = 'buscar.html?genero=' + encodeURIComponent(g.genres[0] || '');
    $('#crumb-title').textContent = g.short;
    $('#g-cover').outerHTML = cover(g, { style: 'width:220px;max-width:100%;flex:none' });
    $('#g-eyebrow').textContent = g.genres.join(' · ') + (g.year ? ' · ' + g.year : '');
    $('#g-title').textContent = g.name;
    $('#g-plats').innerHTML = g.platforms.map((x) => '<span class="badge badge-outline" style="color:#E6EBF1;border-color:rgba(255,255,255,.3)">' + esc(x.toUpperCase()) + '</span>').join('') +
      (g.rating ? '<span style="margin-left:8px"><b class="score">' + String(g.rating).replace('.', ',') + ' ★</b> <span class="soft small">· ' + fmt(g.votes) + ' calificaciones</span></span>' : '');
    $('#write').href = 'resena.html?id=' + g.id;
    $('#ask').href = 'matchplay.html?q=' + encodeURIComponent('Dame consejos para ' + g.short);
    const wish = $('#wish');
    const inWish = () => profile.get().wishlist.includes(g.id);
    const syncWish = () => { wish.textContent = inWish() ? '✓ En tu lista de deseos' : '+ Lista de deseos'; };
    syncWish();
    wish.addEventListener('click', () => {
      if (!auth.require('guardar juegos en tu lista de deseos')) return;
      const pr = profile.get(); pr.wishlist = inWish() ? pr.wishlist.filter((x) => x !== g.id) : pr.wishlist.concat(g.id); profile.save(pr); syncWish(); toast(inWish() ? 'Añadido a tu lista de deseos' : 'Quitado de tu lista de deseos');
    });
    const mine = diary.all().filter((d) => d.game === g.id);
    $('#facts').innerHTML =
      '<div class="fact"><span class="k">Dificultad</span><span class="v">' + (g.difficulty || '—') + '<span class="muted" style="font-size:18px">/10</span></span>' + (g.difficulty ? skulls(g.difficulty) : '') + '<span class="xs muted">Votada por la comunidad</span></div>' +
      '<div class="fact"><span class="k">Historia principal</span><span class="v">' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</span><span class="xs muted">Promedio de jugadores</span></div>' +
      '<div class="fact"><span class="k">Completar 100%</span><span class="v">' + (g.hours100 ? g.hours100 + ' h' : '—') + '</span><span class="xs muted">Promedio de jugadores</span></div>' +
      '<div class="fact" style="border-color:var(--accent)"><span class="k" style="color:var(--accent-text)">Tu progreso</span>' + (auth.user() && mine.length ? '<span class="v">' + mine[0].hours + ' h</span><span class="xs muted">' + esc(mine[0].state) + ' · ' + mine[0].score + '/10</span>' : '<span class="soft small">Vincula tu cuenta o regístralo en tu diario.</span><a class="link-strong small" href="resena.html?id=' + g.id + '">Registrar juego</a>') + '</div>';

    // Pestañas
    const reviews = DATA.reviews.filter((r) => r.game === g.id).concat(userReviews().filter((r) => r.game === g.id));
    const guides = DATA.guides.filter((x) => x.game === g.id);
    const ach = DATA.achievements.filter((x) => x.game === g.id);
    const panels = {
      rev: () => reviews.length ? reviews.map((r) => reviewCard(r)).join('') : '<div class="empty"><b style="color:var(--fg)">Todavía no hay reseñas.</b><span>Sé la primera persona en reseñar este juego.</span><a class="btn btn-primary btn-sm" href="resena.html?id=' + g.id + '">Escribir reseña</a></div>',
      gui: () => guides.length ? guides.map((x) => '<div class="card"><div class="row between"><b>' + esc(x.title) + '</b><span class="muted small">' + x.mins + ' min</span></div><span class="ok-text">' + x.useful + '% la marcó como útil</span></div>').join('') : '<div class="empty">Aún no hay guías. <a class="link-strong" href="resena.html?id=' + g.id + '&tipo=guia">Escribir la primera</a></div>',
      cli: () => '<div class="empty"><b style="color:var(--fg)">Los clips llegarán con la API de Twitch.</b><span>Mientras tanto puedes subir el tuyo desde “Escribir reseña › Clip”.</span></div>',
      ach: () => ach.length ? ach.map((a) => '<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span class="avatar" style="border-radius:8px;width:44px;height:44px;background:' + (a.got ? 'var(--accent)' : 'var(--surface-2)') + ';color:' + (a.got ? 'var(--accent-ink)' : 'var(--muted)') + '">' + (a.got ? '✓' : '?') + '</span><span class="grow"><b>' + esc(a.name) + '</b><br><span class="small muted">' + esc(a.desc) + '</span></span><span class="small muted">' + String(a.pct).replace('.', ',') + '% lo tiene</span></div>').join('') : '<div class="empty">No hay logros registrados para este juego.</div>'
    };
    $('#tabs').innerHTML = [['rev', 'Reseñas', reviews.length], ['gui', 'Guías', guides.length], ['cli', 'Clips', 0], ['ach', 'Logros', g.achievements]].map((t, i) =>
      '<button role="tab" aria-selected="' + (i === 0) + '" data-tab="' + t[0] + '">' + t[1] + '<span class="count">' + fmt(t[2]) + '</span></button>').join('');
    function show(k) { $$('#tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === k)); $('#panel').innerHTML = panels[k](); bindReviewActions($('#panel')); }
    $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
    show('rev');

    $('#ficha').innerHTML = [['Desarrolla', g.dev || '—'], ['Lanzamiento', g.year || '—'], ['Género', g.genres.join(', ')], ['Tipo', g.type || '—'], ['Plataformas', g.platforms.join(', ')]].map((r) => '<dt class="muted">' + r[0] + '</dt><dd style="margin:0">' + esc(r[1]) + '</dd>').join('');
    const similar = DATA.games.filter((x) => x.id !== g.id && x.genres.some((y) => g.genres.includes(y))).slice(0, 3);
    $('#similar').innerHTML = similar.map((s) => '<a class="row" style="color:var(--fg);flex-wrap:nowrap" href="juego.html?id=' + s.id + '">' + cover(s, { small: true }) + '<span style="line-height:1.3"><b>' + esc(s.short) + '</b><br><span class="small muted">' + esc(s.genres.join(', ')) + '</span></span></a>').join('') || '<span class="muted small">Sin sugerencias por ahora.</span>';
  };

  // ---------- Escribir reseña / guía / clip ----------
  P.resena = function () {
    const g = gameById(params.get('id') || 'zelda-totk');
    if (!g) { location.replace('404.html'); return; }
    let kind = params.get('tipo') === 'guia' ? 'guia' : (params.get('tipo') === 'clip' ? 'clip' : 'resena');
    let score = 8, diff = g.difficulty || 5, like = false;
    $('#r-cover').outerHTML = '<span class="cover cover-sm" style="--c:' + g.color + ';width:64px;height:86px" aria-hidden="true"></span>';
    $('#r-title').textContent = g.name;
    $('#cancel').href = 'juego.html?id=' + g.id;
    $('#fecha').value = new Date().toISOString().slice(0, 10);
    const draftKey = 'draft.' + g.id;
    const draft = store.get(draftKey, null);
    if (draft) { $('#txt').value = draft.text || ''; $('#tit').value = draft.title || ''; $('#saved').hidden = false; }

    function scoreButtons(el, cur, cls, label) {
      el.innerHTML = Array.from({ length: 10 }, (_, i) => i + 1).map((n) => '<button type="button" class="btn ' + cls + '" aria-pressed="' + (n === cur) + '" aria-label="' + label + ' ' + n + ' de 10" data-n="' + n + '" style="padding:0;min-height:48px">' + (cls.includes('score') ? n : '') + '</button>').join('');
    }
    function renderScores() {
      scoreButtons($('#scores'), score, 'btn-secondary score-btn', 'Calificación');
      $$('#scores [data-n]').forEach((b) => { if (Number(b.dataset.n) === score) { b.style.background = 'var(--accent)'; b.style.color = 'var(--accent-ink)'; } });
      scoreButtons($('#diffs'), diff, 'btn-secondary', 'Dificultad');
      $$('#diffs [data-n]').forEach((b) => { b.style.minHeight = '32px'; b.style.background = Number(b.dataset.n) <= diff ? 'var(--bad)' : 'var(--line)'; b.style.border = '0'; });
      $('#score-label').textContent = score + '/10'; $('#diff-label').textContent = diff + '/10';
    }
    $('#scores').addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { score = Number(b.dataset.n); renderScores(); } });
    $('#diffs').addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { diff = Number(b.dataset.n); renderScores(); } });
    $('#like').addEventListener('click', () => { like = !like; $('#like').setAttribute('aria-pressed', like); $('#like').style.borderColor = like ? 'var(--bad)' : 'var(--line)'; });
    renderScores();

    function setKind(k) {
      kind = k;
      $$('#kind [role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.k === k));
      $('#text-block').hidden = k === 'clip'; $('#clip-block').hidden = k !== 'clip';
      $('#txt-label').textContent = k === 'guia' ? 'Tu guía' : 'Tu reseña';
      $('#eyebrow').textContent = k === 'guia' ? 'Nueva guía' : (k === 'clip' ? 'Nuevo clip' : 'Nueva reseña');
    }
    $('#kind').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) setKind(b.dataset.k); });
    setKind(kind);

    const txt = $('#txt');
    const count = () => { $('#chars').textContent = txt.value.length + ' / 2.000'; };
    txt.addEventListener('input', () => { count(); store.set(draftKey, { text: txt.value, title: $('#tit').value }); $('#saved').hidden = false; });
    count();
    $('#save-draft').addEventListener('click', () => { store.set(draftKey, { text: txt.value, title: $('#tit').value }); toast('Borrador guardado'); });

    $('#review-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (kind === 'clip') { API.fail('funcion', 'Subida de clips'); return; }
      const bad = txt.value.trim().length < 50;
      txt.setAttribute('aria-invalid', bad); $('#txt-err').hidden = !bad;
      if (bad) { txt.focus(); return; }
      if (!auth.require('publicar tu ' + (kind === 'guia' ? 'guía' : 'reseña'))) return;
      const u = auth.user();
      if (kind === 'resena') {
        const list = store.get('reviews', []);
        list.unshift({ game: g.id, user: u.user, initials: u.initials, hours: Number($('#horas').value) || 0, score: score, diff: diff, useful: 0, spoiler: $('#spoiler').checked, text: txt.value.trim() });
        store.set('reviews', list);
      }
      diary.add({ game: g.id, date: $('#fecha').value, state: $('#estado').value, hours: Number($('#horas').value) || 0, score: score, like: like, review: kind === 'resena' });
      store.set(draftKey, null);
      const pr = profile.addXP(50);
      modal({ icon: 'check', title: (kind === 'guia' ? 'Guía' : 'Reseña') + ' publicada', text: 'Ganaste 50 XP. Vas en ' + fmt(pr.xp) + ' / 1.500 XP del nivel ' + pr.level + '.', actions: [{ label: 'Ver en el juego', href: 'juego.html?id=' + g.id, primary: true }, { label: 'Ver mi diario', href: 'diario.html' }] });
    });
  };

  // ---------- Logros ----------
  P.logros = function () {
    let plat = 'Todas';
    const rows = [
      { game: 'zelda-totk', got: 86, total: 139, plat: 'Nintendo' }, { game: 'fnaf-into-the-pit', got: 24, total: 24, plat: 'Steam' },
      { game: 'nier-automata', got: 17, total: 50, plat: 'Steam' }, { game: 'rocket-league', got: 16, total: 88, plat: 'Steam' }, { game: 'hollow-knight', got: 41, total: 63, plat: 'Steam' }
    ];
    function render() {
      const list = rows.filter((r) => plat === 'Todas' || r.plat === plat);
      $('#by-game').innerHTML = list.length ? list.map((r) => {
        const g = gameById(r.game); const pct = Math.round(r.got / r.total * 100);
        return '<a class="card card-link" href="juego.html?id=' + g.id + '" style="flex-direction:row;align-items:center;gap:16px;flex-wrap:wrap">' + cover(g, { small: true }) +
          '<span class="grow" style="flex:1 1 220px;display:flex;flex-direction:column;gap:6px"><b style="font-size:18px">' + esc(g.short) + '</b><span class="meter' + (pct === 100 ? ' good' : '') + '" style="max-width:420px"><i style="width:' + pct + '%"></i></span></span>' +
          '<span>' + (pct === 100 ? '<b class="score">100%</b> · ' : '') + '<b>' + r.got + '</b> <span class="muted">/ ' + r.total + '</span></span><span class="badge badge-outline">' + r.plat.toUpperCase() + '</span></a>';
      }).join('') : '<div class="empty">No tienes logros sincronizados de ' + esc(plat) + '. <a class="link-strong" href="editar-perfil.html#cuentas">Vincular cuenta</a></div>';
    }
    $$('[data-plat]').forEach((b) => b.addEventListener('click', () => { plat = b.dataset.plat; $$('[data-plat]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); }));
    $('#rare').innerHTML = DATA.achievements.slice().sort((a, b) => a.pct - b.pct).map((a) => { const g = gameById(a.game); return '<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span class="avatar" style="border-radius:10px;width:48px;height:48px;background:' + (a.got ? 'var(--accent)' : 'var(--surface-2)') + ';color:' + (a.got ? 'var(--accent-ink)' : 'var(--muted)') + '">' + (a.got ? '★' : '?') + '</span><span><b>' + esc(a.name) + '</b><br><span class="xs muted">' + esc(g.short) + ' · ' + String(a.pct).replace('.', ',') + '% lo tiene' + (a.got ? '' : ' · te falta') + '</span></span></div>'; }).join('');
    render();
  };
})(window.SS_PAGES);

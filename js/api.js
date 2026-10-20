/* SaveSlot — capa de datos.
   Usa RAWG si hay clave en js/config.js; si no, los datos de ejemplo.
   Cualquier fallo de una API externa termina en error.html con el motivo. */
(function () {
  const CFG = window.SS_CONFIG || {};
  const DATA = window.SS_DATA;

  // Tipos de error que entiende error.html
  function errorTypeFromStatus(status) {
    if (status === 429) return 'limite';
    if (status === 401 || status === 403) return 'credenciales';
    if (status === 503) return 'mantenimiento';
    if (status >= 500) return 'api';
    return 'api';
  }

  function fail(tipo, servicio, detalle) {
    const params = new URLSearchParams({ tipo: tipo, servicio: servicio || '', volver: location.pathname.split('/').pop() + location.search });
    if (detalle) params.set('detalle', String(detalle).slice(0, 120));
    location.href = 'error.html?' + params.toString();
  }

  async function request(url, servicio, opts) {
    if (!navigator.onLine) { fail('sin-conexion', servicio); throw new Error('offline'); }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), CFG.TIMEOUT_MS || 8000);
    let res;
    try {
      res = await fetch(url, Object.assign({ signal: ctrl.signal }, opts || {}));
    } catch (e) {
      clearTimeout(t);
      fail(e.name === 'AbortError' ? 'tiempo' : 'api', servicio, e.message);
      throw e;
    }
    clearTimeout(t);
    if (!res.ok) { fail(errorTypeFromStatus(res.status), servicio, 'HTTP ' + res.status); throw new Error('HTTP ' + res.status); }
    return res.json();
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // RAWG → formato SaveSlot
  const palette = ['#2F6B4F', '#7C7566', '#2456C4', '#5B3F96', '#B8343E', '#6B3A1E', '#2B3A55', '#8A2B2B'];
  function fromRawg(g, i) {
    const plats = (g.parent_platforms || []).map((p) => p.platform.name).map((n) => n === 'PC' ? 'PC' : n);
    return {
      id: 'rawg-' + g.id, rawgId: g.id, name: g.name, short: g.name, genres: (g.genres || []).map((x) => x.name),
      platforms: plats, year: g.released ? Number(g.released.slice(0, 4)) : null, dev: '', type: '',
      hoursMain: g.playtime || null, hours100: null, difficulty: null, rating: g.rating || null, votes: g.ratings_count || 0,
      color: palette[i % palette.length], image: g.background_image || '', achievements: g.achievements_count || 0, desc: ''
    };
  }

  function matches(g, f) {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (!(g.name.toLowerCase().includes(q) || g.short.toLowerCase().includes(q) || g.genres.join(' ').toLowerCase().includes(q))) return false;
    }
    if (f.genres && f.genres.length && !f.genres.some((x) => g.genres.includes(x))) return false;
    if (f.platforms && f.platforms.length && !f.platforms.some((x) => g.platforms.includes(x))) return false;
    if (f.type && f.type !== 'Todos' && g.type !== f.type) return false;
    if (f.length === 'corto' && !(g.hoursMain && g.hoursMain < 10)) return false;
    if (f.length === 'medio' && !(g.hoursMain && g.hoursMain >= 10 && g.hoursMain <= 40)) return false;
    if (f.length === 'largo' && !(g.hoursMain && g.hoursMain > 40)) return false;
    if (f.from && g.year && g.year < f.from) return false;
    if (f.to && g.year && g.year > f.to) return false;
    return true;
  }

  const api = {
    usingDemo: !CFG.RAWG_KEY,
    fail: fail,

    async searchGames(filters) {
      filters = filters || {};
      if (CFG.RAWG_KEY && filters.q) {
        const url = 'https://api.rawg.io/api/games?page_size=20&key=' + encodeURIComponent(CFG.RAWG_KEY) + '&search=' + encodeURIComponent(filters.q);
        const json = await request(url, 'RAWG');
        return json.results.map(fromRawg).filter((g) => matches(g, Object.assign({}, filters, { q: '' })));
      }
      await wait(250);
      return DATA.games.filter((g) => matches(g, filters));
    },

    async getGame(id) {
      const local = DATA.games.find((g) => g.id === id);
      if (local) { await wait(150); return local; }
      if (CFG.RAWG_KEY && id && id.indexOf('rawg-') === 0) {
        const g = await request('https://api.rawg.io/api/games/' + id.slice(5) + '?key=' + encodeURIComponent(CFG.RAWG_KEY), 'RAWG');
        const mapped = fromRawg(g, 0);
        mapped.desc = (g.description_raw || '').slice(0, 280);
        mapped.dev = (g.developers || []).map((d) => d.name).join(', ');
        return mapped;
      }
      return null;
    },

    async askAI(history) {
      if (CFG.AI_ENDPOINT) {
        const json = await request(CFG.AI_ENDPOINT, 'MatchPlay (IA)', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history })
        });
        return json.reply;
      }
      await wait(700);
      return demoReply(history[history.length - 1].text);
    },

    // Vincular plataformas: Steam (OpenID) y Xbox (OpenXBL) son posibles; PlayStation y Nintendo no tienen API pública
    async linkPlatform(name) {
      if ((CFG.PLATFORMS_WITHOUT_API || []).includes(name)) { fail('plataforma', name); throw new Error('no-api'); }
      await wait(600);
      return { ok: true, demo: true };
    }
  };

  function demoReply(t) {
    const s = t.toLowerCase();
    if (s.includes('rocket')) return 'Los torneos oficiales de Rocket League se juegan varias veces al día desde el menú del juego. En SaveSlot tienes además la Copa 2v2 del sábado: revisa los cupos en Eventos.';
    if (s.includes('hollow') || s.includes('dura')) return 'Hollow Knight: unas 27 h la historia principal y unas 60 h al 100%, según los votos de la comunidad.';
    if (s.includes('pokémon') || s.includes('pokemon')) return 'En Pokémon Legends Z-A conviene completar las misiones secundarias temprano: dan dinero y objetos de evolución.';
    if (s.includes('nier') || s.includes('parecido')) return 'Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades.';
    if (s.includes('corto') || s.includes('finde') || s.includes('terror')) return 'Para un fin de semana: Inside (≈3 h) o FNAF: Into the Pit (≈6 h). Los dos dan miedo sin depender de sustos baratos.';
    if (s.includes('nuevo') || s.includes('salen') || s.includes('lanzamiento')) return 'Cuando conectemos la API de catálogo te mostraré los lanzamientos de la semana en tus plataformas. Por ahora puedes ver los mejores juegos de la semana en Inicio.';
    return 'Buena pregunta. En modo demo respondo con ejemplos; cuando MatchPlay esté conectado a la IA revisaré tu biblioteca y las reseñas para darte una respuesta completa.';
  }

  window.SS_API = api;
})();
